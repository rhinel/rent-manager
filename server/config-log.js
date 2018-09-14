const path = require('path')

// 日志类型配置

module.exports = {
  appenders: {
    // WS日志，请求日志
    ws: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/wsLogs/logs')}Ws.log`,
      maxLogSize: 102400,
      backups: 1024,
    },

    // HTTP日志，请求日志
    http: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/httpLogs/logs')}Http.log`,
      maxLogSize: 102400,
      backups: 1024,
    },

    // 系统日志，如：程序启动和db链接日志，框架错误，catch框架错误，db连接错误等
    sys: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/sysLogs/logs')}Sys.log`,
      maxLogSize: 102400,
      backups: 1024,
    },

    // 登陆日志，所有登录登出等的日志
    login: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/loginLogs/logs')}Login.log`,
      maxLogSize: 102400,
      backups: 1024,
    },

    // APIERROR日志，所有API请求产生的程序错误日志
    apiError: {
      type: 'dateFile',
      filename: `${path.resolve(__dirname, '../logs/apiErrorLogs/logs')}apiError.log`,
      maxLogSize: 102400,
      backups: 1024,
    },

    // 错误日志，所有的错误日志
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
    ws: { appenders: ['ws', 'errors'], level: 'info' },
    http: { appenders: ['http', 'errors'], level: 'info' },
    sys: { appenders: ['sys', 'console', 'errors'], level: 'info' },

    login: { appenders: ['login'], level: 'info' },
    apiError: { appenders: ['apiError', 'errors'], level: 'info' },
  },
}
