<template>
  <div class="rent-main">
    <!-- 顶部按钮组 -->
    <div class="table-btn">
      <el-button
        type="primary"
        @click="getAddMonthListDialog">
        新增
      </el-button>
      <el-button
        type="primary"
        @click="getListRefresh"
        :loading="gettingListRefresh">
        刷新
      </el-button>
      <div class="table-btn-input">
        <el-input
          v-model="monthListDataSearch"
          placeholder="搜索">
        </el-input>
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog custom-class="add-month-list-dialog"
      :key="dialogId"
      :title="amldDialogTitle"
      :visible.sync="addMonthListflag"
      size="small"
      :close-on-click-modal="false"
      @close="onAddMonthListDialogClose">
      <el-form
        :model="addMonthList"
        ref="addMonthList"
        :rules="addMonthListrules">
        <el-form-item
          label="收租周期"
          :label-width="amldLabelWidth"
          prop="month">
          <el-date-picker
            v-model="addMonthList.month"
            type="month"
            :disabled="!amldInput"
            :editable="false"
            placeholder="选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item
          label="备注"
          :label-width="amldLabelWidth">
          <el-input
            v-model="addMonthList.remark"
            auto-complete="off"
            placeholder="备注">
          </el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer"
        slot="footer">
        <el-button
          @click="getAddMonthListDialog"
          :loading="gettingAddMonthList">
          取消
        </el-button>
        <el-button type="primary"
          @click="getAddMonthList"
          :loading="gettingAddMonthList">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 月份数据表 -->
    <el-table class="month-table"
      :data="filterMonthListData"
      v-loading.body="gettingListRefresh"
      stripe
      border>
      <el-table-column
        prop="month"
        label="月份"
        width="180">
        <template slot-scope="scope">
          <router-link :to="{ path: '/inner/rent/month', query: { id: scope.row._id }}">
            <el-button
              type="text">
              {{scope.row.month}}
            </el-button>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="updateTime"
        label="修改时间"
        width="180">
        <template slot-scope="scope">
          {{ getTime(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="180">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            @click="getAddMonthListDialog(scope.$index, scope.row)">
            修改
          </el-button>
          <el-popover
            placement="top"
            width="150"
            trigger="click"
            v-model="scope.row.dMonthPopFlag">
            <p>确认删除月份周期信息吗？与之关联的数据将一并删除</p>
            <div class="pop-cont">
              <el-button
                size="mini"
                type="text"
                @click="scope.row.dMonthPopFlag = false">
                取消
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="getDelMonth(scope.$index, scope.row)">
                确定
              </el-button>
            </div>
            <span class="show-pop"
              slot="reference">
              <el-button
                size="small"
                type="danger"
                :loading="scope.row.gettingdelMonth">
                删除
              </el-button>
            </span>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  export default {
    name: 'rent-main',
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/rent/index')
    },
    created() {
      this.getListRefresh()
      this.getResetAddMonthList()
    },
    data() {
      return {
        addMonthListflag: false,
        gettingAddMonthList: false,
        gettingListRefresh: false,

        dialogId: Date.now(),
        amldDialogTitle: '新增收租周期',
        amldInput: true,
        amldLabelWidth: '90px',
        addMonthList: {},
        addMonthListClear: {
          _id: '',
          month: '',
          remark: '',
        },
        addMonthListrules: {
          month: [{
            type: 'date', required: true, message: '请选择', trigger: 'change',
          }],
        },
        monthListData: [],
        monthListDataSearch: '',
      }
    },
    computed: {
      filterMonthListData() {
        if (!this.monthListDataSearch) {
          return this.monthListData
        }
        const searchKeys = ['fanghao', 'remark']

        const _monthListDataSearch = new RegExp(this.monthListDataSearch, 'i')
        return this.monthListData.filter(item => {
          const testObject = {}
          searchKeys.forEach((key) => {
            testObject[key] = item[key]
          })
          const testItem = Object.values(testObject).join(' ')
          return _monthListDataSearch.test(testItem)
        })
      },
    },
    methods: {
      // 时间格式化
      getTime(t) {
        return t ? this.GetTimeFormat(t) : '--'
      },
      getAddMonthListDialog(index, row) {
        this.addMonthListflag = !this.addMonthListflag
        if (this.addMonthListflag && row) {
          const _date = new Date()
          _date.setFullYear(row.month.slice(0, 4))
          _date.setMonth(row.month.slice(5, 7) - 1)
          this.addMonthList._id = row._id
          this.addMonthList.month = _date
          this.addMonthList.remark = row.remark
          this.amldInput = false
          this.amldDialogTitle = '修改收租周期'
        } else if (this.addMonthListflag) {
          this.amldInput = true
          this.amldDialogTitle = '新增收租周期'
          this.addMonthList.month = new Date()
        }
      },
      getResetAddMonthList() {
        this.addMonthList = Object.assign({}, this.addMonthList, this.addMonthListClear)
        this.dialogId = Date.now()
      },
      async getListRefresh() {
        if (this.gettingListRefresh) return

        // 请求接口
        this.gettingListRefresh = true

        await this.Ajax('/inner/month/list', {})
          .then(res => {
            this.monthListData = res
          })
          .catch(() => {})

        this.gettingListRefresh = false
      },
      onAddMonthListDialogClose() {
        this.$refs.addMonthList.resetFields()
        this.getResetAddMonthList()
      },
      async getAddMonthList() {
        if (this.gettingAddMonthList) return

        // 表单校验
        try {
          await this.$refs.addMonthList.validate()
        } catch (err) {
          return
        }

        // 请求接口
        this.gettingAddMonthList = true

        const _data = Object.assign({}, this.addMonthList)
        const y = _data.month.getFullYear()
        const m = _data.month.getMonth() + 1 > 9 ? _data.month.getMonth() + 1 : `0${_data.month.getMonth() + 1}`
        _data.month = `${y}-${m}`

        await this.Ajax('/inner/month/add', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: _data._id ? '修改成功' : '添加成功',
              duration: 2000,
            })
            this.getAddMonthListDialog()
            this.getListRefresh()
          })
          .catch(() => {})

        this.gettingAddMonthList = false
      },
      // 删除房屋
      async getDelMonth(index, row) {
        row.dMonthPopFlag = false
        if (row.gettingdelMonth) return

        // 请求接口
        row.gettingdelMonth = true

        await this.Ajax('/inner/month/del', { _id: row._id })
          .then(() => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 2000,
            })
            this.getListRefresh()
          })
          .catch(() => {})

        row.gettingdelMonth = false
      },
    },
  }
</script>

<style lang="scss">
.rent-main {
  // 弹窗样式
  .add-month-list-dialog {
    max-width: 400px;
    .el-input {
      width: 100%;
      max-width: 300px;
    }
    .el-select {
      width: 100%;
      max-width: 300px;
    }
  }
}
</style>
