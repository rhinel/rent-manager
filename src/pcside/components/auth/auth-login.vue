<style lang="scss">
	.auth-login{
		height: 100%;
		width: 100%;
		position: relative;
		background-size: cover;
		background-position: center center;
		background-image: url(../../img/index_intro_bg.jpg);
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
				0% {opacity: 0;}
				50% {opacity: 1;}
				100% {opacity: 0;}
			}
			& > i{
				display: inline-block;
				width: 15px;
				height: 5px;
				background-color: #666;
				opacity: 0;
				animation:hello 1.5s infinite;
			}
		}
		.login-go{
			width: 100%;
		}
		#index-canvas{
			width: 100vw;
			height: 100vh;
			display: block;
		}
	}
</style>

<template>
	<div class="auth-login" id="large-header" @keyup.enter="getLogin">
		<!--  :style="{backgroundImage:'url('+ bingBg +')'}" -->
		<canvas id="index-canvas"></canvas>
		<el-card class="login-wrap">
			<div class="login-hello">Hello {{logininfo.name}} <i></i></div>
			<el-form :model="logininfo" ref="logininfo" :rules="loginrules">
				<el-form-item prop="name">	
					<el-input
						placeholder="Name"
						icon="star-on"
						:maxlength="10"
						v-model="logininfo.name">
					</el-input>
				</el-form-item>
				<el-form-item  prop="pwd">
					<el-input
						type="password"
						placeholder="Pwd"
						icon="star-on"
						v-model="logininfo.pwd">
					</el-input>
				</el-form-item>
				<el-button class="login-go" type="primary" :loading="logininfo.loading" @click="getLogin">登陆</el-button>
			</el-form>
		</el-card>
	</div>
</template>

<script>
	import Md5 from 'md5'
	import Circ from '../../js/indexCanvas/easePack.min.js'
	import TweenLite from '../../js/indexCanvas/tweenLite.min.js'
	import indexCanvas from '../../js/indexCanvas/indexCanvas.js'

	export default {
		name: 'auth-login',
		created () {
			//this.getBingBg()
		},
		mounted () {
			indexCanvas()
		},
		data () {
			return {
				bingBg: '',
				logininfo: {
					name: '',
					pwd: '',
					loading: false
				},
				loginrules: {
					name: [
						{ required: true, message: '请填写', trigger: 'blur' }
					],
					pwd: [
						{ required: true, message: '请填写', trigger: 'blur' },
						{ min: 3, message: '太短了', trigger: 'blur' }
					]
				}
			}
		},
		methods: {
			getBingBg () {
				this.Ajax('/outer/log/bingBg', {}, (res)=>{
					this.bingBg = res.body.data.fav.murl
				})
			},
			getLogin () {
				if (this.logininfo.loading) {
					return true
				}
				this.logininfo.loading = true
				this.$refs.logininfo.validate((valid)=>{
					if (valid) {
						this.Ajax('/outer/log/login', {
							name: this.logininfo.name,
							pwd: Md5(this.logininfo.pwd)
						}, (res)=>{
							localStorage.setItem('token', res.body.data)
							this.$message({
								type: 'success',
								message: '登陆成功',
								duration: 2000
							})
							if (this.$route.query.backurl) {
								this.$router.push(this.$route.query.backurl)
							} else {
								this.$router.push('/inner')
							}
							this.logininfo.loading = false
						}, (res)=>{
							this.$message({
								type: 'error',
								message: '编号：' + res.body.code + '，' + res.body.msg,
								duration: 2000
							})
							this.logininfo.loading = false
						})
					} else {
						this.logininfo.loading = false
					}
				})
			}
		}
	}
</script>