<script setup>
// ============================================================
// 第 06 章：状态管理
// useState / Pinia / SSR 下的状态同步 / 解构陷阱
// ============================================================

useHead({
  title: '第06章 状态管理'
})

const chapterNum = 6
const chapterTitle = '状态管理'

// ============================================================
// Demo C：Pinia Playground
// ============================================================
const cart = useCartStore()
const ui = useUiStore()

// 商品目录
const products = [
  { id: 1, name: 'Nuxt 入门课', price: 99 },
  { id: 2, name: 'Pinia 实战', price: 129 },
  { id: 3, name: 'Nitro 服务端', price: 159 }
]

// ❌ 直接解构：拿到的是「一次性快照」，不是响应式引用
const { totalCount: brokenCount, totalPrice: brokenPrice } = cart

// ✅ storeToRefs：保持响应式
const { totalCount: liveCount, totalPrice: livePrice } = storeToRefs(cart)

// actions 是函数，直接解构没有副作用
const { addItem, changeQty, removeItem, reset } = cart

// ============================================================
// Demo B：跨请求状态污染实测
// ============================================================
const pollutionMode = ref('bad')
const pollutionDelay = ref(300)
const pollutionResults = ref([])
const pollutionRunning = ref(false)
const pollutionError = ref('')

const leakedCount = computed(() => pollutionResults.value.filter(r => r.leaked).length)

async function runPollutionTest() {
  pollutionRunning.value = true
  pollutionResults.value = []
  pollutionError.value = ''
  const markers = ['AAA', 'BBB']
  const started = Date.now()

  try {
    const res = await Promise.all(
      markers.map(marker =>
        $fetch(`/api/demo/ssr-pollution/${pollutionMode.value}`, {
          query: { marker, delay: pollutionDelay.value }
        }).then(r => ({ ...r, ms: Date.now() - started }))
      )
    )
    pollutionResults.value = res
  } catch (err) {
    pollutionError.value = err.statusMessage || '请求失败'
  } finally {
    pollutionRunning.value = false
  }
}

// ============================================================
// 代码示例
// ============================================================
const whyStateCode = `<!-- 不用状态管理：状态提升 + 逐层传 props -->
<!-- 孙子组件要用爷爷的数据，中间所有组件都得跟着传一遍 -->
<GrandPage :keyword="keyword">
  <MidPanel :keyword="keyword">
    <DeepInput :keyword="keyword" @update="keyword = $event" />
  </MidPanel>
</GrandPage>

<!-- 用状态管理：任何层级的组件直接取，中间层不用管 -->
// DeepInput.vue
const keyword = useState('search-keyword', () => '')`

const useStateCode = `// 组件 A（任意文件、任意层级）
const search = useState('search-keyword', () => '')

// 组件 B
const search = useState('search-keyword', () => '')
// ↑ key 相同 → 拿到的是同一个 ref，改一个另一个立刻更新

// 注意：init 必须是函数，传普通值会触发诊断错误 NUXT_E7007
const bad = useState('keyword', '')      // ❌ 报错
const good = useState('keyword', () => '') // ✅`

const useStateInternalsCode = `// 精简自 node_modules/nuxt/dist/app/composables/state.js
function useState (_key, init) {
  const key = '$s' + _key                      // 内部会加 $s 前缀
  const nuxtApp = useNuxtApp()
  const state = toRef(nuxtApp.payload.state, key)  // 值挂在 payload.state 上

  if (state.value === undefined && init) {
    state.value = init()                       // 只在未初始化时执行，不会覆盖已有值
  }
  return state
}

// 两个诊断错误
// NUXT_E7009 — key 必须是字符串
// NUXT_E7007 — init 必须是函数`

const pollutionBadCode = `// server/api/demo/ssr-pollution/bad.get.ts
let currentMarker = ''   // ← 模块级变量：所有请求共享同一个变量

export default defineEventHandler(async (event) => {
  const { marker, delay = 300 } = getQuery(event)

  currentMarker = String(marker)              // 请求 A 写入
  await new Promise(r => setTimeout(r, delay))
  // 等待期间请求 B 也写入了 → 这里读到的可能不是自己写的值

  return { requested: marker, readBack: currentMarker }
})`

const pollutionGoodCode = `// server/api/demo/ssr-pollution/good.get.ts
export default defineEventHandler(async (event) => {
  const { marker, delay = 300 } = getQuery(event)

  event.context.marker = String(marker)       // ← 请求级上下文，每个请求独有
  await new Promise(r => setTimeout(r, delay))

  return { requested: marker, readBack: event.context.marker }
})`

