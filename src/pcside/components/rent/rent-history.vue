<style lang="scss">
	.rent-history{
		// 顶部按钮样式
		.table-btn{
			margin-bottom: 20px;
		}
		.table-btn-input{
			max-width: 300px;
			display: inline-block;
			margin-left: 10px;
		}
		// 弹窗表单样式
		.change-type-dialog{
			.el-input{
				width: 100%;
				vertical-align: top;
				// max-width: 300px;
			}
			.el-select{
				width: 100%;
				max-width: 300px;
			}
			.el-checkbox-group{
				overflow: hidden;
			}
			.el-row-margin{
				margin-bottom: 20px;
			}
		}
		.change-type-dialog{
			.el-input{
				max-width: 300px;
			}
		}
		// 信息悬浮窗样式
		.tag-bf-span{
			display: inline-block;
			vertical-align: middle;
		}
		.tag-bf-span + *{
			display: inline-block;
			vertical-align: middle;
		}
		.rent-show-tag{
			cursor: pointer;
			&.pop {
				margin-left: 10px;
			}
		}
		.rent-show-tag2{
			display: inline-block;
			vertical-align: middle;
		}
		.rent-show-tag3{
			margin-right: 4px;
			display: inline-block;
			vertical-align: middle;
		}
		.rent-remark-tag{
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}
	}
	// 信息悬浮窗弹窗样式
	.rent-remark{
		max-width: 200px;
	}
</style>

