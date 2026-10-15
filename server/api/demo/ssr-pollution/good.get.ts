// 正确做法：请求级状态挂在 event.context 上
//
// event.context 是每个请求独有的一份对象，请求结束即释放，
// 并发请求之间天然隔离

export default defineEventHandler(async (event) => {
  const { marker = 'A', delay = 300 } = getQuery(event)

  event.context.marker = String(marker) // ← 只属于当前请求
  await new Promise(resolve => setTimeout(resolve, Number(delay)))

  return {
    requested: String(marker),
    readBack: event.context.marker,
    leaked: event.context.marker !== String(marker)
  }
})
