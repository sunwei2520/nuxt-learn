<script setup>
// ============================================================
// 第 08 章：样式与静态资源
// assets vs public / CSS 变量 / Scoped vs CSS Modules / NuxtImage
// ============================================================

useHead({ title: '第08章 样式与静态资源' })

const chapterNum = 8
const chapterTitle = '样式与静态资源'

// ---------- Demo C：NuxtImage 对比 ----------
const imageSizes = ['160', '320', '640']
const selectedSize = ref('320')

const imgSrcset = computed(() => {
  return imageSizes.map(s => `/_ipx/w_${s}/images/demo-asset.png ${s}w`).join(', ')
})
const imgSrc = computed(() => `/_ipx/w_${selectedSize.value}/images/demo-asset.png`)

// 原生 <img> 的 src（不做任何优化）
const nativeImgSrc = '/images/demo-asset.png'

// ---------- Demo D：assets 引用路径对比 ----------
// assets 里的图片需要真实存在于 app/assets/images/ 下
// 用 import 引入后 Nuxt 会处理并返回带 hash 的 URL
// 这里先用 public 路径演示，assets 图片留作后续扩展
const assetImage = ref('/images/demo-asset.png')

// ---------- 代码示例 ----------
const dirCompareCode = `# 项目根目录
app/
  assets/            ← 构建时处理的资源（CSS、JS、图片、字体）
    css/main.css
    images/demo-asset.png   ← import 后带 hash，如 demo-asset.a1b2c3d.png
  public/            ← 原样拷贝到输出目录，不处理
    favicon.ico
    images/demo-logo.svg    ← 原样输出，URL 就是 /images/demo-logo.svg
nuxt.config.ts

# assets 里的资源（如 demo-asset.png）
#   import 后 → Nuxt 打包处理 → 加内容 hash → 浏览器可以长期缓存
#   变化 → hash 变 → 浏览器重新下载
#   适合：项目源码里用到的图片/字体/视频

# public 里的资源
#   不 import → 直接访问 /images/demo-logo.svg
#   不处理 → 永远同名 → 适合 favicon、第三方库、SEO 图片（需要固定 URL 的）`

const importCompareCode = `// 正确：import assets 里的资源 → 拿到的是带 hash 的 URL
import logoUrl from '~/assets/images/demo-asset.png'
// logoUrl = '/_nuxt/demo-asset.a1b2c3d.png'（dev 时是 /_nuxt/...）

// 引用 public 资源 → 直接写 URL
const favicon = '/favicon.ico'          // ✅ 正确
// import favicon from '~/public/favicon.ico'  // ❌ 不需要 import，public 不是源码

// 在模板里
// <img :src="logoUrl" />          ← 打包后带 hash，浏览器可缓存
// <img src="/favicon.ico" />     ← 原样输出，永远叫 favicon.ico`

const cssModuleCode = `<template>
  <!-- CSS Modules：类名编译后自动加 hash，两个组件互不干扰 -->
  <div :class="$style.card">
    <h4 :class="$style.title">标题</h4>
  </div>
</template>

<style module>
.card { padding: 16px; border: 1px solid #c7f0d9; }
.title { color: #065f46; }

/* 编译后（构建时）：
   .card_3f2a1b { padding: 16px; }
   .title_3f2a1b { color: #065f46; }
   → 另一个组件的 .card 会变成 .card_8b4c2d，不会冲突 */
</style>`

const scopedCode = `<template>
  <!-- scoped：Vue 给当前组件的元素加 data-v 属性，样式只作用于当前组件 -->
  <div class="card">
    <h4 class="title">标题</h4>
  </div>
</template>

<style scoped>
.card { padding: 16px; border: 1px solid #bfdbfe; }
.title { color: #1e40af; }

/* 编译后（构建时）：
   .card[data-v-7f3a2b] { padding: 16px; }
   .title[data-v-7f3a2b] { color: #1e40af; }
   → 其他组件没有 data-v-7f3a2b，样式不会污染 */
</style>

<!-- 穿透子组件（scoped 下想改子组件样式） -->
<style scoped>
.parent :deep(.child-class) { color: red; }
</style>`

