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
        :loading="gettingListRefresh"
        @click="getListRefresh">
        刷新
      </el-button>
      <div class="table-btn-input">
        <el-input
          v-model="monthListDataSearch"
          placeholder="搜索" />
      </div>
    </div>

    <!-- 新增弹窗 -->
    <el-dialog
      custom-class="add-month-list-dialog"
      :title="amldDialogTitle"
      :visible.sync="addMonthListflag"
      :close-on-click-modal="false"
      :key="dialogId"
      @closed="onAddMonthListDialogClose">
      <el-form
        :model="addMonthList"
        :rules="addMonthListrules"
        ref="addMonthList">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="收租周期"
              prop="month"
              :label-width="amldLabelWidth">
              <el-date-picker
                v-model="addMonthList.month"
                type="month"
                placeholder="选择月份"
                :disabled="!amldInput"
                :editable="false" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="备注"
              :label-width="amldLabelWidth">
              <el-input
                v-model="addMonthList.remark"
                auto-complete="off"
                placeholder="备注" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-alert
          type="info"
          :title="(addMonthList._id ? '已' : '将') +
            '记录以下（已配置）计费方式作为本月' +
            '默认计费方式（存副本），作用于水电张贴计算'" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="水费"
              :label-width="amldLabelWidth">
              <div>
                低消：{{ addMonthList.defaultCalWaterPrice.minPrice || 0 }}吨
              </div>
              <div v-if="addMonthList.defaultCalWaterPrice.calType == 'single'">
                单价：{{ addMonthList.defaultCalWaterPrice.singlePrice || 0 }}元/吨
              </div>
              <div v-else-if="addMonthList.defaultCalWaterPrice.calType == 'step'">
                阶梯：
                <div
                  v-for="(item, index) in addMonthList.defaultCalWaterPrice.stepPrice"
                  :key="index">
                  {{ item.step }}吨及以下￥{{ item.price }}元/吨；
                </div>
                超出按最后阶梯计算。
              </div>
              <div v-else>
                暂无计费方式
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="电费"
              :label-width="amldLabelWidth">
              <div>
                低消：{{ addMonthList.defaultCalElePrice.minPrice || 0 }}度
              </div>
              <div v-if="addMonthList.defaultCalElePrice.calType == 'single'">
                单价：{{ addMonthList.defaultCalElePrice.singlePrice || 0 }}元/度
              </div>
              <div v-else-if="addMonthList.defaultCalElePrice.calType == 'step'">
                阶梯：
                <div
                  v-for="(item, index) in addMonthList.defaultCalElePrice.stepPrice"
                  :key="index">
                  {{ item.step }}度及以下￥{{ item.price }}元/度；
                </div>
                超出按最后阶梯计算。
              </div>
              <div v-else>
                暂无计费方式
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        class="dialog-footer"
        slot="footer">
        <el-button
          :loading="gettingAddMonthList"
          @click="getAddMonthListDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="gettingAddMonthList"
          @click="getAddMonthList">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 月份数据表 -->
    <el-table
      v-loading.body="gettingListRefresh"
      class="month-table"
      stripe
      border
      :max-height="tableMaxHeight"
      :data="filterMonthListData"
      ref="monthTable">
      <el-table-column
        prop="month"
        label="月份"
        width="180">
        <template slot-scope="scope">
          <router-link
            :to="{
              path: '/inner/rent/month',
              query: { id: scope.row._id }
            }">
            <el-button type="text">
              {{ scope.row.month }}
            </el-button>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注">
        <template slot-scope="scope">
          <table-rent-remark-item
            :rent="scope.row" />
        </template>
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
            v-model="scope.row.dMonthPopFlag"
            placement="top"
            width="150"
            trigger="click">
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
            <span
              class="show-pop"
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
  import { mapState } from 'vuex'
  import { mixinDef } from 'pcside/js/mixins'
  import TableRentRemarkItem from 'pcside/common/table-rent-remark-item'

  export default {
    name: 'RentMain',
    components: {
      TableRentRemarkItem,
    },
    mixins: [mixinDef],
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
          defaultCalWaterPrice: {},
          defaultCalElePrice: {},
        },
        addMonthListrules: {
          month: [{
            type: 'date', required: true, message: '请选择', trigger: 'change',
          }],
        },
        tableMaxHeight: 200,
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
      ...mapState({
        defaultCalWaterPrice: state => state.config.defaultCalWaterPrice,
        defaultCalElePrice: state => state.config.defaultCalElePrice,
      }),
    },
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/rent/index')
    },
    created() {
      this.getListRefresh()
      this.getResetAddMonthList()
    },
    mounted() {
      window.onresize = () => {
        const height = window.innerHeight || document.body.clientHeight
        const offsetTop = this.$refs.monthTable.$el.getBoundingClientRect().top
        this.tableMaxHeight = height - offsetTop - 20 - 0.5
      }
      this.$nextTick(() => window.onresize())
    },
    beforeDestroy() {
      window.onresize = null
    },
    methods: {
      async getAddMonthListDialog(index, row) {
        this.addMonthListflag = !this.addMonthListflag
        if (this.addMonthListflag && row) {
          const _date = new Date()
          _date.setFullYear(row.month.slice(0, 4))
          _date.setMonth(row.month.slice(5, 7) - 1)
          this.addMonthList._id = row._id
          this.addMonthList.month = _date
          this.addMonthList.remark = row.remark
          this.addMonthList.defaultCalWaterPrice = row.defaultCalWaterPrice || {}
          this.addMonthList.defaultCalElePrice = row.defaultCalElePrice || {}
          this.amldInput = false
          this.amldDialogTitle = '修改收租周期'
        } else if (this.addMonthListflag) {
          this.amldInput = true
          this.amldDialogTitle = '新增收租周期'
          this.addMonthList.month = new Date()
        }
        await new Promise(r => setTimeout(r, 300))
      },
      getResetAddMonthList() {
        let {
          defaultCalWaterPrice,
          defaultCalElePrice,
        } = this
        defaultCalWaterPrice = JSON.parse(JSON.stringify(defaultCalWaterPrice))
        defaultCalElePrice = JSON.parse(JSON.stringify(defaultCalElePrice))
        this.addMonthList = Object.assign({}, this.addMonthList, this.addMonthListClear, {
          defaultCalWaterPrice,
          defaultCalElePrice,
        })
        this.dialogId = Date.now()
      },
      async getListRefresh() {
        if (this.gettingListRefresh) return

        // 请求接口
        this.gettingListRefresh = true

        await this.Ajax('/inner/month/list')
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
        const m = _data.month.getMonth() + 1 > 9
          ? _data.month.getMonth() + 1 : `0${_data.month.getMonth() + 1}`
        _data.month = `${y}-${m}`

        await this.Ajax('/inner/month/add', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: _data._id ? '修改成功' : '添加成功',
              duration: 2000,
            })
          })
          .then(this.getAddMonthListDialog)
          .then(this.getListRefresh)
          .catch(() => {})

        this.gettingAddMonthList = false
      },
      // 删除月度周期
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
          })
          .then(this.getListRefresh)
          .catch(() => {})

        row.gettingdelMonth = false
      },
    },
  }
</script>
