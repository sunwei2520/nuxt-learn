<script setup>
// ============================================================
// 第 11 章（补充专题）：错误处理与测试
// 错误分层 / createError / fatal 开关 / error.vue / 测试金字塔
// ============================================================

const chapterNum = 11
const chapterTitle = '错误处理与测试'

// ---------- Demo A：错误分层实验台 ----------
const labMode = ref('ok')

// 左栏：useFetch（fatal: false —— 错误交给页面自己兜，不被 error.vue 接管）
const {
  data: fetchData,
  error: fetchError,
  status: fetchStatus,
  refresh: refreshFetch
} = await useFetch('/api/demo/error-lab', {
  query: { mode: labMode },
  fatal: false,
  watch: false
})

// 右栏：$fetch + try/catch（事件处理器里的标准写法）
const manualState = ref('idle') // idle | pending | success | error
const manualResult = ref(null)
const manualError = ref(null)

async function runLab(mode) {
  labMode.value = mode
  manualState.value = 'pending'
  manualResult.value = null
  manualError.value = null

  // 1) 走 useFetch 的响应式刷新
  await refreshFetch()

  // 2) 走 $fetch + try/catch，手动抓取 error 对象
  try {
    manualResult.value = await $fetch('/api/demo/error-lab', { query: { mode } })
    manualState.value = 'success'
  } catch (err) {
    manualState.value = 'error'
    manualError.value = {
      statusCode: err?.statusCode ?? null,
      statusMessage: err?.statusMessage ?? null,
      data: err?.data ?? null,
      message: err?.message ?? null,
      fatal: err?.fatal ?? null
    }
  }
}

// ---------- Demo C：运行测试套件 ----------
const testRunning = ref(false)
const testResult = ref(null)

async function runTests() {
  testRunning.value = true
  testResult.value = null
  try {
    testResult.value = await $fetch('/api/demo/run-tests', { method: 'POST' })
  } catch (err) {
    testResult.value = { ok: false, message: err?.statusMessage || String(err) }
  } finally {
    testRunning.value = false
  }
}

// ---------- 代码示例（均为项目真实文件） ----------
const createErrorCode = `// server/api/demo/error-lab.get.ts —— Demo A 的真实代码节选
// 预期错误：主动抛，状态码是给客户端的契约
throw createError({
  statusCode: 404,                 // HTTP 状态码 —— 契约
  statusMessage: '商品已下架',      // 一句话说明
  data: {                          // 结构化补充信息，会原样带到客户端
    reason: 'NOT_PUBLISHED',
    hint: '该商品被作者下架了'
  }
})

// 意外错误：什么都不做，直接抛普通异常
throw new Error('模拟故障：数据库连接超时')
// → Nitro 兜底成 500；客户端只能看到 'Internal Server Error'
//   内部细节只留在服务端日志 —— 这是有意的信息隔离`

const fatalCode = `// 页面里的真实代码（Demo A 左栏）
const { data, error, status, refresh } = await useFetch('/api/demo/error-lab', {
  query: { mode },
  fatal: false,   // ★ 关键开关
  watch: false
})

// fatal: false → 错误只写进 error.value，页面自己决定怎么展示
// fatal: true（默认）→ 错误直接被抛到全局，由 app/error.vue 接管
//                      （此时组件里的 error.value 处理逻辑根本不会执行）

// error 对象的形状（fetch 失败后可读）：
//   error.value.statusCode     404
//   error.value.statusMessage  '商品已下架'
//   error.value.data           { reason, hint }
//   error.value.message        （服务端追加的补充消息）
//   status.value               'error' | 'success' | 'pending' | 'idle'`

const errorVueCode = `<!-- app/error.vue —— 项目真实文件节选 -->
<script setup>
const props = defineProps({
  error: { type: Object, required: true }   // Nuxt 注入的 NuxtError
})

// createError 的 data 字段会原样带到这里
const details = computed(() => props.error?.data ?? null)

// 清错 + 跳首页（最常用）
function goHome() {
  clearError({ redirect: '/' })
}

// 清错 + 重渲染当前路由（相当于「重试」）
function retry() {
  clearError()
}
<\/script>

<!-- 会渲染 error.vue 的两类情况：
     1. 路由不存在 → 404
     2. 页面 setup / 渲染阶段抛错 → 对应状态码
     它是最后一道防线：用户看到的是能自救的页面，而不是白屏 -->

// 想在组件级别兜住错误、不让整页崩掉，用 Vue 的错误钩子：
nuxtApp.hook('vue:error', (err) => { /* 上报日志 / 局部提示 */ })
// 或组件内的 onErrorCaptured()`

