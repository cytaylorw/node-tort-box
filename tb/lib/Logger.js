const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const config = require('../lib/Config').logger;

const loggers = {};
const transports = {};

transports.errorFileLog =  new DailyRotateFile({
    ...config.error,
    dirname: './logs',
});
transports.allFileLog = new DailyRotateFile({
    ...config.all,
    dirname: './logs',
});
transports.consoleLog = new winston.transports.Console(config.console);


if(config.options.silent){
    Object.values(transports).forEach(transport => {
        transport.silent = true;
    })
}

const logFormat = winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    // winston.format.json({stable: false}),
    winston.format.printf((info, opts) => {
        // console.log(info)
        let meta = info.label ? `${info.service}-${info.label}` : info.service;
        let stack = !info.exception && info.stack  ? `\n${info.stack}` : '';
        return `${info.timestamp}[${info.level.toUpperCase()}][${meta}] ${info.message}${stack}`;
      })

)

loggers.app = winston.createLogger({
    level: config.options.level || 'info',
    format: logFormat,
    defaultMeta: { service: 'application' },
    transports: [
        transports.errorFileLog,
        transports.allFileLog,
    ],
    exitOnError: false
  });

if(config.options.console){
    loggers.app.add(transports.consoleLog);
}

loggers.dht = loggers.app.child();
loggers.dht.defaultMeta = { service: 'dht-client' },


loggers.mqtt = loggers.app.child();
loggers.mqtt.defaultMeta = { service: 'mqtt-client' };

loggers.app.exceptions.handle(
    transports.errorFileLog,
    transports.allFileLog,
    transports.consoleLog
);


module.exports = loggers;