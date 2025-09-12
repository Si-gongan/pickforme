import { aiProvider, AIModelType, AIProviderMessage, ContentPart } from '../llm/ai.provider';
import { log } from 'utils/logger';
import * as Prompts from './prompts';
import { convertUrlsToBase64 } from 'utils/images';

const DEFAULT_MODEL: AIModelType = 'gemini';

interface Product {
  name: string;
  thumbnail: string;
  detail_images: string[];
}

interface ProductReviewRequest {
  product: Product;
  reviews: string[];
}

interface ProductReviewResponse {
  pros: string[];
  cons: string[];
  bests: string[];
}

interface ProductAIAnswerRequest {
  product: Product;
  reviews: string[];
}

/**
 * 상품 썸네일 이미지로 짧은 광고 캡션을 생성합니다.
 */
export const getProductCaption = async (
  product: Pick<Product, 'name' | 'thumbnail'>,
  model: AIModelType = DEFAULT_MODEL
): Promise<string | null> => {
  if (!product.thumbnail) {
    void log.warn('Product thumbnail is missing, cannot generate caption.', 'API', 'LOW', {
      product,
    });
    return null;
  }
  try {
    const prompt = Prompts.createProductCaptionPrompt(product.name);
    const thumbnailBase64 = await convertUrlsToBase64([product.thumbnail]);

    const messages: AIProviderMessage[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image', image: thumbnailBase64[0] },
        ],
      },
    ];

    const caption = await aiProvider.generate({
      messages,
      model,
    });
    return caption;
  } catch (error) {
    void log.error('Failed to generate AI product caption.', 'API', 'MEDIUM', {
      error,
      product,
    });
    return null;
  }
};

/**
 * 상품 이미지들을 기반으로 상세 리포트를 생성합니다.
 */
export const getProductReport = async (
  product: Product,
  model: AIModelType = DEFAULT_MODEL
): Promise<string | null> => {
  try {
    const prompt = Prompts.createAIReportPrompt(product.name);
    const detailImagesBase64 = await convertUrlsToBase64(product.detail_images);

    const contentParts: ContentPart[] = [
      { type: 'text', text: prompt },
      ...detailImagesBase64.map((img): ContentPart => ({ type: 'image', image: img })),
    ];

    const messages: AIProviderMessage[] = [
      {
        role: 'user',
        content: contentParts,
      },
    ];

    const report = await aiProvider.generate({
      messages,
      model,
    });

    return report;
  } catch (error) {
    void log.error('Failed to generate AI product report.', 'API', 'MEDIUM', {
      error,
      product,
    });
    return null;
  }
};

/**
 * 상품 리뷰들을 요약하여 장점, 단점, 베스트 리뷰를 추출합니다.
 */
export const getReviewSummary = async (
  request: ProductReviewRequest,
  model: AIModelType = DEFAULT_MODEL
): Promise<ProductReviewResponse | null> => {
  try {
    const reviewsText = request.reviews.map((review, i) => `리뷰 ${i + 1}: ${review}`).join('\n');
    const prompt = Prompts.createReviewSummaryPrompt(request.product.name, reviewsText);
    const messages = [{ role: 'user' as const, content: prompt }];

    const rawSummaryString = await aiProvider.generate({ messages, model });

    try {
      // 2. 정규식을 사용해 순수 JSON 문자열 추출
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = rawSummaryString.match(jsonRegex);

      if (!match || !match[1]) {
        // 정규식으로 JSON을 찾지 못했을 경우의 예외 처리
        throw new Error('AI 응답에서 유효한 JSON을 추출하지 못했습니다.');
      }

      // 3. 정리된 순수 JSON 문자열을 파싱
      return JSON.parse(match[1]);
    } catch (error) {
      void log.error('Failed to parse AI review summary.', 'API', 'MEDIUM', {
        error,
        request,
        rawSummaryString,
      });
      return null;
    }
  } catch (error) {
    void log.error('Failed to generate AI review summary.', 'API', 'MEDIUM', {
      error,
      request,
    });
    return null;
  }
};

/**
 * 상품 정보와 리뷰를 기반으로 고객 질문에 답변합니다.
 */
export const getAIAnswer = async (
  request: ProductAIAnswerRequest,
  question: string,
  model: AIModelType = DEFAULT_MODEL
): Promise<string | null> => {
  try {
    const reviewsText =
      request.reviews.length > 0 ? request.reviews.join('\n- ').slice(0, 3000) : '';
    const prompt = Prompts.createAIAnswerPrompt(question, reviewsText, request.product);

    const imagesBase64 = await convertUrlsToBase64([
      request.product.thumbnail,
      ...request.product.detail_images,
    ]);

    const contentParts: ContentPart[] = [
      { type: 'text', text: prompt },
      ...imagesBase64.map((img): ContentPart => ({ type: 'image', image: img })),
    ];

    const messages: AIProviderMessage[] = [
      {
        role: 'user',
        content: contentParts,
      },
    ];

    const answer = await aiProvider.generate({
      messages,
      model,
    });
    return answer;
  } catch (error) {
    void log.error('Failed to generate AI answer for question.', 'API', 'MEDIUM', {
      error,
      request,
    });
    return null;
  }
};
