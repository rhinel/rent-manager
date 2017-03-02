<style lang="scss">
	html, body{
		height: 100%;
		width: 100%;
		font-size: 14px;
		font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
	}
	.el-table .el-table__body .cell{
		padding: 5px 18px;
	}
</style>

<template>
	<router-view class="index"></router-view>
</template>

<script>
	export default {
		name: 'index'
	}
</script>