const setupStoreCode = `// app/stores/cart.ts — setup store：像写 composable 一样写 store
export const useCartStore = defineStore('cart', () => {
  // state
  const items = ref([])

  // getters — 就是 computed
  const totalCount = computed(() =>
    items.value.reduce((sum, i) => sum + i.qty, 0)
  )
  const totalPrice = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.qty, 0)
  )

  // actions — 就是普通函数
  function addItem(product) {
    const exist = items.value.find(i => i.id === product.id)
    if (exist) exist.qty++
    else items.value.push({ ...product, qty: 1 })
  }

  return { items, totalCount, totalPrice, addItem }   // 必须 return 出去
})`

const optionsStoreCode = `// app/stores/ui.ts — options store：state / getters / actions 三段式
export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'light',
    visitCount: 0
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',        // 参数是 state
    themeLabel: (state) => state.theme === 'dark' ? '深色' : '浅色'
  },

  actions: {
    toggleTheme () {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'  // 用 this 访问 state
    }
  }
})`

const storeToRefsCode = `const cart = useCartStore()

// ❌ 直接解构：拿到的是一次性快照（普通值），store 后续变化不会再更新
const { totalCount, totalPrice } = cart

// ✅ storeToRefs：把 state / getters 转成 ref，保持响应式
const { totalCount, totalPrice } = storeToRefs(cart)

// actions 是函数，直接解构没问题（也不需要 storeToRefs 包装）
const { addItem, reset } = cart`

const piniaDirNote = `# Nuxt 4 的 srcDir 是 app/
# @pinia/nuxt 默认扫描 srcDir/stores，即 app/stores/

app/stores/
├── cart.ts    → useCartStore
├── ui.ts      → useUiStore
└── posts.ts   → usePostsStore

# 项目根目录的 stores/ 不会被扫描到。
# 如果确实要放在根目录，需要显式配置：
# nuxt.config.ts
# pinia: { storesDirs: ['../stores'] }`
</script>

