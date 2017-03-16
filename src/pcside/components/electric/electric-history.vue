<style lang="scss">
	.electric-history{
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
		.cal-show-tag, .electric-show-pop{
			display: inline-block;
		}
	}
	.electric-history-step-p-wrap{
		display: flex;
		.step-p-val{
			flex: 1;
		}
	}
</style>

<template>
	<div class="electric-history">
		<el-tabs v-model="activeName">
			<el-tab-pane label="抄表历史" name="electric">

				<!-- 顶部按钮组 -->
				<div class="table-btn">
					<el-button type="primary" @click="getElectricList" :loading="gettingListRefresh">刷新</el-button>
					<div class="table-btn-input">
						<el-input v-model="electricDataSearch" placeholder="搜索"></el-input>
					</div>
				</div>

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
						width="180">
					</el-table-column>
					<el-table-column
						prop="electric"
						label="抄表数(度)"
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
						label="备注">
					</el-table-column>
					<el-table-column
						label="操作"
						width="100">
						<template scope="scope">
							<el-popover
								placement="top"
								width="150"
								trigger="click"
								v-model="scope.row.dElectricPopFlag">
								<p>确认删除抄表记录吗？计费历史收费历史等将不受影响，仅影响当前数据</p>
								<div class="house-list-d-house-pop-cont">
									<el-button size="mini" type="text" @click="scope.row.dElectricPopFlag = false">取消</el-button>
									<el-button type="danger" size="mini" @click="(scope.row.dElectricPopFlag = false) || delElectric(scope.$index, scope.row)">确定</el-button>
								</div>
								<div slot="reference" class="electric-show-pop">
									<el-button
										size="small"
										type="danger"
										:loading="scope.row.gettingdelElectric">删除</el-button>
								</div>
							</el-popover>
						</template>
					</el-table-column>
				</el-table>
			</el-tab-pane>
			<el-tab-pane label="计费历史" name="electricCal">

				<!-- 顶部按钮组 -->
				<div class="table-btn">
					<el-button type="primary" @click="getElectricCalList" :loading="gettingListRefresh2">刷新</el-button>
					<div class="table-btn-input">
						<el-input v-model="electricCalDataSearch" placeholder="搜索"></el-input>
					</div>
				</div>

				<!-- 电费数据表 -->
				<el-table
					class="electric-table"
					:data="filterElectricCalData"
					v-loading.body="gettingListRefresh2"
					stripe
					border>
					<el-table-column
						prop="fanghao"
						label="房屋"
						width="180">
					</el-table-column>
					<el-table-column label="今次(度)">
						<el-table-column
							prop="tnew.electric"
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
					<el-table-column label="前次(度)">
						<el-table-column
							prop="old.electric"
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
						label="小计(度)"
						width="110"
						sortable>
					</el-table-column>
					<el-table-column  label="计费">
						<el-table-column
							prop="calElectricResult"
							label="计费"
							width="180"
							sortable>
							<template scope="scope">
								<el-tag>{{ scope.row.fix ? '修' : '计' }}</el-tag>
								￥{{ scope.row.calElectricResult }}元
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
							label="计费备注"
							min-width="180">
							<template scope="scope">
								<el-popover
									placement="right"
									trigger="hover">
									<div>
										低消：{{ scope.row.calElectric.minPrice }}吨
									</div>
									<div v-if="scope.row.calElectric.calType == 'single'">
										单价：￥{{ scope.row.calElectric.singlePrice }}元/吨
									</div>
									<div class="electric-history-step-p-wrap" v-if="scope.row.calElectric.calType == 'step'">
										<div class="step-p-title">阶梯：</div>
										<div class="step-p-val">
											<div v-for="item in scope.row.calElectric.stepPrice">阶梯{{item.step}}度及以下￥{{item.price}}元/度</div>
										</div>
									</div>
									<div v-if="scope.row.calElectric.calType == 'step'">超过最后一个阶梯的部分将按照最后一个阶梯计费</div>
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
								v-model="scope.row.dCalElectricPopFlag">
								<p>确认删除计费记录吗？抄表历史收费历史等将不受影响，仅影响当前数据</p>
								<div class="house-list-d-house-pop-cont">
									<el-button size="mini" type="text" @click="scope.row.dCalElectricPopFlag = false">取消</el-button>
									<el-button type="danger" size="mini" @click="(scope.row.dCalElectricPopFlag = false) || delCalElectric(scope.$index, scope.row)">确定</el-button>
								</div>
								<div slot="reference" class="electric-show-pop">
									<el-button
										size="small"
										type="danger"
										:loading="scope.row.gettingdelCalElectric">删除</el-button>
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
		name: 'electric-history',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/electric/index')
		},
		created () {
			// this.getHouseDetail()
			this.activeName == 'electric' && this.getElectricList()
			this.activeName == 'electricCal' && this.getElectricCalList()
		},
		data () {
			return {
				gettingListRefresh: false,
				gettingListRefresh2: false,
				activeName: 'electric',
				houseData: {},
				houseNoData: false,

				electricList: [],
				electricDataSearch: '',
				electricCalList: [],
				electricCalDataSearch: '',

			}
		},
		computed: {
			filterElectricData () {
				if (!this.electricDataSearch) {
					return this.electricList
				} else {
					let _electricDataSearch = new RegExp(this.electricDataSearch, 'i')
					return this.electricList.filter((item)=>{
						for (var i in item) {
							if (i != 'fanghao' && i != 'electric' && i != 'remark') {
								continue
							} else if (String(item[i]).match(_electricDataSearch)) {
								return true
							}
						}
						return false
					})
				}
			},
			filterElectricCalData () {
				if (!this.electricCalDataSearch) {
					return this.electricCalList
				} else {
					let _electricCalDataSearch = new RegExp(this.electricCalDataSearch, 'i')
					return this.electricCalList.filter((item)=>{
						for (var i in item) {
							if (i != 'fanghao' && i != 'remark') {
								continue
							} else if (String(item[i]).match(_electricCalDataSearch)) {
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
				n == 'electric' && this.getElectricList()
				n == 'electricCal' && this.getElectricCalList()
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
			getElectricList () {
				if (this.gettingListRefresh) {
					return true
				}
				this.gettingListRefresh = true
				this.Ajax('/inner/electric/list', {haoId: this.$route.query.haoid}, (res)=>{
					this.electricList = res.body.data
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
			getElectricCalList () {
				if (this.gettingListRefresh2) {
					return true
				}
				this.gettingListRefresh2 = true
				this.Ajax('/inner/electric/calList', {haoId: this.$route.query.haoid}, (res)=>{
					this.electricCalList = res.body.data
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
			delElectric (index, row) {
				if (row.gettingdelElectric) {
					return true
				}
				row.gettingdelElectric = true
				this.Ajax('/inner/electric/del', {_id: row._id, haoId: row.haoId._id}, (res)=>{
					this.$message({
						type: 'success',
						message: '删除成功',
						duration: 2000
					})
					row.gettingdelElectric = false
					this.getElectricList()
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					row.gettingdelElectric = false
				})
			},
			delCalElectric (index, row) {
				if (row.gettingdelCalElectric) {
					return true
				}
				row.gettingdelCalElectric = true
				this.Ajax('/inner/electric/delCal', {_id: row._id, haoId: row.haoId._id}, (res)=>{
					this.$message({
						type: 'success',
						message: '删除成功',
						duration: 2000
					})
					row.gettingdelCalElectric = false
					this.getElectricCalList()
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					row.gettingdelCalElectric = false
				})
			}
		}
	}
</script>