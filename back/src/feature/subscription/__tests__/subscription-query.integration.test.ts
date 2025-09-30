import db from 'models';
import { ProductType } from 'models/product';
import iapValidator from 'utils/iap';
import { setupTestDB, teardownTestDB } from '../../../__tests__/setupDButils';
import { subscriptionQueryService } from '../service/subscription-query.service';
import { subscriptionCreationService } from '../service/subscription-creation.service';
import { subscriptionManagementService } from '../service/subscription-management.service';
import constants from '../../../constants';
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

const mockIosReceipt =
  'MIIUUAYJKoZIhvcNAQcCoIIUQTCCFD0CAQExDzANBglghkgBZQMEAgEFADCCA4YGCSqGSIb3DQEHAaCCA3cEggNzMYIDbzAKAgEIAgEBBAIWADAKAgEUAgEBBAIMADALAgEBAgEBBAMCAQAwCwIBAwIBAQQDDAExMAsCAQsCAQEEAwIBADALAgEPAgEBBAMCAQAwCwIBEAIBAQQDAgEAMAsCARkCAQEEAwIBAzAMAgEKAgEBBAQWAjQrMAwCAQ4CAQEEBAICARcwDQIBDQIBAQQFAgMCmT0wDQIBEwIBAQQFDAMxLjAwDgIBCQIBAQQGAgRQMzAyMBgCAQQCAQI';

const RealDate = Date;
const testDate = '2023-02-01T00:00:00+09:00';

describe('SubscriptionQueryService Integration Tests', () => {
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

      const result = await subscriptionQueryService.getSubscriptionStatus(user._id);

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

      const result = await subscriptionQueryService.getSubscriptionStatus(user._id);

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

      const result = await subscriptionQueryService.getSubscriptionStatus(user._id);

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

      const result = await subscriptionQueryService.getSubscriptionStatus(user._id);

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

      const result = await subscriptionQueryService.getSubscriptionStatus(user._id);

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
      const result = await subscriptionQueryService.getSubscriptionStatus(user._id);

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
      const result = await subscriptionQueryService.getSubscriptionStatus(user._id);

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
      const result = await subscriptionQueryService.getSubscriptionStatus(user._id);

      // Then
      expect(result.activate).toBe(true);
      expect(result.leftDays).toBeGreaterThan(0);
      expect(result.expiresAt).toBeDefined();
      expect(result.msg).toBe('활성화중인 구독정보를 조회하였습니다.');
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
      const iosProducts = await subscriptionQueryService.getSubscriptionProductsByPlatform('ios');
      const androidProducts =
        await subscriptionQueryService.getSubscriptionProductsByPlatform('android');

      // Then
      expect(iosProducts).toHaveLength(1);
      expect(iosProducts[0].productId).toBe('ios_subscription');
      expect(androidProducts).toHaveLength(1);
      expect(androidProducts[0].productId).toBe('android_subscription');
    });

    it('존재하지 않는 플랫폼의 경우 빈 배열을 반환한다', async () => {
      // When
      const products = await subscriptionQueryService.getSubscriptionProductsByPlatform('unknown');

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

      const oldSubscription = await subscriptionCreationService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        mockIosReceipt
      );

      // 이전 구독 만료시키기
      await subscriptionManagementService.expireSubscription(oldSubscription);

      // 새로운 구독 생성
      const newSubscription = await subscriptionCreationService.createSubscription(
        user._id.toString(),
        product._id.toString(),
        mockIosReceipt2
      );

      // When
      const subscriptions = await subscriptionQueryService.getUserSubscriptions(
        user._id.toString()
      );

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

      await subscriptionCreationService.createSubscription(
        user1._id.toString(),
        product._id.toString(),
        mockIosReceipt
      );

      // When
      const subscriptions = await subscriptionQueryService.getUserSubscriptions(
        user2._id.toString()
      );

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
      const subscriptions = await subscriptionQueryService.getUserSubscriptions(
        user._id.toString()
      );

      // Then
      expect(subscriptions).toHaveLength(0);
    });
  });
});
