# Multi-Agent 研究架構：Closed-Loop Brain Stimulation 臨床驗證

## 架構總覽

```
╔══════════════════════════════════════════════════════════════════════════╗
║                        ORCHESTRATOR (研究總指揮)                         ║
║                   角色：計畫主持人 (PI) 的 AI 助理                        ║
║  職責：協調各 sub-agent、整合研究成果、時程管控、資源分配                   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    ║
║  │  Agent 1    │  │  Agent 2    │  │  Agent 3    │  │  Agent 4    │    ║
║  │ 計算神經科學 │  │ 模擬與建模   │  │ 資料分析    │  │ 臨床驗證    │    ║
║  │ (Stage 1)   │  │ (Stage 2)   │  │ (Stage 3)   │  │ (Stage 4)   │    ║
║  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    ║
║         │                │                │                │            ║
║         └────────────────┴────────────────┴────────────────┘            ║
║                           ↓ 研究成果匯整 ↓                               ║
║                    ┌─────────────────────────┐                          ║
║                    │  Agent 5: 整合與發表     │                          ║
║                    │  (Synthesis & Writing)   │                          ║
║                    └─────────────────────────┘                          ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │  Agent 6: 文獻守門員 (Literature Gatekeeper)                      │   ║
║  │  貫穿所有 Stage 的文獻搜尋、品質評估、知識庫維護                    │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 各 Sub-Agent 詳細分工

### Agent 0: ORCHESTRATOR（研究總指揮）

```
角色定位：等同於計畫主持人 (PI) 的首席助理

核心職責：
1. 研究藍圖管理
   - 維護整體研究時程（Gantt chart）
   - 追蹤各 Stage 的里程碑達成狀況
   - 識別瓶頸並重新分配資源

2. 跨 Agent 協調
   - 確保 Stage 間的產出交接順暢
   - 解決 Agent 間的依賴衝突
   - 召開虛擬「lab meeting」（彙整各 Agent 進度）

3. 品質管控
   - 審核各 Agent 的產出是否符合研究標準
   - 確保方法學的一致性
   - 維護研究紀錄的完整性

4. 溝通介面
   - 向人類研究者（您）定期報告進度
   - 將您的決策轉化為各 Agent 的任務指令
   - 管理研究知識庫（Notion）

工具需求：kanban_*, memory, notion skill, session_search
```

---

### Agent 1: 計算神經科學家（Stage 1）

```
角色定位：計算神經科學博士後研究員

核心職責：
1. 神經迴路建模
   - 文獻回顧：目標疾病（失智症/AD）的神經迴路異常
   - 建立 neural mass model 或 spiking neural network model
   - 參數化正常 vs. 疾病狀態的神經動態

2. 刺激機制分析
   - 模擬 tDCS/TMS 對目標迴路的電場分布
   - 分析 stimulation 對神經振盪的影響
   - 預測最佳刺激目標區域與參數

3. 假說形成
   - 產生可計算的假說
   - 定義可測量的神經動態指標（biomarker）
   - 設計 falsification criteria

具體任務清單：
□ 1.1 系統性文獻回顧（EEG 異常、神經迴路、stimulation 研究）
□ 1.2 建立 baseline 神經動態模型
□ 1.3 建立疾病狀態模型（parameter fitting）
□ 1.4 模擬 stimulation 介入效果
□ 1.5 產生可測試假說清單
□ 1.6 撰寫 Stage 1 技術報告

產出格式：
- 模型程式碼（Python/NEURON/TheVirtualBrain）
- 模型參數文件
- 假說清單（含 falsification criteria）
- 技術報告（Markdown）

