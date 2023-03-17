<template>
  <div class="my-competition-item-wrapper">
    <el-card shadow="hover" class="card" @click="goDetail">
      <el-tag class="tag" :type="tagInfo.type" v-if="showTag">
        {{ tagInfo.content }}
      </el-tag>
      <div class="competition-name layout">
        竞赛名称: {{ competitionName }} ({{ ModeToContentMap[mode] }}模式)
      </div>
      <div class="team-name layout" v-if="name">团队名称: {{ name }}</div>
      <div class="leader layout">队长: {{ leader }}</div>
      <div class="member layout" v-if="member && member.length > 0">
        团队成员: {{ (member || []).join(', ') }}
      </div>
      <div class="instructors layout">
        指导老师: {{ instructors.join(', ') }}
      </div>
      <div class="confirm-status layout" v-if="showStatus">
        <div class="title">团队确认状态:</div>
        <template v-for="item in totalMember" :key="item">
          <div class="confirm-status-item">
            <span class="confirm-status-item-name">{{ item }}</span>
            <el-icon
              class="confirm-status-item-icon"
              color="#7dc050"
              v-if="getUserStatus(item).value === ConfirmStatus.resolve"
            >
              <SuccessFilled />
            </el-icon>
            <el-icon
              class="confirm-status-item-icon"
              color="#dca550"
              v-else-if="getUserStatus(item).value === ConfirmStatus.pending"
            >
              <InfoFilled />
            </el-icon>
            <el-icon color="#e4746f" class="confirm-status-item-icon" v-else>
              <CircleCloseFilled />
            </el-icon>
          </div>
        </template>
      </div>
      <div class="confirm-btn" v-if="showConfirmBtn">
        <el-button type="primary" @click.stop="handleConfirm">
          确认参加
        </el-button>
        <el-button type="danger">拒绝参加</el-button>
      </div>
      <el-button
        v-else
        type="primary"
        class="update-btn"
        @click.stop="handleUpdateSignUp"
      >
        {{
          userStore.userInfo.phone === leader ? '更新报名信息' : '查看报名信息'
        }}
      </el-button>
    </el-card>
    <SignUpForm
      type="update"
      :competition-id="competitionId"
      :competition-name="competitionName"
      :mode="mode"
      title="更新报名信息"
      :op-user="opUser"
      :sign-up="true"
      :instructors-nums="instructorsNums"
      :sign-up-nums="signUpNums"
      :judges="judges"
      :sign-up-dialog-visible="updateVisible"
      :can-update-sign-up-mode="canUpdateSignUpMode"
      @dialog-close="() => (updateVisible = false)"
      :member="member"
      :leader="leader"
      :instructors="instructors"
      :team-name="name"
      :work="work"
      :video="video"
      :sing-up-id="signUpId"
    />
  </div>
</template>
<script setup lang="ts">
import {
  SuccessFilled,
  InfoFilled,
  CircleCloseFilled,
} from '@element-plus/icons-vue'
import type { Action } from 'element-plus'
import { confirmSignUp } from '../network/signup'
import {
  AlreadyProcess,
  KeyTagToContentType,
  TagToContentMap,
  TagToType,
  TagType,
} from '../constant/index'
import { emitter } from '../utils/bus'
import SignUpForm from './SignUpForm.vue'
import {
  ConfirmStatus,
  ModeToContentMap,
  CompetitionStatus,
  CanUpdateSignUpMode,
} from '@/constant'
import { useUserStore } from '@/store/user.store'

const userStore = useUserStore()
const router = useRouter()
const props = defineProps<{
  name?: string
  competitionId: number
  signUpId: number
  competitionName: string
  leader: string
  member?: string[]
  work?: string
  video?: string
  instructors: string[]
  totalMember: string[]
  resolveMember: string[]
  rejectMember: string[]
  showStatus?: boolean
  showConfirmBtn?: boolean
  mode: '0' | '1'
  award: string | null
  currentRound: string
  alreadyProcess: AlreadyProcess
  competitionCurrentRound: string
  competitionStatus: number
  showTag?: boolean
  judges: string[]
  opUser: string
  instructorsNums: string[]
  signUpNums: string[]
  competitionRegistrationEndTime: string
}>()
const updateVisible = ref(false)

