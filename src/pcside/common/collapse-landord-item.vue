<template>
  <div v-if="landord[`${type}List`]">
    <!-- 统计部分 -->
    <div
      class="landord-content"
      style="font-weight: bold;"
      v-if="landord[`${type}List`].length">
      <span class="collapse-btn">
        {{ type === 'six' ? '6坊65栋' : '8坊68栋' }}
      </span>
      <span>[房租合计￥{{ landord[type] }}元]</span>
      <span>[租金合计￥{{ landord[`${type}Rent`] }}元]</span>
      <span>[水电燃气合计￥{{ landord[`${type}Cost`] }}元]</span>
    </div>

    <!-- 租单信息 -->
    <div
      class="landord-content content-bg"
      v-for="i in landord[`${type}List`]"
      :key="i._id">
      <router-link
        class="collapse-btn"
        :to="{
          path: '/inner/rent/history',
          query: { id: i.haoId }
        }">
        <el-button
          type="text"
          size="medium">
          [{{ i.fanghao }}]
        </el-button>
      </router-link>

      <span>[房租￥{{ i.calRentResult }}元]</span>
      <span>[租金￥{{ i.lease.rent }}元]</span>
      <span>[水电燃气￥{{ i.cost }}元]</span>

      <div class="landord-check">
        <el-checkbox
          v-model="i.checkBill"
          :disabled="i.checkBilling || !newest"
          @change="checkBillChange($event, i)">
          已对账
          <i
            class="el-icon-loading"
            v-if="i.checkBilling" />
        </el-checkbox>
      </div>

      <span class="landord-content-type">
        交租方式：<el-tag>{{ payTypeVal[i.lease.payType] }}</el-tag>
      </span>

      <span>备注：{{ i.remark }}</span>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'CollapseLandordItem',
    props: {
      landord: {
        type: Object,
        default: () => ({}),
      },
      type: {
        type: String,
        default: '',
      },
      newest: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      ...mapState({
        payTypeVal: state => state.config.payTypeVal,
      }),
    },
    methods: {
      // 提交对账变化
      async checkBillChange(newValue, i) {
        if (i.checkBilling) return

        // 提交接口
        i.checkBilling = true

        await this.Ajax('/inner/rent/checkBill', {
          rentId: i._id,
          checkBill: i.checkBill,
        })
          .then(() => {
            this.$message({
              type: 'success',
              message: '更新成功',
              duration: 2000,
            })
            i.checkBill = newValue
          })
          .catch(() => {
            i.checkBill = !newValue
          })

        i.checkBilling = false
      },
    },
  }
</script>
