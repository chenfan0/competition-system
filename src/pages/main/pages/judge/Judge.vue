<template>
  <div class="judge-wrapper">
    <img class="icon" src="@/assets/image/back.png" alt="back" @click="back" />
    <div class="header">
      竞赛名称:
      {{ competitionDetail.name }}({{ competitionDetail.currentRound }})
    </div>
    <div class="rounds">
      竞赛轮次: {{ competitionDetail.rounds.join(' - ') }}
    </div>
    <!-- <div class="count">
      <div class="next-count">当前已晋级下一轮数量:</div>
      <div class="current-count">入选本轮报名数量: {{ signUpCount }}</div>
    </div> -->

    <el-tabs v-model="activeName" class="demo-tabs" v-if="isWaitResultStatus">
      <el-tab-pane label="待处理" name="raw" lazy>
        <JudgeItem
          :mode="competitionDetail.mode"
          :rounds="competitionDetail.rounds"
          :is-last-round="isLastRound"
          :cur-competition-round="competitionDetail.currentRound"
          :id="Number(id)"
          :is-raw="true"
          :awards="competitionDetail.awards"
          :is-wait-result-status="isWaitResultStatus"
        />
      </el-tab-pane>
      <el-tab-pane label="已处理" name="process" lazy>
        <JudgeItem
          :mode="competitionDetail.mode"
          :rounds="competitionDetail.rounds"
          :is-last-round="isLastRound"
          :cur-competition-round="competitionDetail.currentRound"
          :id="Number(id)"
          :is-raw="false"
          :awards="competitionDetail.awards"
          :is-wait-result-status="isWaitResultStatus"
        />
      </el-tab-pane>
    </el-tabs>
    <JudgeItem
      v-else
      :mode="competitionDetail.mode"
      :rounds="competitionDetail.rounds"
      :is-last-round="isLastRound"
      :cur-competition-round="competitionDetail.currentRound"
      :id="Number(id)"
      :is-raw="true"
      :awards="competitionDetail.awards"
      :is-wait-result-status="isWaitResultStatus"
    />
    <el-button
      class="next-btn"
      type="primary"
      @click="setNextRound"
      v-if="isWaitResultStatus"
    >
      {{ isLastRound ? '公布结果' : `进入${nextRound}` }}
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import JudgeItem from './components/JudgeItem.vue'
import {
  getCompetitionDetail,
  setCompetitionNextRound,
} from '@/network/competition'
import { CompetitionStatus } from '@/constant'

const router = useRouter()
const route = useRoute()

const id = route.params.id as string
const activeName = ref('raw')
const competitionDetail = ref<{
  name: string
  rounds: string[]
  currentRound: string
  mode: string
  awards: string[]
  status: number
}>({
  name: '',
  rounds: [],
  currentRound: '',
  mode: '',
  awards: [],
  status: 0,
})
const nextRound = computed(() => {
  const index = competitionDetail.value.rounds.indexOf(
    competitionDetail.value.currentRound,
  )
  return competitionDetail.value.rounds[index + 1]
})
const isLastRound = computed(() => {
  const len = competitionDetail.value.rounds.length
  if (
    competitionDetail.value.currentRound ===
    competitionDetail.value.rounds[len - 1]
  ) {
    return true
  }
  return false
})
const isWaitResultStatus = computed(
  () => competitionDetail.value.status === CompetitionStatus.waitResult,
)

getCompetitionDetail(id).then((res) => {
  const { currentRound, name, mode, rounds, awards, status } = res.data
  competitionDetail.value.currentRound = currentRound
  competitionDetail.value.name = name
  competitionDetail.value.mode = mode
  competitionDetail.value.rounds = rounds.split('\n')
  competitionDetail.value.awards = awards.split('\n')
  competitionDetail.value.status = status
})

const back = () => {
  router.back()
}

const setNextRound = () => {
  setCompetitionNextRound(Number(id))
}
</script>

<style lang="less" scoped>
.judge-wrapper {
  position: relative;
  padding: 10px;
  color: #606266;

  .icon {
    display: flex;
    width: 60px;
    height: 60px;
    border-radius: 10px;
    background-image: url('@/assets/image/back.png');

    &:hover {
      cursor: pointer;
      background-color: rgba(30, 30, 30, 0.4);
    }
  }

  .header {
    font-size: 22px;
    margin: 10px 0;
  }

  .current-round,
  .rounds,
  .count {
    margin-bottom: 10px;
  }

  .count {
    display: flex;

    .next-count {
      margin-right: 20px;
    }
  }

  .next-btn {
    position: absolute;
    top: 80px;
    right: 30px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    .pagination {
      position: fixed;
      bottom: 30px;
    }
  }
}
</style>
