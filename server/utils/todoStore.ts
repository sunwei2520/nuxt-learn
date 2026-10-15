// 共享的内存数据存储（server/utils/ 下的文件会被 Nitro 自动导入）
// 生产环境应替换为数据库，这里用内存模拟

interface Todo {
  id: number
  title: string
  done: boolean
  createdAt: string
}

// 使用 globalThis 保证 HMR 时数据不丢失
const globalStore = globalThis as unknown as { __todoStore?: Todo[] }

if (!globalStore.__todoStore) {
  globalStore.__todoStore = [
    { id: 1, title: '学习 Nuxt server/api', done: true, createdAt: new Date().toISOString() },
    { id: 2, title: '掌握 defineEventHandler', done: false, createdAt: new Date().toISOString() },
    { id: 3, title: '实践 server/middleware', done: false, createdAt: new Date().toISOString() }
  ]
}

export function getAllTodos() {
  return globalStore.__todoStore!
}

export function getTodoById(id: number) {
  return globalStore.__todoStore!.find(t => t.id === id)
}

export function createTodo(title: string) {
  const todos = globalStore.__todoStore!
  const todo: Todo = {
    id: Math.max(0, ...todos.map(t => t.id)) + 1,
    title,
    done: false,
    createdAt: new Date().toISOString()
  }
  todos.push(todo)
  return todo
}

export function updateTodo(id: number, updates: Partial<Todo>) {
  const todos = globalStore.__todoStore!
  const todo = todos.find(t => t.id === id)
  if (!todo) return null
  Object.assign(todo, updates)
  return todo
}

export function deleteTodo(id: number) {
  const todos = globalStore.__todoStore!
  const idx = todos.findIndex(t => t.id === id)
  if (idx === -1) return false
  todos.splice(idx, 1)
  return true
}
