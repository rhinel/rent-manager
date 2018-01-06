<template>
  <div class="rent-month">
    <el-tabs v-model="activeName">
      <el-tab-pane
        label="计租信息"
        name="rentHistory">
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
              v-model="monthDetSearch"
              placeholder="搜索" />
          </div>
        </div>

        <!-- 计租表单 -->
        <el-dialog
          custom-class="add-month-det-dialog"
          :key="'addMonthDet' + dialogId"
          :title="addRent.fanghao + ardDialogTitle"
          :visible.sync="addRentflag"
          top="50px"
          :close-on-click-modal="false"
          @close="onAddRentDialogClose">
          <el-form
            :model="addRent"
            ref="addRent"
            :rules="addRentrules">
            <el-alert
              title="请确认计租信息，保存计租副本"
              type="info" />
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="水费信息"
                  :label-width="ardLabelWidth">
                  <div v-if="addRent.calWater.calWater">
                    计费方式：{{
                      addRent.calWater.calWater.calType == 'single' ?
                        '单一价格' : '阶梯价格'
                    }}<br>
                    最低消费：{{ addRent.calWater.calWater.minPrice }}吨<br>
                    本次表数：{{ addRent.calWater.tnew.water }}吨<br>
                    （{{ getTime(addRent.calWater.tnew.addTime) }}）<br>
                    上次表数：{{ addRent.calWater.old.water }}吨<br>
                    （{{ getTime(addRent.calWater.old.addTime) }}）<br>
                    计费单价：￥{{ eandwCalGetPrice(addRent, 'water', 'calWater') }}元/吨<br>
                    水费：￥{{
                      addRent.calWater.calWaterResult
                    }}元（{{
                      addRent.calWater.fix ? '修' : '计'
                    }}）<br>
                    计费时间：{{ getTime(addRent.calWater.addTime) }}
                  </div>
                  <div v-else>
                    暂无
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="电费信息"
                  :label-width="ardLabelWidth">
                  <div v-if="addRent.calElectric.calElectric">
                    计费方式：{{
                      addRent.calElectric.calElectric.calType == 'single' ?
                        '单一价格' : '阶梯价格'
                    }}<br>
                    最低消费：{{ addRent.calElectric.calElectric.minPrice }}度<br>
                    本次表数：{{ addRent.calElectric.tnew.electric }}度<br>
                    （{{ getTime(addRent.calElectric.tnew.addTime) }}）<br>
                    上次表数：{{ addRent.calElectric.old.electric }}度<br>
                    （{{ getTime(addRent.calElectric.old.addTime) }}）<br>
                    计费单价：￥{{ eandwCalGetPrice(addRent, 'electric', 'calElectric') }}元/度<br>
                    电费：￥{{
                      addRent.calElectric.calElectricResult
                    }}元（{{
                      addRent.calElectric.fix ? '修' : '计'
                    }}）<br>
                    计费时间：{{ getTime(addRent.calElectric.addTime) }}
                  </div>
                  <div v-else>
                    暂无
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-alert
              title="租金及结果可做修正（不更新租户信息）作为本次副本保存，但建议租金调整先修改租户信息"
              type="info" />
            <el-form-item
              label="租住周期"
              :label-width="ardLabelWidth">
              <div v-if="addRent.lease.leaserange">
                {{ getTime(addRent.lease.leaserange[0]) }}
                ~
                {{ getTime(addRent.lease.leaserange[1]) }}
              </div>
              <div v-else>暂无</div>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="本月租金"
                  :label-width="ardLabelWidth"
                  prop="lease.rent">
                  <el-input
                    v-model.number="addRent.lease.rent"
                    auto-complete="off"
                    placeholder="输入本月租金">
                    <template slot="prepend">￥</template>
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  :label="addRent.fix ? '租金修正' : '租金合计'"
                  :label-width="ardLabelWidth"
                  prop="calRentResult">
                  <el-input
                    v-model.number="addRent.calRentResult"
                    auto-complete="off"
                    placeholder="输入本月租金合计">
                    <template slot="prepend">￥</template>
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="计租时间"
                  :label-width="ardLabelWidth"
                  prop="addTime">
                  <el-date-picker
                    v-model="addRent.addTime"
                    type="datetime"
                    placeholder="输入计租时间"
                    :editable="false" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="计租备注"
                  :label-width="ardLabelWidth">
                  <el-input
                    v-model="addRent.remark"
                    auto-complete="off"
                    placeholder="计租备注" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div
            class="dialog-footer"
            slot="footer">
            <el-button
              @click="getAddRentDialog"
              :loading="gettingAddRent">
              取消
            </el-button>
            <el-button
              type="primary"
              @click="getAddRent"
              :loading="gettingAddRent">
              确定
            </el-button>
          </div>
        </el-dialog>

        <!-- 状态修改表单 -->
        <el-dialog
          custom-class="change-type-dialog"
          :key="'changeType' + dialogId"
          :title="changeType.fanghao + ctdDialogTitle"
          :visible.sync="changeTypeflag"
          :close-on-click-modal="false"
          @close="onChangeTypeDialogClose">
          <el-form
            :model="changeType"
            ref="changeType"
            :rules="changeTyperules">
            <el-alert
              title="多选状态信息"
              type="info" />
            <el-form-item
              label="交租方式"
              :label-width="ctdLabelWidth"
              prop="payType">
              <div style="overflow: hidden;">
                <el-row :gutter="20">
                  <el-col
                    :span="4"
                    style="height:1px;" />
                  <el-col :span="20">
                    <el-select
                      v-model="changeType.payType"
                      placeholder="选择交租方式">
                      <el-option
                        v-for="(item, index) in payTypeVal"
                        :label="item"
                        :value="index"
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
                    :span="4"
                    style="height:1px;" />
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
                    :gutter="20"
                    class="el-row-margin"
                    v-for="(type, index) in types"
                    :key="index">
                    <el-col :span="4">
                      <el-checkbox :label="type.value">
                        {{ type.label }}
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
                          :editable="false" />
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
          <div
            class="dialog-footer"
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
        <el-table
          class="month-table"
          ref="monthTable"
          :max-height="tableMaxHeight"
          :data="filterMonthDetData"
          v-loading.body="gettingListRefresh"
          stripe
          border>
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
                      v-if="props.row.rents.length"
                      :rent="getRent(props)"
                      type="water"
                      cal-type="calWater"
                      unit="吨" />

                  </template>
                </el-form-item>
                <el-form-item
                  label="电表本次用数/单价"
                  min-width="150">
                  <template>

                    <table-expand-eandw-item
                      v-if="props.row.rents.length"
                      :rent="getRent(props)"
                      type="electric"
                      cal-type="calElectric"
                      unit="度" />

                  </template>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column
            prop="fanghao"
            label="房屋"
            width="150">
            <template slot-scope="scope">
              <router-link
                :to="{
                  path: '/inner/rent/history',
                  query: { id: scope.row._id }
                }">
                <el-button type="text">
                  {{ scope.row.fanghao }}
                </el-button>
              </router-link>
              <el-tag v-if="scope.row.rents.length > 1">多次</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="计租信息">
            <el-table-column label="水费信息">
              <el-table-column
                label="本次计费/时间"
                width="200">
                <template slot-scope="scope">

                  <table-rent-eandw-item
                    v-if="scope.row.rents.length"
                    :rent="getRent(scope)"
                    type="water"
                    cal-type="calWater"
                    result-type="calWaterResult"
                    unit="吨" />

                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="电费信息">
              <el-table-column
                label="本次计费/时间"
                width="200">
                <template slot-scope="scope">

                  <table-rent-eandw-item
                    v-if="scope.row.rents.length"
                    :rent="getRent(scope)"
                    type="electric"
                    cal-type="calElectric"
                    result-type="calElectricResult"
                    unit="度" />

                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column
              label="房租信息"
              width="150">
              <template slot-scope="scope">
                <table-lease-view-item
                  v-if="scope.row.rents.length"
                  :lease="getRent(scope).lease" />
              </template>
            </el-table-column>
            <el-table-column
              label="合计/计费时间"
              width="170">
              <template slot-scope="scope">
                <table-rent-view-item
                  v-if="scope.row.rents.length"
                  :rent="getRent(scope)"
                  highline />
              </template>
            </el-table-column>
            <el-table-column
              label="状态/更新时间"
              width="180">
              <template slot-scope="scope">
                <table-rent-type-item
                  v-if="scope.row.rents.length"
                  :rent="getRent(scope)"
                  highline />
              </template>
            </el-table-column>
            <el-table-column
              label="备注"
              min-width="140">
              <template slot-scope="scope">
                <table-rent-remark-item
                  v-if="scope.row.rents.length"
                  :rent="getRent(scope)" />
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="操作"
            width="250">
            <template slot-scope="scope">
              <el-button
                size="small"
                type="primary"
                v-if="monthDet.newest"
                @click="getAddRentDialog(scope.$index, scope.row)">
                计租
              </el-button>
              <el-button
                size="small"
                type="primary"
                v-if="scope.row.rents.length"
                @click="getChangeTypeDialog(scope.$index, scope.row)">
                状态
              </el-button>
              <el-popover
                placement="top"
                width="150"
                trigger="click"
                v-if="scope.row.rents.length && monthDet.newest"
                v-model="scope.row.dRentPopFlag">
                <p>确认删除该计租信息吗？其他数据不受影响，但无法恢复关联信息</p>
                <div class="pop-cont">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.dRentPopFlag = false">
                    取消
                  </el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    @click="getDelRent(scope.$index, scope.row)">
                    确定
                  </el-button>
                </div>
                <span
                  class="show-pop"
                  slot="reference">
                  <el-button
                    size="small"
                    type="danger"
                    :loading="scope.row.gettingdelRent">
                    删除
                  </el-button>
                </span>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane
        label="待交房东统计"
        name="landordHistoryTemp">
        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button
            type="primary"
            @click="getLandordRentTemp"
            :loading="gettingLandordRentTemp">
            刷新
          </el-button>
        </div>
        <el-collapse
          v-model="activeLandordHistoryTemp"
          v-loading.body="gettingLandordRentTemp"
          v-if="checkObjectTemp(landordHistoryTemp)">
          <el-collapse-item name="temp">
            <template slot="title">
              <span class="landord-title">
                合计：￥{{ landordHistoryTemp.all }}元
              </span>
              <span
                class="landord-title"
                v-for="(j, indexj) in payTypeVal"
                :key="indexj">
                {{ j }}：{{ landordHistoryTemp[indexj] }}元
              </span>
            </template>

            <collapse-landord-item
              :landord="landordHistoryTemp"
              type="six" />

            <collapse-landord-item
              :landord="landordHistoryTemp"
              type="eight" />

          </el-collapse-item>
        </el-collapse>
        <el-alert
          v-if="!gettingLandordRentTemp && !checkObjectTemp(landordHistoryTemp)"
          title="暂无数据！请先处理单据状态"
          type="info"
          :closable="false" />
      </el-tab-pane>

      <el-tab-pane
        label="交房东历史"
        name="landordHistory">
        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button
            type="primary"
            @click="getLandordRent"
            :loading="gettingLandordRent">
            刷新
          </el-button>
          <div class="table-btn-input">
            <el-date-picker
              v-model="landordHistorySearch"
              type="date"
              placeholder="选择日期"
              :editable="false"
              @change="getfilterLandordData" />
          </div>
        </div>
        <el-collapse
          v-model="activeDate"
          v-loading.body="gettingLandordRent"
          v-if="checkObject(landordData)">
          <el-collapse-item
            v-for="(item, index) in landordData"
            :name="new Date(Number(index)).toLocaleDateString()"
            :key="index">
            <template slot="title">
              {{ new Date(Number(index)).toLocaleDateString() }}
              <span class="landord-title">
                <el-popover
                  placement="right"
                  trigger="hover">
                  <div
                    class="landord-title"
                    v-for="(j, indexj) in payTypeVal"
                    :key="indexj">
                    {{ j }}：{{ item[indexj] }}元
                  </div>
                  <div slot="reference">
                    <el-button type="text">
                      合计：￥{{ item.all }}元
                    </el-button>
                  </div>
                </el-popover>
              </span>
            </template>

            <collapse-landord-item
              :landord="item"
              type="six" />

            <collapse-landord-item
              :landord="item"
              type="eight" />

          </el-collapse-item>
        </el-collapse>
        <el-alert
          v-if="!gettingLandordRent && !checkObject(landordData)"
          title="暂无数据！请先处理单据状态"
          type="info"
          :closable="false" />
      </el-tab-pane>

      <el-tab-pane
        label="月租统计"
        name="rentCount">

        <collapse-rent-count-item
          v-for="(fang, fangi) in rentCount"
          :key="fangi"
          :fang="fang"
          :fangi="fangi"
          :active-rent-count="activeRentCount" />

        <el-alert
          v-if="!checkObject(rentCount)"
          title="暂无数据！请先处理单据状态"
          type="info"
          :closable="false" />
      </el-tab-pane>

      <el-tab-pane
        label="6坊65栋水电张贴"
        name="waterandeleCal6">

        <print-cal-table
          :month-det="monthDet"
          :month-det-data="monthDetData"
          type-string="6坊65栋" />

      </el-tab-pane>

      <el-tab-pane
        label="8坊68栋水电张贴"
        name="waterandeleCal8">

        <print-cal-table
          :month-det="monthDet"
          :month-det-data="monthDetData"
          type-string="8坊68栋" />

      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mixinDef, eandwCalGetPrice } from 'pcside/js/mixins'
