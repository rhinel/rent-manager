'use strict'

//提供默认错误提示
const codeList = {
	//outer类
	1000: '接口失败，请联系管理员',
	1001: '登录失败',
	1002: 'bing接口失败',
	//auth类
	2001: '未登录',
	//inner类
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
			code: code,
			msg: data.data || codeList[code] || '未定义错误'
		}
	} else {
		return {
			code: 0,
			data: data.data
		}
	}
}