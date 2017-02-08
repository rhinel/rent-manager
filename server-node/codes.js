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
	3011: '房屋添加失败',
	3012: '房屋列表获取失败',
	3013: '房屋删除失败',
	//水费管理，增，
	3021: '抄表失败',
	3022: '水费聚合列表获取失败',



	3001: '数据获取失败',
	3002: '数据保存失败',
	3003: '删除失败',





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