<template>
  <div class="chapter">
    <header class="chapter-header">
      <span class="chapter-badge">第 {{ chapterNum }} 章</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        状态管理的核心问题只有一个：<strong>一份数据被多个组件用到时，它该放在哪</strong>。
        Nuxt 给了两条路——轻量的 <code>useState</code> 和完整的 Pinia。
        本章还会回答一个 SSR 框架独有的问题：为什么不能用模块级变量存状态。
      </p>
    </header>

    <!-- 知识点 1 -->
    <KnowledgePoint num="1" title="为什么需要状态管理">
      <p>
        组件内的 <code>ref</code> 只属于该组件实例。当两个隔了好几层的组件要共享同一份数据时，
        传统做法是「状态提升 + 逐层传 props」，中间那些组件明明用不到这份数据，也得跟着传一遍。
      </p>
      <CodeBlock :code="whyStateCode" lang="vue" title="props 逐层传递 vs 状态管理" />
      <p>
        状态管理把数据放到一个「组件树之外」的地方，任何组件按需自取。Nuxt 里有两个选择：
      </p>
      <table class="route-table">
        <thead>
          <tr><th>方案</th><th>定位</th><th>典型场景</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>useState</code></td>
            <td>Nuxt 内置，一行搞定</td>
            <td>开关、筛选条件、简单计数值</td>
          </tr>
          <tr>
            <td>Pinia</td>
            <td>独立状态层，有 actions / getters / devtools</td>
            <td>购物车、用户会话、复杂业务状态</td>
          </tr>
        </tbody>
      </table>
    </KnowledgePoint>

    <!-- 知识点 2 -->
    <KnowledgePoint num="2" title="useState — Nuxt 内置的跨组件状态">
      <p>
        用<strong>同一个 key</strong> 调用的 <code>useState</code>，返回的是同一个 ref：
      </p>
      <CodeBlock :code="useStateCode" lang="javascript" title="同一个 key = 同一份状态" />
      <p>它的内部实现比想象中简单，值其实就是挂在 Nuxt 应用的 payload 上：</p>
      <CodeBlock :code="useStateInternalsCode" lang="javascript" title="useState 的精简实现" />
      <div class="callout">
        <strong>关键点</strong>：值存在 <code>nuxtApp.payload.state</code> 上。
        服务端每个请求都有一份独立的 <code>nuxtApp</code>，所以 <code>useState</code> 天然是「请求级」的
        ——这正是它比模块级变量安全的原因，下一节实测给你看。
      </div>
    </KnowledgePoint>

    <!-- Demo A -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo A：useState 共享 vs 本地 ref 私有</div>
      <div class="demo-body">
        <div class="compare-cols">
          <div class="compare-col">
            <div class="col-head good">useState — 跨组件共享</div>
            <div class="col-body">
              <DemoSharedCounter label="组件 A" />
              <DemoSharedCounter label="组件 B" />
            </div>
            <p class="col-note">点任意一个 +1，<strong>两个数字同时变</strong>。</p>
          </div>
          <div class="compare-col">
            <div class="col-head bad">ref — 组件内私有</div>
            <div class="col-body">
              <DemoLocalCounter label="组件 A" />
              <DemoLocalCounter label="组件 B" />
            </div>
            <p class="col-note">点任意一个 +1，<strong>另一个纹丝不动</strong>。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点 3 -->
    <KnowledgePoint num="3" title="为什么不能用模块级变量存状态">
      <p>
        一个很自然的想法：既然要全局共享，那我在模块顶部写一个 <code>let count = 0</code> 不就行了？
        在纯客户端项目里可行，在 SSR 项目里会出事。
      </p>
      <p>
        原因在于服务端的运行模型：Node 进程是<strong>长期存活</strong>的，模块只在第一次 import 时初始化一次，
        之后所有并发请求<strong>共享同一份模块作用域</strong>。请求 A 写入变量、还没读完，
        请求 B 就把它覆盖了——这就是 <em>cross-request state pollution</em>（跨请求状态污染）。
      </p>
      <div class="compare-cols">
        <div class="compare-col">
          <div class="col-head bad">反面：模块级变量</div>
          <pre class="mini-code">{{ pollutionBadCode }}</pre>
        </div>
        <div class="compare-col">
          <div class="col-head good">正确：event.context</div>
          <pre class="mini-code">{{ pollutionGoodCode }}</pre>
        </div>
      </div>
      <div class="callout">
        <strong>三个层级的「请求隔离」</strong>：
        <code>event.context</code>（Nitro 请求级）→ <code>nuxtApp.payload.state</code>（Nuxt 渲染级，useState 就在这）→
        模块作用域（进程级，被所有请求共享，只适合放常量和无状态工具）。
      </div>
    </KnowledgePoint>

    <!-- Demo B -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo B：跨请求污染实测（并发打两个端点）</div>
      <div class="demo-body">
        <p class="demo-lead">
          同时发出两个请求（marker 分别为 AAA / BBB），每个请求先写入自己的值、等待一段时间、再读回。
          如果读回的值不是自己写的，就说明数据串了。
        </p>

        <div class="demo-controls">
          <div class="mode-switch">
            <button :class="{ active: pollutionMode === 'bad' }" @click="pollutionMode = 'bad'">
              bad（模块级变量）
            </button>
            <button :class="{ active: pollutionMode === 'good' }" @click="pollutionMode = 'good'">
              good（event.context）
            </button>
          </div>
          <label class="delay-label">
            等待
            <input v-model.number="pollutionDelay" type="number" min="50" max="2000" step="50" />
            ms
          </label>
          <AppButton type="primary" size="small" :disabled="pollutionRunning" @click="runPollutionTest">
            {{ pollutionRunning ? '请求中…' : '并发发起 2 个请求' }}
          </AppButton>
        </div>

        <p v-if="pollutionError" class="demo-error">{{ pollutionError }}</p>

        <table v-if="pollutionResults.length" class="pollution-table">
          <thead>
            <tr>
              <th>请求 marker</th>
              <th>读回的值</th>
              <th>结论</th>
              <th>耗时</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pollutionResults" :key="r.requested" :class="{ leaked: r.leaked }">
              <td><code>{{ r.requested }}</code></td>
              <td><code>{{ r.readBack }}</code></td>
              <td>
                <span v-if="r.leaked" class="verdict bad">串数据了</span>
                <span v-else class="verdict good">正常</span>
              </td>
              <td>{{ r.ms }}ms</td>
            </tr>
          </tbody>
        </table>

        <div v-if="pollutionResults.length" class="verdict-bar" :class="{ bad: leakedCount > 0 }">
          <template v-if="leakedCount > 0">
            ⚠️ {{ leakedCount }} / {{ pollutionResults.length }} 个请求读到了别人的数据 —— 模块级变量确实会串
          </template>
          <template v-else>
            ✅ 2 个请求各自读回自己的值，请求之间完全隔离
          </template>
        </div>

        <div v-else class="demo-empty">点击按钮发起并发请求</div>
      </div>
    </div>

    <!-- 知识点 4 -->
    <KnowledgePoint num="4" title="Pinia 集成：两种 store 写法">
      <p>
        项目已引入 <code>@pinia/nuxt</code>，并在 <code>nuxt.config.ts</code> 的 <code>modules</code> 里注册。
        Store 文件放在 <code>app/stores/</code> 下会自动导入，页面里直接写 <code>useCartStore()</code> 即可，无需 import。
      </p>
      <CodeBlock :code="piniaDirNote" lang="bash" title="store 应该放在哪" />
      <div class="callout">
        <strong>本项目踩过的坑</strong>：<code>@pinia/nuxt</code> 的默认扫描目录是
        <code>resolve(srcDir, 'stores')</code>，而 Nuxt 4 的 <code>srcDir</code> 是 <code>app/</code>，
        所以默认扫的是 <code>app/stores/</code>。原来放在项目根目录 <code>stores/</code> 的文件
        <strong>根本不会被自动导入</strong>——本项目已把 store 目录迁到 <code>app/stores/</code> 下。
      </div>

      <p>Pinia 支持两种写法，功能等价，推荐 setup 写法：</p>
      <CodeBlock :code="setupStoreCode" lang="typescript" title="写法一：setup store" />
      <CodeBlock :code="optionsStoreCode" lang="typescript" title="写法二：options store" />
    </KnowledgePoint>

    <!-- 知识点 5 -->
    <KnowledgePoint num="5" title="解构陷阱与 storeToRefs">
      <p>
        直接从 store 实例上解构出来的 state / getters 是<strong>普通值快照</strong>，会丢掉响应性。
        store 实例本身是响应式的（组件的模板里直接写 <code>cart.totalCount</code> 能实时更新），
        但解构就切断了这条链。
      </p>
      <CodeBlock :code="storeToRefsCode" lang="javascript" title="解构 store 的正确姿势" />
      <div class="callout">
        <strong>记忆方法</strong>：解构 <em>数据</em>（state / getters）要用 <code>storeToRefs</code>；
        解构 <em>方法</em>（actions）不用，因为它们本来就是函数，不涉及响应式。
      </div>
    </KnowledgePoint>

    <!-- Demo C -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo C：Pinia Playground + 解构对比</div>
      <div class="demo-body">
        <!-- 商品 + 购物车 -->
        <div class="playground">
          <div class="pg-panel">
            <h5>商品目录</h5>
            <div v-for="p in products" :key="p.id" class="pg-product">
              <span class="pg-name">{{ p.name }}</span>
              <span class="pg-price">¥{{ p.price }}</span>
              <AppButton type="primary" size="small" @click="addItem(p)">加入购物车</AppButton>
            </div>
          </div>

          <div class="pg-panel">
            <h5>
              购物车
              <span class="pg-badge">{{ cart.totalCount }} 件</span>
            </h5>
            <div v-if="cart.isEmpty" class="demo-empty tall">购物车是空的</div>
            <div v-else>
              <div v-for="item in cart.items" :key="item.id" class="pg-cart-item">
                <span class="pg-name">{{ item.name }}</span>
                <span class="pg-qty">
                  <button @click="changeQty(item.id, -1)">−</button>
                  <em>{{ item.qty }}</em>
                  <button @click="changeQty(item.id, 1)">+</button>
                </span>
                <span class="pg-subtotal">¥{{ item.price * item.qty }}</span>
                <button class="pg-remove" @click="removeItem(item.id)">删除</button>
              </div>
              <div class="pg-total">
                合计：<strong>¥{{ cart.totalPrice }}</strong>
              </div>
              <AppButton type="secondary" size="small" @click="reset()">清空购物车</AppButton>
            </div>
          </div>
        </div>

        <!-- 解构对比 -->
        <div class="compare-cols">
          <div class="compare-col">
            <div class="col-head good">storeToRefs — 响应式 ✅</div>
            <div class="col-body mono-panel">
              <div class="stat-row"><span>totalCount</span><em>{{ liveCount }}</em></div>
              <div class="stat-row"><span>totalPrice</span><em>¥{{ livePrice }}</em></div>
            </div>
            <p class="col-note">跟着购物车实时变化。</p>
          </div>
          <div class="compare-col">
            <div class="col-head bad">直接解构 — 快照 ❌</div>
            <div class="col-body mono-panel">
              <div class="stat-row"><span>totalCount</span><em>{{ brokenCount }}</em></div>
              <div class="stat-row"><span>totalPrice</span><em>¥{{ brokenPrice }}</em></div>
            </div>
            <p class="col-note">永远停在 setup 时的值，不会变。</p>
          </div>
        </div>

        <!-- options store 演示 -->
        <div class="ui-demo" :class="{ dark: ui.isDark }">
          <div class="ui-demo-head">
            <h5>第二个 store（options 写法）</h5>
            <code>useUiStore()</code>
          </div>
          <div class="ui-demo-row">
            <span>theme：<code>{{ ui.theme }}</code></span>
            <span>themeLabel（getter）：<code>{{ ui.themeLabel }}</code></span>
            <AppButton type="secondary" size="small" @click="ui.toggleTheme()">切换主题</AppButton>
          </div>
          <div class="ui-demo-row">
            <span>visitCount：<code>{{ ui.visitCount }}</code></span>
            <AppButton type="primary" size="small" @click="ui.increaseVisit()">+1（action）</AppButton>
          </div>
        </div>

        <div class="callout persist-note">
          <strong>状态的存活边界</strong>：上面这些数字，用 <NuxtLink to="/chapters/05">跳到第 05 章</NuxtLink> 再回来
          ——数据还在，因为 store 活在应用实例里。
          但按 <kbd>F5</kbd> 整页刷新后会重置：SSR 会重新创建应用实例。
          想让状态跨刷新保留，得靠持久化插件（写 localStorage 并手动恢复）。
        </div>
      </div>
    </div>

    <!-- 知识点 6 -->
    <KnowledgePoint num="6" title="选型：什么时候用哪个">
      <table class="route-table">
        <thead>
          <tr><th>场景</th><th>用什么</th><th>原因</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>只在单个组件内部用</td>
            <td><code>ref</code> / <code>reactive</code></td>
            <td>不需要跨组件，最轻</td>
          </tr>
          <tr>
            <td>几个组件共享的简单值（开关、筛选条件）</td>
            <td><code>useState</code></td>
            <td>一行搞定，自动进 SSR payload</td>
          </tr>
          <tr>
            <td>有成组 actions / getters，要用 devtools 调试</td>
            <td>Pinia store</td>
            <td>结构清晰、可调试、可扩展</td>
          </tr>
          <tr>
            <td>服务端数据（列表、详情）</td>
            <td><code>useFetch</code> / <code>useAsyncData</code></td>
            <td>自带 SSR 序列化、去重、错误处理（第 04 章）</td>
          </tr>
          <tr>
            <td>服务端数据 + 客户端派生修改</td>
            <td><code>useAsyncData</code> 取数 + Pinia 管理</td>
            <td>取数与可变状态分家，职责清楚</td>
          </tr>
        </tbody>
      </table>
      <div class="callout">
        <strong>一个常见误区</strong>：把 <code>useFetch</code> 的返回值直接塞进 Pinia，然后用 store 代替取数逻辑。
        这会让 SSR 的 payload 机制失效，也会丢掉 key 去重和错误处理——分工要清楚。
      </div>
    </KnowledgePoint>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li>状态管理解决的是「跨组件共享同一份数据」，<code>useState</code> 轻量、Pinia 完整</li>
        <li><code>useState</code> 的值存在 <code>nuxtApp.payload.state</code>（内部 key 加 <code>$s</code> 前缀），因此天然请求隔离</li>
        <li><code>useState</code> 的 <code>init</code> 必须是函数且只在未初始化时执行；key 必须是字符串</li>
        <li>服务端<strong>绝对不能</strong>用模块级变量存请求级数据，要用 <code>event.context</code></li>
        <li>Pinia store 放 <code>app/stores/</code> 才符合 Nuxt 4 的 <code>srcDir</code> 约定，根目录 <code>stores/</code> 不会被自动扫描</li>
        <li>setup store（ref/computed/function）与 options store（state/getters/actions）等价，前者更推荐</li>
        <li>解构 state/getters 必须用 <code>storeToRefs</code>，解构 actions 不用</li>
        <li>store 活在应用实例里：路由切换不丢，整页刷新会重置</li>
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
  line-height: 1.7;
}

