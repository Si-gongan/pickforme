const logDir = process.cwd() + '/logs';
const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  logDir,
  isProduction,
};
