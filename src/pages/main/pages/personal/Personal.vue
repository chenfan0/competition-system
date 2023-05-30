<template>
  <div class="self-wrapper">
    <el-card shadow="hover" class="card">
      <div class="avatar">
        <el-avatar :size="120" :src="userStore.userInfo.avatar" />
      </div>
      <el-upload
        accept=".jpg,.jpeg,.svg,.png,.webp"
        class="editor-avatar"
        name="avatar"
        :action="BASE_URL + '/upload/user/avatar'"
        :show-file-list="false"
        :headers="uploadHeaders"
        :on-success="handleFileSuccess"
      >
        修改头像
      </el-upload>
      <div class="layout">手机号码: {{ userStore.userInfo.phone }}</div>
      <div class="layout interested">
        <div class="content">感兴趣的:</div>
        <el-select
          class="field-value"
          placeholder="请选择感兴趣的方向"
          multiple
          filterable
          v-model="interested"
          @change="handleInputChange"
          @visible-change="handleVisibleChange"
          @remove-tag="handleRemoveTag"
        >
          <el-option
            v-for="item in tagStore.tagList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="layout">获奖情况</div>
      <el-table :data="awardList" style="width: 100%">
        <el-table-column
          prop="competitionName"
          label="竞赛名称"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="totalMember"
          label="报名成员"
          width="180"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="instructors"
          label="指导老师"
          width="180"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="award"
          label="奖项"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="competitionId"
          label="竞赛详情"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scope">
            <div
              class="look-detail"
              @click="() => handleDetailClick(scope.row.competitionId)"
            >
              查看详情
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/store/user.store'
import { useTagStore } from '@/store/tag.store'
import { getUserAwardList } from '@/network/user'
import { BASE_URL } from '@/constant'

import router from '@/router'

const userStore = useUserStore()
const { token } = useUserStore().userInfo
const uploadHeaders = {
  Authorization: `Bearer ${token}`,
}
const tagStore = useTagStore()

const shouldUpdateInterested = ref(false)

const interested = ref<number[]>([...userStore.userInfo.interested])
const awardList = ref<any[]>([])

tagStore.getTagListAction()
getUserAwardList().then((res) => {
  res.data.list.forEach((item: any) => {
    item.totalMember = [item.leader, ...JSON.parse(item.member || '[]')].join(
      ', ',
    )
    item.instructors = JSON.parse(item.instructors || '[]').join(', ')
  })
  awardList.value = res.data.list
  console.log(res.data.list)
})

const handleInputChange = () => {
  shouldUpdateInterested.value = true
}

const handleRemoveTag = () => {
  userStore.updateInterestedAction(interested.value)
}

const handleVisibleChange = (val: boolean) => {
  if (!val && shouldUpdateInterested.value) {
    userStore.updateInterestedAction(interested.value).then(() => {
      shouldUpdateInterested.value = false
    })
  }
}

const handleFileSuccess = (res: any) => {
  userStore.updateAvatarAction(res.data.filename)
}

const handleDetailClick = (id: number) => {
  router.push({
    path: `/competition/detail/${id}`,
  })
}
</script>
<style scoped lang="less">
.self-wrapper {
  padding: 40px 20px;
  box-sizing: border-box;
  height: calc(100vh - 70px);
  .card {
    height: 100%;
    border-radius: 10px;
    overflow: scroll;
    background-color: rgba(255, 255, 255, 0.4);

    .layout {
      margin: 15px 0;

      color: #73767a;
    }

    .avatar {
      display: flex;
      justify-content: center;
    }

    .editor-avatar {
      margin-top: 10px;
      text-align: center;
      text-decoration: underline;
      cursor: pointer;
    }

    .interested {
      display: flex;
      align-items: center;

      .content {
        margin-right: 10px;
      }
    }

    .look-detail {
      text-decoration: underline;
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
