import { registerMembershipScheduler } from './membership';
import { registerIAPScheduler } from './iap';
import { registerEventScheduler } from './events';
import { registerBackupScheduler } from './backup';
import { registerCoupangAPIScheduler } from './coupangAPI';
import { registerAnalyticsSchedulers } from 'feature/analytics/scheduler/analytics.scheduler';

/**
 * 프로덕션 환경에서만 스케줄러를 등록합니다.
 * 개발/테스트 환경에서는 스케줄러가 실행되지 않습니다.
 */
export function registerAllSchedulers() {
  if (process.env.NODE_ENV === 'production') {
    registerMembershipScheduler();
    registerIAPScheduler();
    registerEventScheduler();
    registerBackupScheduler();
    registerCoupangAPIScheduler();

    if (process.env.MODE == 'prod') {
      registerAnalyticsSchedulers();
    }
  }
}

export default registerAllSchedulers;
