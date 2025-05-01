jest.mock('models', () => ({
  User: {
    find: jest.fn().mockReturnThis(),
    processExpiredMembership: jest.fn(),
    applyPurchaseRewards: jest.fn(),
  },
  Product: {
    find: jest.fn().mockReturnThis(),
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

import { registerEventScheduler, processEventMembership } from '../events';
import db from 'models';
import { ProductType } from 'models/product';
import { log } from 'utils/logger/logger';
import schedule from 'node-schedule';

describe('Event Scheduler', () => {
  const RealDate = Date;
  
  // 오늘 날짜가 2023년 2월 3일 자정 (kst) 이라고 가정.
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

  describe('registerEventScheduler', () => {
    it('매일 0시에 실행되도록 스케줄러가 등록된다', () => {
      registerEventScheduler();
      expect(schedule.scheduleJob).toHaveBeenCalledWith('0 0 0 * * *', processEventMembership);
    });
  });

  describe('한시련 이벤트 처리 체크', () => {
    it('6개월이 지난 이벤트 멤버십은 만료 처리한다', async () => {
      const mockUser = {
        _id: 'user1',
        event: 1,
        // 15:00:00 정확히 6개월이 되도 만료가 됨.
        MembershipAt: new Date('2022-08-02T15:00:00.000Z'),
        lastMembershipAt: new Date('2023-01-02T15:00:00.000Z'),
        processExpiredMembership: jest.fn().mockResolvedValue(undefined),
      };

      const mockProduct = {
        productId: 'pickforme__plus',
        getRewards: jest.fn().mockReturnValue({ point: 100, aiPoint: 1000 }),
      };

      (db.User.find as jest.Mock).mockResolvedValue([mockUser]);
      (db.Product.find as jest.Mock).mockResolvedValue([mockProduct]);

      await processEventMembership();

      expect(mockUser.processExpiredMembership).toHaveBeenCalled();
      expect(log.info).toHaveBeenCalledWith(
        'scheduler',
        expect.stringContaining('이벤트 멤버십 만료 처리 완료'),
        1,
        expect.objectContaining({
          scheduler: 'events',
          userId: mockUser._id,
        })
      );
    });

    it('6개월이 지나지 않고 마지막 지급일로부터 한달이 지난 이벤트 멤버십은 포인트를 충전한다', async () => {
      const mockUser = {
        _id: 'user1',
        event: 1,
        MembershipAt: new Date('2023-01-02T15:00:00.000Z'),
        lastMembershipAt: new Date('2023-01-02T15:00:00.000Z'),
        applyPurchaseRewards: jest.fn().mockResolvedValue(undefined),
      };

      const mockProduct = {
        productId: 'pickforme__plus',
        getRewards: jest.fn().mockReturnValue({ point: 100, aiPoint: 1000 }),
      };

      (db.User.find as jest.Mock).mockResolvedValue([mockUser]);
      (db.Product.find as jest.Mock).mockResolvedValue([mockProduct]);

      await processEventMembership();

      expect(mockUser.applyPurchaseRewards).toHaveBeenCalledWith(mockProduct.getRewards());
      expect(log.info).toHaveBeenCalledWith(
        'scheduler',
        expect.stringContaining('이벤트 멤버십 포인트 충전 완료'),
        1,
        expect.objectContaining({
          scheduler: 'events',
          userId: mockUser._id,
        })
      );
    });

    it('6개월이 지나지 않고 마지막 지급일로부터 한달이 지나지 않은 이벤트 멤버십은 포인트를 충전하지 않는다', async () => {
      const mockUser = {
        _id: 'user1',
        event: 1,
        MembershipAt: new Date('2023-01-02T15:00:00.000Z'), 
        // 현재 날짜는 2023-02-02T15:00:00.000Z 이므로 한달이 지나지 않은 경우임.
        lastMembershipAt: new Date('2023-01-03T15:00:00.000Z'),
        applyPurchaseRewards: jest.fn().mockResolvedValue(undefined),
      };

      const mockProduct = {
        productId: 'pickforme__plus',
        getRewards: jest.fn().mockReturnValue({ point: 100, aiPoint: 1000 }),
      };

      (db.User.find as jest.Mock).mockResolvedValue([mockUser]);
      (db.Product.find as jest.Mock).mockResolvedValue([mockProduct]);

      await processEventMembership();

      expect(mockUser.applyPurchaseRewards).not.toHaveBeenCalled();
      expect(log.info).not.toHaveBeenCalled();
    });

    it('이벤트 처리중 오류가 발생하면 에러를 로깅한다. 심각도는 HIGH(3)', async () => {
      const mockUser = {
        _id: 'user1',
        event: 1,
        MembershipAt: new Date('2023-01-02T15:00:00.000Z'),
        applyPurchaseRewards: jest.fn().mockRejectedValue(new Error('test error')),
        processExpiredMembership: jest.fn().mockRejectedValue(new Error('test error')),
      };

      const mockProduct = {
        productId: 'pickforme__plus',
        getRewards: jest.fn().mockReturnValue({ point: 100, aiPoint: 1000 }),
      };  

      (db.User.find as jest.Mock).mockResolvedValue([mockUser]);  
      (db.Product.find as jest.Mock).mockResolvedValue([mockProduct]);

      await processEventMembership();

      expect(log.error).toHaveBeenCalledWith(
        'scheduler',
        expect.stringContaining('이벤트 멤버십 처리 중 오류 발생'),
        3,
        expect.objectContaining({
          scheduler: 'events',
          error: new Error('test error'),
        })
      );
    });
  });
}); 