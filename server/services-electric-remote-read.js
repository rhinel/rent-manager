const got = require('got')
const { URLSearchParams } = require('url')

const FoundError = require('./config-error')
const code = require('./config-codes')
const { WsSend, WsOnMessage, WsOnClose } = require('./config-wscallback')

const serviceAuth = require('./services-auth')
const serviceElect = require('./services-electric')

// 用户原型
// socket原型
const DefuserData = class {
  constructor({ userId, mobile, ws, req, electricData }) {
    // 用户参数
    this.userId = userId
    this.mobile = mobile

    // 连接信息
    this.ws = ws
    this.req = req

    // 任务信息
    this.mission = []
    this.missioning = 0
    this.done = 0 // 是否全部完成 / 主动关闭

    // 数据缓存信息
    this.electricData = electricData // 房屋表数
    this.codeTime = '' // 验证码发送时间，用于计算间隔
    this.code = '' // 验证码缓存
    this.cookie = '' // 登陆后cookie缓存
    this.day = '' // 当前请求的日期
    this.cacheData = {} // 缓存的抄表数据
    this.status = 0 // 任务阶段
  }

  // 私有方法

  // send 方法
  // 需要外部的WsSend，code
  // 没有使用对象参数，因为简便调用
  async _send(type, data, sysERRCode) {
    return WsSend(this.ws, type, code(
      this.req,
      sysERRCode || 0,
      sysERRCode
        ? new FoundError(data) : data
    ))
  }

  // 执行任务队列回调
  // 这是一个先进先出的栈
  async _missionNextJob() {
    // 阈值
    if (
      this.missioning
      || !this.mission.length
    ) return ''

    // 执行
    // 做队列等待
    // 并重新抛出异常
    this.missioning = 1
    const next = this.mission.shift()
    await next().catch(err => {
      this.missioning = 0
      throw err
    })
    this.missioning = 0

    // 下一个
    return this._missionNextJob()
  }

  // 创建一个任务，并加入任务队列
  // 设定为执行时对象
  async _missionCreate({ type: funName, data }) {
    if (
      funName.startsWith('_')
      || !Object.getPrototypeOf(this)[funName]
    ) {
      return this
        ._send('sys', '方法不存在，请检查。', 30491)
    }

    // 加入队列
    this.mission
      .push(() => this[funName](data))

    // 触发任务
    return this._missionNextJob()
  }

  // 请求对象的默认载荷
  // eslint-disable-next-line class-methods-use-this
  async _defaultPostOptions({ body, cookie }) {
    const options = {
      baseUrl: 'https://95598.sz.csg.cn',
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': `${
          'application/x-www-form-urlencoded;'
        } ${
          'charset=UTF-8'
        }`,
      },
    }

    if (body) options.body = body
    if (cookie) options.headers.cookie = cookie
    return options
  }

  // 公有方法

  // 获取验证码Cookie / 发送code
  async getCode() {
    // 校验
    if (!this.mobile) {
      return this._send(
        'getCode',
        '手机号码不存在，请在系统设置处维护。',
        30492
      )
    }

    // 发送请求用户验证码标识cookie
    const preGet = await got(
      '/kh/yhzc.do',
      await this._defaultPostOptions({
        body: new URLSearchParams({
          action: 'hqyzm',
          sjh: this.mobile,
          yzmYwlb: '02',
        }).toString(),
      }),
    )

    // 检验结果
    const { sfcz } = JSON.parse(preGet.body)

    if (sfcz) {
      const errMsg = {
        YES: '该手机号码已经发送过动态密码！',
        NOTALLOW: '动态密码发送超限，请30分钟后再试！',
      }

      return this._send('getCode', {
        type: 'ERR',
        message: errMsg[sfcz] || '未指定发送验证码错误。',
      })
    }

    // 处理cookie
    const setCookie = preGet
      .headers['set-cookie'].join(',')

    // 发送验证码
    await got(
      '/kh/yhzc.do',
      await this._defaultPostOptions({
        cookie: setCookie,
        body: new URLSearchParams({
          action: 'fsyzm',
          yzmYwlb: '02',
        }).toString(),
      }),
    )

    // 缓存数据
    // 已经获取验证码的状态
    this.codeTime = Date.now()
    this.status = 1

    // 返回数据
    return this._send('getCode', {
      message: '验证码已发送，请查收并填写。',
    })
  }

  // 登陆方法
  async getLogin({ loginCode }) {
    // 校验
    if (!loginCode) {
      return this._send('getLogin', {
        type: 'ERR',
        message: '请输入验证码。',
      })
    }

    //  执行登陆
    const theGet = await got(
      '/yhdl.do',
      await this._defaultPostOptions({
        body: `${'action=yhdl&checkOnline=false'
        }${'&rurl=&dlxx.zhlx=&dlxx.dllx=2&wxSwitch=ON'
        }${'&dlmjy=&mmjy=&tempFlag1=N&zcdl=&jmdlm='
        }${'&jmmm=&verifyCode2=&dlxx.sjh='
        }${this.mobile}${'&dlxx.sjyzm='
        }${loginCode}${'&verifyCode='
        }`,
      }),
    )

    // 检验结果
    const isRightPage = /window.parent._rulTz()/
      .test(theGet.body)

    if (!isRightPage) {
      return this._send('getLogin', {
        type: 'ERR',
        message: '登陆失败，可能验证码错误，请重试！',
      })
    }

    // 处理cookie
    const setCookie = theGet
      .headers['set-cookie'].join(',')

    // 缓存数据
    // 已经登陆系统的状态
    // 后面根据cookie处理
    this.code = loginCode
    this.cookie = setCookie
    this.status = 2

    // 返回数据
    return this._send('getLogin', {
      message: '登陆成功。',
    })
  }

  // 抄表方法
  async getNumber({ day, haoId }) {
    // 校验
    if (!day) {
      return this._send('getNumber', {
        type: 'ERR',
        message: '请选择抄表日期。',
      })
    }

    // 获取需要处理的电表
    const dealData = this.electricData
      .filter(item => (
        (haoId && item._id.toString() === haoId)
        || !haoId
      )
        && item.dbjb
        && item.glyhbh)

    if (!dealData.length) {
      return this._send('getNumber', {
        type: 'ERR',
        message: '电表不存在或暂无可抄电表。',
      })
    }

    // 缓存数据
    this.day = day
    this.status = 3

    // 组装请求队列
    let dealList = Promise.resolve()
    for (let i = 0; i < dealData.length; i += 1) {
      dealList = dealList.then(async () => {
        // 执行请求
        const theGet = await got(
          '/dbzx/dbzx.do',
          await this._defaultPostOptions({
            cookie: this.cookie,
            body: new URLSearchParams({
              action: 'query',
              glyhbh: dealData[i].glyhbh,
              dbjb: dealData[i].dbjb,
              qssj: day,
              jzsj: day,
            }).toString(),
          }),
        )

        // 处理结果
        const regStr = `(${day} 00:00:00.0</td>\\r\\n\\s*${
        '<td style="width: 15%">)(\\d+)(\\.+\\d*</td>)'}`
        const exp = new RegExp(regStr)
        const electric = theGet.body.match(exp)[2]

        // 数据
        const Id = dealData[i]._id.toString()
        this.cacheData[Id] = {
          haoId: Id,
          electric,
          addTime: day,
        }

        // 返回数据
        await this._send('getNumber', {
          type: 'DATA',
          data: this.cacheData[Id],
          message: `${dealData[i].fanghao
          } ${electric}度 抄数数据成功。`,
        })

        return new Promise(r => setTimeout(r, 1000))
      })
    }

    // 请求队列
    await dealList

    // 返回数据
    return this._send('getNumber', {
      message: '全部抄表成功。',
    })
  }

  // 写入数据库方法
  async getInbase({ haoId }) {
    // 获取需要处理的电表
    const dealData = haoId && this.cacheData[haoId]
      ? { [haoId]: this.cacheData[haoId] }
      : this.cacheData

    if (
      (haoId && !dealData[haoId])
      || !Object.keys(dealData).length
    ) {
      return this._send('getNumber', {
        type: 'ERR',
        message: '没有读数或暂无可写度数。',
      })
    }

    // 组装请求队列
    let dealList = Promise.resolve()
    for (let i = 0; i < this.electricData.length; i += 1) {
      const item = dealData[this.electricData[i]._id.toString()]
      const oldItem = this.electricData[i].electricId

      if (item && oldItem.addTime !== item.addTime) {
        dealList = dealList.then(async () => {
          // 执行请求
          await serviceElect
            .electricAdd({
              userId: this.userId,
              body: item,
            })

          // 数据
          this.electricData[i].electricId = item

          // 返回数据
          await this._send('getInbase', {
            type: 'DATA',
            data: item,
            message: `${this.electricData[i].fanghao
            } ${item.electric}度 写入数据成功。`,
          })

          return new Promise(r => setTimeout(r, 1000))
        })
      }
    }

    // 请求队列
    await dealList

    // 返回数据
    return this._send('getInbase', {
      message: '全部写入成功。',
    })
  }

  // 关闭连接请求
  async getClose() {
    // 完成任务
    this.done = 1

    // 返回数据
    return this._send('close', {
      message: '后台系统即将关闭 ...',
    })
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
    // 每次拉取最新数据
    const electricData = await serviceElect
      .electricNewestList(req)

    await WsSend(ws, 'electricData', code(req, 0, {
      type: 'DATA',
      data: electricData,
      message: '房屋数据已获取。',
    }))

    // 2 本用户Data缓存
    // 根据用户ID来缓存会话
    // 重新登陆后仍可继续会话
    const { userId } = req
    let userData

    if (!userList[userId]) {
      // 初始化数据
      // 获取用户配置信息
      const { defaultElseInfo: {
        mobile,
      } } = await serviceAuth
        .getSysInfo(req)
      userData = new DefuserData({
        userId,
        mobile,
        ws,
        req,
        electricData,
      })
      userList[userId] = userData

      await WsSend(ws, 'sys', code(req, 0, {
        message: '等待开始执行新任务 ...',
      }))
    } else {
      // 更新存在数据 / 并返回缓存数据
      // 登陆后则无需处理mobile，因为是和会话绑定
      userData = userList[userId]
      userData.ws = ws
      userData.req = req
      userData.electricData = electricData
      userData.close = 0

      await WsSend(ws, 'sys', code(req, 0, {
        type: 'DATA',
        data: {
          codeTime: userData.codeTime,
          code: userData.code,
          day: userData.day,
          cacheData: userData.cacheData,
          status: userData.status,
        },
        message: '存在未完成任务，返回继续任务状态 ...',
      }))
    }

    // 3 生成主动关闭情况
    // 30min后主动关闭 / 删除缓存
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
    // 如果任务已经完成删除
    // 否则继续执行（等待自动关闭 / 或用户重新打开）
    WsOnClose(ws, async () => {
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
    // 根据请求type转发用户对象方法
    // Promise方法必须await，或return
    // 否则无法传递异常
    WsOnMessage(ws, async (message) => {
      await userData
        ._missionCreate(JSON.parse(message))
    }, err => {
      WsSend(ws, code(req, 3049, err))
    })
  },

}
