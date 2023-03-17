<template>
  <el-config-provider :locale="zhCn">
    <div class="app">
      <Bg />
      <RouterView />
    </div>
  </el-config-provider>
</template>
<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import Bg from '@/components/Bg.vue'
const { appContext } = getCurrentInstance()!
ElMessage({}, appContext).close()
// ElMessageBox({}, appContext)
</script>
<style scoped lang="less">
:global(:root) {
  // --el-fill-color-blank: rgba(255, 255, 255, 0.2);
  // --el-bg-color: rgba(255, 255, 255, 0.2);
}
:global(.el-table__inner-wrapper .el-table__body-wrapper) {
  overflow: auto;
  max-height: calc(100vh - 390px);
}
:global(.el-input__wrapper.is-focus) {
  --el-select-input-focus-border-color: #9ea1a8;
  --el-input-focus-border-color: #9ea1a8;
}

:global(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #9ea1a8 inset !important;
}
:global(.el-range-editor.is-active) {
  &:active {
    --el-input-focus-border-color: #9ea1a8;
  }
}

.app {
  width: 100vw;
  height: 100vh;
  overflow: auto;
  // ::-webkit-scrollbar {
  //   display: none;
  // }
}
</style>
