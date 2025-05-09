// back/src/scheduler/iap.ts
import cron from 'node-cron';
import db from 'models';
import iapValidator from 'utils/iap';
import socket from 'socket';
import sendPush from 'utils/push';
import { log } from 'utils/logger/logger';
import { LogContext, LogSeverity } from 'utils/logger/types';

const SCHEDULER_NAME = 'iap';

/**
 * 매일 0시에 만료되지 않은 구독 정보를 조회하고,
 * 외부 결제사(구글/애플)에서 환불/만료 여부를 검증합니다.
 * 환불/만료된 구독은 isExpired를 true로 변경하고,
 * 해당 유저의 포인트/aiPoint를 0으로 초기화합니다.
 */
const checkSubscriptions = async () => {
  try {
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
            log.error(LogContext.SCHEDULER, 'user or product not found', LogSeverity.HIGH, {
              scheduler: SCHEDULER_NAME,
              purchaseId: purchase._id,
            });
            continue;
          }
          // 포인트 업데이트
          await user.applyPurchaseRewards(product.getRewards());
          log.info(
            LogContext.SCHEDULER,
            `포인트 업데이트 완료 - userId: ${user._id}`,
            LogSeverity.LOW,
            {
              scheduler: SCHEDULER_NAME,
              userId: user._id,
            }
          );

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
        purchase.updateExpiration();

        try {
          await db.User.findOneAndUpdate({ _id: purchase.userId }, { point: 0, aiPoint: 0 });
          log.info(
            LogContext.SCHEDULER,
            `구독 만료 처리 완료 - userId: ${purchase.userId}`,
            LogSeverity.LOW,
            {
              scheduler: SCHEDULER_NAME,
              userId: purchase.userId,
            }
          );
        } catch (error) {
          log.error(LogContext.SCHEDULER, '구독 만료 처리 중 오류 발생', LogSeverity.HIGH, {
            scheduler: SCHEDULER_NAME,
            error,
            userId: purchase.userId,
          });
        }
      }
    }
  } catch (error) {
    if (error instanceof Error)
      log.error(LogContext.SCHEDULER, '구독 검증 중 오류 발생', LogSeverity.HIGH, {
        scheduler: SCHEDULER_NAME,
        message: error.name,
        stack: error.stack,
        name: error.name,
      });
  }
};

export const handleIAPScheduler = async () => {
  log.info(LogContext.SCHEDULER, 'IAP 스케줄러 실행됨', LogSeverity.LOW, {
    scheduler: SCHEDULER_NAME,
  });
  await checkSubscriptions();
};

export function registerIAPScheduler() {
  cron.schedule('0 0 * * *', handleIAPScheduler, {
    timezone: 'Asia/Seoul',
  });
}

export default registerIAPScheduler;
