import OpenAI from 'openai';

const DEFAULT_MODEL = 'gpt-4o-mini';

export interface GPTMessage {
  role: 'user'; // system 역할 포함
  content: string;
}

// OpenAI API가 요구하는 복합 콘텐츠 타입 정의
type MessageContent =
  | string
  | (
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }
    )[];

export class GPTProvider {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * 텍스트와 이미지를 모두 처리할 수 있는 통합 GPT 응답 생성 메서드
   * @param params.messages - 필수. 대화 내역 배열.
   * @param params.images - 선택. Base64 또는 URL 형식의 이미지 문자열 배열.
   * @param params.model - 사용할 모델 이름.
   * @param params.config - 온도, 최대 토큰 등 기타 설정.
   * @returns AI가 생성한 텍스트 응답.
   */
  async generate(params: {
    messages: GPTMessage[];
    images?: string[];
    model?: string;
    config?: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'text' | 'json_object';
      imageDetail?: 'auto' | 'low' | 'high';
    };
  }): Promise<string> {
    const { messages, images, model = DEFAULT_MODEL, config = {} } = params;

    if (!messages || messages.length === 0) {
      throw new Error('Messages array cannot be empty.');
    }

    // OpenAI API에 보낼 최종 메시지 배열
    let apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    // 이미지가 있는 경우 (멀티모달 요청 구성)
    if (images && images.length > 0) {
      const history = messages.slice(0, -1); // 마지막 메시지를 제외한 대화 내역
      const lastMessage = messages[messages.length - 1];

      if (lastMessage.role !== 'user') {
        throw new Error('Images can only be attached to the last user message.');
      }

      // 이미지 파트 생성
      const imageParts = images.map((img) => ({
        type: 'image_url' as const,
        image_url: {
          url: img.startsWith('http') ? img : `data:image/jpeg;base64,${img}`,
          detail: config.imageDetail || 'auto',
        },
      }));

      // 마지막 메시지의 텍스트와 이미지 파트를 결합
      const multimodalContent: MessageContent = [
        { type: 'text', text: lastMessage.content },
        ...imageParts,
      ];

      // 전체 대화 내역 재구성
      apiMessages = [...history, { role: 'user', content: multimodalContent }];
    } else {
      // 이미지가 없는 경우 (텍스트 전용 요청)
      apiMessages = messages;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: apiMessages,
        temperature: config.temperature || 0.1,
        max_tokens: config.maxTokens || 2048,
        response_format: { type: config.responseFormat || 'text' },
      });

      return response.choices[0].message.content?.trim() || '';
    } catch (error) {
      const errorMsg = `GPT API call failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }
}
