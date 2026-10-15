<script setup>
// ============================================================
// 第 09 章：SEO 与元信息
// SSR 与 SEO / useHead / titleTemplate / useSeoMeta / Open Graph
// ============================================================

const chapterNum = 9
const chapterTitle = 'SEO 与元信息'

// ---------- Demo A：响应式 useHead（直接驱动本章页面自己的 title / description） ----------
const demoTitle = ref('第09章 SEO 与元信息')
const demoDesc = ref('')

useHead({
  title: demoTitle,
  meta: computed(() => demoDesc.value
    ? [{ name: 'description', content: demoDesc.value }]
    : [])
})

// 模拟标签页最终标题（titleTemplate 合成结果）
const fullTitle = computed(() => demoTitle.value
  ? `${demoTitle.value} - Nuxt 学习项目`
  : 'Nuxt 学习项目')

// ---------- Demo B：爬虫视角抓本章 ----------
// 客户端模拟爬虫：抓取本章的 SSR HTML，解析 <head> 里的 meta
const selfPending = ref(false)
const selfCrawled = ref(false)
const selfTitle = ref('')
const selfMetas = ref([])

async function crawlSelf() {
  selfPending.value = true
  try {
    const html = await $fetch('/chapters/09', { responseType: 'text' })
    const doc = new DOMParser().parseFromString(html, 'text/html')
    selfTitle.value = doc.querySelector('title')?.textContent || ''
    selfMetas.value = [...doc.querySelectorAll('head meta')].map(m => ({
      key: m.getAttribute('name') || m.getAttribute('property') || (m.hasAttribute('charset') ? 'charset' : '(其他)'),
      content: m.getAttribute('content') || m.getAttribute('charset') || ''
    }))
    selfCrawled.value = true
  } finally {
    selfPending.value = false
  }
}

// ---------- Demo C：模拟爬虫抓商品页 → 解析 og 标签 → 渲染分享卡片 ----------
const productId = ref('1')
const sharePending = ref(false)
const share = ref(null)

async function crawlProduct() {
  sharePending.value = true
  share.value = null
  try {
    const html = await $fetch(`/chapters/09-demo/product/${productId.value}`, { responseType: 'text' })
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const pick = (key) =>
      doc.querySelector(`meta[property="${key}"]`)?.getAttribute('content')
      || doc.querySelector(`meta[name="${key}"]`)?.getAttribute('content')
      || ''
    share.value = {
      title: pick('og:title'),
      description: pick('og:description'),
      image: pick('og:image'),
      url: pick('og:url')
    }
  } finally {
    sharePending.value = false
  }
}

// ---------- 代码示例（均摘自项目真实文件） ----------
const ssrCompareCode = `<!-- 纯 CSR 应用「查看网页源代码」看到的：
     一个空壳 + 一堆 JS，meta 要等 JS 下载执行完才生成 -->
<div id="app"></div>
<script src="/app.js">${'<'}/script>

<!-- Nuxt SSR「查看网页源代码」看到的：
     完整 HTML，title / meta / og 标签全在首屏 -->
<title>Nuxt 4 实战指南 - Nuxt 学习项目</title>
<meta name="description" content="从目录约定到 SSR 部署……">
<meta property="og:title" content="Nuxt 4 实战指南">
<meta property="og:image" content="http://localhost:3000/images/demo-asset.png">

<!-- 大部分爬虫不执行 JS（Google 会执行但排队慢、权重低；
     微信 / Twitter / 豆瓣等分享爬虫完全不执行）→ CSR 的 meta 它们看不到 -->`

const useHeadCode = `// 本章页面的真实代码（就是下面 Demo A）
const demoTitle = ref('第09章 SEO 与元信息')
const demoDesc = ref('')

useHead({
  title: demoTitle,              // 传 ref → 响应式：输入框一改，标签页标题立即变
  meta: computed(() => demoDesc.value
    ? [{ name: 'description', content: demoDesc.value }]
    : [])
})

// useHead 还能管理 link / script / style / htmlAttrs / bodyAttrs：
// useHead({ link: [{ rel: 'icon', href: '/favicon.ico' }] })`

