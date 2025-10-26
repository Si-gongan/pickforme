import axios from 'axios';
import { createHmac } from 'crypto';
import { cacheProvider } from '../../cache';
import { cacheKey } from '../../constants/cacheKey';
import { COUPANG_CATEGORIES } from './categories';
import { log } from 'utils/logger';
import { chunk } from 'utils/common';

// --- 설정 및 유틸리티 ---

const API_DOMAIN = 'https://api-gateway.coupang.com';
const API_BASE_PATH = '/v2/providers/affiliate_open_api/apis/openapi';
const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
const SECRET_KEY = process.env.COUPANG_SECRET_KEY;
const SUB_ID = process.env.COUPANG_CHANNEL_ID || '';

if (!ACCESS_KEY || !SECRET_KEY || !SUB_ID) {
  throw new Error('Coupang Access Key, Secret Key, Channel ID가 .env 파일에 설정되지 않았습니다.');
}

/**
 * Coupang API 요청을 위한 HMAC-SHA256 서명 헤더를 생성합니다. (변경 없음)
 */
function generateAuthorizationHeader(method: string, path: string, query: string = ''): string {
  if (!ACCESS_KEY || !SECRET_KEY || !SUB_ID) {
    throw new Error('Coupang Access Key 또는 Secret Key가 .env 파일에 설정되지 않았습니다.');
  }
  const now = new Date();
  const datetime =
    now.toISOString().substr(2, 8).replace(/-/g, '') +
    'T' +
    now.toISOString().substr(11, 8).replace(/:/g, '') +
    'Z';
  const message = datetime + method + path + query;
  const signature = createHmac('sha256', SECRET_KEY).update(message).digest('hex');
  return `CEA method=HmacSHA256, access-key=${ACCESS_KEY}, signed-date=${datetime}, signature=${signature}`;
}

// --- API 호출 및 캐싱 로직 ---

/**
 * 주어진 URL 배열을 쿠팡 파트너스 딥링크로 변환합니다.
 */
export async function getDeeplinks(
  urls: string[]
): Promise<{ originalUrl: string; shortenUrl: string; landingUrl: string }[]> {
  if (!urls || urls.length === 0) {
    return [];
  }

  const METHOD = 'POST';
  // [수정] Python과 동일한 경로
  const PATH = `${API_BASE_PATH}/v1/deeplink`;
  const body = { coupangUrls: urls, subId: SUB_ID };

  try {
    const authorization = generateAuthorizationHeader(METHOD, PATH, '');
    const response = await axios.post(`${API_DOMAIN}${PATH}`, body, {
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
    });

    // [수정] Python과 동일하게 'data' 필드에서 데이터 추출
    return response.data?.data || [];
  } catch (error) {
    void log.error('Coupang Deeplink API 호출 실패', 'API', 'MEDIUM', { error });
    throw error;
  }
}

/**
 * 카테고리별 베스트 상품 목록을 가져옵니다.
 */
export async function getCachedBestCategory(categoryId: string, options?: { force?: boolean }) {
  const key = cacheKey.coupang.bestCategories(categoryId);

  if (!options?.force) {
    const cached = cacheProvider.get<any[]>(key);
    if (cached) return cached;
  }

  const METHOD = 'GET';
  // [수정] Python과 동일한 경로
  const PATH = `${API_BASE_PATH}/products/bestcategories/${categoryId}`;
  const QUERY = `subId=${SUB_ID}`;

  try {
    const authorization = generateAuthorizationHeader(METHOD, PATH, QUERY);
    const response = await axios.get(`${API_DOMAIN}${PATH}?${QUERY}`, {
      headers: { Authorization: authorization },
    });

    const productsFromApi = response.data?.data || [];

    // [핵심 추가] Python과 동일하게 데이터 구조를 변환합니다.
    const transformedProducts = productsFromApi.map((p: any) => ({
      id: p.productId,
      name: p.productName,
      price: p.productPrice,
      thumbnail: p.productImage,
      url: p.productUrl,
      platform: 'coupang',
    }));

    cacheProvider.set(key, transformedProducts);
    return transformedProducts; // 변환된 데이터를 반환
  } catch (error) {
    void log.error(`Coupang Best Category API 호출 실패 (ID: ${categoryId})`, 'API', 'HIGH', {
      error,
    });
    throw error;
  }
}

/**
 * 골드박스 상품 목록을 가져옵니다.
 */
export async function getCachedGoldbox(options?: { force?: boolean }) {
  const key = 'goldbox';

  if (!options?.force) {
    const cached = cacheProvider.get<any[]>(key);
    if (cached) return cached;
  }

  const METHOD = 'GET';
  // [수정] Python과 동일한 경로
  const PATH = `${API_BASE_PATH}/products/goldbox`;
  const QUERY = `subId=${SUB_ID}`;

  try {
    const authorization = generateAuthorizationHeader(METHOD, PATH, QUERY);
    const response = await axios.get(`${API_DOMAIN}${PATH}?${QUERY}`, {
      headers: { Authorization: authorization },
    });

    const productsFromApi = response.data?.data || [];

    // [핵심 추가] Python과 동일하게 데이터 구조를 1차 변환합니다.
    let transformedProducts = productsFromApi.map((p: any) => ({
      id: p.productId,
      name: p.productName,
      price: p.productPrice,
      thumbnail: p.productImage,
      url: `https://www.coupang.com/vp/products/${p.productId}`, // 딥링크 변환을 위한 원본 URL 구성
      platform: 'coupang',
    }));

    // [핵심 추가] 딥링크 변환 로직을 수행합니다.
    if (transformedProducts.length > 0) {
      const originalUrls = transformedProducts.map((p: any) => p.url);
      const deeplinks = await getDeeplinks(originalUrls);
      const urlMap = new Map(deeplinks.map((link) => [link.originalUrl, link.shortenUrl]));

      transformedProducts = transformedProducts.map((p: any) => ({
        ...p,
        url: urlMap.get(p.url) || p.url, // 딥링크가 있으면 교체
      }));
    }

    cacheProvider.set(key, transformedProducts);
    return transformedProducts;
  } catch (error) {
    void log.error('Coupang Goldbox API 호출 실패', 'API', 'HIGH', { error });
    throw error;
  }
}

