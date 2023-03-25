<template>
  <div class="competition-wrapper">
    <div class="filter">
      <el-form class="filter-form" :model="filterData" :inline="true">
        <el-form-item label="竞赛名称">
          <el-input
            v-model="filterData.name"
            placeholder="请输入竞赛名称"
            @input="debounceGetCompetitionListData('name')"
          />
        </el-form-item>
        <el-form-item label="竞赛状态">
          <el-select
            placeholder="请输入竞赛状态"
            v-model="filterData.status"
            clearable
            @change="debounceGetCompetitionListData('status')"
          >
            <template v-for="item in StatusOptions" :key="item.value">
              <el-option :label="item.label" :value="item.value">
                <Tag :value="(item.value as KeyTagToContentType)" />
              </el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="竞赛级别">
          <el-select
            placeholder="请输入竞赛级别"
            v-model="filterData.level"
            clearable
            @change="debounceGetCompetitionListData('level')"
          >
            <template v-for="item in LevelOptions" :key="item.value">
              <el-option :label="item.label" :value="item.value" />
            </template>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <el-empty
      description="查找不到对应的竞赛数据"
      :image-size="280"
      v-if="!competitionList.length"
    />
    <div class="competition-list-wrapper" v-else>
      <template v-for="(item, index) in competitionList" :key="item.id">
        <CompetitionItem
          :class="index === competitionList.length - 1 ? 'last' : ''"
          :id="item.id"
          :name="item.name"
          :level="item.level"
          :address="item.address"
          :sign-up-start-time="item.registrationStartTime"
          :sign-up-end-time="item.registrationEndTime"
          :status="item.status"
          :show-score-btn="isAdmin"
          :is-op-user="isAdmin"
          :awards="item.awards"
          :description="item.description"
          :files="item.files"
          :imgs="item.imgs"
          :instructors-nums="item.instructorsNums"
          :judges="item.judges"
          :mode="item.mode"
          :rounds="item.rounds"
          :sign-up-nums="item.signUpNums"
          :subscription="item.subscription"
          :registration-time="item.registrationTime"
          :work-submission-time="item.workSubmissionTime"
        />
      </template>
    </div>
    <el-pagination
      class="pagination"
      :small="false"
      :page-sizes="[5, 10, 20]"
      :default-current-page="paginationData.currentPage"
      :default-page-size="paginationData.pageSize"
      layout="prev, pager, next, sizes, total"
      :total="total"
      @size-change="
        (newSize) => debounceGetCompetitionListData('size', newSize)
      "
      @current-change="
        (newPage) => debounceGetCompetitionListData('page', newPage)
      "
    />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { debounce } from 'lodash-es'

import CompetitionItem from '@/components/CompetitionItem.vue'
import Tag from '@/components/Tag.vue'
import { useCompetitionListStore } from '@/store/competitionList.store'

import {
  LevelOptions,
  StatusOptions,
  KeyTagToContentType,
  UserRole,
} from '@/constant'
import { useUserStore } from '@/store/user.store'
import { emitter } from '@/utils/bus'

const userStore = useUserStore()
const isAdmin = userStore.userInfo.role === UserRole.admin
const competitionListStore = useCompetitionListStore()
const { getCompetitionListDataAction } = competitionListStore
const debounceGetCompetitionListData = debounce(
  getCompetitionListDataAction,
  500,
  { leading: true },
)
const { filterData, competitionList, paginationData, total } =
  storeToRefs(competitionListStore)
onActivated(() => {
  // 发送网络请求
  debounceGetCompetitionListData('init')
})

const handleRequestCompetitionList = () => {
  debounceGetCompetitionListData('init')
}

onMounted(() => {
  emitter.on('reload-competition-list', handleRequestCompetitionList)
})

onUnmounted(() => {
  emitter.off('reload-competition-list', handleRequestCompetitionList)
})
</script>
<style scoped lang="less">
.competition-wrapper {
  margin-top: 40px;

  .filter {
    margin-bottom: 10px;

    :deep(.el-form-item__label) {
      font-size: 16px;
    }

    .filter-form {
      display: flex;
    }
  }

  .competition-list-wrapper {
    max-height: calc(100vh - 280px);
    overflow: auto;
    border: 1px solid #e0e3ea;
    border-radius: 10px;
    padding: 10px;
    padding-bottom: 0;

    .last {
      margin-bottom: 10px;
    }
  }

  .pagination {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    justify-content: center;
    margin-top: 40px;
    margin-bottom: 40px;
  }
}
</style>
