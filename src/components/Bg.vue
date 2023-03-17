<script setup lang="ts">
const el = ref<HTMLCanvasElement>()
const ctx = computed(() => el.value!.getContext('2d')!)
interface Point {
  x: number
  y: number
}
interface Branch {
  start: Point
  length: number
  theta: number
}
function init() {
  const clientWidth = document.documentElement.clientWidth
  const clientHeight = document.documentElement.clientHeight
  el.value!.width = clientWidth
  el.value!.height = clientHeight
  ctx.value.strokeStyle = '#e8e8e8'
  step({
    start: { x: 0, y: Math.random() * clientHeight },
    length: 10,
    theta: Math.PI / 4,
  })
  step({
    start: { x: clientWidth, y: Math.random() * clientHeight },
    length: 10,
    theta: Math.PI / 1,
  })
  step({
    start: { x: Math.random() * clientWidth, y: 0 },
    length: 10,
    theta: Math.PI / 2,
  })
  step({
    start: { x: Math.random() * clientWidth, y: clientHeight },
    length: 10,
    theta: Math.PI / -2,
  })
}
let pendingTasks: Function[] = []
function step(b: Branch, depth = 0) {
  const end = getEndPoint(b)
  drawBranch(b)
  if (depth < 4 || Math.random() < 0.5) {
    pendingTasks.push(() =>
      step(
        {
          start: end,
          length: b.length + (Math.random() * 2 - 1),
          theta: b.theta - 0.2 * Math.random(),
        },
        depth + 1,
      ),
    )
  }
  if (depth < 4 || Math.random() < 0.5) {
    pendingTasks.push(() =>
      step(
        {
          start: end,
          length: b.length + (Math.random() * 2 - 1),
          theta: b.theta + 0.2 * Math.random(),
        },
        depth + 1,
      ),
    )
  }
}
function frame() {
  const tasks: Function[] = []
  pendingTasks = pendingTasks.filter((i) => {
    if (Math.random() > 0.4) {
      tasks.push(i)
      return false
    }
    return true
  })
  tasks.forEach((fn) => fn())
}
let framesCount = 0
function startFrame() {
  requestAnimationFrame(() => {
    framesCount += 1
    if (framesCount % 3 === 0) frame()
    startFrame()
  })
}
startFrame()
function lineTo(p1: Point, p2: Point) {
  ctx.value.beginPath()
  ctx.value.moveTo(p1.x, p1.y)
  ctx.value.lineTo(p2.x, p2.y)
  ctx.value.stroke()
}
function getEndPoint(b: Branch): Point {
  return {
    x: b.start.x + b.length * Math.cos(b.theta),
    y: b.start.y + b.length * Math.sin(b.theta),
  }
}
function drawBranch(b: Branch) {
  lineTo(b.start, getEndPoint(b))
}
onMounted(() => {
  init()
})
</script>

<template>
  <canvas class="canvas" ref="el" scale-50 origin-top-left />
</template>

<style scoped>
.canvas {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: -99;
}
</style>
