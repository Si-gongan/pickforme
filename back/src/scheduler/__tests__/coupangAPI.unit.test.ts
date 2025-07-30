// __tests__/scheduler/coupang.test.ts
import { preloadCoupangAPI } from 'services/coupang-api.service';
import { handleCoupangPreload } from 'scheduler/coupangAPI';
import { COUPANG_CATEGORIES } from '../../constants/coupangCategories';
import { cacheProvider } from 'cache';
import client from 'utils/axios';
import { cacheKey } from '../../constants/cacheKey';

jest.mock('utils/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock('cache', () => {
  const store = new Map();
  return {
    cacheProvider: {
      get: jest.fn(() => null),
      set: jest.fn((key, value) => store.set(key, value)),
    },
  };
});

describe('Coupang Preload Scheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('preloadCoupangAPI는 모든 카테고리를 강제로 fetch하고 캐시에 저장한다', async () => {
    (client.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/goldbox')) {
        return Promise.resolve({ data: { products: ['goldbox-product'] } });
      }
      return Promise.resolve({ data: { products: ['test-product'] } });
    });

    await preloadCoupangAPI();

    // 골드박스 호출 확인
    expect(client.get).toHaveBeenCalledWith('/coupang/goldbox');
    expect(cacheProvider.set).toHaveBeenCalledWith(cacheKey.coupang.goldbox, ['goldbox-product']);

    // 각 카테고리 캐시 호출 확인
    const categoryIds = Object.keys(COUPANG_CATEGORIES);
    for (const categoryId of categoryIds) {
      const key = cacheKey.coupang.bestCategories(categoryId);
      expect(cacheProvider.set).toHaveBeenCalledWith(key, ['test-product']);
    }

    // 전체 호출 수 = 카테고리 수 + goldbox 1회
    expect(client.get).toHaveBeenCalledTimes(categoryIds.length + 1);
  });

  it('handleCoupangPreload는 preloadCoupangAPI를 호출한다', async () => {
    const preloadSpy = jest.spyOn(require('services/coupang-api.service'), 'preloadCoupangAPI');
    await handleCoupangPreload();
    expect(preloadSpy).toHaveBeenCalled();
  });
});
