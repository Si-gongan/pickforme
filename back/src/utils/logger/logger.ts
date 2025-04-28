// back/src/utils/logger/logger.ts
import winston from 'winston';
import { LogLevel, LogContext, LogSeverity } from './types';
import { getTransports, sendToSlack } from './transports';

const isProduction = process.env.NODE_ENV === 'production';

// 로거 생성
const logger = winston.createLogger({
  level: isProduction ? LogLevel.INFO : LogLevel.DEBUG,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: getTransports()
});

// 로깅 함수 추상화
export const log = {
  error: async (context: LogContext, message: string, severity: LogSeverity = LogSeverity.MEDIUM, meta?: any) => {
    logger.error(message, { context, severity, ...meta });
    
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