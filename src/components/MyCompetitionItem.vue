<template>
  <div class="filter">
    <span class="filter-field">竞赛名称: </span>
    <el-input
      clearable
      class="filter-input"
      v-model="filterCompetitionName"
      @input="getListData"
    />
  </div>
  <div class="el-tab-pane-item" v-if="listData.list.length">
    <template v-for="(item, index) in listData.list" :key="item.id">
      <MyCompetitionListItem
        v-if="label !== 'judgementList' && label !== 'releaseList'"
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
        :subscription="item.subscription"
        :name="item.name"
        :level="item.level"
        :address="item.address"
        :sign-up-end-time="item.registrationEndTime"
        :sign-up-start-time="item.registrationEndTime"
        :status="item.status"
        :show-score-btn="true"
        :is-op-user="item.opUser === user"
        :description="item.description"
        :instructors-nums="item.instructorsNums"
        :mode="item.mode"
        :rounds="item.rounds"
        :awards="item.awards"
        :registration-time="item.registrationTime"
        :work-submission-time="item.workSubmissionTime"
        :sign-up-nums="item.signUpNums"
        :judges="item.judges"
        :files="item.files"
        :imgs="item.imgs"
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
        @size-change="(size) => handlePageOrCurrentChange('size', size)"
        @current-change="(page) => handlePageOrCurrentChange('current', page)"
      />
    </div>
  </div>
  <el-empty :description="description" :image-size="280" v-else />
</template>
<script setup lang="ts">
import { debounce } from 'lodash-es'
import { getSelfCompetition } from '../network/competition'
import { emitter } from '../utils/bus'
import MyCompetitionListItem from './MyCompetitionListItem.vue'
import { LabelToContent } from '@/constant'
import { LabelType } from '@/type'
import CompetitionItem from '@/components/CompetitionItem.vue'
import { useUserStore } from '@/store/user.store'

const props = defineProps<{
  label: LabelType
}>()

const filterCompetitionName = ref('')

const user = useUserStore().userInfo.phone

const listData = ref<{ list: any[]; count: number }>({
  list: [],
  count: 0,
})

const paginationData = ref({
  currentPage: 1,
  pageSize: 5,
})

const handlePageOrCurrentChange = (
  type: 'size' | 'current',
  newValue: number,
) => {
  if (type === 'size') {
    paginationData.value.pageSize = newValue
  } else {
    paginationData.value.currentPage = newValue
  }
  getListData()
}

const showConfirmBtn = ref<boolean>(props.label === 'confirmList')
const description = ref<string>(`暂无${LabelToContent[props.label]}竞赛的数据`)

const offset = computed(
  () => (paginationData.value.currentPage - 1) * paginationData.value.pageSize,
)

const getListData = debounce(
  () => {
    getSelfCompetition({
      offset: offset.value,
      pageSize: paginationData.value.pageSize,
      field: props.label,
      competitionName: filterCompetitionName.value,
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
        if (props.label === 'releaseList' || props.label === 'judgementList') {
          item.registrationTime = [
            item.registrationStartTime,
            item.registrationEndTime,
          ]
          item.workSubmissionTime = [
            item.workSubmissionStartTime,
            item.workSubmissionEndTime,
          ]
          item.instructorsNums = JSON.parse(item.instructorsNums || '[]')
          item.signUpNums = JSON.parse(item.signUpNums || '[]')
          item.judges = JSON.parse(item.judges || '[]')
          item.files = JSON.parse(item.files || '[]')
          item.imgs = JSON.parse(item.imgs || '[]')
        }
        item.totalMember = [item.leader, ...item.member, ...item.instructors]
      })

      listData.value = data
    })
  },
  300,
  {
    leading: true,
  },
)

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

.filter {
  display: flex;
  margin: 10px 0 20px 0;
  align-items: center;

  .filter-field {
    margin-right: 20px;
  }

  .filter-input {
    width: 200px;
  }
}

.last {
  margin-bottom: 0px;
}
</style>
