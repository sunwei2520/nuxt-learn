<script setup>
// 章节底部导航：上一章 / 下一章 / 返回首页
const props = defineProps({
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    default: 10
  }
})

const prevChapter = computed(() => {
  return props.current > 1
    ? { num: props.current - 1, path: `/chapters/${String(props.current - 1).padStart(2, '0')}` }
    : null
})

const nextChapter = computed(() => {
  return props.current < props.total
    ? { num: props.current + 1, path: `/chapters/${String(props.current + 1).padStart(2, '0')}` }
    : null
})
</script>

<template>
  <nav class="chapter-nav">
    <div class="nav-left">
      <NuxtLink v-if="prevChapter" :to="prevChapter.path" class="nav-link prev">
        <span class="arrow">←</span>
        <span class="label">上一章</span>
      </NuxtLink>
    </div>
    
    <NuxtLink to="/" class="home-link">返回目录</NuxtLink>
    
    <div class="nav-right">
      <NuxtLink v-if="nextChapter" :to="nextChapter.path" class="nav-link next">
        <span class="label">下一章</span>
        <span class="arrow">→</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.chapter-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #334155;
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  border-color: #00dc82;
  color: #00dc82;
}

.nav-link .arrow {
  font-size: 1.2rem;
}

.home-link {
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.home-link:hover {
  color: #00dc82;
}
</style>
