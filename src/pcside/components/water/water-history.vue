<template>
  <div class="water-history">
    <el-tabs
      v-model="activeName">
      <el-tab-pane
        label="抄表历史"
        name="water">

        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button
            :loading="gettingListRefresh"
            type="primary"
            @click="getWaterList">
            刷新
          </el-button>
          <div class="table-btn-input">
            <el-input
              v-model="waterDataSearch"
              placeholder="搜索" />
          </div>
        </div>

        <!-- 水费数据表 -->
        <el-table
          v-loading.body="gettingListRefresh"
          ref="waterTable"
          :max-height="tableMaxHeight"
          :data="filterWaterData"
          class="water-table"
          stripe
          border>
          <el-table-column
            prop="fanghao"
            label="房屋"
            width="180" />
          <el-table-column
            prop="water"
            label="抄表数(吨)"
            width="180" />
          <el-table-column
            prop="addTime"
            label="抄表时间"
            width="180">
            <template slot-scope="scope">
              {{ getTime(scope.row.addTime) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="备注" />
          <el-table-column
            label="操作"
            width="100">
            <template slot-scope="scope">
              <el-popover
                v-model="scope.row.dWaterPopFlag"
                placement="top"
                width="150"
                trigger="click">
                <p>确认删除抄表记录吗？计费历史收费历史等将不受影响，仅影响当前数据</p>
                <div class="pop-cont">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.dWaterPopFlag = false">
                    取消
                  </el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    @click="delWater(scope.$index, scope.row)">
                    确定
                  </el-button>
                </div>
                <div
                  slot="reference">
                  <el-button
                    :loading="scope.row.gettingdelWater"
                    size="small"
                    type="danger">
                    删除
                  </el-button>
                </div>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane
        label="计费历史"
        name="waterCal">

        <!-- 顶部按钮组 -->
        <div class="table-btn">
          <el-button
            :loading="gettingListRefresh2"
            type="primary"
            @click="getWaterCalList">
            刷新
          </el-button>
          <div class="table-btn-input">
            <el-input
              v-model="waterCalDataSearch"
              placeholder="搜索" />
          </div>
        </div>

        <!-- 水费数据表 -->
        <el-table
          v-loading.body="gettingListRefresh2"
          ref="waterCalTable"
          :max-height="tableMaxHeight"
          :data="filterWaterCalData"
          class="water-table"
          stripe
          border>
          <el-table-column
            prop="fanghao"
            label="房屋"
            width="180" />
          <el-table-column
            label="今次(吨)">
            <el-table-column
              prop="tnew.water"
              label="抄表数"
              width="100" />
            <el-table-column
              prop="tnew.addTime"
              label="抄表时间"
              width="180">
              <template slot-scope="scope">
                {{ getTime(scope.row.tnew.addTime) }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="前次(吨)">
            <el-table-column
              prop="old.water"
              label="底表数"
              width="100" />
            <el-table-column
              prop="old.addTime"
              label="底表时间"
              width="180">
              <template slot-scope="scope">
                {{ getTime(scope.row.old.addTime) }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            prop="gap"
            label="小计(吨)"
            width="110" />
          <el-table-column
            label="计费">
            <el-table-column
              prop="calWaterResult"
              label="计费"
              width="180">
              <template slot-scope="scope">
                <el-tag>
                  {{ scope.row.fix ? '修' : '计' }}
                </el-tag>
                ￥{{ scope.row.calWaterResult }}元
              </template>
            </el-table-column>
            <el-table-column
              prop="addTime"
              label="计费时间"
              width="180">
              <template slot-scope="scope">
                {{ getTime(scope.row.addTime) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="remark"
              label="计费备注"
              min-width="180">
              <template slot-scope="scope">
                <el-popover
                  placement="right"
                  trigger="hover">
                  <div>
                    低消：
                    {{ scope.row.calWater.minPrice }}
                    吨
                  </div>
                  <div v-if="scope.row.calWater.calType == 'single'">
                    单价：￥
                    {{ scope.row.calWater.singlePrice }}
                    元/吨
                  </div>
                  <div
                    v-if="scope.row.calWater.calType == 'step'"
                    class="history-step-p-wrap">
                    <div class="step-p-title">
                      阶梯：
                    </div>
                    <div class="step-p-val">
                      <div
                        v-for="(item, index) in scope.row.calWater.stepPrice"
                        :key="index">
                        阶梯{{ item.step }}吨及以下￥{{ item.price }}元/吨
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="scope.row.calWater.calType == 'step'">
                    超过最后一个阶梯的部分将按照最后一个阶梯计费
                  </div>
                  <div
                    v-if="scope.row.fix">
                    本计费结果已被修正，计算方式仅供参考
                  </div>
                  <div
                    slot="reference"
                    class="show-tag">
                    <el-tag>计费方式</el-tag>
                  </div>
                </el-popover>
                {{ scope.row.remark }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="操作"
            width="100">
            <template slot-scope="scope">
              <el-popover
                v-model="scope.row.dCalWaterPopFlag"
                placement="top"
                width="150"
                trigger="click">
                <p>确认删除计费记录吗？抄表历史收费历史等将不受影响，仅影响当前数据</p>
                <div class="pop-cont">
                  <el-button
                    size="mini"
                    type="text"
                    @click="scope.row.dCalWaterPopFlag = false">
                    取消
                  </el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    @click="delCalWater(scope.$index, scope.row)">
                    确定
                  </el-button>
                </div>
                <div
                  slot="reference">
                  <el-button
                    :loading="scope.row.gettingdelCalWater"
                    size="small"
                    type="danger">
                    删除
                  </el-button>
                </div>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mixinDef } from 'pcside/js/mixins'

export default {
  name: 'WaterHistory',
  mixins: [mixinDef],
  data() {
    return {
      gettingListRefresh: false,
      gettingListRefresh2: false,
      activeName: 'water',
      houseData: {},

      tableMaxHeight: 200,
      waterList: [],
      waterDataSearch: '',
      waterCalList: [],
      waterCalDataSearch: '',
    }
  },
  computed: {
    filterWaterData() {
      if (!this.waterDataSearch) {
        return this.waterList
      }
      const searchKeys = ['fanghao', 'water', 'remark']

      const _waterDataSearch = new RegExp(this.waterDataSearch, 'i')
      return this.waterList.filter(item => {
        const testObject = {}
        searchKeys.forEach((key) => {
          testObject[key] = item[key]
        })
        const testItem = Object.values(testObject).join(' ')
        return _waterDataSearch.test(testItem)
      })
    },
    filterWaterCalData() {
      if (!this.waterCalDataSearch) {
        return this.waterCalList
      }
      const searchKeys = ['fanghao', 'remark']

      const _waterCalDataSearch = new RegExp(this.waterCalDataSearch, 'i')
      return this.waterCalList.filter(item => {
        const testObject = {}
        searchKeys.forEach((key) => {
          testObject[key] = item[key]
        })
        const testItem = Object.values(testObject).join(' ')
        return _waterCalDataSearch.test(testItem)
      })
    },
  },
  watch: {
    activeName(n) {
      if (n === 'water') this.getWaterList()
      if (n === 'waterCal') this.getWaterCalList()
    },
  },
  beforeCreate() {
    this.$store.dispatch('updateMenu', '/inner/water/index')
  },
  created() {
    if (this.activeName === 'water') this.getWaterList()
    if (this.activeName === 'waterCal') this.getWaterCalList()
  },
  mounted() {
    window.onresize = () => {
      const height = window.innerHeight || document.body.clientHeight
      const offsetTop = this.$refs.waterTable.$el.getBoundingClientRect().top
      const offsetTopCal = this.$refs.waterCalTable.$el.getBoundingClientRect().top
      this.tableMaxHeight = height - Math.max(offsetTop, offsetTopCal) - 20 - 0.5
    }
    this.$nextTick(() => window.onresize())
  },
  beforeDestroy() {
    window.onresize = null
  },
  methods: {
    async getWaterList() {
      if (this.gettingListRefresh) return

      // 请求接口
      this.gettingListRefresh = true

      await this.Ajax('/inner/water/list', { haoId: this.$route.query.haoid })
        .then(res => {
          this.waterList = res
        })
        .catch(() => {})

      this.gettingListRefresh = false
    },
    async getWaterCalList() {
      if (this.gettingListRefresh2) return

      // 请求接口
      this.gettingListRefresh2 = true

      await this.Ajax('/inner/water/calList', { haoId: this.$route.query.haoid })
        .then(res => {
          this.waterCalList = res
        })
        .catch(() => {})

      this.gettingListRefresh2 = false
    },
    async delWater(index, row) {
      row.dWaterPopFlag = false
      if (row.gettingdelWater) return

      // 请求接口
      row.gettingdelWater = true

      await this.Ajax('/inner/water/del', {
        _id: row._id,
        haoId: row.haoId._id,
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '删除成功',
            duration: 2000,
          })
          this.getWaterList()
        })
        .catch(() => {})

      row.gettingdelWater = false
    },
    async delCalWater(index, row) {
      row.dCalWaterPopFlag = false
      if (row.gettingdelCalWater) return

      // 请求接口
      row.gettingdelCalWater = true

      await this.Ajax('/inner/water/delCal', {
        _id: row._id,
        haoId: row.haoId._id,
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '删除成功',
            duration: 2000,
          })
          this.getWaterCalList()
        })
        .catch(() => {})

      row.gettingdelCalWater = false
    },
  },
}
</script>
