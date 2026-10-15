// POST /api/demo/todos — 创建，读取请求体
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.title || typeof body.title !== 'string') {
    throw createError({
      statusCode: 422,
      statusMessage: 'title 字段必填且为字符串',
      data: { field: 'title', received: body }
    })
  }

  const todo = createTodo(body.title.trim())
  setResponseStatus(event, 201)
  return todo
})
