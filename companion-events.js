/* 동료와 관계 — 관계 스탯이 실제로 삶을 바꾸고, 곁의 동료가 위험한 순간에 당신을 살린다.
   팀 기획: "싸움에 지거나 상처가 생겼을 때 동료 누구누구가 살려줬습니다 같은 선택지를 넣자. 동료가 있으면 죽을 확률도 좀 떨구자."

   1) 동료: 살아 있는 인연 중 동료·친구·연인·배우자·제자·은인이면서 인연 50 이상이고 최근 8년 안에 만난 사람 (window.pickCompanion)
   2) 관계 스탯의 효과 (관계는 16세부터 해마다 1~3씩 줄어든다 — index.html annualDrift)
      - 관계 70 이상: 해마다 행복 +1, 다친 상태가 1년 빨리 낫는다(동료가 있을 때), 해마다 사망 위험 -5%
      - 관계 25 이하: 해마다 행복 -1, 사망 위험 +10% (위험할 때 도와줄 사람이 없음)
      - 동료가 있으면 해마다 사망 위험 -10% (돌봐 줄 사람이 있음)
      - 상인·상점 점원·요리사: 관계 70 이상이면 수입 +6%, 25 이하면 -5%
   3) 동료의 구조: 싸움에서 치명상을 입어 죽게 됐을 때, 곁의 동료가 구해 낼 수 있다(40~65%).
      구하면 건강 5~12로 살아남고 2년간 다친 상태, 그 동료와의 인연이 깊어진다.
   4) 동료 사건 30개: 아래 CB([...]) — 동료가 있을 때 18개, 없을 때 12개 (place-events.js의 회수 사건 장치, pool "companion")
   5) 동료의 대가 — 동료가 '공짜 이득'이 되지 않게
      - 함께 지내는 비용: 해마다 동료 한 명당 연봉의 1%(최대 3명)를 쓴다
      - 동료를 잃으면 더 아프다: 동료가 세상을 떠나면 기존 슬픔(행복 -8)에 행복 -6, 관계 -3이 더해진다
      - 동료가 빚·수배·징계에 휘말리거나 떠나려 하는 사건은 4)에 들어 있다
   6) 혼자인 길의 이득 — 동료가 없을 때만
      - 혼자 단련: 16~60세, 해마다 35% 확률로 전투력 +1
      - 일에 몰두: 수입 +3%
   임펠다운에 갇혀 있는 동안에는 2)·3)·5)·6)이 적용되지 않는다. */
(() => {
  "use strict";
  if (typeof p === "undefined") return;
  const COMP_ROLES = ["동료", "친구", "연인", "배우자", "제자", "은인", "단짝"];
  const inPrison = () => !!(p && p.flags && p.flags.impelDown);

  // 곁에 있는 동료 하나를 고른다. 인연이 깊을수록 잘 뽑힌다.
  function companions() {
    if (!p || !Array.isArray(p.npcs) || typeof npcsBy !== "function") return [];
    // 곁에 있다 = 인연 50 이상이고 최근 8년 안에 만난 사람. 오래 챙기지 않은 동료는 곁을 떠난 것으로 본다
    return npcsBy((n) => COMP_ROLES.includes(n.role) && (n.rel || 0) >= 50 && n.job !== "임펠 다운 수감자" && p.age - (n.lastSeen ?? n.metAge ?? p.age) <= 8);
  }
  window.pickCompanion = function () {
    const list = companions();
    if (!list.length) return null;
    const w = list.map((n) => Math.max(1, (n.rel || 0) - 40));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) if ((r -= w[i]) <= 0) return list[i];
    return list[0];
  };
  // 동료가 없을 때의 사건에서 새 동료를 들인다
  window.makeCompanion = function () {
    if (typeof makeNpc !== "function") return null;
    const aff = ["해적", "해군", "혁명군"].includes(p.status) ? p.status : "민간인";
    const n = makeNpc({ role: "동료", rel: ri(55, 65), aff, job: aff === "민간인" ? "민간인" : aff, age: realAge() + ri(-6, 6) });
    if (typeof npcStory === "function") npcStory(n, "외로운 시기에 곁으로 들어옴");
    return n;
  };

  // 2) 관계 스탯의 해마다 효과
  if (typeof annualDrift === "function") {
    const _ad = annualDrift;
    annualDrift = function () {
      const r = _ad.apply(this, arguments);
      try {
        if (!inPrison() && p.age >= 16) {
          if (p.relationship >= 70) {
            p.happiness += 1;
            // 돌봐 줄 사람이 있으면 다친 몸이 1년 빨리 낫는다
            if (p.flags.injuredUntil > p.age && companions().length) p.flags.injuredUntil -= 1;
          } else if (p.relationship <= 25) p.happiness -= 1;
          const cnt = companions().length;
          if (cnt) {
            // 5) 함께 지내는 비용: 동료 한 명당 연봉의 1% (최대 3명)
            const sal = typeof annualSalary === "function" ? annualSalary() : 0;
            if (sal > 0) p.money = Math.max(0, p.money - Math.round(sal * 0.01 * Math.min(3, cnt)));
          } else if (p.age <= 60 && Math.random() < 0.35) {
            // 6) 혼자 단련: 기댈 사람이 없으니 스스로 몸을 만든다
            p.combat += 1;
          }
          if (typeof normalize === "function") normalize();
        }
      } catch (e) {}
      return r;
    };
  }
  if (typeof deathRisk === "function") {
    const _dr = deathRisk;
    deathRisk = function () {
      const r = _dr.apply(this, arguments);
      try {
        if (inPrison() || p.age < 16) return r;
        let m = 1;
        if (companions().length) m -= 0.1;
        if (p.relationship >= 70) m -= 0.05;
        else if (p.relationship <= 25) m += 0.1;
        return r * m;
      } catch (e) {
        return r;
      }
    };
  }
  if (typeof annualSalary === "function") {
    const _as = annualSalary;
    annualSalary = function () {
      const s = _as.apply(this, arguments);
      try {
        if (!s || inPrison()) return s;
        const job = arguments[0] ?? p.job, track = p.careerTrack || job;
        let m = 1;
        if (["상인", "상점 점원", "요리사"].includes(track)) {
          if (p.relationship >= 70) m += 0.06;
          else if (p.relationship <= 25) m -= 0.05;
        }
        // 6) 일에 몰두: 곁에 동료가 없으면 수입 +3%
        if (!companions().length) m += 0.03;
        return m === 1 ? s : Math.round(s * m);
      } catch (e) {}
      return s;
    };
  }
  // 5) 동료를 잃은 슬픔: 동료가 세상을 떠나는 장면에 슬픔을 더한다
  if (typeof DELAYED === "object" && DELAYED && typeof DELAYED.npc_death === "function") {
    const _nd = DELAYED.npc_death;
    DELAYED.npc_death = function (d) {
      const sc = _nd.apply(this, arguments);
      try {
        const n = typeof npcById === "function" ? npcById(d.id) : null;
        if (sc && n && COMP_ROLES.includes(n.role) && (n.rel || 0) >= 50) {
          const eff = sc.effect;
          sc.effect = () => {
            if (typeof eff === "function") eff();
            p.happiness -= 6;
            p.relationship -= 3;
          };
          sc.body += `\n\n함께 지낸 시간만큼 빈자리가 컸습니다. 한동안 ${n.name}의 이름이 나오면 아무 말도 할 수 없었습니다.`;
        }
      } catch (e) {}
      return sc;
    };
  }

  // 3) 동료의 구조: 싸움에서 치명상을 입어 죽게 됐을 때
  if (typeof battle === "function") {
    const _bt = battle;
    battle = function (info) {
      const won = _bt.apply(this, arguments);
      try {
        if (won || inPrison() || (info && info.nonFatal)) return won;
        if (!(p.health <= 0) || !p.flags.deathCause) return won;
        const n = window.pickCompanion();
        if (!n) return won;
        const chance = Math.min(0.65, 0.4 + ((n.rel || 0) >= 80 ? 0.15 : 0) + (p.relationship >= 70 ? 0.1 : 0));
        if (Math.random() >= chance) return won;
        const foe = String((info && info.foe) || "적");
        delete p.flags.deathCause;
        p.health = ri(5, 12);
        p.flags.injuredUntil = Math.max(p.flags.injuredUntil || 0, p.age + 2);
        p.flags.f_saved_by_companion = true;
        n.rel = Math.min(100, (n.rel || 0) + 5);
        n.lastSeen = p.age;
        if (typeof npcStory === "function") npcStory(n, `${foe}${wa(foe)}의 싸움에서 쓰러진 당신을 구해 냄`);
        log(`동료 ${n.name}${ga(n.name)} 쓰러진 당신을 구해 냄`);
        const body = rand([
          `${foe}의 마지막 일격에 당신은 그대로 쓰러졌습니다. 정신을 차렸을 때, 당신은 ${n.name}의 등에 업혀 있었습니다. "아직 죽을 때 아니야." 숨이 찬 목소리가 귓가에 들렸습니다.`,
          `눈앞이 캄캄해지던 순간, 누군가 당신의 팔을 붙잡아 끌어냈습니다. ${n.name}${ga(n.name)} 피투성이가 된 당신을 안고 포위를 뚫었습니다. 며칠 뒤 눈을 떴을 때 ${n.name}${eun(n.name)} 곁에서 졸고 있었습니다.`,
          `쓰러진 당신 앞을 ${n.name}${ga(n.name)} 가로막았습니다. 상처를 입으면서도 끝까지 물러서지 않은 덕에, 당신은 겨우 목숨을 건졌습니다.`,
        ]);
        scenes.splice(sceneIndex + 2, 0, {
          essential: true,
          key: "companion_rescue_" + Math.random(),
          title: `${n.name}${ga(n.name)} 살려 낸 목숨`,
          body,
          choices: null,
          effect: () => {},
          summary: null, // 기록은 위 log()로 이미 남김
        });
      } catch (e) {
        console.error("companion rescue", e);
      }
      return won;
    };
  }
})();

