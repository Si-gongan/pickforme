import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { bigqueryClient } from './bigquery-client';
import { TABLE_SCHEMAS } from './table-schemas';
import db from 'models';
import { log } from '../../../utils/logger/logger';

export class MongodbSyncService {
  private readonly BATCH_SIZE = 1000;

  private readonly DATASET_ID = process.env.GA4_DATASET_FOUNDATION_ID!;

  /**
   * 테이블 자동 생성 함수
   */
  private async ensureTableExists(tableName: string) {
    try {
      console.log(`🔍 Checking table ${this.DATASET_ID}.${tableName}...`);

      const dataset = bigqueryClient.dataset(this.DATASET_ID, {
        location: 'asia-northeast3',
      });

      const table = dataset.table(tableName);
      const [exists] = await table.exists();

      if (!exists) {
        const schema = TABLE_SCHEMAS[tableName];
        if (!schema) {
          throw new Error(`Schema not found for table: ${tableName}`);
        }

        console.log(`🏗️ Creating table ${this.DATASET_ID}.${tableName} with schema...`);
        await table.create({
          schema: schema,
          location: 'asia-northeast3',
        });
        console.log(`✅ Table ${this.DATASET_ID}.${tableName} created successfully`);
      } else {
        console.log(`✅ Table ${this.DATASET_ID}.${tableName} already exists`);
      }
    } catch (error) {
      console.error(`❌ Failed to create table ${this.DATASET_ID}.${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 테이블 데이터만 삭제하는 함수
   */
  private async clearTableData(tableName: string) {
    try {
      console.log(`🗑️ Clearing data from table ${this.DATASET_ID}.${tableName}...`);

      const dataset = bigqueryClient.dataset(this.DATASET_ID, {
        location: 'asia-northeast3',
      });
      const table = dataset.table(tableName);

      // 테이블의 모든 데이터 삭제 (TRUNCATE)
      await table.delete();
      console.log(`✅ Cleared data from table ${this.DATASET_ID}.${tableName}`);

      // 테이블 재생성 (빈 테이블)
      const schema = TABLE_SCHEMAS[tableName];
      if (!schema) {
        throw new Error(`Schema not found for table: ${tableName}`);
      }

      await table.create({
        schema: schema,
        location: 'asia-northeast3',
      });
      console.log(`✅ Recreated empty table ${this.DATASET_ID}.${tableName}`);
    } catch (error) {
      console.error(`❌ Failed to clear table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 모든 데이터를 증분 동기화
   */
  async syncAllData() {
    try {
      log.info('MongoDB 동기화 시작', 'SCHEDULER', 'LOW');

      // 테이블 존재 확인
      console.log('🔄 Ensuring tables exist...');
      await this.ensureTableExists('users');
      await this.ensureTableExists('purchases');
      await this.ensureTableExists('purchase_failures');

      await this.clearTableData('users');
      await this.clearTableData('purchases');
      await this.clearTableData('purchase_failures');

      const lastSync = await this.getLastSyncTime();

      await Promise.all([
        this.syncUsers(lastSync),
        this.syncPurchases(lastSync),
        this.syncPurchaseFailures(lastSync),
      ]);

      await this.updateLastSyncTime(new Date());

      log.info('MongoDB 동기화 완료', 'SCHEDULER', 'LOW');
    } catch (error) {
      void log.error('MongoDB 동기화 실패', 'SCHEDULER', 'HIGH', { error });
      throw error;
    }
  }

  /**
   * 유저 데이터 동기화
   */
  private async syncUsers(lastSyncTime?: Date) {
    const query = lastSyncTime ? { updatedAt: { $gt: lastSyncTime } } : {};

    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const users = await db.User.find(query).skip(skip).limit(this.BATCH_SIZE).lean();

      if (users.length === 0) {
        hasMore = false;
        break;
      }

      // BigQuery에 맞는 형태로 변환 (타입 방어 로직 추가)
      const transformedUsers = users.map((user) => ({
        _id: user._id.toString(),
        email: user.email,
        point: Number(user.point) || 0,
        aiPoint: Number(user.aiPoint) || 0,
        level: Number(user.level) || 1,
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        MembershipAt: user.MembershipAt?.toISOString() || null,
        lastMembershipAt: user.lastMembershipAt?.toISOString() || null,
        event: user.event || null,
        createdAt: user.createdAt?.toISOString() || null,
        updatedAt: user.updatedAt?.toISOString() || null,
      }));

      await this.insertBatchToBigQuery('users', transformedUsers);
      skip += this.BATCH_SIZE;
    }

    log.info(`유저 데이터 동기화 완료 (${skip}개 레코드)`, 'SCHEDULER', 'LOW');
  }

  /**
   * 구매 데이터 동기화
   */
  private async syncPurchases(lastSyncTime?: Date) {
    const query = lastSyncTime ? { updatedAt: { $gt: lastSyncTime } } : {};

    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const purchases = await db.Purchase.find(query).skip(skip).limit(this.BATCH_SIZE).lean();

      if (purchases.length === 0) {
        hasMore = false;
        break;
      }

      // BigQuery에 맞는 형태로 변환
      const transformedPurchases = purchases.map((purchase) => ({
        _id: purchase._id.toString(),
        userId: purchase.userId.toString(),
        productId: purchase.product?.productId || null,
        platform: purchase.product?.platform || null,
        type: purchase.product?.type || null,
        isExpired: purchase.isExpired || false,
        createdAt: purchase.createdAt.toISOString(),
        updatedAt: purchase.updatedAt.toISOString(),
      }));

      await this.insertBatchToBigQuery('purchases', transformedPurchases);
      skip += this.BATCH_SIZE;
    }

    log.info(`구매 데이터 동기화 완료 (${skip}개 레코드)`, 'SCHEDULER', 'LOW');
  }

  /**
   * 구매 실패 데이터 동기화
   */
  private async syncPurchaseFailures(lastSyncTime?: Date) {
    const query = lastSyncTime ? { updatedAt: { $gt: lastSyncTime } } : {};

    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const failures = await db.PurchaseFailure.find(query)
        .skip(skip)
        .limit(this.BATCH_SIZE)
        .lean();

      if (failures.length === 0) {
        hasMore = false;
        break;
      }

      // BigQuery에 맞는 형태로 변환
      const transformedFailures = failures.map((failure) => {
        // stringify 하기 전에 객체인지 확인
        const stringifyIfObject = (data: any) =>
          data && typeof data === 'object' ? JSON.stringify(data) : null;

        return {
          _id: failure._id.toString(),
          userId: failure.userId?.toString() || null,
          productId: failure.productId?.toString() || null,
          status: failure.status || null,
          platform: failure.platform || null,
          createdAt: failure.createdAt.toISOString(),
          updatedAt: failure.updatedAt.toISOString(),
        };
      });

      await this.insertBatchToBigQuery('purchase_failures', transformedFailures);
      skip += this.BATCH_SIZE;
    }

    log.info(`구매 실패 데이터 동기화 완료 (${skip}개 레코드)`, 'SCHEDULER', 'LOW');
  }

