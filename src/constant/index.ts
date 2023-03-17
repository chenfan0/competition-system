import { LabelType } from '@/type'

export const whiteUserList = [
  'student1',
  'student2',
  'student3',
  'student4',
  'student5',
  'student6',
  'teacher1',
  'teacher2',
  'teacher3',
  'teacher4',
  'teacher5',
  'teacher6',
  'admin',
]

export type KeyLevelMap = keyof typeof LevelMap
export type KeyModeMap = keyof typeof ModeToContentMap
export type KeyTagToContentType = keyof typeof TagToContentMap
export type KeyTagToType = keyof typeof TagToType

export type TagType = '' | 'success' | 'warning' | 'info' | 'danger'
export const LevelMap = {
  0: '国家级',
  1: '省级',
  2: '市级',
  3: '校级',
  4: '院级',
}

export enum CompetitionMode {
  SelfMode = '0',
  TeamMode = '1',
}
export const ModeToContentMap = {
  0: '个人',
  1: '团队',
}

export enum CompetitionStatus {
  beforeSignUp = 0,
  signUping = 1,
  waitUpload = 2,
  uploading = 3,
  waitResult = 4,
  end = 5,
}

export const TagToContentMap = {
  0: '竞赛未开始',
  1: '报名进行中',
  2: '等待开放作品提交',
  3: '作品提交中',
  4: '等待结果中',
  5: '竞赛已结束',
}

export const statusToBtnMsg = {
  1: '报名',
  3: '上传作品',
}

export const TagToType = {
  0: 'info',
  1: 'success',
  2: 'warning',
  3: 'danger',
  4: 'danger',
  5: 'info',
}

export const BASE_URL =
  env === 'development' ? 'http://localhost:8080' : 'http://81.71.36.158:11111'
export const PREVIEW_URL_PREFIX = 'https://view.xdocin.com/view'

export const LevelOptions = [
  {
    value: 0,
    label: '国家级',
  },
  {
    value: 1,
    label: '省级',
  },
  {
    value: 2,
    label: '市级',
  },
  {
    value: 3,
    label: '校级',
  },
  {
    value: 4,
    label: '院级',
  },
]

export const StatusOptions = [
  {
    value: 0,
    label: TagToContentMap[0],
  },
  {
    value: 1,
    label: TagToContentMap[1],
  },
  {
    value: 2,
    label: TagToContentMap[2],
  },
  {
    value: 3,
    label: TagToContentMap[3],
  },
  {
    value: 4,
    label: TagToContentMap[4],
  },
  {
    value: 5,
    label: TagToContentMap[5],
  },
]

export const ModeOptions = [
  {
    value: CompetitionMode.SelfMode,
    label: '个人',
  },
  {
    value: CompetitionMode.TeamMode,
    label: '团队',
  },
]

export const PhoneReg = /^[1][3,4,5,7,8][0-9]{9}$/

export enum UserRole {
  student = 0,
  teacher = 1,
  admin = 2,
}

export enum ConfirmStatus {
  resolve = 0,
  reject = 1,
  pending = 2,
}

export const LabelToContent: { [key in LabelType]: string } = {
  signUpedList: '已报名',
  signUpingList: '报名中',
  confirmList: '待确认',
  instructoredList: '已指导',
  instructoringList: '指导中',
  judgementList: '我评判的',
}

export enum AlreadyProcess {
  yes = 1,
  no = 0,
}

export enum CanUpdateSignUpMode {
  showSignUpField = 0,
  showSignUpAndUploadField = 1,
  showUploadField = 2,
  allDisable = 3,
}
