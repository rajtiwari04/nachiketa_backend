const winston = require('winston');
const { combine, timestamp, printf, colorize } = winston.format;
const logFormat = printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`);
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.Console({ format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat) }),
  ],
});
module.exports = logger;
