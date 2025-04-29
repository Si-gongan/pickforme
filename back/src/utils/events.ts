import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { google } from 'googleapis';
import db from 'models';

dotenv.config();

const EVENT_PRODUCT_ID = 'pickforme_plus';

// 구글 API 인증 설정
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

interface FormResponse {
  timestamp: string;
  name: string;
  phoneNumber: string;
  email: string;
}

async function processUser(response: FormResponse): Promise<void> {
  try {
    const user = await db.User.findOne({
      $or: [
        { phone: response.phoneNumber },
        { email: response.email }
      ]
    }, {
      event: 1,
      MembershipAt: 1,
      point: 1,
      aiPoint: 1,
      email: 1,
      phone: 1,
    });

    if (!user) {
      console.log(`User ${response.name} not found for phone: ${response.phoneNumber} or email: ${response.email}`);
      return;
    }

    if (user.event === 1) {
      console.log(`User ${user._id} already processed`);
      return;
    }

    throw new Error('멤버쉽 지급 부분은 아직 미완성입니다. 추후에 user 멤버쉽 로직 dev로 머지하면 그때 이 부분 완성해주세요. product와의 연계, user멤버쉽 로직 추상화 필요.');


    // user.MembershipAt = new Date();
    // user.point += 30;
    // user.aiPoint += 9999;
    // user.event = 1;
    // await user.save();

    // console.log(`new event membership for User ${user._id} membership at ${user.MembershipAt} point ${user.point} aiPoint ${user.aiPoint}`);

  } catch (error) {
    console.error(`Error processing user ${response.email}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // MongoDB 연결

    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error('MONGO_URI environment variable is required');
    }

    await mongoose.connect(uri);

    // Google Sheets API 초기화
    const sheets = google.sheets({ version: 'v4', auth });
    
    // 스프레드시트 ID와 범위 설정
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = process.env.GOOGLE_SHEET_RANGE || "'설문지 응답 시트1'!A:H";

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is required');
    }

    // 스프레드시트 데이터 가져오기
    console.log("getting data from google sheet");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    // 헤더 행 제외하고 처리
    const formResponses = rows.slice(1).map((row: string[]) => ({
      timestamp: row[0],
      name: row[1],
      email: row[2],
      phoneNumber: row[3],
    }));

    const product = await db.Product.findOne({
      productId: EVENT_PRODUCT_ID,
    });

    if (!product) {
        console.log('Product not found');
        return;
    }

    // 각 응답 처리
    for (const response of formResponses) {
      await processUser(response);
    }

    console.log('Processing completed successfully');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main(); 