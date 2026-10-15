// 反面教材：用模块级变量存「请求级」数据
//
// 服务端是单进程处理并发请求的，模块作用域只在首次导入时初始化一次，
// 之后所有请求共享同一个变量 → 请求之间会互相覆盖（cross-request state pollution）

let currentMarker = ''

export default defineEventHandler(async (event) => {
  const { marker = 'A', delay = 300 } = getQuery(event)

  currentMarker = String(marker) // ← 请求 A 写入了这里
  await new Promise(resolve => setTimeout(resolve, Number(delay)))
  // 等待期间请求 B 也写入了同一个变量，
  // 于是这里读到的可能不是自己写的值 → 数据串了

  return {
    requested: String(marker),
    readBack: currentMarker,
    leaked: currentMarker !== String(marker)
  }
})
