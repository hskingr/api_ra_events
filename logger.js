import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { get } from 'stack-trace';

const getCallerInfo = () => {
  const trace = get();
  const caller = trace[2]; // Index 2 gives the caller's info
  return `${caller.getFileName()}:${caller.getLineNumber()}`;
};

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message} (at ${getCallerInfo()})`)
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error'
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
  );
}

export default logger;
