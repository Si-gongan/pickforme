import db from 'models';
import mongoose from 'mongoose';
import { ProductType } from 'models/product';
import { subscriptionService } from '../subscription.service';

const RealDate = Date;
const testDate = '2023-02-01T00:00:00+09:00';

describe('Subscription Service Integration Tests', () => {
  beforeEach(async () => {
    await db.User.deleteMany({});
    await db.Purchase.deleteMany({});
    await db.Product.deleteMany({});
  });

  beforeAll(() => {
    global.Date = class extends RealDate {
      constructor(date?: string | number | Date) {
        super();
        if (date === undefined) {
          return new RealDate(testDate);
        }
        return new RealDate(date);
      }
    } as unknown as DateConstructor;
  });

  afterAll(async () => {
    global.Date = RealDate;
    await mongoose.connection.close();
  });

  describe('getSubscriptionStatus', () => {
    it('구독 정보가 없는 경우 null을 반환한다', async () => {
      const user = await db.User.create({ email: 'test@example.com' });
      
      const result = await subscriptionService.getSubscriptionStatus(user._id);
      
      expect(result.subscription).toBeNull();
      expect(result.activate).toBe(false);
      expect(result.leftDays).toBe(0);
      expect(result.expiresAt).toBeNull();
      expect(result.msg).toBe('활성화중인 구독정보가 없습니다.');
    });

    it('만료된 구독 정보는 조회되지 않는다', async () => {
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      await db.Purchase.create({
        userId: user._id,
        productId: product._id,
        isExpired: true,
        createdAt: new Date('2022-12-31T15:00:00.000Z'),
        product: { ...product.toObject() },
      });

      const result = await subscriptionService.getSubscriptionStatus(user._id);
      
      expect(result.subscription).toBeNull();
      expect(result.activate).toBe(false);
      expect(result.leftDays).toBe(0);
      expect(result.expiresAt).toBeNull();
    });

    it('활성화된 구독 정보를 정상적으로 조회한다', async () => {
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      const purchase = await db.Purchase.create({
        userId: user._id,
        productId: product._id,
        isExpired: false,
        createdAt: new Date('2023-01-15T15:00:00.000Z'),
        product: { ...product.toObject() },
      });

      const result = await subscriptionService.getSubscriptionStatus(user._id);
      
      expect(result.subscription).toBeDefined();
      expect(result.subscription?._id.toString()).toBe(purchase._id.toString());
      expect(result.activate).toBe(true);
      expect(result.leftDays).toBeGreaterThan(0);
      expect(result.expiresAt).toBeDefined();
      expect(result.msg).toBe('활성화중인 구독정보를 조회하였습니다.');
    });

    it('만료된 구독 정보는 activate가 false로 반환된다', async () => {
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      await db.Purchase.create({
        userId: user._id,
        productId: product._id,
        isExpired: false,
        createdAt: new Date('2022-12-15T15:00:00.000Z'), // 1달 이상 지난 날짜
        product: { ...product.toObject() },
      });

      const result = await subscriptionService.getSubscriptionStatus(user._id);
      
      expect(result.subscription).toBeDefined();
      expect(result.activate).toBe(false);
      expect(result.leftDays).toBe(0);
      expect(result.msg).toBe('구독 기간이 만료되었습니다.');
    });

    it('여러 구독 정보가 있는 경우 가장 최근 구독 정보를 반환한다', async () => {
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      // 이전 구독
      await db.Purchase.create({
        userId: user._id,
        productId: product._id,
        isExpired: false,
        createdAt: new Date('2023-01-01T15:00:00.000Z'),
        product: { ...product.toObject() },
      });

      // 최근 구독
      const recentPurchase = await db.Purchase.create({
        userId: user._id,
        productId: product._id,
        isExpired: false,
        createdAt: new Date('2023-01-15T15:00:00.000Z'),
        product: { ...product.toObject() },
      });

      const result = await subscriptionService.getSubscriptionStatus(user._id);
      
      expect(result.subscription?._id.toString()).toBe(recentPurchase._id.toString());
      expect(result.activate).toBe(true);
    });
  });
}); 