<style lang="scss">
	.rent-month{
		.table-btn{
			margin-bottom: 20px;
		}
		.table-btn-input{
			max-width: 300px;
			display: inline-block;
			margin-left: 10px;
		}
		.add-month-det-dialog{
			.el-input{
				width: 100%;
				max-width: 300px;
			}
			.el-select{
				width: 100%;
				max-width: 300px;
			}
		}
		.month-det-show-pop{
			display: inline-block;
			margin-left: 10px;
		}
	}
	.month-det-d-rent-pop-cont{
		text-align: right;
		margin: 0;
	}
</style>

<template>
	<div class="rent-month">
		<!-- 顶部按钮组 -->
		<div class="table-btn">
			<el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
			<div class="table-btn-input">
				<el-input v-model="monthDetSearch" placeholder="搜索"></el-input>
			</div>
		</div>

		<!-- 计租表单 -->
		<el-dialog :title="ardDialogTitle" v-model="addRentflag" size="tiny" class="add-month-det-dialog" :close-on-click-modal="false" @close="onAddRentDialogClose">
			<el-form :model="addRent" ref="addRent" :rules="addRentrules">
				<el-form-item>
					<el-alert title="请确认计租信息" type="info"></el-alert>
				</el-form-item>
				<el-form-item label="水费信息" :label-width="ardLabelWidth">
					<div v-if="addRent.calWater.calWater">
						计费方式：{{addRent.calWater.calWater.calType == 'single' ? '单一价格' : '阶梯价格'}}<br>
						最低消费：{{addRent.calWater.calWater.minPrice}}吨<br>
						本次表数：{{addRent.calWater.tnew.water}}吨<br>
						上次表数：{{addRent.calWater.old.water}}吨<br>
						计费单价：{{addRent.calWater.calWater.calType == 'single' ? addRent.calWater.calWater.singlePrice : getPrice(addRent.calWater.calWater.stepPrice, addRent.calWater.tnew.water - addRent.calWater.old.water)}}元/吨<br>
						水费：{{addRent.calWater.calWaterResult}}元<br>
						计费时间：{{getTime(addRent.calWater.addTime)}}
					</div>
					<div v-else>
						暂无
					</div>
				</el-form-item>
				<el-form-item label="电费信息" :label-width="ardLabelWidth">
					<div v-if="addRent.calElectric.calElectric">
						计费方式：{{addRent.calElectric.calElectric.calType == 'single' ? '单一价格' : '阶梯价格'}}<br>
						最低消费：{{addRent.calElectric.calElectric.minPrice}}度<br>
						本次表数：{{addRent.calElectric.tnew.electric}}度<br>
						上次表数：{{addRent.calElectric.old.electric}}度<br>
						计费单价：{{addRent.calElectric.calElectric.calType == 'single' ? addRent.calElectric.calElectric.singlePrice : getPrice(addRent.calElectric.calElectric.stepPrice, addRent.calElectric.tnew.electric - addRent.calElectric.old.electric)}}元/度<br>
						电费：{{addRent.calElectric.calElectricResult}}元<br>
						计费时间：{{getTime(addRent.calElectric.addTime)}}
					</div>
					<div v-else>
						暂无
					</div>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="getAddRentDialog" :loading="gettingAddRent">取消</el-button>
				<el-button type="primary" @click="getAddRent" :loading="gettingAddRent">确定</el-button>
			</div>
		</el-dialog>

		<!-- 月周期图表 -->
		<el-table
			class="month-table"
			:data="filterMonthDetData"
			v-loading.body="gettingListRefresh"
			stripe
			border>
			<el-table-column
				prop="fanghao"
				label="房屋"
				width="180"
				sortable>
				<template scope="scope">
					<router-link :to="{ path: '/inner/rent/history', query: { id: scope.row._id }}">
						<el-button type="text">{{scope.row.fanghao}}</el-button>
					</router-link>
				</template>
			</el-table-column>
			<el-table-column
				label="计租信息">
			</el-table-column>
			<el-table-column
				label="操作"
				width="200">
				<template scope="scope">
					<el-button
						size="small"
						type="primary"
						@click="getAddRentDialog(scope.$index, scope.row)">计租</el-button>
					<el-button
						size="small"
						type="primary"
						@click="getChangeRentDialog(scope.$index, scope.row)">状态</el-button>
					<el-popover
						placement="top"
						width="150"
						trigger="click"
						v-model="scope.row.dRentPopFlag">
						<p>确认删除该计租信息吗？其他数据不受影响，但无法恢复关联信息</p>
						<div class="month-det-d-rent-pop-cont">
							<el-button size="mini" type="text" @click="scope.row.dRentPopFlag = false">取消</el-button>
							<el-button type="danger" size="mini" @click="(scope.row.dRentPopFlag = false) || getDelRent(scope.$index, scope.row)">确定</el-button>
						</div>
						<div slot="reference" class="month-det-show-pop">
							<el-button
								size="small"
								type="danger"
								:loading="scope.row.gettingdelRent">删除</el-button>
						</div>
					</el-popover>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
	export default {
		name: 'rent-month',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/rent/index')
		},
		created () {
			this.getListRefresh()
		},
		data () {
			return {
				addRentflag: false,
				gettingAddRent: false,
				gettingListRefresh: false,

				ardDialogTitle: '计租',
				ardLabelWidth: '90px',
				addRent: {
					calWater: {}, //水费计费信息
					calElectric: {}, //电费计费信息
					lease: {}, //租户信息
					fanghao: '',
					_id: '',
					calRentResult: 0,
					fix: false,
					remark: ''
				},
				addRentrules: {

				},

				monthDetData: [],
				monthDetSearch: '',
			}
		},
		computed: {
			filterMonthDetData () {
				if (!this.monthDetSearch) {
					return this.monthDetData
				} else {
					let _monthDetSearch = new RegExp(this.monthDetSearch, 'i')
					return this.monthDetData.filter((item)=>{
						for (var i in item) {
							if (i != 'fanghao' && i != 'remark') {
								continue
							} else if (String(item[i]).match(_monthDetSearch)) {
								return true
							}
						}
						return false
					})
				}
			},
			calRentResult () {
				let result = 0
				let add = this.addRent
				result = add.calWater.calWaterResult + add.calElectric.calElectricResult + add.lease.rent //房租计算
				return result
			}
		},
		watch: {
			calRentResult (n, o) {
				this.addRent.calRentResult = n
			},
			'addRent.calRentResult' (n, o) {
				n == this.calRentResult && (this.addRent.fix = false)
				n != this.calRentResult && (this.addRent.fix = true)
			}
		},
		methods: {
			getListRefresh () {
				if (this.gettingListRefresh) {
					return true
				}
				this.gettingListRefresh = true
				this.Ajax('/inner/rent/listByMonth', {
					monthId: this.$route.query.id
				}, (res)=>{
					this.monthDetData = res.body.data
					this.gettingListRefresh = false
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					this.gettingListRefresh = false
				})
			},
			getAddRentDialog (index, row) {
				this.addRentflag = !this.addRentflag
				this.addRent.fix = false
				if (this.addRentflag && row) {
					this.addRent.calWater = row.calWaterId
					this.addRent.calElectric = row.calElectricId
					this.addRent.lease = row.leaseId
					this.addRent.fanghao = row.fanghao
					this.addRent._id = row._id
					this.remark = row.leaseId.remark
				}
			},
			getResetAddRent () {
				this.addRent.calWater = {}
				this.addRent.calElectric = {}
				this.addRent.lease = {}
				this.addRent.fanghao = ''
				this.addRent._id = ''
				this.addRent.calRentResult = 0
				this.remark = ''
			},
			onAddRentDialogClose () {
				this.$refs.addRent.resetFields()
				this.getResetAddRent()
			},
			getPrice (arr, p) {
				let price = 0
				arr.forEach((item, i, iarr)=>{
					p > (iarr[i-1] ? iarr[i-1].step : 0) && p <= item.step && item.step != 0 && (price = item.price)
				})
				return price
			},
			getTime (t) {
				return t? this.GetTimeFormat(t) : '--'
			},
			getAddRent () {

			},
			getChangeRentDialog (index, row) {

			},
			getDelRent (index, row) {

			}
		}
	}
</script>