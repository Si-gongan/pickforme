// scheduler.test.ts
import { setupTestDB, teardownTestDB } from '../../__tests__/setupDButils';
import db from 'models';
import iapValidator from 'utils/iap';
import { handleEventScheduler } from '../events';
import { handleIAPScheduler } from '../iap';
import { handleMembershipScheduler } from '../membership';
import { EVENT_IDS } from '../../constants/events';
import { POINTS } from '../../constants/points';
import { subscriptionService } from 'services/subscription.service';

jest.mock('utils/iap', () => {
  const mockValidate = jest.fn();
  return {
    __esModule: true,
    default: {
      validate: mockValidate,
    },
  };
});

jest.mock('node-cron', () => ({
  schedule: jest.fn((cronTime, callback, options) => {
    console.log(`[Mocked cron] ${cronTime} with tz: ${options?.timezone}`);
  }),
}));

const RealDate = Date;
const testDate = '2023-02-01T00:00:00+09:00';

const createHansiryunEventProduct = async () => {
  return db.Product.create({
    type: 1,
    displayName: '픽포미 한시련 이벤트 멤버쉽',
    productId: 'pickforme_hansiryun_event_membership',
    platform: 'ios',
    point: 30,
    aiPoint: 999,
    eventId: 1,
  });
};

