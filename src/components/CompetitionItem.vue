<template>
  <div class="competition-item-wrapper">
    <el-card shadow="hover" class="card" @click="goDetail">
      <div class="title">
        <div class="content">竞赛名称：{{ name }}</div>
        <div class="subscription">
          <el-tooltip effect="dark" content="订阅该竞赛" placement="top">
            <el-icon @click.stop="handleSubscription">
              <Star v-if="!subscription" />
              <StarFilled class="star-filled" v-else />
            </el-icon>
          </el-tooltip>
        </div>
      </div>
      <div class="level">竞赛级别: {{ LevelMap[level as KeyLevelMap] }}</div>
      <div class="address">竞赛地点: {{ address }}</div>
      <div class="time">
        <div class="start-time">报名开始时间: {{ signUpStartTime }}</div>
        <div class="end-time">报名截止时间: {{ signUpEndTime }}</div>
      </div>
      <div class="tag">
        <Tag :value="(status as KeyTagToContentType)" />
      </div>
      <el-button
        v-if="showScoreBtn"
        class="score-btn"
        type="primary"
        @click.stop="handleClickScore"
      >
        {{
          status === CompetitionStatus.waitResult && !isOpUser
            ? '进入评判'
            : '查看报名信息'
        }}
      </el-button>
      <el-button
        v-if="showScoreBtn && isOpUser"
        class="update-btn"
        type="primary"
        @click.stop="handleUpdateCompetition"
      >
        更新竞赛数据
      </el-button>
    </el-card>

    <div class="update-form-wrapper" v-if="updateVisible">
      <CompetitionForm
        class="update-form"
        type="update"
        :name="name"
        :description="description"
        :address="address"
        :level="level"
        :instructors-nums="instructorsNums"
        :mode="mode"
        :rounds="rounds"
        :awards="awards"
        :registration-time="registrationTime"
        :work-submission-time="workSubmissionTime"
        :sign-up-nums="signUpNums"
        :judges="judges"
        :tags="tags"
        :files="files"
        :id="id"
        :imgs="imgs"
        @update-success="handleUpdateSuccess"
        @delete-success="handleDeleteSuccess"
      />
      <el-icon class="close-icon" @click="updateVisible = false">
        <Close />
      </el-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Star, Close, StarFilled } from '@element-plus/icons-vue'

import { emitter } from '../utils/bus'
import CompetitionForm from './CompetitionForm.vue'
import { CompetitionStatus, LevelMap } from '@/constant/index'
import type { KeyTagToContentType, KeyLevelMap } from '@/constant/index'
import Tag from '@/components/Tag.vue'
import { subscribe } from '@/network/subscription'

const router = useRouter()

// eslint-disable-next-line vue/no-setup-props-destructure
const { name, level, address, signUpStartTime, signUpEndTime, status, id } =
  defineProps<{
    id: number
    name: string
    description?: string
    address: string
    level: number
    instructorsNums?: number[]
    mode?: string
    rounds?: string
    awards?: string
    registrationTime?: string[]
    workSubmissionTime?: string[]
    signUpNums?: number[]
    judges?: string[]
    tags?: number[]
    files?: string[]
    signUpStartTime: string
    signUpEndTime: string
    status: number | string
    showScoreBtn?: boolean
    isOpUser?: boolean
    imgs?: string[]
    subscription: boolean
  }>()

const updateVisible = ref(false)

const goDetail = () => {
  router.push({
    path: `/competition/detail/${id}`,
  })
}

const handleClickScore = () => {
  router.push({
    path: `/judge/${id}`,
  })
}

const handleUpdateCompetition = () => {
  updateVisible.value = true
}

const handleUpdateSuccess = () => {
  updateVisible.value = false
  emitter.emit('reload-my-competition', ['releaseList'])
  emitter.emit('reload-competition-list')
}
const handleDeleteSuccess = () => {
  updateVisible.value = false
  console.log('deleteSuccess')
  emitter.emit('reload-competition-list')

  emitter.emit('reload-my-competition', ['releaseList'])
}

const handleSubscription = () => {
  subscribe(id).then(() => {
    emitter.emit('reload-competition-list')
    emitter.emit('reload-recommend-list')
    emitter.emit('reload-my-competition', [
      'releaseList',
      'judgementList',
      'subscriptionList',
    ])
  })
}
</script>

<style scoped lang="less">
.competition-item-wrapper {
  margin-bottom: 20px;
  .card {
    position: relative;
    font-size: 15px;
    color: #999;
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    cursor: pointer;
    .title {
      display: flex;
      align-items: center;
      font-size: 20px;
      color: #222;
      margin-bottom: 8px;

      .subscription {
        margin-left: 10px;
        font-size: 25px;

        .star-filled {
          color: rgb(230, 230, 65);
        }
      }
    }

    .level {
      margin-bottom: 8px;
    }

    .address {
      margin-bottom: 8px;
    }
    .time {
      .start-time {
        margin-bottom: 8px;
      }
    }

    .tag {
      position: absolute;
      top: 20px;
      right: 30px;
    }

    .score-btn {
      position: absolute;
      bottom: 20px;
      right: 30px;
    }

    .update-btn {
      position: absolute;
      bottom: 20px;
      right: 160px;
    }
  }
}

.update-form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 70px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;
  background-color: rgba(222, 223, 224, 0.7);

  .close-icon {
    position: absolute;
    right: 15%;
    top: 20px;
    font-size: 70px;
    cursor: pointer;
    border-radius: 10px;
    &:hover {
      background-color: #c8c9cc;
    }
  }
  .card {
    background-color: #fff;
    height: 80vh;
    overflow: auto;
  }
  z-index: 9;
}
</style>
