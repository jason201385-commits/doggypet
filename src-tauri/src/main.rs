// 狗狗桌寵:視窗行為全在前端(ui/),Rust 只負責殼。
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("狗狗桌寵啟動失敗");
}