const nuxtImageCode = `<template>
  <!-- NuxtImage：自动生成响应式 srcset + WebP -->
  <NuxtImg
    src="/images/demo-asset.png"
    width="320"
    height="240"
    sizes="sm:320px md:640px lg:960px"
    format="webp"
  />

  <!-- 生成的 HTML（dev 时）：
    <img src="/_ipx/w_320/images/demo-asset.png"
         srcset="/_ipx/w_320/images/demo-asset.png 320w,
                 /_ipx/w_640/images/demo-asset.png 640w,
                 /_ipx/w_960/images/demo-asset.png 960w"
         sizes="sm:320px md:640px lg:960px"
         width="320" height="240" />
  -->
  <!-- 浏览器根据屏幕宽度自动选 320/640/960，WebP 减少约 30% 体积 -->
</template>

<!-- 对比原生 <img> -->
<img src="/images/demo-asset.png" width="320" />
<!-- 没有 srcset → 手机也下载 320px 的 → 浪费流量 -->
<!-- 没有 WebP → PNG/JPG 大得多 -->`

const cssVarsCode = `/* app/assets/css/css-vars.css —— 设计变量（design token） */
:root {
  --primary: #00dc82;
  --text: #1e293b;
  --bg: #f8fafc;
}

[data-theme='dark'] {
  --primary: #34d399;   /* 暗色下主题色变亮 */
  --text: #e2e8f0;
  --bg: #0f172a;
}

body {
  background: var(--bg);     /* 引用变量，不是写死颜色 */
  color: var(--text);
}

/* 切换主题：给 <html> 加 data-theme="dark" 属性即可 */
/* <html data-theme="dark"> → body 自动应用暗色变量 */`
</script>