/**
 * ✨ [수정] 키워드로 상품을 검색하여 '원본 데이터'를 반환합니다.
 * (딥링크 변환은 클라이언트에서 처리하는 경우에 사용)
 * * @param keyword 검색할 키워드
 * @param limit 반환할 상품 개수 (기본값: 10)
 * @returns 검색된 상품 목록 (딥링크로 변환되지 않은 원본 URL 포함)
 */
export async function searchProducts(keyword: string, limit: number = 10) {
  if (!keyword) {
    return [];
  }

  const METHOD = 'GET';
  const PATH = `${API_BASE_PATH}/products/search`;
  // 검색어는 URL 인코딩 필수
  const QUERY = `keyword=${encodeURIComponent(keyword)}&limit=${limit}&subId=${SUB_ID}`;

  try {
    const authorization = generateAuthorizationHeader(METHOD, PATH, QUERY);
    const response = await axios.get(`${API_DOMAIN}${PATH}?${QUERY}`, {
      headers: { Authorization: authorization },
    });

    const productsFromApi = response.data?.data?.productData || [];

    // API에서 받은 데이터를 표준 형식으로 변환만 수행
    const transformedProducts = productsFromApi.map((p: any) => ({
      id: p.productId,
      name: p.productName,
      price: p.productPrice,
      thumbnail: p.productImage,
      url: p.productUrl, // 딥링크로 변환하지 않은 '원본 URL'을 그대로 반환
      platform: 'coupang',
    }));

    return transformedProducts;
  } catch (error) {
    void log.error(`Coupang Search API 호출 실패 (keyword: ${keyword})`, 'API', 'HIGH', {
      error,
    });
    throw error;
  }
}

/**
 * 주문 정보를 가져옵니다.
 * @param startDate 시작일 (yyyyMMdd 형식)
 * @param endDate 종료일 (yyyyMMdd 형식)
 * @param page 페이지 번호 (기본값: 0)
 * @param subId 채널 아이디 (기본값: SUB_ID)
 */
export async function getOrders(
  startDate: string,
  endDate: string,
  page: number = 0,
  subId: string = SUB_ID
) {
  const METHOD = 'GET';
  const PATH = `${API_BASE_PATH}/reports/orders`;
  const QUERY = `startDate=${startDate}&endDate=${endDate}&subId=${subId}&page=${page}`;

  try {
    const authorization = generateAuthorizationHeader(METHOD, PATH, QUERY);
    const response = await axios.get(`${API_DOMAIN}${PATH}?${QUERY}`, {
      headers: { Authorization: authorization },
    });

    return response.data;
  } catch (error) {
    void log.error(`Coupang Orders API 호출 실패 (${startDate}~${endDate})`, 'API', 'HIGH', {
      error,
    });
    throw error;
  }
}

/**
 * 수수료 정보를 가져옵니다.
 * @param startDate 시작일 (yyyyMMdd 형식)
 * @param endDate 종료일 (yyyyMMdd 형식)
 * @param page 페이지 번호 (기본값: 0)
 * @param subId 채널 아이디 (기본값: SUB_ID)
 */
export async function getCommissions(
  startDate: string,
  endDate: string,
  page: number = 0,
  subId: string = SUB_ID
) {
  const METHOD = 'GET';
  const PATH = `${API_BASE_PATH}/reports/commission`;
  const QUERY = `startDate=${startDate}&endDate=${endDate}&subId=${subId}&page=${page}`;
  console.log('🚀 ~ getCommissions ~ QUERY:', QUERY);

  try {
    const authorization = generateAuthorizationHeader(METHOD, PATH, QUERY);
    const response = await axios.get(`${API_DOMAIN}${PATH}?${QUERY}`, {
      headers: { Authorization: authorization },
    });

    return response.data;
  } catch (error) {
    void log.error(`Coupang Commissions API 호출 실패 (${startDate}~${endDate})`, 'API', 'HIGH', {
      error,
    });
    throw error;
  }
}

/**
 * API 데이터를 미리 로드하고 캐싱합니다. (변경 없음)
 */
export async function preloadCoupangAPI() {
  const results: { categoryId: string; ok: boolean }[] = [];
  const categoryIds = Object.keys(COUPANG_CATEGORIES);
  const batches = chunk(categoryIds, 5);

  try {
    await getCachedGoldbox({ force: true });
    void log.info('✅ 골드박스 캐싱 성공', 'SCHEDULER');
  } catch (err) {
    void log.error('❌ 골드박스 캐싱 실패', 'SCHEDULER', 'HIGH', { error: err });
  }

  for (const batch of batches) {
    const promises = batch.map((categoryId) =>
      getCachedBestCategory(categoryId, { force: true })
        .then(() => results.push({ categoryId, ok: true }))
        .catch(() => results.push({ categoryId, ok: false }))
    );
    await Promise.all(promises);
  }

  log.info('✅ 카테고리 캐시 완료', 'SCHEDULER', 'LOW', { results });
}
