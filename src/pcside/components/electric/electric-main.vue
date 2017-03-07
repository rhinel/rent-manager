<style lang="scss">
	.electric-main{
		.table-btn{
			margin-bottom: 20px;
		}
		.table-btn-input{
			max-width: 300px;
			display: inline-block;
			margin-left: 10px;
		}
		.add-electric-dialog{
			.el-input{
				max-width: 300px;
				width: 100%;
			}
			.el-select{
				width: 100%;
				max-width: 300px;
			}
		}
		.cal-electric-dialog{
			.line{
				height: 14px;
			}
		}
		.electric-show-tag{
			display: inline-block;
			cursor: pointer;
		}
	}
</style>

<template>
	<div class="electric-main">
		
		<!-- 顶部按钮组 -->
		<div class="table-btn">
			<el-button type="primary" @click="getAddElectricDialog">抄表</el-button>
			<el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
			<div class="table-btn-input">
				<el-input v-model="electricDataSearch" placeholder="搜索"></el-input>
			</div>
		</div>

		<!-- 新增弹窗 -->
		<el-dialog :title="aedDialogTitle" v-model="addElectricflag" size="tiny" class="add-electric-dialog" :close-on-click-modal="false" @close="onAddElectricDialogClose">
			<el-form :model="addElectric" ref="addElectric" :rules="addElectricrules">
				<el-form-item label="房屋" :label-width="aedLabelWidth" prop="haoId">
					<el-select v-model="addElectric.haoId" placeholder="选择房屋" :filterable="true">
						<el-option v-for="item in houseData" :label="item.fang + item.hao" :value="item._id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="电表数" :label-width="aedLabelWidth" prop="electric">
					<el-input v-model.number="addElectric.electric" auto-complete="off" placeholder="输入电表数"><template slot="append">度</template></el-input>
				</el-form-item>
				<el-form-item label="备注" :label-width="aedLabelWidth">
					<el-input v-model="addElectric.remark" auto-complete="off" placeholder="备注"></el-input>
				</el-form-item>
				<el-form-item label="抄表时间" :label-width="aedLabelWidth" prop="addTime">
					<el-date-picker v-model="addElectric.addTime" type="datetime" placeholder="输入抄表时间" :editable="false"></el-date-picker>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="getAddElectricDialog" :loading="gettingAddElectric">取消</el-button>
				<el-button type="primary" @click="getAddElectric" :loading="gettingAddElectric">确定</el-button>
			</div>
		</el-dialog>

		<!-- 计费弹窗 -->
		<el-dialog :title="calElectric.fanghao + cedDialogTitle" v-model="calElectricflag" size="small" top="50px" class="cal-electric-dialog" :close-on-click-modal="false" @close="onCalElectricDialogClose">
			<el-form :model="calElectric" ref="calElectric" :rules="calElectricrules">

				<!-- 房屋信息 -->
				<el-form-item>
					<el-alert title="本操作作为单独计费结费操作，水电（非周期，每次按照计费信息结算），每次收租一个租户（或空置）针对一个计费" type="info"></el-alert>
				</el-form-item>
				<!-- 电底信息 -->
				<el-form-item>
					<el-alert title="本抄表数据来源于最新一次抄表，可修改作为本次副本保存（不增加抄表数据），但建议按照逻辑操作，先抄表再计费" type="info"></el-alert>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="抄表数" :label-width="cedLabelWidth" prop="tnew.electric">
							<el-input v-model.number="calElectric.tnew.electric" auto-complete="off" placeholder="输入抄表数"><template slot="append">度</template></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="抄表时间" :label-width="cedLabelWidth" prop="tnew.addTime">
							<el-date-picker v-model="calElectric.tnew.addTime" type="datetime" placeholder="输入抄表时间" style="width: 100%;" :editable="false"></el-date-picker>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="抄表备注" :label-width="cedLabelWidth">
					<el-input v-model="calElectric.tnew.remark" auto-complete="off" placeholder="抄表备注"></el-input>
				</el-form-item>
				<el-form-item>
					<el-alert title="本底表数来源于上一次计费数据，可修改作为本次副本保存（不创建底表计费信息），但建议按照逻辑操作，分次计费" type="info"></el-alert>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="底表数" :label-width="cedLabelWidth" prop="old.electric">
							<el-input v-model.number="calElectric.old.electric" auto-complete="off" placeholder="输入底表数"><template slot="append">度</template></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="底表时间" :label-width="cedLabelWidth" prop="old.addTime">
							<el-date-picker v-model="calElectric.old.addTime" type="datetime" placeholder="输入底表时间" style="width: 100%;" :editable="false"></el-date-picker>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="底表备注" :label-width="cedLabelWidth">
					<el-input v-model="calElectric.old.remark" auto-complete="off" placeholder="底表备注"></el-input>
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
						<el-form-item label="低消" :label-width="cedLabelWidth" prop="calElectric.minPrice">
							<el-input v-model.number="calElectric.calElectric.minPrice" auto-complete="off" placeholder="输入最低消费"><template slot="append">度</template></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="计费方式" :label-width="cedLabelWidth">
							<el-radio v-model="calElectric.calElectric.calType" label="single">单一价格</el-radio>
							<el-radio v-model="calElectric.calElectric.calType" label="step">阶梯价格</el-radio>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 单价计费 -->
				<el-form-item label="单价" :label-width="cedLabelWidth" v-if="calElectric.calElectric.calType == 'single'" prop="calElectric.singlePrice">
					<el-input v-model.number="calElectric.calElectric.singlePrice" auto-complete="off" placeholder="输入单价"><template slot="prepend">￥</template><template slot="append">元/度</template></el-input>
				</el-form-item>
				<!-- 阶梯计费 -->
				<el-form-item
					v-if="calElectric.calElectric.calType == 'step'"
					v-for="(step, index) in calElectric.calElectric.stepPrice"
					:label="'阶梯' + (index + 1)"
					:label-width="cedLabelWidth"
					:key="'calElectric'+ index"
					:ref="'calElectric' + index"
					required>
					<el-col :span="5">
						<el-form-item :prop="'calElectric.stepPrice.' + index + '.step'"
							:rules="{
								type: 'number', required: true, message: '请填写', trigger: 'blur'
							}">
							<el-input v-model.number="step.step" auto-complete="off" placeholder="本阶梯最大值"><template slot="append">度</template></el-input>
						</el-form-item>
					</el-col>
					<el-col class="line" :span="1"></el-col>
					<el-col :span="5">
						<el-form-item :prop="'calElectric.stepPrice.' + index + '.price'"
							:rules="{
								type: 'number', required: true, message: '请填写', trigger: 'blur'
							}">
							<el-input v-model.number="step.price" auto-complete="off" placeholder="本阶梯单价"><template slot="prepend">￥</template><template slot="append">元</template></el-input>
						</el-form-item>
					</el-col>
					<el-col class="line" :span="1"></el-col>
					<el-col :span="5">
						<el-button  @click.prevent="removeStep(step)">删除</el-button>
					</el-col>
				</el-form-item>
				<el-form-item v-if="calElectric.calElectric.calType == 'step'" :label-width="cedLabelWidth">
					<el-button type="primary" @click="addStep">新增阶梯</el-button>
				</el-form-item>
				<!-- 本次计费情况 -->
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="计费时间" :label-width="cedLabelWidth" prop="addTime">
							<el-date-picker v-model="calElectric.addTime" type="datetime" placeholder="输入计费时间" style="width: 100%;" :editable="false"></el-date-picker>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="计费备注" :label-width="cedLabelWidth">
							<el-input v-model="calElectric.remark" auto-complete="off" placeholder="计费备注"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item :label="calElectric.fix ? '修正结果' : '计算结果'" :label-width="cedLabelWidth" prop="calElectricResult">
					<el-input v-model.number="calElectric.calElectricResult" auto-complete="off" placeholder="输入金额"><template slot="prepend">￥</template><template slot="append">元</template></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="getCalElectricDialog" :loading="gettingCalElectric">取消</el-button>
				<el-button type="primary" @click="getCalElectric" :loading="gettingCalElectric">确定</el-button>
			</div>
		</el-dialog>

		<!-- 电费数据表 -->
		<el-table
			class="electric-table"
			:data="filterElectricData"
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
				prop="electricId.electric"
				label="最新抄表数(度)"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="electricId.addTime"
				label="最新抄表时间"
				width="180"
				sortable>
				<template scope="scope">
					{{ getTime(scope.row.electricId && scope.row.electricId.addTime) }}
				</template>
			</el-table-column>
			<el-table-column
				prop="calElectricId.electric"
				label="上次计费底表数(度)"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="calElectricId.addTime"
				label="上次计费/初始时间"
				width="180"
				sortable>
				<template scope="scope">
					{{ getTime(scope.row.calElectricId && scope.row.calElectricId.addTime) }}
				</template>
			</el-table-column>
			<el-table-column
				prop="gap"
				label="本期实用数(度)"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="result"
				label="小计"
				width="180"
				sortable>
				<template scope="scope">
					￥{{ scope.row.result || 0 }}元
				</template>
			</el-table-column>
			<el-table-column
				label="当前计费方式">
				<template scope="scope">
					<div v-if="scope.row.leaseId.calType">
						<div>低消：￥{{ scope.row.leaseId.minPrice }}度</div>
						<div v-if="scope.row.leaseId.calType == 'single'">
							单价：￥{{ scope.row.leaseId.singlePrice }}元/度
						</div>
						<div v-else>
							<el-popover
								placement="right"
								trigger="hover">
								<div v-for="item in scope.row.leaseId.stepPrice">{{item.step}}度及以下￥{{item.price}}元/度；</div>超出按最后阶梯计算。
								<div slot="reference" class="electric-show-tag">
									<el-tag>阶梯</el-tag>
								</div>
							</el-popover>
						</div>
					</div>
					<div v-else>暂无</div>
				</template>
			</el-table-column>
			<el-table-column
				label="操作"
				width="180">
				<template scope="scope">
					<el-button
						size="small"
						type="primary"
						@click="getElectricHistory(scope.$index, scope.row)">历史</el-button>
					<el-button
						size="small"
						type="danger"
						@click="getCalElectricDialog(scope.$index, scope.row)">计费</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
	export default {
		name: 'electric-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/electric/index')
		},
		created () {
			this.getHouseList()
			this.getListRefresh()
			this.getResetAddElectric()
			this.getResetCalElectric()
		},
		data () {
			return {
				addElectricflag: false,
				calElectricflag: false,
				gettingAddElectric: false,
				gettingListRefresh: false,
				gettingCalElectric: false,

				houseData: [],
				aedDialogTitle: '抄电表',
				aedLabelWidth: '90px',
				addElectric: {
					haoId: '',
					electric: '',
					remark: '',
					addTime: '',
				},
				addElectricrules: {
					haoId: [{ required: true, message: '请选择', trigger: 'change' }],
					electric: [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					addTime: [{ type: 'date', required: true, message: '请填写', trigger: 'change' }]
				},
				electricData: [],
				electricDataSearch: '',

				cedDialogTitle: '电表计费',
				cedLabelWidth: '90px',
				calElectric: {
					haoId: '',
					fanghao: '',
					tnew: {
						electric: 0,
						remark: '',
						addTime: ''
					},
					old: {
						electric: 0,
						remark: '',
						addTime: ''
					},
					calElectric: {
						minPrice: 0,
						calType: 'single',
						singlePrice: 0,
						stepPrice: [{
							step: 0,
							price: 0
						}]
					},
					remark: '',
					addTime: '',
					fix: false,
					calElectricResult: 0
				},
				calElectricrules: {
					'tnew.electric': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'tnew.addTime': [{ type: 'date', required: true, message: '请填写', trigger: 'change' }],
					'old.electric': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'old.addTime': [{ type: 'date', required: true, message: '请填写', trigger: 'change' }],
					'calElectric.minPrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'calElectric.singlePrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'addTime': [{ type: 'date', required: true, message: '请填写', trigger: 'change' }],
					'calElectricResult': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
				}
			}
		},
		computed: {
			filterElectricData () {
				if (!this.electricDataSearch) {
					return this.electricData
				} else {
					let _electricDataSearch = new RegExp(this.electricDataSearch, 'i')
					return this.electricData.filter((item)=>{
						for (var i in item) {
							if (i != 'fanghao' && i != 'remark') {
								continue
							} else if (String(item[i]).match(_electricDataSearch)) {
								return true
							}
						}
						return false
					})
				}
			},
			calElectricResult () {
				//电表计费，前端计算，后端获取数据时计算，前端入住搬出月结时计算
				let result = 0
				let theGap = this.calElectric.tnew.electric - this.calElectric.old.electric
				let restGap = theGap
				theGap = theGap > 0 ? theGap : 0
				theGap = theGap > this.calElectric.calElectric.minPrice ? theGap : this.calElectric.calElectric.minPrice
				if (this.calElectric.calElectric.calType == 'single') {
					result = theGap * this.calElectric.calElectric.singlePrice
				} else {
					this.calElectric.calElectric.stepPrice.forEach((item, i, arr)=>{
						//let lastStep = this.calElectric.calElectric.stepPrice[i-1] ? this.calElectric.calElectric.stepPrice[i-1].step : 0
						//假阶梯
						if (theGap > (arr[i-1] ? arr[i-1].step : 0) && theGap <= item.step && item.price != 0) {
							result = theGap * item.price
						} else if (i == (arr.length - 1) && theGap >= item.step && item.price != 0) {
							result = theGap * item.price
						}
						//真阶梯
						/*if (theGap >= item.step) {
							result += (item.step - lastStep) * item.price
							theGap -= (item.step - lastStep)
						} else {
							result += (theGap - lastStep) * item.price
							theGap = 0
						}*/
					})
					//theGap != 0 && this.calElectric.calElectric.stepPrice.length && (result += theGap * this.calElectric.calElectric.stepPrice[this.calElectric.calElectric.stepPrice.length-1].price)
					result = Math.round(result * 100) / 100
				}
				return result
			}
		},
		watch: {
			calElectricResult (n, o) {
				this.calElectric.calElectricResult = n
			},
			'calElectric.calElectricResult' (n, o) {
				n == this.calElectricResult && (this.calElectric.fix = false)
				n != this.calElectricResult && (this.calElectric.fix = true)
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
			getAddElectricDialog () {
				this.addElectricflag = !this.addElectricflag
				this.addElectricflag && (this.addElectric.addTime = new Date())
			},
			//弹窗数据初始化
			getResetAddElectric () {
				this.addElectric.addTime = ''
				this.addElectric.remark = ''
			},
			//关闭弹窗回调
			onAddElectricDialogClose () {
				this.$refs.addElectric.resetFields()
				this.getResetAddElectric()
			},
			//抄表
			getAddElectric () {
				if (this.gettingAddElectric) {
					return true
				}
				this.gettingAddElectric = true
				this.$refs.addElectric.validate((valid)=>{
					if (valid) {
						let _data = Object.assign({}, this.addElectric)
						this.Ajax('/inner/electric/add', _data, (res)=>{
							this.$message({
								type: 'success',
								message: '抄表成功',
								duration: 2000
							})
							this.getAddElectricDialog()
							this.gettingAddElectric = false
							this.getListRefresh()
						}, (res)=>{
							this.$message({
								type: 'error',
								message: '编号：' + res.body.code + '，' + res.body.msg,
								duration: 2000
							})
							this.gettingAddElectric = false
						})
					} else {
						this.gettingAddElectric = false
					}
				})
			},
			//拉取电费信息列表
			getListRefresh () {
				if (this.gettingListRefresh) {
					return true
				}
				this.gettingListRefresh = true
				this.Ajax('/inner/electric/mainList', {}, (res)=>{
					this.electricData = res.body.data
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
			getCalElectricDialog (index, row) {
				this.calElectricflag = !this.calElectricflag
				if (this.calElectricflag && row) {
					//基本信息
					this.calElectric.haoId = row._id
					this.calElectric.fanghao = row.fanghao
					this.calElectric.addTime = new Date()
					//tnew
					this.calElectric.tnew.electric = row.electricId && row.electricId.electric || 0
					this.calElectric.tnew.remark = row.electricId && row.electricId.remark || ''
					this.calElectric.tnew.addTime = row.electricId && row.electricId.addTime && new Date(row.electricId.addTime) || new Date()
					//old
					this.calElectric.old.electric = row.calElectricId && row.calElectricId.electric || 0
					this.calElectric.old.remark = row.calElectricId && row.calElectricId.remark || ''
					this.calElectric.old.addTime = row.calElectricId && row.calElectricId.addTime && new Date(row.calElectricId.addTime) || new Date()
					//calWater
					this.calElectric.calElectric.minPrice = row.leaseId && row.leaseId.minPrice || 0
					this.calElectric.calElectric.calType = row.leaseId && row.leaseId.calType || 'single'
					this.calElectric.calElectric.singlePrice = row.leaseId && row.leaseId.singlePrice || 0
					this.calElectric.calElectric.stepPrice = row.leaseId && row.leaseId.stepPrice || []
					!this.calElectric.calElectric.stepPrice.length && this.addStep()
				}
			},
			//计费弹窗数据初始化
			getResetCalElectric () {
				this.calElectric.tnew.addTime = ''
				this.calElectric.old.addTime = ''
				this.calElectric.addTime = ''
				this.calElectric.remark = ''
			},
			//关闭计费弹窗回调
			onCalElectricDialogClose () {
				this.$refs.calElectric.resetFields()
				this.getResetCalElectric()
			},
			//添加步骤
			addStep () {
				this.calElectric.calElectric.stepPrice.push({
					step: 0,
					price: 0
				})
			},
			//删除步骤
			removeStep (step) {
				let index = this.calElectric.calElectric.stepPrice.indexOf(step)
				if (index !== -1) {
					this.calElectric.calElectric.stepPrice.splice(index, 1)
				}
			},
			//计费
			getCalElectric () {
				if (this.gettingCalElectric) {
					return true
				}
				this.gettingCalElectric = true
				this.$refs.calElectric.validate((valid)=>{
					if (valid) {
						let _data = Object.assign({}, this.calElectric)
						this.Ajax('/inner/electric/cal', _data, (res)=>{
							this.$message({
								type: 'success',
								message: '计费成功',
								duration: 2000
							})
							this.getCalElectricDialog()
							this.gettingCalElectric = false
							this.getListRefresh()
						}, (res)=>{
							this.$message({
								type: 'error',
								message: '编号：' + res.body.code + '，' + res.body.msg,
								duration: 2000
							})
							this.gettingCalElectric = false
						})
					} else {
						this.gettingCalElectric = false
					}
				})
			},
			//进入历史
			getElectricHistory (index, row) {
				this.$router.push('/inner/electric/history?haoid=' + row._id)
			}
		}
	}
</script>