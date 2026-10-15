<script setup>
// ============================================================
// 第 02 章：页面与路由
// 演示文件路由、动态路由、嵌套路由、编程式导航
// ============================================================

useHead({
  title: '第02章 页面与路由'
})

const chapterNum = 2
const chapterTitle = '页面与路由'

// ---- Demo 1: 文件路径 → 路由 映射器 ----
// 用户输入文件路径，实时显示生成的路由
const filePathInput = ref('app/pages/index.vue')
const routeResult = computed(() => fileToRoute(filePathInput.value))

function fileToRoute(path) {
  // 去掉 app/pages/ 前缀和 .vue 后缀
  let route = path
    .replace(/^app\/pages\//, '')
    .replace(/\.vue$/, '')
    .replace(/\\/g, '/')
  
  if (!route || route === 'index') return '/'
  
  // 动态参数 [id] → :id
  const params = []
  route = route.replace(/\[([^\]]+)\]/g, (_, name) => {
    if (name === '...') {
      params.push(`${name}（catch-all）`)
      return '*'
    }
    params.push(name)
    return `:${name}`
  })
  
  // 末尾 index → 父路径
  if (route.endsWith('/index')) {
    route = route.slice(0, -6) || '/'
  }
  
  return {
    path: route.startsWith('/') ? route : '/' + route,
    params: params.length ? params : null,
    isDynamic: params.length > 0
  }
}

// 预设示例
const presets = [
  { file: 'app/pages/index.vue', label: '首页' },
  { file: 'app/pages/about.vue', label: '关于' },
  { file: 'app/pages/posts/index.vue', label: '文章列表' },
  { file: 'app/pages/posts/[id].vue', label: '文章详情' },
  { file: 'app/pages/users/[id]/settings.vue', label: '用户设置' },
  { file: 'app/pages/[...slug].vue', label: 'catch-all' }
]

// ---- Demo 2: 编程式导航 playground ----
const navTarget = ref('/chapters/01')
const navHistory = ref([])

function logNav(action, detail) {
  navHistory.value.unshift({
    time: new Date().toLocaleTimeString('zh-CN'),
    action,
    detail
  })
  if (navHistory.value.length > 5) navHistory.value.pop()
}

function doPush() {
  logNav('router.push', `导航到 ${navTarget.value}`)
  navigateTo(navTarget.value)
}

function doReplace() {
  logNav('router.replace', `替换为 ${navTarget.value}（不留历史记录）`)
  // 注意：实际执行会跳转，这里仅记录日志
}

function doBack() {
  logNav('router.back', '返回上一页')
  // 注意：实际执行会跳转
}

// 当前路由信息展示
const route = useRoute()
const router = useRouter()

// ---- Demo 3: 动态路由参数展示 ----
// 在 URL 上加 ?id=xxx 测试
const queryId = computed(() => route.query.id || '未提供')

// ---- 代码示例 ----
const basicRoutingCode = `app/pages/
├── index.vue          →  /
├── about.vue          →  /about
├── contact.vue        →  /contact
└── posts/
    ├── index.vue      →  /posts
    └── [id].vue       →  /posts/:id  (动态参数)`

const dynamicRouteCode = '<' + 'script setup>\n// 通过 useRoute() 获取当前路由参数\nconst route = useRoute()\n\n// route.params.id 对应文件名 [id].vue\nconst postId = route.params.id\n\n// route.query 获取查询参数 ?source=xxx\nconst source = route.query.source\n<' + '/script>\n\n<template>\n  <p>文章 ID: {{ postId }}</p>\n  <p>来源: {{ source }}</p>\n</template>'

const nestedRouteCode = `app/pages/
└── users/
    ├── index.vue          →  /users         (用户列表)
    ├── [id].vue           →  /users/:id     (用户详情，包含子路由出口)
    └── [id]/
        ├── posts.vue      →  /users/:id/posts    (该用户的文章)
        └── settings.vue   →  /users/:id/settings (该用户的设置)

<!-- users/[id].vue 需要放 <NuxtPage /> 渲染子路由 -->
<template>
  <div>
    <h1>用户 {{ $route.params.id }}</h1>
    <NuxtPage />  <!-- 子路由在这里渲染 -->
  </div>
</template>`

