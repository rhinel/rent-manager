<template>
  <div class="dashboard-main">
    <!-- 记事本弹窗 -->
    <el-dialog
      custom-class="note-dialog"
      top="50px"
      :key="'note' + dialogId"
      :title="ndDialogTitle"
      :visible.sync="noteflag"
      :close-on-click-modal="false"
      @close="onNoteDialogClose">
      <el-form
        label-position="top"
        ref="note"
        :model="note"
        :rules="noteRules">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="房屋"
              prop="haoId"
              :label-width="ndLabelWidth">
              <el-select
                placeholder="选择房屋"
                v-model="note.haoId"
                :filterable="true">
                <el-option
                  v-for="item in houseData"
                  :label="item.fang + item.hao"
                  :value="item._id"
                  :key="item._id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col
            :span="12">
            <el-form-item
              label="记事时间"
              prop="addTime"
              :label-width="ndLabelWidth">
              <el-date-picker
                type="datetime"
                placeholder="输入记事时间"
                v-model="note.addTime"
                :editable="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="内容"
          :label-width="ndLabelWidth">
          <el-input
            type="textarea"
            placeholder="请输入内容"
            :rows="4"
            v-model="note.content" />
        </el-form-item>
      </el-form>

      <div
        class="dialog-footer"
        slot="footer">
        <el-button
          :loading="gettingAddNote"
          @click="getNoteAddDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="gettingAddNote"
          @click="getAddNote">
          保存
        </el-button>
        <el-button
          type="success"
          v-if="note._id && note.status === 1"
          :loading="gettingAddNote"
          @click="getAddNote(2)">
          完成
        </el-button>
        <el-button
          type="success"
          v-if="note._id && note.status === 2"
          :loading="gettingAddNote"
          @click="getAddNote(1)">
          重做
        </el-button>
        <el-button
          type="danger"
          v-if="note._id"
          :loading="gettingAddNote"
          @click="getAddNote(0)">
          删除
        </el-button>
      </div>
    </el-dialog>

    <el-row
      class="main-wrap"
      :gutter="20">
      <el-col
        :span="18"
        :md="16"
        :xs="24"
        :lg="18">
        <el-row>
          <el-card
            v-loading.body="gettingCount"
            class="count-wrap">
            <div class="count">
              <div>房屋总数</div>
              <span>{{ countDown.houseCount }}</span>
              <span>户</span>
            </div>
            <div class="count">
              <div>待收租金</div>
              <span>{{ countDown.rentList1Count }}</span>
              <span>户</span>
            </div>
            <div class="count">
              <div>待交房东</div>
              <span>{{ countDown.rentList3Count }}</span>
              <span>户</span>
            </div>
          </el-card>
        </el-row>

        <el-row>
          <el-card>
            <div slot="header">
              <span class="card-header">
                待收租金列表
              </span>
              <el-button
                class="card-btn"
                type="primary"
                :loading="gettingRentList1"
                @click="getList(1)">
                刷新
              </el-button>
            </div>
            <el-table
              v-loading.body="gettingRentList1"
              class="rent-list-table"
              stripe
              border
              :max-height="500"
              :data="rentList1">
              <el-table-column
                prop="monthId.month"
                label="周期"
                width="120">
                <template slot-scope="scope">
                  <router-link
                    :to="{
                      path: '/inner/rent/month',
                      query: { id: scope.row.monthId._id }
                    }">
                    <el-button type="text">
                      {{ scope.row.monthId.month }}
                    </el-button>
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column
                prop="fanghao"
                label="房屋"
                width="120">
                <template slot-scope="scope">
                  <router-link
                    :to="{
                      path: '/inner/rent/history',
                      query: { id: scope.row.haoId }
                    }">
                    <el-button type="text">
                      {{ scope.row.fanghao }}
                    </el-button>
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column
                prop="calRentResult"
                label="房租/计费时间"
                width="180">
                <template slot-scope="scope">
                  <table-rent-view-item
                    :rent="scope.row"/>
                </template>
              </el-table-column>
              <el-table-column
                label="租户信息"
                width="180">
                <template slot-scope="scope">
                  <table-lease-view-item
                    rent-inline
                    :lease="scope.row.lease" />
                </template>
              </el-table-column>
              <el-table-column
                label="状态/更新时间"
                width="180">
                <template slot-scope="scope">
                  <table-rent-type-item
                    :rent="scope.row" />
                </template>
              </el-table-column>
              <el-table-column
                label="备注"
                min-width="140">
                <template slot-scope="scope">
                  <table-rent-remark-item
                    :rent="scope.row" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-row>

        <el-row>
          <el-card>
            <div slot="header">
              <span class="card-header">
                待交房东列表
              </span>
              <el-button
                class="card-btn"
                type="primary"
                :loading="gettingRentList3"
                @click="getList(3)">
                刷新
              </el-button>
            </div>
            <el-table
              v-loading.body="gettingRentList3"
              stripe
              border
              class="rent-list-table"
              :max-height="500"
              :data="rentList3">
              <el-table-column
                prop="monthId.month"
                label="周期"
                width="120">
                <template slot-scope="scope">
                  <router-link
                    :to="{
                      path: '/inner/rent/month',
                      query: { id: scope.row.monthId._id }
                    }">
                    <el-button type="text">
                      {{ scope.row.monthId.month }}
                    </el-button>
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column
                prop="fanghao"
                label="房屋"
                width="120">
                <template slot-scope="scope">
                  <router-link
                    :to="{
                      path: '/inner/rent/history',
                      query: { id: scope.row.haoId }
                    }">
                    <el-button type="text">
                      {{ scope.row.fanghao }}
                    </el-button>
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column
                prop="calRentResult"
                label="房租/计费时间"
                width="180">
                <template slot-scope="scope">
                  <table-rent-view-item
                    :rent="scope.row"/>
                </template>
              </el-table-column>
              <el-table-column
                label="租户信息"
                width="180">
                <template slot-scope="scope">
                  <table-lease-view-item
                    rent-inline
                    :lease="scope.row.lease" />
                </template>
              </el-table-column>
              <el-table-column
                label="状态/更新时间"
                width="180">
                <template slot-scope="scope">
                  <table-rent-type-item
                    :rent="scope.row" />
                </template>
              </el-table-column>
              <el-table-column
                label="备注"
                min-width="140">
                <template slot-scope="scope">
                  <table-rent-remark-item
                    :rent="scope.row" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-row>
      </el-col>

      <el-col
        :span="6"
        :md="8"
        :xs="24"
        :lg="6">
        <el-row>
          <el-card
            v-loading.body="gettingNotes"
            class="detail-wrap">
            <div slot="header">
              <span class="card-header">
                记事本
              </span>
              <el-button
                class="card-btn"
                type="primary"
                @click="getNoteAddDialog">
                添加
              </el-button>
            </div>
            <ul
              class="card-list"
              v-show="noteList.length">
              <li
                v-for="(item, index) in noteList"
                :class="{ 'done': item.status == 2 }"
                :key="item._id">
                <span>[{{ item.haoId.fang + item.haoId.hao }}]</span>
                <el-button
                  class="card-list-item"
                  type="text"
                  @click="getNoteAddDialog(index, item)">
                  {{ item.content }}
                </el-button>
                <span>[{{ getDate(item.addTime) }}]</span>
              </li>
            </ul>
            <div
              class="card-nodata"
              v-show="!noteList.length">
              暂无数据
            </div>
          </el-card>
        </el-row>

        <el-row>
          <el-card class="detail-wrap">
            <div slot="header">
              <span class="card-header">
                操作说明
              </span>
            </div>
            <div class="detail-content">
              <b>业务一：房屋管理</b><br>
              1、房屋添加、修改、删除。<br>
              <b>业务二：水电管理</b><br>
              1、抄数：水电、信息更新。<br>
              2、计费：水电计费可调整计费参数。<br>
              3、中途搬入搬出可只进行计费，更新表底信息。<br>
              <b>业务三：收租</b><br>
              1、收租：房租（周期，周期内可多次），周期内可有多个租户，多次收租，计租必须先进行水电计费（或空计），可调整计费情况。<br>
              2、搬出入住/修改：计费信息初始化，必须为上次收租结束/空置处理结束/本次计费之前，用户自行确认。<br>
              3、空置作计费处理，不收租。
            </div>
          </el-card>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import TWEEN from '@tweenjs/tween.js'
  import TableRentViewItem from 'pcside/common/table-rent-view-item'
  import TableLeaseViewItem from 'pcside/common/table-lease-view-item'
  import TableRentTypeItem from 'pcside/common/table-rent-type-item'
  import TableRentRemarkItem from 'pcside/common/table-rent-remark-item'

  export default {
    name: 'DashboardMain',
    components: {
      TableRentViewItem,
      TableLeaseViewItem,
      TableRentTypeItem,
      TableRentRemarkItem,
    },
    data() {
      return {
        // 获取统计和数据列表
        gettingRentList1: false,
        gettingRentList3: false,
        gettingCount: false,
        count: {
          houseCount: 0,
          rentList1Count: 0,
          rentList3Count: 0,
        },
        countDown: {
          houseCount: 0,
          rentList1Count: 0,
          rentList3Count: 0,
        },
        rentList1: [],
        rentList3: [],
        // 添加记事
        dialogId: Date.now(),
        gettingAddNote: false,
        houseData: [],
        ndDialogTitle: '添加记事',
        ndLabelWidth: '90px',
        noteflag: false,
        note: {},
        noteClear: {
          _id: '',
          haoId: '',
          content: '',
          addTime: '',
          status: 1,
        },
        noteRules: {
          haoId: [
            {
              required: true, message: '请选择', trigger: 'change',
            },
          ],
          addTime: [
            {
              required: true, type: 'date', message: '请填写', trigger: 'change',
            },
          ],
        },
        // 记事列表
        gettingNotes: false,
        noteList: [],
      }
    },
    watch: {
      /* eslint object-shorthand: 0 */
      'count.houseCount'(n, o) {
        this.onCount('houseCount', n, o)
      },
      'count.rentList1Count'(n, o) {
        this.onCount('rentList1Count', n, o)
      },
      'count.rentList3Count'(n, o) {
        this.onCount('rentList3Count', n, o)
      },
    },
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/dashboard/index')
    },
    created() {
      this.getCount()
      this.getList(1)
      this.getList(3)
      this.getHouseList()
      this.getNotes()
      this.getNoteReset()
    },
    methods: {
      // 获取计数
      async getCount() {
        if (this.gettingCount) return

        // 接口提交
        this.gettingCount = true

        await this.Ajax('/inner/dash/count')
          .then(res => {
            requestAnimationFrame(() => {
              this.count.houseCount = res.houseCount
            })
          })
          .catch(() => {})

        this.gettingCount = false
      },
      // 获取各种列表和计数
      async getList(type) {
        if (this[`gettingRentList${type}`]) return

        // 接口提交
        this[`gettingRentList${type}`] = true

        await this.Ajax('/inner/dash/waitingList', {
          type: type,
        })
          .then(res => {
            this[`rentList${type}`] = res.data
            requestAnimationFrame(() => {
              this.count[`rentList${type}Count`] = res.data.length
            })
          })
          .catch(() => {})

        this[`gettingRentList${type}`] = false
      },
      // 计数动画
      onCount(type, n, o) {
        const _this = this
        const _tweeningValue = { tweeningValue: o }
        function animate(time) {
          requestAnimationFrame(animate)
          TWEEN.update(time)
        }
        new TWEEN.Tween(_tweeningValue)
          .to({ tweeningValue: n }, 1000)
          .onUpdate(() => {
            _this.countDown[type] = _tweeningValue.tweeningValue.toFixed(0)
          })
          .start()
        animate()
      },
      // 弹窗状态和数据更新
      getNoteAddDialog(index, row) {
        this.noteflag = !this.noteflag
        if (this.noteflag && row) {
          this.note._id = row._id
          this.note.haoId = row.haoId._id
          this.note.content = row.content
          this.note.addTime = new Date(row.addTime)
          this.note.status = row.status
        } else if (this.noteflag) {
          this.note.addTime = new Date()
        }
      },
      // 数据初始化
      getNoteReset() {
        this.note = Object.assign({}, this.note, this.noteClear)
        this.dialogId = Date.now()
      },
      // 关闭弹窗和清空数据
      onNoteDialogClose() {
        setTimeout(() => {
          this.$refs.note.resetFields()
          this.getNoteReset()
        }, 500)
      },
      // 房屋列表
      async getHouseList() {
        await this.Ajax('/inner/house/list')
          .then(res => {
            this.houseData = res
          })
          .catch(() => {})
      },
      // 记事列表
      async getNotes() {
        if (this.gettingNotes) return

        // 接口提交
        this.gettingNotes = true

        await this.Ajax('/inner/dash/notes')
          .then(res => {
            this.noteList = res
          })
          .catch(() => {})

        this.gettingNotes = false
      },
      // 更新记事
      async getAddNote(type) {
        if (this.gettingAddNote) return

        // 表单校验
        try {
          await this.$refs.note.validate()
        } catch (err) {
          return
        }

        // 接口提交
        this.gettingAddNote = true

        const _data = Object.assign({}, this.note)
        if (type !== undefined) _data.status = type
        await this.Ajax('/inner/dash/addNote', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: this.note._id ? '修改成功' : '添加成功',
              duration: 2000,
            })
            this.getNoteAddDialog()
            this.getNotes()
          })
          .catch(() => {})

        this.gettingAddNote = false
      },
    },
  }
