// back/src/utils/logger/types.ts
import winston from 'winston';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export type LogContext = 'PURCHASE' | 'AUTH' | 'USER' | 'PRODUCT' | 'SYSTEM' | 'SCHEDULER';

export type LogSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const DEFAULT_CONTEXT: LogContext = 'SYSTEM';
export const DEFAULT_SEVERITY: LogSeverity = 'MEDIUM';

export interface CustomLogInfo extends winston.Logform.TransformableInfo {
  timestamp: string;
  context?: string;
  severity?: string;
}

export const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[32m',
  debug: '\x1b[34m',
  reset: '\x1b[0m',
} as const;
