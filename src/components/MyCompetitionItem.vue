<template>
  <div class="el-tab-pane-item" v-if="listData.list.length">
    <template v-for="(item, index) in listData.list" :key="item.id">
      <MyCompetitionListItem
        v-if="label !== 'judgementList'"
        :class="index === listData.list.length - 1 ? 'last' : ''"
        :mode="item.mode"
        :sign-up-id="item.id"
        :competition-id="Number(item.competitionId)"
        :competition-name="item.competitionName"
        :leader="item.leader"
        :instructors="item.instructors"
        :total-member="item.totalMember"
        :resolve-member="item.resolveMember || []"
        :reject-member="item.rejectMember || []"
        :name="item.name"
        :member="item.member"
        :show-status="true"
        :show-confirm-btn="showConfirmBtn"
        :award="item.award"
        :current-round="item.currentRound"
        :already-process="item.alreadyProcess"
        :competition-current-round="item.competitionCurrentRound"
        :competition-status="item.competitionStatus"
        :show-tag="label === 'instructoredList' || label === 'signUpedList'"
        :judges="item.competitionJudges"
        :op-user="item.competitionOpUser"
        :instructors-nums="item.competitionInstructorsNums"
        :sign-up-nums="item.competitionSignUpNums"
        :competition-registration-end-time="item.competitionRegistrationEndTime"
        :work="item.work"
        :video="item.video"
      />
      <CompetitionItem
        v-else
        :class="index === listData.list.length - 1 ? 'last' : ''"
        :id="item.id"
        :title="item.name"
        :level="item.level"
        :address="item.address"
        :sign-up-end-time="item.registrationEndTime"
        :sign-up-start-time="item.registrationEndTime"
        :status="item.status"
        :show-score-btn="true"
      />
    </template>
    <div class="pagination-wrapper">
      <el-pagination
        class="pagination"
        :total="listData.count"
        layout="prev, pager, next, sizes, total"
        :page-sizes="[5, 10, 20]"
        :default-current-page="paginationData.currentPage"
        :default-page-size="paginationData.pageSize"
      />
    </div>
  </div>
  <el-empty :description="description" :image-size="280" v-else />
</template>
<script setup lang="ts">
import { getSelfCompetition } from '../network/competition'
import { emitter } from '../utils/bus'
import MyCompetitionListItem from './MyCompetitionListItem.vue'
import { LabelToContent } from '@/constant'
import { LabelType } from '@/type'
import CompetitionItem from '@/components/CompetitionItem.vue'

const props = defineProps<{
  label: LabelType
  filterCompetitionName: string
}>()

const listData = ref<{ list: any[]; count: number }>({
  list: [],
  count: 0,
})

const paginationData = ref({
  currentPage: 1,
  pageSize: 5,
})
const showConfirmBtn = ref<boolean>(props.label === 'confirmList')
const description = ref<string>(`暂无${LabelToContent[props.label]}竞赛的数据`)

const offset = computed(
  () => (paginationData.value.currentPage - 1) * paginationData.value.pageSize,
)

const getListData = () => {
  getSelfCompetition({
    offset: offset.value,
    pageSize: paginationData.value.pageSize,
    field: props.label,
    competitionName: props.filterCompetitionName,
  }).then((res) => {
    const data = res.data

    const { list } = data || {}
    list.forEach((item: any) => {
      ;[
        'competitionInstructorsNums',
        'competitionJudges',
        'competitionSignUpNums',
        'instructors',
        'member',
        'rejectMember',
        'resolveMember',
      ].forEach((key) => {
        item[key] = JSON.parse(item[key] || '[]')
      })
      item.totalMember = [item.leader, ...item.member, ...item.instructors]
    })

    listData.value = data
  })
}

const handleConfirmCompetition = (labels: string[] = []) => {
  if (labels.includes(props.label)) {
    getListData()
  }
}

onMounted(() => {
  emitter.on('reload-my-competition', handleConfirmCompetition as any)
})

onUnmounted(() => {
  emitter.off('reload-my-competition', handleConfirmCompetition as any)
})
// 初始化获取数据
getListData()
</script>
<style scoped lang="less">
.pagination-wrapper {
  display: flex;
  justify-content: center;
  .pagination {
    position: fixed;
    bottom: 30px;
  }
}

.el-tab-pane-item {
  padding: 10px;
  border: 1px solid #e0e3ea;
  border-radius: 10px;
  overflow: auto;
  max-height: calc(100vh - 300px);
}

.last {
  margin-bottom: 0px;
}
</style>
