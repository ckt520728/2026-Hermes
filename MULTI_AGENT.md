# Hermes Agent Multi-Agent 架構設定紀錄

更新日期：2026-05-29

## 結論

Hermes multi-agent 架構已完成本機配置：

- `default`：orchestrator，啟用 `delegation` 與 `kanban`
- `researcher`：literature / evidence agent
- `coder`：experiment / implementation agent
- `reviewer`：critic / peer-review agent

三個 profile 都已切到：

```yaml
model:
  default: google/gemini-3-flash-preview
  provider: nous
  base_url: ''
```

## 已完成變更

實際修改位置：

- `C:\Users\User\AppData\Local\hermes\config.yaml`
- `C:\Users\User\AppData\Local\hermes\profiles\researcher\config.yaml`
- `C:\Users\User\AppData\Local\hermes\profiles\coder\config.yaml`
- `C:\Users\User\AppData\Local\hermes\profiles\reviewer\config.yaml`
- `C:\Users\User\AppData\Local\hermes\profiles\researcher\SOUL.md`
- `C:\Users\User\AppData\Local\hermes\profiles\coder\SOUL.md`
- `C:\Users\User\AppData\Local\hermes\profiles\reviewer\SOUL.md`

每次套用前會自動建立 `.bak.<timestamp>` 備份。

可重跑腳本：

```powershell
python "C:\Users\User\Documents\2026 Hermes agent\setup_multi_agent.py"
```

## 驗證結果

已通過：

```powershell
hermes version
hermes profile list
hermes -p researcher profile
hermes -p coder profile
hermes -p reviewer profile
hermes kanban init
hermes kanban assignees
```

`hermes profile list` 已能看到：

- `default`
- `researcher`
- `coder`
- `reviewer`

Kanban 已初始化在：

```text
C:\Users\User\AppData\Local\hermes\kanban\boards\ai-watch\kanban.db
```

## Smoke-Test 任務圖

已建立三段式研究自動化任務：

| 任務 | Assignee | 狀態 |
|---|---|---|
| `t_64589f47` Smoke: researcher literature map | `researcher` | `blocked` |
| `t_cbfb483f` Smoke: coder experiment plan | `coder` | `todo` |
| `t_fe9b4717` Smoke: reviewer critique | `reviewer` | `todo` |

依賴關係：

```text
researcher -> coder -> reviewer
```

Dispatcher 曾成功 spawn `researcher` worker，表示 kanban multi-profile dispatch 機制已接上。

## 目前阻塞點

worker 失敗原因：

```text
Hermes is not logged into Nous Portal. Run `hermes model` to re-authenticate.
```

`hermes status` 顯示：

```text
Nous Portal   not logged in (run: hermes auth add nous --type oauth)
```

因此目前架構已完成，但還不能真正跑 LLM worker。需要在互動式 terminal 完成一次 Nous OAuth。

## 下一步驗證

在一般 PowerShell 執行：

```powershell
hermes auth add nous --type oauth
```

完成 OAuth 後回到這個資料夾，執行：

```powershell
hermes kanban unblock t_64589f47
hermes kanban dispatch --max 1
hermes kanban runs t_64589f47
hermes kanban log t_64589f47
```

若 researcher 完成，接著執行：

```powershell
hermes kanban dispatch --max 1
hermes kanban runs t_cbfb483f
hermes kanban dispatch --max 1
hermes kanban runs t_fe9b4717
```

成功標準：

- `researcher` 產出可追溯來源的 literature map
- `coder` 在 researcher 結果後產出可驗證 experiment plan
- `reviewer` 在 coder 結果後產出 critique
- `hermes kanban list` 顯示三個 smoke-test 任務完成
