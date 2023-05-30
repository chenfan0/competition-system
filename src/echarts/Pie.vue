<template>
  <div :class="className" style="width: 100%; height: 300px"></div>
</template>
<script setup lang="ts">
import echarts from './init'

const props = defineProps<{
  text: string
  data: { value: number; name: string }[]
  className: string
}>()

onMounted(() => {
  const pie = echarts.init(document.querySelector(`.${props.className}`)!)
  pie.setOption({
    title: {
      text: props.text || '竞赛级别',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: props.data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  })
})
</script>
<style scoped lang="less"></style>
