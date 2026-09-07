import { Context } from 'koa';

/**
 * 픽포미 4.0 강제 이관 — 레거시 iOS 앱(4.0.0 미만 RN 빌드)의 API 요청을 410 Gone 으로 거절한다.
 *
 * owner 결정 2026-09-07. OTA 번들의 dismiss 불가 안내 화면이 1층, 이 미들웨어가 2층(백스톱)이다 —
 * OTA 를 못 받는 구 바이너리(runtimeVersion 3.3.4 이전)와 안내 화면을 우회한 요청까지 막는다.
 *
 * 식별 = iOS 네이티브 네트워킹의 User-Agent(`<앱>/<빌드> CFNetwork/<v> Darwin/<v>`). Android(okhttp)·브라우저(어드민 웹)는
 * 이 형태가 아니라 영향 없다. 4.0 네이티브 앱은 이 레거시 서버를 호출하지 않는다.
 *
 * 스위치 = env `BLOCK_LEGACY_IOS` ("true" 일 때만 활성 — 미설정 = 비활성, 롤백은 env 제거 + 재시작).
 */
export const LEGACY_IOS_GONE_MESSAGE =
  '현재 버전은 서비스가 종료되었습니다. App Store에서 픽포미 4.0으로 업데이트해주세요.';

const IOS_NATIVE_UA = /CFNetwork\/[\d.]+\s+Darwin\//i;

export const isLegacyIosRequest = (userAgent: string | undefined): boolean =>
  !!userAgent && IOS_NATIVE_UA.test(userAgent);

export const isBlockEnabled = (): boolean => process.env.BLOCK_LEGACY_IOS === 'true';

export default async (ctx: Context, next: () => Promise<any>) => {
  if (isBlockEnabled() && isLegacyIosRequest(ctx.header['user-agent'])) {
    ctx.status = 410;
    ctx.body = { error: { code: 'LEGACY_IOS_GONE', message: LEGACY_IOS_GONE_MESSAGE } };
    return;
  }
  await next();
};
