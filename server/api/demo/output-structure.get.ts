// 第 10 章 Demo C：读取真实 .output 产物结构
// 未构建时返回提示；npm run build 后返回完整目录树（dev 模式下也能读）
import { promises as fs } from 'node:fs'
import path from 'node:path'

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default defineEventHandler(async () => {
  const outputDir = path.join(process.cwd(), '.output')
  try {
    await fs.access(outputDir)
  } catch {
    return { exists: false, hint: '.output 不存在 —— 先运行 npm run build 再来看' }
  }

  const lines: string[] = []
  async function walk(dir: string, prefix: string, depth: number) {
    if (depth > 2) return
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        lines.push(`${prefix}${e.name}/`)
        if (e.name === 'node_modules') continue // 太深，不展开
        await walk(full, prefix + '  ', depth + 1)
      } else {
        const stat = await fs.stat(full)
        lines.push(`${prefix}${e.name}  (${fmtSize(stat.size)})`)
      }
    }
  }
  await walk(outputDir, '', 0)
  return { exists: true, cwd: process.cwd(), lines }
})