const getUserStatus = (user: string) => {
  return computed(() => {
    return props.resolveMember.includes(user)
      ? ConfirmStatus.resolve
      : props.rejectMember.includes(user)
      ? ConfirmStatus.reject
      : ConfirmStatus.pending
  })
}
const canUpdateSignUpMode = ref<CanUpdateSignUpMode>(
  CanUpdateSignUpMode.allDisable,
)
const disableUpdateBtn = ref(true)

watch(
  () => props.competitionStatus,
  (status) => {
    const now = Date.now()
    const registerEndTime = Date.parse(props.competitionRegistrationEndTime)
    const canSignUp = registerEndTime - now > 0

    if (status === CompetitionStatus.signUping) {
      canUpdateSignUpMode.value = 0
      disableUpdateBtn.value = false
    } else if (status === CompetitionStatus.uploading) {
      if (canSignUp) {
        canUpdateSignUpMode.value = 1
      } else {
        canUpdateSignUpMode.value = 2
      }
      disableUpdateBtn.value = false
    } else {
      disableUpdateBtn.value = true
    }
  },
  { immediate: true },
)

const tagInfo = computed<{
  content: string
  type: TagType
}>(() => {
  const {
    competitionCurrentRound,
    currentRound,
    competitionStatus,
    alreadyProcess,
    award,
  } = props
  const isSameRound = currentRound === competitionCurrentRound
  const isCompetitionEnd = competitionStatus === CompetitionStatus.end
  let content!: string
  let type!: TagType
  if (award) {
    content = props.award as string
    type = 'success'
  } else if (
    isSameRound &&
    competitionStatus === CompetitionStatus.waitResult
  ) {
    content = '评比中'
    type = 'warning'
  } else if (isSameRound && isCompetitionEnd) {
    content = '未获奖'
    type = 'danger'
  } else if (!isSameRound && alreadyProcess === AlreadyProcess.yes) {
    content = `${currentRound}淘汰`
    type = 'danger'
  } else {
    content = TagToContentMap[competitionStatus as KeyTagToContentType]
    type = TagToType[competitionStatus as KeyTagToContentType] as TagType
  }
  return {
    content,
    type,
  }
})

const goDetail = () => {
  router.push({
    path: `/competition/detail/${props.competitionId}`,
  })
}

const handleConfirm = () => {
  ElMessageBox.alert('确认参加？', '确认参加该竞赛', {
    confirmButtonText: '确认',
    callback: (action: Action) => {
      if (action === 'confirm') {
        confirmSignUp(props.signUpId).then(() => {
          emitter.emit('reload-my-competition')
        })
      }
    },
  })
}

const handleUpdateSignUp = () => {
  console.log('--')

  updateVisible.value = true
}
</script>
<style scoped lang="less">
.my-competition-item-wrapper {
  position: relative;
  color: #999;
  margin-bottom: 20px;
  cursor: pointer;
  .card {
    position: relative;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.4);
    padding-right: 145px;

    .tag {
      position: absolute;
      right: 30px;
      top: 20px;
    }

    .layout {
      margin-bottom: 10px;
      color: #999;
    }

    .competition-name {
      font-size: 20px;
      color: #222;
    }
    .confirm-status {
      display: flex;
      flex-wrap: wrap;
      .title {
        width: 105px;
      }

      .confirm-status-item {
        display: inline-flex;
        margin-right: 14px;

        .confirm-status-item-name {
          margin-right: 3px;
        }
      }
    }

    .confirm-btn,
    .update-btn {
      position: absolute;
      right: 30px;
      bottom: 20px;
    }
  }
}
</style>
