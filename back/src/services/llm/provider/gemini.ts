// 설치: npm install @google/genai
import { GoogleGenAI, Content, Part, HarmCategory, HarmBlockThreshold } from '@google/genai';

const DEFAULT_MODEL = 'gemini-2.0-flash';

export interface GeminiMessage {
  role: 'user' | 'model'; // Gemini는 user/model 역할만 지원
  content: string;
}

export class GeminiProvider {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is required');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * 텍스트와 이미지를 모두 처리할 수 있는 통합 Gemini 응답 생성 메서드
   */
  async generate(params: {
    messages: GeminiMessage[];
    images?: string[];
    modelName?: string;
    systemInstruction?: string;
  }): Promise<string> {
    const { messages, images, modelName = DEFAULT_MODEL, systemInstruction } = params;

    if (!messages || messages.length === 0) {
      throw new Error('Messages array cannot be empty.');
    }

    let contents: Content[];

    // 이미지가 있는 경우 (멀티모달 요청 구성)
    if (images && images.length > 0) {
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));
      const lastMessage = messages[messages.length - 1];

      const imageParts: Part[] = images.map((img) => ({
        inlineData: {
          mimeType: 'image/jpeg',
          data: img,
        },
      }));

      const lastUserContent: Content = {
        role: 'user',
        parts: [{ text: lastMessage.content }, ...imageParts],
      };

      contents = [...history, lastUserContent];
    } else {
      // 이미지가 없는 경우 (텍스트 전용 요청)
      contents = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));
    }

    try {
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents,
        // 👇 시스템 안내는 이곳 config 객체 내에 별도로 지정합니다.
        config: {
          ...(systemInstruction && { systemInstruction: { parts: [{ text: systemInstruction }] } }),
          thinkingConfig: {
            thinkingBudget: 0,
          },
          temperature: 0.7,
          maxOutputTokens: 2048,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        },
      });

      return response.text?.trim() || '';
    } catch (error) {
      const errorMsg = `Gemini API call failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * 스트리밍 응답 예시 (필요시 사용)
   */
  async *getGeminiStream(prompt: string, modelName: string = 'gemini-1.5-flash-latest') {
    const request = {
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const stream = await this.ai.models.generateContentStream(request);

    for await (const chunk of stream) {
      yield chunk.text;
    }
  }
}
