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
				max-width: 300px;
			}
			.el-select{
				width: 100%;
				max-width: 300px;
			}
		}
		.month-list-show-pop{
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
	</div>
</template>

<script>
	export default {
		name: 'rent-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/rent/index')
		},
		data () {
			return {
				gettingListRefresh: false,
				MonthListSearch: ''
			}
		},
		methods: {
			getAddMonthListDialog () {

			},
			getListRefresh () {

			}
		}
	}
</script>