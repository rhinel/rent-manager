import Superagent from 'superagent'

module.exports = {
	strict: process.env.NODE_ENV !== 'production',
	//数据
	state: {
		menuing: '',
		menuCheck: '',
		titleAdd: ''
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