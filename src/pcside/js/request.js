import Superagent from 'superagent'

//定义负载常量
const rootPath = '/api'

//方法封装
const request = function(path, data, callscue, callerr) {
	let token = localStorage.getItem('token')
	path  = rootPath + path
	data = Object.assign({}, data)
	token && (data.token = token)

	Superagent
		.post(path)
		.send(data)
		.end((err, res)=>{
			if (err) {
				//接口错误，报错退出
				this.$message({
					type: 'error',
					message: '状态：' + err.status + '，网络/服务器错误',
					duration: 2000
				})
			} else if (res.body.code == '2001' && path.indexOf('/auth') < 0) {
				//非auth接口，登陆失效或者未登陆，先报错后，清除旧登陆信息，跳转
				this.$message({
					type: 'error',
					message: '编号：' + res.body.code + '，' + res.body.msg,
					duration: 2000
				})
				localStorage.removeItem('token')
				this.$router.push({
					path: '/login',
					query: {backurl: this.$router.currentRoute.fullPath}
				})
			} else if (res.body.code) {
				//接口返回错误代码，继续执行，由方法自行判断，默认报错退出
				if (!callerr) {
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
				} else {
					callerr(res)
				}
			} else {
				//返回成功，直接执行，没有默认行为
				if (!callscue) {
					this.$message({
						type: 'success',
						message: '操作成功',
						duration: 2000
					})
				} else {
					callscue(res)
				}
			}
		})
}

module.exports = request