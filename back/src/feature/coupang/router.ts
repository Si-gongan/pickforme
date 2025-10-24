import Router from '@koa/router';
import coupangCrawlerService from './crawler.service';
import { log } from 'utils/logger';
import { extractAndValidateCoupangUrl } from './utils';
import { searchProducts, getDeeplinks, getOrders, getCommissions } from './api.service';
import { default as UrlTransformLog } from './models';

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

router.post('/deeplink', async (ctx) => {
  const startTime = Date.now();
  const requestId = `deeplink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const { urls } = ctx.request.body as { urls: string[] };

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'URLs가 필요합니다.' };
    return;
  }

  if (urls.length !== 1) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'URLs는 하나만 전달해야 합니다.' };
    return;
  }

  let transformSuccess = false;
  let deeplinkSuccess = false;
  let errorMsg: string | undefined;
  let deeplinkErrorMsg: string | undefined;
  let normalizedUrlInfo: any = null;
  let deeplinkResult: any = null;

  try {
    // URL 정규화
    const { CoupangUrlNormalizerService } = await import('./url-normalizer.service');
    normalizedUrlInfo = CoupangUrlNormalizerService.normalizeUrl(urls[0]);
    transformSuccess = true;

    // 정규화된 URL로 딥링크 생성
    deeplinkResult = await getDeeplinks([normalizedUrlInfo.normalizedUrl]);

    if (
      !deeplinkResult ||
      deeplinkResult.length === 0 ||
      !deeplinkResult[0].originalUrl ||
      !deeplinkResult[0].shortenUrl
    ) {
      deeplinkErrorMsg = '딥링크 생성 실패: 결과가 없거나 필수 필드 누락';
    } else {
      deeplinkSuccess = true;
    }
  } catch (error) {
    errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('URL 변환 중 오류:', error);
  }

  const durationMs = Date.now() - startTime;

  // 로그 저장
  try {
    const logData = {
      requestId,
      originalInputUrl: urls[0],
      normalizedUrl: normalizedUrlInfo?.normalizedUrl || urls[0],
      productId: normalizedUrlInfo?.productId || '',
      urlType: normalizedUrlInfo?.urlType || 'unknown',
      transformSuccess,
      errorMsg,
      deeplinkSuccess,
      deeplinkErrorMsg,
      originalUrl: deeplinkResult?.[0]?.originalUrl,
      shortenUrl: deeplinkResult?.[0]?.shortenUrl,
      landingUrl: deeplinkResult?.[0]?.landingUrl,
      durationMs,
    };

    const savedLog = await UrlTransformLog.create(logData);
    console.log('📊 URL 변환 로그 저장 완료:', {
      id: savedLog._id,
      requestId: logData.requestId,
      originalInputUrl: logData.originalInputUrl,
      transformSuccess: logData.transformSuccess,
      deeplinkSuccess: logData.deeplinkSuccess,
    });
  } catch (logError) {
    console.error('로그 저장 실패:', logError);
  }

  // 응답 처리
  if (!transformSuccess || !deeplinkSuccess) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: errorMsg || deeplinkErrorMsg || 'URL 변환 중 오류가 발생했습니다.',
    };
    return;
  }

  // 원본 URL 정보와 정규화 정보를 함께 반환
  ctx.body = {
    success: true,
    data: {
      ...deeplinkResult[0],
      originalInputUrl: normalizedUrlInfo.originalUrl,
      normalizedUrl: normalizedUrlInfo.normalizedUrl,
      productId: normalizedUrlInfo.productId,
      urlType: normalizedUrlInfo.urlType,
    },
  };
});

router.post('/api/search', async (ctx) => {
  try {
    const { keyword } = ctx.request.body as { keyword: string };

    // 파트너스 api 최대 허용 검색 개수는 10개입니다.
    const searchLimit = 10;

    if (!keyword) {
      ctx.status = 400;
      ctx.body = { success: false, message: '검색어(keyword)가 필요합니다.' };
      return;
    }

    // 이전에 만든 API 검색 서비스 함수 호출
    const result = await searchProducts(keyword, searchLimit);

    ctx.body = { success: true, data: result };

    void log.info('쿠팡 API 검색 성공', 'COUPANG', 'LOW', {
      keyword,
      resultCount: result.length,
    });
  } catch (error) {
    console.error('❌ 쿠팡 API 검색 실패:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error instanceof Error ? error.message : 'API 검색 중 오류가 발생했습니다.',
    };
    void log.error('쿠팡 API 검색 실패', 'COUPANG', 'MEDIUM', {
      keyword: (ctx.request.body as any)?.keyword,
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

// 주문 정보 조회
router.get('/reports/orders', async (ctx) => {
  try {
    const { startDate, endDate, subId, page = '0' } = ctx.query;

    // 필수 파라미터 검증
    if (!startDate || !endDate) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'startDate와 endDate는 필수 파라미터입니다.',
      };
      return;
    }

    // 날짜 형식 검증 (yyyyMMdd)
    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(startDate as string) || !dateRegex.test(endDate as string)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '날짜는 yyyyMMdd 형식이어야 합니다.',
      };
      return;
    }

    // 날짜 범위 검증 (30일 이내)
    const start = new Date(
      (startDate as string).substring(0, 4) +
        '-' +
        (startDate as string).substring(4, 6) +
        '-' +
        (startDate as string).substring(6, 8)
    );
    const end = new Date(
      (endDate as string).substring(0, 4) +
        '-' +
        (endDate as string).substring(4, 6) +
        '-' +
        (endDate as string).substring(6, 8)
    );

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '시작일과 종료일의 차이는 30일 이하여야 합니다.',
      };
      return;
    }

    const pageNum = parseInt(page as string, 10);
    if (isNaN(pageNum) || pageNum < 0) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'page는 0 이상의 정수여야 합니다.',
      };
      return;
    }

    const result = await getOrders(
      startDate as string,
      endDate as string,
      pageNum,
      subId as string
    );

    ctx.body = {
      success: true,
      data: result,
    };

    void log.info('쿠팡 주문 정보 조회 성공', 'COUPANG', 'LOW', {
      startDate,
      endDate,
      subId,
      page: pageNum,
    });
  } catch (error) {
    console.error('❌ 쿠팡 주문 정보 조회 실패:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error instanceof Error ? error.message : '주문 정보 조회 중 오류가 발생했습니다.',
    };
    void log.error('쿠팡 주문 정보 조회 실패', 'COUPANG', 'MEDIUM', {
      query: ctx.query,
      error: error instanceof Error ? error.stack : error,
    });
  }
});

// 수수료 정보 조회
router.get('/reports/commissions', async (ctx) => {
  try {
    const { startDate, endDate, subId, page = '0' } = ctx.query;

    // 필수 파라미터 검증
    if (!startDate || !endDate) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'startDate와 endDate는 필수 파라미터입니다.',
      };
      return;
    }

    // 날짜 형식 검증 (yyyyMMdd)
    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(startDate as string) || !dateRegex.test(endDate as string)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '날짜는 yyyyMMdd 형식이어야 합니다.',
      };
      return;
    }

    // 날짜 범위 검증 (30일 이내)
    const start = new Date(
      (startDate as string).substring(0, 4) +
        '-' +
        (startDate as string).substring(4, 6) +
        '-' +
        (startDate as string).substring(6, 8)
    );
    const end = new Date(
      (endDate as string).substring(0, 4) +
        '-' +
        (endDate as string).substring(4, 6) +
        '-' +
        (endDate as string).substring(6, 8)
    );

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '시작일과 종료일의 차이는 30일 이하여야 합니다.',
      };
      return;
    }

    const pageNum = parseInt(page as string, 10);
    if (isNaN(pageNum) || pageNum < 0) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'page는 0 이상의 정수여야 합니다.',
      };
      return;
    }

    const result = await getCommissions(
      startDate as string,
      endDate as string,
      pageNum,
      subId as string
    );

    ctx.body = {
      success: true,
      data: result,
    };

    void log.info('쿠팡 수수료 정보 조회 성공', 'COUPANG', 'LOW', {
      startDate,
      endDate,
      subId,
      page: pageNum,
    });
  } catch (error) {
    console.error('❌ 쿠팡 수수료 정보 조회 실패:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error instanceof Error ? error.message : '수수료 정보 조회 중 오류가 발생했습니다.',
    };
    void log.error('쿠팡 수수료 정보 조회 실패', 'COUPANG', 'MEDIUM', {
      query: ctx.query,
      error: error instanceof Error ? error.stack : error,
    });
  }
});

// URL 변환 로그 관련 엔드포인트들

// 테스트용 API - 모든 데이터 조회
router.get('/url-transform-logs/test', async (ctx) => {
  try {
    const allLogs = await UrlTransformLog.find({}).sort({ createdAt: -1 }).limit(10).lean();
    console.log('🧪 테스트 API - 전체 로그 수:', allLogs.length);

    ctx.body = {
      success: true,
      data: {
        count: allLogs.length,
        logs: allLogs,
      },
    };
  } catch (error) {
    console.error('테스트 API 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '테스트 API 오류',
    };
  }
});

// URL 변환 로그 목록 조회
router.get('/url-transform-logs/list', async (ctx) => {
  try {
    const { page = 1, limit = 20, urlType, transformSuccess, deeplinkSuccess, keyword } = ctx.query;

    const filter: any = {};

    if (urlType && urlType !== '') filter.urlType = urlType;
    if (transformSuccess !== undefined && transformSuccess !== '')
      filter.transformSuccess = transformSuccess === 'true';
    if (deeplinkSuccess !== undefined && deeplinkSuccess !== '')
      filter.deeplinkSuccess = deeplinkSuccess === 'true';
    if (keyword) {
      filter.$or = [
        { originalInputUrl: { $regex: keyword, $options: 'i' } },
        { normalizedUrl: { $regex: keyword, $options: 'i' } },
        { productId: { $regex: keyword, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [results, total] = await Promise.all([
      UrlTransformLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      UrlTransformLog.countDocuments(filter),
    ]);

    console.log('📋 URL 변환 로그 목록 조회:', {
      filter,
      skip,
      limit: Number(limit),
      resultsCount: results.length,
      total,
    });

    const totalPages = Math.ceil(total / Number(limit));

    ctx.body = {
      success: true,
      data: {
        results,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    };
  } catch (error) {
    console.error('URL 변환 로그 목록 조회 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'URL 변환 로그 목록 조회 중 오류가 발생했습니다.',
    };
  }
});

// URL 변환 통계 조회
router.get('/url-transform-logs/stats', async (ctx) => {
  try {
    const { startDate, endDate } = ctx.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    const matchFilter: any = {};
    if (Object.keys(dateFilter).length > 0) {
      matchFilter.createdAt = dateFilter;
    }

    const stats = await UrlTransformLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          transformSuccessCount: {
            $sum: { $cond: ['$transformSuccess', 1, 0] },
          },
          deeplinkSuccessCount: {
            $sum: { $cond: ['$deeplinkSuccess', 1, 0] },
          },
          avgDurationMs: { $avg: '$durationMs' },
        },
      },
      {
        $project: {
          totalRequests: 1,
          transformSuccessCount: 1,
          deeplinkSuccessCount: 1,
          transformSuccessRate: {
            $multiply: [{ $divide: ['$transformSuccessCount', '$totalRequests'] }, 100],
          },
          deeplinkSuccessRate: {
            $multiply: [{ $divide: ['$deeplinkSuccessCount', '$totalRequests'] }, 100],
          },
          avgDurationMs: { $round: ['$avgDurationMs', 2] },
        },
      },
    ]);

    // URL 타입별 통계를 별도로 조회
    const urlTypeStats = await UrlTransformLog.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$urlType',
          count: { $sum: 1 },
          transformSuccess: { $sum: { $cond: ['$transformSuccess', 1, 0] } },
          deeplinkSuccess: { $sum: { $cond: ['$deeplinkSuccess', 1, 0] } },
        },
      },
      {
        $project: {
          urlType: '$_id',
          count: 1,
          transformSuccess: 1,
          deeplinkSuccess: 1,
          transformSuccessRate: {
            $multiply: [{ $divide: ['$transformSuccess', '$count'] }, 100],
          },
          deeplinkSuccessRate: {
            $multiply: [{ $divide: ['$deeplinkSuccess', '$count'] }, 100],
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const result = stats[0] || {
      totalRequests: 0,
      transformSuccessCount: 0,
      deeplinkSuccessCount: 0,
      transformSuccessRate: 0,
      deeplinkSuccessRate: 0,
      avgDurationMs: 0,
    };

    ctx.body = {
      success: true,
      data: {
        ...result,
        urlTypeStats,
      },
    };
  } catch (error) {
    console.error('URL 변환 통계 조회 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'URL 변환 통계 조회 중 오류가 발생했습니다.',
    };
  }
});

// 특정 Request ID의 상세 로그 조회
router.get('/url-transform-logs/:requestId', async (ctx) => {
  try {
    const { requestId } = ctx.params;

    const urlTransformLog = await UrlTransformLog.findOne({ requestId }).lean();

    if (!urlTransformLog) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '해당 Request ID의 로그를 찾을 수 없습니다.',
      };
      return;
    }

    ctx.body = {
      success: true,
      data: log,
    };
  } catch (error) {
    console.error('URL 변환 로그 상세 조회 오류:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'URL 변환 로그 상세 조회 중 오류가 발생했습니다.',
    };
  }
});

export default router;
