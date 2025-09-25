import db from 'models';
import { ProductType } from 'models/product';

export class SubscriptionQueryService {
  private static instance: SubscriptionQueryService;

  private constructor() {}

  public static getInstance(): SubscriptionQueryService {
    if (!SubscriptionQueryService.instance) {
      SubscriptionQueryService.instance = new SubscriptionQueryService();
    }
    return SubscriptionQueryService.instance;
  }

  public async getSubscriptionProductsByPlatform(platform: string) {
    const products = await db.Product.find({
      platform,
      type: ProductType.SUBSCRIPTION,
    });
    return products;
  }

  public async getUserSubscriptions(userId: string) {
    const subscriptions = await db.Purchase.find({
      userId,
      'product.type': ProductType.SUBSCRIPTION,
    }).sort({
      createdAt: -1,
    });
    return subscriptions;
  }

  public async getSubscriptionStatus(userId: string) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const user = await db.User.findById(userId);
    if (!user) {
      return {
        subscription: null,
        activate: false,
        leftDays: 0,
        expiresAt: null,
        createdAt: null,
        msg: '유저정보가 없습니다.',
      };
    }

    // 이벤트 멤버쉽이 활성화 되어있는지 확인
    if (user.event === 1 && user.MembershipAt) {
      const membershipAt = new Date(user.MembershipAt);
      membershipAt.setHours(0, 0, 0, 0);

      // 6개월 뒤 날짜 계산
      const expiredDate = new Date(membershipAt);
      expiredDate.setMonth(expiredDate.getMonth() + 6);

      // 남은 일수 계산
      const timeDifference = expiredDate.getTime() - currentDate.getTime();
      const leftDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      if (leftDays > 0) {
        return {
          subscription: null,
          activate: true,
          leftDays,
          expiresAt: expiredDate.toISOString(),
          createdAt: membershipAt.toISOString(),
          msg: '이벤트 멤버십이 활성화되어 있습니다.',
        };
      }
    }

    const subscription = await db.Purchase.findOne({
      userId,
      isExpired: false,
      'product.type': ProductType.SUBSCRIPTION,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (!subscription) {
      return {
        subscription: null,
        activate: false,
        leftDays: 0,
        expiresAt: null,
        createdAt: null,
        msg: '활성화중인 구독정보가 없습니다.',
      };
    }

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
      createdAt: subscription.createdAt,
      msg: activate ? '활성화중인 구독정보를 조회하였습니다.' : '구독 기간이 만료되었습니다.',
    };
  }
}

export const subscriptionQueryService = SubscriptionQueryService.getInstance();
