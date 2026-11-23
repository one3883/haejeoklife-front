/* =====================================================================
   인생 서사 시스템 (life-saga.js)
   ---------------------------------------------------------------------
   기존 연도별 시뮬레이션·직업·전투·저장 구조는 그대로 두고, 기존 함수를
   감싸는(덧붙이는) 방식으로만 동작한다. (index.html의 v52~v70 확장과 같은 방식)

   1. NPC 기억·거주지·결혼·출산·이사·이직·은퇴, 관계 변화(친구↔연인↔배우자, 라이벌↔친구)
   2. 일상 행동(공부·운동·취미·여행·가족·교류)의 누적 습관과 그 결과
   3. 수년~수십 년 뒤 돌아오는 후속 사건(약속, 첫사랑, 은사, 제자, 라이벌)
   4. 생애 단계별 사건(청소년기·청년기·중년기·노년기)과 100세까지의 노년
   5. 손주·제자·후계자, 꿈 달성 이후의 후일담, 점진적 노화
   6. 인생 연대기와 사망 시 종합 평가

   모든 상태는 p.saga 와 각 NPC 객체(JSON)에만 저장되므로 기존 저장과 호환된다.
   ===================================================================== */
(() => {
  "use strict";
  // 다른 버전의 index.html과 함께 실렸을 때 일부만 설치되는 일이 없도록, 필요한 기존 기능을 먼저 확인한다
  {
    const need = [
      "buildExtraScenes", "makeNpc", "npcName", "npcStory", "npcChoosePath", "npcTick", "npcDie", "npcsBy", "npcById",
      "achieve", "failRecord", "marry", "setDream", "retireNow", "showResult", "focusOptions", "annualDrift",
      "deathRiskBase", "deathDetails", "finalizeScenes", "fitScene", "sceneKey", "lifeRecord", "afterDeath",
      "applyLegacy", "begin", "schedule", "realAge", "lifeScale", "travelPlaces", "setCareer", "jobTitle",
      "roleLabel", "relWord", "npcDesc", "myAff", "opposed", "standing", "money", "log", "addNews", "normalize",
      "isHighNoble", "ga", "eul", "wa", "eun", "ro",
    ];
    let missing = need.filter((k) => {
      try {
        return typeof eval(k) !== "function";
      } catch (e) {
        return true;
      }
    });
    try {
      if (typeof DELAYED !== "object" || typeof NPC_FIRST !== "object" || typeof DREAMS !== "object") missing.push("DELAYED/NPC_FIRST/DREAMS");
    } catch (e) {
      missing.push("DELAYED/NPC_FIRST/DREAMS");
    }
    if (missing.length) {
      console.warn("[인생 서사] 필요한 기존 기능이 없어 확장을 건너뜁니다:", missing.join(", "));
      return;
    }
  }

  /* ───────────────────────── 기본 도구 ───────────────────────── */
  const STAGES = [
    { id: "child", name: "유년기", from: 0 },
    { id: "teen", name: "청소년기", from: 13 },
    { id: "young", name: "청년기", from: 20 },
    { id: "mid", name: "중년기", from: 35 },
    { id: "old", name: "노년기", from: 60 },
  ];
  const FAMILY = ["부모", "형제", "배우자", "자녀", "손주"];
  const WITH_ME = ["배우자", "연인", "동료"];
  const HOBBIES = {
    낚시: { verb: "낚싯대를 드리우는", skill: null, job: "어부" },
    그림: { verb: "그림을 그리는", skill: null, job: null },
    음악: { verb: "악기를 연주하는", skill: null, job: null },
    요리: { verb: "새로운 요리를 만드는", skill: "요리", job: "요리사" },
    목공: { verb: "나무를 깎고 다듬는", skill: "제작", job: "조선공" },
    원예: { verb: "작은 텃밭을 가꾸는", skill: null, job: "농부" },
    독서: { verb: "책을 읽는", skill: null, job: "학자" },
  };

  function S() {
    if (!p) return null;
    let fresh = false;
    if (!p.saga) {
      p.saga = {};
      fresh = true;
    }
    const s = p.saga;
    s.v = 1;
    s.chron = s.chron || [];
    s.habits = s.habits || {};
    s.done = s.done || {};
    s.cnt = s.cnt || {};
    s.ep = s.ep || {};
    s.chronic = s.chronic || [];
    s.hap = s.hap || 0;
    s.yrs = s.yrs || 0;
    s.hobbyLv = s.hobbyLv || 0;
    s.memoir = s.memoir || 0;
    if (fresh && p.age > 0) {
      // 이 시스템이 생기기 전의 저장: 지금까지의 큰 일만 연대기에 옮겨 둔다
      (p.achievements || []).slice(0, 12).forEach((t) =>
        s.chron.push({ a: realAge(), st: stageName(), t: `(이전 기록) ${t}`, k: "업적", w: 2 }),
      );
      s.lastPlace = p.place && p.place.name;
      s.lastJob = p.job;
      s.stage = stageOf().id;
    }
    return s;
  }
  const stageOf = (a = p.age) => {
    let r = STAGES[0];
    for (const st of STAGES) if (a >= st.from) r = st;
    return r;
  };
  const stageName = (a) => stageOf(a).name;
  const ea = (n) => (n ? n.age / (n.scale || 1) : 0);
  const realOf = (stageYears) => Math.round(stageYears * lifeScale());
  const alive = (n) => !!n && n.alive !== false;
  const done = (k) => S().done["saga_" + k] !== undefined;
  const chance = (x) => Math.random() < x;
  const pick = (a) => (a && a.length ? rand(a) : null);
  const nm = (n) => (n ? n.name : "누군가");
  const he = (n) => (n && n.gender === "여성" ? "그녀" : "그");
  const isMinorJob = () =>
    ["영아", "유아", "어린이", "학생", "가족 일을 돕는 아이", "신생아", "구직 준비생"].includes(p.job);
  const adultLife = () => p.age >= 16 && p.job !== "노예" && !isMinorJob();
  const free = () => p.job !== "노예";
  // 세계가 물에 잠긴 뒤(기존 '세계의 수몰')에는 여행·이사·고향 방문이 불가능하다
  const drowned = () => !!(p && p.age > 80 && !(p.flags && p.flags.imuDefeated));

  function chron(t, k = "일반", w = 1) {
    const s = S();
    if (!s || !t) return;
    const a = realAge();
    if (s.chron.some((e) => e.a === a && e.t === t)) return;
    s.chron.push({ a, st: stageName(), t, k, w });
    if (s.chron.length > 320) {
      // 가장 가벼운 오래된 기록부터 정리한다
      let idx = s.chron.findIndex((e) => e.w <= 1);
      if (idx < 0) idx = 0;
      s.chron.splice(idx, 1);
    }
  }
  function ensureNpc(n) {
    if (!n) return n;
    if (!Array.isArray(n.mem)) n.mem = [];
    if (n.kidsN === undefined) n.kidsN = 0;
    if (!n.home && !WITH_ME.includes(n.role)) {
      n.home =
        n.role === "부모" || n.role === "형제"
          ? (p.birthPlace || p.place).name
          : p.place
            ? p.place.name
            : null;
    }
    return n;
  }
  function homeOf(n) {
    if (!n) return null;
    if (WITH_ME.includes(n.role)) return p.place.name;
    if (n.role === "자녀" && !n.indep) return p.place.name;
    return n.home || p.place.name;
  }
  const near = (n) => homeOf(n) === p.place.name;
  function remember(n, text, tag, w = 1) {
    if (!n) return;
    ensureNpc(n);
    n.mem.push({ a: realAge(), t: text, tag: tag || null, w });
    if (n.mem.length > 12) {
      const i = n.mem.findIndex((m) => (m.w || 1) <= 1);
      n.mem.splice(i < 0 ? 0 : i, 1);
    }
    try {
      npcStory(n, text);
    } catch (e) {}
  }
  const hasMem = (n, tag) => !!(n && n.mem && n.mem.some((m) => m.tag === tag));
  const memOf = (n, tag) => (n && n.mem ? n.mem.filter((m) => m.tag === tag).pop() : null);
  function bestMemory(n) {
    if (!n || !n.mem || !n.mem.length) return null;
    return n.mem.slice().sort((a, b) => (b.w || 1) - (a.w || 1) || b.a - a.a)[0];
  }
  function setRole(n, role, why) {
    if (!n || n.role === role) return;
    n.bondHist = n.bondHist || [];
    n.bondHist.push({ a: realAge(), from: n.role, to: role });
    n.role = role;
    if (role === "친구" && n.title && /남편|아내|연인/.test(n.title)) n.title = null;
    if (why) remember(n, why, "bond", 2);
  }
  function closeNpcs(f = () => true) {
    return npcsBy((n) => f(n)).sort((a, b) => b.rel - a.rel);
  }
  function lover() {
    const s = S();
    const n = s.loverId ? npcById(s.loverId) : null;
    if (!alive(n) || n.role !== "연인") {
      s.loverId = null;
      return null;
    }
    return n;
  }
  function spouse() {
    const n = p.spouseId ? npcById(p.spouseId) : null;
    return alive(n) && n.role === "배우자" ? n : null;
  }
  const kids = () => npcsBy((n) => n.role === "자녀");
  const grandkids = () => npcsBy((n) => n.role === "손주");
  const disciples = () => npcsBy((n) => n.role === "제자");
  const famLine = (n) =>
    `${n.job}${n.spouse ? ` · 배우자 ${n.spouse}` : ""}${n.kidsN ? ` · 자녀 ${n.kidsN}명` : ""}`;
  function yrsSince(m) {
    return Math.max(1, realAge() - (m ? m.a : realAge()));
  }
  function moneyAdult(lo, hi) {
    return p.age < 16 ? ri(Math.round(lo / 1000), Math.round(hi / 1000)) : ri(lo, hi);
  }

  // 장면 생성기: 한 번만 나오는 사건은 실제로 보여졌을 때(효과·선택 실행 시) 완료로 표시한다
  function mk(key, title, body, choices, o = {}) {
    const k = "saga_" + key;
    const mark = () => {
      const s = S();
      s.done[k] = realAge();
    };
    const sc = {
      key: k,
      title,
      body,
      choices: null,
      major: true,
      cooldown: o.cd ?? 99,
      minAge: o.min ?? 0,
      saga: true,
    };
    if (o.essential) sc.essential = true;
    // 같은 해 앞선 사건으로 상황이 바뀌었으면(사망·이혼·관계 변화) 보여 주기 직전에 건너뛴다
    if (o.npc || o.valid)
      sc.valid = () =>
        (!o.npc || (alive(o.npc) && (!o.roles || o.roles.includes(o.npc.role)))) && (!o.valid || o.valid());
    if (choices) {
      sc.choices = choices
        .filter(Boolean)
        .map((c) => {
          const run = c.run;
          const w = function () {
            mark();
            try {
              return run.apply(this, arguments);
            } catch (e) {
              if (e && e.__tac) throw e; // 전략 전투 진입 신호는 그대로 넘긴다
              console.error("saga choice", key, e); // 오류가 나도 다음 장면으로 넘어가게 한다
            }
          };
          w.toString = () => String(run); // 기존 결과 표시(⏳·성향 판정)가 원래 코드를 읽도록
          return { ...c, run: w };
        });
    } else {
      sc.effect = () => {
        mark();
        try {
          if (o.effect) o.effect();
        } catch (e) {
          console.error("saga effect", key, e);
        }
      };
      sc.summary = o.summary || title;
    }
    return sc;
  }

  /* ───────────────────────── NPC 생성 보강 ───────────────────────── */
  function nameTaken(name, self) {
    if (!name) return false;
    if (p && name === p.name) return true;
    return (p.npcs || []).some((x) => x !== self && x.name === name);
  }
  // 이름을 만드는 단계에서부터 이미 있는 인물과 겹치지 않게 한다 (장면 본문에 먼저 쓰이는 이름 포함)
  {
    const _npcName = npcName;
    npcName = function (g) {
      let nm = _npcName.apply(this, arguments);
      try {
        for (let i = 0; i < 12 && p && nameTaken(nm); i++) nm = _npcName.apply(this, arguments);
      } catch (e) {}
      return nm;
    };
  }
  {
    const _makeNpc = makeNpc;
    makeNpc = function (o = {}) {
      const n = _makeNpc.apply(this, arguments);
      try {
        const fam = ["부모", "형제", "자녀", "손주"].includes(n.role);
        if (!o.name) {
          // 같은 이름의 인물이 겹치지 않게 한다 (가족은 이름만, 그 밖에는 성과 이름 전체)
          for (let i = 0; i < 12 && nameTaken(n.name, n); i++)
            n.name = fam ? rand(NPC_FIRST[n.gender]) : npcName(n.gender);
        }
        // 기존 버그: 거인족·소인족 플레이어의 또래(실제 나이로 생성)가 인간 수명 배율(1)로 늙어 금세 죽거나 200살을 넘던 문제
        const sc = lifeScale();
        if (sc > 1 && !fam && (n.scale || 1) === 1 && n.role !== "배우자" && Math.abs(n.age - realAge()) <= 6 * sc && Math.abs(n.age - p.age) > 6)
          n.scale = sc;
        ensureNpc(n);
        if (n.role === "자녀" && p.age > 0) {
          n.home = null;
          chron(`${n.title || "아이"} ${n.name} 태어남`, "가족", 3);
        }
      } catch (e) {}
      return n;
    };
  }
  // 나이 또래 인물 (종족 수명 배율을 따르도록 scale을 맞춘다)
  function peer(o = {}) {
    const sc = lifeScale();
    const stageAge = Math.max(0, (o.stageAge ?? p.age) + (o.d ?? 0));
    const n = makeNpc({ ...o, age: Math.round(stageAge * sc) });
    n.scale = sc;
    n.home = o.home || p.place.name;
    if (stageAge >= 16 && ["아이", "아기"].includes(n.job)) {
      try {
        npcChoosePath(n);
        n.pathChosen = true;
      } catch (e) {}
    }
    return n;
  }

  /* ───────────────────────── 연대기 연결 ───────────────────────── */
  {
    const _achieve = achieve;
    achieve = function (s) {
      const had = (p.achievements || []).includes(s);
      const r = _achieve.apply(this, arguments);
      if (!had) chron(`업적: ${s}`, "업적", 2);
      return r;
    };
    const _fail = failRecord;
    failRecord = function (s) {
      const had = (p.failures || []).includes(s);
      const r = _fail.apply(this, arguments);
      if (!had) chron(s, "상실", 2);
      return r;
    };
    const _marry = marry;
    marry = function (n) {
      const r = _marry.apply(this, arguments);
      try {
        // 기존 marry()는 성별이 맞지 않으면 새 이름을 붙이는데, 이때 다른 인물과 이름이 겹칠 수 있다
        for (let i = 0; i < 12 && nameTaken(n.name, n); i++) {
          n.name = npcName(n.gender);
          p.partner = n.name;
        }
        const s = S();
        s.loverId = null;
        s.marriedAt = realAge();
        n.home = null;
        remember(n, "부부가 되기로 약속한 날", "wed", 3);
        chron(`${n.name}${wa(n.name)} 결혼`, "가족", 3);
      } catch (e) {}
      return r;
    };
    const _setDream = setDream;
    setDream = function (id) {
      const r = _setDream.apply(this, arguments);
      try {
        chron(`꿈을 품다 — ${DREAMS[id].name}`, "꿈", 2);
      } catch (e) {}
      return r;
    };
    const _retire = retireNow;
    retireNow = function (why) {
      const r = _retire.apply(this, arguments);
      chron(why || "일을 내려놓고 은퇴", "직업", 2);
      S().retiredAt = realAge();
      return r;
    };
    const _npcDie = npcDie;
    npcDie = function (n, cause) {
      const r = _npcDie.apply(this, arguments);
      try {
        if (FAMILY.includes(n.role) || n.rel >= 60 || ["연인", "제자"].includes(n.role))
          chron(`${roleLabel(n)} ${n.name} 세상을 떠남 (${n.deathCause})`, "상실", 2);
        if (n.role === "연인") S().loverId = null;
      } catch (e) {}
      return r;
    };
    // 중요한 선택은 연대기에 남긴다 (선택 결과가 이미 기록됐다면 선택 자체는 중복 기록하지 않는다)
    if (typeof tacRunChoice === "function") {
      const _trc = tacRunChoice;
      tacRunChoice = function () {
        try {
          S()._mark = S().chron.length;
        } catch (e) {}
        return _trc.apply(this, arguments);
      };
    }
    const _showResult = showResult;
    showResult = function (c) {
      const r = _showResult.apply(this, arguments);
      try {
        const x = scenes && scenes[sceneIndex];
        const st = S();
        const already = st._mark != null && st.chron.length > st._mark;
        st._mark = null;
        if (x && x.promotion && c && /유지/.test(c.title)) st.promoDeclined = (st.promoDeclined || 0) + 1;
        if (x && c && !already) {
          const k = String(sceneKey(x));
          if (x.essential || x.saga || x.promotion || /^\[과거의 선택\]/.test(x.title) || /^(dream_|fam_|npc_|promise_|spared_|revenge_)/.test(k))
            chron(`${x.title.replace(/^\[과거의 선택\]\s*/, "")} — 「${c.title}」`, "선택", x.saga || x.essential ? 2 : 1);
        }
      } catch (e) {}
      return r;
    };
  }

  /* ───────────────────────── 일상 행동 (올해의 초점) ───────────────────────── */
  function focusCat(name) {
    const n = String(name || "");
    if (/제자/.test(n)) return "teach";
    if (/회고록/.test(n)) return "memoir";
    if (/여행/.test(n)) return "travel";
    if (/가족|가업|집안|손주/.test(n)) return "family";
    if (/건강 돌보기|건강·체력|산책|요양|묵묵히/.test(n)) return "health";
    if (/운동|체력|훈련|수련|단련|건강하게/.test(n)) return "exercise";
    if (/공부|학업|연구|지식|기술 연마|독서|정보 수집|전략/.test(n)) return "study";
    if (/취미|여가|특기|향락/.test(n)) return "hobby";
    if (/탐험|섬|항해|구경|탐색/.test(n)) return "travel";
    if (/친구|교우|인맥|교류|동료|부하|선원|의지|지원|선전|놀이/.test(n)) return "social";
    if (/일·|재산|권력|관리/.test(n)) return "work";
    return "other";
  }
  {
    const _fo = focusOptions;
    focusOptions = function () {
      const o = _fo.apply(this, arguments);
      try {
        if (!p || p.job === "노예" || p.status === "천룡인") return o;
        const has = (cat) => Object.keys(o).some((k) => focusCat(k) === cat);
        if (p.age >= 16) {
          if (!has("study"))
            o["독서·공부"] = {
              desc: "지식↑ · 공부 습관",
              effect: () => {
                p.knowledge = clamp(p.knowledge + 2);
              },
            };
          o["여행 떠나기"] = {
            desc: "견문·행복↑ · 돈↓ · 새 인연",
            effect: () => sagaTravelYear(),
          };
        }
        if (p.age >= 55) {
          if (grandkids().length || kids().length)
            o["손주·가족 돌보기"] = {
              desc: "가족 관계↑ · 행복↑",
              effect: () => {
                p.happiness = clamp(p.happiness + 2);
                p.relationship = clamp(p.relationship + 2);
              },
            };
          if (disciples().length)
            o["제자 가르치기"] = {
              desc: "제자 성장 · 유산↑",
              effect: () => {
                p.knowledge = clamp(p.knowledge + 1);
                p.happiness = clamp(p.happiness + 1);
              },
            };
          o["회고록 쓰기"] = {
            desc: "지난 삶을 기록 · 지식↑",
            effect: () => {
              S().memoir++;
              p.knowledge = clamp(p.knowledge + 1);
            },
          };
          o["산책·요양"] = {
            desc: "건강↑ · 노화 늦춤",
            effect: () => {
              p.health = clamp(p.health + 2);
              p.happiness = clamp(p.happiness + 1);
            },
          };
        }
        // 새로 넣은 활동의 효과에서 오류가 나도 한 해 진행이 멈추지 않게 한다
        Object.keys(o).forEach((k) => {
          const v = o[k];
          if (!v || v._safe || typeof v.effect !== "function") return;
          const eff = v.effect;
          o[k] = { ...v, _safe: true, effect: () => { try { eff(); } catch (e) { console.error("focus", k, e); } } };
        });
      } catch (e) {}
      return o;
    };
  }
  function sagaTravelYear() {
    if (drowned()) {
      p.happiness = clamp(p.happiness + 1);
      return;
    }
    const cost = moneyAdult(40000, 120000);
    if (p.money < cost) {
      p.happiness = clamp(p.happiness + 1);
      return;
    }
    p.money -= cost;
    p.knowledge = clamp(p.knowledge + 2);
    p.happiness = clamp(p.happiness + 3);
    const s = S();
    const dest = pick(travelPlaces().filter((x) => x.name !== p.place.name && x.sea === p.sea)) || pick(travelPlaces());
    if (!dest) return;
    s.trips = s.trips || [];
    if (!s.trips.includes(dest.name)) s.trips.push(dest.name);
    s.lastTrip = dest.name;
    if (chance(0.22) && npcsBy((n) => n.tripFriend).length < 3) {
      const n = peer({ role: "친구", d: ri(-6, 6), rel: ri(55, 70), home: dest.name });
      n.tripFriend = dest.name;
      remember(n, `${dest.name} 여행길에서 처음 만나 밤새 이야기를 나눔`, "trip", 2);
      chron(`${dest.name} 여행에서 ${n.name}${wa(n.name)} 친구가 됨`, "인연", 1);
    } else chron(`${dest.name}${ro(dest.name)} 여행을 다녀옴`, "일상", 1);
  }

  /* ───────────────────────── 해마다 (annualDrift 뒤) ───────────────────────── */
  function healthCap() {
    const s = S(),
      h = s.habits;
    if (p.age < 55) return 100;
    const care = Math.min(12, ((h.exercise || 0) + (h.health || 0)) * 0.5);
    return Math.max(30, Math.round(100 - (p.age - 55) * 1.15 + care - s.chronic.length * 3));
  }
  function sagaYear() {
    const s = S();
    if (!s) return;
    // 1) 생애 통계
    s.yrs++;
    s.hap += p.happiness;
    // 2) 습관 누적
    const cat = focusCat(p.focus);
    s.habits[cat] = (s.habits[cat] || 0) + 1;
    s.recent = [cat, ...(s.recent || [])].slice(0, 6);
    if (cat === "hobby") s.hobbyLv += s.hobby ? 1 : 0.5;
    // 3) 선택한 일상이 인간관계에 반영된다
    if (cat === "family") {
      npcsBy((n) => FAMILY.includes(n.role)).forEach((n) => {
        n.rel = Math.min(100, n.rel + (near(n) ? 2 : 1));
        n.lastSeen = p.age;
      });
    } else if (cat === "social") {
      const f = pick(npcsBy((n) => ["친구", "동료", "은인", "연인"].includes(n.role) && near(n)));
      if (f) {
        f.rel = Math.min(100, f.rel + 3);
        f.lastSeen = p.age;
      }
    } else if (cat === "teach") {
      disciples().forEach((d) => {
        d.power = Math.min(100, d.power + ri(2, 4));
        d.rel = Math.min(100, d.rel + 2);
        d.lastSeen = p.age;
      });
    }
    // 예전 저장의 잘못된 수명 배율 바로잡기
    if (lifeScale() > 1)
      (p.npcs || []).forEach((n) => {
        if (alive(n) && (n.scale || 1) === 1 && n.age > 110) n.scale = lifeScale();
      });
    // 연인·배우자는 함께 지낸다
    [lover(), spouse()].filter(Boolean).forEach((n) => (n.lastSeen = p.age));
    // 4) 거처·직업 변화는 연대기에 남긴다
    if (s.lastPlace && p.place && s.lastPlace !== p.place.name) chron(`${s.lastPlace}에서 ${p.place.name}${ro(p.place.name)} 거처를 옮김`, "이동", 1);
    if (s.lastJob && s.lastJob !== p.job && !isMinorJob() && p.job !== "은퇴자") chron(`${p.job}${ro(p.job)} 살아가기 시작함`, "직업", 2);
    s.lastPlace = p.place && p.place.name;
    s.lastJob = p.job;
    if (p.age >= 16 && !isMinorJob() && !["은퇴자", "노예"].includes(p.job)) {
      s.jobYears = s.jobYears || {};
      s.jobYears[p.job] = (s.jobYears[p.job] || 0) + 1;
    }
    // 5) 점진적 노화: 체력 상한이 서서히 낮아지고, 노년에는 전투 감각도 무뎌진다
    const cap = healthCap();
    if (p.health > cap) p.health = cap;
    if (p.age >= 65 && chance(0.45 - Math.min(0.3, (s.habits.exercise || 0) * 0.02))) p.combat = clamp(p.combat - 1);
    if (p.age >= 75 && chance(0.3)) p.knowledge = clamp(p.knowledge - 1);
    normalize();
  }
  {
    const _ad = annualDrift;
    annualDrift = function () {
      const r = _ad.apply(this, arguments);
      try {
        sagaYear();
      } catch (e) {
        console.error("saga year", e);
      }
      return r;
    };
  }
  // 노년의 사망 위험: 만성 질환은 높이고, 꾸준한 운동·건강 관리는 낮춘다
  {
    const _drb = deathRiskBase;
    deathRiskBase = function () {
      let b = _drb.apply(this, arguments);
      try {
        if (p.age >= 60) {
          const s = S(),
            h = s.habits;
          b *= 1 + 0.12 * s.chronic.length;
          b *= 1 - Math.min(0.2, ((h.exercise || 0) + (h.health || 0)) * 0.01);
        }
      } catch (e) {}
      return Math.min(0.55, b);
    };
  }
  // 노환으로 떠날 때는 곁을 지킨 사람들을 함께 기록한다
  {
    const _dd = deathDetails;
    deathDetails = function () {
      const d = _dd.apply(this, arguments);
      try {
        if (d && d.type === "노환" && !d._saga) return oldAgeDeath();
      } catch (e) {}
      return d;
    };
  }
  function oldAgeDeath() {
    const sp = spouse(),
      ks = kids(),
      gs = grandkids(),
      ds = disciples();
    const by = [];
    if (sp) by.push(`${sp.title} ${sp.name}`);
    if (ks.length) by.push(`${ks.length > 1 ? "자녀들" : "자녀"} ${ks.slice(0, 3).map((n) => n.name).join(", ")}`);
    if (gs.length) by.push(`손주 ${gs.length}명`);
    if (ds.length) by.push(`제자 ${ds[0].name}`);
    const friends = closeNpcs((n) => ["친구", "은인", "라이벌"].includes(n.role) && n.rel >= 60).slice(0, 2);
    if (!by.length && friends.length) by.push(`오랜 벗 ${friends.map((n) => n.name).join(", ")}`);
    const hobby = S().hobby ? ` 머리맡에는 평생 아껴 온 ${S().hobby} 도구가 놓여 있었습니다.` : "";
    return {
      type: "노환",
      _saga: true,
      detail: by.length
        ? `오랜 세월을 견뎌 온 몸이 마침내 쉼을 원했습니다. ${p.place.name}의 집에서 ${by.join(", ")}의 곁에서 조용히 눈을 감았습니다.${hobby}`
        : `오랜 세월을 견뎌 온 몸이 마침내 쉼을 원했습니다. ${p.place.name}의 작은 집에서, 창밖의 바다를 바라보며 조용히 눈을 감았습니다.${hobby}`,
    };
  }

  /* ───────────────────────── NPC의 독립된 삶 ───────────────────────── */
  function npcLifeYear() {
    const list = (p.npcs || []).filter(alive);
    for (const n of list) {
      ensureNpc(n);
      const e = ea(n);
      const close = FAMILY.includes(n.role) || n.rel >= 55 || ["연인", "제자"].includes(n.role);
      // 결혼 (플레이어의 배우자·연인·부모는 제외)
      if (
        e >= 20 && e <= 45 && !n.spouse && !n.married &&
        !["배우자", "부모", "연인", "전 배우자"].includes(n.role) &&
        chance(n.role === "자녀" ? 0.08 : 0.05)
      ) {
        const g = n.gender === "남성" ? "여성" : "남성";
        n.spouse = npcName(g);
        n.spouseGender = g;
        n.marriedAt = realAge();
        remember(n, `${n.spouse}${wa(n.spouse)} 결혼함`, "married", 1);
        if (close) schedule("saga_wedding", 0, { id: n.id });
      }
      // 출산 — 자녀가 아이를 낳으면 손주가 된다
      if (n.spouse && e >= 22 && e <= 42 && n.kidsN < 3 && chance(0.12)) {
        n.kidsN++;
        if (n.role === "자녀" && grandkids().length < 8) {
          const g = rand(["남성", "여성"]);
          let gname = rand(NPC_FIRST[g]);
          for (let i = 0; i < 12 && (p.npcs || []).some((x) => x.name === gname || x.name.split(" ")[0] === gname); i++) gname = rand(NPC_FIRST[g]);
          const gc = makeNpc({ role: "손주", title: g === "남성" ? "손자" : "손녀", gender: g, age: 0, rel: ri(65, 85), name: gname });
          gc.scale = n.scale || lifeScale();
          gc.parentId = n.id;
          gc.home = homeOf(n);
          schedule("saga_grandchild", 0, { id: gc.id });
        } else if (close && n.role !== "자녀") addNews(`${roleLabel(n)} ${n.name}에게 아이가 태어났다`);
      }
      // 자녀의 독립
      if (n.role === "자녀" && !n.indep && e >= 19 && e <= 30 && chance(0.25)) {
        n.indep = true;
        n.home = chance(0.6) ? p.place.name : (pick(travelPlaces().filter((x) => x.sea === p.sea && x.name !== p.place.name)) || p.place).name;
        schedule("saga_child_indep", 0, { id: n.id });
      }
      // 이사
      if (!drowned() && e >= 18 && !FAMILY.includes(n.role) && !WITH_ME.includes(n.role) && chance(0.03)) {
        const old = homeOf(n);
        const dest = pick(travelPlaces().filter((x) => x.name !== old));
        if (dest) {
          n.home = dest.name;
          remember(n, `${old}에서 ${dest.name}${ro(dest.name)} 이사함`, "moved", 1);
          if (n.rel >= 55 && old === p.place.name) schedule("saga_moved", 0, { id: n.id, from: old });
        }
      }
      // 이직 (민간인)
      if (n.aff === "민간인" && e >= 25 && e <= 55 && !n.retired && n.pathChosen && chance(0.03)) {
        const old = n.job;
        const nj = rand(["상인", "어부", "요리사", "의사", "조선공", "농부", "상점 주인", "대장장이", "선원", "교사", "여관 주인"].filter((x) => x !== old));
        n.job = nj;
        remember(n, `${old} 일을 그만두고 ${nj}${ga(nj)} 됨`, "job", 1);
        if (n.rel >= 60) addNews(`${roleLabel(n)} ${n.name}, ${nj}${ro(nj)} 새 출발`);
      }
      // 은퇴
      if (e >= 62 && !n.retired && !["아이", "아기", "학생"].includes(n.job) && chance(0.3)) {
        n.retired = true;
        if (n.aff === "민간인" || n.role === "부모") n.job = `은퇴한 ${String(n.job).replace(/^은퇴한 /, "")}`;
        remember(n, "일을 내려놓고 은퇴함", "retired", 1);
      }
      // 관계의 변화
      if (n.role === "친구" && n.rel < 20 && !n.estranged && e >= 16) {
        n.estranged = true;
        schedule("saga_estranged", 0, { id: n.id });
      }
      if (n.role === "친구" && n.estranged && n.rel >= 45) n.estranged = false;
    }
    // 오래 지난 사망자 정리 (가까운 사람·후속 사건에 걸린 사람은 남긴다)
    if ((p.npcs || []).length > 70) {
      const ref = new Set((p.delayed || []).map((d) => d.data && d.data.id).filter(Boolean));
      p.npcs = p.npcs.filter(
        (n) => alive(n) || FAMILY.includes(n.role) || n.rel >= 55 || ref.has(n.id) || n.id === p.spouseId,
      );
    }
  }
  {
    const _tick = npcTick;
    npcTick = function () {
      const r = _tick.apply(this, arguments);
      try {
        npcLifeYear();
      } catch (e) {
        console.error("saga npc", e);
      }
      return r;
    };
  }

  // 조부모의 이야기를 듣고 자란 손주는 그 길을 따를 가능성이 높다
  {
    const _ncp = npcChoosePath;
    npcChoosePath = function (n) {
      const r = _ncp.apply(this, arguments);
      try {
        if (n && n.role === "손주" && n.advice && n.aff !== n.advice && hasMem(n, "story") && chance(0.5)) {
          if (n.advice === "해적") { n.aff = "해적"; n.job = `해적 (${rand(NPC_CREWS)})`; n.rank = ""; }
          else if (n.advice === "해군") { n.aff = "해군"; n.job = "해군"; n.rank = NAVY_RANKS[0]; }
          else if (n.advice === "혁명군") { n.aff = "혁명군"; n.job = "혁명군"; n.rank = "대원"; }
          remember(n, "조부모의 옛이야기를 따라 같은 길을 택함", "follow", 2);
          addNews(`${n.title} ${n.name}, 어린 시절 들은 이야기를 따라 ${n.aff}의 길로`);
        }
      } catch (e) {}
      return r;
    };
  }

  /* ───────────────────────── 후속 사건 (몇 년~수십 년 뒤) ───────────────────────── */
  const D = DELAYED;
  D.saga_wedding = (d) => {
    const n = npcById(d.id);
    if (!alive(n) || !n.spouse) return null;
    const own = n.role === "자녀";
    const crush = hasMem(n, "crush") && !spouse();
    return mk(
      "wedding_" + n.id,
      own ? `${n.title} ${n.name}의 결혼식` : `${n.name}의 결혼 소식`,
      own
        ? `${n.name}${ga(n.name)} ${n.spouse}${wa(n.spouse)} 결혼합니다. 작은 손으로 당신 손가락을 쥐던 아이가 어느새 누군가의 평생을 약속하는 어른이 되었습니다.`
        : `${roleLabel(n)} ${n.name}에게서 청첩장이 왔습니다. 상대는 ${n.spouse}. ${near(n) ? "식은 이웃 동네에서 열립니다." : `식은 ${homeOf(n)}에서 열립니다.`}${crush ? "\n\n한때 마음에 품었던 사람의 결혼 소식에 마음 한구석이 저릿합니다." : ""}`,
      [
        {
          title: own ? "눈물을 참으며 축사를 한다" : "식장에 찾아가 축하한다",
          desc: "관계↑ · 돈 조금↓",
          run: () => {
            p.money -= moneyAdult(20000, 60000);
            n.rel = Math.min(100, n.rel + (own ? 8 : 10));
            n.lastSeen = p.age;
            p.happiness += own ? 8 : 4;
            remember(n, own ? "결혼식에서 부모의 축사를 들음" : "결혼식에 와서 축하해 줌", "wedding_guest", 2);
            log(`${n.name}의 결혼식에 참석함`);
          },
        },
        {
          title: "축하 편지와 선물만 보낸다",
          desc: "부담 없이 마음을 전한다.",
          run: () => {
            p.money -= moneyAdult(10000, 30000);
            n.rel = Math.min(100, n.rel + 3);
            remember(n, "결혼 축하 편지를 받음", "letter", 1);
            log(`${n.name}에게 결혼 축하 편지를 보냄`);
          },
        },
        !own && {
          title: "바빠서 그냥 넘긴다",
          desc: "관계가 조금 멀어질 수 있다.",
          run: () => {
            n.rel -= 6;
            remember(n, "결혼식에 오지 않아 서운했음", "absent", 1);
            log(`${n.name}의 결혼식에 가지 않음`);
          },
        },
      ],
      { essential: own, npc: n },
    );
  };
  D.saga_grandchild = (d) => {
    const g = npcById(d.id),
      par = g && npcById(g.parentId);
    if (!alive(g)) return null;
    const first = !S().done.saga_first_grandchild;
    return mk(
      "grandchild_" + g.id,
      first ? "첫 손주가 태어나다" : `${g.title} ${g.name}의 탄생`,
      `${par ? `${par.name}${wa(par.name)} ${par.spouse || "배우자"} 사이에서 ` : ""}${g.title} ${g.name}${ga(g.name)} 태어났습니다.${first ? " 당신을 '할아버지', '할머니'라고 부를 아이가 생겼습니다. 세월이 이렇게 흘렀나 싶어 웃음이 납니다." : ""}`,
      null,
      {
        essential: true,
        effect: () => {
          if (first) {
            S().done.saga_first_grandchild = realAge();
            achieve("손주를 보다");
          }
          p.happiness += first ? 10 : 5;
          remember(g, "태어난 날 품에 안아 줌", "born", 2);
          chron(`${g.title} ${g.name} 태어남`, "가족", first ? 3 : 2);
        },
        summary: `손주 ${g.name} 탄생`,
      },
    );
  };
  D.saga_child_indep = (d) => {
    const n = npcById(d.id);
    if (!alive(n)) return null;
    const far = homeOf(n) !== p.place.name;
    return mk(
      "child_indep_" + n.id,
      `${n.name}의 독립`,
      `${n.title} ${n.name}${ga(n.name)} 집을 떠나 스스로 살아 보겠다고 합니다. ${far ? `${homeOf(n)}${ro(homeOf(n))} 간다고 합니다.` : "같은 섬이지만 따로 집을 얻었습니다."} 짐을 싸는 뒷모습이 낯설게 느껴집니다.`,
      [
        {
          title: "등을 두드려 주며 보낸다",
          desc: "자녀와의 관계↑",
          run: () => {
            n.rel = Math.min(100, n.rel + 6);
            remember(n, "독립하던 날 부모가 등을 두드려 줌", "blessed", 2);
            p.happiness -= 2;
            log(`${n.name}의 독립을 응원함`);
          },
        },
        {
          title: "살림 밑천을 챙겨 준다",
          desc: "돈↓ · 자녀 관계↑↑",
          req: { money: moneyAdult(100000, 100000) },
          run: () => {
            p.money -= moneyAdult(100000, 300000);
            n.rel = Math.min(100, n.rel + 10);
            remember(n, "독립할 때 부모에게 살림 밑천을 받음", "blessed", 2);
            log(`${n.name}에게 살림 밑천을 챙겨 줌`);
          },
        },
        {
          title: "아직 이르다며 붙잡는다",
          desc: "곁에 남지만 서운함이 쌓인다.",
          run: () => {
            n.indep = false;
            n.home = null;
            n.rel -= 8;
            remember(n, "독립하려다 부모에게 붙잡힘", "held", 1);
            log(`${n.name}의 독립을 말림`);
          },
        },
      ],
      { npc: n, roles: ["자녀"] },
    );
  };
  D.saga_moved = (d) => {
    const n = npcById(d.id);
    if (!alive(n)) return null;
    return mk(
      "moved_" + n.id,
      `${n.name}, 먼 곳으로 떠나다`,
      `${roleLabel(n)} ${n.name}${ga(n.name)} ${n.home}${ro(n.home)} 이사를 가게 되었습니다. "자주 연락할게." 그렇게 말했지만, 둘 다 그게 쉽지 않다는 걸 압니다.`,
      [
        {
          title: "배웅하며 다시 만나자고 약속한다",
          desc: "언젠가 다시 만날 인연을 남긴다.",
          run: () => {
            n.rel = Math.min(100, n.rel + 4);
            remember(n, `떠나는 날 부두에서 다시 만나자고 약속함`, "farewell", 2);
            schedule("saga_visit_far", ri(5, 12), { id: n.id });
            log(`${n.name}${wa(n.name)} 다시 만나기로 약속함`);
          },
        },
        {
          title: "짧게 인사만 나눈다",
          desc: "",
          run: () => {
            remember(n, "짧은 작별 인사", "farewell", 1);
            log(`${n.name}${wa(n.name)} 작별함`);
          },
        },
      ],
      { npc: n },
    );
  };
  D.saga_visit_far = (d) => {
    const n = npcById(d.id);
    if (!alive(n) || n.rel < 35) return null;
    const m = memOf(n, "farewell");
    return mk(
      "visit_far_" + n.id,
      "[과거의 선택] 바다 건너 온 편지",
      `${homeOf(n)}의 ${n.name}에게서 편지가 왔습니다. "${yrsSince(m)}년 전 부두에서 한 약속, 기억해? 이제 나는 ${famLine(n)}(으)로 살고 있어. 한 번 놀러 와."`,
      [
        {
          title: "배를 타고 찾아간다",
          desc: "돈↓ · 행복↑ · 관계↑↑",
          run: () => {
            p.money -= moneyAdult(50000, 120000);
            p.happiness += 7;
            n.rel = Math.min(100, n.rel + 12);
            n.lastSeen = p.age;
            remember(n, `약속대로 ${homeOf(n)}까지 찾아와 줌`, "visited", 3);
            log(`${homeOf(n)}의 ${n.name}${eul(n.name)} 찾아감`);
          },
        },
        {
          title: "긴 답장을 쓴다",
          desc: "관계↑",
          run: () => {
            n.rel = Math.min(100, n.rel + 4);
            n.lastSeen = p.age;
            remember(n, "긴 답장을 주고받음", "letter", 1);
            log(`${n.name}에게 답장을 보냄`);
          },
        },
      ],
      { npc: n, valid: () => !["배우자", "전 배우자"].includes(n.role) },
    );
  };
  D.saga_estranged = (d) => {
    const n = npcById(d.id);
    if (!alive(n) || n.role !== "친구") return null;
    const m = bestMemory(n);
    return mk(
      "estranged_" + n.id,
      `멀어진 친구, ${n.name}`,
      `언제부턴가 ${n.name}${wa(n.name)} 연락이 끊겼습니다.${m ? ` ${realAge() - m.a}년 전 '${m.t}' 무렵만 해도 이렇지 않았는데.` : ""} 길에서 마주쳐도 어색하게 고개만 숙이는 사이가 되었습니다.`,
      [
        {
          title: "먼저 찾아가 술 한잔 청한다",
          desc: "관계 회복을 시도한다.",
          run: () => {
            if (chance(0.55 + p.relationship / 300)) {
              n.rel = 50;
              n.estranged = false;
              remember(n, "어색함을 깨고 먼저 찾아와 줌", "reconcile", 2);
              log(`${n.name}${wa(n.name)} 다시 가까워짐`);
            } else {
              n.rel -= 5;
              log(`${n.name}${ga(n.name)} 마음을 열지 않음`);
            }
          },
        },
        {
          title: "그런 인연도 있다며 놓아준다",
          desc: "",
          run: () => {
            remember(n, "서로 멀어짐", "drift", 1);
            log(`${n.name}${wa(n.name)}의 인연을 놓아줌`);
          },
        },
      ],
      { npc: n, roles: ["친구"] },
    );
  };
  // 어린 시절의 약속 — 15~25년 뒤
  D.saga_promise = (d) => {
    const n = npcById(d.id);
    if (!n || n.promise || ["배우자", "전 배우자"].includes(n.role)) return null;
    if (!alive(n))
      return mk(
        "promise_" + d.id,
        "[과거의 선택] 지켜지지 못한 약속",
        `${d.what}. 어린 날 ${n.name}${wa(n.name)} 한 약속이 떠올랐습니다. 하지만 ${n.name}${ga(n.name)} 먼저 세상을 떠나 그 약속은 지킬 수 없게 되었습니다. 당신은 약속했던 그 자리에 혼자 가 보았습니다.`,
        null,
        { essential: true, effect: () => { p.happiness -= 4; p.knowledge += 2; }, summary: `${n.name}${wa(n.name)}의 약속을 혼자 기억함` },
      );
    const opp = opposed(n.aff, myAff());
    const life = `${n.name}${eun(n.name)} ${n.job}${n.rank ? `(${n.rank})` : ""}${ro(n.job)} 살고 있었고${n.spouse ? `, ${n.spouse}${wa(n.spouse)} 가정을 꾸렸으며` : ""}${n.kidsN ? ` 아이가 ${n.kidsN}명 있었습니다` : " 아직 혼자였습니다"}.`;
    const choices = opp
      ? [
          {
            title: "오늘만은 서로의 깃발을 내려놓는다",
            desc: "적이 된 친구와 하룻밤 옛이야기를 나눈다.",
            run: () => {
              n.rel = Math.min(100, n.rel + 15);
              p.happiness += 6;
              remember(n, "적이 된 뒤에도 약속을 지키러 와 줌", "promise_kept", 3);
              schedule("spared_return", ri(3, 8), { id: n.id });
              log(`적이 된 친구 ${n.name}${wa(n.name)} 약속을 지킴`);
            },
          },
          {
            title: "지금은 적이라며 돌아선다",
            desc: "",
            run: () => {
              n.rel -= 15;
              remember(n, "약속 장소에서 등을 돌림", "promise_broken", 2);
              log(`${n.name}${wa(n.name)}의 약속 장소에서 돌아섬`);
            },
          },
        ]
      : [
          {
            title: "부둥켜안고 밤새 이야기한다",
            desc: "관계↑↑ · 행복↑",
            run: () => {
              n.rel = Math.min(100, n.rel + 18);
              n.lastSeen = p.age;
              p.happiness += 8;
              remember(n, `${yrsSince(memOf(n, "promise"))}년 만에 약속을 지킴`, "promise_kept", 3);
              achieve("어린 날의 약속을 지킴");
              log(`${n.name}${wa(n.name)} 어린 날의 약속을 지킴`);
            },
          },
          {
            title: "어색하게 안부만 묻고 헤어진다",
            desc: "",
            run: () => {
              n.rel += 2;
              remember(n, "약속 장소에서 어색하게 재회", "promise_kept", 1);
              log(`${n.name}${wa(n.name)} 짧게 재회함`);
            },
          },
        ];
    return mk(
      "promise_" + n.id,
      "[과거의 선택] 어린 날의 약속",
      `${d.what}. 문득 그 약속이 떠올라 약속한 장소에 가 보니, 정말로 ${n.name}${ga(n.name)} 기다리고 있었습니다.\n\n${life}${opp ? `\n\n하지만 지금 ${n.name}${eun(n.name)} ${n.aff}, 당신은 ${myAff()}. 서로에게 칼을 겨눠야 하는 처지입니다.` : ""}`,
      choices,
      { essential: true, npc: n, valid: () => !["배우자", "전 배우자"].includes(n.role) },
    );
  };
  // 첫사랑 — 15~30년 뒤
  D.saga_firstlove = (d) => {
    const n = npcById(d.id);
    if (!alive(n)) return null;
    const meFree = !spouse() && !lover();
    const nFree = !n.spouse && !["배우자", "연인"].includes(n.role);
    const m = memOf(n, "firstlove");
    const yrs = yrsSince(m);
    if (meFree && nFree && n.gender !== p.gender && ea(n) < 65)
      return mk(
        "firstlove_" + n.id,
        "[과거의 선택] 첫사랑과의 재회",
        `${homeOf(n) === p.place.name ? "시장 골목" : `${p.place.name}의 항구`}에서 누군가 당신의 이름을 불렀습니다. ${n.name}. ${yrs}년 전 '${m ? m.t : "첫사랑"}' 그 사람입니다. 둘 다 아직 혼자라는 걸 알고 나서, 이상하게 웃음이 나왔습니다.`,
        [
          {
            title: "이번에는 놓치지 않는다",
            desc: "다시 연인이 된다.",
            run: () => {
              setRole(n, "연인", `${yrs}년 만에 다시 만나 연인이 됨`);
              n.title = "연인";
              n.home = null;
              n.rel = Math.max(n.rel, 80);
              S().loverId = n.id;
              S().loverSince = realAge();
              p.happiness += 10;
              chron(`첫사랑 ${n.name}${wa(n.name)} 다시 연인이 됨`, "인연", 3);
              log(`첫사랑 ${n.name}${wa(n.name)} 다시 사랑을 시작함`);
            },
          },
          {
            title: "좋은 추억으로 남겨 둔다",
            desc: "",
            run: () => {
              n.rel = Math.min(100, n.rel + 5);
              remember(n, "다시 만났지만 추억으로 남겨 둠", "firstlove_end", 2);
              log(`첫사랑 ${n.name}${wa(n.name)} 웃으며 헤어짐`);
            },
          },
        ],
        { essential: true, npc: n, valid: () => !spouse() && !lover() && !n.spouse && !["배우자", "전 배우자", "연인"].includes(n.role) },
      );
    return mk(
      "firstlove_" + n.id,
      "[과거의 선택] 첫사랑의 소식",
      `오랜만에 ${n.name}의 소식을 들었습니다. ${yrs}년 전의 그 사람은 지금 ${famLine(n)}(으)로 살고 있다고 합니다.${spouse() ? ` 당신 곁에는 ${spouse().name}${ga(spouse().name)} 있습니다.` : ""} 잠시 그 시절의 바닷바람 냄새가 떠올랐다가 사라졌습니다.`,
      null,
      { effect: () => { p.happiness += 2; remember(n, "서로의 안부를 전해 들음", "firstlove_end", 1); }, summary: `첫사랑 ${n.name}의 소식을 들음` },
    );
  };
  // 은사의 추천
  D.saga_teacher = (d) => {
    const n = npcById(d.id);
    if (!alive(n) || !adultLife()) return null;
    const civ = p.status === "민간인";
    return mk(
      "teacher_" + n.id,
      "[과거의 선택] 은사의 편지",
      `어린 시절 당신을 눈여겨보던 ${n.name} 선생님에게서 편지가 왔습니다. "그때 끝까지 남아 공부하던 네 모습을 기억한다. 내 오랜 친구가 믿을 만한 사람을 찾는데, 너를 추천해도 되겠니?"`,
      [
        civ && {
          title: "추천을 받아 학자의 길을 걷는다",
          desc: "직업이 학자로 바뀐다.",
          req: { knowledge: 35 },
          run: () => {
            setCareer("학자", "민간인");
            n.rel = Math.min(100, n.rel + 10);
            remember(n, "추천서를 받아 학자가 됨", "teacher_rec", 3);
            log("은사의 추천으로 학자가 됨");
          },
        },
        {
          title: "감사 인사를 드리러 찾아간다",
          desc: "지식↑ · 관계↑",
          run: () => {
            p.knowledge += 4;
            n.rel = Math.min(100, n.rel + 8);
            n.lastSeen = p.age;
            remember(n, "어른이 되어 감사 인사를 하러 옴", "thanks", 2);
            log(`은사 ${n.name}${eul(n.name)} 찾아감`);
          },
        },
        {
          title: "정중히 사양한다",
          desc: "",
          run: () => {
            remember(n, "추천을 정중히 사양함", "teacher_rec", 1);
            log("은사의 추천을 사양함");
          },
        },
      ],
      { npc: n },
    );
  };
  // 도움을 받았던 친구의 보답
  D.saga_help_return = (d) => {
    const n = npcById(d.id);
    if (!alive(n) || n.rel < 40) return null;
    return mk(
      "help_return_" + n.id,
      "[과거의 선택] 돌아온 은혜",
      `${n.name}${ga(n.name)} 찾아왔습니다. "${yrsSince(memOf(n, "helped"))}년 전 내가 무너졌을 때 네가 손을 내밀어 줬지. 이번엔 내 차례야." 그동안 ${n.job}${ro(n.job)} 자리를 잡은 ${n.name}${eun(n.name)} 당신에게 진심 어린 보답을 건넸습니다.`,
      null,
      {
        essential: true,
        effect: () => {
          p.money += moneyAdult(150000, 500000);
          p.happiness += 6;
          p.relationship += 4;
          n.rel = Math.min(100, n.rel + 10);
          remember(n, "예전에 받은 도움을 갚음", "repaid", 3);
        },
        summary: `${n.name}${ga(n.name)} 예전의 은혜를 갚음`,
        npc: n,
      },
    );
  };
  // 라이벌과의 마지막 승부 — 노년
  D.saga_rival_last = (d) => {
    const n = npcById(d.id);
    if (!alive(n)) return null;
    return mk(
      "rival_last_" + n.id,
      "[과거의 선택] 마지막 승부",
      `머리가 하얗게 센 ${n.name}${ga(n.name)} 지팡이를 짚고 찾아왔습니다. "${yrsSince(memOf(n, "rival_vow"))}년 전에 말했지. 끝까지 겨루자고. 이제 칼은 못 들어도, 장기 한 판이면 충분하겠지?"`,
      [
        {
          title: "진지하게 한 판 둔다",
          desc: "평생의 경쟁에 마침표를 찍는다.",
          run: () => {
            const win = chance(0.5 + (p.knowledge - 50) / 300);
            setRole(n, "친구", win ? "마지막 승부에서 져 주고도 웃음" : "마지막 승부에서 이기고 크게 웃음");
            n.rel = Math.min(100, n.rel + 25);
            p.happiness += 8;
            achieve("평생의 라이벌과 화해함");
            log(`평생의 라이벌 ${n.name}${wa(n.name)} 마지막 승부를 겨룸 — ${win ? "승리" : "패배"}`);
          },
        },
        {
          title: "승부 대신 차를 끓인다",
          desc: "",
          run: () => {
            setRole(n, "친구", "승부 대신 차를 마시며 지난날을 이야기함");
            n.rel = Math.min(100, n.rel + 18);
            p.happiness += 5;
            log(`라이벌 ${n.name}${wa(n.name)} 차를 마심`);
          },
        },
      ],
      { essential: true, npc: n, roles: ["라이벌", "원수", "친구"] },
    );
  };
  // 제자의 독립과 명성
  D.saga_disciple_indep = (d) => {
    const n = npcById(d.id);
    if (!alive(n) || n.role !== "제자") return null;
    return mk(
      "disciple_indep_" + n.id,
      `제자 ${n.name}의 독립`,
      `${n.name}${ga(n.name)} 무릎을 꿇고 말했습니다. "스승님께 배운 것을 세상에서 시험해 보고 싶습니다." 처음 찾아왔을 때의 서툰 아이는 이제 어디에 내놓아도 부끄럽지 않은 ${n.discArt || "기술"}의 소유자가 되었습니다.`,
      [
        {
          title: "아끼던 물건을 정표로 건넨다",
          desc: "제자 관계↑ · 훗날 이름을 떨칠 가능성↑",
          run: () => {
            n.rel = Math.min(100, n.rel + 10);
            n.power = Math.min(100, n.power + 6);
            n.indep = true;
            remember(n, "독립하던 날 스승에게 정표를 받음", "token", 3);
            schedule("saga_disciple_fame", ri(8, 15), { id: n.id });
            log(`제자 ${n.name}${eul(n.name)} 세상으로 보냄`);
          },
        },
        {
          title: "아직 멀었다며 붙잡는다",
          desc: "곁에 남지만 서운함이 쌓인다.",
          run: () => {
            n.rel -= 10;
            n.power = Math.min(100, n.power + 3);
            remember(n, "독립하려다 스승에게 붙잡힘", "held", 1);
            schedule("saga_disciple_indep", ri(3, 5), { id: n.id });
            log(`제자 ${n.name}의 독립을 미룸`);
          },
        },
      ],
      { npc: n, roles: ["제자"] },
    );
  };
  D.saga_disciple_fame = (d) => {
    const n = npcById(d.id);
    if (!alive(n)) return null;
    const good = n.rel >= 50 && n.power >= 40;
    return mk(
      "disciple_fame_" + n.id,
      good ? `[과거의 선택] 이름을 떨친 제자` : `[과거의 선택] 엇나간 제자`,
      good
        ? `신문 한구석에 낯익은 이름이 실렸습니다. '${n.name}, ${n.discArt || "그 분야"}의 새 별'. 인터뷰 말미에 그는 이렇게 덧붙였습니다. "제게 모든 것을 가르쳐 준 스승, ${p.name}께 이 영광을 돌립니다."`
        : `오래전 떠나보낸 제자 ${n.name}의 소식이 들려왔습니다. 배운 것을 엉뚱한 곳에 쓰며 사람들의 원성을 사고 있다고 합니다. 당신의 이름이 함께 오르내립니다.`,
      good
        ? null
        : [
            {
              title: "직접 찾아가 꾸짖는다",
              desc: "제자를 바로잡으려 한다.",
              run: () => {
                if (chance(0.5 + p.relationship / 400)) {
                  n.rel = 60;
                  remember(n, "스승의 꾸짖음을 듣고 바로잡음", "corrected", 3);
                  p.reputation += 3;
                  log(`제자 ${n.name}${eul(n.name)} 바로잡음`);
                } else {
                  setRole(n, "원수", "스승의 꾸짖음에 등을 돌림");
                  n.rel = 10;
                  log(`제자 ${n.name}${ga(n.name)} 등을 돌림`);
                }
              },
            },
            {
              title: "그 또한 제자의 인생이라며 침묵한다",
              desc: "",
              run: () => {
                p.reputation -= 2;
                p.happiness -= 3;
                remember(n, "스승은 끝내 침묵함", "silence", 1);
                log(`제자 ${n.name}의 일에 침묵함`);
              },
            },
          ],
      good
        ? {
            essential: true,
            effect: () => {
              p.reputation += 6;
              p.happiness += 8;
              achieve("제자가 이름을 떨침");
              remember(n, "스승에게 영광을 돌림", "honor", 3);
            },
            summary: `제자 ${n.name}${ga(n.name)} 이름을 떨침`,
          }
        : {},
    );
  };
  // 부모의 유품 — 다음 세대로 이어 살 때
  D.saga_inherit = (d) => {
    if (!d || !d.parent) return null;
    const hl = (d.highlights || []).slice(0, 5).map((x) => `· ${x}`).join("\n");
    return mk(
      "inherit",
      `${d.parent}의 유품`,
      `열여덟이 되던 해, 가족이 오래 보관해 둔 상자를 건넸습니다. ${d.parent}${ga(d.parent)} ${d.heir ? "후계자로 지목한 당신에게" : "당신에게"} 남긴 것입니다.${d.memoir ? " 손때 묻은 회고록 한 권이 함께 들어 있었습니다." : ""}\n\n${hl || "· 평범하지만 성실했던 삶의 흔적들"}\n\n그 이름이 걸어간 길이 이제 당신 앞에 놓여 있습니다.`,
      [
        {
          title: `${d.parent}의 뜻을 잇는다`,
          desc: "유산을 받아들이고 부모의 길을 의식하며 산다.",
          run: () => {
            p.money += d.heir ? moneyAdult(300000, 900000) : moneyAdult(80000, 200000);
            p.knowledge += d.memoir ? 6 : 3;
            p.happiness += 4;
            achieve("부모의 뜻을 이어받음");
            log(`${d.parent}의 뜻을 잇기로 함`);
          },
        },
        {
          title: "고마움만 간직하고 내 길을 간다",
          desc: "",
          run: () => {
            p.happiness += 3;
            p.knowledge += 2;
            log(`${d.parent}의 유품을 간직하고 나만의 길을 가기로 함`);
          },
        },
      ],
      { essential: true },
    );
  };
  // 이별 장면에 함께한 기억을 덧붙인다
  {
    const _nd = D.npc_death;
    D.npc_death = (d) => {
      const s = _nd(d);
      try {
        const n = npcById(d.id);
        if (s && n) {
          const m = bestMemory(n);
          const lines = [];
          if (m) lines.push(`가장 오래 남은 기억은 ${realAge() - m.a > 0 ? `${realAge() - m.a}년 전` : "얼마 전"}의 일입니다 — '${m.t}'.`);
          if (n.role === "부모" && hasMem(n, "neglect")) lines.push("간병을 미뤘던 날들이 뒤늦게 가슴을 칩니다.");
          if (n.role === "부모" && hasMem(n, "cared")) lines.push("마지막 몇 해를 곁에서 지킨 것이 그나마 위안이 됩니다.");
          if (n.role === "손주") lines.push("어린 생명을 먼저 보내는 일은 어떤 말로도 위로되지 않았습니다.");
          if (lines.length) s.body += "\n\n" + lines.join(" ");
        }
      } catch (e) {}
      return s;
    };
  }

  /* ───────────────────────── 세계의 수몰과 인연의 구조 ───────────────────────── */
  // 기존 사건(80세 이후 세계 침수)은 그대로 두되, 평생 쌓은 인연이 피난을 도울 수 있다
  if (typeof floodScene === "function") {
    const _flood = floodScene;
    floodScene = function () {
      const base = _flood.apply(this, arguments);
      try {
        const s = S();
        if (s.floodRolled) return base;
        s.floodRolled = true;
        const helpers = closeNpcs((n) => (FAMILY.includes(n.role) || ["친구", "은인", "제자", "동료", "연인"].includes(n.role)) && n.rel >= 65 && ea(n) >= 16);
        const odds = Math.min(0.85, 0.15 + helpers.length * 0.1 + (p.vessel || p.ship ? 0.2 : 0) + (p.money > 5000000 ? 0.1 : 0));
        if (!helpers.length && !p.vessel && !p.ship) return base;
        if (!chance(odds)) return base;
        const h = helpers[0];
        const safe = places.find((x) => x.name === "엔젤 아일랜드") || places.find((x) => x.name === "어인섬");
        if (!safe) return base;
        return mk(
          "flood_rescue",
          "차오르는 바다, 내민 손",
          `바다가 섬을 삼키기 시작한 날, ${h ? `${roleLabel(h)} ${h.name}${ga(h.name)}` : "당신의 배가"} 물보라를 헤치고 나타났습니다. ${h ? `"${bestMemory(h) ? `${bestMemory(h).t}… 그날을 잊은 적 없어. ` : ""}이번엔 내가 데리러 왔어."` : "평생 몰아 온 배가 마지막으로 당신을 태웠습니다."}\n\n물에 잠기는 세상을 뒤로하고, 당신은 바다가 닿지 않는 ${safe.name}${ro(safe.name)} 피난했습니다.`,
          null,
          {
            essential: true,
            effect: () => {
              p.place = safe;
              p.sea = safe.sea;
              p.happiness -= 8;
              if (h) {
                h.rel = Math.min(100, h.rel + 15);
                h.home = safe.name;
                remember(h, "세계가 잠기던 날 손을 내밀어 구해 줌", "rescue", 3);
              }
              npcsBy((n) => ["배우자", "연인"].includes(n.role) || (n.role === "자녀" && !n.indep)).forEach((n) => (n.home = null));
              achieve("세계 침수에서 인연의 손에 구조됨");
              chron(`세계가 물에 잠기던 날 ${h ? h.name : "배"}의 도움으로 ${safe.name}${ro(safe.name)} 피난함`, "인연", 3);
            },
            summary: `${h ? h.name : "배"}의 도움으로 수몰을 피함`,
          },
        );
      } catch (e) {
        return base;
      }
    };
  }

  /* ───────────────────────── 생애 단계 ───────────────────────── */
  function stageScene() {
    const s = S(),
      cur = stageOf();
    if (!s.stage) s.stage = cur.id;
    if (s.stage === cur.id || cur.id === "child") return null;
    if (p.age !== cur.from && s.stage) {
      // 불러오기 등으로 경계를 건너뛰었으면 조용히 갱신만 한다
      if (p.age > cur.from + 1) {
        s.stage = cur.id;
        return null;
      }
    }
    const prev = STAGES[STAGES.findIndex((x) => x.id === cur.id) - 1];
    const past = s.chron.filter((e) => e.st === prev.name && e.k !== "단계").sort((a, b) => b.w - a.w || a.a - b.a).slice(0, 3).sort((a, b) => a.a - b.a);
    const recap = past.length ? past.map((e) => `· ${e.a}세 — ${e.t}`).join("\n") : "· 큰 일 없이 조용히 흘러간 시간";
    const text = {
      teen: `몸도 마음도 부쩍 자랐습니다. 어른들의 말에 고개를 갸웃하기 시작했고, 친구들과의 비밀이 늘었습니다. 이제 청소년기입니다.`,
      young: `이제 누구의 아이가 아니라 한 사람의 어른으로 불립니다. 일과 사랑, 그리고 스스로 고른 길의 무게가 어깨에 얹힙니다. 청년기가 시작되었습니다.`,
      mid: `거울 속 얼굴에 세월이 조금씩 내려앉았습니다. 지켜야 할 것이 늘었고, 이루지 못한 것도 보이기 시작합니다. 중년기에 들어섰습니다.`,
      old: `젊은 날처럼 몸이 따라 주지는 않지만, 대신 세상을 보는 눈이 깊어졌습니다. 이제 노년기입니다. 남은 날들을 무엇으로 채울지는 여전히 당신의 몫입니다.`,
    }[cur.id];
    return mk(
      "stage_" + cur.id,
      `${cur.name}의 문턱`,
      `${text}\n\n지난 ${prev.name}을 돌아보면:\n${recap}`,
      null,
      {
        essential: true,
        effect: () => {
          s.stage = cur.id;
          chron(`${cur.name}에 접어듦 (${p.place.name}, ${jobTitle()})`, "단계", 2);
        },
        summary: `${cur.name}에 접어듦`,
      },
    );
  }
  function centenaryScene() {
    if (p.age < 100 || done("centenary") || isHighNoble()) return null;
    const ks = kids(),
      gs = grandkids(),
      sp = spouse();
    const guests = [sp && `${sp.title} ${sp.name}`, ks.length && `자녀 ${ks.length}명`, gs.length && `손주 ${gs.length}명`, ...closeNpcs((n) => !FAMILY.includes(n.role) && n.rel >= 60).slice(0, 2).map((n) => n.name)].filter(Boolean);
    return mk(
      "centenary",
      "백 번째 봄",
      `${realAge()}번째 생일. ${guests.length ? `${guests.join(", ")}${ga(guests.join(", "))} 모여` : "이웃들이 모여"} 작은 잔치를 열어 주었습니다. 촛불을 끄며 당신은 지나온 길을 하나씩 떠올립니다. ${S().chron.filter((e) => e.w >= 3).slice(-3).map((e) => `${e.a}세의 '${e.t}'`).join(", ") || "평범했던 하루하루"}. 참 길고도 짧은 인생이었습니다.`,
      null,
      {
        essential: true,
        effect: () => {
          p.happiness += 10;
          achieve("백 세를 맞이함");
          if (p.age >= 100 && !(p.flags && p.flags.deathCause)) p.flags.deathCause = oldAgeDeath();
        },
        summary: "백 세 잔치",
      },
    );
  }

  /* ───────────────────────── 인간관계 서사 ───────────────────────── */
  function romanceScenes(out) {
    const s = S(),
      a = p.age;
    const lv = lover();
    // 청소년기 첫사랑
    if (a >= 14 && a <= 18 && !done("teen_firstlove") && !lv && free()) {
      const opp = p.gender === "남성" ? "여성" : "남성";
      let n = pick(npcsBy((x) => ["친구", "라이벌"].includes(x.role) && x.gender === opp && Math.abs(ea(x) - a) <= 3 && x.rel >= 40));
      const isNew = !n;
      out.push(
        mk(
          "teen_firstlove",
          "설레는 마음",
          isNew
            ? `요즘 들어 자꾸 눈이 가는 아이가 있습니다. 같은 동네에 사는 또래인데, 그 아이가 웃으면 하루 종일 기분이 좋습니다.`
            : `${n.name}${wa(n.name)} 늘 함께 지냈는데, 언제부턴가 그 아이 앞에서는 말이 꼬이고 얼굴이 달아오릅니다.`,
          [
            {
              title: "용기를 내 마음을 전한다",
              desc: "첫사랑의 결말은 아무도 모른다.",
              run: () => {
                if (!n) n = peer({ role: "친구", gender: opp, d: ri(-1, 1), rel: ri(50, 65) });
                const ok = chance(0.45 + n.rel / 250 + p.happiness / 500);
                if (ok) {
                  n.rel = Math.min(100, n.rel + 15);
                  remember(n, "바닷가에서 서로 첫사랑이 됨", "firstlove", 3);
                  remember(n, "첫사랑의 설렘", "crush", 1);
                  p.happiness += 8;
                  s.firstLoveId = n.id;
                  chron(`${n.name}${wa(n.name)} 첫사랑을 시작함`, "인연", 3);
                  log(`${n.name}${wa(n.name)} 첫사랑을 시작함`);
                } else {
                  n.rel = Math.max(20, n.rel - 5);
                  remember(n, "고백했지만 친구로 남자는 답을 들음", "crush", 2);
                  p.happiness -= 4;
                  chron(`${n.name}에게 고백했지만 거절당함`, "인연", 2);
                  log(`${n.name}에게 고백했지만 거절당함`);
                }
              },
            },
            {
              title: "마음속에만 간직한다",
              desc: "아무도 모르는 첫사랑.",
              run: () => {
                if (!n) n = peer({ role: "친구", gender: opp, d: ri(-1, 1), rel: ri(45, 60) });
                remember(n, "말하지 못한 첫사랑", "crush", 2);
                schedule("saga_firstlove", ri(15, 28), { id: n.id });
                p.knowledge += 1;
                log("첫사랑을 마음속에 간직함");
              },
            },
          ],
          { min: 13, valid: () => !lover() && !spouse() },
        ),
      );
    }
    // 첫사랑의 갈림길 (18~20세)
    const fl = s.firstLoveId && npcById(s.firstLoveId);
    if (alive(fl) && a >= 18 && a <= 21 && !done("firstlove_fork") && !spouse() && fl.role !== "연인") {
      out.push(
        mk(
          "firstlove_fork",
          "첫사랑의 갈림길",
          `${fl.name}${ga(fl.name)} ${homeOf(fl) === p.place.name ? "먼 섬으로 일을 하러 떠나게 되었다고" : "새로운 곳에서 살게 되었다고"} 말했습니다. 어린 날의 사랑을 이어 갈지, 각자의 길을 갈지 정해야 합니다.`,
          [
            {
              title: "함께하자고 말한다",
              desc: "연인이 되어 같은 길을 걷는다.",
              run: () => {
                setRole(fl, "연인", "어린 날의 사랑을 이어 가기로 함");
                fl.title = "연인";
                fl.home = null;
                s.loverId = fl.id;
                s.loverSince = realAge();
                p.happiness += 6;
                log(`첫사랑 ${fl.name}${wa(fl.name)} 연인이 됨`);
              },
            },
            {
              title: "각자의 꿈을 응원하며 헤어진다",
              desc: "언젠가 다시 만날지도 모른다.",
              run: () => {
                const dest = pick(travelPlaces().filter((x) => x.name !== p.place.name));
                if (dest) fl.home = dest.name;
                remember(fl, "서로의 꿈을 응원하며 헤어짐", "firstlove", 3);
                schedule("saga_firstlove", ri(15, 28), { id: fl.id });
                p.happiness -= 5;
                chron(`첫사랑 ${fl.name}${wa(fl.name)} 헤어짐`, "인연", 2);
                log(`첫사랑 ${fl.name}${wa(fl.name)} 헤어짐`);
              },
            },
          ],
          { essential: true, npc: fl, valid: () => fl.role !== "연인" && !spouse() && !lover() },
        ),
      );
    }
    // 청년·중년의 연애
    if (!lv && !spouse() && a >= 20 && a <= 50 && free()) {
      const opp = p.gender === "남성" ? "여성" : "남성";
      const c = closeNpcs((x) => ["친구", "동료", "은인"].includes(x.role) && x.gender === opp && x.rel >= 70 && !x.spouse && Math.abs(ea(x) - a) <= 10 && ea(x) >= 18)[0];
      if (c && !done("love_" + c.id))
        out.push(
          mk(
            "love_" + c.id,
            `${c.name}에게 끌리는 마음`,
            `${c.name}${wa(c.name)} 함께 있으면 시간이 빨리 갑니다. ${bestMemory(c) ? `'${bestMemory(c).t}' 그날 이후로` : "언제부턴가"} 친구 이상의 마음이 자랐다는 걸 둘 다 눈치채고 있습니다.`,
            [
              {
                title: "연인이 되어 달라고 말한다",
                desc: "관계가 연인으로 바뀐다.",
                run: () => {
                  if (chance(0.55 + c.rel / 300)) {
                    setRole(c, "연인", "친구에서 연인이 됨");
                    c.title = "연인";
                    c.home = null;
                    s.loverId = c.id;
                    s.loverSince = realAge();
                    p.happiness += 8;
                    chron(`${c.name}${wa(c.name)} 연인이 됨`, "인연", 3);
                    log(`${c.name}${wa(c.name)} 연인이 됨`);
                  } else {
                    c.rel -= 10;
                    remember(c, "고백을 받았지만 친구로 남기로 함", "crush", 2);
                    p.happiness -= 4;
                    log(`${c.name}${ga(c.name)} 친구로 남자고 함`);
                  }
                },
              },
              {
                title: "지금의 우정을 지킨다",
                desc: "",
                run: () => {
                  c.rel = Math.min(100, c.rel + 3);
                  remember(c, "마음을 접고 좋은 친구로 남음", "crush", 1);
                  log(`${c.name}${wa(c.name)} 친구로 남기로 함`);
                },
              },
            ],
            { cd: 99, npc: c, roles: ["친구", "동료", "은인"], valid: () => !spouse() && !lover() && !c.spouse },
          ),
        );
    }
    // 연인과의 시간 → 청혼
    if (lv) {
      const yrs = realAge() - (s.loverSince ?? realAge());
      if (yrs >= realOf(2) && !done("propose_" + lv.id))
        out.push(
          mk(
            "propose_" + lv.id,
            `${lv.name}${wa(lv.name)}의 미래`,
            `${lv.name}${wa(lv.name)} 만난 지 ${yrs}년. 함께한 계절이 쌓여 이제 서로 없는 내일은 잘 떠오르지 않습니다.`,
            [
              {
                title: "청혼한다",
                desc: "평생을 함께하기로 한다.",
                run: () => {
                  marry(lv);
                  p.happiness += 12;
                },
              },
              {
                title: "아직은 지금 이대로가 좋다",
                desc: "몇 년 뒤 다시 생각한다.",
                run: () => {
                  lv.rel -= 4;
                  s.loverSince = realAge();
                  delete s.done["saga_propose_" + lv.id];
                  log(`${lv.name}에게 청혼을 미룸`);
                },
              },
              {
                title: "서로의 길이 다르다며 헤어진다",
                desc: "",
                run: () => {
                  setRole(lv, "친구", "연인이었지만 각자의 길을 가기로 함");
                  lv.title = null;
                  lv.rel = Math.max(10, lv.rel - 30);
                  lv.home = p.place.name;
                  s.loverId = null;
                  p.happiness -= 10;
                  chron(`${lv.name}${wa(lv.name)} 이별`, "인연", 2);
                  log(`${lv.name}${wa(lv.name)} 헤어짐`);
                },
              },
            ],
            { essential: yrs >= realOf(4), npc: lv, roles: ["연인"], valid: () => !spouse() },
          ),
        );
      else if (opposed(lv.aff, myAff()) && !done("lover_conflict_" + lv.id))
        out.push(
          mk(
            "lover_conflict_" + lv.id,
            "엇갈린 깃발",
            `${lv.name}${eun(lv.name)} ${lv.aff}, 당신은 ${myAff()}. 사랑하는 사람이 내일은 적이 될 수도 있습니다.`,
            [
              {
                title: "함께 모든 것을 버리고 떠나자고 한다",
                desc: "",
                run: () => {
                  lv.aff = "민간인";
                  lv.job = "선원";
                  lv.rel = Math.min(100, lv.rel + 10);
                  remember(lv, "사랑을 위해 소속을 버림", "sacrifice", 3);
                  log(`${lv.name}${ga(lv.name)} 당신을 위해 소속을 버림`);
                },
              },
              {
                title: "각자의 신념을 존중한다",
                desc: "",
                run: () => {
                  lv.rel -= 5;
                  remember(lv, "서로의 신념을 존중하기로 함", "respect", 2);
                  log(`${lv.name}${wa(lv.name)} 서로의 길을 존중하기로 함`);
                },
              },
            ],
            { npc: lv, roles: ["연인"] },
          ),
        );
    }
  }
  function rivalScenes(out) {
    const a = p.age;
    const rv = pick(npcsBy((n) => n.role === "라이벌" && ea(n) >= 16));
    if (rv && a >= 25 && !done("rival_cross_" + rv.id))
      out.push(
        mk(
          "rival_cross_" + rv.id,
          `오랜 라이벌, ${rv.name}`,
          `어릴 때부터 사사건건 부딪쳤던 ${rv.name}${wa(rv.name)} 우연히 같은 술집에 앉게 되었습니다. ${rv.name}${eun(rv.name)} 지금 ${npcDesc(rv)}. 서로 많이 변했지만, 눈빛만은 그대로입니다.`,
          [
            {
              title: "잔을 내밀며 화해를 청한다",
              desc: "라이벌이 친구가 될 수 있다.",
              run: () => {
                if (chance(0.45 + rv.rel / 200)) {
                  setRole(rv, "친구", "오랜 경쟁 끝에 술잔을 나누며 친구가 됨");
                  rv.rel = Math.max(rv.rel, 60);
                  log(`라이벌 ${rv.name}${wa(rv.name)} 친구가 됨`);
                } else {
                  rv.rel += 5;
                  remember(rv, "화해의 잔을 거절했지만 표정이 누그러짐", "respect", 2);
                  log(`${rv.name}${ga(rv.name)} 잔을 받지 않음`);
                }
              },
            },
            {
              title: "끝까지 겨루자고 맹세한다",
              desc: "평생의 라이벌로 남는다. 노년에 다시 만난다.",
              run: () => {
                rv.rel += 6;
                remember(rv, "죽을 때까지 겨루자고 맹세함", "rival_vow", 3);
                schedule("saga_rival_last", Math.max(5, 68 - p.age + ri(0, 8)), { id: rv.id });
                log(`${rv.name}${wa(rv.name)} 평생의 승부를 맹세함`);
              },
            },
          ],
          { npc: rv, roles: ["라이벌"] },
        ),
      );
  }
  function promiseScenes(out) {
    const a = p.age;
    const existing = (p.npcs || []).some((x) => x.promise) || (p.delayed || []).some((d) => d.id === "promise_reunion");
    if (a >= 9 && a <= 15 && !done("promise") && !existing && free()) {
      const f = typeof bestFriend === "function" ? bestFriend(false) : null;
      const n = f || pick(npcsBy((x) => x.role === "친구" && Math.abs(ea(x) - a) <= 3));
      if (n)
        out.push(
          mk(
            "promise",
            "등대 아래의 약속",
            `해 질 녘, ${n.name}${wa(n.name)} 등대 아래 앉아 바다를 봤습니다. "우리 어른이 돼서 뭐가 되든, 서른 즈음에 꼭 여기서 다시 만나자." ${n.name}${ga(n.name)} 새끼손가락을 내밀었습니다.`,
            [
              {
                title: "새끼손가락을 건다",
                desc: "언젠가 돌아올 약속.",
                run: () => {
                  remember(n, "등대 아래에서 서른에 다시 만나자고 약속함", "promise", 3);
                  n.rel = Math.min(100, n.rel + 6);
                  schedule("saga_promise", Math.max(12, 30 - p.age + ri(-2, 3)), { id: n.id, what: `${realAge()}세 무렵 등대 아래에서 한 약속` });
                  chron(`${n.name}${wa(n.name)} 등대 아래에서 약속함`, "인연", 2);
                  log(`${n.name}${wa(n.name)} 어른이 되어 다시 만나자고 약속함`);
                },
              },
              {
                title: "그런 건 유치하다며 웃어넘긴다",
                desc: "",
                run: () => {
                  n.rel -= 3;
                  remember(n, "약속을 웃어넘김", "promise_refused", 1);
                  log(`${n.name}의 약속을 웃어넘김`);
                },
              },
            ],
            { min: 0 },
          ),
        );
    }
  }
  function teacherScenes(out) {
    const a = p.age,
      s = S();
    if (a >= 8 && a <= 14 && !done("teacher") && (s.habits.study || 0) >= 2 && free())
      out.push(
        mk(
          "teacher",
          "눈여겨보는 어른",
          `동네에서 아이들을 가르치는 어른이 수업이 끝난 뒤 당신을 불러 세웠습니다. "요즘 늦게까지 남아 공부하더구나. 궁금한 게 있으면 언제든 찾아오렴."`,
          [
            {
              title: "그날부터 매일 찾아간다",
              desc: "지식↑ · 평생의 은사가 생긴다.",
              run: () => {
                const t = makeNpc({ role: "은인", title: "선생님", age: realAge() + realOf(ri(25, 40)), job: "교사", rel: ri(65, 80), power: 5 });
                t.scale = lifeScale();
                remember(t, "늦게까지 남아 공부하던 아이를 제자처럼 아낌", "teacher", 3);
                p.knowledge += 5;
                schedule("saga_teacher", Math.max(4, 20 - p.age + ri(0, 4)), { id: t.id });
                chron(`평생의 은사 ${t.name} 선생님을 만남`, "인연", 2);
                log(`${t.name} 선생님에게 배우기 시작함`);
              },
            },
            {
              title: "고개만 꾸벅 숙이고 돌아간다",
              desc: "",
              run: () => {
                p.knowledge += 1;
                log("선생님의 말에 고개만 숙임");
              },
            },
          ],
          { min: 0 },
        ),
      );
  }
  function friendNeedScene(out) {
    if (!adultLife() || p.age < 22) return;
    const n = pick(npcsBy((x) => ["친구", "은인", "동료"].includes(x.role) && x.rel >= 50 && ea(x) >= 20 && !hasMem(x, "helped") && !hasMem(x, "refused_help")));
    if (!n || done("friend_need_" + n.id)) return;
    const what = rand(["빚에 쫓기고", "가게가 망해 갈 곳이 없고", "몸을 크게 다쳐 일을 못 하고", "가족을 잃고 술에 빠져 지내고"]);
    out.push(
      mk(
        "friend_need_" + n.id,
        `무너진 친구, ${n.name}`,
        `${n.name}${ga(n.name)} ${what} 있다는 소식을 들었습니다. 찾아가 보니 예전의 ${n.personality} 모습은 온데간데없었습니다.`,
        [
          {
            title: "곁을 지키며 다시 일어설 때까지 돕는다",
            desc: "돈과 시간이 들지만, 언젠가 돌아올지도 모른다.",
            req: { money: moneyAdult(100000, 100000) },
            run: () => {
              p.money -= moneyAdult(100000, 250000);
              p.happiness -= 2;
              n.rel = Math.min(100, n.rel + 20);
              remember(n, "가장 힘들 때 곁을 지켜 줌", "helped", 3);
              schedule("saga_help_return", ri(6, 15), { id: n.id });
              log(`무너진 친구 ${n.name}의 곁을 지킴`);
            },
          },
          {
            title: "위로의 말만 건넨다",
            desc: "",
            run: () => {
              n.rel += 2;
              remember(n, "위로의 말을 건넴", "comfort", 1);
              log(`${n.name}에게 위로의 말을 건넴`);
            },
          },
          {
            title: "내 코가 석 자다",
            desc: "관계가 크게 나빠진다.",
            run: () => {
              n.rel -= 25;
              remember(n, "가장 힘들 때 외면당함", "refused_help", 3);
              log(`${n.name}의 어려움을 외면함`);
            },
          },
        ],
        { npc: n, roles: ["친구", "은인", "동료"] },
      ),
    );
  }

  /* ───────────────────────── 습관의 결과 ───────────────────────── */
  function habitScenes(out) {
    const s = S(),
      h = s.habits,
      a = p.age;
    if (!free()) return;
    // 취미 고르기
    if (!s.hobby && a >= 9 && ((h.hobby || 0) >= 1 || a >= 18) && !done("hobby_pick"))
      out.push(
        mk(
          "hobby_pick",
          "마음이 가는 일",
          "남는 시간이면 자꾸 손이 가는 일이 생겼습니다. 누가 시키지 않아도 즐거운 일. 평생 곁에 두게 될지도 모릅니다.",
          Object.entries(HOBBIES)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map(([k, v]) => ({
              title: `${k}`,
              desc: `${v.verb} 시간이 즐겁다.`,
              run: () => {
                s.hobby = k;
                s.hobbyLv = Math.max(1, s.hobbyLv);
                p.happiness += 3;
                chron(`취미로 ${k}${eul(k)} 시작함`, "일상", 1);
                log(`취미로 ${k}${eul(k)} 시작함`);
              },
            })),
          { min: 0 },
        ),
      );
    if (s.hobby && s.hobbyLv >= 3 && !done("hobby_club") && a >= 12)
      out.push(
        mk(
          "hobby_club",
          `${s.hobby} 모임`,
          `${s.hobby}${eul(s.hobby)} 좋아하는 사람들이 모이는 작은 모임이 있다는 걸 알게 되었습니다. 문을 열고 들어가자 비슷한 눈빛을 가진 사람이 손을 흔들었습니다.`,
          [
            {
              title: "모임에 들어간다",
              desc: "같은 취미의 친구가 생긴다.",
              run: () => {
                const n = peer({ role: "친구", d: ri(-8, 8), rel: ri(55, 70) });
                n.hobby = s.hobby;
                remember(n, `${s.hobby} 모임에서 처음 만남`, "hobby", 2);
                s.hobbyLv += 1;
                p.happiness += 3;
                log(`${s.hobby} 모임에서 ${n.name}${wa(n.name)} 친구가 됨`);
              },
            },
            {
              title: "혼자 즐기는 게 좋다",
              desc: "",
              run: () => {
                s.hobbyLv += 1;
                log(`${s.hobby}${eul(s.hobby)} 혼자 즐기기로 함`);
              },
            },
          ],
          { min: 0 },
        ),
      );
    if (s.hobby && s.hobbyLv >= 7 && !done("hobby_master") && a >= 16) {
      const H = HOBBIES[s.hobby] || {};
      out.push(
        mk(
          "hobby_master",
          `${s.hobby}의 경지`,
          `오랜 세월 ${H.verb || "몰두해 온"} 시간이 쌓여, 이제 사람들이 당신의 ${s.hobby} 솜씨를 보러 일부러 찾아옵니다. 동네에서 작은 대회와 전시를 열어 보자는 제안이 들어왔습니다.`,
          [
            {
              title: "사람들 앞에 실력을 내보인다",
              desc: "명성↑ · 돈↑",
              run: () => {
                p.reputation += 3;
                p.money += moneyAdult(80000, 260000);
                p.happiness += 5;
                achieve(`${s.hobby}의 명인`);
                log(`${s.hobby} 솜씨로 이름이 알려짐`);
              },
            },
            H.job && adultLife() && p.status === "민간인" && p.job !== H.job && {
              title: `아예 ${H.job}${ro(H.job)} 살아 본다`,
              desc: "취미가 직업이 된다.",
              run: () => {
                setCareer(H.job, "민간인");
                p.happiness += 6;
                log(`취미였던 ${s.hobby}${ro(s.hobby)} ${H.job}${ga(H.job)} 됨`);
              },
            },
            {
              title: "그저 좋아서 하는 일로 남긴다",
              desc: "행복↑",
              run: () => {
                p.happiness += 6;
                log(`${s.hobby}${eul(s.hobby)} 소박한 즐거움으로 남김`);
              },
            },
          ],
        ),
      );
    }
    // 공부
    if ((h.study || 0) >= 4 && !done("study_fruit") && a >= 12)
      out.push(
        mk(
          "study_fruit",
          "쌓인 공부의 힘",
          `몇 해 동안 꾸준히 붙든 공부가 어느 순간 서로 이어지기 시작했습니다. 예전엔 어렵던 책이 술술 읽히고, 어른들도 당신에게 의견을 묻습니다.`,
          null,
          { effect: () => { p.knowledge += 6; p.reputation += 1; }, summary: "꾸준한 공부가 결실을 맺음" },
        ),
      );
    if ((h.study || 0) >= 8 && adultLife() && p.status === "민간인" && !["학자", "의사 견습"].includes(p.job) && !done("study_offer"))
      out.push(
        mk(
          "study_offer",
          "배움이 연 문",
          `오랜 공부가 소문이 나, 학자 모임과 마을 의원에서 함께 일하자는 제안이 동시에 왔습니다.`,
          [
            { title: "학자가 된다", desc: "직업이 학자로 바뀐다.", req: { knowledge: 40 }, run: () => { setCareer("학자", "민간인"); log("공부 끝에 학자가 됨"); } },
            { title: "의원에서 의술을 배운다", desc: "직업이 의사 견습으로 바뀐다.", run: () => { setCareer("의사 견습", "민간인"); log("공부 끝에 의원에서 일하게 됨"); } },
            { title: "지금 일을 계속한다", desc: "지식↑", run: () => { p.knowledge += 3; log("배움을 지금의 일에 보태기로 함"); } },
          ],
        ),
      );
    // 운동
    if ((h.exercise || 0) + (h.health || 0) >= 4 && !done("body_fruit") && a >= 12)
      out.push(
        mk("body_fruit", "단단해진 몸", "꾸준히 몸을 움직인 덕분에 숨이 덜 차고 잔병치레가 줄었습니다. 거울 속 자신이 조금 자랑스럽습니다.", null, {
          effect: () => { p.health += 6; p.combat += 2; },
          summary: "꾸준한 운동으로 몸이 단단해짐",
        }),
      );
    if ((h.exercise || 0) >= 7 && a >= 16 && a <= 50 && !done("tournament"))
      out.push(
        mk(
          "tournament",
          "섬 대항 체력 대회",
          `${p.place.name}에서 섬 대항 체력 대회가 열립니다. 그동안 단련한 몸을 시험해 볼 기회입니다.`,
          [
            {
              title: "출전한다",
              desc: "승패에 따라 명성과 상금이 달라진다.",
              req: { health: 40 },
              run: () => {
                if (chance(0.35 + p.combat / 200 + p.health / 400)) {
                  p.reputation += 4;
                  p.money += moneyAdult(60000, 200000);
                  achieve("섬 대항 체력 대회 우승");
                  log("섬 대항 체력 대회에서 우승함");
                } else {
                  p.health -= ri(2, 6);
                  p.happiness += 2;
                  log("체력 대회에서 아깝게 짐");
                }
              },
            },
            { title: "응원석에서 즐긴다", desc: "", run: () => { p.happiness += 2; log("체력 대회를 구경함"); } },
          ],
        ),
      );
    if ((h.exercise || 0) + (h.health || 0) >= 12 && a >= 60 && !done("vigor"))
      out.push(
        mk("vigor", "노익장", "또래들이 지팡이를 짚을 때, 당신은 아침마다 해변을 걷습니다. 젊어서부터 쌓아 온 습관이 노년의 몸을 지켜 주고 있습니다.", null, {
          effect: () => { p.health += 8; achieve("노익장을 과시함"); },
          summary: "평생의 운동 습관이 노년을 지켜 줌",
        }),
      );
    // 여행
    if ((h.travel || 0) >= 5 && (s.trips || []).length >= 3 && !done("travelogue") && a >= 18)
      out.push(
        mk(
          "travelogue",
          "여행기를 쓰다",
          `${(s.trips || []).slice(-4).join(", ")}… 다녀온 곳들의 기억을 정리하다 보니 공책 한 권이 가득 찼습니다. 출판사에서 책으로 내자는 연락이 왔습니다.`,
          [
            { title: "책으로 낸다", desc: "명성↑ · 돈↑", run: () => { p.reputation += 3; p.money += moneyAdult(60000, 180000); achieve("여행기를 출간함"); log("여행기를 출간함"); } },
            { title: "내 서랍 속에 둔다", desc: "행복↑", run: () => { p.happiness += 4; log("여행 공책을 서랍에 간직함"); } },
          ],
        ),
      );
    // 가족
    if ((h.family || 0) >= 5 && (spouse() || kids().length) && !done("family_table"))
      out.push(
        mk("family_table", "식탁 위의 웃음", `바쁜 날에도 가족과의 저녁만은 거르지 않았습니다. 오늘도 식탁에는 시시콜콜한 이야기와 웃음이 오갑니다. 아이들은 훗날 이 저녁들을 가장 오래 기억하게 될 것입니다.`, null, {
          effect: () => {
            npcsBy((n) => FAMILY.includes(n.role)).forEach((n) => {
              n.rel = Math.min(100, n.rel + 6);
              remember(n, "함께한 저녁 식탁", "family_time", 2);
            });
            p.happiness += 5;
          },
          summary: "가족과의 시간이 쌓임",
        }),
      );
    const neglect = (s.recent || []).slice(0, 5).filter((c) => c === "work").length >= 4;
    if (neglect && (spouse() || kids().some((k) => ea(k) < 18)) && !done("neglect_" + Math.floor(p.age / 10)))
      out.push(
        mk(
          "neglect_" + Math.floor(p.age / 10),
          "비어 있는 자리",
          `몇 해째 일에만 매달렸습니다. 오랜만에 일찍 들어온 날, ${spouse() ? `${spouse().name}${ga(spouse().name)}` : "아이가"} 낯선 사람을 보듯 당신을 쳐다봅니다.`,
          [
            {
              title: "일을 줄이고 가족에게 돌아간다",
              desc: "돈↓ · 가족 관계↑",
              run: () => {
                p.focus = Object.keys(focusOptions()).find((k) => focusCat(k) === "family") || p.focus;
                npcsBy((n) => FAMILY.includes(n.role)).forEach((n) => (n.rel = Math.min(100, n.rel + 5)));
                p.money -= moneyAdult(30000, 80000);
                log("일을 줄이고 가족에게 돌아가기로 함");
              },
            },
            {
              title: "다 가족을 위해서라며 버틴다",
              desc: "가족의 서운함이 쌓인다.",
              run: () => {
                npcsBy((n) => ["배우자", "자녀"].includes(n.role)).forEach((n) => {
                  n.rel -= 8;
                  remember(n, "늘 일 때문에 집에 없었음", "absent_parent", 2);
                });
                log("가족보다 일을 택함");
              },
            },
          ],
        ),
      );
    // 교류
    if ((h.social || 0) >= 6 && a >= 20 && !done("town_helper"))
      out.push(
        mk("town_helper", "마을의 해결사", "이웃의 다툼을 중재하고 결혼식마다 얼굴을 비추다 보니, 동네에서 무슨 일만 생기면 다들 당신부터 찾습니다.", null, {
          effect: () => { p.relationship += 6; p.reputation += 2; },
          summary: "마을에서 신망을 얻음",
        }),
      );
  }

  /* ───────────────────────── 생애 단계별 일상 ───────────────────────── */
  function teenPool(out) {
    const a = p.age,
      s = S();
    if (a < 13 || a > 19 || !free()) return;
    const par = pick(npcsBy((n) => n.role === "부모"));
    if (a >= 15 && !done("teen_exam"))
      out.push(
        mk(
          "teen_exam",
          "중요한 시험",
          `앞으로의 진로가 걸린 시험 날이 다가왔습니다. ${(s.habits.study || 0) >= 3 ? "그동안 붙든 공부가 든든합니다." : "지난 몇 해 공부를 소홀히 한 게 마음에 걸립니다."}`,
          [
            {
              title: "밤을 새워 마지막 정리를 한다",
              desc: "공부 습관이 결과를 좌우한다.",
              run: () => {
                const ok = chance(0.3 + (s.habits.study || 0) * 0.08 + p.knowledge / 250);
                p.health -= 2;
                if (ok) {
                  p.knowledge += 6;
                  achieve("중요한 시험에 합격함");
                  if (par) remember(par, "시험 합격 소식에 함께 기뻐함", "proud", 2);
                  log("중요한 시험에 합격함");
                } else {
                  p.happiness -= 4;
                  log("시험에서 원하는 결과를 얻지 못함");
                }
              },
            },
            { title: "컨디션을 지키며 일찍 잔다", desc: "", run: () => { const ok = chance(0.25 + (s.habits.study || 0) * 0.09); if (ok) { p.knowledge += 4; log("시험을 무난히 통과함"); } else { p.happiness -= 2; log("시험 결과가 아쉬움"); } } },
          ],
          { min: 13 },
        ),
      );
    if (a >= 15 && a <= 18 && !done("teen_parttime") && p.family !== "천룡인 가문")
      out.push(
        mk(
          "teen_parttime",
          "첫 아르바이트",
          `항구 근처 가게에서 일손을 구한다고 합니다. 처음으로 내 손으로 돈을 벌어 볼 기회입니다.`,
          [
            {
              title: "일해 본다",
              desc: "돈↑ · 함께 일한 또래와 인연",
              run: () => {
                p.money += ri(80, 240);
                const n = peer({ role: "친구", d: ri(-1, 2), rel: ri(50, 65) });
                n.title = "알바 동료";
                remember(n, "항구 가게에서 함께 땀 흘림", "work_together", 2);
                log("첫 아르바이트를 함");
              },
            },
            { title: "아직은 공부가 먼저다", desc: "지식↑", run: () => { p.knowledge += 2; log("아르바이트 대신 공부를 택함"); } },
          ],
          { min: 13 },
        ),
      );
    if (par && a >= 14 && a <= 18 && !done("teen_future_talk"))
      out.push(
        mk(
          "teen_future_talk",
          "부모와의 밤",
          `${par.title} ${par.name}${ga(par.name)} 늦은 밤 마루에 앉아 물었습니다. "너는 커서 뭘 하고 싶니?"`,
          [
            {
              title: "속마음을 털어놓는다",
              desc: "부모와 가까워진다.",
              run: () => {
                par.rel = Math.min(100, par.rel + 8);
                remember(par, "밤늦게 아이의 꿈 이야기를 들어 줌", "talk", 2);
                p.happiness += 3;
                log(`${par.title}에게 꿈을 털어놓음`);
              },
            },
            {
              title: "몰라, 하고 방으로 들어간다",
              desc: "",
              run: () => {
                par.rel -= 3;
                remember(par, "아이가 대화를 피함", "teen_silence", 1);
                log("부모와의 대화를 피함");
              },
            },
          ],
          { min: 13 },
        ),
      );
  }
  function youngPool(out) {
    const a = p.age;
    if (a < 18 || a > 34 || !adultLife()) return;
    const par = pick(npcsBy((n) => n.role === "부모"));
    if (par && !done("first_pay") && p.careerStartAge != null && p.status !== "천룡인")
      out.push(
        mk(
          "first_pay",
          "첫 월급",
          `처음으로 내 힘으로 번 돈이 손에 쥐어졌습니다. 묵직한 봉투를 보니 ${par.title} ${par.name}의 얼굴이 떠오릅니다.`,
          [
            {
              title: "부모님께 선물을 산다",
              desc: "부모 관계↑",
              run: () => {
                p.money -= moneyAdult(20000, 50000);
                par.rel = Math.min(100, par.rel + 10);
                remember(par, "자식의 첫 월급 선물을 받고 눈시울을 붉힘", "gift", 3);
                log(`첫 월급으로 ${par.title}께 선물을 드림`);
              },
            },
            { title: "미래를 위해 모아 둔다", desc: "돈↑", run: () => { p.money += moneyAdult(20000, 40000); log("첫 월급을 저축함"); } },
            { title: "나를 위해 마음껏 쓴다", desc: "행복↑", run: () => { p.money -= moneyAdult(10000, 30000); p.happiness += 5; log("첫 월급으로 나에게 선물함"); } },
          ],
        ),
      );
    if (!done("independence") && a >= 19 && a <= 28 && npcsBy((n) => n.role === "부모" && near(n)).length && !p.ship && p.status !== "천룡인")
      out.push(
        mk(
          "independence",
          "나만의 방",
          "부모님 집을 떠나 처음으로 나만의 방을 얻을지 고민합니다. 자유롭지만, 생활비와 외로움은 오롯이 내 몫입니다.",
          [
            {
              title: "독립한다",
              desc: "행복↑ · 돈↓ · 부모와 거리가 생긴다.",
              run: () => {
                S().indep = realAge();
                p.money -= moneyAdult(30000, 80000);
                p.happiness += 4;
                npcsBy((n) => n.role === "부모").forEach((n) => remember(n, "자식이 독립해 집을 나감", "child_left", 2));
                chron("부모님 집을 떠나 독립함", "일상", 2);
                log("부모님 집을 떠나 독립함");
              },
            },
            { title: "조금 더 함께 산다", desc: "돈↑ · 가족 관계↑", run: () => { p.money += moneyAdult(20000, 50000); npcsBy((n) => n.role === "부모").forEach((n) => (n.rel = Math.min(100, n.rel + 3))); log("부모님과 함께 살기로 함"); } },
          ],
        ),
      );
    const co = pick(npcsBy((n) => n.role === "친구" && near(n) && ea(n) >= 18 && n.rel >= 45 && n.rel < 80));
    if (co && !done("friend_day_" + co.id))
      out.push(
        mk(
          "friend_day_" + co.id,
          `${co.name}${wa(co.name)}의 하루`,
          `쉬는 날, ${co.name}${ga(co.name)} 불쑥 찾아왔습니다. "${rand(["바다낚시 가자", "새로 생긴 술집 가 보자", "언덕 위에서 노을 보자", "시장 구경이나 가자"])}." 별일 없는 하루지만, 이런 날이 오래 기억에 남곤 합니다.`,
          [
            {
              title: "함께 하루를 보낸다",
              desc: "관계↑ · 행복↑",
              run: () => {
                co.rel = Math.min(100, co.rel + 8);
                co.lastSeen = p.age;
                p.happiness += 4;
                remember(co, rand(["함께 바다낚시를 한 하루", "노을을 보며 시시콜콜한 이야기를 나눈 날", "시장에서 실컷 웃던 날"]), "fun", 2);
                log(`${co.name}${wa(co.name)} 즐거운 하루를 보냄`);
              },
            },
            { title: "피곤하다며 다음으로 미룬다", desc: "", run: () => { co.rel -= 2; p.health += 1; log(`${co.name}의 약속을 미룸`); } },
          ],
          { cd: 6, npc: co, roles: ["친구"] },
        ),
      );
  }
  function midPool(out) {
    const a = p.age,
      s = S();
    if (a < 35 || a > 62 || !free()) return;
    // 동창회: 어린 시절 인연들의 지금을 실제 NPC 기록으로 보여 준다
    const old = (p.npcs || []).filter((n) => n.metAge != null && n.metAge < 18 && !FAMILY.includes(n.role) && n.role !== "연인");
    const decade = Math.floor(a / 10);
    if (old.length >= 2 && !done("reunion_" + decade) && a >= 38 && Object.keys(S().done).filter((k) => /^saga_reunion_/.test(k)).length < 3 && chance(0.6)) {
      const lines = old.slice(0, 5).map((n) => (alive(n) ? `· ${n.name} — ${npcDesc(n)}${n.spouse ? `, ${n.spouse}${wa(n.spouse)} 결혼` : ""}${n.kidsN ? `, 아이 ${n.kidsN}명` : ""}${homeOf(n) !== p.place.name ? ` (${homeOf(n)}에 삶)` : ""}` : `· ${n.name} — 이미 세상을 떠남 (${n.deathCause || "사인 미상"})`));
      out.push(
        mk(
          "reunion_" + decade,
          "어린 시절 친구들의 모임",
          `어린 시절 함께 뛰놀던 이들이 오랜만에 모였습니다. 다들 세월을 정통으로 맞은 얼굴입니다.\n\n${lines.join("\n")}`,
          [
            {
              title: "밤새 옛이야기를 나눈다",
              desc: "옛 인연과의 관계↑",
              run: () => {
                old.filter(alive).forEach((n) => {
                  n.rel = Math.min(100, n.rel + 5);
                  n.lastSeen = p.age;
                  remember(n, `${realAge()}세 무렵 동창 모임에서 다시 만남`, "class_reunion", 1);
                });
                p.happiness += 6;
                log("어린 시절 친구들과 밤새 이야기함");
              },
            },
            { title: "잠깐 얼굴만 비친다", desc: "", run: () => { p.happiness += 2; log("동창 모임에 잠깐 들름"); } },
          ],
        ),
      );
    }
    if (a >= 40 && a <= 55 && !done("health_warning"))
      out.push(
        mk(
          "health_warning",
          "의원의 경고",
          `정기 검진을 받던 날, 의원이 얼굴을 찌푸렸습니다. "이대로 가면 몇 년 안에 큰일 납니다. 생활을 바꾸셔야 해요."`,
          [
            {
              title: "생활 습관을 바꾼다",
              desc: "건강 관리 습관이 생긴다.",
              run: () => {
                s.habits.health = (s.habits.health || 0) + 3;
                p.health += 5;
                p.happiness -= 1;
                p.focus = Object.keys(focusOptions()).find((k) => focusCat(k) === "health") || p.focus;
                log("의원의 경고를 듣고 생활을 바꿈");
              },
            },
            {
              title: "괜찮겠지, 하고 넘긴다",
              desc: "훗날 만성 질환이 생길 수 있다.",
              run: () => {
                s.warnIgnored = true;
                log("의원의 경고를 흘려들음");
              },
            },
          ],
        ),
      );
    const par = closeNpcs((n) => n.role === "부모" && ea(n) >= 68)[0];
    if (par && !done("parent_care_" + par.id))
      out.push(
        mk(
          "parent_care_" + par.id,
          `늙으신 ${par.title}`,
          `${par.title} ${par.name}${ga(par.name)} 부쩍 기력이 떨어졌습니다. ${near(par) ? "같은 섬에 살지만" : `${homeOf(par)}에 홀로 계시고,`} 혼자 지내시기엔 힘들어 보입니다.`,
          [
            {
              title: "곁에서 직접 모신다",
              desc: "돈·행복 조금↓ · 부모의 여생이 길어진다.",
              run: () => {
                par.caredUntil = p.age + 10;
                par.rel = Math.min(100, par.rel + 12);
                remember(par, "늙은 몸을 자식이 곁에서 돌봐 줌", "cared", 3);
                p.money -= moneyAdult(50000, 150000);
                p.happiness -= 2;
                chron(`${par.title} ${par.name}${eul(par.name)} 곁에서 모시기 시작함`, "가족", 2);
                log(`${par.title}를 곁에서 모시기로 함`);
              },
            },
            {
              title: "돈을 보내 돌봐 줄 사람을 구한다",
              desc: "돈↓",
              run: () => {
                par.caredUntil = p.age + 5;
                p.money -= moneyAdult(120000, 300000);
                remember(par, "자식이 돌봐 줄 사람을 보내 줌", "cared", 1);
                log(`${par.title}를 돌봐 줄 사람을 구함`);
              },
            },
            {
              title: "지금은 여유가 없다",
              desc: "훗날 후회할지도 모른다.",
              run: () => {
                par.rel -= 10;
                remember(par, "돌봄이 필요할 때 자식이 오지 않음", "neglect", 2);
                log(`${par.title}의 돌봄을 미룸`);
              },
            },
          ],
          { npc: par },
        ),
      );
    if (a >= 40 && a <= 52 && !done("midlife") && adultLife() && p.status === "민간인")
      out.push(
        mk(
          "midlife",
          "마흔의 밤",
          `잠이 오지 않는 밤, 문득 묻게 됩니다. 지금 이 삶이 정말 내가 원하던 것이었나.${s.hobby ? ` 오래 아껴 온 ${s.hobby}${ga(s.hobby)} 떠오릅니다.` : ""}`,
          [
            {
              title: "늦기 전에 새로운 일에 도전한다",
              desc: "직업이 바뀐다.",
              run: () => {
                const H = s.hobby && HOBBIES[s.hobby];
                const job = (H && H.job) || rand(["상인", "요리사", "선원", "모험가"]);
                setCareer(job, "민간인");
                p.happiness += 6;
                chron(`마흔의 결심 — ${job}${ro(job)} 새 출발`, "직업", 2);
                log(`마흔에 ${job}${ro(job)} 새 출발함`);
              },
            },
            { title: "지금 가진 것을 소중히 여긴다", desc: "행복↑", run: () => { p.happiness += 5; log("지금의 삶을 받아들임"); } },
          ],
        ),
      );
  }
  function oldPool(out) {
    const a = p.age,
      s = S();
    if (a < 60 || !free()) return;
    // 노화와 만성 질환 (한 가지씩, 습관에 따라 덜 생긴다)
    const ills = [
      { id: "joint", name: "관절", title: "시큰거리는 무릎", body: "비 오는 날이면 무릎이 먼저 압니다. 계단 하나 오르는 일도 예전 같지 않습니다." },
      { id: "eyes", name: "시력", title: "흐려지는 글씨", body: "신문 글씨가 자꾸 번져 보입니다. 팔을 쭉 뻗어야 겨우 읽힙니다." },
      { id: "heart", name: "심장", title: "가빠지는 숨", body: "조금만 걸어도 숨이 찹니다. 의원은 심장이 지쳤다고 했습니다." },
      { id: "memory", name: "기억", title: "깜빡이는 기억", body: "방금 무엇을 하려 했는지 잊는 일이 잦아졌습니다. 옛일은 또렷한데, 어제 일이 흐릿합니다." },
    ].filter((x) => !s.chronic.includes(x.id) && !done("ill_" + x.id));
    const care = (s.habits.exercise || 0) + (s.habits.health || 0);
    const illChance = (0.12 + (a - 60) * 0.006 + (s.warnIgnored ? 0.06 : 0)) * (1 - Math.min(0.6, care * 0.03));
    if (ills.length && chance(illChance)) {
      const ill = rand(ills);
      out.push(
        mk(
          "ill_" + ill.id,
          ill.title,
          ill.body,
          [
            {
              title: "의원에게 꾸준히 치료받는다",
              desc: "돈↓ · 증상이 크게 줄어든다.",
              req: { money: 150000 },
              run: () => {
                p.money -= 150000;
                if (chance(0.6)) log(`${ill.name} 치료로 증상이 나아짐`);
                else {
                  s.chronic.push(ill.id);
                  log(`${ill.name} 문제를 안고 살게 됨`);
                }
                p.health += 3;
              },
            },
            {
              title: "나이 탓이려니 받아들인다",
              desc: "몸이 조금씩 약해진다.",
              run: () => {
                s.chronic.push(ill.id);
                p.health -= ri(3, 7);
                if (ill.id === "joint") p.combat -= 3;
                if (ill.id === "memory") p.knowledge -= 3;
                chron(`${ill.name}${ga(ill.name)} 약해짐`, "노화", 1);
                log(`${ill.name} 문제를 받아들임`);
              },
            },
          ],
        ),
      );
    }
    const gk = pick(grandkids().filter((g) => ea(g) >= 5 && ea(g) <= 14));
    if (gk && !done("grand_story_" + gk.id)) {
      const hi = s.chron.filter((e) => e.w >= 2 && e.k !== "상실").slice(-12);
      const story = pick(hi);
      out.push(
        mk(
          "grand_story_" + gk.id,
          `${gk.name}의 질문`,
          `${gk.title} ${gk.name}${ga(gk.name)} 무릎에 올라와 물었습니다. "할아버지 할머니는 젊었을 때 뭐 했어요?"${story ? `\n\n당신은 ${story.a}세 때의 일을 들려주었습니다. '${story.t}'.` : ""}`,
          [
            {
              title: "있는 그대로 이야기해 준다",
              desc: "손주와 가까워지고, 그 아이의 꿈에 영향을 준다.",
              run: () => {
                gk.rel = Math.min(100, gk.rel + 10);
                gk.advice = ["해적", "해군", "혁명군"].includes(p.status) ? p.status : gk.advice;
                remember(gk, story ? `할머니·할아버지의 ${story.a}세 이야기를 들음` : "옛날이야기를 들음", "story", 3);
                p.happiness += 5;
                log(`손주 ${gk.name}에게 옛이야기를 들려줌`);
              },
            },
            {
              title: "조금 부풀려 모험담으로 들려준다",
              desc: "손주가 바다를 꿈꾸게 된다.",
              run: () => {
                gk.rel = Math.min(100, gk.rel + 8);
                gk.advice = "해적";
                remember(gk, "부풀려진 모험담에 눈을 반짝임", "story", 2);
                p.happiness += 6;
                log(`손주 ${gk.name}에게 모험담을 들려줌`);
              },
            },
          ],
        ),
      );
    }
    const home = p.birthPlace && p.birthPlace.name;
    if (home && home !== p.place.name && a >= 62 && !drowned() && !done("hometown"))
      out.push(
        mk(
          "hometown",
          "고향으로 가는 배",
          `문득 ${home}의 바다가 보고 싶어졌습니다. 떠나온 지 오래된 고향, 아직 그곳에 남은 사람이 있을까요?${npcsBy((n) => homeOf(n) === home).length ? ` ${npcsBy((n) => homeOf(n) === home).slice(0, 3).map((n) => n.name).join(", ")}의 얼굴이 떠오릅니다.` : ""}`,
          [
            {
              title: "고향을 찾아간다",
              desc: "돈↓ · 행복↑ · 고향의 인연과 재회",
              run: () => {
                p.money -= moneyAdult(50000, 120000);
                p.happiness += 8;
                npcsBy((n) => homeOf(n) === home).forEach((n) => {
                  n.rel = Math.min(100, n.rel + 8);
                  n.lastSeen = p.age;
                  remember(n, "늙어서 고향에 돌아와 다시 만남", "hometown", 2);
                });
                chron(`고향 ${home}${eul(home)} 다시 찾음`, "이동", 2);
                log(`고향 ${home}${eul(home)} 찾아감`);
              },
            },
            { title: "마음속에만 그린다", desc: "", run: () => { p.happiness += 1; log("고향을 그리워만 함"); } },
          ],
        ),
      );
    if (s.memoir >= 3 && !done("memoir"))
      out.push(
        mk(
          "memoir",
          "회고록을 마치다",
          `몇 해에 걸쳐 써 온 회고록의 마지막 장을 덮었습니다. ${s.chron.length}개의 기억이 한 권에 담겼습니다.`,
          [
            { title: "세상에 내놓는다", desc: "명성↑", run: () => { s.memoirDone = "출간"; p.reputation += 4; achieve("회고록을 남김"); log("회고록을 출간함"); } },
            { title: "가족에게만 남긴다", desc: "가족 관계↑", run: () => { s.memoirDone = "가족"; achieve("회고록을 남김"); npcsBy((n) => FAMILY.includes(n.role)).forEach((n) => (n.rel = Math.min(100, n.rel + 5))); log("회고록을 가족에게 남김"); } },
          ],
        ),
      );
    if (a >= 68 && !done("will") && (kids().length || disciples().length || p.money > 1000000))
      out.push(
        mk(
          "will",
          "유언장을 쓰다",
          `언젠가는 올 날을 위해 펜을 들었습니다. 평생 모은 ${money(Math.max(0, p.money))}${eul(money(Math.max(0, p.money)))} 어떻게 남길지 정해야 합니다.`,
          [
            kids().length && {
              title: "자녀들에게 고루 나눈다",
              desc: "자녀 관계↑",
              run: () => { s.will = "자녀"; kids().forEach((n) => (n.rel = Math.min(100, n.rel + 5))); log("유산을 자녀들에게 나누기로 함"); },
            },
            {
              title: "마을에 학교와 의원을 세우는 데 쓴다",
              desc: "돈↓↓ · 명성↑↑ · 이름이 오래 남는다",
              req: { money: 500000 },
              run: () => { s.will = "마을"; p.money = Math.floor(p.money * 0.4); p.reputation += 8; achieve(`${p.place.name}에 이름을 남김`); log("재산을 마을을 위해 쓰기로 함"); },
            },
            disciples().length && {
              title: `제자 ${disciples()[0].name}에게 맡긴다`,
              desc: "제자 관계↑",
              run: () => { s.will = "제자"; s.heirId = s.heirId || disciples()[0].id; disciples()[0].rel = Math.min(100, disciples()[0].rel + 10); log("유산을 제자에게 맡기기로 함"); },
            },
          ],
        ),
      );
    const fr = closeNpcs((n) => ["친구", "은인", "라이벌"].includes(n.role) && ea(n) >= 55 && n.rel >= 55)[0];
    if (fr && !done("old_friend_" + fr.id) && a >= 65) {
      const m = bestMemory(fr);
      out.push(
        mk(
          "old_friend_" + fr.id,
          `벗, ${fr.name}`,
          `${fr.name}${ga(fr.name)} 지팡이를 짚고 찾아왔습니다. 둘은 볕 좋은 툇마루에 앉아 ${m ? `${realAge() - m.a}년 전의 일 — '${m.t}' — 을 꺼내며` : "젊은 날을 떠올리며"} 한참을 웃었습니다. 먼저 떠난 이들의 이름도 하나씩 불러 보았습니다.`,
          null,
          {
            effect: () => {
              fr.rel = Math.min(100, fr.rel + 8);
              fr.lastSeen = p.age;
              p.happiness += 6;
              remember(fr, "늙어서도 툇마루에서 함께 웃음", "old_friends", 2);
            },
            summary: `오랜 벗 ${fr.name}${wa(fr.name)} 추억을 나눔`,
            npc: fr,
          },
        ),
      );
    }
    if (a >= 75 && p.health >= 35 && !drowned() && !done("last_trip"))
      out.push(
        mk(
          "last_trip",
          "마지막 여행",
          `몸이 허락할 때 꼭 한 번 더 가 보고 싶은 곳이 있습니다. ${(s.trips || []).length ? `예전에 다녀온 ${rand(s.trips)}의 바다일 수도 있고, ` : ""}한 번도 가 보지 못한 먼 섬일 수도 있습니다.`,
          [
            {
              title: `${spouse() ? `${spouse().name}${wa(spouse().name)} 함께` : "홀로"} 떠난다`,
              desc: "행복↑↑ · 건강 조금↓",
              run: () => {
                p.money -= moneyAdult(60000, 150000);
                p.happiness += 12;
                p.health -= 3;
                if (spouse()) remember(spouse(), "늙어서 함께 떠난 마지막 여행", "last_trip", 3);
                chron("마지막 여행을 떠남", "일상", 2);
                log("마지막 여행을 다녀옴");
              },
            },
            { title: "창가에서 바다를 바라보는 것으로 족하다", desc: "", run: () => { p.happiness += 3; log("창가에서 바다를 바라봄"); } },
          ],
        ),
      );
    if (!done("garden_" + Math.floor(a / 8)) && chance(0.35))
      out.push(
        mk(
          "garden_" + Math.floor(a / 8),
          "느린 하루",
          `${s.hobby ? `오전에는 ${HOBBIES[s.hobby] ? HOBBIES[s.hobby].verb : ""} 시간을 보내고, ` : ""}오후에는 볕을 쬐며 꾸벅꾸벅 졸았습니다. ${spouse() ? `${spouse().name}${ga(spouse().name)} 옆에서 콩을 고르고 있습니다.` : "고양이 한 마리가 무릎에 올라와 잠들었습니다."} 특별할 것 없는 하루지만, 이상하게 마음이 꽉 찹니다.`,
          null,
          { effect: () => { p.happiness += 4; p.health += 1; }, summary: "평온한 노년의 하루" },
        ),
      );
  }

  /* ───────────────────────── 제자·후계자 ───────────────────────── */
  function discipleScenes(out) {
    const a = p.age,
      s = S();
    if (!free() || a < 35) return;
    const art =
      p.combat >= 45 ? (p.abilities || []).some((x) => /검|도/.test(x)) ? "검술" : "무예" :
      p.knowledge >= 55 ? "학문" :
      s.hobby && s.hobbyLv >= 6 ? s.hobby :
      p.careerStartAge != null && a - p.careerStartAge >= 12 ? `${p.job}의 일` : null;
    if (art && !disciples().length && (s.lastDiscipleAge ?? -99) + 10 <= a && a <= 78 && chance(0.25)) {
      s.lastDiscipleAge = a;
      out.push(
        mk(
          "disciple_" + a,
          "제자로 받아 주십시오",
          `한 젊은이가 문 앞에 무릎을 꿇었습니다. "${p.name} 님의 ${art}${eul(art)} 배우고 싶습니다. 무엇이든 하겠습니다." 눈빛이 젊은 날의 당신을 닮았습니다.`,
          [
            {
              title: "제자로 받아들인다",
              desc: "제자를 키우면 이름이 다음 세대로 이어진다.",
              run: () => {
                const n = peer({ role: "제자", stageAge: ri(13, 19), rel: ri(60, 75) });
                n.title = "제자";
                n.discArt = art;
                n.power = Math.max(n.power, ri(10, 20));
                n.aff = ["해적", "해군", "혁명군"].includes(p.status) ? p.status : n.aff;
                remember(n, `${art}${eul(art)} 배우겠다며 스승을 찾아옴`, "disciple", 3);
                schedule("saga_disciple_indep", ri(6, 9), { id: n.id });
                chron(`${n.name}${eul(n.name)} 제자로 받아들임 (${art})`, "유산", 3);
                log(`${n.name}${eul(n.name)} 제자로 받아들임`);
              },
            },
            { title: "가르칠 그릇이 못 된다며 돌려보낸다", desc: "", run: () => { log("제자를 받지 않음"); } },
          ],
        ),
      );
    }
    const dsc = pick(disciples().filter((n) => !n.indep));
    if (dsc && !done("disc_test_" + dsc.id) && realAge() - ((dsc.mem.find((m) => m.tag === "disciple") || {}).a || realAge()) >= realOf(2))
      out.push(
        mk(
          "disc_test_" + dsc.id,
          `제자 ${dsc.name}의 첫 시험`,
          `${dsc.name}${ga(dsc.name)} 처음으로 스스로 해낸 결과물을 내밀었습니다. 서툴지만 고민한 흔적이 보입니다.`,
          [
            { title: "엄하게 부족한 점을 짚는다", desc: "제자 실력↑↑ · 관계 조금↓", run: () => { dsc.power = Math.min(100, dsc.power + 8); dsc.rel -= 3; remember(dsc, "스승의 엄한 가르침", "strict", 2); log(`제자 ${dsc.name}${eul(dsc.name)} 엄하게 가르침`); } },
            { title: "잘한 점부터 칭찬한다", desc: "제자 관계↑↑", run: () => { dsc.power = Math.min(100, dsc.power + 4); dsc.rel = Math.min(100, dsc.rel + 8); remember(dsc, "처음 스승에게 칭찬받은 날", "praise", 3); log(`제자 ${dsc.name}${eul(dsc.name)} 칭찬함`); } },
          ],
          { npc: dsc, roles: ["제자"] },
        ),
      );
  }
  function heirScene(out) {
    const s = S(),
      a = p.age;
    if (a < 58 || s.heirId || done("heir") || (s.heirAsked ?? -99) + 5 > a) return;
    const cands = [...kids().filter((n) => ea(n) >= 18), ...disciples()].sort((x, y) => y.rel - x.rel).slice(0, 3);
    if (!cands.length) return;
    out.push(
      mk(
        "heir",
        "후계자를 정하다",
        `평생 일군 것을 누구에게 맡길지 정할 때가 되었습니다.${p.job !== "은퇴자" ? ` ${jobTitle()}${ro(jobTitle())} 쌓은 것들,` : ""} 이름과 재산, 그리고 당신이 지켜 온 뜻까지.`,
        [
          ...cands.map((n) => ({
            title: `${roleLabel(n)} ${n.name}에게 맡긴다`,
            desc: `${npcDesc(n)} · 관계 ${relWord(n.rel)}`,
            run: () => {
              s.heirId = n.id;
              n.heir = true;
              n.rel = Math.min(100, n.rel + 10);
              remember(n, "후계자로 지목받음", "heir", 3);
              chron(`${roleLabel(n)} ${n.name}${eul(n.name)} 후계자로 지목함`, "유산", 3);
              cands.filter((x) => x !== n).forEach((x) => { x.rel -= 4; remember(x, `${n.name}${ga(n.name)} 후계자로 지목됨`, "not_heir", 1); });
              log(`${n.name}${eul(n.name)} 후계자로 지목함`);
            },
          })),
          { title: "아직은 정하지 않는다", desc: "", run: () => { delete s.done.saga_heir; s.heirAsked = a; log("후계자 결정을 미룸"); } },
        ],
      ),
    );
  }

  /* ───────────────────────── 꿈 이후의 후일담 ───────────────────────── */
  function epilogueActive() {
    return !!((p.dream && p.dream.status === "달성") || (p.flags && p.flags.endingTitle) || p.flags.pirateKingAchieved);
  }
  function epilogueScene() {
    const s = S();
    if (!epilogueActive()) return null;
    s.ep.since = s.ep.since ?? realAge();
    const title = (p.flags && p.flags.endingTitle) || (p.dream && DREAMS[p.dream.id] && DREAMS[p.dream.id].name) || "꿈";
    const after = (k) => !s.ep[k];
    if (after("dawn"))
      return mk(
        "ep_dawn",
        "그 뒤의 아침",
        `'${title}'. 모두가 이야기의 끝이라 여기는 자리에 섰지만, 다음 날 아침에도 해는 떴습니다. 이제 남은 날들을 무엇으로 채울까요?`,
        [
          { title: "그동안 소홀했던 사람들을 만나러 간다", desc: "재회 이야기가 먼저 펼쳐진다.", run: () => { s.ep.dawn = "재회"; log("꿈을 이룬 뒤 사람들을 만나러 가기로 함"); } },
          { title: "다음 세대를 키운다", desc: "후계 이야기가 먼저 펼쳐진다.", run: () => { s.ep.dawn = "후계"; log("꿈을 이룬 뒤 다음 세대를 키우기로 함"); } },
          { title: "가족 곁으로 돌아간다", desc: "가족 이야기가 먼저 펼쳐진다.", run: () => { s.ep.dawn = "가족"; log("꿈을 이룬 뒤 가족 곁으로 돌아가기로 함"); } },
          { title: "아직 못 가 본 바다를 본다", desc: "여행 이야기가 먼저 펼쳐진다.", run: () => { s.ep.dawn = "여행"; log("꿈을 이룬 뒤 여행을 떠나기로 함"); } },
        ],
        { essential: true },
      );
    const order = { 재회: ["reunion", "rival", "heir", "family", "journey", "legacy"], 후계: ["heir", "legacy", "reunion", "family", "rival", "journey"], 가족: ["family", "reunion", "journey", "heir", "rival", "legacy"], 여행: ["journey", "reunion", "family", "rival", "heir", "legacy"] }[s.ep.dawn] || ["reunion", "family", "heir", "journey", "rival", "legacy"];
    for (const k of order) {
      if (s.ep[k]) continue;
      const sc = EPI[k] && EPI[k](title);
      if (sc) return sc;
      s.ep[k] = "건너뜀"; // 조건이 맞지 않는 장은 넘긴다
    }
    return null;
  }
  const EPI = {
    reunion: (title) => {
      const ppl = closeNpcs((n) => !["배우자", "자녀", "손주", "연인"].includes(n.role) && n.rel >= 40).slice(0, 3);
      if (!ppl.length) return null;
      return mk(
        "ep_reunion",
        "이름을 부르며 찾아간 사람들",
        `'${title}'의 소식을 듣고 옛 사람들에게서 연락이 왔습니다.\n\n${ppl.map((n) => { const m = bestMemory(n); return `· ${roleLabel(n)} ${n.name} (${npcDesc(n)}, ${homeOf(n)}) — ${m ? `'${m.t}'를 기억하고 있었습니다` : "당신의 이름을 잊지 않고 있었습니다"}`; }).join("\n")}`,
        [
          {
            title: "한 사람 한 사람 찾아간다",
            desc: "옛 인연과의 관계↑↑",
            run: () => {
              S().ep.reunion = "완료";
              ppl.forEach((n) => { n.rel = Math.min(100, n.rel + 15); n.lastSeen = p.age; remember(n, `'${title}' 뒤에 직접 찾아와 줌`, "ep_visit", 3); });
              p.happiness += 10;
              p.money -= moneyAdult(50000, 150000);
              chron("옛 사람들을 한 명씩 찾아가 재회함", "후일담", 3);
              log("꿈을 이룬 뒤 옛 사람들을 찾아다님");
            },
          },
          { title: "모두를 한자리에 초대한다", desc: "", run: () => { S().ep.reunion = "완료"; ppl.forEach((n) => { n.rel = Math.min(100, n.rel + 8); n.lastSeen = p.age; }); p.happiness += 7; chron("옛 사람들을 초대해 잔치를 엶", "후일담", 2); log("옛 사람들을 모아 잔치를 엶"); } },
        ],
        { essential: true },
      );
    },
    rival: () => {
      // 노년의 '마지막 승부'를 맹세한 라이벌은 그 사건에서 매듭짓는다
      const r = closeNpcs((n) => ["라이벌", "원수"].includes(n.role) && !hasMem(n, "rival_vow"))[0];
      if (!r) return null;
      return mk(
        "ep_rival",
        `${r.name}${wa(r.name)}의 마지막 대면`,
        `${r.role === "원수" ? "평생 당신을 원망해 온" : "평생 당신과 겨뤄 온"} ${r.name}${ga(r.name)} 찾아왔습니다. "결국 네가 해냈군." 오랜 세월의 앙금이 그 한마디에 담겨 있습니다.`,
        [
          { title: "손을 내민다", desc: "", run: () => { S().ep.rival = "화해"; setRole(r, "친구", "꿈을 이룬 뒤 마침내 손을 맞잡음"); r.rel = Math.max(r.rel, 55); p.happiness += 6; chron(`오랜 ${r.role === "친구" ? "라이벌" : "적"} ${r.name}${wa(r.name)} 화해`, "후일담", 3); log(`${r.name}${wa(r.name)} 화해함`); } },
          { title: "고개만 끄덕이고 각자의 길을 간다", desc: "", run: () => { S().ep.rival = "작별"; remember(r, "말없이 고개를 끄덕이고 헤어짐", "ep_nod", 2); log(`${r.name}${wa(r.name)} 말없이 헤어짐`); } },
        ],
        { essential: true },
      );
    },
    heir: (title) => {
      const s = S();
      const h = (s.heirId && npcById(s.heirId)) || disciples()[0] || kids().filter((n) => ea(n) >= 16).sort((a, b) => b.rel - a.rel)[0];
      return mk(
        "ep_heir",
        "다음 세대에게",
        h
          ? `${roleLabel(h)} ${h.name}${ga(h.name)} 당신이 걸어온 길을 배우고 싶어 합니다. '${title}'까지 가는 동안 몸으로 익힌 것들을 이제는 말로, 손으로 건네줄 차례입니다.`
          : `당신을 동경하는 젊은이들이 하나둘 찾아옵니다. '${title}'의 길을 어떻게 걸었는지 듣고 싶다고 합니다.`,
        [
          {
            title: "가진 것을 아낌없이 가르친다",
            desc: "후계자 성장 · 유산↑",
            run: () => {
              S().ep.heir = "완료";
              let n = h;
              if (!n) {
                n = peer({ role: "제자", stageAge: ri(15, 20), rel: ri(65, 80) });
                n.title = "제자";
                n.discArt = String(title).split(" — ")[0];
                remember(n, `'${title}'의 이야기를 듣고 제자가 됨`, "disciple", 3);
              }
              n.power = Math.min(100, n.power + 15);
              n.rel = Math.min(100, n.rel + 12);
              s.heirId = s.heirId || n.id;
              n.heir = true;
              remember(n, "스승의 모든 것을 물려받음", "heir", 3);
              chron(`${n.name}에게 평생 익힌 것을 물려줌`, "유산", 3);
              log(`${n.name}에게 평생 익힌 것을 가르침`);
            },
          },
          { title: "스스로 길을 찾게 둔다", desc: "", run: () => { S().ep.heir = "자율"; p.knowledge += 3; log("다음 세대가 스스로 길을 찾게 둠"); } },
        ],
      );
    },
    family: () => {
      const sp = spouse(),
        ks = kids(),
        gs = grandkids();
      if (!sp && !ks.length) return null;
      return mk(
        "ep_family",
        "식탁에 모인 얼굴들",
        `${[sp && `${sp.title} ${sp.name}`, ks.length && `자녀 ${ks.map((n) => n.name).join(", ")}`, gs.length && `손주 ${gs.length}명`].filter(Boolean).join(", ")}. 오랜만에 온 가족이 한 식탁에 모였습니다. 바깥의 영광은 여기서는 아무 의미가 없습니다. 그저 늦게 와서 미안하다는 말을 할 뿐입니다.`,
        null,
        {
          essential: true,
          effect: () => {
            S().ep.family = "완료";
            npcsBy((n) => FAMILY.includes(n.role)).forEach((n) => { n.rel = Math.min(100, n.rel + 10); remember(n, "꿈을 이룬 뒤 가족 곁으로 돌아옴", "ep_family", 3); });
            p.happiness += 12;
            chron("꿈을 이룬 뒤 가족 곁으로 돌아옴", "후일담", 3);
          },
          summary: "온 가족이 다시 모임",
        },
      );
    },
    journey: () => {
      if (drowned()) return null;
      const s = S();
      const home = p.birthPlace && p.birthPlace.name;
      const spots = [...new Set([home, ...(s.trips || []), ...(p.visitedSeas || [])].filter(Boolean))].slice(0, 4);
      return mk(
        "ep_journey",
        "지나온 바다를 거슬러",
        `앞만 보고 달려온 길을 거꾸로 거슬러 가 보기로 했습니다. ${spots.join(" → ")}. 같은 바다인데, 이제는 전혀 다르게 보입니다.`,
        null,
        {
          effect: () => {
            S().ep.journey = "완료";
            p.happiness += 10;
            p.knowledge += 4;
            p.money -= moneyAdult(80000, 200000);
            chron("지나온 바다를 거슬러 여행함", "후일담", 2);
          },
          summary: "지나온 길을 되짚는 여행",
        },
      );
    },
    legacy: (title) =>
      mk(
        "ep_legacy",
        "남길 것",
        `'${title}'. 그 이름 뒤에 무엇을 남길지 생각합니다.`,
        [
          { title: "같은 꿈을 꾸는 이들을 위한 터전을 만든다", desc: "돈↓↓ · 명성↑↑", run: () => { S().ep.legacy = "터전"; p.money = Math.floor(p.money * 0.5); p.reputation += 10; achieve("다음 세대를 위한 터전을 세움"); chron("다음 세대를 위한 터전을 세움", "유산", 3); log("다음 세대를 위한 터전을 세움"); } },
          { title: "이야기로 남긴다", desc: "회고록이 빨리 쌓인다.", run: () => { S().ep.legacy = "이야기"; S().memoir += 3; log("자신의 이야기를 기록으로 남기기로 함"); } },
          { title: "아무것도 남기지 않고 바다에 맡긴다", desc: "행복↑", run: () => { S().ep.legacy = "바다"; p.happiness += 8; log("모든 것을 바다에 맡기기로 함"); } },
        ],
      ),
  };

  /* ───────────────────────── 장면 조립 ───────────────────────── */
  function sagaScenes() {
    const out = [];
    if (!p || p.job === "노예" || finished) return out;
    S();
    const st = stageScene();
    if (st) out.push(st);
    const cen = centenaryScene();
    if (cen) out.push(cen);
    const ep = epilogueScene();
    if (ep) out.push(ep);
    const pool = [];
    romanceScenes(pool);
    promiseScenes(pool);
    teacherScenes(pool);
    rivalScenes(pool);
    friendNeedScene(pool);
    habitScenes(pool);
    discipleScenes(pool);
    heirScene(pool);
    teenPool(pool);
    youngPool(pool);
    midPool(pool);
    oldPool(pool);
    const fresh = pool.filter((x) => x && !S().done[x.key]);
    // 필수 장면(갈림길·청혼 등)은 항상, 나머지는 한 해에 1~2개만
    fresh.filter((x) => x.essential).forEach((x) => out.push(x));
    const opt = fresh.filter((x) => !x.essential).sort(() => Math.random() - 0.5);
    const n = p.age < 13 ? (chance(0.35) ? 1 : 0) : p.age >= 60 ? (chance(0.55) ? 2 : 1) : chance(0.35) ? 2 : 1;
    out.push(...opt.slice(0, n));
    return out;
  }
  // 반복 사건 방지: 같은 사건이 여러 번 나왔거나, 꿈을 이룬 뒤에는 이미 본 일반 사건을 다시 꺼내지 않는다
  function pruneRepeats() {
    const s = S(),
      seen = p.seenScenes || {},
      ep = epilogueActive();
    for (let i = scenes.length - 1; i >= 0; i--) {
      const x = scenes[i];
      if (!x || x.essential || x.promotion || x.saga || x.kid) continue;
      const k = String(sceneKey(x));
      const c = s.cnt[k] || 0;
      if (c >= 3 || (ep && seen[k] !== undefined && p.age >= 16)) scenes.splice(i, 1);
      // 개연성: 노년(70세 이상)에게 입대·가입 권유가 오는 일은 없다
      else if (p.age >= 70 && x.choices && /권유|입대|모병|스카우트|가입 제안/.test(x.title)) scenes.splice(i, 1);
    }
  }
  {
    const _be = buildExtraScenes;
    buildExtraScenes = function () {
      const r = _be.apply(this, arguments);
      try {
        if (p.age >= 16) pruneRepeats();
        sagaScenes().forEach((x) => scenes.push(x));
      } catch (e) {
        console.error("saga scenes", e);
      }
      return r;
    };
    const _fin = finalizeScenes;
    finalizeScenes = function () {
      const out = _fin.apply(this, arguments);
      try {
        const s = S();
        out.forEach((x) => {
          const k = String(sceneKey(x));
          s.cnt[k] = (s.cnt[k] || 0) + 1;
        });
        const keys = Object.keys(s.cnt);
        if (keys.length > 900) keys.slice(0, keys.length - 900).forEach((k) => delete s.cnt[k]);
      } catch (e) {}
      return out;
    };
  }
  {
    const _fit = fitScene;
    fitScene = function (sc) {
      const r = _fit.apply(this, arguments);
      if (!r || !p) return r;
      try {
        if (typeof r.valid === "function" && !r.valid()) return null;
        // 기존 버그: 이혼한 전 배우자가 '어린 시절의 약속'으로 찾아와 동료가 되던 문제
        const k = String(sceneKey(r));
        if (/^promise_/.test(k)) {
          const n = npcById(k.slice(8));
          if (n && n.role === "전 배우자") return null;
        }
      } catch (e) {}
      return r;
    };
  }
  // 승진 제안: 지금 자리를 지키겠다고 할수록 다음 제안까지의 간격을 늘리고, 70세 이후에는 제안하지 않는다
  if (typeof shouldOfferPromotion === "function") {
    const _sop = shouldOfferPromotion;
    shouldOfferPromotion = function () {
      try {
        if (p && p.age >= 70) return false;
        const gap = 3 + 3 * Math.min(2, (p && p.saga && p.saga.promoDeclined) || 0);
        if (p && p.age - (p.lastPromotionOfferAge ?? -99) < gap) return false;
      } catch (e) {}
      return _sop.apply(this, arguments);
    };
  }
  // 연인이 있는 동안에는 기존의 다른 고백 사건이 끼어들지 않게 한다
  if (typeof courtshipScene === "function") {
    const _court = courtshipScene;
    courtshipScene = function () {
      const lv = p && lover();
      if (!lv) return _court.apply(this, arguments);
      // 연인이 있으면 다른 고백 대신 연인과의 일상을 보여 준다
      const spot = rand(["노을 지는 방파제", "작은 섬의 축제", "비 오는 날의 처마 밑", "밤바다가 보이는 언덕"]);
      return {
        key: "saga_lover_day_" + lv.id,
        cooldown: 3,
        saga: true,
        title: `${lv.name}${wa(lv.name)}의 하루`,
        body: `${spot}에서 ${lv.name}${wa(lv.name)} 시간을 보냈습니다. 별것 아닌 이야기에도 한참을 웃었습니다.`,
        choices: null,
        effect: () => {
          lv.rel = Math.min(100, lv.rel + 4);
          lv.lastSeen = p.age;
          p.happiness += 3;
          remember(lv, `${spot}에서 함께 보낸 하루`, "date", 1);
        },
        summary: `연인 ${lv.name}${wa(lv.name)} 시간을 보냄`,
      };
    };
  }
  // 이름 없는 '오래된 인연' 자동 사건은 실제 친구가 찾아오는 노년 사건으로 대체한다
  try {
    BANNED_TITLES.add("오래된 인연");
  } catch (e) {}

  /* ───────────────────────── 세대교체 (다음 인생으로 이어질 때) ───────────────────────── */
  {
    const _after = afterDeath;
    afterDeath = function (cause) {
      const r = _after.apply(this, arguments);
      try {
        const s = S();
        const hl = s.chron.filter((e) => e.w >= 3).slice(-6).map((e) => `${e.a}세 — ${e.t}`);
        Object.keys(LEGACY_CHOICES || {}).forEach((id) => {
          LEGACY_CHOICES[id].saga = {
            parent: p.name,
            heir: s.heirId === id,
            memoir: !!s.memoirDone,
            highlights: hl,
          };
        });
        showEvalCard();
        if (s.heirId)
          document.querySelectorAll("#choices .choice").forEach((b) => {
            const k = npcById(s.heirId);
            if (k && b.textContent.includes(k.name) && b.textContent.includes("이어서 살기")) {
              const tag = document.createElement("span");
              tag.className = "small";
              tag.style.cssText = "display:block;color:var(--gold)";
              tag.textContent = "★ 후계자로 지목한 아이 — 유산을 더 많이 물려받습니다.";
              b.appendChild(tag);
            }
          });
      } catch (e) {}
      return r;
    };
    const _apply = applyLegacy;
    applyLegacy = function () {
      const L = pendingLegacy;
      const r = _apply.apply(this, arguments);
      try {
        const sg = L && L.saga;
        p.saga = null;
        S();
        if (sg) {
          if (sg.heir) {
            p.money = Math.round(p.money * 1.6);
            p.flags.chosenHeir = true;
          }
          schedule("saga_inherit", 18, sg);
          chron(`${sg.parent}의 ${L.child.gender === "남성" ? "아들" : "딸"}로 태어남`, "가족", 3);
        }
      } catch (e) {}
      return r;
    };
  }

  /* ───────────────────────── 인생 평가 (사망 시) ───────────────────────── */
  function stars(v) {
    const n = Math.max(0, Math.min(5, Math.round(v / 20)));
    return "★".repeat(n) + "☆".repeat(5 - n);
  }
  function lifeEvaluation(cause) {
    const s = S();
    const all = p.npcs || [];
    const sp = all.find((n) => n.id === p.spouseId) || all.find((n) => n.role === "배우자");
    const ks = all.filter((n) => n.role === "자녀");
    const gs = all.filter((n) => n.role === "손주");
    const ds = all.filter((n) => n.role === "제자");
    const friends = all.filter((n) => alive(n) && ["친구", "은인", "동료", "라이벌"].includes(n.role) && n.rel >= 60);
    const marriedYrs = s.marriedAt != null ? realAge() - s.marriedAt : sp ? realAge() - realOf(p.flags.marriedAge || p.age) : 0;
    // 점수 (0~100)
    const rel = Math.min(100, (sp ? 22 : 0) + Math.min(20, marriedYrs * 0.6) + ks.length * 9 + gs.length * 4 + friends.length * 7 + p.relationship * 0.2);
    const ach = Math.min(100, (p.achievements || []).length * 4 + (p.dream && p.dream.status === "달성" ? 30 : 0) + standing() * 0.4 + (p.rankLevel || 0) * 4 + Math.max(0, p.reputation) * 0.15);
    const avgHap = s.yrs ? s.hap / s.yrs : p.happiness;
    const qol = Math.min(100, avgHap * 0.7 + p.health * 0.1 + (p.money > 0 ? Math.min(20, Math.log10(p.money + 1) * 2.5) : 0));
    const leg = Math.min(100, (s.heirId ? 25 : 0) + ds.length * 15 + ds.reduce((a, n) => a + n.power / 5, 0) + (s.memoirDone ? 15 : 0) + (s.will === "마을" ? 20 : s.will ? 8 : 0) + ks.length * 5 + gs.length * 3 + (s.ep.legacy === "터전" ? 15 : 0));
    const lon = Math.min(100, (p.age / 100) * 100);
    const total = rel * 0.27 + ach * 0.23 + qol * 0.22 + leg * 0.14 + lon * 0.14;
    const grade = total >= 80 ? "S" : total >= 66 ? "A" : total >= 52 ? "B" : total >= 38 ? "C" : "D";
    const cats = [
      ["관계", rel, "사랑받은 사람"],
      ["성취", ach, "이름을 남긴 사람"],
      ["삶의 질", qol, "자기 삶을 누린 사람"],
      ["유산", leg, "다음 세대를 키운 사람"],
      ["장수", lon, "세월을 끝까지 걸어간 사람"],
    ];
    const top = cats.slice().sort((a, b) => b[1] - a[1])[0];
    const lines = [];
    lines.push(`\n\n━━━━━━━━━━━━\n【인생 평가】 ${grade}등급 · ${top[2]}`);
    lines.push(`· 관계 ${stars(rel)} — ${sp ? `배우자 ${sp.name}${marriedYrs > 0 ? `(${marriedYrs}년)` : ""}` : "배우자 없음"}, 자녀 ${ks.length}명, 손주 ${gs.length}명, 가까운 벗 ${friends.length}명`);
    const mainJob = Object.entries(s.jobYears || {}).sort((a, b) => b[1] - a[1])[0];
    lines.push(`· 성취 ${stars(ach)} — 업적 ${(p.achievements || []).length}개${p.dream ? `, 꿈 '${DREAMS[p.dream.id] ? DREAMS[p.dream.id].name : ""}' ${p.dream.status === "진행" ? "미완" : p.dream.status}` : ""}, ${mainJob ? `평생의 일 ${mainJob[0]} (${realOf(mainJob[1])}년)` : `직업 ${jobTitle()}`}`);
    lines.push(`· 삶의 질 ${stars(qol)} — 평생 평균 행복 ${Math.round(avgHap)}, 재산 ${money(Math.max(0, p.money))}`);
    lines.push(`· 유산 ${stars(leg)} — ${s.heirId && npcById(s.heirId) ? `후계자 ${npcById(s.heirId).name}` : "후계자 없음"}${ds.length ? `, 제자 ${ds.map((n) => n.name).join(", ")}` : ""}${s.memoirDone ? ", 회고록" : ""}${s.will === "마을" ? `, ${p.place.name}의 학교와 의원` : ""}`);
    lines.push(`· 장수 ${stars(lon)} — ${realAge()}세${lifeScale() > 1 ? ` (인간 나이 ${p.age}세)` : ""}`);
    const hb = Object.entries(s.habits).filter(([k]) => !["other"].includes(k)).sort((a, b) => b[1] - a[1])[0];
    const HB = { study: "공부", exercise: "운동", health: "건강 관리", hobby: "취미", travel: "여행", family: "가족", social: "사람들과의 교류", work: "일", teach: "가르침", memoir: "기록" };
    if (hb && hb[1] >= 3) lines.push(`· 평생의 습관 — ${HB[hb[0]] || hb[0]} (${hb[1]}년)${s.hobby ? `, 취미 ${s.hobby}` : ""}`);
    // 생애 단계별 회고
    const byStage = STAGES.map((st) => {
      const es = s.chron.filter((e) => e.st === st.name && e.k !== "단계").sort((a, b) => b.w - a.w || a.a - b.a).slice(0, 2).sort((a, b) => a.a - b.a);
      return es.length ? `${st.name}: ${es.map((e) => `${e.a}세 ${e.t}`).join(" / ")}` : null;
    }).filter(Boolean);
    if (byStage.length) lines.push(`\n【생애 회고】\n${byStage.join("\n")}`);
    // 기억해 줄 사람들
    const mourners = all
      .filter((n) => alive(n) && (FAMILY.includes(n.role) || n.rel >= 60 || n.role === "제자"))
      .sort((a, b) => b.rel - a.rel)
      .slice(0, 5)
      .map((n) => {
        const m = bestMemory(n);
        return `· ${roleLabel(n)} ${n.name}${m ? ` — 함께한 기억: "${m.t}"` : ""}`;
      });
    if (mourners.length) lines.push(`\n【당신을 기억할 사람들】\n${mourners.join("\n")}`);
    const epitaph = {
      관계: `"곁에 있는 사람을 끝까지 사랑했던 ${p.name}, 여기 잠들다."`,
      성취: `"${(p.flags && p.flags.endingTitle) || jobTitle()}, ${p.name}. 그 이름은 바다가 기억한다."`,
      "삶의 질": `"하루하루를 아끼며 산 ${p.name}, 웃으며 떠나다."`,
      유산: `"${p.name}의 뜻은 다음 세대 속에서 계속된다."`,
      장수: `"${realAge()}번의 봄을 지나온 ${p.name}, 이제 쉬다."`,
    }[top[0]];
    lines.push(`\n【묘비명】 ${epitaph}`);
    // 사망 화면(수배서 아래)에 보여 줄 요약 카드
    s.evalCard = {
      grade,
      title: top[2],
      rows: lines.slice(1, 6).map((l) => {
        const m = l.match(/^· (\S+(?: \S+)?) ([★☆]+) — (.*)$/);
        return m ? [m[1], m[2], m[3]] : [l, "", ""];
      }),
      epitaph,
    };
    return lines.join("\n");
  }
  {
    const _lr = lifeRecord;
    lifeRecord = function (cause) {
      const r = _lr.apply(this, arguments);
      try {
        return r + lifeEvaluation(cause);
      } catch (e) {
        console.error("saga evaluation", e);
        return r;
      }
    };
  }

  /* ───────────────────────── 화면: 인연·연대기 ───────────────────────── */
  function showEvalCard() {
    const c = p && p.saga && p.saga.evalCard;
    if (!c) return;
    const old = document.getElementById("sagaEvalCard");
    if (old) old.remove();
    const box = document.createElement("section");
    box.id = "sagaEvalCard";
    box.className = "saga-eval";
    box.innerHTML = `<div class="saga-eval-head"><span class="saga-grade">${esc(c.grade)}</span><div><div class="small">인생 평가</div><b>${esc(c.title)}</b></div></div>
<dl>${c.rows.map(([k, st, d]) => `<div><dt>${esc(k)} <span class="saga-stars" aria-label="${esc(k)} ${esc(st.split("★").length - 1)}점">${esc(st)}</span></dt><dd class="small">${esc(d)}</dd></div>`).join("")}</dl>
<p class="saga-epitaph">${esc(c.epitaph)}</p>`;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn secondary";
    btn.textContent = "📔 인생 연대기 보기";
    btn.addEventListener("click", openChronicle);
    box.appendChild(btn);
    const anchor = document.getElementById("wantedBox") || document.getElementById("scene");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor.nextSibling);
  }
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function overlay(id, title, html) {
    const old = document.getElementById(id);
    if (old) old.remove();
    const ov = document.createElement("div");
    ov.id = id;
    ov.className = "saga-overlay";
    ov.innerHTML = `<div class="panel saga-box" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${html}<button class="btn secondary saga-close" type="button">닫기</button></div>`;
    ov.addEventListener("click", (e) => {
      if (e.target === ov || e.target.classList.contains("saga-close")) ov.remove();
    });
    document.body.appendChild(ov);
  }
  function openPeople() {
    if (!p) return;
    S();
    const order = ["배우자", "연인", "자녀", "손주", "부모", "형제", "제자", "동료", "친구", "은인", "라이벌", "원수", "전 배우자"];
    const list = (p.npcs || []).filter(alive).sort((a, b) => (order.indexOf(a.role) + 1 || 99) - (order.indexOf(b.role) + 1 || 99) || b.rel - a.rel);
    const dead = (p.npcs || []).filter((n) => !alive(n));
    const card = (n) => {
      ensureNpc(n);
      const mems = n.mem.slice(-3).reverse().map((m) => `<li>${esc(m.a)}세 · ${esc(m.t)}</li>`).join("");
      const hist = (n.bondHist || []).map((b) => `${esc(b.from)}→${esc(b.to)}(${esc(b.a)}세)`).join(", ");
      return `<div class="saga-card"><div class="saga-card-head"><b>${esc(roleLabel(n))} ${esc(n.name)}</b><span class="small">${esc(Math.floor(n.age))}세 · ${esc(n.personality)}</span></div>
<div class="small">${esc(npcDesc(n))}${n.spouse ? ` · 배우자 ${esc(n.spouse)}` : ""}${n.kidsN ? ` · 자녀 ${esc(n.kidsN)}명` : ""} · ${near(n) ? "가까이 삶" : `${esc(homeOf(n))}에 삶`}</div>
<div class="saga-rel"><div class="bar"><div class="fill" style="width:${Math.max(0, Math.min(100, n.rel))}%"></div></div><span class="small">${esc(relWord(n.rel))}</span></div>
${hist ? `<div class="small">관계 변화: ${hist}</div>` : ""}${mems ? `<ul class="saga-mem">${mems}</ul>` : ""}</div>`;
    };
    overlay(
      "sagaPeople",
      "인연",
      `<p class="small">당신과 이어진 사람들입니다. 함께한 기억은 훗날의 사건에 다시 등장합니다.</p>${list.map(card).join("") || '<p class="small">아직 인연이 없습니다.</p>'}${dead.length ? `<details class="saga-dead"><summary class="small">먼저 떠난 사람들 (${dead.length})</summary>${dead.map((n) => `<div class="small">${esc(roleLabel(n))} ${esc(n.name)} — ${esc(n.deathCause || "사망")}</div>`).join("")}</details>` : ""}`,
    );
  }
  function openChronicle() {
    if (!p) return;
    const s = S();
    const groups = STAGES.map((st) => {
      const es = s.chron.filter((e) => e.st === st.name);
      if (!es.length) return "";
      return `<h3 class="saga-stage">${st.name}</h3><ol class="saga-chron">${es.map((e) => `<li class="w${Math.min(3, e.w)}"><span class="saga-age">${esc(e.a)}세</span> ${esc(e.t)}</li>`).join("")}</ol>`;
    }).join("");
    const hb = Object.entries(s.habits).filter(([k, v]) => k !== "other" && v > 0);
    const HB = { study: "공부", exercise: "운동", health: "건강 관리", hobby: "취미", travel: "여행", family: "가족", social: "교류", work: "일", teach: "가르침", memoir: "기록" };
    overlay(
      "sagaChron",
      "인생 연대기",
      `<p class="small">중요한 선택과 인생의 사건이 생애 단계별로 기록됩니다.</p>${hb.length ? `<p class="small">쌓아 온 습관: ${hb.map(([k, v]) => `${HB[k] || k} ${v}년`).join(" · ")}${s.hobby ? ` · 취미 ${esc(s.hobby)}` : ""}</p>` : ""}${groups || '<p class="small">아직 기록이 없습니다.</p>'}`,
    );
  }
  {
    const _begin = begin;
    begin = function () {
      const c = document.getElementById("sagaEvalCard");
      if (c) c.remove();
      return _begin.apply(this, arguments);
    };
  }
  // 게임 설명에 인생 서사 시스템 안내를 덧붙인다
  if (typeof openGuide === "function") {
    const _og = openGuide;
    openGuide = function () {
      const r = _og.apply(this, arguments);
      try {
        const box = document.querySelector("#guideOverlay .panel");
        const close = box && box.querySelector("button:last-of-type");
        if (box && close) {
          const d = document.createElement("details");
          d.style.cssText = "margin-top:10px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:8px 12px";
          d.innerHTML = `<summary style="cursor:pointer;font-weight:800">인연·습관·연대기 (인생 서사)</summary><div class="small" style="margin-top:6px">
• <b>인연</b>: 모든 인물은 성격·직업·나이·거주지와 함께 당신과의 <b>기억</b>을 쌓습니다. 친구는 연인·배우자가, 라이벌은 친구가, 소홀한 친구는 멀어진 사이가 될 수 있습니다. 🤝 인연 버튼에서 확인하세요.<br>
• <b>각자의 삶</b>: 인물들도 해마다 나이 들고, 결혼·출산·이사·이직·은퇴를 겪습니다. 자녀가 아이를 낳으면 손주가 생깁니다.<br>
• <b>올해의 초점 = 습관</b>: 공부·운동·취미·여행·가족·교류에 쓴 해가 쌓이면 시험 결과, 직업 제안, 대회, 노년의 건강, 가족 관계가 달라집니다.<br>
• <b>돌아오는 선택</b>: 어린 날의 약속, 첫사랑, 은사, 도와준 친구, 평생의 라이벌, 제자는 수년~수십 년 뒤 다시 등장합니다. (⏳ 표시)<br>
• <b>생애 단계</b>: 청소년기(13)·청년기(20)·중년기(35)·노년기(60)마다 그 나이에 맞는 사건이 나오고, 60세 이후 체력 상한이 서서히 낮아집니다. 꾸준한 운동·건강 관리는 노화를 늦춥니다.<br>
• <b>세대</b>: 제자를 키우고 후계자를 지목할 수 있습니다. 후계자로 지목한 자녀로 이어 살면 유산과 부모의 기록을 더 많이 물려받습니다.<br>
• <b>꿈 이후</b>: 꿈을 이루면 같은 사건을 반복하지 않고 재회·후계·가족·여행·유산의 후일담이 이어집니다.<br>
• <b>세계 침수</b>: 가까운 인연(관계 65 이상)이 많거나 배가 있으면 높은 곳으로 피난해 살아남을 수 있습니다.<br>
• <b>연대기와 인생 평가</b>: 📔 연대기에 중요한 선택과 사건이 생애 단계별로 기록되고, 사망하면 관계·성취·삶의 질·유산·장수를 종합해 등급과 묘비명을 남깁니다.</div>`;
          box.insertBefore(d, close);
        }
      } catch (e) {}
      return r;
    };
  }
  window.openSagaPeople = openPeople;
  window.openSagaChronicle = openChronicle;
  function mountUI() {
    const arch = document.querySelector(".actions .action-archive");
    if (!arch || document.getElementById("sagaPeopleBtn")) return;
    const mkBtn = (id, label, fn, cls) => {
      const b = document.createElement("button");
      b.id = id;
      b.type = "button";
      b.className = `btn secondary ${cls}`;
      b.textContent = label;
      b.addEventListener("click", fn);
      return b;
    };
    arch.insertAdjacentElement("afterend", mkBtn("sagaChronBtn", "📔 연대기", openChronicle, "action-chron"));
    arch.insertAdjacentElement("afterend", mkBtn("sagaPeopleBtn", "🤝 인연", openPeople, "action-people"));
    const st = document.createElement("style");
    st.textContent = `
.actions .btn.action-people{background:#fde8ec;color:#7a2a3b;border-color:#eab3bf}
.actions .btn.action-chron{background:#e9f3df;color:#3c5a22;border-color:#bcd7a3}
.saga-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:14px}
.saga-box{max-width:640px;width:100%;max-height:88vh;overflow:auto;overscroll-behavior:contain}
.saga-box h2{margin-top:0}
.saga-card{border:1px solid var(--line,#d9d0bd);border-radius:10px;padding:10px 12px;margin-top:8px}
.saga-card-head{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
.saga-rel{display:flex;align-items:center;gap:8px;margin:6px 0 2px}.saga-rel .bar{flex:1}
.saga-mem{margin:6px 0 0;padding-left:18px;font-size:12px;line-height:1.6;opacity:.85}
.saga-stage{font-size:14px;margin:14px 0 4px}
.saga-chron{margin:0;padding-left:0;list-style:none;font-size:13px;line-height:1.7}
.saga-chron li{padding:2px 0;border-bottom:1px dashed rgba(127,127,127,.2)}
.saga-chron li.w3{font-weight:700}.saga-chron li.w1{opacity:.75}
.saga-age{display:inline-block;min-width:44px;font-variant-numeric:tabular-nums;opacity:.7}
.saga-dead{margin-top:10px}.saga-close{margin-top:12px}
.saga-eval{max-width:400px;margin:0 auto 14px;padding:14px 16px;border:1px solid var(--line,#d9d0bd);border-radius:12px;text-align:left}
.saga-eval-head{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.saga-grade{font-size:30px;font-weight:800;line-height:1;min-width:40px;text-align:center;color:var(--gold,#b8860b)}
.saga-eval dl{margin:0}.saga-eval dl>div{padding:5px 0;border-top:1px dashed rgba(127,127,127,.25)}
.saga-eval dt{font-weight:700;font-size:13px}.saga-eval dd{margin:2px 0 0;line-height:1.5}
.saga-stars{color:var(--gold,#b8860b);letter-spacing:1px;font-weight:400}
.saga-epitaph{font-style:italic;margin:10px 0;line-height:1.6}`;
    document.head.appendChild(st);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountUI);
  else mountUI();
})();
