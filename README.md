# 🎙 Theme Voice Practice · 主題聲音練習室

> 輸入例會主題，AI 產生即興演講題目，會員用語音回答並保存練習紀錄，藉此追蹤自己的表達成長。

## 功能

- 🎯 **主題題庫**：輸入例會主題，AI 依類型產生 Table Topics 題目
- 🎙 **語音錄音**：倒數準備、一鍵錄音、停止、重錄、回聽
- ⭐ **自我評分**：清楚度、結構、聲音自然度 1~5 星評分 + 文字筆記
- 📚 **練習紀錄**：本機 IndexedDB 保存，可回聽歷史錄音
- 📦 **匯出 / 匯入**：ZIP 備份（含 audio 檔案與 records.json）
- 🔑 **彈性 API Key**：支援使用者自填 / 伺服器端 / 內建示範題目三層保底

---

## 本機開發（Windows）

### 1. 安裝 Node.js LTS

前往 https://nodejs.org 下載並安裝 LTS 版本。

### 2. 解壓縮專案

將 ZIP 解壓縮到你想要的位置，例如 `C:\projects\theme-voice-practice`。

### 3. 開啟 PowerShell 並進入專案資料夾

```powershell
cd C:\projects\theme-voice-practice
```

### 4. 安裝套件

```powershell
npm install
```

### 5. 建立環境變數檔案

在 PowerShell 中執行（Windows 沒有 `cp` 指令，請用 `copy`）：

```powershell
copy .env.example .env.local
```

或手動建立 `.env.local`，內容如下（可選，填入你的 OpenAI API Key）：

```
OPENAI_API_KEY=sk-你的key
```

### 6. 啟動開發伺服器

```powershell
npm run dev
```

### 7. 開啟瀏覽器

前往 http://localhost:3000

---

## 部署到 Vercel（免費）

### 步驟 1：建立 GitHub Repo

1. 前往 https://github.com，登入後點右上角 **New repository**
2. 輸入 repo 名稱，例如 `theme-voice-practice`
3. 選 Public 或 Private，按 **Create repository**

### 步驟 2：推送程式碼

在 PowerShell 中執行：

```powershell
git init
git add .
git commit -m "Initial MVP"
git branch -M main
git remote add origin https://github.com/你的帳號/theme-voice-practice.git
git push -u origin main
```

> 如果是第一次使用 git，可能需要先設定：
> ```
> git config --global user.email "你的email"
> git config --global user.name "你的名字"
> ```

### 步驟 3：在 Vercel 部署

1. 前往 https://vercel.com，用 GitHub 帳號登入
2. 點 **Add New → Project**
3. 選擇你的 `theme-voice-practice` repo，點 **Import**
4. Framework 會自動偵測為 **Next.js**
5. 在 **Environment Variables** 區塊，可選填：
   - `OPENAI_API_KEY` = 你的 OpenAI API Key（可省略，讓使用者自己填）
6. 點 **Deploy**
7. 等待部署完成（約 1~3 分鐘）
8. 取得你的 `xxx.vercel.app` 網址

### 網域說明

- 預設使用 `.vercel.app` 免費子網域即可開始使用
- 未來如要用自己的網域，到 Vercel Project Settings → Domains 設定
- 建議用子網域，例如 `voice.example.com`，不要直接修改主網域

---

## 環境變數

| 變數名稱 | 說明 | 必填 |
|---------|------|------|
| `OPENAI_API_KEY` | OpenAI API Key，用於伺服器端產生題目 | 否 |

---

## 技術架構

- **Framework**：Next.js 14 (App Router)
- **語言**：TypeScript
- **本機儲存**：IndexedDB（idb library）
- **錄音**：MediaRecorder API
- **匯出 / 匯入**：JSZip
- **AI 題目**：OpenAI gpt-4o-mini
- **部署**：Vercel

---

## 隱私說明

- 你的錄音和練習紀錄**只存在你的瀏覽器本機**（IndexedDB），不會自動上傳
- 你的 OpenAI API Key（若有填寫）**只存在瀏覽器 localStorage**，不會傳送到本站伺服器
- 本站伺服器端的 API Key 僅作為選用的共用服務，不記錄任何個人資料
