// DELETE /api/demo/todos/:id — 删除
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const deleted = deleteTodo(id)

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: `Todo #${id} 不存在`
    })
  }

  setResponseStatus(event, 204)
  return null
})