<template>
	<div class="rent-history">
		<!-- 顶部按钮组 -->
		<div class="table-btn">
			<el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
			<div class="table-btn-input">
				<el-input v-model="rentHistorySearch" placeholder="搜索"></el-input>
			</div>
		</div>

		<!-- 状态修改表单 -->
		<el-dialog :title="changeType.fanghao + ctdDialogTitle" v-model="changeTypeflag" size="tiny" class="change-type-dialog" :close-on-click-modal="false" @close="onChangeTypeDialogClose">
			<el-form :model="changeType" ref="changeType">
				<el-form-item>
					<el-alert title="多选状态信息" type="info"></el-alert>
				</el-form-item>
				<el-form-item label="状态" :label-width="ctdLabelWidth">
					<div>
						<el-checkbox-group v-model="changeType.type" @change="onChangeType">
							<el-row :gutter="20" v-for="type in types" class="el-row-margin">
								<el-col :span="4">
									<el-checkbox :label="type.value">{{type.label}}</el-checkbox>
								</el-col>
								<el-col :span="20">
									<el-date-picker v-if="changeType.type.indexOf(type.value) > -1" v-model="changeType.typeTime[type.value]" type="datetime" placeholder="输入状态时间" :editable="false"></el-date-picker>
								</el-col>
							</el-row>
						</el-checkbox-group>
					</div>
					<div>
						<el-checkbox :indeterminate="changeType.isIndeterminate" v-model="changeType.checkAll" @change="onCheckAllChange">全选</el-checkbox>
					</div>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="getChangeTypeDialog" :loading="gettingChangeType">取消</el-button>
				<el-button type="primary" @click="getChangeType" :loading="gettingChangeType">确定</el-button>
			</div>
		</el-dialog>

		<!-- 月周期图表 -->
		<el-table
			class="month-table"
			:data="filterRentHistoryData"
			v-loading.body="gettingListRefresh"
			stripe
			border>
			<el-table-column
				prop="fanghao"
				label="房屋"
				width="180"
				sortable>
				<template scope="scope">
					<div>{{getRent(scope).fanghao}}</div>
					<div>{{getRent(scope).monthId.month}}</div>
				</template>
			</el-table-column>
			<el-table-column
				label="计租信息">
				<el-table-column
					label="水费信息">
					<el-table-column
						label="本次用数/单价">
						<template scope="scope">
							<div v-if="getRent(scope).calWater">
								<span class="tag-bf-span">{{getRent(scope).calWater.tnew.water - getRent(scope).calWater.old.water}}吨</span>
								<el-popover
									placement="top"
									trigger="hover">
									<div>本次抄表数：{{getRent(scope).calWater.tnew.water}}吨</div>
									<div>抄表时间：{{getTime(getRent(scope).calWater.tnew.addTime)}}</div>
									<div>上次表底数：{{getRent(scope).calWater.old.water}}吨</div>
									<div>表底时间：{{getTime(getRent(scope).calWater.old.addTime)}}</div>
									<div slot="reference" class="rent-show-tag">
										<el-tag>计数</el-tag>
									</div>
								</el-popover>
							</div>
							<div v-if="getRent(scope).calWater">
								<span>￥{{getRent(scope).calWater.calWater.calType == 'single' ? getRent(scope).calWater.calWater.singlePrice : getPrice(getRent(scope).calWater.calWater.stepPrice, getRent(scope).calWater.tnew.water - getRent(scope).calWater.old.water)}}元/吨</span>
							</div>
							<div v-if="!getRent(scope).calWater">
								暂无
							</div>
						</template>
					</el-table-column>
					<el-table-column
						label="本次计费/时间"
						width="170">
						<template scope="scope">
							<div v-if="getRent(scope).calWater">
								<el-tag>{{getRent(scope).calWater.fix ? '修' : '计'}}</el-tag>
								<span>￥{{getRent(scope).calWater.calWaterResult}}元</span>
							</div>
							<div v-if="getRent(scope).calWater">
								<span>{{getTime(getRent(scope).calWater.addTime)}}</span>
							</div>
							<div v-if="!getRent(scope).calWater">
								暂无
							</div>
						</template>
					</el-table-column>
				</el-table-column>
				<el-table-column
					label="电费信息">
					<el-table-column
						label="本次用数/单价">
						<template scope="scope">
							<div v-if="getRent(scope).calElectric">
								<span class="tag-bf-span">{{getRent(scope).calElectric.tnew.electric - getRent(scope).calElectric.old.electric}}度</span>
								<el-popover
									placement="top"
									trigger="hover">
									<div>本次抄表数：{{getRent(scope).calElectric.tnew.electric}}度</div>
									<div>抄表时间：{{getTime(getRent(scope).calElectric.tnew.addTime)}}</div>
									<div>上次表底数：{{getRent(scope).calElectric.old.electric}}度</div>
									<div>表底时间：{{getTime(getRent(scope).calElectric.old.addTime)}}</div>
									<div slot="reference" class="rent-show-tag">
										<el-tag>计数</el-tag>
									</div>
								</el-popover>
							</div>
							<div v-if="getRent(scope).calElectric">
								<span>￥{{getRent(scope).calElectric.calElectric.calType == 'single' ? getRent(scope).calElectric.calElectric.singlePrice : getPrice(getRent(scope).calElectric.calElectric.stepPrice, getRent(scope).calElectric.tnew.electric - getRent(scope).calElectric.old.electric)}}元/度</span>
							</div>
							<div v-if="!getRent(scope).calElectric">
								暂无
							</div>
						</template>
					</el-table-column>
					<el-table-column
						label="本次计费/时间"
						width="170">
						<template scope="scope">
							<div v-if="getRent(scope).calElectric">
								<el-tag>{{getRent(scope).calElectric.fix ? '修' : '计'}}</el-tag>
								<span>￥{{getRent(scope).calElectric.calElectricResult}}元</span>
							</div>
							<div v-if="getRent(scope).calElectric">
								<span>{{getTime(getRent(scope).calElectric.addTime)}}</span>
							</div>
							<div v-if="!getRent(scope).calElectric">
								暂无
							</div>
						</template>
					</el-table-column>
				</el-table-column>
				<el-table-column
					label="房租信息">
					<template scope="scope">
						<div v-if="getRent(scope).lease.name">
							<el-tag class="tag-bf-span">{{getRent(scope).lease.payDay}}日</el-tag>
							<el-popover
								placement="top"
								trigger="hover">
								<div>姓名：{{getRent(scope).lease.name}}</div>
								<div>联系方式：{{getRent(scope).lease.call}}</div>
								<div>租住起始：{{getTime(getRent(scope).lease.leaserange[0])}}</div>
								<div>租住结束：{{getTime(getRent(scope).lease.leaserange[1])}}</div>
								<div>入住时间：{{getTime(getRent(scope).lease.addTime)}}</div>
								<div>搬出时间：{{getTime(getRent(scope).lease.outTime)}}</div>						
								<div>备注：{{getRent(scope).lease.remark || '--'}}</div>
								<div slot="reference" class="rent-show-tag">
									<el-tag>{{payTypeVal[getRent(scope).lease.payType]}}</el-tag>
								</div>
							</el-popover>
						</div>
						<div v-if="getRent(scope).lease.name">
							<span>￥{{getRent(scope).lease.rent}}元</span>
						</div>
						<div v-if="!getRent(scope).lease.name">
							暂无
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label="合计/计费时间"
					width="170">
					<template scope="scope">
						<div>
							<el-tag>{{getRent(scope).fix ? '修' : '计'}}</el-tag>
							<span>￥{{getRent(scope).calRentResult}}元</span>
						</div>
						<div>{{getTime(getRent(scope).addTime)}}</div>
					</template>
				</el-table-column>
				<el-table-column
					label="状态/更新时间"
					width="170">
					<template scope="scope">
						<div v-if="getRent(scope).type">
							<el-popover
								placement="top"
								trigger="hover"
								 v-for="item in getRent(scope).type.type">
								<div class="rent-remark">{{ getTime(getRent(scope).type.typeTime[item]) }}</div>
								<div slot="reference" class="rent-show-tag rent-show-tag3">
									<el-tag>{{typesVal[item]}}</el-tag>
								</div>
							</el-popover>
						</div>
						<el-tag v-if="getRent(scope).type && !getRent(scope).type.type.length || !getRent(scope).type">新建</el-tag>
						<div>{{getTime(getRent(scope).updateTime)}}</div>
					</template>
				</el-table-column>
				<el-table-column
					label="备注">
					<template scope="scope">
						<el-popover
							placement="top"
							trigger="hover">
							<div class="rent-remark">{{ getRent(scope).remark }}</div>
							<div slot="reference" class="rent-show-tag rent-show-tag2">
								<div class="rent-remark-tag">{{ getRent(scope).remark }}</div>
							</div>
						</el-popover>
					</template>
				</el-table-column>
			</el-table-column>
			<el-table-column
				label="操作"
				width="100">
				<template scope="scope">
					<el-button
						size="small"
						type="primary"
						@click="getChangeTypeDialog(scope.$index, scope.row)">状态</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
	export default {
		name: 'rent-history',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/rent/index')
		},
		created () {
			this.getListRefresh()
			this.getResetChangeType()
		},
		data () {
			return {
				changeTypeflag: false,
				gettingChangeType: false,
				gettingListRefresh: false,

				//修改状态
				ctdDialogTitle: '状态修改',
				ctdLabelWidth: '90px',
				types: [
					{label: '已交', value: 1},
					{label: '给单', value: 2},
					{label: '房东', value: 3}	
				],
				changeType: {
					fanghao: '',
					rentId: '',
					type: [],
					typeTime: {
						1: '',
						2: '',
						3: ''
					},
					isIndeterminate: false,
					checkAll: false
				},

				//列表渲染
				rentHistoryData: [],
				rentHistorySearch: '',
				payTypeVal: ['微信', '支付宝', '银行转账', '现金'],
				typesVal: ['', '已交', '给单', '房东']
			}
		},
		computed: {
			filterRentHistoryData () {
				if (!this.rentHistorySearch) {
					return this.rentHistoryData
				} else {
					let _rentHistorySearch = new RegExp(this.rentHistorySearch, 'i')
					return this.rentHistoryData.filter((item)=>{
						for (var i in item) {
							if (i != 'fanghao' && i != 'remark') {
								continue
							} else if (String(item[i]).match(_rentHistorySearch)) {
								return true
							}
						}
						return false
					})
				}
			}
		},
		methods: {
			getListRefresh () {
				if (this.gettingListRefresh) {
					return true
				}
				this.gettingListRefresh = true
				this.Ajax('/inner/rent/listByHao', {
					haoId: this.$route.query.id
				}, (res)=>{
					this.rentHistoryData = res.body.data
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
				return scope.row
			},
			getChangeTypeDialog (index, row) {
				this.changeTypeflag = !this.changeTypeflag
				if (this.changeTypeflag && row) {
					this.changeType.fanghao = row.fanghao
					this.changeType.rentId = row._id
					// type
					this.changeType.type = row.type && row.type.type || []
					this.changeType.typeTime = row.type && row.type.typeTime || {
						1: '',
						2: '',
						3: ''
					}
					this.changeType.isIndeterminate = row.type && row.type.isIndeterminate || false
					this.changeType.checkAll = row.type && row.type.checkAll || false
				}
			},
			getResetChangeType () {
				this.changeType.fanghao = ''
				this.changeType.rentId = ''
				this.changeType.type = []
				this.changeType.typeTime = {
					1: '',
					2: '',
					3: ''
				}
				this.changeType.isIndeterminate = false
				this.changeType.checkAll = false
			},
			onChangeTypeDialogClose () {
				this.getResetChangeType()
			},
			onChangeType (value) {
				let checkedCount = value.length
				value[checkedCount - 1] && !this.changeType.typeTime[value[checkedCount - 1]] && (this.changeType.typeTime[value[checkedCount - 1]] = new Date())
				this.types.forEach((i)=>{
					value.indexOf(i.value) === -1 && (this.changeType.typeTime[i.value] = '')
				})
        		this.changeType.checkAll = checkedCount === this.types.length
        		this.changeType.isIndeterminate = checkedCount > 0 && checkedCount < this.types.length
			},
			onCheckAllChange (event) {
				this.changeType.type = event.target.checked ? [1, 2, 3] : []
				for (var i in this.changeType.typeTime) {
					this.changeType.typeTime[i] = !this.changeType.typeTime[i] && event.target.checked ? new Date() : (!event.target.checked ? '' : this.changeType.typeTime[i])
				}
        		this.changeType.isIndeterminate = false
			},
			getChangeType () {
				if (this.gettingChangeType) {
					return true
				}
				this.gettingChangeType = true
				let _data = Object.assign({}, this.changeType)
				this.Ajax('/inner/rent/type', _data, (res)=>{
					this.$message({
						type: 'success',
						message: '状态更新成功',
						duration: 2000
					})
					this.getChangeTypeDialog()
					this.gettingChangeType = false
					this.getListRefresh()
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					this.gettingChangeType = false
				})
			}
		}
	}
</script>