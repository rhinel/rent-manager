
const log4js = require('log4js')

const FoundError = require('./config-error')

const loginLog = log4js.getLogger('login')
const apiErrorLog = log4js.getLogger('apiError')

// 提供默认错误提示
const codeList = {
  // outer类
  1000: '接口失败，请联系管理员',
  1001: '登陆失败',
  1002: '登出失败',
  1003: 'bing接口失败',
  1004: '获取用户配置出错',
  1005: '更新用户配置出错',
  // auth类
  2001: '长时间无操作或登陆失效，请重新登陆',
  // inner类
  //
  3001: '数据获取失败',
  3002: '数据保存失败',
  3003: '删除失败',
  // 房屋管理，增删改查
  3011: '房屋添加/删除失败',
  3012: '房屋列表获取失败',
  3013: '房屋删除失败',
  3014: '查询失败',
  3015: '获取带计费房屋列表失败',
  3016: '获取房屋详情失败',
  // 水费管理，增，
  3021: '抄表失败',
  3022: '水费聚合列表获取失败',
  3023: '水表计费失败',
  3024: '抄表历史获取失败',
  3025: '计费历史获取失败',
  3026: '抄表记录删除失败',
  3027: '计费历史删除失败',
  3028: '查询失败',
  // 租住信息
  3031: '租住列表获取失败',
  3032: '入住/修改失败',
  3033: '搬出失败',
  3034: '租住历史获取失败',
  3035: '租住历史删除失败',
  // 电费管理，增，
  3041: '抄表失败',
  3042: '电费聚合列表获取失败',
  3043: '电表计费失败',
  3044: '抄表历史获取失败',
  3045: '计费历史获取失败',
  3046: '抄表记录删除失败',
  3047: '计费历史删除失败',
  3048: '查询失败',
  // 收租管理
  3051: '添加月份失败',
  3052: '获取月份周期列表失败',
  3053: '删除月份周期失败',
  3054: '查询失败',
  3055: '获取最新月度周期信息失败',
  //
  3061: '查询月度周期失败',
  3062: '计租失败',
  3063: '修改单据状态失败',
  3064: '删除计租信息失败',
  3065: '计租历史查询失败',
  3066: '历史数据获取失败',
  3067: '获取最新月度周期列表失败',
  3068: '获取月度房租详情失败',
  3069: '获取统计未交房东数据失败',
  30610: '获取租单信息失败',
  30611: '更新对账状态失败',
  // 主控
  3071: '统计数据获取失败',
  3072: '添加记事出错',
  3073: '获取记事列表出错',
  3074: '拉取列表失败',
  3075: '获取等待统计失败',
  3076: '获取ok统计失败',
  3077: '获取ok列表失败',
  3078: '获取空置列表失败',
  //
  9999: '接口不存在',
}

// 根据接口使用返回格式化
module.exports = (req = {}, code = 0, data = '') => {
  const { url } = req
  // code 1 为登录接口，记录所有日志
  if (req.url.includes('/outer/log/')) {
    const { name, pwd } = req.body
    loginLog.info(url, name, pwd, data.message || data)
  }

  // apiError 非自定义类型错误，应该保存日志
  if (data instanceof Error && !(data instanceof FoundError)) {
    apiErrorLog.error(url, data)
  }

  if (data instanceof Error) {
    return {
      code: Number(`${code}${data.code || ''}`),
      msg: data.message || codeList[code] || '未定义错误',
    }
  } else if (code) {
    return {
      code,
      msg: data || codeList[code] || '未定义错误',
    }
  }
  return {
    code: 0,
    data,
  }
}
