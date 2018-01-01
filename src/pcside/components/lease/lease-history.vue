<template>
  <div class="lease-history">
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
          v-model="leaseDataSearch"
          placeholder="搜索" />
      </div>
    </div>

    <!-- 租住数据表 -->
    <el-table
      class="lease-table"
      ref="leaseTable"
      :max-height="tableMaxHeight"
      :data="filterLeaseData"
      v-loading.body="gettingListRefresh"
      stripe
      border>
      <el-table-column
        prop="fanghao"
        label="房屋"
        width="120" />
      <el-table-column
        label="租户信息">
        <el-table-column
          prop="name"
          label="姓名/联系方式"
          width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.name || '--' }}</div>
            <div>{{ scope.row.call || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="leaseId.leaserange"
          label="租住周期"
          width="180">
          <template slot-scope="scope">
            <div>{{ getTime(scope.row.leaserange && scope.row.leaserange[0]) }}</div>
            <div>{{ getTime(scope.row.leaserange && scope.row.leaserange[1]) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="leaseId.payDay"
          label="交租时间/交租方式"
          width="180">
          <template slot-scope="scope">
            <div>{{ scope.row.payDay ? `每月${scope.row.payDay}日` : '--' }}</div>
            <div>{{ payTypeVal[scope.row.payType] || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="leaseId.remark"
          label="备注">
          <template slot-scope="scope">
            <el-popover
              placement="top"
              trigger="hover">
              <div class="remark-pop">
                {{ scope.row.remark }}
              </div>
              <div
                class="show-tag"
                slot="reference">
                <div class="remark-tag">
                  {{ scope.row.remark }}
                </div>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          prop="leaseId.leaserange"
          label="入住/搬出时间"
          width="180">
          <template slot-scope="scope">
            <div>{{ getTime(scope.row.addTime) }}</div>
            <div>{{ getTime(scope.row.outTime) }}</div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        label="计费信息">
        <el-table-column
          label="水费"
          width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.calWaterPrice">
              <div>
                低消：{{ scope.row.calWaterPrice.minPrice }}
                吨
              </div>
              <div v-if="scope.row.calWaterPrice.calType == 'single'">
                单价：￥
                {{ scope.row.calWaterPrice.singlePrice }}
                元/吨
              </div>
              <div v-else>
                <el-popover
                  placement="right"
                  trigger="hover">
                  <div
                    v-for="(item, index) in scope.row.calWaterPrice.stepPrice"
                    :key="index">
                    {{ item.step }}吨及以下￥{{ item.price }}元/吨；
                  </div>
                  超出按最后阶梯计算。
                  <div
                    class="show-tag"
                    slot="reference">
                    <el-tag>阶梯</el-tag>
                  </div>
                </el-popover>
              </div>
            </div>
            <div v-else>暂无</div>
          </template>
        </el-table-column>
        <el-table-column
          label="电费"
          width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.calElePrice">
              <div>
                低消：
                {{ scope.row.calElePrice.minPrice }}度
              </div>
              <div v-if="scope.row.calElePrice.calType == 'single'">
                单价：￥
                {{ scope.row.calElePrice.singlePrice }}
                元/度
              </div>
              <div v-else>
                <el-popover
                  placement="right"
                  trigger="hover">
                  <div
                    v-for="(item, index) in scope.row.calElePrice.stepPrice"
                    :key="index">
                    {{ item.step }}度及以下￥{{ item.price }}元/度；
                  </div>
                  超出按最后阶梯计算。
                  <div
                    class="show-tag"
                    slot="reference">
                    <el-tag>阶梯</el-tag>
                  </div>
                </el-popover>
              </div>
            </div>
            <div v-else>暂无</div>
          </template>
        </el-table-column>
        <el-table-column
          label="当前租金/押金"
          width="150">
          <template slot-scope="scope">
            <div>
              租金：￥
              {{ scope.row.rent || 0 }}
              元/月
            </div>
            <div>
              押金：￥
              {{ (scope.row.deposit || 0) }}
              元
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        label="操作"
        width="100">
        <template slot-scope="scope">
          <el-popover
            placement="top"
            width="150"
            trigger="click"
            v-if="scope.row._id"
            v-model="scope.row.dLeasePopFlag">
            <p>确认删除此租住历史？此行为不可撤销</p>
            <div class="pop-cont">
              <el-button
                size="mini"
                type="text"
                @click="scope.row.dLeasePopFlag = false">
                取消
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="delLease(scope.$index, scope.row)">
                确定
              </el-button>
            </div>
            <div
              slot="reference">
              <el-button
                size="small"
                type="danger"
                :loading="scope.row.gettingdelLease">
                删除
              </el-button>
            </div>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'LeaseHistory',
  data() {
    return {
      gettingListRefresh: false,
      tableMaxHeight: 0,
      leaseList: [],
      leaseDataSearch: '',
    }
  },
  computed: {
    filterLeaseData() {
      if (!this.leaseDataSearch) {
        return this.leaseList
      }
      const searchKeys = ['fanghao', 'name', 'call', 'remark']

      const _leaseDataSearch = new RegExp(this.leaseDataSearch, 'i')
      return this.leaseData.filter(item => {
        const testObject = {}
        searchKeys.forEach((key) => {
          testObject[key] = item[key]
        })
        const testItem = Object.values(testObject).join(' ')
        return _leaseDataSearch.test(testItem)
      })
    },
    ...mapState({
      payTypeVal: state => state.config.payTypeVal,
      typesVal: state => state.config.typesVal,
    }),
  },
  beforeCreate() {
    this.$store.dispatch('updateMenu', '/inner/lease/index')
  },
  created() {
    this.getListRefresh()
  },
  mounted() {
    window.onresize = () => {
      const height = window.innerHeight || document.body.clientHeight
      const offsetTop = this.$refs.leaseTable.$el.getBoundingClientRect().top
      this.tableMaxHeight = height - offsetTop - 20 - 0.5
    }
    this.$nextTick(() => window.onresize())
  },
  beforeDestroy() {
    window.onresize = null
  },
  methods: {
    // 时间格式化
    getTime(t) {
      return t ? this.GetTimeFormat(t) : '--'
    },
    // 拉取入住信息列表
    async getListRefresh() {
      if (this.gettingListRefresh) return

      // 拉取接口
      this.gettingListRefresh = true

      await this.Ajax('/inner/lease/list', {
        haoId: this.$route.query.haoid,
      })
        .then(res => {
          this.leaseList = res
        })
        .catch(() => {})

      this.gettingListRefresh = false
    },
    async delLease(index, row) {
      row.dLeasePopFlag = false
      if (row.gettingdelLease) return

      // 拉取接口
      row.gettingdelLease = true

      await this.Ajax('/inner/lease/del', {
        _id: row._id,
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

      row.gettingdelLease = false
    },
  },
}
</script>
