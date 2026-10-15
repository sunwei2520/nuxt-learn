// setup store 写法：用 ref / computed / function 分别充当 state / getters / actions
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  // ---------- state ----------
  const items = ref([]) // [{ id, name, price, qty }]

  // ---------- getters ----------
  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.qty, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.qty, 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  // ---------- actions ----------
  function addItem(product) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.qty++
    } else {
      items.value.push({ ...product, qty: 1 })
    }
  }

  function changeQty(id, delta) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    item.qty += delta
    if (item.qty <= 0) removeItem(id)
  }

  function removeItem(id) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function reset() {
    items.value = []
  }

  return {
    items,
    totalCount,
    totalPrice,
    isEmpty,
    addItem,
    changeQty,
    removeItem,
    reset
  }
})
