import Router from '@koa/router';
import SearchLogModel from 'models/searchLog';

const router = new Router({ prefix: '/search-logs' });

router.post('/', async (ctx) => {
  const { requestId, keyword, source, success, durationMs, resultCount, errorMsg } = ctx.request
    .body as {
    requestId: string;
    keyword: string;
    source: 'webview' | 'server';
    success: boolean;
    durationMs: number;
    resultCount: number;
    errorMsg?: string;
  };

  console.log('requestId', requestId);
  console.log('keyword', keyword);
  console.log('source', source);
  console.log('success', success);
  console.log('durationMs', durationMs);
  console.log('resultCount', resultCount);
  console.log('errorMsg', errorMsg);

  if (
    !requestId ||
    !keyword ||
    !source ||
    typeof success !== 'boolean' ||
    !Number.isFinite(durationMs)
  ) {
    ctx.status = 400;
    ctx.body = { error: '필수 파라미터 누락' };
    return;
  }

  await SearchLogModel.create({
    requestId,
    keyword,
    source,
    success,
    durationMs,
    resultCount: resultCount ?? 0,
    errorMsg,
  });

  ctx.body = { message: '검색 로그 저장 완료' };
});

router.get('/list', async (ctx) => {
  const {
    page = '1',
    limit = '20',
    requestId = '',
    keyword = '',
    source = '',
  } = ctx.query as Record<string, string>;

  const toInt = (v: string, fb: number) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : fb;
  };
  const pageNum = toInt(page, 1);
  const limitNum = toInt(limit, 20);

  const q: any = {};
  if (requestId.trim()) q.requestId = requestId.trim();
  if (keyword.trim()) q.keyword = keyword.trim();
  if (source.trim()) q.source = source.trim();

  const [rows, total] = await Promise.all([
    SearchLogModel.find(q)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    SearchLogModel.countDocuments(q),
  ]);

  ctx.body = {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.max(Math.ceil(total / limitNum), 1),
    results: rows,
  };
});

// (선택) 일/소스별 성공률·평균시간
router.get('/stats', async (ctx) => {
  const tz = (ctx.query.tz as string) || 'Asia/Seoul';
  const pipeline = [
    {
      $addFields: {
        localDate: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d', timezone: tz } },
      },
    },
    {
      $group: {
        _id: { date: '$localDate', source: '$source' },
        total: { $sum: 1 },
        success: { $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] } },
        avgDurationMs: { $avg: '$durationMs' },
        avgResultCount: { $avg: '$resultCount' },
      },
    },
    { $sort: { '_id.date': -1, '_id.source': 1 } },
  ];

  const rows = await SearchLogModel.aggregate(pipeline as any);
  ctx.body = { byDateAndSource: rows };
});

export default router;
