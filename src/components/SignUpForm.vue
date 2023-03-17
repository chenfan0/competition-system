<template>
  <el-dialog
    v-model="visible"
    :title="title"
    ref="signUpRef"
    width="30%"
    :before-close="handleBeforeClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="signUpRef"
      class="sign-up-form"
      :model="signUpData"
      label-width="80px"
      :rules="signUpRules"
    >
      <el-form-item
        label="团队名称"
        prop="teamName"
        v-if="mode === CompetitionMode.TeamMode"
      >
        <el-input
          :disabled="signUpDisable"
          class="team-name-input"
          placeholder="请输入团队名称"
          v-model="signUpData.teamName"
        />
      </el-form-item>
      <el-form-item label="指导老师" prop="instructors">
        <el-select
          :disabled="signUpDisable"
          :fit-input-width="true"
          class="field-value"
          placeholder="请选择指导老师"
          remote
          multiple
          filterable
          remote-show-suffix
          v-model="signUpData.instructors"
          :remote-method="handleCompetitionInstructor"
        >
          <el-option
            v-for="item in instructorList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="队员"
        prop="teamMember"
        v-if="mode === CompetitionMode.TeamMode"
      >
        <el-select
          :disabled="signUpDisable"
          :fit-input-width="true"
          class="field-value"
          placeholder="请选择队员"
          remote
          multiple
          filterable
          remote-show-suffix
          v-model="signUpData.teamMember"
          :remote-method="handleCompetitionMember"
        >
          <el-option
            v-for="item in memberList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="作品">
        <el-upload
          v-model:file-list="workFileList"
          :disabled="uploadDisable"
          name="work"
          :action="BASE_URL + '/upload/signup/work'"
          :headers="uploadHeaders"
          :limit="1"
          :on-success="(response) => handleOnSuccess('work', response)"
          :on-error="handleOnError"
          :on-remove="() => handleOnRemove('work')"
          :on-preview="handleOnPreview"
        >
          <template #trigger>
            <el-button type="primary" :disabled="uploadDisable">
              上传作品
            </el-button>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="预览视频">
        <el-upload
          :disabled="uploadDisable"
          :action="BASE_URL + '/upload/video'"
          :headers="uploadHeaders"
          :on-success="(response) => handleOnSuccess('video', response)"
          :on-error="handleOnError"
          :on-remove="() => handleOnRemove('video')"
        >
          <template #trigger>
            <el-button type="primary" :disabled="uploadDisable">
              上传作品预览视频
            </el-button>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button
        type="primary"
        @click="handleConfirmSignUp"
        :disabled="
          (props.signUp && !isLeader) ||
          canUpdateSignUpMode === CanUpdateSignUpMode.allDisable
        "
      >
        提交
      </el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { FormInstance, FormRules, UploadProps } from 'element-plus'
import {
  UserRole,
  CompetitionMode,
  BASE_URL,
  CanUpdateSignUpMode,
} from '@/constant'
import { getCompetitionUser } from '@/network/competition'
import { useUserStore } from '@/store/user.store'
import { createSignup, updateSignUpInfo } from '@/network/signup'
import { emitter } from '@/utils/bus'
import { downloadFile } from '@/utils'

const props = defineProps<{
  type: 'update' | 'create'
  signUpDialogVisible: boolean
  title: string
  canUpdateSignUpMode: CanUpdateSignUpMode
  // 报名相关数据
  instructors?: string[]
  member?: string[]
  leader?: string
  video?: string
  work?: string
  teamName?: string
  signUp: boolean
  // 竞赛相关
  judges: string[]
  opUser: string
  mode: string
  instructorsNums: string[]
  signUpNums: string[]
  competitionId: number
  competitionName: string
  requestCompetitionDetail?: () => void
  singUpId?: number
}>()

const emits = defineEmits(['dialogClose'])

const userStore = useUserStore()
const role = userStore.userInfo.role
const isLeader = computed(() => userStore.userInfo.phone === props.leader)
const visible = ref(false)

watch(
  () => props.signUpDialogVisible,
  (newVal) => {
    visible.value = newVal
  },
)

const signUpRef = ref<FormInstance>()
const signUpData = ref<{
  instructors: string[]
  teamName?: string
  teamMember?: string[]
  work?: string
  video?: string
}>({
  instructors: props.instructors || [],
  teamMember: props.member || [],
  teamName: props.teamName,
  work: props.work,
  video: props.video,
})

