<style lang="scss">
	.auth-inner-index{
		padding-left: 200px;
		padding-top: 50px;
		.inner-header{
			width: 100%;
			height: 50px;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			background-color: #324157;
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
			
		</div>
		<el-menu default-active="2" class="el-menu-vertical-demo inner-sidebar" @open="handleOpen" @close="handleClose" theme="dark">
			<el-submenu index="1">
				<template slot="title"><i class="el-icon-message"></i>导航一</template>
				<el-menu-item-group>
					<template slot="title">分组一</template>
					<el-menu-item index="1-1">选项1</el-menu-item>
					<el-menu-item index="1-2">选项2</el-menu-item>
				</el-menu-item-group>
				<el-menu-item-group title="分组2">
					<el-menu-item index="1-3">选项3</el-menu-item>
				</el-menu-item-group>
				<el-submenu index="1-4">
					<template slot="title">选项4</template>
					<el-menu-item index="1-4-1">选项1</el-menu-item>
				</el-submenu>
			</el-submenu>
			<el-menu-item index="2"><i class="el-icon-menu"></i>导航二</el-menu-item>
			<el-menu-item index="3"><i class="el-icon-setting"></i>导航三</el-menu-item>
		</el-menu>
		<router-view class="inner-body"></router-view>
	</div>
</template>

<script>
	export default {
		name: 'auth-inner-index',
		methods: {
			handleOpen(key, keyPath) {
				console.log(key, keyPath);
			},
			handleClose(key, keyPath) {
				console.log(key, keyPath);
			}
		}
	}
</script>