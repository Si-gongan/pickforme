import db from 'models';
import { ProductType } from 'models/product';

class SubscriptionService {
  private static instance: SubscriptionService;

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  public async getSubscriptionStatus(userId: string) {
    const subscription = await db.Purchase.findOne({
      userId,
      isExpired: false,
      'product.type': ProductType.SUBSCRIPTION,
    }).sort({
      createdAt: -1,
    }).lean();

    if (!subscription) {
      return {
        subscription: null,
        activate: false,
        leftDays: 0,
        expiresAt: null,
        msg: '활성화중인 구독정보가 없습니다.',
      };
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // 한달이 지났는지 여부를 확인해서 구독 여부를 파악한다.
    const endDate = new Date(subscription.createdAt);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setHours(0, 0, 0, 0);

    const timeDifference = endDate.getTime() - currentDate.getTime();
    const leftDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    const activate = leftDays > 0;

    return {
      subscription,
      activate,
      leftDays: Math.max(0, leftDays),
      expiresAt: endDate.toISOString(),
      msg: activate ? '활성화중인 구독정보를 조회하였습니다.' : '구독 기간이 만료되었습니다.',
    };
  }
}

export const subscriptionService = SubscriptionService.getInstance();