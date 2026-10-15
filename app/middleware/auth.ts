// auth.ts —— 命名中间件
// 页面里用 definePageMeta({ middleware: 'auth' }) 指定时才会执行
// 路径：app/middleware/auth.ts  → 名字就是文件名 'auth'
//
// 也可以手动调用：await navigateTo('/some'); await callNuxtRouteMiddleware('auth')
// 但实践中基本都是页面声明

export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()

  // 只对标记了 requiresAuth 的路由生效
  if (!to.meta.requiresAuth) return  // 放行

  if (!auth.isLoggedIn) {
    // 未登录：跳转到登录页，带上来源地址以便登录后回跳
    return navigateTo({
      path: '/chapters/07-demo/login',
      query: { redirect: to.fullPath }
    })
  }
  // 已登录：什么都不返回 = 放行
})