/* ───────────── 동료가 곁에 있을 때 (18) ───────────── */
CB([
  /* ═════════════ 다쳤을 때 동료가 곁에 있음 (injured: true) ═════════════ */

  // ── 쓰러진 당신을 업고 빠져나옴 ──
  {
    key: "cmp_w_carry_out",
    pool: "companion",
    when: { companion: true, injured: true, minAge: 18 },
    title: "쓰러진 날의 등",
    body: "지난번에 다친 곳이 도져 당신은 인적 없는 산길에 무릎을 꿇었습니다. 흐려지는 눈앞으로 {동료|이} 달려와 등을 돌려 댑니다. \"업혀. 말은 나중에 해.\" 마을까지는 아직 멀고, {동료}의 숨도 이미 거칩니다.",
    choices: [
      { title: "등에 업혀 몸을 맡긴다", desc: "살아 나오지만 큰 빚을 진다",
        effect: { health: 10, npcRel: 8, happiness: -3, traits: { "신중": 1 },
                  npcStory: "쓰러진 동료를 업고 산길을 빠져나옴", log: "{동료}의 등에 업혀 산길을 빠져나옴" } },
      { title: "부축만 받으며 걷는다", desc: "자존심은 지키지만 상처가 벌어진다",
        effect: { health: -6, combat: 3, npcRel: 4, traits: { "용기": 1 },
                  log: "{동료}의 어깨에 기대 제 발로 걸어 나옴" },
        risk: { chance: 0.3, effect: { health: -8, log: "걷다가 상처가 다시 벌어짐" } } },
      { title: "사람을 불러 오라고 보낸다", desc: "동료는 지치지 않지만 홀로 남는다",
        effect: { health: -8, relationship: 5, npcRel: 10, memory: "혼자 기다린 산길의 어둠", traits: { "선량": 1 },
                  npcStory: "마을 사람들을 이끌고 되돌아옴", log: "{동료|을} 먼저 보내고 혼자 버티다 구조됨" },
        risk: { chance: 0.25, effect: { health: -8, log: "구조를 기다리다 상처가 곪음" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "해군의 포위를 뚫다 지난번 상처가 터져 당신은 부두 창고 뒤에 쓰러졌습니다. {동료|이} 당신을 들쳐 업으려 하지만, 배까지는 순찰대가 지키는 골목을 셋이나 지나야 합니다. 뒤에서 호루라기 소리가 가까워집니다.",
        choices: [
          { effect: { health: 10, npcRel: 8, happiness: -3, traits: { "신중": 1 },
                      npcStory: "쓰러진 동료를 업고 포위망을 빠져나옴", log: "{동료}의 등에 업혀 해군의 포위를 빠져나옴" } },
          { effect: { health: -6, combat: 3, npcRel: 4, standing: 2, traits: { "용기": 1 },
                      log: "{동료}의 어깨에 기대 골목을 뚫고 배로 돌아옴" },
            risk: { chance: 0.3, effect: { health: -8, bounty: "+20%", log: "골목에서 순찰대와 칼을 섞어 얼굴이 알려짐" } } },
          { title: "미끼가 되겠다며 등을 떠민다", desc: "동료는 살리지만 붙잡힐 수 있다",
            effect: { health: -8, relationship: 5, npcRel: 10, memory: "호루라기 소리 속 혼자의 골목", traits: { "선량": 1 },
                      npcStory: "미끼가 된 동료 덕에 배로 돌아감", log: "{동료|을} 먼저 배로 보내고 순찰대의 눈을 끎" },
            risk: { chance: 0.3, effect: { health: -10, bounty: "+20%", log: "순찰대에 둘러싸였다가 겨우 빠져나옴" } } }
        ]
      },
      "해군": {
        body: "작전 중 지난번 상처가 터져 당신은 대열에서 처졌습니다. 철수 신호가 울리는데 {동료|이} 명령을 어기고 되돌아와 당신을 둘러멥니다. 이대로 돌아가면 {동료}도 함께 명령 불복종으로 징계를 받을 수 있습니다.",
        choices: [
          { effect: { health: 10, npcRel: 8, standing: -3, traits: { "신중": 1 },
                      npcStory: "명령을 어기고 낙오한 동기를 업고 옴", log: "{동료}에게 업혀 철수선에 오름" } },
          {},
          { title: "명령대로 돌아가라고 한다", desc: "동료의 기록은 지키지만 홀로 남는다",
            effect: { health: -8, standing: 4, npcRel: 6, relationship: 3, memory: "철수 신호 뒤의 고요", traits: { "선량": 1 },
                      npcStory: "명령대로 철수했다가 구조대를 이끌고 옴", log: "{동료|을} 돌려보내고 홀로 구조를 기다림" } }
        ]
      },
      "*": {}
    }
  },

  // ── 열병·상처를 밤새 간호 ──
  {
    key: "cmp_w_fever_watch",
    pool: "companion",
    when: { companion: true, injured: true, minAge: 18 },
    title: "열병의 밤 곁자리",
    body: "지난번에 입은 상처가 덧나 사흘째 열이 내리지 않습니다. 눈을 뜰 때마다 {동료|이} 젖은 수건을 갈아 주고 있습니다. 그 눈 밑이 퀭한 걸 보니 {동료}도 사흘 내내 자지 못한 모양입니다.",
    choices: [
      { title: "곁에 있어 달라고 한다", desc: "빨리 낫지만 동료가 지친다",
        effect: { health: 10, npcRel: 6, relationship: 3, traits: { "신중": 1 },
                  npcStory: "열병에 걸린 동료 곁을 사흘 밤 지킴", log: "{동료}의 밤샘 간호로 열병을 넘김" },
        risk: { chance: 0.25, effect: { happiness: -4, relationship: -3, log: "{동료|이} 간호 끝에 열병이 옮아 앓아누움" } } },
      { title: "가서 자라고 돌려보낸다", desc: "동료는 쉬지만 혼자 앓는다",
        effect: { health: 5, skills: { "의술": 3 }, npcRel: 3, happiness: -3, memory: "혼자 갈아 댄 젖은 수건", traits: { "선량": 1 },
                  log: "{동료|을} 재우고 혼자 열을 견딤" } },
      { title: "의원을 부르자고 돈을 꺼낸다", desc: "확실하지만 주머니가 빈다",
        effect: { health: 12, money: -80000, npcRel: 2, traits: { "신중": 1 },
                  log: "의원을 불러 열을 내리고 {동료|을} 쉬게 함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "배 밑창 선실에서 지난번 상처가 덧나 사흘째 열이 오릅니다. 약 상자는 비었고, {동료|이} 바닷물에 적신 천으로 이마를 식혀 줍니다. 가장 가까운 항구에는 하필 해군 지부가 있습니다.",
        choices: [
          {},
          {},
          { title: "해군 지부 항구에 배를 댄다", desc: "약은 구하지만 눈에 띌 수 있다",
            effect: { health: 12, money: -80000, npcRel: 3, traits: { "용기": 1 },
                      log: "해군 지부가 있는 항구에 몰래 들어가 약을 구함" },
            risk: { chance: 0.3, effect: { bounty: "+20%", health: -4, log: "약방을 나서다 해군에게 얼굴을 들킴" } } }
        ]
      },
      "해군": {
        body: "의무실 침대에서 지난번 상처가 덧나 사흘째 열이 내리지 않습니다. 군의관은 하루 한 번 들를 뿐이고, 비번마다 {동료|이} 와서 물수건을 갈아 줍니다. {동료}의 근무 기록에는 벌써 지각이 둘이나 찍혔습니다.",
        choices: [
          { effect: { health: 10, npcRel: 7, standing: -3, traits: { "신중": 1 },
                      npcStory: "비번마다 의무실을 지키다 지각이 찍힘", log: "{동료}의 간호로 의무실에서 열병을 넘김" },
            risk: { chance: 0.25, effect: { relationship: -3, log: "{동료|이} 지각 때문에 당직 벌을 섬" } } },
          {},
          { title: "군의관에게 따로 부탁한다", desc: "확실하지만 윗선에 빚을 진다",
            effect: { health: 12, standing: -5, npcRel: 2, traits: { "신중": 1 },
                      log: "군의관에게 따로 부탁해 열을 내림" } }
        ]
      },
      "*": {}
    }
  },

  // ── 약값을 대신 냄 ──
  {
    key: "cmp_w_medicine_debt",
    pool: "companion",
    when: { companion: true, injured: true, minAge: 18 },
    title: "대신 치른 약값",
    body: "지난번 다친 곳을 치료한 의원에게 약값을 내러 갔더니 이미 다 치렀다고 합니다. 알고 보니 {동료|이} 아끼던 물건을 팔아 몰래 값을 치렀습니다. 집에 돌아오니 {동료|은} 모르는 척 딴청만 부립니다.",
    choices: [
      { title: "고맙다고 하고 받아 둔다", desc: "돈은 아끼지만 마음의 빚이 남는다",
        effect: { health: 6, npcRel: 6, happiness: -3, traits: { "신중": 1 },
                  log: "{동료|이} 대신 치른 약값을 고맙게 받아 둠" } },
      { title: "약값을 곱절로 갚는다", desc: "빚은 털지만 주머니가 빈다",
        effect: { money: -150000, npcRel: 3, relationship: 4, happiness: 3, traits: { "선량": 1 },
                  npcStory: "대신 치른 약값을 곱절로 돌려받음", log: "{동료|이} 낸 약값을 곱절로 갚음" } },
      { title: "팔아 버린 물건을 되찾아 온다", desc: "마음은 전하지만 몸이 고생한다",
        effect: { money: -100000, health: -4, npcRel: 12, memory: "되찾아 온 낡은 물건", traits: { "용기": 1 },
                  npcStory: "팔았던 아끼던 물건을 되돌려 받음", log: "{동료|이} 판 물건을 수소문해 되찾아 줌" },
        risk: { chance: 0.25, effect: { health: -6, log: "무리해 돌아다니다 상처가 덧남" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "입이 무겁기로 소문난 뒷골목 의원이 은신처까지 와서 상처를 꿰매 주고 갔습니다. 입막음 값까지 비싼 의원인데, {동료|이} 자기 몫을 몽땅 넘기고 값을 치렀습니다. {동료|은} 다음 몫에서 떼면 된다며 웃습니다.",
        choices: [
          {},
          {},
          { title: "다음 몫을 통째로 넘긴다", desc: "빚은 털지만 배 안에 말이 돈다",
            effect: { money: -120000, npcRel: 8, standing: -3, traits: { "선량": 1 },
                      npcStory: "다음 몫까지 통째로 넘겨받음", log: "다음 몫을 통째로 {동료}에게 넘김" } }
        ]
      },
      "해군": {
        body: "군 병원은 작전 중 부상이 아니라며 치료비 일부를 물렸습니다. 내러 가니 이미 치렀다고 합니다. {동료|이} 다음 달 봉급을 미리 당겨 대신 낸 것입니다. 봉급을 당긴 기록은 {동료}의 인사 서류에도 남습니다.",
        choices: [
          {},
          {},
          { title: "상관에게 사정을 올린다", desc: "돈은 돌려받지만 둘 다 눈에 띈다",
            effect: { health: 4, standing: -4, npcRel: 6, relationship: 3, traits: { "용기": 1 },
                      npcStory: "당겨 쓴 봉급을 군에서 돌려받음", log: "치료비 사정을 상관에게 올려 {동료}의 봉급을 되찾음" },
            risk: { chance: 0.3, effect: { standing: -4, log: "상관이 둘을 불러 군기를 따져 물음" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 대신 위험을 무릅씀 ──
  {
    key: "cmp_w_stand_in",
    pool: "companion",
    when: { companion: true, injured: true, minAge: 18 },
    title: "대신 나선 자리",
    body: "지난번에 다친 몸이 아직 말을 듣지 않는데, 오래전에 약속한 벼랑 약초 채집이 내일입니다. 품삯이 크고 빠지면 신용을 잃는 일입니다. 저녁 무렵 {동료|이} 말없이 당신의 밧줄과 망태를 챙겨 듭니다.",
    choices: [
      { title: "동료에게 맡긴다", desc: "돈은 들어오지만 동료가 위험하다",
        effect: { money: 80000, health: 4, npcRel: 5, traits: { "신중": 1 },
                  npcStory: "다친 동료 대신 위험한 일을 맡음", log: "{동료}에게 벼랑 일을 대신 맡김" },
        risk: { chance: 0.3, effect: { happiness: -6, relationship: -3, log: "{동료|이} 대신 나섰다가 크게 다쳐 돌아옴" } } },
      { title: "다친 몸으로 직접 간다", desc: "약속은 지키지만 몸이 버티지 못한다",
        effect: { money: 80000, health: -8, standing: 3, traits: { "용기": 1 },
                  log: "다친 몸을 이끌고 약속한 벼랑 일을 해냄" },
        risk: { chance: 0.3, effect: { health: -8, log: "벼랑에서 발을 헛디뎌 상처가 터짐" } } },
      { title: "위약금을 물고 쉰다", desc: "둘 다 무사하지만 돈과 신용을 잃는다",
        effect: { money: -60000, health: 6, reputation: -3, npcRel: 3, traits: { "신중": 1 },
                  log: "위약금을 물고 벼랑 일을 포기함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "지난번 싸움의 상처가 아물지 않았는데, 오늘 밤 해군 기지 정찰은 원래 당신 몫입니다. {동료|이} 당신의 망원경과 칼을 챙겨 들고 나섭니다. 정찰에 실패하면 배 전체가 위험해집니다.",
        choices: [
          { desc: "몸은 쉬지만 동료가 위험하다",
            effect: { standing: 3, health: 4, npcRel: 5, traits: { "신중": 1 },
                      npcStory: "다친 동료 대신 해군 기지를 정찰함", log: "{동료}에게 해군 기지 정찰을 대신 맡김" } },
          { desc: "제 몫은 하지만 몸이 버티지 못한다",
            effect: { standing: 5, health: -8, traits: { "용기": 1 },
                      log: "아물지 않은 상처로 해군 기지를 정찰함" },
            risk: { chance: 0.3, effect: { health: -8, bounty: "+20%", log: "정찰 중 들켜 해군에게 쫓김" } } },
          { title: "정찰을 미루자고 말한다", desc: "둘 다 무사하지만 체면이 깎인다",
            effect: { standing: -4, health: 6, npcRel: 3, traits: { "신중": 1 },
                      log: "다친 몸을 이유로 정찰을 미룸" } }
        ]
      },
      "해군": {
        body: "지난번 작전의 상처가 덜 나았는데, 내일 순찰선 출격 명단에 당신 이름이 있습니다. {동료|이} 명단을 바꿔 자기가 대신 타겠다고 합니다. 명단을 바꾸려면 상관의 허락이 필요하고, 순찰 구역에는 요즘 해적선이 잦습니다.",
        choices: [
          { desc: "몸은 쉬지만 동료가 위험하다",
            effect: { standing: -2, health: 4, npcRel: 5, traits: { "신중": 1 },
                      npcStory: "다친 동기 대신 순찰선에 오름", log: "출격 명단을 {동료|와} 바꿈" },
            risk: { chance: 0.3, effect: { happiness: -6, relationship: -3, log: "{동료|이} 순찰 중 해적과 맞붙어 다쳐 돌아옴" } } },
          { desc: "공적은 쌓지만 몸이 버티지 못한다",
            effect: { standing: 5, health: -8, traits: { "용기": 1 },
                      log: "덜 나은 몸으로 순찰선 출격에 나섬" },
            risk: { chance: 0.3, effect: { health: -8, log: "순찰 중 교전에서 상처가 다시 터짐" } } },
          { title: "군의관 소견서를 낸다", desc: "규정대로 빠지지만 공적을 놓친다",
            effect: { standing: -4, health: 6, npcRel: 2, traits: { "신중": 1 },
                      log: "군의관 소견서를 내고 출격에서 빠짐" } }
        ]
      },
      "*": {}
    }
  },

  // ── 회복 중 일을 대신 맡음 ──
  {
    key: "cmp_w_cover_work",
    pool: "companion",
    when: { companion: true, injured: true, minAge: 18 },
    title: "빈자리를 메운 손",
    body: "지난번 다친 몸으로 누워 있는 동안 일터의 일이 하나도 밀리지 않았습니다. 알고 보니 {동료|이} 제 일을 마치고 밤마다 당신 몫까지 해 온 것입니다. 일터 주인은 밀린 품삯을 누구에게 주어야 하느냐고 당신에게 묻습니다.",
    choices: [
      { title: "품삯을 동료에게 준다", desc: "공정하지만 생활이 빠듯하다",
        effect: { money: -60000, npcRel: 6, relationship: 3, traits: { "선량": 1 },
                  npcStory: "다친 동료의 일을 맡아 품삯을 받음", log: "밀린 품삯을 {동료}에게 넘김" } },
      { title: "품삯은 받고 한턱낸다", desc: "돈은 남지만 동료는 서운하다",
        effect: { money: 30000, happiness: 3, npcRel: -4, traits: { "야심": 1 },
                  log: "품삯을 받고 {동료}에게 술 한턱냄" } },
      { title: "덜 나은 몸으로 일터에 나간다", desc: "빚은 안 지지만 회복이 늦다",
        effect: { health: -6, money: 30000, skills: { "장사": 3 }, npcRel: 2, traits: { "용기": 1 },
                  log: "덜 나은 몸으로 일터에 복귀함" },
        risk: { chance: 0.25, effect: { health: -6, log: "무리한 끝에 다시 드러누움" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "지난번 상처로 누워 있는 동안 당신의 갑판 당번과 밤 망보기를 {동료|이} 모두 맡았습니다. 이틀에 한 번은 밤을 새운 셈입니다. 선원들 사이에선 이번 당신 몫의 배당을 {동료}에게 넘겨야 한다는 말이 나옵니다.",
        choices: [
          { title: "배당을 동료에게 넘긴다", desc: "공정하지만 주머니가 빈다",
            effect: { money: -100000, npcRel: 6, relationship: 3, standing: 2, traits: { "선량": 1 },
                      npcStory: "다친 동료의 당번을 서고 배당을 받음", log: "이번 배당을 {동료}에게 넘김" } },
          { title: "배당은 받고 술을 돌린다", desc: "몫은 챙기지만 뒷말이 돈다",
            effect: { money: 50000, happiness: 3, npcRel: -4, standing: -2, traits: { "야심": 1 },
                      log: "배당을 챙기고 선원들에게 술을 돌림" } },
          { title: "덜 나은 몸으로 갑판에 선다", desc: "빚은 안 지지만 회복이 늦다",
            effect: { health: -6, skills: { "항해술": 3 }, npcRel: 2, traits: { "용기": 1 },
                      log: "덜 나은 몸으로 갑판 당번에 복귀함" } }
        ]
      },
      "해군": {
        body: "지난번 부상으로 병가를 낸 동안 당신의 당직과 서류를 {동료|이} 모두 처리했습니다. 상관은 그 덕에 부대가 무사히 굴러갔다며, 이번 분기 표창 추천을 누구로 올릴지 당신에게 묻습니다.",
        choices: [
          { title: "표창을 동료에게 돌린다", desc: "공정하지만 내 공적은 비어 버린다",
            effect: { standing: -3, npcRel: 8, relationship: 3, traits: { "선량": 1 },
                      npcStory: "다친 동기 대신 일하고 표창을 받음", log: "분기 표창 추천을 {동료}에게 돌림" } },
          { title: "표창은 내가 받는다", desc: "경력은 쌓이지만 동료가 서운하다",
            effect: { standing: 6, npcRel: -6, traits: { "야심": 1 },
                      log: "{동료}의 수고에도 분기 표창을 받음" } },
          { title: "병가를 줄이고 복귀한다", desc: "빚은 안 지지만 회복이 늦다",
            effect: { health: -6, standing: 3, npcRel: 2, traits: { "용기": 1 },
                      log: "병가를 줄이고 덜 나은 몸으로 복귀함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 귀한 약을 구하러 대신 위험한 곳에 감 ──
  {
    key: "cmp_w_rare_herb",
    pool: "companion",
    when: { companion: true, injured: true, minAge: 18 },
    title: "벼랑 끝의 약초",
    body: "지난번에 다친 곳이 곪아, 의원은 바닷바람 부는 벼랑 끝에만 자라는 약초가 있어야 한다고 합니다. 새벽에 눈을 뜨니 {동료|이} 밧줄을 어깨에 걸고 문을 나서려 합니다. 어젯밤 그 벼랑에서 사람이 떨어졌다는 소문을 들었습니다.",
    choices: [
      { title: "동료를 믿고 기다린다", desc: "약은 오지만 동료가 다칠 수 있다",
        effect: { health: 12, npcRel: 6, traits: { "신중": 1 },
                  npcStory: "벼랑 끝에서 약초를 따 옴", log: "{동료|이} 벼랑에서 따 온 약초로 상처가 아묾" },
        risk: { chance: 0.3, effect: { relationship: -3, happiness: -5, log: "{동료|이} 약초를 따다 벼랑에서 미끄러져 다침" } } },
      { title: "절뚝이며 따라나선다", desc: "곁을 지키지만 몸이 더 상한다",
        effect: { health: 4, npcRel: 10, memory: "새벽 벼랑의 밧줄 한 가닥", traits: { "용기": 1 },
                  npcStory: "다친 동료와 함께 벼랑에 오름", log: "{동료|와} 함께 벼랑에 올라 약초를 땀" },
        risk: { chance: 0.3, effect: { health: -8, log: "벼랑길에서 넘어져 상처가 다시 터짐" } } },
      { title: "비싼 약을 사겠다고 붙잡는다", desc: "안전하지만 돈이 크게 든다",
        effect: { health: 10, money: -150000, npcRel: -3, traits: { "신중": 1 },
                  log: "{동료|을} 붙잡고 약방에서 비싼 약을 삼" } }
    ],
    by: {
      "해적|혁명군": {
        body: "지난번 상처가 곪았는데 배의 약 상자는 비었습니다. 지나온 무인도 동굴에 상처를 낫게 하는 이끼가 자란다며 {동료|이} 작은 보트를 내리려 합니다. 그 섬 근처에는 바다왕류가 자주 나타납니다.",
        choices: [
          { risk: { chance: 0.3, effect: { relationship: -3, happiness: -5, log: "{동료|이} 바다왕류에 쫓겨 보트를 잃고 돌아옴" } } },
          { effect: { health: 4, npcRel: 10, memory: "무인도 동굴의 푸른 이끼", traits: { "용기": 1 },
                      npcStory: "다친 동료와 함께 무인도 동굴에 다녀옴", log: "{동료|와} 보트를 저어 무인도의 이끼를 땀" },
            risk: { chance: 0.3, effect: { health: -8, log: "동굴 바위에 미끄러져 상처가 다시 터짐" } } },
          { title: "다음 항구까지 버틴다", desc: "아무도 위험하지 않지만 오래 앓는다",
            effect: { health: -6, combat: 2, npcRel: -3, traits: { "신중": 1 },
                      log: "약 없이 다음 항구까지 상처를 버팀" } }
        ]
      },
      "해군": {
        body: "지난번 상처가 곪아, 군의관은 본부 약품고의 귀한 약이 필요하다고 합니다. 일반 병사에겐 좀처럼 내주지 않는 약입니다. {동료|이} 창고 당번과 안면이 있다며 슬쩍 빼 오겠다고 나섭니다.",
        choices: [
          { title: "동료에게 맡긴다", desc: "약은 오지만 동료가 징계받을 수 있다",
            effect: { health: 12, npcRel: 6, traits: { "신중": 1 },
                      npcStory: "약품고에서 귀한 약을 몰래 빼 옴", log: "{동료|이} 빼 온 귀한 약으로 상처가 아묾" },
            risk: { chance: 0.3, effect: { standing: -5, relationship: -3, log: "{동료|이} 약품을 빼낸 일로 징계를 받음" } } },
          { title: "정식으로 불출을 신청한다", desc: "규정대로지만 오래 걸린다",
            effect: { health: 6, standing: 2, npcRel: -2, traits: { "신중": 1 },
                      log: "귀한 약을 정식으로 신청해 기다림" } },
          { desc: "규정 안이지만 돈이 크게 든다" }
        ]
      },
      "*": {}
    }
  },

  // ── 재활을 붙잡아 줌 ──
  {
    key: "cmp_w_rehab",
    pool: "companion",
    when: { companion: true, injured: true, minAge: 18 },
    title: "다시 걷는 연습",
    body: "지난번 다친 몸은 아물었지만 예전처럼 움직이지 않습니다. {동료|이} 매일 아침 당신을 끌어내 걷고 뛰는 연습을 시킵니다. 오늘 {동료|은} 언덕 너머까지 가 보자고 하지만, 다리는 벌써 떨리고 있습니다.",
    choices: [
      { title: "동료의 속도를 따른다", desc: "빨리 돌아오지만 다시 다칠 수 있다",
        effect: { health: 8, combat: 4, npcRel: 5, traits: { "용기": 1 },
                  npcStory: "매일 아침 동료의 재활을 붙잡아 줌", log: "{동료}의 재촉 속에 몸을 되찾음" },
        risk: { chance: 0.3, effect: { health: -10, log: "무리한 연습에 옛 상처가 다시 찢어짐" } } },
      { title: "내 속도로 하겠다고 한다", desc: "안전하지만 동료가 서운해한다",
        effect: { health: 8, skills: { "의술": 2 }, npcRel: -4, traits: { "신중": 1 },
                  log: "{동료}의 재촉을 물리고 천천히 몸을 살핌" } },
      { title: "연습 대신 함께 낚시를 간다", desc: "마음은 풀리지만 몸은 더디다",
        effect: { happiness: 6, relationship: 4, npcRel: 6, health: 3, memory: "재활을 빼먹은 낚시터", traits: { "선량": 1 },
                  npcStory: "재활 대신 낚싯대를 함께 드리움", log: "재활 대신 {동료|와} 낚시를 다녀옴" } }
    ],
    by: {
      "해적|혁명군": {
        body: "지난번 상처는 아물었지만 칼끝이 예전처럼 서지 않습니다. 흔들리는 갑판 위에서 {동료|이} 목검을 들고 매일 대련을 청합니다. 다음 항로에선 해군 군함과 마주칠지도 모르는데, 당신의 팔은 벌써 묵직하게 저려 옵니다.",
        choices: [
          { title: "매일 대련을 받는다", desc: "칼은 돌아오지만 다시 다칠 수 있다",
            effect: { health: 8, skills: { "검술": 4 }, npcRel: 5, traits: { "용기": 1 },
                      npcStory: "매일 갑판에서 동료와 대련함", log: "{동료|와}의 대련으로 칼끝을 되찾음" } },
          {},
          { title: "대련 대신 뱃노래를 부른다", desc: "마음은 풀리지만 칼은 무디다",
            effect: { happiness: 6, relationship: 4, npcRel: 6, health: 3, memory: "갑판 위 둘만의 뱃노래", traits: { "선량": 1 },
                      npcStory: "대련 대신 밤새 뱃노래를 부름", log: "대련 대신 {동료|와} 뱃노래를 부름" } }
        ]
      },
      "해군": {
        body: "지난번 상처는 아물었지만 복귀 체력 검정이 한 달 뒤입니다. 떨어지면 후방 부서로 밀려납니다. {동료|이} 일과가 끝날 때마다 연병장에서 당신의 구보를 붙잡아 줍니다. 오늘은 한 바퀴를 더 돌자는데, 무릎이 벌써 시큰거립니다.",
        choices: [
          {},
          { desc: "안전하지만 검정이 걱정이다",
            effect: { health: 8, skills: { "의술": 2 }, npcRel: -4, standing: -3, traits: { "신중": 1 },
                      log: "{동료}의 구보를 물리고 천천히 몸을 살핌" } },
          { title: "후방 부서도 괜찮다고 한다", desc: "마음은 편하지만 길이 좁아진다",
            effect: { happiness: 6, standing: -5, npcRel: 4, relationship: 3, traits: { "선량": 1 },
                      npcStory: "후방으로 가는 동기를 웃으며 배웅함", log: "체력 검정 대신 후방 부서를 받아들임" } }
        ]
      },
      "*": {}
    }
  },

  // ── 자책하는 동료 ──
  {
    key: "cmp_w_guilt_scar",
    pool: "companion",
    when: { companion: true, injured: true, minAge: 18 },
    title: "흉터 앞의 사과",
    body: "붕대를 푸는 날, {동료|이} 당신의 새 흉터를 보더니 고개를 숙입니다. 그날 자기가 한 발만 빨랐어도 당신이 다치지 않았을 거라고 합니다. 며칠째 밥도 제대로 먹지 않았다는 이야기를 들었습니다.",
    choices: [
      { title: "네 탓이 아니라고 다독인다", desc: "동료는 풀리지만 내 속은 남는다",
        effect: { npcRel: 8, relationship: 4, happiness: -3, traits: { "선량": 1 },
                  npcStory: "자책하던 날 다친 동료에게 용서받음", log: "자책하는 {동료|을} 다독여 줌" } },
      { title: "흉터를 농담거리로 만든다", desc: "분위기는 풀리지만 진심은 묻힌다",
        effect: { happiness: 5, npcRel: 3, relationship: 2, memory: "웃음거리가 된 흉터", traits: { "신중": 1 },
                  log: "새 흉터를 두고 {동료|와} 농담을 주고받음" },
        risk: { chance: 0.25, effect: { relationship: -4, log: "{동료|이} 농담 뒤에서 혼자 술을 마심" } } },
      { title: "그날 일을 따져 묻는다", desc: "교훈은 남지만 사이가 서먹하다",
        effect: { knowledge: 3, combat: 3, npcRel: -6, traits: { "용기": 1 },
                  npcStory: "그날 늦은 까닭을 털어놓음", log: "그날 {동료|이} 늦은 까닭을 따져 들음" } }
    ],
    by: {
      "해적|혁명군": {
        body: "선실에서 붕대를 푸는데 {동료|이} 문간에서 머뭇거립니다. 그날 해군의 포탄이 떨어질 때 망을 보던 게 자기였다며, 배에서 내리겠다고 합니다. 문 옆에는 이미 꾸려 둔 보따리가 놓여 있습니다.",
        choices: [
          { title: "보따리를 도로 풀어 준다", desc: "동료는 남지만 내 속은 남는다",
            effect: { npcRel: 10, relationship: 4, happiness: -3, traits: { "선량": 1 },
                      npcStory: "배에서 내리려다 다친 동료에게 붙잡힘", log: "배에서 내리려는 {동료}의 보따리를 풀어 줌" } },
          {},
          { title: "선원들 앞에서 그날을 따진다", desc: "규율은 서지만 동료가 무너진다",
            effect: { standing: 4, knowledge: 2, npcRel: -8, traits: { "용기": 1 },
                      npcStory: "선원들 앞에서 망보기 실수를 추궁당함", log: "선원들 앞에서 그날 망보기의 잘못을 따짐" } }
        ]
      },
      "해군": {
        body: "의무실에서 붕대를 푸는 날, {동료|이} 경위서 한 장을 들고 옵니다. 그날 자기 판단이 늦어 당신이 다쳤다고 스스로 적었습니다. 이 경위서가 올라가면 {동료}의 진급은 한 해 늦어집니다.",
        choices: [
          { title: "경위서를 찢어 버린다", desc: "동료는 지키지만 기록을 덮는다",
            effect: { npcRel: 10, relationship: 3, standing: -3, traits: { "선량": 1 },
                      npcStory: "스스로 쓴 경위서를 찢겨 진급을 지킴", log: "{동료}의 경위서를 찢어 버림" },
            risk: { chance: 0.2, effect: { standing: -5, log: "찢은 경위서 일이 상관 귀에 들어감" } } },
          {},
          { title: "경위서를 그대로 올린다", desc: "원칙대로지만 사이가 식는다",
            effect: { standing: 5, npcRel: -8, traits: { "신중": 1 },
                      npcStory: "스스로 쓴 경위서로 진급이 늦어짐", log: "{동료}의 경위서를 그대로 올림" } }
        ]
      },
      "*": {}
    }
  },

  /* ═════════════ 평소 동료가 곁에 있음 ═════════════ */

  // ── 위험한 순간 동료가 막아 줌 ──
  {
    key: "cmp_w_blocked_blade",
    pool: "companion",
    when: { companion: true, minAge: 18 },
    title: "등 뒤의 칼날",
    body: "{여기}의 밤길에서 술 취한 불량배가 당신의 등 뒤로 칼을 휘두릅니다. 돌아보기도 전에 {동료|이} 몸을 던져 칼을 막았고, 그 팔에서 피가 흐릅니다. 불량배는 골목 끝으로 달아나고 있습니다.",
    choices: [
      { title: "달아난 놈을 끝까지 쫓는다", desc: "갚아 주지만 동료를 두고 간다",
        effect: { combat: 4, standing: 3, npcRel: -4, traits: { "용기": 1 },
                  log: "{동료|을} 벤 불량배를 끝까지 쫓아 붙잡음" },
        risk: { chance: 0.3, effect: { health: -8, log: "골목 끝에서 패거리와 맞붙어 다침" } } },
      { title: "동료의 팔부터 싸맨다", desc: "곁을 지키지만 놈은 놓친다",
        effect: { npcRel: 8, relationship: 3, skills: { "의술": 2 }, happiness: -3, traits: { "선량": 1 },
                  npcStory: "몸으로 칼을 막아 동료를 지킴", log: "칼을 막은 {동료}의 팔을 싸매 줌" } },
      { title: "이 빚을 꼭 갚겠다고 맹세한다", desc: "마음은 전하지만 약속이 무겁다",
        effect: { npcRel: 12, happiness: -2, memory: "피 묻은 소매와 맹세", traits: { "신중": 1 },
                  npcStory: "칼을 막아 준 대가로 굳은 맹세를 받음", log: "목숨 빚을 꼭 갚겠다고 {동료}에게 맹세함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "보급을 마치고 돌아오는 길, 매복한 현상금 사냥꾼이 당신의 등에 칼을 내리꽂습니다. {동료|이} 몸을 던져 칼날을 받아 냈고, 사냥꾼은 수배서 뭉치를 흘리며 숲으로 달아납니다. 그 뭉치에는 {동료}의 얼굴도 있습니다.",
        choices: [
          { title: "사냥꾼을 숲까지 쫓는다",
            effect: { combat: 4, standing: 4, bounty: "+20%", npcRel: -4, traits: { "용기": 1 },
                      log: "매복한 사냥꾼을 숲까지 쫓아 쓰러뜨림" },
            risk: { chance: 0.3, effect: { health: -8, log: "숲속에서 사냥꾼 패거리에게 둘러싸여 다침" } } },
          {},
          { effect: { npcRel: 12, happiness: -2, memory: "수배서 뭉치와 피 묻은 소매", traits: { "신중": 1 },
                      npcStory: "칼을 막아 준 대가로 굳은 맹세를 받음", log: "목숨 빚을 꼭 갚겠다고 {동료}에게 맹세함" } }
        ]
      },
      "해군": {
        body: "해적 소탕 작전 중, 쓰러진 줄 알았던 해적이 당신의 등 뒤에서 칼을 휘두릅니다. {동료|이} 대열을 벗어나 몸으로 막았고, 해적은 부두 쪽으로 달아납니다. 대열을 벗어난 일은 그대로 보고서에 오를 것입니다.",
        choices: [
          { title: "달아난 해적을 쫓는다", desc: "공적은 얻지만 동료를 두고 간다",
            effect: { combat: 4, standing: 5, npcRel: -4, traits: { "용기": 1 },
                      log: "달아나던 해적을 부두에서 붙잡음" },
            risk: { chance: 0.3, effect: { health: -8, log: "부두에서 해적 잔당과 맞붙어 다침" } } },
          {},
          { title: "보고서에 동료의 공을 적는다", desc: "동료를 감싸지만 내 판단도 따져진다",
            effect: { npcRel: 10, standing: -3, relationship: 3, traits: { "선량": 1 },
                      npcStory: "대열 이탈이 공로로 바뀌어 기록됨", log: "보고서에 {동료|이} 대열을 벗어난 까닭을 적음" } }
        ]
      },
      "*": {}
    }
  },

  // ── 동료가 빚·현상금·징계에 휘말림 ──
  {
    key: "cmp_w_companion_debt",
    pool: "companion",
    when: { companion: true, minAge: 18 },
    title: "동료의 빚 문서",
    body: "{동료|이} 요즘 당신을 피한다 싶더니, 오늘 덩치 둘이 찾아와 {동료}의 빚 문서를 흔듭니다. 노름빚이라고 합니다. 이달 안에 갚지 못하면 {동료}의 일터로 찾아가 판을 엎겠다고 으름장을 놓습니다.",
    choices: [
      { title: "빚을 대신 갚아 준다", desc: "동료는 구하지만 큰돈이 나간다",
        effect: { money: -300000, npcRel: 10, relationship: 3, traits: { "선량": 1 },
                  npcStory: "노름빚을 대신 갚아 줌", log: "{동료}의 노름빚을 대신 갚아 줌" } },
      { title: "함께 밤일을 해 갚게 한다", desc: "버릇은 고치지만 둘 다 고생한다",
        effect: { health: -5, money: -60000, npcRel: 4, skills: { "장사": 3 }, traits: { "신중": 1 },
                  npcStory: "밤일을 해 노름빚을 나눠 갚음", log: "{동료|와} 밤일을 해 빚을 나눠 갚음" } },
      { title: "네 빚은 네가 갚으라고 한다", desc: "내 돈은 지키지만 동료가 멀어진다",
        effect: { npcRel: -10, relationship: -2, traits: { "신중": 1 },
                  npcStory: "빚은 스스로 갚으라는 말을 들음", log: "{동료}에게 빚은 스스로 갚으라고 선을 그음" },
        risk: { chance: 0.3, effect: { health: -6, log: "덩치들이 당신에게도 주먹을 휘두름" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "항구 게시판에 {동료}의 수배서가 새로 붙었습니다. 지난 작전에서 당신이 시킨 일 때문인데, 이름은 {동료}만 올라 있습니다. 이 항구의 현상금 사냥꾼들이 벌써 배 근처를 기웃거립니다.",
        choices: [
          { title: "내 이름을 일부러 퍼뜨린다", desc: "짐을 나누지만 내가 표적이 된다",
            effect: { bounty: "+30%", standing: 5, npcRel: 10, traits: { "용기": 1 },
                      npcStory: "혼자 지던 수배의 짐을 나눠 받음", log: "일부러 이름을 퍼뜨려 {동료}의 짐을 나눠 짐" },
            risk: { chance: 0.3, effect: { health: -8, log: "사냥꾼 무리의 습격을 받아 다침" } } },
          { title: "동료를 다음 섬까지 숨긴다", desc: "안전하지만 배의 일정이 밀린다",
            effect: { money: -100000, npcRel: 5, standing: -3, traits: { "신중": 1 },
                      npcStory: "짐칸 바닥에 숨어 항구를 빠져나감", log: "수배된 {동료|을} 짐칸에 숨겨 항구를 빠져나감" } },
          { title: "동료를 잠시 배에서 내린다", desc: "배는 지키지만 동료가 서운하다",
            effect: { npcRel: -10, relationship: -3, standing: 3, traits: { "야심": 1 },
                      npcStory: "수배 끝에 배에서 잠시 내려짐", log: "수배된 {동료|을} 잠시 배에서 내리게 함" } }
        ]
      },
      "해군": {
        body: "{동료|이} 근무 중 해적 포로를 놓쳤다는 혐의로 징계 위원회에 불려 갑니다. 그날 같은 조였던 당신은 포로가 당신 쪽 문으로 빠져나간 걸 알고 있습니다. 위원회는 내일 당신의 증언을 듣습니다.",
        choices: [
          { title: "내 실수였다고 증언한다", desc: "동료는 살지만 내 기록에 흠이 남는다",
            effect: { standing: -7, npcRel: 12, relationship: 3, traits: { "선량": 1 },
                      npcStory: "징계 위원회에서 증언 덕에 풀려남", log: "포로를 놓친 책임을 나눠 지겠다고 증언함" } },
          { title: "본 대로만 짧게 말한다", desc: "거짓은 없지만 아무도 못 지킨다",
            effect: { standing: 2, npcRel: -4, happiness: -3, traits: { "신중": 1 },
                      log: "위원회에서 본 대로만 짧게 증언함" } },
          { title: "동료의 잘못이라고 말한다", desc: "내 기록은 깨끗하지만 사이가 끝난다",
            effect: { standing: 5, npcRel: -14, relationship: -4, traits: { "야심": 1 },
                      npcStory: "동료의 증언으로 징계를 받음", log: "위원회에서 {동료}에게 책임을 돌림" } }
        ]
      },
      "*": {}
    }
  },

  // ── 동료가 다른 길을 제안 ──
  {
    key: "cmp_w_other_road",
    pool: "companion",
    when: { companion: true, minAge: 20, maxAge: 55 },
    title: "갈림길의 제안",
    body: "{동료|이} 지도 한 장을 펼칩니다. 먼 섬에 새 마을이 생겨, 한 철 동안 개간을 도우면 땅 한 뙈기를 나눠 준다고 합니다. 함께 가자는 눈빛인데, 그동안 {여기}의 일과 손님은 남에게 넘겨야 합니다.",
    choices: [
      { title: "함께 개간을 떠난다", desc: "새로 시작하지만 쌓은 것이 흔들린다",
        effect: { happiness: 5, npcRel: 8, standing: -3, skills: { "제작": 3 }, memory: "지도 위에 찍은 새 섬", traits: { "용기": 1 },
                  npcStory: "함께 먼 섬 개간에 나섬", log: "{동료|와} 한 철 동안 먼 섬 개간을 다녀옴" },
        risk: { chance: 0.25, effect: { money: -60000, log: "나눠 준다던 땅 문서가 엉터리로 드러남" } } },
      { title: "여기 남자고 설득한다", desc: "자리는 지키지만 동료가 아쉬워한다",
        effect: { standing: 3, money: 30000, npcRel: -5, traits: { "신중": 1 },
                  log: "{동료|을} 설득해 {여기}에 남음" } },
      { title: "동료 몫 일을 맡고 보내 준다", desc: "동료는 떠나고 내 일은 두 배가 된다",
        effect: { money: 60000, health: -4, npcRel: 6, memory: "부두에서 흔든 손", traits: { "선량": 1 },
                  npcStory: "남은 일을 맡기고 홀로 개간을 다녀옴", log: "{동료}의 일을 맡아 주고 개간길을 배웅함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{동료|이} 낡은 해도 한 장을 펼칩니다. 아무도 모르는 섬에서 한 철만 칼을 내려놓고 쉬자고 합니다. 그동안 배는 다른 이에게 맡겨야 하고, 바다에서는 당신의 이름이 조금씩 잊힐 것입니다.",
        choices: [
          { title: "한 철 섬에서 함께 쉰다", desc: "푹 쉬지만 이름이 잊혀 간다",
            effect: { happiness: 8, health: 5, standing: -5, npcRel: 8, memory: "아무도 모르는 섬의 오두막", traits: { "신중": 1 },
                      npcStory: "한 철 동안 외딴섬에서 함께 쉼", log: "{동료|와} 외딴섬에서 한 철을 쉬다 돌아옴" },
            risk: { chance: 0.25, effect: { money: -100000, log: "자리를 비운 사이 배의 금고가 털림" } } },
          { title: "더 큰 바다로 가자고 설득한다", desc: "이름은 커지지만 동료는 지쳐 간다",
            effect: { standing: 4, bounty: "+20%", npcRel: -5, traits: { "야심": 1 },
                      log: "{동료|을} 설득해 더 험한 항로로 나섬" } },
          { title: "동료만 섬에 보내 준다", desc: "동료는 쉬고 내 일은 두 배가 된다",
            effect: { health: -4, standing: 2, npcRel: 6, memory: "멀어지는 작은 보트", traits: { "선량": 1 },
                      npcStory: "홀로 외딴섬에서 한 철을 쉼", log: "{동료|을} 외딴섬에 보내고 혼자 배를 지킴" } }
        ]
      },
      "해군": {
        body: "{동료|이} 전출 신청서 두 장을 내밉니다. 조용한 변방 지부에 자리가 났는데, 둘이 함께 가면 관사도 따로 준다고 합니다. 당신 앞에는 다음 달 본부의 진급 심사가 기다리고 있습니다.",
        choices: [
          { title: "함께 변방 지부로 간다", desc: "편하지만 진급은 멀어진다",
            effect: { happiness: 6, standing: -5, npcRel: 8, memory: "변방 지부의 낡은 관사", traits: { "선량": 1 },
                      npcStory: "함께 변방 지부로 전출함", log: "{동료|와} 함께 변방 지부 전출을 신청함" } },
          { title: "진급 심사에 남자고 설득한다", desc: "길은 열리지만 동료가 아쉬워한다",
            effect: { standing: 5, npcRel: -5, traits: { "야심": 1 },
                      log: "{동료|을} 설득해 본부에 남아 진급 심사를 봄" } },
          { title: "동료만 보내 준다", desc: "서로의 길을 지키지만 곁이 빈다",
            effect: { happiness: -4, standing: 3, npcRel: 5, memory: "전출선이 떠난 부두", traits: { "신중": 1 },
                      npcStory: "홀로 변방 지부로 전출함", log: "{동료}의 전출을 배웅하고 본부에 남음" } }
        ]
      },
      "*": {}
    }
  },

  // ── 동료가 떠나려 함 ──
  {
    key: "cmp_w_farewell_bag",
    pool: "companion",
    when: { companion: true, minAge: 18 },
    title: "꾸려 둔 보따리",
    body: "새벽에 물을 마시러 나왔다가 {동료}의 방 앞에 꾸려 둔 보따리를 봅니다. 요즘 일에만 매달려 말 한마디 제대로 나누지 못했다는 걸 떠올립니다. 아침이 밝으면 {동료|은} 아무 말 없이 길을 나설 것 같습니다.",
    choices: [
      { title: "문을 두드려 붙잡는다", desc: "곁에 남지만 일을 줄여야 한다",
        effect: { npcRel: 10, relationship: 4, money: -60000, traits: { "용기": 1 },
                  npcStory: "떠나려던 새벽에 붙잡혀 남음", log: "떠나려는 {동료|을} 붙잡고 일을 줄이기로 함" } },
      { title: "모른 척 아침을 기다린다", desc: "하던 일은 지키지만 멀어질 수 있다",
        effect: { npcRel: -2, money: 40000, happiness: -3, traits: { "신중": 1 },
                  log: "보따리를 보고도 {동료}의 선택을 기다림" },
        risk: { chance: 0.4, effect: { relationship: -5, happiness: -5, log: "{동료|이} 한 달 넘게 돌아오지 않음" } } },
      { title: "보따리에 편지를 넣어 둔다", desc: "마음은 남기지만 말로는 못 한다",
        effect: { npcRel: 6, happiness: 2, memory: "보따리 속 접은 편지", traits: { "선량": 1 },
                  npcStory: "떠나려던 보따리에서 편지를 발견함", log: "{동료}의 보따리에 몰래 편지를 넣어 둠" },
        risk: { chance: 0.3, effect: { relationship: -4, log: "편지를 읽고도 {동료|이} 한 철 떠나 있음" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "밤 당번을 서다 작은 보트에 실린 {동료}의 보따리를 봅니다. 요즘 이름을 키우느라 무리한 항로만 고집했다는 걸 떠올립니다. 새벽 안개가 끼면 {동료|은} 보트를 내릴 것 같습니다.",
        choices: [
          { title: "보트 앞에서 붙잡는다", desc: "곁에 남지만 항로를 바꿔야 한다",
            effect: { npcRel: 10, relationship: 4, standing: -3, traits: { "용기": 1 },
                      npcStory: "보트를 내리려던 새벽에 붙잡혀 남음", log: "떠나려는 {동료|을} 붙잡고 무리한 항로를 접음" } },
          { title: "모른 척 당번을 마친다" },
          {}
        ]
      },
      "해군": {
        body: "{동료}의 책상 위에 전출 신청서가 놓여 있습니다. 요즘 공적을 쌓느라 {동료|을} 위험한 임무에만 데려갔다는 걸 떠올립니다. 신청서는 내일 아침 인사과로 올라가고, 한번 올라가면 되돌리기 어렵습니다.",
        choices: [
          { title: "신청서를 들고 찾아간다", desc: "곁에 남지만 위험한 임무를 줄여야 한다",
            effect: { npcRel: 10, relationship: 4, standing: -3, traits: { "용기": 1 },
                      npcStory: "전출 신청 전날 밤 붙잡혀 남음", log: "전출하려는 {동료|을} 붙잡고 위험한 임무를 줄임" } },
          { title: "모른 척 내일을 기다린다",
            risk: { chance: 0.4, effect: { relationship: -5, happiness: -5, log: "{동료}의 전출이 결정되어 한동안 떨어짐" } } },
          { title: "신청서 밑에 쪽지를 끼운다",
            effect: { npcRel: 6, happiness: 2, memory: "전출 신청서 밑의 쪽지", traits: { "선량": 1 },
                      npcStory: "전출 신청서 밑에서 쪽지를 발견함", log: "{동료}의 전출 신청서 밑에 쪽지를 끼워 둠" },
            risk: { chance: 0.3, effect: { relationship: -4, log: "쪽지를 읽고도 {동료|이} 한동안 전출을 떠남" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 동료와 공을 다툼 ──
  {
    key: "cmp_w_credit",
    pool: "companion",
    when: { companion: true, minAge: 18 },
    title: "누구의 공인가",
    body: "당신과 {동료|이} 함께 맡은 큰 의뢰가 잘 끝났습니다. 그런데 의뢰인은 당신만 불러 사례금을 건네며 다음 일도 당신에게만 맡기겠다고 합니다. 실은 결정적인 수를 낸 건 {동료}였습니다.",
    choices: [
      { title: "사례금을 반으로 나눈다", desc: "공정하지만 다음 일은 장담 못 한다",
        effect: { money: 100000, npcRel: 6, relationship: 2, traits: { "선량": 1 },
                  npcStory: "큰 의뢰의 사례금을 반으로 나눠 받음", log: "의뢰 사례금을 {동료|와} 반씩 나눔" } },
      { title: "의뢰인에게 동료의 공을 말한다", desc: "동료는 빛나지만 내 몫은 준다",
        effect: { money: 60000, npcRel: 10, standing: -3, traits: { "신중": 1 },
                  npcStory: "의뢰인에게 공을 인정받아 일을 따냄", log: "의뢰인에게 {동료}의 공을 밝힘" } },
      { title: "말없이 혼자 받는다", desc: "돈과 자리는 얻지만 동료가 안다",
        effect: { money: 250000, standing: 4, npcRel: -8, relationship: -3, traits: { "야심": 1 },
                  npcStory: "큰 의뢰의 공을 빼앗김", log: "{동료}의 몫까지 사례금을 혼자 받음" } }
    ],
    by: {
      "해적|혁명군": {
        body: "당신과 {동료|이} 함께 정부 수송선을 덮쳐 큰 짐을 빼 왔습니다. 동료들은 당신의 이름을 외치지만, 해군의 눈을 따돌린 건 {동료}의 꾀였습니다. 이대로라면 수배서에는 당신 이름만 굵게 실릴 것입니다.",
        choices: [
          { title: "몫을 반으로 나눈다", desc: "공정하지만 내 이름은 덜 난다",
            effect: { money: 150000, npcRel: 6, relationship: 2, traits: { "선량": 1 },
                      npcStory: "수송선 습격의 몫을 반으로 나눠 받음", log: "수송선에서 빼 온 몫을 {동료|와} 반씩 나눔" } },
          { title: "갑판에서 동료의 이름을 외친다", desc: "동료는 빛나지만 내 몫은 준다",
            effect: { money: 60000, npcRel: 10, standing: -3, traits: { "신중": 1 },
                      npcStory: "갑판에서 습격의 공을 인정받음", log: "갑판에서 {동료}의 꾀를 모두에게 밝힘" } },
          { title: "이름도 몫도 혼자 챙긴다", desc: "이름은 커지지만 동료가 안다",
            effect: { money: 300000, bounty: "+20%", npcRel: -8, relationship: -3, traits: { "야심": 1 },
                      npcStory: "수송선 습격의 공을 빼앗김", log: "{동료}의 몫까지 이름과 몫을 혼자 챙김" } }
        ]
      },
      "해군": {
        body: "당신과 {동료|이} 함께 해적선 한 척을 나포했습니다. 그런데 보고서의 지휘관 칸에는 당신 이름만 들어가 있고, 상관은 이번 공으로 당신을 진급 후보에 올리겠다고 합니다. 포위망을 짠 건 {동료}였습니다.",
        choices: [
          { title: "공동 지휘로 고쳐 올린다", desc: "공정하지만 진급은 미뤄진다",
            effect: { standing: 3, npcRel: 8, relationship: 2, traits: { "선량": 1 },
                      npcStory: "나포 보고서에 공동 지휘로 이름이 오름", log: "나포 보고서를 {동료|와} 공동 지휘로 고침" } },
          { title: "동료를 진급 후보로 추천한다", desc: "동료는 오르지만 내 차례는 밀린다",
            effect: { standing: -3, npcRel: 12, traits: { "신중": 1 },
                      npcStory: "나포의 공으로 진급 후보에 오름", log: "{동료|을} 진급 후보로 대신 추천함" } },
          { title: "보고서를 그대로 둔다", desc: "진급은 다가오지만 동료가 안다",
            effect: { standing: 8, money: 60000, npcRel: -8, relationship: -3, traits: { "야심": 1 },
                      npcStory: "나포의 공을 빼앗김", log: "{동료}의 공이 빠진 보고서를 그대로 올림" } }
        ]
      },
      "*": {}
    }
  },

  // ── 동료의 비밀 ──
  {
    key: "cmp_w_secret",
    pool: "companion",
    when: { companion: true, minAge: 18 },
    title: "외투 속의 편지",
    body: "{동료}의 외투를 빨다가 주머니에서 낡은 편지가 나옵니다. 다른 이름이 적힌 옛 재판 문서와, 고향에서 큰 빚을 지고 도망쳤다는 고백이 들어 있습니다. 저녁 무렵이면 {동료|이} 돌아올 시간입니다.",
    choices: [
      { title: "모른 척 제자리에 넣는다", desc: "평화는 지키지만 비밀이 남는다",
        effect: { happiness: -3, relationship: 2, npcRel: 3, traits: { "신중": 1 },
                  log: "{동료}의 편지를 모른 척 제자리에 넣음" } },
      { title: "편지를 들고 먼저 묻는다", desc: "진실을 듣지만 동료가 움츠러든다",
        effect: { knowledge: 3, npcRel: 6, traits: { "용기": 1 },
                  npcStory: "숨겨 온 과거를 털어놓음", log: "{동료}에게 편지를 내밀고 지난 일을 들음" },
        risk: { chance: 0.3, effect: { relationship: -4, log: "{동료|이} 몰래 편지를 읽은 일로 크게 화를 냄" } } },
      { title: "그 빚을 몰래 알아본다", desc: "도울 길을 찾지만 돈과 발품이 든다",
        effect: { money: -100000, npcRel: 10, traits: { "선량": 1 },
                  npcStory: "고향의 옛 빚이 몰래 정리됨", log: "{동료}의 고향 빚을 몰래 알아보고 일부를 갚음" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{동료}의 해먹 아래에서 해군 인식표가 나옵니다. {동료|은} 한때 해군이었고, 탈영병으로 쫓기고 있다는 문서도 함께 있습니다. 배에는 해군에게 가족을 잃은 이가 여럿이라, 이 일이 알려지면 {동료|이} 무사하지 못할 것입니다.",
        choices: [
          { effect: { happiness: -3, relationship: 2, npcRel: 3, traits: { "신중": 1 },
                      log: "{동료}의 인식표를 모른 척 제자리에 넣음" } },
          { title: "인식표를 들고 따로 묻는다",
            effect: { knowledge: 3, npcRel: 8, traits: { "용기": 1 },
                      npcStory: "해군 시절의 일을 털어놓음", log: "{동료}에게 인식표를 내밀고 해군 시절 이야기를 들음" } },
          { title: "인식표를 바다에 던져 준다", desc: "과거를 지우지만 소문이 날 수 있다",
            effect: { npcRel: 10, standing: -4, memory: "물결에 가라앉은 인식표", traits: { "선량": 1 },
                      npcStory: "해군 시절 인식표를 바다에 버림", log: "{동료}의 인식표를 함께 바다에 던짐" },
            risk: { chance: 0.25, effect: { relationship: -4, log: "선원들 사이에 {동료}의 과거가 소문남" } } }
        ]
      },
      "해군": {
        body: "{동료}의 사물함에서 혁명군 표식이 찍힌 쪽지가 나옵니다. 내용은 고향의 형제가 무사하다는 안부뿐입니다. 규정대로라면 즉시 정보부에 보고해야 하는 물건이고, 숨긴 것이 드러나면 당신도 함께 조사를 받습니다.",
        choices: [
          { title: "보고하지 않고 넣어 둔다", desc: "동료는 지키지만 규정을 어긴다",
            effect: { npcRel: 6, happiness: -3, traits: { "선량": 1 },
                      npcStory: "혁명군 쪽지 일이 조용히 묻힘", log: "{동료}의 쪽지를 보고하지 않고 넣어 둠" },
            risk: { chance: 0.25, effect: { standing: -6, log: "숨긴 쪽지 일이 감찰에 걸림" } } },
          { title: "쪽지를 들고 따로 묻는다", desc: "진실을 듣지만 동료가 움츠러든다",
            effect: { knowledge: 3, npcRel: 6, traits: { "용기": 1 },
                      npcStory: "혁명군 형제의 일을 털어놓음", log: "{동료}에게 쪽지를 내밀고 형제 이야기를 들음" } },
          { title: "규정대로 정보부에 보고한다", desc: "원칙은 지키지만 동료를 잃는다",
            effect: { standing: 7, npcRel: -14, relationship: -3, traits: { "신중": 1 },
                      npcStory: "혁명군 쪽지 일로 정보부 조사를 받음", log: "{동료}의 쪽지를 정보부에 보고함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 동료를 위해 무언가를 포기할지 ──
  {
    key: "cmp_w_give_up",
    pool: "companion",
    when: { companion: true, minAge: 20, maxAge: 55 },
    title: "하나뿐인 자리",
    body: "{여기}의 큰 상단이 감독 자리 하나를 두고 당신과 {동료|를} 함께 시험합니다. 당신이 조금 앞선다는 말이 돕니다. 그런데 {동료|은} 병든 어머니 약값 때문에 이 자리가 꼭 필요하다고, 술자리 끝에 털어놓았습니다.",
    choices: [
      { title: "시험에서 물러난다", desc: "동료는 붙지만 내 기회는 사라진다",
        effect: { npcRel: 12, relationship: 3, standing: -3, traits: { "선량": 1 },
                  npcStory: "양보받은 자리로 어머니 약값을 댐", log: "감독 자리 시험에서 {동료|을} 위해 물러남" } },
      { title: "끝까지 정정당당히 겨룬다", desc: "승복하겠지만 둘 중 하나는 운다",
        effect: { standing: 5, money: 100000, npcRel: -4, traits: { "용기": 1 },
                  log: "{동료|와} 감독 자리를 두고 끝까지 겨뤄 이김" },
        risk: { chance: 0.35, effect: { money: -100000, happiness: -4, log: "마지막 시험에서 {동료}에게 자리를 내줌" } } },
      { title: "자리는 받고 약값을 돕는다", desc: "자리는 얻지만 돈과 마음이 든다",
        effect: { standing: 5, money: -100000, npcRel: 4, traits: { "야심": 1 },
                  npcStory: "자리 대신 어머니 약값을 보탬받음", log: "감독 자리를 받고 {동료}의 어머니 약값을 보탬" },
        risk: { chance: 0.25, effect: { relationship: -3, log: "{동료|이} 동정받는 걸 견디지 못해 멀어짐" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "새로 얻은 배의 지휘를 두고 당신과 {동료|이} 후보에 올랐습니다. 다들 당신 쪽이라고 수군댑니다. 그런데 {동료|은} 그 배로 고향 섬에 붙잡힌 가족을 구하러 가고 싶다고, 갑판 끝에서 털어놓았습니다.",
        choices: [
          { title: "후보에서 물러난다", desc: "동료는 배를 얻지만 내 기회는 사라진다",
            effect: { npcRel: 12, relationship: 3, standing: -3, traits: { "선량": 1 },
                      npcStory: "양보받은 배로 고향 섬의 가족을 구함", log: "새 배의 지휘를 {동료}에게 양보함" } },
          { title: "끝까지 실력으로 겨룬다",
            effect: { standing: 5, combat: 3, npcRel: -4, traits: { "용기": 1 },
                      log: "{동료|와} 새 배의 지휘를 두고 겨뤄 이김" },
            risk: { chance: 0.35, effect: { happiness: -6, log: "마지막 겨루기에서 {동료}에게 배를 내줌" } } },
          { title: "배는 맡고 고향 섬에 들른다", desc: "자리도 얻지만 항로가 위험해진다",
            effect: { standing: 5, npcRel: 6, health: -5, traits: { "선량": 1 },
                      npcStory: "새 배를 타고 고향 섬의 가족을 구함", log: "새 배를 맡아 {동료}의 고향 섬으로 뱃머리를 돌림" },
            risk: { chance: 0.3, effect: { health: -8, bounty: "+20%", log: "고향 섬 앞바다에서 해군 군함과 맞닥뜨림" } } }
        ]
      },
      "해군": {
        body: "본부 참모 자리 하나를 두고 당신과 {동료|이} 후보에 올랐습니다. 평가는 당신 쪽이 조금 높습니다. 그런데 {동료|은} 본부 근처 병원에 누운 어머니 곁을 지키려면 이 자리가 꼭 필요하다고 털어놓았습니다.",
        choices: [
          { title: "후보에서 물러난다",
            effect: { npcRel: 12, relationship: 3, standing: -4, traits: { "선량": 1 },
                      npcStory: "양보받은 참모 자리로 어머니 곁을 지킴", log: "본부 참모 자리를 {동료}에게 양보함" } },
          { title: "평가대로 자리를 받는다", desc: "경력은 쌓이지만 동료가 운다",
            effect: { standing: 7, npcRel: -6, traits: { "야심": 1 },
                      log: "평가대로 본부 참모 자리를 받음" },
            risk: { chance: 0.2, effect: { relationship: -3, log: "자리를 가로챘다는 뒷말이 부대에 돎" } } },
          { title: "자리는 받고 병원을 챙긴다", desc: "자리는 얻지만 돈과 마음이 든다",
            effect: { standing: 5, money: -100000, npcRel: 4, traits: { "신중": 1 },
                      npcStory: "어머니 병원비를 보탬받음", log: "참모 자리를 받고 {동료}의 어머니 병원비를 보탬" } }
        ]
      },
      "*": {}
    }
  },

  // ── 동료의 무모한 승부 ──
  {
    key: "cmp_w_reckless",
    pool: "companion",
    when: { companion: true, minAge: 18, maxAge: 50 },
    title: "동료의 무모한 승부",
    body: "{동료|이} 눈을 반짝이며 들어옵니다. {여기}의 뒷골목 투기장에서 이기면 한 해 벌이를 한 번에 번다며, 판돈을 같이 대자고 합니다. 상대는 한 번도 진 적 없는 거한이라고 합니다.",
    choices: [
      { title: "판돈을 대고 함께 건다", desc: "크게 벌 수도 크게 잃을 수도 있다",
        effect: { money: 200000, npcRel: 5, happiness: 3, traits: { "야심": 1 },
                  npcStory: "뒷골목 투기장에서 이겨 큰돈을 쥠", log: "{동료}의 승부에 판돈을 대 크게 벎" },
        risk: { chance: 0.4, effect: { money: -300000, happiness: -4, log: "{동료|이} 투기장에서 지고 판돈을 몽땅 잃음" } } },
      { title: "말리고 일거리를 구해 준다", desc: "안전하지만 동료가 답답해한다",
        effect: { npcRel: -5, relationship: 3, traits: { "신중": 1 },
                  npcStory: "투기장 대신 일거리를 소개받음", log: "투기장 대신 {동료}에게 일거리를 소개함" } },
      { title: "내가 대신 링에 오른다", desc: "동료는 지키지만 내가 맞는다",
        effect: { combat: 4, health: -8, npcRel: 8, reputation: 3, traits: { "용기": 1 },
                  npcStory: "대신 링에 오른 동료 덕에 무사함", log: "{동료} 대신 투기장 거한과 맞붙음" },
        risk: { chance: 0.3, effect: { health: -8, log: "거한의 주먹에 갈비뼈가 나감" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "{동료|이} 해도를 들고 들어옵니다. 해군 군함이 지키는 암초 사이에 침몰선의 금고가 잠겨 있다며, 오늘 밤 둘이서만 몰래 다녀오자고 합니다. 들키면 배 전체가 쫓기게 되지만, {동료}의 눈은 이미 바다 너머를 보고 있습니다.",
        choices: [
          { title: "둘이서 몰래 다녀온다", desc: "크게 벌 수도 크게 쫓길 수도 있다",
            effect: { money: 300000, npcRel: 6, traits: { "야심": 1 },
                      npcStory: "암초 사이 침몰선의 금고를 털어 옴", log: "{동료|와} 몰래 침몰선의 금고를 털어 옴" },
            risk: { chance: 0.4, effect: { health: -8, bounty: "+20%", log: "암초에서 해군 군함에 들켜 쫓김" } } },
          { title: "선원들과 계획을 세우자고 한다", desc: "안전하지만 몫이 줄고 동료가 답답하다",
            effect: { money: 60000, npcRel: -5, standing: 3, traits: { "신중": 1 },
                      log: "{동료|을} 말리고 선원들과 함께 금고를 건짐" } },
          { title: "나 혼자 다녀오겠다고 한다", desc: "동료는 지키지만 내가 위험하다",
            effect: { money: 150000, health: -6, npcRel: 8, traits: { "용기": 1 },
                      npcStory: "대신 암초로 간 동료 덕에 무사함", log: "{동료} 대신 혼자 암초 사이 금고를 건짐" },
            risk: { chance: 0.3, effect: { health: -8, log: "암초에 배가 부서져 조각에 매달려 돌아옴" } } }
        ]
      },
      "해군": {
        body: "{동료|이} 작전 지도를 들고 옵니다. 해적의 은신처를 알아냈는데, 상부에 올리면 다른 부대가 공을 가져간다며 오늘 밤 둘이서만 치자고 합니다. 명령 없는 출동은 군법 위반입니다.",
        choices: [
          { title: "둘이서 몰래 출동한다", desc: "큰 공을 세울 수도 징계받을 수도 있다",
            effect: { standing: 8, npcRel: 6, traits: { "용기": 1 },
                      npcStory: "명령 없이 해적 은신처를 덮침", log: "{동료|와} 몰래 해적 은신처를 덮침" },
            risk: { chance: 0.4, effect: { health: -10, standing: -6, log: "명령 없는 출동이 들통나 징계받음" } } },
          { title: "정식으로 상부에 올린다", desc: "규정대로지만 공을 빼앗긴다",
            effect: { standing: 3, npcRel: -5, traits: { "신중": 1 },
                      log: "{동료|이} 찾은 은신처를 상부에 보고함" } },
          { title: "혼자 정찰만 다녀온다", desc: "동료는 지키지만 내가 위험하다",
            effect: { standing: 4, combat: 3, health: -6, npcRel: 6, traits: { "용기": 1 },
                      npcStory: "대신 정찰을 다녀온 동료 덕에 무사함", log: "{동료} 대신 혼자 해적 은신처를 정찰함" },
            risk: { chance: 0.3, effect: { health: -8, log: "은신처 정찰 중 들켜 칼에 베임" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 동료의 고향 소식 ──
  {
    key: "cmp_w_home_news",
    pool: "companion",
    when: { companion: true, minAge: 18 },
    title: "동료의 고향 편지",
    body: "{동료}에게 고향에서 편지가 왔습니다. 마을에 돌림병이 돌아 가족이 앓고 있다는 소식입니다. {동료|은} 아무렇지 않은 척하지만 밤마다 편지를 다시 펼쳐 봅니다. 그 섬까지는 배로 열흘이 걸립니다.",
    choices: [
      { title: "함께 고향으로 간다", desc: "곁을 지키지만 병이 옮을 수 있다",
        effect: { money: -100000, npcRel: 12, relationship: 3, memory: "돌림병이 돌던 낯선 섬", traits: { "용기": 1 },
                  npcStory: "돌림병이 돈 고향에 동행해 줌", log: "{동료|와} 함께 돌림병이 도는 고향에 다녀옴" },
        risk: { chance: 0.3, effect: { health: -10, log: "돌림병이 옮아 한동안 앓음" } } },
      { title: "약값과 뱃삯을 쥐여 준다", desc: "도움은 되지만 동료 혼자 떠난다",
        effect: { money: -150000, npcRel: 8, traits: { "선량": 1 },
                  npcStory: "약값과 뱃삯을 받아 고향에 다녀옴", log: "{동료}에게 약값과 뱃삯을 쥐여 보냄" } },
      { title: "모르는 척 일을 이어 간다", desc: "일은 지키지만 동료가 서운하다",
        effect: { money: 60000, npcRel: -8, relationship: -2, traits: { "야심": 1 },
                  log: "고향 걱정하는 {동료|을} 두고 일을 이어 감" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{동료}에게 병에 담긴 편지가 닿았습니다. 고향 섬에 해적 사냥을 핑계로 해군이 눌러앉아, 가족이 끌려갈 처지라는 소식입니다. {동료|은} 말없이 칼을 갈기 시작합니다. 고향 섬은 지금 항로에서 사흘 거리입니다.",
        choices: [
          { title: "배를 돌려 고향 섬으로 간다", desc: "가족을 구하지만 해군과 맞선다",
            effect: { npcRel: 12, standing: 5, bounty: "+20%", memory: "새벽에 빠져나온 고향 섬 부두", traits: { "용기": 1 },
                      npcStory: "해군이 지키던 고향 섬에서 가족을 빼냄", log: "{동료}의 고향 섬에 들러 가족을 빼냄" },
            risk: { chance: 0.3, effect: { health: -10, log: "섬 부두에서 해군과 맞붙어 다침" } } },
          { title: "몰래 들어갈 배를 구해 준다", desc: "돕지만 동료 혼자 위험에 든다",
            effect: { money: -150000, npcRel: 6, traits: { "신중": 1 },
                      npcStory: "구해 준 작은 배로 고향 섬에 숨어듦", log: "{동료|이} 고향 섬에 숨어들 작은 배를 구해 줌" } },
          { title: "지금은 항로를 지키자고 한다", desc: "배는 지키지만 동료가 서운하다",
            effect: { standing: 3, npcRel: -8, relationship: -2, traits: { "야심": 1 },
                      log: "{동료}의 부탁을 미루고 정해진 항로를 지킴" } }
        ]
      },
      "해군": {
        body: "{동료}에게 고향에서 편지가 왔습니다. 고향 섬이 해적에게 시달리는데 담당 지부는 손을 놓고 있다는 소식입니다. {동료|은} 휴가를 내 혼자라도 가겠다고 합니다. 당신의 부대는 다른 항로에 배치되어 있습니다.",
        choices: [
          { title: "항로 변경을 상신한다", desc: "섬을 돕지만 상관의 눈 밖에 난다",
            effect: { npcRel: 12, standing: -4, relationship: 3, traits: { "용기": 1 },
                      npcStory: "부대를 이끌고 온 동기 덕에 고향을 지킴", log: "{동료}의 고향 섬으로 항로 변경을 상신해 다녀옴" },
            risk: { chance: 0.3, effect: { health: -8, log: "섬 앞바다에서 해적과 교전하다 다침" } } },
          { title: "휴가비를 보태 준다", desc: "도움은 되지만 동료 혼자 떠난다",
            effect: { money: -100000, npcRel: 8, traits: { "선량": 1 },
                      npcStory: "휴가비를 보태 받아 고향에 다녀옴", log: "{동료}의 휴가비를 보태 고향에 보냄" } },
          { title: "명령대로 항로를 지킨다", desc: "공적은 쌓이지만 동료가 서운하다",
            effect: { standing: 5, npcRel: -8, traits: { "신중": 1 },
                      log: "{동료}의 부탁을 뒤로하고 명령대로 항로를 지킴" } }
        ]
      },
      "*": {}
    }
  },

  // ── 사소한 말다툼 ──
  {
    key: "cmp_w_quarrel",
    pool: "companion",
    when: { companion: true, minAge: 18 },
    title: "끝나지 않은 말다툼",
    body: "사소한 일로 시작한 말다툼이 사흘째 이어집니다. 오늘 아침 {동료|은} 당신 몫의 밥을 차려 두고 말없이 나가 버렸습니다. 식은 국 한 그릇을 앞에 두고 보니, 무엇 때문에 다퉜는지도 잘 기억나지 않습니다.",
    choices: [
      { title: "먼저 사과하러 간다", desc: "사이는 풀리지만 자존심이 상한다",
        effect: { npcRel: 8, relationship: 3, happiness: -2, traits: { "선량": 1 },
                  npcStory: "사흘 말다툼 끝에 먼저 사과를 받음", log: "사흘 만에 {동료}에게 먼저 사과함" } },
      { title: "저녁을 차려 놓고 기다린다", desc: "말없이 풀지만 어긋날 수도 있다",
        effect: { npcRel: 5, happiness: 3, skills: { "요리": 2 }, memory: "말없이 차린 저녁상", traits: { "신중": 1 },
                  log: "말없이 저녁상을 차려 {동료|와} 화해함" },
        risk: { chance: 0.3, effect: { happiness: -4, relationship: -2, log: "{동료|이} 늦게 돌아와 저녁상이 식어 버림" } } },
      { title: "이참에 할 말을 다 한다", desc: "속은 시원하지만 금이 갈 수 있다",
        effect: { happiness: 5, npcRel: -4, traits: { "용기": 1 },
                  npcStory: "쌓아 둔 불만을 한꺼번에 들음", log: "{동료}에게 쌓인 말을 다 쏟아 냄" },
        risk: { chance: 0.35, effect: { relationship: -5, log: "말다툼이 커져 한동안 말을 섞지 않음" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "항로를 두고 시작한 말다툼이 사흘째 이어집니다. 오늘 아침 {동료|은} 당신의 망보기 당번까지 말없이 서고 망대로 올라가 버렸습니다. 갑판의 선원들이 두 사람 눈치만 보느라 돛 손질도 제대로 하지 못합니다.",
        choices: [
          { title: "망대에 올라가 먼저 사과한다" },
          { title: "망대로 술병을 올려 보낸다", desc: "말없이 풀지만 어긋날 수도 있다",
            effect: { npcRel: 5, happiness: 3, standing: 2, memory: "망대로 올려 보낸 술병", traits: { "신중": 1 },
                      log: "망대로 술병을 올려 보내 {동료|와} 화해함" },
            risk: { chance: 0.3, effect: { happiness: -4, relationship: -2, log: "술병이 망대에서 그대로 내려옴" } } },
          { title: "선원들 앞에서 결판을 낸다", desc: "속은 시원하지만 배가 갈라질 수 있다",
            effect: { happiness: 5, standing: 3, npcRel: -5, traits: { "용기": 1 },
                      npcStory: "선원들 앞에서 항로 다툼에 결판이 남", log: "선원들 앞에서 {동료|와} 항로 다툼에 결판을 냄" },
            risk: { chance: 0.35, effect: { relationship: -5, log: "선원들이 두 패로 갈려 한동안 수군거림" } } }
        ]
      },
      "해군": {
        body: "작전 방식을 두고 시작한 말다툼이 사흘째 이어집니다. 오늘 아침 브리핑에서 {동료|은} 당신의 의견에 대놓고 반대했습니다. 상관이 둘 사이를 정리하라고 눈치를 주고, 부하들도 누구 편에 설지 수군댑니다.",
        choices: [
          { title: "브리핑 뒤 먼저 사과한다" },
          { title: "상관에게 중재를 부탁한다", desc: "깔끔하지만 둘 다 평가가 깎인다",
            effect: { npcRel: 5, standing: -3, relationship: 2, traits: { "신중": 1 },
                      log: "상관의 중재로 {동료|와} 말다툼을 정리함" },
            risk: { chance: 0.2, effect: { relationship: -3, log: "중재 뒤에도 {동료|이} 거리를 둠" } } },
          { title: "다음 브리핑에서 맞받아친다", desc: "기세는 살지만 금이 갈 수 있다",
            effect: { standing: 3, happiness: 4, npcRel: -5, traits: { "용기": 1 },
                      npcStory: "브리핑에서 정면으로 반박당함", log: "브리핑에서 {동료}의 의견을 맞받아침" },
            risk: { chance: 0.35, effect: { relationship: -5, log: "부대가 두 패로 갈려 한동안 서먹함" } } }
        ]
      },
      "*": {}
    }
  }
]);

/* ───────────── 곁에 동료가 없을 때 (12) ───────────── */
/* 동료 사건 — 곁에 동료가 없을 때 (when.companion: false)
   다쳤을 때(injured) 5개 · 평소 7개. 혼자 버티면 강해지거나 돈·자유를 지키지만 회복이 늦고 외롭다.
   도움을 청하면 새 동료(newCompanion)가 생기지만 대가가 따른다. */
CB([
  // ───────── 다쳤을 때 ─────────

  // 1. 빈 방에서 혼자 앓음
  {
    key: "cmp_a_fever_room",
    pool: "companion",
    when: { companion: false, injured: true, minAge: 18 },
    title: "빈 방의 열병",
    body: "지난번에 입은 상처가 덧나 밤새 열이 오르고 이불이 땀에 젖습니다. 셋방의 물주전자는 비었고, 문을 두드려 줄 사람도 없습니다. 벽 너머에서 옆방 사람이 늦은 저녁을 먹는 소리가 들려옵니다.",
    choices: [
      { title: "이를 악물고 혼자 버틴다", desc: "몸은 단단해지지만 오래 앓는다",
        effect: { health: 3, combat: 3, happiness: -6, traits: { "용기": 1 },
                  memory: "혼자 지샌 열병의 밤", log: "아무도 없는 셋방에서 열병을 혼자 넘김" },
        risk: { chance: 0.25, effect: { health: -6, log: "열이 내리지 않아 한 달을 더 앓음" } } },
      { title: "옆방 문을 두드린다", desc: "곁을 얻지만 신세를 진다",
        effect: { health: 10, relationship: 4, money: -60000, newCompanion: true, traits: { "선량": 1 },
                  log: "옆방 사람의 간호로 열병을 넘기고 가까워짐" } },
      { title: "돈을 주고 의원을 부른다", desc: "확실하지만 값이 비싸다",
        effect: { health: 12, money: -200000, happiness: -2, traits: { "신중": 1 },
                  log: "비싼 왕진비를 치르고 열병을 다스림" } }
    ],
    by: {
      "해적|혁명군": {
        body: "추격을 피해 숨어든 은신처 다락방에서 상처가 덧나 열이 오릅니다. 물을 떠다 줄 사람은 없고, 아래층 선술집 주인은 눈치가 빠르기로 유명합니다. 계단을 내려가면 얼굴을 보일 수밖에 없습니다.",
        choices: [
          {},
          { title: "선술집 주인에게 손을 내민다", desc: "곁을 얻지만 얼굴이 알려진다",
            effect: { health: 10, relationship: 4, money: -60000, newCompanion: true, traits: { "선량": 1 },
                      log: "은신처 아래 선술집 주인의 간호를 받음" },
            risk: { chance: 0.25, effect: { bounty: "+20%", log: "은신처 소문이 새어 수배서가 새로 붙음" } } },
          { title: "밀수꾼에게 약을 구한다", desc: "말은 안 새지만 값이 비싸다",
            effect: { health: 12, money: -200000, happiness: -2, traits: { "신중": 1 },
                      log: "밀수꾼의 비싼 약으로 열병을 다스림" } }
        ]
      },
      "해군": {
        body: "임무에서 입은 상처가 덧나 관사 침상에서 밤새 열이 오릅니다. 의무실에 가면 진료 기록이 남아 다음 작전에서 빠질 수 있습니다. 옆 침상의 동기는 오늘따라 늦게까지 장비를 닦고 있습니다.",
        choices: [
          { title: "보고하지 않고 버틴다", desc: "작전은 지키지만 오래 앓는다",
            effect: { health: 3, standing: 4, happiness: -6, traits: { "용기": 1 },
                      memory: "관사 침상의 식은땀", log: "상처를 숨기고 열병을 혼자 넘김" },
            risk: { chance: 0.25, effect: { health: -6, log: "열이 도져 훈련 중 쓰러짐" } } },
          { title: "옆 침상 동기에게 털어놓는다", desc: "곁을 얻지만 근무를 떠넘긴다",
            effect: { health: 10, relationship: 4, standing: -3, newCompanion: true, traits: { "선량": 1 },
                      log: "동기가 근무를 대신 서 주며 가까워짐" } },
          { title: "의무실에 정식으로 간다", desc: "확실하지만 작전에서 빠진다",
            effect: { health: 12, standing: -5, happiness: -2, traits: { "신중": 1 },
                      log: "의무실에 입원해 작전 명단에서 빠짐" } }
        ]
      },
      "*": {}
    }
  },

  // 2. 상처를 스스로 꿰맴
  {
    key: "cmp_a_self_stitch",
    pool: "companion",
    when: { companion: false, injured: true, minAge: 18 },
    title: "스스로 꿰맨 상처",
    body: "붕대를 갈다 보니 지난번 상처가 다시 벌어져 있습니다. 바늘과 실은 서랍에 있지만, 손이 닿지 않는 자리라 거울을 보며 거꾸로 꿰매야 합니다. 거리 끝에는 떠돌이 약초꾼이 좌판을 펴 두었습니다.",
    choices: [
      { title: "거울 앞에서 직접 꿰맨다", desc: "손은 늘지만 덧날 수 있다",
        effect: { health: 6, skills: { "의술": 5 }, happiness: -3, traits: { "용기": 1 },
                  memory: "거울 속 거꾸로 된 바늘", log: "벌어진 상처를 거울을 보며 직접 꿰맴" },
        risk: { chance: 0.3, effect: { health: -8, log: "서툰 바늘땀이 덧나 고름이 잡힘" } } },
      { title: "약초꾼의 좌판을 찾는다", desc: "솜씨는 좋지만 값을 치른다",
        effect: { health: 12, money: -80000, relationship: 3, newCompanion: true, traits: { "선량": 1 },
                  log: "떠돌이 약초꾼에게 상처를 맡기고 말동무가 됨" } },
      { title: "단단히 동여매고 일하러 간다", desc: "벌이는 지키지만 상처는 남는다",
        effect: { money: 60000, health: -6, traits: { "야심": 1 },
                  log: "벌어진 상처를 동여맨 채 일을 나감" } }
    ],
    by: {
      "해적|혁명군": {
        body: "배 밑창 창고에서 붕대를 갈다 보니 지난번 상처가 다시 벌어져 있습니다. 배에 의사는 없고, 다음 항구까지는 사흘이 남았습니다. 항구에 닿으면 뒷골목 약초꾼이 있지만 수배서도 붙어 있을 겁니다.",
        choices: [
          {},
          { title: "항구 뒷골목 약초꾼을 찾는다", desc: "곁을 얻지만 얼굴이 드러난다",
            effect: { health: 12, money: -80000, relationship: 3, newCompanion: true, traits: { "선량": 1 },
                      log: "항구 뒷골목 약초꾼에게 상처를 맡기고 가까워짐" },
            risk: { chance: 0.2, effect: { bounty: "+20%", log: "약초꾼 집을 드나들다 해군 눈에 띔" } } },
          { title: "상처를 동여매고 약탈에 나선다", desc: "몫은 챙기지만 상처는 남는다",
            effect: { money: 100000, health: -6, standing: 3, traits: { "야심": 1 },
                      log: "벌어진 상처를 동여맨 채 약탈에 나섬" } }
        ]
      },
      "해군": {
        body: "순찰에서 돌아와 붕대를 갈다 보니 지난번 상처가 다시 벌어져 있습니다. 의무실은 부상병으로 가득해 차례가 언제 올지 모릅니다. 기지 앞 거리에는 해군 출신 약초꾼이 좌판을 폈습니다.",
        choices: [
          {},
          { title: "기지 앞 약초꾼을 찾는다", desc: "솜씨는 좋지만 값을 치른다",
            effect: { health: 12, money: -80000, relationship: 3, newCompanion: true, traits: { "선량": 1 },
                      log: "퇴역 해군 약초꾼에게 상처를 맡기고 말동무가 됨" } },
          { title: "동여매고 순찰을 계속한다", desc: "공은 쌓이지만 상처는 남는다",
            effect: { standing: 5, health: -6, traits: { "용기": 1 },
                      log: "벌어진 상처를 동여맨 채 순찰을 나감" } }
        ]
      },
      "*": {}
    }
  },

  // 3. 낯선 사람에게 도움을 청할지
  {
    key: "cmp_a_stranger_door",
    pool: "companion",
    when: { companion: false, injured: true, minAge: 18 },
    title: "낯선 집의 문간",
    body: "상처가 도져 늦은 귀갓길에 그만 다리가 풀립니다. 겨우 기대앉은 곳은 불 켜진 낯선 집의 문간입니다. 안에서는 아이 웃음소리가 들리고, 집까지는 아직 언덕 둘을 더 넘어야 합니다.",
    choices: [
      { title: "문을 두드려 도움을 청한다", desc: "곁을 얻지만 사례를 한다",
        effect: { health: 10, relationship: 4, money: -60000, newCompanion: true, traits: { "선량": 1 },
                  log: "낯선 집에서 하룻밤 신세를 지고 인연을 맺음" } },
      { title: "날이 샐 때까지 문간에서 쉰다", desc: "폐는 안 끼치지만 몸이 식는다",
        effect: { health: 3, happiness: -5, knowledge: 3, traits: { "신중": 1 },
                  memory: "새벽 문간의 찬 돌계단", log: "낯선 집 문간에서 혼자 밤을 새움" },
        risk: { chance: 0.2, effect: { health: -6, log: "밤이슬에 몸이 식어 열이 오름" } } },
      { title: "기어서라도 집으로 간다", desc: "버티는 힘은 붙지만 무리다",
        effect: { combat: 3, health: -7, traits: { "용기": 1 },
                  log: "상처 난 몸을 끌고 끝내 집까지 걸어감" } }
    ],
    by: {
      "해적|혁명군": {
        body: "상처가 도져 비 내리는 뒷골목에서 다리가 풀립니다. 겨우 기대앉은 문간의 집 벽에는 해군 수병의 외투가 걸려 있습니다. 집 안에서는 늙은 어머니가 아들을 기다리며 등불을 켜 두었습니다.",
        choices: [
          { title: "문을 두드려 도움을 청한다", desc: "곁을 얻지만 정체가 들킬 수 있다",
            effect: { health: 10, relationship: 4, money: -60000, newCompanion: true, traits: { "선량": 1 },
                      log: "수병의 어머니 집에서 신세를 지고 인연을 맺음" },
            risk: { chance: 0.3, effect: { bounty: "+20%", health: -4, log: "돌아온 수병에게 들켜 창문으로 달아남" } } },
          {},
          {}
        ]
      },
      "해군": {
        body: "작전에서 입은 상처가 도져 마을 길에서 다리가 풀립니다. 기대앉은 문간의 집 사람들은 해군 제복을 보고 문을 반쯤만 엽니다. 이 마을은 지난달 해군 수색으로 집 몇 채가 부서졌습니다.",
        choices: [
          { title: "제복을 벗고 도움을 청한다", desc: "곁을 얻지만 마을 원망을 듣는다",
            effect: { health: 10, relationship: 4, happiness: -3, newCompanion: true, traits: { "선량": 1 },
                      log: "해군을 꺼리는 집에 신세를 지고 인연을 맺음" },
            risk: { chance: 0.2, effect: { standing: -4, log: "민가에서 밤을 보낸 일로 상관의 꾸중을 들음" } } },
          {},
          { title: "기지까지 기어서 간다", desc: "체면은 지키지만 무리다",
            effect: { combat: 3, standing: 3, health: -7, traits: { "용기": 1 },
                      log: "상처 난 몸으로 끝내 기지까지 돌아감" } }
        ]
      },
      "*": {}
    }
  },

  // 4. 일을 쉬면 굶는 처지
  {
    key: "cmp_a_no_rest",
    pool: "companion",
    when: { companion: false, injured: true, minAge: 18 },
    title: "쉬면 굶는 계절",
    body: "상처가 낫지 않았는데 쌀독은 바닥을 보입니다. 대신 일해 줄 가족도, 돈을 꿔 줄 친구도 없습니다. 일터의 젊은 일꾼 하나가 품삯을 반씩 나누면 당신 몫까지 해 주겠다고 넌지시 말합니다.",
    choices: [
      { title: "상처를 안고 일터에 나간다", desc: "벌이는 지키지만 상처가 덧난다",
        effect: { money: 80000, health: -8, traits: { "야심": 1 },
                  log: "낫지 않은 몸으로 일터에 나가 품삯을 지킴" } },
      { title: "문을 닫고 누워 버틴다", desc: "몸은 낫지만 배를 곯는다",
        effect: { health: 8, money: -60000, happiness: -5, traits: { "신중": 1 },
                  memory: "바닥을 긁던 쌀독", log: "쌀독을 긁으며 혼자 누워 상처를 다스림" } },
      { title: "젊은 일꾼에게 일을 맡긴다", desc: "곁을 얻지만 자리를 내줄 수 있다",
        effect: { health: 6, money: -30000, relationship: 4, newCompanion: true, traits: { "선량": 1 },
                  log: "젊은 일꾼에게 일을 맡기고 품삯을 나눔" },
        risk: { chance: 0.25, effect: { money: -100000, log: "주인이 일꾼을 더 마음에 들어 해 일자리를 잃음" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "상처가 낫지 않았는데 배는 내일 약탈에 나섭니다. 이번 약탈에 빠지면 분배 몫도 한 푼 없습니다. 갑판에서 잔심부름을 하던 신참 하나가 당신 몫의 일을 대신하고 몫을 반씩 나누자고 합니다.",
        choices: [
          { title: "상처를 안고 약탈에 나선다", desc: "몫은 챙기지만 상처가 덧난다",
            effect: { money: 120000, health: -8, standing: 2, traits: { "야심": 1 },
                      log: "낫지 않은 몸으로 약탈에 나서 몫을 챙김" } },
          { title: "선실에 누워 버틴다", desc: "몸은 낫지만 몫을 잃는다",
            effect: { health: 8, money: -60000, happiness: -5, traits: { "신중": 1 },
                      memory: "흔들리는 선실 천장", log: "약탈을 빠지고 선실에서 혼자 상처를 다스림" } },
          { title: "신참에게 자리를 맡긴다", desc: "곁을 얻지만 체면이 깎인다",
            effect: { health: 6, money: -30000, relationship: 4, newCompanion: true, traits: { "선량": 1 },
                      log: "신참에게 약탈 자리를 맡기고 몫을 나눔" },
            risk: { chance: 0.25, effect: { standing: -5, log: "신참이 더 잘 싸웠다는 말이 갑판에 돎" } } }
        ]
      },
      "해군": {
        body: "상처가 낫지 않았는데 이번 달 당직표에 당신 이름이 빼곡합니다. 빠지면 고과에 그대로 남습니다. 같은 부대 신병 하나가 당직을 대신 서 줄 테니 다음 외출 허가를 넘겨 달라고 합니다.",
        choices: [
          { title: "상처를 안고 당직을 선다", desc: "공은 쌓이지만 상처가 덧난다",
            effect: { standing: 5, health: -8, traits: { "용기": 1 },
                      log: "낫지 않은 몸으로 당직을 모두 채움" } },
          { title: "병가를 내고 누워 있는다", desc: "몸은 낫지만 고과가 깎인다",
            effect: { health: 8, standing: -4, happiness: -3, traits: { "신중": 1 },
                      memory: "텅 빈 관사의 한낮", log: "병가를 내고 혼자 관사에서 상처를 다스림" } },
          { title: "신병에게 당직을 맡긴다", desc: "곁을 얻지만 규정 위반이다",
            effect: { health: 6, relationship: 4, happiness: -2, newCompanion: true, traits: { "선량": 1 },
                      log: "신병에게 당직을 맡기고 외출 허가를 넘김" },
            risk: { chance: 0.25, effect: { standing: -6, log: "당직 바꿔치기가 들통나 징계를 받음" } } }
        ]
      },
      "*": {}
    }
  },

  // 5. 혼자 회복하는 긴 밤
  {
    key: "cmp_a_long_recovery",
    pool: "companion",
    when: { companion: false, injured: true, minAge: 18 },
    title: "아무도 오지 않는 병상",
    body: "상처는 아물어 가지만 침대에서 일어나지 못한 지 보름째입니다. 찾아오는 사람도, 문병 편지도 없습니다. 머리맡에는 읽다 만 책과 녹슨 무기, 언젠가 주소만 받아 둔 옛 지인의 쪽지가 놓여 있습니다.",
    choices: [
      { title: "누운 채로 몸을 단련한다", desc: "강해지지만 회복이 늦다",
        effect: { combat: 5, health: -6, traits: { "용기": 1 },
                  log: "병상에서 일어나기도 전에 다시 단련을 시작함" } },
      { title: "책을 끝까지 읽는다", desc: "머리는 차지만 마음은 비어 간다",
        effect: { knowledge: 5, health: 6, happiness: -4, relationship: -3, traits: { "신중": 1 },
                  memory: "병상 머리맡의 낡은 책", log: "아무도 오지 않는 병상에서 책 한 권을 다 읽음" } },
      { title: "옛 지인에게 편지를 쓴다", desc: "누군가 오지만 빚을 진다",
        effect: { happiness: 6, relationship: 5, health: 4, money: -60000, newCompanion: true, traits: { "선량": 1 },
                  log: "편지를 받은 옛 지인이 배를 타고 찾아옴" } }
    ],
    by: {
      "해적|혁명군": {
        body: "숨어든 외딴 섬 오두막에서 보름째 누워 지냅니다. 바깥 소식은 가끔 떠밀려 오는 신문뿐이고, 당신 이름이 실렸는지 확인할 사람도 없습니다. 머리맡에는 녹슨 무기와 옛 연락책의 암호 쪽지가 놓여 있습니다.",
        choices: [
          {},
          {},
          { title: "옛 연락책에게 신호를 보낸다", desc: "누군가 오지만 위치가 샌다",
            effect: { happiness: 6, relationship: 5, health: 4, newCompanion: true, traits: { "선량": 1 },
                      log: "암호 편지를 받은 옛 연락책이 섬으로 찾아옴" },
            risk: { chance: 0.3, effect: { bounty: "+20%", health: -6, log: "신호를 따라온 해군 쾌속선을 피해 달아남" } } }
        ]
      },
      "해군": {
        body: "해군 병원 병동에서 보름째 누워 지냅니다. 다른 침상에는 날마다 동기와 가족이 찾아오지만 당신 침상만 조용합니다. 머리맡에는 전술서 한 권과 예전 훈련소 동기의 주소가 놓여 있습니다.",
        choices: [
          {},
          { title: "전술서를 끝까지 읽는다", desc: "머리는 차지만 마음은 비어 간다",
            effect: { knowledge: 5, health: 6, happiness: -4, relationship: -3, traits: { "신중": 1 },
                      memory: "병동 머리맡의 전술서", log: "조용한 병동에서 전술서를 다 읽음" } },
          { title: "훈련소 동기에게 편지를 쓴다", desc: "누군가 오지만 부탁이 따른다",
            effect: { happiness: 6, relationship: 5, health: 4, standing: -3, newCompanion: true, traits: { "선량": 1 },
                      log: "편지를 받은 훈련소 동기가 휴가를 내고 찾아옴" } }
        ]
      },
      "*": {}
    }
  },

  // ───────── 평소 ─────────

  // 6. 위험할 때 도와줄 사람이 없음
  {
    key: "cmp_a_back_alley",
    pool: "companion",
    when: { companion: false, minAge: 18 },
    title: "등 뒤가 빈 골목",
    body: "밤길 골목에서 뒤를 밟던 사내 셋이 앞뒤를 막아섭니다. 소리쳐 불러도 달려올 이름이 떠오르지 않습니다. 골목 어귀에는 늦게까지 가게를 닫던 대장장이가 이쪽을 보고 망치를 쥐고 서 있습니다.",
    choices: [
      { title: "벽을 등지고 혼자 맞선다", desc: "강해지지만 크게 다칠 수 있다",
        effect: { combat: 5, health: -8, traits: { "용기": 1 },
                  log: "골목에서 사내 셋을 혼자 상대해 쫓아냄" },
        risk: { chance: 0.3, effect: { health: -7, log: "칼끝에 옆구리를 베임" } } },
      { title: "지갑을 던지고 달아난다", desc: "몸은 지키지만 돈과 자존심을 잃는다",
        effect: { money: -60000, happiness: -5, traits: { "신중": 1 },
                  log: "골목 강도들에게 지갑을 던져 주고 달아남" } },
      { title: "대장장이에게 소리쳐 부른다", desc: "곁을 얻지만 그를 위험에 끌어들인다",
        effect: { health: -3, relationship: 4, happiness: -2, newCompanion: true, traits: { "선량": 1 },
                  log: "대장장이와 함께 골목 강도를 물리치고 친해짐" },
        risk: { chance: 0.25, effect: { money: -80000, log: "다친 대장장이의 치료비를 대신 냄" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "항구 골목에서 수배서를 든 현상금 사냥꾼 셋이 앞뒤를 막아섭니다. 배는 아직 먼바다에 있고, 불러낼 이름도 없습니다. 골목 어귀에서 짐을 지던 부두 인부가 이쪽을 보며 갈고리를 쥐고 있습니다.",
        choices: [
          { title: "벽을 등지고 혼자 맞선다", desc: "이름은 커지지만 크게 다칠 수 있다",
            effect: { combat: 5, health: -8, bounty: "+20%", traits: { "용기": 1 },
                      log: "현상금 사냥꾼 셋을 혼자 상대해 쫓아냄" },
            risk: { chance: 0.3, effect: { health: -7, log: "사냥꾼의 그물총에 다리를 다침" } } },
          { title: "지붕 위로 달아난다", desc: "몸은 지키지만 짐을 버린다",
            effect: { money: -60000, happiness: -5, traits: { "신중": 1 },
                      log: "짐을 버리고 지붕을 타고 사냥꾼을 따돌림" } },
          { title: "부두 인부에게 손짓한다", desc: "곁을 얻지만 그를 수배자로 만든다",
            effect: { health: -3, relationship: 4, happiness: -2, newCompanion: true, traits: { "선량": 1 },
                      log: "부두 인부와 사냥꾼을 따돌리고 한패가 됨" },
            risk: { chance: 0.25, effect: { bounty: "+20%", log: "인부의 얼굴까지 수배서에 함께 실림" } } }
        ]
      },
      "해군": {
        body: "휴가 나온 밤길 골목에서 지난 작전에서 놓친 해적 잔당 셋이 앞뒤를 막아섭니다. 부대원은 모두 기지에 있고, 전보 벌레도 두고 나왔습니다. 골목 어귀에서 순찰 중이던 마을 자경단원이 망설이며 서 있습니다.",
        choices: [
          { title: "벽을 등지고 혼자 맞선다", desc: "공은 크지만 크게 다칠 수 있다",
            effect: { combat: 5, health: -8, standing: 4, traits: { "용기": 1 },
                      log: "휴가 중 해적 잔당 셋을 혼자 제압함" },
            risk: { chance: 0.3, effect: { health: -7, log: "잔당의 단검에 옆구리를 베임" } } },
          { title: "물러나 기지에 알린다", desc: "규정대로지만 놓칠 수 있다",
            effect: { standing: -3, happiness: -4, traits: { "신중": 1 },
                      log: "싸우지 않고 물러나 기지에 잔당 출몰을 알림" } },
          {}
        ]
      },
      "*": {}
    }
  },

  // 7. 혼자 결정해야 하는 갈림길
  {
    key: "cmp_a_crossroads",
    pool: "companion",
    when: { companion: false, minAge: 20, maxAge: 55 },
    title: "물어볼 데 없는 갈림길",
    body: "먼 섬의 상회에서 지금보다 훨씬 좋은 일자리를 주겠다는 편지가 왔습니다. 떠나면 이곳에 쌓아 온 것은 모두 두고 가야 합니다. 어떻게 할지 물어볼 사람이 없어, 편지를 가져온 상회 사람이 당신 대답을 기다립니다.",
    choices: [
      { title: "짐을 싸서 떠난다", desc: "벌이는 늘지만 뿌리가 뽑힌다",
        effect: { money: 200000, happiness: -6, relationship: -5, traits: { "야심": 1 },
                  log: "먼 섬 상회의 제안을 받아 홀로 떠남" } },
      { title: "지금 자리를 지킨다", desc: "익숙하지만 기회를 놓친다",
        effect: { happiness: 4, skills: { "장사": 4 }, traits: { "신중": 1 },
                  memory: "답장 없이 접어 둔 편지", log: "먼 섬의 제안을 거절하고 자리를 지킴" } },
      { title: "편지를 가져온 사람과 손잡는다", desc: "곁을 얻지만 돈을 걸어야 한다",
        effect: { money: -100000, relationship: 4, newCompanion: true, traits: { "용기": 1 },
                  log: "상회 사람과 둘이서 작은 장사를 시작함" },
        risk: { chance: 0.3, effect: { money: -150000, log: "첫 거래가 틀어져 밑천을 날림" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "더 큰 무리에서 당신을 데려가고 싶다는 전갈이 왔습니다. 받아들이면 이름은 커지지만, 지금까지 혼자 지켜 온 뱃길과 규칙은 버려야 합니다. 전갈을 가져온 사자가 부두에서 대답을 기다립니다.",
        choices: [
          { title: "큰 무리에 들어간다", desc: "이름은 커지지만 자유를 잃는다",
            effect: { bounty: "+30%", standing: 5, happiness: -6, traits: { "야심": 1 },
                      log: "큰 무리의 부름에 응해 혼자의 뱃길을 접음" } },
          { title: "혼자의 뱃길을 지킨다", desc: "자유롭지만 기회를 놓친다",
            effect: { happiness: 4, skills: { "항해술": 4 }, traits: { "신중": 1 },
                      memory: "혼자 정한 다음 항로", log: "큰 무리의 부름을 거절하고 혼자 항해를 이어 감" } },
          { title: "사자를 꾀어 둘이서 떠난다", desc: "곁을 얻지만 무리를 적으로 돌린다",
            effect: { relationship: 4, money: -100000, newCompanion: true, traits: { "용기": 1 },
                      log: "전갈을 가져온 사자와 둘이서 출항함" },
            risk: { chance: 0.3, effect: { health: -8, log: "체면을 구긴 무리에게 쫓겨 칼을 맞음" } } }
        ]
      },
      "해군": {
        body: "먼 바다의 본부 지부로 전출하라는 제안이 내려왔습니다. 가면 진급이 빨라지지만, 지금 부대에서 쌓은 자리는 처음부터 다시 쌓아야 합니다. 제안서를 가져온 젊은 전령이 당신의 서명을 기다립니다.",
        choices: [
          { title: "전출에 서명한다", desc: "진급은 빠르지만 다시 혼자다",
            effect: { standing: 6, happiness: -6, relationship: -5, traits: { "야심": 1 },
                      log: "먼 바다 지부로 전출을 받아들임" } },
          { title: "지금 부대에 남는다", desc: "익숙하지만 진급을 놓친다",
            effect: { happiness: 4, skills: { "항해술": 4 }, traits: { "신중": 1 },
                      memory: "서명하지 않은 전출서", log: "전출 제안을 거절하고 부대에 남음" } },
          { title: "전령을 부관으로 청한다", desc: "곁을 얻지만 윗선 눈 밖에 난다",
            effect: { relationship: 4, standing: -4, newCompanion: true, traits: { "용기": 1 },
                      log: "전출을 미루고 젊은 전령을 부관으로 데려옴" } }
        ]
      },
      "*": {}
    }
  },

  // 8. 외로움
  {
    key: "cmp_a_festival_alone",
    pool: "companion",
    when: { companion: false, minAge: 18 },
    title: "혼자 걷는 축제의 밤",
    body: "{여기}에 축제가 열려 거리마다 등불과 노랫소리가 가득합니다. 다들 누군가와 팔짱을 끼고 걷는데, 당신 옆자리만 비어 있습니다. 노점 술자리에서 혼자 온 손님 하나가 빈 잔을 당신 쪽으로 밀어 줍니다.",
    choices: [
      { title: "혼자 축제를 끝까지 걷는다", desc: "제 박자로 즐기지만 쓸쓸하다",
        effect: { happiness: 3, relationship: -3, knowledge: 2, traits: { "신중": 1 },
                  memory: "혼자 올려다본 축제 등불", log: "축제의 밤을 혼자 끝까지 걸음" } },
      { title: "밀어 준 잔을 받는다", desc: "말동무가 생기지만 밤이 길다",
        effect: { happiness: 5, relationship: 4, money: -30000, newCompanion: true, traits: { "선량": 1 },
                  log: "축제 노점에서 만난 손님과 밤새 잔을 나눔" },
        risk: { chance: 0.25, effect: { money: -80000, log: "취한 사이 지갑을 털림" } } },
      { title: "축제 대목에 일을 한다", desc: "돈은 벌지만 밤은 지나간다",
        effect: { money: 60000, happiness: -6, traits: { "야심": 1 },
                  log: "축제 밤에도 쉬지 않고 대목 일을 함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "숨어 지내는 항구에 축제가 열려 거리마다 등불이 가득합니다. 얼굴을 가린 채 걷는 당신 곁만 비어 있습니다. 노점 술자리에서 역시 얼굴을 가린 손님 하나가 빈 잔을 당신 쪽으로 밀어 줍니다.",
        choices: [
          {},
          { title: "밀어 준 잔을 받는다", desc: "말동무가 생기지만 정체가 샐 수 있다",
            effect: { happiness: 5, relationship: 4, money: -30000, newCompanion: true, traits: { "선량": 1 },
                      log: "얼굴을 가린 손님과 축제 밤에 잔을 나눔" },
            risk: { chance: 0.25, effect: { bounty: "+15%", log: "술김에 흘린 이름이 해군 귀에 들어감" } } },
          { title: "축제 틈에 창고를 턴다", desc: "몫은 챙기지만 밤은 지나간다",
            effect: { money: 100000, happiness: -6, standing: 2, traits: { "야심": 1 },
                      log: "모두가 축제에 나간 틈에 창고를 텀" } }
        ]
      },
      "해군": {
        body: "기지 밖 마을에 축제가 열렸지만 당신은 당직표에 이름이 올라 있습니다. 동기들은 짝을 지어 외출했고, 망루에서 혼자 불꽃을 올려다봅니다. 아래에서 같은 당직의 취사병이 따뜻한 차 두 잔을 들고 올라옵니다.",
        choices: [
          { title: "혼자 망루를 지킨다", desc: "제 몫은 하지만 쓸쓸하다",
            effect: { standing: 3, happiness: -2, relationship: -3, traits: { "신중": 1 },
                      memory: "망루에서 본 축제 불꽃", log: "축제 밤에 혼자 망루 당직을 섬" } },
          { title: "취사병과 차를 나눈다", desc: "말동무가 생기지만 경계가 느슨해진다",
            effect: { happiness: 5, relationship: 4, newCompanion: true, traits: { "선량": 1 },
                      log: "망루에서 취사병과 차를 나누며 친해짐" },
            risk: { chance: 0.25, effect: { standing: -5, log: "수다를 떨다 순찰 점검에 걸림" } } },
          { title: "남의 당직까지 맡아 선다", desc: "공은 쌓이지만 밤은 지나간다",
            effect: { standing: 5, happiness: -6, traits: { "야심": 1 },
                      log: "축제 밤에 동기들 당직까지 대신 섬" } }
        ]
      },
      "*": {}
    }
  },

  // 9. 누군가를 곁에 들일 기회
  {
    key: "cmp_a_follower",
    pool: "companion",
    when: { companion: false, minAge: 22 },
    title: "따라붙는 젊은이",
    body: "며칠째 한 젊은이가 일터 앞을 서성이다 당신을 따라옵니다. 당신이 일하는 모습을 보고 배우고 싶어졌다며, 잠잘 곳과 밥만 있으면 무엇이든 하겠다고 합니다. 혼자 살아온 집에는 방이 하나뿐입니다.",
    choices: [
      { title: "곁에 두고 가르친다", desc: "곁을 얻지만 먹여 살려야 한다",
        effect: { relationship: 5, happiness: 4, money: -80000, newCompanion: true, traits: { "선량": 1 },
                  log: "따라붙던 젊은이를 집에 들여 일을 가르침" } },
      { title: "혼자가 편하다며 돌려보낸다", desc: "자유롭지만 마음 한쪽이 빈다",
        effect: { happiness: -3, money: 30000, skills: { "장사": 3 }, traits: { "신중": 1 },
                  memory: "돌아서던 젊은이의 등", log: "따라온 젊은이를 돌려보내고 혼자 일함" } },
      { title: "힘든 일부터 시켜 본다", desc: "쓸 만한지 보지만 떠날 수 있다",
        effect: { money: 40000, relationship: -3, traits: { "야심": 1 },
                  log: "젊은이에게 궂은일만 맡겨 시험함" },
        risk: { chance: 0.3, effect: { happiness: -5, reputation: -4, log: "젊은이가 혹사당했다며 동네에 말을 퍼뜨림" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "보급을 마치고 돌아오니 배 밑창 짐 사이에 젊은이 하나가 숨어 있습니다. 당신 수배서를 보고 따라왔다며, 무엇이든 할 테니 데려가 달라고 합니다. 혼자 몰던 배에는 식량이 한 사람 몫뿐입니다.",
        choices: [
          { title: "선원으로 받아들인다", desc: "곁을 얻지만 식량이 모자란다",
            effect: { relationship: 5, happiness: 4, money: -80000, newCompanion: true, traits: { "선량": 1 },
                      log: "밀항한 젊은이를 선원으로 받아들임" } },
          { title: "다음 항구에 내려 준다", desc: "가볍게 떠나지만 마음 한쪽이 빈다",
            effect: { happiness: -3, skills: { "항해술": 3 }, traits: { "신중": 1 },
                      memory: "부두에 남은 젊은이의 손짓", log: "밀항자를 다음 항구에 내려 주고 혼자 떠남" } },
          { title: "궂은일부터 시켜 본다", desc: "쓸 만한지 보지만 소문이 난다",
            effect: { standing: 3, relationship: -3, traits: { "야심": 1 },
                      log: "밀항한 젊은이에게 갑판의 궂은일만 맡김" },
            risk: { chance: 0.3, effect: { bounty: "+15%", log: "도망친 젊은이가 해군에 당신 항로를 불어 버림" } } }
        ]
      },
      "해군": {
        body: "훈련소를 갓 나온 신병 하나가 며칠째 당신 뒤를 따라다닙니다. 배치받은 반에 적응하지 못했다며, 당신 밑에서 배우고 싶다고 합니다. 혼자 일해 온 당신에게 부하를 두라는 명령은 없었습니다.",
        choices: [
          { title: "밑에 두고 가르친다", desc: "곁을 얻지만 책임을 진다",
            effect: { relationship: 5, happiness: 4, standing: -2, newCompanion: true, traits: { "선량": 1 },
                      log: "적응 못 하던 신병을 맡아 직접 가르침" },
            risk: { chance: 0.2, effect: { standing: -4, log: "신병의 실수로 함께 경위서를 씀" } } },
          { title: "원래 반으로 돌려보낸다", desc: "규정대로지만 마음 한쪽이 빈다",
            effect: { happiness: -3, standing: 3, traits: { "신중": 1 },
                      memory: "경례하고 돌아서던 신병", log: "따라온 신병을 원래 반으로 돌려보냄" } },
          { title: "혹독한 훈련부터 시킨다", desc: "단단해지지만 떠날 수 있다",
            effect: { combat: 3, relationship: -3, traits: { "용기": 1 },
                      log: "따라온 신병에게 혹독한 훈련을 함께 시킴" },
            risk: { chance: 0.3, effect: { standing: -4, log: "신병이 훈련 중 다쳐 상관에게 불려 감" } } }
        ]
      },
      "*": {}
    }
  },

  // 10. 말을 잊은 날들
  {
    key: "cmp_a_silent_days",
    pool: "companion",
    when: { companion: false, minAge: 25 },
    title: "말을 잊은 사흘",
    body: "문득 사흘 동안 누구와도 말을 나누지 않았다는 걸 깨닫습니다. 집은 조용하고 일은 손에 익었으며, 아무도 당신을 귀찮게 하지 않습니다. 창밖에서는 동네 사람들이 무너진 담장을 함께 고치자며 일손을 모으고 있습니다.",
    choices: [
      { title: "고요함을 수련으로 바꾼다", desc: "강해지지만 더 혼자가 된다",
        effect: { combat: 4, happiness: -4, relationship: -3, traits: { "용기": 1 },
                  log: "아무도 없는 날들을 혼자 수련으로 채움" } },
      { title: "그날그날을 글로 적는다", desc: "생각은 깊어지지만 말은 준다",
        effect: { knowledge: 4, happiness: 2, relationship: -2, traits: { "신중": 1 },
                  memory: "혼자 쓴 두꺼운 일기장", log: "말 없는 날들을 일기장에 적어 내려감" } },
      { title: "담장 일에 손을 보탠다", desc: "곁을 얻지만 몸이 고되다",
        effect: { relationship: 5, health: -4, standing: 3, newCompanion: true, traits: { "선량": 1 },
                  log: "동네 담장을 함께 고치다 말동무가 생김" } }
    ],
    by: {
      "해적|혁명군": {
        body: "혼자 숨어 지낸 지 사흘, 누구와도 말을 나누지 않았다는 걸 깨닫습니다. 들키지 않으려면 이대로가 가장 안전합니다. 은신처 아래 어촌에서는 사람들이 폭풍에 찢긴 그물을 함께 깁고 있습니다.",
        choices: [
          {},
          {},
          { title: "그물 깁는 일에 끼어든다", desc: "곁을 얻지만 얼굴이 알려진다",
            effect: { relationship: 5, health: -4, newCompanion: true, traits: { "선량": 1 },
                      log: "어촌 사람들과 그물을 깁다 말동무가 생김" },
            risk: { chance: 0.25, effect: { bounty: "+15%", log: "어촌에 낯선 사람이 산다는 소문이 퍼짐" } } }
        ]
      },
      "해군": {
        body: "외딴 등대 초소에 배치된 지 몇 달, 사흘 동안 무전 말고는 누구와도 말하지 않았습니다. 근무 기록은 흠잡을 데 없지만 목소리가 낯설게 느껴집니다. 아래 마을에서는 주민들이 부서진 선착장을 함께 고치고 있습니다.",
        choices: [
          {},
          { title: "근무 일지를 꼼꼼히 쓴다", desc: "공은 쌓이지만 말은 준다",
            effect: { knowledge: 4, standing: 3, relationship: -2, traits: { "신중": 1 },
                      memory: "등대 초소의 근무 일지", log: "외딴 초소에서 근무 일지를 빈틈없이 씀" } },
          { title: "선착장 일에 손을 보탠다", desc: "곁을 얻지만 초소를 비운다",
            effect: { relationship: 5, health: -4, newCompanion: true, traits: { "선량": 1 },
                      log: "마을 선착장을 함께 고치다 말동무가 생김" },
            risk: { chance: 0.25, effect: { standing: -5, log: "초소를 비운 사이 점검이 와 문책을 받음" } } }
        ]
      },
      "*": {}
    }
  },

  // 11. 혼자 맞는 폭풍
  {
    key: "cmp_a_storm_alone",
    pool: "companion",
    when: { companion: false, minAge: 18 },
    title: "혼자 맞는 폭풍",
    body: "한밤중에 폭풍이 몰아쳐 지붕 한쪽이 들썩입니다. 붙잡아 줄 손은 하나뿐이고, 빗물은 벌써 방 안으로 들이칩니다. 길 건너 이웃집 창에 불이 켜지고, 누군가 이쪽으로 손짓하는 그림자가 보입니다.",
    choices: [
      { title: "혼자 지붕을 붙든다", desc: "솜씨는 늘지만 위험하다",
        effect: { skills: { "제작": 5 }, health: -6, traits: { "용기": 1 },
                  log: "폭풍 속에서 혼자 지붕을 붙들어 고침" },
        risk: { chance: 0.25, effect: { health: -8, log: "젖은 지붕에서 미끄러져 떨어짐" } } },
      { title: "짐을 챙겨 창고로 피한다", desc: "몸은 지키지만 집이 상한다",
        effect: { money: -100000, happiness: -4, skills: { "항해술": 3 }, traits: { "신중": 1 },
                  memory: "창고 틈으로 본 번개", log: "폭풍을 피해 창고에서 혼자 밤을 새움" } },
      { title: "이웃의 손짓을 따라간다", desc: "곁을 얻지만 집은 비워 둔다",
        effect: { money: -100000, relationship: 5, happiness: -2, newCompanion: true, traits: { "선량": 1 },
                  log: "폭풍 밤을 이웃집에서 보내며 가까워짐" } }
    ],
    by: {
      "해적|혁명군": {
        body: "혼자 몰던 작은 배가 한밤의 거센 폭풍에 휘말립니다. 돛줄을 잡을 손은 하나뿐이고, 갑판에는 벌써 물이 찹니다. 멀리 같은 폭풍을 만난 어선 한 척이 등불을 흔들며 신호를 보냅니다.",
        choices: [
          { title: "혼자 돛줄을 붙든다", desc: "뱃솜씨는 늘지만 위험하다",
            effect: { skills: { "항해술": 6 }, health: -6, traits: { "용기": 1 },
                      log: "폭풍 속에서 혼자 돛줄을 붙들고 버팀" },
            risk: { chance: 0.25, effect: { health: -8, log: "돛대가 꺾이며 어깨를 맞음" } } },
          { title: "짐을 버려 배를 가볍게 한다", desc: "배는 살지만 짐을 잃는다",
            effect: { money: -100000, happiness: -4, skills: { "항해술": 3 }, traits: { "신중": 1 },
                      memory: "바다로 던진 짐 상자", log: "폭풍 속에서 짐을 버려 배를 살림" } },
          { title: "어선의 신호에 답한다", desc: "곁을 얻지만 배를 보여 준다",
            effect: { relationship: 5, happiness: -2, newCompanion: true, traits: { "선량": 1 },
                      log: "폭풍 속에서 어선과 밧줄을 묶고 함께 버팀" },
            risk: { chance: 0.25, effect: { bounty: "+15%", log: "어선 선원들이 항구에서 당신 배를 알아봄" } } }
        ]
      },
      "해군": {
        body: "혼자 지키는 해안 초소에 한밤의 폭풍이 몰아칩니다. 무전탑이 흔들리는데 교대병은 폭풍 때문에 오지 못합니다. 초소 아래 등대지기 집에 불이 켜지고, 누군가 등불을 흔들며 손짓합니다.",
        choices: [
          { title: "혼자 무전탑을 붙든다", desc: "공은 쌓이지만 위험하다",
            effect: { standing: 5, health: -6, traits: { "용기": 1 },
                      log: "폭풍 속에서 혼자 무전탑을 지켜 냄" },
            risk: { chance: 0.25, effect: { health: -8, log: "젖은 철탑에서 미끄러져 떨어짐" } } },
          { title: "초소 안에서 버틴다", desc: "몸은 지키지만 장비가 상한다",
            effect: { standing: -3, happiness: -4, skills: { "항해술": 3 }, traits: { "신중": 1 },
                      memory: "초소 창을 때리던 빗줄기", log: "폭풍 밤을 초소 안에서 혼자 버팀" } },
          { title: "등대지기의 손짓을 따른다", desc: "곁을 얻지만 초소를 비운다",
            effect: { relationship: 5, standing: -4, newCompanion: true, traits: { "선량": 1 },
                      log: "폭풍 밤을 등대지기 집에서 보내며 가까워짐" } }
        ]
      },
      "*": {}
    }
  },

  // 12. 혼자 해낸 일
  {
    key: "cmp_a_lone_feat",
    pool: "companion",
    when: { companion: false, minAge: 25 },
    title: "아무도 모르는 공",
    body: "몇 해 동안 혼자 붙들고 있던 일이 마침내 결실을 봅니다. 축하해 줄 사람도, 공을 나눌 사람도 없습니다. 그동안 재료를 대 주던 가게 주인만이 소식을 듣고 문 앞에 찾아와 함께 기뻐해도 되겠느냐고 묻습니다.",
    choices: [
      { title: "공을 혼자 차지한다", desc: "이름은 나지만 사람을 잃는다",
        effect: { money: 150000, reputation: 5, relationship: -4, traits: { "야심": 1 },
                  log: "혼자 해낸 일의 공과 값을 모두 차지함" } },
      { title: "아무에게도 알리지 않는다", desc: "조용히 뿌듯하지만 아무도 모른다",
        effect: { happiness: 7, skills: { "제작": 4 }, traits: { "신중": 1 },
                  memory: "혼자 올린 작은 축배", log: "혼자 해낸 일을 아무에게도 알리지 않음" } },
      { title: "가게 주인과 기쁨을 나눈다", desc: "곁을 얻지만 몫도 나눈다",
        effect: { relationship: 5, happiness: 4, money: -60000, newCompanion: true, traits: { "선량": 1 },
                  log: "재료를 대 주던 가게 주인과 결실을 나눔" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 동안 혼자 쫓던 보물 지도의 끝에서 마침내 상자를 찾아냅니다. 함께 기뻐할 선원도, 나눌 몫도 없습니다. 지도 조각을 팔았던 늙은 항해사가 소식을 듣고 찾아와, 함께 축배를 들어도 되겠느냐고 묻습니다.",
        choices: [
          { title: "보물을 혼자 차지한다", desc: "이름은 나지만 사람을 잃는다",
            effect: { money: 300000, bounty: "+20%", relationship: -4, traits: { "야심": 1 },
                      log: "혼자 찾은 보물을 남김없이 차지함" } },
          { title: "아무에게도 알리지 않는다", desc: "조용히 뿌듯하지만 아무도 모른다",
            effect: { happiness: 7, skills: { "항해술": 4 }, traits: { "신중": 1 },
                      memory: "혼자 연 보물 상자", log: "혼자 찾은 보물을 아무에게도 알리지 않음" } },
          { title: "늙은 항해사와 잔을 든다", desc: "곁을 얻지만 몫도 나눈다",
            effect: { relationship: 5, happiness: 4, money: -60000, newCompanion: true, traits: { "선량": 1 },
                      log: "지도를 팔았던 늙은 항해사와 보물을 나눔" } }
        ]
      },
      "해군": {
        body: "몇 해 동안 혼자 쫓던 밀수 조직의 장부를 마침내 손에 넣습니다. 보고서에 이름을 함께 올릴 부하도 없습니다. 그동안 몰래 제보를 해 주던 항구 서기가 찾아와, 자기 이름도 넣어 줄 수 있느냐고 조심스레 묻습니다.",
        choices: [
          { title: "공을 혼자 보고한다", desc: "공은 크지만 사람을 잃는다",
            effect: { standing: 7, reputation: 4, relationship: -4, traits: { "야심": 1 },
                      log: "밀수 조직 적발의 공을 혼자 보고함" } },
          { title: "이름을 빼고 장부만 넘긴다", desc: "조용히 뿌듯하지만 아무도 모른다",
            effect: { happiness: 7, knowledge: 3, traits: { "신중": 1 },
                      memory: "서랍 속 밀수 장부", log: "밀수 장부를 넘기고 이름은 빼 둠" } },
          { title: "서기의 이름을 함께 올린다", desc: "곁을 얻지만 공이 나뉜다",
            effect: { relationship: 5, happiness: 4, standing: 2, newCompanion: true, traits: { "선량": 1 },
                      log: "제보해 준 항구 서기와 공을 나눔" } }
        ]
      },
      "*": {}
    }
  }
]);
