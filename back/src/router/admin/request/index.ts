import Router from '@koa/router';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import db from 'models';
import ogs from 'open-graph-scraper';
import socket from 'socket';

const router = new Router({
  prefix: '/request'
});

// 답변 생성
// router.post

router.get("/", async (ctx) => {
  const requests = await db.Request.find({}).populate('chats');
  ctx.body = requests;
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
