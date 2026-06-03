---
name: notion-second-brain-builder
description: "Build and maintain a Second Brain knowledge management system in Notion. Includes template design (Book/Academic Paper/Blog/YouTube), page restructuring, and content organization workflows. CRITICAL: Never delete existing Notion blocks without preserving content first — API has no recycle bin. Always use insert-between approach."
version: 1.0.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [notion, second-brain, knowledge-management, template, productivity]
---

# Notion Second Brain Builder

## Critical Safety Rules

**NEVER delete existing blocks without first reading and preserving their content.**
- Notion API has no recycle bin — deleted blocks return 404 permanently
- Notion UI DOES have page version history for restoration
- Always INSERT new blocks between existing ones, never delete-then-rebuild
- Before restructuring: read ALL content → save backup → plan insertions → insert only

## Four Content Templates

### 1. Book
```
📄 書籍基本資訊 | 🏷️ Tags | 📖 一句話摘要 | 🎨 整體印象
💡 Key Takeaways | ✍️ Top 3 金句 | 📒 章節摘要 | 💭 這本書如何改變了我
💬 AI 對話筆記（Toggle） | 🔗 相關資源
```

### 2. Academic Paper
```
📄 論文基本資訊（BibTeX） | 🏷️ Tags | 📖 一句話摘要 | 🎯 研究問題
🔬 方法 | 📊 關鍵發現 | 💡 與我研究的關聯 | ❓ 批判性問題
💬 AI 對話筆記（Toggle） | 💻 程式碼/數據（Toggle） | 🔗 相關資源
```

### 3. Blog / Website
```
📄 文章基本資訊 | 🏷️ Tags | 💡 核心觀點 | 📝 重點筆記
💭 我的看法 | ⚡ 可行動項目 | 💬 AI 對話筆記 | 🔗 相關資源
```

### 4. YouTube / Video
```
📄 影片基本資訊 | 🏷️ Tags | 💡 核心內容 | 📝 重點筆記（含時間戳）
❓ 問題與想法 | ⚡ 可行動項目 | 💬 AI 對話筆記 | 🔗 相關資源
```

## Unified Tags

- **研究領域**: AD、EEG、ML、Neuroimaging、Cognitive、Clinical
- **重要性**: ⭐核心引用  ⭐⭐重要參考  ⭐⭐⭐背景知識
- **狀態**: 📖待讀  📝閱讀中  ✅已完成  🔄需複習  💡有啟發
- **主題**: AM、Nested Oscillations、FOOOF、E/I Balance、Neurovascular、Cholinergic、DL、Signal Processing

## Safe Restructuring Checklist

1. Read ALL blocks recursively and save content as backup
2. Plan which new blocks to insert and where
3. Use PATCH to append new blocks (never delete originals)
4. Verify original content is intact after changes
5. If data loss occurs: use Notion UI page version history to restore

## API Gotchas

- Use `/v1/data_sources/{ds_id}/query` (not `/v1/databases/{id}/query`)
- URL UUIDs need dashes; `app.notion.com/p/` links contain share tokens
- Add 0.35s delay between API calls for rate limiting
- Read NOTION_API_KEY via binary file read, never embed in source