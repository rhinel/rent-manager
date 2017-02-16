<style lang="scss">
	.lease-main{
		.table-btn{
			margin-bottom: 20px;
		}
		.table-btn-input{
			max-width: 300px;
			display: inline-block;
			margin-left: 10px;
		}
		.lease-in-dialog{
			.el-date-editor--daterange.el-input{
				width: 100%;
			}
			.line{
				height: 14px;
			}
		}
		.lease-show-tag{
			display: inline-block;
			cursor: pointer;
			&.pop {
				margin-left: 10px;
			}
		}
		.lease-remark-tag{
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}
	}
	.lease-list-lease-o-pop-cont{
		text-align: right;
		margin: 0;
	}
	.lease-remark{
		max-width: 300px;
	}
</style>

<template>
	<div class="lease-main">
		<!-- 顶部按钮组 -->
		<div class="table-btn">
			<el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
			<div class="table-btn-input">
				<el-input v-model="leaseDataSearch" placeholder="搜索"></el-input>
			</div>
		</div>

		<!-- 入住弹窗 -->
		<el-dialog :title="lease.fanghao + lidDialogTitle" v-model="leaseInflag" size="small" top="50px" class="lease-in-dialog" :close-on-click-modal="false" @close="onLeaseInDialogClose">
			<el-form :model="lease" ref="leaseIn" :rules="leaserules">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="7">
						<el-form-item label="租户姓名" :label-width="lidLabelWidth" prop="name">
							<el-input v-model="lease.name" auto-complete="off" placeholder="输入租户姓名"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="联系方式" :label-width="lidLabelWidth" prop="call">
							<el-input v-model="lease.call" auto-complete="off" placeholder="输入租户联系方式"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="9">
						<el-form-item label="租住周期" :label-width="lidLabelWidth" prop="leaserange">
							<el-date-picker v-model="lease.leaserange" type="daterange" placeholder="选择日期范围" :picker-options="leasePickerOptions" align="right"></el-date-picker>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="20">
					<el-col :span="7">
						<el-form-item label="交租时间" :label-width="lidLabelWidth" prop="payDay">
							<el-select v-model="lease.payDay" placeholder="选择交租时间" prop="payDay">
								<el-option v-for="n in 31" :label="n + '日'" :value="n"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="交租方式" :label-width="lidLabelWidth" prop="payType">
							<el-select v-model="lease.payType" placeholder="选择交租方式">
								<el-option v-for="(item, index) in payTypeVal" :label="item" :value="index"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="9">
						<el-form-item label="备注" :label-width="lidLabelWidth">
							<el-input v-model.number="lease.remark" auto-complete="off" placeholder="备注"></el-input>
						</el-form-item>
					</el-col>
				</el-row>

				<!-- 水费 -->
				<el-row :gutter="20">
					<el-col :span="7">
						<el-form-item label="水费低消" :label-width="lidLabelWidth" prop="calWaterPrice.minPrice">
							<el-input v-model.number="lease.calWaterPrice.minPrice" auto-complete="off" placeholder="输入最低消费"><template slot="append">吨</template></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="14">
						<el-form-item label="水费方式" :label-width="lidLabelWidth">
							<el-radio v-model="lease.calWaterPrice.calType" label="single">单一价格</el-radio>
							<el-radio v-model="lease.calWaterPrice.calType" label="step">阶梯价格</el-radio>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 单价计费 -->
				<el-form-item label="水费单价" :label-width="lidLabelWidth" v-if="lease.calWaterPrice.calType == 'single'" prop="calWaterPrice.singlePrice">
					<el-input v-model.number="lease.calWaterPrice.singlePrice" auto-complete="off" placeholder="输入单价"><template slot="prepend">￥</template><template slot="append">元/吨</template></el-input>
				</el-form-item>
				<!-- 阶梯计费 -->
				<el-form-item
					v-if="lease.calWaterPrice.calType == 'step'"
					v-for="(step, index) in lease.calWaterPrice.stepPrice"
					:label="'阶梯' + (index + 1)"
					:label-width="lidLabelWidth"
					:key="'calWaterPrice' + index"
					:ref="'calWaterPrice' + index"
					required>
					<el-col :span="5">
						<el-form-item :prop="'calWaterPrice.stepPrice.' + index + '.step'"
							:rules="{
								type: 'number', required: true, message: '请填写', trigger: 'blur'
							}">
							<el-input v-model.number="step.step" auto-complete="off" placeholder="本阶梯最大值"><template slot="append">吨</template></el-input>
						</el-form-item>
					</el-col>
					<el-col class="line" :span="1"></el-col>
					<el-col :span="5">
						<el-form-item :prop="'calWaterPrice.stepPrice.' + index + '.price'"
							:rules="{
								type: 'number', required: true, message: '请填写', trigger: 'blur'
							}">
							<el-input v-model.number="step.price" auto-complete="off" placeholder="本阶梯单价"><template slot="prepend">￥</template><template slot="append">元</template></el-input>
						</el-form-item>
					</el-col>
					<el-col class="line" :span="1"></el-col>
					<el-col :span="5">
						<el-button  @click.prevent="removeStep(lease.calWaterPrice, step)">删除</el-button>
					</el-col>
				</el-form-item>
				<el-form-item v-if="lease.calWaterPrice.calType == 'step'" :label-width="lidLabelWidth">
					<el-button type="primary" @click="addStep(lease.calWaterPrice)">新增阶梯</el-button>
				</el-form-item>

				<!-- 电费 -->
				<el-row :gutter="20">
					<el-col :span="7">
						<el-form-item label="电费低消" :label-width="lidLabelWidth" prop="calElePrice.minPrice">
							<el-input v-model.number="lease.calElePrice.minPrice" auto-complete="off" placeholder="输入最低消费"><template slot="append">度</template></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="14">
						<el-form-item label="电费方式" :label-width="lidLabelWidth">
							<el-radio v-model="lease.calElePrice.calType" label="single">单一价格</el-radio>
							<el-radio v-model="lease.calElePrice.calType" label="step">阶梯价格</el-radio>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 单价计费 -->
				<el-form-item label="电费单价" :label-width="lidLabelWidth" v-if="lease.calElePrice.calType == 'single'" prop="calElePrice.singlePrice">
					<el-input v-model.number="lease.calElePrice.singlePrice" auto-complete="off" placeholder="输入单价"><template slot="prepend">￥</template><template slot="append">元/度</template></el-input>
				</el-form-item>
				<!-- 阶梯计费 -->
				<el-form-item
					v-if="lease.calElePrice.calType == 'step'"
					v-for="(step, index) in lease.calElePrice.stepPrice"
					:label="'阶梯' + (index + 1)"
					:label-width="lidLabelWidth"
					:key="'calElePrice' + index"
					:ref="'calElePrice' + index"
					required>
					<el-col :span="5">
						<el-form-item :prop="'calElePrice.stepPrice.' + index + '.step'"
							:rules="{
								type: 'number', required: true, message: '请填写', trigger: 'blur'
							}">
							<el-input v-model.number="step.step" auto-complete="off" placeholder="本阶梯最大值"><template slot="append">度</template></el-input>
						</el-form-item>
					</el-col>
					<el-col class="line" :span="1"></el-col>
					<el-col :span="5">
						<el-form-item :prop="'calElePrice.stepPrice.' + index + '.price'"
							:rules="{
								type: 'number', required: true, message: '请填写', trigger: 'blur'
							}">
							<el-input v-model.number="step.price" auto-complete="off" placeholder="本阶梯单价"><template slot="prepend">￥</template><template slot="append">元</template></el-input>
						</el-form-item>
					</el-col>
					<el-col class="line" :span="1"></el-col>
					<el-col :span="5">
						<el-button  @click.prevent="removeStep(lease.calElePrice, step)">删除</el-button>
					</el-col>
				</el-form-item>
				<el-form-item v-if="lease.calElePrice.calType == 'step'" :label-width="lidLabelWidth">
					<el-button type="primary" @click="addStep(lease.calElePrice)">新增阶梯</el-button>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="租金(月)" :label-width="lidLabelWidth" prop="rent">
							<el-input v-model.number="lease.rent" auto-complete="off" placeholder="输入租金"><template slot="prepend">￥</template><template slot="append">元/月</template></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="押金" :label-width="lidLabelWidth" prop="deposit">
							<el-input v-model.number="lease.deposit" auto-complete="off" placeholder="输入押金"><template slot="prepend">￥</template><template slot="append">元</template></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="getLeaseInDialog" :loading="gettingLeaseIn">取消</el-button>
				<el-button type="primary" @click="getLeaseIn" :loading="gettingLeaseIn">确定</el-button>
			</div>
		</el-dialog>
		
		<!-- 租住数据表 -->
		<el-table
			class="lease-table"
			:data="filterLeaseData"
			v-loading.body="gettingListRefresh"
			stripe
			border>
			<el-table-column
				prop="fanghao"
				label="房屋"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column label="租户信息">
				<el-table-column
					prop="leaseId.name"
					label="姓名/联系方式"
					width="180">
					<template scope="scope">
						<div>{{ scope.row.leaseId.name || '--' }}</div>
						<div>{{ scope.row.leaseId.call || '--' }}</div>
					</template>
				</el-table-column>
				<el-table-column
					prop="leaseId.leaserange"
					label="租住周期"
					width="180">
					<template scope="scope">
						<div>{{ getTime(scope.row.leaseId.leaserange && scope.row.leaseId.leaserange[0]) }}</div>
						<div>{{ getTime(scope.row.leaseId.leaserange && scope.row.leaseId.leaserange[1]) }}</div>
					</template>
				</el-table-column>
				<el-table-column
					prop="leaseId.payDay"
					label="交租时间/交租方式"
					width="180">
					<template scope="scope">
						<div>{{ scope.row.leaseId.payDay ? ('每月' + scope.row.leaseId.payDay + '日') : '--' }}</div>
						<div>{{ payTypeVal[scope.row.leaseId.payType] || '--' }}</div>
					</template>
				</el-table-column>
				<el-table-column
					prop="leaseId.remark"
					label="备注">
					<template scope="scope">
						<el-popover
							placement="right"
							trigger="hover">
							<div class="lease-remark">{{ scope.row.leaseId.remark }}</div>
							<div slot="reference" class="lease-show-tag">
								<div class="lease-remark-tag">{{ scope.row.leaseId.remark }}</div>
							</div>
						</el-popover>
					</template>
				</el-table-column>
			</el-table-column>
			<el-table-column
				label="计费信息">
				<el-table-column
					label="水费"
					width="180">
					<template scope="scope">
						<div v-if="scope.row.leaseId.calWaterPrice">
							<div>低消：￥{{ scope.row.leaseId.calWaterPrice.minPrice }}吨</div>
							<div v-if="scope.row.leaseId.calWaterPrice.calType == 'single'">
								单价：￥{{ scope.row.leaseId.calWaterPrice.singlePrice }}元/吨
							</div>
							<div v-else>
								<el-popover
									placement="right"
									trigger="hover">
									<div v-for="item in scope.row.leaseId.calWaterPrice.stepPrice">{{item.step}}吨及以下￥{{item.price}}元/吨；</div>超出按最后阶梯计算。
									<div slot="reference" class="lease-show-tag">
										<el-tag>阶梯</el-tag>
									</div>
								</el-popover>
							</div>
						</div>
						<div v-else>暂无</div>
					</template>
				</el-table-column>
				<el-table-column
					label="电费"
					width="180">
					<template scope="scope">
						<div v-if="scope.row.leaseId.calElePrice">
							<div>低消：￥{{ scope.row.leaseId.calElePrice.minPrice }}度</div>
							<div v-if="scope.row.leaseId.calElePrice.calType == 'single'">
								单价：￥{{ scope.row.leaseId.calElePrice.singlePrice }}元/度
							</div>
							<div v-else>
								<el-popover
									placement="right"
									trigger="hover">
									<div v-for="item in scope.row.leaseId.calElePrice.stepPrice">{{item.step}}度及以下￥{{item.price}}元/度；</div>超出按最后阶梯计算。
									<div slot="reference" class="lease-show-tag">
										<el-tag>阶梯</el-tag>
									</div>
								</el-popover>
							</div>
						</div>
						<div v-else>暂无</div>
					</template>
				</el-table-column>
				<el-table-column
					label="当前租金/押金"
					width="180">
					<template scope="scope">
						<div>{{ '租金：￥' + (scope.row.leaseId.rent || 0) + '元/月' }}</div>
						<div>{{ '押金：￥' + (scope.row.leaseId.deposit || 0) + '元' }}</div>
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
						@click="getLeaseHistory(scope.$index, scope.row)">历史</el-button>
					<el-button
						size="small"
						type="primary"
						@click="getLeaseInDialog(scope.$index, scope.row)">{{ scope.row.leaseId._id ? '修改' : '入住' }}</el-button>
					<el-popover
							placement="top"
							width="150"
							trigger="click"
							v-if="scope.row.leaseId._id"
							v-model="scope.row.leaseoPopFlag">
							<p>确认已经结清所有费用？此行为不可撤销</p>
							<div class="lease-list-lease-o-pop-cont">
								<el-button size="mini" type="text" @click="scope.row.leaseoPopFlag = false">取消</el-button>
								<el-button type="danger" size="mini" @click="(scope.row.leaseoPopFlag = false) || getLeaseOut(scope.$index, scope.row)">确定</el-button>
							</div>
							<div slot="reference" class="lease-show-tag pop">
								<el-button
									size="small"
									type="danger"
									:loading="scope.row.gettingLeaseOut">搬出</el-button>
							</div>
						</el-popover>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
	export default {
		name: 'lease-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/lease/index')
		},
		created () {
			this.getListRefresh()
		},
		data () {
			let validatePass = (rule, value, callback) => {
				if (value[0] == null || value[1] == null) {
					callback(new Error('请选择'))
				} else {
					callback();
				}
			}

			return {
				gettingListRefresh: false,
				leaseData: [],
				leaseDataSearch: '',

				lidDialogTitle: '入住',
				lidLabelWidth: '90px',
				leaseInflag: false,
				lease: {
					haoId: '',
					fanghao: '',
					name: '',
					call: '',
					leaserange: [],
					payDay: 1,
					payType: 3,
					remark: '',

					calWaterPrice: {
						minPrice: 0,
						calType: 'single',
						singlePrice: 0,
						stepPrice: [{
							step: 0,
							price: 0
						}]
					},
					calElePrice: {
						minPrice: 0,
						calType: 'single',
						singlePrice: 0,
						stepPrice: [{
							step: 0,
							price: 0
						}]
					},

					rent: 0,
					deposit: 0
				},
				leaserules: {
					'name': [{ required: true, message: '请填写', trigger: 'blur' }],
					'call': [{ required: true, message: '请填写', trigger: 'blur' }],
					'leaserange': [{ required: true, validator: validatePass, trigger: 'change' }],
					'payDay': [{ type: 'number', required: true, message: '请选择', trigger: 'change' }],
					'payType': [{ type: 'number', required: true, message: '请选择', trigger: 'change' }],
					'calWaterPrice.minPrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'calWaterPrice.singlePrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'calElePrice.minPrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'calElePrice.singlePrice': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'rent': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }],
					'deposit': [{ type: 'number', required: true, message: '请填写', trigger: 'blur' }]
				},
				payTypeVal: ['微信', '支付宝', '银行转账', '现金'],
				leasePickerOptions: {
					shortcuts: [
						{
							text: '三个月',
							onClick(picker) {
								const end = new Date()
								const start = new Date()
								end.setTime(end.getTime() + 3600 * 1000 * 24 * 90)
								picker.$emit('pick', [start, end])
							}
						},
						{
							text: '半年',
							onClick(picker) {
								const end = new Date()
								const start = new Date()
								end.setTime(end.getTime() + 3600 * 1000 * 24 * 180)
								picker.$emit('pick', [start, end])
							}
						},
						{
							text: '一年',
							onClick(picker) {
								const end = new Date()
								const start = new Date()
								end.setTime(end.getTime() + 3600 * 1000 * 24 * 365)
								picker.$emit('pick', [start, end])
							}
						}
					]
				},
				defaultCalWaterPrice: {
					minPrice: 6,
					calType: 'single',
					singlePrice: 6,
					stepPrice: [{
						step: 0,
						price: 0
					}]
				},
				defaultCalElePrice: {
					minPrice: 0,
					calType: 'step',
					singlePrice: 0,
					stepPrice: [{
							step: 100,
							price: 1
						},
						{
							step: 200,
							price: 1.2
						},
						{
							step: 201,
							price: 1.4
						}]
				},
				gettingLeaseIn: false,
				editLeaseId: ''
			}
		},
		computed: {
			filterLeaseData () {
				if (!this.leaseDataSearch) {
					return this.leaseData
				} else {
					let _leaseDataSearch = new RegExp(this.leaseDataSearch, 'i')
					return this.leaseData.filter((item)=>{
						for (var i in item) {
							if (i != 'fanghao' && i != 'remark') {
								continue
							} else if (String(item[i]).match(_leaseDataSearch)) {
								return true
							}
						}
						return false
					})
				}
			}
		},
		methods: {
			//拉取入住信息列表
			getListRefresh () {
				if (this.gettingListRefresh) {
					return true
				}
				this.gettingListRefresh = true
				this.Ajax('/inner/lease/mainList', {}, (res)=>{
					this.leaseData = res.body.data
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
			getLeaseHistory (index, row) {
				this.$router.push('/inner/lease/history?haoid=' + row._id)
			},
			getLeaseInDialog (index, row) {
				this.leaseInflag = !this.leaseInflag
				if (this.leaseInflag && row) {
					this.lidDialogTitle = row.leaseId && row.leaseId._id ? '修改' : '入住'
					this.editLeaseId = row.leaseId && row.leaseId._id || ''

					this.lease.haoId = row._id
					this.lease.fanghao = row.fanghao

					this.lease.name = row.leaseId && row.leaseId.name || ''
					this.lease.call = row.leaseId && row.leaseId.call || ''
					this.lease.leaserange = row.leaseId && row.leaseId.leaserange || []
					this.lease.payDay = row.leaseId && row.leaseId.payDay || new Date().getDate()
					this.lease.payType = row.leaseId && row.leaseId.payType || 3
					this.lease.remark = row.leaseId && row.leaseId.remark || ''
					this.lease.rent = row.leaseId && row.leaseId.rent || 0
					this.lease.deposit = row.leaseId && row.leaseId.deposit || 0
					//calWater
					this.lease.calWaterPrice.minPrice = row.leaseId && row.leaseId.calWaterPrice && row.leaseId.calWaterPrice.minPrice || this.defaultCalWaterPrice.minPrice
					this.lease.calWaterPrice.calType = row.leaseId && row.leaseId.calWaterPrice && row.leaseId.calWaterPrice.calType || this.defaultCalWaterPrice.calType
					this.lease.calWaterPrice.singlePrice = row.leaseId && row.leaseId.calWaterPrice && row.leaseId.calWaterPrice.singlePrice || this.defaultCalWaterPrice.singlePrice
					this.lease.calWaterPrice.stepPrice = row.leaseId && row.leaseId.calWaterPrice && row.leaseId.calWaterPrice.stepPrice || JSON.parse(JSON.stringify(this.defaultCalWaterPrice.stepPrice))
					!this.lease.calWaterPrice.stepPrice.length && this.addStep(this.lease.calWaterPrice)
					//calEle
					this.lease.calElePrice.minPrice = row.leaseId && row.leaseId.calElePrice && row.leaseId.calElePrice.minPrice || this.defaultCalElePrice.minPrice
					this.lease.calElePrice.calType = row.leaseId && row.leaseId.calElePrice && row.leaseId.calElePrice.calType || this.defaultCalElePrice.calType
					this.lease.calElePrice.singlePrice = row.leaseId && row.leaseId.calElePrice && row.leaseId.calElePrice.singlePrice || this.defaultCalElePrice.singlePrice
					this.lease.calElePrice.stepPrice = row.leaseId && row.leaseId.calElePrice && row.leaseId.calElePrice.stepPrice || JSON.parse(JSON.stringify(this.defaultCalElePrice.stepPrice))
					!this.lease.calElePrice.stepPrice.length && this.addStep(this.lease.calElePrice)
				}
			},
			onLeaseInDialogClose () {
				this.$refs.leaseIn.resetFields()
			},
			//添加步骤
			addStep (wrap) {
				wrap.stepPrice.push({
					step: 0,
					price: 0
				})
			},
			//删除步骤
			removeStep (wrap, step) {
				let index = wrap.stepPrice.indexOf(step)
				if (index !== -1) {
					wrap.stepPrice.splice(index, 1)
				}
			},
			//入住，修改
			getLeaseIn () {
				if (this.gettingLeaseIn) {
					return true
				}
				this.gettingLeaseIn = true
				this.$refs.leaseIn.validate((valid)=>{
					if (valid) {
						let _data = Object.assign({}, this.lease)
						this.editLeaseId && (_data._id = this.editLeaseId)
						this.Ajax('/inner/lease/in', _data, (res)=>{
							this.$message({
								type: 'success',
								message: this.editLeaseId? '修改成功' : '添加成功',
								duration: 2000
							})
							this.getLeaseInDialog()
							this.gettingLeaseIn = false
							this.getListRefresh()
						}, (res)=>{
							this.$message({
								type: 'error',
								message: '编号：' + res.body.code + '，' + res.body.msg,
								duration: 2000
							})
							this.gettingLeaseIn = false
						})
					} else {
						this.gettingLeaseIn = false
					}
				})
			},
			getLeaseOut (index, row) {
				if (row.gettingLeaseOut) {
					return true
				}
				row.gettingLeaseOut = true
				this.Ajax('/inner/lease/out', {
					haoId: row._id,
					leaseId: row.leaseId._id
				}, (res)=>{
					this.$message({
						type: 'success',
						message: '退租成功',
						duration: 2000
					})
					row.gettingLeaseOut = false
					this.getListRefresh()
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					row.gettingLeaseOu = false
				})
			}
		}
	}
</script>