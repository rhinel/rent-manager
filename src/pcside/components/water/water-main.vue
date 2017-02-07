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
					<el-input v-model="addWater.water" auto-complete="off" placeholder="输入水表数"></el-input>
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

		<!-- 水费数据表 -->
		<el-table
			class="water-table"
			:data="filterWaterData"
			v-loading.body="gettingListRefresh"
			stripe
			border>
			<el-table-column
				prop="fang"
				label="坊号"
				width="100"
				sortable>
			</el-table-column>
			<el-table-column
				prop="hao"
				label="房间号"
				width="100"
				sortable>
			</el-table-column>
			<el-table-column
				prop="hao"
				label="最新抄表数"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="hao"
				label="最新抄表时间"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="hao"
				label="上次计费底表数"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				prop="hao"
				label="上次计费/初始时间"
				width="180"
				sortable>
			</el-table-column>
			<el-table-column
				label="本期实用数"
				width="180"
				sortable>
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
						@click="getCalWater(scope.$index, scope.row)">计费</el-button>
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
			this.getResetWater()
		},
		data () {
			return {
				addWaterflag: false,
				gettingAddWater: false,
				gettingListRefresh: false,

				houseData: [],
				awdDialogTitle: '抄水表',
				awdLabelWidth: '90px',
				addWater: {
					haoId: '',
					water: '',
					addTime: '',
				},
				addWaterrules: {
					haoId: [
						{ required: true, message: '请填写', trigger: 'blur' }
					],
					water: [
						{ required: true, message: '请填写', trigger: 'blur' }
					],
					addTime: [
						{ type: 'date', required: true, message: '请填写', trigger: 'change' }
					]
				},
				waterData: [],
				waterDataSearch: ''
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
			getResetWater () {
				this.addWater.addTime = ''
			},
			//关闭弹窗回调
			onAddWaterDialogClose () {
				this.$refs.addWater.resetFields()
				this.getResetWater()
			},
			//抄表
			getAddWater () {
				if (this.gettingAddWater) {
					return true
				}
				this.gettingAddWater = true
			},
			//拉取水费信息列表
			getListRefresh () {
				
			},
			//时间格式化
			getTime (t) {
				return t? this.GetTimeFormat(t) : '--'
			},
			//计费
			getCalWater (index, row) {

			},
			//进入历史
			getWaterHistory (index, row) {

			}
		}
	}
</script>