const path = require('path')

module.exports = {
  appenders: {
    http: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/httpLogs/logs')}Http.log`,
      maxLogSize: 102400,
      backups: 1024,
    },
    sys: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/sysLogs/logs')}Sys.log`,
      maxLogSize: 102400,
      backups: 1024,
    },
    login: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/loginLogs/logs')}Login.log`,
      maxLogSize: 102400,
      backups: 1024,
    },
    errorsFile: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/errorsFileLogs/logs')}ErrorsFile.log`,
      maxLogSize: 102400,
      backups: 1024,
    },
    errors: {
      type: 'logLevelFilter',
      appender: 'errorsFile',
      level: 'error',
    },
    console: { type: 'console' },
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    http: { appenders: ['http', 'errors'], level: 'info' },
    sys: { appenders: ['sys', 'console', 'errors'], level: 'info' },

    login: { appenders: ['login', 'errors'], level: 'info' },
  },
}