工具需求：web_search, arxiv, execute_code, write_file, skill_view(mlops/*)
```

---

### Agent 2: 模擬與建模專家（Stage 2）

```
角色定位：計算建模與模擬工程師

核心職責：
1. 模型驗證與模擬
   - 驗證 Agent 1 的模型是否能重現已知實驗現象
   - 參數敏感性分析（sensitivity analysis）
   - 不確定性量化（uncertainty quantification）

2. Closed-loop 策略模擬
   - 實作 EEG-triggered stimulation 的模擬環境
   - 測試不同觸發閾值的效果
   - 整合 game-theoretic 框架（Madduri et al.）進行參數優化

3. 預測生成
   - 生成 stimulation 參數-效果預測曲線
   - 模擬個體差異的影響
   - 預測最佳參數組合與預期效果範圍

具體任務清單：
□ 2.1 模型驗證（重現已知文獻結果）
□ 2.2 全域敏感性分析（Sobol indices 或 Morris method）
□ 2.3 建立 closed-loop stimulation 模擬環境
□ 2.4 實作 EEG 觸發邏輯（binary / graded / adaptive）
□ 2.5 整合 game-theoretic optimization
□ 2.6 系統性參數掃描（grid search / Bayesian optimization）
□ 2.7 生成預測報告與參數建議

產出格式：
- 模擬程式碼（Python）
- 參數掃描結果（CSV + 視覺化）
- 預測報告（含 confidence interval）
- 推薦的臨床刺激參數方案

工具需求：execute_code, write_file, read_file, web_search
```

---

### Agent 3: 資料分析師（Stage 3）

```
角色定位：臨床資料分析師 / 生物統計學家

核心職責：
1. 資料管理
   - 建立臨床資料庫（EEG + 行為 + 臨床評估）
   - 資料清理與品質管控
   - 去識別化與倫理合規

2. 回顧性分析
   - 分析現有 tDCS/TMS 治療個案的 EEG 資料
   - 應用 Agent 1 的模型分析神經動態變化
   - 使用 encoder estimation（Madduri et al.）分析治療適應動態

3. 統計驗證
   - 驗證 Stage 2 的預測是否與實際資料吻合
   - 次群體分析（subgroup analysis）
   - 建立 patient stratification 模型

具體任務清單：
□ 3.1 資料庫建置（schema design, data dictionary）
□ 3.2 EEG 資料前處理管線（filtering, artifact rejection, epoching）
□ 3.3 神經動態指標提取（頻譜功率、功能連接、複雜度）
□ 3.4 Encoder estimation 分析（feed-forward/feedback 分離）
□ 3.5 治療前後比較（paired statistics, effect size）
□ 3.6 個體差異分析（correlates of response）
□ 3.7 模型預測 vs. 實際資料比較報告

產出格式：
- 分析程式碼（Python/MNE-Python）
- 統計報告（含效果量與信賴區間）
- 資料視覺化圖表
- 模型修正建議（feedback to Agent 1 & 2）

工具需求：execute_code, write_file, read_file, web_search
```

---

### Agent 4: 臨床研究員（Stage 4）

```
角色定位：臨床試驗主持人（PI）的研究助理

核心職責：
1. 試驗設計
   - 撰寫臨床試驗方案（protocol）
   - 樣本數估算（power analysis）
   - IRB 申請文件準備

2. 實驗執行規劃
   - 受試者招募與篩選流程
   - 實驗流程設計（within-subjects, counterbalancing）
   - 安全性監測計畫

3. 結果評估
   - 主要/次要指標的測量時程
   - 長期追蹤計畫
   - 資料鎖定與分析計畫

具體任務清單：
□ 4.1 撰寫臨床試驗方案（參考 CONSORT 聲明）
□ 4.2 樣本數估算（基於 Stage 3 的效果量估計）
□ 4.3 受試者招募標準（inclusion/exclusion criteria）
□ 4.4 實驗流程設計（sessions, washout, blinding）
□ 4.5 安全性監測計畫（DSMB, stopping rules）
□ 4.6 量測工具選擇（認知評估、EEG、生活功能）
□ 4.7 資料管理計畫（CRF design, data locking）
□ 4.8 前瞻性試驗執行與資料收集
□ 4.9 結果分析與報告

產出格式：
- 試驗方案文件（protocol）
- IRB 申請文件
- 受試者流程圖（CONSORT flow diagram）
- 安全性報告
- 臨床試驗結果報告

工具需求：web_search, arxiv, write_file, notion skill
```

---

### Agent 5: 整合與發表專家

```
角色定位：科學寫作者 / 計畫統籌者

核心職責：
1. 研究整合
   - 整合所有 Stage 的發現
   - 建立統一的敘事框架
   - 識別跨 Stage 的洞察

2. 論文撰寫
   - 撰寫研究論文（manuscript）
   - 製作圖表與補充資料
   - 回應 reviewer 意見

3. 知識管理
   - 維護研究知識庫（Notion）
   - 建立標準作業流程（SOP）
   - 研究資料的長期歸檔

具體任務清單：
□ 5.1 整合所有 Stage 產出，建立研究敘事
□ 5.2 撰寫研究論文初稿
□ 5.3 製作 publication-quality 圖表
□ 5.4 撰寫補充材料（supplementary materials）
□ 5.5 選擇目標期刊並調整格式
□ 5.6 回應模擬 reviewer 意見
□ 5.7 維護 Notion 研究知識庫
□ 5.8 建立 SOP 文件

產出格式：
- 研究論文（Markdown → LaTeX/Word）
- 圖表（matplotlib/ggplot2 → PDF/SVG）
- Notion 知識庫頁面
- SOP 文件

工具需求：write_file, read_file, notion skill, web_search, arxiv
```

---

### Agent 6: 文獻守門員（貫穿所有 Stage）

```
角色定位：系統性文獻回顧專家

核心職責：
1. 持續文獻監控
   - 設定關鍵字 alert（PubMed, arXiv, Google Scholar）
   - 每週文獻掃描與摘要
   - 維護 Zotero / Notion 文獻庫

2. 方法學品質評估
   - 評估新文獻的方法學品質
   - 與目前研究的方法學比較
   - 識別需要調整研究方向的新證據

3. 知識庫維護
   - 更新研究背景與動機
   - 維護 reference database
   - 撰寫文獻回顧章節

具體任務清單：
□ 6.1 建立文獻搜尋策略（PICO framework）
□ 6.2 設定自動化文獻 alert
□ 6.3 每週文獻掃描報告
□ 6.4 重要文獻深度摘要
□ 6.5 方法學品質評估（risk of bias）
□ 6.6 更新 Notion 文獻庫
□ 6.7 撰寫系統性回顧（如需）

產出格式：
- 每週文獻掃描報告
- 重要文獻摘要卡（Notion database）
- 方法學品質評估表
- 文獻回顧章節草稿

工具需求：web_search, arxiv, write_file, notion skill
```

---

## Agent 間的依賴關係與資料流

```
                    ┌──────────────────────────────────────┐
                    │         Agent 6: 文獻守門員            │
                    │   (為所有 Agent 提供文獻支援)           │
                    └──────────┬──────────┬──────────┬─────┘
                               │          │          │
                    ┌──────────▼──┐  ┌─────▼────┐  ┌─▼──────────┐
                    │  Agent 1    │  │  Agent 2  │  │  Agent 3   │
                    │ 計算神經科學 │→│ 模擬建模  │→│ 資料分析   │
                    │  (Stage 1)  │  │ (Stage 2) │  │ (Stage 3)  │
                    └─────────────┘  └──────────┘  └─────┬──────┘
                                                          │
                    ┌─────────────────────────────────────┘
                    │
                    ▼
              ┌──────────────┐      ┌──────────────┐
              │  Agent 4     │      │  Agent 5     │
              │ 臨床驗證     │─────→│ 整合與發表   │
              │ (Stage 4)    │      │              │
              └──────────────┘      └──────────────┘

資料流說明：
1. Agent 1 → Agent 2：神經模型 + 參數 + 假說
2. Agent 2 → Agent 3：預測結果 + 預期效果範圍
3. Agent 3 → Agent 4：回顧性分析結果 + 修正後參數建議
4. Agent 3 → Agent 1：模型修正建議（feedback loop）
5. Agent 4 → Agent 5：臨床試驗結果
6. Agent 6 → All：文獻更新 + 方法學建議
7. Agent 0 ↔ All：協調 + 品質管控
```

---

## 執行時程規劃

```
月份    | M1-2  | M3-4  | M5-6  | M7-8  | M9-10 | M11-12| M13-14| M15-16|
────────|-------|-------|-------|-------|-------|-------|-------|-------|
Agent 1 | ██████| ██████|       |       |       |       | 修正  |       |
Agent 2 |       | ██████| ██████| ██████|       |       | 修正  |       |
Agent 3 |       |       | ██████| ██████| ██████|       | 修正  |       |
Agent 4 |       |       |       | ██████| ██████| ██████| ██████| ██████|
Agent 5 |       |       |       |       | ██████| ██████| ██████| ██████|
Agent 6 | ██████| ██████| ██████| ██████| ██████| ██████| ██████| ██████|
Agent 0 | ██████| ██████| ██████| ██████| ██████| ██████| ██████| ██████|

里程碑：
M2  - 模型建立完成，假說清單確認
M4  - 模擬環境完成，初步預測生成
M6  - 回顧性分析完成，模型修正
M8  - 試驗方案定稿，IRB 送審
M10 - 受試者招募開始
M12 - 資料收集 50%
M14 - 資料收集完成，初步分析
M16 - 論文初稿完成
```

---

## 各 Agent 的 Prompt 模板

### Agent 1 Prompt 模板

```
你是一位計算神經科學專家，專精於神經迴路建模與非侵入性腦刺激研究。

你的任務是建立 [目標疾病] 的神經動態模型，並預測 closed-loop brain stimulation 的治療效果。

背景資訊：
- 目標疾病：[阿茲海默症 / 輕度認知障礙]
- 目標迴路：[frontoparietal control network / default mode network]
- 刺激方式：[tDCS / TMS / tACS]
- 生物標記：[EEG theta/alpha 功率、功能連接、相位振幅耦合]

請執行以下步驟：

步驟 1：文獻回顧
- 搜尋近 5 年關於 [目標疾病] 神經迴路異常的研究
- 整理已知的 EEG 生物標記
- 回顧現有 stimulation 研究的方法學與發現

步驟 2：模型建立
- 選擇適當的計算模型（neural mass / spiking / mean-field）
- 參數化正常與疾病狀態
- 驗證模型能重現已知的實驗現象

步驟 3：刺激模擬
- 模擬 [刺激方式] 對目標迴路的影響
- 分析不同參數（強度、頻率、時長）的效果
- 預測最佳刺激參數

步驟 4：假說生成
- 產生 3-5 個可測試的假說
- 每個假說包含：預測、測量指標、falsification criteria
- 定義 closed-loop 的觸發條件

產出要求：
- 模型程式碼（Python）
- 模型參數與驗證報告
- 假說清單
- 技術報告（Markdown 格式）
```

### Agent 2 Prompt 模板

```
你是一位計算建模與模擬專家，專精於 closed-loop 控制系統與 optimization。

你的任務是驗證並擴展 Agent 1 建立的神經模型，並模擬 closed-loop stimulation 策略。

輸入：
- Agent 1 的神經動態模型
- Agent 1 的假說清單
- 目標：優化 closed-loop stimulation 參數

請執行以下步驟：

步驟 1：模型驗證
- 重現 Agent 1 的關鍵結果
- 執行參數敏感性分析（Sobol indices）
- 不確定性量化（Monte Carlo simulation）

步驟 2：Closed-loop 環境建置
- 建立 real-time EEG processing 模擬
- 實作多種觸發策略：
  a. Binary threshold（基於單一 EEG 特徵）
  b. Graded（基於多特徵綜合評分）
  c. Adaptive（基於 game-theoretic 框架）
- 模擬系統延遲與雜訊

步驟 3：參數優化
- 使用 Bayesian optimization 搜尋最佳參數
- 測試不同 learning rate 的影響（參考 Madduri et al.）
- 分析收斂性與穩定性

步驟 4：預測報告
- 生成參數-效果預測曲線
- 模擬個體差異的影響
- 提供臨床試驗的參數建議範圍

產出要求：
- 模擬程式碼（Python）
- 參數掃描結果（CSV + 圖表）
- 預測報告（含 confidence interval）
- 推薦的臨床參數方案
```

### Agent 3 Prompt 模板

```
你是一位臨床資料分析師，專精於 EEG 訊號處理與統計分析。

你的任務是分析現有臨床資料，驗證計算模型的預測，並為前瞻性試驗提供參數建議。

輸入：
- Agent 2 的預測結果
- 臨床 EEG 資料（治療前後）
- 認知評估資料

請執行以下步驟：

步驟 1：資料前處理
- EEG 清理（filtering, artifact rejection, re-referencing）
- 頻譜分析（FFT, wavelet）
- 功能連接分析（coherence, PLV, wPLI）
- 源定位（如適用）

步驟 2：Encoder Estimation
- 使用 Madduri et al. 的方法估計 patient encoder
- 分析治療前後的 encoder 變化
- 量化 feed-forward 與 feedback 成分的變化

步驟 3：統計分析
- 治療前後比較（paired t-test / Wilcoxon）
- 效果量計算（Cohen's d）
- 相關分析（EEG 變化 vs. 認知變化）
- 次群體分析（responder vs. non-responder）

步驟 4：模型驗證
- 比較實際資料與 Agent 2 的預測
- 計算預測準確率
- 提出模型修正建議

產出要求：
- 分析程式碼（Python/MNE-Python）
- 統計報告
- 資料視覺化
- 模型修正建議（feedback to Agent 1 & 2）
```

### Agent 4 Prompt 模板

```
你是一位臨床研究員，專精於臨床試驗設計與執行。

你的任務是設計並執行前瞻性臨床試驗，驗證 closed-loop brain stimulation 的治療效果。

輸入：
- Agent 3 的回顧性分析結果
- Agent 2 的參數建議
- 目標：前瞻性驗證

請執行以下步驟：

步驟 1：試驗設計
- 撰寫 protocol（參考 CONSORT）
- 樣本數估算（power analysis）
- 受試者招募標準
- 實驗流程（within-subjects, counterbalancing）

步驟 2：Closed-loop 系統建置
- 整合 EEG 即時處理
- 實作 stimulation 觸發邏輯
- 安全機制（劑量限制、異常偵測）

步驟 3：試驗執行
- 受試者篩選與招募
- 資料收集（EEG + 認知評估 + 安全性）
- 品質管控

步驟 4：結果分析
- 主要/次要指標分析
- 安全性報告
- 個體差異分析

產出要求：
- 試驗方案（protocol）
- IRB 申請文件
- 安全性報告
- 臨床試驗結果報告
```

---

## 與現有研究工具的整合

| 工具/平台 | 用途 | 對應 Agent |
|-----------|------|------------|
| Notion | 研究知識庫、文獻管理 | Agent 0, 5, 6 |
| GitHub | 程式碼版本管理 | Agent 1, 2, 3 |
| W&B | 實驗追蹤、超參數管理 | Agent 1, 2 |
| HuggingFace | Dataset 管理、模型分享 | Agent 1, 2, 3 |
| Python/MNE | EEG 分析 | Agent 1, 2, 3 |
| Python/NEURON | 神經建模 | Agent 1, 2 |
| LaTeX/Overleaf | 論文撰寫 | Agent 5 |
| Zotero | 文獻管理 | Agent 6 |

---

## 風險管理

| 風險 | 影響 | 緩解策略 |
|------|------|----------|
| 模型無法收斂 | Stage 1-2 延遲 | 準備多種模型複雜度；從簡單模型開始 |
| 臨床資料不足 | Stage 3 無法執行 | 與多家醫院合作；使用公開 dataset |
| IRB 審查延遲 | Stage 4 提前準備 | M6 開始準備；與 IRB 預溝通 |
| 預測與實際不符 | 模型信譽 | 建立 feedback loop；持續修正 |
| 受試者招募困難 | 試驗進度 | 多中心合作；放寬 inclusion criteria |

---

*此架構由 OWL 生成，請根據實際研究資源與目標進行調整。*
