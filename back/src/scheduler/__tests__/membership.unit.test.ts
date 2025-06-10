jest.mock('models', () => {
  const mockUser = { findById: jest.fn() };
  const mockPurchase = {
    find: jest.fn().mockReturnThis(),
    cursor: jest.fn().mockReturnThis(),
  };

  return {
    __esModule: true,
    default: {
      User: mockUser,
      Purchase: mockPurchase,
    },
    User: mockUser,
    Purchase: mockPurchase,
  };
});

jest.mock('models/product', () => ({
  ProductType: { SUBSCRIPTION: 1 },
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

import { handleMembershipScheduler } from '../membership';
import db from 'models';
import { ProductType } from 'models/product';
import { log } from 'utils/logger/logger';

describe('Membership Scheduler (unit)', () => {
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

  it('만료일이 지난 멤버쉽은 만료 처리한다.', async () => {
    const mockPurchase = {
      _id: 'purchase1',
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
      next: jest.fn().mockResolvedValueOnce(mockPurchase).mockResolvedValueOnce(null),
    };

    (db.Purchase as any).find.mockReturnThis();
    (db.Purchase as any).cursor.mockReturnValue(mockCursor);
    (db.User.findById as jest.Mock).mockResolvedValue(mockUser);

    await handleMembershipScheduler();

    expect(mockPurchase.updateExpiration).toHaveBeenCalled();
    expect(mockUser.processExpiredMembership).toHaveBeenCalled();
    expect(log.info).toHaveBeenCalledWith(
      `멤버십 만료 처리 완료 - userId: ${mockUser._id}`,
      'SCHEDULER',
      'LOW',
      expect.any(Object)
    );
  });

  it('만료일이 아직 남은 멤버쉽은 만료 처리하지 않는다.', async () => {
    const mockPurchase = {
      _id: 'purchase2',
      userId: 'user2',
      createdAt: new Date('2023-01-02T16:00:00.000Z'),
      isExpired: false,
      product: { type: ProductType.SUBSCRIPTION },
      updateExpiration: jest.fn(),
    };

    const mockCursor = {
      next: jest.fn().mockResolvedValueOnce(mockPurchase).mockResolvedValueOnce(null),
    };

    (db.Purchase as any).find.mockReturnThis();
    (db.Purchase as any).cursor.mockReturnValue(mockCursor);

    await handleMembershipScheduler();

    expect(mockPurchase.updateExpiration).not.toHaveBeenCalled();
  });

  it('아주 근소하게 남은 멤버쉽도 만료 처리하지 않는다.', async () => {
    const mockPurchase = {
      _id: 'purchase3',
      userId: 'user3',
      createdAt: new Date('2023-01-02T15:00:00.001Z'),
      isExpired: false,
      product: { type: ProductType.SUBSCRIPTION },
      updateExpiration: jest.fn(),
    };

    const mockCursor = {
      next: jest.fn().mockResolvedValueOnce(mockPurchase).mockResolvedValueOnce(null),
    };

    (db.Purchase as any).find.mockReturnThis();
    (db.Purchase as any).cursor.mockReturnValue(mockCursor);

    await handleMembershipScheduler();

    expect(mockPurchase.updateExpiration).not.toHaveBeenCalled();
  });

  it('오류 발생 시 로깅 처리한다.', async () => {
    const mockCursor = {
      next: jest.fn().mockRejectedValue(new Error('DB 에러')),
    };

    (db.Purchase as any).find.mockReturnThis();
    (db.Purchase as any).cursor.mockReturnValue(mockCursor);

    await handleMembershipScheduler();

    expect(log.error).toHaveBeenCalledWith(
      '멤버십 만료 처리 중 오류 발생',
      'SCHEDULER',
      'HIGH',
      expect.any(Object)
    );
  });
});
