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
				// max-width: 300px;
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
		.fanghao-link{
			display: inline-block;
			vertical-align: middle;
		}
		.el-tag{
			vertical-align: middle;
		}
		.rent-show-tag{
			display: inline-block;
			cursor: pointer;
			vertical-align: middle;
			&.pop {
				margin-left: 10px;
			}
		}
		.rent-remark-tag{
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
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
		<el-dialog :title="addRent.fanghao + ardDialogTitle" v-model="addRentflag" size="small" class="add-month-det-dialog" :close-on-click-modal="false" @close="onAddRentDialogClose">
			<el-form :model="addRent" ref="addRent" :rules="addRentrules">
				<el-form-item>
					<el-alert title="请确认计租信息" type="info"></el-alert>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="水费信息" :label-width="ardLabelWidth">
							<div v-if="addRent.calWater.calWater">
								计费方式：{{addRent.calWater.calWater.calType == 'single' ? '单一价格' : '阶梯价格'}}<br>
								最低消费：{{addRent.calWater.calWater.minPrice}}吨<br>
								本次表数：{{addRent.calWater.tnew.water}}吨（{{getTime(addRent.calWater.tnew.addTime)}}）<br>
								上次表数：{{addRent.calWater.old.water}}吨（{{getTime(addRent.calWater.old.addTime)}}）<br>
								计费单价：{{addRent.calWater.calWater.calType == 'single' ? addRent.calWater.calWater.singlePrice : getPrice(addRent.calWater.calWater.stepPrice, addRent.calWater.tnew.water - addRent.calWater.old.water)}}元/吨<br>
								水费：{{addRent.calWater.calWaterResult}}元<br>
								计费时间：{{getTime(addRent.calWater.addTime)}}
							</div>
							<div v-else>
								暂无
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="电费信息" :label-width="ardLabelWidth">
							<div v-if="addRent.calElectric.calElectric">
								计费方式：{{addRent.calElectric.calElectric.calType == 'single' ? '单一价格' : '阶梯价格'}}<br>
								最低消费：{{addRent.calElectric.calElectric.minPrice}}度<br>
								本次表数：{{addRent.calElectric.tnew.electric}}度（{{getTime(addRent.calElectric.tnew.addTime)}}）<br>
								上次表数：{{addRent.calElectric.old.electric}}度（{{getTime(addRent.calElectric.old.addTime)}}）<br>
								计费单价：{{addRent.calElectric.calElectric.calType == 'single' ? addRent.calElectric.calElectric.singlePrice : getPrice(addRent.calElectric.calElectric.stepPrice, addRent.calElectric.tnew.electric - addRent.calElectric.old.electric)}}元/度<br>
								电费：{{addRent.calElectric.calElectricResult}}元<br>
								计费时间：{{getTime(addRent.calElectric.addTime)}}
							</div>
							<div v-else>
								暂无
							</div>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item>
					<el-alert title="租金及结果可做修正，但建议租金调整先修改租户信息" type="info"></el-alert>
				</el-form-item>
				<el-form-item label="租住周期" :label-width="ardLabelWidth">
					<div v-if="addRent.lease.leaserange">{{getTime(addRent.lease.leaserange[0])}} ~ {{getTime(addRent.lease.leaserange[1])}}</div>
					<div v-else>暂无</div>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="本月租金" :label-width="ardLabelWidth" prop="lease.rent">
							<el-input v-model.number="addRent.lease.rent" auto-complete="off" placeholder="输入本月租金"><template slot="append">元</template></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item :label="addRent.fix ? '租金修正' : '租金合计'" :label-width="ardLabelWidth" prop="calRentResult">
							<el-input v-model.number="addRent.calRentResult" auto-complete="off" placeholder="输入本月租金合计"><template slot="append">元</template></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="计租时间" :label-width="ardLabelWidth" prop="addTime">
							<el-date-picker v-model="addRent.addTime" type="datetime" placeholder="输入计费时间"></el-date-picker>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="计租备注" :label-width="ardLabelWidth">
							<el-input v-model="addRent.remark" auto-complete="off" placeholder="计租备注"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
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
					<router-link class="fanghao-link" :to="{ path: '/inner/rent/history', query: { id: scope.row._id }}">
						<el-button type="text">{{scope.row.fanghao}}</el-button>
					</router-link>
					<el-tag v-if="scope.row.rents.length > 1">多次</el-tag>
				</template>
			</el-table-column>
			<el-table-column
				label="计租信息">
				<el-table-column
					label="水费信息">
					<el-table-column
						label="本次用数">
						<template scope="scope">
							<span v-if="scope.row.rents.length">{{getRent(scope).calWater.tnew.water - getRent(scope).calWater.old.water}}吨</span>
						</template>
					</el-table-column>
					<el-table-column
						label="本次单价">
						<template scope="scope">
							<span v-if="scope.row.rents.length">{{getRent(scope).calWater.calWater.calType == 'single' ? getRent(scope).calWater.calWater.singlePrice : getPrice(getRent(scope).calWater.calWater.stepPrice, getRent(scope).calWater.tnew.water - getRent(scope).calWater.old.water)}}元/吨</span>
						</template>
					</el-table-column>
					<el-table-column
						label="本次计费">
						<template scope="scope">
							<span v-if="scope.row.rents.length">{{getRent(scope).calWater.calWaterResult}}元</span>
						</template>
					</el-table-column>
				</el-table-column>
				<el-table-column
					label="电费信息">
					<el-table-column
						label="本次用数">
						<template scope="scope">
							<span v-if="scope.row.rents.length">{{getRent(scope).calElectric.tnew.electric - getRent(scope).calElectric.old.electric}}吨</span>
						</template>
					</el-table-column>
					<el-table-column
						label="本次单价">
						<template scope="scope">
							<span v-if="scope.row.rents.length">{{getRent(scope).calElectric.calElectric.calType == 'single' ? getRent(scope).calElectric.calElectric.singlePrice : getPrice(getRent(scope).calElectric.calElectric.stepPrice, getRent(scope).calElectric.tnew.electric - getRent(scope).calElectric.old.electric)}}元/吨</span>
						</template>
					</el-table-column>
					<el-table-column
						label="本次计费">
						<template scope="scope">
							<span v-if="scope.row.rents.length">{{getRent(scope).calElectric.calElectricResult}}元</span>
						</template>
					</el-table-column>
				</el-table-column>
				<el-table-column
					label="房租信息">
					<el-table-column
						label="房租">
						<template scope="scope">
							<span v-if="scope.row.rents.length">{{getRent(scope).lease.rent}}元</span>
						</template>
					</el-table-column>
				</el-table-column>
				<el-table-column
					label="合计">
					<template scope="scope">
						<span v-if="scope.row.rents.length">{{getRent(scope).calRentResult}}元</span>
					</template>
				</el-table-column>
				<el-table-column
					label="备注">
					<template scope="scope">
						<el-popover
							placement="right"
							trigger="hover"
							 v-if="scope.row.rents.length">
							<div class="rent-remark">{{ getRent(scope).remark }}</div>
							<div slot="reference" class="rent-show-tag">
								<div class="rent-remark-tag">{{ getRent(scope).remark }}</div>
							</div>
						</el-popover>
					</template>
				</el-table-column>
			</el-table-column>
			<el-table-column
				label="操作"
				width="220">
				<template scope="scope">
					<el-button
						size="small"
						type="primary"
						@click="getAddRentDialog(scope.$index, scope.row)">计租</el-button>
					<el-button
						size="small"
						type="primary"
						v-if="scope.row.rents.length"
						@click="getChangeRentDialog(scope.$index, scope.row)">状态</el-button>
					<el-popover
						placement="top"
						width="150"
						trigger="click"
						v-if="scope.row.rents.length"
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
			this.getResetAddRent()
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
					haoId: '',
					monthId: '',
					calRentResult: 0,
					fix: false,
					remark: '',
					addTime: ''
				},
				addRentrules: {
					'lease.rent': [{ type: 'number', required: true, message: '请填写', trigger: 'blur change' }],
					'calRentResult': [{ type: 'number', required: true, message: '请填写', trigger: 'blur change' }],
					'addTime': [{ type: 'date', required: true, message: '请填写', trigger: 'blur change' }]
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
					this.addRent.haoId = row._id
					this.addRent.remark = row.leaseId.remark
					this.addRent.addTime = new Date()
				}
			},
			getResetAddRent () {
				this.addRent.calWater = {}
				this.addRent.calElectric = {}
				this.addRent.lease = {}
				this.addRent.fanghao = ''
				this.addRent.haoId = ''
				this.addRent.monthId = this.$route.query.id || ''
				this.addRent.calRentResult = 0
				this.addRent.remark = ''
				this.addRent.addTime = new Date()
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
			getRent (scope) {
				return (scope.row.rents[scope.row.rents.length - 1])
			},
			getAddRent () {
				if (this.gettingAddRent) {
					return true
				}
				this.gettingAddRent = true
				this.$refs.addRent.validate((valid)=>{
					if (valid) {
						let _data = Object.assign({}, this.addRent)
						this.Ajax('/inner/rent/add', _data, (res)=>{
							this.$message({
								type: 'success',
								message: '计租成功',
								duration: 2000
							})
							this.getAddRentDialog()
							this.gettingAddelectric = false
							this.getListRefresh()
						}, (res)=>{
							this.$message({
								type: 'error',
								message: '编号：' + res.body.code + '，' + res.body.msg,
								duration: 2000
							})
							this.gettingAddRent = false
						})
					} else {
						this.gettingAddRent = false
					}
				})
			},
			getChangeRentDialog (index, row) {

			},
			getDelRent (index, row) {

			}
		}
	}
</script>