const toolchainCode = `# 安装（第 11 章已装好）
npm i -D vitest @nuxt/test-utils @vue/test-utils happy-dom \\
         @vitejs/plugin-vue unplugin-auto-import

// vitest.config.ts —— 项目真实配置
// 核心决定：单元/组件测试「不启动 Nuxt」，只补齐 Nuxt 在编译期做的三件事：
//   ① 编译 .vue 单文件组件   ② 解析 ~ 别名   ③ 自动导入 ref / computed
// 这样单元测试是毫秒级的，也不需要一台跑着的 Nuxt。
// 只有集成测试需要真实服务器（它用 @nuxt/test-utils 的 setup 自己起）。
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

const appDir = fileURLToPath(new URL('./app', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),                             // ① 让测试文件能 import .vue
    AutoImport({ imports: ['vue'] })   // ③ 补上 Nuxt 的自动导入
  ],
  resolve: {
    alias: { '~': appDir, '@': appDir } // ② 解析 ~/stores/cart 这类路径
  },
  test: {
    projects: [
      // ① 单元 / 组件测试：纯 happy-dom，不启动 Nuxt —— 毫秒级
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.spec.ts'],
          environment: 'happy-dom'
        }
      },
      // ② 集成测试：自己启动一台真实 Nuxt 服务器 —— 十几秒
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.spec.ts'],
          environment: 'node',
          testTimeout: 120000,       // 等服务器就绪
          hookTimeout: 180000
        }
      }
    ]
  }
})

// 踩坑记录 1：不要用 defineVitestConfig 包 projects —— 它明确不支持，
// 启动时会直接报 "The projects option is not supported with defineVitestConfig"。
// 需要分层时，顶层就用 vitest/config 的 defineConfig。

// 踩坑记录 2（本项目真实撞到的）：@nuxt/test-utils 的 environment: 'nuxt'
// 在 nuxt 4.6.1 + @nuxt/test-utils 4.3.3 + Vite 8 这套组合下会解析失败：
//   Failed to resolve import "./diagnostics/core.js"（它的虚拟入口 nuxt-vitest-app-entry.js）
// 表现是整个 project 的用例全部 skip。换 buildDir、清缓存、停掉 nuxt dev 都无效。
// 所以本章改用上面的 plugins + alias：单元/组件测试干脆不依赖 Nuxt 运行环境。
// 什么时候真的需要 Nuxt 环境？组件里用到 useState / useRoute / useFetch 时，
// 那就得回到 environment: 'nuxt' + mountSuspended（等工具链版本修好）。

# package.json 里加两个脚本
"test": "vitest"          # watch 模式，边写边跑
"test:run": "vitest run"  # 跑一次就退出 —— CI 用这个`

const testTriangleCode = `测试三层，越往上越慢、越接近真实、数量应该越少：

  ① 单元测试   纯逻辑：函数、Pinia store        快（毫秒）    数量多
  ② 组件测试   挂载单个组件，验 props/emit      中         中等
  ③ 集成测试   起真实服务器，$fetch 打真实接口   慢（十几秒）  少量但关键

金字塔原则：底层多、顶层少。
反模式「冰淇淋甜筒」：大量 E2E + 几乎没有单元测试 —— CI 一次跑半小时、随机失败、
定位困难。策略：业务逻辑用单元测试锁死，关键链路才上集成测试。`

const unitTestCode = `// tests/unit/cart.spec.ts —— 真实测试文件节选（单元层）
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '~/stores/cart'

describe('cart store 单元测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())   // 每个用例一个干净的 store
  })

  it('addItem：重复商品只增加数量，不新增条目', () => {
    const cart = useCartStore()
    cart.addItem({ id: '1', name: 'Nuxt 4 实战指南', price: 79 })
    cart.addItem({ id: '1', name: 'Nuxt 4 实战指南', price: 79 })

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].qty).toBe(2)
  })

  it('changeQty：数量减到 0 时自动移除该条目', () => {
    const cart = useCartStore()
    cart.addItem({ id: '1', name: 'A', price: 79 })
    cart.changeQty('1', -1)

    expect(cart.isEmpty).toBe(true)
  })
})`

