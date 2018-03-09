<template>
  <div>
    <div v-if="rent.type">
      <el-popover
        v-for="item in rent.type.type"
        :key="item"
        placement="top"
        trigger="hover">
        {{ getDate(rent.type.typeTime[item]) }}
        <el-tag
          slot="reference"
          :type="item != 2 ? 'success' : ''"
          class="show-tag show-tag3">
          {{ typesVal[item] }}
        </el-tag>
      </el-popover>
    </div>
    <el-tag v-if="(rent.type && !rent.type.type.length) || !rent.type">
      新建
    </el-tag>
    <div
      :class="{ unimportant: highline }">
      {{ getDate(rent.updateTime) }}
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mixinDef } from 'pcside/js/mixins'

export default {
  name: 'TableRentTypeItem',
  mixins: [mixinDef],
  props: {
    rent: {
      type: Object,
      default: () => ({}),
    },
    highline: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState({
      typesVal: state => state.config.typesVal,
    }),
  },
}
</script>
