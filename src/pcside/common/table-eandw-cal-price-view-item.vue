<template>
  <div>
    <div v-if="lease[type] && lease[type].calType">
      <div>
        低消：
        {{ lease[type].minPrice }}
        吨
      </div>
      <div v-if="lease[type].calType == 'single'">
        单价：￥
        {{ lease[type].singlePrice }}
        元/吨
      </div>
      <div v-else>
        <el-popover
          placement="right"
          trigger="hover">
          <div
            v-for="(item, index) in lease[type].stepPrice"
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
  </div>
</template>

<script>
export default {
  name: 'TableEandwCalPriceViewItem',
  props: {
    lease: {
      type: Object,
      default: () => {},
    },
    type: {
      type: String,
      default: '',
    },
  },
}
</script>