<template>
  <div class="chapter">
    <header class="chapter-header">
      <span class="chapter-badge">第 {{ chapterNum }} 章</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        <code>assets/</code> 和 <code>public/</code> 是 Nuxt 静态资源的两个出口，
        一个走构建管线（带 hash 可缓存）、一个原样输出（URL 固定）。
        CSS 有三种作用域方案（scoped / CSS Modules / 变量），图片优化用 <code>NuxtImg</code>。
      </p>
    </header>

    <!-- 知识点 1 -->
    <KnowledgePoint num="1" title="assets/ vs public/：两种静态资源">
      <p>Nuxt 把静态资源分成两类，处理方式完全不同：</p>
      <CodeBlock :code="dirCompareCode" lang="bash" title="目录对照" />
      <div class="callout">
        <strong>记忆口诀</strong>：
        <code>assets/</code> 是「源码」——需要 import、会被处理（hash、压缩、格式转换）；
        <code>public/</code> 是「服务器静态文件」——直接访问、URL 不变。
        学习项目里 <code>public/images/demo-logo.svg</code> 和 <code>public/images/demo-asset.png</code>
        都是原样拷贝，URL 固定；而 <code>app/assets/</code> 里的图片 import 后会带 hash。
      </div>
    </KnowledgePoint>

    <!-- Demo A：assets vs public -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo A：import 引用 vs 绝对路径引用</div>
      <div class="demo-body">
        <div class="compare-cols">
          <div class="compare-col">
            <div class="col-head good">assets（import 后带 hash）</div>
            <div class="col-body">
              <div class="code-preview">
                <code>import logo from '~/assets/images/demo-asset.png'</code>
              </div>
              <div class="result-preview">
                <div class="asset-placeholder">
                  <p class="note">assets 图片需要真实存在于 <code>app/assets/images/</code> 下</p>
                  <p class="note">import 后 Nuxt 会处理并返回带 hash 的 URL，如 <code>/_nuxt/demo-asset.a1b2c3d.png</code></p>
                  <p class="note">优势：内容变了 hash 变，浏览器自动重新下载 → 可以长期缓存</p>
                </div>
              </div>
            </div>
          </div>
          <div class="compare-col">
            <div class="col-head neutral">public（绝对路径，原样输出）</div>
            <div class="col-body">
              <div class="code-preview">
                <code>&lt;img src="/images/demo-asset.png" /&gt;</code>
              </div>
              <div class="result-preview">
                <img :src="nativeImgSrc" alt="public 引用" class="demo-img" />
                <p class="note">URL：<code>/images/demo-asset.png</code>（永远一样）</p>
                <p class="note">优势：URL 固定，适合 favicon、SEO 图片、第三方库</p>
              </div>
            </div>
          </div>
        </div>

        <div class="callout" style="margin-top: 14px;">
          <strong>本项目 public/images/ 下已经放了两张真实图片</strong>（PNG + SVG logo），
          直接访问 <code>/images/demo-asset.png</code> 和 <code>/images/demo-logo.svg</code> 就能看到。
          在浏览器 DevTools 的 Network 面板里比较这两种引用方式的加载行为。
        </div>
      </div>
    </div>

    <!-- 知识点 2 -->
    <KnowledgePoint num="2" title="import 引用的正确姿势">
      <CodeBlock :code="importCompareCode" lang="javascript" title="assets import vs public 直接引用" />
      <p>
        <code>~/</code> 和 <code>@/</code> 都是 Nuxt 的别名，指向 <code>srcDir</code>（本项目的 <code>app/</code>）。
        在 JS 里 import 资源时，Nuxt 会把文件路径转换成最终的 URL。
      </p>
    </KnowledgePoint>

    <!-- 知识点 3 -->
    <KnowledgePoint num="3" title="CSS 变量（Design Tokens）">
      <p>
        把所有颜色、间距、圆角定义为 CSS 变量，组件里只引用变量不写死颜色。
        切换主题时只改变量值，所有引用它的地方自动更新——这是暗色主题的标准做法。
      </p>
      <CodeBlock :code="cssVarsCode" lang="css" title="css-vars.css 变量定义" />
    </KnowledgePoint>

    <!-- Demo B：CSS 变量主题切换 -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo B：CSS 变量主题切换（ThemeSwitcher）</div>
      <div class="demo-body">
        <p class="demo-lead">
          这个 demo 用 <code>css-vars.css</code> 里的变量渲染。点按钮后给 <code>&lt;html&gt;</code> 加
          <code>data-theme="dark"</code> 属性，CSS 选择器 <code>[data-theme='dark']</code> 匹配后
          覆盖变量值，所有引用变量的元素自动切换。
        </p>
        <ThemeSwitcher />
      </div>
    </div>

    <!-- 知识点 4 -->
    <KnowledgePoint num="4" title="Scoped CSS vs CSS Modules">
      <p>两种方案都解决「样式只作用于当前组件」的问题，但机制不同：</p>
      <div class="compare-cols">
        <div class="compare-col">
          <div class="col-head neutral">Scoped CSS</div>
          <pre class="mini-code">{{ scopedCode }}</pre>
        </div>
        <div class="compare-col">
          <div class="col-head neutral">CSS Modules</div>
          <pre class="mini-code">{{ cssModuleCode }}</pre>
        </div>
      </div>
      <table class="route-table">
        <thead>
          <tr><th>维度</th><th>Scoped CSS</th><th>CSS Modules</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>标签写法</td>
            <td><code>&lt;style scoped&gt;</code></td>
            <td><code>&lt;style module&gt;</code></td>
          </tr>
          <tr>
            <td>类名引用</td>
            <td>模板直接写 <code>class="card"</code></td>
            <td>模板写 <code>:class="$style.card"</code></td>
          </tr>
          <tr>
            <td>隔离原理</td>
            <td>选择器加 <code>[data-v-xxx]</code></td>
            <td>类名编译后加 hash</td>
          </tr>
          <tr>
            <td>跨组件引用</td>
            <td><code>:deep(.child)</code></td>
            <td><code>$style</code> 是对象，可以传给子组件</td>
          </tr>
          <tr>
            <td>TS 支持</td>
            <td>不支持类型检查</td>
            <td><code>$style</code> 可以 import 类型</td>
          </tr>
          <tr>
            <td>推荐场景</td>
            <td>普通组件（简单、直观）</td>
            <td>组件库 / 需要组合类名时</td>
          </tr>
        </tbody>
      </table>
    </KnowledgePoint>

    <!-- Demo C：Scoped vs CSS Modules -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo C：Scoped vs CSS Modules（同名类不冲突）</div>
      <div class="demo-body">
        <p class="demo-lead">
          两个组件都用了 <code>.card</code>、<code>.title</code>、<code>.btn</code> 这些同名类，
          但因为一个用 scoped、一个用 CSS Modules，编译后选择器完全不同，互不干扰。
        </p>
        <div class="compare-cols">
          <div class="compare-col">
            <div class="col-head neutral">DemoScoped（scoped）</div>
            <div class="col-body">
              <DemoScoped />
            </div>
          </div>
          <div class="compare-col">
            <div class="col-head neutral">DemoModule（CSS Modules）</div>
            <div class="col-body">
              <DemoModule />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点 5 -->
    <KnowledgePoint num="5" title="图片优化：NuxtImg">
      <CodeBlock :code="nuxtImageCode" lang="vue" title="NuxtImg 自动生成 srcset + WebP" />
      <div class="callout">
        <strong>项目已安装 <code>@nuxt/image</code></strong>（在 node_modules 里），
        但 <code>nuxt.config.ts</code> 还没有在 <code>modules</code> 里注册。
        下面 Demo D 会演示 <code>NuxtImg</code> 的效果——如果没注册会降级成原生 <code>&lt;img&gt;</code>。
      </div>
    </KnowledgePoint>

    <!-- Demo D：NuxtImg -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo D：NuxtImg 响应式 srcset</div>
      <div class="demo-body">
        <p class="demo-lead">
          选择不同尺寸，看 <code>srcset</code> 属性如何变化。
          浏览器会根据屏幕宽度和 <code>sizes</code> 属性自动选最合适的图片。
        </p>
        <div class="demo-controls">
          <span class="label">选择显示尺寸：</span>
          <button
            v-for="s in imageSizes" :key="s"
            class="size-btn" :class="{ active: selectedSize === s }"
            @click="selectedSize = s"
          >
            {{ s }}px
          </button>
        </div>
        <div class="img-preview">
          <img
            :src="imgSrc"
            :srcset="imgSrcset"
            sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 960px"
            alt="NuxtImg demo"
            class="demo-img"
          />
          <div class="img-info">
            <p><strong>当前 src：</strong><code>{{ imgSrc }}</code></p>
            <p><strong>srcset：</strong><code>{{ imgSrcset }}</code></p>
          </div>
        </div>
        <div class="callout" style="margin-top: 12px;">
          <strong>手动对比</strong>：把上面 URL 里的 <code>w_320</code> 改成 <code>w_640</code>，
          浏览器会直接请求更大尺寸的图片。srcset 就是让浏览器自动做这个选择。
        </div>
      </div>
    </div>

    <!-- 知识点 6 -->
    <KnowledgePoint num="6" title="Tailwind CSS 集成">
      <p>
        项目已安装 <code>@nuxtjs/tailwindcss</code>（在 node_modules 里），
        但 <code>nuxt.config.ts</code> 的 <code>modules</code> 数组里还没有注册。
        注册后 Tailwind 的 utility class（<code>flex</code>、<code>text-center</code>、<code>p-4</code>）
        才能在组件里直接使用。
      </p>
      <CodeBlock
        :code="`export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss']
})`"
        lang="typescript"
        title="nuxt.config.ts —— 注册 Tailwind（如需启用）"
      />
      <div class="callout">
        <strong>本项目当前状态</strong>：Tailwind 已安装但未注册。
        在模板里写 <code>class="flex p-4"</code> 不会生效（类名存在但没有对应的 CSS）。
        第八章先不注册，等你在 demo 里验证过原生 CSS 方案后，再决定是否引入。
      </div>
    </KnowledgePoint>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li><code>assets/</code> = 源码（import 后处理、带 hash、可缓存）；<code>public/</code> = 静态文件（原样输出、URL 固定）</li>
        <li>JS 里 import 资源 → Nuxt 转 URL；CSS 里写 <code>url()</code> → 同样处理</li>
        <li>CSS 变量（design token）：暗色主题的标准方案，切主题 = 改变量值</li>
        <li>Scoped CSS（data-v 属性）vs CSS Modules（类名 hash）：都隔离，前者简单后者灵活</li>
        <li><code>NuxtImg</code> 自动生成响应式 <code>srcset</code> + WebP，省流量</li>
        <li>Tailwind 已安装未注册，注册后可用 utility class</li>
      </ul>
    </div>

    <!-- 课后补充问答：学习过程中的追问记录（只记录读者主动提出的疑问） -->
    <div class="qa-section">
      <h3>课后补充问答</h3>
      <div class="qa-item">
        <div class="qa-q">Q：感觉 CSS Modules 很像 CSS-in-JS？</div>
        <div class="qa-a">
          <p>
            <strong>使用姿势像，本质不同。</strong>
            两者都在代码里通过 JS 对象引用样式（<code>$style.card</code> / <code>styles.button</code>），
            编译后都生成 hash 类名做隔离。区别在三点：
          </p>
          <ol>
            <li><strong>样式载体</strong>：CSS Modules 仍是纯 CSS（写在 <code>&lt;style module&gt;</code> 里）；CSS-in-JS 的样式规则是用 JS 写的（模板字符串 / 对象）</li>
            <li><strong>JS 拿到的内容</strong>：CSS Modules 暴露的只是一张<strong>类名映射表</strong>（<code>{ card: 'card_3f2a1b' }</code>，值是字符串）；CSS-in-JS 里 JS 持有<strong>样式规则本身</strong>，所以能直接插值 JS 变量（<code>color: ${props => ...}</code>）</li>
            <li><strong>运行时成本</strong>：CSS Modules 100% 构建时处理，产物是静态 CSS 文件，浏览器端零运行时；传统 CSS-in-JS（styled-components、emotion）要在浏览器里解析并向 <code>&lt;style&gt;</code> 标签注入，有性能开销</li>
          </ol>
          <p>
            <strong>行业趋势</strong>：新一代 CSS-in-JS（vanilla-extract、Linaria、Panda CSS）全部转向「构建时抽取成静态 CSS、零运行时」，
            等于向 CSS Modules 的模型收敛；Vue 的 <code>&lt;style&gt;</code> 支持 <code>v-bind(color)</code>
            （编译成 CSS 变量绑定组件状态），把 CSS-in-JS 的动态插值优势也补上了。
            所以在 Vue 生态里，CSS Modules + CSS 变量基本覆盖 CSS-in-JS 的场景，还不用付运行时成本。
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

/* ---- 对比列 ---- */
.compare-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 16px 0;
}

.compare-col {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.col-head {
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.col-head.good {
  background: #ecfdf5;
  color: #065f46;
  border-bottom: 1px solid #c7f0d9;
}

.col-head.neutral {
  background: #f8fafc;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
}

.col-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.code-preview {
  background: #0f172a;
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-family: monospace;
}

.result-preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.demo-img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.note {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.note code {
  background: #f1f5f9;
  color: #334155;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.78em;
  font-family: monospace;
}

.mini-code {
  margin: 0;
  padding: 12px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.68rem;
  font-family: 'SF Mono', monospace;
  line-height: 1.55;
  overflow-x: auto;
  white-space: pre;
  flex: 1;
}

/* ---- Demo D ---- */
.demo-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.label {
  font-size: 0.85rem;
  color: #475569;
}

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

.img-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.img-info {
  background: #0f172a;
  color: #e2e8f0;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-family: monospace;
}

.img-info p {
  margin: 4px 0;
}

.img-info code {
  color: #00dc82;
  word-break: break-all;
}

/* ---- 表格 ---- */
.route-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
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

@media (max-width: 768px) {
  .compare-cols { grid-template-columns: 1fr; }
}
</style>
