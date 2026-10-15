<script setup>
// ============================================================
// 第 10 章：构建与部署
// dev vs build / .output 产物 / 渲染模式 / 环境变量 / 部署目标
// ============================================================

const chapterNum = 10
const chapterTitle = '构建与部署'

// ---------- Demo A：运行环境自检 ----------
const envInfo = ref(null)
const envPending = ref(false)

async function checkEnv() {
  envPending.value = true
  try {
    envInfo.value = await $fetch('/api/demo/env-check')
  } finally {
    envPending.value = false
  }
}

// ---------- Demo C：读取真实 .output 结构 ----------
const outputInfo = ref(null)
const outputPending = ref(false)

async function loadOutput() {
  outputPending.value = true
  try {
    outputInfo.value = await $fetch('/api/demo/output-structure')
  } finally {
    outputPending.value = false
  }
}

// ---------- 代码示例（均来自项目真实文件 / 命令） ----------
const devBuildCode = `nuxt dev       开发模式：HMR 热更新、不压缩、按需编译、无预渲染
               —— 进程本身不能上生产，它不产出任何可部署的东西

nuxt build     生产构建：Vite 打包客户端 + Nitro 编译服务端
               → 产物在 .output/ 目录，压缩、tree-shaking、代码分割全做完

nuxt generate  SSG：等价 build + 全站预渲染
               → .output/public 变成纯静态文件，可扔给 Nginx / OSS / CDN

nuxt preview   快捷方式：直接启动 .output 里的产物（本地验证构建结果用）`

const outputStructureCode = `nuxt build 完成后的产物结构：

.output/
├── public/                  # 静态资源（构建 hash 后的 JS/CSS、public/ 原样拷贝）
│   ├── images/              #   ← 第 08 章 public/ 里的东西
│   └── _nuxt/               #   ← 客户端 chunk
└── server/
    ├── index.mjs            # 独立 Node 服务器入口 —— 自带依赖，不需要 node_modules
    ├── chunks/              # 服务端代码分块（SSR 渲染器、API 处理器都在这）
    └── package.json

部署 = 把 .output 拷到任意服务器，然后一条命令：
  node .output/server/index.mjs
  PORT=8080 HOST=0.0.0.0 node .output/server/index.mjs`

const envOverrideCode = `# 服务器 / 容器上注入环境变量即可覆盖 runtimeConfig —— 无需重新构建
# 命名规则：NUXT_ + 大写下划线（嵌套用双下划线）

# 顶层字段（仅服务端可读，第 01 章的 apiSecret）：
NUXT_API_SECRET=real-prod-secret

# public.* 字段（客户端也可读）：
NUXT_PUBLIC_APP_NAME=Nuxt 生产站
NUXT_PUBLIC_API_BASE=https://api.example.com

# 一次构建，多环境部署：同一个 .output，测试 / 生产注入不同 env
# 配置与产物分离 —— 容器镜像只需构建一次`

const routeRulesCode = `// 本项目 nuxt.config.ts 的真实配置（第 10 章 demo）
routeRules: {
  // 构建时预渲染为静态 HTML —— SSG 样本（Demo B）
  '/chapters/10-demo/prerender-check': { prerender: true }

  // 常用的其他规则（示例）：
  // '/admin/**': { ssr: false },       // 后台纯 CSR，不吃服务器资源
  // '/products/**': { swr: 600 },      // 缓存 10 分钟，过期后台重新生成（ISR 思路）
  // '/docs/**': { prerender: true }    // 文档全站预渲染
}

// routeRules = 按路由粒度选渲染模式 —— 这就是 Nuxt 的混合渲染
// 一份代码里：营销页静态化、详情页 SSR+缓存、后台 CSR，各走各的最优路径`

