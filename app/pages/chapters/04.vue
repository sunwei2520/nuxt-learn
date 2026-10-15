<script setup>
// ============================================================
// 第 04 章：数据获取
// useFetch / useAsyncData / $fetch / SSR payload / 错误处理
// ============================================================

useHead({
  title: '第04章 数据获取'
})

const chapterNum = 4
const chapterTitle = '数据获取'

// ============================================================
// Demo 1: SSR Payload Inspector
// useFetch 在 SSR 时执行，数据序列化到 HTML payload
// 客户端 hydration 时直接复用 payload，不重复请求
// ============================================================
const { data: ssrData, refresh: refreshSsr, pending: ssrPending } = await useFetch('/api/demo/data', {
  query: { count: 3 },
  key: 'ssr-inspector'
})

const payloadSource = ref('')

async function checkPayload() {
  // 读取 HTML 中的 __NUXT_DATA__ 验证 payload 机制
  const html = await $fetch('/', { responseType: 'text' })
  const hasPayload = html.includes('__NUXT_DATA__') || html.includes('ssr-inspector')
  payloadSource.value = hasPayload
    ? '✅ HTML 中找到 __NUXT_DATA__，数据已随 HTML 送达浏览器'
    : '⚠️ 未在 HTML 中找到 payload（可能 CSR 模式）'
}

// ============================================================
// Demo 2: useFetch Options Playground
// ============================================================
const optDelay = ref(0)
const optCount = ref(2)
const useTransform = ref(false)
const usePick = ref(false)

const { data: optData, pending: optPending, refresh: refreshOpt } = await useFetch('/api/demo/data', {
  query: () => ({
    delay: optDelay.value,
    count: optCount.value
  }),
  key: 'options-playground',
  transform: (raw) => {
    if (!useTransform.value) return raw
    return {
      ...raw,
      transformed: true,
      itemCount: raw.items?.length || 0,
      items: raw.items?.map(i => ({ ...i, title: `[转换] ${i.title}` })) || []
    }
  },
  pick: () => usePick.value ? ['meta'] : undefined,
  watch: [optDelay, optCount, useTransform, usePick]
})

// ============================================================
// Demo 3: Error Handling
// ============================================================
const errorType = ref('500')

const { data: errorData, error: fetchError, refresh: refreshError } = await useFetch('/api/demo/error', {
  query: () => ({ type: errorType.value }),
  key: 'error-handler',
  watch: [errorType]
})

function setErrorType(type) {
  errorType.value = type
}

// ============================================================
// 代码示例
// ============================================================
const threeLayersCode = `${'$'}fetch  →  useFetch  →  useAsyncData
─────────────────────────────────────────────────

// 1. $fetch：轻量 HTTP 客户端（基于 ofetch）
//    不跟踪 SSR 状态，不缓存，不序列化到 payload
${'$'}fetch('/api/posts')
  .then(data => console.log(data))

// 问题：SSR 时在服务端执行一次，hydration 时客户端再执行一次
//       导致数据重复请求（除非手动处理）

// 2. useFetch：$fetch 的 SSR 增强版
//    自动处理 SSR payload、去重、错误状态
const { data, pending, error, refresh } = await useFetch('/api/posts')

// 3. useAsyncData：最底层的数据获取原语
//    useFetch 本质是 useAsyncData 的语法糖
const { data } = await useAsyncData('posts', () => {
  return ${'$'}fetch('/api/posts')
})

// useFetch = useAsyncData + $fetch + 自动 key + 自动序列化`

const ssrFlowCode = `SSR 数据流（以 useFetch 为例）：

┌────────────────────────────────────────────────────────┐
│  服务端                                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐     │
│  │ useFetch │───→│ $fetch   │───→│ server/api  │     │
│  │          │    └──────────┘    └──────┬───────┘     │
│  │          │←─── response ←───────────┘             │
│  │          │                                        │
│  │  payload │──→ 序列化数据到 HTML 的 <script> 中     │
│  └──────────┘    id="__NUXT_DATA__"                  │
└────────────────────────────────────────────────────────┘
                        │  HTML 发送到浏览器
                        ▼
┌────────────────────────────────────────────────────────┐
│  客户端 hydration                                      │
│  ┌──────────────────┐                                 │
│  │ useFetch         │                                 │
│  │  ↓ 检测 payload  │──→ 找到 __NUXT_DATA__           │
│  │  ↓ 复用，不请求  │──→ data 直接可用                 │
│  └──────────────────┘                                 │
│                                                        │
│  ✅ 不会重新调用 /api/posts（零重复请求）              │
└────────────────────────────────────────────────────────┘`

