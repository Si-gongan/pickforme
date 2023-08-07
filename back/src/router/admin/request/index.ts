import Router from '@koa/router';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import db from 'models';
import ogs from 'open-graph-scraper';
import socket from 'socket';
import sendPush from 'utils/push';


import { RequestStatus } from 'models/request';

const router = new Router({
  prefix: '/request'
});

router.post("/answer", async (ctx) => {
  const body = (<any>ctx.request).body;
  const request = await db.Request.findById(body.requestId)
  if (!request.answer) {
    const chat = await db.Chat.create({
      userId: request.userId,
      requestId: request._id,
      text: '결과 리포트가 도착했습니다. 확인 후 문의사항이 있으실 경우 채팅을 남겨주세요. 1일 뒤 자동으로 의뢰가 종료됩니다.',
      createdAt: new Date(),
      isMine: false,
      button: {
        text: '결과물 보기',
        deeplink: `/request?requestId=${request._id}`,
      },
    });
    request.chats.push(chat._id);
    request.unreadCount += 1;
    const session = await db.Session.findOne({ userId: request.userId });
    if (session) {
      socket.emit(session.connectionId, 'message', { chat, unreadCount: request.unreadCount });
    }
    const user = await db.User.findById(request.userId);
    if (user && user.pushToken && (user.push.chat === 'report' || user.push.chat === 'all')) {
      sendPush({
        to: user.pushToken,
        body: '결과 리포트가 도착했습니다.',
      });
    }
  }
  request.answer = body.answer;
  request.status = RequestStatus.SUCCESS;
  await request.save();
  ctx.body = await request.populate('chats');
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
  const request = await db.Request.findById(body.requestId)
  const chat = await db.Chat.create({
    ...(body as Object),
    isMine: false,
    userId: request.userId,
  });
  request.chats.push(chat._id);
  request.unreadCount += 1;
  await request.save();
  const session = await db.Session.findOne({ userId: request.userId });
  if (session) {
    socket.emit(session.connectionId, 'message', { chat, unreadCount: request.unreadCount });
  }
  const user = await db.User.findById(request.userId);
  if (user && user.pushToken && user.push.chat === 'all') {
    sendPush({
      to: user.pushToken,
      body: chat.text,
    });
  }
  ctx.body = chat;
});

export default router;
