import { GeminiProvider, GeminiMessage } from './provider/gemini';
import { GPTProvider, GPTMessage } from './provider/gpt';

// AIProvider가 사용할 공통 Message 타입 정의
interface AIProviderMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export type AIModelType = 'gemini' | 'openai';

class AIProvider {
  private gemini: GeminiProvider;

  private gpt: GPTProvider;

  constructor() {
    this.gemini = new GeminiProvider();
    this.gpt = new GPTProvider();
  }

  /**
   * 텍스트와 이미지를 모두 처리할 수 있는 통합 AI 응답 생성 메서드
   * @param params.messages - 필수. 대화 내역.
   * @param params.images - 선택. 이미지 배열.
   * @param params.model - 필수. 사용할 AI 모델.
   * @param params.systemInstruction - 선택. Gemini를 위한 시스템 안내.
   */
  async generate(params: {
    messages: AIProviderMessage[];
    images?: string[];
    model: AIModelType;
    systemInstruction?: string;
  }): Promise<string> {
    const { messages, images, model, systemInstruction } = params;

    switch (model) {
      case 'gemini': {
        const geminiMessages = messages.filter(
          (m) => m.role === 'user' || m.role === 'model'
        ) as GeminiMessage[];
        const systemMsg = messages.find((m) => m.role === 'system')?.content || systemInstruction;

        // GeminiProvider의 통합 generate 메서드 호출
        return this.gemini.generate({
          messages: geminiMessages,
          images,
          systemInstruction: systemMsg,
        });
      }

      case 'openai': {
        const gptMessages = messages as GPTMessage[];

        // GPTProvider의 통합 generate 메서드 호출
        return this.gpt.generate({ messages: gptMessages, images });
      }
    }
  }
}

export const aiProvider = new AIProvider();
