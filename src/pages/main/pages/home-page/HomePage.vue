<template>
  <div class="home-page-wrapper">
    <el-carousel
      height="320px"
      :interval="5000"
      arrow="always"
      class="carousel"
    >
      <el-carousel-item v-for="item in carouselImgList" :key="item.default">
        <img :src="item.default" alt="" class="img" />
      </el-carousel-item>
    </el-carousel>
    <!-- 推荐竞赛 -->
    <div class="recommend-wrapper wrapper">
      <div class="title">推荐竞赛</div>
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
          :tags="item.tags"
          :mode="item.mode"
          :rounds="item.rounds"
          :sign-up-nums="item.signUpNums"
          :subscription="item.subscription"
          :registration-time="item.registrationTime"
          :work-submission-time="item.workSubmissionTime"
        />
      </template>
      <div class="more" @click="handleClickMore">查看更多</div>
    </div>
    <!-- 竞赛流程 -->
    <div class="process-wrapper wrapper">
      <div class="title">竞赛流程</div>
      <div class="process-item-wrapper">
        <el-card shadow="hover" class="process-item">
          <img class="icon" src="@/assets/image/process/报名.svg" alt="" />
          <div class="content">报名</div>
        </el-card>

        <el-card shadow="hover" class="process-item">
          <img class="icon" src="@/assets/image/process/报名确认.svg" alt="" />
          <div class="content">成员确认</div>
        </el-card>

        <el-card shadow="hover" class="process-item">
          <img class="icon" src="@/assets/image/process/上传作品.svg" alt="" />
          <div class="content">上传作品</div>
        </el-card>

        <el-card shadow="hover" class="process-item">
          <img class="icon" src="@/assets/image/process/评委评判.svg" alt="" />
          <div class="content">评委评判</div>
        </el-card>

        <el-card shadow="hover" class="process-item">
          <img class="icon" src="@/assets/image/process/公布结果.svg" alt="" />
          <div class="content">公布结果</div>
        </el-card>
      </div>
    </div>
    <!-- 竞赛数据 -->
    <div class="competition-data-wrapper wrapper">
      <div class="title">竞赛数据</div>
      <Pie
        v-if="competitionLevelData.length"
        text="竞赛级别"
        class-name="pie-level"
        :data="competitionLevelData"
      />
      <Bar
        v-if="
          competitionStatusData.keys.length &&
          competitionStatusData.values.length
        "
        :x-data="competitionStatusData?.keys"
        text="竞赛状态"
        :series-data="competitionStatusData.values"
      />
      <Pie
        v-if="competitionTagData.length"
        class-name="pie-tag"
        text="竞赛标签"
        :data="competitionTagData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Pie from '@/echarts/Pie.vue'
import Bar from '@/echarts/Bar.vue'
import {
  getCompetitionRecommend,
  getCompetitionLevelData,
  getCompetitionStatusData,
  getCompetitionTagData,
} from '@/network/competition'
import { useUserStore } from '@/store/user.store'
import { UserRole } from '@/constant'
import { emitter } from '@/utils/bus'
import router from '@/router'

const userStore = useUserStore()
const isAdmin = userStore.userInfo.role === UserRole.admin

const carouselImgList = import.meta.glob('@/assets/image/carousel/**', {
  eager: true,
}) as Record<string, { default: string }>

const competitionList = ref<any[]>([])
const competitionLevelData = ref<{ value: number; name: string }[]>([])
const competitionStatusData = ref<{ keys: string[]; values: number[] }>({
  keys: [],
  values: [],
})
const competitionTagData = ref<{ value: number; name: string }[]>([])

const requestCompetitionRecommend = () => {
  getCompetitionRecommend().then(({ data }) => {
    console.log(data.list)
    data.list.forEach((item: any) => {
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
      item.tags = JSON.parse(item.tags || '[]')
      item.files = JSON.parse(item.files || '[]')
      item.imgs = JSON.parse(item.imgs || '[]')
    })
    competitionList.value = data.list
  })
}
const handleClickMore = () => {
  emitter.emit('change-header-active', 1)
  router.push({
    path: '/competition',
  })
}

onMounted(() => {
  emitter.on('reload-recommend-list', requestCompetitionRecommend)
})
onUnmounted(() => {
  emitter.off('reload-recommend-list', requestCompetitionRecommend)
})
requestCompetitionRecommend()

// 获取图标相关数据
getCompetitionLevelData().then((res) => {
  competitionLevelData.value = res.data
})
getCompetitionStatusData().then((res) => {
  competitionStatusData.value = res.data
})
getCompetitionTagData().then((res) => {
  competitionTagData.value = res.data
})
</script>
<style scoped lang="less">
.home-page-wrapper {
  padding: 20px 0;
  .wrapper {
    margin-top: 30px;
  }
  .title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 30px;
  }
  .carousel {
    border-radius: 10px;
    .img {
      width: 100%;
      height: 100%;
    }
  }

  .process-wrapper {
    .process-item-wrapper {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;

      .process-item {
        flex: 1;
        margin: 0 5px;
        height: 170px;
        border-radius: 10px;

        .icon {
          width: 100%;
          height: 100px;
        }

        .content {
          height: 20px;
          margin-top: 10px;
          text-align: center;
          font-weight: 700;
        }
      }
    }
  }

  .recommend-wrapper {
    .more {
      text-align: center;
      text-decoration: underline;
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
