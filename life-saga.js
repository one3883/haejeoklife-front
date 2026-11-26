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
  // 이 값이 게임 설명에 표시된다. 화면에 다른 값이 보이면 예전 파일이 캐시에 남아 있는 것이다.
  window.LIFE_SAGA_VERSION = "20261124b";
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
  // ── 지금의 처지: 신분·직업·나이·장소에 따라 사건과 내용이 달라진다 ──
  const onShip = () => !!(p && p.ship);
  function who() {
    if (p.status === "천룡인") return "cel";
    if (p.job === "노예") return "slave";
    if (p.job === "현상금 사냥꾼") return "hunter";
    if (p.status === "해적") return "pirate";
    if (p.status === "해군") return "navy";
    if (p.status === "혁명군") return "revo";
    if (p.job === "은퇴자" || (p.flags && p.flags.retired)) return "retired";
    if (p.age < 16 || isMinorJob()) return "young";
    return "civ";
  }
  function placeKind(pl) {
    pl = pl || p.place || {};
    const n = pl.name || "",
      c = pl.country || "";
    if (/엔젤 아일랜드|스카이피아/.test(n + c)) return "sky";
    if (/어인섬/.test(n)) return "fishman";
    if (/와노쿠니/.test(c)) return "wano";
    if (/드럼/.test(n + c)) return "snow";
    if (/알라바스타/.test(c)) return "desert";
    if (/엘바프/.test(n + c)) return "giant";
    if (/나바론|마린포드/.test(n)) return "base";
    if (/워터 세븐|샤본디|로그타운|드레스로자|그란 테소로|중심가|홀케이크|알바나/.test(n)) return "city";
    if (typeof INLAND !== "undefined" && INLAND.includes(n)) return "inland";
    return "port";
  }
  const PF = {
    port: { walk: "방파제", eat: "생선구이", market: "어시장", spot: "노을 지는 방파제", errand: "그물 수선", job: "어시장 생선 손질" },
    city: { walk: "운하 옆 산책로", eat: "노점 꼬치", market: "큰 시장", spot: "불빛이 반짝이는 번화가", errand: "가게 간판 달기", job: "큰길 식당 서빙" },
    inland: { walk: "언덕길", eat: "들판 도시락", market: "장터", spot: "들꽃이 핀 언덕", errand: "울타리 고치기", job: "장터 짐 나르기" },
    desert: { walk: "모래 언덕", eat: "양고기 꼬치", market: "향신료 시장", spot: "오아시스의 야자수 그늘", errand: "도망간 낙타 찾기", job: "향신료 가게 포장" },
    snow: { walk: "눈길", eat: "뜨거운 수프", market: "털가죽 시장", spot: "눈 덮인 언덕의 오두막", errand: "지붕의 눈 치우기", job: "약초 말리기" },
    sky: { walk: "구름 위 오솔길", eat: "구름 과일", market: "다이얼 시장", spot: "구름 바다가 내려다보이는 섬 끝", errand: "구름 울타리 손보기", job: "구름 배달" },
    wano: { walk: "다리 위", eat: "주먹밥", market: "골목 장터", spot: "벚꽃 흩날리는 다리 위", errand: "장작 패기", job: "찻집 심부름" },
    fishman: { walk: "산호 거리", eat: "해초 요리", market: "해저 시장", spot: "햇빛이 스며드는 산호 정원", errand: "거품 산호 정리", job: "해저 식당 설거지" },
    giant: { walk: "거목 숲길", eat: "통구이", market: "거인들의 장터", spot: "거목의 뿌리 위", errand: "쓰러진 거목 치우기", job: "대장간 풀무질" },
    base: { walk: "성벽 위", eat: "군대 식당 밥", market: "기지 앞 장터", spot: "군함이 보이는 성벽 위", errand: "보급품 나르기", job: "기지 매점 정리" },
  };
  const pf = (k) => (PF[placeKind()] || PF.port)[k];
  // 반복될 수 있는 장면: 마지막으로 본 뒤 최소 yrs년(생애 단계 기준)이 지나야 다시 나온다
  const every = (key, yrs) => {
    const last = S().done["saga_" + key];
    return last === undefined || (realAge() - last) / lifeScale() >= yrs;
  };
  const recentCount = (cat, n = 5) => (S().recent || []).slice(0, n).filter((c) => c === cat).length;
  // 선택의 결과로 일어나는 일을 바로 다음 장면으로 끼워 넣는다
  function followUp(sc) {
    if (!sc || !Array.isArray(scenes)) return;
    sc.aftermath = true;
    sc.essential = true;
    sc.saga = true;
    const at = Math.min((typeof sceneIndex === "number" ? sceneIndex : 0) + 1, scenes.length);
    scenes.splice(at, 0, sc);
  }
  const auto = (key, title, body, effect, summary, o = {}) => mk(key, title, body, null, { ...o, effect, summary: summary || title });
  const JOB_ORDER = {
    어부: "어시장 상인이 생선 삼백 상자를 한꺼번에 주문했습니다",
    농부: "도시의 상단이 올해 수확물을 통째로 사겠다고 합니다",
    요리사: "마을 유지의 결혼식 연회 요리를 맡아 달라는 부탁이 왔습니다",
    조선공: "새 배 한 척을 석 달 안에 지어 달라는 주문이 들어왔습니다",
    상인: "먼 바다에서 온 대상단이 큰 거래를 제안했습니다",
    "상점 점원": "가게의 큰 단골이 한 해 치 물건을 한꺼번에 주문했습니다",
    "항구 노동자": "대형 화물선이 들어와 밤새 하역할 일손을 구합니다",
    "의사 견습": "이웃 마을에 열병이 돌아 의원 일손이 급히 필요합니다",
    학자: "왕실에서 오래된 고문서의 감정을 맡겼습니다",
    선원: "급한 화물을 다음 섬까지 날라 달라는 의뢰가 들어왔습니다",
    모험가: "지도에 없는 동굴을 조사해 달라는 의뢰가 들어왔습니다",
    과학자: "한 상단이 새 기계의 설계를 맡기고 싶어 합니다",
  };

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
    // 몇 년 뒤 등장하기로 이미 예약된 인물의 이름도 피한다
    if ((p.delayed || []).some((d) => d && d.data && d.data.name === name)) return true;
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
        if (x && x.promotion && c && !/승진|추진|도전|수락|받아/.test(c.title)) st.promoDeclined = (st.promoDeclined || 0) + 1;
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
          if (!p.ship && !["해적", "해군"].includes(p.status))
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
    // 한때의 일로 붙은 호칭(예: 알바 동료)은 평생 따라다니지 않게 한다
    (p.npcs || []).forEach((n) => {
      if (n.title && /^(알바 동료|직장 동료)$/.test(n.title)) n.title = null;
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
          if (n.rel >= 65 && old === p.place.name && p.age - (n.lastSeen ?? -99) <= 2 && !onShip()) schedule("saga_moved", 0, { id: n.id, from: old });
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
    // 20세(턴 나이) 전에는 결혼식·청첩장 사건을 보여 주지 않는다
    if (p.age < 20) return null;
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
            const single = !spouse() && !lover() && p.age >= 18;
            followUp(
              auto(
                "wedding_party_" + n.id,
                "피로연",
                own
                  ? `피로연에서 ${n.spouse}의 부모가 술잔을 들고 다가왔습니다. "이제 한 식구입니다." 두 집안 사람들이 뒤섞여 밤늦도록 노래를 불렀습니다.`
                  : single
                    ? `피로연 자리에서 옆에 앉은 사람과 이야기가 잘 통했습니다. ${n.name}${ga(n.name)} 눈을 찡긋하며 "둘이 잘 어울린다"고 귓속말을 했습니다.`
                    : `피로연에서 ${n.name}${ga(n.name)} 잔을 들고 와 말했습니다. "와 줘서 정말 고마워. 네가 없었으면 허전했을 거야."`,
                () => {
                  p.happiness += 3;
                  if (!own && single) {
                    const g = p.gender === "남성" ? "여성" : "남성";
                    const m = peer({ role: "친구", gender: g, d: ri(-4, 4), rel: ri(60, 72), home: homeOf(n) });
                    remember(m, `${n.name}의 결혼식 피로연에서 처음 만남`, "first_meet", 2);
                  }
                },
                "피로연을 즐김",
                { npc: n },
              ),
            );
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
      if (hasPower()) return powerFloodScene();
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
  function firstDate(n) {
    const spot = pf("spot"),
      eat = pf("eat");
    return auto(
      "fl_date_" + n.id,
      "첫 데이트",
      `${spot}에서 ${n.name}${wa(n.name)} 처음으로 단둘이 시간을 보냈습니다. ${eat}${eul(eat)} 나눠 먹으며 별것 아닌 이야기에도 한참을 웃었습니다.`,
      () => {
        n.rel = Math.min(100, n.rel + 5);
        remember(n, `${spot}에서의 첫 데이트`, "date", 2);
        p.happiness += 4;
      },
      `${n.name}${wa(n.name)} 첫 데이트`,
      { npc: n },
    );
  }
  function awkwardDay(n, key) {
    return mk(
      key + n.id,
      "어색한 다음 날",
      `다음 날 ${n.name}${wa(n.name)} 마주쳤습니다. 서로 눈을 피하는 공기가 무겁습니다.`,
      [
        { title: "아무 일 없었던 것처럼 먼저 인사한다", desc: "우정은 지킨다.", run: () => { n.rel = Math.min(100, n.rel + 6); remember(n, "거절한 다음 날에도 먼저 웃으며 인사해 줌", "kind", 2); log(`${n.name}에게 먼저 인사를 건넴`); } },
        { title: "한동안 피해 다닌다", desc: "관계가 멀어진다.", run: () => { n.rel -= 8; p.happiness -= 2; log(`${n.name}${eul(n.name)} 피해 다님`); } },
      ],
      { npc: n },
    );
  }
  function weddingDay(n) {
    const w = who();
    const where =
      w === "pirate" ? "배의 갑판 위" :
      w === "navy" ? "기지 안의 작은 예배당" :
      { wano: "마을 신사", sky: "구름 위의 신전", fishman: "산호 광장", desert: "오아시스 옆 천막", snow: "눈 덮인 교회", giant: "거목 아래", city: "광장의 종탑 아래" }[placeKind()] || "바다가 보이는 언덕";
    const guests = closeNpcs((x) => x !== n && x.rel >= 55 && (near(x) || FAMILY.includes(x.role))).slice(0, 3).map((x) => x.name);
    return auto(
      "wedding_day_" + n.id,
      "결혼식",
      `${where}에서 ${n.name}${wa(n.name)} 결혼식을 올렸습니다.${guests.length ? ` ${guests.join(", ")}${ga(guests[guests.length - 1])} 맨 앞줄에서 박수를 쳤습니다.` : ""}${w === "pirate" ? " 선원들은 술통을 굴려 와 밤새 노래를 불렀습니다." : ""}`,
      () => {
        p.happiness += 6;
        npcsBy((x) => guests.includes(x.name)).forEach((x) => remember(x, `${p.name}의 결혼식에 참석함`, "wedding_guest", 1));
      },
      "결혼식을 올림",
    );
  }
  function romanceScenes(out) {
    const s = S(),
      a = p.age,
      w = who();
    const lv = lover();
    const opp = p.gender === "남성" ? "여성" : "남성";
    if (a >= 14 && a <= 18 && !done("teen_firstlove") && !lv && !spouse() && free() && w !== "cel") {
      let n = pick(npcsBy((x) => ["친구", "라이벌", "동료"].includes(x.role) && x.gender === opp && Math.abs(ea(x) - a) <= 3 && x.rel >= 40 && near(x)));
      const where = w === "pirate" ? "같은 배를 탄 또래 선원" : w === "navy" ? "같은 기수의 훈련병" : "같은 동네에 사는 또래";
      out.push(
        mk(
          "teen_firstlove",
          "설레는 마음",
          n
            ? `${n.name}${wa(n.name)} 늘 함께 지냈는데, 언제부턴가 그 앞에서는 말이 꼬이고 얼굴이 달아오릅니다.`
            : `요즘 들어 자꾸 눈이 가는 사람이 있습니다. ${where}인데, 그 사람이 웃으면 하루 종일 기분이 좋습니다.`,
          [
            {
              title: "용기를 내 마음을 전한다",
              desc: "첫사랑의 결말은 아무도 모른다.",
              run: () => {
                if (!n) n = peer({ role: w === "pirate" || w === "navy" ? "동료" : "친구", gender: opp, d: ri(-1, 1), rel: ri(50, 65) });
                if (chance(0.45 + n.rel / 250 + p.happiness / 500)) {
                  n.rel = Math.min(100, n.rel + 15);
                  remember(n, `${pf("walk")}에서 서로 첫사랑이 됨`, "firstlove", 3);
                  s.firstLoveId = n.id;
                  p.happiness += 8;
                  chron(`${n.name}${wa(n.name)} 첫사랑을 시작함`, "인연", 3);
                  log(`${n.name}${wa(n.name)} 첫사랑을 시작함`);
                  followUp(firstDate(n));
                } else {
                  n.rel = Math.max(20, n.rel - 5);
                  remember(n, "고백했지만 친구로 남자는 답을 들음", "crush", 2);
                  p.happiness -= 4;
                  log(`${n.name}에게 고백했지만 거절당함`);
                  followUp(awkwardDay(n, "fl_awk_"));
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
                log("첫사랑을 마음속에 간직함");
                followUp(auto("fl_letter_" + n.id, "부치지 못한 편지", `그날 밤 ${n.name}에게 쓰려던 편지를 몇 번이나 고쳐 쓰다 결국 서랍 깊숙이 넣었습니다. 언젠가 이 편지를 다시 꺼내 보게 될지도 모릅니다.`, () => { p.knowledge += 1; }, "부치지 못한 편지를 서랍에 넣음"));
              },
            },
          ],
          { min: 13, valid: () => !lover() && !spouse() },
        ),
      );
    }
    const fl = s.firstLoveId && npcById(s.firstLoveId);
    if (alive(fl) && a >= 18 && a <= 21 && !done("firstlove_fork") && !spouse() && fl.role !== "연인") {
      const leaving = w === "pirate" || w === "navy" ? "당신이 바다로 나가게 되면서" : `${fl.name}${ga(fl.name)} 먼 섬으로 일을 하러 떠나게 되면서`;
      out.push(
        mk(
          "firstlove_fork",
          "첫사랑의 갈림길",
          `${leaving} 둘은 갈림길에 섰습니다. 어린 날의 사랑을 이어 갈지, 각자의 길을 갈지 정해야 합니다.`,
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
                followUp(auto("fl_vow_" + fl.id, "둘만의 약속", `${pf("spot")}에서 ${fl.name}${ga(fl.name)} 손을 내밀었습니다. "어디로 가든 같이 가자." 그 말 한마디에 앞으로의 날들이 조금 덜 두려워졌습니다.`, () => { fl.rel = Math.min(100, fl.rel + 5); remember(fl, "어디로 가든 같이 가자고 약속함", "vow", 3); }, "첫사랑과 함께하기로 약속함"));
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
                const by = placeKind() === "inland" || placeKind() === "desert" ? "마차" : placeKind() === "sky" ? "구름길" : "배";
                followUp(auto("fl_bye_" + fl.id, "떠나는 날", `${by}${ga(by)} 멀어질 때까지 손을 흔들었습니다. ${fl.name}${eun(fl.name)} 끝까지 뒤를 돌아보지 않았지만, 어깨가 떨리고 있었습니다.`, () => { p.happiness -= 2; }, "첫사랑을 떠나보냄"));
              },
            },
          ],
          { essential: true, npc: fl, valid: () => fl.role !== "연인" && !spouse() && !lover() },
        ),
      );
    }
    if (!lv && !spouse() && a >= 20 && a <= 50 && free() && w !== "cel") {
      const c = closeNpcs((x) => ["친구", "동료", "은인"].includes(x.role) && x.gender === opp && x.rel >= 70 && !x.spouse && Math.abs(ea(x) - a) <= 10 && ea(x) >= 18 && near(x))[0];
      if (c && !done("love_" + c.id)) {
        const m = bestMemory(c);
        out.push(
          mk(
            "love_" + c.id,
            `${c.name}에게 끌리는 마음`,
            `${c.name}${wa(c.name)} 함께 있으면 시간이 빨리 갑니다. ${m ? `'${m.t}' 그날 이후로` : "언제부턴가"} 친구 이상의 마음이 자랐다는 걸 둘 다 눈치채고 있습니다.`,
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
                    followUp(firstDate(c));
                  } else {
                    c.rel -= 10;
                    remember(c, "고백을 받았지만 친구로 남기로 함", "crush", 2);
                    p.happiness -= 4;
                    log(`${c.name}${ga(c.name)} 친구로 남자고 함`);
                    followUp(awkwardDay(c, "love_awk_"));
                  }
                },
              },
              { title: "지금의 우정을 지킨다", desc: "", run: () => { c.rel = Math.min(100, c.rel + 3); remember(c, "마음을 접고 좋은 친구로 남음", "crush", 1); log(`${c.name}${wa(c.name)} 친구로 남기로 함`); } },
            ],
            { npc: c, roles: ["친구", "동료", "은인"], valid: () => !spouse() && !lover() && !c.spouse },
          ),
        );
      }
    }
    if (lv) {
      const yrs = realAge() - (s.loverSince ?? realAge());
      if (yrs >= realOf(2) && !done("propose_" + lv.id))
        out.push(
          mk(
            "propose_" + lv.id,
            `${lv.name}${wa(lv.name)}의 미래`,
            `${lv.name}${wa(lv.name)} 만난 지 ${yrs}년. 함께한 계절이 쌓여 이제 서로 없는 내일은 잘 떠오르지 않습니다.`,
            [
              { title: "청혼한다", desc: "평생을 함께하기로 한다.", run: () => { marry(lv); p.happiness += 12; followUp(weddingDay(lv)); } },
              { title: "아직은 지금 이대로가 좋다", desc: "몇 년 뒤 다시 생각한다.", run: () => { lv.rel -= 4; s.loverSince = realAge(); delete s.done["saga_propose_" + lv.id]; log(`${lv.name}에게 청혼을 미룸`); } },
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
                  followUp(auto("breakup_" + lv.id, "혼자 남은 밤", `${lv.name}의 물건이 빠져나간 방은 생각보다 넓었습니다. ${pf("walk")}${eul(pf("walk"))} 혼자 걷다 보니 둘이 걷던 길이 전부 기억났습니다.`, () => { p.happiness -= 3; }, "이별 후의 밤"));
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
              { title: "함께 모든 것을 버리고 떠나자고 한다", desc: "", run: () => { lv.aff = "민간인"; lv.job = "선원"; lv.rel = Math.min(100, lv.rel + 10); remember(lv, "사랑을 위해 소속을 버림", "sacrifice", 3); log(`${lv.name}${ga(lv.name)} 당신을 위해 소속을 버림`); } },
              { title: "각자의 신념을 존중한다", desc: "", run: () => { lv.rel -= 5; remember(lv, "서로의 신념을 존중하기로 함", "respect", 2); log(`${lv.name}${wa(lv.name)} 서로의 길을 존중하기로 함`); } },
            ],
            { npc: lv, roles: ["연인"] },
          ),
        );
    }
  }
  function rivalScenes(out) {
    const a = p.age,
      w = who();
    const rv = pick(npcsBy((n) => n.role === "라이벌" && ea(n) >= 16 && (near(n) || chance(0.3))));
    if (!rv || a < 25 || done("rival_cross_" + rv.id) || w === "cel") return;
    const where = w === "pirate" ? `${p.place.name}의 항구 술집` : w === "navy" ? "본부 합동 훈련장" : `${pf("market")} 골목의 술집`;
    const task = { pirate: "항구를 휘젓던 불량배들을 함께 몰아냈습니다", navy: "합동 순찰을 돌며 서로의 등을 맡겼습니다", revo: "같은 밤 같은 마을에서 사람들을 대피시켰습니다", hunter: "같은 현상범을 쫓다 결국 손을 잡았습니다" }[w] || `${p.place.name}의 축제 준비를 둘이 맡아 밤새 일했습니다`;
    out.push(
      mk(
        "rival_cross_" + rv.id,
        `오랜 라이벌, ${rv.name}`,
        `어릴 때부터 사사건건 부딪쳤던 ${rv.name}${wa(rv.name)} ${where}에서 마주쳤습니다. ${rv.name}${eun(rv.name)} 지금 ${npcDesc(rv)}. 서로 많이 변했지만, 눈빛만은 그대로입니다.`,
        [
          {
            title: "잔을 내밀며 화해를 청한다",
            desc: "라이벌이 친구가 될 수 있다.",
            run: () => {
              if (chance(0.45 + rv.rel / 200)) {
                setRole(rv, "친구", "오랜 경쟁 끝에 술잔을 나누며 친구가 됨");
                rv.rel = Math.max(rv.rel, 60);
                log(`라이벌 ${rv.name}${wa(rv.name)} 친구가 됨`);
                followUp(auto("rival_team_" + rv.id, `${rv.name}${wa(rv.name)} 같은 편에서`, `화해한 지 며칠 뒤, ${rv.name}${wa(rv.name)} 처음으로 같은 편에 섰습니다. ${task}. 늘 맞서던 상대가 등 뒤에 있으니 이상하게 든든했습니다.`, () => { rv.rel = Math.min(100, rv.rel + 8); remember(rv, "처음으로 같은 편에서 함께함", "team", 2); gainStanding(1); }, `${rv.name}${wa(rv.name)} 같은 편에서 함께함`, { npc: rv }));
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
              followUp(auto("rival_fire_" + rv.id, "다시 불붙은 경쟁", `그날 이후 ${rv.name}의 소식이 들릴 때마다 가만히 있을 수가 없었습니다. ${w === "civ" || w === "retired" ? "일에서도" : "수련에서도"} 지고 싶지 않았습니다.`, () => { if (w === "civ" || w === "retired") p.knowledge += 3; else p.combat += 2; }, "라이벌 덕에 다시 불이 붙음", { npc: rv }));
            },
          },
        ],
        { npc: rv, roles: ["라이벌"] },
      ),
    );
  }
  function teacherScenes(out) {
    const a = p.age,
      s = S();
    if (a < 8 || a > 14 || done("teacher") || !free() || p.status === "천룡인") return;
    if (!(p.school || p.job === "학생") || who() !== "young" || recentCount("study") < 2) return;
    out.push(
      mk(
        "teacher",
        "눈여겨보는 어른",
        `${p.place.name}에서 아이들을 가르치는 선생님이 수업이 끝난 뒤 당신을 불러 세웠습니다. "요즘 늦게까지 남아 공부하더구나. 궁금한 게 있으면 언제든 찾아오렴."`,
        [
          {
            title: "그날부터 매일 찾아간다",
            desc: "지식↑ · 평생의 은사가 생긴다.",
            run: () => {
              const t = makeNpc({ role: "은인", title: "선생님", age: realAge() + realOf(ri(25, 40)), job: "교사", rel: ri(65, 80), power: 5 });
              t.scale = lifeScale();
              remember(t, "늦게까지 남아 공부하던 아이를 제자처럼 아낌", "teacher", 3);
              p.knowledge += 3;
              schedule("saga_teacher", Math.max(4, 20 - p.age + ri(0, 4)), { id: t.id });
              chron(`평생의 은사 ${t.name} 선생님을 만남`, "인연", 2);
              log(`${t.name} 선생님에게 배우기 시작함`);
              followUp(auto("teacher_first_" + t.id, "선생님의 서재", `${t.name} 선생님의 서재에는 ${p.place.country}의 옛 지도와 바다 건너 온 책들이 빼곡했습니다. 선생님은 책 한 권을 건네며 말했습니다. "다 읽으면 그때 이야기하자."`, () => { p.knowledge += 3; remember(t, "서재에서 첫 책을 빌려줌", "book", 2); }, "선생님에게 첫 책을 빌림", { npc: t }));
            },
          },
          { title: "고개만 꾸벅 숙이고 돌아간다", desc: "", run: () => { p.knowledge += 1; log("선생님의 말에 고개만 숙임"); } },
        ],
        { min: 0 },
      ),
    );
  }
  function friendNeedScene(out) {
    if (!adultLife() || p.age < 22 || who() === "cel") return;
    const n = pick(npcsBy((x) => ["친구", "은인", "동료"].includes(x.role) && x.rel >= 50 && ea(x) >= 20 && near(x) && !hasMem(x, "helped") && !hasMem(x, "refused_help")));
    if (!n || done("friend_need_" + n.id)) return;
    const j = String(n.job);
    const what = /해적/.test(j) ? "선장에게 버림받아 항구에 홀로 남겨지고" : /해군/.test(j) ? "작전 실패의 책임을 지고 쫓겨나" : /어부/.test(j) ? "폭풍에 배를 잃고" : /상인|상점|여관/.test(j) ? "가게가 망해 빚에 쫓기고" : /의사/.test(j) ? "환자를 잃은 죄책감에 손을 놓고" : rand(["몸을 크게 다쳐 일을 못 하고", "가족을 잃고 술에 빠져 지내고", "빚에 쫓기고"]);
    const good = ["성실한", "다정한", "정의감이 강한"].includes(n.personality);
    out.push(
      mk(
        "friend_need_" + n.id,
        `무너진 친구, ${n.name}`,
        `${n.name}${ga(n.name)} ${what} 있다는 소식을 들었습니다. 찾아가 보니 예전의 ${n.personality} 모습은 온데간데없었습니다.`,
        [
          {
            title: "곁을 지키며 다시 일어설 때까지 돕는다",
            desc: "돈과 시간이 든다.",
            req: { money: moneyAdult(100000, 100000) },
            run: () => {
              p.money -= moneyAdult(100000, 250000);
              n.rel = Math.min(100, n.rel + 15);
              remember(n, "가장 힘들 때 곁을 지켜 줌", "helped", 3);
              log(`무너진 친구 ${n.name}의 곁을 지킴`);
              if (chance(good ? 0.8 : 0.45)) {
                schedule("saga_help_return", ri(6, 15), { id: n.id });
                followUp(auto("friend_rise_" + n.id, `다시 일어선 ${n.name}`, `몇 달 뒤, ${n.name}${ga(n.name)} 다시 일을 시작했습니다. 첫 벌이를 들고 와 어색하게 웃었습니다. "이건 이자야. 원금은 꼭 갚을게."`, () => { p.happiness += 5; n.rel = Math.min(100, n.rel + 5); }, `${n.name}${ga(n.name)} 다시 일어섬`, { npc: n }));
              } else
                followUp(
                  mk("friend_fall_" + n.id, `또 무너진 ${n.name}`, `잠시 나아지는 듯하던 ${n.name}${ga(n.name)} 다시 술집 구석에 앉아 있었습니다. 당신이 건넨 돈도 이미 바닥났다고 합니다.`, [
                    { title: "한 번만 더 믿어 본다", desc: "돈↓ · 끝까지 곁에 남는다.", run: () => { p.money -= moneyAdult(50000, 120000); n.rel = Math.min(100, n.rel + 10); remember(n, "두 번이나 믿어 줌", "helped", 3); schedule("saga_help_return", ri(8, 16), { id: n.id }); log(`${n.name}${eul(n.name)} 한 번 더 믿어 줌`); } },
                    { title: "이제는 스스로 일어서라며 등을 돌린다", desc: "", run: () => { n.rel -= 10; p.happiness -= 3; remember(n, "결국 등을 돌림", "left", 2); log(`${n.name}에게서 등을 돌림`); } },
                  ], { npc: n }),
                );
            },
          },
          { title: "위로의 말만 건넨다", desc: "", run: () => { n.rel += 2; remember(n, "위로의 말을 건넴", "comfort", 1); log(`${n.name}에게 위로의 말을 건넴`); } },
          {
            title: "내 코가 석 자다",
            desc: "관계가 크게 나빠진다.",
            run: () => {
              n.rel -= 25;
              remember(n, "가장 힘들 때 외면당함", "refused_help", 3);
              log(`${n.name}의 어려움을 외면함`);
              const others = npcsBy((x) => x !== n && ["친구", "동료"].includes(x.role) && near(x)).slice(0, 3);
              followUp(auto("friend_shut_" + n.id, "닫힌 문", `${n.name}${eun(n.name)} 그 뒤로 당신을 보면 고개를 돌렸습니다.${others.length ? ` 소문은 금방 퍼져 ${others.map((x) => x.name).join(", ")}도 당신을 예전처럼 대하지 않습니다.` : ""}`, () => { p.relationship -= 3; others.forEach((x) => (x.rel -= 4)); }, "친구를 외면한 소문이 퍼짐"));
            },
          },
        ],
        { npc: n, roles: ["친구", "은인", "동료"] },
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
  function habitScenes(out) {
    const s = S(),
      a = p.age,
      w = who();
    if (!free() || w === "cel") return;
    const HB_FIRST = { 낚시: "처음으로 제 손으로 낚은 물고기를 들고 한참을 자랑했습니다", 그림: "처음 완성한 그림은 삐뚤빼뚤했지만 벽에 붙여 두었습니다", 음악: "처음으로 한 곡을 끝까지 연주하자 듣던 사람들이 박수를 쳤습니다", 요리: "처음 끓인 국은 짰지만 가족들은 다 먹어 주었습니다", 목공: "처음 깎은 의자는 한쪽 다리가 짧았지만 아직도 쓰고 있습니다", 원예: "처음 심은 씨앗에서 싹이 올라온 날, 몇 번이나 들여다보았습니다", 독서: "밤새 읽은 책 한 권이 머릿속에서 떠나지 않았습니다" };
    if (!s.hobby && a >= 9 && (recentCount("hobby") >= 1 || a >= 18) && !done("hobby_pick"))
      out.push(
        mk(
          "hobby_pick",
          "마음이 가는 일",
          onShip() ? "배 위에서 남는 시간이면 자꾸 손이 가는 일이 생겼습니다. 누가 시키지 않아도 즐거운 일입니다." : "남는 시간이면 자꾸 손이 가는 일이 생겼습니다. 누가 시키지 않아도 즐거운 일. 평생 곁에 두게 될지도 모릅니다.",
          Object.entries(HOBBIES)
            .filter(([k]) => !(onShip() && ["원예", "목공"].includes(k)))
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map(([k, v]) => ({
              title: k,
              desc: `${v.verb} 시간이 즐겁다.`,
              run: () => {
                s.hobby = k;
                s.hobbyLv = Math.max(1, s.hobbyLv);
                p.happiness += 3;
                chron(`취미로 ${k}${eul(k)} 시작함`, "일상", 1);
                log(`취미로 ${k}${eul(k)} 시작함`);
                followUp(auto("hobby_first", `첫 ${k}`, `${HB_FIRST[k] || "처음 해 본 일이 생각보다 즐거웠습니다"}.`, () => { p.happiness += 2; }, `처음으로 ${k}${eul(k)} 해 봄`));
              },
            })),
          { min: 0 },
        ),
      );
    if (s.hobby && s.hobbyLv >= 3 && !done("hobby_club") && a >= 12 && !onShip() && ["civ", "young", "retired"].includes(w))
      out.push(
        mk(
          "hobby_club",
          `${s.hobby} 모임`,
          `${p.place.name}에 ${s.hobby}${eul(s.hobby)} 좋아하는 사람들이 모이는 작은 모임이 있다는 걸 알게 되었습니다.`,
          [
            {
              title: "모임에 나가 본다",
              desc: "같은 취미의 친구가 생긴다.",
              run: () => {
                const n = peer({ role: "친구", d: ri(-8, 8), rel: ri(55, 70) });
                n.hobby = s.hobby;
                remember(n, `${s.hobby} 모임에서 처음 만남`, "hobby", 2);
                s.hobbyLv += 1;
                log(`${s.hobby} 모임에 나감`);
                followUp(auto("hobby_club_day", "모임의 첫날", `문을 열고 들어가자 ${n.name}${ga(n.name)} 손을 흔들었습니다. "처음이죠? 여기 앉아요." 그날 둘은 ${s.hobby} 이야기로 해가 지는 줄도 몰랐습니다.`, () => { p.happiness += 4; n.rel = Math.min(100, n.rel + 5); }, `${s.hobby} 모임에서 ${n.name}${wa(n.name)} 친해짐`, { npc: n }));
              },
            },
            { title: "혼자 즐기는 게 좋다", desc: "", run: () => { s.hobbyLv += 1; log(`${s.hobby}${eul(s.hobby)} 혼자 즐기기로 함`); } },
          ],
          { min: 0 },
        ),
      );
    if (s.hobby && s.hobbyLv >= 7 && !done("hobby_master") && a >= 16) {
      const H = HOBBIES[s.hobby] || {};
      const crowd = onShip() ? "선원들이 쉬는 시간마다 당신의 솜씨를 보러 모여듭니다. 다음 항구에서 실력을 보여 보라고 부추깁니다." : `이제 ${p.place.name} 사람들이 당신의 ${s.hobby} 솜씨를 보러 일부러 찾아옵니다. 작은 대회와 전시를 열어 보자는 제안이 들어왔습니다.`;
      out.push(
        mk(
          "hobby_master",
          `${s.hobby}의 경지`,
          `오랜 세월 ${H.verb || "몰두해 온"} 시간이 쌓였습니다. ${crowd}`,
          [
            {
              title: "사람들 앞에 실력을 내보인다",
              desc: "명성↑ · 뜻밖의 제안이 올 수 있다.",
              run: () => {
                p.reputation += 3;
                p.happiness += 5;
                achieve(`${s.hobby}의 명인`);
                log(`${s.hobby} 솜씨로 이름이 알려짐`);
                followUp(
                  mk("hobby_patron", "구경꾼 중 한 사람", `구경꾼 사이에서 차림새가 좋은 사람이 다가왔습니다. "제 가게와 손님들을 위해 ${s.hobby} 일을 맡아 주실 수 있겠습니까? 사례는 넉넉히 하지요."`, [
                    { title: "의뢰를 맡는다", desc: "돈↑ · 취미가 일이 된다.", run: () => { p.money += moneyAdult(120000, 360000); s.hobbyLv += 1; log(`${s.hobby} 의뢰를 맡아 사례를 받음`); } },
                    { title: "좋아서 하는 일로 남기고 싶다며 사양한다", desc: "행복↑", run: () => { p.happiness += 4; log(`${s.hobby} 의뢰를 사양함`); } },
                  ]),
                );
              },
            },
            H.job && adultLife() && p.status === "민간인" && p.job !== H.job && {
              title: `아예 ${H.job}${ro(H.job)} 살아 본다`,
              desc: "취미가 직업이 된다.",
              run: () => { setCareer(H.job, "민간인"); p.happiness += 6; log(`취미였던 ${s.hobby}${ro(s.hobby)} ${H.job}${ga(H.job)} 됨`); },
            },
            { title: "그저 좋아서 하는 일로 남긴다", desc: "행복↑", run: () => { p.happiness += 6; log(`${s.hobby}${eul(s.hobby)} 소박한 즐거움으로 남김`); } },
          ],
        ),
      );
    }
    // 공부: 최근 몇 해 동안 실제로 공부에 시간을 쓴 경우에만, 지금의 처지에 맞는 모습으로
    if (recentCount("study") >= 3 && !done("study_fruit") && a >= 12) {
      const txt = {
        young: "몇 해 동안 꾸준히 붙든 공부가 어느 순간 서로 이어지기 시작했습니다. 예전엔 어렵던 책이 술술 읽힙니다.",
        civ: `일을 마치고 밤마다 붙든 책이 일에 쓰이기 시작했습니다. ${p.job} 일을 하는 동료들이 모르는 것을 당신에게 묻습니다.`,
        pirate: "밤마다 선실에서 해도와 항해 일지를 펼쳐 놓고 공부한 보람이 있었습니다. 이제는 항해사보다 먼저 날씨와 해류의 변화를 읽습니다.",
        navy: "틈틈이 읽은 전술 교범과 해도가 머릿속에서 이어졌습니다. 작전 회의에서 당신의 의견이 처음으로 채택되었습니다.",
        revo: "몰래 돌려 읽던 금서와 각국의 기록이 하나로 꿰어졌습니다. 세계정부가 숨기는 것의 윤곽이 보이기 시작합니다.",
        hunter: "현상범 기록과 수배서를 파고든 덕분에, 이제는 소문 몇 마디만으로 현상범의 행선지를 짐작합니다.",
        retired: "젊어서 못 다 한 공부를 다시 붙들었습니다. 늦게 배운 것이 더 오래 남는다는 걸 알게 되었습니다.",
      }[w];
      if (txt) out.push(auto("study_fruit", "쌓인 공부의 힘", txt, () => { p.knowledge += 6; if (w === "navy" || w === "pirate") gainStanding(1); }, "꾸준한 공부가 결실을 맺음"));
    }
    if (recentCount("study") >= 3 && w === "civ" && p.knowledge >= 40 && !["학자", "의사 견습"].includes(p.job) && !done("study_offer"))
      out.push(
        mk(
          "study_offer",
          "배움이 연 문",
          `${p.job} 일을 하면서도 놓지 않은 공부가 소문이 나, ${p.place.name}의 학자 모임과 의원에서 함께 일하자는 제안이 왔습니다.`,
          [
            { title: "학자가 된다", desc: "직업이 학자로 바뀐다.", run: () => { setCareer("학자", "민간인"); log("공부 끝에 학자가 됨"); followUp(auto("scholar_day1", "학자로서의 첫날", "처음 받은 책상 위에는 먼지 쌓인 문서 더미가 놓여 있었습니다. 선배 학자는 웃으며 말했습니다. \"여기서는 모르는 걸 부끄러워하지 않는 사람이 이겨.\"", () => { p.knowledge += 2; }, "학자로 첫 출근")); } },
            { title: "의원에서 의술을 배운다", desc: "직업이 의사 견습으로 바뀐다.", run: () => { setCareer("의사 견습", "민간인"); log("공부 끝에 의원에서 일하게 됨"); followUp(auto("doctor_day1", "의원에서의 첫날", "첫날부터 열이 펄펄 끓는 아이가 업혀 왔습니다. 손이 떨렸지만, 책에서 본 대로 차근차근 해냈습니다.", () => { p.knowledge += 2; p.happiness += 2; }, "의원에서 첫 환자를 봄")); } },
            { title: "지금 일을 계속한다", desc: "지식↑", run: () => { p.knowledge += 3; log("배움을 지금의 일에 보태기로 함"); } },
          ],
        ),
      );
    // 운동
    if (recentCount("exercise") + recentCount("health") >= 3 && !done("body_fruit") && a >= 12) {
      const txt = { pirate: "갑판 위에서 매일 밧줄을 타고 무게를 들어 올린 덕분에, 폭풍 속에서도 몸이 흔들리지 않습니다.", navy: "새벽 훈련을 한 번도 거르지 않았더니, 동기들 사이에서 가장 오래 버티는 사람이 되었습니다." }[w] || "꾸준히 몸을 움직인 덕분에 숨이 덜 차고 잔병치레가 줄었습니다. 거울 속 자신이 조금 자랑스럽습니다.";
      out.push(auto("body_fruit", "단단해진 몸", txt, () => { p.health += 6; p.combat += 2; }, "꾸준한 단련으로 몸이 단단해짐"));
    }
    if (recentCount("exercise") >= 3 && a >= 16 && a <= 50 && !done("tournament") && ["civ", "navy", "pirate", "hunter", "young"].includes(w)) {
      const T = {
        navy: ["지부 무술 대회", `${p.place.name} 지부에서 병사들의 무술 대회가 열립니다.`],
        pirate: ["뒷골목 내기 격투", `${p.place.name}의 뒷골목에서 선원들이 돈을 걸고 맨손 격투를 벌입니다.`],
        hunter: ["뒷골목 내기 격투", `${p.place.name}의 뒷골목에서 돈을 걸고 맨손 격투가 벌어집니다. 현상범 몇이 섞여 있다는 소문입니다.`],
      }[w] || ["섬 대항 체력 대회", `${p.place.name}에서 섬 대항 체력 대회가 열립니다. 그동안 단련한 몸을 시험해 볼 기회입니다.`];
      out.push(
        mk(
          "tournament",
          T[0],
          T[1],
          [
            {
              title: "출전한다",
              desc: "승패에 따라 결과가 달라진다.",
              req: { health: 40 },
              run: () => {
                if (chance(0.35 + p.combat / 200 + p.health / 400)) {
                  p.reputation += 4;
                  p.money += moneyAdult(60000, 200000);
                  achieve(`${T[0]} 우승`);
                  log(`${T[0]}에서 우승함`);
                  if (w === "civ" || w === "young") {
                    if (!(typeof noNavyHere === "function" && noNavyHere()))
                      followUp(
                        mk("tourney_scout", "모병관의 눈", `시상식이 끝나자 해군 모병관이 다가왔습니다. "그 몸이면 해군에서 크게 될 거요. 생각 있소?"`, [
                          { title: "해군에 입대한다", desc: "직업이 해군으로 바뀐다.", run: () => { setCareer("해군", "해군"); p.combat += 3; log("체력 대회 우승 뒤 해군에 입대함"); } },
                          { title: "지금의 삶이 좋다", desc: "", run: () => { p.happiness += 2; log("모병관의 제안을 거절함"); } },
                        ]),
                      );
                  } else if (w === "navy") followUp(auto("tourney_navy", "상관의 칭찬", "우승 소식을 들은 상관이 어깨를 두드렸습니다. \"다음 작전에 자네를 앞세우지.\"", () => { gainStanding(2); }, "상관의 눈에 듦"));
                  else
                    followUp(
                      mk("tourney_challenger", "도전자", `판이 끝나자마자 덩치 큰 사내가 테이블을 내리쳤습니다. "운이 좋았을 뿐이야. 나랑 한 판 더 해!"`, [
                        { title: "받아 준다", desc: "이기면 이름이 더 알려진다.", run: () => { if (chance(0.5 + p.combat / 250)) { p.reputation += 3; gainStanding(1); log("도전자까지 꺾음"); } else { p.health -= ri(4, 9); log("도전자에게 짐"); } } },
                        { title: "상금을 챙겨 자리를 뜬다", desc: "", run: () => { log("상금을 챙겨 자리를 뜸"); } },
                      ]),
                    );
                } else {
                  p.health -= ri(2, 6);
                  p.happiness += 1;
                  log(`${T[0]}에서 아깝게 짐`);
                }
              },
            },
            { title: "구경만 한다", desc: "", run: () => { p.happiness += 2; log(`${T[0]}${eul(T[0])} 구경함`); } },
          ],
        ),
      );
    }
    if ((s.habits.exercise || 0) + (s.habits.health || 0) >= 12 && a >= 60 && !done("vigor"))
      out.push(auto("vigor", "노익장", `또래들이 지팡이를 짚을 때, 당신은 아침마다 ${pf("walk")}${eul(pf("walk"))} 걷습니다. 젊어서부터 쌓아 온 습관이 노년의 몸을 지켜 주고 있습니다.`, () => { p.health += 8; achieve("노익장을 과시함"); }, "평생의 운동 습관이 노년을 지켜 줌"));
    if ((s.habits.travel || 0) >= 5 && (s.trips || []).length >= 3 && !done("travelogue") && a >= 18 && ["civ", "retired"].includes(w))
      out.push(
        mk("travelogue", "여행기를 쓰다", `${(s.trips || []).slice(-4).join(", ")}… 다녀온 곳들의 기억을 정리하다 보니 공책 한 권이 가득 찼습니다. 출판사에서 책으로 내자는 연락이 왔습니다.`, [
          { title: "책으로 낸다", desc: "명성↑ · 돈↑", run: () => { p.reputation += 3; p.money += moneyAdult(60000, 180000); achieve("여행기를 출간함"); log("여행기를 출간함"); followUp(auto("travelogue_letter", "독자의 편지", `몇 달 뒤 낯선 섬의 아이에게서 편지가 왔습니다. "책에 나온 ${rand(s.trips)}에 꼭 가 보고 싶어요. 바다는 정말 그렇게 넓어요?"`, () => { p.happiness += 4; }, "독자에게서 편지를 받음")); } },
          { title: "내 서랍 속에 둔다", desc: "행복↑", run: () => { p.happiness += 4; log("여행 공책을 서랍에 간직함"); } },
        ]),
      );
    const famNear = (spouse() || kids().some((k) => near(k))) && !onShip();
    if (recentCount("family") >= 3 && famNear && !done("family_table"))
      out.push(
        auto("family_table", "식탁 위의 웃음", `바쁜 날에도 가족과의 저녁만은 거르지 않았습니다. 오늘도 식탁에는 ${pf("eat")}${wa(pf("eat"))} 시시콜콜한 이야기가 오갑니다. 아이들은 훗날 이 저녁들을 가장 오래 기억하게 될 것입니다.`, () => {
          npcsBy((n) => FAMILY.includes(n.role) && near(n)).forEach((n) => { n.rel = Math.min(100, n.rel + 6); remember(n, "함께한 저녁 식탁", "family_time", 2); });
          p.happiness += 5;
        }, "가족과의 시간이 쌓임"),
      );
    if (recentCount("work") >= 4 && ["civ", "navy"].includes(w) && (spouse() || kids().some((k) => ea(k) < 18)) && !done("neglect_" + Math.floor(p.age / 10)))
      out.push(
        mk("neglect_" + Math.floor(p.age / 10), "비어 있는 자리", `몇 해째 ${w === "navy" ? "임무" : "일"}에만 매달렸습니다. 오랜만에 일찍 들어온 날, ${spouse() ? `${spouse().name}${ga(spouse().name)}` : "아이가"} 낯선 사람을 보듯 당신을 쳐다봅니다.`, [
          {
            title: "일을 줄이고 가족에게 돌아간다",
            desc: "돈↓ · 가족 관계↑",
            run: () => {
              p.focus = Object.keys(focusOptions()).find((k) => focusCat(k) === "family") || p.focus;
              npcsBy((n) => FAMILY.includes(n.role)).forEach((n) => (n.rel = Math.min(100, n.rel + 5)));
              p.money -= moneyAdult(30000, 80000);
              log("일을 줄이고 가족에게 돌아가기로 함");
              const k = pick(kids().filter((x) => ea(x) < 18));
              followUp(auto("neglect_back", "돌아온 저녁", k ? `다음 날 일찍 들어오자 ${k.name}${ga(k.name)} 문 앞까지 뛰어나왔습니다. 그날 밤 ${k.name}${eun(k.name)} 당신 무릎에서 잠들었습니다.` : "오랜만에 함께 차린 저녁상 앞에서, 한동안 아무도 말이 없다가 동시에 웃음이 터졌습니다.", () => { p.happiness += 5; if (k) remember(k, "부모가 일찍 들어와 무릎에서 잠든 밤", "family_time", 3); }, "가족에게 돌아감"));
            },
          },
          { title: "다 가족을 위해서라며 버틴다", desc: "가족의 서운함이 쌓인다.", run: () => { npcsBy((n) => ["배우자", "자녀"].includes(n.role)).forEach((n) => { n.rel -= 8; remember(n, "늘 일 때문에 집에 없었음", "absent_parent", 2); }); log("가족보다 일을 택함"); } },
        ]),
      );
    if (recentCount("social") >= 3 && a >= 20 && !done("town_helper")) {
      const T = { pirate: ["배 위의 중재자", "선원들 사이에 다툼이 생기면 다들 당신부터 찾습니다. 선장도 당신 말이라면 한 번 더 생각합니다."], navy: ["지부의 해결사", "병사들의 고민과 민원이 어느새 당신 책상으로 모입니다. 지부장도 당신의 의견을 묻습니다."] }[w] || ["마을의 해결사", `이웃의 다툼을 중재하고 결혼식마다 얼굴을 비추다 보니, ${p.place.name}에서 무슨 일만 생기면 다들 당신부터 찾습니다.`];
      if (!["cel", "young"].includes(w)) out.push(auto("town_helper", T[0], T[1], () => { p.relationship += 6; p.reputation += 2; }, `${T[0]}로 신망을 얻음`));
    }
  }

  /* ───────────────────────── 생애 단계별 일상 ───────────────────────── */
  function teenPool(out) {
    const a = p.age,
      s = S(),
      w = who();
    if (a < 13 || a > 19 || !free() || w === "cel") return;
    const par = pick(npcsBy((n) => n.role === "부모" && near(n)));
    if (a >= 15 && !done("teen_exam") && w === "young" && (p.school || p.job === "학생") && !onShip())
      out.push(
        mk(
          "teen_exam",
          "중요한 시험",
          `앞으로의 진로가 걸린 시험 날이 다가왔습니다. ${recentCount("study") >= 3 ? "그동안 붙든 공부가 든든합니다." : "지난 몇 해 공부를 소홀히 한 게 마음에 걸립니다."}`,
          [
            {
              title: "밤을 새워 마지막 정리를 한다",
              desc: "평소의 공부가 결과를 좌우한다.",
              run: () => {
                p.health -= 2;
                if (chance(0.3 + recentCount("study") * 0.1 + p.knowledge / 250)) {
                  p.knowledge += 6;
                  achieve("중요한 시험에 합격함");
                  log("중요한 시험에 합격함");
                  followUp(auto("exam_pass", "합격 소식", par ? `합격자 명단에서 이름을 찾자마자 집으로 달려갔습니다. ${par.title} ${par.name}${eun(par.name)} 말없이 당신을 꼭 안았습니다.` : "합격자 명단에서 자기 이름을 찾은 순간, 다리에 힘이 풀렸습니다.", () => { p.happiness += 5; if (par) { par.rel = Math.min(100, par.rel + 6); remember(par, "시험 합격 소식에 함께 기뻐함", "proud", 2); } }, "합격의 기쁨"));
                } else {
                  p.happiness -= 4;
                  log("시험에서 원하는 결과를 얻지 못함");
                  followUp(
                    mk("exam_fail", "떨어진 뒤", "명단에 이름이 없었습니다. 친구들은 위로했지만 귀에 들어오지 않습니다.", [
                      { title: "한 해 더 준비해 다시 도전한다", desc: "공부 습관이 생긴다.", run: () => { s.habits.study = (s.habits.study || 0) + 1; p.focus = Object.keys(focusOptions()).find((k) => focusCat(k) === "study") || p.focus; p.knowledge += 2; log("시험에 다시 도전하기로 함"); } },
                      { title: "다른 길을 찾아본다", desc: "", run: () => { p.happiness += 2; log("시험 대신 다른 길을 찾기로 함"); } },
                    ]),
                  );
                }
              },
            },
            { title: "컨디션을 지키며 일찍 잔다", desc: "", run: () => { if (chance(0.25 + recentCount("study") * 0.1)) { p.knowledge += 4; log("시험을 무난히 통과함"); } else { p.happiness -= 2; log("시험 결과가 아쉬움"); } } },
          ],
          { min: 13 },
        ),
      );
    // 바다에 나간 십대
    if (w === "pirate" && !done("teen_watch"))
      out.push(
        mk("teen_watch", "첫 불침번", "견습 선원인 당신에게 처음으로 밤 불침번이 맡겨졌습니다. 칠흑 같은 바다 저편에서 불빛 하나가 깜빡입니다.", [
          { title: "선장을 깨운다", desc: "", run: () => { if (chance(0.5)) { gainStanding(1); log("불침번 중 해군 순시선을 먼저 발견함"); followUp(auto("teen_watch_ok", "먼저 본 눈", "불빛은 해군 순시선이었습니다. 배는 어둠 속으로 방향을 틀어 무사히 빠져나갔고, 선장은 아침에 당신 몫의 술잔을 따로 채워 주었습니다.", () => { p.reputation += 2; }, "불침번에서 공을 세움")); } else { p.happiness -= 2; log("불침번 중 괜히 선장을 깨움"); followUp(auto("teen_watch_fool", "고깃배의 불빛", "불빛은 그냥 고깃배였습니다. 잠을 설친 선원들의 놀림이 사흘 동안 이어졌습니다.", () => { p.relationship += 1; }, "불침번에서 놀림감이 됨")); } } },
          { title: "혼자 지켜본다", desc: "", run: () => { p.knowledge += 2; log("불침번을 홀로 섬"); } },
        ], { min: 13 }),
      );
    if (w === "navy" && !done("teen_bootcamp"))
      out.push(
        mk("teen_bootcamp", "훈련소의 새벽", "기상 나팔보다 먼저 눈이 떠집니다. 옆 침대의 동기가 몰래 울고 있는 것 같습니다.", [
          { title: "말없이 사탕 하나를 건넨다", desc: "동기와 가까워진다.", run: () => { const n = peer({ role: "친구", d: 0, rel: ri(55, 70), aff: "해군", job: "해군" }); n.rank = NAVY_RANKS[0]; remember(n, "훈련소에서 울던 밤 사탕을 건네받음", "bootcamp", 3); log("훈련소 동기를 다독임"); followUp(auto("bootcamp_friend", "같은 기수", `그 동기의 이름은 ${n.name}였습니다. 다음 날부터 둘은 구보 때마다 나란히 달렸습니다.`, () => { n.rel = Math.min(100, n.rel + 5); }, `훈련소 동기 ${n.name}${wa(n.name)} 친해짐`, { npc: n })); } },
          { title: "못 들은 척 다시 눈을 감는다", desc: "", run: () => { p.health += 1; log("훈련소의 새벽을 버팀"); } },
        ], { min: 13 }),
      );
    if (a >= 15 && a <= 18 && !done("teen_parttime") && w === "young" && p.status === "민간인" && !onShip() && p.family !== "천룡인 가문") {
      const job = pf("job");
      out.push(
        mk(
          "teen_parttime",
          "첫 일거리",
          `${p.place.name}에서 ${job} 일손을 구한다고 합니다. 처음으로 내 손으로 돈을 벌어 볼 기회입니다.`,
          [
            {
              title: "일해 본다",
              desc: "돈↑ · 함께 일한 또래와 인연",
              run: () => {
                const n = peer({ role: "친구", d: ri(-1, 2), rel: ri(50, 65) });
                remember(n, `${p.place.name}에서 ${job} 일을 함께함`, "work_together", 2);
                log(`${job} 일을 시작함`);
                const pay = ri(80, 240);
                followUp(
                  mk("first_wage", "첫 일당", `해 질 녘, 주인이 동전 몇 닢을 손에 쥐여 주었습니다. ${pay}베리. 함께 일한 ${n.name}${ga(n.name)} "이걸로 뭐 할 거야?" 하고 물었습니다.`, [
                    par && { title: `${par.title}께 드린다`, desc: "부모 관계↑", run: () => { par.rel = Math.min(100, par.rel + 8); remember(par, "자식이 처음 번 돈을 내밀던 날", "gift", 3); log(`첫 일당을 ${par.title}께 드림`); } },
                    { title: `${n.name}${wa(n.name)} ${pf("eat")}${eul(pf("eat"))} 사 먹는다`, desc: "친구 관계↑", run: () => { n.rel = Math.min(100, n.rel + 6); p.happiness += 3; remember(n, "첫 일당으로 함께 사 먹은 맛", "fun", 2); log("첫 일당으로 친구와 맛있는 걸 사 먹음"); } },
                    { title: "모아 둔다", desc: "돈↑", run: () => { p.money += pay; log("첫 일당을 모아 둠"); } },
                  ]),
                );
              },
            },
            { title: "아직은 공부가 먼저다", desc: "지식↑", run: () => { p.knowledge += 2; log("일거리 대신 공부를 택함"); } },
          ],
          { min: 13 },
        ),
      );
    }
    if (par && a >= 14 && a <= 18 && !done("teen_future_talk")) {
      const pj = String(par.job || "");
      const reply =
        par.aff === "해군" ? `"해군은 힘든 일이지만, 지켜야 할 사람이 있다는 건 좋은 거다. 네가 뭘 하든 그것만은 잊지 마라."` :
        par.aff === "해적" ? `"바다는 자유롭지만 사람을 쉽게 삼킨다. 그래도 네가 원한다면… 말리진 않으마."` :
        /노예/.test(pj) ? `"우리처럼 사슬에 묶여 살진 말거라. 네 다리로 가고 싶은 곳에 가."` :
        `"${pj || "이 일"}을 하며 살아 보니 말이다, 결국 남는 건 사람이더라. 뭘 하든 좋은 사람들 곁에 있으렴."`;
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
                log(`${par.title}에게 꿈을 털어놓음`);
                followUp(auto("parent_reply", `${par.title}의 대답`, `한참을 듣던 ${par.title}${ga(par.title)} 입을 열었습니다.\n\n${reply}`, () => { p.happiness += 3; }, `${par.title}의 조언을 들음`, { npc: par }));
              },
            },
            { title: "몰라, 하고 방으로 들어간다", desc: "", run: () => { par.rel -= 3; remember(par, "아이가 대화를 피함", "teen_silence", 1); log("부모와의 대화를 피함"); } },
          ],
          { min: 13 },
        ),
      );
    }
  }
  function youngPool(out) {
    const a = p.age,
      w = who();
    if (a < 18 || a > 34 || !adultLife() || w === "cel") return;
    const par = pick(npcsBy((n) => n.role === "부모"));
    if (par && !done("first_pay") && p.careerStartAge != null && ["civ", "navy", "pirate", "hunter"].includes(w)) {
      const T = { pirate: ["첫 분배금", "약탈품을 나누는 날, 처음으로 당신 몫이 따로 셈해졌습니다. 묵직한 자루를 들고 나니"], hunter: ["첫 현상금", "처음 잡은 현상범의 현상금을 받았습니다. 지폐 다발을 세다 보니"], navy: ["첫 봉급", "처음으로 해군 봉급 봉투를 받았습니다. 계급장만큼이나 묵직한 봉투를 보니"] }[w] || ["첫 월급", "처음으로 내 힘으로 번 돈이 손에 쥐어졌습니다. 묵직한 봉투를 보니"];
      out.push(
        mk("first_pay", T[0], `${T[1]} ${par.title} ${par.name}의 얼굴이 떠오릅니다.${w === "pirate" ? " 해적이 된 자식의 돈을 받아 줄지는 모르겠지만요." : ""}`, [
          {
            title: `${par.title}께 보낸다`,
            desc: "부모와의 관계가 달라진다.",
            run: () => {
              p.money -= moneyAdult(20000, 50000);
              const accept = w !== "pirate" || par.aff === "해적" || chance(0.5);
              log(`${T[0]}의 일부를 ${par.title}께 보냄`);
              if (accept) {
                par.rel = Math.min(100, par.rel + 10);
                remember(par, `자식의 ${T[0]}을 받고 눈시울을 붉힘`, "gift", 3);
                followUp(auto("pay_reply", `${par.title}의 답장`, near(par) ? `${par.title}${eun(par.title)} 봉투를 받아 들고 한참을 만지작거리다 부엌으로 들어갔습니다. 그날 저녁상은 유난히 푸짐했습니다.` : `얼마 뒤 ${homeOf(par)}에서 서툰 글씨의 편지가 왔습니다. "고맙다. 밥은 꼭 챙겨 먹어라."`, () => { p.happiness += 4; }, `${par.title}${ga(par.title)} 고마워함`, { npc: par }));
              } else {
                par.rel -= 3;
                remember(par, "해적질로 번 돈을 돌려보냄", "refused_money", 2);
                followUp(auto("pay_back", "돌아온 봉투", `${par.title}${eun(par.title)} 봉투를 뜯지도 않고 돌려보냈습니다. 짧은 쪽지 한 장이 들어 있었습니다. "이런 돈은 필요 없다. 몸이나 성히 돌아와라."`, () => { p.happiness -= 4; }, "부모가 돈을 돌려보냄", { npc: par }));
              }
            },
          },
          { title: "미래를 위해 모아 둔다", desc: "돈↑", run: () => { p.money += moneyAdult(20000, 40000); log(`${T[0]}${eul(T[0])} 모아 둠`); } },
          { title: "나를 위해 마음껏 쓴다", desc: "행복↑", run: () => { p.money -= moneyAdult(10000, 30000); p.happiness += 5; log(`${T[0]}으로 나에게 선물함`); } },
        ]),
      );
    }
    if (!done("independence") && a >= 19 && a <= 28 && w === "civ" && npcsBy((n) => n.role === "부모" && near(n)).length && !onShip())
      out.push(
        mk("independence", "나만의 방", `${p.place.name}에 작은 방 하나가 났다고 합니다. 부모님 집을 떠나 처음으로 나만의 방을 얻을지 고민합니다.`, [
          {
            title: "독립한다",
            desc: "행복↑ · 돈↓",
            run: () => {
              S().indep = realAge();
              p.money -= moneyAdult(30000, 80000);
              npcsBy((n) => n.role === "부모").forEach((n) => remember(n, "자식이 독립해 집을 나감", "child_left", 2));
              chron("부모님 집을 떠나 독립함", "일상", 2);
              log("부모님 집을 떠나 독립함");
              followUp(auto("indep_night", "첫날 밤", `짐을 다 풀고 나니 방이 조용했습니다. 창밖으로 ${pf("walk")}의 불빛이 보입니다. 해방감과 외로움이 반씩 섞인 밤이었습니다.${par ? ` 다음 날 아침, 문 앞에 ${par.title}${ga(par.title)} 두고 간 반찬 꾸러미가 놓여 있었습니다.` : ""}`, () => { p.happiness += 4; }, "독립 첫날 밤"));
            },
          },
          { title: "조금 더 함께 산다", desc: "돈↑ · 가족 관계↑", run: () => { p.money += moneyAdult(20000, 50000); npcsBy((n) => n.role === "부모").forEach((n) => (n.rel = Math.min(100, n.rel + 3))); log("부모님과 함께 살기로 함"); } },
        ]),
      );
    const co = pick(npcsBy((n) => ["친구", "동료"].includes(n.role) && near(n) && ea(n) >= 18 && n.rel >= 45 && n.rel < 80));
    if (co && !done("friend_day_" + co.id)) {
      const ACT = {
        port: ["바다낚시 가자", "방파제에서 노을 보자"], city: ["새로 생긴 술집 가 보자", "운하에서 배 타자"], inland: ["언덕에 도시락 들고 가자", "장터 구경 가자"],
        desert: ["오아시스에서 수영하자", "모래 썰매 타자"], snow: ["썰매 타러 가자", "온천에 몸 녹이러 가자"], sky: ["구름 서핑 하자", "구름 과일 따러 가자"],
        wano: ["벚꽃 구경 가자", "찻집에서 경단 먹자"], fishman: ["산호초 헤엄치러 가자", "해저 시장 구경 가자"], giant: ["거목 꼭대기 올라가자", "통구이 먹으러 가자"], base: ["성벽 위에서 군함 구경하자", "기지 식당 몰래 가자"],
      }[placeKind()] || ["바람 쐬러 가자", "시장 구경 가자"];
      const act = rand(ACT);
      const crew = onShip() && co.role === "동료";
      out.push(
        mk(
          "friend_day_" + co.id,
          `${co.name}${wa(co.name)}의 하루`,
          crew ? `${p.place.name}에 정박한 날, ${co.name}${ga(co.name)} 갑판에서 손짓했습니다. "${act}." 모처럼 아무 일도 없는 하루입니다.` : `쉬는 날, ${co.name}${ga(co.name)} 불쑥 찾아왔습니다. "${act}." 별일 없는 하루지만, 이런 날이 오래 기억에 남곤 합니다.`,
          [
            { title: "함께 하루를 보낸다", desc: "관계↑ · 행복↑", run: () => { co.rel = Math.min(100, co.rel + 8); co.lastSeen = p.age; p.happiness += 4; remember(co, `"${act}" 하던 날`, "fun", 2); log(`${co.name}${wa(co.name)} 즐거운 하루를 보냄`); } },
            { title: "피곤하다며 다음으로 미룬다", desc: "", run: () => { co.rel -= 2; p.health += 1; log(`${co.name}의 약속을 미룸`); } },
          ],
          { cd: 6, npc: co, roles: ["친구", "동료"] },
        ),
      );
    }
    if (w === "civ" && JOB_ORDER[p.job] !== undefined && !done("big_order_" + p.job))
      out.push(bigOrderScene());
  }
  function bigOrderScene() {
    const job = p.job;
    const text = JOB_ORDER[job] || `${job} 일로 큰 의뢰가 들어왔습니다`;
    return mk("big_order_" + job, "큰 의뢰", `${text}. 해내면 ${p.place.name}에서 이름이 알려지겠지만, 기한이 빠듯합니다.`, [
      {
        title: "맡는다",
        desc: "어떻게 해낼지는 다음 선택에 달렸다.",
        run: () => {
          log(`${job} 일로 큰 의뢰를 맡음`);
          followUp(
            mk("big_order_work_" + job, "밤샘 작업", "기한이 사흘 남았습니다. 이대로라면 아슬아슬합니다.", [
              { title: "잠을 줄여 가며 꼼꼼하게 해낸다", desc: "건강↓ · 평판↑↑", run: () => { p.health -= ri(4, 8); p.money += moneyAdult(150000, 400000); p.reputation += 4; gainStanding(2); achieve(`${job}로서 큰 의뢰를 해냄`); log("밤을 새워 의뢰를 완벽히 해냄"); } },
              { title: "적당히 손을 봐서 기한만 맞춘다", desc: "돈↑ · 뒷말이 날 수 있다.", run: () => { p.money += moneyAdult(150000, 400000); if (chance(0.45)) { p.reputation -= 3; log("서둘러 끝낸 일에 뒷말이 남"); followUp(auto("big_order_complaint", "되돌아온 불만", "며칠 뒤 의뢰인이 찾아와 마무리가 엉성하다고 언성을 높였습니다. 가게 앞을 지나던 사람들이 수군거렸습니다.", () => { p.happiness -= 3; }, "서두른 일에 불만이 들어옴")); } else log("기한 안에 의뢰를 끝냄"); } },
              { title: "동료들에게 도움을 청한다", desc: "돈은 나누지만 관계↑", run: () => { p.money += moneyAdult(80000, 200000); p.relationship += 4; npcsBy((n) => n.role === "친구" && near(n)).slice(0, 2).forEach((n) => { n.rel = Math.min(100, n.rel + 4); remember(n, "큰 의뢰를 함께 해냄", "work_together", 2); }); log("동료들과 함께 의뢰를 해냄"); } },
            ]),
          );
        },
      },
      { title: "무리하지 않고 거절한다", desc: "", run: () => { p.health += 1; log("큰 의뢰를 거절함"); } },
    ]);
  }
  function midPool(out) {
    const a = p.age,
      w = who();
    if (a < 35 || a > 62 || !free() || w === "cel") return;
    const old = (p.npcs || []).filter((n) => n.metAge != null && n.metAge < 18 && !FAMILY.includes(n.role) && n.role !== "연인");
    const decade = Math.floor(a / 10);
    const wanted = (w === "pirate" || w === "revo") && p.bountyIssued;
    if (old.length >= 2 && !done("reunion_" + decade) && a >= 38 && Object.keys(S().done).filter((k) => /^saga_reunion_/.test(k)).length < 3 && chance(0.6)) {
      const lines = old.slice(0, 5).map((n) => (alive(n) ? `· ${n.name} — ${npcDesc(n)}${n.spouse ? `, ${n.spouse}${wa(n.spouse)} 결혼` : ""}${n.kidsN ? `, 아이 ${n.kidsN}명` : ""}${homeOf(n) !== p.place.name ? ` (${homeOf(n)}에 삶)` : ""}` : `· ${n.name} — 이미 세상을 떠남 (${n.deathCause || "사인 미상"})`));
      const home = (p.birthPlace || p.place).name;
      if (wanted || onShip())
        out.push(auto("reunion_" + decade, "고향에서 온 편지", `${home}의 옛 친구가 보낸 편지가 몇 항구를 거쳐 도착했습니다. ${wanted ? "수배서에 실린 당신 얼굴을 보고 깜짝 놀랐다며, " : ""}어린 시절 친구들의 소식을 적어 보냈습니다.\n\n${lines.join("\n")}`, () => { p.happiness += 2; old.filter(alive).forEach((n) => remember(n, "편지로 소식을 전함", "letter", 1)); }, "고향 친구들의 소식을 들음"));
      else
        out.push(
          mk("reunion_" + decade, "어린 시절 친구들의 모임", `어린 시절 함께 뛰놀던 이들이 오랜만에 모였습니다. 다들 세월을 정통으로 맞은 얼굴입니다.\n\n${lines.join("\n")}`, [
            {
              title: "밤새 옛이야기를 나눈다",
              desc: "옛 인연과의 관계↑",
              run: () => {
                old.filter(alive).forEach((n) => { n.rel = Math.min(100, n.rel + 5); n.lastSeen = p.age; remember(n, `${realAge()}세 무렵 동창 모임에서 다시 만남`, "class_reunion", 1); });
                p.happiness += 6;
                log("어린 시절 친구들과 밤새 이야기함");
                const one = closeNpcs((n) => old.includes(n) && n.mem && n.mem.length > 1)[0];
                const m = one && one.mem.find((x) => x.a < 18);
                if (one && m) followUp(auto("reunion_talk_" + one.id, `${one.name}${wa(one.name)} 둘이서`, `모임이 파할 무렵, ${one.name}${ga(one.name)} 슬쩍 옆에 앉았습니다. "기억나? ${m.a}세 때 '${m.t}'." 둘은 그 시절로 돌아간 것처럼 웃었습니다.`, () => { one.rel = Math.min(100, one.rel + 6); p.happiness += 3; }, `${one.name}${wa(one.name)} 옛 추억을 나눔`, { npc: one }));
              },
            },
            { title: "잠깐 얼굴만 비친다", desc: "", run: () => { p.happiness += 2; log("동창 모임에 잠깐 들름"); } },
          ]),
        );
    }
    if (a >= 40 && a <= 55 && !done("health_warning")) {
      const doc = w === "pirate" ? "배의 선의" : w === "navy" ? "기지의 군의관" : `${p.place.name}의 의원`;
      out.push(
        mk("health_warning", "의사의 경고", `${doc}${ga(doc)} 진찰을 하다 얼굴을 찌푸렸습니다. "이대로 가면 몇 년 안에 큰일 납니다. 생활을 바꾸셔야 해요."`, [
          {
            title: "생활 습관을 바꾼다",
            desc: "건강 관리 습관이 생긴다.",
            run: () => {
              S().habits.health = (S().habits.health || 0) + 3;
              p.health += 5;
              p.focus = Object.keys(focusOptions()).find((k) => focusCat(k) === "health") || p.focus;
              log("의사의 경고를 듣고 생활을 바꿈");
              followUp(auto("health_week", "바꾼 생활의 첫 주", `술을 끊고 아침마다 ${onShip() ? "갑판을" : pf("walk") + eul(pf("walk"))} 걸었습니다. 사흘째엔 포기하고 싶었지만, 이레째 되던 날 아침 몸이 확실히 가벼웠습니다.`, () => { p.health += 2; }, "생활을 바꾼 첫 주"));
            },
          },
          { title: "괜찮겠지, 하고 넘긴다", desc: "훗날 만성 질환이 생길 수 있다.", run: () => { S().warnIgnored = true; log("의사의 경고를 흘려들음"); } },
        ]),
      );
    }
    const par = closeNpcs((n) => n.role === "부모" && ea(n) >= 68)[0];
    if (par && !done("parent_care_" + par.id)) {
      const far = !near(par);
      out.push(
        mk(
          "parent_care_" + par.id,
          `늙으신 ${par.title}`,
          `${far ? `${homeOf(par)}에서 편지가 왔습니다.` : ""} ${par.title} ${par.name}${ga(par.name)} 부쩍 기력이 떨어졌다고 합니다. 혼자 지내시기엔 힘들어 보입니다.`,
          [
            {
              title: far ? `${homeOf(par)}${ro(homeOf(par))} 돌아가 곁을 지킨다` : "곁에서 직접 모신다",
              desc: "돈·행복 조금↓ · 부모의 여생이 길어진다.",
              run: () => {
                par.caredUntil = p.age + 10;
                par.rel = Math.min(100, par.rel + 12);
                remember(par, "늙은 몸을 자식이 곁에서 돌봐 줌", "cared", 3);
                p.money -= moneyAdult(50000, 150000);
                p.happiness -= 2;
                chron(`${par.title} ${par.name}${eul(par.name)} 곁에서 모시기 시작함`, "가족", 2);
                log(`${par.title}${eul(par.title)} 곁에서 모시기로 함`);
                followUp(auto("care_night_" + par.id, "간병의 밤", `밤마다 ${par.title}의 기침 소리에 잠이 깼습니다. 어느 밤 ${par.title}${ga(par.title)} 당신 손을 잡고 말했습니다. "네가 어릴 때 열이 나면, 나도 이렇게 밤을 새웠단다."`, () => { p.happiness += 3; par.rel = Math.min(100, par.rel + 5); }, `${par.title}${eul(par.title)} 간병함`, { npc: par }));
              },
            },
            { title: "돈을 보내 돌봐 줄 사람을 구한다", desc: "돈↓", run: () => { par.caredUntil = p.age + 5; p.money -= moneyAdult(120000, 300000); remember(par, "자식이 돌봐 줄 사람을 보내 줌", "cared", 1); log(`${par.title}${eul(par.title)} 돌봐 줄 사람을 구함`); } },
            { title: "지금은 여유가 없다", desc: "훗날 후회할지도 모른다.", run: () => { par.rel -= 10; remember(par, "돌봄이 필요할 때 자식이 오지 않음", "neglect", 2); log(`${par.title}의 돌봄을 미룸`); } },
          ],
          { npc: par },
        ),
      );
    }
    if (a >= 40 && a <= 52 && !done("midlife") && w === "civ")
      out.push(
        mk("midlife", "마흔의 밤", `${p.job} 일을 한 지 오래입니다. 잠이 오지 않는 밤, 문득 묻게 됩니다. 지금 이 삶이 정말 내가 원하던 것이었나.${S().hobby ? ` 오래 아껴 온 ${S().hobby}${ga(S().hobby)} 떠오릅니다.` : ""}`, [
          {
            title: "늦기 전에 새로운 일에 도전한다",
            desc: "직업이 바뀐다.",
            run: () => {
              const H = S().hobby && HOBBIES[S().hobby];
              const job = (H && H.job && H.job !== p.job && H.job) || rand(["상인", "요리사", "선원", "모험가"].filter((x) => x !== p.job));
              const prev = p.job;
              setCareer(job, "민간인");
              p.happiness += 6;
              chron(`마흔의 결심 — ${job}${ro(job)} 새 출발`, "직업", 2);
              log(`마흔에 ${job}${ro(job)} 새 출발함`);
              followUp(auto("midlife_day1", "새 일의 첫날", `${prev} 일을 할 때는 몰랐던 근육이 쑤셨습니다. 한참 어린 선배가 이것저것 가르쳐 주는 게 민망했지만, 집에 돌아오는 발걸음은 이상하게 가벼웠습니다.`, () => { p.happiness += 2; }, `${job}로 첫날을 보냄`));
            },
          },
          { title: "지금 가진 것을 소중히 여긴다", desc: "행복↑", run: () => { p.happiness += 5; log("지금의 삶을 받아들임"); } },
        ]),
      );
  }
  // 신분과 직업에 따라 달라지는 삶의 장면 (선택하면 그 결과가 바로 다음 장면으로 이어진다)
  function lifeArcs(out) {
    const a = p.age,
      w = who(),
      pk = placeKind();
    if (a < 16 || !free()) return;
    if (w === "pirate") {
      if (pk !== "inland" && pk !== "sky" && every("pa_rumor", ri(6, 9)))
        out.push(
          mk("pa_rumor", "항구 술집의 소문", `${p.place.name}의 항구 술집에서 술에 취한 늙은 선원이 떠들고 있습니다. "남쪽 암초 너머에 침몰한 상선이 있지. 금화를 실은 채로 말이야."`, [
            {
              title: "술을 한 잔 사며 자세히 묻는다",
              desc: "소문의 진위는 가 봐야 안다.",
              run: () => {
                log("항구 술집에서 침몰선 소문을 들음");
                followUp(
                  mk("pa_wreck", "암초 너머의 침몰선", "늙은 선원이 그려 준 지도를 따라가자, 정말로 암초 사이에 반쯤 잠긴 배가 보였습니다. 하지만 근처에 다른 해적선의 깃발도 보입니다.", [
                    { title: "먼저 뛰어들어 금화를 건진다", desc: "위험하지만 큰돈.", req: { health: 30 }, run: () => { if (chance(0.55 + p.combat / 300)) { p.money += moneyAdult(300000, 900000); gainStanding(1); log("침몰선에서 금화를 건짐"); } else { p.health -= ri(8, 16); log("침몰선을 노리던 해적들과 부딪쳐 다침"); } } },
                    { title: "상대 해적선과 나누자고 제안한다", desc: "", run: () => { p.money += moneyAdult(120000, 300000); p.relationship += 2; log("침몰선의 금화를 다른 해적단과 나눔"); } },
                    { title: "함정 같다며 뱃머리를 돌린다", desc: "", run: () => { p.knowledge += 2; log("수상한 침몰선을 두고 돌아섬"); } },
                  ]),
                );
              },
            },
            { title: "술주정이라며 흘려듣는다", desc: "", run: () => { p.happiness += 1; log("술집의 소문을 흘려들음"); } },
          ]),
        );
      if (every("pa_crewfight", ri(7, 10)) && (p.crew || (p.flags && p.flags.ownCrew)))
        out.push(
          mk("pa_crewfight", "선원들의 주먹다짐", "약탈품 분배를 두고 선원 둘이 갑판에서 주먹다짐을 벌였습니다. 다들 당신이 어떻게 하는지 지켜보고 있습니다.", [
            { title: "둘을 떼어 놓고 공평하게 다시 나눈다", desc: "", run: () => { log("선원들의 다툼을 중재함"); followUp(auto("pa_crew_drink", "화해의 술자리", "그날 밤 다툰 두 선원이 어깨동무를 하고 노래를 불렀습니다. 갑판 위의 분위기가 한결 부드러워졌습니다.", () => { p.relationship += 4; p.happiness += 2; npcsBy((n) => n.role === "동료").forEach((n) => (n.rel = Math.min(100, n.rel + 3))); }, "선원들이 화해함")); } },
            { title: "규율을 어겼다며 둘 다 엄벌한다", desc: "", run: () => { gainStanding(1); log("다툰 선원들을 엄벌함"); followUp(auto("pa_crew_grudge", "불만의 눈빛", "갑판은 조용해졌지만, 몇몇 선원의 눈빛이 예전 같지 않습니다. 식사 시간마다 수군거리는 소리가 들립니다.", () => { p.relationship -= 3; npcsBy((n) => n.role === "동료").forEach((n) => (n.rel -= 3)); }, "선원들 사이에 불만이 남음")); } },
          ]),
        );
      if (!done("pa_child"))
        out.push(
          mk("pa_child", "불타는 마을의 아이", `해적들이 휩쓸고 간 ${p.place.name} 외곽에서, 잿더미 속에 아이 하나가 혼자 앉아 있습니다. 당신을 올려다보는 눈에 겁과 원망이 섞여 있습니다.`, [
            {
              title: "배에 태워 데려간다",
              desc: "새로운 인연이 생긴다.",
              run: () => {
                const n = makeNpc({ role: "동료", title: "견습 선원", age: ri(8, 11), rel: ri(55, 70), aff: "해적", job: "견습 선원" });
                remember(n, "잿더미 속에서 손을 내밀어 배에 태워 줌", "saved", 3);
                log("잿더미 속의 아이를 배에 태움");
                followUp(auto("pa_child_ship", "배 위의 꼬마", `${n.name}${eun(n.name)} 처음 며칠 동안 선실 구석에서 나오지 않았습니다. 일주일째 되던 날, 당신이 갑판에 내놓은 ${pf("eat")}${eul(pf("eat"))} 몰래 가져가더니, 다음 날부터 당신 뒤를 졸졸 따라다녔습니다.`, () => { n.rel = Math.min(100, n.rel + 8); p.happiness += 3; }, `아이 ${n.name}${ga(n.name)} 배에 마음을 엶`, { npc: n }));
              },
            },
            { title: "식량과 돈을 남겨 두고 떠난다", desc: "", run: () => { p.money -= moneyAdult(20000, 60000); log("잿더미 속 아이에게 식량을 남김"); followUp(auto("pa_child_thanks", "등 뒤의 목소리", "배에 오르려는데 등 뒤에서 작은 목소리가 들렸습니다. \"…고마워요.\" 돌아봤을 때 아이는 이미 골목으로 사라지고 없었습니다.", () => { p.happiness += 3; }, "아이에게 식량을 남기고 떠남")); } },
            { title: "못 본 척 지나친다", desc: "", run: () => { p.happiness -= 3; log("잿더미 속 아이를 지나침"); } },
          ]),
        );
    }
    if (w === "navy") {
      if (!done("nv_order"))
        out.push(
          mk("nv_order", "부당한 명령", `상관이 ${p.place.name}의 빈민가를 '해적 은신처'로 지목하고 모두 쫓아내라고 명령했습니다. 하지만 당신이 본 그곳에는 노인과 아이들뿐이었습니다.`, [
            { title: "명령대로 따른다", desc: "출세에는 도움이 된다.", run: () => { gainStanding(2); log("부당한 철거 명령을 따름"); followUp(auto("nv_order_night", "잠 못 드는 밤", "쫓겨난 사람들의 울음소리가 귓가에서 떠나지 않습니다. 그날 밤 받은 칭찬은 하나도 기쁘지 않았습니다.", () => { p.happiness -= 6; if (p.flags) p.flags.doubtJustice = true; }, "명령을 따른 뒤 정의를 의심하게 됨")); } },
            {
              title: "명령을 거부한다",
              desc: "",
              run: () => {
                log("부당한 명령을 거부함");
                followUp(
                  mk("nv_hearing", "징계 위원회", "명령 불복종으로 징계 위원회에 불려 갔습니다. 위원장이 마지막으로 묻습니다. \"지금이라도 잘못을 인정하겠나?\"", [
                    { title: "고개를 숙인다", desc: "", run: () => { p.happiness -= 3; log("징계 위원회에서 고개를 숙임"); } },
                    { title: "끝까지 정의를 말한다", desc: "", run: () => { p.reputation += 4; p.happiness += 2; if (p.flags) p.flags.doubtJustice = true; if (chance(0.4)) { gainStanding(2); log("징계 위원회에서 끝까지 맞섰고, 한 중장이 당신 편을 들어 줌"); } else { p.money -= moneyAdult(50000, 120000); log("징계 위원회에서 맞서다 감봉 처분을 받음"); } } },
                  ]),
                );
              },
            },
            { title: "따르는 척하며 몰래 대피를 돕는다", desc: "", run: () => { log("철거 전날 밤 주민들의 대피를 도움"); followUp(auto("nv_order_saved", "숨겨 준 사람들", "철거 전날 밤, 당신은 주민들을 이웃 마을 창고로 옮겼습니다. 다음 날 빈 마을을 본 상관은 고개를 갸웃했고, 몇 해 뒤 그 창고의 아이 하나가 해군 학교에 입학했다는 소식을 들었습니다.", () => { p.happiness += 5; p.reputation += 2; }, "몰래 주민들을 대피시킴")); } },
          ]),
        );
      if (every("nv_prisoner", ri(7, 10)))
        out.push(
          mk("nv_prisoner", "체포한 해적의 사연", "호송 중인 젊은 해적이 철창 너머로 말을 걸어왔습니다. \"고향에 아픈 동생이 있어. 약값 때문에 배를 탔을 뿐이야.\"", [
            { title: "원칙대로 호송한다", desc: "", run: () => { gainStanding(1); log("해적을 원칙대로 호송함"); } },
            {
              title: "몰래 문을 열어 준다",
              desc: "들키면 큰일이다. 언젠가 돌아올지도.",
              run: () => {
                const n = makeNpc({ role: "친구", age: realAge() + ri(-6, 2), rel: ri(60, 75), aff: "해적", job: `해적 (${rand(NPC_CREWS)})` });
                remember(n, "호송선 철창을 몰래 열어 줌", "spared", 3);
                schedule("spared_return", ri(3, 8), { id: n.id });
                log("체포한 해적을 몰래 풀어 줌");
                followUp(chance(0.3) ? auto("nv_caught", "들킨 밤", "철창이 빈 것을 발견한 동료가 당신을 의심스럽게 쳐다봤습니다. 보고서에는 '관리 소홀'이라는 말이 남았습니다.", () => { p.money -= moneyAdult(30000, 80000); p.happiness -= 2; }, "호송 중 해적을 놓친 책임을 짐") : auto("nv_escape", "어둠 속의 작은 배", `${n.name}${ga(n.name)} 탄 작은 배가 어둠 속으로 사라졌습니다. 멀어지며 고개를 한 번 숙이는 것이 보였습니다.`, () => { p.happiness += 2; }, "풀어 준 해적이 어둠 속으로 사라짐"));
              },
            },
          ]),
        );
    }
    if (w === "revo" && every("rv_village", ri(7, 10)))
      out.push(
        mk("rv_village", "잠입한 마을", `${p.place.name}에 상인으로 위장해 잠입했습니다. 여관 주인이 당신을 유심히 보더니 묻습니다. "혹시… 그쪽 사람이오?"`, [
          { title: "끝까지 시치미를 뗀다", desc: "", run: () => { log("잠입 중 정체를 숨김"); followUp(chance(0.7) ? auto("rv_safe", "들키지 않은 밤", "여관 주인은 더 묻지 않았습니다. 다음 날 아침, 식탁 위에 지도 한 장이 슬쩍 놓여 있었습니다. 해군 초소의 위치가 표시되어 있었습니다.", () => { p.knowledge += 3; gainStanding(1); }, "여관 주인에게서 초소 지도를 얻음") : auto("rv_tip", "새벽의 발소리", "새벽에 해군의 발소리가 여관을 둘러쌌습니다. 창문으로 겨우 빠져나왔지만 짐은 모두 두고 와야 했습니다.", () => { p.money -= moneyAdult(30000, 90000); p.health -= ri(3, 7); }, "잠입이 들켜 겨우 빠져나옴")); } },
          { title: "고개를 끄덕이고 마을의 사정을 묻는다", desc: "", run: () => { log("여관 주인에게 정체를 밝힘"); followUp(auto("rv_story", "여관 주인의 이야기", "여관 주인은 문을 걸어 잠그고 이야기를 시작했습니다. 영주의 세금, 끌려간 아들, 아무도 오지 않던 해군. 이야기가 끝났을 때 그는 말했습니다. \"우리 마을에도 불을 붙여 주시오.\"", () => { gainStanding(2); p.relationship += 3; }, "마을 사람의 지지를 얻음")); } },
        ]),
      );
    if (w === "hunter" && every("ht_family", ri(7, 10)))
      out.push(
        mk("ht_family", "현상범의 집", `몇 주를 쫓은 현상범의 은신처를 찾아냈습니다. 문을 열자 현상범 대신 겁에 질린 아내와 어린 딸이 서 있습니다. 현상범은 뒷문으로 도망치는 중입니다.`, [
          { title: "뒷문으로 쫓아간다", desc: "", run: () => { if (chance(0.6 + p.combat / 300)) { p.money += moneyAdult(200000, 600000); log("현상범을 붙잡음"); followUp(auto("ht_cry", "등 뒤의 울음소리", "현상범을 묶어 끌고 나오는데, 등 뒤에서 아이의 울음소리가 오래도록 따라왔습니다.", () => { p.happiness -= 4; }, "현상범을 잡았지만 마음이 무거움")); } else { p.health -= ri(5, 10); log("현상범을 놓침"); } } },
          { title: "가족 앞에서는 쫓지 않는다", desc: "", run: () => { log("가족 앞에서 현상범을 쫓지 않음"); followUp(auto("ht_empty", "빈손의 귀환", "의뢰인은 혀를 찼지만, 돌아오는 길은 이상하게 홀가분했습니다. 몇 달 뒤, 그 현상범이 자수했다는 소식을 들었습니다.", () => { p.happiness += 3; p.money -= moneyAdult(20000, 60000); }, "빈손으로 돌아옴")); } },
        ]),
      );
    if ((w === "civ" || w === "retired") && every("cv_neighbor", ri(10, 14))) {
      const errand = pf("errand");
      const nb = pick(npcsBy((n) => near(n) && !FAMILY.includes(n.role) && ea(n) >= 50));
      out.push(
        mk("cv_neighbor", "이웃의 부탁", nb ? `이웃에 사는 ${nb.name}${ga(nb.name)} 허리를 짚으며 부탁했습니다. "${errand}${eul(errand)} 혼자 하기엔 이제 힘이 부치네. 좀 도와줄 수 있겠나?"` : `옆집 노인이 허리를 짚으며 부탁했습니다. "${errand}${eul(errand)} 혼자 하기엔 이제 힘이 부치네. 좀 도와줄 수 있겠나?"`, [
          {
            title: "소매를 걷어붙인다",
            desc: "",
            run: () => {
              p.health -= 1;
              log(`이웃의 ${errand}${eul(errand)} 도움`);
              let n = nb;
              if (!n) {
                n = makeNpc({ role: "은인", age: realAge() + realOf(ri(20, 35)), rel: ri(55, 70), job: "은퇴한 " + rand(["어부", "목수", "상인", "농부"]) });
                n.scale = lifeScale();
              }
              n.rel = Math.min(100, n.rel + 8);
              remember(n, `${errand}${eul(errand)} 도와줌`, "helped_neighbor", 2);
              followUp(auto("cv_dinner_" + n.id, "이웃의 저녁 초대", `일을 마치자 ${n.name}${ga(n.name)} 저녁을 차려 주었습니다. ${pf("eat")}${eul(pf("eat"))} 앞에 두고, ${n.name}${eun(n.name)} 젊은 시절 ${p.place.name}이 어땠는지 한참을 이야기했습니다.`, () => { p.relationship += 3; p.happiness += 3; p.knowledge += 1; }, `이웃 ${n.name}${wa(n.name)} 저녁을 먹음`, { npc: n }));
            },
          },
          { title: "바쁘다며 다음에 돕겠다고 한다", desc: "", run: () => { if (nb) nb.rel -= 3; log("이웃의 부탁을 미룸"); } },
        ]),
      );
    }
    if (w === "civ" && !done("big_order_" + p.job) && JOB_ORDER[p.job] && a >= 35) out.push(bigOrderScene());
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
                const left = npcsBy((n) => homeOf(n) === home && !FAMILY.includes(n.role));
                const gone = (p.npcs || []).filter((n) => !alive(n) && n.metAge != null && n.metAge < 18).slice(0, 2);
                followUp(
                  auto(
                    "hometown_walk",
                    `${home}의 골목`,
                    `어릴 적 뛰놀던 골목은 생각보다 좁았습니다.${left.length ? ` ${left[0].name}${ga(left[0].name)} 먼저 알아보고 달려와 손을 잡았습니다.` : " 아는 얼굴은 거의 남아 있지 않았습니다."}${gone.length ? ` ${gone.map((n) => n.name).join(", ")}의 무덤에도 들러 꽃을 놓았습니다.` : ""}`,
                    () => { p.happiness += 3; },
                    "고향의 골목을 걸음",
                  ),
                );
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
    if (every("garden", ri(6, 9)) && chance(0.35))
      out.push(
        mk(
          "garden",
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
                followUp(
                  mk("disc_lesson1_" + n.id, "첫 수업", `다음 날 새벽, ${n.name}${ga(n.name)} 해가 뜨기도 전에 문 앞에 와 있었습니다. 무엇부터 가르칠지 정해야 합니다.`, [
                    { title: "기초부터 혹독하게", desc: "제자 실력↑↑ · 관계 조금↓", run: () => { n.power = Math.min(100, n.power + 6); n.rel -= 2; remember(n, "첫날부터 기초를 혹독하게 배움", "strict", 2); log(`제자 ${n.name}에게 기초부터 가르침`); } },
                    { title: "왜 배우고 싶은지부터 묻는다", desc: "제자 관계↑↑", run: () => { n.rel = Math.min(100, n.rel + 8); remember(n, "첫날 스승이 배우려는 이유를 물어 줌", "why", 3); log(`제자 ${n.name}의 이야기를 들음`); } },
                  ], { npc: n, roles: ["제자"] }),
                );
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

  /* ───────────────────────── 선택의 여파: 기존 사건의 선택 결과가 바로 다음 장면으로 이어진다 ───────────────────────── */
  function caretaker() {
    const sp = spouse() || lover();
    if (sp) return { n: sp, who: `${sp.title || "연인"} ${sp.name}` };
    if (onShip()) {
      const crew = closeNpcs((n) => n.role === "동료")[0];
      return crew ? { n: crew, who: `동료 ${crew.name}` } : { n: null, who: "배의 선원들" };
    }
    const par = closeNpcs((n) => n.role === "부모" && near(n))[0];
    if (par && p.age < 35) return { n: par, who: `${par.title} ${par.name}` };
    const fr = closeNpcs((n) => ["친구", "은인"].includes(n.role) && near(n) && n.rel >= 55)[0];
    if (fr) return { n: fr, who: `친구 ${fr.name}` };
    return { n: null, who: null };
  }
  function aftermathFor(x, c, b, a) {
    const w = who(),
      sal = p.age >= 16 ? Math.max(1, annualSalary()) : 1;
    const tag = String(sceneKey(x)).slice(0, 40);
    // 1) 크게 다쳤을 때 — 누가 곁을 지키는가
    if (b.h - a.h >= 10 && p.health > 0) {
      const ct = caretaker();
      return mk(
        "af_hurt_" + tag,
        "상처를 돌보는 날들",
        ct.who
          ? `「${c.title}」 그 일로 몸 곳곳에 붕대를 감게 되었습니다. ${ct.who}${ga(ct.who)} 며칠 밤을 곁에서 지키며 약을 갈아 주었습니다.`
          : `「${c.title}」 그 일로 몸 곳곳에 붕대를 감게 되었습니다. ${onShip() ? "흔들리는 선실" : "빈방"}에서 혼자 열에 시달리는 밤이 길었습니다.`,
        [
          { title: "다 나을 때까지 푹 쉰다", desc: "건강↑ · 그동안 일을 쉰다.", run: () => { p.health += ri(6, 10); if (p.age >= 16 && !isMinorJob()) p.money -= Math.round(sal * 0.05); if (ct.n) { ct.n.rel = Math.min(100, ct.n.rel + 6); remember(ct.n, "다쳤을 때 곁에서 밤새 간호함", "nursed", 3); } log("다친 몸을 푹 쉬며 회복함"); } },
          { title: "붕대를 감은 채 다시 나선다", desc: "회복이 더디다.", run: () => { p.health += 2; if (p.flags) p.flags.injuredUntil = Math.max(p.flags.injuredUntil || 0, p.age + 1); if (["pirate", "navy", "hunter", "revo"].includes(w)) gainStanding(1); if (ct.n) { ct.n.rel -= 3; remember(ct.n, "말려도 다친 몸으로 다시 나감", "worry", 1); } log("다친 몸으로 다시 일에 나섬"); } },
        ],
      );
    }
    // 2) 뜻밖의 큰돈
    if (a.m - b.m >= Math.max(200000, sal * 0.3) && p.age >= 16) {
      const got = Math.floor(a.m - b.m);
      if (w === "pirate")
        return mk("af_loot_" + tag, "전리품 분배", `「${c.title}」 덕분에 ${money(got)}가 들어왔습니다. 선원들의 눈이 모두 당신 손에 쏠려 있습니다.`, [
          { title: "똑같이 나눈다", desc: "선원들의 신뢰↑ · 내 몫↓", run: () => { p.money -= Math.floor(got * 0.4); p.relationship += 4; npcsBy((n) => n.role === "동료").forEach((n) => (n.rel = Math.min(100, n.rel + 5))); log("전리품을 선원들과 똑같이 나눔"); } },
          { title: "내 몫을 크게 챙긴다", desc: "선원들의 불만이 쌓인다.", run: () => { p.relationship -= 4; npcsBy((n) => n.role === "동료").forEach((n) => { n.rel -= 5; remember(n, "전리품을 독차지함", "greedy", 2); }); log("전리품을 크게 챙김"); } },
        ]);
      const par = closeNpcs((n) => n.role === "부모")[0];
      const sp = spouse();
      return mk("af_money_" + tag, "뜻밖의 큰돈", `「${c.title}」 덕분에 ${money(got)}가 생겼습니다. 이 돈을 어떻게 쓸지 생각합니다.`, [
        sp && { title: `${sp.name}${wa(sp.name)} 상의해 집안에 쓴다`, desc: "배우자 관계↑", run: () => { p.money -= Math.floor(got * 0.3); sp.rel = Math.min(100, sp.rel + 6); p.happiness += 3; remember(sp, "큰돈이 생기자 함께 상의함", "trust", 2); log("생긴 돈을 배우자와 상의해 씀"); } },
        par && { title: `${par.title}께 일부를 보낸다`, desc: "부모 관계↑", run: () => { p.money -= Math.floor(got * 0.25); par.rel = Math.min(100, par.rel + 6); remember(par, "자식이 큰돈을 나눠 보냄", "gift", 2); log(`생긴 돈의 일부를 ${par.title}께 보냄`); } },
        { title: "모아 둔다", desc: "", run: () => { p.knowledge += 1; log("생긴 돈을 모아 둠"); } },
        { title: "한바탕 쓴다", desc: "행복↑ · 돈↓", run: () => { p.money -= Math.floor(got * 0.4); p.happiness += 6; log("생긴 돈으로 한바탕 즐김"); } },
      ]);
    }
    // 3) 큰 손실
    if (b.m - a.m >= Math.max(200000, sal * 0.3) && p.age >= 16) {
      const sp = spouse();
      return auto("af_loss_" + tag, "가벼워진 지갑", sp ? `「${c.title}」 그 일로 ${money(b.m - a.m)}가 나갔습니다. 그날 저녁 ${sp.name}${eun(sp.name)} 말없이 가계부를 펼쳐 놓고 한참을 들여다보았습니다.` : `「${c.title}」 그 일로 ${money(b.m - a.m)}가 나갔습니다. 한동안은 ${pf("eat")} 한 접시도 아껴 먹어야 할 것 같습니다.`, () => { p.happiness -= 2; if (sp) sp.rel -= 1; }, "큰돈이 나가 허리띠를 졸라맴");
    }
    // 4) 현상금이 오름 — 고향의 가족이 수배서를 본다
    if (a.b > b.b && (w === "pirate" || w === "revo") && a.b >= 1000000) {
      const par = closeNpcs((n) => n.role === "부모" && !near(n))[0] || closeNpcs((n) => n.role === "부모")[0];
      if (par && !S().done["saga_af_poster_" + Math.floor(a.b / 1e8)])
        return mk("af_poster_" + Math.floor(a.b / 1e8), "고향에 붙은 수배서", `${homeOf(par)}의 게시판에 ${money(a.b)}짜리 당신의 수배서가 붙었다는 소식이 들려왔습니다. ${par.title} ${par.name}${ga(par.name)} 그 앞에 한참 서 있었다고 합니다.`, [
          { title: "괜찮다는 편지를 보낸다", desc: "", run: () => { if (par.aff === "해군") { par.rel -= 6; remember(par, "해군 집안에 수배자가 났다며 괴로워함", "shame", 2); log(`${par.title}께 편지를 보냈지만 답이 없음`); } else { par.rel = Math.min(100, par.rel + 4); remember(par, "수배된 자식에게서 괜찮다는 편지를 받음", "letter", 2); log(`${par.title}께 괜찮다는 편지를 보냄`); } } },
          { title: "가족이 엮이지 않도록 연락을 끊는다", desc: "", run: () => { par.rel -= 4; remember(par, "자식이 연락을 끊음", "cut_off", 2); p.happiness -= 3; log("가족을 지키려 연락을 끊음"); } },
        ]);
    }
    // 5) 신분·직업이 바뀜 — 새 삶의 첫날
    if (p.job !== "은퇴자" && w !== "cel" && !isMinorJob() && p.age >= 16 && (a.st !== b.st || a.job !== b.job)) {
      const par = closeNpcs((n) => n.role === "부모")[0];
      const react =
        !par ? "" :
        w === "pirate" ? (par.aff === "해적" ? ` 소식을 들은 ${par.title}${eun(par.title)} "역시 내 핏줄"이라며 웃었다고 합니다.` : ` 소식을 들은 ${par.title}${eun(par.title)} 밤새 잠을 이루지 못했다고 합니다.`) :
        w === "navy" ? ` ${par.title}${eun(par.title)} 당신의 제복 이야기를 이웃마다 자랑하고 다녔습니다.` :
        w === "revo" ? "" : ` ${par.title}${ga(par.title)} "잘 해낼 거다"라는 짧은 편지를 보내왔습니다.`;
      const first =
        w === "pirate" ? `해적으로서의 첫날 밤, 선원들이 둘러앉아 당신에게 럼주를 따라 주었습니다. "이제 돌아갈 곳은 없다. 이 배가 집이야."` :
        w === "navy" ? "입대 첫날, 기상 나팔과 함께 하루가 시작되었습니다. 빳빳한 제복이 아직 어색합니다." :
        w === "revo" ? "혁명군 거점에 도착한 첫날, 이름 대신 암호명을 받았습니다. 다들 과거를 묻지 않았습니다." :
        w === "hunter" ? "현상금 사냥꾼 조합에 이름을 올린 첫날, 게시판 가득한 수배서를 한 장씩 넘겨 보았습니다." :
        `${p.job}${ro(p.job)} 일을 시작한 첫날, ${p.place.name}의 일터는 낯설고 분주했습니다. 선배 한 명이 점심을 같이 먹자며 자리를 내주었습니다.`;
      if (par && par.aff === "해군" && w === "pirate") par.rel -= 5;
      return auto("af_new_" + p.job, "새로운 삶의 첫날", first + react, () => { p.happiness += 2; if (par && react) remember(par, `자식이 ${p.job}${ga(p.job)} 되었다는 소식을 들음`, "news", 1); }, `${p.job}${ro(p.job)}서의 첫날`);
    }
    // 6) 다른 곳으로 옮김
    if (a.pl !== b.pl && p.place && S()._arrive !== p.age) {
      return mk("af_move_" + p.place.name, `${p.place.name}의 첫날`, `${b.pl}${eul(b.pl)} 떠나 ${p.place.name}에 닿았습니다. ${pf("market")}의 소리와 냄새가 낯섭니다.`, [
        { title: `${pf("market")}부터 둘러본다`, desc: "견문↑", run: () => { p.knowledge += 2; p.happiness += 1; log(`${p.place.name}의 ${pf("market")}${eul(pf("market"))} 둘러봄`); } },
        { title: "현지 사람에게 말을 건다", desc: "새 인연이 생길 수 있다.", run: () => { if (chance(0.5)) { const n = peer({ role: "친구", d: ri(-8, 8), rel: ri(50, 62), home: p.place.name }); remember(n, `${p.place.name}에 막 도착한 날 길을 알려 줌`, "first_meet", 2); log(`${p.place.name}에서 ${n.name}${wa(n.name)} 알게 됨`); } else { p.knowledge += 1; log(`${p.place.name} 사람들과 몇 마디 나눔`); } } },
        { title: "숙소를 잡고 푹 쉰다", desc: "건강↑", run: () => { p.health += 2; log(`${p.place.name}에서 쉬어 감`); } },
      ]);
    }
    // 7) 새로 알게 된 사람
    if (a.npc > b.npc) {
      const n = (p.npcs || [])[p.npcs.length - 1];
      if (alive(n) && !FAMILY.includes(n.role) && ea(n) >= 12)
        return mk("af_meet_" + n.id, `${n.name}${wa(n.name)}의 첫인상`, `「${c.title}」 그 일로 ${n.name}${ga(n.name)} 당신 삶에 들어왔습니다. ${n.personality} 사람으로 보입니다.`, [
          { title: "따로 시간을 내 이야기를 나눈다", desc: "관계↑", run: () => { n.rel = Math.min(100, n.rel + 8); remember(n, "처음 만난 날 따로 이야기를 나눔", "first_meet", 2); log(`${n.name}${wa(n.name)} 이야기를 나눔`); } },
          { title: "조금 거리를 두고 지켜본다", desc: "", run: () => { remember(n, "처음엔 서로 거리를 둠", "first_meet", 1); log(`${n.name}${wa(n.name)} 거리를 둠`); } },
        ], { npc: n });
    }
    return null;
  }
  {
    const _sr = showResult;
    showResult = function (c, b) {
      const r = _sr.apply(this, arguments);
      try {
        const x = scenes && scenes[sceneIndex];
        const s = S();
        if (!x || !c || !b || x.aftermath || x.saga || c.after || finished || p.health <= 0 || p.age < 13 || p.job === "노예") return r;
        if (/^arrive_/.test(String(sceneKey(x)))) return r; // 섬 도착은 그 섬의 사건이 바로 이어진다
        if (s.afYear !== p.age) {
          s.afYear = p.age;
          s.afN = 0;
        }
        if (s.afN >= 2) return r;
        const sc = aftermathFor(x, c, b, snapLife());
        if (sc && chance(0.75)) {
          s.afN++;
          followUp(sc);
        }
      } catch (e) {
        console.error("saga aftermath", e);
      }
      return r;
    };
  }

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
    lifeArcs(pool);
    skyScenes(pool);
    darkTrickScene(pool);
    oldPool(pool);
    const REPEAT = /^saga_(pa_rumor|pa_crewfight|nv_prisoner|rv_village|ht_family|cv_neighbor|garden)$/;
    const fresh = pool.filter((x) => x && (!S().done[x.key] || REPEAT.test(x.key)));
    // 이 처지(신분·직업·바다 위인지)를 전제로 만든 장면이다 — 같은 해 앞선 사건으로 처지가 바뀌면 건너뛴다
    const ctx = who() + "|" + p.job + "|" + (onShip() ? "ship" : "land") + "|" + (p.place && p.place.name);
    fresh.forEach((x) => (x._ctx = ctx));
    // 필수 장면(갈림길·청혼 등)은 항상, 나머지는 한 해에 1~2개만
    fresh.filter((x) => x.essential).forEach((x) => out.push(x));
    const opt = fresh.filter((x) => !x.essential).sort(() => Math.random() - 0.5);
    const n = p.age < 13 ? (chance(0.35) ? 1 : 0) : p.age >= 60 ? (chance(0.55) ? 2 : 1) : chance(0.35) ? 2 : 1;
    out.push(...opt.slice(0, n));
    return out;
  }
  // 반복 사건 방지: 같은 사건이 여러 번 나왔거나, 꿈을 이룬 뒤에는 이미 본 일반 사건을 다시 꺼내지 않는다
  // ── 빈 해를 메우는 일상: 이미 본 사건을 다시 꺼내는 대신, 계절·장소·처지를 조합한 하루를 보여 준다 ──
  const SEASON = [
    ["봄", { port: "바닷바람이 한결 부드러워졌습니다", city: "가로수에 새순이 돋았습니다", inland: "들판에 꽃이 피기 시작했습니다", desert: "모래바람이 잠시 잦아들었습니다", snow: "처마 끝 고드름이 녹아 떨어집니다", sky: "구름 꽃이 피어올랐습니다", wano: "벚꽃이 흐드러지게 피었습니다", fishman: "산호초가 알을 낳는 계절입니다", giant: "거목에 새잎이 무성해졌습니다", base: "신병들이 새로 들어왔습니다" }],
    ["여름", { port: "부둣가에 아이들이 뛰어들어 물장구를 칩니다", city: "밤늦도록 노점의 불이 꺼지지 않습니다", inland: "매미 소리가 하루 종일 이어집니다", desert: "한낮에는 그림자조차 뜨겁습니다", snow: "짧은 여름, 눈 아래로 풀이 고개를 내밉니다", sky: "구름 바다가 눈부시게 빛납니다", wano: "여름 축제의 북소리가 들립니다", fishman: "햇빛이 바다 천장 깊숙이 스며듭니다", giant: "숲 그늘에서 거인들이 낮잠을 잡니다", base: "갑판 위 훈련이 땀으로 범벅이 됩니다" }],
    ["가을", { port: "고깃배들이 만선 깃발을 달고 돌아옵니다", city: "시장마다 햇과일이 쌓였습니다", inland: "황금빛 들판에서 추수가 한창입니다", desert: "밤바람이 서늘해졌습니다", snow: "첫눈이 내릴 채비를 합니다", sky: "구름이 노을빛으로 물듭니다", wano: "단풍이 산을 붉게 물들였습니다", fishman: "해류가 바뀌며 물고기 떼가 지나갑니다", giant: "거목 열매가 쿵쿵 떨어집니다", base: "보급선이 겨울 물자를 싣고 들어옵니다" }],
    ["겨울", { port: "차가운 파도가 방파제를 때립니다", city: "창마다 따뜻한 불빛이 새어 나옵니다", inland: "마을이 하얀 눈에 덮였습니다", desert: "사막의 밤이 얼음처럼 차갑습니다", snow: "온 섬이 눈 속에 잠겼습니다", sky: "구름이 단단하게 굳었습니다", wano: "화로 곁에 사람들이 모여듭니다", fishman: "바다 위의 겨울은 여기까지 닿지 않습니다", giant: "거인들이 모닥불 곁에서 노래합니다", base: "얼어붙은 갑판을 깨며 아침 점호를 합니다" }],
  ];
  function dailyFiller() {
    const w = who(),
      pk = placeKind(),
      [sn, SN] = rand(SEASON);
    const ACT = {
      young: ["친구들과 해가 질 때까지 뛰어놀았습니다", "어른들 몰래 동네 구석구석을 탐험했습니다", "집안일을 돕다 꾸중도 듣고 칭찬도 들었습니다"],
      civ: [`${p.job} 일을 하며 바쁘게 하루를 보냈습니다`, "일이 끝나고 단골 가게에서 따뜻한 한 끼를 먹었습니다", "쉬는 날엔 늦잠을 자고 동네를 천천히 걸었습니다"],
      pirate: ["갑판을 닦고 돛을 손보며 다음 항해를 준비했습니다", "선원들과 둘러앉아 허풍 섞인 무용담을 늘어놓았습니다", "망대에 올라 수평선을 오래 바라보았습니다"],
      navy: ["순찰과 훈련으로 하루가 지나갔습니다", "부대 식당에서 동기들과 농담을 주고받았습니다", "보고서를 쓰다 창밖의 군함을 바라보았습니다"],
      revo: ["거점에서 다음 임무의 지도를 들여다보았습니다", "동료와 밤새 세상이 바뀐 뒤의 이야기를 나눴습니다", "정체를 숨긴 채 장터를 거닐며 사람들의 말을 들었습니다"],
      hunter: ["새로 붙은 수배서를 한 장씩 훑어보았습니다", "무기를 손질하며 다음 사냥감을 골랐습니다", "술집 구석에서 현상범의 소문에 귀를 기울였습니다"],
      retired: ["볕 좋은 자리에 앉아 지나가는 사람들을 구경했습니다", "오랜만에 옛 사진첩을 꺼내 넘겨 보았습니다", "손주 같은 동네 아이들에게 옛이야기를 들려주었습니다"],
      cel: ["성지의 정원에서 하루를 보냈습니다"],
      slave: ["묵묵히 하루를 버텼습니다"],
    }[w] || ["평범한 하루를 보냈습니다"];
    const ai = ri(0, ACT.length - 1);
    const n = pick(npcsBy((x) => near(x) && x.rel >= 55 && ea(x) >= 6));
    const line = n ? ` 저녁에는 ${roleLabel(n)} ${n.name}${wa(n.name)} 잠시 이야기를 나눴습니다.` : "";
    return {
      key: `saga_daily_${sn}_${pk}_${w}_${ai}`,
      saga: true,
      title: `${sn}의 ${p.place.name}`,
      body: `${SN[pk] || SN.port}. ${ACT[ai]}.${line}`,
      choices: null,
      effect: () => {
        p.happiness += 1;
        if (n) n.rel = Math.min(100, n.rel + 1);
      },
      summary: `${sn}의 평범한 하루`,
    };
  }
  if (typeof randomScene === "function") {
    const _rs = randomScene;
    randomScene = function () {
      try {
        const seen = (p && p.seenScenes) || {};
        for (let i = 0; i < 10; i++) {
          const r = _rs.apply(this, arguments);
          if (!r) continue;
          const last = seen[String(sceneKey(r))];
          if (last === undefined || p.age - last >= 30) return r;
        }
        return dailyFiller();
      } catch (e) {
        return _rs.apply(this, arguments);
      }
    };
  }
  // 필수 사건이지만 제안·기념일처럼 되풀이되는 것들
  const RECUR_ESS = /^(revo_recruit|fam_anniv|strong_foe|job_kuma|현상금 의뢰)/;
  function pruneRepeats() {
    const s = S(),
      seen = p.seenScenes || {},
      ep = epilogueActive();
    for (let i = scenes.length - 1; i >= 0; i--) {
      const x = scenes[i];
      if (!x || x.promotion || x.saga || x.kid) continue;
      const k = String(sceneKey(x));
      const c = s.cnt[k] || 0,
        last = seen[k];
      let drop = false;
      if (x.essential) {
        // 되풀이되는 필수 제안은 간격을 두고, 평생 세 번까지만
        if (RECUR_ESS.test(k)) drop = c >= (k === "strong_foe" ? 3 : 2) || (last !== undefined && p.age - last < (k === "strong_foe" ? 10 : 15));
      } else {
        // 일반 사건은 평생 두 번까지, 두 번째는 오랜 세월이 지난 뒤에만 (평범한 전투도 마찬가지)
        const fight = /^(fight_|battle_|hz_)/.test(k);
        if (fight) drop = c >= 2 || (last !== undefined && p.age - last < 20);
        // 같은 일반 사건은 원칙적으로 평생 한 번. 30년 넘게 지난 뒤 드물게(30%)만 다시 나온다
        else if (c >= 2) drop = true;
        else if (c >= 1 || last !== undefined) {
          if (last === undefined || p.age - last < 30) drop = true;
          else {
            // 다시 나올 자격은 사건마다 딱 한 번만 정한다 (해마다 다시 굴리면 결국 나오게 되므로)
            s.allow2 = s.allow2 || {};
            if (s.allow2[k] === undefined) s.allow2[k] = chance(0.25);
            drop = !s.allow2[k];
          }
        }
        else if (ep && last !== undefined && p.age >= 16) drop = true;
        else if (p.age >= 70 && x.choices && /권유|입대|모병|스카우트|가입 제안/.test(x.title)) drop = true;
      }
      if (drop) scenes.splice(i, 1);
    }
  }


  {
    const _be = buildExtraScenes;
    buildExtraScenes = function () {
      const r = _be.apply(this, arguments);
      try {
        pruneRepeats();
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
        if (r._ctx && !r.aftermath && r._ctx !== who() + "|" + p.job + "|" + (onShip() ? "ship" : "land") + "|" + (p.place && p.place.name)) return null;
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
  // 승진 장면: 매번 같은 제목 대신 실제로 오를 직위를 제목에 담는다
  if (typeof promotionScene === "function") {
    const _ps = promotionScene;
    promotionScene = function () {
      const sc = _ps.apply(this, arguments);
      try {
        const L = careerLadder();
        const cur = L[Math.min(p.rankLevel || 0, L.length - 1)],
          next = L[Math.min((p.rankLevel || 0) + 1, L.length - 1)];
        if (sc && next && next !== cur) sc.title = `${cur} → ${next}, ${sc.title}`;
      } catch (e) {}
      return sc;
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

  /* ═════════════════════════ v2: 반복 억제 · 섬 도착 사건 · 스카이피안 · 열매 사건 · 박람회 기술 ═════════════════════════ */

  // ── 항해 중 위험: 같은 종류(폭풍·유령선 등)가 10년 안에 다시 나오지 않게 다시 뽑는다 ──
  if (typeof hazardScene === "function") {
    const _hz = hazardScene;
    hazardScene = function () {
      const s = S();
      s.hz = s.hz || {};
      let best = null;
      for (let i = 0; i < 8; i++) {
        const h = _hz.apply(this, arguments);
        if (!h) return h;
        const k = String(h.key || h.title).replace(/_0\.\d+$/, "");
        const last = s.hz[k];
        if (last === undefined || p.age - last >= 10) {
          s.hz[k] = p.age;
          return h;
        }
        if (!best || last < best[1]) best = [h, last, k];
      }
      s.hz[best[2]] = p.age;
      return best[0];
    };
  }

  // ── 섬에 도착하면 바로 다음 장면에서 그 섬의 일이 벌어진다 ──
  function arrivalKindScene(dest) {
    const kind = placeKind(dest),
      w = who(),
      nm = dest.name;
    const K = {
      port: ["부두의 아침", `${nm}의 부두는 막 들어온 고깃배들로 북적였습니다. 생선 경매꾼의 외침 사이로 선술집 간판과 선원 구인 게시판이 보입니다.`, [
        ["생선 경매를 구경한다", "견문↑", () => { p.knowledge += 2; p.happiness += 1; log(`${nm}의 생선 경매를 구경함`); }],
        ["선술집에서 이 섬의 소문을 듣는다", "정보↑", () => { p.knowledge += 3; p.relationship += 1; log(`${nm}의 선술집에서 소문을 들음`); }],
        ["구인 게시판의 일거리를 하나 맡는다", "돈↑ · 건강 조금↓", () => { p.money += moneyAdult(40000, 120000); p.health -= 1; log(`${nm}에서 짧은 일거리를 맡음`); }],
      ]],
      city: ["번화가의 소매치기", `${nm}의 큰길은 사람으로 가득했습니다. 정신없이 구경하던 사이, 누군가 허리춤을 스치고 달아납니다.`, [
        ["끝까지 쫓아간다", "", () => { if (chance(0.55 + p.health / 400)) { p.reputation += 1; log(`${nm}에서 소매치기를 붙잡음`); } else { p.money -= moneyAdult(20000, 60000); p.health -= 2; log(`${nm}에서 소매치기를 놓침`); } }],
        ["그냥 둔다. 이 도시는 원래 이런 곳이다", "", () => { p.money -= moneyAdult(10000, 40000); p.knowledge += 1; log(`${nm}에서 지갑을 털림`); }],
      ]],
      inland: ["먼지 날리는 길", `항구에서 ${nm}까지는 한참을 걸어야 했습니다. 길가의 노점 할머니가 물 한 잔을 건네며 어디서 왔느냐고 묻습니다.`, [
        ["고향 이야기를 들려준다", "관계↑", () => { p.relationship += 2; p.happiness += 2; log(`${nm}의 노점 할머니와 이야기를 나눔`); }],
        ["고맙다는 말만 하고 서두른다", "", () => { p.health += 1; log(`${nm}에 서둘러 도착함`); }],
      ]],
      desert: ["물값 흥정", `${nm}에서는 물이 금보다 귀합니다. 낙타 상인이 물 한 통에 터무니없는 값을 부릅니다.`, [
        ["값을 깎는다", "", () => { if (chance(0.5 + p.knowledge / 300)) { p.knowledge += 1; log(`${nm}에서 물값을 깎음`); } else { p.money -= moneyAdult(15000, 40000); log(`${nm}에서 비싼 물을 삼`); } }],
        ["군말 없이 산다", "건강↑ · 돈↓", () => { p.money -= moneyAdult(20000, 50000); p.health += 3; log(`${nm}에서 물을 넉넉히 삼`); }],
        ["오아시스를 직접 찾아간다", "", () => { if (chance(0.6)) { p.health += 2; p.knowledge += 2; log(`${nm} 근처의 오아시스를 찾아냄`); } else { p.health -= ri(4, 9); log(`${nm}의 사막에서 길을 잃고 탈진함`); } }],
      ]],
      snow: ["얼어붙는 상륙", `${nm}에 내리자마자 칼바람이 뺨을 때렸습니다. 이 추위를 그냥 버티다가는 몸이 상할 것 같습니다.`, [
        ["털가죽 옷을 산다", "돈↓ · 건강 유지", () => { p.money -= moneyAdult(30000, 70000); log(`${nm}에서 털가죽 옷을 삼`); }],
        ["주민 집에 하룻밤 신세를 진다", "관계↑", () => { p.relationship += 2; p.happiness += 2; log(`${nm} 주민의 집에서 몸을 녹임`); }],
        ["이 정도쯤이야 하고 버틴다", "건강↓", () => { p.health -= ri(4, 8); p.combat += 1; log(`${nm}의 추위를 맨몸으로 버팀`); }],
      ]],
      sky: ["천국의 문", `구름 위로 올라오자 '천국의 문' 앞에서 할머니 문지기가 카메라를 들었습니다. "관광이신가요, 침략이신가요? 입국료는 1인당 10억 엑스트롤입니다."`, [
        ["정직하게 돈이 없다고 말한다", "", () => { p.happiness += 1; log(`${nm}의 천국의 문을 그냥 통과함`); }],
        ["입국료 대신 하계의 물건을 건넨다", "관계↑", () => { p.relationship += 2; p.money -= moneyAdult(10000, 30000); log(`${nm}의 문지기에게 하계의 물건을 선물함`); }],
      ]],
      wano: ["쇄국의 관문", `${nm}${eun(nm)} 바깥 사람을 쉽게 들이지 않습니다. 관문의 무사가 칼자루에 손을 얹고 통행증을 내놓으라고 합니다.`, [
        ["밤을 틈타 몰래 상륙한다", "", () => { if (chance(0.6)) { p.knowledge += 2; log(`${nm}에 몰래 상륙함`); } else { p.health -= ri(5, 10); log(`${nm}의 관문 무사에게 들켜 다침`); } }],
        ["뇌물을 쥐여 준다", "돈↓", () => { p.money -= moneyAdult(50000, 120000); log(`${nm}의 관문을 뇌물로 통과함`); }],
        ["정중히 사정을 설명한다", "", () => { if (chance(0.45 + p.relationship / 300)) { p.relationship += 2; log(`${nm}의 무사가 사정을 듣고 길을 열어 줌`); } else { p.happiness -= 2; log(`${nm}의 관문에서 하루를 기다림`); } }],
      ]],
      fishman: ["산호 거리의 시선", ["어인", "인어"].includes(p.race) ? `${nm}에 내리자 익숙한 바다 냄새가 났습니다. 동족들이 반갑게 인사를 건넵니다.` : `${nm}의 산호 거리를 걷자 어인들의 시선이 날카롭게 꽂혔습니다. 인간에게 당한 상처를 잊지 않은 섬입니다.`, [
        ["먼저 고개 숙여 인사한다", "관계↑", () => { p.relationship += 3; log(`${nm} 사람들에게 먼저 인사함`); }],
        ["해저 시장에서 장사꾼과 친해진다", "견문↑", () => { p.knowledge += 2; p.money -= moneyAdult(10000, 30000); log(`${nm}의 해저 시장을 둘러봄`); }],
      ]],
      giant: ["거인 전사의 시험", `${nm}의 거목 아래에서 거인 전사 하나가 내려다봅니다. "이 섬에 들어오려면 힘을 보여라."`, [
        ["정면으로 힘겨루기를 한다", "", () => { if (chance(0.35 + p.combat / 200)) { p.reputation += 3; gainStanding(1); log(`${nm}의 거인 전사에게 인정받음`); } else { p.health -= ri(6, 12); log(`${nm}의 거인 전사에게 내동댕이쳐짐`); } }],
        ["술 한 통을 내밀며 웃는다", "", () => { p.relationship += 2; p.money -= moneyAdult(20000, 50000); log(`${nm}의 거인과 술을 나눔`); }],
      ]],
      base: ["기지 앞 검문", w === "pirate" ? `${nm}${eun(nm)} 해군 기지입니다. 부두마다 해군이 깔려 있고, 게시판에는 수배서가 빼곡합니다. 당신의 얼굴이 있는지 확인할 겨를도 없이 검문이 시작됐습니다.` : `${nm}에 들어서자 해군의 검문이 시작되었습니다. 군함 사이로 훈련 구령이 울립니다.`, [
        ["태연하게 검문을 받는다", "", () => { if (w === "pirate" && p.bountyIssued && chance(0.4)) { p.health -= ri(6, 12); log(`${nm}의 검문에서 정체가 들통나 도망침`); } else { p.knowledge += 1; log(`${nm}의 검문을 통과함`); } }],
        ["검문을 피해 뒷골목으로 돌아간다", "", () => { p.knowledge += 2; log(`${nm}의 뒷골목으로 숨어듦`); }],
      ]],
    }[kind] || ["낯선 부두", `${nm}에 닿았습니다. 처음 보는 풍경입니다.`, [["둘러본다", "", () => { p.knowledge += 2; }]]];
    return mk(
      "arr_" + kind + "_" + nm,
      `${nm} — ${K[0]}`,
      K[1],
      K[2].map(([title, desc, run]) => ({ title, desc, run })),
    );
  }
  function islandEventFor(dest) {
    let list = [];
    try {
      list = ((typeof PLACE_EVENTS !== "undefined" && PLACE_EVENTS[dest.name]) || (() => []))().filter(Boolean);
    } catch (e) {
      list = [];
    }
    const seen = p.seenScenes || {};
    const ok = list
      .map((x) => {
        const k = String(sceneKey(x));
        const last = seen[k];
        if (last !== undefined && p.age - last < 15) return null;
        if (MIN_AGE[k] !== undefined && p.age < MIN_AGE[k]) return null;
        return fitScene(x);
      })
      .filter(Boolean);
    if (ok.length) {
      const x = { ...rand(ok) };
      seen[String(sceneKey(x))] = p.age;
      x.title = `${dest.name} — ${x.title}`;
      return x;
    }
    return arrivalKindScene(dest);
  }
  if (typeof arrive === "function") {
    const _arrive = arrive;
    arrive = function (dest) {
      const r = _arrive.apply(this, arguments);
      try {
        S()._arrive = p.age;
        const sc = islandEventFor(dest);
        if (sc) followUp(sc);
      } catch (e) {
        console.error("saga arrive", e);
      }
      return r;
    };
  }

  // ── 스카이피안 ──
  const isSky = () => p && p.race === "스카이피안";
  const inSky = () => placeKind() === "sky";
  function skyScenes(out) {
    if (!isSky() || !free()) return;
    const a = p.age;
    if (a >= 6 && a <= 12 && inSky() && !done("sky_waver"))
      out.push(
        mk("sky_waver", "첫 웨이버", "또래들이 구름 바다 위를 웨이버로 미끄러지듯 달립니다. 바람 다이얼이 달린 작은 판자 하나에 몸을 맡기면, 하늘이 통째로 놀이터가 됩니다.", [
          { title: "무작정 올라타 본다", desc: "", run: () => { if (chance(0.5 + p.health / 300)) { p.happiness += 5; sk("항해술", 4); log("처음으로 웨이버를 타고 구름 바다를 가로지름"); followUp(auto("sky_waver_ok", "구름 위의 바람", "판자가 구름을 가르며 미끄러졌습니다. 날개 사이로 바람이 빠져나가는 소리가 이렇게 좋은 줄 처음 알았습니다.", () => { p.happiness += 2; }, "웨이버의 바람을 처음 느낌")); } else { p.health -= ri(3, 7); log("웨이버에서 떨어져 구름 바다에 빠짐"); followUp(auto("sky_waver_fall", "구름 바다에 빠지다", "중심을 잃고 구름 바다에 처박혔습니다. 허우적대는 당신을 어른 하나가 건져 올리며 웃었습니다. \"다들 그렇게 배우는 거란다.\"", () => { p.relationship += 1; }, "구름 바다에 빠졌다가 구조됨")); } } },
          { title: "어른에게 타는 법부터 배운다", desc: "", run: () => { sk("항해술", 3); p.knowledge += 1; log("웨이버 타는 법을 차근차근 배움"); } },
        ], { min: 0 }),
      );
    if (a >= 9 && a <= 16 && inSky() && !done("sky_vearth"))
      out.push(
        mk("sky_vearth", "대지(바스)", "하계에서 올라온 상인이 작은 자루를 열어 보였습니다. 검고 축축한 흙 — 하늘섬 사람들이 '대지(바스)'라 부르며 귀하게 여기는 것입니다. 구름에서는 아무것도 뿌리내리지 못하니까요.", [
          { title: "용돈을 털어 한 줌 산다", desc: "", run: () => { p.money -= ri(20, 60); p.flags.skyVearth = true; log("대지(바스) 한 줌을 삼"); followUp(auto("sky_vearth_seed", "화분 속의 싹", "흙 한 줌을 화분에 담고 씨앗을 심었습니다. 며칠 뒤 초록 싹이 올라오자 이웃들이 구경하러 몰려왔습니다. 그날부터 하계가 궁금해졌습니다.", () => { p.happiness += 4; p.flags.seaDream = true; }, "대지에서 싹을 틔움")); } },
          { title: "하계는 어떤 곳인지 물어본다", desc: "견문↑", run: () => { p.knowledge += 3; log("상인에게 하계의 이야기를 들음"); } },
        ], { min: 0 }),
      );
    if (a >= 14 && a <= 20 && inSky() && !done("sky_shandia"))
      out.push(
        mk("sky_shandia", "샨디아의 아이", "구름 끝에서 샨디아 부족의 아이가 다쳐 쓰러져 있습니다. 어른들은 샨디아와 엮이지 말라고 했습니다. 이 섬의 땅은 원래 그들의 것이었다는 이야기도 들은 적이 있습니다.", [
          { title: "부축해 상처를 치료해 준다", desc: "", run: () => { const n = peer({ role: "친구", d: ri(-1, 1), rel: ri(55, 70), job: "샨디아 전사" }); remember(n, "다쳐 쓰러졌을 때 스카이피안이 치료해 줌", "saved", 3); log("샨디아의 아이를 치료해 줌"); followUp(auto("sky_shandia_gift", "되돌아온 깃털", `며칠 뒤 문 앞에 독수리 깃털 하나가 놓여 있었습니다. ${n.name}${ga(n.name)} 두고 간 것이었습니다. 샨디아에게 깃털은 은혜를 잊지 않겠다는 뜻이라고 합니다.`, () => { p.happiness += 3; p.relationship += 2; }, "샨디아의 깃털을 받음", { npc: n })); } },
          { title: "어른들을 부른다", desc: "", run: () => { p.relationship += 1; log("어른들에게 샨디아 아이를 알림"); } },
          { title: "못 본 척 지나간다", desc: "", run: () => { p.happiness -= 2; log("샨디아의 아이를 지나침"); } },
        ], { min: 13 }),
      );
    if (a >= 18 && a <= 40 && inSky() && who() === "civ" && !done("sky_dial"))
      out.push(
        mk("sky_dial", "다이얼 장인의 제안", "조개껍데기 속에 바람과 빛, 소리와 충격을 담아 두는 다이얼. 마을의 다이얼 장인이 손재주 좋은 당신을 눈여겨보고 제자로 들어오라고 합니다.", [
          { title: "다이얼 장인이 된다", desc: "직업이 바뀐다.", run: () => { setCareer("조선공", "민간인"); p.knowledge += 3; sk("제작", 6); log("하늘섬의 다이얼 장인이 됨"); followUp(auto("sky_dial_first", "첫 다이얼", "처음 만든 바람 다이얼은 숨 한 번 불어 넣은 만큼만 바람을 뱉었습니다. 장인은 그걸 들고 한참을 웃더니, 선반 맨 앞에 올려놓았습니다.", () => { p.happiness += 3; }, "첫 다이얼을 완성함")); } },
          { title: "지금 일을 계속한다", desc: "", run: () => { p.knowledge += 1; log("다이얼 장인의 제안을 거절함"); } },
        ]),
      );
    if (a >= 16 && a <= 45 && inSky() && !done("sky_descend"))
      out.push(
        mk("sky_descend", "하계로 내려가는 길", `구름 끝에서 내려다보면 끝없는 푸른 바다가 보입니다.${p.flags.skyVearth ? " 어릴 적 화분에서 싹을 틔운 그 흙이 저 아래 가득하다고 합니다." : ""} 하늘 섬을 떠나 하계로 내려갈 수 있는 기회가 생겼습니다.`, [
          {
            title: "구름길을 따라 하계로 내려간다",
            desc: "하계의 섬에서 새 삶을 시작한다.",
            run: () => {
              const dest = places.find((x) => x.name === "모크 타운") || places.find((x) => x.sea === "그랜드 라인 전반부" && placeKind(x) !== "sky");
              if (dest) {
                p.place = dest;
                p.sea = dest.sea;
                markSea();
              }
              p.flags.skyDescended = true;
              chron("하늘섬을 떠나 하계로 내려옴", "이동", 3);
              log("하늘섬을 떠나 하계로 내려옴");
              followUp(auto("sky_land_first", "처음 밟은 땅", `발밑이 구름처럼 꺼지지 않았습니다. ${dest ? dest.name : "하계"}의 흙을 손으로 한 줌 쥐어 보았습니다. 하늘에서는 그렇게 귀하던 것이 여기서는 발에 차일 만큼 흔했습니다.`, () => { p.happiness += 6; p.knowledge += 3; achieve("하계의 땅을 밟은 스카이피안"); }, "처음으로 하계의 땅을 밟음"));
            },
          },
          { title: "하늘섬에 남는다", desc: "", run: () => { p.happiness += 2; log("하늘섬에 남기로 함"); } },
        ]),
      );
    if (!inSky() && a >= 16 && !done("sky_wings"))
      out.push(
        mk("sky_wings", "등에 달린 날개", `${p.place.name}의 아이들이 당신 등의 작은 날개를 가리키며 수군거립니다. "저거 진짜야? 날 수 있어?"`, [
          { title: "웃으며 날개를 펄럭여 보인다", desc: "", run: () => { p.relationship += 2; p.happiness += 2; log("아이들에게 날개를 보여 줌"); followUp(auto("sky_wings_kids", "날개 아저씨", "그날 이후 동네 아이들은 당신을 '날개 아저씨', '날개 언니'라 부르며 졸졸 따라다녔습니다. 하늘섬 이야기를 해 달라는 조름이 끝이 없습니다.", () => { p.happiness += 2; }, "동네 아이들과 친해짐")); } },
          { title: "옷으로 날개를 가린다", desc: "", run: () => { p.happiness -= 2; log("날개를 옷으로 가리고 다님"); } },
        ]),
      );
    if (!inSky() && a >= 60 && !done("sky_return"))
      out.push(
        mk("sky_return", "구름 위의 고향", "나이가 들수록 구름 바다의 냄새가 그리워집니다. 하늘섬으로 올라가는 녹 업 스트림의 소문이 들려왔습니다.", [
          { title: "마지막으로 하늘섬에 올라간다", desc: "", run: () => { const home = places.find((x) => x.name === "엔젤 아일랜드"); if (home) { p.place = home; p.sea = home.sea; } p.happiness += 8; chron("노년에 하늘섬 고향으로 돌아감", "이동", 3); log("노년에 하늘섬으로 돌아감"); followUp(auto("sky_return_home", "다시 구름 위에서", "구름 끝에 서자 어릴 적 웨이버를 타던 바다가 그대로 펼쳐져 있었습니다. 낯선 아이들이 그때의 당신처럼 구름 위를 달리고 있었습니다.", () => { p.happiness += 4; }, "하늘섬 고향에 돌아옴")); } },
          { title: "하계에서 생을 마친다", desc: "", run: () => { p.happiness += 1; log("하계에 남기로 함"); } },
        ]),
      );
  }

  // ── 힘힘 열매: 세계가 물에 잠겨도 섬을 밀어 올려 버틴다 ──
  const hasPower = () => !!p && (p.fruit === "힘힘 열매" || (p.extraFruits || []).includes("힘힘 열매"));
  if (typeof floodSafe === "function") {
    const _fs = floodSafe;
    floodSafe = function () {
      if (p && p.flags && p.flags.powerFloodSafe) return true;
      return _fs.apply(this, arguments);
    };
  }
  function powerFloodScene() {
    return mk(
      "flood_power",
      "둥실, 떠오르다",
      `바다가 섬을 삼키기 시작한 날, 당신은 허둥지둥 지붕 위로 기어 올라갔습니다. 하지만 물은 지붕까지 차올랐고, 결국 발이 미끄러져 바다에 풍덩 빠지고 말았습니다.\n\n악마의 열매 능력자는 바다에 빠지면 맥주병처럼 가라앉는다 — 그게 이 세계의 상식입니다. 눈을 질끈 감고 마지막을 각오한 그 순간… 몸이 코르크 마개처럼 둥실 떠올랐습니다.\n\n"……어?"\n\n힘이 빠지기는커녕, 물 위에 누워 하늘을 보며 둥둥 떠다니고 있었습니다. 지나가던 학자가 나무판자에 매달린 채 안경을 고쳐 쓰며 중얼거렸습니다. "힘힘 열매의 힘은… 부력 또한 조종할지도 모른다…"\n\n그날 이후 당신은 물에 잠긴 세상 위를 둥둥 떠다니며 살게 되었습니다. 사람들은 당신을 '세계에서 가장 잘 뜨는 능력자'라고 불렀습니다.`,
      null,
      {
        essential: true,
        effect: () => {
          p.flags.powerFloodSafe = true;
          p.flags.survivedFlood = true;
          p.happiness += 4;
          p.reputation += 3;
          achieve("힘힘 열매의 부력으로 세계 침수를 버팀");
          chron("세계가 물에 잠겼지만 힘힘 열매의 '부력'으로 둥둥 떠서 살아남음", "업적", 3);
        },
        summary: "힘힘 열매의 부력(?)으로 둥둥 떠서 살아남음",
      },
    );
  }


  // ── 어둠어둠 열매: 썩은 과일을 악마의 열매라 속이다 ──
  function darkTrickScene(out) {
    if (p.fruit !== "어둠어둠 열매" || p.age < 18 || done("dark_trick") || !free()) return;
    let mate = closeNpcs((n) => ["동료", "친구"].includes(n.role) && near(n) && ea(n) >= 16)[0];
    // 곁에 동료가 없어도, 배를 타거나 소속이 있으면 함께 지내는 동료 하나를 만든다
    if (!mate) {
      if (!(p.ship || p.crew || ["해적", "해군", "혁명군"].includes(p.status) || p.job === "현상금 사냥꾼")) return;
      mate = peer({ role: "동료", d: ri(-4, 4), rel: ri(55, 70) });
      remember(mate, "같은 배에서 지내는 동료", "crew", 1);
    }
    out.push(
      mk(
        "dark_trick",
        "썩은 과일",
        `창고 구석에서 소용돌이 무늬처럼 얼룩진 썩은 과일 하나를 발견했습니다. 마침 ${mate.name}${ga(mate.name)} 악마의 열매를 먹고 싶다고 노래를 부르던 참입니다. 어둠 속에서 웃음이 새어 나옵니다.`,
        [
          {
            title: "\"이거 악마의 열매야\" 하고 건넨다",
            desc: "동료를 속인다. 어떻게 될지는 모른다.",
            run: () => {
              log(`${mate.name}에게 썩은 과일을 악마의 열매라고 속여 건넴`);
              const r = Math.random();
              if (r < 0.06) {
                mate.power = Math.min(100, mate.power + 30);
                remember(mate, "썩은 과일인 줄 알았던 것이 진짜 악마의 열매였음", "real_fruit", 3);
                followUp(auto("dark_trick_real", "진짜였다", `과일을 한 입 베어 문 ${mate.name}의 몸에서 이상한 기운이 뿜어져 나왔습니다. 썩은 줄만 알았던 그것은… 진짜 악마의 열매였습니다. 당신은 할 말을 잃었고, ${mate.name}${eun(mate.name)} 당신에게 평생 고마워하게 되었습니다.`, () => { mate.rel = Math.min(100, mate.rel + 20); p.happiness += 3; }, `${mate.name}${ga(mate.name)} 진짜 악마의 열매를 먹게 됨`, { npc: mate }));
              } else if (r < 0.5) {
                mate.rel -= 5;
                remember(mate, "썩은 과일을 먹고 사흘 동안 배탈이 남", "tricked", 2);
                followUp(
                  mk("dark_trick_sick", "사흘 밤의 배탈", `${mate.name}${eun(mate.name)} 과일을 먹고 사흘 밤낮을 화장실에서 나오지 못했습니다. 기운을 차린 날, 당신을 노려보며 묻습니다. "너… 알고 줬지?"`, [
                    { title: "끝까지 시치미를 뗀다", desc: "", run: () => { if (chance(0.5)) { mate.rel -= 4; log(`${mate.name}${ga(mate.name)} 끝내 의심을 거두지 않음`); } else { log(`${mate.name}${ga(mate.name)} 속은 줄 모르고 넘어감`); } } },
                    { title: "배를 잡고 웃으며 사과한다", desc: "", run: () => { mate.rel += 6; remember(mate, "속인 걸 사과받고 같이 웃음", "laugh", 2); log(`${mate.name}에게 사과하고 같이 웃음`); } },
                  ], { npc: mate }),
                );
              } else if (r < 0.8) {
                followUp(auto("dark_trick_believe", "열매 능력자(가짜)", `${mate.name}${eun(mate.name)} 자신이 능력자가 됐다고 굳게 믿고, 매일 바다를 피해 다니며 이상한 수련을 시작했습니다. 그런데 그 수련 덕분에 정말로 몸이 단단해지고 있습니다. 진실을 말할 타이밍을 완전히 놓쳤습니다.`, () => { mate.power = Math.min(100, mate.power + 8); p.happiness += 3; remember(mate, "자신이 능력자라 믿고 맹훈련함", "believe", 2); }, `${mate.name}${ga(mate.name)} 가짜 열매를 믿고 수련함`, { npc: mate }));
              } else {
                mate.rel -= 20;
                remember(mate, "썩은 과일로 자신을 속인 일을 알게 됨", "betrayed", 3);
                followUp(auto("dark_trick_caught", "들통", `얼룩진 과일 껍질을 본 다른 선원이 웃음을 터뜨렸습니다. "그거 그냥 썩은 망고잖아!" ${mate.name}${eun(mate.name)} 얼굴이 새빨개진 채 당신을 노려보다 말없이 자리를 떴습니다.`, () => { p.relationship -= 3; if (chance(0.5)) schedule("revenge", ri(4, 9), { id: mate.id }); }, `${mate.name}${ga(mate.name)} 속은 걸 알고 분노함`, { npc: mate }));
              }
            },
          },
          { title: "그냥 버린다", desc: "", run: () => { p.knowledge += 1; log("썩은 과일을 버림"); } },
        ],
        { npc: mate, essential: true },
      ),
    );
  }

  // ── 해적 박람회에서 전수받은 기술 → 전략 전투의 전용 행동 ──
  const EXPO_ACT = {
    luffy: { icon: "👊", name: "고무고무 총난타", dmg: 2.2, hits: 5, cd: 3, desc: "루피의 기술 · 5연타 주먹 세례 · 재사용 3턴" },
    zoro: { icon: "⚔️", name: "삼도류 검격 — 귀참", dmg: 1.9, hits: 3, pierce: true, slash: true, cd: 3, desc: "조로의 기술 · 세 자루 검으로 방어를 무시하는 3연타 · 재사용 3턴" },
    sanji: { icon: "🔥", name: "디아블 잠브 — 콘카세", dmg: 1.3, burn: [0.4, 3], cd: 3, desc: "상디의 기술 · 불꽃 발차기 + 3턴 동안 화상 · 재사용 3턴" },
    bullet: { icon: "🦾", name: "합체 — 강철 갑옷", dmg: 0.7, block: 0.7, cd: 4, desc: "불릿의 기술 · 쇳덩이를 둘러 받는 피해 -70% + 반격 · 재사용 4턴" },
    mihawk: { icon: "🗡️", name: "흑도 일섬", dmg: 2.4, pierce: true, crit: 0.35, slash: true, cd: 4, desc: "미호크의 기술 · 방어를 무시하는 일섬, 치명타 35% · 재사용 4턴" },
    hancock: { icon: "💘", name: "메로메로 감로", dmg: 0.5, weakenFoe: 0.6, cd: 4, desc: "핸콕의 기술 · 적을 매혹해 이번 행동 위력 -60% · 재사용 4턴" },
    smoker: { icon: "💨", name: "화이트 블로우", dmg: 0.9, weakenFoe: 0.35, block: 0.3, cd: 3, desc: "스모커의 기술 · 연기로 묶어 적 위력 -35%, 받는 피해 -30% · 재사용 3턴" },
    lucci: { icon: "🐆", name: "육왕총", dmg: 2.1, pierce: true, cd: 4, desc: "루치의 기술 · 육식의 극의, 방어를 꿰뚫는 충격 · 재사용 4턴" },
    sabo: { icon: "🐉", name: "용조권", dmg: 1.5, pierce: true, critNext: true, cd: 3, desc: "사보의 기술 · 방어를 무시하는 용의 발톱 + 다음 공격 치명타 확정 · 재사용 3턴" },
  };
  const expoLearned = () => {
    try {
      const ab = p.abilities || [];
      return (typeof EXPO_STARS !== "undefined" ? EXPO_STARS : []).filter((st) => ab.includes(expoStyleName(st)) && EXPO_ACT[st.id]).map((st) => st.id);
    } catch (e) {
      return [];
    }
  };
  if (typeof tacAbilities === "function" && typeof tacBuildActions === "function") {
    const _ta = tacAbilities;
    tacAbilities = function () {
      const ab = _ta.apply(this, arguments);
      try {
        ab.expo = expoLearned();
      } catch (e) {}
      return ab;
    };
    const _tb = tacBuildActions;
    tacBuildActions = function (st) {
      const out = _tb.apply(this, arguments);
      try {
        const list = (st && st.ab && st.ab.expo) || [];
        for (const id of list) {
          const A = EXPO_ACT[id];
          if (!A || out.some((x) => x.id === "ex_" + id)) continue;
          out.push({ ...A, id: "ex_" + id, group: "expo", hits: A.hits || 1, cd: A.cd || 0 });
        }
      } catch (e) {}
      return out;
    };
    // 기술을 새로 배우면 전투 보정 캐시를 비워 새 행동이 반영되게 한다
    if (typeof addAbility === "function") {
      const _aa = addAbility;
      addAbility = function (a) {
        const r = _aa.apply(this, arguments);
        try {
          if (/의 전투 스타일$/.test(String(a)) && typeof TAC_CAL_CACHE !== "undefined") TAC_CAL_CACHE.clear();
        } catch (e) {}
        return r;
      };
    }
    if (typeof expoActScene === "function") {
      const _eas = expoActScene;
      expoActScene = function (st) {
        const sc = _eas.apply(this, arguments);
        try {
          const A = st && EXPO_ACT[st.id];
          const c = sc && (sc.choices || []).find((x) => /전수/.test(x.title));
          if (A && c) c.desc += ` 전략 전투에서 '${A.icon} ${A.name}' 행동을 쓸 수 있게 된다.`;
        } catch (e) {}
        return sc;
      };
    }
    const css = document.createElement("style");
    css.textContent = ".tac-act.g-expo{border-color:#b0743a;box-shadow:inset 0 0 0 1px rgba(176,116,58,.35)}";
    (document.head || document.documentElement).appendChild(css);
  }

  /* ───────────────────────── 현상금 50억 이후의 상승 둔화 ───────────────────────── */
  // 어느 사건에서 현상금이 오르든, 50억 베리를 넘는 부분은 원래 상승폭의 15%만 반영한다
  const BOUNTY_SOFT_CAP = 5000000000,
    BOUNTY_OVER_RATE = 0.15;
  function dampBounty() {
    if (!p || typeof p.bounty !== "number") return;
    const ref = typeof p._bountyRef === "number" ? p._bountyRef : p.bounty;
    if (p.bounty > ref && p.bounty > BOUNTY_SOFT_CAP) {
      const base = Math.max(ref, BOUNTY_SOFT_CAP);
      p.bounty = Math.round(base + (p.bounty - base) * BOUNTY_OVER_RATE);
    }
    p._bountyRef = p.bounty;
  }
  {
    const _norm = normalize;
    normalize = function () {
      try {
        dampBounty();
      } catch (e) {}
      return _norm.apply(this, arguments);
    };
  }

  /* ───────────────────────── 새 인생 시작 · 게임 설명 ───────────────────────── */
  {
    const _begin = begin;
    begin = function () {
      const r = _begin.apply(this, arguments);
      // 랭킹 도전은 난이도 '보통'으로 고정
      try {
        if (p && p.flags && p.flags.rankingChallenge) p.difficulty = "normal";
      } catch (e) {}
      return r;
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
          d.innerHTML = `<summary style="cursor:pointer;font-weight:800">인연·습관·선택의 여파 (인생 서사 · 버전 ${window.LIFE_SAGA_VERSION})</summary><div class="small" style="margin-top:6px">
• <b>선택의 여파</b>: 중요한 선택을 하면 그 결과로 일어난 일이 바로 다음 장면으로 이어집니다. 다치면 누가 곁을 지키는지, 큰돈이 생기면 어떻게 쓰는지, 수배서가 붙으면 고향의 가족이 어떻게 반응하는지 이어서 결정합니다.<br>
• <b>처지에 맞는 사건</b>: 해적·해군·혁명군·현상금 사냥꾼·민간인·은퇴자마다, 그리고 항구·도시·사막·설원·하늘섬·와노쿠니·어인섬 등 사는 곳마다 다른 사건과 내용이 나옵니다.<br>
• <b>인연</b>: 인물들은 당신과의 <b>기억</b>을 쌓고, 친구는 연인·배우자가, 라이벌은 친구가 될 수 있습니다. 인물들도 해마다 결혼·출산·이사·이직·은퇴를 겪고, 자녀가 아이를 낳으면 손주가 생깁니다.<br>
• <b>올해의 초점 = 습관</b>: 최근 몇 해 동안 공부·운동·취미·가족·교류에 쓴 시간이 시험, 직업 제안, 대회, 노년의 건강, 가족 관계를 바꿉니다.<br>
• <b>돌아오는 인연</b>: 어린 날의 약속, 첫사랑, 은사, 도와준 친구, 평생의 라이벌, 제자는 수년~수십 년 뒤 다시 등장합니다.<br>
• <b>생애 단계·노화·세대</b>: 청소년기(13)·청년기(20)·중년기(35)·노년기(60)에 맞는 사건이 나오고, 60세 이후 체력 상한이 서서히 낮아집니다. 제자를 키우고 후계자를 지목할 수 있습니다.<br>
• <b>꿈 이후</b>: 꿈을 이루면 같은 사건을 반복하지 않고 재회·후계·가족·여행·유산의 후일담이 이어집니다.<br>
• <b>세계 침수</b>: 가까운 인연(관계 65 이상)이 많거나 배가 있으면 높은 곳으로 피난해 살아남을 수 있습니다.</div>`;
          box.insertBefore(d, close);
        }
      } catch (e) {}
      return r;
    };
  }
})();
