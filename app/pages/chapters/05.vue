<script setup>
// ============================================================
// 第 05 章：服务端 API
// server/api 目录约定 / defineEventHandler / CRUD / middleware
// ============================================================

useHead({
  title: '第05章 服务端 API'
})

const chapterNum = 5
const chapterTitle = '服务端 API'

// ============================================================
// Demo: API Tester — 交互式 CRUD 测试器
// 用 $fetch（事件处理器中用 $fetch 而非 useFetch，第04章知识点）
// ============================================================
const apiLog = ref([])
const currentResponse = ref(null)
const currentStatus = ref(null)
const apiPending = ref(false)

function logReq(method, path, status, duration) {
  apiLog.value.unshift({
    time: new Date().toLocaleTimeString('zh-CN'),
    method,
    path,
    status,
    duration: `${duration}ms`
  })
  if (apiLog.value.length > 8) apiLog.value.pop()
}

async function callApi(method, path, body = null) {
  apiPending.value = true
  currentResponse.value = null
  currentStatus.value = null
  const start = Date.now()

  try {
    const opts = { method }
    if (body) {
      opts.body = JSON.stringify(body)
      opts.headers = { 'Content-Type': 'application/json' }
    }

    const res = await $fetch(path, opts)
    currentResponse.value = res
    currentStatus.value = 200
    logReq(method, path, 200, Date.now() - start)
  } catch (err) {
    currentResponse.value = err.data || err
    currentStatus.value = err.statusCode || err.status
    logReq(method, path, err.statusCode || '?', Date.now() - start)
  } finally {
    apiPending.value = false
  }
}

// 新建表单
const newTodoTitle = ref('')

function doCreate() {
  if (!newTodoTitle.value.trim()) return
  callApi('POST', '/api/demo/todos', { title: newTodoTitle.value.trim() })
  newTodoTitle.value = ''
}

// 更新表单
const updateId = ref(2)
const updateTitle = ref('')
const updateDone = ref(false)

function doUpdate() {
  const body = {}
  if (updateTitle.value.trim()) body.title = updateTitle.value.trim()
  body.done = updateDone.value
  callApi('PUT', `/api/demo/todos/${updateId.value}`, body)
}

// 删除表单
const deleteId = ref(1)

function doDelete() {
  callApi('DELETE', `/api/demo/todos/${deleteId.value}`)
}

// 获取单个
const getId = ref(1)

function doGetOne() {
  callApi('GET', `/api/demo/todos/${getId.value}`)
}

// ============================================================
// 代码示例
// ============================================================
const dirConventionCode = `server/api/
├── hello.get.ts            →  GET  /api/hello
├── posts/
│   ├── index.get.ts        →  GET  /api/posts
│   ├── index.post.ts       →  POST /api/posts  （新建）
│   ├── [id].get.ts         →  GET  /api/posts/:id
│   ├── [id].put.ts         →  PUT  /api/posts/:id  （更新）
│   └── [id].delete.ts      →  DELETE /api/posts/:id
└── demo/todos/
    ├── index.get.ts        →  GET  /api/demo/todos
    └── [id].delete.ts      →  DELETE /api/demo/todos/:id

命名规则：
1. 文件名后缀 .get / .post / .put / .patch / .delete → HTTP 方法
2. 不带后缀 → 接受所有方法（在 handler 内用 event.method 判断）
3. [param] → 路由参数（同页面路由）
4. index.ts → 目录根路径`

const handlerCode = `server/api/demo/todos/index.post.ts
export default defineEventHandler(async (event) => {
  // 1. 读取请求体
  const body = await readBody(event)
  // body = { title: "买菜", done: false }

  // 2. 验证
  if (!body?.title) {
    throw createError({
      statusCode: 422,
      statusMessage: 'title 字段必填',
      data: { field: 'title' }  // 自定义附加数据
    })
  }

  // 3. 业务逻辑
  const todo = createTodo(body.title)

  // 4. 设置状态码（默认 200，创建用 201）
  setResponseStatus(event, 201)

  return todo  // 返回值自动 JSON 序列化
})`

const requestToolsCode = `// 请求工具函数（全部由 Nitro 自动导入）

// 1. 查询参数 ?page=1&limit=10
const query = getQuery(event)
// → { page: '1', limit: '10' }（都是 string）

// 2. 路由参数 /api/posts/:id
const id = getRouterParam(event, 'id')

// 3. 请求体（POST/PUT/PATCH）
const body = await readBody(event)

// 4. 请求头
const token = getHeader(event, 'authorization')
const userAgent = getHeader(event, 'user-agent')

// 5. Cookie
const sessionId = getCookie(event, 'session')

// 6. 设置响应头
setResponseHeader(event, 'X-Custom', 'value')
setResponseHeader(event, 'Cache-Control', 'no-cache')

// 7. 设置 Cookie
setCookie(event, 'session', 'xxx', {
  httpOnly: true, maxAge: 86400
})`

