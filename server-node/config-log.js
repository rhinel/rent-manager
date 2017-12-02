const path = require('path')

module.exports = {
  appenders: {
    // HTTP 请求日志
    http: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/httpLogs/logs')}Http.log`,
      maxLogSize: 102400,
      backups: 1024,
    },
    // 系统日志，如：框架错误，catch程序错误，db连接错误等
    sys: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/sysLogs/logs')}Sys.log`,
      maxLogSize: 102400,
      backups: 1024,
    },

    // 所有登录登出等的日志
    login: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/loginLogs/logs')}Login.log`,
      maxLogSize: 102400,
      backups: 1024,
    },
    // 所有API请求产生的错误日志
    apiError: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/apiErrorLogs/logs')}apiError.log`,
      maxLogSize: 102400,
      backups: 1024,
    },

    // 所有的错误日志
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
    apiError: { appenders: ['apiError', 'errors'], level: 'info' },
  },
}
