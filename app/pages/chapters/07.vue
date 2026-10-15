<script setup>
// ============================================================
// 第 07 章：中间件
// 页面中间件 / 服务端中间件 / 命名调用 / 执行顺序
// ============================================================

useHead({ title: '第07章 中间件' })

const chapterNum = 7
const chapterTitle = '中间件'

// ---------- Demo A：中间件执行顺序可视化 ----------
// request-log.global.ts 把每次跳转记在 useState('request-log') 里
// 这里直接读同一个 useState，实时显示
const routeLog = useState('request-log', () => [])
const namedLog = useState('named-middleware-log', () => [])
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const demoStatus = ref('')

// 导航序列（每个都带 abortNavigation 的演示）
async function navigateAndBlock() {
  demoStatus.value = '先尝试导航到 /chapters/05，然后 abortNavigation 阻止它…'
  await navigateTo('/chapters/05')     // 还没触发路由
  await abortNavigation()               // 标记当前导航为 abort
  demoStatus.value = 'abortNavigation 已调用，导航应该被阻止'
}

async function triggerNamedMiddleware() {
  demoStatus.value = '手动调用 named 中间件…'
  await callNuxtRouteMiddleware('named')
  demoStatus.value = '执行完成（没有跳转，只是运行了中间件）'
}

async function tryProtected() {
  demoStatus.value = '跳转到受保护页面 /chapters/07-demo/protected…'
  await navigateTo('/chapters/07-demo/protected')
}

// ---------- 代码示例 ----------
const dirConventionCode = `# app/middleware/ —— 页面路由中间件
auth.ts                 → 命名中间件 'auth'，页面 definePageMeta({ middleware: 'auth' }) 指定
check-admin.ts          → 命名中间件 'check-admin'
request-log.global.ts   → 全局中间件，自动跑所有路由
analytics.global.ts     → 全局中间件

# server/middleware/ —— 服务端 HTTP 中间件（第 05 章）
# 每个 HTTP API 请求之前执行，不能 return，只能 throw 拦截

# 中间件类型对照表：
# +------------------------+---------------------+------------------+
# | 类型                   | 什么时候执行        | 怎么触发         |
# +------------------------+---------------------+------------------+
# | 命名中间件（普通文件）  | 页面指定时          | definePageMeta   |
# | 全局中间件（.global）   | 每个路由跳转时自动  | 文件名约定自动   |
# | 命名中间件（手动调用）  | 手动触发时          | callNuxtRouteMiddleware |
# +------------------------+---------------------+------------------+`

const middlewareContextCode = `// 每个页面中间件接收两个参数：to 和 from
export default defineNuxtRouteMiddleware((to, from) => {
  // to：目标路由（Router 对象）
  to.path                // '/chapters/07'
  to.fullPath            // '/chapters/07?q=1'
  to.matched.length      // 命中的路由层级数
  to.meta.requiresAuth   // 自定义 meta（从 definePageMeta 来）

  // from：当前路由（即将被替换掉的）
  from.path              // 离开前的 path
  from.fullPath

  // 也可以 async：中间件会 await 完再放行
  const user = await fetchCurrentUser()
  if (!user) return navigateTo('/login')
})`

const returnSemanticsCode = `// 中间件的三个 return 语义：

// 1. 什么都不 return → 放行
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/always-pass') {
    // 不 return = 放行 = 继续后续中间件 → 渲染
  }
})

// 2. return navigateTo → 重定向（跳到另一个路由，目标路由走完整中间件链）
export default defineNuxtRouteMiddleware((to) => {
  if (!auth.isLoggedIn && to.meta.requiresAuth) {
    return navigateTo('/login')  // 这会触发 login 页的中间件链
  }
})

// 3. return abortNavigation → 阻止这次导航（留在当前页面，不渲染目标）
export default defineNuxtRouteMiddleware((to, from) => {
  if (confirm('确认离开？')) {
    // 用户点了取消 → 阻止导航
    return abortNavigation()
  }
})

// 也可以在组件里手动调用 abortNavigation（不在中间件里）
// await navigateTo('/some'); await abortNavigation()
// 两者是独立 API，abortNavigation 标记"当前正在进行的导航"已被取消`

