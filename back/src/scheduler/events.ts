import schedule from 'node-schedule';
import db from 'models';
import { ProductType } from 'models/product';
import { log } from 'utils/logger/logger';
import { LogContext, LogSeverity } from 'utils/logger/types';

const SCHEDULER_NAME = 'events';
const productIdToApply = 'pickforme_plus';

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
      MembershipAt: { $ne: null }
    });

    const eventProducts = await db.Product.find({
      type: ProductType.SUBSCRIPTION,
    });

    const eventProduct = eventProducts.find((product) => product.productId === productIdToApply);

    if (!eventProduct) {
      log.error(LogContext.SCHEDULER, '이벤트 상품이 존재하지 않습니다.', LogSeverity.HIGH, {
        scheduler: SCHEDULER_NAME,
        productId: productIdToApply,
        eventProducts,
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
        log.info(LogContext.SCHEDULER, `이벤트 멤버십 만료 처리 완료 - userId: ${user._id}`, LogSeverity.LOW, { 
          scheduler: SCHEDULER_NAME,
          userId: user._id 
        });
        continue;
      }

      // 한달이 지난 경우
      if (now >= oneMonthLater) {
        await user.applyPurchaseRewards(eventProduct.getRewards());
        log.info(LogContext.SCHEDULER, `이벤트 멤버십 포인트 충전 완료 - userId: ${user._id}`, LogSeverity.LOW, { 
          scheduler: SCHEDULER_NAME,
          userId: user._id 
        });
      }
    }
  } catch (error) {
    log.error(LogContext.SCHEDULER, '이벤트 멤버십 처리 중 오류 발생', LogSeverity.HIGH, { 
      scheduler: SCHEDULER_NAME,
      error 
    });
  }
};

/**
 * 모든 이벤트 멤버십을 체크하는 메인 함수
 */
const processEventMembership = async () => {
  await processHansiryunEventMembership();
};

export function registerEventScheduler() {
  if (process.env.NODE_ENV === 'production') {
    schedule.scheduleJob('0 0 0 * * *', processEventMembership);
  }
}

export default registerEventScheduler; 