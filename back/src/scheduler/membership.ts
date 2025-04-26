import schedule from 'node-schedule';
import db from 'models';
import { ProductType } from 'models/product';

/**
 * 매일 0시에 만료되지 않은 멤버쉽 구독 정보를 조회하고, 
 * 만료일이 지났으면 만료 처리를 수행합니다.
 * 만료 처리는 Purchase의 isExpired 필드를 true로 변경하고, 
 * 해당 유저의 멤버십 포인트를 0으로 초기화합니다.
 */

const checkSubscriptionExpirations = async () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const cursor = db.Purchase.find({
    isExpired: false,
    'product.type': ProductType.SUBSCRIPTION,
  }).cursor();

  for (let purchase = await cursor.next(); purchase != null; purchase = await cursor.next()) {

    // 만료 처리 로직.
    // 이 로직도 사실은 만료되었는지 여부를 따로 추상화하는게 좋지만, 
    // 당분간은 다른 상품 추가계획이 없어 일단은 한달 뒤를 조회하는 로직으로 두었습니다.

    const oneMonthLater = new Date(purchase.createdAt);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    if (oneMonthLater < now) {
      // TODO: Logger 추가하기.
      // TODO: 트랜잭션 추가하기 -> 이거 자체를 서비스 레이어로 바꾸는것도.
      await purchase.updateExpiration();
      const user = await db.User.findById(purchase.userId);
      if (user) {
        await user.processExpiredMembership();
      }
    }
  }
};

// 매일 0시에 실행
export function registerMembershipScheduler() {
  schedule.scheduleJob('0 0 0 * * *', checkSubscriptionExpirations);
}

export default checkSubscriptionExpirations;
