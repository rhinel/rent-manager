module.exports = {
	routes: [
		//outer层，默认层
		{//登录层
			path: '/login',
			component: require('../components/auth/auth-login')
		},
		{//inner层
			path: '/inner',
			component: require('../components/auth/auth-inner-index'),
			children: [
				{//dashboard层，默认层
					path: 'dashboard',
					component: require('../components/dashboard/dashboard-index'),
					alias: '',
					children: [
						{//页面层，默认首页
							path: 'index',
							component: require('../components/dashboard/dashboard-main'),
							alias: ''
						}
					]
				}
			]
		}
	]
}