<script setup>
// ============================================================
// 第 01 章：项目结构与配置
// 演示 Nuxt 4 的目录约定、nuxt.config.ts、自动导入、运行时配置
// ============================================================

useHead({
  title: '第01章 项目结构与配置'
})

// 章节信息
const chapterNum = 1
const chapterTitle = '项目结构与配置'

// ---- Demo 1: 运行时配置 ----
// 读取 nuxt.config.ts 中定义的 runtimeConfig
const config = useRuntimeConfig()

// Demo 中动态修改 app.name，演示配置如何影响页面
const appName = ref(config.public.appName || 'Nuxt Learn')
const useDarkHeader = ref(false)

// 计算当前页面标题（响应式，随输入变化）
const computedTitle = computed(() => `${appName.value} - 演示页面`)

// 当 appName 变化时同步更新 head
watch(appName, (val) => {
  useHead({ title: `${val} - 第01章` })
}, { immediate: false })

// ---- Demo 2: 文件树交互 ----
// 点击目录节点展开/折叠，查看每个目录的说明
const treeData = [
  {
    name: 'nuxt-learn/',
    type: 'root',
    desc: '项目根目录',
    children: [
      { name: 'app/', type: 'dir', desc: '应用源码目录（Nuxt 4 核心）', children: [
        { name: 'pages/', type: 'dir', desc: '页面组件 → 自动生成路由', highlight: true },
        { name: 'layouts/', type: 'dir', desc: '布局组件 → 页面外壳' },
        { name: 'components/', type: 'dir', desc: '可复用组件 → 自动全局注册', highlight: true },
        { name: 'composables/', type: 'dir', desc: '组合式函数 → 自动导入', highlight: true },
        { name: 'middleware/', type: 'dir', desc: '路由中间件 → 导航守卫' },
        { name: 'assets/', type: 'dir', desc: '需要构建的静态资源（CSS、图片）' },
        { name: 'public/', type: 'dir', desc: '直接复制的静态文件' },
        { name: 'app.vue', type: 'file', desc: '根组件 / 应用入口' }
      ]},
      { name: 'server/', type: 'dir', desc: '服务端代码', children: [
        { name: 'api/', type: 'dir', desc: 'API 端点 → 自动生成服务端路由', highlight: true },
        { name: 'middleware/', type: 'dir', desc: '服务端中间件' }
      ]},
      { name: 'stores/', type: 'dir', desc: 'Pinia 状态管理（需 @pinia/nuxt 模块）' },
      { name: 'nuxt.config.ts', type: 'file', desc: 'Nuxt 配置文件 → 定义模块、CSS、运行时配置', highlight: true },
      { name: 'tsconfig.json', type: 'file', desc: 'TypeScript 配置（继承 .nuxt 自动生成）' },
      { name: 'package.json', type: 'file', desc: '依赖与脚本' }
    ]
  }
]

const expandedNodes = ref(new Set(['nuxt-learn/', 'app/', 'server/']))

function toggleNode(name) {
  if (expandedNodes.value.has(name)) {
    expandedNodes.value.delete(name)
  } else {
    expandedNodes.value.add(name)
  }
}

function isExpanded(name) {
  return expandedNodes.value.has(name)
}

// 当前选中的节点描述（用于右侧详情面板）
const selectedNode = ref(null)

function selectNode(node) {
  selectedNode.value = node
}

// 递归渲染辅助
function getNodeIcon(node) {
  if (node.type === 'root') return '📦'
  if (node.type === 'dir') return isExpanded(node.name) ? '📂' : '📁'
  return '📄'
}

// ---- Demo 3: 自动导入演示 ----
// 证明 ref/computed/useHead 等无需 import
// 在 script setup 中直接使用（上方已用 ref、computed、watch）

const autoImportDemo = ref('这段文字通过 ref() 创建，但脚本中没有 import { ref } from vue')
const counter = ref(0)
const doubled = computed(() => counter.value * 2)

// ---- 配置代码（只读展示） ----
const nuxtConfigCode = `export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  css: ['~/assets/css/main.css'],
  
  modules: ['@pinia/nuxt'],
  
  // 运行时配置：区分服务端 / 客户端
  runtimeConfig: {
    apiSecret: 'server-only-secret',    // 仅服务端
    public: {
      appName: 'Nuxt Learn',             // 客户端可读
      apiBase: '/api'
    }
  },
  
  app: {
    head: {
      titleTemplate: '%s - Nuxt 学习',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width' }
      ]
    }
  }
})`

const dirStructureCode = `nuxt-learn/
├── app/
│   ├── pages/          # 文件路由
│   │   ├── index.vue        → /
│   │   └── posts/[id].vue   → /posts/:id
│   ├── components/     # 自动注册
│   ├── composables/    # 自动导入
│   └── app.vue
├── server/api/         # 服务端路由
├── nuxt.config.ts
└── package.json`

