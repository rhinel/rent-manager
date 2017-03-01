<style lang="scss">
	.rent-month{
		.table-btn{
			margin-bottom: 20px;
		}
		.table-btn-input{
			max-width: 300px;
			display: inline-block;
			margin-left: 10px;
		}
		.add-month-det-dialog{
			.el-input{
				width: 100%;
				max-width: 300px;
			}
			.el-select{
				width: 100%;
				max-width: 300px;
			}
		}
		.month-det-show-pop{
			display: inline-block;
			margin-left: 10px;
		}
	}
	.month-det-d-rent-pop-cont{
		text-align: right;
		margin: 0;
	}
</style>

<template>
	<div class="rent-month">
		<!-- 顶部按钮组 -->
		<div class="table-btn">
			<el-button type="primary" @click="getListRefresh" :loading="gettingListRefresh">刷新</el-button>
			<div class="table-btn-input">
				<el-input v-model="monthDetSearch" placeholder="搜索"></el-input>
			</div>
		</div>

		<!-- 月周期图表 -->
		<el-table
			class="month-table"
			:data="filterMonthDetData"
			v-loading.body="gettingListRefresh"
			stripe
			border>
			<el-table-column
				prop="fanghao"
				label="房屋"
				width="180"
				sortable>
				<template scope="scope">
					<router-link :to="{ path: '/inner/rent/history', query: { id: scope.row._id }}">
						<el-button type="text">{{scope.row.fanghao}}</el-button>
					</router-link>
				</template>
			</el-table-column>
			<el-table-column
				label="计租信息">
			</el-table-column>
			<el-table-column
				label="操作"
				width="180">
				<template scope="scope">
					计租/状态/删除
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
	export default {
		name: 'rent-month',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/rent/index')
		},
		created () {
			this.getListRefresh()
		},
		data () {
			return {
				gettingListRefresh: false,


				monthDetData: [],
				monthDetSearch: '',
			}
		},
		computed: {
			filterMonthDetData () {
				if (!this.monthDetSearch) {
					return this.monthDetData
				} else {
					let _monthDetSearch = new RegExp(this.monthDetSearch, 'i')
					return this.monthDetData.filter((item)=>{
						for (var i in item) {
							if (i != 'fanghao' && i != 'remark') {
								continue
							} else if (String(item[i]).match(_monthDetSearch)) {
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
				this.Ajax('/inner/rent/listByMonth', {
					monthId: this.$route.query.id
				}, (res)=>{
					this.monthDetData = res.body.data
					this.gettingListRefresh = false
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
					this.gettingListRefresh = false
				})
			}
		}
	}
</script>