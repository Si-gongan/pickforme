import Router from '@koa/router';
import db from 'models';
import requireAuth from 'middleware/jwt';
import ogs from 'open-graph-scraper';
import client from 'utils/axios';
import slack from 'utils/slack';
import sendPush from 'utils/push';
import socket from 'socket';

const router = new Router({
  prefix: '/discover',
});

const CATEGORIES = [
    "1001",
    "1002",
    "1010",
    "1011",
    "1012",
    "1013",
    "1014",
    "1015",
    "1016",
    "1017",
    "1018",
    "1019",
    "1020",
    "1021",
    "1024",
    "1025",
    "1026",
    "1029",
    "1030"
 ];

router.get('/products', requireAuth, async (ctx) => {
  const id = CATEGORIES[Math.floor(CATEGORIES.length * Math.random())];
  const [{ data: { products: random } }, { data: { products: special } }, reports] = await Promise.all([
    client.get(`/coupang/bestcategories/${id}`),
    client.get('/coupang/goldbox'),
    db.Request.find({ isPublic: true }).limit(3),
  ]);
  ctx.body = {
    special,
    random,
    reports,
  };
});

export default router;