const autoImportCode = '<' + 'script setup>\n// ❌ 不需要这些 import：\n// import { ref, computed, watch } from \'vue\'\n// import { useHead, useRuntimeConfig } from \'#imports\'\n\n// ✅ Nuxt 自动导入，直接使用：\nconst count = ref(0)\nconst doubled = computed(() => count.value * 2)\nconst config = useRuntimeConfig()\nuseHead({ title: \'我的页面\' })\n<' + '/script>'

const comparisonCode = `| 特性          | Vite 原生项目        | Nuxt 项目              |
|--------------|----------------------|------------------------|
| 路由配置     | 手动 router/index.ts | 文件自动生成           |
| 组件注册     | 手动 import          | 自动全局注册           |
| Vue API 导入 | 手动 import          | 自动导入               |
| SSR          | 需额外配置           | 内置支持               |
| 服务端 API   | 需要独立后端         | 同构开发               |`
</script>

<template>
  <div class="chapter">
    <!-- 章节标题 -->
    <header class="chapter-header">
      <span class="chapter-badge">第 {{ chapterNum }} 章</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        Nuxt 的核心理念是「约定大于配置」。通过目录约定，Nuxt 自动完成路由生成、组件注册、API 导入等工作，
        让你专注于业务代码。本章将详解项目结构、配置文件和自动导入机制，并通过交互 demo 加深理解。
      </p>
    </header>

    <!-- 知识点 1：目录结构 -->
    <KnowledgePoint num="1" title="Nuxt 4 目录结构详解">
      <p>
        Nuxt 4 将应用代码集中到 <code>app/</code> 目录下（这是 Nuxt 4 相对 Nuxt 3 的重要变化），
        每个子目录都有明确的职责约定。点击下方的目录节点查看说明：
      </p>
      
      <!-- 交互式文件树 Demo -->
      <div class="demo-box">
        <div class="demo-title">🎯 Demo：交互式文件树 — 点击目录展开，点击文件查看说明</div>
        <div class="tree-container">
          <div class="tree-view">
            <template v-for="node in treeData" :key="node.name">
              <div class="tree-node root-node">
                <span 
                  class="node-row"
                  :class="{ selected: selectedNode === node }"
                  @click="node.children && toggleNode(node.name); selectNode(node)"
                >
                  <span class="node-icon">{{ getNodeIcon(node) }}</span>
                  <span class="node-name root">{{ node.name }}</span>
                  <span v-if="node.children" class="toggle">{{ isExpanded(node.name) ? '▾' : '▸' }}</span>
                </span>
                
                <div v-if="node.children && isExpanded(node.name)" class="tree-children">
                  <template v-for="child in node.children" :key="child.name">
                    <div class="tree-node">
                      <span 
                        class="node-row"
                        :class="{ selected: selectedNode === child }"
                        @click="child.children && toggleNode(child.name); selectNode(child)"
                      >
                        <span class="node-icon">{{ getNodeIcon(child) }}</span>
                        <span class="node-name" :class="{ highlight: child.highlight }">{{ child.name }}</span>
                        <span v-if="child.children" class="toggle">{{ isExpanded(child.name) ? '▾' : '▸' }}</span>
                      </span>
                      
                      <div v-if="child.children && isExpanded(child.name)" class="tree-children nested">
                        <div v-for="grandchild in child.children" :key="grandchild.name" class="tree-node">
                          <span 
                            class="node-row"
                            :class="{ selected: selectedNode === grandchild }"
                            @click="selectNode(grandchild)"
                          >
                            <span class="node-icon">{{ getNodeIcon(grandchild) }}</span>
                            <span class="node-name" :class="{ highlight: grandchild.highlight }">{{ grandchild.name }}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
          
          <!-- 右侧详情面板 -->
          <div class="tree-detail">
            <div v-if="selectedNode" class="detail-content">
              <h4>{{ selectedNode.name }}</h4>
              <p>{{ selectedNode.desc }}</p>
              <div v-if="selectedNode.highlight" class="badge-important">关键目录</div>
            </div>
            <div v-else class="detail-empty">
              点击左侧任意节点查看详细说明
            </div>
          </div>
        </div>
      </div>

      <CodeBlock :code="dirStructureCode" lang="text" title="目录结构与路由映射" />
    </KnowledgePoint>

    <!-- 知识点 2：nuxt.config.ts -->
    <KnowledgePoint num="2" title="nuxt.config.ts 配置文件">
      <p>
        <code>nuxt.config.ts</code> 是 Nuxt 的核心配置文件，通过 <code>defineNuxtConfig()</code> 函数定义。
        它控制模块加载、CSS 引入、运行时配置、应用元信息等。下方是当前项目的实际配置：
      </p>
      <CodeBlock :code="nuxtConfigCode" lang="typescript" title="nuxt.config.ts" />
      
      <h4>关键配置项说明</h4>
      <table class="config-table">
        <thead>
          <tr><th>配置项</th><th>作用</th><th>示例值</th></tr>
        </thead>
        <tbody>
          <tr><td><code>compatibilityDate</code></td><td>锁定行为版本，确保稳定性</td><td><code>'2025-07-15'</code></td></tr>
          <tr><td><code>devtools</code></td><td>开启 Nuxt DevTools 调试面板</td><td><code>{ enabled: true }</code></td></tr>
          <tr><td><code>css</code></td><td>全局引入的样式文件</td><td><code>['~/assets/css/main.css']</code></td></tr>
          <tr><td><code>modules</code></td><td>扩展 Nuxt 功能的模块</td><td><code>['@pinia/nuxt']</code></td></tr>
          <tr><td><code>runtimeConfig</code></td><td>运行时配置（区分服务端/客户端）</td><td>见上方代码</td></tr>
          <tr><td><code>app.head</code></td><td>全局 HTML head 标签</td><td>title、meta 等</td></tr>
        </tbody>
      </table>
    </KnowledgePoint>

    <!-- 知识点 3：自动导入 -->
    <KnowledgePoint num="3" title="自动导入机制">
      <p>
        这是 Nuxt 最省心的特性之一。在 <code>&lt;script setup&gt;</code> 中，你无需手动 import：
      </p>
      <ul>
        <li><strong>Vue API</strong>：<code>ref</code>、<code>reactive</code>、<code>computed</code>、<code>watch</code>、<code>onMounted</code> 等</li>
        <li><strong>Nuxt API</strong>：<code>useHead</code>、<code>useRuntimeConfig</code>、<code>useRoute</code>、<code>useRouter</code>、<code>navigateTo</code> 等</li>
        <li><strong>组件</strong>：<code>app/components/</code> 下的所有 .vue 文件自动全局注册</li>
        <li><strong>组合式函数</strong>：<code>app/composables/</code> 下导出的函数自动可用</li>
      </ul>
      <CodeBlock :code="autoImportCode" lang="vue" title="自动导入对比" />
      
      <!-- 自动导入演示 Demo -->
      <div class="demo-box">
        <div class="demo-title">🎯 Demo：自动导入验证 — 下方按钮使用的 ref/computed 均未手动 import</div>
        <div class="auto-import-demo">
          <p class="demo-text">{{ autoImportDemo }}</p>
          <div class="counter-demo">
            <span class="counter-value">{{ counter }}</span>
            <span class="counter-arrow">×</span>
            <span class="counter-value">2</span>
            <span class="counter-arrow">=</span>
            <span class="counter-result">{{ doubled }}</span>
          </div>
          <div class="counter-controls">
            <AppButton type="primary" size="small" @click="counter--">-1</AppButton>
            <AppButton type="primary" size="small" @click="counter++">+1</AppButton>
            <AppButton type="secondary" size="small" @click="counter = 0">重置</AppButton>
          </div>
          <p class="demo-hint">
            提示：打开浏览器开发者工具查看本页源码，<code>&lt;script setup&gt;</code> 中没有任何 import 语句，
            但 <code>ref()</code>、<code>computed()</code> 正常工作。
          </p>
        </div>
      </div>
    </KnowledgePoint>

    <!-- 知识点 4：运行时配置 -->
    <KnowledgePoint num="4" title="运行时配置 runtimeConfig">
      <p>
        <code>runtimeConfig</code> 分为两部分：<code>runtimeConfig</code> 顶层字段仅服务端可读（如 API 密钥），
        <code>runtimeConfig.public</code> 客户端也可读（如公开的 API 地址）。在组件中通过
        <code>useRuntimeConfig()</code> 获取。
      </p>
      
      <!-- 运行时配置 Demo -->
      <div class="demo-box">
        <div class="demo-title">🎯 Demo：运行时配置 — 修改应用名称，观察标题实时变化</div>
        <div class="config-demo">
          <div class="config-row">
            <label>应用名称（public.appName）：</label>
            <input 
              v-model="appName" 
              type="text" 
              placeholder="输入应用名"
              class="config-input"
            />
          </div>
          <div class="config-row">
            <label>深色头部样式：</label>
            <button 
              class="toggle-btn"
              :class="{ active: useDarkHeader }"
              @click="useDarkHeader = !useDarkHeader"
            >
              {{ useDarkHeader ? '已开启' : '已关闭' }}
            </button>
          </div>
          
          <div class="config-preview" :class="{ dark: useDarkHeader }">
            <small>页面标题（浏览器标签）：</small>
            <div class="preview-title">{{ computedTitle }}</div>
            <small>运行时读取的值：</small>
            <div class="preview-values">
              <span class="kv"><code>config.public.appName</code> = "{{ config.public.appName || '(未设置)' }}"</span>
            </div>
          </div>
        </div>
      </div>
    </KnowledgePoint>

    <!-- 知识点 5：与 Vite 项目对比 -->
    <KnowledgePoint num="5" title="Nuxt vs 原生 Vite + Vue">
      <p>
        理解 Nuxt 的价值，最直观的方式是对比传统 Vite + Vue 项目：
      </p>
      <CodeBlock :code="comparisonCode" lang="markdown" title="对比表" />
      <p>
        简言之：Nuxt 用约定替代了手写配置。你写的每一行代码几乎都是业务逻辑，而非框架胶水代码。
      </p>
    </KnowledgePoint>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li>Nuxt 4 将应用代码集中到 <code>app/</code> 目录</li>
        <li><code>pages/</code>、<code>components/</code>、<code>composables/</code> 三个目录自动处理路由、注册、导入</li>
        <li><code>server/api/</code> 让前后端同构开发</li>
        <li><code>nuxt.config.ts</code> 是唯一需要的配置入口</li>
        <li>自动导入省去了大量 import 语句</li>
        <li><code>runtimeConfig</code> 区分服务端/客户端配置</li>
      </ul>
    </div>

    <!-- 章节导航 -->
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

