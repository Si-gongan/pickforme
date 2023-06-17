import Router from '@koa/router';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import db from 'models';
import verifyAppleToken from 'verify-apple-id-token';
import requireAuth from 'middleware/jwt';
import ogs from 'open-graph-scraper';

const router = new Router({
  prefix: '/request'
});

// 의뢰생성
router.post("/", requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id);
  if (!user) {
    return;
  }
  await user.usePoint(1);
  const request = await db.Request.create(ctx.request.body);
  const chat = await db.Chat.create({
    text: '픽포미 추천 의뢰가 성공적으로 접수되었습니다. 답변은 1~2시간 이내에 작성되며, 추가적인 문의사항이 있으실 경우 메세지를 남겨주세요.',
    createdAt: new Date(),
    isMine: false,
    button: {
      text: '의뢰 내용 보기',
      deeplink: `/request?requestId=${request._id}`,
    },
  });
  request.chats = [chat._id];
  await request.save();
  ctx.body = {
    request: await request.populate('chats'),
    point: user.point,
  };
  ctx.status = 200;
});

router.get("/", requireAuth, async (ctx) => {
  const requests = await db.Request.find({ userId: ctx.state.user.userId }).populate('chats');
  ctx.body = requests;
});

router.get("/preview/:link", requireAuth, async (ctx) => {
  const { link } = ctx.params;
  const {
    result: {
      ogTitle: title,
      ogDescription: desc,
      ogImage: [{
        url: image,
      }] = [{ url: '' }],
    },
  } = await ogs({ url: link });

  ctx.body = {
    image,
    title,
    desc,
    link,
  };
});
/*
// 추후 규모 커지면 퍼포먼스 개선을 위해 필요한 api들

// 의뢰창 미리보기 (채팅은 한개씩. 미리보기만)
router.get("/preview", async (ctx) => {
});


// 특정 request의 채팅 모두 가져오기
router.get("/detail", async (ctx) => {

});
*/


// 채팅 입력
router.post("/chat", requireAuth, async (ctx) => {
  const body = <{ requestId: string, text: string }>ctx.request.body;
  const chat = await db.Chat.create({
    ...(body as Object),
    isMine: true,
  });
  const request = await db.Request.findById(body.requestId)
  request.chats.push(chat._id);
  await request.save();
  ctx.body = chat;
});

export default router;
