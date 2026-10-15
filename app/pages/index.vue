<script setup>
// Nuxt 自动导入：ref、computed 等 Vue API 无需手动 import
const message = ref('你好，Nuxt！')

// useHead 来自 Nuxt，用于设置页面元信息
useHead({
  title: 'Nuxt 学习项目'
})

// 学习路径数据
const chapters = [
  { id: '01', title: '项目结构与配置', path: '/chapters/01', desc: '目录约定、nuxt.config.ts、自动导入、运行时配置', done: true },
  { id: '02', title: '页面与路由', path: '/chapters/02', desc: '文件路由、动态路由、嵌套路由、导航', done: true },
  { id: '03', title: '布局与组件', path: '/chapters/03', desc: '布局系统、组件自动导入、Props/Emits', done: true },
  { id: '04', title: '数据获取', path: '/chapters/04', desc: 'useFetch、useAsyncData、SSR 数据流', done: true },
  { id: '05', title: '服务端 API', path: '/chapters/05', desc: 'server/api、RESTful 端点、错误处理', done: true },
  { id: '06', title: '状态管理', path: '/chapters/06', desc: 'Pinia 集成、store 定义、持久化', done: true },
  { id: '07', title: '中间件', path: '/chapters/07', desc: '路由守卫、权限控制、全局中间件', done: true },
  { id: '08', title: '样式与静态资源', path: '/chapters/08', desc: 'CSS/SCSS、静态文件、图片处理', done: true },
  { id: '09', title: 'SEO 与元信息', path: '/chapters/09', desc: 'useHead、useSeoMeta、Open Graph', done: true },
  { id: '10', title: '构建与部署', path: '/chapters/10', desc: 'SSR/SSG/ISR、环境变量、部署', done: true },
  { id: '11', title: '错误处理与测试', path: '/chapters/11', desc: '专题：错误分层、error.vue、单元/组件/集成测试', done: true }
]
</script>

<template>
  <div>
    <section class="hero">
      <h1>{{ message }}</h1>
      <p class="subtitle">这是一个完整的 Nuxt 4 学习项目，包含 10 个章节的详细讲解和可运行示例。</p>
      <div class="actions">
        <AppButton type="primary" size="large" @click="navigateTo('/posts')">
          开始学习
        </AppButton>
        <AppButton type="secondary" size="large" @click="navigateTo('/about')">
          了解项目
        </AppButton>
      </div>
    </section>
    
    <section class="chapters">
      <h2>学习路径</h2>
      <p class="chapters-hint">共 10 章，按顺序学习效果最佳。已完成的章节可直接点击进入。</p>
      <div class="grid">
        <div
          v-for="chapter in chapters"
          :key="chapter.id"
          class="chapter-card"
          :class="{ 'is-done': chapter.done, 'is-pending': !chapter.done }"
          @click="chapter.done && navigateTo(chapter.path)"
        >
          <div class="chapter-card-header">
            <span class="chapter-num">{{ chapter.id }}</span>
            <span v-if="chapter.done" class="status done">可学习</span>
            <span v-else class="status pending">敬请期待</span>
          </div>
          <h3 class="chapter-title">{{ chapter.title }}</h3>
          <p class="chapter-desc">{{ chapter.desc }}</p>
        </div>
      </div>
    </section>
    
    <section class="quick-start">
      <h2>快速开始</h2>
      <pre><code>cd ~/Desktop/projects/nuxt-learn
npm run dev</code></pre>
      <p>访问 <code>http://localhost:3000</code> 查看效果</p>
    </section>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 60px 0;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #00dc82, #36e4da);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto 32px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.chapters {
  padding: 40px 0;
}

.chapters h2 {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.chapters-hint {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.chapter-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  background: #fff;
  transition: all 0.2s;
}

.chapter-card.is-done {
  cursor: pointer;
}

.chapter-card.is-done:hover {
  border-color: #00dc82;
  box-shadow: 0 4px 16px rgba(0, 220, 130, 0.15);
  transform: translateY(-2px);
}

.chapter-card.is-pending {
  opacity: 0.55;
  background: #f8fafc;
}

.chapter-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chapter-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: #00dc82;
  line-height: 1;
}

.status {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.status.done {
  background: #d1fae5;
  color: #065f46;
}

.status.pending {
  background: #f1f5f9;
  color: #64748b;
}

.chapter-title {
  font-size: 1.1rem;
  margin: 0 0 8px;
  color: #1e293b;
}

.chapter-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.quick-start {
  padding: 40px 0;
  border-top: 1px solid #e2e8f0;
}

.quick-start h2 {
  font-size: 1.5rem;
  margin-bottom: 16px;
}

.quick-start pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
}

.quick-start pre code {
  background: none;
  padding: 0;
  color: inherit;
}
</style>
