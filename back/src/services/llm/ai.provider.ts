import { GeminiProvider, GeminiMessage } from './provider/gemini';
import { GPTProvider, GPTMessage } from './provider/gpt';

// AIProvider가 사용할 공통 Content 타입 정의
export interface ContentPart {
  type: 'text' | 'image';
  text?: string;
  image?: string; // base64 string
}

export interface AIProviderMessage {
  role: 'user' | 'system';
  content: string | ContentPart[]; // 단순 문자열 또는 복합 콘텐츠
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
   * @param params.model - 필수. 사용할 AI 모델.
   * @param params.systemInstruction - 선택. Gemini를 위한 시스템 안내.
   */
  async generate(params: {
    messages: AIProviderMessage[];
    model: AIModelType;
    systemInstruction?: string;
  }): Promise<string> {
    const { messages, model, systemInstruction } = params;

    switch (model) {
      case 'gemini': {
        const geminiMessages = messages.filter((m) => m.role === 'user') as GeminiMessage[];
        const systemMsgContent = messages.find((m) => m.role === 'system')?.content;
        const systemMsg =
          typeof systemMsgContent === 'string' ? systemMsgContent : systemInstruction;

        // GeminiProvider의 통합 generate 메서드 호출
        return this.gemini.generate({
          messages: geminiMessages,
          systemInstruction: systemMsg,
        });
      }

      case 'openai': {
        const gptMessages = messages as GPTMessage[];

        // GPTProvider의 통합 generate 메서드 호출
        return this.gpt.generate({ messages: gptMessages });
      }
    }
  }
}

export const aiProvider = new AIProvider();
