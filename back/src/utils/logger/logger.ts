// back/src/utils/logger/logger.ts
import winston from 'winston';
import { LogLevel, LogContext, LogSeverity } from './types';
import { getTransports, sendToSlack } from './transports';
import { config } from './config';

const { isProduction, slackTransportSeverityThreshold } = config;

// 로거 생성
const logger = winston.createLogger({
  level: isProduction ? LogLevel.INFO : LogLevel.DEBUG,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: getTransports(),

  handleExceptions: true,
  handleRejections: true,
  exitOnError: false, // 로거 에러가 발생해도 프로세스가 종료되지 않도록
});

// 로거 자체의 에러를 처리하는 이벤트 리스너
logger.on('error', (error) => {
  // 로거가 실패하면 최소한 console.error로라도 기록
  console.error('로거 에러 발생:', error);
});

// 안전한 로깅을 위한 래퍼 함수
const safeLog = (
  level: LogLevel,
  context: LogContext,
  message: string,
  severity: LogSeverity,
  meta?: any
) => {
  try {
    logger.log(level, message, { context, severity, ...meta });
  } catch (error) {
    // 로거 자체가 실패하면 console.error로 기록
    console.error(`로깅 실패 (${level}):`, { context, message, severity, meta, error });
  }
};

// 로깅 함수 추상화
export const log = {
  error: async (
    context: LogContext,
    message: string,
    severity: LogSeverity = LogSeverity.MEDIUM,
    meta?: any
  ) => {
    // 기본 로깅은 안전하게 수행
    safeLog(LogLevel.ERROR, context, message, severity, meta);

    // Slack 전송 (transports.ts에서 이미 try-catch로 처리됨)
    if (isProduction && severity >= slackTransportSeverityThreshold) {
      await sendToSlack({
        context,
        message,
        severity,
        stack: meta?.stack,
        meta: meta ? { ...meta, stack: undefined } : undefined,
      });
    }
  },
  warn: (
    context: LogContext,
    message: string,
    severity: LogSeverity = LogSeverity.MEDIUM,
    meta?: any
  ) => {
    safeLog(LogLevel.WARN, context, message, severity, meta);
  },
  info: (
    context: LogContext,
    message: string,
    severity: LogSeverity = LogSeverity.LOW,
    meta?: any
  ) => {
    safeLog(LogLevel.INFO, context, message, severity, meta);
  },
  debug: (
    context: LogContext,
    message: string,
    severity: LogSeverity = LogSeverity.LOW,
    meta?: any
  ) => {
    safeLog(LogLevel.DEBUG, context, message, severity, meta);
  },
};

export default logger;
