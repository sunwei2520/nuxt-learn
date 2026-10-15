---
name: feishu-wiki-publisher
description: 把本项目 app/pages/chapters/ 下的章节教程发布到飞书知识库。当用户要求把教程整理成飞书文档、同步章节到知识库或 Wiki、批量搬运章节内容时使用。不用于通用飞书文档编辑（走 lark-doc）或知识库结构管理（走 lark-wiki）。
---

# 章节教程发布到飞书知识库

把本地章节页面（app/pages/chapters/NN.vue）蒸馏成飞书知识库文档。原子操作全部使用 lark 插件的 shortcut，本 skill 只固化编排顺序与内容模板。

## 前置检查

1. `lark-cli auth status`：必须 user 身份已登录。创建知识空间只允许 `--as user`；所有写操作显式带 `--as user`。
2. 未配置时按 lark-shared 的 config init / auth login split-flow 处理，URL 必须配二维码展示。

## 发布流程

1. **知识空间**：首次 `lark-cli wiki +space-create --name '<教程名>' --as user`，把返回的 `space_id` 记下来复用；后续章节不要重复建空间。
2. **章节节点**：每章一个 `lark-cli wiki +node-create --space-id <id> --obj-type docx --title '第NN章 <标题>' --as user`，保存 `node_token` 与 `obj_token`。
3. **标题修正**：标题以章节页面里的 `chapterTitle` 为准。若建节点时标题不对，用 `lark-cli drive +update-title --url <wiki_url> --title '<正确标题>'`，禁止新建第二个节点。
4. **写入正文**：`lark-cli docs +update --doc <obj_token> --as user --command append --content '<XML>'`（空文档用 append，不用 overwrite）。XML 语法遵循 lark-doc 的 lark-doc-xml 参考。
5. **验证**：`lark-cli docs +fetch --doc <obj_token> --scope outline --max-depth 2 --as user`，确认标题层级完整，再把 wiki URL 给用户。

## 内容模板（每章统一）

1. 引言段：章节页面 `.chapter-intro` 的原文。
2. `<callout emoji="🎯" background-color="light-green">`：指向本地可运行 demo 地址 `http://localhost:3000/chapters/NN`。
3. 每个知识点一个 `<h1>`：正文 + `<pre lang="..." caption="..."><code>...</code></pre>` 代码块 + 表格。
4. `<h1>本章小结</h1>` + `<ul>`。

## .vue → XML 转换规则

- 章节页面 `<script setup>` 里的 `xxxCode` 字符串常量即代码块内容，原样取；`lang` 按内容推断（typescript / vue / text / bash）。
- 页面里的 `<table class="config-table">` 等表格转成飞书 `<table>`，表头 `background-color="light-gray"`。
- **交互 demo 不可迁移**：一律改成「文字说明效果 + 本地链接」，或 `<callout emoji="💡" background-color="light-blue">` 描述 demo 行为。
- 转义：代码和正文里的 `<` `>` `&` 必须转义（如 `&lt;script setup&gt;`）；代码必须放在 `<code>` 内，禁止直接放 `<pre>` 下。
- 页面样式（`<style scoped>`）和 demo 的交互逻辑（ref/函数）不搬运。
- 「课后补充问答」区块若存在，作为一个 `<h1>` 附加在小结前。
