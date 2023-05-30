<template>
  <div class="judge-wrapper">
    <img class="icon" src="@/assets/image/back.png" alt="back" @click="back" />
    <div class="header">
      竞赛名称:
      {{ competitionDetail.name }}
      ({{
        competitionDetail.status === CompetitionStatus.end
          ? '已结束'
          : competitionDetail.currentRound
      }})
    </div>
    <div class="rounds">
      竞赛轮次: {{ competitionDetail.rounds.join(' - ') }}
    </div>
    <!-- <div class="count">
      <div class="next-count">当前已晋级下一轮数量:</div>
      <div class="current-count">入选本轮报名数量: {{ signUpCount }}</div>
    </div> -->

    <el-tabs
      v-model="activeName"
      class="demo-tabs"
      v-if="isWaitResultStatus && isJudge"
    >
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
          :is-judge="isJudge"
          @process-completed="handleProcessCompleted"
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
          :is-judge="isJudge"
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
      :is-judge="isJudge"
    />
    <el-tooltip effect="dark" placement="top" :content="tooltipContent">
      <div class="next-btn">
        <el-button
          type="primary"
          @click="setNextRound"
          :disabled="!processCompleted"
          v-if="isWaitResultStatus && isJudge"
        >
          {{ isLastRound ? '公布结果' : `进入${nextRound}` }}
        </el-button>
      </div>
    </el-tooltip>
    <div class="export-btn">
      <el-button
        type="primary"
        @click="getAwardFile"
        :disabled="!processCompleted"
        v-if="isJudge"
      >
        导出名单
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { Action } from 'element-plus'
import JudgeItem from './components/JudgeItem.vue'
import {
  getCompetitionDetail,
  setCompetitionNextRound,
} from '@/network/competition'
import { BASE_URL, CompetitionStatus } from '@/constant'
import { useUserStore } from '@/store/user.store'
import { emitter } from '@/utils/bus'

const router = useRouter()
const route = useRoute()

const userStore = useUserStore()

const id = route.params.id as string
const activeName = ref('raw')
const competitionDetail = ref<{
  name: string
  rounds: string[]
  currentRound: string
  mode: string
  awards: string[]
  status: number
  opUser?: string
  judges: string[]
}>({
  name: '',
  rounds: [],
  currentRound: '',
  mode: '',
  awards: [],
  status: 0,
  judges: [],
})

const processCompleted = ref(false)

const isJudge = computed(() =>
  competitionDetail.value.judges.includes(userStore.userInfo.phone),
)
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

const tooltipContent = ref(`存在未处理的报名信息，无法进行该操作`)
const isWaitResultStatus = computed(
  () => competitionDetail.value.status === CompetitionStatus.waitResult,
)

const requestCompetitionDetail = () => {
  getCompetitionDetail(id).then((res) => {
    const { currentRound, name, mode, rounds, awards, status, opUser, judges } =
      res.data
    competitionDetail.value.currentRound = currentRound
    competitionDetail.value.name = name
    competitionDetail.value.mode = mode
    competitionDetail.value.rounds = rounds.split('\n')
    competitionDetail.value.awards = awards.split('\n')
    competitionDetail.value.status = status
    competitionDetail.value.opUser = opUser
    competitionDetail.value.judges = JSON.parse(judges || '[]') as string[]
  })
}

requestCompetitionDetail()

const back = () => {
  router.back()
}
const setNextRound = () => {
  ElMessageBox.alert(
    isLastRound.value ? '确认公布结果?' : `确认进入${nextRound.value}`,
    '请确认',
    {
      confirmButtonText: '确认',
      closeOnClickModal: true,
      callback: async (action: Action) => {
        if (action === 'confirm') {
          try {
            setCompetitionNextRound(Number(id))
            requestCompetitionDetail()
            emitter.emit('signup-info-reload')
          } catch (e) {
            console.log(e)
          }
        }
      },
    },
  )
}

const getAwardFile = async () => {
  const { data } = await axios.get(
    `${BASE_URL}/competition/excel?competitionId=${id}}`,
    {
      headers: {
        Authorization: `Bearer ${userStore.userInfo.token}`,
      },
      responseType: 'blob',
    },
  )

  const blob = new Blob([data])
  const a = document.createElement('a') as HTMLAnchorElement
  a.href = URL.createObjectURL(blob)
  a.download = `${competitionDetail.value.name}.xlsx`
  a.click()
}

const handleProcessCompleted = () => {
  processCompleted.value = true
  tooltipContent.value = isLastRound ? '公布结果' : `进入${nextRound.value}`
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

  .export-btn {
    position: absolute;
    top: 20px;
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
