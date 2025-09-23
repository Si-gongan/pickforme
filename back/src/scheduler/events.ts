import cron from 'node-cron';
import db from 'models';
import { ProductType } from 'models/product';
import { log } from 'utils/logger/logger';
import { EVENT_IDS } from '../constants/events';
import { sendPushs } from '../utils/push';

const SCHEDULER_NAME = 'events';

/**
 * 한시련 이벤트 멤버십을 가진 유저들의 상태를 확인하고,
 * 1. 9월 신청자: 한 달 후 만료
 * 2. 일반 유저: 6개월 후 만료, 한 달마다 포인트 갱신 (덮어쓰기)
 * 3. 만료 하루 전: 푸시 알림 전송
 */

const processHansiryunEventMembership = async () => {
  try {
    const now = new Date();

    // 한시련 이벤트 멤버십을 가진 유저들 조회
    const users = await db.User.find({
      event: 1, // 한시련 이벤트
      MembershipAt: { $ne: null },
    });

    const eventProduct = await db.Product.findOne({
      type: ProductType.SUBSCRIPTION,
      eventId: EVENT_IDS.HANSIRYUN,
    });

    if (!eventProduct) {
      void log.error('이벤트 상품이 존재하지 않습니다.', 'SCHEDULER', 'HIGH', {
        scheduler: SCHEDULER_NAME,
        eventId: EVENT_IDS.HANSIRYUN,
      });
      return;
    }

    const pushTokensForExpiration: string[] = []; // 만료 하루 전 푸시 대상

    for (const user of users) {
      if (!user.MembershipAt) continue;

      const membershipStartDate = new Date(user.MembershipAt);
      const lastMembershipDate = user.lastMembershipAt || membershipStartDate;

      // 9월 신청자인지 확인 (2025년 9월)
      const isSeptemberSignup =
        membershipStartDate.getFullYear() === 2025 && membershipStartDate.getMonth() === 8;

      let expirationDate: Date;

      if (isSeptemberSignup) {
        // 9월 신청자는 한 달 후 만료
        expirationDate = new Date(membershipStartDate);
        expirationDate.setMonth(expirationDate.getMonth() + 1);
      } else {
        // 일반적인 경우 6개월 후 만료
        expirationDate = new Date(membershipStartDate);
        expirationDate.setMonth(expirationDate.getMonth() + 6);
      }

      // 만료 하루 전 체크 (푸시 알림)
      const oneDayBeforeExpiration = new Date(expirationDate);
      oneDayBeforeExpiration.setDate(oneDayBeforeExpiration.getDate() - 1);

      const isOneDayBeforeExpiration =
        now.getFullYear() === oneDayBeforeExpiration.getFullYear() &&
        now.getMonth() === oneDayBeforeExpiration.getMonth() &&
        now.getDate() === oneDayBeforeExpiration.getDate();

      if (isOneDayBeforeExpiration && user.pushToken) {
        pushTokensForExpiration.push(user.pushToken);
      }

      // 만료 체크
      if (now >= expirationDate) {
        await user.processExpiredMembership();
        void log.info(
          `이벤트 멤버십 만료 처리 완료 - userId: ${user._id}, 9월신청자: ${isSeptemberSignup}`,
          'SCHEDULER',
          'LOW',
          {
            scheduler: SCHEDULER_NAME,
            userId: user._id,
            isSeptemberSignup,
          }
        );
        continue;
      }

      const oneMonthLater = new Date(lastMembershipDate);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      // 9월 신청자가 아니고, 한달이 지난 경우 포인트 갱신
      if (!isSeptemberSignup && now >= oneMonthLater) {
        await user.applyPurchaseRewards(eventProduct.getRewards(), undefined, false); // isAdditional = false
        void log.info(`이벤트 멤버십 포인트 갱신 완료 - userId: ${user._id}`, 'SCHEDULER', 'LOW', {
          scheduler: SCHEDULER_NAME,
          userId: user._id,
        });
      }
    }

    // 만료 하루 전 푸시 알림 전송
    if (pushTokensForExpiration.length > 0) {
      sendPushs(pushTokensForExpiration, {
        title: '픽포미 플러스 만료 안내',
        body: '내일이면 픽포미 플러스 무료 체험이 끝이 나요. 그동안 즐겨 쓰셨다면 멤버십으로 계속 이어가 보세요!',
        data: {
          type: 'membership_expiration',
        },
      });

      void log.info(
        `만료 하루 전 푸시 알림 전송 완료 - 대상: ${pushTokensForExpiration.length}명`,
        'SCHEDULER',
        'LOW',
        {
          scheduler: SCHEDULER_NAME,
          pushCount: pushTokensForExpiration.length,
        }
      );
    }
  } catch (error) {
    if (error instanceof Error)
      void log.error('이벤트 멤버십 처리 중 오류 발생', 'SCHEDULER', 'HIGH', {
        scheduler: SCHEDULER_NAME,
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
  }
};

/**
 * 모든 이벤트 멤버십을 체크하는 메인 함수
 */
const processEventMembership = async () => {
  await processHansiryunEventMembership();
};

export const handleEventScheduler = async () => {
  log.info('이벤트 멤버십 스케줄러 실행됨', 'SCHEDULER', 'LOW', {
    scheduler: SCHEDULER_NAME,
  });
  await processEventMembership();
};

export function registerEventScheduler() {
  cron.schedule('0 0 * * *', handleEventScheduler, {
    timezone: 'Asia/Seoul',
  });
}

export default registerEventScheduler;
