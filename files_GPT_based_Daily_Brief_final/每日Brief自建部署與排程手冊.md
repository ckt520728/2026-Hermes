# Google Apps Script 每日 Brief 部署與排程設定手冊

這份手冊將指引您完成「每日研究 Brief」的最後部署與優化工作：**設定 PubMed API Key 解決 Rate Limit 限制**，以及**設定每天早上 7 點鐘自動執行**。

我們已為您更新了 `daily-brief.gs` 程式碼，包含了自動設定排程與快捷設定 API Key 的專用函式。

---

## 🔑 第一步：申請與設定 PubMed API Key (NCBI Key)

PubMed 的 E-utilities 預設限制為**無 Key 每秒最多 3 次**，當多個請求同時擠在同一秒時，就會觸發 `Rate Limit Access` 錯誤。申請免費 Key 後限制會被放寬到**每秒最多 10 次**。

### 1. 申請 PubMed API Key：
1. 進入 [NCBI 官方網站](https://www.ncbi.nlm.nih.gov/)。
2. 註冊一個免費帳戶，或者使用 Google 等第三方帳號登入。
3. 登入後，點擊網頁右上角您的用戶名，進入 **「My NCBI」** 頁面。
4. 點擊 **「Account Settings」** (帳戶設定)。
5. 找到 **「API Key Management」** (API 金鑰管理) 區塊，點擊 **「Create an API Key」**。
6. 複製產生出來的那串 API 金鑰字元。

### 2. 設定 API Key 至 Google Apps Script (兩種方式擇一)：

#### 方式 A：執行 `setNcbiApiKeyHelper()` 快捷設定（最推薦 ⭐️）
1. 將最新版 `daily-brief.gs` 代碼複製並覆蓋到您的 Apps Script 網頁編輯器中。
2. 拉到檔案最底部，在 `setNcbiApiKeyHelper()` 中填入您的金鑰：
   ```javascript
   var apiKey = '貼上您的PubMed金鑰字串';
   ```
3. 在上方選單中點選 `setNcbiApiKeyHelper` 函式，然後點擊 **「執行 (Run)」**。
4. 看到日誌輸出 `✅ NCBI_API_KEY 設定成功！` 後，**您可以直接把剛才在程式碼中貼上的 Key 清空或還原**（例如改回空字串），因為金鑰已經安全儲存在 Google 的雲端屬性中，不需留在程式碼中防洩漏！

#### 方式 B：手動在「指令碼屬性」設定
1. 在 Apps Script 網頁編輯器左側，點選 ⚙️ **「專案設定 (Project Settings)」**。
2. 向下滾動到 **「指令碼屬性 (Script Properties)」** 區塊，點擊 **「新增指令碼屬性 (Add Script Property)」**。
3. 輸入屬性名稱與值：
   * **屬性 (Property)**：`NCBI_API_KEY`
   * **值 (Value)**：`貼上您的PubMed金鑰字串`
4. 點擊 **「儲存指令碼屬性 (Save Script Properties)」**。

---

## 🚀 第二步：部署排程（設定每天早上 7 點自動執行）

完成金鑰設定後，您可以設定讓程式每天早上定時執行。

### 方式 A：執行 `setupDailyTrigger()` 程式碼（推薦 ⭐️）

我們在 `daily-brief.gs` 中新增了 `setupDailyTrigger()` 函式，這能自動幫您清除重複的舊觸發器，並建立全新的「每天早上 7 點」執行排程，設定成功後還會自動透過 Telegram 發送確認訊息！

#### 操作步驟：
1. 在編輯器上方工具列的 **下拉選選單** 中，選擇 `setupDailyTrigger` 函式。
2. 點擊 **「執行（Run）」**。
3. **首次執行需要授權**：點選「審查權限（Review Permissions）」→ 登入並「允許（Allow）」。
4. 執行完畢後，您的 Telegram 會立刻收到通知：
   > ⏰ 觸發器設定成功！每天早上 7 點（7:00 ~ 8:00 間）將自動執行 dailyBrief。

> [!NOTE]
> **關於 Apps Script 的執行時間**
> Google Apps Script 的時間驅動觸發器最小單位為「小時區間」。因此，設定早上 7 點代表程式會在 **早上 7:00 至 8:00 之間** 的某個隨機時間自動觸發。

---

### 方式 B：手動在 Apps Script 網頁介面設定

如果您想手動設定，可以依照以下步驟：
1. 進入 Apps Script 專案。
2. 點選左側「時鐘」圖示 - **觸發器**。
3. 點擊右下角 **「新增觸發器」**。
4. 設定參數如下：
   * **選取要執行的功能**：`dailyBrief`
   * **選取要部署的部署作業**：`主要` (Head)
   * **選取活動來源**：`時間驅動`
   * **選取時間型觸發器類型**：`天計時器`
   * **選取時段**：`上午 7 點到 8 點`
   * **失敗通知設定**：`每天通知我` (推薦，若有 API 報錯能立刻收到 E-mail)
5. 最後點擊 **「儲存」**，完成授權即可！

---

## 🛠️ 驗證與維護說明

### 1. 如何確認觸發器已正確啟用？
* 在 Apps Script 網頁左側選單點選 ⏰ **「觸發器 (Triggers)」**，您將會看到清單中出現一個針對 `dailyBrief`、類型為「時間驅動」的觸發器。
* 未來每天早上 7:00 ~ 8:00 間，Telegram 會自動推送當天的 Brief 簡報。

### 2. 時區確認
* Google Apps Script 預設使用您 Google 帳號的時區（通常為 `Asia/Taipei`，台灣時間）。
* 若要雙重確認，請點選 Apps Script 左側的 ⚙️ **「專案設定 (Project Settings)」**，確認 **時區** 顯示為 `(GMT+08:00) 台北`，這代表排程會準確在台灣時間早上 7 點運行。
