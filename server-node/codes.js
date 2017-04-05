'use strict'

//提供默认错误提示
const codeList = {
	//outer类
	1000: '接口失败，请联系管理员',
	1001: '登陆失败',
	1002: '登出失败',
	1003: 'bing接口失败',
	//auth类
	2001: '长时间无操作或登陆失效，请重新登陆',
	//inner类
	//房屋管理，增删改查
	3011: '房屋添加/删除失败',
	3012: '房屋列表获取失败',
	3013: '房屋删除失败',
	3014: '查询失败',
	//水费管理，增，
	3021: '抄表失败',
	3022: '水费聚合列表获取失败',
	3023: '水表计费失败',
	3024: '抄表历史获取失败',
	3025: '计费历史获取失败',
	3026: '抄表记录删除失败',
	3027: '计费历史删除失败',
	3028: '查询失败',
	//租住信息
	3031: '租住列表获取失败',
	3032: '入住/修改失败',
	3033: '搬出失败',
	3034: '租住历史获取失败',
	3035: '租住历史删除失败',
	//电费管理，增，
	3041: '抄表失败',
	3042: '电费聚合列表获取失败',
	3043: '电表计费失败',
	3044: '抄表历史获取失败',
	3045: '计费历史获取失败',
	3046: '抄表记录删除失败',
	3047: '计费历史删除失败',
	3048: '查询失败',
	//收租管理
	3051: '添加月份失败',
	3052: '获取月份周期列表失败',
	3053: '删除月份周期失败',
	3054: '查询失败',
	//
	3061: '查询月度周期失败',
	3062: '计租失败',
	3063: '修改单据状态失败',
	3064: '删除计租信息失败',
	3065: '计租历史查询失败',
	3066: '历史数据获取失败',
	3067: '获取最新月度周期列表失败',
	//
	3001: '数据获取失败',
	3002: '数据保存失败',
	3003: '删除失败',
	//
	3071: '统计数据获取失败',
	3072: '添加记事出错',
	3073: '获取记事列表出错',
	3074: '拉取列表失败',
	//
	9999: '接口不存在'
}

//根据接口使用返回格式化
module.exports = (code, data)=>{
	!code && (code = 1000)
	!data && (data = {
		type: false,
		data: ''
	})

	if (!data.type) {
		return {
			code: data.code || code,
			msg: data.data || codeList[code] || '未定义错误'
		}
	} else {
		return {
			code: 0,
			data: data.data || ''
		}
	}
}