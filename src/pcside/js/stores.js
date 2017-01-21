module.exports = {
	state : {
		token : '',
	},
	mutations : {
		signup (token, id) {
			token = id
		},
		logout (token) {
			token = ''
		}
	}
}