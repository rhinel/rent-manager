<template>
  <div class="rent-count">
    <div
      class="rent-count-title"
      :key="`${fangi}Title`">
      <el-alert
        class="table-btn"
        type="info"
        title=""
        :closable="false">
        {{ fangi }} 合计：￥{{ fang.count }}元
      </el-alert>
    </div>
    <el-collapse
      v-model="activeRentCount[fangi]"
      :key="`${fangi}Collapse`">
      <el-collapse-item
        v-for="(floor, floori) in fang.list"
        :name="floori"
        :key="floori">
        <template slot="title">
          {{ floori }}楼
          <span class="landord-title">
            合计：￥{{ floor.count }}元
          </span>
        </template>
        <div
          class="landord-content content-bg"
          v-for="(hao, haoi) in floor.list"
          :key="haoi">
          <router-link
            :to="{
              path: '/inner/rent/history',
              query: { id: hao.haoId }
            }">
            <el-button
              type="text"
              size="medium">
              [{{ fangi + hao.hao }}]
            </el-button>
          </router-link>
          <span>
            租金：￥{{ hao.rent }}元
          </span>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  name: 'CollapseRentCountItem',
  props: {
    fang: {
      type: Object,
      default: () => {},
    },
    fangi: {
      type: String,
      default: '',
    },
    activeRentCount: {
      type: Object,
      default: () => {},
    },
  },
}
</script>

<style lang="scss">

/* 月租统计小标题 */
.rent-count:not(:first-child) {
  padding-top: 20px;
}
</style>
