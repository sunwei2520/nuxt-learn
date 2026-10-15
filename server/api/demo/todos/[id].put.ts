// PUT /api/demo/todos/:id — 更新（部分字段）
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const todo = updateTodo(id, body)
  if (!todo) {
    throw createError({
      statusCode: 404,
      statusMessage: `Todo #${id} 不存在`
    })
  }

  return todo
})
