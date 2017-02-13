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
					label="姓名/联系方式"
					width="180">
				</el-table-column>
				<el-table-column
					label="交租时间"
					width="180">
				</el-table-column>
				<el-table-column
					label="交租方式"
					width="180">
				</el-table-column>
				<el-table-column
					label="备注">
				</el-table-column>
			</el-table-column>
			<el-table-column
				label="计费信息">
				<el-table-column
					label="水费"
					width="180">
				</el-table-column>
				<el-table-column
					label="电费"
					width="180">
				</el-table-column>
				<el-table-column
					label="押金"
					width="180">
				</el-table-column>
			</el-table-column>
			<el-table-column
				label="操作"
				width="180">
				<template scope="scope">
					<el-button
						size="small"
						type="primary"
						@click="getLeaseHistory(scope.$index, scope.row)">历史</el-button>
					<el-button
						size="small"
						type="primary"
						@click="getLeaseInDialog(scope.$index, scope.row)">入住</el-button>
					<el-button
						size="small"
						type="primary"
						@click="getLeaseOutDialog(scope.$index, scope.row)">搬出</el-button>
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
			return {
				gettingListRefresh: false,
				leaseData: [],
				leaseDataSearch: '',
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
			getLeaseHistory (index, row) {

			},
			getLeaseInDialog (index, row) {

			},
			getLeaseOutDialog (index, row) {

			}
		}
	}
</script>