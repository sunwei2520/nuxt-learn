// 第 09 章 demo：商品详情接口
// 给「动态 SEO」页面提供数据 —— 不同商品返回不同的名称/描述/图片
const products: Record<string, { id: string; name: string; description: string; price: number; image: string }> = {
  '1': {
    id: '1',
    name: 'Nuxt 4 实战指南',
    description: '从目录约定到 SSR 部署，覆盖 Nuxt 4 全栈能力的实战教程，含 50+ 可运行示例。',
    price: 79,
    image: '/images/demo-asset.png'
  },
  '2': {
    id: '2',
    name: 'Vue 3 源码深度解析',
    description: '逐行拆解响应式系统、编译器与运行时，理解 Vue 3 的设计决策。',
    price: 99,
    image: '/images/demo-logo.svg'
  }
}

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const product = id ? products[id] : undefined

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: `商品 ${id} 不存在` })
  }
  return product
})
