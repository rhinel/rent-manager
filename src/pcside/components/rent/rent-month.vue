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
            :loading="gettingListRefresh"
            @click="getListRefresh">
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
          top="50px"
          custom-class="add-month-det-dialog"
          :title="addRent.fanghao + ardDialogTitle"
          :visible.sync="addRentflag"
          :close-on-click-modal="false"
          :key="'addMonthDet' + dialogId"
          @closed="onAddRentDialogClose">
          <el-form
            :model="addRent"
            :rules="addRentrules"
            ref="addRent">
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
              <div v-else>
                暂无
              </div>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="本月租金"
                  prop="lease.rent"
                  :label-width="ardLabelWidth">
                  <el-input
                    v-model.number="addRent.lease.rent"
                    auto-complete="off"
                    placeholder="输入本月租金">
                    <template slot="prepend">
                      ￥
                    </template>
                    <template slot="append">
                      元
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  prop="calRentResult"
                  :label="addRent.fix ? '租金修正' : '租金合计'"
                  :label-width="ardLabelWidth">
                  <el-input
                    v-model.number="addRent.calRentResult"
                    auto-complete="off"
                    placeholder="输入本月租金合计">
                    <template slot="prepend">
                      ￥
                    </template>
                    <template slot="append">
                      元
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="计租时间"
                  prop="addTime"
                  :label-width="ardLabelWidth">
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
              :loading="gettingAddRent"
              @click="getAddRentDialog">
              取消
            </el-button>
            <el-button
              type="primary"
              :loading="gettingAddRent"
              @click="getAddRent">
              确定
            </el-button>
          </div>
        </el-dialog>

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
          :data="filterMonthDetData"
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
                      :rent="getRent(props)"
                      v-if="props.row.rents.length" />
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
                      :rent="getRent(props)"
                      v-if="props.row.rents.length" />
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
              <el-tag v-if="scope.row.rents.length > 1">
                多次
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="计租信息">
            <el-table-column
              label="房租信息"
              width="150">
              <template slot-scope="scope">
                <table-lease-view-item
                  :lease="getRent(scope).lease"
                  v-if="scope.row.rents.length" />
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
                    :rent="getRent(scope)"
                    v-if="scope.row.rents.length" />
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
                    :rent="getRent(scope)"
                    v-if="scope.row.rents.length" />
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column
              label="合计/计费时间"
              width="170">
              <template slot-scope="scope">
                <table-rent-view-item
                  highline
                  :rent="getRent(scope)"
                  v-if="scope.row.rents.length" />
              </template>
            </el-table-column>
            <el-table-column
              label="状态/更新时间"
              width="180">
              <template slot-scope="scope">
                <table-rent-type-item
                  highline
                  :rent="getRent(scope)"
                  v-if="scope.row.rents.length" />
              </template>
            </el-table-column>
            <el-table-column
              label="备注"
              min-width="140">
              <template slot-scope="scope">
                <table-rent-remark-item
                  :rent="getRent(scope)"
                  v-if="scope.row.rents.length" />
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
                v-model="scope.row.dRentPopFlag"
                placement="top"
                width="150"
                trigger="click"
                v-if="scope.row.rents.length && monthDet.newest">
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
                <el-button
                  size="small"
                  type="danger"
                  class="show-pop"
                  :loading="scope.row.gettingdelRent"
                  slot="reference">
                  删除
                </el-button>
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
            :loading="gettingLandordRentTemp"
            @click="getLandordRentTemp">
            刷新
          </el-button>
        </div>

        <el-collapse
          v-loading.body="gettingLandordRentTemp"
          v-model="activeLandordHistoryTemp"
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
              type="six"
              :newest="monthDet.newest"
              :landord="landordHistoryTemp" />

            <collapse-landord-item
              type="eight"
              :newest="monthDet.newest"
              :landord="landordHistoryTemp" />
          </el-collapse-item>
        </el-collapse>

        <el-alert
          title="暂无数据！请先处理单据状态"
          type="info"
          :closable="false"
          v-if="!gettingLandordRentTemp && !checkObjectTemp(landordHistoryTemp)" />
      </el-tab-pane>

      <el-tab-pane
        label="交房东历史"
        name="landordHistory">
        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button
            type="primary"
            :loading="gettingLandordRent"
            @click="getLandordRent">
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

        <!-- 备注修改表单 -->
        <el-dialog
          custom-class="daily-remark-dialog"
          :title="dailyRemark.day + drdDialogTitle"
          :visible.sync="dailyRemarkflag"
          :close-on-click-modal="false"
          :key="'dailyRemark' + dialogId"
          @close="onDailyRemarkDialogClose">
          <el-input
            v-model="dailyRemark.content"
            type="textarea"
            placeholder="请输入备注内容，注意拍照留底"
            :rows="4" />
          <div
            class="dialog-footer"
            slot="footer">
            <el-button
              :loading="gettingDailyRemark"
              @click="getDailyRemarkDialog">
              取消
            </el-button>
            <el-button
              type="primary"
              :loading="gettingDailyRemark"
              @click="getDailyRemark">
              确定
            </el-button>
          </div>
        </el-dialog>

        <el-collapse
          v-loading.body="gettingLandordRent"
          v-model="activeDate"
          v-if="checkObject(landordData)">
          <el-collapse-item
            :name="new Date(Number(index)).toLocaleDateString()"
            v-for="(item, index) in landordData"
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
                  <el-button
                    type="text"
                    slot="reference">
                    合计：￥{{ item.all }}元
                  </el-button>
                </el-popover>
              </span>

              <el-popover
                placement="right"
                trigger="hover">
                <div
                  class="landord-title"
                  style="white-space: pre-wrap;"
                  v-text="
                    dailyRemarkList[index] && dailyRemarkList[index].content
                      ? dailyRemarkList[index].content
                      : '暂无备注，注意拍照留底'
                  " />
                <span slot="reference">
                  <el-button
                    type="text"
                    size="medium"
                    :disabled="!monthDet.newest"
                    @click.stop="getDailyRemarkDialog(
                      $event,
                      index
                    )">{{
                      dailyRemarkList[index] && dailyRemarkList[index].content
                        ? '备注'
                        : '无备注'
                    }}</el-button>
                </span>
              </el-popover>
            </template>

            <collapse-landord-item
              type="six"
              :newest="monthDet.newest"
              :landord="item" />

            <collapse-landord-item
              type="eight"
              :newest="monthDet.newest"
              :landord="item" />
          </el-collapse-item>
        </el-collapse>

        <el-alert
          title="暂无数据！请先处理单据状态"
          type="info"
          :closable="false"
          v-if="!gettingLandordRent && !checkObject(landordData)" />
      </el-tab-pane>

      <el-tab-pane
        label="月租统计"
        name="rentCount">
        <collapse-rent-count-item
          :fang="fang"
          :fangi="fangi"
          :active-rent-count="activeRentCount"
          v-for="(fang, fangi) in rentCount"
          :key="fangi" />

        <el-alert
          title="暂无数据！请先处理单据状态"
          type="info"
          :closable="false"
          v-if="!checkObject(rentCount)" />
      </el-tab-pane>

      <el-tab-pane
        label="6坊65栋水电张贴"
        name="waterandeleCal6">
        <print-cal-table
          type-string="6坊65栋"
          :month-det="monthDet"
          :month-det-data="monthDetData" />
      </el-tab-pane>

      <el-tab-pane
        label="8坊68栋水电张贴"
        name="waterandeleCal8">
        <print-cal-table
          type-string="8坊68栋"
          :month-det="monthDet"
          :month-det-data="monthDetData" />
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
        tableMaxHeight: 300,
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

        // 增加备注
        drdDialogTitle: '交租备注',
        dailyRemarkflag: false,
        gettingDailyRemark: false,
        gettingDailyRemarkList: false,
        dailyRemarkList: {},
        dailyRemark: {},
        dailyRemarkClear: {
          monthId: this.$route.query.id,
          _id: '',
          day: '',
          daytime: '',
          content: '',
        },

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
        result = (add.calWater.calWaterResult || 0)
          + (add.calElectric.calElectricResult || 0)
          + (add.lease.rent || 0)
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
        this.getResetDailyRemark()
      },
      landordHistoryTempActive() {
        this.getLandordRentTemp()
      },
      landordHistoryActive() {
        this.getLandordRent()
        this.getDailyRemarkList()
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
      async getAddRentDialog(index, row) {
        this.addRentflag = !this.addRentflag
        if (this.addRentflag && row) {
          // 用于展示
          this.addRent.calWater = row.calWaterId
          this.addRent.calElectric = row.calElectricId
          // 编辑部分
          this.addRent.lease = {}.hasOwnProperty.call(row.leaseId, 'rent')
            ? JSON.parse(JSON.stringify(row.leaseId)) : this.addRent.lease
          this.addRent.fanghao = row.fanghao
          this.addRent.haoId = row._id
          this.addRent.remark = row.leaseId.remark || ''
          this.addRent.addTime = new Date()
        }
        await new Promise(r => setTimeout(r, 300))
      },
      getResetAddRent() {
        this.addRent = Object.assign(
          {},
          this.addRent,
          JSON.parse(JSON.stringify(this.addRentClear))
        )
        this.dialogId = Date.now()
      },
      onAddRentDialogClose() {
        this.$refs.addRent.resetFields()
        this.getResetAddRent()
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
          })
          .then(this.getAddRentDialog)
          .then(this.getListRefresh)
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
          })
          .then(this.getListRefresh)
          .catch(() => {})

        row.gettingdelRent = false
      },
      async getChangeTypeDialog(index, row) {
        this.changeTypeflag = !this.changeTypeflag
        if (this.changeTypeflag && row) {
          const rent = row.rents[row.rents.length - 1]
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
        this.changeType.isIndeterminate = checkedCount > 0
          && checkedCount < this.types.length
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
      async getDailyRemarkList() {
        if (this.gettingDailyRemarkList) return

        // 请求接口
        this.gettingDailyRemarkList = true
        await this.Ajax('/inner/rent/dailyRemarkList', {
          monthId: this.$route.query.id,
        })
          .then(res => {
            this.dailyRemarkList = res
          })
          .catch(() => {})

        this.gettingDailyRemarkList = false
      },
      getDailyRemarkDialog(event, daytime) {
        this.dailyRemarkflag = !this.dailyRemarkflag
        if (daytime) {
          const dayDate = new Date(Number(daytime)).toLocaleDateString()
          this.dailyRemark.day = dayDate
          this.dailyRemark.daytime = daytime
          const det = this.dailyRemarkList[daytime]
          if (det) {
            this.dailyRemark._id = det._id
            this.dailyRemark.content = det.content
          }
        }
      },
      getResetDailyRemark() {
        this.dailyRemark = Object.assign(
          {},
          this.dailyRemark,
          JSON.parse(JSON.stringify(this.dailyRemarkClear)),
        )
        this.dialogId = Date.now()
      },
      onDailyRemarkDialogClose() {
        setTimeout(() => {
          this.getResetDailyRemark()
        }, 500)
      },
      async getDailyRemark() {
        if (this.gettingDailyRemark) return
        // 提交接口
        this.gettingChangeType = true

        const _data = Object.assign({}, this.dailyRemark)
        await this.Ajax('/inner/rent/dailyRemark', _data)
          .then((res) => {
            this.$message({
              type: 'success',
              message: _data._id ? '备注更新成功' : '备注添加成功',
              duration: 2000,
            })
            this.getDailyRemarkDialog()
            _data._id = res._id
            this.dailyRemarkList[_data.daytime] = _data
          })
          .catch(() => {})

        this.gettingChangeType = false
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
          // 使用当月计租第一个的租住信息
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
