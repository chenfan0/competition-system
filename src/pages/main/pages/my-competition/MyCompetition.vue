<template>
  <div class="my-competition-wrapper">
    <el-tabs v-model="activeName" class="tabs" @tabChange="handleTabChange">
      <el-tab-pane
        :label="LabelToContent[item]"
        :name="item"
        v-for="item in tabPanelData"
        :key="item"
        :lazy="true"
      >
        <MyCompetitionItem :label="item" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { TabPaneName } from 'element-plus'
import { useMyCompetitionStore } from '@/store/myCompetition.store'
import MyCompetitionItem from '@/components/MyCompetitionItem.vue'
import { LabelToContent } from '@/constant'
import { emitter } from '@/utils/bus'

const myCompetitionStore = useMyCompetitionStore()
const { tabPanelData, activeName } = storeToRefs(myCompetitionStore)

const handleTabChange = (label: TabPaneName) => {
  emitter.emit('reload-my-competition', label)
}
</script>
<style scoped lang="less">
.my-competition-wrapper {
  .tabs {
    padding: 15px;
  }
}
</style>