const optionsCode = `${'<'}script setup>
const count = ref(3)
const delay = ref(0)

// key：唯一标识，决定 payload 的缓存键
// query：响应式查询参数（变化时自动 refetch）
// transform：对原始响应做转换
// pick：只取部分字段（减少 payload 大小）
// watch：监听哪些 ref 触发 refetch
// immediate：是否在 setup 时立即执行
// default：pending 时的默认值

const { data, pending, error, refresh } = await useFetch('/api/posts', {
  key: 'my-posts',                           // 唯一缓存键
  query: { count, delay },                   // 响应式参数
  transform: (raw) => ({                     // 数据转换
    ...raw,
    fetchedAt: new Date().toISOString()
  }),
  pick: ['posts', 'total'],                  // 只保留这些字段
  watch: [count, delay],                     // 这些 ref 变化时 refetch
  immediate: true,                           // 默认 true
  default: () => ({ posts: [], total: 0 })   // pending 时的默认值
})

// 手动刷新
function reload() {
  refresh()
}
${'<'}${'/'}script>`

const errorHandlingCode = `${'<'}script setup>
// useFetch 返回 error ref：成功时为 null，失败时为 Error 对象
const { data, error, pending, refresh } = await useFetch('/api/posts')

// 客户端渲染时检查 error
if (error.value) {
  // error.value.statusCode / statusMessage / data
  console.error('请求失败:', error.value.statusMessage)
}

// 服务端 API 抛错的标准方式
// server/api/posts/[id].get.ts
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const post = posts.find(p => p.id === id)

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: '文章不存在',
      data: { hint: '请检查 id 是否正确' }  // 自定义数据
    })
  }
  return post
})
${'<'}${'/'}script>

<!-- 模板中处理三种状态 -->
<template>
  <div v-if="pending">加载中...</div>
  <div v-else-if="error">
    {{ error.statusCode }}: {{ error.statusMessage }}
  </div>
  <div v-else>{{ data }}</div>
</template>`
</script>