const componentTestCode = `// tests/unit/app-button.spec.ts —— 真实测试文件节选（组件层）
import { mount } from '@vue/test-utils'
import AppButton from '~/components/AppButton.vue'

it('渲染插槽内容与默认样式类', () => {
  const wrapper = mount(AppButton, { slots: { default: '立即购买' } })

  expect(wrapper.text()).toBe('立即购买')
  expect(wrapper.classes()).toContain('btn-primary')
  expect(wrapper.classes()).toContain('btn-medium')
})

it('点击时向外 emit click 事件', async () => {
  const wrapper = mount(AppButton)
  await wrapper.trigger('click')
  expect(wrapper.emitted('click')).toHaveLength(1)
})

// mount 还是 mountSuspended（来自 @nuxt/test-utils/runtime）？
// AppButton 是纯展示组件：只用 props / slot / emit，不碰任何 Nuxt 能力 → mount 就够。
// 一旦组件里用了 useState / useRoute / useFetch，
// 或模板里用了自动导入的 Nuxt 组件，就必须换 mountSuspended ——
// 那些 API 需要一个真实的 Nuxt 上下文，普通 mount 会直接报错。`

const integrationTestCode = `// tests/integration/api.spec.ts —— 真实测试文件节选（集成层）
// 运行环境由 vitest.config.ts 里的 integration project 指定（node，无需组件环境）
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('集成测试：真实服务器 + 真实接口', async () => {
  // 启动一个真实 Nuxt 服务器（端口避开 3000 的开发服务器）
  await setup({ server: true, port: 3100 })

  it('商品接口：返回契约中的字段', async () => {
    const product = await $fetch('/api/demo/product/1')
    expect(product.name).toBe('Nuxt 4 实战指南')
    expect(product.price).toBe(79)
  })

  it('错误实验接口：状态码是契约', async () => {
    await expect(
      $fetch('/api/demo/error-lab?mode=401')
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('SSR 页面：首屏 HTML 里已包含 SEO 标题（不依赖 JS）', async () => {
    const html = await $fetch('/chapters/09-demo/product/1', { responseType: 'text' })
    expect(html).toContain('<title>Nuxt 4 实战指南 - Nuxt 学习项目</title>')
  })
})

// 注意这里测的是真实 HTTP 契约（状态码 / 字段），没有 mock ——
// 所以接口改了状态码，测试会红。这正是集成测试的价值。`

const mockCode = `// 需要隔离外部依赖时，用 mockNuxtImport 替换自动导入的函数
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useRuntimeConfig', () => {
  return () => ({ public: { apiBase: '/mock-api' } })
})

// 适用场景：第三方支付、短信、外部 API —— 测试不该真的发请求、花真钱。
// 不适用场景：你自己写的接口 —— 那些应该用集成测试打真实服务器（见上）。
// 另外它和 mountSuspended 一样，需要 Nuxt 环境（environment: 'nuxt'）才可用；
// 本章的单元/组件层没启动 Nuxt，所以这里只作为方法介绍。`
</script>

