// ============================================================
// ③ 集成测试：setup({ server: true }) 启动一个真实 Nuxt 服务器，
// 然后用 $fetch 打真实 HTTP 请求 —— 测的是「接口契约」，不是 mock。
// 这是最接近线上的一层，也是最慢的一层（要等服务器就绪）。
// ============================================================
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('集成测试：真实服务器 + 真实接口', async () => {
  // 端口避开 3000（开发服务器常占），避免冲突
  await setup({ server: true, port: 3100 })

  it('商品接口：返回契约中的字段', async () => {
    const product = await $fetch<{ name: string; price: number; image: string }>(
      '/api/demo/product/1'
    )

    expect(product.name).toBe('Nuxt 4 实战指南')
    expect(product.price).toBe(79)
    expect(product.image).toMatch(/^\//) // 契约：返回站内相对路径
  })

  it('商品接口：不存在的 id 返回 404', async () => {
    await expect(
      $fetch('/api/demo/product/999')
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('错误实验接口：状态码是契约', async () => {
    await expect(
      $fetch('/api/demo/error-lab?mode=401')
    ).rejects.toMatchObject({ statusCode: 401 })

    await expect(
      $fetch('/api/demo/error-lab?mode=422')
    ).rejects.toMatchObject({ statusCode: 422 })
  })

  it('错误实验接口：正常模式返回业务数据', async () => {
    const res = await $fetch<{ ok: boolean; mode: string }>('/api/demo/error-lab?mode=ok')

    expect(res.ok).toBe(true)
    expect(res.mode).toBe('ok')
  })

  it('SSR 页面：首屏 HTML 里已包含 SEO 标题（不依赖 JS）', async () => {
    const html = await $fetch<string>('/chapters/09-demo/product/1', {
      responseType: 'text'
    })

    expect(html).toContain('<title>Nuxt 4 实战指南 - Nuxt 学习项目</title>')
    expect(html).toContain('og:title')
  })

  it('不存在的路由：返回 404 状态码', async () => {
    await expect(
      $fetch('/this-route-does-not-exist', { responseType: 'text' })
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})
