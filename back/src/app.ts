import dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
});

import Koa from 'koa';
import router from './router';
import bodyParser from 'koa-bodyparser';

const PORT = 3000;
const app = new Koa();

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`server listen in port ${PORT}`);
});