const abortCode = `// app/middleware/auth.ts —— 本项目真实代码
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()

  // 只对标记了 requiresAuth 的路由生效
  if (!to.meta.requiresAuth) return  // 放行

  if (!auth.isLoggedIn) {
    return navigateTo({
      path: '/chapters/07-demo/login',
      query: { redirect: to.fullPath }   // 登录后回跳
    })
  }
})

// app/pages/chapters/07-demo/protected.vue
definePageMeta({
  middleware: 'auth',        // 声明走 auth 中间件
  requiresAuth: true         // 中间件里会读取这个值判断要不要拦
})`

const compareCode = `# 页面中间件 vs 服务端中间件（第 05 章）
# 它们在不同目录、不同时机、做不同事情

# 页面中间件（app/middleware/）
#   运行时机：客户端路由跳转前（Vue Router 的 beforeEach）
#              服务端也会执行——SSR 时也有路由，Nuxt 会跑一遍
#   可用 API：useRoute, useRouter, useState, Pinia store, navigateTo, abortNavigation
#   典型用途：路由守卫、权限检查、埋点、重定向
#   返回值：什么都不写（放行） | navigateTo / abortNavigation（控制）

# 服务端中间件（server/middleware/）
#   运行时机：Nitro 处理 HTTP 请求时，在 defineEventHandler 之前
#   可用 API：event 对象（event.path, event.method, getQuery, getHeader）
#   典型用途：CORS、全局鉴权、请求日志（本项目 demo-logger 就在这里）
#   返回值：不能 return（会被忽略），只能 throw createError 拦截`

const orderCode = `# 中间件的执行顺序：
#
# 全局中间件（按文件名排序） → 命名中间件（按页面 meta.middleware 声明顺序）
#
# 本项目的实际执行链：
#
# 1. request-log.global.ts      → 每次跳转都跑（全局）
# 2. auth.ts                    → 只在访问带 requiresAuth 的页面时
#                                  （auth.ts 里自己判断 to.meta.requiresAuth）
# 3. named.ts                   → 完全不会自动跑，只手动 callNuxtRouteMiddleware 触发
#
# 注意：页面 meta.middleware 支持数组，多个命名中间件会按顺序执行
# definePageMeta({ middleware: ['auth', 'check-admin'] })`
</script>

