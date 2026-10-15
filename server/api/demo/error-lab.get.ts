// 第 11 章 Demo A：错误分层实验台
// 用 ?mode=ok|404|401|422|500 切换 —— 观察不同性质错误的差别
export default defineEventHandler((event) => {
  const mode = String(getQuery(event).mode || 'ok')

  switch (mode) {
    // ---------- 正常 ----------
    case 'ok':
      return { ok: true, mode, message: '正常响应：没有错误' }

    // ---------- 预期错误：业务能解释，状态码就是给客户端的契约 ----------
    case '404':
      throw createError({
        statusCode: 404,
        statusMessage: '商品已下架',
        data: { reason: 'NOT_PUBLISHED', hint: '该商品被作者下架了' }
      })

    case '401':
      throw createError({
        statusCode: 401,
        statusMessage: '登录已失效，请重新登录'
      })

    case '422':
      throw createError({
        statusCode: 422,
        statusMessage: '参数校验失败',
        data: { fields: ['email', 'age'], detail: 'email 格式不正确' }
      })

    // ---------- 意外错误：普通异常，Nitro 兜底成 500 ----------
    // 注意：这里故意抛一个「未处理的异常」，模拟数据库连接断开这类故障。
    // 生产环境下响应里不会出现内部堆栈和错误消息 —— 细节只留在服务端日志。
    case '500':
      throw new Error('模拟故障：数据库连接超时（内部细节不应暴露给客户端）')

    default:
      throw createError({ statusCode: 400, statusMessage: `未知的 mode：${mode}` })
  }
})
