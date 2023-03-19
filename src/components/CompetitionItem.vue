<template>
  <div class="competition-item-wrapper" @click="goDetail">
    <el-card shadow="hover" class="card">
      <div class="title">
        <div class="content">竞赛名称：{{ title }}</div>
        <div class="subscription">
          <el-icon><Star /></el-icon>
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
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'

import { CompetitionStatus, LevelMap } from '@/constant/index'
import type { KeyTagToContentType, KeyLevelMap } from '@/constant/index'
import Tag from '@/components/Tag.vue'

const router = useRouter()

// eslint-disable-next-line vue/no-setup-props-destructure
const { title, level, address, signUpStartTime, signUpEndTime, status, id } =
  defineProps<{
    id: number
    title: string
    level: string | number
    address: string
    signUpStartTime: string
    signUpEndTime: string
    status: number | string
    showScoreBtn?: boolean
    isOpUser?: boolean
  }>()

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
      font-size: 20px;
      color: #222;
      margin-bottom: 8px;

      .subscription {
        margin-left: 10px;
      }
    }

    .level {
      margin-bottom: 8px;
    }

    .address {
      margin-bottom: 8px;
    }
    .time {
      display: flex;
      .start-time {
        margin-right: 10px;
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
  }
}
</style>
