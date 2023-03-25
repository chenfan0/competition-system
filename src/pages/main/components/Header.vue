<template>
  <div class="header">
    <div class="header-left">
      <div
        class="competition header-item"
        :class="activeIndex === 0 ? 'active' : ''"
        @click="changePage(0, '/competition')"
      >
        {{ role !== UserRole.admin ? '竞赛列表' : '竞赛管理' }}
      </div>
      <div
        v-if="role !== UserRole.admin"
        class="my-competition header-item"
        :class="activeIndex === 1 ? 'active' : ''"
        @click="changePage(1, '/my-competition')"
      >
        我的竞赛
      </div>
      <div
        v-if="[UserRole.admin, UserRole.teacher].includes(role)"
        class="release header-item"
        :class="activeIndex === 2 ? 'active' : ''"
        @click="changePage(2, '/release')"
      >
        发布竞赛
      </div>
      <div
        v-if="role === UserRole.admin"
        class="release header-item"
        :class="activeIndex === 3 ? 'active' : ''"
        @click="changePage(3, '/user-list')"
      >
        用户管理
      </div>
    </div>
    <div class="login header-item">
      <el-dropdown>
        <span class="el-dropdown-link">
          用户: {{ userStore.userInfo.phone }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="exist">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import { UserRole } from '@/constant'
import { useUserStore } from '@/store/user.store'
const router = useRouter()
const route = useRoute()

const userStore = useUserStore()
const role = userStore.userInfo.role

const pathToActiveIndexMap = {
  '/competition': 0,
  '/my-competition': 1,
  '/release': 2,
  '/user-list': 3,
}

const activeIndex = ref(
  pathToActiveIndexMap[route.fullPath as keyof typeof pathToActiveIndexMap] ??
    1,
)
const changePage = (index: number, path?: string) => {
  activeIndex.value = index
  if (path) {
    router.push({
      path,
    })
  }
}

const exist = () => {
  userStore.clear(['role', 'token'])
  location.assign('/login')
}
</script>
<style scoped lang="less">
.header {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  color: #fff;
  font-size: 14px;
  line-height: 70px;
  background-color: #212121;
  padding: 0 20%;

  .header-item {
    height: 70px;
    padding: 0 20px;
    position: relative;
    &:hover {
      background-color: #000;
      cursor: pointer;
    }
  }

  .header-left {
    display: flex;
  }

  .login {
    display: flex;
    align-items: center;
    &:hover {
      text-decoration: underline;
    }
  }

  .el-dropdown-link {
    font-weight: 700;
    color: #fff;
  }

  .active {
    background-color: #000;
    cursor: pointer;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 0);
      border: 5px solid transparent;
      border-bottom-color: white;
    }
  }
}
</style>
