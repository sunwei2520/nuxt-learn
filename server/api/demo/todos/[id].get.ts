// GET /api/demo/todos/:id — 单个详情
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const todo = getTodoById(id)

  if (!todo) {
    throw createError({
      statusCode: 404,
      statusMessage: `Todo #${id} 不存在`,
      data: { hint: '先 GET /api/demo/todos 查看列表' }
    })
  }

  return todo
})
