import {
  Context,
} from 'koa';

export default async (ctx: Context, next: () => Promise<any>) => {
  const {
    user,
  } = ctx.state;
  if (user?.level !== 9) {
    ctx.body = 'login required';
    ctx.status = 401;
    return;
  }
  await next();
};
