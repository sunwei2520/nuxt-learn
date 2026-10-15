<script setup>
// ============================================================
// 第 03 章：布局与组件
// 演示布局系统、组件自动导入命名、Props/Emits/Slots、Lazy/ClientOnly
// ============================================================

useHead({
  title: '第03章 布局与组件'
})

const chapterNum = 3
const chapterTitle = '布局与组件'

// ---- Demo A: 布局模拟切换器 ----
const activeLayout = ref('default')

const layoutMeta = {
  default: {
    name: 'default',
    desc: '顶栏 + 内容 + 页脚，适合内容型页面（本站所有章节页都在用它）',
    regions: ['header: 顶部导航栏', 'slot: 页面内容渲染区 <NuxtPage />', 'footer: 版权信息']
  },
  custom: {
    name: 'custom',
    desc: '左侧边栏 + 内容区，适合后台 / 文档型页面',
    regions: ['aside: 侧边栏导航', 'slot: 页面内容渲染区 <NuxtPage />']
  }
}
const currentLayoutMeta = computed(() => layoutMeta[activeLayout.value])

// ---- Demo B: 组件名生成器（文件路径 → 自动导入的组件名） ----
const compPathInput = ref('components/base/Button.vue')
const compNameResult = computed(() => fileToComponentName(compPathInput.value))

