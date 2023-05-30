<template>
  <el-card shadow="hover" class="card">
    <el-form
      :model="competitionData"
      ref="formRef"
      :rules="formRule"
      label-width="150px"
    >
      <el-form-item label="竞赛名称" prop="name">
        <el-input
          class="field-value"
          placeholder="请输入竞赛名称"
          v-model="competitionData.name"
        />
      </el-form-item>
      <el-form-item label="竞赛详情" prop="description">
        <el-input
          v-model="competitionData.description"
          class="field-value description"
          placeholder="请输入竞赛详情"
          autosize
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="竞赛地点" prop="address">
        <el-input
          class="field-value"
          placeholder="请输入竞赛地点"
          v-model="competitionData.address"
        />
      </el-form-item>
      <el-form-item label="竞赛级别" prop="level">
        <el-select
          class="field-value"
          placeholder="请选择竞赛级别"
          v-model="competitionData.level"
        >
          <el-option
            v-for="item in LevelOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="竞赛轮次" prop="rounds">
        <el-input
          v-model="competitionData.rounds"
          class="field-value"
          placeholder="默认一轮，如果多轮请填写每轮名称，并通过回车键分割，例如初赛(回车)复赛"
          autosize
          type="textarea"
          :disabled="type === 'update'"
        />
      </el-form-item>
      <el-form-item label="奖项名称" prop="awards">
        <el-input
          v-model="competitionData.awards"
          class="field-value"
          type="textarea"
          autosize
          placeholder="请输入奖项名称，并通过回车键分割，例如一等奖(回车)二等奖"
        />
      </el-form-item>
      <el-form-item label="指导老师人数" prop="instructorsNums">
        <el-slider
          size="small"
          :min="1"
          v-model="competitionData.instructorsNums"
          range
          show-stops
          :max="5"
          :disabled="type === 'update'"
        />
      </el-form-item>
      <el-form-item label="参赛模式" prop="mode">
        <el-select
          class="field-value"
          placeholder="请选择参赛模式"
          v-model="competitionData.mode"
          :disabled="type === 'update'"
        >
          <el-option
            v-for="item in ModeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="competitionData.mode !== CompetitionMode.SelfMode"
        label="参数人数"
        prop="signUpNums"
      >
        <el-slider
          v-model="competitionData.signUpNums"
          range
          show-stops
          :min="2"
          :max="15"
          :disabled="type === 'update'"
        />
      </el-form-item>
      <el-form-item label="报名时间段" prop="registrationTime">
        <el-date-picker
          style="flex: 1"
          v-model="competitionData.registrationTime"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item label="作品提交时间段" prop="workSubmissionTime">
        <!-- 添加类名最终不会加载dom上，所以这里通过style进行样式设置 -->
        <el-date-picker
          style="flex: 1"
          v-model="competitionData.workSubmissionTime"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item label="评委" prop="judges">
        <el-select
          class="field-value"
          placeholder="请选择评委"
          remote
          multiple
          filterable
          remote-show-suffix
          :remote-method="handleCompetitionJudges"
          v-model="competitionData.judges"
        >
          <el-option
            v-for="item in judgeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="竞赛标签" prop="tags">
        <el-select
          class="field-value"
          placeholder="请添加相关标签"
          multiple
          filterable
          v-model="competitionData.tags"
        >
          <el-option
            v-for="item in tagStore.tagList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="field">
      <span class="field-key">上传文件</span>
      <el-upload
        :file-list="fileList"
        accept=".ppt,.pptx,.xls,.xlsx,.doc,.docx,.pdf,.txt"
        ref="uploadRef"
        class="field-value upload"
        :action="BASE_URL + '/upload/competition/file'"
        :headers="uploadHeaders"
        :on-success="
          (res, uploadFile) => handleSuccess('files', res, uploadFile)
        "
        :on-error="handleError"
        :on-remove="(removeFile) => handleRemove('files', removeFile)"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
      </el-upload>
    </div>
    <div class="field">
      <span class="field-key">上传图片</span>
      <el-upload
        :file-list="imgList"
        name="img"
        accept=".jpg,.jpeg,.svg,.png,.webp"
        ref="uploadRef"
        class="field-value upload"
        :action="BASE_URL + '/upload/competition/img'"
        :headers="uploadHeaders"
        :on-success="
          (res, uploadFile) => handleSuccess('imgs', res, uploadFile)
        "
        :on-error="handleError"
        :on-remove="(removeFile) => handleRemove('imgs', removeFile)"
      >
        <template #trigger>
          <el-button type="primary">选择图片</el-button>
        </template>
      </el-upload>
    </div>
    <el-button
      type="primary"
      class="create"
      @click="handleCreateOrUpdateCompetition"
    >
      {{ type === 'create' ? '创建竞赛' : '更新竞赛' }}
    </el-button>
    <el-button
      type="danger"
      class="delete"
      @click="handleDeleteCompetition"
      v-if="type === 'update'"
    >
      删除竞赛
    </el-button>
  </el-card>
