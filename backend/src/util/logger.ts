import * as winston from 'winston';
import {Logger} from 'winston';

function replaceError (e: Error) {
  return {
    message: e.message,
    stack: e.stack,
  };
}

export default function makeLogger (module: string): Logger {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.label({label: module}),
      winston.format.timestamp(),
      winston.format.json({
        replacer: (k: string, v: any) => v instanceof Error ? replaceError(v) : v,
      }),
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });
}