import { createClient, RedisClientType } from 'redis';

class RedisClientWrapper {
  private client: RedisClientType | null = null;

  private isConnected = false;

  /**
   * Redis 클라이언트 초기화 및 연결
   */
  async connect(): Promise<void> {
    if (this.client && this.isConnected) {
      return;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('Redis 연결 재시도 횟수 초과');
            return new Error('Redis 연결 실패');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('ready', () => {
      console.log('Redis 클라이언트 연결됨');
      this.isConnected = true;
    });

    await this.client.connect();
  }

  /**
   * Redis 클라이언트 인스턴스 반환
   */
  getClient(): RedisClientType {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis 클라이언트가 연결되지 않았습니다. connect()를 먼저 호출하세요.');
    }
    return this.client;
  }

  /**
   * 연결 상태 확인
   */
  isClientConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Redis 클라이언트 연결 종료
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }
}

// 싱글톤 인스턴스
export const redisClient = new RedisClientWrapper();