<template>
  <div class="chapter">
    <header class="chapter-header">
      <span class="chapter-badge">第 {{ chapterNum }} 章</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        Nuxt 有两套中间件：<strong>页面中间件</strong>（<code>app/middleware/</code>）
        和<strong>服务端中间件</strong>（<code>server/middleware/</code>，第 05 章已讲）。
        名字像、职责完全不同。本章讲页面中间件的三种形态、执行时机，以及它和服务端中间件的本质区别。
      </p>
    </header>

    <!-- 知识点 1 -->
    <KnowledgePoint num="1" title="中间件分类与目录约定">
      <p>Nuxt 用文件位置和文件名后缀决定中间件的类型：</p>
      <CodeBlock :code="dirConventionCode" lang="bash" title="文件名 → 中间件类型对照表" />
      <div class="callout">
        <strong>本项目已安装了 3 个真实中间件</strong>：
        <code>auth.ts</code>（命名，当前访问路由时才执行）、
        <code>request-log.global.ts</code>（全局，每次跳转都执行）、
        <code>named.ts</code>（命名，完全不会自动跑）。
      </div>
    </KnowledgePoint>

    <!-- 知识点 2 -->
    <KnowledgePoint num="2" title="页面中间件 vs 服务端中间件">
      <CodeBlock :code="compareCode" lang="bash" title="两套中间件的本质区别" />
      <table class="route-table">
        <thead>
          <tr><th>维度</th><th>页面中间件</th><th>服务端中间件</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>目录</td>
            <td><code>app/middleware/</code></td>
            <td><code>server/middleware/</code></td>
          </tr>
          <tr>
            <td>运行时机</td>
            <td>路由跳转前（客户端 CSR + 服务端 SSR）</td>
            <td>Nitro 处理 HTTP 请求前</td>
          </tr>
          <tr>
            <td>可用 API</td>
            <td><code>useRoute</code>、<code>navigateTo</code>、<code>Pinia</code> store</td>
            <td>只有 <code>event</code> 对象</td>
          </tr>
          <tr>
            <td>拦截方式</td>
            <td><code>return navigateTo</code> / <code>abortNavigation</code></td>
            <td><code>throw createError</code></td>
          </tr>
          <tr>
            <td>跳转重定向</td>
            <td>✅ 可以（它就在路由语义里）</td>
            <td>❌ 不行（服务端没有路由，没有客户端可跳转）</td>
          </tr>
          <tr>
            <td>跨请求安全</td>
            <td>运行在 nuxtApp 里 → 请求级隔离 ✅</td>
            <td>直接挂在模块上 → 进程级共享，注意不要写请求级状态</td>
          </tr>
        </tbody>
      </table>
      <div class="callout">
        <strong>一个常见误区</strong>：在服务端中间件里写 <code>navigateTo</code> 或读 Pinia store。
        服务端中间件跑在 Nitro 的事件处理链上，没有 Vue Router、没有 nuxtApp 实例（每次请求临时创建的 nuxtApp 是页面渲染阶段的）。
        想做路由跳转 → 用页面中间件。想拦截 HTTP 请求 → 用服务端中间件。
      </div>
    </KnowledgePoint>

    <!-- 知识点 3 -->
    <KnowledgePoint num="3" title="运行时机：两端都会跑">
      <p>
        页面中间件不仅客户端路由跳转时执行，**服务端 SSR 时也会执行**——因为 SSR 时 Nuxt 也要先跑一遍路由、
        才能知道该渲染哪个页面。这对代码有一个约束：中间件必须是「两端都能跑的」。
      </p>
      <p>下面这个 <code>auth.ts</code> 同时用了 <code>useAuthStore</code> 和 <code>useCookie</code>，
        这两个 API 在 SSR 和 CSR 两端都可用（SSR 时服务端直接读请求的 cookie，CSR 时浏览器读）：</p>
      <CodeBlock :code="abortCode" lang="typescript" title="auth.ts —— 本项目真实代码（两端安全）" />
      <div class="callout">
        <strong>SSR 里绝对不能调用的 API</strong>：<code>localStorage</code>、<code>window</code>、
        浏览器 DOM API 等。如果必须用，用 <code>import.meta.client</code> 或在 <code>onMounted</code> 等客户端 hook 里调用。
      </div>
    </KnowledgePoint>

    <!-- 知识点 4 -->
    <KnowledgePoint num="4" title="三个 return 语义">
      <CodeBlock :code="returnSemanticsCode" lang="javascript" title="放行 / 重定向 / 阻止" />
      <div class="callout">
        <strong>执行顺序</strong>：全局中间件按文件名排序 → 命名中间件按页面 <code>meta.middleware</code> 声明顺序。
        某一个中间件 <code>return navigateTo</code> 后，后面的中间件<strong>不会再执行</strong>——
        新目标路由会走自己的完整中间件链（从头开始）。
      </div>
    </KnowledgePoint>

    <!-- Demo A：中间件执行顺序可视化 -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo A：中间件执行顺序 + 手动调用</div>
      <div class="demo-body">
        <p class="demo-lead">
          全局中间件 <code>request-log.global.ts</code> 每次路由跳转都会往同一个
          <code>useState('request-log')</code> 里 push 一条记录。下面的实时日志能看到
          它在哪些路由上跑、什么情况下不跑。
        </p>

        <div class="demo-controls">
          <AppButton type="secondary" size="small" @click="navigateAndBlock">
            跳转第 05 章 + abortNavigation
          </AppButton>
          <AppButton type="secondary" size="small" @click="triggerNamedMiddleware">
            手动 callNuxtRouteMiddleware('named')
          </AppButton>
          <AppButton type="primary" size="small" @click="tryProtected">
            访问受保护页
          </AppButton>
          <NuxtLink to="/chapters/07-demo/login" class="link-btn">去登录页</NuxtLink>
          <NuxtLink to="/chapters/05" class="link-btn">← 回第 05 章</NuxtLink>
          <NuxtLink to="/chapters/01" class="link-btn">← 回第 01 章</NuxtLink>
        </div>

        <p v-if="demoStatus" class="demo-status">{{ demoStatus }}</p>

        <!-- 全局中间件执行日志 -->
        <h4 class="demo-log-title">request-log.global.ts 执行日志</h4>
        <div v-if="!routeLog.length" class="demo-empty">
          还没有跳转。点上面的按钮或用 NuxtLink 点击导航试试。
        </div>
        <div v-else class="log-list">
          <div v-for="(item, i) in routeLog" :key="i" class="log-row">
            <span class="log-time">{{ item.time }}</span>
            <code class="log-from">{{ item.from }}</code>
            <span class="log-arrow">→</span>
            <code class="log-to">{{ item.to }}</code>
          </div>
        </div>

        <!-- 命名中间件手动调用日志 -->
        <h4 class="demo-log-title">named.ts 手动调用日志</h4>
        <div v-if="!namedLog.length" class="demo-empty">
          手动 callNuxtRouteMiddleware('named') 不会自动执行。
        </div>
        <div v-else class="log-list">
          <div v-for="(item, i) in namedLog" :key="i" class="log-row">
            <span class="log-time">{{ item.time }}</span>
            <span class="log-badge named">手动</span>
            <code class="log-to">{{ item.source }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点 5 -->
    <KnowledgePoint num="5" title="手动调用命名中间件">
      <p>
        有些中间件不适合绑在路由上（比如表单提交前检查权限、批量用户操作前确认），
        可以用 <code>callNuxtRouteMiddleware</code> 手动触发。参数就是文件名（不含 <code>.ts</code>）。
      </p>
      <CodeBlock :code="orderCode" lang="bash" title="执行顺序与命名中间件的调用方式" />
      <p>上一个 Demo A 的「手动 callNuxtRouteMiddleware('named')」按钮演示了这个能力——
        它没有路由跳转，只是在当前页面里运行了 <code>named.ts</code> 的逻辑。</p>
    </KnowledgePoint>

    <!-- 知识点 6 -->
    <KnowledgePoint num="6" title="鉴权完整流程">
      <p>把本章的几个组件串起来，就是一个完整的登录鉴权 demo：</p>
      <ol class="flow-list">
        <li>
          用户点击「访问受保护页」→ 触发导航 → <code>auth.ts</code> 中间件执行
        </li>
        <li>
          中间件里读 <code>to.meta.requiresAuth</code>（true）→ 再读 <code>auth.isLoggedIn</code>（false）
        </li>
        <li>
          <code>return navigateTo({ path: '/chapters/07-demo/login', query: { redirect: to.fullPath } })</code>
          → 中间件链中断（新目标走新链）
        </li>
        <li>
          登录页用 <code>useCookie('demo_auth_token')</code> 写 cookie（SSR 时服务端设置 Set-Cookie）
        </li>
        <li>
          登录成功 → <code>navigateTo(redirect)</code> → 再次触发受保护页的中间件 → 这次 token 存在 → 放行
        </li>
        <li>
          登出 → 清空 cookie → 下次访问又被拦截
        </li>
      </ol>
      <div class="callout">
        <strong>为什么用 <code>useCookie</code> 存 token 而不是 Pinia</strong>：
        SSR 时浏览器不会把 Pinia store 发给服务端，但会把 cookie 带过去。
        用 <code>useCookie</code> 存 token，服务端渲染时就能知道用户是否已登录，
        从而决定要不要在 SSR 阶段就跳走——不然用户会先看到半白屏、再被客户端跳走，
        体验很差。
      </div>
    </KnowledgePoint>

    <!-- 知识点 7 -->
    <KnowledgePoint num="7" title="常见坑">
      <table class="route-table">
        <thead>
          <tr><th>坑</th><th>症状</th><th>解法</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>在服务端中间件里调 <code>navigateTo</code></td>
            <td>TypeScript 报找不到、运行时报错</td>
            <td>服务端中间件没有路由语义，改到页面中间件或用 <code>throw createError</code> 返回 HTTP 错误</td>
          </tr>
          <tr>
            <td>在服务端中间件里读 Pinia store</td>
            <td>运行时报错（nuxtApp 未初始化）</td>
            <td>服务端中间件只能访问 event。需要读状态 → 用页面中间件；需要服务端检查 → 在 API handler 里做</td>
          </tr>
          <tr>
            <td>中间件里用了浏览器 API（localStorage 等）</td>
            <td>SSR 时报错、或 hydration mismatch</td>
            <td>中间件必须两端安全。浏览器 API 调用放到 <code>onMounted</code> 或用 <code>import.meta.client</code> 包裹</td>
          </tr>
          <tr>
            <td><code>navigateTo</code> 之后还写了其他代码</td>
            <td>返回值是 Promise，后续代码会在新导航里继续执行</td>
            <td>要么 <code>return navigateTo(...)</code>（中断当前链），要么 <code>await navigateTo(...)</code> 等它完成</td>
          </tr>
          <tr>
            <td>误以为中间件只在 CSR 执行</td>
            <td>以为能放 <code>localStorage</code>、以为不需要 SSR 兼容</td>
            <td>SSR 也会跑中间件。这是它和服务端中间件的关键交集之一——两者都两端跑，但运行时不同</td>
          </tr>
        </tbody>
      </table>
    </KnowledgePoint>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li>页面中间件：<code>app/middleware/</code>，两端都跑，靠文件名（<code>.global</code> 后缀）或页面 meta 声明触发</li>
        <li>三种 return：不 return 放行 / <code>navigateTo</code> 重定向（中断当前链）/ <code>abortNavigation</code> 阻止</li>
        <li>全局中间件按文件名排序，命名中间件按页面声明顺序。任一 return navigateTo 后后续不再执行</li>
        <li>服务端中间件：<code>server/middleware/</code>，只跑在 HTTP 请求前，不能跳转、不能读 Pinia、不能 return</li>
        <li>鉴权用 <code>useCookie</code> 存 token 比 Pinia 好——SSR 能读到 cookie 来决定要不要提前拦截</li>
        <li><code>callNuxtRouteMiddleware('named')</code> 手动触发中间件，绕过路由跳转</li>
        <li>中间件必须两端安全，浏览器 API 不要放中间件里</li>
      </ul>
    </div>

    <ChapterNav :current="chapterNum" :total="11" />
  </div>
</template>

<style scoped>
.chapter { max-width: 900px; margin: 0 auto; }

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

.chapter-intro code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  color: #be123c;
}

