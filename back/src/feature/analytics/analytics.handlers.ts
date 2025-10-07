// src/features/analytics/analytics.handlers.ts

import { foundationJobs, summaryJobs } from './scheduler/jobs';
import { runEtlJob } from './analytics.service';
import { mongodbSyncService } from './bigquery/mongodb-sync.service';
import { log } from '../../utils/logger/logger';

// .env 파일에서 데이터셋 이름 가져오기
const FOUNDATION_DATASET = process.env.GA4_DATASET_FOUNDATION_ID!;
const SUMMARY_DATASET = process.env.GA4_DATASET_SUMMARY_ID!;

// 핸들러 1: 기초 공사(Foundation) ETL
export const handleFoundationEtlJobs = async () => {
  const SCHEDULER_NAME = 'bigquery-foundation-etl';
  try {
    console.log('[START] Starting all FOUNDATION ETL jobs...');
    for (const job of foundationJobs) {
      // foundation 데이터셋에 결과를 저장하도록 runEtlJob 호출
      await runEtlJob(job, FOUNDATION_DATASET);
    }
    log.info('✅ Foundation ETL 완료', 'SCHEDULER', 'LOW', { scheduler: SCHEDULER_NAME });
  } catch (error) {}
};

// 핸들러 2: 최종 요약(Summary) ETL
export const handleSummaryEtlJobs = async () => {
  const SCHEDULER_NAME = 'bigquery-summary-etl';
  try {
    console.log('[START] Starting all SUMMARY ETL jobs...');
    for (const job of summaryJobs) {
      // summary 데이터셋에 결과를 저장하도록 runEtlJob 호출
      await runEtlJob(job, SUMMARY_DATASET);
    }
    log.info('✅ Summary ETL 완료', 'SCHEDULER', 'LOW', { scheduler: SCHEDULER_NAME });
  } catch (error) {}
};

// 핸들러 3: MongoDB 데이터 동기화
export const handleMongodbSyncJobs = async () => {
  const SCHEDULER_NAME = 'mongodb-sync-etl';
  try {
    console.log('[START] Starting MongoDB sync jobs...');

    // MongoDB 데이터 동기화
    await mongodbSyncService.syncAllData();

    log.info('✅ MongoDB 동기화 완료', 'SCHEDULER', 'LOW', { scheduler: SCHEDULER_NAME });
  } catch (error) {
    void log.error('❌ MongoDB 동기화 실패', 'SCHEDULER', 'HIGH', {
      scheduler: SCHEDULER_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// 핸들러 5: 전체 ETL 파이프라인 실행
export const handleFullEtlPipeline = async () => {
  const SCHEDULER_NAME = 'full-etl-pipeline';
  try {
    console.log('[START] Starting full ETL pipeline...');

    // 1. MongoDB 동기화
    await handleMongodbSyncJobs();

    // 2. Foundation ETL
    await handleFoundationEtlJobs();

    // 3. Summary ETL
    await handleSummaryEtlJobs();

    log.info('✅ 전체 ETL 파이프라인 완료', 'SCHEDULER', 'LOW', { scheduler: SCHEDULER_NAME });
  } catch (error) {
    void log.error('❌ 전체 ETL 파이프라인 실패', 'SCHEDULER', 'HIGH', {
      scheduler: SCHEDULER_NAME,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