function fileToComponentName(path) {
  const clean = path
    .replace(/^\.?\/?app\//, '')
    .replace(/^components\/?/, '')
    .replace(/\.vue$/, '')
    .replace(/\\/g, '/')
    .replace(/^\/|\/$/g, '')

  if (!clean) return { name: '', segments: [], isIndex: false }

  const segments = clean.split('/').filter(Boolean)

  // Nuxt 会把路径段 + 文件名拼接成 PascalCase（pathPrefix 默认开启）
  const pascal = segments
    .map(s => s
      .replace(/\.([a-z])/g, (_, c) => c.toUpperCase()) // dotted-name 支持
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    )
    .join('')

  return {
    name: pascal,
    segments,
    usage: `<${pascal} />`,
    isIndex: segments[segments.length - 1] === 'Index'
  }
}

const compPresets = [
  { file: 'components/AppCard.vue', label: '根目录组件' },
  { file: 'components/base/Button.vue', label: '一级嵌套' },
  { file: 'components/base/nav/Menu.vue', label: '二级嵌套' },
  { file: 'components/home/HeroSection.vue', label: '多词文件名' },
  { file: 'components/ui/index.vue', label: 'index.vue（特殊）' }
]

// ---- Demo C: 插槽填充 playground ----
const fillHeader = ref(true)
const fillBody = ref(true)
const fillFooter = ref(false)

const slotUsageCode = computed(() => `<SlotDemoCard title="我的卡片">
  ${fillHeader.value
    ? '<template #header>\n    <strong>🔥 自定义头部</strong>\n  </template>\n  '
    : ''}
  ${fillBody.value
    ? '<p>这里是默认插槽的内容，\n  直接写在组件标签之间。</p>'
    : '<!-- 默认插槽未填充，会显示组件内定义的回退内容 -->'}
  ${fillFooter.value
    ? '\n  <template #footer>\n    <AppButton size="small">操作按钮</AppButton>\n  </template>'
    : ''}
</SlotDemoCard>`)

// ---- Demo D: ClientOnly + Lazy ----
const clientTime = ref('')
const ssrTime = new Date().toLocaleTimeString('zh-CN')

let timer = null
onMounted(() => {
  const update = () => { clientTime.value = new Date().toLocaleTimeString('zh-CN') }
  update()
  timer = setInterval(update, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

// Lazy 按需挂载
const showLazyCard = ref(false)
const lazyLog = ref('')
function toggleLazy() {
  showLazyCard.value = !showLazyCard.value
  lazyLog.value = showLazyCard.value
    ? '✅ LazySlotDemoCard 已挂载（首次挂载时才加载对应 chunk）'
    : '🛑 已卸载（unmount 后 chunk 保留在内存，再次挂载不再请求）'
}

// ---- 代码示例 ----
const appVueCode = `<template>
  <!-- 改造前：页面直接渲染，layouts/ 目录完全不生效 -->
  <NuxtPage />

  <!-- 改造后：NuxtLayout 激活布局系统 -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>`

const layoutDefaultCode = `app/layouts/default.vue
<template>
  <div class="layout-default">
    <header>顶部导航（所有页面共享）</header>

    <!-- 页面内容渲染在这里，等价于第02章的「子路由出口」 -->
    <main>
      <slot />
    </main>

    <footer>页脚（所有页面共享）</footer>
  </div>
</template>

<!-- 关键点：布局组件不写 <NuxtPage />，写 <slot /> -->
<!-- 因为布局是「包装者」，页面内容由外部（app.vue）传进来 -->`

const multiLayoutCode = `app/pages/admin.vue
${'<'}script setup>
definePageMeta({
  layout: 'custom'   // 使用 app/layouts/custom.vue
})
${'<'}${'/'}script>

<template>
  <p>这个页面用侧边栏布局渲染</p>
</template>

<!-- 不写 layout 字段 = 默认使用 default.vue -->
<!-- layout: false 可以禁用布局，页面裸渲染 -->`

const autoImportCode = `components/ 目录
├── AppCard.vue              →  <AppCard>            （根目录，无前缀）
├── base/
│   └── Button.vue           →  <BaseButton>         （路径段 Base + 文件名）
│   └── nav/
│       └── Menu.vue         →  <BaseNavMenu>        （Base + Nav + Menu）
└── home/
    └── HeroSection.vue      →  <HomeHeroSection>

规则：
1. 路径段 + 文件名 → PascalCase 拼接（pathPrefix 默认开启）
2. 唯一性：不同目录的同名文件会生成不同前缀名，天然避免冲突
3. 关闭前缀：nuxt.config.ts 里 components: [{ path: '~/components', pathPrefix: false }]`

const propsEmitsCode = `app/components/AppCard.vue（本项目真实代码）
${'<'}script setup>
// 1. Props：父 → 子 传数据
const props = defineProps({
  title:    { type: String, required: true },
  content:  { type: String, default: '' },
  clickable:{ type: Boolean, default: false }
})

// 2. Emits：子 → 父 发事件
const emit = defineEmits(['click'])

function handleClick() {
  if (props.clickable) {
    emit('click', props.title)   // 可以携带载荷
  }
}
${'<'}${'/'}script>

<!-- 父组件使用：@click 监听子组件 emit 的事件 -->
<AppCard
  title="卡片标题"
  :clickable="true"
  @click="onCardClick"
/>`

const slotsCode = `<!-- 3. Slots：父 → 子 传「模板片段」 -->
<AppCard title="商品卡片">
  <!-- 默认插槽：直接写内容 -->
  <p>价格：¥99</p>

  <!-- 具名插槽：用 #名字 填充到对应位置 -->
  <template #header>
    <span class="badge">热卖</span>
  </template>
</AppCard>

<!-- 子组件里声明插槽，未填充时显示回退内容 -->
<div class="card">
  <slot name="header">回退：没有传 header 就显示我</slot>
  <slot>回退：默认内容</slot>
</div>

<!-- Props 传数据，Slots 传结构 —— 二者互补，不是替代 -->`

const lazyClientOnlyCode = `<!-- Lazy 前缀：首屏不加载，真正渲染时才拉取组件 chunk -->
<template>
  <LazyHeavyChart v-if="showChart" />
  <!-- showChart 为 false 时，HeavyChart 的 JS 根本不会下载 -->
</template>

<!-- ClientOnly：某些组件依赖 window/document，SSR 会报错 -->
<template>
  <ClientOnly>
    <!-- 只在浏览器渲染 -->
    <EChartsWidget :options="chartOptions" />

    <!-- 服务端渲染时显示的占位（fallback 插槽） -->
    <template #fallback>
      <p>图表加载中...</p>
    </template>
  </ClientOnly>
</template>

<!-- 记忆口诀：
     Lazy 解决「什么时候加载」（代码分割 / 首屏性能）
     ClientOnly 解决「在哪里渲染」（SSR 兼容性） -->`
</script>

<template>
  <div class="chapter">
    <header class="chapter-header">
      <span class="chapter-badge">第 {{ chapterNum }} 章</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        布局解决「多个页面共享外围结构」的问题，组件解决「复用与组合」的问题。
        Nuxt 在 Vue 组件体系之上加了三件武器：<strong>目录即注册</strong>（组件自动导入）、
        <strong>布局即包装</strong>（layouts 目录）、<strong>Lazy/ClientOnly</strong>（性能与 SSR 兼容）。
      </p>
    </header>

    <!-- 知识点 1：布局系统 -->
    <KnowledgePoint num="1" title="布局系统：NuxtLayout + layouts 目录">
      <p>
        本站刚才做了一个真实改造：<code>app.vue</code> 原来只有 <code>&lt;NuxtPage /&gt;</code>，
        <code>app/layouts/</code> 下的两个布局文件形同虚设。加上 <code>&lt;NuxtLayout&gt;</code> 后，
        你现在看到的顶部导航和页脚就是 <code>default.vue</code> 布局在起作用。
      </p>
      <CodeBlock :code="appVueCode" lang="vue" title="app.vue 的前后对比" />
      <CodeBlock :code="layoutDefaultCode" lang="vue" title="布局组件的结构" />
      <div class="callout">
        <strong>对比第02章</strong>：<code>&lt;NuxtPage /&gt;</code> 是嵌套路由的出口，
        <code>&lt;slot /&gt;</code> 是布局的出口——都是「标记内容渲染位置」，只是一个按 URL 选取，一个按使用方传入。
      </div>
    </KnowledgePoint>

    <!-- 知识点 2：多布局 -->
    <KnowledgePoint num="2" title="多布局：按页面切换外围结构">
      <p>
        一个应用可以有多个布局。页面通过 <code>definePageMeta({ layout })</code> 声明自己用哪个：
      </p>
      <CodeBlock :code="multiLayoutCode" lang="vue" title="页面指定布局" />
      <p>
        <strong>真实体验</strong>：本章配套了一个实际使用 <code>custom</code> 布局的页面，
        点击进去看侧边栏效果（注意浏览器地址栏和页面外围结构的变化）：
      </p>
      <div class="real-demo-link">
        <AppButton type="primary" @click="navigateTo('/chapters/03-demo')">
          打开真实布局体验页 →
        </AppButton>
      </div>
    </KnowledgePoint>

    <!-- Demo A: 布局模拟切换器 -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo：布局结构模拟器 — 切换布局看内容嵌在哪</div>
      <div class="layout-demo">
        <div class="layout-switcher">
          <button
            v-for="(meta, key) in layoutMeta"
            :key="key"
            class="layout-tab"
            :class="{ active: activeLayout === key }"
            @click="activeLayout = key"
          >
            {{ meta.name }}
          </button>
        </div>
        <p class="layout-desc">{{ currentLayoutMeta.desc }}</p>

        <!-- 模拟的布局线框图 -->
        <div class="wireframe" :class="`wf-${activeLayout}`">
          <template v-if="activeLayout === 'default'">
            <div class="wf-header">header — 导航栏</div>
            <div class="wf-slot">slot —— 页面内容（&lt;NuxtPage /&gt; 渲染在这）</div>
            <div class="wf-footer">footer — 页脚</div>
          </template>
          <template v-else>
            <div class="wf-sidebar">aside<br />侧<br />边<br />栏</div>
            <div class="wf-slot vertical">slot —— 页面内容</div>
          </template>
        </div>

        <div class="layout-regions">
          <h4>组成区域</h4>
          <ul>
            <li v-for="r in currentLayoutMeta.regions" :key="r">{{ r }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 知识点 3：组件自动导入 -->
    <KnowledgePoint num="3" title="组件自动导入：目录即注册">
      <p>
        <code>app/components/</code> 下的组件无需 import，直接在模板里使用。
        命名规则：<strong>路径段 + 文件名 → PascalCase</strong>：
      </p>
      <CodeBlock :code="autoImportCode" lang="text" title="命名规则" />
    </KnowledgePoint>

    <!-- Demo B: 组件名生成器 -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo：组件名生成器 — 输入文件路径，看自动导入的名字</div>
      <div class="router-mapper">
        <div class="mapper-input">
          <label>文件路径：</label>
          <input
            v-model="compPathInput"
            type="text"
            placeholder="components/base/nav/Menu.vue"
            class="path-input"
          />
        </div>
        <div class="presets">
          <span class="presets-label">快速预设：</span>
          <button
            v-for="p in compPresets"
            :key="p.file"
            class="preset-btn"
            @click="compPathInput = p.file"
          >
            {{ p.label }}
          </button>
        </div>
        <div class="mapper-result">
          <div class="result-row">
            <span class="result-label">文件：</span>
            <code class="result-value">{{ compPathInput }}</code>
          </div>
          <div class="result-row highlight-row">
            <span class="result-label">组件名：</span>
            <code class="result-value route-path">{{ compNameResult.name || '—' }}</code>
          </div>
          <div v-if="compNameResult.name" class="result-row">
            <span class="result-label">使用：</span>
            <code class="result-value">{{ compNameResult.usage }}</code>
          </div>
          <div v-if="compNameResult.isIndex" class="result-row warn-row">
            <span class="result-label">⚠️ 注意：</span>
            <span class="result-value">index.vue 会生成 &lt;UiIndex&gt; 而不是 &lt;Ui&gt;——想用短名就把组件命名为单文件</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点 4：组件通信 -->
    <KnowledgePoint num="4" title="组件通信三件套：Props / Emits / Slots">
      <p>用本项目的 <code>AppCard.vue</code> 真实代码拆解三种通信方式：</p>
      <CodeBlock :code="propsEmitsCode" lang="vue" title="Props + Emits（AppCard 真实代码）" />
      <CodeBlock :code="slotsCode" lang="vue" title="Slots" />
      <div class="callout">
        <strong>选择建议</strong>：传数据用 Props，传结构（含标签的模板）用 Slots，
        通知父组件用 Emits。Web Components 时代的老朋友 <code>attribute + event + slot</code> 思想一脉相承。
      </div>
    </KnowledgePoint>

    <!-- Demo C: 插槽 playground -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo：插槽填充 Playground — 勾选填充，对照代码与渲染结果</div>
      <div class="slot-playground">
        <div class="slot-controls">
          <h4>填充哪些插槽？</h4>
          <label class="slot-check">
            <input v-model="fillHeader" type="checkbox" />
            header 插槽（具名 #header）
          </label>
          <label class="slot-check">
            <input v-model="fillBody" type="checkbox" />
            默认插槽（组件标签之间的内容）
          </label>
          <label class="slot-check">
            <input v-model="fillFooter" type="checkbox" />
            footer 插槽（具名 #footer）
          </label>
          <h4>你的模板代码（实时变化）</h4>
          <CodeBlock :code="slotUsageCode" lang="vue" title="消费者代码" />
        </div>
        <div class="slot-preview">
          <h4>渲染结果（SlotDemoCard）</h4>
          <SlotDemoCard title="我的卡片">
            <template v-if="fillHeader" #header>
              <strong>🔥 自定义头部</strong>
            </template>
            <p v-if="fillBody" class="slot-body-text">
              这里是默认插槽的内容，直接写在组件标签之间。
            </p>
            <template v-if="fillFooter" #footer>
              <AppButton size="small" type="primary">操作按钮</AppButton>
            </template>
          </SlotDemoCard>
          <p class="slot-note">
            取消勾选时，对应区域显示的是<strong>组件内部定义的回退内容</strong>——
            这就是插槽回退的作用。
          </p>
        </div>
      </div>
    </div>

    <!-- 知识点 5：Lazy 与 ClientOnly -->
    <KnowledgePoint num="5" title="Lazy 组件与 ClientOnly">
      <p>这两个前缀/组件解决的是不同维度的问题：</p>
      <table class="route-table">
        <thead>
          <tr><th>手段</th><th>解决的问题</th><th>原理</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>&lt;LazyXxx&gt;</code></td>
            <td>什么时候<strong>加载</strong>（首屏性能）</td>
            <td>动态 import，渲染时才拉取 chunk</td>
          </tr>
          <tr>
            <td><code>&lt;ClientOnly&gt;</code></td>
            <td>在哪里<strong>渲染</strong>（SSR 兼容）</td>
            <td>服务端跳过渲染，hydration 后才挂载</td>
          </tr>
        </tbody>
      </table>
      <CodeBlock :code="lazyClientOnlyCode" lang="vue" title="用法示例" />
    </KnowledgePoint>

    <!-- Demo D: ClientOnly + Lazy -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo：ClientOnly 计时器 + Lazy 按需挂载</div>
      <div class="co-lazy-demo">
        <div class="co-demo">
          <h4>ClientOnly：时间只在客户端更新</h4>
          <div class="time-row">
            <span class="time-label">SSR 渲染值（写死在 HTML 里）：</span>
            <!-- data-allow-mismatch：允许 SSR/客户端文本不同，抑制 hydration 警告 -->
            <code class="time-value ssr" data-allow-mismatch>{{ ssrTime }}</code>
          </div>
          <ClientOnly>
            <div class="time-row">
              <span class="time-label">客户端实时值（每秒跳动）：</span>
              <code class="time-value client">{{ clientTime }}</code>
            </div>
            <template #fallback>
              <div class="time-row fallback-row">⏳ 服务端占位：图表/计时器加载中…</div>
            </template>
          </ClientOnly>
          <p class="co-note">
            查看页面源代码（⌘+U）：SSR 值在 HTML 里，客户端值不在——它由浏览器 hydration 后渲染。
          </p>
        </div>
        <div class="lazy-demo">
          <h4>Lazy：按需挂载组件</h4>
          <div class="lazy-controls">
            <AppButton type="primary" size="small" @click="toggleLazy">
              {{ showLazyCard ? '卸载 LazySlotDemoCard' : '挂载 LazySlotDemoCard' }}
            </AppButton>
          </div>
          <div class="lazy-stage">
            <LazySlotDemoCard v-if="showLazyCard" title="懒加载的卡片">
              <p>我只有在挂载时才被加载和渲染。</p>
            </LazySlotDemoCard>
            <div v-else class="lazy-empty">（未挂载）</div>
          </div>
          <p class="lazy-log">{{ lazyLog || '点击按钮试试，观察挂载/卸载行为' }}</p>
        </div>
      </div>
    </div>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li><code>&lt;NuxtLayout&gt;</code> 包裹 <code>&lt;NuxtPage&gt;</code> 才能激活布局系统</li>
        <li>布局组件用 <code>&lt;slot /&gt;</code> 声明页面内容渲染位置</li>
        <li>页面用 <code>definePageMeta({ layout })</code> 选布局，<code>layout: false</code> 禁用</li>
        <li>组件自动导入：路径段 + 文件名 → PascalCase（如 <code>base/Button.vue</code> → <code>&lt;BaseButton&gt;</code>）</li>
        <li>Props 传数据、Slots 传结构、Emits 通知父组件</li>
        <li>插槽有回退内容；<code>#名字</code> 填充具名插槽</li>
        <li><code>Lazy</code> 管加载时机，<code>ClientOnly</code> 管渲染位置</li>
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

.real-demo-link {
  margin: 16px 0;
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

/* Demo A: 布局模拟器 */
.layout-demo {
  padding: 20px;
  background: #fff;
}

.layout-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.layout-tab {
  padding: 6px 18px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 6px;
  cursor: pointer;
  font-family: monospace;
  font-size: 0.85rem;
  color: #475569;
  transition: all 0.2s;
}

.layout-tab.active {
  background: #00dc82;
  border-color: #00dc82;
  color: #fff;
  font-weight: 600;
}

.layout-desc {
  color: #64748b;
  font-size: 0.88rem;
  margin: 0 0 16px;
}

.wireframe {
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.wf-header {
  background: #1e293b;
  color: #94a3b8;
  padding: 14px;
  text-align: center;
  font-size: 0.82rem;
  font-family: monospace;
}

.wf-slot {
  background: #ecfdf5;
  border: 2px dashed #00dc82;
  color: #065f46;
  padding: 40px 16px;
  text-align: center;
  font-size: 0.9rem;
  font-family: monospace;
  font-weight: 600;
}

.wf-footer {
  background: #f1f5f9;
  color: #64748b;
  padding: 10px;
  text-align: center;
  font-size: 0.78rem;
  font-family: monospace;
}

.wireframe.wf-custom {
  display: flex;
  min-height: 180px;
}

.wf-sidebar {
  background: #1e293b;
  color: #94a3b8;
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-family: monospace;
  text-align: center;
  line-height: 1.8;
}

.wf-slot.vertical {
  flex: 1;
  border: none;
}

.layout-regions h4 {
  margin: 0 0 8px;
  font-size: 0.9rem;
  color: #1e293b;
}

.layout-regions ul {
  margin: 0;
  padding-left: 20px;
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.8;
}

/* Demo B: 组件名生成器（复用 ch02 样式） */
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

.result-row.warn-row {
  background: #fef9c3;
  margin: 0 -16px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
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

/* Demo C: 插槽 playground */
.slot-playground {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1px;
  background: #e2e8f0;
}

.slot-controls,
.slot-preview {
  background: #fff;
  padding: 20px;
}

.slot-controls h4,
.slot-preview h4 {
  margin: 0 0 12px;
  font-size: 0.95rem;
  color: #1e293b;
}

.slot-check {
  display: block;
  padding: 8px 0;
  font-size: 0.9rem;
  color: #334155;
  cursor: pointer;
}

.slot-check input {
  margin-right: 8px;
  accent-color: #00dc82;
}

.slot-body-text {
  color: #334155;
  margin: 0;
}

.slot-note {
  margin-top: 16px;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.6;
}

/* Demo D */
.co-lazy-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #e2e8f0;
}

.co-demo,
.lazy-demo {
  background: #fff;
  padding: 20px;
}

.co-demo h4,
.lazy-demo h4 {
  margin: 0 0 12px;
  font-size: 0.95rem;
  color: #1e293b;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 0.85rem;
}

.time-label {
  color: #64748b;
}

.time-value {
  font-family: monospace;
  padding: 2px 10px;
  border-radius: 4px;
}

.time-value.ssr {
  background: #f1f5f9;
  color: #475569;
}

.time-value.client {
  background: #ecfdf5;
  color: #059669;
  font-weight: 700;
}

.fallback-row {
  color: #94a3b8;
  font-style: italic;
}

.co-note,
.lazy-log {
  margin: 12px 0 0;
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.6;
}

.lazy-controls {
  margin-bottom: 12px;
}

.lazy-stage {
  min-height: 100px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 12px;
}

.lazy-empty {
  color: #94a3b8;
  font-size: 0.85rem;
  text-align: center;
  padding: 24px 0;
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
  .slot-playground,
  .co-lazy-demo {
    grid-template-columns: 1fr;
  }
  .mapper-input {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
