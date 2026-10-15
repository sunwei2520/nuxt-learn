// named.ts —— 命名中间件（不会自动执行，也不会被页面声明）
// 需要手动调用：callNuxtRouteMiddleware('named')
// 适合做：可复用的跳转检查，由业务代码按需触发
//
// 命名中间件和普通中间件的区别仅在于调用方式：
// - 普通中间件 → 页面 definePageMeta 声明 → 路由框架自动执行
// - .global 中间件 → 自动全路由执行
// - 命名中间件 → 手动 callNuxtRouteMiddleware 执行

export default defineNuxtRouteMiddleware((to, from) => {
  const log = useState('named-middleware-log', () => [])
  log.value.unshift({
    time: new Date().toLocaleTimeString('zh-CN'),
    source: 'callNuxtRouteMiddleware("named")',
    to: to.fullPath
  })
  if (log.value.length > 12) log.value.pop()
})
