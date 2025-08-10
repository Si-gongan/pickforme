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
// routes/crawlReport.ts (발췌: /stats 교체)

function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/** YYYY-MM-DD → 해당 타임존의 UTC 경계로 변환 */
function toZonedRange(tz: string, from?: string, to?: string) {
  const now = new Date();

  // 기본: 오늘 하루
  const baseFrom =
    from ?? new Intl.DateTimeFormat('en-CA', { timeZone: tz, dateStyle: 'short' }).format(now); // yyyy-mm-dd
  const baseTo = to ?? baseFrom;

  // 로컬 시작/끝(Date string → 현지 자정)
  const startLocal = new Date(`${baseFrom}T00:00:00`);
  const endLocal = new Date(`${baseTo}T23:59:59.999`);

  // 현지 시간을 해당 tz로 포맷 후, 그 순간의 UTC 시간을 역산하는 방식은 JS 단독으로 까다로워
  // MongoDB에서 타임존을 다룰 거라 여기선 '문자' 경계만 관리하고, 실제 필터는 $dateToString 로컬날짜와 비교함.
  // → createdAt 자체는 아래 파이프라인에서 tz 기준 로컬 날짜로 변환 후 필터되지 않고,
  //   여기서는 대략적 범위를 위한 넉넉한 UTC 가드만 둡니다.
  // 안전하게 과도 필터링을 피하기 위해 3일 버퍼(앞/뒤)를 둡니다.
  const guardStart = new Date(startLocal.getTime() - 3 * 86400000);
  const guardEnd = new Date(endLocal.getTime() + 3 * 86400000);

  return { baseFrom, baseTo, guardStart, guardEnd };
}

router.get('/stats', async (ctx) => {
  const tz = (ctx.query.tz as string) || 'Asia/Seoul';
  const from = ctx.query.from as string | undefined; // YYYY-MM-DD
  const to = ctx.query.to as string | undefined;

  if (!isValidTimeZone(tz)) {
    ctx.status = 400;
    ctx.body = { message: `Invalid timezone: ${tz}` };
    return;
  }

  const { baseFrom, baseTo, guardStart, guardEnd } = toZonedRange(tz, from, to);

  // 파이프라인:
  // 1) 대략적 UTC 가드로 1차 제한
  // 2) 로컬 날짜(localDate: tz 기준 "%Y-%m-%d") 생성
  // 3) facet으로
  //   a) 날짜/프로세스별 합계, 성공수, 평균 소요시간
  //   b) 날짜별 웹뷰 두 프로세스의 분모(= requestId 합집합 개수)
  // 4) 결과를 Node에서 후처리: 웹뷰 두 프로세스의 분모 동일화, 성공률 재계산
  const pipeline: any[] = [
    { $match: { createdAt: { $gte: guardStart, $lte: guardEnd } } },
    {
      $addFields: {
        localDate: {
          $dateToString: { date: '$createdAt', format: '%Y-%m-%d', timezone: tz },
        },
      },
    },
    {
      $match: {
        localDate: { $gte: baseFrom, $lte: baseTo },
      },
    },
    {
      $facet: {
        processCounts: [
          {
            $group: {
              _id: { date: '$localDate', process: '$processType' },
              total: { $sum: 1 },
              success: {
                $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] },
              },
              fail: {
                $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] },
              },
              avgDurationMs: { $avg: '$durationMs' },
            },
          },
        ],
        webviewDenoms: [
          { $match: { processType: { $in: ['webview-detail', 'webview-review'] } } },
          {
            $group: {
              _id: { date: '$localDate' },
              reqs: { $addToSet: '$requestId' }, // 날짜별 requestId 합집합
            },
          },
          { $project: { _id: 0, date: '$_id.date', denom: { $size: '$reqs' } } },
        ],
        todayStatsRaw: [
          { $match: { localDate: baseTo } }, // 선택 범위의 '끝' 날짜를 오늘 섹션으로 보여줌 (일반적으로 from=to=오늘)
          {
            $group: {
              _id: '$processType',
              total: { $sum: 1 },
              success: { $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] } },
              fail: { $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] } },
              avgDurationMs: { $avg: '$durationMs' },
            },
          },
        ],
        todayWebviewDenom: [
          {
            $match: {
              localDate: baseTo,
              processType: { $in: ['webview-detail', 'webview-review'] },
            },
          },
          {
            $group: {
              _id: null,
              reqs: { $addToSet: '$requestId' },
            },
          },
          { $project: { _id: 0, denom: { $size: '$reqs' } } },
        ],
      },
    },
  ];

  const [agg] = await CrawlLogModel.aggregate(pipeline).allowDiskUse(true);

  const webviewDenomByDate = new Map<string, number>();
  for (const w of agg.webviewDenoms as Array<{ date: string; denom: number }>) {
    webviewDenomByDate.set(w.date, w.denom);
  }
  const byDateAndProcess: Record<
    string,
    Record<
      string,
      { total: number; success: number; fail: number; successRate: number; avgDurationMs: number }
    >
  > = {};

  for (const row of agg.processCounts as Array<{
    _id: { date: string; process: string };
    total: number;
    success: number;
    fail: number;
    avgDurationMs: number;
  }>) {
    const date = row._id.date;
    const process = row._id.process;
    if (!byDateAndProcess[date]) byDateAndProcess[date] = {};

    const isWebview = process === 'webview-detail' || process === 'webview-review';
    const denom = isWebview ? (webviewDenomByDate.get(date) ?? 0) : row.total;
    const successRate = denom ? (row.success / denom) * 100 : 0;

    byDateAndProcess[date][process] = {
      total: isWebview ? denom : row.total, // 표기상 total은 분모로 노출
      success: row.success,
      fail: isWebview ? Math.max(denom - row.success, 0) : row.fail, // 웹뷰는 누락분을 실패로 간주(요구사항상 분모 동일화)
      successRate,
      avgDurationMs: row.avgDurationMs ?? 0,
    };
  }

  // 오늘(= 범위의 끝 날짜) 섹션 조정: 웹뷰 분모 동일화 + 성공률 재계산
  const todayStats: Record<
    string,
    { total: number; success: number; fail: number; successRate: number; avgDurationMs: number }
  > = {};
  const todayDenom = (agg.todayWebviewDenom?.[0]?.denom as number | undefined) ?? 0;

  for (const row of agg.todayStatsRaw as Array<{
    _id: string;
    total: number;
    success: number;
    fail: number;
    avgDurationMs: number;
  }>) {
    const process = row._id;
    const isWebview = process === 'webview-detail' || process === 'webview-review';
    const denom = isWebview ? todayDenom : row.total;
    const successRate = denom ? (row.success / denom) * 100 : 0;

    todayStats[process] = {
      total: denom,
      success: row.success,
      fail: isWebview ? Math.max(denom - row.success, 0) : row.fail,
      successRate,
      avgDurationMs: row.avgDurationMs ?? 0,
    };
  }

  ctx.body = {
    todayStats,
    byDateAndProcess,
    meta: {
      tz,
      range: { from: baseFrom, to: baseTo },
    },
  };
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
