/**
 * ============================================================
 * 每日研究 Brief — Google Apps Script 版(含 AI 新聞)
 * 流程:抓 PubMed(腎臟學+認知神經科學) + arXiv(AI 論文)
 *       + AI 新聞 RSS(OpenAI / Anthropic / 各大來源)
 *       → 丟給 OpenAI GPT-5.5 整理成中文摘要 → 推到 Telegram
 *
 * 用法:
 *   1. script.google.com 新增專案,貼上本檔
 *   2. 專案設定 → 指令碼屬性 填三把鑰匙
 *   3. 先跑 testTelegram() → 再跑 testAINews() → 再跑 dailyBrief() 驗證
 *   4. 執行 setupDailyTrigger() 自動設定每天早上 7 點執行，或手動新增觸發器
 * ============================================================
 */

function getProp(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

// ---------- 1. 抓 PubMed(E-utilities) ----------
// 速率限制:無 key 每秒 3 次、有 key 每秒 10 次。
// 若有設指令碼屬性 NCBI_API_KEY,會自動帶上(可省略,沒設也能跑)。
function fetchPubmed(query, days, max) {
  var base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  var key = getProp("NCBI_API_KEY");          // 可有可無
  var keyParam = key ? ("&api_key=" + key) : "";
  var esearchUrl = base + "/esearch.fcgi?db=pubmed&term=" +
    encodeURIComponent(query) +
    "&retmax=" + max + "&retmode=json&datetype=pdat&reldate=" + days + "&sort=date" + keyParam;
  var idsRes = UrlFetchApp.fetch(esearchUrl, { muteHttpExceptions: true });
  var idsJson = JSON.parse(idsRes.getContentText());
  var ids = (idsJson.esearchresult && idsJson.esearchresult.idlist) || [];
  if (ids.length === 0) return "(這個領域最近沒有新文章)";
  Utilities.sleep(400);                        // esearch 與 efetch 間喘口氣,避開每秒上限
  var efetchUrl = base + "/efetch.fcgi?db=pubmed&id=" + ids.join(",") +
    "&rettype=abstract&retmode=text" + keyParam;
  var absRes = UrlFetchApp.fetch(efetchUrl, { muteHttpExceptions: true });
  return absRes.getContentText();
}

// ---------- 2. 抓 arXiv(AI 論文,Atom XML) ----------
function fetchArxiv(category, max) {
  var url = "http://export.arxiv.org/api/query?search_query=" +
    encodeURIComponent(category) +
    "&start=0&max_results=" + max + "&sortBy=submittedDate&sortOrder=descending";
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  return res.getContentText();
}

// ---------- 3. 抓 AI 新聞 RSS(免費、免金鑰) ----------
// 來源清單(2026-05 驗證):官方實驗室發布 + 高頻新聞站
// 想增刪來源,改這個陣列即可
// desc:true = 連描述/摘要一起抓(適合官方來源,標題常是標語);
// desc:false 或省略 = 只抓標題(適合媒體,標題已夠具體)
var AI_NEWS_FEEDS = [
  { name: "OpenAI",        url: "https://openai.com/news/rss.xml", desc: true },
  { name: "Anthropic",     url: "https://raw.githubusercontent.com/taobojlen/anthropic-rss-feed/main/anthropic_news_rss.xml", desc: true },
  { name: "Hugging Face",  url: "https://huggingface.co/blog/feed.xml" },
  { name: "MarkTechPost",  url: "https://www.marktechpost.com/feed/" },
  { name: "The Verge AI",  url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" }
];

// 從一段 RSS/Atom XML 裡抓最近幾則標題,相容 RSS 與 Atom
// withDesc=true 時,連描述/摘要一起抓(官方來源用,補足標語式標題)
function parseFeedTitles(xmlText, max, withDesc) {
  var lines = [];
  try {
    var doc = XmlService.parse(xmlText);
    var root = doc.getRootElement();
    var atomNs = XmlService.getNamespace("http://www.w3.org/2005/Atom");
    var items = [];
    var channel = root.getChild("channel");
    if (channel) {
      items = channel.getChildren("item"); // RSS
    } else {
      items = root.getChildren("entry");   // Atom(無 namespace)
      if (items.length === 0) items = root.getChildren("entry", atomNs);
    }
    for (var i = 0; i < Math.min(items.length, max); i++) {
      var item = items[i];
      var t = item.getChild("title") || item.getChild("title", atomNs);
      if (!t) continue;
      var line = "- " + t.getText().trim();
      if (withDesc) {
        // RSS 用 <description>;Atom 用 <summary> 或 <content>
        var d = item.getChild("description")
             || item.getChild("summary", atomNs)
             || item.getChild("summary")
             || item.getChild("content", atomNs);
        if (d) {
          var txt = d.getText().replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
          // 截到 ~140 字,避免送給 GPT 的內容暴增
          if (txt && txt.toLowerCase() !== t.getText().trim().toLowerCase()) {
            if (txt.length > 140) txt = txt.slice(0, 140) + "…";
            line += "\n    ↳ " + txt;
          }
        }
      }
      lines.push(line);
    }
  } catch (e) {
    return "(此來源 RSS 解析失敗)";
  }
  return lines.length ? lines.join("\n") : "(近期無新項目)";
}

function fetchAINews(maxPerFeed) {
  var out = [];
  for (var i = 0; i < AI_NEWS_FEEDS.length; i++) {
    var feed = AI_NEWS_FEEDS[i];
    try {
      var res = UrlFetchApp.fetch(feed.url, { muteHttpExceptions: true });
      if (res.getResponseCode() === 200) {
        out.push("〔" + feed.name + "〕\n" + parseFeedTitles(res.getContentText(), maxPerFeed, feed.desc === true));
      } else {
        out.push("〔" + feed.name + "〕(抓取失敗,HTTP " + res.getResponseCode() + ")");
      }
    } catch (e) {
      out.push("〔" + feed.name + "〕(連線失敗)");
    }
  }
  return out.join("\n\n");
}

// ---------- 4. 呼叫 OpenAI GPT-5.5 整理 ----------
function summarize(raw) {
  var payload = {
    model: "gpt-5.5", // 想省錢可改 "gpt-5.4"
    messages: [
      {
        role: "system",
        content:
          "你是一位資深研究助理,服務對象是一位腎臟科醫師暨認知神經科學博士。" +
          "請把以下原始素材整理成精簡的中文每日 brief,分四區塊:" +
          "【腎臟學】【認知神經科學】【AI 研究】【AI 產業動態】。" +
          "前三區塊(文獻)每篇用 2-3 句點出研究問題、主要發現、臨床或研究意義。" +
          "第四區塊(AI 產業動態,來自新聞 RSS 標題)挑出最重要的 3-5 則," +
          "每則一句話說明為何值得注意,並標註來源(如 OpenAI、Anthropic)。" +
          "務必忠於原文,不要編造數據或結論;若某區塊沒有內容就寫「今日無新項目」。"
      },
      { role: "user", content: "以下是今日素材:\n\n" + raw }
    ]
  };
  var res = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + getProp("OPENAI_API_KEY") },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var json = JSON.parse(res.getContentText());
  if (!json.choices) {
    return "(GPT 回應異常:" + res.getContentText().slice(0, 500) + ")";
  }
  return json.choices[0].message.content || "(無法產生摘要)";
}

// ---------- 5. 推 Telegram(單則上限 4096 字,過長切段) ----------
function sendTelegram(text) {
  var token = getProp("TELEGRAM_BOT_TOKEN");
  var chatId = getProp("TELEGRAM_CHAT_ID");
  var chunks = text.match(/[\s\S]{1,3800}/g) || [text];
  for (var i = 0; i < chunks.length; i++) {
    UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ chat_id: chatId, text: chunks[i] }),
      muteHttpExceptions: true
    });
  }
}

