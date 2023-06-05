import {
  Context,
} from 'koa';
import db from 'models';
import {
  decodeJWT,
} from 'utils/jwt';

export default async (ctx: Context, next: () => Promise<any>) => {
  const token = ctx.header.authorization;
  if (token) {
    const user = decodeJWT(token.replace(/^Bearer /, ''));
    ctx.state.user = user;
    const session = await db.Session.findOne({
      userId: user._id,
    });
    if (session) {
      ctx.state.socketId = session.connectionId;
    }
  }
  await next();
};
