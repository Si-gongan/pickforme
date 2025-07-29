import client from 'utils/axios';
import { cacheProvider } from '../cache';
import { cacheKey } from 'constants/cacheKey';

export async function getCachedBestCategory(categoryId: string) {
  const key = cacheKey.coupang.bestCategories(categoryId);
  const cached = cacheProvider.get<any[]>(key);
  if (cached) return cached;

  const {
    data: { products },
  } = await client.get(`/coupang/bestcategories/${categoryId}`);
  cacheProvider.set(key, products);
  return products;
}

export async function getCachedGoldbox() {
  const key = 'goldbox';
  const cached = cacheProvider.get<any[]>(key);
  if (cached) return cached;

  const {
    data: { products },
  } = await client.get(`/coupang/goldbox`);
  cacheProvider.set(key, products);
  return products;
}
