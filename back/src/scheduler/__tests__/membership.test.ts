jest.mock('models', () => ({
  User: {
    findById: jest.fn(),
  },
  Purchase: {
    find: jest.fn().mockReturnThis(),
    cursor: jest.fn().mockReturnThis(),
    next: jest.fn(),
  },
}));

jest.mock('models/product', () => ({
  ProductType: { SUBSCRIPTION: 1 },
}));

jest.mock('utils/logger/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('node-schedule', () => ({
  scheduleJob: jest.fn(),
}));

import { registerMembershipScheduler, checkSubscriptionExpirations } from '../membership';
import db from 'models';
import { ProductType } from 'models/product';
import { log } from 'utils/logger/logger';
import { LogContext, LogSeverity } from 'utils/logger/types';
import schedule from 'node-schedule';

// 오늘이 utc 기준 2023-02-02T15:00:00.000Z 시라고 가정.
// 그럼 로컬 시간은 2023-02-03T00:00:00.000Z 일거고,
// 그러면 어떤 멤버쉽을 만료? 
// 2023-01-02T15:00:00.000Z 이전이면 만료. 그러면 만료된 데이터는 2023-01-02T14:00:00.000를 넣어주고,

// 2023-01-02T15:00:00.000Z 이후면 만료 안됨. 만료되지 않은 데이터는 2023-01-02T16:00:00.000를 넣어줘서 각각 테스트 해보자.

describe('Membership Scheduler', () => {

    const RealDate = Date; 
    const mockDate = new RealDate('2023-02-02T15:00:00.000Z');

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(global, 'Date').mockImplementation((...args: [string | number | Date] | []) => {
          if (args.length === 0) {
            return new RealDate(mockDate);
          }
          return new RealDate(...args);
        });
      });
  

  describe('registerMembershipScheduler', () => {
    it('매일 0시에 실행되도록 스케줄러가 등록된다', () => {
      // 스케줄러 등록
      registerMembershipScheduler();

      // 검증
      expect(schedule.scheduleJob).toHaveBeenCalledWith('0 0 0 * * *', checkSubscriptionExpirations);
    });
  });

  describe('checkSubscriptionExpirations', () => {
    it('만료일이 지난 멤버쉽은 만료 처리한다.', async () => {
      // Mock 데이터 설정
      const mockPurchase = {
        _id: 'purchase11232132',
        userId: 'user1',
        createdAt: new Date('2023-01-02T14:00:00.000Z'), 
        isExpired: false,
        product: { type: ProductType.SUBSCRIPTION },
        updateExpiration: jest.fn().mockResolvedValue(undefined),
      };

      const mockUser = {
        _id: 'user1',
        processExpiredMembership: jest.fn().mockResolvedValue(undefined),
      };

      const mockCursor = {
        next: jest.fn()
          .mockResolvedValueOnce(mockPurchase)
          .mockResolvedValueOnce(null),
      };

      
      (db.Purchase as any).find.mockReturnThis();
      (db.Purchase as any).cursor.mockReturnValue(mockCursor);

      (db.User.findById as jest.Mock).mockResolvedValue(mockUser);

      // 스케줄러 콜백 실행
      await checkSubscriptionExpirations();

      // 검증
      expect(mockPurchase.updateExpiration).toHaveBeenCalled();
      expect(mockUser.processExpiredMembership).toHaveBeenCalled();
      expect(log.info).toHaveBeenCalledWith(
        LogContext.SCHEDULER,
        `멤버십 만료 처리 완료 - userId: ${mockUser._id}`,
        LogSeverity.LOW,
        expect.any(Object)
      );
    });

    it('만료일이 아직 한시간 남았다면, 만료되지 않는다.', async () => {
      // Mock 데이터 설정
      const mockPurchase = {
        _id: 'purchase1',
        userId: 'user1',
        createdAt: new Date('2023-01-02T16:00:00.000Z'),
        isExpired: false,
        product: { type: ProductType.SUBSCRIPTION },
        updateExpiration: jest.fn(),
      };

      const mockCursor = {
        next: jest.fn()
          .mockResolvedValueOnce(mockPurchase)
          .mockResolvedValueOnce(null),
      };

      const mockUser = {
        _id: 'user1',
        processExpiredMembership: jest.fn().mockResolvedValue(undefined),
      };

      (db.Purchase as any).find.mockReturnThis();
      (db.Purchase as any).cursor.mockReturnValue(mockCursor);

      // 스케줄러 콜백 실행
      await checkSubscriptionExpirations();

      // 검증
      expect(mockPurchase.updateExpiration).not.toHaveBeenCalled();
      expect(mockUser.processExpiredMembership).not.toHaveBeenCalled();
    });

    it("멤버쉽의 남은 기간이 아주 짧더라도, 만료되지 않는다.", async () => {
      // Mock 데이터 설정
      const mockPurchase = {
        _id: 'purchase1',
        userId: 'user1',
        createdAt: new Date('2023-01-02T15:00:00.001Z'),
        isExpired: false,
        product: { type: ProductType.SUBSCRIPTION },
        updateExpiration: jest.fn(),
      };

      const mockCursor = {
        next: jest.fn() 
          .mockResolvedValueOnce(mockPurchase)
          .mockResolvedValueOnce(null),
      };

      (db.Purchase as any).find.mockReturnThis();
      (db.Purchase as any).cursor.mockReturnValue(mockCursor);  

      // 스케줄러 콜백 실행
      await checkSubscriptionExpirations();

      // 검증
      expect(mockPurchase.updateExpiration).not.toHaveBeenCalled();
    });

    it('에러 발생 시 로깅한다', async () => {
      // Mock 함수에서 에러 발생
      const mockPurchase = {
        _id: 'purchase1',
        userId: 'user1',
        createdAt: new Date('2022-11-01'), 
        isExpired: false,
        product: { type: ProductType.SUBSCRIPTION },
        updateExpiration: jest.fn(),
      };

      const mockCursor = {
        next: jest.fn()
          .mockRejectedValue(new Error('DB 에러')),
      };

      (db.Purchase as any).find.mockReturnThis();
      (db.Purchase as any).cursor.mockReturnValue(mockCursor);

      // 스케줄러 콜백 실행
      await checkSubscriptionExpirations();

      // 검증
      expect(log.error).toHaveBeenCalledWith(
        LogContext.SCHEDULER,
        '멤버십 만료 처리 중 오류 발생',
        LogSeverity.HIGH,
        expect.any(Object)
      );
    });
  });
}); 