const navLinkCode = '<template>\n  <!-- 声明式：NuxtLink -->\n  <NuxtLink to="/about">关于</NuxtLink>\n  \n  <!-- 动态参数 -->\n  <NuxtLink :to="`/posts/${post.id}`">{{ post.title }}</NuxtLink>\n  \n  <!-- 带查询参数 -->\n  <NuxtLink :to="{ path: \'/search\', query: { q: \'nuxt\' } }">搜索</NuxtLink>\n  \n  <!-- 外部链接（external 属性） -->\n  <NuxtLink to="https://nuxt.com" external target="_blank">官网</NuxtLink>\n</template>\n\n<' + 'script setup>\n// 编程式：useRouter()\nconst router = useRouter()\n\nfunction go(id) {\n  router.push(`/posts/${id}`)\n}\n\n// replace：不留历史记录\nfunction replaceHome() {\n  router.replace(\'/\')\n}\n\n// back：返回\nfunction back() {\n  router.back()\n}\n<' + '/script>'

const pageMetaCode = '<' + 'script setup>\n// definePageMeta：为当前页面定义元信息\ndefinePageMeta({\n  // 指定布局\n  layout: \'custom\',\n  \n  // 应用中间件（第07章详解）\n  middleware: [\'auth\'],\n  \n  // 自定义字段（任意数据）\n  requiresAuth: true,\n  pageType: \'detail\'\n})\n\n// validate：路由参数验证，返回 false 显示 404\ndefinePageMeta({\n  validate: (route) => {\n    // 只允许数字 id\n    return /^\\d+$/.test(route.params.id)\n  }\n})\n<' + '/script>'
</script>

