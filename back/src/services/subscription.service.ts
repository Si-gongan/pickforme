const { POINTS } = require('constants');
import { Receipt } from 'in-app-purchase';
import db from 'models';
import { ProductType } from 'models/product';
import { IPurchase, IPurchaseMethods } from 'models/purchase/types';
import mongoose from 'mongoose';
import iapValidator from 'utils/iap';
import { log, LogContext, LogSeverity } from 'utils/logger';

class SubscriptionService {
  private static instance: SubscriptionService;

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
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

  public async createSubscription(userId: string, productId: string, receipt: Receipt) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await db.User.findById(userId);
      if (!user) {
        throw new Error('유저정보가 없습니다.');
      }

      const subscriptionStatus = await this.getSubscriptionStatus(userId);
      if (subscriptionStatus.activate) {
        throw new Error('이미 구독중입니다.');
      }

      const product = await db.Product.findById(productId);
      if (!product || product.type !== ProductType.SUBSCRIPTION) {
        throw new Error('존재하지 않는 구독 상품입니다.');
      }

      // 결제 검증
      const purchase = await iapValidator.validate(receipt, product.productId);
      if (!purchase) {
        throw new Error('결제가 정상적으로 처리되지 않았습니다.');
      }

      const purchaseData = await db.Purchase.create([{
        userId,
        product,
        purchase,
        receipt,
        isExpired: false,
      }], { session });

      await user.applyPurchaseRewards(product.getRewards(), session);

      await session.commitTransaction();
      
      return purchaseData[0]
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
        msg: "유저정보가 없습니다.",
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
          msg: '이벤트 멤버십이 활성화되어 있습니다.',
        };
      }
    }

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

  public async checkRefundEligibility(userId: string) {
    const user = await db.User.findById(userId);
    if (!user) {
      return {
        isRefundable: false,
        msg: '유저 정보가 없습니다.',
      };
    }

    const subscription = await db.Purchase.findOne({
      userId,
      isExpired: false,
      'product.type': ProductType.SUBSCRIPTION,
    }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      return {
        isRefundable: false,
        msg: '환불 가능한 구독 정보가 없습니다.',
      };
    }

    const membershipProduct = subscription.product;
    const { DEFAULT_AI_POINT, DEFAULT_POINT } = POINTS;
    
    if (user.aiPoint < membershipProduct.aiPoint - DEFAULT_AI_POINT || user.point < membershipProduct.point - DEFAULT_POINT) {
      return {
        isRefundable: false,
        msg: '구독 후 서비스 이용 고객으로 구독 환불 불가 대상입니다.',
      };
    }

    return {
      isRefundable: true,
      msg: '환불이 가능한 구독입니다.',
    };
  }

  public async processRefund(userId: string, subscriptionId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 환불 가능 여부 재확인
      const refundableStatus = await this.checkRefundEligibility(userId);
      if (!refundableStatus.isRefundable) {
        throw new Error(refundableStatus.msg);
      }

      // 구독 정보 조회
      const subscription = await db.Purchase.findOne(
        { _id: subscriptionId },
        null,
        { session }
      );

      if (!subscription) {
        throw new Error('구독 정보를 찾을 수 없습니다.');
      }

      // 구독 만료 처리 (포인트 초기화 포함)
      await this.expireSubscription(subscription, session);

      await session.commitTransaction();
      
      return {
        msg: '구독 환불을 완료하였습니다.',
        refundSuccess: true,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  public async expireSubscription(
    subscription: (mongoose.Document<unknown, {}, IPurchase> & Omit<IPurchase & {
      _id: mongoose.Types.ObjectId;
  }, "updateExpiration"> & IPurchaseMethods),
    session?: mongoose.ClientSession
  ) {
    const options = session ? { session } : {};
    
    await subscription.updateExpiration(options);
    
    const user = await db.User.findById(subscription.userId);
    if (user) {
      await user.processExpiredMembership(options);
    }

    return subscription;
  }
}

export const subscriptionService = SubscriptionService.getInstance();