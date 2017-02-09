<style lang="scss">
	.water-main{
		.table-btn{
			margin-bottom: 20px;
		}
		.table-span{
			display: inline-block;
			vertical-align: middle;
			text-align: center;
			padding-right: 18px;
		}
		.table-btn-input{
			max-width: 300px;
			display: inline-block;
			margin-left: 10px;
		}
		.add-water-dialog{
			.el-input{
				max-width: 300px;
				width: 100%;
			}
			.el-select{
				width: 100%;
				max-width: 300px;
			}
		}
		.cal-water-dialog{
			.line{
				height: 14px;
			}
		}
	}
</style>

<template>
	<div class="water-main">

		<!-- 顶部按钮组 -->
		<div class="table-btn">
			<el-button type="primary" @click="getAddWaterDialog">抄表</el-button>
			<el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
			<div class="table-btn-input">
				<el-input v-model="waterDataSearch" placeholder="搜索"></el-input>
			</div>
		</div>

		<!-- 新增弹窗 -->
		<el-dialog :title="awdDialogTitle" v-model="addWaterflag" size="tiny" class="add-water-dialog" :close-on-click-modal="false" @close="onAddWaterDialogClose">
			<el-form :model="addWater" ref="addWater" :rules="addWaterrules">
				<el-form-item label="房屋" :label-width="awdLabelWidth" prop="haoId">
					<el-select v-model="addWater.haoId" placeholder="选择房屋">
						<el-option v-for="item in houseData" :label="item.fang + item.hao" :value="item._id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="水表数" :label-width="awdLabelWidth" prop="water">
					<el-input v-model.number="addWater.water" auto-complete="off" placeholder="输入水表数"></el-input>
				</el-form-item>
				<el-form-item label="备注" :label-width="awdLabelWidth">
					<el-input v-model="addWater.remark" auto-complete="off" placeholder="备注"></el-input>
				</el-form-item>
				<el-form-item label="抄表时间" :label-width="awdLabelWidth" prop="addTime">
					<el-date-picker v-model="addWater.addTime" type="datetime" placeholder="输入抄表时间"></el-date-picker>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="getAddWaterDialog" :loading="gettingAddWater">取消</el-button>
				<el-button type="primary" @click="getAddWater" :loading="gettingAddWater">确定</el-button>
			</div>
		</el-dialog>

		<!-- 计费弹窗 -->
		<el-dialog :title="calWater.fanghao + cwdDialogTitle" v-model="calWaterflag" size="small" top="50px" class="cal-water-dialog" :close-on-click-modal="false" @close="onCalWaterDialogClose">
			<el-form :model="calWater" ref="calWater" :rules="calWaterrules">

				<!-- 房屋信息 -->
				<el-form-item>
					<el-alert title="本操作作为单独计费结费操作，如是搬入搬出、月缴费请使用租住管理和月度缴费管理" type="info"></el-alert>
				</el-form-item>
				<!-- 水底信息 -->
				<el-form-item>
					<el-alert title="本抄表数据来源于最新一次抄表，可修改作为本次副本保存（不增加抄表数据），但建议按照逻辑操作，先抄表再计费" type="info"></el-alert>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="抄表数" :label-width="cwdLabelWidth" prop="tnew.water">
							<el-input v-model.number="calWater.tnew.water" auto-complete="off" placeholder="输入抄表数"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="抄表时间" :label-width="cwdLabelWidth" prop="tnew.addTime">
							<el-date-picker v-model="calWater.tnew.addTime" type="datetime" placeholder="输入抄表时间" style="width: 100%;"></el-date-picker>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="抄表备注" :label-width="cwdLabelWidth">
					<el-input v-model="calWater.tnew.remark" auto-complete="off" placeholder="抄表备注"></el-input>
				</el-form-item>
				<el-form-item>
					<el-alert title="本底表数来源于上一次计费数据，可修改作为本次副本保存（不创建底表计费信息），但建议按照逻辑操作，分次计费" type="info"></el-alert>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="底表数" :label-width="cwdLabelWidth" prop="old.water">
							<el-input v-model.number="calWater.old.water" auto-complete="off" placeholder="输入底表数"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="底表时间" :label-width="cwdLabelWidth" prop="old.addTime">
							<el-date-picker v-model="calWater.old.addTime" type="datetime" placeholder="输入底表时间" style="width: 100%;"></el-date-picker>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="底表备注" :label-width="cwdLabelWidth">
					<el-input v-model="calWater.old.remark" auto-complete="off" placeholder="底表备注"></el-input>
				</el-form-item>

				<!-- 计费方式 -->
				<el-form-item>
					<el-alert title="本计费方式来源于租户信息，临时调整可修改作为本次副本保存（不更新租户信息），但建议按照逻辑操作，修改租住管理的租户信息" type="info"></el-alert>
				</el-form-item>
				<el-form-item>
					<el-alert title="本计费结果来源于本表单数据计算，可对结果进行修正" type="info"></el-alert>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="低消" :label-width="cwdLabelWidth" prop="calWater.minPrice">
							<el-input v-model.number="calWater.calWater.minPrice" auto-complete="off" placeholder="输入最低消费"><template slot="append">吨</template></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="计费方式" :label-width="cwdLabelWidth">
							<el-radio v-model="calWater.calWater.calType" label="single">单一价格</el-radio>
							<el-radio v-model="calWater.calWater.calType" label="step">阶梯价格</el-radio>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 单价计费 -->
				<el-form-item label="单价" :label-width="cwdLabelWidth" v-if="calWater.calWater.calType == 'single'" prop="calWater.singlePrice">
					<el-input v-model.number="calWater.calWater.singlePrice" auto-complete="off" placeholder="输入单价"><template slot="append">元/吨</template></el-input>
				</el-form-item>
				<!-- 阶梯计费 -->
				<el-form-item
					v-if="calWater.calWater.calType == 'step'"
					v-for="(step, index) in calWater.calWater.stepPrice"
					:label="'阶梯' + (index + 1)"
					:label-width="cwdLabelWidth"
					:key="index"
					required>
					<el-col :span="5">
						<el-form-item :prop="'calWater.stepPrice.' + index + '.step'"
							:rules="{
								type: 'number', required: true, message: '请填写', trigger: 'blur'
							}">
							<el-input v-model.number="step.step" auto-complete="off" placeholder="本阶梯最大值"><template slot="append">度</template></el-input>
						</el-form-item>
					</el-col>
					<el-col class="line" :span="1"></el-col>
					<el-col :span="5">
						<el-form-item :prop="'calWater.stepPrice.' + index + '.price'"
							:rules="{
								type: 'number', required: true, message: '请填写', trigger: 'blur'
							}">
							<el-input v-model.number="step.price" auto-complete="off" placeholder="本阶梯单价"><template slot="append">元</template></el-input>
						</el-form-item>
					</el-col>
					<el-col class="line" :span="1"></el-col>
					<el-col :span="5">
						<el-button  @click.prevent="removeStep(step)">删除</el-button>
					</el-col>
				</el-form-item>
				<el-form-item v-if="calWater.calWater.calType == 'step'" :label-width="cwdLabelWidth">
					<el-button type="primary" @click="addStep">新增阶梯</el-button>
				</el-form-item>
				<!-- 本次计费情况 -->
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="计费时间" :label-width="cwdLabelWidth" prop="addTime">
							<el-date-picker v-model="calWater.addTime" type="datetime" placeholder="输入计费时间" style="width: 100%;"></el-date-picker>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="计费备注" :label-width="cwdLabelWidth">
							<el-input v-model="calWater.remark" auto-complete="off" placeholder="计费备注"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="金额" :label-width="cwdLabelWidth" prop="calResult">
					<el-input v-model.number="calWaterResult" auto-complete="off" placeholder="输入金额"><template slot="append">元</template></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="getCalWaterDialog" :loading="gettingCalWater">取消</el-button>
				<el-button type="primary" @click="getCalWater" :loading="gettingCalWater">确定</el-button>
			</div>
		</el-dialog>

		<!-- 水费数据表 -->
		<el-table
			class="water-table"
			:data="filterWaterData"
			v-loading.body="gettingListRefresh"
			stripe
			border>
			<el-table-column
				prop="fanghao"
				label="房屋"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="waterId.water"
				label="最新抄表数"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="waterId.addTime"
				label="最新抄表时间"
				width="180"
				sortable>
				<template scope="scope">
					{{ getTime(scope.row.waterId && scope.row.waterId.addTime) }}
				</template>
			</el-table-column>
			<el-table-column
				prop="calWaterId.water"
				label="上次计费底表数"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="calWaterId.addTime"
				label="上次计费/初始时间"
				width="180"
				sortable>
				<template scope="scope">
					{{ getTime(scope.row.calWaterId && scope.row.calWaterId.addTime) }}
				</template>
			</el-table-column>
			<el-table-column
				label="本期实用数"
				width="180">
				<template scope="scope">
					{{ (scope.row.waterId ? scope.row.waterId.water : 0) - (scope.row.calWaterId ? scope.row.calWaterId.water : 0) }}
				</template>
			</el-table-column>
			<el-table-column
				label="小计"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				label="当前计费方式">
			</el-table-column>
			<el-table-column
				label="操作"
				width="180">
				<template scope="scope">
					<el-button
						size="small"
						type="primary"
						@click="getWaterHistory(scope.$index, scope.row)">历史</el-button>
					<el-button
						size="small"
						type="danger"
						@click="getCalWaterDialog(scope.$index, scope.row)">计费</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
	export default {
		name: 'water-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/water/index')
		},
		created () {
			this.getHouseList()
			this.getListRefresh()
			this.getResetAddWater()
			this.getResetCalWater()
		},
		data () {
			return {
				addWaterflag: false,
				calWaterflag: false,
				gettingAddWater: false,
				gettingListRefresh: false,
				gettingCalWater: false,

				houseData: [],
				awdDialogTitle: '抄水表',
				awdLabelWidth: '90px',
				addWater: {
					haoId: '',
					water: '',
					remark: '',
					addTime: '',
				},
				addWaterrules: {
					haoId: [{ required: true, message: '请选择', trigger: 'change' }],
					water: [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					addTime: [{ type: 'date', required: true, message: '请填写', trigger: 'change' }]
				},
				waterData: [],
				waterDataSearch: '',

				cwdDialogTitle: '水表计费',
				cwdLabelWidth: '90px',
				calWater: {
					haoId: '',
					fanghao: '',
					tnew: {
						water: 0,
						remark: '',
						addTime: ''
					},
					old: {
						water: 0,
						remark: '',
						addTime: ''
					},
					calWater: {
						minPrice: 0,
						calType: 'single',
						singlePrice: 0,
						stepPrice: [{
							step: 0,
							price: 0
						}]
					},
					remark: '',
					addTime:'',
					calWaterResult: 0
				},
				calWaterrules: {
					'tnew.water': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'tnew.addTime': [{ type: 'date', required: true, message: '请填写', trigger: 'change' }],
					'old.water': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'old.addTime': [{ type: 'date', required: true, message: '请填写', trigger: 'change' }],
					'calWater.minPrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'calWater.singlePrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'addTime': [{ type: 'date', required: true, message: '请填写', trigger: 'change' }],
					'calWaterResult': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
				}
			}
		},
		computed: {
			filterWaterData () {
				if (!this.waterDataSearch) {
					return this.waterData
				} else {
					let _waterDataSearch = new RegExp(this.waterDataSearch, 'i')
					return this.waterData.filter((item)=>{
						for (var i in item) {
							if (i == 'gettingdelHouse' || i == 'createTime' || i == 'updateTime' || i == '_id') {
								continue
							} else if (item[i].match(_waterDataSearch)) {
								return true
							}
						}
						return false
					})
				}
			},
			calWaterResult () {
				let result = 0
				let theGap = this.calWater.tnew.water - this.calWater.old.water
				theGap = theGap > 0 ? theGap : 0
				theGap = theGap > this.calWater.calWater.minPrice ? theGap : this.calWater.calWater.minPrice
				if (this.calWater.calWater.calType == 'single') {
					result = theGap*this.calWater.calWater.singlePrice
				} else {
					this.calWater.calWater.stepPrice.forEach((item, i)=>{
						if (theGap >= item.step) {
							result += item.step*item.price
							theGap -= item.step
						} else {
							result += theGap*item.price
							theGap = 0
						}
					})
					theGap != 0 && this.calWater.calWater.stepPrice.length && (result += theGap*this.calWater.calWater.stepPrice[this.calWater.calWater.stepPrice.length-1].price)
				}
				this.calWater.calWaterResult = result
				return result
			}
		},
		methods: {
			//获取弹窗房屋列表
			getHouseList () {
				this.Ajax('/inner/house/list', {}, (res)=>{
					this.houseData = res.body.data
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
				})
			},
			//打开关闭添加弹窗
			getAddWaterDialog () {
				this.addWaterflag = !this.addWaterflag
				this.addWaterflag && (this.addWater.addTime = new Date())
			},
			//弹窗数据初始化
			getResetAddWater () {
				this.addWater.addTime = ''
				this.addWater.remark = ''
			},
			//关闭弹窗回调
			onAddWaterDialogClose () {
				this.$refs.addWater.resetFields()
				this.getResetAddWater()
			},
			//抄表
			getAddWater () {
				if (this.gettingAddWater) {
					return true
				}
				this.gettingAddWater = true
				this.$refs.addWater.validate((valid)=>{
					if (valid) {
						let _data = Object.assign({}, this.addWater)
						this.Ajax('/inner/water/add', _data, (res)=>{
							this.$message({
								type: 'success',
								message: '抄表成功',
								duration: 2000
							})
							this.getAddWaterDialog()
							this.gettingAddWater = false
							this.getListRefresh()
						}, (res)=>{
							this.$message({
								type: 'error',
								message: '编号：' + res.body.code + '，' + res.body.msg,
								duration: 2000
							})
							this.gettingAddWater = false
						})
					} else {
						this.gettingAddWater = false
					}
				})
			},
			//拉取水费信息列表
			getListRefresh () {
				if (this.gettingListRefresh) {
					return true
				}
				this.gettingListRefresh = true
				this.Ajax('/inner/water/mainList', {}, (res)=>{
					this.waterData = res.body.data
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
			//时间格式化
			getTime (t) {
				return t? this.GetTimeFormat(t) : '--'
			},
			//打开关闭计费弹窗
			getCalWaterDialog (index, row) {
				this.calWaterflag = !this.calWaterflag
				if (this.calWaterflag && row) {
					//基本信息
					this.calWater.haoId = row._id
					this.calWater.fanghao = row.fanghao
					this.calWater.addTime = new Date()
					//tnew
					this.calWater.tnew.water = row.waterId && row.waterId.water || 0
					this.calWater.tnew.remark = row.waterId && row.waterId.remark || ''
					this.calWater.tnew.addTime = row.waterId && new Date(row.waterId.addTime) || new Date()
					//old
					this.calWater.old.water = row.calWaterId && row.calWaterId.water || 0
					this.calWater.old.remark = row.calWaterId && row.calWaterId.remark || ''
					this.calWater.old.addTime = row.calWaterId && new Date(row.calWaterId.addTime) || new Date()
					//calWater
					this.calWater.calWater.minPrice = row.calWaterPriceId && row.calWaterPriceId.minPrice || 0
					this.calWater.calWater.calType = row.calWaterPriceId && row.calWaterPriceId.calType || 'single'
					this.calWater.calWater.singlePrice = row.calWaterPriceId && row.calWaterPriceId.singlePrice || 0
					this.calWater.calWater.stepPrice = row.calWaterPriceId && row.calWaterPriceId.stepPrice || []
					!this.calWater.calWater.stepPrice.length && this.addStep()
				}

			},
			//计费弹窗数据初始化
			getResetCalWater () {
				this.calWater.tnew.addTime = ''
				this.calWater.old.addTime = ''
				this.calWater.addTime = ''
			},
			//关闭计费弹窗回调
			onCalWaterDialogClose () {
				this.$refs.calWater.resetFields()
				this.getResetCalWater()
			},
			//添加步骤
			addStep () {
				this.calWater.calWater.stepPrice.push({
					step: 0,
					price: 0
				})
			},
			//删除步骤
			removeStep (step) {
				let index = this.calWater.calWater.stepPrice.indexOf(step)
				if (index !== -1) {
					this.calWater.calWater.stepPrice.splice(index, 1)
				}
			},
			//计费
			getCalWater () {
				if (this.gettingCalWater) {
					return true
				}
				this.gettingCalWater = true
				this.$refs.calWater.validate((valid)=>{
					if (valid) {
						let _data = Object.assign({}, this.calWater)
						this.Ajax('/inner/water/calWater', _data, (res)=>{
							this.$message({
								type: 'success',
								message: '抄表成功',
								duration: 2000
							})
							this.getCalWaterDialog()
							this.gettingCalWater = false
							this.getListRefresh()
						}, (res)=>{
							this.$message({
								type: 'error',
								message: '编号：' + res.body.code + '，' + res.body.msg,
								duration: 2000
							})
							this.gettingCalWater = false
						})
					} else {
						this.gettingCalWater = false
					}
				})
			},
			//进入历史
			getWaterHistory (index, row) {

			}
		}
	}
</script>