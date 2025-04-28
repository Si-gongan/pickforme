import winston from 'winston';
import slackClient from './slack';
import path from 'path';

// 로깅 레벨 정의
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  // 디버그 레벨은 프로덕션에서는 사용하지 않음.
  DEBUG = 'debug',
}

// 로깅 컨텍스트 정의
export enum LogContext {
  SCHEDULER = 'scheduler',
  AUTH = 'auth',
  IAP = 'iap',
  EVENT = 'event',
}

// 중요도 정의
export enum LogSeverity {
  CRITICAL = 'critical', // 반드시 슬랙으로 알림
  HIGH = 'high',         // 상황에 따라 슬랙으로 알림
  MEDIUM = 'medium',     // 파일에만 기록
  LOW = 'low',           // 파일에만 기록
}

// 커스텀 로그 정보 인터페이스 정의
interface CustomLogInfo extends winston.Logform.TransformableInfo {
    timestamp: string;
    context?: string;
    severity?: string;
  }

const isProduction = process.env.NODE_ENV === 'production';

// 로깅 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info as unknown as CustomLogInfo;
    const context = meta.context || 'unknown';
    const severity = meta.severity || LogSeverity.MEDIUM;
    
    // context와 severity를 제외한 추가 메타데이터만 JSON으로 변환
    const { context: _, severity: __, ...restMeta } = meta;
    const additionalMeta = Object.keys(restMeta).length ? JSON.stringify(restMeta) : '';
    
    return `[${timestamp}] [${level}] [${context}/${severity}] ${message}${additionalMeta ? ' ' + additionalMeta : ''}`;
  })
);

// 로그 파일 저장 경로 (절대 경로 사용)
const logDir = '/var/log/pickforme';

// 콘솔 전송 설정 (개발 환경에서만)
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({
      all: true,
      colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue'
      }
    }),
    logFormat // 동일한 포맷 사용
  )
});
  
// 프로덕션 환경에서만 슬랙 전송 설정
const transports = [
    ...(isProduction ? [
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: LogLevel.ERROR
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log')
        }),
    ] : [
        consoleTransport
    ])
];

// 로거 생성
const logger = winston.createLogger({
  level: isProduction ? LogLevel.INFO : LogLevel.DEBUG,
  format: logFormat,
  transports,
});

// ERROR 레벨 로그를 슬랙으로 전송하는 함수
const sendToSlack = async (message: string, meta?: any) => {
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

// 로깅 함수 추상화
export const log = {
  error: async (context: LogContext, message: string, severity: LogSeverity = LogSeverity.MEDIUM, meta?: any) => {
    logger.error(message, { context, severity, ...meta });
    
    // 프로덕션 환경에서 CRITICAL/HIGH 중요도만 슬랙으로 전송
    if (isProduction && 
        (severity === LogSeverity.CRITICAL || severity === LogSeverity.HIGH)) {
      await sendToSlack(`[${context}] ${message}`, meta);
    }
  },
  warn: (context: LogContext, message: string, severity: LogSeverity = LogSeverity.MEDIUM, meta?: any) => {
    logger.warn(message, { context, severity, ...meta });
  },
  info: (context: LogContext, message: string, severity: LogSeverity = LogSeverity.LOW, meta?: any) => {
    logger.info(message, { context, severity, ...meta });
  },
  debug: (context: LogContext, message: string, severity: LogSeverity = LogSeverity.LOW, meta?: any) => {
    logger.debug(message, { context, severity, ...meta });
  },
};

export default logger;