const titleTemplateCode = `// nuxt.config.ts —— 本项目的真实配置
app: {
  head: {
    titleTemplate: '%s - Nuxt 学习项目',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: 'Nuxt 4 学习项目' }
    ]
  }
}

// 页面里 useHead({ title: '第09章 SEO 与元信息' })
//   → 最终标签页标题：第09章 SEO 与元信息 - Nuxt 学习项目
// 页面不设 title → 只显示站点名（%s 部分留空）`

const seoMetaCode = `// app/pages/chapters/09-demo/product/[id].vue —— 真实代码节选
const route = useRoute()
const { data: product } = await useFetch(\`/api/demo/product/\${route.params.id}\`)
const requestUrl = useRequestURL()   // SSR 期间拿到当前请求的 origin

useSeoMeta({
  title: () => product.value?.name,                  // 支持 getter，数据到位自动更新
  description: () => product.value?.description,
  ogTitle: () => product.value?.name,                // 扁平参数 → <meta property="og:title">
  ogDescription: () => product.value?.description,
  ogImage: () => \`\${requestUrl.origin}\${product.value.image}\`,
  ogUrl: () => requestUrl.href,
  twitterCard: 'summary_large_image'
})

// 对比 useHead 手写：要记住 og 用 property 不是 name，且拼错无提示
// useHead({ meta: [
//   { property: 'og:title', content: ... },
//   { property: 'og:image', content: ... }
// ] })`

const ogCode = `<!-- 社交平台爬虫抓取的 og 标签（Demo C 能看到真实输出） -->
<meta property="og:title" content="Nuxt 4 实战指南">
<meta property="og:description" content="从目录约定到 SSR 部署……">
<meta property="og:image" content="http://localhost:3000/images/demo-asset.png">
<meta property="og:url" content="http://localhost:3000/chapters/09-demo/product/1">
<meta name="twitter:card" content="summary_large_image">

<!-- 三个硬性要求：
     1. og:image 必须是绝对 URL —— 爬虫不会替你拼相对路径
     2. 图片要公开可访问且 URL 固定 → 放 public/（第 08 章的结论）
     3. 分享爬虫不执行 JS，og 必须在首屏 HTML 里 → 靠 SSR -->`

const dedupeCode = `// 全局（nuxt.config.ts）：description = 'Nuxt 4 学习项目'
// 页面（useHead）：      description = '本章讲解 SEO……'
//
// 最终 HTML 里只有一个 <meta name="description"> —— 页面级生效
//
// 规则：同 name / 同 property 的 meta 会被去重，
//       后注册的（页面级）覆盖先注册的（全局级）
//
// charset / viewport 这类全局在 nuxt.config 配一次即可，页面不要再设`
</script>

