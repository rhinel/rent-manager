<style lang="scss">
	.dashboard-main{
		.el-row {
			margin-bottom: 20px;
			&:last-child {
				margin-bottom: 0;
			}
		}
	}
</style>

<template>
	<div class="dashboard-main">
		<el-row :gutter="20">
			<el-col :span="24">
				<el-card>
					//放置统计计数
				</el-card>
			</el-col>
		</el-row>
		
		<el-row :gutter="20">
			<el-col :span="12">
				<el-card>
					//栏目1
				</el-card>
			</el-col>
			<el-col :span="12">
				<el-card>
					//栏目2
				</el-card>
			</el-col>
		</el-row>
		
	</div>
</template>

<script>
	export default {
		name: 'dashboard-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/dashboard/index')
		}
	}
</script>