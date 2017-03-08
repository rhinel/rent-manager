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
		}
		.note-dialog{
			.el-row{
				margin-bottom: 0;
			}
			.el-input, .el-select{
				width: 100%;
			}
		}
	}
</style>

<template>
	<div class="dashboard-main">
		<!-- 记事本弹窗 -->
		<el-dialog :title="ndDialogTitle" v-model="noteflag" size="small" top="50px" class="note-dialog" :close-on-click-modal="false" @close="onNoteDialogClose">
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
			<el-col :span="18" :xs="24">
				<el-row>
					<el-card class="count-wrap" v-loading.body="gettingCount">
						<div class="count">
							<div>房屋总数</div>
							<span>{{countDown.houseCount || 0}}</span>
							<span>户</span>
						</div>
						<div class="count">
							<div>待收租金</div>
							<span>0</span>
							<span>户</span>
						</div>
						<div class="count">
							<div>待交房东</div>
							<span>0</span>
							<span>户</span>
						</div>
					</el-card>
				</el-row>
				<el-row>
					<el-card>
						<div slot="header">
							<span class="card-header">待收租金列表</span>
							<el-button class="card-btn" type="primary" :loading="gettingRentList">刷新</el-button>
						</div>
						<el-table
							class="rent-list-table"
							:data="rentList"
							v-loading.body="gettingRentList"
							stripe>
							<el-table-column
								prop="fanghao"
								label="房屋"
								width="180"
								sortable>
							</el-table-column>
							<el-table-column
								prop="fanghao"
								label="房租"
								width="180"
								sortable>
							</el-table-column>
							<el-table-column
								prop="fanghao"
								label="租户信息">
							</el-table-column>
						</el-table>
					</el-card>
				</el-row>
				<el-row>
					<el-card>
						<div slot="header">
							<span class="card-header">待交租金列表</span>
							<el-button class="card-btn" type="primary" :loading="gettingRentList2">刷新</el-button>
						</div>
						<el-table
							class="rent-list-table"
							:data="rentList2"
							v-loading.body="gettingRentList2"
							stripe>
							<el-table-column
								prop="fanghao"
								label="房屋"
								width="180"
								sortable>
							</el-table-column>
							<el-table-column
								prop="fanghao"
								label="房租"
								width="180"
								sortable>
							</el-table-column>
							<el-table-column
								prop="fanghao"
								label="租户信息">
							</el-table-column>
						</el-table>
					</el-card>
				</el-row>
			</el-col>
			<el-col :span="6" :xs="24">
				<el-row>
					<el-card class="detail-wrap" v-loading.body="gettingNotes">
						<div slot="header">
							<span class="card-header">记事本</span>
							<el-button class="card-btn" type="primary" @click="getNoteAddDialog">添加</el-button>
						</div>
						<ul class="card-list">
							<li v-for="(item, index) in noteList" :class="{'done': item.status == 2}">
								<span>[{{ item.haoId.fang + item.haoId.hao }}]</span>
								<el-button type="text" class="card-list-item" @click="getNoteAddDialog(index, item)">{{ item.content }}</el-button>
								<span>[{{ getDate(item.addTime) }}]</span>
							</li>
						</ul>
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
			this.getCount()
			this.getHouseList()
			this.getNotes()
			this.getNoteReset()
		},
		data () {
			return {
				//获取统计和数据列表
				gettingRentList: false,
				gettingRentList2: false,
				gettingCount: false,
				count: {
					houseCount: 0
				},
				countDown: {
					houseCount: 0
				},
				rentList: [],
				rentList2: [],
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
		watch: {
			'count.houseCount' (n, o) {
				let _this = this
				function animate (time) {
					requestAnimationFrame(animate)
					TWEEN.update(time)
				}
				new TWEEN.Tween({ tweeningValue: o })
				.to({ tweeningValue: n }, 200)
				.onUpdate(function () {
					_this.countDown.houseCount = this.tweeningValue.toFixed(0)
				})
				.start()
				animate()
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