// back/src/scheduler/iap.ts
import schedule from 'node-schedule';
import db from 'models';
import iapValidator from 'utils/iap';
import socket from 'socket';
import sendPush from 'utils/push';

/**
 * 매일 0시에 만료되지 않은 구독 정보를 조회하고,
 * 외부 결제사(구글/애플)에서 환불/만료 여부를 검증합니다.
 * 환불/만료된 구독은 isExpired를 true로 변경하고,
 * 해당 유저의 포인트/aiPoint를 0으로 초기화합니다.
 */
const checkSubscriptions = async () => {
  const purchases = await db.Purchase.find({
    isExpired: false,
  });

  for (const purchase of purchases) {
    const purchaseData = await iapValidator.validate(
      purchase.receipt,
      purchase.product.productId
    );

    // 구독이 유효한 경우
    if (purchaseData) {

      if (purchaseData.transactionId !== purchase.purchase.transactionId) {
        purchase.purchase = purchaseData;
        await purchase.save();
        const user = await db.User.findById(purchase.userId);
        const product = await db.Product.findOne({
          productId: purchase.product.productId,
        });
        if (!user || !product) {
          // TODO: 예외처리 필요.
          // TODO: 로깅기능 추가 필요.
          console.log('[Schedule ERROR] : ', 'user or product not found');
          continue;
        }
        // 포인트 업데이트
        await user.applyPurchaseRewards(product.getRewards());

          // 소켓으로 포인트 업데이트 알림
          const session = await db.Session.findOne({ userId: user._id });
          if (session) {
            socket.emit(session.connectionId, 'point', user.point);
          }

          // 푸시 알림
          if (user.pushToken) {
            sendPush({
              to: user.pushToken,
              body: '멤버십 픽이 충전되었습니다',
            });
          }
      }
    } else {
      // 구독이 환불/만료된 경우
      // FIXME: 환불시의 로직도 추상화 해야함.
      purchase.isExpired = true;
      await purchase.save();
      try {
        await db.User.findOneAndUpdate(
          { _id: purchase.userId },
          { point: 0, aiPoint: 0 }
        );
      } catch (error) {
        console.log('[Schedule ERROR] : ', error);
      }
    }
  }
};

export function registerIAPScheduler() {
  if (process.env.NODE_ENV === 'production') {
    schedule.scheduleJob('0 0 0 * * *', checkSubscriptions);
  }
}

export default registerIAPScheduler