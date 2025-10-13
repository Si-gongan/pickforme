import 'env';

import mongoose from 'mongoose';
import { google } from 'googleapis';
import db from 'models';
import { ProductReward } from 'models/product';
import { EVENT_IDS } from 'constants/events';

/**
 * 픽포미 체험단 이벤트 신청자 대상으로 멤버쉽 처리를 해주기 위한 스크립트입니다.
 * back 폴더 아래에 google_api_credentials.json 파일을 넣어주고 (노션 픽포미 개발문서 > .env 파일 참고)
 * env를 production용 .env로 교체한다음에
 * (노션 픽포미 개발문서 > .env의 production env로 교체.)
 * npm run membership-events-pickforme 로 실행해주세요.
 *
 * 여기서 지급하게 되는 포인트는 DB에 저장된 픽포미 체험단 이벤트 멤버쉽 상품의 포인트 값입니다.
 * 만약 해당 상품이 없으면 에러가 발생합니다.
 *
 * 멤버쉽 처리 후 스프레드시트의 해당 row의 멤버쉽 처리 여부 컬럼을 'o'로 업데이트합니다.
 *
 * 주의! 스크립트 실행 이후에는 다시 local용 .env로 변경해주세요!
 */

// 구글 API 인증 설정 (읽기/쓰기 권한 필요)
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.EVENTS_PICKFORME_TEST_CREDENTIALS,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
});

interface FormResponse {
  timestamp: string;
  name: string;
  phoneNumber: string;
  email: string;
  membershipProcessed: string;
  rowIndex: number; // 스프레드시트에서의 실제 row 인덱스 (헤더 제외)
  activityStarted: string; // L컬럼: 활동시작여부 ('o'인 경우만 선택 처리 가능)
}

const eventOverridedUserEmailList: string[] = [];

