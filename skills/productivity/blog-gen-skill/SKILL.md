---
name: blog-gen-skill
description: "Use when the user wants to integrate figures into a blog article draft, generate a polished blog post, and deploy it to a Netlify site. Triggers on: publish blog, deploy blog, integrate figures, blog post, Netlify deploy, 部落格, 發佈文章."
version: 1.1.0
author: Hermes Agent (OWL) for 朱國大醫師
license: MIT
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [blog, netlify, deploy, figures, image-integration, productivity, 部落格]
    related_skills: [project-kickoff, project-wrap-up]
---

# Blog Gen Skill：整合圖片、生成部落格文章並發佈到 Netlify

## Overview

把「研究資料夾中的 Markdown 草稿 + 散佈的圖片」變成「完整圖文整合的部落格文章」並發佈到 Netlify。

**目標站點**：`https://kidney-cognition-lab.netlify.app`
**Netlify 專案名稱**：`kidney-cognition-lab`
**Site ID**：`1c177e06-13fc-4fea-8233-ba438f9d7494`

**架構說明**：本站為 Vite/React SPA。SPA 的 `index.html` + JS bundle 由另一個 repo 的 build 流程部署。部落格文章（Markdown + 圖片）部署到 `blog/<slug>/` 路徑下，由 SPA 的客戶端路由動態載入渲染。**因此部署 blog 內容時，只需部署 `blog/` 資料夾，不可覆蓋根目錄的 SPA 檔案。**

---

## Session Reference

`references/multi-agent-tdcs-image-mapping.md` — figure-to-placement mapping for the multi-agent tDCS pipeline blog post, reusable for future similar posts.

## When to Use

**使用時機**：
- 有一份 Markdown 文章草稿和 `figures/` 資料夾
- 需要把圖片整合到文章中並發佈到 Netlify
- 需要建立新的部落格文章頁面
- 需要更新已發佈的文章（重新部署）

**不使用時機**：
- 純文字文章（無圖片）→ 直接用 `netlify deploy`
- 需要修改 SPA 本身 → 從 SPA 的 repo 部署

---

## 前置條件

### 1. Netlify CLI

```bash
npm install -g netlify-cli   # 一次性
netlify --version            # 驗證
```

### 2. Netlify 認證

```bash
netlify login               # 一次性
netlify status              # 驗證已登入
```

### 3. 專案連結

```bash
netlify sites:list                              # 列出所有專案
netlify link --name kidney-cognition-lab        # 連結（每個 repo 一次）
```

---

## Step-by-Step 工作流程

### Step 1：分析資料夾結構

掃描工作目錄，確認文章草稿和圖片：

```bash
ls -la figures/              # 列出所有圖片
head -20 blog_<topic>.md     # 確認 frontmatter
```

**關鍵檢查**：
- `figures/` 中的圖片檔案（PNG、JPG、SVG）
- 文章草稿的 frontmatter（title、date、category、tags、cover）
- 文章中現有的 `<img>` 標籤（如果有）

### Step 2：建立 Blog 資料夾結構

根據 frontmatter 的 `cover` 路徑提取 slug：

```bash
# cover: "blog/multi-agent-tdcs/cover.png" → slug = "multi-agent-tdcs"
mkdir -p "blog/<slug>"
```

**路徑慣例**：
```
blog/<slug>/
├── index.md                              # 文章本體
├── cover.png                             # 封面圖
├── <figure_name>.png                     # 內文圖片
├── <figure_name>.svg                     # SVG 向量圖
└── architecture.svg                      # 架構圖（如需要）
```

### Step 3：複製封面圖

封面圖通常是 `figures/` 中檔名包含 `cover` 或 `blog-cover` 的圖片：

```python
import shutil
shutil.copy2("figures/blog-cover-xxx.png", "blog/<slug>/cover.png")
```

**選擇優先順序**：
1. 檔名包含 `cover` 或 `blog-cover`
2. 最大的 PNG 檔案
3. 使用者指定

### Step 4：複製所有內文圖片

**⚠️ 重要**：Windows 路徑中的 `&` 符號會導致 bash 指令失敗。**必須使用 Python**：

```python
import shutil, os

src_dir = r"D:\path\to\figures"
dst_dir = r"D:\path\to\blog\<slug>"

skip = {"blog-cover-xxx.png"}  # 已複製的封面圖
for f in sorted(os.listdir(src_dir)):
    src = os.path.join(src_dir, f)
    dst = os.path.join(dst_dir, f)
    if os.path.isfile(src) and f not in skip:
        shutil.copy2(src, dst)
        print(f"  {f} ({os.path.getsize(dst):,} bytes)")
```

### Step 5：更新文章嵌入圖片

在文章 Markdown 的適當位置插入 `<figure>` 標籤：

```markdown
<figure>
  <img src="blog/<slug>/<figure_name>.png" alt="描述" onerror="this.parentElement.style.display='none'">
  <figcaption>圖片標題與說明。</figcaption>
</figure>
```

**嵌入位置規則**：
| 圖片類型 | 文章位置 | 範例 |
|----------|----------|------|
| 封面圖 | `<article>` 第一個 `<p>` 之後 | cover.png |
| 管線架構圖 | 「架構設計」section 表格之後 | pipeline-architecture.png |
| 模型示意圖 | 對應 Agent 說明的公式之後 | nmm-schematic.png |
| 模擬曲線 | 「關鍵發現」段落之後 | atr_simulation.png |
| 頻譜/熱圖 | 模擬結果段落之後 | fig1_spectra.png |
| 博弈論分析 | Game Theory 段落之後 | game_theory.png |
| 動態相圖 | Co-Adaptation 段落之后 | co-adaptation-dynamics.png |
| 試驗設計 | 臨床試驗 section | trial_design.svg |
| 時程圖 | 「整合與發表」section | timeline.png |