describe('Scheduler Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await db.User.deleteMany({});
    await db.Purchase.deleteMany({});
    await db.Product.deleteMany({});
  });

  beforeAll(async () => {
    global.Date = class extends RealDate {
      constructor(date?: string | number | Date) {
        super();
        if (date === undefined) {
          return new RealDate(testDate);
        }
        return new RealDate(date);
      }
    } as unknown as DateConstructor;

    await setupTestDB();
  });

  afterAll(async () => {
    global.Date = RealDate;
    await teardownTestDB();
  });

  describe('IAP Scheduler Integration', () => {
    // it('transactionId가 다를 경우 포인트 갱신', async () => {
    //   const user = await db.User.create({ email: 'test@example.com', point: 0, aiPoint: 0 });
    //   const product = await db.Product.create({
    //     productId: 'test_subscription',
    //     type: 1,
    //     displayName: '테스트 구독',
    //     point: 100,
    //     aiPoint: 1000,
    //     platform: 'ios',
    //     rewards: { point: 100, aiPoint: 1000 },
    //   });

    //   await db.Purchase.create({
    //     userId: user._id,
    //     productId: product._id,
    //     receipt: 'test_receipt',
    //     isExpired: false,
    //     createdAt: new Date('2022-12-31T15:00:00.000Z'),
    //     product: { ...product.toObject() },
    //     purchase: { transactionId: 'abc-123' },
    //   });

    //   (iapValidator.validate as jest.Mock).mockResolvedValue({
    //     productId: 'test_subscription',
    //     transactionId: 'def-456',
    //   });

    //   await handleIAPScheduler();

    //   const updatedUser = await db.User.findById(user._id);
    //   expect(updatedUser?.point).toBe(100);
    //   expect(updatedUser?.aiPoint).toBe(1000);
    // });

    it('영수증을 검증해서 유효하지 않은 구독은 만료 처리한다.', async () => {
      const user = await db.User.create({ email: 'test@example.com', point: 100, aiPoint: 1000 });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: 1,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
        rewards: { point: 100, aiPoint: 1000 },
      });

      const purchase = await db.Purchase.create({
        userId: user._id,
        productId: product._id,
        receipt: 'test_receipt',
        isExpired: false,
        createdAt: new Date('2022-12-31T15:00:00.000Z'),
        product: { ...product.toObject() },
        purchase: { transactionId: 'other_transaction_id' },
      });

      (iapValidator.validate as jest.Mock).mockResolvedValue(null);

      await handleIAPScheduler();

      const updated = await db.User.findById(user._id);
      const updatedPurchase = await db.Purchase.findById(purchase._id);

      expect(updated?.point).toBe(POINTS.DEFAULT_POINT);
      expect(updated?.aiPoint).toBe(POINTS.DEFAULT_AI_POINT);
      expect(updatedPurchase?.isExpired).toBe(true);
    });

    it('어드민 권한으로 생성된 구독은 영수증을 검증하지 않고 넘어간다. (오류가 나거나, 만료처리되지 않는다.)', async () => {
      const user = await db.User.create({ email: 'test@example.com', point: 0, aiPoint: 0 });

      const product = await db.Product.create({
        productId: 'test_subscription',
        type: 1,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
        rewards: { point: 100, aiPoint: 1000 },
      });

      const purchase = await subscriptionService.createSubscriptionWithoutValidation(
        user._id,
        product._id,
        undefined
      );

      (iapValidator.validate as jest.Mock).mockResolvedValue(null);

      await handleIAPScheduler();

      const updated = await db.User.findById(user._id);
      const updatedPurchase = await db.Purchase.findById(purchase._id);

      expect(updated?.point).toBe(product.point);
      expect(updated?.aiPoint).toBe(product.aiPoint);
      expect(updatedPurchase?.isExpired).toBe(false);
    });
  });

  describe('Membership Scheduler Integration', () => {
    it('한달 지난 멤버십은 만료된다', async () => {
      const user = await db.User.create({
        email: 'test@example.com',
        point: 100,
        aiPoint: 1000,
        MembershipAt: new Date('2022-12-29T15:00:00.000Z'),
      });
      const product = await db.Product.create({
        productId: 'test_membership',
        type: 1,
        displayName: '테스트 멤버십',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });
      const purchase = await db.Purchase.create({
        userId: user._id,
        productId: product._id,
        isExpired: false,
        createdAt: new Date('2022-12-29T15:00:00.000Z'),
        product: { ...product.toObject() },
      });

      await handleMembershipScheduler();

      const updatedUser = await db.User.findById(user._id);
      const updatedPurchase = await db.Purchase.findById(purchase._id);

      expect(updatedUser?.point).toBe(0);
      expect(updatedUser?.aiPoint).toBe(15);
      expect(updatedPurchase?.isExpired).toBe(true);
    });

    it('한달 지나지 않은 멤버십은 유지된다', async () => {
      const user = await db.User.create({
        email: 'test@example.com',
        point: 100,
        aiPoint: 1000,
        MembershipAt: new Date('2023-01-02T15:00:00.000Z'),
        lastMembershipAt: new Date('2023-01-02T15:00:00.000Z'),
      });
      const product = await db.Product.create({
        productId: 'test_membership',
        type: 1,
        displayName: '테스트 멤버십',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });
      const purchase = await db.Purchase.create({
        userId: user._id,
        productId: product._id,
        isExpired: false,
        createdAt: new Date('2023-01-02T15:00:00.000Z'),
        product: { ...product.toObject() },
      });

      await handleMembershipScheduler();

      const updated = await db.User.findById(user._id);
      expect(updated?.point).toBe(100);
      expect(updated?.aiPoint).toBe(1000);
      expect(updated?.MembershipAt).toBeDefined();
    });
  });

  describe('Event Scheduler Integration', () => {
    it('6개월 지난 이벤트는 만료 처리', async () => {
      const user = await db.User.create({
        email: 'test@example.com',
        event: 1,
        point: 100,
        aiPoint: 1000,
        MembershipAt: new Date('2022-03-30T15:00:00.000Z'),
        lastMembershipAt: new Date('2022-12-30T15:00:00.000Z'),
      });
      await createHansiryunEventProduct();

      await handleEventScheduler();

      const updated = await db.User.findById(user._id);
      expect(updated?.point).toBe(0);
      expect(updated?.aiPoint).toBe(15);
      expect(updated?.event).toBe(null);
      expect(updated?.MembershipAt).toBe(null);
      expect(updated?.lastMembershipAt).toBe(null);
    });

    it('1개월 지난 이벤트는 포인트 충전', async () => {
      const user = await db.User.create({
        email: 'test@example.com',
        event: 1,
        point: 0,
        aiPoint: 0,
        MembershipAt: new Date('2022-12-29T15:00:00.000Z'),
        lastMembershipAt: new Date('2022-12-29T15:00:00.000Z'),
      });
      await createHansiryunEventProduct();

      await handleEventScheduler();

      const updated = await db.User.findById(user._id);
      expect(updated?.point).toBe(30);
      expect(updated?.aiPoint).toBe(999);
      expect(updated?.event).toBe(EVENT_IDS.HANSIRYUN);
      expect(updated?.lastMembershipAt).not.toBe(updated?.MembershipAt);
    });

    it('1개월 지나지 않은 이벤트는 충전 안됨', async () => {
      const user = await db.User.create({
        email: 'test@example.com',
        event: 1,
        point: 0,
        aiPoint: 0,
        MembershipAt: new Date('2022-12-29T15:00:00.000Z'),
        lastMembershipAt: new Date('2023-01-10T15:00:00.000Z'),
      });
      await createHansiryunEventProduct();

      await handleEventScheduler();

      const updated = await db.User.findById(user._id);
      expect(updated?.point).toBe(0);
      expect(updated?.aiPoint).toBe(0);
    });

    it('MembershipAt만 들어가 있는 기존 이벤트 유저의 경우 한달이 지나지 않았다면 포인트 충전 안됨', async () => {
      const user = await db.User.create({
        email: 'test@example.com',
        event: 1,
        point: 0,
        aiPoint: 0,
        MembershipAt: new Date('2023-01-04T15:00:00.000Z'),
      });
      await createHansiryunEventProduct();

      await handleEventScheduler();

      const updated = await db.User.findById(user._id);
      expect(updated?.point).toBe(0);
      expect(updated?.aiPoint).toBe(0);
      expect(updated?.MembershipAt).toEqual(new Date('2023-01-04T15:00:00.000Z'));
      expect(updated?.lastMembershipAt).toBe(null);
    });

    it('MembershipAt만 들어가 있는 기존 이벤트 유저의 경우 이벤트 갱신 시에 (한달뒤) MembershipAt은 바뀌지 않고 lastMembershipAt만 바뀐다', async () => {
      const user = await db.User.create({
        email: 'junseok!@#!@#@!#@!@example.com',
        event: 1,
        point: 0,
        aiPoint: 0,
        MembershipAt: new Date('2022-12-29T15:00:00.000Z'),
      });

      await createHansiryunEventProduct();

      await handleEventScheduler();

      const updated = await db.User.findById(user._id);
      expect(updated?.point).toBe(30);
      expect(updated?.aiPoint).toBe(999);
      expect(updated?.event).toBe(EVENT_IDS.HANSIRYUN);
      expect(updated?.MembershipAt).toEqual(new Date('2022-12-29T15:00:00.000Z'));
      expect(updated?.lastMembershipAt).not.toBe(null);
      expect(updated?.lastMembershipAt).not.toEqual(updated?.MembershipAt);
    });
  });
});
