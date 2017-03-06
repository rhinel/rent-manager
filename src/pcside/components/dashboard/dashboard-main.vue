<style lang="scss">
	.dashboard-main{
		.el-row{
			margin-bottom: 20px;
		}
		.el-card__header{
			position: relative;
		}
		.card-header{
			font-weight: bold;
		}
		.card-btn{
			position: absolute;
			top: 50%;
			right: 20px;
			transform: translateY(-50%);
		}
		.count-wrap .el-card__body{
			display: flex;
			justify-content: space-around;
		}
		.count{
			padding: 10px 0;
			& > div {
				padding-top: 10px;
				text-align: center;
				padding-bottom: 10px;
			}
			& > span:first-of-type{
				font-size: 48px;
			}
		}
		.detail-wrap{
		}
	}
</style>

<template>
	<div class="dashboard-main">
		<el-row :gutter="20">
			<el-col :span="18" :xs="24">
				<el-row>
					<el-card class="count-wrap">
						<div class="count">
							<div>房屋总数</div>
							<span>{{countDown.houseCount || 0}}</span>
							<span>户</span>
						</div>
						<div class="count">
							<div>待收租金</div>
							<span>0</span>
							<span>户</span>
						</div>
						<div class="count">
							<div>待交房东</div>
							<span>0</span>
							<span>户</span>
						</div>
					</el-card>
				</el-row>
				<el-row>
					<el-card>
						<div slot="header">
							<span class="card-header">待收租金列表</span>
							<el-button class="card-btn" type="primary" :loading="gettingRentList">刷新</el-button>
						</div>
						<el-table
							class="rent-list-table"
							:data="rentList"
							v-loading.body="gettingRentList"
							stripe>
							<el-table-column
								prop="fanghao"
								label="房屋"
								width="180"
								sortable>
							</el-table-column>
							<el-table-column
								prop="fanghao"
								label="房租"
								width="180"
								sortable>
							</el-table-column>
							<el-table-column
								prop="fanghao"
								label="租户信息">
							</el-table-column>
						</el-table>
					</el-card>
				</el-row>
				<el-row>
					<el-card>
						<div slot="header">
							<span class="card-header">待交租金列表</span>
							<el-button class="card-btn" type="primary" :loading="gettingRentList2">刷新</el-button>
						</div>
						<el-table
							class="rent-list-table"
							:data="rentList2"
							v-loading.body="gettingRentList2"
							stripe>
							<el-table-column
								prop="fanghao"
								label="房屋"
								width="180"
								sortable>
							</el-table-column>
							<el-table-column
								prop="fanghao"
								label="房租"
								width="180"
								sortable>
							</el-table-column>
							<el-table-column
								prop="fanghao"
								label="租户信息">
							</el-table-column>
						</el-table>
					</el-card>
				</el-row>
			</el-col>
			<el-col :span="6" :xs="24">
				<el-row>
					<el-card class="detail-wrap">
						<div slot="header">
							<span class="card-header">操作说明</span>
						</div>
						<div class="detail-content">
							业务一：房屋管理<br>
							1、房屋添加修改删除<br>
							业务二：收租/租住管理<br>
							1、抄数：水电，信息更新<br>
							2、计费：水电（非周期，每次按照计费信息结算），每次收租一个租户（或空置）针对一个计费<br>
							（中途缴费水电的情况先抄表，写备注在抄表信息中，不计费，计费时候收差额）<br>
							3、收租：房租（周期，周期内可多次），周期内可有多个租户，多次收租（计费来源）<br>
							4、搬出入住/修改：计费信息初始化，必须为上次收租结束/空置处理结束/本次计费之前，用户自行确认<br>
							备注：空置作计费处理，不收租
						</div>
					</el-card>
				</el-row>
				<el-row>
					<el-card class="detail-wrap">
						<div slot="header">
							<span class="card-header">记事本</span>
						</div>
					</el-card>
				</el-row>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import TWEEN from 'tween.js'

	export default {
		name: 'dashboard-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/dashboard/index')
		},
		created () {
			this.getCount()
		},
		data () {
			return {
				gettingRentList: false,
				gettingRentList2: false,
				count: {
					houseCount: 0
				},
				countDown: {
					houseCount: 0
				},
				rentList: [],
				rentList2: []
			}
		},
		watch: {
			'count.houseCount' (n, o) {
				let _this = this
				function animate (time) {
					requestAnimationFrame(animate)
					TWEEN.update(time)
				}
				new TWEEN.Tween({ tweeningValue: o })
				.to({ tweeningValue: n }, 200)
				.onUpdate(function () {
					_this.countDown.houseCount = this.tweeningValue.toFixed(0)
				})
				.start()
				animate()
			}
		},
		methods: {
			getCount () {
				this.Ajax('/inner/dash/count', {}, (res)=>{
					this.count = res.body.data
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
				})
			}
		}
	}
</script>