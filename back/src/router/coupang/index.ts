import Router from '@koa/router';
import coupangCrawlerService from '../../services/coupang-crawler.service';
import { log } from 'utils/logger';
import { extractAndValidateCoupangUrl } from 'utils/coupang';

const router = new Router({
  prefix: '/coupang',
});

// 쿠팡 상품 크롤링
router.post('/crawl', async (ctx) => {
  try {
    const { url: inputText } = ctx.request.body as { url: string };

    if (!inputText) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'URL이 필요합니다.',
      };
      return;
    }

    // URL 추출 및 검증
    const validation = extractAndValidateCoupangUrl(inputText);

    if (!validation.success) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: validation.message,
        inputText, // 디버깅용으로 원본 텍스트 반환
        extractedUrl: validation.url,
      };
      return;
    }

    const result = await coupangCrawlerService.crawl(validation.url!);

    ctx.body = {
      success: true,
      data: result,
      extractedUrl: validation.url,
      productId: validation.productId,
    };

    // 로그 기록
    void log.info('쿠팡 크롤링 성공', 'COUPANG', 'LOW', {
      originalInput: inputText,
      extractedUrl: validation.url,
      productId: validation.productId,
      productName: result.name,
      price: result.price,
    });
  } catch (error) {
    console.error('❌ 쿠팡 크롤링 실패:', error);

    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error instanceof Error ? error.message : '크롤링 중 오류가 발생했습니다.',
    };

    // 에러 로그 기록
    void log.error(
      error instanceof Error ? error.message : '쿠팡 크롤링 실패',
      'COUPANG',
      'MEDIUM',
      {
        originalInput: (ctx.request.body as any)?.url,
        error: error instanceof Error ? error.stack : error,
      }
    );
  }
});

// 쿠팡 상품 검색
router.post('/search', async (ctx) => {
  try {
    const { searchText } = ctx.request.body as { searchText: string };
    if (!searchText) {
      ctx.status = 400;
      ctx.body = { success: false, message: '검색어가 필요합니다.' };
      return;
    }
    const result = await coupangCrawlerService.search(searchText);
    ctx.body = { success: true, data: result };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error instanceof Error ? error.message : '검색 중 오류 발생',
    };
  }
});

// 크롤러 상태 확인
router.get('/status', async (ctx) => {
  try {
    const status = coupangCrawlerService.getStatus();

    ctx.body = {
      success: true,
      data: status,
    };
  } catch (error) {
    console.error('❌ 크롤러 상태 확인 실패:', error);

    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '크롤러 상태 확인 중 오류가 발생했습니다.',
    };
  }
});

// 크롤러 초기화
router.post('/initialize', async (ctx) => {
  try {
    await coupangCrawlerService.initialize();

    ctx.body = {
      success: true,
      message: '크롤러가 초기화되었습니다.',
    };
  } catch (error) {
    console.error('❌ 크롤러 초기화 실패:', error);

    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '크롤러 초기화 중 오류가 발생했습니다.',
    };
  }
});

// 크롤러 정리
router.post('/cleanup', async (ctx) => {
  try {
    await coupangCrawlerService.cleanup();

    ctx.body = {
      success: true,
      message: '크롤러가 정리되었습니다.',
    };
  } catch (error) {
    console.error('❌ 크롤러 정리 실패:', error);

    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '크롤러 정리 중 오류가 발생했습니다.',
    };
  }
});

export default router;
