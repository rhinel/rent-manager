'use strict'

//提供默认错误提示
const codeList = {
	1000: '接口失败，请联系管理员',
	1001: '登录失败',
	1002: '未登录',
	1003: '数据获取失败',
	1004: '数据保存失败',
	1005: '删除失败',





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
			msg: data.data || codeList[code]
		}
	} else {
		return {
			code: 0,
			data: data.data
		}
	}
}