.callout code {
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  color: #1e40af;
}

.callout kbd {
  background: #1e293b;
  color: #fff;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.78em;
}

/* ---- Demo 容器 ---- */
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

.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.mode-switch {
  display: flex;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
}

.mode-switch button {
  border: none;
  background: #fff;
  color: #475569;
  padding: 6px 14px;
  font-size: 0.82rem;
  cursor: pointer;
}

.mode-switch button.active {
  background: #00dc82;
  color: #fff;
  font-weight: 600;
}

.delay-label {
  font-size: 0.82rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
}

.delay-label input {
  width: 72px;
  padding: 5px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.82rem;
}

.demo-empty {
  padding: 36px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.88rem;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

.demo-empty.tall {
  padding: 46px 20px;
}

.demo-error {
  color: #dc2626;
  font-size: 0.85rem;
}

/* ---- 对比列 ---- */
.compare-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 16px 0 0;
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

.col-head.bad {
  background: #fef2f2;
  color: #991b1b;
  border-bottom: 1px solid #fecaca;
}

.col-body {
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flex: 1;
}

.col-note {
  margin: 0;
  padding: 8px 12px;
  border-top: 1px dashed #e2e8f0;
  font-size: 0.78rem;
  color: #64748b;
  background: #f8fafc;
}

.mono-panel {
  grid-template-columns: 1fr;
  gap: 8px;
  align-content: start;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: monospace;
  font-size: 0.82rem;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 6px;
}

.stat-row em {
  font-style: normal;
  font-weight: 700;
  color: #00dc82;
  font-size: 1rem;
}

.mini-code {
  margin: 0;
  padding: 12px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.7rem;
  font-family: 'SF Mono', monospace;
  line-height: 1.55;
  overflow-x: auto;
  white-space: pre;
  flex: 1;
}

/* ---- 污染实测表 ---- */
.pollution-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
  margin-bottom: 12px;
}

