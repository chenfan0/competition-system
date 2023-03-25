<template>
  <el-table :data="signUpList" style="width: 100%">
    <!-- <el-table-column prop="id" label="id" width="60" align="center" /> -->
    <el-table-column
      show-overflow-tooltip
      prop="name"
      label="队伍名称"
      align="center"
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
      prop="work"
      show-overflow-tooltip
      label="作品"
      align="center"
    >
      <template #default="scope">
        <div class="work" @click="download(scope.row.work)">
          {{ scope.row.work?.originalname }}
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="video"
      show-overflow-tooltip
      label="作品预览视频"
      align="center"
      width="150"
    >
      <template #default="scope">
        <div class="video-operation" v-if="scope.row.video">
          <span @click="() => watchVideo(scope.row.video)">查看视频</span>
          <span @click="download(scope.row.video)">下载视频</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column
      prop="score"
      label="评分"
      align="center"
      width="150"
      v-if="isWaitResultStatus && !isOpUser"
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
  <div class="video-wrapper" v-if="showVideo">
    <el-icon class="icon" @click="closeVideo"><Close /></el-icon>
    <video autoplay class="video" :src="videoUrl" controls />
  </div>
</template>
<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import {
  getSignUpListByCompetitionId,
  promoteSignUpBySignUpId,
  awardSignUpBySignUpId,
} from '@/network/signup'
import { CompetitionMode, BASE_URL } from '@/constant'
import { downloadFile } from '@/utils'
import { emitter } from '@/utils/bus'

const props = defineProps<{
  id: number
  isRaw: boolean
  mode: string
  isLastRound: boolean
  curCompetitionRound: string
  rounds: string[]
  awards: string[]
  isWaitResultStatus: boolean
  isOpUser: boolean
}>()

const showVideo = ref(false)
const videoUrl = ref<string | undefined>()

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
    work?: { filename: string; originalname: string }
    video?: { filename: string; originalname: string }
  }[]
>([])

const signUpCount = ref<number>(0)

const getSignUpList = () => {
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
        work,
        video,
      }: any) => {
        if (alreadyProcess) {
          scoreStatus.value[id] =
            currentRound === props.curCompetitionRound ? 0 : 1
        }
        if (props.isLastRound) {
          awardsStatus.value[id] = award || (props.isRaw ? award : '')
        }
        if (work) {
          work = JSON.parse(work)
        }
        if (video) {
          video = JSON.parse(video)
        }
        return {
          member: [leader, ...JSON.parse(member || '[]')],
          instructors: JSON.parse(instructors || '[]'),
          mode,
          name,
          id,
          award,
          work,
          video,
        }
      },
    )
    signUpCount.value = total
  })
}

getSignUpList()

onMounted(() => {
  emitter.on('signup-info-reload', getSignUpList)
})

onUnmounted(() => {
  emitter.off('signup-info-reload', getSignUpList)
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
    promoteSignUpBySignUpId(id, currentRound).then(
      () => props.isRaw && emitter.emit('signup-info-reload'),
    )
  } else {
    awardSignUpBySignUpId(id, val as string).then(
      () => props.isRaw && emitter.emit('signup-info-reload'),
    )
  }
}

const download = (file?: { filename: string; originalname: string }) => {
  if (!file) return
  ElMessageBox.confirm('确认下载当前文件?', '确认下载', {
    confirmButtonText: '下载',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    downloadFile(file.filename, file.originalname)
  })
}

const watchVideo = (file?: { filename: string; originalname: string }) => {
  if (!file) return
  showVideo.value = true
  videoUrl.value = `${BASE_URL}/file/${file.filename}`
}

const closeVideo = () => {
  showVideo.value = false
  videoUrl.value = undefined
}
</script>
<style scoped lang="less">
.work {
  color: #88b9f9;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
}

.video-operation {
  display: flex;
  color: #88b9f9;
  justify-content: space-around;
  span {
    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
}
.video-wrapper {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba(222, 223, 224, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  .icon {
    position: absolute;
    right: 15%;
    top: 10%;
    font-size: 50px;
    cursor: pointer;
    border-radius: 10px;
    &:hover {
      background-color: #a5a5a4;
    }
  }

  .video {
    width: 60%;
    object-fit: fill;
    border-radius: 15px;
  }
}
.pagination-wrapper {
  display: flex;
  justify-content: center;

  .pagination {
    position: fixed;
    bottom: 30px;
  }
}
</style>
