jest.mock('models', () => ({
  Purchase: {
    find: jest.fn().mockReturnThis(),
    cursor: jest.fn().mockReturnThis(),
    next: jest.fn(),
  },
  User: {
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
  Session: {
    findOne: jest.fn(),
  },
  Product: {
    findOne: jest.fn(),
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

jest.mock('socket', () => ({
  emit: jest.fn(),
}));

jest.mock('utils/push', () => ({
  default: jest.fn(),
}));

jest.mock('utils/iap', () => {
  const mockValidate = jest.fn();
  return {
    __esModule: true,
    default: {
      validate: mockValidate,
    },
  };
});

import { registerIAPScheduler, checkSubscriptions } from '../iap';
import db from 'models';
import { log } from 'utils/logger/logger';
import schedule from 'node-schedule';
import iapValidator from 'utils/iap';


describe('IAP Scheduler', () => {
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

  describe('registerIAPScheduler', () => {
    it('매일 0시에 실행되도록 스케줄러가 등록된다', () => {
      registerIAPScheduler();
      expect(schedule.scheduleJob).toHaveBeenCalledWith('0 0 0 * * *', checkSubscriptions);
    });
  });

  describe('checkSubscriptions', () => {
    it('IAP 검증 실패 시 구독을 만료 처리하고 유저 포인트를 초기화한다', async () => {
      const mockPurchase = {
        _id: 'purchase1',
        userId: 'user1',
        receipt: 'receipt1',
        product: { productId: 'product1' },
        purchase: { transactionId: 'old' },
        isExpired: false,
        save: jest.fn().mockResolvedValue(undefined),
        updateExpiration: jest.fn().mockImplementation(function(this: { isExpired: boolean }) {
          this.isExpired = true;
        }),
      };

      (db.Purchase.find as jest.Mock).mockResolvedValue([mockPurchase]);
      (iapValidator.validate as jest.Mock).mockResolvedValue(null);
      (db.User.findOneAndUpdate as jest.Mock).mockResolvedValue(undefined);

      await checkSubscriptions();

      expect(mockPurchase.isExpired).toBe(true);
      expect(mockPurchase.save).toHaveBeenCalled();
      
      // TODO: 이 부분은 추후에 환불 로직 추상화할때 변경 필요.
      expect(db.User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockPurchase.userId },
        { point: 0, aiPoint: 0 }
      );
      expect(log.info).toHaveBeenCalledWith(
        'scheduler',
        expect.stringContaining('구독 만료 처리 완료'),
        1,
        expect.objectContaining({
          scheduler: 'iap',
          userId: mockPurchase.userId,
        })
      );
    });

    it('IAP 검증 성공 시 포인트를 업데이트하고 알림을 전송한다', async () => {
      const mockPurchase = {
        _id: 'purchase1',
        userId: 'user1',
        receipt: 'receipt1',
        product: { productId: 'product1' },
        purchase: { transactionId: 'old' },
        isExpired: false,
        save: jest.fn().mockResolvedValue(undefined),
      };

      const mockUser = {
        _id: 'user1',
        applyPurchaseRewards: jest.fn().mockResolvedValue(undefined),
        point: 100,
        pushToken: 'token1',
      };

      const mockProduct = {
        getRewards: jest.fn().mockReturnValue({ point: 100, aiPoint: 1000 }),
      };

      const mockSession = {
        connectionId: 'socket1',
      };

      (db.Purchase.find as jest.Mock).mockResolvedValue([mockPurchase]);
      (iapValidator.validate as jest.Mock).mockResolvedValue({ transactionId: 'new' });
      (db.User.findById as jest.Mock).mockResolvedValue(mockUser);
      (db.Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
      (db.Session.findOne as jest.Mock).mockResolvedValue(mockSession);

      await checkSubscriptions();

      expect(mockPurchase.save).toHaveBeenCalled();
      expect(mockUser.applyPurchaseRewards).toHaveBeenCalledWith(mockProduct.getRewards());
      expect(log.info).toHaveBeenCalledWith(
        'scheduler',
        expect.stringContaining('포인트 업데이트 완료'),
        1,
        expect.objectContaining({
          scheduler: 'iap',
          userId: mockUser._id,
        })
      );
    });

    it('IAP 검증 중 오류 발생 시 에러를 로깅한다. 심각도는 HIGH(3)', async () => {
      const mockPurchase = {
        _id: 'purchase1',
        userId: 'user1',
        receipt: 'receipt1',
        product: { productId: 'product1' },
        purchase: { transactionId: 'old' },
        isExpired: false,
      };

      (db.Purchase.find as jest.Mock).mockResolvedValue([mockPurchase]);
      (iapValidator.validate as jest.Mock).mockRejectedValue(new Error('IAP 검증 실패'));

      await checkSubscriptions();

      expect(log.error).toHaveBeenCalledWith(
        'scheduler',
        '구독 검증 중 오류 발생',
        3,
        expect.objectContaining({
          scheduler: 'iap',
          error: expect.any(Error),
        })
      );
    });
  });
}); 