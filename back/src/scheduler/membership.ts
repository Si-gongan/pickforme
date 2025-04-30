import schedule from 'node-schedule';
import db from 'models';
import { ProductType } from 'models/product';
import { log } from 'utils/logger/logger';
import { LogContext, LogSeverity } from 'utils/logger/types';

const SCHEDULER_NAME = 'membership';

/**
 * 매일 0시에 만료되지 않은 멤버쉽 구독 정보를 조회하고, 
 * 만료일이 지났으면 만료 처리를 수행합니다.
 * 만료 처리는 Purchase의 isExpired 필드를 true로 변경하고, 
 * 해당 유저의 멤버십 포인트를 0으로 초기화합니다.
 */

export const checkSubscriptionExpirations = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const cursor = db.Purchase.find({
      isExpired: false,
      'product.type': ProductType.SUBSCRIPTION,
    }).cursor();

    
    for (let purchase = await cursor.next(); purchase != null; purchase = await cursor.next()) {

      const oneMonthLater = new Date(purchase.createdAt);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      if (oneMonthLater < now) {        
        await purchase.updateExpiration();
        const user = await db.User.findById(purchase.userId);
        if (user) {
          await user.processExpiredMembership();
          log.info(LogContext.SCHEDULER, `멤버십 만료 처리 완료 - userId: ${user._id}`, LogSeverity.LOW, { 
            scheduler: SCHEDULER_NAME,
            userId: user._id 
          });
        }
      }
    }
  } catch (error) {
    if (error instanceof Error)
    log.error(LogContext.SCHEDULER, '멤버십 만료 처리 중 오류 발생', LogSeverity.HIGH, { 
      scheduler: SCHEDULER_NAME,
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
};

// 매일 0시에 실행
export function registerMembershipScheduler() {
  schedule.scheduleJob('0 0 0 * * *', checkSubscriptionExpirations);
}

export default registerMembershipScheduler;
