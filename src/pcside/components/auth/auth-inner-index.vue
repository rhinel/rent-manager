<style lang="scss">
	.auth-inner-index{
		padding-left: 200px;
		padding-top: 50px;
		.el-icon-loading{
			margin-left: 10px;
		}
		.inner-header{
			width: 100%;
			height: 50px;
			line-height: 50px;
			color: #F9FAFC;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			background-color: #324157;
			display: flex;
			padding: 0 20px;
			.header-left{
				width: 200px;
			}
			.header-name{
				flex: 1;
			}
			.header-right{
				width: 120px;
				cursor: pointer;
				color: #D3DCE6;
				.el-icon-star-on{
					margin-right: 10px;
				}
				&:hover{
					color: #fff;
				}
			}
		}
		.inner-sidebar{
			width: 200px;
			height: calc( 100vh - 50px );
			border-radius: 0;
			position: fixed;
			top: 50px;
			left: 0;
			bottom: 0;
		}
		.inner-body{
			padding: 20px;
		}
	}
</style>

<template>
	<div class="auth-inner-index">
		<div class="inner-header">
			<div class="header-left">
				Rent Manager
			</div>
			<div class="header-name">
				{{$route.meta.name + ' ' + titleAdd}}
			</div>
			<div class="header-right" @click="logout">
				<i class="el-icon-star-on"></i>登出<i v-show="logouting" class="el-icon-loading"></i>
			</div>
		</div>
		<el-menu :default-active="menuing" class="inner-sidebar" theme="dark" :router="true">
			<el-menu-item index="/inner/dashboard/index"><i class="el-icon-star-on"></i>主控面板<i class="el-icon-loading" v-show="menuCheck.indexOf('inner/dashboard/') > 0"></i></el-menu-item>
			<el-menu-item index="/inner/house/index"><i class="el-icon-star-on"></i>房屋管理<i class="el-icon-loading" v-show="menuCheck.indexOf('inner/house/') > 0"></i></el-menu-item>
			<el-menu-item index="/inner/water/index"><i class="el-icon-star-on"></i>水费管理<i class="el-icon-loading" v-show="menuCheck.indexOf('inner/water/') > 0"></i></el-menu-item>
			<el-menu-item index="/inner/electric/index"><i class="el-icon-star-on"></i>电费管理<i class="el-icon-loading" v-show="menuCheck.indexOf('inner/electric/') > 0"></i></el-menu-item>
			<el-menu-item index="/inner/lease/index"><i class="el-icon-star-on"></i>租住管理<i class="el-icon-loading" v-show="menuCheck.indexOf('inner/lease/') > 0"></i></el-menu-item>
			<el-menu-item index="/inner/rent/index"><i class="el-icon-star-on"></i>收租管理<i class="el-icon-loading" v-show="menuCheck.indexOf('inner/rent/') > 0"></i></el-menu-item>
			<el-menu-item index="/inner/system/index"><i class="el-icon-setting"></i>系统设置<i class="el-icon-loading" v-show="menuCheck.indexOf('inner/system/') > 0"></i></el-menu-item>
		</el-menu>
		<router-view class="inner-body"></router-view>
	</div>
</template>

<script>
	export default {
		name: 'auth-inner-index',
		data() {
			return {
				logouting: false
			}
		},
		computed: {
			menuing () {
				return this.$store.state.menuing
			},
			menuCheck () {
				return this.$store.state.menuCheck
			},
			titleAdd () {
				return this.$store.state.titleAdd
			}
		},
		methods: {
			logout () {
				if (this.logouting) {
					return true
				}
				this.logouting = true
				this.Ajax('/outer/log/logout', {}, (res)=>{
					this.$message({
						type: 'success',
						message: '退出成功',
						duration: 2000
					})
					this.$router.push('/login')
				})
			}
		}
	}
</script>