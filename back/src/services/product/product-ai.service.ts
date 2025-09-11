// src/services/product-ai.service.ts

import client from 'utils/axios';
import { log } from 'utils/logger';

// Interface definitions to ensure type safety.
// These should ideally be in a shared types or interfaces folder.
interface ProductInfo {
  name: string;
  detail_images: string[];
  thumbnail?: string; // Optional since it's not always needed
}

interface ProductReviewRequest {
  product: { name: string };
  reviews: string[];
}

interface ProductAIAnswerRequest {
  thumbnail: string;
  detail_images: string[];
}

/**
 * AI 서버로부터 상품에 대한 상세 리포트를 가져오는 함수.
 * 이 함수는 상품의 상세 이미지들을 기반으로 AI가 생성한 보고서를 반환합니다.
 * @param product 상품의 이름과 상세 이미지 URL 목록을 포함하는 객체.
 * @returns AI 보고서 문자열 또는 null.
 */
export const getProductReport = async (product: ProductInfo): Promise<string | null> => {
  try {
    const { data } = await client.post('/test/ai-report', { product });
    if (data && data.report) {
      return data.report;
    }
    void log.error('AI Report API did not return a valid report.', 'API', 'MEDIUM', { product });
    return null;
  } catch (error) {
    void log.error('Failed to get AI report from the AI server.', 'API', 'MEDIUM', { error });
    return null;
  }
};

/**
 * AI 서버로부터 상품 리뷰를 요약하는 함수.
 * 이 함수는 사용자 리뷰 목록을 받아 장점, 단점, 베스트 리뷰를 요약하여 반환합니다.
 * @param request 상품 정보와 리뷰 목록을 포함하는 객체.
 * @returns 요약된 리뷰 객체 또는 null.
 */
export const getReviewSummary = async (request: ProductReviewRequest): Promise<any | null> => {
  try {
    const { data } = await client.post('/test/review-summary', request);
    if (data && data.summary) {
      return data.summary;
    }
    void log.error('Review summary API did not return a valid summary.', 'API', 'MEDIUM', {
      request,
    });
    return null;
  } catch (error) {
    void log.error('Failed to get review summary from the AI server.', 'API', 'MEDIUM', { error });
    return null;
  }
};

/**
 * AI 서버로부터 상품 이미지에 대한 캡션을 가져오는 함수.
 * @param product 상품 이름과 썸네일 이미지 URL을 포함하는 객체.
 * @returns 캡션 문자열 또는 null.
 */
export const getProductCaption = async (
  product: Pick<ProductInfo, 'name' | 'thumbnail'>
): Promise<string | null> => {
  try {
    const { data } = await client.post('/test/product-caption', { product });
    if (data && data.caption) {
      return data.caption;
    }
    void log.error('Product caption API did not return a valid caption.', 'API', 'MEDIUM', {
      product,
    });
    return null;
  } catch (error) {
    void log.error('Failed to get product caption from the AI server.', 'API', 'MEDIUM', { error });
    return null;
  }
};

/**
 * AI 서버로부터 고객 질문에 대한 답변을 가져오는 함수.
 * 이 함수는 상품 정보와 리뷰를 기반으로 질문에 답을 생성합니다.
 * @param product 상품의 썸네일 및 상세 이미지 URL 목록을 포함하는 객체.
 * @param reviews 리뷰 목록.
 * @param question 고객의 질문.
 * @returns AI 답변 문자열 또는 null.
 */
export const getAIAnswer = async (
  product: ProductAIAnswerRequest,
  reviews: string[],
  question: string
): Promise<string | null> => {
  try {
    const { data } = await client.post('/test/ai-answer', { product, reviews, question });
    if (data && data.answer) {
      return data.answer;
    }
    void log.error('AI Answer API did not return a valid answer.', 'API', 'MEDIUM', {
      product,
      reviews,
      question,
    });
    return null;
  } catch (error) {
    void log.error('Failed to get AI answer from the AI server.', 'API', 'MEDIUM', { error });
    return null;
  }
};
