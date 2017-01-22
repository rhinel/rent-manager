<style lang="scss">
	.auth-login{
		height: 100%;
		width: 100%;
		position: relative;
		background-size: cover;
		background-position: center center;
		.login-wrap{
			width: 500px;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translateX(-50%) translateY(-50%);
		}
		.login-hello{
			font-size: 30px;
			text-align: center;
			margin-bottom: 20px;
			@keyframes hello{
				from {opacity: 1;}
				to {opacity: 0;}
			}
			& > i{
				display: inline-block;
				width: 15px;
				height: 5px;
				background-color: #333;
				opacity: 0;
				animation:hello 0.8s infinite;
			}
		}
		.login-info{
			margin-bottom: 20px;
		}
		.login-go{
			width: 100%;
		}
	}
</style>

<template>
	<div class="auth-login" :style="{backgroundImage:'url('+ bingBg +')'}" theme="dark">
		<el-card class="login-wrap">
			<div class="login-hello">Hello {{name}} <i></i></div>
			<el-input
				class="login-info"
				placeholder="Name"
				icon="star-on"
				:maxlength="10"
				v-model="name">
			</el-input>
			<el-input
				class="login-info"
				placeholder="Pwd"
				icon="star-on"
				v-model="pwd">
			</el-input>
			<el-button class="login-go" type="primary">登陆</el-button>
		</el-card>
	</div>
</template>

<script>
	export default {
		name: 'auth-login',
		created () {
			this.getBingBg()
		},
		data () {
			return {
				bingBg: '',
				name: '',
				pwd:''
			}
		},
		methods: {
			getBingBg () {
				let _this = this
				this.ajax.post('/api/outer/log/bingBg').send({}).end((err, res)=>{
					if (res.body.code == '0') {
						_this.bingBg = res.body.data.fav.murl
					} else {
						console.log(err)
					}
				})
			}
		}
	}
</script>