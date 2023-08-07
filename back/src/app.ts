import dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
});

import Koa from 'koa';
import cors from '@koa/cors';
import router from './router';
import bodyParser from 'koa-bodyparser';
import http from 'http';
import socket from './socket';

const PORT = process.env.PORT || 3000;
const app = new Koa();

const corsOptions = {
    origin: 'https://pickforme-admin-sigongan.vercel.app',
    credentials: true,
}

app
  .use(cors(corsOptions))
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const server = http.createServer(app.callback())
socket.setServer(server);

server.listen(PORT, () => {
  console.log(`server listen in port ${PORT}`);
});