async function processUser(
  response: FormResponse,
  eventRewards: ProductReward,
  sheets: any,
  spreadsheetId: string
): Promise<void> {
  try {
    const normalizedPhoneNumber = response.phoneNumber.replace(/-/g, '');

    const user = await db.User.findOne(
      {
        $or: [{ phone: normalizedPhoneNumber }, { email: response.email }],
      },
      {
        event: 1,
        MembershipAt: 1,
        point: 1,
        aiPoint: 1,
        email: 1,
        phone: 1,
      }
    );

    if (!user) {
      console.log(
        `유저 ${response.name}을 찾을 수 없습니다. phone: ${normalizedPhoneNumber} or email: ${response.email}`
      );
      return;
    }

    if (user.event === EVENT_IDS.PICKFORME_TEST) {
      console.log(`유저 ${response.name} 이미 처리되었습니다.`);
      return;
    }

    if (response.membershipProcessed === 'o') {
      console.log(`유저 ${response.name} 이미 처리되었습니다2.`);
      return;
    }

    // 이미 기존 이벤트가 존재하는 경우.
    if (user.event !== null) {
      if (user.event != EVENT_IDS.HANSIRYUN) {
        // 한시련 이외의 이벤트의 경우에는 아직 처리방침 x. 이벤트 처리하지 않고 그대로 반환.
        console.log(`유저 ${response.name} ${user.email}은 다른 이벤트가 적용중입니다.`);
        return;
      }

      if (!user.MembershipAt) {
        return;
      }

      const membershipStartDate = new Date(user.MembershipAt);
      const isSeptemberSignUp =
        membershipStartDate.getFullYear() == 2025 && membershipStartDate.getMonth() == 8;

      if (isSeptemberSignUp) {
        membershipStartDate.setMonth(membershipStartDate.getMonth() + 1);
      } else {
        membershipStartDate.setMonth(membershipStartDate.getMonth() + 6);
      }

      const testGroupExpirationDate = new Date();

      testGroupExpirationDate.setMonth(testGroupExpirationDate.getMonth() + 3);

      if (testGroupExpirationDate > membershipStartDate) {
        eventOverridedUserEmailList.push(user.email);
        console.log(
          `유저 ${response.name}: ${response.email} 한시련 이벤트에서 픽포미 체험단 이벤트로 변경.`
        );
        await user.applyEventRewards(eventRewards, EVENT_IDS.PICKFORME_TEST);
      } else {
        console.log(
          `유저 ${response.name}: ${response.email} 는 한시련 이벤트 대상자입니다. 이벤트를 적용하지 않습니다.`
        );
      }
    } else {
      if (user.MembershipAt) {
        // 멤버쉽 처리 되어 있는 경우, 기존 멤버쉽은 만료처리하고 픽포미 체험단 이벤트 적용.

        const membershipStartDate = new Date(user.MembershipAt);

        membershipStartDate.setMonth(membershipStartDate.getMonth() + 1);

        await user.processExpiredMembership();

        await user.applyEventRewards(eventRewards, EVENT_IDS.PICKFORME_TEST);

        console.log(
          `유저 ${response.name}: ${response.email} 멤버쉽에서 픽포미 체험단 이벤트로 변경.`
        );
      } else {
        // 멤버쉽 처리 되어 있지 않은 경우,
        await user.applyEventRewards(eventRewards, EVENT_IDS.PICKFORME_TEST);

        console.log(`유저 ${response.name}: ${response.email} 픽포미 체험단 이벤트 적용 완료.`);
      }
    }

    // 스프레드시트의 해당 row의 멤버쉽 처리 여부 컬럼을 'o'로 업데이트
    // 헤더가 있으므로 실제 row는 response.rowIndex + 2 (헤더 1개 + 0-based index)
    // K컬럼은 11번째 컬럼이므로 K로 업데이트
    const updateRange = `설문지 응답 시트1!K${response.rowIndex + 2}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['o']],
      },
    });

    console.log(
      `유저 ${response.name} userId ${user._id} MembershipAt ${user.MembershipAt} 처리 완료 및 스프레드시트 업데이트 완료`
    );
  } catch (error) {
    console.error(`유저 ${response.email} 처리 중 오류 발생:`, error);
    throw error;
  }
}

async function main() {
  try {
    // 실행 옵션: 활동시작여부가 'o'인 대상만 처리
    const withSelected =
      process.env.WITH_SELECTED === 'true' || process.argv.includes('--withSelected');

    // MongoDB 연결
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI environment variable is required');
    }

    await mongoose.connect(uri);

    // Google Sheets API 초기화
    const sheets = google.sheets({ version: 'v4', auth });

    // 스프레드시트 ID와 범위 설정
    const spreadsheetId = process.env.EVENTS_PICKFORME_TEST_GOOGLE_SHEET_ID;
    const range = '설문지 응답 시트1!A:L';

    if (!spreadsheetId) {
      throw new Error('EVENTS_PICKFORME_TEST_GOOGLE_SHEET_ID environment variable is required');
    }

    // 스프레드시트 데이터 가져오기
    console.log('getting data from google sheet');
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = resp.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    // 헤더 행 제외하고 처리
    const formResponses = rows.slice(1).map((row: string[], index: number) => ({
      timestamp: row[0],
      name: row[2], // 이름은 C컬럼 (인덱스 2)
      email: row[4], // 이메일은 E컬럼 (인덱스 4)
      phoneNumber: row[3], // 전화번호는 D컬럼 (인덱스 3)
      membershipProcessed: row[10], // 멤버쉽 지급여부는 K컬럼 (인덱스 10)
      rowIndex: index, // 0-based index (헤더 제외)
      activityStarted: row[11], // 활동시작여부는 L컬럼 (인덱스 11)
    }));

    const filteredResponses = withSelected
      ? formResponses.filter((r) => r.activityStarted === 'o')
      : formResponses;

    console.log(
      `총 응답: ${formResponses.length}, 처리 대상(withSelected=${withSelected}): ${filteredResponses.length}`
    );

    const eventProducts = await db.Product.findOne({
      eventId: EVENT_IDS.PICKFORME_TEST,
    });

    if (!eventProducts) {
      console.log('No event products found');
      return;
    }

    const eventRewards = eventProducts.getRewards();

    // 각 응답 처리
    for (const response of filteredResponses) {
      await processUser(response, eventRewards, sheets, spreadsheetId);
    }

    console.log(`이벤트 오버라이드 유저 리스트: ${eventOverridedUserEmailList}`);

    console.log('Processing completed successfully');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Error in main process:', error);
    process.exit(1);
  });
}
