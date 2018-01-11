const db = require('./models')

module.exports = {

  /** *inner类***房屋管理-增删改查 * */

  /*
    房屋对象挂载
    用户ID ok
    水费抄表ID ok
    水费计费ID ok
    电费抄表ID ok
    电费计费ID ok
    租户ID ok
    收租ID ok
  */

  /** *inner类****水费管理 * */

  /*
    水费抄表对象挂载
    用户ID ok
    房屋ID ok
    水费计费对象挂载
    用户ID ok
    房屋ID ok
  */

  /** *inner类****电费管理 * */

  /*
    电费抄表对象挂载
    用户ID ok
    房屋ID ok
    电费计费对象挂载
    用户ID ok
    房屋ID ok
  */

  /** *inner类****租住管理 * */

  /*
    租户对象挂载
    用户ID ok
    房屋ID ok
  */

  /** *inner类****收租管理 * */

  /*
    收租周期表对象挂载
    用户ID ok
    收租对象挂载
    用户ID ok
    收租周期表ID ok
    房屋ID ok
  */

  // 收租对象 ，存储整个水表计费信息，电表计费信息，租户信息
  //
  //
  // 收租周期表add OK
  // 根据收租周期表list，进列表 OK
  // 根据房屋，带挂载收租信息list，进历史 OK
  //
  //
  // 收租add，更新房屋挂载ID OK
  // 收租type多选：交租、给单据、给房东 OK
  // 收租del，需要回退房屋挂载ID OK
  // 根据收租周期表收租列表list，可添加，可修改收租状态，最新一期可删除收租 OK
  // 根据房屋收租历史list OK

  /** *inner类****其他 * */

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