<template>
  <div class="chapter">
    <header class="chapter-header">
      <span class="chapter-badge">第 {{ chapterNum }} 章</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        Nuxt 的路由系统基于「文件即路由」的约定。你创建的每个 .vue 文件，Nuxt 都会自动生成对应的路由配置，
        无需手写 router/index.ts。本章覆盖基础路由、动态参数、嵌套路由和编程式导航。
      </p>
    </header>

    <!-- 知识点 1：文件路由基础 -->
    <KnowledgePoint num="1" title="文件路由映射规则">
      <p>
        在 <code>app/pages/</code> 下创建 .vue 文件，Nuxt 根据文件路径自动生成路由。
        核心规则只有三条：
      </p>
      <ul>
        <li><code>index.vue</code> → 当前目录的根路径</li>
        <li><code>about.vue</code> → <code>/about</code></li>
        <li><code>[param].vue</code> → 动态参数 <code>:param</code></li>
      </ul>
      <CodeBlock :code="basicRoutingCode" lang="text" title="文件 → 路由对照表" />
    </KnowledgePoint>

    <!-- Demo 1: 路由映射器 -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo：文件路径 → 路由 实时映射器</div>
      <div class="router-mapper">
        <div class="mapper-input">
          <label>文件路径：</label>
          <input 
            v-model="filePathInput" 
            type="text" 
            placeholder="app/pages/posts/[id].vue"
            class="path-input"
          />
        </div>
        
        <div class="presets">
          <span class="presets-label">快速预设：</span>
          <button 
            v-for="p in presets" 
            :key="p.file"
            class="preset-btn"
            @click="filePathInput = p.file"
          >
            {{ p.label }}
          </button>
        </div>
        
        <div class="mapper-result">
          <div class="result-row">
            <span class="result-label">文件：</span>
            <code class="result-value">{{ filePathInput }}</code>
          </div>
          <div class="result-row highlight-row">
            <span class="result-label">生成路由：</span>
            <code class="result-value route-path">{{ routeResult.path || routeResult }}</code>
            <span v-if="routeResult.isDynamic" class="dynamic-badge">动态</span>
          </div>
          <div v-if="routeResult.params" class="result-row">
            <span class="result-label">参数：</span>
            <div class="params-list">
              <span v-for="p in routeResult.params" :key="p" class="param-tag">{{ p }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点 2：动态路由 -->
    <KnowledgePoint num="2" title="动态路由参数">
      <p>
        用方括号 <code>[参数名]</code> 包裹的文件名段会变成动态参数。在组件内通过
        <code>useRoute()</code> 获取：
      </p>
      <CodeBlock :code="dynamicRouteCode" lang="vue" title="动态路由读取参数" />
      
      <h4>动态路由的三种形式</h4>
      <table class="route-table">
        <thead>
          <tr><th>文件名</th><th>匹配路径</th><th>参数</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>[id].vue</code></td>
            <td>/posts/123</td>
            <td><code>route.params.id = '123'</code></td>
          </tr>
          <tr>
            <td><code>[category]/[id].vue</code></td>
            <td>/news/456</td>
            <td><code>params.category = 'news'</code><br><code>params.id = '456'</code></td>
          </tr>
          <tr>
            <td><code>[...slug].vue</code></td>
            <td>/a/b/c（匹配多级）</td>
            <td><code>params.slug = ['a','b','c']</code></td>
          </tr>
        </tbody>
      </table>
    </KnowledgePoint>

    <!-- 知识点 3：嵌套路由 -->
    <KnowledgePoint num="3" title="嵌套路由">
      <p>
        当目录下既有 <code>[id].vue</code> 又有 <code>[id]/xxx.vue</code> 时，
        父页面需要用 <code>&lt;NuxtPage /&gt;</code> 声明子路由出口：
      </p>
      <CodeBlock :code="nestedRouteCode" lang="text" title="嵌套路由结构" />
    </KnowledgePoint>

    <!-- 知识点 4：导航 -->
    <KnowledgePoint num="4" title="声明式导航 vs 编程式导航">
      <p>
        <strong>声明式</strong>用 <code>&lt;NuxtLink&gt;</code>（路由内部跳转，不刷新页面），
        <strong>编程式</strong>用 <code>useRouter()</code> 适合事件触发：
      </p>
      <CodeBlock :code="navLinkCode" lang="vue" title="两种导航方式" />
    </KnowledgePoint>

    <!-- Demo 2: 编程式导航 playground -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo：编程式导航 Playground — 点击按钮观察效果与日志</div>
      <div class="nav-playground">
        <div class="nav-controls">
          <div class="nav-input-row">
            <label>目标路径：</label>
            <input v-model="navTarget" type="text" class="path-input" />
          </div>
          <div class="nav-buttons">
            <AppButton type="primary" size="small" @click="doPush">router.push（跳转）</AppButton>
            <AppButton type="secondary" size="small" @click="doReplace">router.replace</AppButton>
            <AppButton type="secondary" size="small" @click="doBack">router.back</AppButton>
          </div>
          <p class="nav-hint">
            提示：<code>router.push</code> 会真实跳转。<code>replace</code> 和 <code>back</code> 此处仅演示日志，避免离开本页。
          </p>
        </div>
        
        <div class="nav-info">
          <h4>当前路由信息</h4>
          <div class="route-info">
            <div><span>path：</span><code>{{ route.path }}</code></div>
            <div><span>name：</span><code>{{ route.name || '未命名' }}</code></div>
            <div><span>query.id：</span><code>{{ queryId }}</code></div>
          </div>
          
          <h4>操作日志</h4>
          <div class="log-list">
            <div v-if="!navHistory.length" class="log-empty">暂无操作</div>
            <div v-for="(log, i) in navHistory" :key="i" class="log-item">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-action">{{ log.action }}</span>
              <span class="log-detail">{{ log.detail }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点 5：页面元信息 -->
    <KnowledgePoint num="5" title="definePageMeta 页面元信息">
      <p>
        每个页面可以通过 <code>definePageMeta()</code> 声明该页面的专属配置，
        如布局、中间件、路由验证等：
      </p>
      <CodeBlock :code="pageMetaCode" lang="vue" title="页面元信息与路由验证" />
      <p>
        <strong>路由验证</strong>很有用：返回 <code>false</code> 会直接显示 404 页面，
        避免无效参数进入业务逻辑。
      </p>
    </KnowledgePoint>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li>文件路径即路由：<code>app/pages/about.vue</code> → <code>/about</code></li>
        <li><code>[param]</code> 创建动态参数，用 <code>useRoute()</code> 读取</li>
        <li><code>[...slug]</code> 匹配多级路径（catch-all）</li>
        <li>嵌套路由：父页面用 <code>&lt;NuxtPage /&gt;</code> 渲染子路由</li>
        <li><code>&lt;NuxtLink&gt;</code> 声明式，<code>useRouter()</code> 编程式</li>
        <li><code>definePageMeta</code> 配置布局、中间件、路由验证</li>
      </ul>
    </div>

    <ChapterNav :current="chapterNum" :total="11" />
  </div>
</template>

<style scoped>
.chapter {
  max-width: 900px;
  margin: 0 auto;
}

.chapter-header {
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 2px solid #00dc82;
}

.chapter-badge {
  display: inline-block;
  background: #00dc82;
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.chapter-header h1 {
  font-size: 2.2rem;
  margin: 0 0 16px;
  color: #1e293b;
}

.chapter-intro {
  color: #64748b;
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 0;
}

/* Demo 容器 */
.demo-box {
  margin: 20px 0;
  border: 1px solid #c7f0d9;
  border-radius: 10px;
  overflow: hidden;
  background: #f0fdf4;
}

.demo-title {
  background: #00dc82;
  color: #fff;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* 路由映射器 Demo */
.router-mapper {
  padding: 20px;
  background: #fff;
}

.mapper-input {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.mapper-input label {
  min-width: 80px;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 600;
}

.path-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-family: 'SF Mono', monospace;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}

.path-input:focus {
  border-color: #00dc82;
}

.presets {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.presets-label {
  font-size: 0.8rem;
  color: #64748b;
}

.preset-btn {
  padding: 4px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-size: 0.78rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  border-color: #00dc82;
  color: #00dc82;
  background: #f0fdf4;
}

.mapper-result {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.result-row.highlight-row {
  background: #ecfdf5;
  margin: 0 -16px;
  padding: 12px 16px;
  border-radius: 6px;
}

.result-label {
  min-width: 60px;
  color: #64748b;
  font-size: 0.85rem;
}

.result-value {
  font-family: 'SF Mono', monospace;
  font-size: 0.9rem;
  color: #1e293b;
}

.route-path {
  font-weight: 700;
  color: #00dc82;
  font-size: 1rem;
}

.dynamic-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.params-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.param-tag {
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-family: monospace;
}

/* 路由表 */
.route-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 0.88rem;
}

.route-table th {
  background: #f1f5f9;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  color: #1e293b;
}

.route-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  vertical-align: top;
}

.route-table code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  color: #be123c;
}

/* 导航 playground */
.nav-playground {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #e2e8f0;
}

.nav-controls,
.nav-info {
  background: #fff;
  padding: 20px;
}

.nav-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.nav-input-row label {
  min-width: 80px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.nav-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.nav-hint {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  padding: 8px;
  background: #fef9c3;
  border-radius: 4px;
}

.nav-info h4 {
  margin: 0 0 12px;
  font-size: 0.95rem;
  color: #1e293b;
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 16px;
}

.route-info span {
  color: #64748b;
  font-size: 0.82rem;
}

.route-info code {
  color: #00dc82;
  font-family: monospace;
}

.log-list {
  max-height: 200px;
  overflow-y: auto;
}

.log-empty {
  color: #94a3b8;
  font-size: 0.85rem;
  text-align: center;
  padding: 16px;
}

.log-item {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.82rem;
  align-items: center;
}

.log-time {
  color: #94a3b8;
  font-family: monospace;
  min-width: 70px;
}

.log-action {
  color: #00dc82;
  font-family: monospace;
  font-weight: 600;
  min-width: 110px;
}

.log-detail {
  color: #475569;
  flex: 1;
}

/* 章节小结 */
.chapter-summary {
  margin-top: 40px;
  padding: 24px;
  background: linear-gradient(135deg, #f0fdf4, #ecfeff);
  border: 1px solid #c7f0d9;
  border-radius: 10px;
}

.chapter-summary h3 {
  margin: 0 0 12px;
  color: #00dc82;
}

.chapter-summary ul {
  margin: 0;
  padding-left: 20px;
  color: #334155;
  line-height: 1.8;
}

.chapter-summary li code {
  background: #fff;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.85em;
  color: #be123c;
}

@media (max-width: 768px) {
  .nav-playground {
    grid-template-columns: 1fr;
  }
  .mapper-input,
  .nav-input-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
