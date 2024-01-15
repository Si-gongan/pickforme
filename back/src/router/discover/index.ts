import Router from '@koa/router';
import db from 'models';
import requireAuth from 'middleware/jwt';
import client from 'utils/axios';

const router = new Router({
  prefix: '/discover',
});

const CATEGORIES = [
  '1001',
  '1002',
  '1010',
  '1011',
  '1012',
  '1013',
  '1014',
  '1015',
  '1016',
  '1017',
  '1018',
  '1019',
  '1020',
  '1021',
  '1024',
  '1025',
  '1026',
  '1029',
  '1030',
];

router.get('/products', requireAuth, async (ctx) => {
  const id = CATEGORIES[Math.floor(CATEGORIES.length * Math.random())];
  const [{
    data: {
      products: random,
    },
  }, {
    data: {
      products: special,
    },
  }, reports] = await Promise.all([
    client.get(`/coupang/bestcategories/${id}`),
    client.get('/coupang/goldbox'),
    db.Request.find({
      isPublic: true,
    }).limit(3),
  ]);
  ctx.body = {
    special,
    random,
    reports,
  };
});

router.post('/product', requireAuth, async (ctx) => {
  const {
    body: {
      product: {
        id,
      },
    },
  } = <any>ctx.request;
  const {
    data: {
      product,
    },
  } = await client.get(`https://api.kimgosu.vsolution.app/products/${id}`, {
    headers: {
      Authorization: 'Bearer 389|wxFe3R2xVdE2eFXII3pPH7lF5tFqaUp5o9RVkOQl',
    },
  });
  ctx.body = {
    product,
  };
});

router.post('/product/detail/caption', requireAuth, async (ctx) => {
  const {
    body: {
      product: {
        id,
        group,
      },
    },
  } = <any>ctx.request;
  const {
     data: {
      answer: caption,
    } = {
      answer: undefined,
    },
  } = await client.post('https://ai.sigongan-ai.shop/product-caption', {
    id: `${id}`,
  }).catch(() => ({ data: {} }));
  ctx.body = {
    caption,
  };
});

router.post('/product/detail/new-report', requireAuth, async (ctx) => {
  const {
    body: {
      product: {
        id,
        group,
      },
    },
  } = <any>ctx.request;
  const {
    data: {
      answer: report,
    } = {
      answer: undefined,
    },
  } = await client.post('/report', {
      id: `${id}`,
  }).catch(() => ({ data: {} }));
  ctx.body = {
    report,
  };
});

router.post('/product/detail/review', requireAuth, async (ctx) => {
  const {                   
    body: {                 
      product: {            
        id,                 
        group,              
      },                    
    },                      
  } = <any>ctx.request;     
  const {
    data: review,
  } = await client.post('https://ai.sigongan-ai.shop/product-review', {
      url: `https://www.coupang.com/vp/products/${group}`,
  }).catch(() => ({ data: { pros: [], cons: [] } }));
  ctx.body = {
    review,
  };
});
router.post('/search', requireAuth, async (ctx) => {
  const {
    body: {
      query,
      page = 1,
    },
  } = <any>ctx.request;
  const {
    data,
  } = await client.get(`https://api.kimgosu.vsolution.app/products?keyword=${encodeURIComponent(query)}&page=${page}`, {
    headers: {
      Authorization: 'Bearer 389|wxFe3R2xVdE2eFXII3pPH7lF5tFqaUp5o9RVkOQl',
    },
  });
  ctx.body = data;
});

export default router;
