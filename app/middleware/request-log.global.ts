// request-log.global.ts —— 全局中间件
// 文件名带 .global → 每个路由跳转都会自动执行，无需页面声明
// 适合做：统一日志、埋点、全局路由守卫（再内部判断哪些路由要拦截）

export default defineNuxtRouteMiddleware((to, from) => {
  // 把这次跳转记录到 useState，章节 demo 页面可以实时看到
  // 用 request-log 做 key，同一个应用实例里所有组件都能读到
  const log = useState('request-log', () => [])

  log.value.unshift({
    time: new Date().toLocaleTimeString('zh-CN'),
    from: from.fullPath || '(首次)',
    to: to.fullPath,
    matched: to.matched.length
  })

  if (log.value.length > 12) log.value.pop()
  // 不 return = 放行
})
