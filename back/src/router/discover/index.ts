import Router from '@koa/router';
import db from 'models';
import client from 'utils/axios';
import requireAuth from 'middleware/jwt';

const router = new Router({
  prefix: '/discover',
});

router.get('/products/:category_id', async (ctx) => {
  const { category_id } = ctx.params;

  const [
    {
      data: { products: random },
    },
    {
      data: { products: special },
    },
    local,
  ] = await Promise.all([
    client.get(`/coupang/bestcategories/${category_id}`),
    client.get('/coupang/goldbox'),
    db.DiscoverSection.find({ name: 'local' }).catch(() => []),
  ]);
  ctx.body = {
    special,
    random,
    local,
  };
});

router.post('/product', async (ctx) => {
  const {
    body: { url },
  } = <any>ctx.request;
  if (url) {
    // 외부 입점 상품인지 체크
    const section = await db.DiscoverSection.findOne({
      'products.url': url,
    });
    if (section) {
      const product = section.products.find((product: any) => product.url === url);
      ctx.body = {
        product,
      };
      return;
    }
    // 이미 저장된 상품 정보인지 체크
    const item = await db.Item.findOne({
      url,
    });
    if (item && item.updatedAt > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)) {
      ctx.body = {
        product: item,
      };
      return;
    }

    // 상품 정보 없을 때 return null
    ctx.body = null;

    // 정보가 없을 경우 AI 서버에 정보 스크래핑 요청 -> 프론트로 로직 이관
    // const {
    //   data,
    // } = await client
    //   .post('/product-detail', {
    //     url,
    //   })
    //   .catch(() => ({
    //     data: {},
    //   }));
    // ctx.body = data;

    // Item에 정보 업데이트 혹은 생성
    // if (item) {
    //   // update item
    //   await db.Item.updateOne({
    //     url,
    //   }, {
    //     $set: data.product,
    //   });
    // } else {
    //   // create item
    //   await db.Item.create(data.product);
    // }
  }
});

router.put('/product', async (ctx) => {
  const {
    body: { product },
  } = <any>ctx.request;
  const item = await db.Item.findOne({
    url: product.url,
  });
  // item 업데이트
  if (item) {
    await db.Item.updateOne(
      {
        url: product.url,
      },
      {
        $set: product,
      }
    );
    // console.log('update item');
  }
  // item 생성
  else {
    await db.Item.create(product);
    // console.log('create item');
  }
  ctx.body = {
    product,
  };
});

router.post('/product/detail/caption', async (ctx) => {
  const {
    body: { product },
  } = <any>ctx.request;
  // 외부 입점 상품인지 체크
  const section = await db.DiscoverSection.findOne({
    'products.url': product.url,
  });
  if (section) {
    ctx.body = {
      caption: section.products.find((sectionProduct: any) => product.url === sectionProduct.url)
        .caption,
    };
    return;
  }
  // 이미 저장된 상품 정보인지 체크
  const item = await db.Item.findOne({
    url: product.url,
  });
  if (item && item.caption) {
    ctx.body = {
      caption: item.caption,
    };
    return;
  }
  // AI 서버에 이미지 설명 요청
  const { data } = await client
    .post('/test/product-caption', {
      product,
    })
    .catch(() => ({
      data: {},
    }));
  ctx.body = {
    caption: data.caption,
  };

  // update item
  if (item) {
    await db.Item.updateOne(
      {
        url: product.url,
      },
      {
        $set: {
          caption: data.caption,
        },
      }
    );
  }
});

router.post('/product/detail/report', async (ctx) => {
  const {
    body: { product },
  } = <any>ctx.request;
  const section = await db.DiscoverSection.findOne({
    'products.url': product.url,
  });
  if (section) {
    ctx.body = {
      report: section.products.find((secionProduct: any) => product.url === secionProduct.url)
        .report,
    };
    return;
  }
  const item = await db.Item.findOne({
    url: product.url,
  });
  if (item && item.report) {
    ctx.body = {
      report: item.report,
    };
    return;
  }

  const { data } = await client
    .post('/test/ai-report', {
      product,
    })
    .catch(() => ({
      data: {},
    }));
  ctx.body = {
    report: data.report,
  };

  // update item
  if (item) {
    await db.Item.updateOne(
      {
        url: product.url,
      },
      {
        $set: {
          report: data.report,
        },
      }
    );
  }
});

router.post('/product/detail/review', async (ctx) => {
  const {
    body: { product, reviews },
  } = <any>ctx.request;
  const section = await db.DiscoverSection.findOne({
    'products.url': product.url,
  });
  if (section) {
    ctx.body = {
      review: section.products.find((sectionProduct: any) => product.url === sectionProduct.url)
        .review,
    };
    return;
  }
  const item = await db.Item.findOne({
    url: product.url,
  });
  if (item && item.review.pros.length > 0) {
    ctx.body = {
      review: item.review,
    };
    return;
  }

  const { data } = await client
    .post('/test/review-summary', {
      product,
      reviews,
    })
    .catch(() => ({
      data: {},
    }));
  ctx.body = {
    review: data.summary,
  };

  // update item
  if (item) {
    await db.Item.updateOne(
      {
        url: product.url,
      },
      {
        $set: {
          review: data.summary,
        },
      }
    );
  }
});

router.post('/product/detail/ai-answer', requireAuth, async (ctx) => {
  const {
    body: { product, reviews, question },
  } = <any>ctx.request;

  const user = await db.User.findById(ctx.state.user._id);
  if (user && user.aiPoint > 0) {
    user.useAiPoint(1);

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
  } else {
    ctx.status = 400;
    ctx.body = {
      errorMessage: 'AI 포인트가 부족합니다.',
    };
    return;
  }

  const { data } = await client
    .post('/test/ai-answer', {
      product,
      reviews,
      question,
    })
    .catch(() => ({
      data: {},
    }));
  ctx.body = data;
  ctx.status = 200;
});

router.post('/search', async (ctx) => {
  const {
    body: { query, page = 1, sort = 'sortDesc' },
  } = <any>ctx.request;
  const { data } = await client
    .get(`/coupang?keyword=${encodeURIComponent(query)}&page=${page}&sort=${sort}`)
    .catch(() => ({
      data: {},
    }));
  ctx.body = data;
});

router.post('/platform', async (ctx) => {
  const {
    body: { url },
  } = <any>ctx.request;
  const { data } = await client
    .post('/platform', {
      url,
    })
    .catch(() => ({
      data: {},
    }));
  ctx.body = data;
});

export default router;