/* 文件树 Demo */
.tree-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #e2e8f0;
}

.tree-view {
  background: #f8fafc;
  padding: 16px;
  font-family: 'SF Mono', monospace;
  font-size: 0.85rem;
  max-height: 400px;
  overflow-y: auto;
}

.tree-detail {
  background: #fff;
  padding: 16px;
  min-height: 200px;
}

.node-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;
}

.node-row:hover {
  background: #e2e8f0;
}

.node-row.selected {
  background: #c7f0d9;
}

.node-icon {
  font-size: 0.9rem;
}

.node-name {
  color: #334155;
  flex: 1;
}

.node-name.root {
  font-weight: 700;
  color: #1e293b;
}

.node-name.highlight {
  color: #00dc82;
  font-weight: 600;
}

.toggle {
  color: #94a3b8;
  font-size: 0.8rem;
}

.tree-children {
  margin-left: 20px;
  border-left: 1px dashed #cbd5e1;
  padding-left: 4px;
}

.tree-children.nested {
  margin-left: 16px;
}

.detail-content h4 {
  margin: 0 0 8px;
  color: #00dc82;
  font-family: monospace;
}

.detail-content p {
  color: #334155;
  line-height: 1.6;
  margin: 0;
}

.badge-important {
  display: inline-block;
  margin-top: 8px;
  background: #fef3c7;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.detail-empty {
  color: #94a3b8;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  height: 100%;
}

