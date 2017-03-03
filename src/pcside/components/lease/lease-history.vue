<style lang="scss">
	.lease-history{
		.table-btn{
			margin-bottom: 20px;
		}
		.table-btn-input{
			max-width: 300px;
			display: inline-block;
			margin-left: 10px;
		}
		.lease-show-tag{
			display: inline-block;
			vertical-align: middle;
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
	.lease-remark{
		max-width: 200px;
	}
</style>

<template>
	<div class="lease-history">
		<!-- 顶部按钮组 -->
		<div class="table-btn">
			<el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
			<div class="table-btn-input">
				<el-input v-model="leaseDataSearch" placeholder="搜索"></el-input>
			</div>
		</div>

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
				width="120">
			</el-table-column>
			<el-table-column label="租户信息">
				<el-table-column
					prop="name"
					label="姓名/联系方式"
					width="180">
					<template scope="scope">
						<div>{{ scope.row.name || '--' }}</div>
						<div>{{ scope.row.call || '--' }}</div>
					</template>
				</el-table-column>
				<el-table-column
					prop="leaseId.leaserange"
					label="租住周期"
					width="180">
					<template scope="scope">
						<div>{{ getTime(scope.row.leaserange && scope.row.leaserange[0]) }}</div>
						<div>{{ getTime(scope.row.leaserange && scope.row.leaserange[1]) }}</div>
					</template>
				</el-table-column>
				<el-table-column
					prop="leaseId.payDay"
					label="交租时间/交租方式"
					width="180">
					<template scope="scope">
						<div>{{ scope.row.payDay ? ('每月' + scope.row.payDay + '日') : '--' }}</div>
						<div>{{ payTypeVal[scope.row.payType] || '--' }}</div>
					</template>
				</el-table-column>
				<el-table-column
					prop="leaseId.remark"
					label="备注">
					<template scope="scope">
						<el-popover
							placement="right"
							trigger="hover">
							<div class="lease-remark">{{ scope.row.remark }}</div>
							<div slot="reference" class="lease-show-tag">
								<div class="lease-remark-tag">{{ scope.row.remark }}</div>
							</div>
						</el-popover>
					</template>
				</el-table-column>
				<el-table-column
					prop="leaseId.leaserange"
					label="入住-添加/搬出时间"
					width="180">
					<template scope="scope">
						<div>{{ getTime(scope.row.createTime) }}</div>
						<div>{{ getTime(scope.row.updateTime) }}</div>
					</template>
				</el-table-column>
			</el-table-column>
			<el-table-column
				label="计费信息">
				<el-table-column
					label="水费"
					width="180">
					<template scope="scope">
						<div v-if="scope.row.calWaterPrice">
							<div>低消：￥{{ scope.row.calWaterPrice.minPrice }}吨</div>
							<div v-if="scope.row.calWaterPrice.calType == 'single'">
								单价：￥{{ scope.row.calWaterPrice.singlePrice }}元/吨
							</div>
							<div v-else>
								<el-popover
									placement="right"
									trigger="hover">
									<div v-for="item in scope.row.calWaterPrice.stepPrice">{{item.step}}吨及以下￥{{item.price}}元/吨；</div>超出按最后阶梯计算。
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
						<div v-if="scope.row.calElePrice">
							<div>低消：￥{{ scope.row.calElePrice.minPrice }}度</div>
							<div v-if="scope.row.calElePrice.calType == 'single'">
								单价：￥{{ scope.row.calElePrice.singlePrice }}元/度
							</div>
							<div v-else>
								<el-popover
									placement="right"
									trigger="hover">
									<div v-for="item in scope.row.calElePrice.stepPrice">{{item.step}}度及以下￥{{item.price}}元/度；</div>超出按最后阶梯计算。
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
						<div>{{ '租金：￥' + (scope.row.rent || 0) + '元/月' }}</div>
						<div>{{ '押金：￥' + (scope.row.deposit || 0) + '元' }}</div>
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
							v-if="scope.row._id"
							v-model="scope.row.dLeasePopFlag">
							<p>确认已经结清所有费用？此行为不可撤销</p>
							<div class="lease-list-lease-o-pop-cont">
								<el-button size="mini" type="text" @click="scope.row.dLeasePopFlag = false">取消</el-button>
								<el-button type="danger" size="mini" @click="(scope.row.dLeasePopFlag = false) || delLease(scope.$index, scope.row)">确定</el-button>
							</div>
							<div slot="reference" class="lease-show-tag pop">
								<el-button
									size="small"
									type="danger"
									:loading="scope.row.gettingdelLease">删除</el-button>
							</div>
						</el-popover>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
	export default {
		name: 'lease-history',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/lease/index')
		},
		created () {
			this.getListRefresh()
		},
		data () {
			return {
				gettingListRefresh: false,
				payTypeVal: ['微信', '支付宝', '银行转账', '现金'],
				leaseList: [],
				leaseDataSearch: ''
			}
		},
		computed: {
			filterLeaseData () {
				if (!this.leaseDataSearch) {
					return this.leaseList
				} else {
					let _leaseDataSearch = new RegExp(this.leaseDataSearch, 'i')
					return this.leaseList.filter((item)=>{
						for (var i in item) {
							if (i != 'fanghao' && i != 'name'  && i != 'call' && i != 'remark') {
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
				this.Ajax('/inner/lease/list', {haoId: this.$route.query.haoid}, (res)=>{
					this.leaseList = res.body.data
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
			delLease (index, row) {
				if (row.gettingdelLease) {
					return true
				}
				row.gettingdelLease = true
				this.Ajax('/inner/lease/del', {_id: row._id}, (res)=>{
					this.$message({
						type: 'success',
						message: '删除成功',
						duration: 2000
					})
					row.gettingdelLease = false
					this.getListRefresh()
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					row.gettingdelLease = false
				})
			}
		}
	}
</script>