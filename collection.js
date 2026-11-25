/* ===================== 도감 (collection.js) =====================
   여러 인생에 걸쳐 모은 엔딩·꿈·업적·사망·장소를 기록한다.
   - 기존 게임 코드는 건드리지 않고 afterDeath / begin / loadGame만 감싼다. (ranking.js와 같은 방식)
   - 기록은 인생이 끝날 때(afterDeath) 한 번만 한다.
   - 일반 모드와 랭킹 도전 모두 기록되고, 랭킹 도전에서 처음 얻은 칸에는 🏆 표시가 붙는다.
   - 저장: localStorage "haejeoklife_collection_v1" (기기·브라우저별)
     나중에 서버 저장으로 옮길 때는 이 키의 JSON을 그대로 서버에 올리면 된다.

   ── 항목 추가하는 법 ──
   게임에서 새 업적(achieve("…"))이나 새 사망 원인을 만들면, 아래 목록에 같은 글자를 적는다.
   목록에 없는 것도 실제로 얻으면 자동으로 도감에 추가되지만, 목록에 적어야 얻기 전부터 "???" 칸으로 보인다.
   ================================================================ */
(() => {
  "use strict";
  const KEY = "haejeoklife_collection_v1";

  /* ───────────── 항목 목록 ───────────── */
  const ENDINGS = [
    "바다 위의 평범한 인생", "행복한 일생", "꿈을 좇다 끝난 인생", "피지 못한 꽃",
    "자유를 되찾지 못한 영혼", "가라앉은 세계의 마지막 세대", "세계를 구한 자",
    "전설의 해적", "정의의 영웅", "혁명의 불꽃", "전설의 사냥꾼", "존경받는 명사",
    "성지의 권력자", "세계의 정점에 선 오로성",
  ];
  const ACHIEVEMENTS = [
    "결혼", "부모가 됨", "손주를 보다", "가족을 지켜 냄", "백 세를 맞이함", "노익장을 과시함",
    "동네의 자랑", "중요한 시험에 합격함", "학술적 명성을 얻음", "여행기를 출간함", "회고록을 남김",
    "첫 발명 성공", "발명으로 부를 쌓음", "요리 대회 우승", "첫 배를 가짐", "보물 발견", "유적 탐사",
    "해적단 결성", "섬을 점령함", "나라를 세움", "억대 현상범 체포", "해왕류를 물리침",
    "어릴 적 꿈을 좇아", "어린 날의 약속을 지킴", "어린 시절의 약속을 지킴", "어린 시절의 라이벌을 넘어섬",
    "평생의 라이벌과 화해함", "제자가 이름을 떨침", "자녀가 모험의 동료가 됨", "부모의 뜻을 이어받음",
    "부모의 유산을 이어받음", "다음 세대를 위한 터전을 세움", "왕실의 초대를 받음",
    "악마의 열매 각성", "힘힘 열매 각성", "패왕색 패기 발현", "만물의 호흡을 깨달음",
    "가프에게 어니스트 임팩트를 배움", "상디에게 검은다리 유파를 배움", "조로에게서 화도 일문자와 엔마를 얻음",
    "명도 슈스이를 손에 넣음", "라그니르(철뢰)를 손에 넣음", "바다를 얼려 건넘",
    "베가펑크와 협업함", "베가펑크의 친구", "베가펑크를 지켜 냄", "쿠마와의 전투에서 승리",
    "버스터 콜에서 사람들을 구함", "피셔 타이거에 의해 해방됨", "천룡인의 지위를 버림",
    "하늘섬의 흔적을 찾음", "하계의 땅을 밟은 스카이피안", "해적 박람회 참가", "친구를 처단한 해군",
    "왕하칠무해", "사황", "혁명군 군단장", "신의 기사단 입단", "오로성 취임",
    "세계 침수에서 살아남음", "세계 침수에서 인연의 손에 구조됨", "힘힘 열매의 부력으로 세계 침수를 버팀",
    "공백의 100년의 비밀을 완전히 알아냄", "공백의 100년의 진실을 세계에 알림",
    "라프텔에 도달함", "원피스를 손에 넣음", "해적왕 달성", "밀짚모자와 함께 세계를 바꿈",
    "니드호그의 힘으로 이무를 쓰러뜨림", "이무와 신의 기사단을 쓰러뜨림", "이무를 쓰러뜨린 오로성",
  ];
  const DEATHS = [
    "노환", "병", "질병", "돌림병", "사고", "난파", "영아 사망", "가혹한 노동", "암살", "악마의 열매",
    "해적의 습격", "해군과의 교전", "해왕류의 습격", "부패 해군의 보복", "세계정부의 처형",
    "해군·정부 인물에게 피살", "탈출 실패", "천룡인의 변덕", "천룡인 습격 실패", "전직 천룡인에 대한 보복",
    "정상전쟁 전사", "해적 나포 작전 중 전사", "마리조아 습격 작전 중 전사", "CP0의 열매 회수 작전",
    "빅맘 해적단과의 전투", "카이도와의 전투", "잭과의 전투", "샹크스와의 전투",
    "검은수염 해적단과의 전투", "검은수염 해적단의 능력 강탈", "이글이글 열매 능력자와의 전투",
    "흔들흔들 열매 능력자와의 전투", "수술수술 열매 능력자와의 전투", "라그니르와의 전투",
    "밀짚모자 루피와의 싸움", "밀짚모자 루피와의 최종 전투", "라프텔에서 루피와의 전투",
    "해적왕을 향한 이무와의 전투", "이무와의 결전", "이무에게 처형당함", "이무에게 살해당함", "세계의 수몰",
  ];
  const dreamNames = () => {
    try {
      return Object.values(DREAMS).map((d) => d.name);
    } catch (e) {
      return [];
    }
  };
  const dreamEndings = () => {
    try {
      return Object.values(DREAMS).map((d) => d.ending).filter(Boolean);
    } catch (e) {
      return [];
    }
  };
  const placeNames = () => {
    try {
      return places.map((x) => x.name);
    } catch (e) {
      return [];
    }
  };
  const placeSea = (name) => {
    try {
      const x = places.find((y) => y.name === name);
      return x ? x.sea : "";
    } catch (e) {
      return "";
    }
  };

  const CATS = [
    { id: "ending", name: "엔딩", list: () => [...ENDINGS, ...dreamEndings()] },
    { id: "dream", name: "꿈", list: dreamNames },
    { id: "achievement", name: "업적", list: () => ACHIEVEMENTS },
    { id: "death", name: "사망", list: () => DEATHS },
    { id: "place", name: "장소", list: placeNames },
  ];

  /* ───────────── 저장 ───────────── */
  // items["achievement:결혼"] = { n: 얻은 횟수, life: 처음 얻은 인생 번호, ranked: 랭킹 도전에서 처음 얻었나, seen: 도감에서 봤나 }
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || "null");
      if (d && typeof d === "object" && d.items) return { lives: d.lives || 0, items: d.items };
    } catch (e) {}
    return { lives: 0, items: {} };
  }
  function save(d) {
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch (e) {}
  }

  // 목록에 있는 것 + 목록에 없지만 실제로 얻은 것
  function entries(cat, data) {
    const names = [...new Set(cat.list())];
    for (const k of Object.keys(data.items)) {
      const [c, ...rest] = k.split(":");
      const name = rest.join(":");
      if (c === cat.id && !names.includes(name)) names.push(name);
    }
    return names.map((name) => ({ name, rec: data.items[cat.id + ":" + name] || null }));
  }
  function totals(data) {
    let got = 0,
      all = 0;
    for (const c of CATS)
      for (const e of entries(c, data)) {
        all++;
        if (e.rec) got++;
      }
    return { got, all };
  }

  /* ───────────── 이번 인생에서 얻은 것 모으기 ───────────── */
  function collectLife(cause) {
    const out = [];
    const add = (cat, name) => {
      if (name) out.push(cat + ":" + String(name).trim());
    };
    try {
      add("ending", typeof endingTitle === "function" ? endingTitle(cause || {}) : p.flags && p.flags.endingTitle);
    } catch (e) {}
    for (const a of p.achievements || []) {
      const m = /^꿈을 이룸: (.+)$/.exec(a);
      if (m) add("dream", m[1]);
      else add("achievement", a);
    }
    add("death", (cause && cause.type) || (p.flags && p.flags.deathCause && p.flags.deathCause.type));
    const seen = new Set();
    if (p.birthPlace && p.birthPlace.name) seen.add(p.birthPlace.name);
    if (p.place && p.place.name) seen.add(p.place.name);
    for (const k of Object.keys((p.flags && p.flags.peVisited) || {})) seen.add(k);
    for (const k of seen) add("place", k);
    return [...new Set(out)];
  }

  /* ───────────── 화면 ───────────── */
  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // 얻기 전 힌트: 첫 글자만 보이고 나머지는 ○ (띄어쓰기·기호는 그대로)
  const mask = (s) => [...s].map((ch, i) => (i === 0 || /[\s·—:()]/.test(ch) ? ch : "○")).join("");

  const css = document.createElement("style");
  css.textContent = `
    .col-open-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
    .col-count{font-variant-numeric:tabular-nums;color:var(--gold);font-weight:800;margin-left:6px}
    .col-ov{position:fixed;inset:0;z-index:9999;background:rgba(4,20,33,.72);display:flex;align-items:center;justify-content:center;padding:12px}
    .col-box{max-width:760px;width:100%;max-height:90vh;display:flex;flex-direction:column;padding:0;overflow:hidden}
    .col-top{padding:16px 18px 12px;border-bottom:1px solid var(--line)}
    .col-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
    .col-head h2{margin:0}
    .col-bar{height:8px;background:var(--panel2);border:1px solid var(--line);border-radius:99px;margin:12px 0 6px;overflow:hidden}
    .col-bar>i{display:block;height:100%;background:var(--sea);border-radius:99px;min-width:4px}
    .col-tabs{display:flex;gap:6px;overflow-x:auto;margin-top:12px;padding-bottom:2px;scrollbar-width:none}
    .col-tab{flex:none;border:1px solid var(--line);background:var(--panel2);color:var(--ink);border-radius:99px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer}
    .col-tab[aria-selected="true"]{background:var(--ink);color:var(--panel);border-color:var(--ink);font-weight:800}
    .col-tab small{opacity:.7;margin-left:5px;font-size:11px;font-variant-numeric:tabular-nums}
    .col-list{padding:12px 18px 18px;overflow-y:auto;overscroll-behavior:contain;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;align-content:start}
    .col-card{border:1px solid var(--line);background:var(--panel2);color:var(--ink);border-radius:12px;padding:10px 11px;min-height:64px}
    .col-card.ranked{border-color:var(--gold)}
    .col-card b{display:block;font-size:14px;line-height:1.35;word-break:keep-all}
    .col-card .small{margin-top:4px}
    .col-card.locked{background:transparent;border-style:dashed}
    .col-card.locked b{color:var(--muted);font-weight:600;letter-spacing:.02em}
    .col-new{display:inline-block;font-size:10px;font-weight:900;color:#fff;background:var(--green);border-radius:6px;padding:1px 5px;margin-left:5px;vertical-align:2px;letter-spacing:.03em}
    .col-death{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;padding:12px 14px;border:1px solid rgba(23,120,79,.35);background:rgba(23,120,79,.08);border-radius:12px}
    .col-death b{color:var(--green)}
    .col-death>div{flex:1;min-width:180px}
    .col-x{background:var(--panel2);border:1px solid var(--line);color:var(--ink);border-radius:10px;padding:6px 12px;font:inherit;cursor:pointer}
    .col-tab:focus-visible,.col-x:focus-visible{outline:2px solid var(--sea);outline-offset:2px}
  `;
  document.head.appendChild(css);

  function label() {
    const t = totals(load());
    return `📖 도감<span class="col-count">${t.got}/${t.all}</span>`;
  }
  function refreshButtons() {
    const html = label();
    document.querySelectorAll(".col-open").forEach((b) => (b.innerHTML = html));
  }
  function makeButton(cls) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn " + cls + " col-open";
    b.addEventListener("click", () => openCollection());
    return b;
  }

  let currentTab = "ending";
  function openCollection(tab) {
    if (tab) currentTab = tab;
    document.getElementById("colOverlay")?.remove();
    const data = load();
    const t = totals(data);
    const ov = document.createElement("div");
    ov.id = "colOverlay";
    ov.className = "col-ov";
    ov.innerHTML = `<div class="panel col-box" role="dialog" aria-modal="true" aria-labelledby="colTitle">
      <div class="col-top">
        <div class="col-head"><h2 id="colTitle">📖 인생 도감</h2><button class="col-x" type="button" aria-label="닫기">닫기</button></div>
        <div class="col-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${t.all}" aria-valuenow="${t.got}"><i style="width:${t.all ? (t.got / t.all) * 100 : 0}%"></i></div>
        <div class="small">${t.got} / ${t.all} 모음 · 지금까지 ${data.lives}번의 인생 · 🏆 랭킹 도전에서 처음 얻은 칸</div>
        <div class="col-tabs" role="tablist"></div>
      </div>
      <div class="col-list" role="tabpanel" tabindex="0"></div>
    </div>`;
    const tabs = ov.querySelector(".col-tabs"),
      list = ov.querySelector(".col-list");
    function render() {
      tabs.innerHTML = CATS.map((c) => {
        const es = entries(c, data),
          got = es.filter((e) => e.rec).length,
          fresh = es.some((e) => e.rec && !e.rec.seen);
        return `<button class="col-tab" type="button" role="tab" data-id="${c.id}" aria-selected="${c.id === currentTab}">${c.name}<small>${got}/${es.length}</small>${fresh ? '<span class="col-new">N</span>' : ""}</button>`;
      }).join("");
      const cat = CATS.find((c) => c.id === currentTab) || CATS[0];
      const es = entries(cat, data).sort((a, b) => !!b.rec - !!a.rec);
      list.innerHTML = es
        .map(({ name, rec }) => {
          if (!rec) {
            const hint = cat.id === "place" && placeSea(name) ? `${placeSea(name)}의 어딘가` : "아직 모르는 인생";
            return `<div class="col-card locked"><b>🔒 ${esc(mask(name))}</b><div class="small">${esc(hint)}</div></div>`;
          }
          const meta = `${rec.life}번째 인생에서 처음${rec.n > 1 ? ` · ${rec.n}번` : ""}`;
          return `<div class="col-card${rec.ranked ? " ranked" : ""}"><b>${rec.ranked ? "🏆 " : ""}${esc(name)}${rec.seen ? "" : '<span class="col-new">NEW</span>'}</b><div class="small">${meta}</div></div>`;
        })
        .join("");
      // 이 분류를 열어 봤으면 NEW 표시를 지운다 (화면에는 이번에 한 번 더 보인다)
      let changed = false;
      for (const { name, rec } of es)
        if (rec && !rec.seen) {
          rec.seen = true;
          changed = true;
        }
      if (changed) save(data);
      tabs.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest(".col-tab");
      if (!b) return;
      currentTab = b.dataset.id;
      render();
      list.scrollTop = 0;
      tabs.querySelector(`[data-id="${currentTab}"]`)?.focus();
    });
    const close = () => {
      ov.remove();
      document.removeEventListener("keydown", onKey);
      refreshButtons();
      opener?.focus?.();
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    const opener = document.activeElement;
    ov.addEventListener("click", (e) => {
      if (e.target === ov) close();
    });
    ov.querySelector(".col-x").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    render();
    document.body.appendChild(ov);
    ov.querySelector(".col-x").focus();
  }

  /* ───────────── 사망 화면 알림 ───────────── */
  function hideDeathNotice() {
    document.getElementById("colDeath")?.remove();
  }
  function showDeathNotice(newKeys) {
    hideDeathNotice();
    const anchor = document.getElementById("ranking-death") || document.getElementById("lastResult");
    if (!anchor || !anchor.parentNode) return;
    const box = document.createElement("div");
    box.id = "colDeath";
    box.className = "col-death";
    box.setAttribute("aria-live", "polite");
    if (newKeys.length) {
      const names = newKeys.map((k) => k.split(":").slice(1).join(":"));
      const shown = names.slice(0, 3).join(", ") + (names.length > 3 ? ` 외 ${names.length - 3}개` : "");
      const firstCat = newKeys[0].split(":")[0];
      box.innerHTML = `<div><b>📖 새 도감 ${newKeys.length}칸</b><div class="small">${esc(shown)}</div></div>`;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn secondary";
      b.textContent = "도감 보기";
      b.addEventListener("click", () => openCollection(firstCat));
      box.appendChild(b);
    } else {
      const t = totals(load());
      box.innerHTML = `<div><b>📖 새 도감 칸 없음</b><div class="small">도감 ${t.got}/${t.all} · 아직 ${t.all - t.got}칸이 남았습니다</div></div>`;
      const b = makeButton("secondary");
      box.appendChild(b);
    }
    anchor.parentNode.insertBefore(box, anchor);
    refreshButtons();
  }

  /* ───────────── 게임에 연결 ───────────── */
  function record(cause) {
    if (typeof p === "undefined" || !p) return;
    p.flags = p.flags || {};
    if (p.flags.collectionRecorded) return; // 같은 죽음을 두 번 기록하지 않는다
    p.flags.collectionRecorded = true;
    const data = load();
    data.lives += 1;
    const ranked = !!p.flags.rankingChallenge;
    const fresh = [];
    for (const k of collectLife(cause)) {
      const r = data.items[k];
      if (r) r.n += 1;
      else {
        data.items[k] = { n: 1, life: data.lives, ranked, seen: false };
        fresh.push(k);
      }
    }
    save(data);
    showDeathNotice(fresh);
  }

  if (typeof afterDeath === "function") {
    const _ad = afterDeath;
    afterDeath = function (cause) {
      const r = _ad.apply(this, arguments);
      try {
        record(cause);
      } catch (e) {
        console.error("collection", e);
      }
      return r;
    };
  }
  for (const fn of ["begin", "loadGame", "continueLegacy"]) {
    try {
      const old = eval(fn);
      if (typeof old !== "function") continue;
      const wrapped = function () {
        hideDeathNotice();
        return old.apply(this, arguments);
      };
      if (fn === "begin") begin = wrapped;
      else if (fn === "loadGame") loadGame = wrapped;
      else continueLegacy = wrapped;
    } catch (e) {}
  }

  // 시작 버튼 줄(랭킹 도전 옆)에 도감 버튼을 단다. 첫 화면 상단 버튼은 두지 않는다.
  const rankBtn = document.getElementById("rankingChallengeBtn");
  if (rankBtn && rankBtn.parentNode) rankBtn.after(makeButton("secondary"));
  refreshButtons();

  // 점검용: 콘솔에서 __COLLECTION.data() 로 저장 내용을 볼 수 있다
  window.__COLLECTION = { data: load, open: openCollection, reset: () => (localStorage.removeItem(KEY), refreshButtons()) };
})();