<template>
  <div class="chapter">
    <header class="chapter-header">
      <span class="chapter-badge">专题 {{ chapterNum }}</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        前 10 章写的是「功能怎么实现」，这一章补上工程化的两条腿：
        <strong>错误怎么不出丑</strong>（错误分层、全局错误页）与
        <strong>改动怎么不被自己搞坏</strong>（单元 / 组件 / 集成三层测试）。
        本章的测试面板会真的在本机跑起 Vitest。
      </p>
    </header>

    <!-- 知识点 1 -->
    <KnowledgePoint num="1" title="先分清两类错误：预期 vs 意外">
      <p>
        处理错误的第一步不是写代码，而是分类。<strong>预期错误</strong>是业务能解释的情况
        （商品下架、未登录、参数不合法）——状态码就是给客户端的<strong>契约</strong>，客户端据此
        决定「提示什么、跳去哪」。<strong>意外错误</strong>是系统故障（数据库断了、第三方超时）——
        用户看不懂细节，而且细节可能泄露内部结构。
      </p>
      <div class="callout">
        <strong>一句话原则</strong>：预期错误 → 主动 <code>createError</code>，把状态码和说明交给客户端；
        意外错误 → 让它抛，服务端记日志，客户端只看到一句笼统的「服务器错误」。
      </div>
    </KnowledgePoint>

    <!-- 知识点 2 -->
    <KnowledgePoint num="2" title="服务端：createError 的字段与兜底">
      <p>
        <code>createError</code> 有三个关键字段：<code>statusCode</code>（契约）、
        <code>statusMessage</code>（一句话说明）、<code>data</code>（结构化补充信息，会原样传到客户端）。
        而普通异常不做处理时，Nitro 会兜底成 500 并把内部消息藏起来。
      </p>
      <CodeBlock :code="createErrorCode" lang="typescript" title="createError：主动抛 vs 裸抛（本项目真实代码）" />
      <div class="callout">
        <strong>来自真实日志的提醒</strong>：本章 demo 第一次跑起来时，服务端打了这条警告 ——
        「please prefer using <code>message</code> for longer error messages instead of
        <code>statusMessage</code>」。也就是说：<code>statusMessage</code> 应该只放简短的
        状态短语（未来会被自动清洗），较长的解释性文字放进 <code>message</code> 或
        <code>data</code> —— 客户端读 <code>data</code> 才是稳定的结构化契约。
      </div>
    </KnowledgePoint>

    <!-- Demo A -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo A：错误分层实验台</div>
      <div class="demo-body">
        <p class="demo-lead">
          同一批状态码，用两种客户端写法各拿一次：左栏 <code>useFetch</code>（
          <code>fatal: false</code>，错误由页面接管），右栏 <code>$fetch + try/catch</code>。
          对比两边拿到的 error 对象结构。
        </p>

        <div class="demo-controls">
          <button
            v-for="m in ['ok', '404', '401', '422', '500']" :key="m"
            class="mode-btn" :class="{ active: labMode === m }"
            @click="runLab(m)"
          >
            mode={{ m }}
          </button>
        </div>

        <div class="two-cols">
          <div class="col">
            <div class="col-title">左栏：useFetch（fatal: false）</div>
            <pre class="json">{{ JSON.stringify({
              // 注意：模板里 ref 会自动解包，这里不能再写 .value
              status: fetchStatus ?? null,
              data: fetchData ?? null,
              error: fetchError ? {
                statusCode: fetchError.statusCode,
                statusMessage: fetchError.statusMessage,
                data: fetchError.data
              } : null
            }, null, 2) }}</pre>
          </div>
          <div class="col">
            <div class="col-title">右栏：$fetch + try/catch</div>
            <pre class="json">{{ JSON.stringify({
              state: manualState,
              data: manualResult,
              error: manualError
            }, null, 2) }}</pre>
          </div>
        </div>

        <div class="callout">
          <strong>重点观察</strong>：① <code>404/401/422</code> 的 <code>statusCode</code> 和
          <code>data</code> 两种写法都能拿到 —— 契约对客户端稳定；② <code>mode=500</code> 时
          两边都只得到笼统信息，内部细节没有泄露；③ 左栏之所以没被全局错误页接管，
          全靠 <code>fatal: false</code>（知识点 3）。
        </div>
      </div>
    </div>

    <!-- 知识点 3 -->
    <KnowledgePoint num="3" title="客户端捕获点一：useFetch 的 error 与 fatal 开关">
      <p>
        <code>useFetch</code> 不会抛错给调用方，而是把错误写进 <code>error.value</code>、
        把状态写进 <code>status.value</code>。但有个关键开关：<code>fatal</code>
        （默认 <code>true</code>）——它决定错误是「页面自己处理」还是「交给全局错误页」。
      </p>
      <CodeBlock :code="fatalCode" lang="typescript" title="fatal 开关与 error 对象形状" />
      <div class="callout">
        <strong>踩坑提醒</strong>：很多人在页面里写了 <code>v-if="error"</code> 的友好提示，
        却发现永远看不到——因为默认 <code>fatal: true</code> 让错误直接被
        <code>error.vue</code> 接管了，那段提示代码根本不会执行。想让页面自己兜，必须显式写
        <code>fatal: false</code>。
      </div>
    </KnowledgePoint>

    <!-- 知识点 4 -->
    <KnowledgePoint num="4" title="客户端捕获点二：全局错误页 app/error.vue">
      <p>
        <code>app/error.vue</code> 是最后一道防线。它会替代整个应用视图渲染，
        出现在两类场景：<strong>路由不存在（404）</strong> 和
        <strong>页面 setup / 渲染阶段抛错</strong>。放个 <code>AppButton</code> 让用户能自救，
        比白屏或默认错误页友好得多。
      </p>
      <CodeBlock :code="errorVueCode" lang="vue" title="app/error.vue（本项目真实文件节选）" />
    </KnowledgePoint>

    <!-- Demo B -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo B：全局错误页体验</div>
      <div class="demo-body">
        <p class="demo-lead">
          三个入口分别触发不同的错误路径。注意错误页上的状态码、<code>statusMessage</code>、
          <code>data</code> 区块，以及「返回首页 / 重试」两个按钮背后的 <code>clearError</code>。
        </p>
        <div class="demo-controls">
          <NuxtLink to="/chapters/11-demo/boom?code=500" target="_blank" class="open-link">
            ▶ 页面 setup 抛错（500）↗
          </NuxtLink>
          <NuxtLink to="/chapters/11-demo/boom?code=404" target="_blank" class="open-link">
            ▶ 页面抛 404 ↗
          </NuxtLink>
          <NuxtLink to="/chapters/11-demo/nope" target="_blank" class="open-link">
            ▶ 不存在的路由（天然 404）↗
          </NuxtLink>
        </div>
        <div class="callout">
          <strong>验证方法</strong>：打开后按 <code>Ctrl+U</code> 看响应状态码 ——
          服务器返回的 HTTP 状态码就是 error 的 <code>statusCode</code>（不是「200 页面里写着 404」）。
          这一点在第 09 章 SEO 已经埋过伏笔：状态码也是给爬虫看的。
        </div>
      </div>
    </div>

    <!-- 知识点 5 -->
    <KnowledgePoint num="5" title="测试三层：金字塔与工具链">
      <p>
        Nuxt 官方测试方案是 <code>@nuxt/test-utils</code> + <strong>Vitest</strong>。
        但本章这里做了一个取舍：<strong>单元 / 组件测试不启动 Nuxt</strong>，
        只手动补齐 Nuxt 在编译期做的三件事（编译 SFC、解析 <code>~</code> 别名、自动导入）——
        测试因此快得多，也不需要一台跑着的服务器。只有集成测试才启动真实服务器。
      </p>
      <CodeBlock :code="toolchainCode" lang="typescript" title="测试工具链配置（本项目真实文件）" />
      <CodeBlock :code="testTriangleCode" lang="text" title="测试三层与金字塔原则" />
    </KnowledgePoint>

    <!-- 知识点 6 -->
    <KnowledgePoint num="6" title="三层测试分别怎么写">
      <p>
        下面三段都是本项目 <code>tests/</code> 目录里的真实测试，分别对应三层：
      </p>
      <CodeBlock :code="unitTestCode" lang="typescript" title="① 单元测试：tests/unit/cart.spec.ts" />
      <CodeBlock :code="componentTestCode" lang="typescript" title="② 组件测试：tests/unit/app-button.spec.ts（mount）" />
      <CodeBlock :code="integrationTestCode" lang="typescript" title="③ 集成测试：tests/integration/api.spec.ts（setup + $fetch）" />
      <CodeBlock :code="mockCode" lang="typescript" title="补充：mockNuxtImport 与它的适用边界" />
    </KnowledgePoint>

    <!-- Demo C -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo C：运行真实测试套件</div>
      <div class="demo-body">
        <p class="demo-lead">
          点按钮后，服务端会真的执行 <code>vitest run --reporter=json</code>
          （等价于命令行 <code>npm run test:run</code>），把每个用例的结果回传到这里。
          集成测试会临时启动一个真实 Nuxt 服务器（端口 3100）。
          <strong>首次运行较慢，请耐心等待十几秒。</strong>
        </p>
        <div class="demo-controls">
          <AppButton type="primary" size="small" :disabled="testRunning" @click="runTests">
            {{ testRunning ? '测试运行中…' : '运行测试套件' }}
          </AppButton>
          <span class="note">命令行等价：<code>npm run test:run</code></span>
        </div>

        <div v-if="testResult" class="test-result">
          <div class="test-summary" :class="testResult.ok ? 'pass' : 'fail'">
            <span class="big">{{ testResult.ok ? '全部通过' : '存在失败用例' }}</span>
            <span v-if="testResult.total !== undefined">
              共 {{ testResult.total }} 个用例 · 通过 {{ testResult.passed }} · 失败 {{ testResult.failed }}
            </span>
            <span v-if="testResult.duration">耗时 {{ (testResult.duration / 1000).toFixed(1) }}s</span>
          </div>

          <p v-if="testResult.message" class="note">{{ testResult.message }}</p>

          <div v-for="file in testResult.files || []" :key="file.name" class="test-file">
            <div class="file-head">
              <code>{{ file.name }}</code>
              <span class="file-stat">{{ file.passed }} 通过 / {{ file.failed }} 失败</span>
            </div>
            <ul class="case-list">
              <li v-for="(c, i) in file.cases" :key="i" :class="c.status">
                <span class="case-icon">{{ c.status === 'passed' ? '✓' : '✗' }}</span>
                {{ c.title }}
                <pre v-if="c.message" class="case-msg">{{ c.message.split('\n').slice(0, 12).join('\n') }}</pre>
              </li>
            </ul>
          </div>

          <pre v-if="testResult.tail" class="tail">{{ testResult.tail }}</pre>
        </div>
        <div v-else class="demo-empty">点击按钮，看这套项目的测试结果</div>
      </div>
    </div>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li>错误分两类：预期错误（状态码是契约，主动 <code>createError</code>）vs 意外错误（兜底 500、藏细节）</li>
        <li><code>createError</code> 三字段：<code>statusCode</code> / <code>statusMessage</code> / <code>data</code></li>
        <li><code>useFetch</code> 用 <code>error.value</code> 承接错误；<code>fatal: false</code> 才让页面自己兜</li>
        <li><code>app/error.vue</code> 是全局最后防线；<code>clearError({ redirect })</code> 让用户自救</li>
        <li>测试三层金字塔：单元（快、多）→ 组件（<code>mount</code> / <code>mountSuspended</code>）→ 集成（<code>setup</code> + <code>$fetch</code> 打真实接口）</li>
        <li>工具链：<code>@nuxt/test-utils</code> + Vitest 分层配置；单元/组件层不启动 Nuxt，手动补 <code>@vitejs/plugin-vue</code> + alias + <code>unplugin-auto-import</code></li>
        <li>外部依赖用 <code>mockNuxtImport</code> 隔离；自己的接口用集成测试锁契约</li>
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
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.demo-empty {
  padding: 32px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

.mode-btn {
  padding: 6px 14px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #475569;
  border-radius: 6px;
  font-size: 0.82rem;
  font-family: monospace;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #00dc82;
  color: #fff;
  border-color: #00dc82;
  font-weight: 600;
}

.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.col-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.json {
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px;
  border-radius: 8px;
  font-size: 0.74rem;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0;
  min-height: 200px;
}

.note {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.5;
}

.note code {
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 3px;
  font-family: monospace;
}

.open-link {
  color: #3b82f6;
  font-size: 0.84rem;
  text-decoration: none;
}

/* ---- Demo C ---- */
.test-result {
  margin-top: 4px;
}

.test-summary {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 14px;
}

.test-summary.pass {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.test-summary.fail {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.test-summary .big {
  font-weight: 700;
  font-size: 1rem;
}

.test-file {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.file-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.8rem;
}

.file-stat {
  color: #64748b;
  font-size: 0.75rem;
}

.case-list {
  margin: 0;
  padding: 10px 12px 10px 12px;
  list-style: none;
  font-size: 0.82rem;
}

.case-list li {
  padding: 4px 0;
  color: #334155;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.case-list li.failed {
  color: #b91c1c;
}

.case-icon {
  font-weight: 700;
  width: 14px;
  flex-shrink: 0;
}

.case-list li.passed .case-icon {
  color: #059669;
}

.case-list li.failed .case-icon {
  color: #dc2626;
}

.case-msg {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 8px 10px;
  margin: 6px 0 0;
  font-size: 0.72rem;
  white-space: pre-wrap;
  color: #7f1d1d;
  width: 100%;
}

.tail {
  background: #0f172a;
  color: #94a3b8;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 0.72rem;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0;
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

@media (max-width: 768px) {
  .two-cols { grid-template-columns: 1fr; }
}
</style>