  /**
   * BigQuery에 배치 데이터 삽입
   */
  private async insertBatchToBigQuery(tableName: string, data: any[]) {
    if (data.length === 0) return;

    try {
      console.log(`📊 Inserting data to ${this.DATASET_ID}.${tableName}...`);

      const dataset = bigqueryClient.dataset(this.DATASET_ID, {
        location: 'asia-northeast3',
      });
      const table = dataset.table(tableName);

      await table.insert(data);
      console.log(`✅ Inserted ${data.length} records to ${this.DATASET_ID}.${tableName}`);
    } catch (error) {
      // 중복 데이터 오류는 무시 (upsert 대신)
      if (error instanceof Error && error.message?.includes('duplicate')) {
        log.warn(`중복 데이터 무시: ${tableName}`, 'SCHEDULER', 'LOW');
      } else {
        console.error(`❌ Failed to insert data to ${this.DATASET_ID}.${tableName}:`, error);
        console.error(`❌ Error details:`, error);
        throw error;
      }
    }
  }

  /**
   * 마지막 동기화 시간 조회
   */
  private async getLastSyncTime(): Promise<Date | undefined> {
    // Redis나 별도 테이블에서 마지막 동기화 시간 조회
    // 여기서는 간단히 환경변수나 기본값 사용
    const lastSync = process.env.LAST_MONGODB_SYNC_TIME;
    return lastSync ? new Date(lastSync) : undefined;
  }

  /**
   * 마지막 동기화 시간 업데이트
   */
  private async updateLastSyncTime(time: Date) {
    // Redis나 별도 테이블에 마지막 동기화 시간 저장
    // 여기서는 환경변수 업데이트 (실제로는 Redis 사용 권장)
    process.env.LAST_MONGODB_SYNC_TIME = time.toISOString();
    void log.info(`마지막 동기화 시간 업데이트: ${time.toISOString()}`, 'SCHEDULER', 'LOW');
  }
}

export const mongodbSyncService = new MongodbSyncService();
