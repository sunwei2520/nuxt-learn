// GET /api/demo/todos — 列表，支持 ?done=true 筛选
export default defineEventHandler((event) => {
  const query = getQuery(event)
  let todos = getAllTodos()

  if (query.done === 'true') todos = todos.filter(t => t.done)
  if (query.done === 'false') todos = todos.filter(t => !t.done)

  return {
    items: todos,
    total: todos.length
  }
})