// ---------- 主流程(觸發器跑這個) ----------
function dailyBrief() {
  try {
    var today = new Date().toISOString().slice(0, 10);

    var neph = fetchPubmed("nephrology OR kidney disease", 7, 5);
    Utilities.sleep(600); // 兩次 PubMed 之間間隔,避開每秒上限
    var neuro = fetchPubmed(
      "Alzheimer OR (diabetes AND dementia) OR cognitive decline", 7, 5);
    var aiPapers = fetchArxiv("cat:cs.AI", 5);
    var aiNews = fetchAINews(4); // 每個來源抓最近 4 則標題

    var raw =
      "【腎臟學 PubMed】\n" + neph + "\n\n" +
      "【認知神經科學 PubMed】\n" + neuro + "\n\n" +
      "【AI 研究 arXiv】\n" + aiPapers + "\n\n" +
      "【AI 產業新聞 RSS】\n" + aiNews;

    var summary = summarize(raw);
    sendTelegram("📚 每日研究 Brief " + today + "\n\n" + summary);
  } catch (e) {
    sendTelegram("⚠️ 每日 Brief 執行失敗:" + e.toString());
  }
}

// ---------- 驗證用 ----------
function testTelegram() {
  sendTelegram("✅ 測試:Apps Script 連到 Telegram 成功!");
}

// 單獨測 AI 新聞抓取(結果印到執行記錄,不推 Telegram)
function testAINews() {
  Logger.log(fetchAINews(4));
}

// ---------- 自動設定每天早上 7 點執行 ----------
function setupDailyTrigger() {
  var functionName = "dailyBrief";
  
  // 1. 先清除舊的 dailyBrief 觸發器，避免重複執行
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // 2. 建立新觸發器：每天早上 7 點到 8 點之間執行 (GAS 時間驅動觸發器最小單位為小時區間)
  ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
    
  sendTelegram("⏰ 觸發器設定成功！每天早上 7 點（7:00 ~ 8:00 間）將自動執行 dailyBrief。");
}

// ---------- 快捷設定 PubMed API Key ----------
// 若您不習慣使用 Apps Script 網頁介面的「指令碼屬性」，可以直接在下方單引號內貼上您的 NCBI Key，
// 並在上方選單選擇「setNcbiApiKeyHelper」執行一次，設定完畢後即可清除代碼中的 Key。
function setNcbiApiKeyHelper() {
  var apiKey = '請在此處貼上您的PubMed金鑰';
  if (apiKey === '請在此處貼上您的PubMed金鑰' || !apiKey) {
    Logger.log("❌ 請先在下方填入您的 PubMed API Key！");
    return;
  }
  PropertiesService.getScriptProperties().setProperty("NCBI_API_KEY", apiKey.trim());
  Logger.log("✅ NCBI_API_KEY 設定成功！您的 PubMed 每秒請求上限已由 3 次提升至 10 次。");
}
