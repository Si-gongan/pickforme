import './env';
import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import http from 'http';
import router from './router';
import socket from './socket';

const PORT = process.env.PORT || 3000;
const app = new Koa();

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
};

app
  .use(cors(corsOptions))
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const server = http.createServer(app.callback());
socket.setServer(server);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server listen in port ${PORT}`);
});
