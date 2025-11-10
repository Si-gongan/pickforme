import { MemoryCacheProvider } from './MemoryCacheProvider';
import { RedisCacheProvider } from './RedisCacheProvider';

// 환경 변수로 Redis 사용 여부 결정
// REDIS_URL이 설정되어 있으면 Redis 사용, 없으면 Memory 사용
// Docker Compose 환경에서는 redis://redis:6379 또는 redis://localhost:6379 사용
const useRedis = !!process.env.REDIS_URL || process.env.USE_REDIS === 'true';

let cacheProviderInstance: MemoryCacheProvider | RedisCacheProvider;

if (useRedis) {
  console.log('Redis 캐시를 사용합니다.');
  cacheProviderInstance = new RedisCacheProvider();
  // Redis 연결은 app.ts에서 초기화됨
} else {
  console.log('Memory 캐시를 사용합니다.');
  cacheProviderInstance = new MemoryCacheProvider();
}

export const cacheProvider = cacheProviderInstance;
