import client from 'utils/axios';
import { cacheProvider } from '../cache';
import { cacheKey } from '../constants/cacheKey';
import { COUPANG_CATEGORIES } from '../constants/coupangCategories';
import { log } from 'utils/logger';
import { chunk } from 'utils/common';

export async function getCachedBestCategory(categoryId: string, options?: { force?: boolean }) {
  const key = cacheKey.coupang.bestCategories(categoryId);

  if (!options?.force) {
    const cached = cacheProvider.get<any[]>(key);
    if (cached) return cached;
  }

  const {
    data: { products },
  } = await client.get(`/coupang/bestcategories/${categoryId}`);
  cacheProvider.set(key, products);
  return products;
}

export async function getCachedGoldbox(options?: { force?: boolean }) {
  const key = 'goldbox';

  if (!options?.force) {
    const cached = cacheProvider.get<any[]>(key);
    if (cached) return cached;
  }

  const {
    data: { products },
  } = await client.get(`/coupang/goldbox`);
  cacheProvider.set(key, products);
  return products;
}

export async function preloadCoupangAPI() {
  const results: { categoryId: string; ok: boolean }[] = [];
  const categoryIds = Object.keys(COUPANG_CATEGORIES);
  const batches = chunk(categoryIds, 5); // 5개씩 묶기

  for (const batch of batches) {
    const promises = batch.map((categoryId) =>
      getCachedBestCategory(categoryId, { force: true })
        .then(() => results.push({ categoryId, ok: true }))
        .catch(() => results.push({ categoryId, ok: false }))
    );

    await Promise.all(promises); // 병렬 처리
  }

  // 골드박스도 강제 캐싱
  try {
    await getCachedGoldbox({ force: true });
    log.info('✅ 골드박스 캐싱 성공', 'SCHEDULER');
  } catch (err) {
    void log.error('❌ 골드박스 캐싱 실패', 'SCHEDULER', 'HIGH', { error: err });
  }

  log.info('✅ 카테고리 캐시 완료', 'SCHEDULER', 'LOW', { results });
}
