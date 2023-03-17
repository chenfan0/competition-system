<template>
  <el-tag :type="(TagToType[props.value as KeyTagToContentType] as TagType)">
    {{ TagToContentMap[props.value as KeyTagToContentType] }}
  </el-tag>
</template>
<script setup lang="ts">
import {
  TagToContentMap,
  TagToType,
  KeyTagToContentType,
  TagType,
} from '@/constant'
const props = defineProps<{
  value: KeyTagToContentType
}>()
</script>
<style scoped lang="less"></style>
