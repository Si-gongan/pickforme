// src/scheduler/__tests__/iap.test.ts
jest.mock('models', () => {
  const mockUser = {
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const mockPurchase = {
    find: jest.fn(),
  };
  const mockProduct = {
    findOne: jest.fn(),
  };
  const mockSession = {
    findOne: jest.fn(),
  };
  return {
    __esModule: true,
    default: {
      User: mockUser,
      Purchase: mockPurchase,
      Product: mockProduct,
      Session: mockSession,
    },
    User: mockUser,
    Purchase: mockPurchase,
    Product: mockProduct,
    Session: mockSession,
  };
});

jest.mock('utils/iap', () => ({
  __esModule: true,
  default: {
    validate: jest.fn(),
  },
}));

jest.mock('utils/logger/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

jest.mock('socket', () => ({
  emit: jest.fn(),
}));

jest.mock('utils/push', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('utils/iap', () => ({
  __esModule: true,
  default: {
    validate: jest.fn(),
  },
}));

import db from 'models';
import iapValidator from 'utils/iap';
import { log } from 'utils/logger/logger';
import { handleIAPScheduler } from '../iap';

describe('IAP Scheduler (unit)', () => {
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

  afterAll(() => {
    global.Date = RealDate;
  });

  it('IAP 검증 실패 시 구독을 만료 처리하고 유저 포인트를 초기화한다.', async () => {
    const mockPurchase = {
      _id: 'purchase1',
      userId: 'user1',
      receipt: 'receipt1',
      product: { productId: 'product1' },
      purchase: { transactionId: 'old' },
      isExpired: false,
      updateExpiration: jest.fn(),
    };

    (db.Purchase.find as jest.Mock).mockResolvedValue([mockPurchase]);
    (iapValidator.validate as jest.Mock).mockResolvedValue(null);
    (db.User.findOneAndUpdate as jest.Mock).mockResolvedValue(undefined);

    await handleIAPScheduler();

    expect(mockPurchase.updateExpiration).toHaveBeenCalled();
  });

  // it('IAP 검증 성공 시 포인트를 지급하고 소켓/푸시 알림을 보낸다.', async () => {
  //   const mockPurchase = {
  //     _id: 'purchase2',
  //     userId: 'user2',
  //     receipt: 'receipt2',
  //     product: { productId: 'product2' },
  //     purchase: { transactionId: 'old' },
  //     isExpired: false,
  //     save: jest.fn(),
  //   };

  //   const mockUser = {
  //     _id: 'user2',
  //     applyPurchaseRewards: jest.fn(),
  //     point: 100,
  //     pushToken: 'token2',
  //   };

  //   const mockProduct = {
  //     getRewards: jest.fn().mockReturnValue({ point: 100, aiPoint: 1000 }),
  //   };

  //   const mockSession = {
  //     connectionId: 'session1',
  //   };

  //   (db.Purchase.find as jest.Mock).mockResolvedValue([mockPurchase]);
  //   (iapValidator.validate as jest.Mock).mockResolvedValue({ transactionId: 'new' });
  //   (db.User.findById as jest.Mock).mockResolvedValue(mockUser);
  //   (db.Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
  //   (db.Session.findOne as jest.Mock).mockResolvedValue(mockSession);

  //   await handleIAPScheduler();

  //   expect(mockPurchase.save).toHaveBeenCalled();
  //   expect(mockUser.applyPurchaseRewards).toHaveBeenCalledWith(mockProduct.getRewards());
  //   expect(log.info).toHaveBeenCalledWith(
  //     LogContext.SCHEDULER,
  //     expect.stringContaining('포인트 업데이트 완료'),
  //     LogSeverity.LOW,
  //     expect.objectContaining({ userId: mockUser._id })
  //   );
  // });

  it('IAP 검증 중 오류 발생 시 에러를 로깅한다.', async () => {
    const mockPurchase = {
      _id: 'purchase3',
      userId: 'user3',
      receipt: 'receipt3',
      product: { productId: 'product3' },
      purchase: { transactionId: 'old' },
      isExpired: false,
    };

    (db.Purchase.find as jest.Mock).mockResolvedValue([mockPurchase]);
    (iapValidator.validate as jest.Mock).mockRejectedValue(new Error('validation error'));

    await handleIAPScheduler();

    expect(log.error).toHaveBeenCalledWith(
      '구독 검증 중 오류 발생',
      'SCHEDULER',
      'HIGH',
      expect.objectContaining({
        scheduler: 'iap',
        message: 'Error',
      })
    );
  });
});