.pollution-table th {
  background: #f1f5f9;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  color: #1e293b;
}

.pollution-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.pollution-table tr.leaked td {
  background: #fef2f2;
}

.pollution-table code {
  font-family: monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}

.verdict {
  font-size: 0.76rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.verdict.bad {
  background: #fecaca;
  color: #991b1b;
}

.verdict.good {
  background: #d1fae5;
  color: #065f46;
}

.verdict-bar {
  padding: 10px 14px;
  border-radius: 8px;
  background: #ecfdf5;
  border: 1px solid #c7f0d9;
  color: #065f46;
  font-size: 0.85rem;
}

.verdict-bar.bad {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

/* ---- Pinia Playground ---- */
.playground {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.pg-panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
}

.pg-panel h5 {
  margin: 0 0 12px;
  font-size: 0.85rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pg-badge {
  background: #00dc82;
  color: #fff;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 600;
}

.pg-product {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.pg-product:last-child {
  border-bottom: none;
}

.pg-name {
  flex: 1;
  font-size: 0.85rem;
  color: #334155;
}

.pg-price,
.pg-subtotal {
  font-size: 0.82rem;
  color: #64748b;
  font-family: monospace;
  min-width: 48px;
  text-align: right;
}

.pg-cart-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.pg-qty {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pg-qty button {
  width: 22px;
  height: 22px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #475569;
  line-height: 1;
}

.pg-qty em {
  font-style: normal;
  font-family: monospace;
  min-width: 20px;
  text-align: center;
  font-size: 0.85rem;
}

.pg-remove {
  border: none;
  background: none;
  color: #ef4444;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 2px 4px;
}

.pg-total {
  padding: 10px 0;
  font-size: 0.88rem;
  color: #334155;
}

.pg-total strong {
  color: #00dc82;
  font-size: 1.05rem;
}

/* ---- ui store 演示 ---- */
.ui-demo {
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
  transition: all 0.25s;
}

.ui-demo.dark {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

.ui-demo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ui-demo-head h5 {
  margin: 0;
  font-size: 0.85rem;
}

.ui-demo-head code,
.ui-demo-row code {
  font-family: monospace;
  font-size: 0.78rem;
  background: #f1f5f9;
  color: #be123c;
  padding: 2px 6px;
  border-radius: 4px;
}

.ui-demo.dark .ui-demo-head code,
.ui-demo.dark .ui-demo-row code {
  background: #0f172a;
  color: #00dc82;
}

.ui-demo-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 0;
  font-size: 0.84rem;
  flex-wrap: wrap;
}

.persist-note {
  margin-top: 14px;
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.persist-note code {
  background: #fef3c7;
  color: #92400e;
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

@media (max-width: 768px) {
  .compare-cols,
  .playground {
    grid-template-columns: 1fr;
  }

  .col-body {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
