# 心安宮角色與素材交接紀錄（2026-11-18）

## 正式名單與本輪授權
- 打小人僅保留 **3畝、肯尼、啾底、偷泥、蝦婷、學妹、沙拉** 七位真人角色，維持該順序。
- Sam 明確要求移除原先四個虛構人物：**拖延症、水逆退散、豬隊友、加班煩惱**。已從 `xinan.js` 的 `slapScenarios`、`assetUrls` 與 `assets/v2/villain-{sloth,retrograde,teammate,overtime}.webp` 移除；**此處刪除的是角色與專用資產，不是「藍白拖／木屐／鎚／扇」四種武器**。事件劇情仍可講工作煩惱，但不以這四個名字作可選人物。
- 本輪角色圖使用唯一已確認來源：先前本 ChatGPT 對話中 Sam 選定的**沙拉棕色格紋裙四格**（`a_clean_bright_studio_style_cutout_collage_of_t.png`），從同一原圖四象限直接裁切、透明畫布置中，沒有重新生成或交換人物。正式 PNG：`assets/office-fullbody/Sara_{normal,happy,hurt_cry,innocent}.png`，每張 768×1024 RGBA。指紋參考：`Sara_normal.png` SHA-256 `fb809672e5eb34d85439a5d4507bbfbad498be503050e4391b11ca7f5612f261`。
- **3畝**：仍用 Sam 最後指定的側分棕髮、藍色針織外套、白貓 Polo 與淺牛仔褲四張版本，程式 ID 從誤導性 `sam3mu` 修正為 `three_mu`（可視名稱「3畝」不變）。**肯尼**：保留既有已選定的四張版本。
- **啾底、偷泥、蝦婷、學妹**：當前程式標記 `pending_drive`、以「待核准照片」提示代替相貌，**不是完成的真人角色**。需要真正可確認每位對應的四表情全身透明 PNG 後才能更換，不可私自猜人或將其他圖直接貼上。這是剩餘未完成的角色問題，不能在回報中說全七位照片已正確。
- 隨機劇場的抽選池現在即為 `slapScenarios` 七位真人，不以硬編碼 `slice(0,7)` 掩蓋多餘人物，也不要固定針對任一同事。

## 部署與後續開發規則
- 正式來源：`https://github.com/HelloPages/arcade`（main）；正式頁：`https://hellopages.github.io/arcade/xinan.html`。
- 先驗證手機直式與桌面顯示七位且**不再有四個虛構角色**；切換 3畝、肯尼、沙拉四表情，核對圖片無 404、全身可見及沒有灰底。祈福、問卦、選武器、隨機劇場需回歸驗證。
- 注意瀏覽器快取：`xinan.html` 的程式資源版本及 Sara 圖片網址都已變更；確認正式 GitHub Pages 部署完成、HTTP 200 且內容為最新，不得用舊網站或本機結果冒充上線。
- 本輪工作使用獨立的乾淨發布工作樹，未觸碰 Antigravity 在主遊戲專案中進行的其他未提交編輯。其後 Antigravity 必須先讀取最新 Git 遠端／開發手冊，再繼續每日遊戲發布，避免回歸。
