import {
  Context,
} from 'koa';
import db from 'models';
import {
  decodeJWT,
} from 'utils/jwt';

export default async (ctx: Context, next: () => Promise<any>) => {
  const user = ctx.state.user;
  if (user?.level !== 9) {
    ctx.body = 'login required';
    ctx.status = 401;
    return;
  }
  await next();
};
