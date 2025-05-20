// back/src/utils/logger/types.ts
import winston from 'winston';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export enum LogContext {
  SCHEDULER = 'scheduler',
  AUTH = 'auth',
  PURCHASE = 'purchase',
  GLOBAL = 'global',
  SERVER = 'server',
}

export enum LogSeverity {
  CRITICAL = 4,
  HIGH = 3,
  MEDIUM = 2,
  LOW = 1,
}

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
