// 第 11 章 Demo C：在浏览器里运行测试套件
// 说明：这是教学演示 —— 服务端用 child_process 跑 vitest，把结果 JSON 返回给页面。
// 真实项目请不要把「执行测试」暴露成公开接口，只在 CI / 本地 CLI 里跑。
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

export default defineEventHandler(async () => {
  const cwd = process.cwd()
  const bin = path.join(cwd, 'node_modules', '.bin', 'vitest')
  const outFile = path.join(os.tmpdir(), `nuxt-learn-vitest-${Date.now()}.json`)

  let output = ''
  const startedAt = Date.now()
  const exitCode = await new Promise<number>((resolve) => {
    execFile(
      bin,
      ['run', '--reporter=json', `--outputFile=${outFile}`],
      { cwd, timeout: 240_000, maxBuffer: 20 * 1024 * 1024 },
      (err, stdout, stderr) => {
        output = `${stdout || ''}${stderr || ''}`
        const code = err && typeof (err as { code?: unknown }).code === 'number'
          ? (err as { code: number }).code
          : 0
        resolve(code)
      }
    )
  })

  let report: {
    success?: boolean
    numTotalTests?: number
    numPassedTests?: number
    numFailedTests?: number
    testResults?: Array<{
      name?: string
      status?: string
      assertionResults?: Array<{
        fullName?: string
        title?: string
        status?: string
        failureMessages?: string[]
      }>
    }>
  } | null = null

  try {
    report = JSON.parse(await fs.readFile(outFile, 'utf-8'))
  } catch {
    report = null
  }
  await fs.rm(outFile, { force: true })

  if (!report) {
    return {
      ok: false,
      exitCode,
      message: '没有拿到测试报告（vitest 可能在启动阶段就失败了）',
      tail: output.split('\n').filter(Boolean).slice(-12).join('\n')
    }
  }

  const files = (report.testResults || []).map((file) => {
    const cases = file.assertionResults || []
    return {
      name: file.name ? path.relative(cwd, file.name) : '(未知文件)',
      status: file.status || 'unknown',
      passed: cases.filter(c => c.status === 'passed').length,
      failed: cases.filter(c => c.status === 'failed').length,
      cases: cases.map(c => ({
        title: c.fullName || c.title || '(无名用例)',
        status: c.status || 'unknown',
        message: (c.failureMessages || []).join('\n')
      }))
    }
  })

  return {
    ok: report.success === true,
    exitCode,
    // vitest 5 的 JSON 报告不再带时间字段，这里用服务端自己测的总耗时
    duration: Date.now() - startedAt,
    total: report.numTotalTests || 0,
    passed: report.numPassedTests || 0,
    failed: report.numFailedTests || 0,
    files,
    tail: output.split('\n').filter(Boolean).slice(-6).join('\n')
  }
})
