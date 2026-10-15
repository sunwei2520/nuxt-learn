// 第 10 章 Demo A：运行环境自检
// 同一份代码，dev 模式和 build 后返回不同的 NODE_ENV —— 环境由「怎么跑」决定
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  return {
    nodeEnv: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV === 'development',
    side: import.meta.server ? 'server' : 'client',
    publicAppName: config.public.appName,   // 来自 runtimeConfig.public（部署时可用 NUXT_PUBLIC_APP_NAME 覆盖）
    apiSecretIsSet: !!config.apiSecret,     // 只报告存在性，不泄露值本身
    timestamp: Date.now()                   // 每次请求都是新值 → 证明接口是活代码，不是静态文件
  }
})