const middlewareCode = `// server/middleware/auth.ts
// 放在 server/middleware/ 下的文件 → 每个 API 请求之前自动执行
// 不能返回响应（返回值被忽略），只能 throw 拦截
export default defineEventHandler((event) => {
  // 跳过公开路由
  if (event.path.startsWith('/api/public')) return

  const token = getHeader(event, 'authorization')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '需要登录'
    })
  }
  // 验证 token ...
})

// 对比页面中间件（app/middleware/）
// 页面中间件 → 在客户端路由跳转时执行，可以访问 useRoute/useStore
// 服务端中间件 → 在每个 HTTP 请求时执行，只能访问 event
// 两者完全独立，解决不同层面的问题`

const wrapperCode = `// server/utils/apiHandler.ts — 统一错误处理包装器
export function defineApiHandler(fn) {
  return defineEventHandler(async (event) => {
    try {
      return await fn(event)
    } catch (error) {
      // 统一错误格式
      if (!error.statusCode) {
        error = createError({
          statusCode: 500,
          statusMessage: '服务器内部错误',
          data: { originalError: error.message }
        })
      }
      // 记录日志
      console.error(\`[\${event.method}] \${event.path}: \${error.statusCode}\`)
      throw error  // 交给 Nuxt 的错误处理器返回客户端
    }
  })
}

// 使用：
// export default defineApiHandler(async (event) => {
//   const data = await someRiskyOperation()
//   return data
// })`
</script>