<template>
  <div class="chapter">
    <header class="chapter-header">
      <span class="chapter-badge">第 {{ chapterNum }} 章</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        SEO 的本质问题只有一个：<strong>爬虫看到的是首屏 HTML，不是你的 JS 跑完之后的页面</strong>。
        Nuxt 用 SSR 把 <code>&lt;head&gt;</code> 直接写进首屏，再用 <code>useHead</code> /
        <code>useSeoMeta</code> 让你以响应式的方式管理它。
      </p>
    </header>

    <!-- 知识点 1 -->
    <KnowledgePoint num="1" title="SEO 的前提：爬虫看到的是什么">
      <p>
        在浏览器里按 <code>Ctrl+U</code>（或右键「查看网页源代码」）看到的内容，就是爬虫看到的内容。
        纯 CSR 应用的源码只有一个空 <code>div</code> 和一堆 JS 标签——标题、描述、正文全要等 JS
        下载执行完才出现，而大部分爬虫（微信、Twitter、豆瓣等分享爬虫）<strong>完全不执行 JS</strong>。
      </p>
      <CodeBlock :code="ssrCompareCode" lang="html" title="CSR vs SSR：view-source 对比" />
      <div class="callout">
        <strong>与第 07 章的认知衔接</strong>：SSR 是请求驱动的无状态预拼装——爬虫发来请求，
        服务器把数据拼进 HTML（包括 <code>&lt;head&gt;</code>）一次性返回，爬虫不需要执行任何 JS。
      </div>
    </KnowledgePoint>

    <!-- Demo B：爬虫视角抓本章 -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo B：模拟爬虫抓取本章</div>
      <div class="demo-body">
        <p class="demo-lead">
          点按钮后，客户端会用 <code>$fetch</code> 重新请求本章页面（服务器重新 SSR），
          像爬虫一样只解析返回 HTML 里的 <code>&lt;head&gt;</code>，不依赖任何 JS 执行结果。
        </p>
        <div class="demo-controls">
          <AppButton type="primary" size="small" :disabled="selfPending" @click="crawlSelf">
            {{ selfPending ? '抓取中…' : '以爬虫视角抓取本章' }}
          </AppButton>
          <span v-if="selfCrawled" class="note">
            实验：在 Demo A 输入描述后再点一次抓取——抓到的仍是全局默认值。想想为什么？（答案在知识点 6 的说明里）
          </span>
        </div>
        <div v-if="selfCrawled" class="crawl-result">
          <p class="crawl-title-line">
            <strong>&lt;title&gt;：</strong><code>{{ selfTitle }}</code>
          </p>
          <table class="route-table">
            <thead>
              <tr><th>name / property</th><th>content</th></tr>
            </thead>
            <tbody>
              <tr v-for="m in selfMetas" :key="m.key">
                <td><code>{{ m.key }}</code></td>
                <td>{{ m.content || '（空）' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="demo-empty">点击按钮，看看爬虫眼里的本章长什么样</div>
      </div>
    </div>

    <!-- 知识点 2 -->
    <KnowledgePoint num="2" title="useHead：响应式管理 head">
      <p>
        <code>useHead</code> 接受普通值，也接受 <code>ref</code> / <code>computed</code>——
        传入响应式值后，数据一变 <code>&lt;head&gt;</code> 自动更新，无需手动操作 DOM。
      </p>
      <CodeBlock :code="useHeadCode" lang="typescript" title="useHead 响应式用法（本章 Demo A 的真实代码）" />
    </KnowledgePoint>

    <!-- Demo A：响应式标题 -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo A：响应式标题与描述</div>
      <div class="demo-body">
        <p class="demo-lead">
          下面两个输入框直接绑定本章页面自己的 <code>useHead</code>。
          修改时<strong>注意浏览器标签页标题</strong>在实时变化。
          这是<strong>纯客户端修改</strong>——只改了当前浏览器 DOM 里的 head，
          服务器感知不到（可用 Demo B 重新抓取验证）。
        </p>
        <div class="demo-controls">
          <input v-model="demoTitle" class="demo-input" placeholder="页面标题 title" />
        </div>
        <div class="demo-controls">
          <input v-model="demoDesc" class="demo-input" placeholder="页面描述 description（留空则回落到全局默认）" />
        </div>
        <div class="head-state">
          <p><strong>标签页标题（titleTemplate 合成）：</strong><code>{{ fullTitle }}</code></p>
          <p>
            <strong>当前 description：</strong>
            <code>{{ demoDesc || '（未设置 → 使用全局：Nuxt 4 学习项目）' }}</code>
          </p>
        </div>
      </div>
    </div>

    <!-- 知识点 3 -->
    <KnowledgePoint num="3" title="titleTemplate：全局标题模板">
      <p>
        在 <code>nuxt.config.ts</code> 里配一次 <code>titleTemplate</code>，每个页面只需提供自己的标题片段，
        <code>%s</code> 会被页面标题替换——全站标题格式统一，改格式只改一处。
      </p>
      <CodeBlock :code="titleTemplateCode" lang="typescript" title="nuxt.config.ts 的 app.head（本项目真实配置）" />
    </KnowledgePoint>

    <!-- 知识点 4 -->
    <KnowledgePoint num="4" title="useSeoMeta：SEO 专用，类型安全">
      <p>
        <code>useHead</code> 是通用工具，<code>useSeoMeta</code> 是 SEO 专用封装：
        扁平参数（<code>ogTitle</code> 自动转成 <code>property="og:title"</code>）、
        完整的 TypeScript 提示、上百个预定义字段，不用记 <code>name</code> 还是 <code>property</code>。
      </p>
      <CodeBlock :code="seoMetaCode" lang="typescript" title="商品详情页的 useSeoMeta（真实代码）" />
    </KnowledgePoint>

    <!-- 知识点 5 -->
    <KnowledgePoint num="5" title="Open Graph：社交分享的卡片协议">
      <p>
        把链接粘贴到微信、Twitter、飞书时出现的卡片，来自页面里的 Open Graph 标签。
        它由 Facebook 提出，现在是事实标准：<code>og:title</code>、<code>og:description</code>、
        <code>og:image</code>、<code>og:url</code> 四个最核心。
      </p>
      <CodeBlock :code="ogCode" lang="html" title="og 标签与三个硬性要求" />
    </KnowledgePoint>

    <!-- Demo C：动态 OG + 分享卡片 -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo C：动态 OG 标签 → 分享卡片预览</div>
      <div class="demo-body">
        <p class="demo-lead">
          商品页 <code>/chapters/09-demo/product/[id]</code> 的 og 标签由接口数据动态生成。
          选择商品后点抓取：模拟爬虫拿到 SSR HTML → 解析 og 标签 → 渲染成分享卡片。
        </p>
        <div class="demo-controls">
          <button
            v-for="id in ['1', '2']" :key="id"
            class="size-btn" :class="{ active: productId === id }"
            @click="productId = id"
          >
            商品 {{ id }}
          </button>
          <AppButton type="primary" size="small" :disabled="sharePending" @click="crawlProduct">
            {{ sharePending ? '抓取中…' : '模拟爬虫抓取并生成卡片' }}
          </AppButton>
          <NuxtLink :to="`/chapters/09-demo/product/${productId}`" target="_blank" class="open-link">
            新窗口打开商品页 ↗
          </NuxtLink>
        </div>

        <div v-if="share" class="share-result">
          <div class="og-raw">
            <p><code>og:title</code> = {{ share.title }}</p>
            <p><code>og:description</code> = {{ share.description }}</p>
            <p><code>og:image</code> = {{ share.image }}</p>
            <p><code>og:url</code> = {{ share.url }}</p>
          </div>
          <div class="share-preview">
            <p class="preview-label">分享卡片预览（社交平台渲染效果）：</p>
            <ShareCard v-bind="share" />
          </div>
        </div>
        <div v-else class="demo-empty">选择商品，抓取它的 og 标签</div>

        <div class="callout" style="margin-top: 14px;">
          <strong>切换商品再抓一次</strong>：两个商品的 og 标签完全不同——同一份页面组件，
          meta 由路由参数 → 接口数据驱动，这就是动态 SEO。电商、文章站的所有详情页都是这个模式。
        </div>
      </div>
    </div>

    <!-- 知识点 6 -->
    <KnowledgePoint num="6" title="meta 的合并与覆盖规则">
      <p>
        全局（<code>nuxt.config.ts</code> 的 <code>app.head</code>）和页面（<code>useHead</code>）可能设置同一个
        <code>name</code> 的 meta，最终只保留一个：<strong>同 name / 同 property 去重，页面级覆盖全局级</strong>。
      </p>
      <CodeBlock :code="dedupeCode" lang="typescript" title="去重覆盖规则" />
      <div class="callout">
        <strong>两个验证入口</strong>：
        ① 页面级覆盖全局级——看商品页（Demo C 已抓到）：product/1 的 SSR HTML 里只有一个
        <code>description</code>，内容是接口返回的商品描述，全局的「Nuxt 4 学习项目」被覆盖了。
        ② 客户端修改不进 SSR——在 Demo A 输入描述后用 Demo B 重新抓取，抓到的仍是全局默认值：
        Demo A 的输入是纯客户端 <code>ref</code>，只改了当前浏览器 DOM 里的 head，
        <code>$fetch</code> 触发的全新 SSR 从初始值重新渲染，服务器感知不到。
        爬虫每次看到的都是「全新 SSR」的输出——所以 SEO 信息必须在服务端渲染时就正确。
      </div>
    </KnowledgePoint>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li>爬虫看到的是首屏 HTML（view-source），分享类爬虫不执行 JS → SEO 必须靠 SSR</li>
        <li><code>useHead</code> 响应式管理 head：传 ref/computed，数据变 head 自动变</li>
        <li><code>titleTemplate</code> 全局配一次，页面只给标题片段，全站格式统一</li>
        <li><code>useSeoMeta</code> 是 SEO 首选：扁平参数、类型安全，不用记 name/property</li>
        <li>Open Graph 四要素：og:title / og:description / og:image / og:url；og:image 必须绝对 URL + 放 <code>public/</code></li>
        <li>meta 同 name/property 去重，页面级覆盖全局级</li>
      </ul>
    </div>

    <!-- 课后补充问答 -->
    <div class="qa-section">
      <h3>课后补充问答</h3>
      <div class="qa-item">
        <div class="qa-q">Q：在 Demo A 输入修改后，Demo B 抓到的数据为什么不更新？</div>
        <div class="qa-a">
          <p><strong>两层原因：</strong></p>
          <ol>
            <li>Demo B 是点击「抓取」那一刻的快照，不重新点击不会变；</li>
            <li>更关键的：即使重新抓取，抓到的仍是<strong>初始值</strong>——Demo A 输入框绑定的是纯客户端 <code>ref</code>，你的修改只存在于当前浏览器 DOM 的 <code>&lt;head&gt;</code> 里；<code>$fetch('/chapters/09')</code> 触发的是一次全新 SSR，服务器从 ref 初始值重新渲染，完全不知道你改过什么。</li>
          </ol>
          <p>
            结论：客户端 <code>useHead</code> 的修改不会传回服务器，爬虫每次看到的都是「全新 SSR」的输出——
            SEO 信息必须在服务端渲染时就正确。想让 SSR 输出不同，差异必须随请求而来（URL 参数、Cookie），
            商品页靠路由参数就是这条路。这再次印证第 06/07 章的结论：<strong>SSR 是无状态的请求驱动函数</strong>。
          </p>
        </div>
      </div>
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

.demo-input {
  flex: 1;
  min-width: 240px;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
}

.demo-input:focus {
  border-color: #00dc82;
}

.demo-empty {
  padding: 32px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

.head-state {
  background: #0f172a;
  color: #e2e8f0;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
}

.head-state p {
  margin: 6px 0;
}

.head-state code {
  color: #00dc82;
  word-break: break-all;
}

.note {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.5;
}

.crawl-result {
  margin-top: 4px;
}

.crawl-title-line {
  font-size: 0.88rem;
  color: #334155;
  margin: 8px 0;
}

.crawl-title-line code {
  color: #00c474;
  background: #0f172a;
  padding: 2px 8px;
  border-radius: 4px;
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

.route-table code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  color: #be123c;
}

/* ---- Demo C ---- */
.size-btn {
  padding: 5px 14px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #475569;
  border-radius: 6px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}

.size-btn.active {
  background: #00dc82;
  color: #fff;
  border-color: #00dc82;
  font-weight: 600;
}

.open-link {
  color: #3b82f6;
  font-size: 0.82rem;
  text-decoration: none;
}

.share-result {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.og-raw {
  background: #0f172a;
  color: #e2e8f0;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: monospace;
}

.og-raw p {
  margin: 6px 0;
  word-break: break-all;
}

.og-raw code {
  color: #00dc82;
}

.preview-label {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 8px;
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

/* ---- 课后补充问答 ---- */
.qa-section {
  margin-top: 24px;
  padding: 24px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
}

.qa-section h3 {
  margin: 0 0 16px;
  color: #b45309;
}

.qa-item {
  border-top: 1px dashed #fde68a;
  padding-top: 14px;
}

.qa-item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.qa-q {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.qa-a {
  color: #334155;
  font-size: 0.9rem;
  line-height: 1.8;
}

.qa-a p {
  margin: 0 0 10px;
}

.qa-a ol {
  margin: 0 0 10px;
  padding-left: 20px;
}

.qa-a code {
  background: #fef3c7;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.85em;
  color: #b45309;
}
</style>
