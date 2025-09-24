import db from 'models';
import { ProductType } from 'models/product';
import mongoose from 'mongoose';
import iapValidator from 'utils/iap';
import { setupTestDB, teardownTestDB } from '../../__tests__/setupDButils';
import { subscriptionService } from '../subscription.service';
import constants from '../../constants';
import { google } from 'googleapis';

const { POINTS } = constants;

// iapValidator 모킹
jest.mock('utils/iap', () => ({
  __esModule: true,
  default: {
    validate: jest.fn(),
  },
}));

// Google Play API 모킹
jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn().mockImplementation(() => ({
        getClient: jest.fn().mockResolvedValue({}),
      })),
    },
    androidpublisher: jest.fn().mockReturnValue({
      purchases: {
        subscriptionsv2: {
          get: jest.fn(),
        },
      },
    }),
  },
}));

let mockIosValidator: jest.Mock;
let mockAndroidAPI: jest.Mock;

const androidSuccessResponse = {
  data: {
    kind: 'androidpublisher#subscriptionPurchaseV2',
    startTime: '2025-06-13T11:07:49.668Z',
    regionCode: 'KR',
    subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
    latestOrderId: 'GPA.3395-8216-6259-15171',
    testPurchase: {},
    acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
    lineItems: [
      {
        productId: 'pickforme_member',
        expiryTime: '2025-06-13T11:12:49.198Z',
        prepaidPlan: {},
        offerDetails: [Object],
        latestSuccessfulOrderId: 'GPA.3395-8216-6259-15171',
      },
    ],
  },
};

const androidExpiredResponse = {
  data: {
    kind: 'androidpublisher#subscriptionPurchaseV2',
    subscriptionState: 'SUBSCRIPTION_STATE_EXPIRED',
    lineItems: [
      {
        productId: 'pickforme_member',
        expiryTime: '2025-06-13T11:12:49.198Z',
        prepaidPlan: {},
        offerDetails: [Object],
        latestSuccessfulOrderId: 'GPA.3395-8216-6259-15171',
      },
    ],
  },
};

const iosSuccessResponse = {};

const mockIosReceipt =
  'MIIUUAYJKoZIhvcNAQcCoIIUQTCCFD0CAQExDzANBglghkgBZQMEAgEFADCCA4YGCSqGSIb3DQEHAaCCA3cEggNzMYIDbzAKAgEIAgEBBAIWADAKAgEUAgEBBAIMADALAgEBAgEBBAMCAQAwCwIBAwIBAQQDDAExMAsCAQsCAQEEAwIBADALAgEPAgEBBAMCAQAwCwIBEAIBAQQDAgEAMAsCARkCAQEEAwIBAzAMAgEKAgEBBAQWAjQrMAwCAQ4CAQEEBAICARcwDQIBDQIBAQQFAgMCmT0wDQIBEwIBAQQFDAMxLjAwDgIBCQIBAQQGAgRQMzAyMBgCAQQCAQI';

const mockAndroidReceipt = {
  subscription: true,
  orderId: 'GPA.3395-8216-6259-15171',
  packageName: 'com.sigonggan.pickforme',
  productId: 'pickforme_member',
  purchaseTime: 1749812869198,
  purchaseState: 0,
  purchaseToken:
    'eghpddpfamghbkhjdpamindo.AO-J1OydX_KhpD0rR67CfI2A6DHmLXXCpM9eE9m4J3En29vvvmGjGmZdmoX-ThjrWH9g3U4xXbkgUh_qu7GBykAdxVWRnTspCgjgpcmX20V30W8Nc2G39fg',
  quantity: 1,
  autoRenewing: false,
  acknowledged: false,
};

const createTestProduct = async (productId: string, platform: string) => {
  return db.Product.create({
    productId,
    type: ProductType.SUBSCRIPTION,
    displayName: '테스트 구독',
    point: 100,
    aiPoint: 1000,
    platform: 'ios',
  });
};

const RealDate = Date;
const testDate = '2023-02-01T00:00:00+09:00';

