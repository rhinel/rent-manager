import Superagent from 'superagent'

module.exports = {
	strict: process.env.NODE_ENV !== 'production',
	//数据
	state: {
		menuing: ''
	},
	//处理
	getters: {

	},
	//提交
	mutations: {
		updateMenu (state, menuing) {
			state.menuing = menuing
		}
	},
	//行为
	actions: {
		updateMenu (context, menuing) {
			context.commit('updateMenu', menuing)
		}
	}
}