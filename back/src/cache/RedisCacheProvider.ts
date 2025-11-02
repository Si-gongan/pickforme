import { CacheProvider } from './CacheProvider';
import { redisClient } from './RedisClient';

const defaultTTL = 1000 * 60 * 60 * 24; // 24시간

// 동기적 get을 위한 캐시 (최신 데이터만 유지)
const syncCache = new Map<string, { value: any; expiresAt: number }>();

export class RedisCacheProvider implements CacheProvider {
  /**
   * 캐시에서 값 가져오기 (동기 버전)
   * 주의: Redis는 비동기이므로 이 메서드는 로컬 캐시에서만 조회합니다.
   * 최신 데이터를 보장하려면 getAsync를 사용하세요.
   */
  get<T>(key: string): T | null {
    // 먼저 로컬 동기 캐시에서 확인
    const cached = syncCache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value as T;
    }

    // 로컬 캐시에 없으면 null 반환
    // 실제 Redis에서 가져오려면 getAsync 사용
    return null;
  }

  /**
   * 캐시에 값 저장하기 (동기 버전)
   * 주의: Redis는 비동기이므로 이 메서드는 로컬 캐시에도 저장하고
   * Redis에는 비동기로 저장합니다.
   */
  set<T>(key: string, value: T, ttlMs = defaultTTL): void {
    // 로컬 동기 캐시에도 저장
    syncCache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });

    // Redis에도 비동기로 저장
    if (redisClient.isClientConnected()) {
      try {
        const client = redisClient.getClient();
        const serialized = JSON.stringify(value);
        client.setEx(key, Math.floor(ttlMs / 1000), serialized).catch((error) => {
          console.error('Redis set 오류:', error);
        });
      } catch (error) {
        console.error('Redis set 오류:', error);
      }
    }
  }

  /**
   * 캐시에서 키 삭제
   */
  delete(key: string): void {
    // 로컬 캐시에서도 삭제
    syncCache.delete(key);

    // Redis에서도 삭제
    if (redisClient.isClientConnected()) {
      try {
        const client = redisClient.getClient();
        client.del(key).catch((error) => {
          console.error('Redis delete 오류:', error);
        });
      } catch (error) {
        console.error('Redis delete 오류:', error);
      }
    }
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    // 로컬 캐시도 삭제
    syncCache.clear();

    // Redis도 삭제
    if (redisClient.isClientConnected()) {
      try {
        const client = redisClient.getClient();
        client.flushDb().catch((error) => {
          console.error('Redis clear 오류:', error);
        });
      } catch (error) {
        console.error('Redis clear 오류:', error);
      }
    }
  }

  /**
   * 비동기 버전의 get 메서드 (Redis에서 직접 조회)
   */
  async getAsync<T>(key: string): Promise<T | null> {
    if (!redisClient.isClientConnected()) {
      return null;
    }

    try {
      const client = redisClient.getClient();
      const value = await client.get(key);
      if (value === null) {
        return null;
      }
      const parsed = JSON.parse(value) as T;

      // 로컬 캐시에도 저장 (다음 동기 get을 위해)
      const ttl = await client.ttl(key);
      if (ttl > 0) {
        syncCache.set(key, {
          value: parsed,
          expiresAt: Date.now() + ttl * 1000,
        });
      }

      return parsed;
    } catch (error) {
      console.error('Redis getAsync 오류:', error);
      return null;
    }
  }

  /**
   * 비동기 버전의 set 메서드
   */
  async setAsync<T>(key: string, value: T, ttlMs = defaultTTL): Promise<void> {
    if (!redisClient.isClientConnected()) {
      return;
    }

    try {
      const client = redisClient.getClient();
      const serialized = JSON.stringify(value);
      await client.setEx(key, Math.floor(ttlMs / 1000), serialized);
    } catch (error) {
      console.error('Redis setAsync 오류:', error);
    }
  }

  /**
   * 비동기 버전의 delete 메서드
   */
  async deleteAsync(key: string): Promise<void> {
    if (!redisClient.isClientConnected()) {
      return;
    }

    try {
      const client = redisClient.getClient();
      await client.del(key);
    } catch (error) {
      console.error('Redis deleteAsync 오류:', error);
    }
  }

  /**
   * 비동기 버전의 clear 메서드
   */
  async clearAsync(): Promise<void> {
    if (!redisClient.isClientConnected()) {
      return;
    }

    try {
      const client = redisClient.getClient();
      await client.flushDb();
    } catch (error) {
      console.error('Redis clearAsync 오류:', error);
    }
  }
}
