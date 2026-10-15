// options store 写法：state / getters / actions 三个选项对象
// 与 cart.ts 的 setup store 写法做对比，功能等价
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'light',
    visitCount: 0
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
    themeLabel: (state) => (state.theme === 'dark' ? '深色' : '浅色')
  },

  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
    },
    increaseVisit() {
      this.visitCount++
    }
  }
})
