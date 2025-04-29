// back/src/utils/logger/transports.ts
import winston from 'winston';
import path from 'path';
import { LogLevel, CustomLogInfo, colors, LogSeverity } from './types';
import slackClient from '../slack';
import { config } from './config';

const { logDir, isProduction, slackChannelId } = config;

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
const createFileTransports = () => {
  try {
    return [
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: LogLevel.ERROR,
        format: createLogFormat(false), // 색상 미적용
        // 파일 시스템 에러를 처리
        handleExceptions: true,
        handleRejections: true
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        format: createLogFormat(false), // 색상 미적용
        // 파일 시스템 에러를 처리
        handleExceptions: true,
        handleRejections: true
      })
    ];
  } catch (error) {
    // 파일 시스템 에러 발생 시 콘솔로만 로깅
    process.stderr.write(`파일 로깅 설정 실패: ${error}\n`);
    
    // Slack으로도 알림 (실패해도 무시)
    if (isProduction) {
      sendToSlack(`🚨 파일 로깅 설정 실패\n에러: ${error}`).catch(() => {
      });
    }
    
    return [createConsoleTransport()];
  }
};

// 슬랙 전송 함수
export const sendToSlack = async (message: string) => {
  try {    
    await slackClient.post('/chat.postMessage', {
      text: message,
      channel: slackChannelId,
    });
  } catch (error) {
    console.error('슬랙 메시지 전송 실패:', error);
  }
};

// 전체 transport 설정
export const getTransports = () => {
  try {
    return isProduction ? createFileTransports() : [createConsoleTransport()];
  } catch (error) {
    // 모든 transport 설정이 실패하면 최소한의 콘솔 로깅만 사용
    console.error('로거 설정 실패:', error);
    
    // Slack으로도 알림 (실패해도 무시)
    if (isProduction) {
      sendToSlack(`🚨 로거 설정 실패\n에러: ${error}`)
    }
    
    return [createConsoleTransport()];
  }
};