describe('Subscription Service Integration Tests', () => {
  beforeEach(async () => {
    await db.User.deleteMany({});
    await db.Purchase.deleteMany({});
    await db.Product.deleteMany({});
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockIosValidator = iapValidator.validate as jest.Mock;
    mockAndroidAPI = google.androidpublisher({
      version: 'v3',
    }).purchases.subscriptionsv2.get as jest.Mock;
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

    jest.spyOn(Date, 'now').mockImplementation(() => new RealDate(testDate).getTime());

    await setupTestDB();
  });

  afterAll(async () => {
    global.Date = RealDate;
    await teardownTestDB();
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

    it('이벤트 멤버십이 활성화된 유저는 구독 상태가 활성화된다', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        event: 1,
        MembershipAt: new Date('2023-01-15T00:00:00+09:00'),
      });

      // When
      const result = await subscriptionService.getSubscriptionStatus(user._id);

      // Then
      expect(result.activate).toBe(true);
      expect(result.leftDays).toBeGreaterThan(0);
      expect(result.expiresAt).toBeDefined();
      expect(result.msg).toBe('이벤트 멤버십이 활성화되어 있습니다.');
    });

    it('이벤트 멤버십이 만료된 유저는 구독 상태가 비활성화된다', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        event: 1,
        MembershipAt: new Date('2022-07-15T00:00:00+09:00'), // 6개월 이상 지난 날짜
      });

      // When
      const result = await subscriptionService.getSubscriptionStatus(user._id);

      // Then
      expect(result.activate).toBe(false);
      expect(result.leftDays).toBe(0);
      expect(result.expiresAt).toBeDefined();
      expect(result.msg).toBe('활성화중인 구독정보가 없습니다.');
    });

    it('이벤트 멤버십이 만료된 유저는 일반 구독 상태를 확인하고 구독이 있으면 활성화된 정보를 전달한다.', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        event: 1,
        MembershipAt: new Date('2022-07-15T00:00:00+09:00'), // 6개월 이상 지난 날짜
      });
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
        createdAt: new Date('2023-01-15T15:00:00.000Z'),
        product: { ...product.toObject() },
      });

      // When
      const result = await subscriptionService.getSubscriptionStatus(user._id);

      // Then
      expect(result.activate).toBe(true);
      expect(result.leftDays).toBeGreaterThan(0);
      expect(result.expiresAt).toBeDefined();
      expect(result.msg).toBe('활성화중인 구독정보를 조회하였습니다.');
    });
  });

  describe('createSubscription', () => {
    it('iOS 구독을 성공적으로 생성한다', async () => {
      mockIosValidator.mockResolvedValue(iosSuccessResponse);

      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      // When
      const result = await subscriptionService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        mockIosReceipt
      );

      expect(result).toBeDefined();
      expect(result.userId.toString()).toBe(user._id.toString());
      expect(result.product.productId).toBe(product.productId);
      expect(result.isExpired).toBe(false);

      // 포인트가 정상적으로 지급되었는지 확인
      const updatedUser = await db.User.findById(user._id);
      expect(updatedUser?.point).toBe(100);
      expect(updatedUser?.aiPoint).toBe(1000);
      expect(updatedUser?.lastMembershipAt).toEqual(new Date(testDate));
      expect(updatedUser?.MembershipAt).toEqual(new Date(testDate));
    });

    it('IOS에서 이미 구독이 만료된 영수증을 제출하면 구독이 생성되지 않는다.', async () => {
      mockIosValidator.mockResolvedValue(null);

      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await createTestProduct('test_subscription', 'ios');

      await expect(
        subscriptionService.createSubscription(
          user._id.toString(),
          product._id.toString(),
          mockIosReceipt
        )
      ).rejects.toThrow('이미 만료되었거나 존재하지 않는 구독입니다.');
    });

    it('IOS에서 유효하지 않은 영수증을 제출하면 구독이 생성되지 않는다.', async () => {
      mockIosValidator.mockRejectedValue(new Error('유효하지 않은 영수증입니다.'));

      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await createTestProduct('test_subscription', 'ios');
      await expect(
        subscriptionService.createSubscription(
          user._id.toString(),
          product._id.toString(),
          mockIosReceipt
        )
      ).rejects.toThrow('유효하지 않은 영수증입니다.');
    });

    it('Android 구독을 성공적으로 생성한다', async () => {
      mockAndroidAPI.mockResolvedValue(androidSuccessResponse);

      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'pickforme_member',
        type: ProductType.SUBSCRIPTION,
        displayName: '픽포미 플러스',
        point: 30,
        aiPoint: 99999,
        platform: 'android',
      });

      // When
      const result = await subscriptionService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        mockAndroidReceipt
      );

      // Then
      expect(result).toBeDefined();
      expect(result.userId.toString()).toBe(user._id.toString());
      expect(result.product.productId).toBe(product.productId);
      expect(result.isExpired).toBe(false);
      expect(result.purchase.platform).toBe('android');
      expect(result.purchase.verifiedBy).toBe('google-api');

      // 포인트가 정상적으로 지급되었는지 확인
      const updatedUser = await db.User.findById(user._id);
      expect(updatedUser?.point).toBe(30);
      expect(updatedUser?.aiPoint).toBe(99999);
    });

    it('Android에서 이미 구독이 만료된 영수증을 제출하면 구독이 생성되지 않는다.', async () => {
      mockAndroidAPI.mockResolvedValue(androidExpiredResponse);

      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await createTestProduct('pickforme_member', 'android');

      await expect(
        subscriptionService.createSubscription(
          user._id.toString(),
          product._id.toString(),
          mockAndroidReceipt
        )
      ).rejects.toThrow('이미 만료되었거나 존재하지 않는 구독입니다.');
    });

    it('Android에서 유효하지 않은 영수증을 제출하면 구독이 생성되지 않는다.', async () => {
      mockAndroidAPI.mockRejectedValue(new Error('유효하지 않은 영수증입니다.'));

      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await createTestProduct('pickforme_member', 'android');

      await expect(
        subscriptionService.createSubscription(
          user._id.toString(),
          product._id.toString(),
          mockAndroidReceipt
        )
      ).rejects.toThrow('유효하지 않은 영수증입니다.');
    });

    it('존재하지 않는 유저의 경우 에러를 발생시킨다', async () => {
      // Given
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      // When & Then
      await expect(
        subscriptionService.createSubscription(
          new mongoose.Types.ObjectId().toString(),
          product._id.toString(),
          mockIosReceipt
        )
      ).rejects.toThrow('유저정보가 없습니다.');
    });

    it('이미 구독중인 경우 에러를 발생시킨다', async () => {
      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      // 기존 구독 생성
      await db.Purchase.create({
        userId: user._id,
        productId: product._id,
        isExpired: false,
        createdAt: new Date(),
        product: { ...product.toObject() },
      });

      // When & Then
      await expect(
        subscriptionService.createSubscription(
          user._id.toString(),
          product._id.toString(),
          mockIosReceipt
        )
      ).rejects.toThrow('이미 구독중입니다.');
    });

    it('존재하지 않는 상품의 경우 에러를 발생시킨다', async () => {
      // Given
      const user = await db.User.create({ email: 'test@example.com' });

      // When & Then
      await expect(
        subscriptionService.createSubscription(
          user._id.toString(),
          new mongoose.Types.ObjectId().toString(),
          mockIosReceipt
        )
      ).rejects.toThrow('존재하지 않는 구독 상품입니다.');
    });

    it('결제 검증 실패시 에러를 발생시키고 트랜잭션이 롤백된다', async () => {
      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      //
      (iapValidator.validate as jest.Mock).mockResolvedValue(null);

      // When & Then
      await expect(
        subscriptionService.createSubscription(
          user._id.toString(),
          product._id.toString(),
          mockIosReceipt
        )
      ).rejects.toThrow();

      // 트랜잭션이 롤백되었는지 확인
      const purchase = await db.Purchase.findOne({ userId: user._id });
      expect(purchase).toBeNull();

      const updatedUser = await db.User.findById(user._id);
      expect(updatedUser?.point).toBe(0);
      expect(updatedUser?.aiPoint).toBe(0);
    });
  });

  describe('createSubscriptionWithoutValidation', () => {
    it('iOS receipt가 있는 경우 구독이 성공적으로 생성되고 iOS 플랫폼으로 설정된다', async () => {
      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      const iosReceipt =
        'MIIUUAYJKoZIhvcNAQcCoIIUQTCCFD0CAQExDzANBglghkgBZQMEAgEFADCCA4YGCSqGSIb3DQEHAaCCA3cEggNzMYIDbzAKAgEIAgEBBAIWADAKAgEUAgEBBAIMADALAgEBAgEBBAMCAQAwCwIBAwIBAQQDDAExMAsCAQsCAQEEAwIBADALAgEPAgEBBAMCAQAwCwIBEAIBAQQDAgEAMAsCARkCAQEEAwIBAzAMAgEKAgEBBAQWAjQrMAwCAQ4CAQEEBAICARcwDQIBDQIBAQQFAgMCmT0wDQIBEwIBAQQFDAMxLjAwDgIBCQIBAQQGAgRQMzAyMBgCAQQCAQI';

      // When
      const result = await subscriptionService.createSubscriptionWithoutValidation(
        user._id.toString(),
        product._id.toString(),
        iosReceipt
      );

      // Then
      expect(result.purchase.platform).toBe('ios');
    });

    it('Android receipt가 있는 경우 구독이 성공적으로 생성되고 Android 플랫폼으로 설정된다', async () => {
      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'android',
      });

      // When
      const result = await subscriptionService.createSubscriptionWithoutValidation(
        user._id.toString(),
        product._id.toString(),
        mockAndroidReceipt
      );

      // Then
      expect(result.purchase.platform).toBe('android');
    });

    it('영수증이 없는 경우 기본 플랫폼으로 설정되고 어드민 구독이 생성된다', async () => {
      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      // When - receipt를 undefined로 명시적으로 전달
      const result = await subscriptionService.createSubscriptionWithoutValidation(
        user._id.toString(),
        product._id.toString(),
        undefined
      );

      // Then
      expect(result).toBeDefined();
      expect(result.userId.toString()).toBe(user._id.toString());
      expect(result.product.productId).toBe(product.productId);
      expect(result.isExpired).toBe(false);
      expect(result.purchase.createdByAdmin).toBe(true);
      expect(result.purchase.verifiedBy).toBe('admin');

      // receipt가 undefined일 때는 'android'로 설정됨
      expect(result.purchase.platform).toBe('android');
      expect(result.purchase.transactionId).toMatch(/^admin_\d+$/);
      expect(result.purchase.verificationNote).toBe('어드민에서 멤버쉽 지급');
      expect(result.receipt).toBeNull(); // receipt 필드는 null로 저장됨

      // 포인트가 정상적으로 지급되었는지 확인
      const updatedUser = await db.User.findById(user._id);
      expect(updatedUser?.point).toBe(100);
      expect(updatedUser?.aiPoint).toBe(1000);
    });

    it('존재하지 않는 유저의 경우 에러를 발생시킨다', async () => {
      // Given
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      // When & Then
      await expect(
        subscriptionService.createSubscriptionWithoutValidation(
          new mongoose.Types.ObjectId().toString(),
          product._id.toString()
        )
      ).rejects.toThrow('유저정보가 없습니다.');
    });

    it('이미 구독중인 경우 에러를 발생시킨다', async () => {
      mockAndroidAPI.mockResolvedValue(androidSuccessResponse);
      mockIosValidator.mockResolvedValue(iosSuccessResponse);

      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      // 기존 구독 생성
      await subscriptionService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        mockIosReceipt
      );

      // 또 구독을 생성할때,
      await expect(
        subscriptionService.createSubscriptionWithoutValidation(
          user._id.toString(),
          product._id.toString()
        )
      ).rejects.toThrow('이미 구독중입니다.');
    });

    it('존재하지 않는 상품의 경우 에러를 발생시킨다', async () => {
      // Given
      const user = await db.User.create({ email: 'test@example.com' });

      // When & Then
      await expect(
        subscriptionService.createSubscriptionWithoutValidation(
          user._id.toString(),
          new mongoose.Types.ObjectId().toString()
        )
      ).rejects.toThrow('존재하지 않는 구독 상품입니다.');
    });
  });

  describe('expireSubscription', () => {
    it('구독을 성공적으로 만료 처리한다', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        point: 100,
        aiPoint: 1000,
      });
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
        createdAt: new Date(),
        product: { ...product.toObject() },
      });

      // When
      const result = await subscriptionService.expireSubscription(purchase);

      // Then
      expect(result.isExpired).toBe(true);

      // 유저 포인트가 초기화되었는지 확인
      const updatedUser = await db.User.findById(user._id);
      expect(updatedUser?.point).toBe(POINTS.DEFAULT_POINT);
      expect(updatedUser?.aiPoint).toBe(POINTS.DEFAULT_AI_POINT);
    });

    it('트랜잭션 내에서 구독 만료 처리가 성공한다', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        point: 100,
        aiPoint: 1000,
      });
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
        createdAt: new Date(),
        product: { ...product.toObject() },
      });

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // When
        const result = await subscriptionService.expireSubscription(purchase, session);
        await session.commitTransaction();

        // Then
        expect(result.isExpired).toBe(true);

        // 유저 포인트가 초기화되었는지 확인
        const updatedUser = await db.User.findById(user._id);
        expect(updatedUser?.point).toBe(POINTS.DEFAULT_POINT);
        expect(updatedUser?.aiPoint).toBe(POINTS.DEFAULT_AI_POINT);
      } finally {
        void session.endSession();
      }
    });

    it('트랜잭션 내에서 에러 발생 시 롤백된다', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        point: 100,
        aiPoint: 1000,
      });
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
        createdAt: new Date(),
        product: { ...product.toObject() },
      });

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // When
        await subscriptionService.expireSubscription(purchase, session);
        throw new Error('테스트 에러');
      } catch (error) {
        await session.abortTransaction();

        // Then
        const updatedPurchase = await db.Purchase.findById(purchase._id);
        expect(updatedPurchase?.isExpired).toBe(false);

        const updatedUser = await db.User.findById(user._id);
        expect(updatedUser?.point).toBe(100);
        expect(updatedUser?.aiPoint).toBe(1000);
      } finally {
        void session.endSession();
      }
    });

    it('이미 만료된 구독을 만료 처리해도 에러가 발생하지 않는다', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        point: 100,
        aiPoint: 1000,
      });
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
        isExpired: true,
        createdAt: new Date(),
        product: { ...product.toObject() },
      });

      // When
      const result = await subscriptionService.expireSubscription(purchase);

      // Then
      expect(result.isExpired).toBe(true);

      // 유저 포인트가 초기화되었는지 확인
      const updatedUser = await db.User.findById(user._id);
      expect(updatedUser?.point).toBe(POINTS.DEFAULT_POINT);
      expect(updatedUser?.aiPoint).toBe(POINTS.DEFAULT_AI_POINT);
    });
  });

  describe('checkRefundEligibility', () => {
    it('유저가 없는 경우 환불 불가능하다', async () => {
      // When
      const result = await subscriptionService.checkRefundEligibility(
        new mongoose.Types.ObjectId().toString()
      );

      // Then
      expect(result.isRefundable).toBe(false);
      expect(result.msg).toBe('유저 정보가 없습니다.');
    });

    it('활성화된 구독이 없는 경우 환불 불가능하다', async () => {
      // Given
      const user = await db.User.create({ email: 'test@example.com' });

      // When
      const result = await subscriptionService.checkRefundEligibility(user._id.toString());

      // Then
      expect(result.isRefundable).toBe(false);
      expect(result.msg).toBe('환불 가능한 구독 정보가 없습니다.');
    });

    it('서비스를 이용한 경우 환불 불가능하다', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        point: 0,
        aiPoint: 0,
      });
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
        createdAt: new Date(),
        product: { ...product.toObject() },
      });

      // When
      const result = await subscriptionService.checkRefundEligibility(user._id.toString());

      // Then
      expect(result.isRefundable).toBe(false);
      expect(result.msg).toBe('구독 후 서비스 이용 고객으로 구독 환불 불가 대상입니다.');
    });

    it('서비스를 이용하지 않은 경우 환불 가능하다', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        point: POINTS.DEFAULT_POINT,
        aiPoint: POINTS.DEFAULT_AI_POINT,
      });

      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      (iapValidator.validate as jest.Mock).mockResolvedValue({
        purchase: {
          productId: product._id.toString(),
          price: 100,
          currency: 'USD',
        },
      });

      // 구독을 생성한다.
      await subscriptionService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        mockIosReceipt
      );

      // When
      const result = await subscriptionService.checkRefundEligibility(user._id.toString());

      // Then
      expect(result.isRefundable).toBe(true);
    });
  });

  describe('processRefund', () => {
    it('환불 가능한 구독을 성공적으로 환불 처리한다', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        point: POINTS.DEFAULT_POINT,
        aiPoint: POINTS.DEFAULT_AI_POINT,
      });

      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      (iapValidator.validate as jest.Mock).mockResolvedValue({
        purchase: {
          productId: product._id.toString(),
          price: 100,
          currency: 'USD',
        },
      });

      // 구독을 생성한다.
      const subscription = await subscriptionService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        {
          transactionDate: new Date(),
          transactionId: 'test_transaction_id',
          productId: product._id.toString(),
          price: 100,
          currency: 'USD',
        }
      );

      // When
      const result = await subscriptionService.processRefund(
        user._id.toString(),
        subscription._id.toString()
      );

      // Then
      expect(result.refundSuccess).toBe(true);
      expect(result.msg).toBe('구독 환불을 완료하였습니다.');

      // 구독이 만료되었는지 확인
      const updatedSubscription = await db.Purchase.findById(subscription._id);
      expect(updatedSubscription?.isExpired).toBe(true);

      // 유저 포인트가 초기화되었는지 확인
      const updatedUser = await db.User.findById(user._id);
      expect(updatedUser?.point).toBe(POINTS.DEFAULT_POINT);
      expect(updatedUser?.aiPoint).toBe(POINTS.DEFAULT_AI_POINT);
    });

    it('유저가 구독 후에 ai 포인트를 일정 이상 사용했다면 환불 처리할 수 없다', async () => {
      // Given
      let user;
      user = await db.User.create({
        email: 'test@example.com',
        point: 0,
        aiPoint: 0,
      });

      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      (iapValidator.validate as jest.Mock).mockResolvedValue({
        purchase: {
          productId: product._id.toString(),
          price: 100,
          currency: 'USD',
        },
      });

      // 구독을 생성한다.
      const subscription = await subscriptionService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        {
          transactionDate: new Date(),
          transactionId: 'test_transaction_id',
          productId: product._id.toString(),
          price: 100,
          currency: 'USD',
        }
      );

      user = await db.User.findById(user._id);

      if (!user) {
        throw new Error('유저 정보가 없습니다.');
      }

      // 그 유저가 기본지급 포인트 이상의 포인트를 사용했다면,
      await user.useAiPoint(20);

      // When & Then
      await expect(
        subscriptionService.processRefund(user._id.toString(), subscription._id.toString())
      ).rejects.toThrow();

      //
      const updatedSubscription = await db.Purchase.findById(subscription._id);
      expect(updatedSubscription?.isExpired).toBe(false);
    });

    it('유저가 구독 후에 포인트를 일정 이상 사용했다면 환불 처리할 수 없다', async () => {
      // Given
      let user;
      user = await db.User.create({
        email: 'test@example.com',
        point: 0,
        aiPoint: 0,
      });

      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      (iapValidator.validate as jest.Mock).mockResolvedValue({
        purchase: {
          productId: product._id.toString(),
          price: 100,
          currency: 'USD',
        },
      });

      // 구독을 생성한다.
      const subscription = await subscriptionService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        {
          transactionDate: new Date(),
          transactionId: 'test_transaction_id',
          productId: product._id.toString(),
          price: 100,
          currency: 'USD',
        }
      );

      user = await db.User.findById(user._id);

      if (!user) {
        throw new Error('유저 정보가 없습니다.');
      }

      // 그 유저가 기본지급 포인트 이상의 포인트를 사용했다면,
      await user.usePoint(20);

      // When & Then
      await expect(
        subscriptionService.processRefund(user._id.toString(), subscription._id.toString())
      ).rejects.toThrow();

      // 구독이 만료되지 않았는지 확인
      const updatedSubscription = await db.Purchase.findById(subscription._id);
      expect(updatedSubscription?.isExpired).toBe(false);
    });

    it('존재하지 않는 구독은 환불 처리할 수 없다', async () => {
      // Given
      const user = await db.User.create({
        email: 'test@example.com',
        point: POINTS.DEFAULT_POINT,
        aiPoint: POINTS.DEFAULT_AI_POINT,
      });

      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      (iapValidator.validate as jest.Mock).mockResolvedValue({
        purchase: {
          productId: product._id.toString(),
          price: 100,
          currency: 'USD',
        },
      });

      // 구독을 생성하지 않는다.
      // const subscription = await subscriptionService.createSubscription(user._id.toString(), product._id.toString(), {
      //   transactionDate: new Date(),
      //   transactionId: 'test_transaction_id',
      //   productId: product._id.toString(),
      //   price: 100,
      //   currency: 'USD',
      // });

      // When & Then
      await expect(
        subscriptionService.processRefund(
          user._id.toString(),
          new mongoose.Types.ObjectId().toString()
        )
      ).rejects.toThrow();
    });
  });

  describe('getSubscriptionProductsByPlatform', () => {
    it('특정 플랫폼의 구독 상품 목록을 조회한다', async () => {
      // Given
      const iosProduct = await db.Product.create({
        productId: 'ios_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: 'iOS 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      const androidProduct = await db.Product.create({
        productId: 'android_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: 'Android 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'android',
      });

      // When
      const iosProducts = await subscriptionService.getSubscriptionProductsByPlatform('ios');
      const androidProducts =
        await subscriptionService.getSubscriptionProductsByPlatform('android');

      // Then
      expect(iosProducts).toHaveLength(1);
      expect(iosProducts[0].productId).toBe('ios_subscription');
      expect(androidProducts).toHaveLength(1);
      expect(androidProducts[0].productId).toBe('android_subscription');
    });

    it('존재하지 않는 플랫폼의 경우 빈 배열을 반환한다', async () => {
      // When
      const products = await subscriptionService.getSubscriptionProductsByPlatform('unknown');

      // Then
      expect(products).toHaveLength(0);
    });
  });

  describe('getUserSubscriptions', () => {
    it('유저의 구독 내역을 생성일자 내림차순으로 조회한다', async () => {
      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      const mockIosReceipt2 = 'df';

      (iapValidator.validate as jest.Mock).mockResolvedValue({
        purchase: {
          productId: product._id.toString(),
          price: 100,
          currency: 'USD',
        },
      });

      const oldSubscription = await subscriptionService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        mockIosReceipt
      );

      // 이전 구독 만료시키기
      await subscriptionService.expireSubscription(oldSubscription);

      // 새로운 구독 생성
      const newSubscription = await subscriptionService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        mockIosReceipt2
      );

      // When
      const subscriptions = await subscriptionService.getUserSubscriptions(user._id.toString());

      // Then
      expect(subscriptions).toHaveLength(2);

      // 왜 내림차순 정렬인데 old가 먼저 나오는 거지..
      // 그건 왜 그런거냐면, 지금 new Date가 항상 동일한 값을 반환하기 때문이다.
      expect(subscriptions[0]._id.toString()).toBe(oldSubscription._id.toString());
      expect(subscriptions[1]._id.toString()).toBe(newSubscription._id.toString());
    });

    it('다른 유저의 구독 내역은 조회되지 않는다', async () => {
      // Given
      const user1 = await db.User.create({ email: 'user1@example.com' });
      const user2 = await db.User.create({ email: 'user2@example.com' });
      const product = await db.Product.create({
        productId: 'test_subscription',
        type: ProductType.SUBSCRIPTION,
        displayName: '테스트 구독',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      (iapValidator.validate as jest.Mock).mockResolvedValue({
        purchase: {
          productId: product._id.toString(),
          price: 100,
          currency: 'USD',
        },
      });

      await subscriptionService.createSubscription(
        user1._id.toString(),
        product._id.toString(),
        mockIosReceipt
      );

      // When
      const subscriptions = await subscriptionService.getUserSubscriptions(user2._id.toString());

      // Then
      expect(subscriptions).toHaveLength(0);
    });

    it('구독이 아닌 상품은 조회되지 않는다', async () => {
      // Given
      const user = await db.User.create({ email: 'test@example.com' });
      const product = await db.Product.create({
        productId: 'test_product',
        type: ProductType.PURCHASE,
        displayName: '테스트 상품',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
      });

      // When
      const subscriptions = await subscriptionService.getUserSubscriptions(user._id.toString());

      // Then
      expect(subscriptions).toHaveLength(0);
    });
  });
});