**⚠️ `onerror` 處理**：所有 `<img>` 都必須包含 `onerror="this.parentElement.style.display='none'"`，圖片路徑錯誤時隱藏整個 `<figure>` 而非顯示破圖。

### Step 6：複製文章到 Blog 資料夾

```python
import shutil
shutil.copy2("blog_<topic>.md", "blog/<slug>/index.md")
```

### Step 7：部署到 Netlify

```bash
# 確認在正確目錄
cd "/d/path/to/project"

# 確認已連結
netlify status

# 部署（只上傳變更的檔案）
netlify deploy --prod --dir .
```

**成功指標**：
- `✔ Deploy is live!`
- `Production URL: https://kidney-cognition-lab.netlify.app`

### Step 8：驗證

訪問 `https://kidney-cognition-lab.netlify.app/blog/<slug>` 確認：
- [ ] 文章正確渲染
- [ ] 封面圖顯示
- [ ] 所有內文圖片顯示（無破圖）
- [ ] 表格、程式碼區塊正確
- [ ] 首頁文章列表出現新文章

---

## 部落格文章格式規範

### Frontmatter（YAML）

```yaml
---
title: "文章標題"
date: "2026-06-05"
category: "認知神經科學筆記"
tags: ["Tag1", "Tag2"]
excerpt: "簡短描述，用於文章列表"
cover: "blog/<slug>/cover.png"
---
```

### HTML 結構

文章使用 Markdown + HTML 混合格式。必要元素：

```html
<header class="blog-header">
  <div class="blog-meta">
    <span class="badge">分類</span>
    <span class="date">YYYY / MM / DD</span>
  </div>
  <h1>標題</h1>
  <p class="lead">引言</p>
  <div class="author-line">
    <span>作者</span>
    <span class="sep">·</span>
    <span>單位</span>
  </div>
  <div class="tag-list">
    <span class="tag">Tag1</span>
  </div>
</header>

<article>
  <!-- 文章內容（Markdown + <figure> 圖片） -->
</article>
```

### 特殊 CSS 類別

- `.callout.callout-info` — 藍色資訊框
- `.callout.callout-warning` — 黃色警告框
- `.formula` — 數學公式區塊

---

## 踩過的坑與解決方案

### 坑 1：Windows 路徑中的 `&` 符號

**症狀**：`cd "D:\computational neuroscience & brain stimulation"` 失敗，bash 把 `&` 當背景執行。

**解法**：使用 Python 處理路徑，避免 bash 解析：

```python
import os, shutil
src = os.path.join(r"D:\computational neuroscience & brain stimulation", "figures")
```

### 坑 2：Netlify deploy 覆蓋了 SPA 的 index.html

**症狀**：部署後首頁變 404，因為 `netlify deploy --dir .` 上傳了整個資料夾，但專案根目錄沒有 SPA 的 `index.html`。

**原因**：本站的 SPA 由另一個 repo 的 Vite build 部署。研究資料夾只有 blog 內容，沒有 SPA 檔案。

**解法**：
1. 用 `netlify api rollbackSiteDeploy` 回滾到上一個 deploy
2. 未來只部署有 SPA 的 repo，或確保 `netlify deploy` 的目標目錄包含 SPA 檔案
3. 如果只需要更新 blog 內容，確認 SPA 的 `index.html` 不被覆蓋

```bash
# 回滾指令
netlify api rollbackSiteDeploy --data "{\"site_id\":\"1c177e06-13fc-4fea-8233-ba438f9d7494\"}"
```

### 坑 3：Netlify CLI 未安裝

```bash
npm install -g netlify-cli
```

### 坑 4：Netlify 專案未連結

```bash
netlify link --name kidney-cognition-lab
```

### 坑 5：圖片路徑錯誤導致 404

**解法**：
- 確認 `blog/<slug>/` 中的檔名與文章 `src` 路徑完全一致
- 使用 `onerror` 隱藏破圖
- 部署後用瀏覽器 DevTools → Network 檢查

### 坑 6：SVG 檔案

SVG 可直接用 `<img src="...svg">` 嵌入，Netlify 會正確提供 MIME 類型。

### 坑 7：部署後瀏覽器快取

使用無痕模式驗證，或在 URL 後加 `?v=2`。

---

## 快速參考

```bash
# 安裝（一次性）
npm install -g netlify-cli

# 登入（一次性）
netlify login

# 連結（每個 repo 一次）
netlify link --name kidney-cognition-lab

# 部署
netlify deploy --prod --dir .

# 回滾（如果部署損壞了 SPA）
netlify api rollbackSiteDeploy --data "{\"site_id\":\"1c177e06-13fc-4fea-8233-ba438f9d7494\"}"
```

---

## 檔案結構

```
project-root/
├── .netlify/state.json          # Netlify 連結資訊（自動生成）
├── netlify.toml                 # Netlify 設定
├── blog/                        # 部落格文章根目錄
│   └── <slug>/
│       ├── index.md             # 文章本體
│       ├── cover.png            # 封面圖
│       ├── figure1.png          # 內文圖片
│       └── diagram.svg          # SVG
├── figures/                     # 原始圖片（來源）
│   ├── atr_simulation.png
│   ├── blog-cover-*.png
│   └── ...
└── blog_<topic>.md              # 文章草稿（來源）
```
