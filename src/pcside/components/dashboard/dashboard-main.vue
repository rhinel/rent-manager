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
					//放置统计计数<br>
					//时间<br>
					//最新周期多少户没收完租<br>
					//共多少户
				</el-card>
			</el-col>
		</el-row>
		
		<el-row :gutter="20">
			<el-col :span="12">
				<el-card>
					//栏目1<br>
					操作说明：<br>
					业务一：房屋管理<br>
					1、房屋添加修改删除<br>

					业务二：收租/租住管理<br>
					1、抄数：水电，信息更新<br>
					2、计费：水电（非周期，每次按照计费信息结算），每次收租一个租户（或空置）针对一个计费<br>
					（中途缴费水电的情况先抄表，写备注在抄表信息中，不计费，计费时候收差额）<br>
					3、收租：房租（周期，周期内可多次），周期内可有多个租户，多次收租（计费来源）<br>
					4、搬出入住/修改：计费信息初始化，必须为上次收租结束/空置处理结束/本次计费之前，用户自行确认<br>

					备注：空置作计费处理，不收租

				</el-card>
			</el-col>
			<el-col :span="12">
				<el-card>
					//栏目2<br>
					//待收租列表及时间，金额，状态
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