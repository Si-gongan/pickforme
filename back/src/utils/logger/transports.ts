// back/src/utils/logger/transports.ts
import winston from 'winston';
import path from 'path';
import { LogLevel, CustomLogInfo, colors, LogSeverity } from './types';
import slackClient from '../slack';
import { config } from './config';

const { logDir, isProduction } = config;

// 공통 포맷 함수
const createLogFormat = (useColors: boolean = false) => {
  return winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...meta } = info as unknown as CustomLogInfo;
      const context = meta.context || 'unknown';
      const severity = meta.severity || LogSeverity.MEDIUM;
      
      const { context: _, severity: __, ...restMeta } = meta;
      const additionalMeta = Object.keys(restMeta).length ? JSON.stringify(restMeta) : '';
      
      const logMessage = `[${timestamp}] [${level}] [${context}/${severity}] ${message}${additionalMeta ? ' ' + additionalMeta : ''}`;
      
      // 색상 적용 여부에 따라 반환
      if (useColors) {
        const color = colors[level as keyof typeof colors] || colors.reset;
        return `${color}${logMessage}${colors.reset}`;
      }
      return logMessage;
    })
  );
};

// 콘솔 전송 설정
const createConsoleTransport = () => new winston.transports.Console({
  format: createLogFormat(true) // 색상 적용
});

// 파일 전송 설정
const createFileTransports = () => [
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: LogLevel.ERROR,
    format: createLogFormat(false) // 색상 미적용
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: createLogFormat(false) // 색상 미적용
  })
];

// 슬랙 전송 함수
export const sendToSlack = async (message: string, meta?: any) => {
  try {
    // await slackClient.post('/chat.postMessage', {
    //   channel: process.env.SLACK_CHANNEL,
    //   text: message,
    //   attachments: meta ? [{ text: JSON.stringify(meta, null, 2) }] : [],
    // });
  } catch (error) {
    console.error('슬랙 메시지 전송 실패:', error);
  }
};

// 전체 transport 설정
export const getTransports = () => {
  return isProduction ? createFileTransports() : [createConsoleTransport()];
};