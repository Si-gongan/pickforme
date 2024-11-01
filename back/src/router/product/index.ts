import Router from '@koa/router';
import db from 'models';
import {
  productConverter,
} from 'utils/enumConverter';
import {
  ProductType,
} from 'models/product';

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

// 상품목록
router.get('/:platform', async (ctx) => {
  const {
    platform,
  } = ctx.params;
  const products = await db.Product.find({
    platform,
    type: productConverter(ProductType.SUBSCRIPTION),
  });

  // NOTE: IOS 는 아직 업데이트안됨으로 요청 제한
  if (platform === 'ios') {
    ctx.body = [];
  } else {
    ctx.body = products;
  }

  // ctx.body = products;
  ctx.status = 200;
});

export default router;
