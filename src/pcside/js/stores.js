import Superagent from 'superagent'

module.exports = {
	strict: process.env.NODE_ENV !== 'production',
	//数据
	state: {
		menuing: '',
		menuCheck: ''
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
		}
	},
	//行为
	actions: {
		updateMenu (context, menuing) {
			context.commit('updateMenu', menuing)
		},
		menuCheck (context, path) {
			context.commit('menuCheck', path)
		}
	}
}