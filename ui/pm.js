/* 魯班 PM 邏輯 —— L1 交棒式
 * 規格來源:PM-LOGIC.md(從 Jason 1,931 則真實發言反向工程)
 * 全部本機執行,零 API 呼叫、零額度消耗。
 *
 * 流程:老闆一句話 → 判讀樣態 → 選項式問最多 3 題 → 組六區塊指令 → 一鍵複製
 */
(function () {
  'use strict';

  // ── §1 判讀輸入樣態(PM-LOGIC.md 第 1 節)──────────────────────
  // 需求中位數只有 18 字,所以「短」是常態不是例外,不要因為短就要求他重講。
  function readIntent(text) {
    var t = (text || '').trim();
    if (/^(https?:\/\/|@|[A-Za-z]:\\)/.test(t) || /\.(png|jpg|jpeg|mp4|pdf|csv|xlsx?|docx?|zip)$/i.test(t))
      return 'material';                                   // 丟東西當需求(最常見)
    if (/有沒有可能|有沒有辦法|可不可以|能不能/.test(t)) return 'explore';
    if (/^(好像)?(不行|沒有|沒反應|壞了|失敗|不能用)|怎麼辦|卡住|不會用|報錯|錯誤/.test(t)) return 'broken';
    if (/你直接|直接處理|直接幫我|不用問/.test(t)) return 'authorized';
    return 'build';
  }

  // ── §2 問句庫:一次最多 3 題,全部選項式 ─────────────────────
  var TOPICS = {
    web: {
      name: '做一個網頁 / 網站',
      match: /網頁|網站|首頁|landing|預約|表單|型錄|部落格/,
      qs: [
        { q: '這個網頁主要給誰看?', opts: ['給客戶看', '自己內部用', '對外宣傳用'] },
        { q: '他們來這裡最想做的一件事是什麼?', opts: ['預約 / 報名', '看資訊', '買東西', '留下聯絡資料'] },
        { q: '有沒有已經存在的東西要參考或搬過來?', opts: ['沒有,從零開始', '有,我等下貼網址給你'] }
      ]
    },
    auto: {
      name: '自動化 / 重複工作',
      match: /自動|每天|每週|定時|排程|重複|懶得|一直要/,
      qs: [
        { q: '這件事你現在多久做一次?', opts: ['每天', '每週', '不一定,想到就做'] },
        { q: '資料從哪來、要到哪去?', opts: ['電腦裡的檔案', '網路上抓', 'Email / 訊息', '我等下說明'] },
        { q: '做錯的話會怎樣?', opts: ['沒差,可以重來', '有點麻煩', '會出事,要先確認' ] }
      ]
    },
    data: {
      name: '整理資料 / 文件',
      match: /整理|彙整|統計|報表|excel|csv|表格|逐字稿|摘要/i,
      qs: [
        { q: '東西現在放在哪?', opts: ['電腦資料夾', '雲端硬碟', '信箱 / 訊息裡'] },
        { q: '整理完你要拿它做什麼?', opts: ['自己看', '給別人看 / 報告', '再丟給其他程式用'] },
        { q: '大概有多少份?', opts: ['10 份以內', '幾十份', '幾百份以上'] }
      ]
    },
    fix: {
      name: '修東西 / 壞掉了',
      match: /壞|修|錯誤|error|404|跑不動|打不開|當掉/i,
      qs: [
        { q: '你看到什麼?', opts: ['有錯誤訊息(我等下貼)', '畫面空白 / 沒反應', '結果不對'] },
        { q: '什麼時候開始的?', opts: ['一直都這樣', '我改了東西之後', '突然就這樣'] },
        { q: '現在還能用嗎?', opts: ['完全不能用', '部分功能還行'] }
      ]
    }
  };

  function pickTopic(text) {
    for (var k in TOPICS) if (TOPICS[k].match.test(text)) return TOPICS[k];
    return {
      name: '一般任務',
      qs: [
        { q: '這件事做好之後,你希望看到什麼?', opts: ['一個可以用的東西', '一份整理好的資料', '一個問題被解決'] },
        { q: '有沒有現成的東西可以參考?', opts: ['沒有', '有,我等下給你'] },
        { q: '這件事急嗎?', opts: ['今天要用', '這幾天', '不急,做好比較重要'] }
      ]
    };
  }

  // ── §3 組裝六區塊指令 ────────────────────────────────────────
  function buildPrompt(need, topic, answers, riskLevel) {
    var L = [];
    L.push('【要做什麼】');
    L.push(need);
    L.push('');
    L.push('【背景】');
    L.push('・類型:' + topic.name);
    for (var i = 0; i < answers.length; i++) L.push('・' + topic.qs[i].q + ' → ' + answers[i]);
    L.push('');
    L.push('【給你的材料】');
    L.push('(如果我有貼檔案、網址或截圖,以那些為準;沒有的話就先問我要)');
    L.push('');
    L.push('【邊界】');
    L.push('・我是新手,請用中文說明每一步在做什麼');
    L.push('・不要刪除或覆寫我原本的檔案;要動之前先讓我看');
    L.push('・不要安裝付費服務、不要買網域,碰到要花錢先問我');
    if (riskLevel === 'high') L.push('・這件事做錯會有影響,每個會改到東西的步驟都先問過我');
    L.push('');
    L.push('【怎樣算完成】');
    L.push('・要能實際跑一次給我看,不接受「看起來正常」');
    L.push('・有畫面的話給我截圖或告訴我去哪裡看');
    L.push('・告訴我怎麼反悔(哪裡有備份、怎麼還原)');
    L.push('');
    L.push('【卡住的話】');
    L.push('不要猜。停下來問我,我會補資料給你。');
    L.push('');
    L.push('【做完怎麼回報】');
    L.push('先給我一句話結論,再列你做了什麼。');
    L.push('需要我決定的事,請整理成編號選項(例如 1a / 1b),我只回編號。');
    return L.join('\n');
  }

  // ── 對話狀態機 ───────────────────────────────────────────────
  var state = null;   // {need, topic, step, answers, risk}

  function start(need) {
    var topic = pickTopic(need);
    state = { need: need, topic: topic, step: 0, answers: [], risk: 'normal' };
    return {
      say: '汪~我幫你把這件事交代清楚給 Claude。先問你 ' + topic.qs.length + ' 個問題,點選項就好:',
      ask: topic.qs[0]
    };
  }

  function answer(text) {
    if (!state) return null;
    state.answers.push(text);
    // 風險判讀:回答裡出現「會出事」就升級成高風險模式
    if (/會出事|不能重來|重要|正式/.test(text)) state.risk = 'high';
    state.step++;
    if (state.step < state.topic.qs.length) {
      return { ask: state.topic.qs[state.step] };
    }
    var prompt = buildPrompt(state.need, state.topic, state.answers, state.risk);
    state = null;
    return { done: true, prompt: prompt };
  }

  function reset() { state = null; }
  function active() { return !!state; }

  window.LubanPM = {
    readIntent: readIntent, start: start, answer: answer,
    reset: reset, active: active, buildPrompt: buildPrompt, TOPICS: TOPICS
  };
})();