.callout {
  padding: 12px 16px;
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 6px;
  margin: 12px 0;
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.7;
}

.callout code {
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  color: #1e40af;
}

/* ---- Demo ---- */
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

.demo-body {
  padding: 20px;
  background: #fff;
}

.demo-lead {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.7;
  margin: 0 0 14px;
}

.demo-lead code {
  background: #f1f5f9;
  color: #be123c;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.85em;
  font-family: monospace;
}

.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.link-btn {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #475569;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s;
}

.link-btn:hover {
  border-color: #00dc82;
  color: #00dc82;
}

.demo-status {
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #92400e;
  margin: 0 0 12px;
}

.demo-log-title {
  font-size: 0.85rem;
  color: #1e293b;
  margin: 16px 0 8px;
}

.demo-empty {
  padding: 32px 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.88rem;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  margin-bottom: 8px;
}

.log-list {
  max-height: 220px;
  overflow-y: auto;
}

.log-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.82rem;
  flex-wrap: wrap;
}

.log-row:last-child {
  border-bottom: none;
}

.log-time {
  color: #94a3b8;
  font-family: monospace;
  min-width: 72px;
}

.log-from,
.log-to {
  font-family: monospace;
  color: #334155;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 3px;
}

.log-from { color: #991b1b; }
.log-to { color: #065f46; }

.log-arrow {
  color: #cbd5e1;
}

.log-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.log-badge.named {
  background: #fef3c7;
  color: #92400e;
}

/* ---- 流程列表 ---- */
.flow-list {
  padding-left: 20px;
  margin: 0;
  color: #334155;
  line-height: 2;
  font-size: 0.9rem;
}

.flow-list code {
  background: #f1f5f9;
  color: #be123c;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.85em;
  font-family: monospace;
}

/* ---- 表格 ---- */
.route-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 0.86rem;
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

/* ---- 小结 ---- */
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
  line-height: 1.85;
}

.chapter-summary li code {
  background: #fff;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.85em;
  color: #be123c;
}
</style>
