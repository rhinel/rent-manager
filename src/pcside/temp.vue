
			<!-- <el-table-column
				prop="rent"
				label="当前月租金/更新时间"
				width="240"
				sortable>
				<template scope="scope"><span class="table-span">{{ scope.row.rent | rent }}<br>{{ getTime(scope.row.rentTime) }}</span><el-button
						size="small"
						type="primary"
						@click="editHouseRent(scope.$index, scope.row)">调整</el-button>
				</template>
			</el-table-column>
			<el-table-column
				prop="water"
				label="当前水表读数/抄表时间"
				width="240"
				sortable>
				<template scope="scope"><span class="table-span">{{ scope.row.water | numData }}<br>{{ getTime(scope.row.waterTime) }}</span><el-button
						size="small"
						type="primary"
						@click="editHouseWat(scope.$index, scope.row)">抄水表</el-button>
				</template>
			</el-table-column>
			<el-table-column
				prop="electric"
				label="当前电表读数/抄表时间"
				width="240"
				sortable>
				<template scope="scope"><span class="table-span">{{ scope.row.electric | numData }}<br>{{ getTime(scope.row.eleTime) }}</span><el-button
						size="small"
						type="primary"
						@click="editHouseEle(scope.$index, scope.row)">抄电表</el-button>
				</template>
			</el-table-column> -->
			<!-- <el-table-column
				prop="status"
				label="状态"
				sortable
				width="200">
				<template scope="scope"><span class="table-span">{{ getStatus(scope.row.status) }}</span><el-button
						size="small"
						type="primary"
						v-if="scope.row.status==1"
						@click="editHouseStatus(scope.$index, scope.row, 2)">入住</el-button><el-button
						size="small"
						type="primary"
						v-if="scope.row.status==2"
						@click="editHouseStatus(scope.$index, scope.row, 1)">搬走</el-button><el-button
						size="small"
						type="warning"
						v-if="scope.row.status==1"
						@click="editHouseStatus(scope.$index, scope.row, 3)">关闭</el-button><el-button
						size="small"
						type="warning"
						v-if="scope.row.status==3"
						@click="editHouseStatus(scope.$index, scope.row, 1)">启用</el-button>
				</template>
			</el-table-column> -->