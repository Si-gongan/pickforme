import Router from '@koa/router';
import db from 'models';
import client from 'utils/axios';

const router = new Router({
  prefix: '/discover',
});
router.get('/products/:id', async (ctx) => {
  const { id } = ctx.params;
  const [{
    data: {
      products: random,
    },
  }, {
    data: {
      products: special,
    },
  }, local, reports] = await Promise.all([
    client.get(`/coupang/bestcategories/${id}`),
    client.get('/coupang/goldbox'),
    db.DiscoverSection.find({}),
    db.Request.find({
      isPublic: true,
    }).limit(3),
  ]);
  ctx.body = {
    special,
    random,
    local,
    reports,
  };
});

router.post('/product', async (ctx) => {
  const {
    body: {
      product: {
        id,
        url,
        platform,
      },
    },
  } = <any>ctx.request;
  if (id) {
   const section = await db.DiscoverSection.findOne(
      { 'products.productId': id },
      { products: { $elemMatch: { productId: id } } }
    );
    if (section) {
      ctx.body = { product: section.products[0].detail };
    } else {
  const {
    data
  } = await client.get(`${platform === 'coupang-ict' ? '/coupang-ict' : '/coupang'}/${id}`, {
  });
  ctx.body = data;
    }
  } else if (url) {
    const {
      data
    } = await client.post('/product-detail', { url });
    ctx.body = data; 
  }
});

router.post('/product/detail/caption', async (ctx) => {
  const {
    body: {
      product: {
        id,
        url,
      },
    },
  } = <any>ctx.request;
  const section = await db.DiscoverSection.findOne(
      { 'products.productId': id },
      { products: { $elemMatch: { productId: id } } }
    );
  if (section) {
    ctx.body = {
      caption: section.products[0].caption,
    };
    return;
  }

  const {
    data
  } = await client.post('/product-caption', id ? { id } : {
    url,
  }).catch(() => ({ data: {} }));
  ctx.body = {
    caption: data.caption,
  };
});

router.post('/product/detail/new-report', async (ctx) => {
  const {
    body: {
      product: {
        id,
        url,
      },
    },
  } = <any>ctx.request;
    const section = await db.DiscoverSection.findOne(
      { 'products.productId': id },
      { products: { $elemMatch: { productId: id } } }
    );
  if (section) {
    ctx.body = {
      report: section.products[0].report,
    };
    return;
  }


  const {
    data
  } = await client.post('/ai-report',  id ? { id } : {
    url,
  }).catch(() => ({ data: {} }));
  ctx.body = {
    report: data.report,
  };
});

router.post('/product/detail/review', async (ctx) => {
  const {                   
    body: {                 
      product: { 
        id,
        url,
      },                    
    },                      
  } = <any>ctx.request;     
      const section = await db.DiscoverSection.findOne(
      { 'products.productId': id },
      { products: { $elemMatch: { productId: id } } }
    );
  if (section) {
    ctx.body = {
      review: section.products[0].review,
    };
    return;
  }

  const {
    data: {
      summary: review,
    } = {
      summary: { pros: [], cons: [] },
    }
  } = await client.post('/review-summary', id ? { id } : {
    url,
  }).catch(() => ({ data: { } }));
  ctx.body = {
    review,
  };
});
router.post('/search', async (ctx) => {
  const {
    body: {
      query,
      page = 1,
    },
  } = <any>ctx.request;
  const {
    data,
  } = await client.get(`/coupang-ict?keyword=${encodeURIComponent(query)}&page=${page}`)
  ctx.body = data;
});

router.post('/url', async (ctx) => {
  const {
    body: {
      url,
    },
  } = <any>ctx.request;
  const { data } = await client.post('/platform', { url }).catch(() => ({ data: {} }));
  if (!data.url) {
    ctx.body = data;
    return;
  }
  const { data: response }= await client.post('/product-detail', { url: data.url }).catch(() => ({ data: {} }));
  ctx.body = response;
});

export default router;
