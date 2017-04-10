<style lang="scss">
	.dashboard-main{
		.el-row{
			margin-bottom: 20px;
		}
		.el-card__header{
			position: relative;
		}
		.card-header{
			font-weight: bold;
		}
		.card-btn{
			position: absolute;
			top: 50%;
			right: 20px;
			transform: translateY(-50%);
		}
		.count-wrap .el-card__body{
			display: flex;
			justify-content: space-around;
		}
		.count{
			padding: 10px 0;
			text-align: center;
			& > div {
				padding-top: 10px;
				padding-bottom: 10px;
			}
			& > span:first-of-type{
				font-size: 48px;
			}
		}
		.detail-wrap{
			.card-list{
				list-style: none;
			    padding: 0;
			    margin: -10px 0;
			    & > li{
					display: flex;
					&.done{
						text-decoration:line-through;
						color: #bfcbd9;
					}
					& > span{
						padding: 10px 0;
						display: inline-block;
					}
					.card-list-item{
						flex: 1;
						white-space:nowrap;
						overflow:hidden;
						text-overflow:ellipsis;
						text-align: left;
					}
			    }
			}
			.card-nodata{
				color: #5e7382;
				text-align: center;
				line-height: 20px;
			}
			.detail-content{
				line-height: 2;
				margin: -7px 0;
			}
		}
		.note-dialog{
			max-width: 800px;
			.el-row{
				margin-bottom: 0;
			}
			.el-input, .el-select{
				width: 100%;
			}
		}
		.rent-list-table{
			// 信息悬浮窗样式
			.tag-bf-span{
				display: inline-block;
				vertical-align: middle;
			}
			.tag-bf-span + *{
				display: inline-block;
				vertical-align: middle;
			}
			.rent-show-tag{
				cursor: pointer;
				&.pop {
					margin-left: 10px;
				}
			}
			.rent-show-tag2{
				display: inline-block;
				vertical-align: middle;
			}
			.rent-show-tag3{
				margin-right: 4px;
				display: inline-block;
				vertical-align: middle;
			}
			.rent-remark-tag{
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}
		}
	}
</style>