const signUpRules: FormRules = {
  instructors: {
    trigger: 'blur',
    validator(_, value: string[], cb) {
      const instructorsNums = props.instructorsNums
      const len = value.length
      if (
        len < Number(instructorsNums[0]) ||
        len > Number(instructorsNums[1])
      ) {
        cb(
          new Error(
            `允许指导老师人数为${instructorsNums[0]} - ${instructorsNums[1]}, 当前选择的指导老师人数为${len}`,
          ),
        )
      } else {
        cb()
      }
    },
    required: true,
  },
  teamMember: {
    trigger: 'blur',
    validator(_, value: string[], cb) {
      const signUpNums = props.signUpNums
      const len = value.length + 1
      if (len < Number(signUpNums[0]) || len > Number(signUpNums[1])) {
        cb(
          new Error(
            `允许队员人数为${signUpNums[0]} - ${signUpNums[1]}, 当前团队人数为${len}`,
          ),
        )
      } else {
        cb()
      }
    },
    required: true,
  },
  teamName: {
    trigger: 'blur',
    required: true,
    min: 4,
    max: 10,
    message: '竞赛名称长度限制为4-10个字符',
  },
}

const signUpDisable = computed(
  () =>
    [
      CanUpdateSignUpMode.allDisable,
      CanUpdateSignUpMode.showUploadField,
    ].includes(props.canUpdateSignUpMode) ||
    (props.signUp && !isLeader.value),
)
const uploadDisable = computed(
  () =>
    [
      CanUpdateSignUpMode.allDisable,
      CanUpdateSignUpMode.showSignUpField,
    ].includes(props.canUpdateSignUpMode) ||
    (props.signUp && !isLeader.value),
)

const instructorList = ref<{ label: string; value: string }[]>([])
const memberList = ref<{ label: string; value: string }[]>([])

const token = useUserStore().userInfo.token
const uploadHeaders = {
  Authorization: `Bearer ${token}`,
}

const workFile = JSON.parse(props.work ?? '{}')
const workFileList = computed(() => {
  const keys = Object.keys(workFile)
  if (keys.length === 0) {
    return []
  }
  return [
    {
      name: workFile.originalname,
      url: `${BASE_URL}/file/${workFile.filename}`,
    },
  ]
})

const handleCompetitionInstructor = async (prefix: string) => {
  const { data } = await getCompetitionUser(prefix, UserRole.teacher)
  const judges = props.judges
  const opUser = props.opUser as string
  const list = (data as { label: string; value: string }[]).filter(
    ({ value }) => !(judges.includes(value) || value === opUser),
  )
  instructorList.value = list
}

const handleCompetitionMember = async (prefix: string) => {
  const { data } = await getCompetitionUser(prefix, UserRole.student)

  memberList.value = (data as { label: string; value: string }[]).filter(
    ({ value }) => value !== userStore.userInfo.phone,
  )
}
const resetSignUp = () => {
  signUpData.value = {
    instructors: props.instructors || [],
    teamMember: props.member || [],
    teamName: props.teamName,
    work: props.work,
    video: props.video,
  }
}
const handleBeforeClose = () => {
  resetSignUp()
  emits('dialogClose')
}

const handleConfirmSignUp = async () => {
  try {
    await signUpRef.value?.validate()
    if (props.type === 'create') {
      createSignup({
        mode: Number(props.mode),
        competitionId: props.competitionId,
        leader: userStore.userInfo.phone,
        member: signUpData.value.teamMember,
        teamName: signUpData.value.teamName,
        instructors: signUpData.value.instructors,
        competitionName: props.competitionName,
        work: signUpData.value.work,
        video: signUpData.value.video,
      }).then(() => {
        emits('dialogClose')
        props.requestCompetitionDetail?.()
      })
    } else {
      updateSignUpInfo({
        id: props.singUpId!,
        member: signUpData.value.teamMember,
        instructors: signUpData.value.instructors,
        work: signUpData.value.work,
        video: signUpData.value.video,
        teamName: signUpData.value.teamName,
      }).then(() => {
        emits('dialogClose')
        emitter.emit(
          'reload-my-competition',
          role === UserRole.student
            ? ['signUpedList', 'signUpingList']
            : ['instructoredList', 'instructoringList'],
        )
      })
    }
  } catch (e) {
    console.error(e)
  }
}

const handleOnSuccess = (type: 'work' | 'video', response: { data: any }) => {
  const fileData = JSON.stringify(response.data)
  signUpData.value[type] = fileData
}

const handleOnPreview: UploadProps['onPreview'] = (uploadFile) => {
  ElMessageBox.confirm('是否要下载当前文件?', '确认下载', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(() => {
    downloadFile(workFile.filename, workFile.originalname)
  })
}

const handleOnRemove = (type: 'work' | 'video') => {
  signUpData.value[type] = undefined
}

const handleOnError: UploadProps['onError'] = (error) => {
  ElMessage({
    type: 'error',
    message: error.message,
  })
}
</script>
<style scoped lang="less"></style>