</template>
<script setup lang="ts">
import {
  Action,
  FormInstance,
  FormRules,
  UploadInstance,
  UploadProps,
} from 'element-plus'
import {
  createCompetition,
  updateCompetition,
  deleteCompetition,
} from '@/network/competition'
import {
  LevelOptions,
  ModeOptions,
  CompetitionMode,
  BASE_URL,
} from '@/constant'
import { useCompetitionListStore } from '@/store/competitionList.store'
import { useUserStore } from '@/store/user.store'
import { useTagStore } from '@/store/tag.store'

const emits = defineEmits(['updateSuccess', 'createSuccess', 'deleteSuccess'])
const props = defineProps<{
  id?: number
  name?: string
  description?: string
  address?: string
  level?: number
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
  imgs?: string[]
  type: 'create' | 'update'
}>()

const competitionStore = useCompetitionListStore()
const tagStore = useTagStore()
const router = useRouter()

const uploadRef = ref<UploadInstance>()
const formRef = ref<FormInstance>()
const { token, phone } = useUserStore().userInfo
const uploadHeaders = {
  Authorization: `Bearer ${token}`,
}
const competitionData = ref({
  name: props.name || '',
  description: props.description || '',
  address: props.address || '',
  level: props.level || 0,
  instructorsNums: props.instructorsNums || [0, 2],
  mode: props.mode || '0',
  rounds: props.rounds || '',
  awards: props.awards || '',
  registrationTime: (props.registrationTime || undefined) as any,
  workSubmissionTime: (props.workSubmissionTime || undefined) as any,
  signUpNums: props.signUpNums || [2, 4],
  judges: props.judges || ([] as string[]),
  tags: props.tags || ([] as number[]),
  files: [] as string[],
  imgs: [] as string[],
})

const fileList = ref(
  props.files?.map((file) => {
    const _file = JSON.parse(file)
    competitionData.value.files.push(file)
    return {
      name: _file.originalname,
      filename: _file.filename,
    }
  }),
)
const imgList = ref(
  props.imgs?.map((file) => {
    const _file = JSON.parse(file)
    competitionData.value.imgs.push(file)
    return {
      name: _file.originalname,
      filename: _file.filename,
    }
  }),
)

const judgeList = ref<{ label: string; value: string }[]>([])

const formRule: FormRules = {
  name: { required: true, trigger: 'blur', message: '竞赛名称是必须填写的' },
  address: { required: true, trigger: 'blur', message: '竞赛地点是必须填写的' },
  level: { required: true, trigger: 'change', message: '竞赛级别是必须选择的' },
  mode: {
    required: true,
    message: '参赛模式是必须选择的',
  },
  instructorsNums: {
    required: true,
    trigger: 'blur',
    message: '指导老师人数是必须填写的',
  },
  registrationTime: {
    required: true,
    trigger: 'change',
    message: '报名时间段是必须提供的',
  },
  workSubmissionTime: [
    {
      required: true,
      trigger: 'change',
      message: '作品提交段是必须提供的',
    },
    {
      required: true,
      trigger: 'change',
      validator(_, value, cb) {
        if (!competitionData.value.registrationTime) {
          return
        }
        const [t1, t2] = value
        const wst = Date.parse(t1)
        const wet = Date.parse(t2)
        const rst = Date.parse(competitionData.value.registrationTime[0])
        const ret = Date.parse(competitionData.value.registrationTime[1])
        if (rst > wst) {
          cb('作品上传开始时间不能早于竞赛开始报名时间')
        } else if (wet < ret) {
          cb('作品上传结束时间不能早于竞赛结束报名时间')
        } else {
          cb()
        }
      },
    },
  ],
  judges: {
    required: true,
    trigger: 'blur',
    message: '评委是必须提供的',
  },
  tags: {
    required: true,
    trigger: 'blur',
    message: '竞赛标签是必须提供的',
  },

  rounds: {
    trigger: 'blur',
    validator(_, value, cb) {
      const rounds = value.split('\n') as string[]
      if (new Set(rounds).size !== rounds.length) {
        cb('竞赛轮次名称不允许重复')
      }
      cb()
    },
  },
  awards: {
    trigger: 'blur',
    required: true,
    validator(_, value, cb) {
      const awards = value.split('\n') as string[]
      if (value === '') {
        cb('奖项不允许为空')
      } else if (new Set(awards).size !== awards.length) {
        cb('奖项名不允许重复')
      }
      cb()
    },
  },
}