</script>

<style lang="scss">
.dashboard-main {
  /* 页面样式 */
  .el-row {
    margin-bottom: 20px;
  }

  .el-row.main-wrap {
    margin-bottom: -20px;
  }

  .el-card__header {
    position: relative;
  }

  .card-header {
    font-weight: bold;
  }

  .card-btn {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  /* 计数card */
  .count-wrap
  .el-card__body {
    display: flex;
    justify-content: space-around;
  }

  .count {
    padding: 10px 0;
    text-align: center;

    & > div {
      padding-top: 10px;
      padding-bottom: 10px;
    }

    & > span:first-of-type {
      font-size: 48px;
    }
  }

  /* 自定义card */
  .detail-wrap {
    /* 记事列表 */
    .card-list {
      list-style: none;
      padding: 0;
      margin: -10px 0;

      & > li {
        display: flex;

        &.done {
          text-decoration: line-through;
          color: #bfcbd9;
        }

        & > span {
          padding: 12px 0;
          display: inline-block;
        }

        .card-list-item {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
        }
      }
    }

    /* card暂无数据 */
    .card-nodata {
      color: #5a5e66;
      text-align: center;
      line-height: 20px;
    }

    /* 文字内容 */
    .detail-content {
      line-height: 2;
      margin: -7px 0;
    }
  }

  /* 记事弹窗 */
  .note-dialog {
    .el-row {
      margin-bottom: 0;
    }

    .el-input,
    .el-select {
      width: 100%;
    }
  }
}
</style>
