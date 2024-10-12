import Router from '@koa/router';
import db from 'models';
import client from 'utils/axios';
import requireAuth from 'middleware/jwt';
import {
  ProductType,
} from 'models/product';

const router = new Router({
  prefix: '/discover',
});

router.get('/products/:category_id', async (ctx) => {
  const {
    category_id,
  } = ctx.params;
  const [
    {
      data: {
        products: random,
      },
    },
    {
      data: {
        products: special,
      },
    },
    local,
  ] = await Promise.all([
    client.get(`/coupang/bestcategories/${category_id}`),
    client.get('/coupang/goldbox'),
    db.DiscoverSection.find({}),
  ]);
  ctx.body = {
    special,
    random,
    local,
  };
});

router.post('/product', async (ctx) => {
  const {
    body: {
      url,
    },
  } = <any>ctx.request;
  if (url) {
    const section = await db.DiscoverSection.findOne({
      'products.url': url,
    });
    if (section) {
      const product = section.products.find(
        (product: any) => product.url === url,
      );
      ctx.body = {
        product,
      };
      return;
    }
    const item = await db.Item.findOne({
      url,
    });
    if (
      item
      && item.updatedAt > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    ) {
      ctx.body = {
        product: item,
      };
      return;
    }

    const {
      data,
    } = await client
      .post('/product-detail', {
        url,
      })
      .catch(() => ({
        data: {},
      }));
    ctx.body = data;

    // update or create item
    if (item) {
      // update item
      await db.Item.updateOne({
        url,
      }, {
        $set: data.product,
      });
    } else {
      // create item
      await db.Item.create(data.product);
    }
  }
});

router.post('/product/detail/caption', async (ctx) => {
  const {
    body: {
      product: {
        url,
      },
    },
  } = <any>ctx.request;
  const section = await db.DiscoverSection.findOne({
    'products.url': url,
  });
  if (section) {
    ctx.body = {
      caption: section.products.find((product: any) => product.url === url)
        .caption,
    };
    return;
  }
  const item = await db.Item.findOne({
    url,
  });
  if (item && item.caption) {
    ctx.body = {
      caption: item.caption,
    };
    return;
  }
  const {
    data,
  } = await client
    .post('/product-caption', {
      url,
    })
    .catch(() => ({
      data: {},
    }));
  ctx.body = {
    caption: data.caption,
  };

  // update item
  if (item) {
    await db.Item.updateOne({
      url,
    }, {
      $set: {
        caption: data.caption,
      },
    });
  }
});

router.post('/product/detail/report', async (ctx) => {
  const {
    body: {
      product: {
        url, name,
      },
      images,
    },
  } = <any>ctx.request;
  const section = await db.DiscoverSection.findOne({
    'products.url': url,
  });
  if (section) {
    ctx.body = {
      report: section.products.find((product: any) => product.url === url)
        .report,
    };
    return;
  }
  const item = await db.Item.findOne({
    url,
  });
  if (item && item.report) {
    ctx.body = {
      report: item.report,
    };
    return;
  }

  const {
    data,
  } = await client
    .post('/test/ai-report', {
      url, name, images,
    })
    .catch(() => ({
      data: {},
    }));
  ctx.body = {
    report: data.report,
  };

  // update item
  if (item) {
    await db.Item.updateOne({
      url,
    }, {
      $set: {
        report: data.report,
      },
    });
  }
});

router.post('/product/detail/review', async (ctx) => {
  const {
    body: {
      product: {
        url, name,
      },
      reviews,
    },
  } = <any>ctx.request;
  const section = await db.DiscoverSection.findOne({
    'products.url': url,
  });
  if (section) {
    ctx.body = {
      review: section.products.find((product: any) => product.url === url)
        .review,
    };
    return;
  }
  const item = await db.Item.findOne({
    url,
  });
  if (item && item.review.pros.length > 0) {
    ctx.body = {
      review: item.review,
    };
    return;
  }

  const {
    data,
  } = await client
    .post('/test/review-summary', {
      url, name, reviews,
    })
    .catch(() => ({
      data: {},
    }));
  ctx.body = {
    review: data.summary,
  };

  // update item
  if (item) {
    await db.Item.updateOne({
      url,
    }, {
      $set: {
        review: data.summary,
      },
    });
  }
});

router.post('/product/detail/ai-answer', requireAuth, async (ctx) => {
  const {
    body: {
      product, images, reviews, question,
    },
  } = <any>ctx.request;

  const {
    data,
  } = await client
    .post('/test/ai-answer', {
      product, images, reviews, text: question,
    })
    .catch(() => ({
      data: {},
    }));
  ctx.body = data;

  const user = await db.User.findById(ctx.state.user._id);
  if (user) {
    user.aiPoint -= 1;
    await user.save();
    /*
    const subscription = await db.Purchase.findOne({
      userId: ctx.state.user._id,
      isExpired: false,
      'product.type': ProductType.SUBSCRIPTION,
    });
    if (!subscription) {
      // 추후 이벤트 시 아래 주석처리
      user.aiPoint -= 1;
      await user.save();
    }
    */
  }
});

router.post('/search', async (ctx) => {
  const {
    body: {
      query, page = 1, sort = 'sortDesc',
    },
  } = <any>ctx.request;
  const {
    data,
  } = await client
    .get(
      `/coupang?keyword=${encodeURIComponent(query)}&page=${page}&sort=${sort}`,
    )
    .catch(() => ({
      data: {},
    }));
  ctx.body = data;
});

router.post('/platform', async (ctx) => {
  const {
    body: {
      url,
    },
  } = <any>ctx.request;
  const {
    data,
  } = await client
    .post('/platform', {
      url,
    })
    .catch(() => ({
      data: {},
    }));
  ctx.body = data;
});

export default router;
