# DoggyPet ・ 狗狗桌寵 🐕

**花生、芝麻、湯圓住進你的桌面**——一隻真狗頭像浮在螢幕角落(永遠置頂、可拖曳),點一下就能用中文問 Claude Code 問題。[Claude Code 新手小學堂](https://claude.easyknowai.com)的三隻 AI 助教,桌面版。

- 🐶 三狗切換,個性不同(花生慢條斯理/芝麻活潑/湯圓溫柔),偏好會記住
- 💬 聊天泡泡:卡關、寫中文指令、額度急救——後端同小學堂(免費 Workers AI,零金鑰)
- 🔊 zh-TW 語音朗讀(可關)
- 🪶 Tauri v2,安裝檔僅 ~3MB

## 安裝

從 [Releases](../../releases) 下載 `DoggyPet_x.y.z_x64_zh-TW.msi` 安裝。
未簽章,Windows SmartScreen 會攔一次:點「其他資訊 → 仍要執行」。

## 開發

```bash
npm install
npx tauri dev    # 需要 Rust 工具鏈
npx tauri build  # 產出 msi
```

前端在 `ui/`(純 HTML/JS 零框架),Rust 只是殼(`src-tauri/`)。
聊天後端:`https://claude.easyknowai.com/api/chat`(POST `{messages, dog}`)。

## 授權

MIT © Jason Chiu(魯班)/ easyknowai。狗狗照片為作者家犬,僅供本專案使用。
