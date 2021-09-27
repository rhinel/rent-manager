<template>
  <div>
    <div class="print-cal-title">
      <div>{{ typeString }}{{ getCalMonth(monthDet.month) }}水电</div>
      <div>抄表日期：{{ getTnewTime() }}</div>
    </div>

    <table class="print-cal-body">
      <tr>
        <th>房间号</th>
        <th>本次水表</th>
        <th>上次水表</th>
        <th>实用数</th>
        <th>小计</th>
        <th />
        <th>本次电表</th>
        <th>上次电表</th>
        <th>实用数</th>
        <th>小计</th>
      </tr>
      <tr
        v-for="item in monthDetData.filter(_ => _.rents[0] && _.fang === typeString)"
        :key="item._id">
        <th>{{ item.hao }}</th>
        <th>
          {{
            item.rents[0].calWater
              ? item.rents[0].calWater.tnew.water
              : '--'
          }}吨
        </th>
        <th>
          {{
            item.rents[0].calWater
              ? item.rents[0].calWater.old.water
              : '--'
          }}吨
        </th>
        <th>
          {{
            item.rents[0].calWater
              ? item.rents[0].calWater.tnew.water
                - item.rents[0].calWater.old.water
              : '--'
          }}吨
        </th>
        <th>
          {{
            item.rents[0].calWater
              ? getCal(item.rents[0].calWater, 'water')
              : '--'
          }}元
        </th>
        <th>
          {{
            item.rents[0].calElectric
              ? item.rents[0].calElectric.tnew.electric
              : '--'
          }}度
        </th>
        <th>
          {{
            item.rents[0].calElectric
              ? item.rents[0].calElectric.old.electric
              : '--'
          }}度
        </th>
        <th>
          {{
            item.rents[0].calElectric
              ? item.rents[0].calElectric.tnew.electric
                - item.rents[0].calElectric.old.electric
              : '--'
          }}度
        </th>
        <th>
          {{
            item.rents[0].calElectric
              ? getCal(item.rents[0].calElectric, 'ele')
              : '--'
          }}元
        </th>
        <th>
          {{
            item.rents[0].calGas
              ? item.rents[0].calGas.tnew.gas
              : '--'
          }}方
        </th>
        <th>
          {{
            item.rents[0].calGas
              ? item.rents[0].calGas.old.gas
              : '--'
          }}方
        </th>
        <th>
          {{
            item.rents[0].calGas
              ? item.rents[0].calGas.tnew.gas
                - item.rents[0].calGas.old.gas
              : '--'
          }}方
        </th>
        <th>
          {{
            item.rents[0].calGas
              ? getCal(item.rents[0].calGas, 'gas')
              : '--'
          }}元
        </th>
      </tr>
    </table>
  </div>
</template>

<script>
  export default {
    name: 'PrintCalTable',
    props: {
      monthDet: {
        type: Object,
        default: () => ({}),
      },
      monthDetData: {
        type: Array,
        default: () => [],
      },
      typeString: {
        type: String,
        default: '',
      },
    },
    methods: {
      // 获取月份计算
      getCalMonth(monthStr) {
        if (!monthStr) return ''
        const date = new Date(monthStr)
        date.setMonth(date.getMonth() - 1)
        let month = date.getMonth() + 1
        month = month > 9 ? month : `0${month}`
        return `${date.getFullYear()}-${month}`
      },
      // 获取抄表日期，计租数据中第一条可用数据的时间
      getTnewTime() {
        const takeTime = this.monthDetData.find(item => item.rents[0] && item.rents[0].calWater)
        if (!takeTime) return ''
        return this.GetDateFormat(takeTime.rents[0].calWater.tnew.addTime)
      },
      // 计算张贴的价格
      getCal(rent, type) {
        // 用于张贴展示，不做真实计费，所有计费按月度周期来计算
        let defaultCal = type === 'water' ? (
          this.monthDet.defaultCalWaterPrice
          || this.defaultCalWaterPrice
        ) : (
          this.monthDet.defaultCalElePrice
          || this.defaultCalElePrice
        )
        defaultCal = type === 'gas' ? (
          this.monthDet.defaultCalGasPrice
          || this.defaultCalGasPrice
        ) : defaultCal
        const {
          calType, minPrice, singlePrice, stepPrice,
        } = defaultCal

        let gap = type === 'water'
          ? (rent.tnew.water - rent.old.water)
          : (rent.tnew.electric - rent.old.electric)
        gap = type === 'gas'
          ? (rent.tnew.gas - rent.old.gas)
          : gap
        gap = Math.max(0, gap, minPrice)

        let result = 0
        if (calType === 'single') {
          result = gap * singlePrice
        } else if (calType === 'step') {
          result = stepPrice.reduce((cal, price, index) => {
            if (!price.price) return cal
            const prevPrices = stepPrice[index - 1] || {}
            if (
              (gap > (prevPrices.step || 0) && gap <= price.step)
              || (index === (stepPrice.length - 1) && gap >= price.step)
            ) {
              return gap * price.price
            }
            return cal
          }, result)
        }
        return Math.floor(Math.round(result * 100) / 100)
      },
    },
  }
</script>

<style lang="scss">
@media print {
  /* 特殊打印样式 */
  .rent-month {
    .el-tabs__header {
      display: none !important;
    }
  }
}

/* 打印标题样式 */
.print-cal-title {
  text-align: center;

  div:first-child {
    letter-spacing: 0.5em;
    padding-bottom: 40px;
    font-size: 40px;
  }

  div:last-child {
    font-size: 20px;
    padding-bottom: 40px;
  }
}

/* 打印报表样式 */
.print-cal-body {
  width: 100%;
  font-size: 20px;

  tr {
    display: flex;
    border-top: 1px solid #000;

    &:last-child {
      border-bottom: 1px solid #000;
    }

    th {
      flex: 1;
      border-left: 1px solid #000;
      padding: 15px 0;

      &:last-child {
        border-right: 1px solid #000;
      }
    }
  }
}
</style>
