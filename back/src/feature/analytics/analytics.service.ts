// src/features/analytics/analytics.service.ts

import fs from 'fs/promises';
import path from 'path';
import { bigqueryClient } from './bigquery/bigquery-client';
import { MetricJob } from './types/types';
import { TABLE_SCHEMAS } from './bigquery/table-schemas';

const PROJECT_ID = process.env.BIGQUERY_PROJECT_ID;
const RAW_DATASET = process.env.GA4_DATASET_RAW_ID; // 원본 GA4 데이터셋
const FOUNDATION_DATASET = process.env.GA4_DATASET_FOUNDATION_ID; // 중간 데이터셋 이름으로 변경

// 테이블 자동 생성 함수
async function ensureTableExists(datasetId: string, tableName: string) {
  try {
    const dataset = bigqueryClient.dataset(datasetId, {
      location: 'asia-northeast3',
    });

    const table = dataset.table(tableName);
    const [exists] = await table.exists();

    if (!exists) {
      const schema = TABLE_SCHEMAS[tableName];
      if (!schema) {
        throw new Error(`Schema not found for table: ${tableName}`);
      }

      await table.create({
        schema: schema,
        location: 'asia-northeast3',
      });
      console.log(`✅ Table ${datasetId}.${tableName} created automatically`);
    }
  } catch (error) {
    console.error(`❌ Failed to create table ${datasetId}.${tableName}:`, error);
    throw error;
  }
}

// [변경] destinationDataset을 인자로 받도록 유지 (핸들러에서 제어)
export const runEtlJob = async (job: MetricJob, destinationDataset: string) => {
  const queryParams = job.getQueryParams ? job.getQueryParams() : {};
  const jobDateForLog = queryParams.target_date || new Date().toISOString().split('T')[0];

  console.log(`[START] Running ETL job: ${job.name} for ${jobDateForLog}`);
  console.log(
    `[DEBUG] Environment variables: PROJECT_ID=${PROJECT_ID}, RAW_DATASET=${RAW_DATASET}, FOUNDATION_DATASET=${FOUNDATION_DATASET}`
  );

  try {
    // 테이블 자동 생성
    await ensureTableExists(destinationDataset, job.destinationTable);

    const queryPath = path.join(__dirname, `./queries/${job.sqlFile}`);
    const sqlTemplate = await fs.readFile(queryPath, 'utf-8');

    // 동적으로 테이블 경로 생성
    const destinationTablePath = `\`${PROJECT_ID}.${destinationDataset}.${job.destinationTable}\``;
    const rawEventsTablePath = `\`${PROJECT_ID}.${RAW_DATASET}.events_*\``;
    const foundationDatasetPath = `\`${PROJECT_ID}.${FOUNDATION_DATASET}\``; // foundation 테이블들을 참조할 때 사용

    // SQL 템플릿의 플레이스홀더 치환
    const sqlBody = sqlTemplate
      .replace(/{{- GA4_EVENTS_TABLE -}}/g, rawEventsTablePath)
      .replace(/{{- FOUNDATION_DATASET -}}/g, foundationDatasetPath)
      .replace(/{{- DESTINATION_TABLE -}}/g, destinationTablePath); // MERGE문에서 목적지 테이블을 참조할 때 사용

    let finalQuery = '';
    const disposition = job.writeDisposition || 'WRITE_APPEND'; // 기본값은 INSERT

    // [개선] Job에 정의된 writeDisposition에 따라 최종 쿼리 생성
    if (disposition === 'MERGE') {
      finalQuery = sqlBody; // MERGE문은 SQL 파일에 완성된 형태로 작성
    } else {
      // 'WRITE_APPEND' (기본값)
      finalQuery = `INSERT INTO ${destinationTablePath} ${sqlBody}`;
    }

    // 디버깅을 위한 로그 추가
    console.log(`[DEBUG] destinationTablePath: ${destinationTablePath}`);
    console.log(`[DEBUG] finalQuery: ${finalQuery.substring(0, 200)}...`);

    const [queryJob] = await bigqueryClient.createQueryJob({
      query: finalQuery,
      params: queryParams,
    });
    await queryJob.getQueryResults();
    console.log(`[SUCCESS] ETL job: ${job.name} completed.`);
  } catch (error) {
    console.error(`[FAIL] ETL job: ${job.name} failed. Details:`, error);
    throw error;
  }
};
