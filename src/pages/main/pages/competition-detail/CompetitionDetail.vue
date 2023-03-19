<template>
  <div class="detail-wrapper">
    <img class="icon" src="@/assets/image/back.png" alt="back" @click="back" />
    <el-card shadow="hover" class="card">
      <Tag class="tag" :value="competitionDetail.status" />
      <div class="title">竞赛名称: {{ competitionDetail.name }}</div>
      <div class="detail layout">
        竞赛详情: {{ competitionDetail.description }}
      </div>
      <div class="address layout">
        竞赛地点: {{ competitionDetail.address }}
      </div>
      <div class="level layout">
        竞赛级别: {{ LevelMap[competitionDetail.level as KeyLevelMap] }}
      </div>
      <div class="teachers layout">
        指导老师人数: {{ competitionDetail.instructorsNums?.join(' - ') }}
      </div>
      <div class="format layout">
        参赛模式: {{ ModeToContentMap[competitionDetail.mode as KeyModeMap] }}
      </div>
      <div
        class="layout"
        v-if="competitionDetail.mode === CompetitionMode.TeamMode"
      >
        参数人数: {{ competitionDetail.signUpNums?.join(' - ') }}
      </div>
      <div class="layout">竞赛轮次: {{ competitionDetail.rounds }}</div>
      <div class="sign-up-start-time layout">
        报名开始时间: {{ competitionDetail.registrationStartTime }}
      </div>
      <div class="sign-up-end-time layout">
        结束报名时间: {{ competitionDetail.registrationEndTime }}
      </div>
      <div class="emit-start-time layout">
        作品开始提交时间: {{ competitionDetail.workSubmissionStartTime }}
      </div>
      <div class="emit-end-time layout">
        作品结束提交时间: {{ competitionDetail.workSubmissionEndTime }}
      </div>
      <div class="relative-file layout">
        相关文件:
        <div class="look-file" @click="fileDialogVisible = true">查看文件</div>
      </div>
      <div class="op-user layout">发布者: {{ competitionDetail.opUser }}</div>
      <div class="judge layout">
        评委:
        {{ competitionDetail.judges?.join(', ') }}
      </div>
      <el-button
        type="primary"
        class="sign-up"
        size="large"
        @click="handleBtnClick"
        :disabled="competitionDetail.btnDisable"
        v-if="shouldShowBtn"
      >
        {{ competitionDetail.btnMsg }}
      </el-button>
    </el-card>
    <!-- 查看文件dialog -->
    <el-dialog v-model="fileDialogVisible" title="竞赛相关文件">
      <div class="file" v-for="item in competitionDetail.files" :key="item.url">
        <div class="preview">
          <el-icon><Document /></el-icon>
          <a
            class="filename"
            :href="`https://view.xdocin.com/view?src=${encodeURIComponent(
              `${BASE_URL}/file/${item.filename}`,
            )}`"
            target="_blank"
          >
            {{ item.originalname }}
          </a>
        </div>
        <el-tooltip
          effect="dark"
          content="下载文件"
          placement="right"
          :hide-after="0"
        >
          <el-icon size="22px">
            <Download
              @click="(e) => downloadFile(item.filename, item.originalname)"
            />
          </el-icon>
        </el-tooltip>
      </div>
    </el-dialog>
    <SignUpForm
      v-if="showSignUpForm"
      :type="competitionDetail.signUp ? 'update' : 'create'"
      title="报名信息"
      :sign-up="competitionDetail.signUp"
      :mode="competitionDetail.mode"
      :can-update-sign-up-mode="canUpdateSignUpMode"
      :judges="competitionDetail.judges"
      :op-user="competitionDetail.opUser"
      :instructors-nums="competitionDetail.instructorsNums"
      :sign-up-nums="competitionDetail.signUpNums"
      :competition-id="competitionDetail.id"
      :competition-name="competitionDetail.name"
      :sign-up-dialog-visible="signUpDialogVisible"
      @dialog-close="() => (signUpDialogVisible = false)"
      :request-competition-detail="requestCompetitionDetail"
      :work="competitionDetail.work"
      :video="competitionDetail.video"
      :member="competitionDetail.member"
      :instructors="competitionDetail.instructors"
      :leader="competitionDetail.leader"
      :team-name="competitionDetail.signUpName"
      :sing-up-id="competitionDetail.signUpId"
    />
  </div>
</template>
<script setup lang="ts">
import { Document, Download } from '@element-plus/icons-vue'
import { getCompetitionDetail } from '@/network/competition'
import Tag from '@/components/Tag.vue'
import {
  ModeToContentMap,
  LevelMap,
  BASE_URL,
  CompetitionMode,
  CompetitionStatus,
  CanUpdateSignUpMode,
} from '@/constant'
import { downloadFile } from '@/utils'
import { useUserStore } from '@/store/user.store'
import { KeyLevelMap, KeyModeMap, UserRole } from '@/constant'
import SignUpForm from '@/components/SignUpForm.vue'

const router = useRouter()
const routes = useRoute()
const userStore = useUserStore()

const competitionDetail = ref<Record<string, any>>({})

const fileDialogVisible = ref(false)
const showSignUpForm = ref(false)

const signUpDialogVisible = ref(false)

// 0 代表可以报名，还未可以上传文件
// 1 代表可以报名也可以上传或修改文件
// 2 代表只能修改文件
const canUpdateSignUpMode = ref<CanUpdateSignUpMode>(0)
const shouldShowBtn = ref(userStore.userInfo.role === UserRole.student)

const processCompetitionDetailData = (data: any) => {
  // 数据处理
  ;[
    'files',
    'judges',
    'signUpNums',
    'instructorsNums',
    'member',
    'instructors',
  ].forEach((key) => {
    data[key] = JSON.parse(data[key] || '[]')
  })
  data.rounds = data.rounds.split('\n').join('->')
  const alreadySignUp = data.signUp
  const registrationEndTime = Date.parse(data.registrationEndTime)
  const now = Date.now()
  const canSignUp = registrationEndTime > now
  let btnDisable!: boolean
  let btnMsg!: string
  const curUser = userStore.userInfo.phone
  const { judges, opUser, leader } = data
  switch (data.status) {
    case CompetitionStatus.beforeSignUp:
      btnDisable = true
      btnMsg = '报名'
      break
    case CompetitionStatus.signUping:
      btnDisable = alreadySignUp
      break
    case CompetitionStatus.waitUpload:
      btnDisable = alreadySignUp ? true : canSignUp ? false : true
      break
    case CompetitionStatus.uploading:
      canUpdateSignUpMode.value = canSignUp ? 1 : 2
      btnDisable = alreadySignUp
        ? leader === curUser // 已经报名了，必须是报名队长才可以进行上传作品
          ? false
          : true
        : canSignUp
        ? false
        : true
      break
    case CompetitionStatus.waitResult:
    case CompetitionStatus.end:
      btnDisable = true
      break
  }
  btnMsg = btnMsg ?? (alreadySignUp ? '上传作品' : '报名')

  if (curUser === opUser || judges.includes(curUser)) {
    btnMsg = '查看报名信息'
    btnDisable = false
    shouldShowBtn.value = true
  }

  data.btnDisable = btnDisable
  data.btnMsg = btnMsg

  return data
}

// 发送网络请求
const requestCompetitionDetail = () => {
  getCompetitionDetail(routes.params.id as string).then(({ data: resData }) => {
    competitionDetail.value = processCompetitionDetailData(resData)
    showSignUpForm.value = true
  })
}
requestCompetitionDetail()

const back = () => {
  router.back()
}

const handleBtnClick = () => {
  if (userStore.userInfo.role === UserRole.student) {
    signUpDialogVisible.value = true
  } else {
    router.push({
      path: `/judge/${competitionDetail.value.id}`,
    })
  }
}

// const handleOnConfirmUpload = () => {}
</script>
<style scoped lang="less">
.detail-wrapper {
  margin-top: 8px;

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

  .card {
    position: relative;
    margin-top: 10px;
    background-color: rgba(255, 255, 255, 0.4);
    font-size: 16px;
    color: #999;
    padding: 0 10px 30px;
    line-height: 22px;
    border-radius: 12px;
    .tag {
      position: absolute;
      top: 20px;
      right: 30px;
    }

    .layout {
      margin-bottom: 10px;
    }

    .title {
      font-size: 22px;
      color: #222;
      margin-bottom: 20px;
      margin-top: 10px;
      line-height: 20px;
    }

    .detail-wrapper {
      margin-bottom: 5px;
      line-height: 22px;
    }

    .relative-file {
      display: flex;
      align-items: center;

      .look-file {
        margin-left: 10px;
        text-decoration: underline;
        cursor: pointer;
        color: #79bbff;
      }
    }

    .sign-up {
      position: absolute;
      right: 30px;
      bottom: 20px;
    }
  }
  .file {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 16px;
    color: #337ecc;
    cursor: pointer;

    .preview {
      display: flex;
      align-items: center;
      .filename {
        width: 400px;
        color: #337ecc;
        margin-left: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
