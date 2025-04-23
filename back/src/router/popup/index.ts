import Router from '@koa/router';
import Popup from '../../models/popup';
import db from 'models';
import requireAuth from 'middleware/jwt';
import requireAdmin from 'middleware/admin';

const router = new Router({
  prefix: '/popup',
});

router.get('/', async (ctx) => {
  const popups = await Popup.find({});
  ctx.body = popups;
});

router.get('/active', requireAuth, async (ctx) => {
  const popups = await Popup.find({});

  const user = await db.User.findById(ctx.state.user._id);

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: '사용자를 찾을 수 없습니다.' };
    return;
  }
 
  if(!user.hide || !Array.isArray(user.hide)) {
    user.hide = [];
  }

  const hidePopupIds = new Set(user.hide.map(id => id.toString()));
  
  const filteredPopups = popups.filter((popup) => !hidePopupIds.has(popup.popup_id));

  ctx.body = filteredPopups;
});

// 팝업 생성
router.post('/', async (ctx) => {
  try {
    const { popup_id, title, description, isActive } = ctx
      .request.body as {
      popup_id: string;
      title: string;
      description?: string;
      isActive?: boolean;
    };

    // 필수 필드 검증
    if (!popup_id || !title) {
      ctx.status = 400;
      ctx.body = {
        error: 'popup_id와 title은 필수 입력값입니다.',
      };
      return;
    }

    const popup = new Popup({
      popup_id,
      title,
      description,
      isActive: isActive || false,
    });

    await popup.save();
    ctx.status = 201;
    ctx.body = popup;
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as any).code === 11000
    ) {
      ctx.status = 400;
      ctx.body = { error: '이미 존재하는 popup_id입니다.' };
      return;
    }
    ctx.status = 500;
    ctx.body = { error: '서버 오류가 발생했습니다.' };
  }
});

// 팝업 삭제
router.delete('/:popup_id',  async (ctx) => {
  try {
    const { popup_id } = ctx.params;
    const result = await Popup.findOneAndDelete({
      popup_id,
    });

    if (!result) {
      ctx.status = 404;
      ctx.body = {
        error: '해당하는 팝업을 찾을 수 없습니다.',
      };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      message: '팝업이 성공적으로 삭제되었습니다.',
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '서버 오류가 발생했습니다.' };
  }
});

export default router;
