<template>
  <div class="rent-history">
    <!-- 顶部按钮组 -->
    <div class="table-btn">
      <el-button
        type="primary"
        :loading="gettingListRefresh"
        @click="getListRefresh">
        刷新
      </el-button>
      <div class="table-btn-input">
        <el-input
          v-model="rentHistorySearch"
          placeholder="搜索" />
      </div>
    </div>

    <!-- 状态修改表单 -->
    <el-dialog
      custom-class="change-type-dialog"
      :title="changeType.fanghao + ctdDialogTitle"
      :visible.sync="changeTypeflag"
      :close-on-click-modal="false"
      :key="'changeType' + dialogId"
      @closed="onChangeTypeDialogClose">
      <el-form
        :model="changeType"
        :rules="changeTyperules"
        ref="changeType">
        <el-alert
          title="多选状态信息"
          type="info" />
        <el-form-item
          label="交租方式"
          prop="payType"
          :label-width="ctdLabelWidth">
          <div style="overflow: hidden;">
            <el-row :gutter="20">
              <el-col
                style="height: 1px;"
                :span="4" />
              <el-col :span="20">
                <el-select
                  v-model="changeType.payType"
                  placeholder="选择交租方式">
                  <el-option
                    :label="item"
                    :value="index"
                    v-for="(item, index) in payTypeVal"
                    :key="index" />
                </el-select>
              </el-col>
            </el-row>
          </div>
        </el-form-item>
        <el-form-item
          label="备注"
          :label-width="ctdLabelWidth">
          <div style="overflow: hidden;">
            <el-row :gutter="20">
              <el-col
                style="height: 1px;"
                :span="4" />
              <el-col :span="20">
                <el-input
                  v-model="changeType.remark"
                  auto-complete="off"
                  placeholder="备注" />
              </el-col>
            </el-row>
          </div>
        </el-form-item>
        <el-form-item
          label="状态"
          :label-width="ctdLabelWidth">
          <div>
            <el-checkbox-group
              v-model="changeType.type"
              @change="onChangeType">
              <el-row
                class="el-row-margin"
                :gutter="20"
                v-for="(type, index) in types"
                :key="index">
                <el-col :span="4">
                  <el-checkbox :label="type.value">
                    {{ type.label }}
                  </el-checkbox>
                </el-col>
                <el-col :span="20">
                  <el-form-item
                    :prop="`typeTime.${type.value}`"
                    :rules="changeTyperules.typeTime[0]"
                    v-if="changeType.type.indexOf(type.value) > -1">
                    <el-date-picker
                      v-model="changeType.typeTime[type.value]"
                      type="datetime"
                      placeholder="输入状态时间"
                      :editable="false" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-checkbox-group>
          </div>
          <div>
            <el-checkbox
              v-model="changeType.checkAll"
              :indeterminate="changeType.isIndeterminate"
              @change="onCheckAllChange">
              全选
            </el-checkbox>
          </div>
        </el-form-item>
      </el-form>
      <div
        class="dialog-footer"
        slot="footer">
        <el-button
          :loading="gettingChangeType"
          @click="getChangeTypeDialog">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="gettingChangeType"
          @click="getChangeType">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 月周期图表 -->
    <el-table
      v-loading.body="gettingListRefresh"
      class="month-table"
      stripe
      border
      :max-height="tableMaxHeight"
      :data="filterRentHistoryData"
      ref="monthTable">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form
            class="table-expand"
            label-position="left"
            inline>
            <el-form-item
              label="水表本次用数/单价"
              min-width="150">
              <template>
                <table-expand-eandw-item
                  type="water"
                  cal-type="calWater"
                  unit="吨"
                  :rent="getRent(props)" />
              </template>
            </el-form-item>
            <el-form-item
              label="电表本次用数/单价"
              min-width="150">
              <template>
                <table-expand-eandw-item
                  type="electric"
                  cal-type="calElectric"
                  unit="度"
                  :rent="getRent(props)" />
              </template>
            </el-form-item>
            <el-form-item
              label="燃气表本次用数/单价"
              min-width="150">
              <template>
                <table-expand-eandw-item
                  type="gas"
                  cal-type="calGas"
                  unit="方"
                  :rent="getRent(props)" />
              </template>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        prop="fanghao"
        label="房屋"
        width="120">
        <template slot-scope="scope">
          <div>{{ getRent(scope).fanghao }}</div>
          <div>{{ getRent(scope).monthId.month }}</div>
        </template>
      </el-table-column>
      <el-table-column label="计租信息">
        <el-table-column
          label="房租信息"
          width="150">
          <template slot-scope="scope">
            <table-lease-view-item
              :lease="getRent(scope).lease" />
          </template>
        </el-table-column>
        <el-table-column label="水费信息">
          <el-table-column
            label="本次计费/时间"
            width="200">
            <template slot-scope="scope">
              <table-rent-eandw-item
                type="water"
                cal-type="calWater"
                result-type="calWaterResult"
                unit="吨"
                :rent="getRent(scope)" />
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="电费信息">
          <el-table-column
            label="本次计费/时间"
            width="200">
            <template slot-scope="scope">
              <table-rent-eandw-item
                type="electric"
                cal-type="calElectric"
                result-type="calElectricResult"
                unit="度"
                :rent="getRent(scope)" />
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="燃气费信息">
          <el-table-column
            label="本次计费/时间"
            width="200">
            <template slot-scope="scope">
              <table-rent-eandw-item
                type="gas"
                cal-type="calGas"
                result-type="calGasResult"
                unit="方"
                :rent="getRent(scope)" />
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column
          label="合计/计费时间"
          width="170">
          <template slot-scope="scope">
            <table-rent-view-item
              highline
              :rent="getRent(scope)" />
          </template>
        </el-table-column>
        <el-table-column
          label="状态/更新时间"
          width="180">
          <template slot-scope="scope">
            <table-rent-type-item
              highline
              :rent="getRent(scope)" />
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          min-width="150">
          <template slot-scope="scope">
            <table-rent-remark-item
              :rent="getRent(scope)" />
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        label="操作"
        width="100">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            @click="getChangeTypeDialog(
              scope.$index,
              scope.row
            )">
            状态
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { mixinDef } from 'pcside/js/mixins'
  import TableExpandEandwItem from 'pcside/common/table-expand-eandw-item'
  import TableRentEandwItem from 'pcside/common/table-rent-eandw-item'
  import TableRentViewItem from 'pcside/common/table-rent-view-item'
  import TableLeaseViewItem from 'pcside/common/table-lease-view-item'
  import TableRentTypeItem from 'pcside/common/table-rent-type-item'
  import TableRentRemarkItem from 'pcside/common/table-rent-remark-item'

  export default {
    name: 'RentHistory',
    components: {
      TableExpandEandwItem,
      TableRentEandwItem,
      TableRentViewItem,
      TableLeaseViewItem,
      TableRentTypeItem,
      TableRentRemarkItem,
    },
    mixins: [mixinDef],
    data() {
      return {
        changeTypeflag: false,
        gettingChangeType: false,
        gettingListRefresh: false,

        dialogId: Date.now(),

        // 修改状态
        ctdDialogTitle: '状态修改',
        ctdLabelWidth: '90px',
        types: [
          { label: '已交', value: 1 },
          { label: '给单', value: 2 },
          { label: '房东', value: 3 },
        ],
        changeType: {},
        changeTypeClear: {
          fanghao: '',
          rentId: '',
          type: [],
          typeTime: {
            1: '',
            2: '',
            3: '',
          },
          isIndeterminate: false,
          checkAll: false,

          payType: 0,
          remark: '',
        },
        changeTyperules: {
          payType: [{
            type: 'number', required: true, message: '请选择', trigger: 'change',
          }],
          typeTime: [{
            type: 'date', required: true, message: '请填写', trigger: 'change',
          }],
        },

        // 列表渲染
        tableMaxHeight: 300,
        rentHistoryData: [],
        rentHistorySearch: '',
      }
    },
    computed: {
      filterRentHistoryData() {
        if (!this.rentHistorySearch) {
          return this.rentHistoryData
        }
        const searchKeys = ['fanghao', 'remark']

        const _rentHistorySearch = new RegExp(this.rentHistorySearch, 'i')
        return this.rentHistoryData.filter(item => {
          const testObject = {}
          searchKeys.forEach((key) => {
            testObject[key] = item[key]
          })
          const testItem = Object.values(testObject).join(' ')
          return _rentHistorySearch.test(testItem)
        })
      },
      ...mapState({
        payTypeVal: state => state.config.payTypeVal,
        typesVal: state => state.config.typesVal,
      }),
    },
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/rent/index')
    },
    created() {
      this.getListRefresh()
      this.getResetChangeType()
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
      // 获取列表数据
      async getListRefresh() {
        if (this.gettingListRefresh) return

        // 请求接口
        this.gettingListRefresh = true

        await this.Ajax('/inner/rent/listByHao', {
          haoId: this.$route.query.id,
        })
          .then(res => {
            this.rentHistoryData = res
          })
          .catch(() => {})

        this.gettingListRefresh = false
      },
      // 获取租单
      getRent(scope) {
        return scope.row
      },
      async getChangeTypeDialog(index, row) {
        this.changeTypeflag = !this.changeTypeflag
        if (this.changeTypeflag && row) {
          const rent = row
          this.changeType.fanghao = rent.fanghao
          this.changeType.rentId = rent._id
          // type
          this.changeType.type = (
            rent.type
            && JSON.parse(JSON.stringify(rent.type.type))
          )
            || this.changeType.type
          this.changeType.typeTime = (
            rent.type
            && JSON.parse(JSON.stringify(rent.type.typeTime))
          )
            || this.changeType.typeTime
          Object.keys(this.changeType.typeTime).forEach(key => {
            if (this.changeType.typeTime[key]) {
              this.changeType.typeTime[key] = new Date(this.changeType.typeTime[key])
            }
          })

          this.changeType.isIndeterminate = (rent.type && rent.type.isIndeterminate)
            || this.changeType.isIndeterminate
          this.changeType.checkAll = (rent.type && rent.type.checkAll)
            || this.changeType.checkAll

          this.changeType.payType = rent.lease.payType
            || this.changeType.payType
          this.changeType.remark = rent.remark
            || this.changeType.remark
        }
        await new Promise(r => setTimeout(r, 300))
      },
      getResetChangeType() {
        this.changeType = Object.assign(
          {},
          this.changeType,
          JSON.parse(JSON.stringify(this.changeTypeClear)),
        )
        this.dialogId = Date.now()
      },
      onChangeTypeDialogClose() {
        this.$refs.changeType.resetFields()
        this.getResetChangeType()
      },
      // 处理修改状态
      onChangeType(value) {
        const checkedCount = value.length
        // 状态打开则初始化时间
        const checkItem = value[checkedCount - 1]
        if (checkItem && !this.changeType.typeTime[checkItem]) {
          this.changeType.typeTime[checkItem] = new Date()
        }
        // 状态关闭则清空时间
        this.types.forEach((i) => {
          if (value.indexOf(i.value) === -1) this.changeType.typeTime[i.value] = ''
        })
        this.changeType.checkAll = checkedCount === this.types.length
        this.changeType.isIndeterminate = checkedCount > 0 && checkedCount < this.types.length
      },
      // 处理全选状态
      onCheckAllChange(event) {
        const flag = event.target.checked
        this.changeType.type = flag ? [1, 2, 3] : []
        Object.values(this.changeType.typeTime).forEach(i => {
          if (flag) {
            if (!this.changeType.typeTime[i]) {
              this.changeType.typeTime[i] = new Date()
            }
          } else {
            this.changeType.typeTime[i] = ''
          }
        })

        this.changeType.isIndeterminate = false
      },
      // 提交状态修改
      async getChangeType() {
        if (this.gettingChangeType) return

        // 表单校验
        try {
          await this.$refs.changeType.validate()
        } catch (err) {
          return
        }

        // 提交接口
        this.gettingChangeType = true

        const _data = Object.assign({}, this.changeType)
        await this.Ajax('/inner/rent/type', _data)
          .then(() => {
            this.$message({
              type: 'success',
              message: '状态更新成功',
              duration: 2000,
            })
          })
          .then(this.getChangeTypeDialog)
          .then(this.getListRefresh)
          .catch(() => {})

        this.gettingChangeType = false
      },
    },
  }
</script>
<style lang="scss">
.rent-history {
  /* 弹窗表单样式 */
  .change-type-dialog {
    .el-select,
    .el-input {
      width: 100%;
      max-width: 300px;
    }

    .el-checkbox-group {
      overflow: hidden;
    }

    .el-checkbox {
      vertical-align: top;
    }

    .el-row-margin {
      margin-bottom: 20px;
    }
  }
}
</style>
