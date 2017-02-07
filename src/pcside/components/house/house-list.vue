<style lang="scss">
	.house-list{
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
		.add-house-dialog{
			.el-input{
				max-width: 300px;
			}
			.el-select{
				width: 100%;
				max-width: 300px;
			}
		}
	}
</style>

<template>
	<div class="house-list">

		<!-- 顶部按钮组 -->
		<div class="table-btn">
			<el-button type="primary" @click="getAddHouseDialog">新增</el-button>
			<el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
			<div class="table-btn-input">
				<el-input v-model="houseDataSearch" placeholder="搜索"></el-input>
			</div>
		</div>
		
		<!-- 新增弹窗 -->
		<el-dialog :title="ahdDialogTitle" v-model="addHouseFlag" size="tiny" class="add-house-dialog" :close-on-click-modal="false" @close="onAddHouseDialogClose">
			<el-form :model="addHouse" ref="addHouse" :rules="addHouserules">
				<el-form-item label="坊号" :label-width="ahdLabelWidth" prop="fang">
					<el-select v-model="addHouse.fang" placeholder="选择坊号">
						<el-option v-for="item in houseFang" :label="item" :value="item"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="房间号" :label-width="ahdLabelWidth" prop="hao">
					<el-input v-model="addHouse.hao" auto-complete="off" placeholder="输入房间号"></el-input>
				</el-form-item>
				<el-form-item label="说明" :label-width="ahdLabelWidth">
					<el-input v-model="addHouse.detail" auto-complete="off" placeholder="选填"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="getAddHouseDialog" :loading="gettingAddHouse">取消</el-button>
				<el-button type="primary" @click="getAddHouse" :loading="gettingAddHouse">确定</el-button>
			</div>
		</el-dialog>

		<!-- 房屋数据表 -->
		<el-table
			class="house-table"
			:data="filterHouseData"
			v-loading.body="gettingListRefresh"
			stripe
			border>
			<el-table-column
				prop="fang"
				label="坊号"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="hao"
				label="房间号"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="detail"
				label="说明">
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
						@click="getAddHouseDialog(scope.$index, scope.row)">修改</el-button>
					<el-button
						size="small"
						type="danger"
						:loading="scope.row.gettingdelHouse"
						@click="getDelHouse(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
	export default {
		name: 'house-list',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/house/index')
		},
		created () {
			this.getListRefresh()
			this.getResetHouse()
		},
		data () {
			return {
				addHouseFlag: false,
				gettingAddHouse: false,
				gettingListRefresh: false,

				houseFang: ['6坊65栋', '8坊68栋', '公司楼'],
				ahdDialogTitle: '',
				ahdLabelWidth: '80px',
				addHouse: {
					fang: '',
					hao: '',
					detail: ''
				},
				addHouserules: {
					hao: [
						{ required: true, message: '请填写', trigger: 'blur' }
					],
					fang: [
						{ required: true, message: '请填写', trigger: 'blur' }
					]
				},
				editHouseId: '',
				houseData: [],
				houseDataSearch: ''
			}
		},
		computed: {
			filterHouseData () {
				if (!this.houseDataSearch) {
					return this.houseData
				} else {
					let _houseDataSearch = new RegExp(this.houseDataSearch, 'i')
					return this.houseData.filter((item)=>{
						for (var i in item) {
							if (i == 'gettingdelHouse' || i == 'createTime' || i == 'updateTime' || i == '_id') {
								continue
							} else if (item[i].match(_houseDataSearch)) {
								return true
							}
						}
						return false
					})
				}
			}
		},
		methods: {
			//打开关闭添加/修改弹窗
			getAddHouseDialog (index, row) {
				this.addHouseFlag = !this.addHouseFlag
				if (row) {
					this.addHouse.fang = row.fang
					this.addHouse.hao = row.hao
					this.addHouse.detail = row.detail
					this.ahdDialogTitle = '修改房间'
					this.editHouseId = row._id
				}
			},
			//弹窗数据初始化
			getResetHouse () {
				this.addHouse.fang = this.houseFang[0]
				this.addHouse.hao = ''
				this.addHouse.detail = ''
				this.ahdDialogTitle = '新增房间'
				this.editHouseId = ''
			},
			//关闭弹窗回调
			onAddHouseDialogClose () {
				this.$refs.addHouse.resetFields()
				this.getResetHouse()
			},
			//添加/修改房屋
			getAddHouse () {
				if (this.gettingAddHouse) {
					return true
				}
				this.gettingAddHouse = true
				this.$refs.addHouse.validate((valid)=>{
					if (valid) {
						let _data = Object.assign({}, this.addHouse)
						this.editHouseId && (_data._id = this.editHouseId)
						this.Ajax('/inner/house/add', _data, (res)=>{
							this.$message({
								type: 'success',
								message: this.editHouseId? '修改成功' : '添加成功',
								duration: 2000
							})
							this.getAddHouseDialog()
							this.gettingAddHouse = false
							this.getListRefresh()
						}, (res)=>{
							this.$message({
								type: 'error',
								message: '编号：' + res.body.code + '，' + res.body.msg,
								duration: 2000
							})
							this.gettingAddHouse = false
						})
					} else {
						this.gettingAddHouse = false
					}
				})
			},
			//获取房屋列表
			getListRefresh () {
				if (this.gettingListRefresh) {
					return true
				}
				this.gettingListRefresh = true
				this.Ajax('/inner/house/list', {}, (res)=>{
					this.houseData = res.body.data
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
			//删除房屋
			getDelHouse (index, row) {
				if (row.gettingdelHouse) {
					return true
				}
				row.gettingdelHouse = true
				this.Ajax('/inner/house/del', {_id: row._id}, (res)=>{
					this.$message({
						type: 'success',
						message: '删除成功',
						duration: 2000
					})
					row.gettingdelHouse = false
					this.getListRefresh()
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					row.gettingdelHouse = false
				})
			}
		}
	}
</script>