/* 自动导入 Demo */
.auto-import-demo {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.demo-text {
  color: #475569;
  font-style: italic;
  margin: 0 0 16px;
}

.counter-demo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-family: monospace;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.counter-value {
  color: #1e293b;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.counter-arrow {
  color: #94a3b8;
}

.counter-result {
  color: #00dc82;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.counter-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.demo-hint {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  padding: 8px;
  background: #fef9c3;
  border-radius: 4px;
}

/* 运行时配置 Demo */
.config-demo {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.config-row label {
  min-width: 200px;
  color: #334155;
  font-size: 0.9rem;
}

.config-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.config-input:focus {
  border-color: #00dc82;
}

.toggle-btn {
  padding: 6px 16px;
  border: 1px solid #cbd5e1;
  background: #f1f5f9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #1e293b;
  color: #fff;
  border-color: #1e293b;
}

.config-preview {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.config-preview.dark {
  background: #1e293b;
  border-color: #334155;
}

.config-preview.dark * {
  color: #e2e8f0 !important;
}

.preview-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #00dc82;
  margin: 4px 0 12px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
}

.config-preview.dark .preview-title {
  background: #0f172a;
}

.preview-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kv {
  font-size: 0.85rem;
  color: #475569;
}

/* 配置表 */
.config-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 0.9rem;
}

.config-table th {
  background: #f1f5f9;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  color: #1e293b;
}

.config-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.config-table tr:hover {
  background: #f8fafc;
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

/* 响应式 */
@media (max-width: 768px) {
  .tree-container {
    grid-template-columns: 1fr;
  }
  .config-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .config-row label {
    min-width: 0;
  }
}
</style>
