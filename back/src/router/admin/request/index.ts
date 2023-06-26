import Router from '@koa/router';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import db from 'models';
import ogs from 'open-graph-scraper';
import socket from 'socket';

const router = new Router({
  prefix: '/request'
});

router.post("/answer", async (ctx) => {
  const body = (<any>ctx.request).body;
  const request = await db.Request.findById(body.requestId)
  request.answer = {
    text: '안녕하세요, 말씀해주신 ‘8만원 이하’ ‘휴대성’ ‘5시간 녹음 가능’ 조건을 반영한 녹음기를 쇼핑몰 플랫폼에서 리뷰>와 평점, 가격이 좋은 세 상품을 시공간 해설진이 소개해드릴게요.',
    products: [{
      title: '디큐브 볼펜 녹음기 / VR-7000',
      price: 50000,
      desc: '디큐브의 휴대용 소형 볼펜녹음기를 소개합니다. 검정색 볼펜 형태라서 가지고 다니기도 쉽고 외관상 녹음기인지 >알아보기 힘들기에 편리하게 사용할 수 있는 제품입니다. 가로 1.4cm, 세로 14cm, 무게 25g으로 가볍게 지니고 다니기에 좋습니다. 원거리에서도 정확하게 녹음을 할 수 있고, 음성 인식이 인식될 때만 자동으로 ...',
      tags: ['쿠팡', '평점 4.3점, 리뷰 407개'],
      url: 'https://naver.com'
    }],
  };
  const chat = await db.Chat.create({
    text: '결과 리포트가 도착했습니다. 확인 후 문의사항이 있으실 경우 채팅을 남겨주세요. 1일 뒤 자동으로 의뢰가 종료됩니다.',
    createdAt: new Date(),
    isMine: true,
    button: {
      text: '결과물 보기',
      deeplink: `/request?requestId=${request._id}`,
    },
  });
  request.chats.push(chat._id);
  await request.save();
  ctx.body = chat;
});

router.get("/", async (ctx) => {
  const requests = await db.Request.find({}).populate('chats');
  ctx.body = requests;
});

/*
// 추후 규모 커지면 퍼포먼스 개선을 위해 필요한 api들

// 의뢰창 미리보기 (채팅은 한개씩. 미리보기만)
router.get("/preview", async (ctx) => {
});
*/

router.get("/detail/:requestId", async (ctx) => {
  const { requestId } = ctx.params;
  const request = await db.Request.findById(requestId).populate('chats');
  ctx.body = request;
});


// 채팅 입력
router.post("/chat", async (ctx) => {
  const body = (<any>ctx.request).body;
  const chat = await db.Chat.create({
    ...(body as Object),
    isMine: false,
  });
  const request = await db.Request.findById(body.requestId)
  request.chats.push(chat._id);
  await request.save();
  const connectionId = await db.Session.findOne({ userId: request.userId });
  if (connectionId) {
    socket.emit(connectionId, 'message', chat);
  }
  ctx.body = chat;
});

export default router;