import TableExpandEandwItem from 'pcside/common/table-expand-eandw-item'
import TableRentEandwItem from 'pcside/common/table-rent-eandw-item'
import TableRentViewItem from 'pcside/common/table-rent-view-item'
import TableLeaseViewItem from 'pcside/common/table-lease-view-item'
import TableRentTypeItem from 'pcside/common/table-rent-type-item'
import TableRentRemarkItem from 'pcside/common/table-rent-remark-item'

import CollapseLandordItem from 'pcside/common/collapse-landord-item'
import CollapseRentCountItem from 'pcside/common/collapse-rent-count-item'

import PrintCalTable from 'pcside/common/print-cal-table'

export default {
  name: 'RentMonth',
  components: {
    TableExpandEandwItem,
    TableRentEandwItem,
    TableRentViewItem,
    TableLeaseViewItem,
    TableRentTypeItem,
    TableRentRemarkItem,

    CollapseLandordItem,
    CollapseRentCountItem,

    PrintCalTable,
  },
  mixins: [mixinDef, eandwCalGetPrice],
  data() {
    return {
      activeName: 'rentHistory',
      // 状态
      addRentflag: false,
      gettingAddRent: false,
      changeTypeflag: false,
      gettingChangeType: false,
      gettingListRefresh: false,

      // 周期对象
      monthDet: {},

      dialogId: Date.now(),

      // 计租
      ardDialogTitle: '计租',
      ardLabelWidth: '90px',
      addRent: {},
      addRentClear: {
        calWater: {}, // 水费计费信息
        calElectric: {}, // 电费计费信息
        lease: { rent: 0 }, // 租户信息
        fanghao: '',
        haoId: '',
        monthId: this.$route.query.id,
        calRentResult: 0,
        fix: false,
        remark: '',
        addTime: '',
      },
      addRentrules: {
        'lease.rent': [{
          type: 'number', required: true, message: '请填写', trigger: 'blur change',
        }],
        calRentResult: [{
          type: 'number', required: true, message: '请填写', trigger: 'blur change',
        }],
        addTime: [{
          type: 'date', required: true, message: '请填写', trigger: 'blur change',
        }],
      },

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
      tableMaxHeight: 0,
      monthDetData: [],
      monthDetSearch: '',

      // 未交统计
      gettingLandordRentTemp: false,
      landordHistoryTemp: {},
      activeLandordHistoryTemp: ['temp'],

      // 房东列表
      landordHistorySearch: '',
      gettingLandordRent: false,
      landordData: {},
      activeDate: [],

      // rentCount列表
      rentCount: {},
      activeRentCount: {},
    }
  },
  computed: {
    filterMonthDetData() {
      if (!this.monthDetSearch) {
        return this.monthDetData
      }
      const searchKeys = ['fanghao', 'remark']

      const _monthDetSearch = new RegExp(this.monthDetSearch, 'i')
      return this.monthDetData.filter(item => {
        const testObject = {}
        searchKeys.forEach((key) => {
          testObject[key] = item[key]
        })
        const testItem = Object.values(testObject).join(' ')
        return _monthDetSearch.test(testItem)
      })
    },
    calRentResult() {
      let result = 0
      const add = this.addRent
      if (!add.lease) return result
      // 房租计算
      result = (add.calWater.calWaterResult || 0) +
          (add.calElectric.calElectricResult || 0) +
          (add.lease.rent || 0)
      return result
    },
    ...mapState({
      payTypeVal: state => state.config.payTypeVal,
      typesVal: state => state.config.typesVal,
      defaultCalWaterPrice: state => state.config.defaultCalWaterPrice,
      defaultCalElePrice: state => state.config.defaultCalElePrice,
    }),
  },
  watch: {
    calRentResult(n) {
      this.addRent.calRentResult = n
    },
    /* eslint object-shorthand: 0 */
    'addRent.calRentResult'(n) {
      this.addRent.fix = n !== this.calRentResult
    },
    activeName(n) {
      if (n === 'rentHistory') {
        this.$nextTick(() => {
          window.onresize()
          this.rentHistoryActive()
        })
      }
      if (n === 'landordHistoryTemp') this.landordHistoryTempActive()
      if (n === 'landordHistory') this.landordHistoryActive()
      if (n === 'rentCount') this.rentCountActive()
    },
  },
  beforeCreate() {
    this.$store.dispatch('updateMenu', '/inner/rent/index')
  },
  created() {
    this.getMonthDet()
    if (this.activeName === 'rentHistory') this.rentHistoryActive()
    if (this.activeName === 'landordHistoryTemp') this.landordHistoryTempActive()
    if (this.activeName === 'landordHistory') this.landordHistoryActive()
    if (this.activeName === 'rentCount') this.rentCountActive()
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
    rentHistoryActive() {
      this.getListRefresh()
      this.getResetAddRent()
      this.getResetChangeType()
    },
    landordHistoryTempActive() {
      this.getLandordRentTemp()
    },
    landordHistoryActive() {
      this.getLandordRent()
    },
    rentCountActive() {
      this.getCalRentCount()
    },
    // 获取月度周期对象
    async getMonthDet() {
      await this.Ajax('/inner/month/find', {
        _id: this.$route.query.id,
      })
        .then(res => {
          this.monthDet = res
          this.$store.dispatch('titleAdd', this.monthDet.month)
        })
        .catch(() => {})
    },
    // 获取月度周期数据
    async getListRefresh() {
      if (this.gettingListRefresh) return

      // 请求接口
      this.gettingListRefresh = true
      await this.Ajax('/inner/rent/listByMonth', {
        monthId: this.$route.query.id,
      })
        .then(res => {
          this.monthDetData = res
        })
        .catch(() => {})

      this.gettingListRefresh = false
    },
    getAddRentDialog(index, row) {
      this.addRentflag = !this.addRentflag
      if (this.addRentflag && row) {
        // 用于展示
        this.addRent.calWater = row.calWaterId
        this.addRent.calElectric = row.calElectricId
        // 编辑部分
        this.addRent.lease = {}.hasOwnProperty.call(row.leaseId, 'rent') ?
          JSON.parse(JSON.stringify(row.leaseId)) : this.addRent.lease
        this.addRent.fanghao = row.fanghao
        this.addRent.haoId = row._id
        this.addRent.remark = row.leaseId.remark || ''
        this.addRent.addTime = new Date()
      }
    },
    getResetAddRent() {
      this.addRent = Object.assign({}, this.addRent, JSON.parse(JSON.stringify(this.addRentClear)))
      this.dialogId = Date.now()
    },
    onAddRentDialogClose() {
      setTimeout(() => {
        this.$refs.addRent.resetFields()
        this.getResetAddRent()
      }, 500)
    },
    // 获取最新租单
    getRent(scope) {
      return (scope.row.rents[scope.row.rents.length - 1])
    },
    // 提交计租
    async getAddRent() {
      if (this.gettingAddRent) return

      // 表单校验
      try {
        await this.$refs.addRent.validate()
      } catch (err) {
        return
      }

      // 请求接口
      this.gettingAddRent = true

      const _data = Object.assign({}, this.addRent)
      await this.Ajax('/inner/rent/add', _data)
        .then(() => {
          this.$message({
            type: 'success',
            message: '计租成功',
            duration: 2000,
          })
          this.getAddRentDialog()
          this.getListRefresh()
        })
        .catch(() => {})

      this.gettingAddRent = false
    },
    // 删除计租
    async getDelRent(index, row) {
      row.dRentPopFlag = false
      if (row.gettingdelRent) return

      // 请求接口
      row.gettingdelRent = true

      const id = row.rents[row.rents.length - 1]._id
      await this.Ajax('/inner/rent/del', {
        _id: id,
        haoId: row._id,
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '删除成功',
            duration: 2000,
          })
          this.getListRefresh()
        })
        .catch(() => {})

      row.gettingdelRent = false
    },
    getChangeTypeDialog(index, row) {
      this.changeTypeflag = !this.changeTypeflag
      if (this.changeTypeflag && row) {
        const rent = row.rents[row.rents.length - 1]
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
    // 获取已交列表
    async getLandordRent() {
      if (this.gettingLandordRent) return

      // 请求接口
      this.gettingLandordRent = true

      await this.Ajax('/inner/rent/listByLandord', {
        monthId: this.$route.query.id,
      })
        .then((res) => {
          this.landordData = res
          const firstkey = Object.keys(res)[0]
          this.activeDate.push(new Date(Number(firstkey)).toLocaleDateString())
          this.landordHistorySearch = new Date(Number(firstkey)).toLocaleDateString()
        })
        .catch(() => {})

      this.gettingLandordRent = false
    },
    // 处理已交时间选择
    getfilterLandordData(v) {
      if (!v) return
      this.activeDate = [new Date(v).toLocaleDateString()]
    },
    // 获取待交房东统计
    async getLandordRentTemp() {
      if (this.gettingLandordRentTemp) return

      // 请求接口
      this.gettingLandordRentTemp = true

      await this.Ajax('/inner/rent/listByLandordTemp', {
        monthId: this.$route.query.id,
      })
        .then(res => {
          this.landordHistoryTemp = res
        })
        .catch(() => {})

      this.gettingLandordRentTemp = false
    },
    // 检查是否空计算合集
    checkObjectTemp(val) {
      if (val.sixList && val.sixList.length) return true
      if (val.eightList && val.eightList.length) return true
      return false
    },
    // 获取月租统计
    getCalRentCount() {
      this.rentCount = {}
      this.monthDetData.forEach((i) => {
        if (!i.rents[0]) return
        const floor = i.hao.substr(0, 1)
        const { rent } = i.rents[0].lease

        if (!this.rentCount[i.fang]) {
          this.rentCount[i.fang] = {
            count: 0,
            list: {},
          }
          this.activeRentCount[i.fang] = []
        }

        if (!this.rentCount[i.fang].list[floor]) {
          this.rentCount[i.fang].list[floor] = {
            count: 0,
            list: [],
          }
        }

        this.rentCount[i.fang].count += rent
        this.rentCount[i.fang].list[floor].count += rent
        this.rentCount[i.fang].list[floor].list.push({
          haoId: i._id,
          hao: i.hao,
          rent: rent,
        })
      })
    },
    // 检查是否为空对象
    checkObject(val) {
      if (typeof val !== 'object') return false
      return !!Object.keys(val).length
    },
  },
}
</script>

<style lang="scss">
.rent-month {
  /* 弹窗表单样式 */
  .add-month-det-dialog,
  .change-type-dialog {
    .el-input,
    .el-select {
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
