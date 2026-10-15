<script setup>
// 知识点卡片：用于标记每个知识点的标题和编号
const props = defineProps({
  num: {
    type: [String, Number],
    default: ''
  },
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="knowledge-point">
    <div class="kp-header">
      <span v-if="num" class="kp-num">{{ num }}</span>
      <h3 class="kp-title">{{ title }}</h3>
    </div>
    <div class="kp-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.knowledge-point {
  margin: 24px 0;
  padding: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #00dc82;
  border-radius: 8px;
}

.kp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.kp-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #00dc82;
  color: #fff;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
}

.kp-title {
  margin: 0;
  font-size: 1.15rem;
  color: #1e293b;
}

.kp-body {
  color: #334155;
  line-height: 1.75;
}

.kp-body :deep(code) {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  color: #be123c;
}

.kp-body :deep(pre) {
  background: #0f172a;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.kp-body :deep(pre code) {
  background: none;
  padding: 0;
  color: #e2e8f0;
}
</style>