<template>
  <div class="chapter">
    <header class="chapter-header">
      <span class="chapter-badge">第 {{ chapterNum }} 章</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        数据获取是 Nuxt 的核心能力。本章解决三个问题：<strong>用什么取数据</strong>（$fetch / useFetch / useAsyncData 的关系）、
        <strong>SSR 时数据怎么流动</strong>（payload 机制，零重复请求）、<strong>怎么控制取数行为</strong>（选项、错误、刷新）。
      </p>
    </header>

    <!-- 知识点 1：三层数据获取 -->
    <KnowledgePoint num="1" title="$fetch vs useFetch vs useAsyncData">
      <p>
        Nuxt 提供三个层级的数据获取工具，从底层到封装依次是：
      </p>
      <CodeBlock :code="threeLayersCode" lang="javascript" title="三层对比" />
      <table class="route-table">
        <thead>
          <tr><th>工具</th><th>SSR payload</th><th>响应式状态</th><th>适用场景</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>$fetch</code></td>
            <td>❌ 无</td>
            <td>❌ 无</td>
            <td>事件处理器、按钮点击、非 SSR 场景</td>
          </tr>
          <tr>
            <td><code>useFetch</code></td>
            <td>✅ 有</td>
            <td>✅ data/pending/error</td>
            <td>页面/组件 setup 阶段取数（最常用）</td>
          </tr>
          <tr>
            <td><code>useAsyncData</code></td>
            <td>✅ 有</td>
            <td>✅ data/pending/error</td>
            <td>非 HTTP 数据源（数据库、文件系统、复杂逻辑）</td>
          </tr>
        </tbody>
      </table>
      <div class="callout">
        <strong>一句话</strong>：能用 <code>useFetch</code> 就用它；取数逻辑不单纯是 HTTP 请求时用 <code>useAsyncData</code>；
        只在事件处理函数（非 setup 阶段）才用 <code>$fetch</code>。
      </div>
    </KnowledgePoint>

    <!-- 知识点 2：SSR 数据流 -->
    <KnowledgePoint num="2" title="SSR 数据流：payload 机制">
      <p>
        这是 Nuxt 最精妙的设计。<code>useFetch</code> 在服务端执行时，结果不仅渲染到 HTML，
        还会序列化到 <code>&lt;script id="__NUXT_DATA__"&gt;</code> 标签中。客户端 hydration 时直接读取，
        <strong>不重复请求 API</strong>。
      </p>
      <CodeBlock :code="ssrFlowCode" lang="text" title="SSR 数据流全景图" />
    </KnowledgePoint>

    <!-- Demo 1: SSR Payload Inspector -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo：SSR Payload Inspector — 验证「零重复请求」</div>
      <div class="ssr-inspector">
        <div class="inspector-info">
          <h4>服务端获取的数据（查看 requestCount）</h4>
          <div class="data-card">
            <div class="data-row">
              <span class="data-label">requestCount：</span>
              <code class="data-value highlight">{{ ssrData?.meta?.requestCount }}</code>
              <span class="data-hint">← 这个值证明 API 被调用了几次</span>
            </div>
            <div class="data-row">
              <span class="data-label">serverRendered：</span>
              <code class="data-value">{{ ssrData?.meta?.serverRendered }}</code>
            </div>
            <div class="data-row">
              <span class="data-label">timestamp：</span>
              <code class="data-value" data-allow-mismatch>{{ ssrData?.meta?.timestamp }}</code>
            </div>
            <div class="data-items">
              <div v-for="item in ssrData?.items" :key="item.id" class="data-item">
                {{ item.title }}
              </div>
            </div>
          </div>
        </div>

        <div class="inspector-actions">
          <div class="action-group">
            <AppButton type="primary" size="small" :disabled="ssrPending" @click="refreshSsr()">
              {{ ssrPending ? '请求中...' : 'refresh() 手动刷新' }}
            </AppButton>
            <AppButton type="secondary" size="small" @click="checkPayload">
              检查 HTML payload
            </AppButton>
          </div>
          <div v-if="payloadSource" class="payload-result">
            {{ payloadSource }}
          </div>
          <div class="inspector-explanation">
            <p>
              <strong>验证方法</strong>：页面加载时 <code>requestCount = N</code>（服务端调了 1 次）。
              如果 Nuxt 没有复用 payload，hydration 时会再调一次，<code>requestCount</code> 会 +1。
            </p>
            <p>
              点击 <code>refresh()</code> 才会真正再调 API，此时 <code>requestCount</code> 才 +1——
              这证明客户端初始化时<strong>复用了服务端的 payload</strong>，没有重复请求。
            </p>
            <p class="inspect-tip">
              💡 在浏览器按 <kbd>⌘+U</kbd> 查看页面源代码，搜索 <code>__NUXT_DATA__</code>，
              你能看到数据被打包在 HTML 里。
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点 3：useFetch 选项 -->
    <KnowledgePoint num="3" title="useFetch 的关键选项">
      <p>
        <code>useFetch</code> 不仅仅是发请求，它是一套<strong>声明式数据获取系统</strong>：
      </p>
      <CodeBlock :code="optionsCode" lang="vue" title="完整选项示例" />
    </KnowledgePoint>

    <!-- Demo 2: Options Playground -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo：useFetch Options Playground — 实时调参看效果</div>
      <div class="options-playground">
        <div class="options-controls">
          <h4>选项控制台</h4>

          <div class="opt-group">
            <label>delay（模拟网络延迟）</label>
            <div class="opt-buttons">
              <button class="opt-btn" :class="{active: optDelay === 0}" @click="optDelay = 0">0ms</button>
              <button class="opt-btn" :class="{active: optDelay === 500}" @click="optDelay = 500">500ms</button>
              <button class="opt-btn" :class="{active: optDelay === 1500}" @click="optDelay = 1500">1500ms</button>
            </div>
          </div>

          <div class="opt-group">
            <label>count（返回数据条数）</label>
            <div class="opt-buttons">
              <button class="opt-btn" :class="{active: optCount === 1}" @click="optCount = 1">1</button>
              <button class="opt-btn" :class="{active: optCount === 3}" @click="optCount = 3">3</button>
              <button class="opt-btn" :class="{active: optCount === 5}" @click="optCount = 5">5</button>
            </div>
          </div>

          <div class="opt-group">
            <label>transform（数据转换）</label>
            <button class="opt-toggle" :class="{on: useTransform}" @click="useTransform = !useTransform">
              {{ useTransform ? '✅ 已启用' : '⚪ 已关闭' }}
            </button>
            <p class="opt-desc">给每条数据加 <code>[转换]</code> 前缀和 <code>itemCount</code> 字段</p>
          </div>

          <div class="opt-group">
            <label>pick（只取 meta 字段）</label>
            <button class="opt-toggle" :class="{on: usePick}" @click="usePick = !usePick">
              {{ usePick ? '✅ 已启用' : '⚪ 已关闭' }}
            </button>
            <p class="opt-desc">只保留 <code>meta</code>，丢弃 <code>items</code>（减小 payload）</p>
          </div>

          <div class="opt-group">
            <label>手动操作</label>
            <AppButton type="primary" size="small" :disabled="optPending" @click="refreshOpt()">
              {{ optPending ? '请求中...' : 'refresh()' }}
            </AppButton>
          </div>
        </div>

        <div class="options-result">
          <h4>
            响应结果
            <span v-if="optPending" class="loading-badge">⏳ pending</span>
            <span v-else class="ready-badge">✅ ready</span>
          </h4>
          <pre class="result-json">{{ JSON.stringify(optData, null, 2) }}</pre>
          <p class="opt-note">
            <strong>watch</strong> 的作用：改 delay/count/transform/pick 时自动 refetch，无需点 refresh。
            注意 <code>pick</code> 启用时 items 消失——payload 里也没有它们。
          </p>
        </div>
      </div>
    </div>

    <!-- 知识点 4：错误处理 -->
    <KnowledgePoint num="4" title="错误处理">
      <p>
        <code>useFetch</code> 返回 <code>error</code> ref，配合 <code>createError</code> 实现端到端错误流：
      </p>
      <CodeBlock :code="errorHandlingCode" lang="vue" title="错误处理全链路" />
    </KnowledgePoint>

    <!-- Demo 3: Error Handling -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo：错误处理 — 切换错误类型看不同状态</div>
      <div class="error-demo">
        <div class="error-controls">
          <h4>选择 API 返回的错误类型</h4>
          <div class="error-buttons">
            <button class="err-btn" :class="{active: errorType === '404'}" @click="setErrorType('404')">
              404 Not Found
            </button>
            <button class="err-btn" :class="{active: errorType === '500'}" @click="setErrorType('500')">
              500 Server Error
            </button>
            <button class="err-btn" :class="{active: errorType === '422'}" @click="setErrorType('422')">
              422 Validation Error
            </button>
          </div>
          <p class="err-query">当前请求：<code>/api/demo/error?type={{ errorType }}</code></p>
        </div>

        <div class="error-display">
          <h4>useFetch 返回的状态</h4>

          <div class="state-grid">
            <div class="state-card" :class="{ ok: !fetchError, err: fetchError }">
              <span class="state-label">error ref</span>
              <code v-if="!fetchError" class="state-value">null</code>
              <code v-else class="state-value">{{ fetchError.statusCode }}</code>
            </div>
            <div class="state-card">
              <span class="state-label">data ref</span>
              <code class="state-value">{{ errorData ? '有数据' : 'null' }}</code>
            </div>
          </div>

          <div v-if="fetchError" class="error-detail">
            <div class="err-row">
              <span>statusCode：</span>
              <code class="err-code">{{ fetchError.statusCode }}</code>
            </div>
            <div class="err-row">
              <span>statusMessage：</span>
              <code>{{ fetchError.statusMessage }}</code>
            </div>
            <div class="err-row">
              <span>data.hint：</span>
              <code>{{ fetchError.data?.hint }}</code>
            </div>
          </div>

          <div v-else class="success-detail">
            <p>✅ 请求成功，没有错误</p>
            <p class="success-data">{{ JSON.stringify(errorData) }}</p>
          </div>

          <p class="err-note">
            <strong>观察</strong>：切换错误类型时，<code>watch: [errorType]</code> 自动触发 refetch。
            <code>error</code> ref 变为 Error 对象（含 statusCode/statusMessage/data），
            <code>data</code> ref 变为 null。切换回成功类型时 error 清空、data 恢复。
          </p>
        </div>
      </div>
    </div>

    <!-- 知识点 5：刷新与生命周期 -->
    <KnowledgePoint num="5" title="刷新策略与注意事项">
      <table class="route-table">
        <thead>
          <tr><th>方式</th><th>触发时机</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>refresh()</code></td>
            <td>手动调用</td>
            <td>用相同参数重新请求，更新 data</td>
          </tr>
          <tr>
            <td><code>watch</code> 选项</td>
            <td>ref 变化时</td>
            <td>声明式 refetch，适合筛选/分页</td>
          </tr>
          <tr>
            <td><code>query</code> 响应式</td>
            <td>query ref 变化时</td>
            <td>等价于 watch，语法更简洁</td>
          </tr>
          <tr>
            <td>路由变化</td>
            <td>URL 变化时</td>
            <td>Nuxt 默认不自动 refetch（除非 key 变化）</td>
          </tr>
        </tbody>
      </table>
      <div class="callout warning">
        <strong>常见陷阱</strong>：在 <code>&lt;script setup&gt;</code> 顶层用了 <code>await useFetch()</code> 后，
        该组件变成<strong>异步组件</strong>（Async Setup），必须被 <code>&lt;Suspense&gt;</code> 包裹。
        Nuxt 的 <code>&lt;NuxtPage&gt;</code> 已内置 Suspense，但如果你在子组件里用 <code>await</code>，
        需要确保父级也有 Suspense——否则会报错。
      </div>
    </KnowledgePoint>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li>三个工具：<code>$fetch</code>（无状态）、<code>useFetch</code>（SSR 增强）、<code>useAsyncData</code>（最底层原语）</li>
        <li>SSR 数据流：服务端取数 → 序列化到 <code>__NUXT_DATA__</code> → 客户端复用（零重复请求）</li>
        <li>关键选项：<code>key</code>（缓存键）、<code>transform</code>（转换）、<code>pick</code>（精简）、<code>watch</code>（自动 refetch）</li>
        <li>错误处理：<code>error</code> ref + <code>createError</code> 实现端到端</li>
        <li>刷新：<code>refresh()</code> 手动、<code>watch</code> 声明式</li>
        <li>注意：<code>await useFetch()</code> 使组件成为异步组件，需 Suspense 包裹</li>
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

