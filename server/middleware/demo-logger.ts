// server/middleware/ — 每个 API 请求之前都会执行（不限于 /api/）
// 这个文件只做日志记录，不拦截请求
export default defineEventHandler((event) => {
  const start = Date.now()
  const method = event.method
  const path = event.path

  // 响应后打印日志
  event.waitUntil = event.waitUntil || (() => {})
  const _end = event.node.res.end
  event.node.res.end = function (...args) {
    const duration = Date.now() - start
    console.log(`[demo-logger] ${method} ${path} ${event.node.res.statusCode} ${duration}ms`)
    return _end.apply(this, args)
  }
})
