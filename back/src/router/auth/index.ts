import Router from '@koa/router';
import axios from 'axios';
import db from 'models';
import verifyAppleToken from 'verify-apple-id-token';
import requireAuth from 'middleware/jwt';
import {
  PushSetting,
} from 'models/user/types';

const router = new Router({
  prefix: '/auth',
});

const handleLogin = async (email: string) => {
  let user = await db.User.findOne({
    email,
  });

  // 상황에 따라 사용할 변수들
  let isRegister = false;
  let isNewLoginInEvent = false;

  if (!user) {
    // 신규 회원
    user = await db.User.create({
      email,
      point: 0,
      aiPoint: 15,
    });
    const usedEmail = await db.User.findOne({
      originEmail: email,
    });
    if (!usedEmail) {
      // 과거 회원 기록이 없는 경우
      
    } else {
      // 과거 회원 기록이 있는 경우
      const isNewLoginAfterUpdate = +new Date() - +usedEmail.lastLoginAt < 1000;
    }
    isRegister = true;
  } else {
    // 기존 회원
    const isNewLoginAfterUpdate = +new Date() - +user.lastLoginAt < 1000;

    if(user.MembershipAt){
    const today = new Date(); // 현재 날짜 객체 생성
    const dayOfMonth = today.getDate(); // 오늘 날짜의 '일' 값 가져오기
    const mDay = user.MembershipAt;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // mDay가 6개월 전인지 확인 (연도와 월이 같아야 함)
    const isSixMonthsAgo = mDay.getFullYear() == sixMonthsAgo.getFullYear() && mDay.getMonth() == sixMonthsAgo.getMonth();
    if (dayOfMonth == 1 && user.event == 1) {
      if(isSixMonthsAgo){
        user.point = 0;
        user.aiPoint=0;
        user.event=0
      }else{
        user.point = 15;
        user.aiPoint = 99999;
      }
      }
    }

    // update last login date
    user.lastLoginAt = new Date();
  }

  // 이 부분도 스케쥴러에서 작업하도록 처리했습니다. branch: feat/membership-scheduler
  // NOTE: 환불 후 로그인을 위한 것
  // const subCheckRst = await subscriptionCheck(user._id);
  // if (subCheckRst) {
  //   user.point = 0;
  //   user.aiPoint = 0;
  // }

  await user.save();

  const token = await user.generateToken();
  const refreshToken = await user.generateRefreshToken();
  
  return {
    user: {
      ...user.toObject(),
      refreshToken,
      token,
    },
    isRegister,
    isNewLoginInEvent,
  };
};

router.post('/google', async (ctx) => {
  const {
    accessToken,
  } = <{ accessToken: string }>ctx.request.body;
  const {
    data,
  } = await axios.get<{ email: string; verified_email: boolean }>(
    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}
  `,
  );
  const {
    email, verified_email,
  } = data;
  if (!verified_email || !email) {
    ctx.body = {
      error: '잘못된 접근입니다',
    };
    return;
  }

  ctx.body = await handleLogin(email);
});

router.post('/kakao', async (ctx) => {
  const {
    accessToken,
  } = <{ accessToken: string }>ctx.request.body;
  const data = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const {
    is_email_verified, is_email_valid, email,
  } = data?.data?.kakao_account || {};
  if (!is_email_valid || !is_email_verified || !email) {
    ctx.body = {
      error: '잘못된 접근입니다',
    };
    return;
  }

  ctx.body = await handleLogin(email);
});

router.post('/apple', async (ctx) => {
  const {
    identityToken,
  } = <{ identityToken: string }>ctx.request.body;
  const {
    email_verified, email,
  } = await verifyAppleToken({
    idToken: identityToken,
    clientId: 'com.sigonggan.pickforme',
  });

  if (!email_verified || !email) {
    ctx.body = {
      error: '잘못된 접근입니다',
    };
    return;
  }
  ctx.body = await handleLogin(email);
});

router.post('/pushtoken', requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id);
  if (user) {
    const {
      token,
    } = <{ token: string }>ctx.request.body;
    user.pushToken = token;
    await user.save();
    ctx.status = 200;
  }
});

router.put('/pushsetting', requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id);
  if (user) {
    user.push = <PushSetting>ctx.request.body;
    await user.save();
    ctx.body = ctx.request.body;
  }
});

router.post('/quit', requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id);
  if (!user) {
    ctx.status = 404;
    return;
  }
  user.originEmail = user.email;
  user.email = `${user.email}_deleted_${new Date()}`;
  await user.save();
  ctx.status = 200;
});

export default router;
