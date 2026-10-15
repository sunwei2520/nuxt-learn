// ============================================================
// ① 单元测试：Pinia store 的纯逻辑
// 特点：不渲染任何东西、不起服务器 —— 最快、最稳定的一层
// 依赖：Nuxt 测试环境（'~' 别名可用），测试前手动装一个干净的 pinia 实例
// ============================================================
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '~/stores/cart'

describe('cart store 单元测试', () => {
  beforeEach(() => {
    // 每个用例开始前重置 store —— 保证用例之间互不影响
    setActivePinia(createPinia())
  })

  it('addItem：新商品入队，数量为 1', () => {
    const cart = useCartStore()
    cart.addItem({ id: '1', name: 'Nuxt 4 实战指南', price: 79 })

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].qty).toBe(1)
  })

  it('addItem：重复商品只增加数量，不新增条目', () => {
    const cart = useCartStore()
    cart.addItem({ id: '1', name: 'Nuxt 4 实战指南', price: 79 })
    cart.addItem({ id: '1', name: 'Nuxt 4 实战指南', price: 79 })

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].qty).toBe(2)
  })

  it('getters：总数量与总价随 state 自动更新', () => {
    const cart = useCartStore()
    cart.addItem({ id: '1', name: 'A', price: 79 })
    cart.addItem({ id: '2', name: 'B', price: 99 })
    cart.addItem({ id: '2', name: 'B', price: 99 }) // B 数量变 2

    expect(cart.totalCount).toBe(3)
    expect(cart.totalPrice).toBe(79 + 99 * 2)
  })

  it('changeQty：数量减到 0 时自动移除该条目', () => {
    const cart = useCartStore()
    cart.addItem({ id: '1', name: 'A', price: 79 })
    cart.changeQty('1', -1)

    expect(cart.items).toHaveLength(0)
    expect(cart.isEmpty).toBe(true)
  })

  it('changeQty：对不存在的 id 静默返回，不抛错', () => {
    const cart = useCartStore()
    expect(() => cart.changeQty('not-exist', 1)).not.toThrow()
    expect(cart.items).toHaveLength(0)
  })
})
