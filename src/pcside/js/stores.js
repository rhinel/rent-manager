import Superagent from 'superagent'

module.exports = {
	strict: process.env.NODE_ENV !== 'production',
	//数据
	state: {
		menuing: '',
		menuCheck: '',
		titleAdd: '',

		default: {
			payTypeVal: ['微信', '支付宝', '银行转账', '现金', '房东自收', '其他'],
			typesVal: ['', '已交', '给单', '房东']
		}
	},
	//处理
	getters: {

	},
	//提交
	mutations: {
		updateMenu (state, menuing) {
			state.menuing = menuing
		},
		menuCheck (state, path) {
			state.menuCheck = path
		},
		titleAdd (state, add) {
			state.titleAdd = add
		}
	},
	//行为
	actions: {
		updateMenu (context, menuing) {
			context.commit('updateMenu', menuing)
		},
		menuCheck (context, path) {
			context.commit('menuCheck', path)
		},
		titleAdd (context, add) {
			context.commit('titleAdd', add)
		}
	}
}