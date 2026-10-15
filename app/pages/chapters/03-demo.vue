<script setup>
// ============================================================
// 第 03 章 · 真实布局体验页
// 通过 definePageMeta({ layout: 'custom' }) 使用侧边栏布局
// ============================================================

definePageMeta({
  layout: 'custom'
})

useHead({
  title: '布局体验 · 第03章'
})

const route = useRoute()

const checklist = [
  { done: true, text: '本页通过 definePageMeta({ layout: \'custom\' }) 指定了侧边栏布局' },
  { done: true, text: 'app.vue 中必须存在 <NuxtLayout> 包裹 <NuxtPage>，布局才会生效' },
  { done: true, text: '对比章节页：它们没写 layout 字段，走的是 default 布局（顶栏+页脚）' },
  { done: true, text: '点左侧「首页」返回，注意外围结构在两个布局间切换，但页面内容都是 SPA 内跳转（无整页刷新）' }
]
</script>

<template>
  <div class="demo-page">
    <header class="page-header">
      <span class="page-badge">第03章 · 真实演示</span>
      <h1>你正在看 custom 布局</h1>
      <p class="page-intro">
        这个页面的外围结构（左侧深色侧边栏）来自 <code>app/layouts/custom.vue</code>，
        而章节页用的是 <code>default.vue</code>（顶部导航+页脚）。切换页面时布局可以整组替换，
        页面内容本身互不感知。
      </p>
    </header>

    <section class="meta-card">
      <h2>当前页面元信息</h2>
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">路由路径</span>
          <code>{{ route.path }}</code>
        </div>
        <div class="meta-item">
          <span class="meta-label">route.meta.layout</span>
          <code class="highlight">{{ route.meta.layout || 'default（未指定）' }}</code>
        </div>
        <div class="meta-item">
          <span class="meta-label">布局文件</span>
          <code>app/layouts/{{ route.meta.layout === 'custom' ? 'custom' : 'default' }}.vue</code>
        </div>
      </div>
      <p class="meta-note">
        <code>route.meta</code> 就是 <code>definePageMeta</code> 写入的数据——
        中间件（第07章）和插件都可以在导航时读到它，实现按页面拦截。
      </p>
    </section>

    <section class="check-card">
      <h2>观察清单</h2>
      <ul>
        <li v-for="(item, i) in checklist" :key="i">
          <span class="check-icon">✓</span>
          <span v-html="item.text" />
        </li>
      </ul>
    </section>

    <section class="try-card">
      <h2>动手试一试</h2>
      <p>打开 <code>app/pages/chapters/03-demo.vue</code>，把 <code>layout: 'custom'</code> 改成 <code>layout: 'default'</code>，保存后观察侧边栏立刻变回顶栏布局——布局切换不需要刷新页面。</p>
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  max-width: 900px;
}

.page-header {
  margin-bottom: 32px;
}

.page-badge {
  display: inline-block;
  background: #1e293b;
  color: #94a3b8;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 12px;
}

.page-header h1 {
  font-size: 1.8rem;
  margin: 0 0 12px;
  color: #f8fafc;
}

.page-intro {
  color: #94a3b8;
  line-height: 1.7;
  margin: 0;
}

.page-intro code {
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  color: #4ade80;
}

section {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 20px 24px;
  margin-bottom: 16px;
}

section h2 {
  font-size: 1rem;
  color: #e2e8f0;
  margin: 0 0 16px;
}

.meta-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-item {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.88rem;
}

.meta-label {
  min-width: 150px;
  color: #64748b;
}

.meta-item code {
  font-family: monospace;
  color: #e2e8f0;
  background: #1e293b;
  padding: 3px 10px;
  border-radius: 4px;
}

.meta-item code.highlight {
  color: #4ade80;
  font-weight: 700;
}

.meta-note,
.try-card p {
  margin: 14px 0 0;
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.7;
}

.meta-note code,
.try-card code {
  background: #1e293b;
  padding: 1px 6px;
  border-radius: 3px;
  color: #4ade80;
  font-size: 0.9em;
}

.check-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.check-card li {
  display: flex;
  gap: 10px;
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.check-icon {
  color: #00dc82;
  font-weight: 700;
}
</style>