const prerenderCheckCode = `// app/pages/chapters/10-demo/prerender-check.vue —— Demo B 的真实代码
const prerendered = import.meta.prerender   // 构建时预渲染 → true，否则 false

// useState：SSR 时服务端生成一次写入 payload；
// SSG 时 payload 直接固化进静态 HTML —— 时间永远停在构建那一刻
const renderedAt = useState('prerender-check-time', () => new Date().toString())

// dev / SSR 模式访问：prerendered = false，renderedAt 是「刚才」
// build 后访问：    prerendered = true， renderTime 是「构建那一刻」，永远不变`

const deployCode = `① Node 服务器（本项目的模式）
   把 .output 拷到服务器 → node .output/server/index.mjs
   进程守护：PM2 / Docker / systemd（崩溃自动拉起）

② 静态托管
   nuxt generate → 把 .output/public 传到 OSS / Nginx / 任何静态托管
   前提：页面全部被预渲染（或纯 CSR），没有必须实时执行的服务端逻辑

③ Serverless / Edge
   Nitro preset 把同一份代码编译成不同部署目标：
   nuxt build --preset=vercel / cloudflare-pages / netlify …
   Nitro 是 Nuxt 的「部署引擎」—— 写一次，编译到任意运行时`
</script>

<template>
  <div class="chapter">
    <header class="chapter-header">
      <span class="chapter-badge">第 {{ chapterNum }} 章</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        前九章写的代码一直活在 <code>nuxt dev</code> 里——那是个为了开发体验优化的世界（HMR、不压缩、按需编译）。
        这一章把代码带进真实世界：<code>nuxt build</code> 产出什么、三种渲染模式怎么选、环境变量怎么注入、
        <code>.output</code> 怎么变成一个正在服务的网站。<strong>本章的验证就是真实构建 + 生产运行。</strong>
      </p>
    </header>

    <!-- 知识点 1 -->
    <KnowledgePoint num="1" title="dev 与 build 是两个世界">
      <p>
        <code>nuxt dev</code> 为开发体验优化：热更新快、报错全、不压缩。<code>nuxt build</code> 为生产优化：
        打包、压缩、tree-shaking，客户端（Vite）和服务端（Nitro）分别编译。dev 进程不能上生产——
        它不产出任何可部署的东西。
      </p>
      <CodeBlock :code="devBuildCode" lang="bash" title="四个命令的分工" />
    </KnowledgePoint>

    <!-- 知识点 2 -->
    <KnowledgePoint num="2" title="nuxt build 与 .output 产物">
      <p>
        构建产物在 <code>.output</code>：<code>public/</code> 是静态资源，<code>server/index.mjs</code>
        是一个<strong>独立 Node 服务器</strong>（依赖已打包进去，不需要 node_modules）。
        部署 = 拷贝 <code>.output</code> + 一条 node 命令。
      </p>
      <CodeBlock :code="outputStructureCode" lang="text" title=".output 结构与启动命令" />
    </KnowledgePoint>

    <!-- Demo A -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo A：运行环境自检（dev vs build 实测）</div>
      <div class="demo-body">
        <p class="demo-lead">
          接口 <code>/api/demo/env-check</code> 返回当前运行环境的真实信息。
          <strong>dev 模式下点一下</strong>，记住 NODE_ENV 的值；本章验证阶段构建后再点，值会变成
          <code>production</code> —— 同一份代码，环境由「怎么跑」决定。
        </p>
        <div class="demo-controls">
          <AppButton type="primary" size="small" :disabled="envPending" @click="checkEnv">
            {{ envPending ? '查询中…' : '检测当前运行环境' }}
          </AppButton>
        </div>
        <div v-if="envInfo" class="env-result">
          <table class="route-table">
            <tbody>
              <tr><td><code>NODE_ENV</code></td><td>{{ envInfo.nodeEnv }}</td></tr>
              <tr><td><code>isDev</code></td><td>{{ envInfo.isDev }}</td></tr>
              <tr><td><code>执行端</code></td><td>{{ envInfo.side }}</td></tr>
              <tr><td><code>runtimeConfig.public.appName</code></td><td>{{ envInfo.publicAppName }}</td></tr>
              <tr><td><code>apiSecret 是否配置</code></td><td>{{ envInfo.apiSecretIsSet ? '是（值不返回，仅服务端可见）' : '否' }}</td></tr>
              <tr><td><code>timestamp</code></td><td>{{ envInfo.timestamp }} <span class="note">← 每次点击都是新值：接口是活代码，不是静态文件</span></td></tr>
            </tbody>
          </table>
        </div>
        <div v-else class="demo-empty">点击按钮，看看代码眼里的运行环境</div>
      </div>
    </div>

    <!-- 知识点 3 -->
    <KnowledgePoint num="3" title="环境变量与 runtimeConfig：部署视角">
      <p>
        第 01 章学过 <code>runtimeConfig</code> 的结构（public 客户端可读、顶层仅服务端）。
        部署视角的关键是：<strong>环境变量按 <code>NUXT_</code> 前缀自动覆盖对应字段</strong>，
        换环境不用重新构建——配置与产物分离，一次构建多环境部署。
      </p>
      <CodeBlock :code="envOverrideCode" lang="bash" title="环境变量覆盖 runtimeConfig" />
      <div class="callout">
        <strong>与第 01 章呼应</strong>：<code>runtimeConfig</code> 里的值只是<strong>默认值/占位</strong>，
        真实值应该来自部署环境。把秘密写进代码库提交，等于把钥匙贴在门上。
      </div>
    </KnowledgePoint>

    <!-- 知识点 4 -->
    <KnowledgePoint num="4" title="三种渲染模式：SSR / SSG / 混合">
      <p>
        默认每请求实时渲染（SSR，前九章全部页面）；<code>nuxt generate</code> 把整站预渲染成静态文件（SSG）；
        而 <code>routeRules</code> 可以<strong>按路由粒度混搭</strong>——这是现代 Nuxt 应用的主流形态。
      </p>
      <CodeBlock :code="routeRulesCode" lang="typescript" title="routeRules：混合渲染（本项目真实配置）" />
    </KnowledgePoint>

    <!-- Demo B -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo B：SSG 样本页（构建前后行为对比）</div>
      <div class="demo-body">
        <p class="demo-lead">
          <code>/chapters/10-demo/prerender-check</code> 被我们配置为 <code>prerender: true</code>。
          它展示 <code>import.meta.prerender</code> 标志和渲染时刻——这是观察「内容凝固在构建时」的窗口。
        </p>
        <div class="demo-controls">
          <NuxtLink to="/chapters/10-demo/prerender-check" target="_blank" class="open-link">
            打开样本页 ↗
          </NuxtLink>
          <span class="note">dev 模式下：prerendered = false，时间每次变（SSR）</span>
        </div>
        <CodeBlock :code="prerenderCheckCode" lang="typescript" title="样本页核心代码" />
        <div class="callout">
          <strong>实测结果</strong>（本项目真实构建后验证）：
          <code>npm run build</code> 15.5s 产出 23.3 MB 产物，其中
          <code>.output/public/chapters/10-demo/prerender-check/index.html</code>（5.7 KB）与
          <code>_payload.json</code> 就是本页被预渲染出的静态文件，
          payload 里记录着 <code>prerenderedAt: 1792026160154</code>。
          用 <code>node .output/server/index.mjs</code> 起生产服务器后：
          连续两次请求本页，渲染时刻都凝固在 <code>Oct 15 2026 09:02:40</code>（构建那一刻）、
          <code>import.meta.prerender</code> 为 true；
          而同一站里的 Demo A 接口 timestamp 每次请求都不同——
          <strong>SSR 路由是活代码，预渲染路由是静态文件，同站共存</strong>。
        </div>
      </div>
    </div>

    <!-- 知识点 5 -->
    <KnowledgePoint num="5" title="部署目标：Nitro 决定能去哪">
      <p>
        同一份代码，部署到哪取决于 Nitro 的编译目标：Node 服务器（最通用）、纯静态托管（generate 后）、
        serverless/edge（preset 编译到对应平台）。
      </p>
      <CodeBlock :code="deployCode" lang="text" title="三种部署路径" />
    </KnowledgePoint>

    <!-- Demo C -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo C：读取真实 .output 结构</div>
      <div class="demo-body">
        <p class="demo-lead">
          接口 <code>/api/demo/output-structure</code> 用 <code>node:fs</code> 读取项目真实的
          <code>.output</code> 目录树。未构建时返回提示；本章验证阶段构建后，就能看到真实产物和体积。
        </p>
        <div class="demo-controls">
          <AppButton type="primary" size="small" :disabled="outputPending" @click="loadOutput">
            {{ outputPending ? '读取中…' : '读取 .output 目录树' }}
          </AppButton>
        </div>
        <div v-if="outputInfo" class="env-result">
          <p v-if="!outputInfo.exists" class="note">{{ outputInfo.hint }}</p>
          <pre v-else class="tree-pre">{{ outputInfo.lines.join('\n') }}</pre>
        </div>
        <div v-else class="demo-empty">点击按钮，看构建产物的真实结构</div>
      </div>
    </div>

    <!-- 知识点 6 -->
    <KnowledgePoint num="6" title="部署检查清单">
      <p>
        上线前过一遍清单，大部分来自前面章节的知识点：
      </p>
      <ul class="checklist">
        <li><strong>环境变量</strong>：<code>NUXT_*</code> 前缀拼写正确，秘密只存在部署环境（知识点 3）</li>
        <li><strong>og:image 绝对地址</strong>：生产域名下分享卡片是否正常（第 09 章）</li>
        <li><strong>静态缓存</strong>：带 hash 的资源可配长期缓存，<code>public/</code> 固定 URL 资源不配 immutable（第 08 章）</li>
        <li><strong>渲染模式</strong>：哪些路由 prerender / swr / ssr:false，确认与业务匹配（知识点 4）</li>
        <li><strong>进程守护</strong>：Node 直跑必须配 PM2 / Docker 重启策略，崩溃自动恢复</li>
        <li><strong>nuxt preview</strong>：本地验证构建产物的快捷方式，生产入口用 node / PM2 / 容器</li>
      </ul>
    </KnowledgePoint>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li><code>dev</code> 是开发世界（HMR、不压缩），<code>build</code> 才产出可部署的 <code>.output</code></li>
        <li>部署 = 拷贝 <code>.output</code> + <code>node .output/server/index.mjs</code>，依赖已内置无需 node_modules</li>
        <li><code>NUXT_*</code> 环境变量运行时覆盖 <code>runtimeConfig</code>，一次构建多环境部署</li>
        <li>SSR 每请求渲染、SSG 凝固在构建时、<code>routeRules</code> 按路由混搭（混合渲染）</li>
        <li>Nitro 是部署引擎：同一份代码可编译为 Node / 静态 / serverless 目标</li>
        <li>上线清单：环境变量、og 绝对地址、缓存策略、渲染模式、进程守护</li>
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

.note {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.5;
}

.open-link {
  color: #3b82f6;
  font-size: 0.82rem;
  text-decoration: none;
}

.env-result {
  margin-top: 4px;
}

.tree-pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: monospace;
  line-height: 1.6;
  overflow-x: auto;
  margin: 8px 0 0;
}

/* ---- 表格 ---- */
.route-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 0.84rem;
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
  word-break: break-all;
}

.route-table td:first-child {
  width: 40%;
}

.route-table code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  color: #be123c;
}

/* ---- 检查清单 ---- */
.checklist {
  margin: 12px 0 0;
  padding-left: 20px;
  color: #334155;
  line-height: 1.9;
  font-size: 0.92rem;
}

.checklist code {
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 3px;
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
