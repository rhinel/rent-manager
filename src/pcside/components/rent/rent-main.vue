<style lang="scss">
	.rent-main{
		.table-btn{
			margin-bottom: 20px;
		}
		.table-btn-input{
			max-width: 300px;
			display: inline-block;
			margin-left: 10px;
		}
		.add-month-list-dialog{
			.el-input{
				width: 100%;
				max-width: 300px;
			}
			.el-select{
				width: 100%;
				max-width: 300px;
			}
		}
		.month-show-pop{
			display: inline-block;
			margin-left: 10px;
		}
	}
	.month-list-d-month-pop-cont{
		text-align: right;
		margin: 0;
	}
</style>

<template>
	<div class="rent-main">
		<!-- 顶部按钮组 -->
		<div class="table-btn">
			<el-button type="primary" @click="getAddMonthListDialog">新增</el-button>
			<el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
			<div class="table-btn-input">
				<el-input v-model="MonthListSearch" placeholder="搜索"></el-input>
			</div>
		</div>

		<!-- 新增弹窗 -->
		<el-dialog :title="amldDialogTitle" v-model="addMonthListflag" size="tiny" class="add-month-list-dialog" :close-on-click-modal="false" @close="onAddMonthListDialogClose">
			<el-form :model="addMonthList" ref="addMonthList" :rules="addMonthListrules">
				<el-form-item label="收租周期" :label-width="amldLabelWidth" prop="month">
					<el-date-picker
					v-model="addMonthList.month"
					type="month"
					:disabled="!amldInput"
					placeholder="选择月份">
					</el-date-picker>
				</el-form-item>
				<el-form-item label="备注" :label-width="amldLabelWidth">
					<el-input v-model="addMonthList.remark" auto-complete="off" placeholder="备注"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="getAddMonthListDialog" :loading="gettingAddMonthList">取消</el-button>
				<el-button type="primary" @click="getAddMonthList" :loading="gettingAddMonthList">确定</el-button>
			</div>
		</el-dialog>

		<!-- 月份数据表 -->
		<el-table
			class="month-table"
			:data="filterMonthData"
			v-loading.body="gettingListRefresh"
			stripe
			border>
			<el-table-column
				prop="month"
				label="月份"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="remark"
				label="备注">
			</el-table-column>
			<el-table-column
				prop="createTime"
				label="创建时间"
				width="180"
				sortable>
				<template scope="scope">
					{{ getTime(scope.row.createTime) }}
				</template>
			</el-table-column>
			<el-table-column
				prop="updateTime"
				label="修改时间"
				width="180"
				sortable>
				<template scope="scope">
					{{ getTime(scope.row.updateTime) }}
				</template>
			</el-table-column>
			<el-table-column
				label="操作"
				width="180">
				<template scope="scope">
					<el-button
						size="small"
						type="primary"
						@click="getAddMonthListDialog(scope.$index, scope.row)">修改</el-button>
					<el-popover
						placement="top"
						width="150"
						trigger="click"
						v-model="scope.row.dMonthPopFlag">
						<p>确认删除月份周期信息吗？与之关联的数据将一并删除</p>
						<div class="month-list-d-month-pop-cont">
							<el-button size="mini" type="text" @click="scope.row.dMonthPopFlag = false">取消</el-button>
							<el-button type="danger" size="mini" @click="(scope.row.dMonthPopFlag = false) || getDelMonth(scope.$index, scope.row)">确定</el-button>
						</div>
						<div slot="reference" class="month-show-pop">
							<el-button
								size="small"
								type="danger"
								:loading="scope.row.gettingdelMonth">删除</el-button>
						</div>
					</el-popover>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
	export default {
		name: 'rent-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/rent/index')
		},
		created () {
			this.getListRefresh()
			this.getResetAddMonthList()
		},
		data () {
			return {
				addMonthListflag: false,
				gettingAddMonthList: false,
				gettingListRefresh: false,
				MonthListSearch: '',

				amldDialogTitle: '新增收租周期',
				amldInput: true,
				amldLabelWidth: '90px',
				addMonthList: {
					month: '',
					remark: ''
				},
				addMonthListrules: {
					month: [{ type: 'date', required: true, message: '请选择', trigger: 'change' }]
				},
				editMonthId: '',
				monthData: [],
				monthDataSearch: ''
			}
		},
		computed: {
			filterMonthData () {
				if (!this.monthDataSearch) {
					return this.monthData
				} else {
					let _monthDataSearch = new RegExp(this.monthDataSearch, 'i')
					return this.monthData.filter((item)=>{
						for (var i in item) {
							if (i != 'month' && i != 'remark') {
								continue
							} else if (String(item[i]).match(_monthDataSearch)) {
								return true
							}
						}
						return false
					})
				}
			}
		},
		methods: {
			getAddMonthListDialog (index, row) {
				this.addMonthListflag = !this.addMonthListflag
				if (row) {
					let _date = new Date()
					_date.setFullYear(row.month.slice(0, 4))
					_date.setMonth(row.month.slice(5, 7) - 1)
					this.amldInput = false
					this.addMonthList.month = _date
					this.addMonthList.remark = row.remark
					this.amldDialogTitle = '修改收租周期'
					this.editMonthId = row._id
				} else {
					this.amldInput = true
					this.addMonthListflag && (this.addMonthList.month = new Date())
				}
			},
			getResetAddMonthList () {
				this.addMonthList.month = ''
				this.addMonthList.remark = ''
				this.editMonthId = ''
				this.amldInput = true
				this.amldDialogTitle = '新增收租周期'
			},
			getListRefresh () {
				if (this.gettingListRefresh) {
					return true
				}
				this.gettingListRefresh = true
				this.Ajax('/inner/month/list', {}, (res)=>{
					this.monthData = res.body.data
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
			onAddMonthListDialogClose () {
				this.$refs.addMonthList.resetFields()
				this.getResetAddMonthList()
			},
			getAddMonthList () {
				if (this.gettingAddMonthList) {
					return true
				}
				this.gettingAddMonthList = true
				this.$refs.addMonthList.validate((valid)=>{
					if (valid) {
						let _data = Object.assign({}, this.addMonthList)
						_data.month = _data.month.getFullYear() +  '-' + (_data.month.getMonth() + 1 > 9 ? _data.month.getMonth() + 1 : ('0' + (_data.month.getMonth() + 1)))
						this.editMonthId && (_data._id = this.editMonthId)
						this.Ajax('/inner/month/add', _data, (res)=>{
							this.$message({
								type: 'success',
								message: '添加成功',
								duration: 2000
							})
							this.getAddMonthListDialog()
							this.gettingAddMonthList = false
							this.getListRefresh()
						}, (res)=>{
							this.$message({
								type: 'error',
								message: '编号：' + res.body.code + '，' + res.body.msg,
								duration: 2000
							})
							this.gettingAddMonthList = false
						})
					} else {
						this.gettingAddMonthList = false
					}
				})
			},
			//时间格式化
			getTime (t) {
				return t? this.GetTimeFormat(t) : '--'
			},
			//删除房屋
			getDelMonth (index, row) {
				if (row.gettingdelMonth) {
					return true
				}
				row.gettingdelMonth = true
				this.Ajax('/inner/month/del', {_id: row._id}, (res)=>{
					this.$message({
						type: 'success',
						message: '删除成功',
						duration: 2000
					})
					row.gettingdelMonth = false
					this.getListRefresh()
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					row.gettingdelMonth = false
				})
			}
		}
	}
</script>