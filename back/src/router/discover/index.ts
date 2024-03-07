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
        productUrl,
      },
    },
  } = <any>ctx.request;
  if (productUrl) {
  const {
    data,
  } = await client.post(`/product-detail`, {
    url: `https://www.coupang.com/vp/products/${id}`,
  });
  ctx.body = data;
  } else {
  const {
    data
  } = await client.get(`https://api.kimgosu.vsolution.app/products/${id}`, {
    headers: {
      Authorization: 'Bearer 389|wxFe3R2xVdE2eFXII3pPH7lF5tFqaUp5o9RVkOQl',
    },
  });
  ctx.body = data;
  }
});

router.post('/product/detail/caption', requireAuth, async (ctx) => {
  const {
    body: {
      product: {
        id,
        productUrl,
      },
    },
  } = <any>ctx.request;
  const {
     data: {
      answer: caption,
    } = {
      answer: undefined,
    },
  } = await client.post('/product-caption', productUrl ? {
    url: `https://www.coupang.com/vp/products/${id}`,
  } : {
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
        productUrl,
      },
    },
  } = <any>ctx.request;
  const {
    data: {
      answer: report,
    } = {
      answer: undefined,
    },
  } = await client.post('/new-report', productUrl ? {
    url: `https://www.coupang.com/vp/products/${id}`,
  } : {
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
        productUrl,
        group,              
      },                    
    },                      
  } = <any>ctx.request;     
  const {
    data: review,
  } = await client.post('/product-review', {
    url: `https://www.coupang.com/vp/products/${productUrl ? id : group}`,
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