<template>
  <div class="chapter">
    <header class="chapter-header">
      <span class="chapter-badge">第 {{ chapterNum }} 章</span>
      <h1>{{ chapterTitle }}</h1>
      <p class="chapter-intro">
        Nuxt 内置 Nitro 服务端引擎。<code>server/api/</code> 目录下的每个文件自动变成一个 API 端点，
        <code>server/middleware/</code> 下的文件在每个请求前自动执行。
        本章覆盖目录约定、请求处理、CRUD 全链路和统一拦截。
      </p>
    </header>

    <!-- 知识点 1：目录约定 -->
    <KnowledgePoint num="1" title="server/api 目录约定与 HTTP 方法">
      <p>
        Nuxt 用文件名后缀直接映射 HTTP 方法，不需要在代码里判断 <code>event.method</code>：
      </p>
      <CodeBlock :code="dirConventionCode" lang="text" title="文件 → API 路由对照" />
      <div class="callout">
        <strong>对比第02章</strong>：页面路由用 <code>app/pages/</code>，API 路由用 <code>server/api/</code>。
        两套路由系统共享 <code>[param]</code> 动态参数约定，但分属不同目录，互不干扰。
      </div>
    </KnowledgePoint>

    <!-- 知识点 2：defineEventHandler -->
    <KnowledgePoint num="2" title="defineEventHandler 与请求工具函数">
      <p>
        每个 API 文件 <code>export default defineEventHandler(...)</code>，参数 <code>event</code> 是 H3 事件对象。
        Nitro 提供一系列<strong>自动导入</strong>的工具函数来读取请求信息：
      </p>
      <CodeBlock :code="requestToolsCode" lang="javascript" title="请求工具函数速查" />
    </KnowledgePoint>

    <!-- 知识点 3：CRUD 实战 -->
    <KnowledgePoint num="3" title="CRUD 全链路：POST 创建 + 错误处理">
      <p>用本项目真实的 POST 端点代码拆解完整流程：</p>
      <CodeBlock :code="handlerCode" lang="typescript" title="POST /api/demo/todos" />
    </KnowledgePoint>

    <!-- Demo: API Tester -->
    <div class="demo-box">
      <div class="demo-title">🎯 Demo：API Tester — 交互式 CRUD 测试器</div>
      <div class="api-tester">
        <!-- 左侧：操作面板 -->
        <div class="tester-controls">
          <h4>操作面板</h4>

          <!-- GET 列表 -->
          <div class="api-group">
            <div class="api-group-header">
              <span class="method-badge get">GET</span>
              <code>/api/demo/todos</code>
            </div>
            <p class="api-desc">获取全部待办，可选筛选 ?done=true</p>
            <div class="api-actions">
              <AppButton type="primary" size="small" :disabled="apiPending" @click="callApi('GET', '/api/demo/todos')">全部</AppButton>
              <AppButton type="secondary" size="small" :disabled="apiPending" @click="callApi('GET', '/api/demo/todos?done=true')">已完成</AppButton>
              <AppButton type="secondary" size="small" :disabled="apiPending" @click="callApi('GET', '/api/demo/todos?done=false')">未完成</AppButton>
            </div>
          </div>

          <!-- GET 单个 -->
          <div class="api-group">
            <div class="api-group-header">
              <span class="method-badge get">GET</span>
              <code>/api/demo/todos/:id</code>
            </div>
            <div class="api-actions">
              <input v-model.number="getId" type="number" class="api-input" placeholder="id" />
              <AppButton type="primary" size="small" :disabled="apiPending" @click="doGetOne()">查询</AppButton>
            </div>
          </div>

          <!-- POST 创建 -->
          <div class="api-group">
            <div class="api-group-header">
              <span class="method-badge post">POST</span>
              <code>/api/demo/todos</code>
            </div>
            <p class="api-desc">创建新待办，title 必填</p>
            <div class="api-actions">
              <input v-model="newTodoTitle" type="text" class="api-input" placeholder="输入待办标题" @keyup.enter="doCreate" />
              <AppButton type="primary" size="small" :disabled="apiPending || !newTodoTitle.trim()" @click="doCreate()">创建</AppButton>
            </div>
          </div>

          <!-- PUT 更新 -->
          <div class="api-group">
            <div class="api-group-header">
              <span class="method-badge put">PUT</span>
              <code>/api/demo/todos/:id</code>
            </div>
            <div class="api-actions-column">
              <div class="api-row">
                <label>id：</label>
                <input v-model.number="updateId" type="number" class="api-input small" />
              </div>
              <div class="api-row">
                <label>新标题：</label>
                <input v-model="updateTitle" type="text" class="api-input" placeholder="留空则不改" />
              </div>
              <div class="api-row">
                <label>done：</label>
                <button class="toggle-btn" :class="{ on: updateDone }" @click="updateDone = !updateDone">
                  {{ updateDone ? '✅ 已完成' : '⚪ 未完成' }}
                </button>
              </div>
              <AppButton type="primary" size="small" :disabled="apiPending" @click="doUpdate()">更新</AppButton>
            </div>
          </div>

          <!-- DELETE 删除 -->
          <div class="api-group">
            <div class="api-group-header">
              <span class="method-badge delete">DELETE</span>
              <code>/api/demo/todos/:id</code>
            </div>
            <div class="api-actions">
              <input v-model.number="deleteId" type="number" class="api-input" placeholder="id" />
              <AppButton type="danger" size="small" :disabled="apiPending" @click="doDelete()">删除</AppButton>
            </div>
          </div>
        </div>

        <!-- 右侧：响应展示 -->
        <div class="tester-result">
          <h4>
            响应结果
            <span v-if="apiPending" class="loading-badge">⏳ 请求中</span>
            <span v-else-if="currentStatus" class="status-badge" :class="{ ok: currentStatus < 400, err: currentStatus >= 400 }">
              {{ currentStatus }}
            </span>
          </h4>

          <div v-if="currentResponse !== null" class="response-body">
            <pre class="result-json">{{ JSON.stringify(currentResponse, null, 2) }}</pre>
          </div>
          <div v-else class="empty-state">
            点击左侧按钮发送请求
          </div>

          <h4 class="log-title">请求历史</h4>
          <div class="log-list">
            <div v-if="!apiLog.length" class="log-empty">暂无请求</div>
            <div v-for="(log, i) in apiLog" :key="i" class="log-item">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-method" :class="log.method.toLowerCase()">{{ log.method }}</span>
              <code class="log-path">{{ log.path }}</code>
              <span class="log-status" :class="{ ok: log.status < 400, err: log.status >= 400 }">{{ log.status }}</span>
              <span class="log-duration">{{ log.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点 4：server/middleware -->
    <KnowledgePoint num="4" title="server/middleware 统一请求处理">
      <p>
        回答你之前提的问题——「怎么对多个 API 做统一处理」。答案就是 <code>server/middleware/</code>：
      </p>
      <CodeBlock :code="middlewareCode" lang="typescript" title="服务端中间件 vs 页面中间件" />
      <div class="callout">
        <strong>本项目已安装</strong>：<code>server/middleware/demo-logger.ts</code> 正在运行。
        打开终端看 <code>npm run dev</code> 的输出，每次 API 请求都会打印一行日志：
        <code>[demo-logger] GET /api/demo/todos 200 5ms</code>
      </div>
    </KnowledgePoint>

    <!-- 知识点 5：统一错误处理 -->
    <KnowledgePoint num="5" title="统一错误处理：包装器模式">
      <p>
        除了 middleware，还有另一种统一处理方式——<strong>自定义包装器</strong>，
        把 <code>defineEventHandler</code> 包一层，在每个 handler 里统一 try/catch：
      </p>
      <CodeBlock :code="wrapperCode" lang="typescript" title="defineApiHandler 包装器" />
      <table class="route-table">
        <thead>
          <tr><th>方式</th><th>执行时机</th><th>适用场景</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>server/middleware</code></td>
            <td>所有请求之前</td>
            <td>鉴权、日志、CORS（全局拦截）</td>
          </tr>
          <tr>
            <td>包装器模式</td>
            <td>handler 执行时</td>
            <td>错误捕获、参数校验、响应格式化（按需使用）</td>
          </tr>
          <tr>
            <td><code>server/plugins</code></td>
            <td>服务启动时</td>
            <td>初始化数据库连接、注册全局钩子</td>
          </tr>
        </tbody>
      </table>
    </KnowledgePoint>

    <!-- 本章小结 -->
    <div class="chapter-summary">
      <h3>本章小结</h3>
      <ul>
        <li><code>server/api/</code> 目录即 API 路由，文件名后缀 <code>.get/.post/.put/.delete</code> 映射 HTTP 方法</li>
        <li><code>defineEventHandler</code> 是核心，<code>event</code> 参数贯穿所有请求处理</li>
        <li>请求工具：<code>getQuery</code>、<code>getRouterParam</code>、<code>readBody</code>、<code>getHeader</code>、<code>getCookie</code></li>
        <li>响应工具：<code>setResponseStatus</code>、<code>setResponseHeader</code>、<code>setCookie</code></li>
        <li><code>createError</code> 统一抛错，自动返回 JSON 错误响应</li>
        <li><code>server/middleware/</code> 全局拦截，<code>server/utils/</code> 自动导入共享逻辑</li>
        <li>事件处理器中用 <code>$fetch</code> 而非 <code>useFetch</code>（第04章知识点）</li>
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

.callout code {
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  color: #1e40af;
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

/* API Tester */
.api-tester {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 1px;
  background: #e2e8f0;
}

.tester-controls,
.tester-result {
  background: #fff;
  padding: 20px;
}

.tester-controls h4,
.tester-result h4 {
  margin: 0 0 16px;
  font-size: 0.95rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-group {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.api-group:last-child {
  border-bottom: none;
}

.api-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.method-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: monospace;
  color: #fff;
}

.method-badge.get { background: #3b82f6; }
.method-badge.post { background: #10b981; }
.method-badge.put { background: #f59e0b; }
.method-badge.delete { background: #ef4444; }

.api-group-header code {
  font-family: monospace;
  font-size: 0.82rem;
  color: #334155;
}

.api-desc {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0 0 8px;
}

.api-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.api-actions-column {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.api-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-row label {
  font-size: 0.82rem;
  color: #475569;
  min-width: 60px;
}

.api-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
}

.api-input.small {
  max-width: 80px;
}

.api-input:focus {
  border-color: #00dc82;
}

.toggle-btn {
  padding: 4px 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

.toggle-btn.on {
  background: #ecfdf5;
  border-color: #00dc82;
  color: #00dc82;
}

/* Response */
.response-body {
  margin-bottom: 16px;
}

.result-json {
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-family: 'SF Mono', monospace;
  overflow-x: auto;
  max-height: 240px;
  overflow-y: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  margin-bottom: 16px;
}

.loading-badge {
  background: #fef9c3;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
}

.status-badge {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: monospace;
}

.status-badge.ok {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.err {
  background: #fecaca;
  color: #991b1b;
}

/* Log */
.log-title {
  margin: 16px 0 8px !important;
}

.log-list {
  max-height: 180px;
  overflow-y: auto;
}

.log-empty {
  color: #94a3b8;
  font-size: 0.85rem;
  text-align: center;
  padding: 12px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.8rem;
}

.log-time {
  color: #94a3b8;
  font-family: monospace;
  min-width: 70px;
}

.log-method {
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: monospace;
  color: #fff;
  min-width: 50px;
  text-align: center;
}

.log-method.get { background: #3b82f6; }
.log-method.post { background: #10b981; }
.log-method.put { background: #f59e0b; }
.log-method.delete { background: #ef4444; }

.log-path {
  font-family: monospace;
  color: #334155;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-status {
  font-weight: 700;
  font-family: monospace;
  min-width: 30px;
  text-align: right;
}

.log-status.ok { color: #10b981; }
.log-status.err { color: #ef4444; }

.log-duration {
  color: #94a3b8;
  font-family: monospace;
  min-width: 50px;
  text-align: right;
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
  .api-tester {
    grid-template-columns: 1fr;
  }
}
</style>
