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

      // 테이블 존재 확인
      const [exists] = await table.exists();

      if (exists) {
        // 데이터만 삭제 (테이블 구조는 유지)
        const query = `DELETE FROM \`${this.DATASET_ID}.${tableName}\` WHERE TRUE`;
        const [job] = await bigqueryClient.createQueryJob({
          query: query,
          location: 'asia-northeast3',
        });

        await job.getQueryResults();
        console.log(`✅ Cleared data from table ${this.DATASET_ID}.${tableName}`);
      } else {
        // 테이블이 없으면 새로 생성
        const schema = TABLE_SCHEMAS[tableName];
        if (!schema) {
          throw new Error(`Schema not found for table: ${tableName}`);
        }

        await table.create({
          schema: schema,
          location: 'asia-northeast3',
        });
        console.log(`✅ Created table ${this.DATASET_ID}.${tableName}`);
      }
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

      // jobs.ts에서 정의된 MongoDB 동기화 작업들만 실행
      const { mongodbSyncJobs } = await import('../scheduler/jobs');

      const lastSync = await this.getLastSyncTime();

      // 각 작업을 순차적으로 실행
      for (const job of mongodbSyncJobs) {
        if (job.type === 'mongodb_sync') {
          console.log(`🔄 Processing ${job.name}...`);

          // 테이블 존재 확인
          await this.ensureTableExists(job.destinationTable);

          // 기존 데이터 삭제
          await this.clearTableData(job.destinationTable);

          // 데이터 동기화
          await this.syncCollection(job.collection!, job.destinationTable, lastSync);

          console.log(`✅ ${job.name} 완료`);
        }
      }

      await this.updateLastSyncTime(new Date());

      log.info('MongoDB 동기화 완료', 'SCHEDULER', 'LOW');
    } catch (error) {
      void log.error('MongoDB 동기화 실패', 'SCHEDULER', 'HIGH', { error });
      throw error;
    }
  }

  /**
   * 동적으로 컬렉션 동기화
   */
  private async syncCollection(collectionName: string, tableName: string, lastSyncTime?: Date) {
    const query = lastSyncTime ? { updatedAt: { $gt: lastSyncTime } } : {};

    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      let data: any[];

      // 컬렉션별로 다른 모델 사용
      switch (collectionName) {
        case 'users':
          data = await db.User.find(query).skip(skip).limit(this.BATCH_SIZE).lean();
          break;
        case 'purchases':
          data = await db.Purchase.find(query).skip(skip).limit(this.BATCH_SIZE).lean();
          break;
        case 'purchase_failures':
          data = await db.PurchaseFailure.find(query).skip(skip).limit(this.BATCH_SIZE).lean();
          break;
        case 'requests':
          data = await db.Request.find(query).skip(skip).limit(this.BATCH_SIZE).lean();
          break;
        default:
          throw new Error(`Unknown collection: ${collectionName}`);
      }

      if (data.length === 0) {
        hasMore = false;
        break;
      }

      // 컬렉션별로 다른 변환 로직 적용
      const transformedData = this.transformData(collectionName, data);

      await this.insertBatchToBigQuery(tableName, transformedData);
      skip += this.BATCH_SIZE;
    }

    log.info(`${collectionName} 데이터 동기화 완료 (${skip}개 레코드)`, 'SCHEDULER', 'LOW');
  }

  /**
   * 컬렉션별 데이터 변환
   */
  private transformData(collectionName: string, data: any[]): any[] {
    switch (collectionName) {
      case 'users':
        return data.map((user) => ({
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

      case 'purchases':
        return data.map((purchase) => ({
          _id: purchase._id.toString(),
          userId: purchase.userId.toString(),
          productId: purchase.product?.productId || null,
          platform: purchase.product?.platform || null,
          type: purchase.product?.type || null,
          isExpired: purchase.isExpired || false,
          createdAt: purchase.createdAt.toISOString(),
          updatedAt: purchase.updatedAt.toISOString(),
        }));

      case 'purchase_failures':
        return data.map((failure) => ({
          _id: failure._id.toString(),
          userId: failure.userId?.toString() || null,
          productId: failure.productId?.toString() || null,
          status: failure.status || null,
          platform: failure.platform || null,
          createdAt: failure.createdAt.toISOString(),
          updatedAt: failure.updatedAt.toISOString(),
        }));

      case 'requests':
        return data.map((request) => ({
          _id: request._id.toString(),
          userId: request.userId?.toString() || null,
          status: request.status || null,
          type: request.type || null,
          name: request.name || null,
          text: request.text || null,
          product: request.product ? JSON.stringify(request.product) : null,
          review: request.review ? JSON.stringify(request.review) : null,
          answer: request.answer ? JSON.stringify(request.answer) : null,
          createdAt: request.createdAt?.toISOString() || null,
          updatedAt: request.updatedAt?.toISOString() || null,
        }));

      default:
        throw new Error(`Unknown collection: ${collectionName}`);
    }
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
