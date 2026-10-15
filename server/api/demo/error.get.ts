// 第04章演示用 API：模拟错误响应
// 用于演示 useFetch 的错误处理

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const type = query.type || '500'

  if (type === '404') {
    throw createError({
      statusCode: 404,
      statusMessage: '资源不存在',
      data: { hint: '这是一个 404 错误演示' }
    })
  }

  if (type === '500') {
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误',
      data: { hint: '这是一个 500 错误演示' }
    })
  }

  if (type === '422') {
    throw createError({
      statusCode: 422,
      statusMessage: '参数验证失败',
      data: { hint: '这是一个 422 错误演示' }
    })
  }

  // 默认：返回正常数据（用于演示 immediate: false 时的手动触发）
  return {
    message: '请求成功',
    timestamp: new Date().toISOString()
  }
})
