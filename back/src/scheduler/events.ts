import cron from 'node-cron';
import db from 'models';
import { ProductType } from 'models/product';
import { log } from 'utils/logger/logger';
import { EVENT_IDS } from '../constants/events';

const SCHEDULER_NAME = 'events';

/**
 * 한시련 이벤트 멤버십을 가진 유저들의 상태를 확인하고,
 * 1. 한달이 지난 경우: 포인트를 충전
 * 2. 6개월이 지난 경우: 멤버십 만료 처리
 */

const processHansiryunEventMembership = async () => {
  try {
    const now = new Date();

    // 한시련 이벤트 멤버십을 가진 유저들 조회
    const users = await db.User.find({
      event: 1, // 한시련 이벤트
      MembershipAt: { $ne: null },
    });

    const eventProduct = await db.Product.findOne({
      type: ProductType.SUBSCRIPTION,
      eventId: EVENT_IDS.HANSIRYUN,
    });

    if (!eventProduct) {
      void log.error('이벤트 상품이 존재하지 않습니다.', 'SCHEDULER', 'HIGH', {
        scheduler: SCHEDULER_NAME,
        eventId: EVENT_IDS.HANSIRYUN,
      });
      return;
    }

    for (const user of users) {
      if (!user.MembershipAt) continue;

      const membershipStartDate = new Date(user.MembershipAt);
      const lastMembershipDate = user.lastMembershipAt || membershipStartDate;

      const oneMonthLater = new Date(lastMembershipDate);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      const sixMonthsLater = new Date(membershipStartDate);
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

      // 6개월이 지난 경우
      if (now >= sixMonthsLater) {
        await user.processExpiredMembership();
        void log.info(`이벤트 멤버십 만료 처리 완료 - userId: ${user._id}`, 'SCHEDULER', 'LOW', {
          scheduler: SCHEDULER_NAME,
          userId: user._id,
        });
        continue;
      }

      // 한달이 지난 경우
      if (now >= oneMonthLater) {
        await user.applyPurchaseRewards(eventProduct.getRewards());
        void log.info(`이벤트 멤버십 포인트 충전 완료 - userId: ${user._id}`, 'SCHEDULER', 'LOW', {
          scheduler: SCHEDULER_NAME,
          userId: user._id,
        });
      }
    }
  } catch (error) {
    if (error instanceof Error)
      void log.error('이벤트 멤버십 처리 중 오류 발생', 'SCHEDULER', 'HIGH', {
        scheduler: SCHEDULER_NAME,
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
  }
};

/**
 * 모든 이벤트 멤버십을 체크하는 메인 함수
 */
const processEventMembership = async () => {
  await processHansiryunEventMembership();
};

export const handleEventScheduler = async () => {
  log.info('이벤트 멤버십 스케줄러 실행됨', 'SCHEDULER', 'LOW', {
    scheduler: SCHEDULER_NAME,
  });
  await processEventMembership();
};

export function registerEventScheduler() {
  cron.schedule('0 0 * * *', handleEventScheduler, {
    timezone: 'Asia/Seoul',
  });
}

export default registerEventScheduler;
