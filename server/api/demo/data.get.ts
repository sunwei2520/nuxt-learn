// 第04章演示用 API：返回带时间戳的数据，支持延迟和数量控制
// 用于演示 useFetch 的 SSR 数据流、loading 状态、refresh 行为

let requestCount = 0

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const delay = Number(query.delay) || 0
  const count = Number(query.count) || 3

  // 模拟网络延迟
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  requestCount++

  const items = Array.from({ length: count }, (_, i) => ({
    id: requestCount * 100 + i,
    title: `数据项 #${requestCount}-${i + 1}`,
    fetchedAt: new Date().toISOString(),
    serverSide: import.meta.server
  }))

  return {
    items,
    meta: {
      requestCount,
      serverRendered: import.meta.server,
      timestamp: new Date().toISOString(),
      delay: delay
    }
  }
})
