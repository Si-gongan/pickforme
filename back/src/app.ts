import './env';
import './instruments';
import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import http from 'http';
import router from './router';
import socket from './socket';
import { registerAllSchedulers } from 'scheduler';
import { log } from './utils/logger';
import * as Sentry from '@sentry/node';
import { redisClient } from './cache/RedisClient';

const PORT = process.env.PORT || 3000;
const app = new Koa();

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
};

// 전역 에러 핸들러 미들웨어
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    const error = err as Error;

    Sentry.captureException(error);
    // 에러 로깅
    void log.error(`Global error: ${error.message}`, 'SYSTEM', 'HIGH', {
      stack: error.stack,
      path: ctx.path,
      method: ctx.method,
      status: ctx.status,
    });

    // 클라이언트에 에러 응답
    ctx.status = err.status || 500;
    ctx.body = {
      error: {
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
      },
    };
    ctx.app.emit('error', err, ctx);
  }
});

app.use(cors(corsOptions)).use(bodyParser()).use(router.routes()).use(router.allowedMethods());

const server = http.createServer(app.callback());
socket.setServer(server);

// Redis 연결 초기화 (비동기)
const initRedis = async () => {
  const useRedis = !!process.env.REDIS_URL || process.env.USE_REDIS === 'true';
  if (useRedis) {
    try {
      await redisClient.connect();
      void log.info('Redis 연결 완료', 'SYSTEM', 'MEDIUM');
    } catch (error) {
      console.error('Redis 연결 실패:', error);
      void log.error('Redis 연결 실패', 'SYSTEM', 'HIGH', { error });
      throw error;
    }
  }
};

// 서버 시작
const startServer = async () => {
  await initRedis();

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`server listen in port ${PORT}`);
  });
};

void startServer();

if (process.env.NODE_ENV === 'production') {
  registerAllSchedulers();
}
