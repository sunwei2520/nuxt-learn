import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

const appDir = fileURLToPath(new URL('./app', import.meta.url))

export default defineConfig({
  // Nuxt 在编译期帮你做了「编译 SFC + 解析 ~ 别名 + 自动导入」这三件事。
  // 测试不启动 Nuxt 运行时，就要自己把这三件事补齐。
  plugins: [
    vue(),
    AutoImport({ imports: ['vue'] })
  ],
  resolve: {
    alias: { '~': appDir, '@': appDir }
  },
  test: {
    projects: [
      // ① 单元 / 组件测试：纯 happy-dom，不启动 Nuxt
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.spec.ts'],
          environment: 'happy-dom'
        }
      },
      // ② 集成测试：自己启动一台真实的 Nuxt 服务器
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.spec.ts'],
          environment: 'node',
          testTimeout: 120000,
          hookTimeout: 180000
        }
      }
    ]
  }
})
