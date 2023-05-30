<template>
  <div class="echarts-bar" style="width: 100%; height: 300px"></div>
</template>
<script setup lang="ts">
import echarts from './init'

const props = defineProps<{
  text: string
  xData: string[]
  seriesData: number[]
}>()

onMounted(() => {
  const bar = echarts.init(document.querySelector('.echarts-bar')!)
  bar.setOption({
    title: {
      text: props.text,
      left: 'center',
    },
    tooltip: {},
    xAxis: {
      data: [
        '竞赛未开始',
        '报名进行中',
        '等待开放作品提交',
        '作品上传中',
        '评委评判中',
        '竞赛已结束',
      ],
    },
    yAxis: {},
    series: [
      {
        name: '竞赛数量',
        type: 'bar',
        data: props.seriesData,
      },
    ],
  })
})
</script>
<style scoped lang="less"></style>