<template>
	<div class="dashboard-main">
		<!-- 记事本弹窗 -->
		<el-dialog :title="ndDialogTitle" v-model="noteflag" size="large" top="50px" custom-class="note-dialog" :close-on-click-modal="false" @close="onNoteDialogClose">
			<el-form :model="note" ref="note" :rules="noterules" label-position="top">
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="房屋" :label-width="ndLabelWidth" prop="haoId">
							<el-select v-model="note.haoId" placeholder="选择房屋" :filterable="true">
								<el-option v-for="item in houseData" :label="item.fang + item.hao" :value="item._id"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="记事时间" :label-width="ndLabelWidth" prop="addTime">
							<el-date-picker v-model="note.addTime" type="datetime" placeholder="输入记事时间" :editable="false"></el-date-picker>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="内容" :label-width="ndLabelWidth">
					<el-input
						type="textarea"
						:rows="4"
						placeholder="请输入内容"
						v-model="note.content">
					</el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="getNoteAddDialog" :loading="gettingAddNote">取消</el-button>
				<el-button type="primary" @click="getAddNote" :loading="gettingAddNote">保存</el-button>
				<el-button type="success" @click="getAddNote(2)" :loading="gettingAddNote" v-if="editNoteId && note.status == 1">完成</el-button>
				<el-button type="success" @click="getAddNote(1)" :loading="gettingAddNote" v-if="editNoteId && note.status == 2">重做</el-button>
				<el-button type="danger" @click="getAddNote(0)" :loading="gettingAddNote" v-if="editNoteId">删除</el-button>
			</div>
		</el-dialog>

		<el-row :gutter="20">
			<el-col :span="18" :md="16" :xs="24" :lg="18">
				<el-row>
					<el-card class="count-wrap" v-loading.body="gettingCount">
						<div class="count">
							<div>房屋总数</div>
							<span>{{countDown.houseCount}}</span>
							<span>户</span>
						</div>
						<div class="count">
							<div>待收租金</div>
							<span>{{countDown.rentList1Count}}</span>
							<span>户</span>
						</div>
						<div class="count">
							<div>待交房东</div>
							<span>{{countDown.rentList3Count}}</span>
							<span>户</span>
						</div>
					</el-card>
				</el-row>
				<el-row>
					<el-card>
						<div slot="header">
							<span class="card-header">待收租金列表</span>
							<el-button class="card-btn" type="primary" :loading="gettingRentList1" @click="getList(1)">刷新</el-button>
						</div>
						<el-table
							class="rent-list-table"
							:data="rentList1"
							v-loading.body="gettingRentList1"
							stripe>
							<el-table-column
								prop="monthId.month"
								label="周期"
								width="120"
								sortable>
								<template scope="scope">
									<router-link :to="{ path: '/inner/rent/month', query: { id: scope.row.monthId._id }}">
										<el-button type="text">{{scope.row.monthId.month}}</el-button>
									</router-link>
								</template>
							</el-table-column>
							<el-table-column
								prop="fanghao"
								label="房屋"
								width="180"
								sortable>
								<template scope="scope">
									<router-link :to="{ path: '/inner/rent/history', query: { id: scope.row.haoId }}">
										<el-button type="text">{{scope.row.fanghao}}</el-button>
									</router-link>
								</template>
							</el-table-column>
							<el-table-column
								prop="calRentResult"
								label="房租/计费时间"
								width="180"
								sortable>
								<template scope="scope">
									<div>
										<el-tag>{{scope.row.fix ? '修' : '计'}}</el-tag>
										<span>￥{{scope.row.calRentResult}}元</span>
									</div>
									<div>{{getDate(scope.row.addTime)}}</div>
								</template>
							</el-table-column>
							<el-table-column
								label="租户信息"
								width="180">
								<template scope="scope">
									<div v-if="scope.row.lease.name">
										<el-tag class="tag-bf-span">{{scope.row.lease.payDay}}日</el-tag>
										<el-popover
											placement="top"
											trigger="hover">
											<div>姓名：{{scope.row.lease.name}}</div>
											<div>联系方式：{{scope.row.lease.call}}</div>
											<div>房租：￥{{scope.row.lease.rent}}元</div>
											<div>租住起始：{{getDate(scope.row.lease.leaserange[0])}}</div>
											<div>租住结束：{{getDate(scope.row.lease.leaserange[1])}}</div>
											<div>入住时间：{{getDate(scope.row.lease.addTime)}}</div>
											<div>搬出时间：{{getDate(scope.row.lease.outTime)}}</div>						
											<div>备注：{{scope.row.lease.remark || '--'}}</div>
											<div slot="reference" class="rent-show-tag">
												<el-tag>{{payTypeVal[scope.row.lease.payType]}}</el-tag>
											</div>
										</el-popover>
									</div>
									<div v-if="!scope.row.lease.name">
										暂无
									</div>
								</template>
							</el-table-column>
							<el-table-column
								label="状态/更新时间"
								width="180">
								<template scope="scope">
									<div v-if="scope.row.type">
										<el-popover
											placement="top"
											trigger="hover"
											 v-for="item in scope.row.type.type">
											<div class="rent-remark">{{ getDate(scope.row.type.typeTime[item]) }}</div>
											<div slot="reference" class="rent-show-tag rent-show-tag3">
												<el-tag>{{typesVal[item]}}</el-tag>
											</div>
										</el-popover>
									</div>
									<el-tag v-if="scope.row.type && !scope.row.type.type.length || !scope.row.type">新建</el-tag>
									<div>{{getDate(scope.row.updateTime)}}</div>
								</template>
							</el-table-column>
							<el-table-column
								label="备注"
								min-width="180">
								<template scope="scope">
									<el-popover
										placement="top"
										trigger="hover">
										<div class="rent-remark">{{ scope.row.remark }}</div>
										<div slot="reference" class="rent-show-tag rent-show-tag2">
											<div class="rent-remark-tag">{{ scope.row.remark }}</div>
										</div>
									</el-popover>
								</template>
							</el-table-column>
						</el-table>
					</el-card>
				</el-row>
				<el-row>
					<el-card>
						<div slot="header">
							<span class="card-header">待交房东列表</span>
							<el-button class="card-btn" type="primary" :loading="gettingRentList3" @click="getList(3)">刷新</el-button>
						</div>
						<el-table
							class="rent-list-table"
							:data="rentList3"
							v-loading.body="gettingRentList3"
							stripe>
							<el-table-column
								prop="monthId.month"
								label="周期"
								width="120"
								sortable>
								<template scope="scope">
									<router-link :to="{ path: '/inner/rent/month', query: { id: scope.row.monthId._id }}">
										<el-button type="text">{{scope.row.monthId.month}}</el-button>
									</router-link>
								</template>
							</el-table-column>
							<el-table-column
								prop="fanghao"
								label="房屋"
								width="180"
								sortable>
								<template scope="scope">
									<router-link :to="{ path: '/inner/rent/history', query: { id: scope.row.haoId }}">
										<el-button type="text">{{scope.row.fanghao}}</el-button>
									</router-link>
								</template>
							</el-table-column>
							<el-table-column
								prop="calRentResult"
								label="房租/计费时间"
								width="180"
								sortable>
								<template scope="scope">
									<div>
										<el-tag>{{scope.row.fix ? '修' : '计'}}</el-tag>
										<span>￥{{scope.row.calRentResult}}元</span>
									</div>
									<div>{{getDate(scope.row.addTime)}}</div>
								</template>
							</el-table-column>
							<el-table-column
								label="租户信息"
								width="180">
								<template scope="scope">
									<div v-if="scope.row.lease.name">
										<el-tag class="tag-bf-span">{{scope.row.lease.payDay}}日</el-tag>
										<el-popover
											placement="top"
											trigger="hover">
											<div>姓名：{{scope.row.lease.name}}</div>
											<div>联系方式：{{scope.row.lease.call}}</div>
											<div>房租：￥{{scope.row.lease.rent}}元</div>
											<div>租住起始：{{getDate(scope.row.lease.leaserange[0])}}</div>
											<div>租住结束：{{getDate(scope.row.lease.leaserange[1])}}</div>
											<div>入住时间：{{getDate(scope.row.lease.addTime)}}</div>
											<div>搬出时间：{{getDate(scope.row.lease.outTime)}}</div>						
											<div>备注：{{scope.row.lease.remark || '--'}}</div>
											<div slot="reference" class="rent-show-tag">
												<el-tag>{{payTypeVal[scope.row.lease.payType]}}</el-tag>
											</div>
										</el-popover>
									</div>
									<div v-if="!scope.row.lease.name">
										暂无
									</div>
								</template>
							</el-table-column>
							<el-table-column
								label="状态/更新时间"
								width="180">
								<template scope="scope">
									<div v-if="scope.row.type">
										<el-popover
											placement="top"
											trigger="hover"
											 v-for="item in scope.row.type.type">
											<div class="rent-remark">{{ getDate(scope.row.type.typeTime[item]) }}</div>
											<div slot="reference" class="rent-show-tag rent-show-tag3">
												<el-tag>{{typesVal[item]}}</el-tag>
											</div>
										</el-popover>
									</div>
									<el-tag v-if="scope.row.type && !scope.row.type.type.length || !scope.row.type">新建</el-tag>
									<div>{{getDate(scope.row.updateTime)}}</div>
								</template>
							</el-table-column>
							<el-table-column
								label="备注"
								min-width="180">
								<template scope="scope">
									<el-popover
										placement="top"
										trigger="hover">
										<div class="rent-remark">{{ scope.row.remark }}</div>
										<div slot="reference" class="rent-show-tag rent-show-tag2">
											<div class="rent-remark-tag">{{ scope.row.remark }}</div>
										</div>
									</el-popover>
								</template>
							</el-table-column>
						</el-table>
					</el-card>
				</el-row>
			</el-col>
			<el-col :span="6" :md="8" :xs="24" :lg="6">
				<el-row>
					<el-card class="detail-wrap" v-loading.body="gettingNotes">
						<div slot="header">
							<span class="card-header">记事本</span>
							<el-button class="card-btn" type="primary" @click="getNoteAddDialog">添加</el-button>
						</div>
						<ul class="card-list" v-show="noteList.length">
							<li v-for="(item, index) in noteList" :class="{'done': item.status == 2}">
								<span>[{{ item.haoId.fang + item.haoId.hao }}]</span>
								<el-button type="text" class="card-list-item" @click="getNoteAddDialog(index, item)">{{ item.content }}</el-button>
								<span>[{{ getDate(item.addTime) }}]</span>
							</li>
						</ul>
						<div class="card-nodata" v-show="!noteList.length">
							暂无数据
						</div>
					</el-card>
				</el-row>
				<el-row>
					<el-card class="detail-wrap">
						<div slot="header">
							<span class="card-header">操作说明</span>
						</div>
						<div class="detail-content">
							业务一：房屋管理<br>
							1、房屋添加修改删除<br>
							业务二：收租/租住管理<br>
							1、抄数：水电，信息更新<br>
							2、计费：水电（非周期，每次按照计费信息结算），每次收租一个租户（或空置）针对一个计费<br>
							（中途缴费水电的情况先抄表，写备注在抄表信息中，不计费，计费时候收差额）<br>
							3、收租：房租（周期，周期内可多次），周期内可有多个租户，多次收租（计费来源）<br>
							4、搬出入住/修改：计费信息初始化，必须为上次收租结束/空置处理结束/本次计费之前，用户自行确认<br>
							备注：空置作计费处理，不收租
						</div>
					</el-card>
				</el-row>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import TWEEN from 'tween.js'

	export default {
		name: 'dashboard-main',
		beforeCreate () {
			this.$store.dispatch('updateMenu', '/inner/dashboard/index')
		},
		created () {
			// this.getCount()
			this.getList(1)
			this.getList(3)
			this.getHouseList()
			this.getNotes()
			this.getNoteReset()
		},
		data () {
			return {
				//获取统计和数据列表
				gettingRentList1: false,
				gettingRentList3: false,
				gettingCount: false,
				count: {
					houseCount: 0,
					rentList1Count: 0,
					rentList3Count: 0
				},
				countDown: {
					houseCount: 0,
					rentList1Count: 0,
					rentList3Count: 0
				},
				rentList1: [],
				rentList3: [],
				//添加记事
				gettingAddNote: false,
				houseData: [],
				ndDialogTitle: '添加记事',
				ndLabelWidth: '90px',
				noteflag: false,
				note: {
					haoId: '',
					content: '',
					addTime: '',
					status: 1
				},
				editNoteId: '',
				noterules: {
					'haoId': [{ required: true, message: '请选择', trigger: 'change' }],
					'addTime': [{ type: 'date', required: true, message: '请填写', trigger: 'change' }]
				},
				//记事列表
				gettingNotes: false,
				noteList: []
			}
		},
		computed: {
			payTypeVal () {
				return this.$store.state.default.payTypeVal
			},
			typesVal () {
				return this.$store.state.default.typesVal
			}
		},
		watch: {
			'count.houseCount' (n, o) {
				this.onCount('houseCount', n, o)
			},
			'count.rentList1Count' (n, o) {
				this.onCount('rentList1Count', n, o)
			},
			'count.rentList3Count' (n, o) {
				this.onCount('rentList3Count', n, o)
			}
		},
		methods: {
			getCount () {
				if (this.gettingCount) {
					return true
				}
				this.gettingCount = true
				this.Ajax('/inner/dash/count', {}, (res)=>{
					this.gettingCount = false
					this.count = res.body.data
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
				})
			},
			getList (type) {
				if (this['gettingRentList' + type]) {
					return true
				}
				this['gettingRentList' + type] = true
				this.Ajax('/inner/dash/waitingList', {
					type: type
				}, (res)=>{
					this['gettingRentList' + type] = false
					this['rentList' + type] = res.body.data
					this.count['rentList' + type + 'Count'] = this['rentList' + type].length
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
				})
			},
			onCount (type, n, o) {
				let _this = this
				function animate (time) {
					requestAnimationFrame(animate)
					TWEEN.update(time)
				}
				new TWEEN.Tween({ tweeningValue: o })
				.to({ tweeningValue: n }, 200)
				.onUpdate(function () {
					_this.countDown[type] = this.tweeningValue.toFixed(0)
				})
				.start()
				animate()
			},
			getHouseList () {
				this.Ajax('/inner/house/list', {}, (res)=>{
					this.houseData = res.body.data
					this.count.houseCount = this.houseData.length
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
				})
			},
			getNoteAddDialog (index, row) {
				this.noteflag = !this.noteflag
				if (this.noteflag && row) {
					this.note.haoId = row.haoId._id
					this.note.content = row.content
					this.note.addTime = new Date(row.addTime)
					this.note.status = row.status
					this.editNoteId = row._id
				} else {
					this.note.addTime = new Date()
				}
			},
			getNoteReset () {
				this.note.haoId = ''
				this.note.content = ''
				this.note.status = 1
				this.editNoteId = ''
				this.note.addTime = ''
			},
			onNoteDialogClose () {
				this.$refs.note.resetFields()
				this.getNoteReset()
			},
			getNotes () {
				if (this.gettingNotes) {
					return true
				}
				this.gettingNotes = true
				this.Ajax('/inner/dash/notes', {}, (res)=>{
					this.gettingNotes = false
					this.noteList = res.body.data
				}, (res)=>{
					this.$message({
						type: 'error',
						message: '编号：' + res.body.code + '，' + res.body.msg,
						duration: 2000
					})
				})
			},
			getDate (t) {
				if (t) {
					return new Date(t).toLocaleDateString()
				} else {
					return '--'
				}
			},
			getAddNote (type) {
				if (this.gettingAddNote) {
					return true
				}
				this.gettingAddNote = true
				this.$refs.note.validate((valid)=>{
					if (valid) {
						let _data = Object.assign({}, this.note)
						this.editNoteId && (_data._id = this.editNoteId)
						type !== undefined && (_data.status = type) 
						this.Ajax('/inner/dash/addNote', _data, (res)=>{
							this.$message({
								type: 'success',
								message: this.editNoteId? '修改成功' : '添加成功',
								duration: 2000
							})
							this.getNoteAddDialog()
							this.gettingAddNote = false
							this.getNotes()
						}, (res)=>{
							this.$message({
								type: 'error',
								message: '编号：' + res.body.code + '，' + res.body.msg,
								duration: 2000
							})
							this.gettingAddNote = false
						})
					} else {
						this.gettingAddNote = false
					}
				})
			},
			getChangeNoteType (type) {
				if (this.gettingAddNote) {
					return true
				}
				this.gettingAddNote = true
			}
		}
	}
</script>