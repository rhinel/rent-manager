<template>
  <div>
    <div v-if="lease.name">
      <el-tag>{{ lease.payDay }}日</el-tag>
      <el-popover
        placement="top"
        trigger="hover">
        <div>姓名：{{ lease.name }}</div>
        <div>联系方式：{{ lease.call }}</div>
        <div v-if="rentInline">
          房租：￥{{ lease.rent }}元
        </div>
        <div>租住起始：{{ getDate(lease.leaserange[0]) }}</div>
        <div>租住结束：{{ getDate(lease.leaserange[1]) }}</div>
        <div>入住时间：{{ getDate(lease.addTime) }}</div>
        <div>搬出时间：{{ getDate(lease.outTime) }}</div>
        <div>备注：{{ lease.remark || '--' }}</div>
        <el-tag
          slot="reference"
          class="show-tag">
          {{ payTypeVal[lease.payType] }}
        </el-tag>
      </el-popover>
      <div v-if="!rentInline">
        ￥
        <span class="main-txt-highline">
          {{ lease.rent }}
        </span>
        元
      </div>
    </div>
    <div v-else>
      暂无
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mixinDef } from 'pcside/js/mixins'

export default {
  name: 'TableLeaseViewItem',
  mixins: [mixinDef],
  props: {
    lease: {
      type: Object,
      default: () => ({}),
    },
    rentInline: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState({
      payTypeVal: state => state.config.payTypeVal,
    }),
  },
}
</script>

