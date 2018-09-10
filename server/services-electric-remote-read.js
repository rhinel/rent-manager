const FoundError = require('./config-error')
const code = require('./config-codes')
const { WsSend, WsOnMessage, WsOnClose } = require('./config-wscallback')
// const db = require('./models')

const serviceAuth = require('./services-auth')
const servicesHouse = require('./services-house')

// 用户原型
const DefuserData = class {
  constructor(userId, mobile, ws, req) {
    // 用户参数
    this.userId = userId
    this.mobile = mobile

    // 连接信息
    this.ws = ws
    this.req = req

    // 任务信息
    this.mission = []
    this.missioning = 0
    this.done = 0

    // 数据缓存信息
    this.code = ''
    this.cookie = ''
    this.day = ''
    this.cacheData = {}
    this.status = 0
  }

  // 执行任务队列回调
  async missionNextJob() {
    // 阈值
    if (
      this.missioning
      || !this.mission.length
    ) return

    // 执行
    this.missioning = 1
    const next = this.mission.shift()
    await next()
    this.missioning = 0

    // 下一个
    this.missionNextJob()
  }

  // 获取验证码Cookie / 发送code
  async getElectricIdentifyCode() {
    // 校验
    if (!this.mobile) {
      await WsSend(this.ws, 'getCode', code(
        this.req,
        30491,
        new FoundError('手机号码不存在，请在系统设置处维护。')
      ))

      return
    }

    // sleep 2s
    await new Promise((r) => setTimeout(r, 2000))

    // 返回数据
    await WsSend(this.ws, 'getCode', code(this.req, 0, {
      message: '验证码已发送，请查收并填写。',
    }))
  }

  // 登陆方法
  async getElectricIdentifyLogin(loginCode) {
    // 校验
    if (!loginCode) {
      await WsSend(this.ws, 'getLogin', code(this.req, 0, {
        type: 'ERR',
        message: '请输入验证码。',
      }))

      return
    }

    // sleep 2s
    await new Promise((r) => setTimeout(r, 2000))

    // 缓存数据
    this.code = loginCode
    this.cookie = 'cookie'
    this.status = 1

    // 返回数据
    await WsSend(this.ws, 'getLogin', code(this.req, 0, {
      message: '登陆成功。',
    }))
  }

  // 抄表方法
  async getElectricNumber(day, selectID) {
    // 校验
    if (!day) {
      await WsSend(this.ws, 'getNumber', code(this.req, 0, {
        type: 'ERR',
        message: '请选择抄表日期。',
      }))

      return
    }

    // sleep 2s
    await new Promise((r) => setTimeout(r, 2000))

    // 缓存数据
    this.day = day
    this.cacheData[selectID] = {
      selectID,
      doneNumber: 123,
      timestamp: Date.now(),
    }
    this.status = 2

    // 返回数据
    await WsSend(this.ws, 'getNumber', code(this.req, 0, {
      type: 'DATA',
      data: this.cacheData[selectID],
      message: `${selectID} 抄表成功。`,
    }))
  }

  // 写入数据库方法
  async getElectricInbase(selectID) {
    // sleep 2s
    await new Promise((r) => setTimeout(r, 2000))

    // 完成任务
    this.done = 1

    // 返回数据
    await WsSend(this.ws, 'getInbase', code(this.req, 0, {
      type: 'DATA',
      data: { selectID, doneNumber: 123 },
      message: `${selectID} 写入数据成功。`,
    }))
  }
}

// 缓存列表
const userList = {}

module.exports = {

  remoteRead: async (req, ws) => {
    // 获取全部可处理房屋数据
    // 本用户Data缓存
    // 30分钟连接过期需要重新刷新连接
    // 用户关闭后保持状态，但不发送数据
    // 连接时立即执行的方法不认为无法接收报错
    // 等待用户链接电力系统
    // 根据用户参数请求数据 并返回
    // 根据用户参数执行 写入数据
    // 错误重试规则

    // 1 获取全部可处理房屋数据
    const houseList = await servicesHouse
      .houseList(req)

    await WsSend(ws, 'houseList', code(req, 0, {
      type: 'DATA',
      data: houseList,
      message: '房屋数据已获取。',
    }))

    // 2 本用户Data缓存
    const { userId } = req

    let userData

    if (!userList[userId]) {
      // 初始化数据
      const { defaultElseInfo: { mobile } } = await serviceAuth
        .getSysInfo(req)
      userData = new DefuserData(
        userId,
        mobile,
        ws,
        req,
      )
      userList[userId] = userData

      await WsSend(ws, 'sys', code(req, 0, {
        message: '等待开始执行新任务 ...',
      }))
    } else {
      // 更新存在数据 / 并返回缓存数据
      userData = userList[userId]
      userData.ws = ws
      userData.req = req
      userData.close = 0

      await WsSend(ws, 'sys', code(req, 0, {
        type: 'DATA',
        data: {
          code: userData.code,
          day: userData.day,
          cacheData: userData.cacheData,
          status: userData.status,
        },
        message: '存在未完成任务，返回继续任务状态 ...',
      }))
    }

    // 3 生成主动关闭情况：30min后主动关闭 / 删除缓存
    if (userData.serveClose) {
      clearTimeout(userData.serveClose)
    }

    userData.serveClose = setTimeout(() => {
      delete userList[userId]
    }, 30 * 60 * 1000)

    await WsSend(ws, 'sys', code(req, 0, {
      message: '本次连接将在30分钟之后过期。',
    }))

    // 4 处理用户关闭的情况
    WsOnClose(ws, () => {
      // 如果任务已经完成删除
      // 否则继续执行（等待自动关闭 / 或用户重新打开）
      if (userData.done) {
        if (userData.serveClose) {
          clearTimeout(userData.serveClose)
        }
        delete userList[userId]
      }
    }, err => {
      WsSend(ws, code(req, 3049, err))
    })

    // 5 等待用户输入 / 方法处理
    WsOnMessage(ws, (message) => {
      const { type, data } = JSON.parse(message)
      // 根据请求type转发用户对象方法
      switch (type) {
      case 'getCode':
        userData.mission.push(() => {
          userData.getElectricIdentifyCode.call(
            userData,
          )
        })
        break
      case 'getLogin':
        userData.mission.push(() => {
          userData.getElectricIdentifyLogin.call(
            userData,
            data.code,
          )
        })
        break
      case 'getNumber':
        userData.mission.push(() => {
          userData.getElectricNumber.call(
            userData,
            data.day,
            data.selectID,
          )
        })
        break
      case 'getInbase':
        userData.mission.push(() => {
          userData.getElectricInbase.call(
            userData,
            data.selectID,
          )
        })
        break
      default:
        break
      }

      // 执行队列
      userData.missionNextJob()
    }, err => {
      WsSend(ws, code(req, 3049, err))
    })
  },

}
