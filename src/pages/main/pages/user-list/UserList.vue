<template>
  <div class="user-list-wrapper">
    <div class="title">用户列表</div>

    <div class="filter">
      <span class="filter-field">用户名称:</span>
      <el-input
        class="filter-input"
        placeholder="请输入用户手机号"
        v-model="filterName"
      />
    </div>

    <el-table :data="userList?.list" class="table">
      <el-table-column prop="phone" label="用户" align="center" />
      <el-table-column prop="role" label="角色" align="center">
        <template #default="scope">
          {{ scope.row.role === UserRole.student ? '学生' : '教师' }}
        </template>
      </el-table-column>
      <el-table-column prop="disable" label="是否禁用" align="center">
        <template #default="scope">
          <el-switch
            v-model="scope.row.isDisable"
            class="ml-2"
            style="--el-switch-on-color: #ff4949"
            :before-change="
              () => handleDisable(scope.row.isDisable, scope.row.phone)
            "
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="createdAt"
        label="创建时间"
        width="180"
        align="center"
      />
      <el-table-column
        prop="updatedAt"
        label="更新时间"
        width="180"
        align="center"
      />
    </el-table>

    <el-pagination
      class="pagination"
      :small="false"
      :page-sizes="[5, 10, 20]"
      :default-current-page="paginationData.currentPage"
      :default-page-size="paginationData.pageSize"
      v-model:current-page="paginationData.currentPage"
      v-model:page-size="paginationData.pageSize"
      layout="prev, pager, next, sizes, total"
      :total="userList?.total"
    />
  </div>
</template>
<script setup lang="ts">
import { debounce } from 'lodash-es'
import { getUserList, updateUserIsDisable } from '@/network/user'
import { UserRole } from '@/constant/index'

const filterName = ref<string>('')
const paginationData = ref({
  currentPage: 1,
  pageSize: 10,
})
const userList = ref<{
  list: {
    phone: string
    role: number
    createdAt: string
    updatedAt: string
    isDisable: number
  }[]
  total: number
}>()

const requestUserList = debounce(
  () => {
    const offset =
      (paginationData.value.currentPage - 1) * paginationData.value.pageSize
    getUserList(paginationData.value.pageSize, offset, filterName.value!).then(
      ({ data }) => {
        data.list.forEach(
          (item: any) => (item.isDisable = Boolean(item.isDisable)),
        )
        userList.value = data
      },
    )
  },
  500,
  {
    leading: true,
  },
)

const stop = watch(
  () => [
    paginationData.value.currentPage,
    paginationData.value.pageSize,
    filterName.value,
  ],
  requestUserList,
)

onUnmounted(() => {
  stop()
})

requestUserList()

const handleDisable = async (rawVal: boolean, user: string) => {
  const newVal = Number(!rawVal)
  return updateUserIsDisable(user, newVal).then((res: any) => {
    return res.code === 200 ? Promise.resolve(true) : Promise.reject(false)
  })
}
</script>
<style scoped lang="less">
.user-list-wrapper {
  padding: 40px 20px;
  box-sizing: border-box;
  height: calc(100vh - 70px);

  .title {
    font-size: 24px;
    margin-bottom: 30px;
  }

  .table {
    width: 100%;
  }

  .filter {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    .filter-field {
      width: 80px;
    }
    .filter-input {
      width: 200px;
    }
  }

  .pagination {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    justify-content: center;
    margin-top: 40px;
    margin-bottom: 40px;
  }
}
</style>
