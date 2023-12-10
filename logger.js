const { createLogger, transports } = require('winston');

const errorsLogger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'errores.log' })
  ]
});

module.exports = errorsLogger;