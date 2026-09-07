import blockLegacyIos, { isLegacyIosRequest, LEGACY_IOS_GONE_MESSAGE } from '../middleware/blockLegacyIos';

const IOS_UA = 'pickforme/119 CFNetwork/1568.300.101 Darwin/24.2.0';
const ANDROID_UA = 'okhttp/4.9.2';
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

const run = async (ua: string | undefined) => {
  const ctx: any = { header: { 'user-agent': ua }, status: 404, body: undefined };
  const next = jest.fn(async () => {
    ctx.status = 200;
  });
  await blockLegacyIos(ctx, next);
  return { ctx, next };
};

describe('blockLegacyIos', () => {
  const original = process.env.BLOCK_LEGACY_IOS;
  afterEach(() => {
    if (original === undefined) delete process.env.BLOCK_LEGACY_IOS;
    else process.env.BLOCK_LEGACY_IOS = original;
  });

  it('iOS 네이티브 UA 만 레거시 iOS 로 식별한다', () => {
    expect(isLegacyIosRequest(IOS_UA)).toBe(true);
    expect(isLegacyIosRequest(ANDROID_UA)).toBe(false);
    expect(isLegacyIosRequest(BROWSER_UA)).toBe(false);
    expect(isLegacyIosRequest(undefined)).toBe(false);
  });

  it('스위치 미설정이면 아무것도 막지 않는다(기본 비활성)', async () => {
    delete process.env.BLOCK_LEGACY_IOS;
    const { ctx, next } = await run(IOS_UA);
    expect(next).toHaveBeenCalled();
    expect(ctx.status).toBe(200);
  });

  it('활성 시 iOS 요청은 410 + 안내 문구, next 미호출', async () => {
    process.env.BLOCK_LEGACY_IOS = 'true';
    const { ctx, next } = await run(IOS_UA);
    expect(next).not.toHaveBeenCalled();
    expect(ctx.status).toBe(410);
    expect(ctx.body.error.code).toBe('LEGACY_IOS_GONE');
    expect(ctx.body.error.message).toBe(LEGACY_IOS_GONE_MESSAGE);
  });

  it('활성이어도 Android·브라우저(어드민)는 통과한다', async () => {
    process.env.BLOCK_LEGACY_IOS = 'true';
    for (const ua of [ANDROID_UA, BROWSER_UA, undefined]) {
      const { ctx, next } = await run(ua);
      expect(next).toHaveBeenCalled();
      expect(ctx.status).toBe(200);
    }
  });
});
