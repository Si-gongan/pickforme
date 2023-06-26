import Router from '@koa/router';
import db from 'models';
import requireAuth from 'middleware/jwt';
import ogs from 'open-graph-scraper';
import socket from '../../socket';

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
  const request = await db.Request.create({
    ...(<any>ctx.request).body,
    // answer는 나중에 admin에서 생성
    answer: {
      text: '안녕하세요, 말씀해주신 ‘8만원 이하’ ‘휴대성’ ‘5시간 녹음 가능’ 조건을 반영한 녹음기를 쇼핑몰 플랫폼에서 리뷰와 평점, 가격이 좋은 세 상품을 시공간 해설진이 소개해드릴게요.',
      products: [{
        title: '디큐브 볼펜 녹음기 / VR-7000',
        price: 50000,
        desc: '디큐브의 휴대용 소형 볼펜녹음기를 소개합니다. 검정색 볼펜 형태라서 가지고 다니기도 쉽고 외관상 녹음기인지 알아보기 힘들기에 편리하게 사용할 수 있는 제품입니다. 가로 1.4cm, 세로 14cm, 무게 25g으로 가볍게 지니고 다니기에 좋습니다. 원거리에서도 정확하게 녹음을 할 수 있고, 음성 인식이 인식될 때만 자동으로 ...',
        tags: ['쿠팡', '평점 4.3점, 리뷰 407개'],
        url: 'https://naver.com'
      }],
    },
  });
  const chat = await db.Chat.create({
    text: '픽포미 추천 의뢰가 성공적으로 접수되었습니다. 답변은 1~2시간 이내에 작성되며, 추가적인 문의사항이 있으실 경우 메세지를 남겨주세요.',
    createdAt: new Date(),
    isMine: false,
    button: {
      text: '의뢰 내용 보기',
      deeplink: `/request?requestId=${request._id}`,
    },
  });
  // 이 chat은 answer admin에 의해 자동생성
  const chat2 = await db.Chat.create({
    text: '결과 리포트가 도착했습니다. 확인 후 문의사항이 있으실 경우 채팅을 남겨주세요. 1일 뒤 자동으로 의뢰가 종료됩니다.',
    createdAt: new Date(),
    isMine: false,
    button: {
      text: '결과물 보기',
      deeplink: `/request?requestId=${request._id}`,
    },
  });
  request.chats = [chat._id, chat2._id];
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
  const body = (<any>ctx.request).body;
  const chat = await db.Chat.create({
    ...(body as Object),
    isMine: true,
  });
  const request = await db.Request.findById(body.requestId)
  request.chats.push(chat._id);
  await request.save();
  // 추후 admin들 broadcast socket 통신 or 어드민별 assign시스템 구축
  ctx.body = chat;
});

export default router;
