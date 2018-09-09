const superagent = require('superagent')
const md5 = require('md5')

const FoundError = require('./config-error')
const db = require('./models')

module.exports = {

  login: async req => {
    // 校验字段，错误退出
    // 0根据MD5(IP，用户名，密码，时间)生成token
    // 1查询数据库用户名密码，错误退出
    // 2查出登陆缓存
    // 3失效旧缓存，写入缓存新token
    // 4返回token

    if (!req.body.name) {
      return Promise.reject(new FoundError('请输入用户名'))
    }

    if (!req.body.pwd) {
      return Promise.reject(new FoundError('请输入密码'))
    }

    // 0生成新token
    const tokenTime = new Date().getTime()
    const token = md5(`${req.ip}${req.body.name}${req.body.pwd}${tokenTime}`)

    // 1查询数据是否有超5次错误
    const ipCheck = await db
      .redisGet(req.ip)
    if (ipCheck && ipCheck >= 5) {
      return Promise.reject(new FoundError('用户名/密码错误超过5次，请等待5分钟后再次登陆'))
    }

    // 2数据库查询用户名和密码校验
    const dbInfo = await db
      .dbModel('admin')
      .findOne({
        name: req.body.name,
        pwd: req.body.pwd,
      })
      .exec()

    // 账号密码错误次数5分钟300秒机制，成功清除错误记录
    if (!dbInfo) {
      const ipError = await db
        .redisIncr(req.ip)
      await db
        .redisSetTime(req.ip, 300)
      let errorTimes = 5 - ipError
      errorTimes = errorTimes < 0 ? 0 : errorTimes
      return Promise.reject(new FoundError(`用户名/密码错误，5分钟内您还有${errorTimes}次机会`))
    }
    await db
      .redisDelKeys(req.ip)

    // 3查出已有的登陆态，更新状态
    const userId = dbInfo._id.toString()
    // let allTokens = await db
    //   .redisGetKeys(`${userId}$*`)
    // if (allTokens.length) {
    //   await db
    //     .redisDelKeys(allTokens)
    // }
    // 更新缓存，存缓存token:userid，1800秒
    await db
      .redisSet(`${userId}$${token}`, userId, 1800)

    return token
  },

  logout: async req => {
    // 校验字段，错误空退出
    // 1清除缓存
    // 2返回空

    if (!req.body.token) {
      return
    }

    // 1查询并清空
    const reToken = await db
      .redisGetKeys(`*$${req.body.token}`)
    if (reToken.length) {
      await db
        .redisDelKeys(reToken)
    }
  },

  bingBg: async () => {
    // 1查询api，错误退出
    // 2返回bg对象

    // 1查询并返回
    const url = 'http://global.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&nc='
    const search = '&pid=hp&video=1&fav=1&setmkt=en-us&setlang=en-us'
    return superagent
      .get(`${url}${Date.now()}${search}`)
      .then(res => res.body)
  },

  auth: async req => {
    // 1查询缓存，错误退出
    // 2更新缓存
    // 3返回空

    // 1查询缓存
    const reToken = await db
      .redisGetKeys(`*$${req.body.token || req.query.token}`)
    if (!reToken.length) {
      return Promise.reject(new FoundError())
    }

    // 2更新缓存
    req.userId = reToken[0].split('$')[0]
    await db
      .redisSetTime(reToken[0], 1800)
    return ''
  },

  getSysInfo: async req => {
    // 查询数据库信息

    const dbInfo = await db
      .dbModel('admin')
      .findOne({
        _id: req.userId,
      }, {
        pwd: 0,
      })
      .where('status')
      .equals(1)
      .exec()

    return dbInfo
  },

  updateSysInfo: async req => {
    // 更新数据库信息

    const {
      defaultCalWaterPrice,
      defaultCalElePrice,
      defaultElseInfo,
    } = req.body

    const dbInfo = await db
      .dbModel('admin', {//* //标记，更新默认计费方式，修改类型
        defaultCalWaterPrice: Object, // 默认水费计费，全拼
        defaultCalElePrice: Object, // 默认电费计费，全拼
        defaultElseInfo: Object, // 默认用户信息，全拼
      })
      .findOneAndUpdate({
        _id: req.userId,
      }, {
        $set: {
          defaultCalWaterPrice,
          defaultCalElePrice,
          defaultElseInfo,
        },
      })
      .exec()

    if (!dbInfo) {
      return Promise.reject(new FoundError('修改失败，数据不存在'))
    }

    return ''
  },
}
