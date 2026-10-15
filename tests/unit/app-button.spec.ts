// ============================================================
// ② 组件测试：@vue/test-utils 的 mount
// AppButton 是纯展示组件（只用 props / slot / emit，不碰 Nuxt 能力），
// 所以普通 mount 就够 —— 不必启动 Nuxt 运行环境，测试更快更稳。
//
// 什么时候必须换 mountSuspended（来自 @nuxt/test-utils/runtime）？
// 组件里用了 useState / useRoute / useFetch / 自动导入的 Nuxt 组件时 ——
// 那些 API 需要一个真实的 Nuxt 上下文，普通 mount 会直接报错。
// ============================================================
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '~/components/AppButton.vue'

describe('AppButton 组件测试', () => {
  it('渲染插槽内容与默认样式类', () => {
    const wrapper = mount(AppButton, {
      slots: { default: '立即购买' }
    })

    expect(wrapper.text()).toBe('立即购买')
    expect(wrapper.classes()).toContain('btn-primary') // 默认 type
    expect(wrapper.classes()).toContain('btn-medium')  // 默认 size
  })

  it('传入 props 会改变样式类', () => {
    const wrapper = mount(AppButton, {
      props: { type: 'danger', size: 'small' }
    })

    expect(wrapper.classes()).toContain('btn-danger')
    expect(wrapper.classes()).toContain('btn-small')
  })

  it('点击时向外 emit click 事件', async () => {
    const wrapper = mount(AppButton)
    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('disabled 为 true 时按钮被禁用', () => {
    const wrapper = mount(AppButton, {
      props: { disabled: true }
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
