import db from 'models';
import mongoose from 'mongoose';
import schedule from 'node-schedule';
import { registerEventScheduler } from '../events';
import { registerIAPScheduler } from '../iap';
import { registerMembershipScheduler } from '../membership';
import iapValidator from 'utils/iap';

jest.mock('utils/iap', () => {
    const mockValidate = jest.fn();
    return {
      __esModule: true,
      default: {
        validate: mockValidate,
      },
    };
  });

const RealDate = Date
const testDate = "2023-02-01T00:00:00+09:00"

describe('Scheduler Integration Tests', () => {
  // DB 초기화
  beforeEach(async () => {
    jest.clearAllMocks();

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

  // 각 테스트 후 스케줄러 정리
  afterEach(() => {
    jest.restoreAllMocks();

    Object.values(schedule.scheduledJobs).forEach((job) => {
      job.cancel();
    });
  });

  afterAll(async () => {
    global.Date = RealDate;
    await mongoose.connection.close();
  });

  describe('IAP Scheduler Integration', () => {
    it('활성화된 구독권의 transactionId가 iap 검증 이후의 transactionId와 다를때는 포인트를 갱신해준다.', async () => {
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
      
        await db.Purchase.create({
          userId: user._id,
          productId: product._id,
          receipt: 'test_receipt',
          isExpired: false,
          createdAt: new Date('2022-12-31T15:00:00.000Z'),
          // ⚠️ product.productId 일부러 생략
          product: {
            type: 1,
            displayName: '테스트 구독',
            point: 100,
            aiPoint: 1000,
            platform: 'ios',
            productId: 'test_subscription',
          },
          purchase: {
            transactionId: 'abc-123', 
            // transactionId: null
          },
        });
      
        // 모킹된 validate 결과: 새로운 transactionId (변경 발생 조건)
        (iapValidator.validate as jest.Mock).mockResolvedValue({
          productId: 'test_subscription',
          transactionId: 'def-456',
        });
      
        registerIAPScheduler();
      
        const jobs = Object.values(schedule.scheduledJobs);
        const midnightJobs = jobs.filter(job => job?.nextInvocation()?.toISOString().includes('T15:00:00'));
      
        expect(midnightJobs.length).toBeGreaterThan(0);
        await midnightJobs[0].invoke();
      
        const updatedUser = await db.User.findById(user._id);
      
        expect(updatedUser?.point).toBe(100);
        expect(updatedUser?.aiPoint).toBe(1000);
    });
    it('환불 처리가 된 구독권의 경우 자정에 스케줄러가 실행되면 만료 처리된다.', async () => {
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
        product: { type: 1, displayName: '테스트 구독', productId: 'test_subscription', point: 100, aiPoint: 1000, platform: 'ios' },
      });

      (iapValidator.validate as jest.Mock).mockResolvedValue(null)

      registerIAPScheduler();

      const jobs = Object.values(schedule.scheduledJobs);
      const midnightJobs = jobs.filter(job => job?.nextInvocation()?.toISOString().includes('T15:00:00'));

      expect(midnightJobs.length).toBeGreaterThan(0);
      await midnightJobs[0].invoke();

      const updatedUser = await db.User.findById(user._id);
      const updatedPurchase = await db.Purchase.findById(purchase._id);

      expect(updatedUser?.point).toBe(0);
      expect(updatedUser?.aiPoint).toBe(0);
      expect(updatedPurchase?.isExpired).toBe(true);
    });
  });

  describe('Membership Scheduler Integration', () => {
    it('한달이 지난 멤버쉽이 다음 스케줄러가 자정에 실행될 때 제대로 만료가 된다.', async () => {
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
        product: { type: 1, displayName: '테스트 멤버십', productId: 'test_membership', point: 100, aiPoint: 1000, platform: 'ios' },
      });

      registerMembershipScheduler();

      const jobs = Object.values(schedule.scheduledJobs);
      
      const midnightJobs = jobs.filter(job => job?.nextInvocation()?.toISOString().includes('T15:00:00'));

      expect(midnightJobs.length).toBeGreaterThan(0);
      await midnightJobs[0].invoke();

      const updatedUser = await db.User.findById(user._id);
      const updatedPurchase = await db.Purchase.findById(purchase._id);

      expect(updatedUser?.point).toBe(0);
      expect(updatedUser?.aiPoint).toBe(15); // 초기화된 aiPoint
      expect(updatedPurchase?.isExpired).toBe(true);
    });

    it('멤버쉽이 한달이 지나지 않았다면 스케줄러가 실행이 되어도 만료가 되지 않는다.', async () => {
        const user = await db.User.create({
            email: 'test@example.com',
            point: 100,
            aiPoint: 1000,
            MembershipAt: new Date('2023-01-02T15:00:00.000Z'),
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
            product: { type: 1, displayName: '테스트 멤버십', productId: 'test_membership', point: 100, aiPoint: 1000, platform: 'ios' },
          });
    
          registerMembershipScheduler();
    
          const jobs = Object.values(schedule.scheduledJobs);
          
          const midnightJobs = jobs.filter(job => job?.nextInvocation()?.toISOString().includes('T15:00:00'));
    
          expect(midnightJobs.length).toBeGreaterThan(0);
          await midnightJobs[0].invoke();
    
          const updatedUser = await db.User.findById(user._id);
          const updatedPurchase = await db.Purchase.findById(purchase._id);
    
          expect(updatedUser?.point).toBe(100);
          expect(updatedUser?.aiPoint).toBe(1000); 
          expect(updatedPurchase?.isExpired).toBe(false);
    })
  });

  describe('Event Scheduler Integration', () => {

    it('6개월이 지난 이벤트 멤버십이 다음 스케줄러 실행 이후 제대로 만료되는지 확인', async () => {
      const user = await db.User.create({
        email: 'test@example.com',
        event: 1,
        MembershipAt: new Date('2022-03-30T15:00:00.000Z'),
        lastMembershipAt: new Date('2022-12-30T15:00:00.000Z'),
        point: 100,
        aiPoint: 1000,
      });

      await db.Product.create({
        productId: 'pickforme_plus',
        type: 1,
        displayName: '픽포미 플러스',
        point: 100,
        aiPoint: 1000,
        platform: 'ios',
        rewards: { point: 100, aiPoint: 1000 },
      });

      registerEventScheduler();

      const jobs = Object.values(schedule.scheduledJobs);
      // 자정에 실행되는 job.
      const midnightJobs = jobs.filter(job => job?.nextInvocation()?.toISOString().includes('T15:00:00'));

      expect(midnightJobs.length).toBeGreaterThan(0);
      await midnightJobs[0].invoke();

      const updatedUser = await db.User.findById(user._id);

      expect(updatedUser?.point).toBe(0);
      expect(updatedUser?.aiPoint).toBe(15);
      expect(updatedUser?.lastMembershipAt).toBeDefined();
    });

    it("이벤트 멤버쉽이 6개월이 지나지 않았고, 마지막 지급일로부터 한달이 지났다면 스케줄러가 실행될때, 포인트가 충전된다.", async () => {
        const user = await db.User.create({
            email: 'test@example.com',
            event: 1,
            MembershipAt: new Date('2022-12-29T15:00:00.000Z'),
            lastMembershipAt: new Date('2022-12-29T15:00:00.000Z'),
            point:0,
            aiPoint:0
          });
    
          await db.Product.create({
            productId: 'pickforme_plus',
            type: 1,
            displayName: '픽포미 플러스',
            point: 100,
            aiPoint: 1000,
            platform: 'ios',
          });
    
          registerEventScheduler();
    
          const jobs = Object.values(schedule.scheduledJobs);
          // 자정에 실행되는 job.
          const midnightJobs = jobs.filter(job => job?.nextInvocation()?.toISOString().includes('T15:00:00'));
    
          expect(midnightJobs.length).toBeGreaterThan(0);
          await midnightJobs[0].invoke();
    
          const updatedUser = await db.User.findById(user._id);
    
          expect(updatedUser?.point).toBe(100);
          expect(updatedUser?.aiPoint).toBe(1000);
          expect(updatedUser?.lastMembershipAt).toBeDefined();
    })

    it("이벤트 멤버쉽이 6개월이 지나지 않았고, 마지막 지급일로부터 한달이 지나지 않았다면 스케줄러가 실행될때, 포인트가 충전되지 않는다.", async () => {
        const user = await db.User.create({
          email: 'test@example.com',
          event: 1,
          MembershipAt: new Date('2022-12-29T15:00:00.000Z'), // 6개월 안 지남
          lastMembershipAt: new Date('2023-01-10T15:00:00.000Z'), // 한달 안 지남
          point: 0,
          aiPoint: 0
        });
      
        await db.Product.create({
          productId: 'pickforme_plus',
          type: 1,
          displayName: '픽포미 플러스',
          point: 100,
          aiPoint: 1000,
          platform: 'ios',
          rewards: { point: 100, aiPoint: 1000 },
        });
      
        registerEventScheduler();
      
        const jobs = Object.values(schedule.scheduledJobs);
        const midnightJobs = jobs.filter(job => job?.nextInvocation()?.toISOString().includes('T15:00:00'));
      
        expect(midnightJobs.length).toBeGreaterThan(0);
        await midnightJobs[0].invoke();
      
        const updatedUser = await db.User.findById(user._id);
      
        expect(updatedUser?.point).toBe(0); // 포인트 지급 X
        expect(updatedUser?.aiPoint).toBe(0); // AI 포인트 지급 X
        expect(updatedUser?.lastMembershipAt?.toISOString()).toBe('2023-01-10T15:00:00.000Z'); // 변경되지 않음
      });
      
  });
});
