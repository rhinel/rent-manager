module.exports = {
	routes: [
		//outer层，默认层
		{//登陆层
			path: '/login',
			component: require('../components/auth/auth-login'),
			alias: ''
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
				},
				{//房屋管理
					path: 'house',
					component: require('../components/house/house-index'),
					children: [
						{
							path: 'index',
							component: require('../components/house/house-list'),
							alias: ''
						}
					]
				},
				{//水费管理
					path: 'water',
					component: require('../components/water/water-index'),
					children: [
						{
							path: 'index',
							component: require('../components/water/water-main'),
							alias: ''
						},
						{
							path: 'history',
							component: require('../components/water/water-history')
						}
					]
				},





				{//租住管理
					path: 'lease',
					component: require('../components/lease/lease-index'),
					children: [
						{
							path: 'index',
							component: require('../components/lease/lease-main'),
							alias: ''
						},
						{
							path: 'history',
							component: require('../components/lease/lease-history')
						}
					]
				},




				{//系统管理
					path: 'system',
					component: require('../components/system/system-index'),
					children: [
						{
							path: 'index',
							component: require('../components/system/system-main'),
							alias: ''
						}
					]
				}
			]
		}
	]
}