<style lang="scss">
	.water-history{
		.table-btn{
			margin-bottom: 20px;
		}
		.table-btn-input{
			max-width: 300px;
			display: inline-block;
			margin-left: 10px;
		}
		.el-tag{
			cursor: pointer;
		}
		.cal-show-tag, .water-show-pop{
			display: inline-block;
		}
	}
	.water-history-step-p-wrap{
		display: flex;
		.step-p-val{
			flex: 1;
		}
	}
</style>

<template>
	<div class="water-history">
		<el-tabs v-model="activeName">
			<el-tab-pane label="抄表历史" name="water">

				<!-- 顶部按钮组 -->
				<div class="table-btn">
					<el-button type="primary" @click="getWaterList" :loading="gettingListRefresh">刷新</el-button>
					<div class="table-btn-input">
						<el-input v-model="waterDataSearch" placeholder="搜索"></el-input>
					</div>
				</div>

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
						prop="water"
						label="抄表数(吨)"
						width="180"
						sortable>
					</el-table-column>
					<el-table-column
						prop="addTime"
						label="抄表时间"
						width="180"
						sortable>
						<template scope="scope">
							{{ getTime(scope.row.addTime) }}
						</template>
					</el-table-column>
					<el-table-column
						prop="remark"
						label="备注"
						sortable>
					</el-table-column>
					<el-table-column
						label="操作"
						width="100">
						<template scope="scope">
							<el-popover
								placement="top"
								width="150"
								trigger="click"
								v-model="scope.row.dWaterPopFlag">
								<p>确认删除抄表记录吗？计费历史收费历史等将不受影响，仅影响当前数据</p>
								<div class="house-list-d-house-pop-cont">
									<el-button size="mini" type="text" @click="scope.row.dWaterPopFlag = false">取消</el-button>
									<el-button type="danger" size="mini" @click="(scope.row.dWaterPopFlag = false) || delWater(scope.$index, scope.row)">确定</el-button>
								</div>
								<div slot="reference" class="water-show-pop">
									<el-button
										size="small"
										type="danger"
										:loading="scope.row.gettingdelWater">删除</el-button>
								</div>
							</el-popover>
						</template>
					</el-table-column>
				</el-table>
			</el-tab-pane>
			<el-tab-pane label="计费历史" name="waterCal">

				<!-- 顶部按钮组 -->
				<div class="table-btn">
					<el-button type="primary" @click="getwaterCalList" :loading="gettingListRefresh2">刷新</el-button>
					<div class="table-btn-input">
						<el-input v-model="waterCalDataSearch" placeholder="搜索"></el-input>
					</div>
				</div>

				<!-- 水费数据表 -->
				<el-table
					class="water-table"
					:data="filterWaterCalData"
					v-loading.body="gettingListRefresh2"
					stripe
					border>
					<el-table-column
						prop="fanghao"
						label="房屋"
						width="180"
						sortable>
					</el-table-column>
					<el-table-column label="今次(吨)">
						<el-table-column
							prop="tnew.water"
							label="抄表数"
							width="100"
							sortable>
						</el-table-column>
						<el-table-column
							prop="tnew.addTime"
							label="抄表时间"
							width="180"
							sortable>
							<template scope="scope">
								{{ getTime(scope.row.tnew.addTime) }}
							</template>
						</el-table-column>
					</el-table-column>
					<el-table-column label="前次(吨)">
						<el-table-column
							prop="old.water"
							label="底表数"
							width="100"
							sortable>
						</el-table-column>
						<el-table-column
							prop="old.addTime"
							label="底表时间"
							width="180"
							sortable>
							<template scope="scope">
								{{ getTime(scope.row.old.addTime) }}
							</template>
						</el-table-column>
					</el-table-column>
					<el-table-column
						prop="gap"
						label="小计(吨)"
						width="110"
						sortable>
					</el-table-column>
					<el-table-column  label="计费">
						<el-table-column
							prop="calWaterResult"
							label="计费"
							width="180"
							sortable>
							<template scope="scope">
								<el-tag>{{ scope.row.fix ? '修' : '计' }}</el-tag>
								￥{{ scope.row.calWaterResult }}元
							</template>
						</el-table-column>
						<el-table-column
							prop="addTime"
							label="计费时间"
							width="180"
							sortable>
							<template scope="scope">
								{{ getTime(scope.row.addTime) }}
							</template>
						</el-table-column>
						<el-table-column
							prop="remark"
							label="计费备注">
							<template scope="scope">
								<el-popover
									placement="right"
									trigger="hover">
									<div>
										低消：{{ scope.row.calWater.minPrice }}吨
									</div>
									<div v-if="scope.row.calWater.calType == 'single'">
										单价：￥{{ scope.row.calWater.singlePrice }}元/吨
									</div>
									<div class="water-history-step-p-wrap" v-if="scope.row.calWater.calType == 'step'">
										<div class="step-p-title">阶梯：</div>
										<div class="step-p-val">
											<div v-for="item in scope.row.calWater.stepPrice">阶梯{{item.step}}吨及以下￥{{item.price}}元/吨</div>
										</div>
									</div>
									<div v-if="scope.row.calWater.calType == 'step'">超过最后一个阶梯的部分将按照最后一个阶梯计费</div>
									<div v-if="scope.row.fix">
										本计费结果已被修正，计算方式仅供参考
									</div>
									<div slot="reference" class="cal-show-tag">
										<el-tag>计费方式</el-tag>
									</div>
								</el-popover>
								{{ scope.row.remark }}
							</template>
						</el-table-column>
					</el-table-column>
					<el-table-column
						label="操作"
						width="100">
						<template scope="scope">
							<el-popover
								placement="top"
								width="150"
								trigger="click"
								v-model="scope.row.dCalWaterPopFlag">
								<p>确认删除计费记录吗？抄表历史收费历史等将不受影响，仅影响当前数据</p>
								<div class="house-list-d-house-pop-cont">
									<el-button size="mini" type="text" @click="scope.row.dCalWaterPopFlag = false">取消</el-button>
									<el-button type="danger" size="mini" @click="(scope.row.dCalWaterPopFlag = false) || delCalWater(scope.$index, scope.row)">确定</el-button>
								</div>
								<div slot="reference" class="water-show-pop">
									<el-button
										size="small"
										type="danger"
										:loading="scope.row.gettingdelCalWater">删除</el-button>
								</div>
							</el-popover>
						</template>
					</el-table-column>
				</el-table>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script>
	export default {
		name: 'water-history',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/water/index')
		},
		created () {
			this.getHouseDetail()
			this.activeName == 'water' && this.getWaterList()
			this.activeName == 'waterCal' && this.getwaterCalList()
		},
		data () {
			return {
				gettingListRefresh: false,
				gettingListRefresh2: false,
				activeName: 'water',
				houseData: {},
				houseNoData: false,

				waterList: [],
				waterDataSearch: '',
				waterCalList: [],
				waterCalDataSearch: '',

			}
		},
		computed: {
			filterWaterData () {
				if (!this.waterDataSearch) {
					return this.waterList
				} else {
					let _waterDataSearch = new RegExp(this.waterDataSearch, 'i')
					return this.waterList.filter((item)=>{
						for (var i in item) {
							if (i != 'fanghao' && i != 'water' && i != 'remark') {
								continue
							} else if (String(item[i]).match(_waterDataSearch)) {
								return true
							}
						}
						return false
					})
				}
			},
			filterWaterCalData () {
				if (!this.waterCalDataSearch) {
					return this.waterCalList
				} else {
					let _waterCalDataSearch = new RegExp(this.waterCalDataSearch, 'i')
					return this.waterCalList.filter((item)=>{
						for (var i in item) {
							if (i != 'fanghao' && i != 'remark') {
								continue
							} else if (String(item[i]).match(_waterCalDataSearch)) {
								return true
							}
						}
						return false
					})
				}
			}
		},
		watch: {
			activeName (n, o) {
				n == 'water' && this.getWaterList()
				n == 'waterCal' && this.getwaterCalList()
			}
		},
		methods: {
			getHouseDetail () {
				this.Ajax('/inner/house/find', {_id: this.$route.query.haoid}, (res)=>{
					this.houseData = res.body.data
				}, (res)=>{
					this.houseNoData = true
				})
			},
			getWaterList () {
				if (this.gettingListRefresh) {
					return true
				}
				this.gettingListRefresh = true
				this.Ajax('/inner/water/list', {haoId: this.$route.query.haoid}, (res)=>{
					this.waterList = res.body.data
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
			getwaterCalList () {
				if (this.gettingListRefresh2) {
					return true
				}
				this.gettingListRefresh2 = true
				this.Ajax('/inner/water/calList', {haoId: this.$route.query.haoid}, (res)=>{
					this.waterCalList = res.body.data
					this.gettingListRefresh2 = false
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					this.gettingListRefresh2 = false
				})
			},
			getTime (t) {
				return t? this.GetTimeFormat(t) : '--'
			},
			delWater (index, row) {
				if (row.gettingdelWater) {
					return true
				}
				row.gettingdelWater = true
				this.Ajax('/inner/water/del', {_id: row._id, haoId: row.haoId._id}, (res)=>{
					this.$message({
						type: 'success',
						message: '删除成功',
						duration: 2000
					})
					row.gettingdelWater = false
					this.getWaterList()
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					row.gettingdelWater = false
				})
			},
			delCalWater (index, row) {
				if (row.gettingdelCalWater) {
					return true
				}
				row.gettingdelCalWater = true
				this.Ajax('/inner/water/delCal', {_id: row._id, haoId: row.haoId._id}, (res)=>{
					this.$message({
						type: 'success',
						message: '删除成功',
						duration: 2000
					})
					row.gettingdelCalWater = false
					this.getwaterCalList()
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					row.gettingdelCalWater = false
				})
			}
		}
	}
</script>