.callout {
  padding: 12px 16px;
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 6px;
  margin: 12px 0;
  font-size: 0.92rem;
  color: #334155;
}

.callout.warning {
  background: #fef9c3;
  border-left-color: #eab308;
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

/* Demo 1: SSR Inspector */
.ssr-inspector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #e2e8f0;
}

.inspector-info,
.inspector-actions {
  background: #fff;
  padding: 20px;
}

.inspector-info h4,
.inspector-actions h4 {
  margin: 0 0 12px;
  font-size: 0.95rem;
  color: #1e293b;
}

.data-card {
  padding: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.data-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 0.85rem;
}

.data-label {
  color: #64748b;
  min-width: 120px;
}

.data-value {
  font-family: monospace;
  color: #1e293b;
}

.data-value.highlight {
  color: #00dc82;
  font-weight: 700;
  font-size: 1.1rem;
}

.data-hint {
  color: #94a3b8;
  font-size: 0.78rem;
}

.data-items {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.data-item {
  padding: 4px 10px;
  background: #ecfdf5;
  border: 1px solid #c7f0d9;
  border-radius: 4px;
  font-size: 0.78rem;
  color: #065f46;
  font-family: monospace;
}

.action-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.payload-result {
  padding: 8px 12px;
  background: #ecfdf5;
  border: 1px solid #c7f0d9;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #065f46;
  margin-bottom: 12px;
}

.inspector-explanation p {
  font-size: 0.82rem;
  color: #475569;
  line-height: 1.6;
  margin: 8px 0;
}

.inspect-tip {
  padding: 8px 10px;
  background: #fef9c3;
  border-radius: 4px;
  font-size: 0.8rem !important;
}

kbd {
  background: #1e293b;
  color: #e2e8f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.85em;
}

/* Demo 2: Options Playground */
.options-playground {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 1px;
  background: #e2e8f0;
}

.options-controls,
.options-result {
  background: #fff;
  padding: 20px;
}

.options-controls h4,
.options-result h4 {
  margin: 0 0 16px;
  font-size: 0.95rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.opt-group {
  margin-bottom: 16px;
}

.opt-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.opt-buttons {
  display: flex;
  gap: 6px;
}

.opt-btn {
  padding: 4px 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.opt-btn.active {
  background: #00dc82;
  border-color: #00dc82;
  color: #fff;
  font-weight: 600;
}

.opt-btn:hover:not(.active) {
  border-color: #00dc82;
}

.opt-toggle {
  padding: 4px 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.opt-toggle.on {
  background: #ecfdf5;
  border-color: #00dc82;
  color: #00dc82;
}

.opt-desc {
  font-size: 0.75rem;
  color: #64748b;
  margin: 4px 0 0;
}

.loading-badge {
  background: #fef9c3;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
}

.ready-badge {
  background: #d1fae5;
  color: #065f46;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
}

.result-json {
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: 'SF Mono', monospace;
  overflow-x: auto;
  max-height: 320px;
  overflow-y: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.opt-note {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.6;
  margin: 12px 0 0;
}

/* Demo 3: Error */
.error-demo {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 1px;
  background: #e2e8f0;
}

.error-controls,
.error-display {
  background: #fff;
  padding: 20px;
}

.error-controls h4,
.error-display h4 {
  margin: 0 0 12px;
  font-size: 0.95rem;
  color: #1e293b;
}

.error-buttons {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.err-btn {
  padding: 6px 14px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #991b1b;
  cursor: pointer;
  transition: all 0.2s;
}

.err-btn.active {
  background: #ef4444;
  border-color: #ef4444;
  color: #fff;
  font-weight: 600;
}

.err-btn:hover:not(.active) {
  border-color: #ef4444;
}

.err-query {
  font-size: 0.8rem;
  color: #64748b;
  margin: 8px 0 0;
}

.err-query code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 3px;
  color: #be123c;
  font-size: 0.85em;
}

.state-grid {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.state-card {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.state-card.ok {
  border-color: #c7f0d9;
  background: #ecfdf5;
}

.state-card.err {
  border-color: #fecaca;
  background: #fef2f2;
}

.state-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
}

.state-value {
  font-family: monospace;
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 700;
}

.error-detail {
  padding: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.err-row {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  font-size: 0.85rem;
}

.err-row span {
  color: #64748b;
  min-width: 120px;
}

.err-row code {
  font-family: monospace;
  color: #991b1b;
}

.err-code {
  font-weight: 700;
  font-size: 1rem !important;
}

.success-detail {
  padding: 14px;
  background: #ecfdf5;
  border: 1px solid #c7f0d9;
  border-radius: 8px;
  font-size: 0.85rem;
}

.success-data {
  font-family: monospace;
  color: #065f46;
  font-size: 0.82rem;
  word-break: break-all;
}

.err-note {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.6;
  margin: 12px 0 0;
  padding: 10px;
  background: #f8fafc;
  border-radius: 6px;
}

/* 表格 */
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

/* 小结 */
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
  .ssr-inspector,
  .options-playground,
  .error-demo {
    grid-template-columns: 1fr;
  }
}
</style>
