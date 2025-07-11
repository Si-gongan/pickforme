import Router from '@koa/router';
import coupangCrawlerService from '../../services/coupang-crawler.service';
import { log } from 'utils/logger';

const router = new Router({
  prefix: '/coupang',
});

// 쿠팡 상품 크롤링
router.post('/crawl', async (ctx) => {
  try {
    const { url } = ctx.request.body as { url: string };

    if (!url) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'URL이 필요합니다.',
      };
      return;
    }

    // 쿠팡 URL 검증
    if (!url.includes('coupang.com/vp/products/')) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '유효한 쿠팡 상품 URL이 아닙니다.',
      };
      return;
    }

    console.log(`🚀 쿠팡 크롤링 요청: ${url}`);

    const result = await coupangCrawlerService.crawl(url);

    ctx.body = {
      success: true,
      data: result,
    };

    // 로그 기록
    void log.info('쿠팡 크롤링 성공', 'COUPANG', 'LOW', {
      url,
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
    void log.error(error instanceof Error ? error.message : '쿠팡 크롤링 실패', 'COUPANG', 'HIGH', {
      url: (ctx.request.body as any)?.url,
      error: error instanceof Error ? error.stack : error,
    });
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
