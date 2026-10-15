<script setup>
// 代码块组件：用于展示带语法高亮提示的代码片段
// 支持复制功能
const props = defineProps({
  code: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    default: 'bash'
  },
  title: {
    type: String,
    default: ''
  }
})

const copied = ref(false)

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    // 忽略复制失败
  }
}
</script>

<template>
  <div class="code-block">
    <div class="header">
      <span class="lang">{{ lang }}</span>
      <span v-if="title" class="title">{{ title }}</span>
      <button class="copy-btn" @click="copyCode">
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <pre><code :class="`language-${lang}`">{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block {
  border: 1px solid #1e293b;
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  background: #0f172a;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.lang {
  font-size: 0.75rem;
  color: #00dc82;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.title {
  font-size: 0.8rem;
  color: #94a3b8;
  flex: 1;
}

.copy-btn {
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  border-color: #00dc82;
  color: #00dc82;
}

pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #e2e8f0;
  white-space: pre;
}
</style>
