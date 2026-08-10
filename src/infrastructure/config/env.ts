export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  BACKEND_URL: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

export function loadEnvironment(): Environment {
  return {
    NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT || '3001', 10),
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8080',
    LOG_LEVEL: (process.env.LOG_LEVEL as Environment['LOG_LEVEL']) || 'info',
  };
}