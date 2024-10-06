import Router from '@koa/router';
import db from 'models';

const router = new Router({
  prefix: '/product',
});

router.get('/detail/:productId', async (ctx) => {
  const {
    productsId,
  } = ctx.params;
  const product = await db.Product.findById(productsId);
  ctx.body = product;
});

router.get('/', async (ctx) => {
  const products = await db.Product.find({}).sort({
    createdAt: -1,
  });
  ctx.body = products;
});

export default router;
