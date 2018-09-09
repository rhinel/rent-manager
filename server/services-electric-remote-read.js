// const FoundError = require('./config-error')
const code = require('./config-codes')
const wsCallback = require('./config-wscallback')
// const db = require('./models')

const servicesHouse = require('./services-house')

const userList = {}

module.exports = {

  remoteRead: async (req, ws) => {
    // 本用户Data缓存
    // 获取全部可处理房屋数据
    // 如果没有登陆电力系统则断开链接删除
    // 否则电力系统token过期并且断开链接则删除
    // 等待用户链接电力系统
    // 根据用户参数请求数据 并返回
    // 根据用户参数执行 写入数据
    // 错误重试规则

    // 1 本用户Data缓存
    const { userId } = req
    const userData = userList[userId] ? userList[userId] : {}
    userList[userId] = userData

    // 2 获取全部可处理房屋数据
    const houseList = await servicesHouse
      .houseList(req)

    wsCallback(ws, 'houseList', code(req, 0, houseList))
  },

}
