<template>
  <div class="rent-history">
    <!-- 顶部按钮组 -->
    <div class="table-btn">
      <el-button
        type="primary"
        @click="getListRefresh"
        :loading="gettingListRefresh">
        刷新
      </el-button>
      <div class="table-btn-input">
        <el-input
          v-model="rentHistorySearch"
          placeholder="搜索">
        </el-input>
      </div>
    </div>

    <!-- 状态修改表单 -->
    <el-dialog custom-class="change-type-dialog"
      :key="'changeType' + dialogId"
      :title="changeType.fanghao + ctdDialogTitle"
      :visible.sync="changeTypeflag"
      size="large"
      :close-on-click-modal="false"
      @close="onChangeTypeDialogClose">
      <el-form
        :model="changeType"
        ref="changeType"
        :rules="changeTyperules">
        <el-form-item>
          <el-alert
            title="多选状态信息"
            type="info">
          </el-alert>
        </el-form-item>
        <el-form-item
          label="交租方式"
          :label-width="ctdLabelWidth"
          prop="payType">
          <div style="overflow: hidden;">
            <el-row :gutter="20">
              <el-col :span="4" style="height:1px;"></el-col>
              <el-col :span="20">
                <el-select
                  v-model="changeType.payType"
                  placeholder="选择交租方式">
                  <el-option
                    v-for="(item, index) in payTypeVal"
                    :label="item"
                    :value="index"
                    :key="index">
                  </el-option>
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
              <el-col :span="4" style="height:1px;"></el-col>
              <el-col :span="20">
                <el-input
                  v-model="changeType.remark"
                  auto-complete="off"
                  placeholder="备注">
                </el-input>
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
              <el-row :gutter="20"
                class="el-row-margin"
                v-for="(type, index) in types"
                :key="index">
                <el-col :span="4">
                  <el-checkbox
                    :label="type.value">
                    {{type.label}}
                  </el-checkbox>
                </el-col>
                <el-col :span="20">
                  <el-form-item
                    v-if="changeType.type.indexOf(type.value) > -1"
                    :prop="`typeTime.${type.value}`"
                    :rules="changeTyperules.typeTime[0]">
                    <el-date-picker
                      v-model="changeType.typeTime[type.value]"
                      type="datetime"
                      placeholder="输入状态时间"
                      :editable="false">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-checkbox-group>
          </div>
          <div>
            <el-checkbox
              :indeterminate="changeType.isIndeterminate"
              v-model="changeType.checkAll"
              @change="onCheckAllChange">
              全选
            </el-checkbox>
          </div>
        </el-form-item>
      </el-form>
      <div class="dialog-footer"
        slot="footer">
        <el-button
          @click="getChangeTypeDialog"
          :loading="gettingChangeType">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="getChangeType"
          :loading="gettingChangeType">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 月周期图表 -->
    <el-table class="month-table"
      :data="filterRentHistoryData"
      v-loading.body="gettingListRefresh"
      stripe
      border>
      <el-table-column
        type="expand">
        <template slot-scope="props">
          <el-form class="table-expand"
            label-position="left"
            inline>
            <el-form-item
              label="水表本次用数/单价"
              min-width="150">
              <template>
                <div
                  v-if="getRent(props).calWater">
                  {{getRent(props).calWater.tnew.water - getRent(props).calWater.old.water}}吨
                  <el-popover
                    placement="top"
                    trigger="hover">
                    <div>本次抄表数：{{getRent(props).calWater.tnew.water}}吨</div>
                    <div>抄表时间：{{getTime(getRent(props).calWater.tnew.addTime)}}</div>
                    <div>上次表底数：{{getRent(props).calWater.old.water}}吨</div>
                    <div>表底时间：{{getTime(getRent(props).calWater.old.addTime)}}</div>
                    <el-tag class="show-tag"
                      slot="reference">计数</el-tag>
                  </el-popover>
                  ￥{{getPrice(getRent(props), 'calWater')}}元/吨
                </div>
                <div
                  v-if="!getRent(props).calWater">
                  暂无
                </div>
              </template>
            </el-form-item>
            <el-form-item
              label="电表本次用数/单价"
              min-width="150">
              <template>
                <div
                  v-if="getRent(props).calElectric">
                  {{getRent(props).calElectric.tnew.electric - getRent(props).calElectric.old.electric}}度
                  <el-popover
                    placement="top"
                    trigger="hover">
                    <div>本次抄表数：{{getRent(props).calElectric.tnew.electric}}度</div>
                    <div>抄表时间：{{getTime(getRent(props).calElectric.tnew.addTime)}}</div>
                    <div>上次表底数：{{getRent(props).calElectric.old.electric}}度</div>
                    <div>表底时间：{{getTime(getRent(props).calElectric.old.addTime)}}</div>
                    <el-tag class="show-tag"
                      slot="reference">计数</el-tag>
                  </el-popover>
                  ￥{{getPrice(getRent(props), 'calElectric')}}元/度
                </div>
                <div
                  v-if="!getRent(props).calElectric">
                  暂无
                </div>
              </template>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        prop="fanghao"
        label="房屋"
        width="120"
        sortable>
        <template slot-scope="scope">
          <div>{{getRent(scope).fanghao}}</div>
          <div>{{getRent(scope).monthId.month}}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="计租信息">
        <el-table-column
          label="水费信息">
          <el-table-column
            label="本次计费/时间"
            width="180">
            <template slot-scope="scope">
              <div
                v-if="getRent(scope).calWater">
                <el-tag>
                  {{getRent(scope).calWater.fix ? '修' : '计'}}
                </el-tag>
                <span>
                  ￥
                  <span class="main-txt-highline">
                    {{getRent(scope).calWater.calWaterResult}}
                  </span>
                  元
                </span>
                <div>
                  {{getTime(getRent(scope).calWater.addTime)}}
                </div>
              </div>
              <div v-if="!getRent(scope).calWater">
                暂无
              </div>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column
          label="电费信息">
          <el-table-column
            label="本次计费/时间"
            width="180">
            <template slot-scope="scope">
              <div
                v-if="getRent(scope).calElectric">
                <el-tag>
                  {{getRent(scope).calElectric.fix ? '修' : '计'}}
                </el-tag>
                ￥
                <span class="main-txt-highline">
                  {{getRent(scope).calElectric.calElectricResult}}
                </span>
                元
                <div>
                  {{getTime(getRent(scope).calElectric.addTime)}}
                </div>
              </div>
              <div
                v-if="!getRent(scope).calElectric">
                暂无
              </div>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column
          label="房租信息"
          width="150">
          <template slot-scope="scope">
            <div
              v-if="getRent(scope).lease.name">
              <el-tag>
                {{getRent(scope).lease.payDay}}日
              </el-tag>
              <el-popover
                placement="top"
                trigger="hover">
                <div>姓名：{{getRent(scope).lease.name}}</div>
                <div>联系方式：{{getRent(scope).lease.call}}</div>
                <div>租住起始：{{getTime(getRent(scope).lease.leaserange[0])}}</div>
                <div>租住结束：{{getTime(getRent(scope).lease.leaserange[1])}}</div>
                <div>入住时间：{{getTime(getRent(scope).lease.addTime)}}</div>
                <div>搬出时间：{{getTime(getRent(scope).lease.outTime)}}</div>
                <div>备注：{{getRent(scope).lease.remark || '--'}}</div>
                <el-tag slot="reference">
                  {{payTypeVal[getRent(scope).lease.payType]}}
                </el-tag>
              </el-popover>
              <div>
                ￥
                <span class="main-txt-highline">
                  {{getRent(scope).lease.rent}}
                </span>
                元
              </div>
            </div>
            <div
              v-if="!getRent(scope).lease.name">
              暂无
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="合计/计费时间"
          width="170">
          <template slot-scope="scope">
            <div>
              <el-tag>
                {{getRent(scope).fix ? '修' : '计'}}
              </el-tag>
              ￥
              <span class="main-txt-highline">
                {{getRent(scope).calRentResult}}
              </span>
              元
            </div>
            <div>
              {{getTime(getRent(scope).addTime)}}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="状态/更新时间"
          width="180">
          <template slot-scope="scope">
            <div
              v-if="getRent(scope).type">
              <el-popover
                placement="top"
                trigger="hover"
                v-for="item in getRent(scope).type.type"
                :key="item">
                {{ getTime(getRent(scope).type.typeTime[item]) }}
                <el-tag class="show-tag show-tag3"
                  slot="reference"
                  :type="item != 2? 'success' : ''">
                  {{typesVal[item]}}
                </el-tag>
              </el-popover>
            </div>
            <el-tag
              v-if="getRent(scope).type && !getRent(scope).type.type.length || !getRent(scope).type">
              新建
            </el-tag>
            <div>
              {{getTime(getRent(scope).updateTime)}}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          min-width="150">
          <template slot-scope="scope">
            <el-popover
              placement="top"
              trigger="hover">
              <div class="rent-remark">
                {{ getRent(scope).remark }}
              </div>
              <div class="rent-remark-tag"
                slot="reference">
                {{ getRent(scope).remark }}
              </div>
            </el-popover>
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
            @click="getChangeTypeDialog(scope.$index, scope.row)">
            状态
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'rent-history',
    beforeCreate() {
      this.$store.dispatch('updateMenu', '/inner/rent/index')
    },
    created() {
      this.getListRefresh()
      this.getResetChangeType()
    },
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
    methods: {
      // 时间格式化
      getTime(t) {
        return t ? this.GetTimeFormat(t) : '--'
      },
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
      // 获取价格档次
      getPrice(data, key) {
        if (data[key][key].calType === 'single') {
          return data[key][key].singlePrice
        }

        const steps = data[key][key].stepPrice
        const numKey = key === 'calWater' ? 'water' : 'electric'
        const gap = data[key].tnew[numKey] - data[key].old[numKey]

        let rprice = 0
        steps.forEach((item, i, arr) => {
          if (!item.price) return
          const prevPrices = arr[i - 1] || {}

          if (
            (gap > (prevPrices.step || 0) && gap <= item.step) ||
            ((i + 1) === arr.length && gap > item.step)
          ) {
            rprice = item.price
          }
        })
        return rprice
      },
      // 获取租单
      getRent(scope) {
        return scope.row
      },
      getChangeTypeDialog(index, row) {
        this.changeTypeflag = !this.changeTypeflag
        if (this.changeTypeflag && row) {
          const rent = row
          this.changeType.fanghao = rent.fanghao
          this.changeType.rentId = rent._id
          // type
          this.changeType.type = (
            rent.type &&
            JSON.parse(JSON.stringify(rent.type.type))
          ) ||
            this.changeType.type
          this.changeType.typeTime = (
            rent.type &&
            JSON.parse(JSON.stringify(rent.type.typeTime))
          ) ||
            this.changeType.typeTime
          Object.keys(this.changeType.typeTime).forEach(key => {
            if (this.changeType.typeTime[key]) {
              this.changeType.typeTime[key] = new Date(this.changeType.typeTime[key])
            }
          })

          this.changeType.isIndeterminate = (rent.type && rent.type.isIndeterminate) ||
            this.changeType.isIndeterminate
          this.changeType.checkAll = (rent.type && rent.type.checkAll) ||
            this.changeType.checkAll

          this.changeType.payType = rent.lease.payType ||
            this.changeType.payType
          this.changeType.remark = rent.remark ||
            this.changeType.remark
        }
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
        setTimeout(() => {
          this.$refs.changeType.resetFields()
          this.getResetChangeType()
        }, 500)
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
            this.getChangeTypeDialog()
            this.getListRefresh()
          })
          .catch(() => {})

        this.gettingChangeType = false
      },
    },
  }
</script>
<style lang="scss">
.rent-history {
  // 顶部按钮样式
  .table-btn {
    margin-bottom: 20px;
  }
  .table-btn-input {
    vertical-align: top;
    max-width: 300px;
    display: inline-block;
    margin-left: 10px;
  }
  // 弹窗表单样式
  .change-type-dialog {
    .el-input {
      width: 100%;
      vertical-align: top;
      // max-width: 300px;
    }
    .el-select {
      width: 100%;
      max-width: 300px;
    }
    .el-checkbox-group {
      overflow: hidden;
    }
    .el-row-margin {
      margin-bottom: 20px;
    }
  }
  .change-type-dialog {
    max-width: 800px;
    .el-input {
      max-width: 300px;
    }
  }
  .rent-remark-tag {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  // 信息悬浮窗弹窗样式
  .rent-remark {
    max-width: 200px;
  }
}
</style>