const handleCreateOrUpdateCompetition = () => {
  ElMessageBox.alert(
    `确认${props.type === 'create' ? '创建' : '更新'}竞赛？`,
    '请确认',
    {
      confirmButtonText: '确认',
      closeOnClickModal: true,
      callback: async (action: Action) => {
        if (action === 'confirm') {
          try {
            if (competitionData.value.rounds === '') {
              competitionData.value.rounds = '一轮'
            }
            await formRef.value!.validate()
            // 发送网络请求
            if (props.type === 'create') {
              createCompetition(competitionData.value).then((res) => {
                const { competitionId } = res.data
                router.push({
                  path: `/competition/detail/${competitionId}`,
                })
              })
            } else {
              // 更新
              updateCompetition({
                ...competitionData.value,
                id: props.id!,
              }).then((_) => {
                emits('updateSuccess')
              })
            }
          } catch (e) {
            console.log(e)
          }
        }
      },
    },
  )
}

const handleDeleteCompetition = () => {
  ElMessageBox.alert(`确认删除竞赛`, '请确认', {
    confirmButtonText: '确认',
    closeOnClickModal: true,
    callback: async (action: Action) => {
      if (action === 'confirm') {
        try {
          deleteCompetition(props.id!).then(() => {
            emits('deleteSuccess')
          })
        } catch (e) {
          console.log(e)
        }
      }
    },
  })
}

const handleCompetitionJudges = async (prefix: string) => {
  const list = await competitionStore.getCompetitionJudgesAction(prefix)

  judgeList.value = list.filter(
    (user: { label: string; value: string }) => user.value !== phone,
  )
}
const handleSuccess = (type: 'imgs' | 'files', res: any, uploadFile: any) => {
  const fileData = JSON.stringify(res.data)
  uploadFile.filename = res.data.filename
  if (!competitionData.value[type].includes(fileData)) {
    competitionData.value[type].push(fileData)
  }
}

const handleRemove = (type: 'imgs' | 'files', removeFile: any) => {
  const filename = removeFile.filename
  const newFile: string[] = []
  for (const _file of competitionData.value[type]) {
    const file = JSON.parse(_file)
    if (file.filename !== filename) {
      newFile.push(_file)
    }
  }
  competitionData.value[type] = newFile
}
const handleError: UploadProps['onError'] = (error) => {
  ElMessage({
    type: 'error',
    message: error.message,
  })
}
// 获取tag
tagStore.getTagListAction()
</script>
<style scoped lang="less">
.card {
  position: relative;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
  padding: 10px 20px 30px 0;
  border-radius: 20px;
  color: #303133;

  .field {
    display: flex;
    margin-bottom: 26px;
    align-items: center;

    &:global(.el-input__wrapper) {
      display: flex;
    }

    .field-key {
      width: 150px;
      box-sizing: border-box;
      color: #606266;
      font-size: 14px;
      padding-right: 12px;
      text-align: right;
    }

    .field-value {
      flex: 1;
    }
  }

  .upload {
    display: flex;
    align-items: center;
  }

  .create {
    float: right;
  }

  .delete {
    float: right;
    margin-right: 10px;
  }
}
</style>
