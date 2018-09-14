const db = require('./models')

// v1.0旧版回调式代码
module.exports = {

  getData: (req, res, callback) => {
    db
      .dbModel('admin')
      .find({ name: req.body.name })
      .exec((err, data) => {
        if (err) {
          callback({
            type: false,
            data: err,
          })
        } else {
          callback({
            type: true,
            data,
          })
        }
      })
  },

  saveData: (req, res, callback) => {
    db
      .dbModel('admin', { name: 'string' })
      .create({ name: req.body.name }, (err, data) => {
        if (err) {
          callback({
            type: false,
            data: err,
          })
        } else {
          callback({
            type: true,
            data,
          })
        }
      })
  },

  removeData: (req, res, callback) => {
    if (!req.body.name) {
      return callback({
        type: false,
        data: '未定义删除关键字',
      })
    }
    return db
      .dbModel('admin')
      .remove({}, (err, data) => {
        if (err) {
          callback({
            type: false,
            data: err,
          })
        } else {
          callback({
            type: true,
            data,
          })
        }
      })
  },

  redisSet: (req, res, callback) => {
    db.redisSet(req.body.setname, req.body.setval, req.body.settime || 0, (err, reply) => {
      if (err) {
        callback({
          type: false,
          data: err,
        })
      } else {
        callback({
          type: true,
          data: reply,
        })
      }
    })
  },

  redisGet: (req, res, callback) => {
    db.redisGet(req.body.setname, (err, reply) => {
      if (err) {
        callback({
          type: false,
          data: err,
        })
      } else {
        callback({
          type: true,
          data: reply,
        })
      }
    })
  },

}
