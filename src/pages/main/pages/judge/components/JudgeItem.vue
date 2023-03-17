<template>
  <el-table :data="signUpList" style="width: 100%">
    <el-table-column prop="id" label="id" width="60" align="center" />
    <el-table-column
      show-overflow-tooltip
      prop="name"
      label="队伍名称"
      align="center"
      width="150"
      v-if="mode === CompetitionMode.TeamMode"
    >
      <template #default="scope"> {{ scope.row.name ?? '无' }}</template>
    </el-table-column>
    <el-table-column
      show-overflow-tooltip
      prop="member"
      label="报名成员"
      align="center"
      width="150"
    />
    <el-table-column
      prop="instructors"
      show-overflow-tooltip
      label="指导老师"
      align="center"
      width="150"
    />

    <el-table-column
      prop="file"
      show-overflow-tooltip
      label="作品"
      align="center"
    />

    <el-table-column
      prop="score"
      label="评分"
      align="center"
      width="150"
      v-if="isWaitResultStatus"
    >
      <template #default="scope">
        <!-- {{ scope.row }} -->
        <el-select
          @change="(val: number) => statusChange('round', val, scope.row.id)"
          v-model="scoreStatus[scope.row.id]"
          v-if="!isLastRound"
        >
          <el-option :value="1" label="晋级下一轮"></el-option>
          <el-option :value="0" label="未晋级"></el-option>
        </el-select>
        <el-select
          placeholder="请选择奖项"
          v-model="awardsStatus[scope.row.id]"
          @change="(val: string) => statusChange('award', val, scope.row.id)"
          v-else
        >
          <el-option value="" label="未获奖"></el-option>
          <template v-for="item in awards" :key="item">
            <el-option :value="item" :label="item"></el-option>
          </template>
        </el-select>
      </template>
    </el-table-column>
  </el-table>
  <div class="pagination-wrapper">
    <el-pagination
      class="pagination"
      :total="signUpCount"
      layout="prev, pager, next, sizes, total"
      :page-sizes="[5, 10, 20]"
      :default-current-page="paginationData.currentPage"
      :default-page-size="paginationData.pageSize"
    />
  </div>
</template>
<script setup lang="ts">
import {
  getSignUpListByCompetitionId,
  promoteSignUpBySignUpId,
  awardSignUpBySignUpId,
} from '@/network/signup'
import { CompetitionMode } from '@/constant'

const props = defineProps<{
  id: number
  isRaw: boolean
  mode: string
  isLastRound: boolean
  curCompetitionRound: string
  rounds: string[]
  awards: string[]
  isWaitResultStatus: boolean
}>()

const scoreStatus = ref<Record<string, 0 | 1>>({})
const awardsStatus = ref<Record<string, string>>({})

const paginationData = ref({
  currentPage: 1,
  pageSize: 10,
})

const signUpList = ref<
  {
    member: string
    instructors: string
    mode: string
    name: string
    id: number
  }[]
>([])

const signUpCount = ref<number>(0)

getSignUpListByCompetitionId(props.id, props.isRaw ? 0 : 1).then((res) => {
  const data = res.data
  const { total, signUpList: _signUpList } = data || {}
  signUpList.value = _signUpList.map(
    ({
      instructors,
      member,
      leader,
      mode,
      name,
      id,
      alreadyProcess,
      currentRound,
      award,
    }: any) => {
      if (alreadyProcess) {
        scoreStatus.value[id] =
          currentRound === props.curCompetitionRound ? 0 : 1
      }
      if (props.isLastRound) {
        awardsStatus.value[id] = award
      }
      return {
        member: [leader, ...JSON.parse(member || '[]')],
        instructors: JSON.parse(instructors || '[]'),
        mode,
        name,
        id,
        award,
      }
    },
  )
  signUpCount.value = total
})

const statusChange = (
  type: 'round' | 'award',
  val: number | string,
  id: number,
) => {
  if (type === 'round') {
    let currentRound: string
    const { rounds, curCompetitionRound } = props
    if (val === 0) {
      // 未晋级
      currentRound = curCompetitionRound
    } else {
      currentRound = rounds[rounds.indexOf(curCompetitionRound) + 1]
      // 晋级
    }
    // 发送网络请求
    promoteSignUpBySignUpId(id, currentRound)
  } else {
    awardSignUpBySignUpId(id, val as string)
  }
}
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
</style>
