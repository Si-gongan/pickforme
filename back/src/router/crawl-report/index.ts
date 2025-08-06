// routes/crawlReport.ts
import Router from '@koa/router';
import CrawlLogModel from 'models/crawl-log';
import { log } from 'utils/logger';
const router = new Router({ prefix: '/crawl-logs' });

/**
 * GET /crawl-report/list
 * 전체 로그 조회 (어드민용, 페이지네이션 + 필터링)
 */
router.get('/list', async (ctx) => {
  const {
    page = '1',
    limit = '20',
    productUrl,
    requestId,
    processType,
    success,
  } = ctx.query as Record<string, string>;

  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.max(parseInt(limit, 10), 1);

  const query: Record<string, any> = {};

  if (productUrl) query.productUrl = productUrl;
  if (requestId) query.requestId = requestId;
  if (processType) query.processType = processType;
  if (success === 'true') query.success = true;
  if (success === 'false') query.success = false;

  const [logs, total] = await Promise.all([
    CrawlLogModel.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    CrawlLogModel.countDocuments(query),
  ]);

  ctx.body = {
    total,
    page: pageNum,
    limit: limitNum,
    results: logs,
  };
});

/**
 * POST /crawl-report
 * 크롤링 결과 저장
 */
router.post('/', async (ctx) => {
  const { requestId, productUrl, processType, success, durationMs, fields } = ctx.request.body as {
    requestId: string;
    productUrl: string;
    processType: string;
    success: boolean;
    durationMs: number;
    fields: Record<string, boolean>;
  };

  if (!requestId || !productUrl || !processType || typeof success !== 'boolean' || !durationMs) {
    ctx.status = 400;
    ctx.body = { error: '필수 파라미터 누락' };
    return;
  }

  try {
    const crawlLog = new CrawlLogModel({
      requestId,
      productUrl,
      processType,
      success,
      durationMs,
      fields: fields ?? {},
    });

    await crawlLog.save();

    ctx.body = { message: '크롤링 로그 저장 완료' };
  } catch (e) {
    void log.error('크롤링 로그 저장 실패', 'PRODUCT', 'MEDIUM', {
      error: {
        name: e instanceof Error ? e.name : 'UnknownError',
        message: e instanceof Error ? e.message : 'UnknownError',
        stack: e instanceof Error ? e.stack : 'UnknownError',
      },
    });
    ctx.status = 500;
    ctx.body = { error: '크롤링 로그 저장 실패' };
    return;
  }
});

/**
 * GET /crawl-logs/stats
 * 크롤링 전체 통계 (어드민용)
 */
router.get('/stats', async (ctx) => {
  try {
    const logs = await CrawlLogModel.find(
      {},
      {
        processType: 1,
        success: 1,
        createdAt: 1,
      }
    ).lean();

    const formatDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

    const today = formatDate(new Date());

    const stats = {
      todayStats: {} as Record<
        string,
        { total: number; success: number; fail: number; successRate: number }
      >,
      byDateAndProcess: {} as Record<
        string,
        Record<string, { total: number; success: number; fail: number; successRate: number }>
      >,
    };

    for (const l of logs) {
      const date = formatDate(l.createdAt);
      const process = l.processType;

      // === todayStats 계산 ===
      if (date === today) {
        if (!stats.todayStats[process]) {
          stats.todayStats[process] = { total: 0, success: 0, fail: 0, successRate: 0 };
        }
        stats.todayStats[process].total++;
        stats.todayStats[process][l.success ? 'success' : 'fail']++;
      }

      // === byDateAndProcess 계산 ===
      if (!stats.byDateAndProcess[date]) {
        stats.byDateAndProcess[date] = {};
      }
      if (!stats.byDateAndProcess[date][process]) {
        stats.byDateAndProcess[date][process] = {
          total: 0,
          success: 0,
          fail: 0,
          successRate: 0,
        };
      }
      stats.byDateAndProcess[date][process].total++;
      stats.byDateAndProcess[date][process][l.success ? 'success' : 'fail']++;
    }

    // successRate 추가 계산
    for (const p in stats.todayStats) {
      const { success, total } = stats.todayStats[p];
      stats.todayStats[p].successRate = total ? (success / total) * 100 : 0;
    }

    for (const date in stats.byDateAndProcess) {
      for (const p in stats.byDateAndProcess[date]) {
        const { success, total } = stats.byDateAndProcess[date][p];
        stats.byDateAndProcess[date][p].successRate = total ? (success / total) * 100 : 0;
      }
    }

    ctx.body = stats;
  } catch (err) {
    console.error('crawl-logs/stats error:', err);
    ctx.status = 500;
    ctx.body = { message: 'Failed to fetch stats' };
  }
});

/**
 * GET /crawl-report/:requestId
 * 특정 requestId의 모든 프로세스 결과 조회
 */
router.get('/:requestId', async (ctx) => {
  const { requestId } = ctx.params;

  const logs = await CrawlLogModel.find({ requestId }).sort({ createdAt: 1 }).lean();

  ctx.body = logs;
});

export default router;
