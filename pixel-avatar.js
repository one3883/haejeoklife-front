/* =====================================================================
   도트 캐릭터 레이어 (pixel-avatar.js)
   ---------------------------------------------------------------------
   장면 그림(#sceneArt) 위에 플레이어와 가족을 코드(Canvas)로 그려 올린다.
   - 이미지 파일을 새로 만들지 않고, 격자 픽셀을 코드로 찍어 캐릭터를 만든다.
   - 기존 사건·선택지·확률·UI·저장 구조는 건드리지 않는다.
     showArtFor·tacOpenFight를 감싸 '지금 어떤 장면인지'만 읽어 온다.
   - p에 덧붙이는 값은 외형 시드(p.look) 하나뿐이다. 저장 JSON에 그대로 실리므로
     불러오기 뒤에도 같은 얼굴이 유지되고, 예전 저장에서는 처음 그릴 때 만들어진다.
   - 가족(NPC) 외형은 NPC id로 정해지므로 따로 저장하지 않아도 매번 같다.
   ===================================================================== */
(() => {
  "use strict";
  const box = document.getElementById("sceneArt");
  if (!box || typeof showArtFor !== "function") return;
  window.PIXEL_AVATAR_VERSION = "20261124a";

  /* ---------------- 공용 도구 ---------------- */
  const hash = (s) => {
    let h = 2166136261;
    s = String(s);
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  };
  const rng = (seed) => {
    let x = seed >>> 0 || 1;
    return () => {
      x ^= x << 13; x >>>= 0;
      x ^= x >>> 17;
      x ^= x << 5; x >>>= 0;
      return x / 4294967296;
    };
  };
  const pick = (r, a) => a[Math.min(a.length - 1, Math.floor(r() * a.length))];
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
    return "#" + ((1 << 24) | (c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).slice(1);
  }
  const G = (name) => {
    // 본편 스크립트의 전역(let/const 포함)을 안전하게 읽는다
    try {
      switch (name) {
        case "p": return typeof p !== "undefined" ? p : null;
        case "finished": return typeof finished !== "undefined" ? finished : false;
        case "showArt": return typeof showArt !== "undefined" ? showArt : true;
        case "careerLadders": return typeof careerLadders !== "undefined" ? careerLadders : null;
      }
    } catch (e) {}
    return null;
  };
  const scaleOf = (race) => {
    try { if (typeof lifeScale === "function") return lifeScale(race) || 1; } catch (e) {}
    return race === "거인족" ? 3 : race === "소인족" ? 1.5 : 1;
  };

  /* ---------------- 팔레트 ---------------- */
  const SKIN = ["#f3cfae", "#e9b48c", "#e9b48c", "#dca277", "#c4875a", "#9a643f", "#6f4529"];
  const SKIN_FISH = ["#6fa3c4", "#76b0a3", "#5b86b8", "#8aa9c0", "#c97a6a"];
  const SKIN_BUCC = ["#c4875a", "#9a643f", "#6f4529", "#dca277"];
  const HAIR = ["#2b2420", "#2b2420", "#2b2420", "#3d2a1e", "#5a3a22", "#8a5a2b", "#c9a24a", "#e3c770", "#9c3b26",
    "#2b2420", "#3d2a1e", "#2f3f6b", "#3f6b3a", "#c25b8c", "#e8e8e8"];
  const FUR = ["#d6a062", "#efe0c6", "#9b8b7b", "#c47538", "#6b5a4c", "#f2f2f2"];
  const TAIL = ["#2fa39b", "#e2668a", "#4f86d6", "#8a63cf", "#e0a33a"];
  const CASUAL = ["#b8443a", "#3f78c0", "#d9a832", "#5c9a52", "#8f58b8", "#d9762f", "#3c9a9a", "#c25b7a"];
  const PASTEL = ["#f2c9cf", "#c9dcf2", "#f2e6b8", "#cfe9c9", "#e2d0f0"];
  const PANTS = "#2f4058";
  const EYE = "#2a221e";
  const GOLD = "#d8b13a";
  const WHITE = "#eef1f5";

  function genLook(seed, race) {
    const r = rng(seed);
    const look = {
      v: 1,
      seed,
      race,
      skin: pick(r, SKIN),
      hair: pick(r, HAIR),
      style: Math.floor(r() * 3),
      fur: pick(r, FUR),
      tail: pick(r, TAIL),
      shirt: pick(r, CASUAL),
      baby: pick(r, PASTEL),
      skirt: r() < 0.5,
    };
    if (race === "어인") look.skin = pick(r, SKIN_FISH);
    if (race === "버커니어족") look.skin = pick(r, SKIN_BUCC);
    if (race === "밍크족") look.skin = look.fur;
    if (look.hair === "#e8e8e8" && r() < 0.7) look.hair = "#2b2420"; // 젊은 흰머리는 드물게
    return look;
  }
  // 플레이어 외형: 출생 정보로 시드를 정해 p.look에 담는다(저장·불러오기 후에도 동일)
  function playerLook(P) {
    const l = P.look;
    if (!l || l.v !== 1 || typeof l.seed !== "number") {
      const seed = hash([P.name, P.birthYear, P.race, P.gender, (P.birthPlace || P.place || {}).name].join("|"));
      P.look = genLook(seed, P.race);
    } else if (l.race !== P.race) {
      // 종족이 바뀌는 일이 생기면 피부·털만 새 종족에 맞추고 나머지 얼굴은 유지한다
      const fresh = genLook(l.seed, P.race);
      l.race = P.race;
      l.skin = fresh.skin;
      l.fur = fresh.fur;
    }
    return P.look;
  }

  /* ---------------- 나이 단계·체형 ---------------- */
  const stageOf = (a) => (a <= 3 ? "infant" : a <= 12 ? "child" : a <= 17 ? "teen" : a <= 59 ? "adult" : "elder");
  const DIM = {
    infant: { hw: 6, hh: 5, hairH: 1, tw: 6, th: 4, aw: 1, ah: 3, lw: 2, lg: 1, lh: 2 },
    child: { hw: 7, hh: 6, hairH: 2, tw: 8, th: 6, aw: 2, ah: 5, lw: 3, lg: 1, lh: 4 },
    teen: { hw: 8, hh: 7, hairH: 2, tw: 10, th: 8, aw: 2, ah: 7, lw: 3, lg: 2, lh: 6 },
    adult: { hw: 8, hh: 8, hairH: 3, tw: 12, th: 10, aw: 2, ah: 9, lw: 4, lg: 2, lh: 7 },
    elder: { hw: 8, hh: 8, hairH: 3, tw: 12, th: 10, aw: 2, ah: 9, lw: 4, lg: 2, lh: 6 },
  };
  function dimFor(stage, gender) {
    const d = Object.assign({}, DIM[stage]);
    if (gender === "여성") {
      if (stage === "adult" || stage === "elder") { d.tw = 10; d.lw = 3; }
      if (stage === "teen") { d.tw = 9; }
    }
    return d;
  }

  /* ---------------- 직업·직급 → 복장 ---------------- */
  const JOBS = [
    ["doctor", /의사|의학|간호/],
    ["scientist", /과학자|연구원/],
    ["scholar", /학자|교수|연구 조수|고고학/],
    ["chef", /요리|주방|식당/],
    ["merchant", /상인|상점|점원|무역/],
    ["fisher", /어부|어업|어선/],
    ["farmer", /농부|농사|농장|농가/],
    ["hunter", /사냥꾼|사냥단/],
    ["adventurer", /모험가|탐험/],
    ["sailor", /선원|항해사/],
    ["worker", /조선|노동자|하역|항만|기술자|견습생|장인|대장장이/],
    ["retiree", /은퇴/],
  ];
  function tierOf(job, level) {
    const L = G("careerLadders");
    const ladder = L && L[job];
    if (!ladder || ladder.length < 2) return 0;
    const f = Math.max(0, level || 0) / (ladder.length - 1);
    return f >= 0.99 ? 3 : f >= 0.6 ? 2 : f >= 0.3 ? 1 : 0;
  }
  function levelOf(job, rank) {
    const L = G("careerLadders");
    const ladder = L && L[job];
    const i = ladder && rank ? ladder.indexOf(rank) : -1;
    return i < 0 ? 0 : i;
  }
  /*
    o: { status, job, track, rank, tier, stage, gender, look, captain }
    반환: 복장 묘사 객체 (build()가 읽는다)
  */
  function outfitFor(o) {
    const look = o.look;
    const f = {
      kind: "casual", shirt: look.shirt, pants: PANTS, hat: null, coat: null, coatLong: false,
      sleeve: null, acc: [], stripes: null, skirt: false, overalls: null, ragged: false, bubble: false,
    };
    const st = String(o.status || ""), jobText = `${o.job || ""} ${o.track || ""}`;
    const rank = String(o.rank || "");
    if (o.stage === "infant") {
      f.kind = "baby"; f.shirt = look.baby; f.pants = look.baby; return f;
    }
    if (st === "천룡인" || /천룡인 자제/.test(jobText)) {
      f.kind = "celestial"; f.shirt = "#f4f4f4"; f.pants = "#e6e6e6"; f.bubble = true;
      if (o.tier >= 2 || /기사단|오로성/.test(rank)) { f.coat = "#f7f3e6"; f.coatLong = true; f.acc.push("chain"); }
      return f;
    }
    if (/노예/.test(jobText) || /노예/.test(st)) {
      f.kind = "slave"; f.shirt = "#8c8577"; f.pants = "#6b665c"; f.ragged = true; f.acc.push("collar"); return f;
    }
    if (o.stage === "child") {
      // 어린이는 직업 대신 평상복 (해적·해군 가족이면 살짝 티를 낸다)
      if (/견습생|가족 일을 돕는/.test(jobText)) f.acc.push("apronS");
      if (o.gender === "여성" && look.skirt) f.skirt = true;
      return f;
    }
    if (st === "해적" || /^해적$/.test(o.job || "")) {
      f.kind = "pirate";
      if (o.captain || o.tier >= 3) {
        f.shirt = "#b23a30"; f.coat = "#2a2230"; f.coatLong = true; f.acc.push("goldTrim", "sword");
        f.hat = { t: "pirate", col: "#24242a", band: GOLD, skull: true };
      } else if (o.tier >= 2) {
        f.shirt = "#a8352c"; f.hat = { t: "pirate", col: "#2b2b2e" }; f.acc.push("sash", "sword");
      } else if (o.tier >= 1) {
        f.shirt = "#b23a30"; f.hat = { t: "bandana", col: "#c9412f" }; f.acc.push("sash", "sword");
      } else {
        f.shirt = "#b23a30"; f.stripes = "#eadfcd"; f.hat = { t: "bandana", col: "#c9412f" };
      }
      return f;
    }
    if (st === "해군" || /해군/.test(jobText)) {
      f.kind = "navy";
      if (/대장|중장/.test(rank)) {
        f.shirt = "#2b3346"; f.pants = "#2b3346"; f.coat = "#f2f4f7"; f.coatLong = true;
        f.acc.push("tie", "epaulette"); if (/대장/.test(rank) && !/중장/.test(rank)) f.acc.push("medal");
      } else if (/소위|중위|대위|소령|중령|대령/.test(rank)) {
        f.shirt = "#e6eaf0"; f.acc.push("tie"); f.hat = { t: "officer" };
        if (/대령|중령|소령/.test(rank)) f.acc.push("epaulette");
      } else {
        f.shirt = "#e4e8ee"; f.acc.push("sailorCollar"); f.hat = { t: "navyCap" };
      }
      return f;
    }
    if (st === "혁명군" || /혁명군/.test(jobText)) {
      f.kind = "revolution"; f.shirt = "#3a3a3a"; f.coat = "#2f3b2f"; f.coatLong = true;
      f.hat = o.tier >= 3 ? null : { t: "hood", col: "#2f3b2f" }; if (o.tier >= 2) f.acc.push("scarf");
      return f;
    }
    if (o.stage !== "child" && o.stage !== "infant") {
      for (const [k, re] of JOBS) {
        if (!re.test(jobText)) continue;
        f.kind = k;
        const t = o.tier;
        switch (k) {
          case "doctor":
            f.shirt = t >= 1 ? "#a9c9e6" : "#efeee6"; f.acc.push("stethoscope");
            if (t >= 1) { f.coat = WHITE; f.coatLong = true; }
            if (t >= 3) f.acc.push("medal");
            break;
          case "scientist":
            f.shirt = "#5b7fa6"; f.coat = WHITE; f.coatLong = true; f.hat = { t: "goggles" };
            if (t >= 2) f.acc.push("glasses");
            break;
          case "scholar":
            f.shirt = "#7a6a4a"; f.acc.push("glasses", "book");
            if (t >= 2) { f.coat = "#4a3f5c"; f.coatLong = true; }
            break;
          case "chef":
            f.shirt = "#f2f2ee"; f.acc.push("buttons");
            f.hat = t >= 1 ? { t: "chef", tall: t >= 3 } : { t: "headband", col: "#f2f2ee" };
            if (t === 0) f.acc.push("apron");
            break;
          case "merchant":
            if (/점원/.test(jobText) && t < 3) { f.shirt = "#6a8a52"; f.acc.push("apron"); }
            else if (t >= 3) { f.shirt = "#6a8a52"; f.coat = "#3b2f2a"; f.hat = { t: "top" }; f.acc.push("chain", "bag"); }
            else if (t >= 2) { f.shirt = "#6a8a52"; f.acc.push("vest", "bag", "chain"); }
            else { f.shirt = "#6a8a52"; f.acc.push("bag"); }
            break;
          case "fisher":
            f.shirt = "#3f6f9a"; f.hat = { t: "bucket", col: "#d8b84a" }; f.acc.push("rod");
            if (t >= 3) f.hat = { t: "skipper" };
            break;
          case "farmer":
            f.shirt = "#cf5a3e"; f.overalls = "#3f6aa0"; f.hat = { t: "straw", band: "#7a5a2e" };
            break;
          case "hunter":
            f.shirt = "#7d7d80"; f.coat = "#3a3230"; f.coatLong = true; f.acc.push("sword");
            if (t >= 2) f.hat = { t: "bandana", col: "#26262a" };
            break;
          case "adventurer":
            f.shirt = "#c9a66b"; f.acc.push("vest", "bag"); f.hat = { t: "explorer" };
            break;
          case "sailor":
            f.shirt = "#f1f1ee"; f.stripes = "#3c63a6";
            f.hat = t >= 3 ? { t: "skipper" } : { t: "beanie", col: "#2f4058" };
            break;
          case "worker":
            f.shirt = "#c7772f"; f.acc.push("belt");
            f.hat = t >= 2 ? { t: "hard" } : { t: "headband", col: "#f0ede4" };
            break;
          case "retiree":
            f.shirt = "#e8e0cf"; f.coat = "#a07d5a"; f.coatLong = false;
            break;
        }
        break;
      }
    }
    if (f.kind === "casual" && o.gender === "여성" && look.skirt) f.skirt = true;
    return f;
  }

  /* ---------------- 스프라이트 그리기 (격자 1칸 = 1px) ---------------- */
  const GW = 32, GH = 44;
  function build(a, blink, breath) {
    const c = document.createElement("canvas");
    c.width = GW; c.height = GH;
    const g = c.getContext("2d");
    const P = (x, y, w, h, col) => {
      if (!col || w <= 0 || h <= 0) return;
      g.fillStyle = col;
      g.fillRect(x, y, w, h);
    };
    const d = dimFor(a.stage, a.gender), look = a.look, f = a.outfit, race = a.race;
    const cx = GW >> 1, bottom = GH - 1;
    const up = breath ? 1 : 0;
    const legTop = bottom - d.lh;
    const tTop = legTop - d.th - up, tBot = legTop; // 몸통은 숨쉴 때 1칸 길어진다
    const tx = cx - (d.tw >> 1);
    const hx = cx - (d.hw >> 1), ht = tTop - d.hh;
    const skin = look.skin;
    const elder = a.stage === "elder";
    const hairCol = elder ? (a.ageReal >= 80 ? "#e4e4e4" : "#bdbdbd") : look.hair;
    const mermaidTail = race === "인어" && a.stageAge < 30;

    // ── 뒤쪽: 날개·꼬리 ──
    if (race === "스카이피안") {
      const wy = tTop + 1;
      P(tx - d.aw - 3, wy, 3, 2, "#f6f6f6"); P(tx - d.aw - 2, wy + 2, 2, 2, "#f6f6f6");
      P(tx + d.tw + d.aw, wy, 3, 2, "#f6f6f6"); P(tx + d.tw + d.aw, wy + 2, 2, 2, "#f6f6f6");
      P(tx - d.aw - 3, wy + 1, 1, 1, "#cfd6de"); P(tx + d.tw + d.aw + 2, wy + 1, 1, 1, "#cfd6de");
    }
    if ((race === "소인족" || race === "밍크족") && !mermaidTail) {
      const tc = race === "소인족" ? shade(look.fur, 1.1) : look.fur;
      P(tx + d.tw, legTop - 2, 2, 2, tc); P(tx + d.tw + 1, legTop - 4, 2, 2, tc);
    }

    // ── 다리 ──
    const legsW = d.lw * 2 + d.lg, lx = cx - (legsW >> 1);
    if (mermaidTail) {
      let w = legsW;
      for (let y = legTop; y < bottom - 1; y++) {
        const off = Math.floor((y - legTop) / 3);
        const ww = Math.max(2, w - off);
        P(cx - (ww >> 1), y, ww, 1, look.tail);
        if ((y + off) % 2 === 0) P(cx - (ww >> 1) + 1, y, 1, 1, shade(look.tail, 1.25));
      }
      P(cx - (legsW >> 1) - 1, bottom - 1, legsW + 2, 1, shade(look.tail, 0.85));
    } else {
      const pc = f.overalls || f.pants;
      P(lx, legTop, d.lw, d.lh, pc);
      P(lx + d.lw + d.lg, legTop, d.lw, d.lh, pc);
    }

    // ── 몸통 ──
    const tH = tBot - tTop;
    P(tx, tTop, d.tw, tH, f.shirt);
    if (f.stripes) for (let y = tTop + 2; y < tBot - 1; y += 2) P(tx + 1, y, d.tw - 2, 1, f.stripes);
    const tOut = shade(f.shirt, 0.62);
    if (a.stage !== "infant") {
      P(tx, tTop, d.tw, 1, tOut); P(tx, tBot - 1, d.tw, 1, tOut);
      P(tx, tTop, 1, tH, tOut); P(tx + d.tw - 1, tTop, 1, tH, tOut);
    }
    if (f.overalls) {
      P(cx - 3, tTop + Math.floor(tH / 2), 6, Math.ceil(tH / 2), f.overalls);
      P(cx - 3, tTop, 1, tH, f.overalls); P(cx + 2, tTop, 1, tH, f.overalls);
      P(cx - 2, tTop + Math.floor(tH / 2) + 1, 1, 1, GOLD); P(cx + 1, tTop + Math.floor(tH / 2) + 1, 1, 1, GOLD);
    }
    if (f.skirt) {
      const sk = shade(f.shirt, 0.8);
      P(tx - 1, tBot - 2, d.tw + 2, 2, sk); P(tx - 1, tBot, d.tw + 2, Math.max(1, Math.floor(d.lh / 3)), sk);
    }
    if (f.ragged) for (let x = tx; x < tx + d.tw; x += 2) g.clearRect(x, tBot - 1, 1, 1);

    const has = (k) => f.acc.includes(k);
    if (has("vest")) { const vc = "#5a4029"; P(tx, tTop, 3, tH, vc); P(tx + d.tw - 3, tTop, 3, tH, vc); }
    if (has("apron") || has("apronS")) {
      P(tx + 2, tTop + Math.floor(tH / 3), d.tw - 4, tBot - tTop - Math.floor(tH / 3) + 2, "#ece7da");
      P(tx + 2, tTop, 1, Math.floor(tH / 3), "#ece7da"); P(tx + d.tw - 3, tTop, 1, Math.floor(tH / 3), "#ece7da");
    }
    if (has("sailorCollar")) {
      const nc = "#3b64a0";
      P(tx + 1, tTop + 1, d.tw - 2, 1, nc); P(cx - 2, tTop + 2, 1, 1, nc); P(cx + 1, tTop + 2, 1, 1, nc);
      P(cx - 1, tTop + 3, 2, 1, "#c9412f");
    }
    if (has("tie")) { P(cx - 1, tTop + 1, 2, 1, "#2f5fa8"); P(cx - 1, tTop + 2, 2, Math.min(5, tH - 3), "#2f5fa8"); }
    if (has("buttons")) for (let y = tTop + 2; y < tBot - 1; y += 2) P(cx - 1, y, 1, 1, "#a8a8a2");
    if (has("sash")) { P(tx + 1, tBot - 3, d.tw - 2, 1, "#d6a73a"); P(cx, tBot - 3, 1, 2, "#b88a24"); }
    if (has("belt")) { P(tx + 1, tBot - 2, d.tw - 2, 1, "#3a2a1e"); P(cx - 1, tBot - 2, 2, 1, GOLD); }
    if (has("collar")) { P(tx + 2, tTop, d.tw - 4, 1, "#6d6d6d"); P(cx, tTop + 1, 1, 1, "#9a9a9a"); }
    if (has("stethoscope")) {
      const sc = "#4a4f57", L = tx + 3, R = tx + d.tw - 4, by = tTop + Math.min(5, tH - 3);
      P(L, tTop, 1, by - tTop, sc); P(R, tTop, 1, by - tTop, sc); P(L, by, R - L + 1, 1, sc);
      P(cx - 1, by, 2, 2, "#5d6470");
    }
    if (has("scarf")) P(tx + 1, tTop, d.tw - 2, 2, "#8a2b2b");

    // ── 겉옷(코트) ──
    if (f.coat) {
      const cc = f.coat, co = shade(cc, 0.7);
      const extra = f.coatLong ? Math.min(3, d.lh - 1) : 0;
      P(tx - 1, tTop, 4, tH + extra, cc); P(tx + d.tw - 3, tTop, 4, tH + extra, cc);
      P(tx - 1, tTop, d.tw + 2, 1, cc);
      P(tx + 2, tTop + 1, 1, tH + extra - 1, co); P(tx + d.tw - 3, tTop + 1, 1, tH + extra - 1, co);
      if (has("goldTrim")) { P(tx + 2, tTop + 1, 1, tH + extra - 1, GOLD); P(tx + d.tw - 3, tTop + 1, 1, tH + extra - 1, GOLD); }
    }
    if (has("chain")) { P(cx - 2, tTop + 3, 1, 1, GOLD); P(cx - 1, tTop + 4, 2, 1, GOLD); P(cx + 1, tTop + 3, 1, 1, GOLD); }
    if (has("medal")) { P(tx + 1 + (f.coat ? 2 : 0), tTop + 2, 1, 1, "#c9412f"); P(tx + 1 + (f.coat ? 2 : 0), tTop + 3, 1, 1, GOLD); }

    // ── 팔 ──
    const armY = tTop + (a.stage === "infant" ? 0 : 1);
    const sleeve = f.coat || f.sleeve;
    const drawArm = (x) => {
      if (sleeve) { P(x, armY, d.aw, Math.max(1, d.ah - 2), sleeve); P(x, armY + d.ah - 2, d.aw, 2, skin); }
      else if (f.kind === "baby") { P(x, armY, d.aw, 1, f.shirt); P(x, armY + 1, d.aw, d.ah - 1, skin); }
      else P(x, armY, d.aw, d.ah, skin);
    };
    drawArm(tx - d.aw); drawArm(tx + d.tw);
    if (has("epaulette")) { P(tx - d.aw, tTop, d.aw + 1, 1, GOLD); P(tx + d.tw - 1, tTop, d.aw + 1, 1, GOLD); }
    const handY = armY + d.ah - 1, rHandX = tx + d.tw + d.aw - 1;
    if (has("bag")) {
      const bx = tx + d.tw - 2, by = tBot - 4;
      P(bx, by, 4, 4, "#a07a3a"); P(bx, by + 3, 4, 1, "#7d5c28"); P(bx + 3, by, 1, 4, "#7d5c28");
      P(bx + 1, by - 1, 2, 1, "#7d5c28");
    }
    if (has("sword")) { P(tx - d.aw - 1, tBot - 2, 1, Math.min(d.lh, 6), "#c9ccd2"); P(tx - d.aw - 1, tBot - 3, 1, 1, "#26262a"); P(tx - d.aw - 2, tBot - 2, 3, 1, GOLD); }
    if (has("book")) { P(rHandX - 1, handY - 1, 3, 3, "#7a3b2a"); P(rHandX, handY - 1, 1, 3, "#e8dcc0"); }
    if (has("rod")) {
      for (let i = 0; i < 7; i++) P(rHandX + 1 + (i >> 1), handY - 1 - i, 1, 1, "#7a5a3a");
      P(rHandX + 5, handY - 8, 1, 4, "#d9d9d9");
    }
    if (a.cane) P(rHandX + 1, handY, 1, bottom - handY, "#7a5a3a");

    // ── 머리 ──
    P(hx, ht, d.hw, d.hh, skin);
    const eyeY = ht + Math.floor(d.hh * 0.5);
    const ex1 = hx + Math.floor(d.hw / 4), ex2 = hx + d.hw - 1 - Math.floor(d.hw / 4);
    if (race === "밍크족") {
      P(cx - 1, eyeY + 1, 2, 2, shade(look.fur, 1.18)); P(cx - 1, eyeY + 1, 2, 1, "#3a2a24");
    }
    if (race === "어인") { P(hx, eyeY + 1, 1, 1, shade(skin, 0.75)); P(hx + d.hw - 1, eyeY + 1, 1, 1, shade(skin, 0.75)); }
    if (blink) { P(ex1, eyeY, 1, 1, shade(skin, 0.72)); P(ex2, eyeY, 1, 1, shade(skin, 0.72)); }
    else { P(ex1, eyeY, 1, 1, EYE); P(ex2, eyeY, 1, 1, EYE); }
    if (a.stage === "infant" || a.stage === "child") {
      g.globalAlpha = 0.45; P(ex1 - 1, eyeY + 1, 1, 1, "#e46a6a"); P(ex2 + 1, eyeY + 1, 1, 1, "#e46a6a"); g.globalAlpha = 1;
    }
    if (has("glasses")) {
      P(ex1 - 1, eyeY, 1, 1, "#333"); P(ex2 + 1, eyeY, 1, 1, "#333");
      P(ex1, eyeY - 1, ex2 - ex1 + 1, 1, "#333");
    }

    // ── 머리카락 ──
    const female = a.gender === "여성";
    const style = look.style % 3;
    const hairTopY = ht - d.hairH;
    if (a.stage === "infant") {
      P(cx - 1, ht - 1, 2, 1, hairCol); P(cx, ht - 2, 1, 1, hairCol);
    } else if (!female) {
      if (elder && style === 1) {
        P(hx, ht, 1, 2, hairCol); P(hx + d.hw - 1, ht, 1, 2, hairCol); // 옆머리만 남은 대머리
      } else {
        P(hx, hairTopY, d.hw, d.hairH, hairCol);
        if (style === 0) P(hx - 1, ht - 1, d.hw + 2, 1, hairCol);
        if (style === 1) for (let x = hx; x < hx + d.hw; x += 2) P(x, hairTopY - 1, 1, 1, hairCol);
        if (style === 2) { P(hx, ht, d.hw - 3, 1, hairCol); P(hx, ht, 1, 2, hairCol); }
        else { P(hx, ht, 1, 1, hairCol); P(hx + d.hw - 1, ht, 1, 1, hairCol); }
      }
    } else {
      P(hx, hairTopY, d.hw, d.hairH, hairCol);
      P(hx, ht, d.hw, 1, hairCol); // 앞머리
      P(hx + 2, ht, d.hw - 4, 1, skin); // 이마가 살짝 보이게
      P(hx + 2 + ((look.seed >> 3) & 1), ht, 1, 1, hairCol);
      if (a.stage === "child") {
        P(hx - 2, eyeY - 1, 2, 2, hairCol); P(hx + d.hw, eyeY - 1, 2, 2, hairCol); // 양갈래
        P(hx - 1, ht, 1, 2, hairCol); P(hx + d.hw, ht, 1, 2, hairCol);
      } else if (style === 0) {
        P(hx - 1, ht - 1, 1, d.hh + 3, hairCol); P(hx + d.hw, ht - 1, 1, d.hh + 3, hairCol); // 긴 생머리
      } else if (style === 1) {
        P(cx - 2, hairTopY - 2, 4, 2, hairCol); // 올림머리
        P(hx - 1, ht, 1, 2, hairCol); P(hx + d.hw, ht, 1, 2, hairCol);
      } else {
        P(hx - 1, ht - 1, 1, d.hh, hairCol); P(hx + d.hw, ht - 1, 1, d.hh, hairCol); // 단발
      }
    }

    // ── 모자 ──
    const hat = f.hat;
    if (hat && a.stage !== "infant") {
      switch (hat.t) {
        case "pirate":
          P(hx + 1, ht - 4, d.hw - 2, 3, hat.col); P(hx - 2, ht - 1, d.hw + 4, 1, hat.col);
          P(hx - 1, ht - 2, d.hw + 2, 1, hat.col);
          if (hat.band) P(hx + 1, ht - 2, d.hw - 2, 1, hat.band);
          P(cx - 1, ht - 4 + (hat.band ? 0 : 1), 2, hat.skull ? 2 : 1, "#f2f2f2");
          break;
        case "bandana":
          P(hx, ht - 2, d.hw, 2, hat.col); P(hx - 1, ht, d.hw + 2, 1, hat.col);
          P(hx + d.hw, ht + 1, 2, 1, hat.col); P(hx + d.hw + 1, ht + 2, 1, 1, hat.col);
          break;
        case "navyCap":
          P(hx - 1, ht - 4, d.hw + 2, 3, "#e8edf3"); P(hx, ht - 1, d.hw, 1, "#3b64a0");
          break;
        case "officer":
          P(hx - 1, ht - 4, d.hw + 2, 2, "#f0f2f5"); P(hx, ht - 2, d.hw, 1, "#2b3a5a");
          P(cx - 1, ht - 3, 2, 1, GOLD); P(hx, ht - 1, d.hw, 1, "#1e1e24");
          break;
        case "chef": {
          const top = hat.tall ? 7 : 5;
          P(hx, ht - top, d.hw, top - 1, "#f7f7f4"); P(hx - 1, ht - top, d.hw + 2, 3, "#f7f7f4");
          P(hx, ht - 1, d.hw, 1, "#d9d9d4");
          break;
        }
        case "headband":
          P(hx, ht, d.hw, 1, hat.col); P(hx + d.hw, ht, 1, 2, hat.col);
          break;
        case "straw":
          P(hx + 1, ht - 3, d.hw - 2, 2, "#e6c24a"); P(hx + 1, ht - 2, d.hw - 2, 1, hat.band || "#c9412f");
          P(hx - 3, ht - 1, d.hw + 6, 1, "#d8b23f");
          break;
        case "bucket":
          P(hx, ht - 3, d.hw, 2, hat.col); P(hx - 1, ht - 1, d.hw + 2, 1, shade(hat.col, 0.82));
          break;
        case "top":
          P(hx + 1, ht - 6, d.hw - 2, 5, "#222226"); P(hx + 1, ht - 2, d.hw - 2, 1, "#8a2a2a");
          P(hx - 1, ht - 1, d.hw + 2, 1, "#222226");
          break;
        case "explorer":
          P(hx, ht - 3, d.hw, 2, "#c8a46a"); P(hx, ht - 2, d.hw, 1, "#6b4a2a"); P(hx - 2, ht - 1, d.hw + 4, 1, "#b8935a");
          break;
        case "hood":
          P(hx - 1, ht - 3, d.hw + 2, 3, hat.col); P(hx - 1, ht, 1, d.hh - 2, hat.col); P(hx + d.hw, ht, 1, d.hh - 2, hat.col);
          break;
        case "hard":
          P(hx, ht - 3, d.hw, 3, "#e6c23a"); P(hx - 1, ht - 1, d.hw + 2, 1, "#cfa92c");
          break;
        case "goggles":
          P(hx, ht, d.hw, 1, "#55575c"); P(hx + 1, ht - 1, 2, 2, "#8fd0e8"); P(hx + d.hw - 3, ht - 1, 2, 2, "#8fd0e8");
          break;
        case "beanie":
          P(hx, ht - 3, d.hw, 3, hat.col); P(hx, ht - 1, d.hw, 1, shade(hat.col, 1.35));
          break;
        case "skipper":
          P(hx - 1, ht - 4, d.hw + 2, 3, "#24324d"); P(hx, ht - 1, d.hw, 1, "#1b1b20"); P(cx - 1, ht - 3, 2, 1, GOLD);
          break;
      }
    }

    // ── 종족 표시: 귀·뿔·지느러미 ──
    if (race === "밍크족") {
      P(hx - 1, ht - 3, 2, 3, look.fur); P(hx + d.hw - 1, ht - 3, 2, 3, look.fur);
      P(hx, ht - 2, 1, 1, "#e9a3a3"); P(hx + d.hw - 1, ht - 2, 1, 1, "#e9a3a3");
    } else if (race === "버커니어족" && a.stage !== "infant") {
      P(hx - 1, ht - 2, 1, 2, "#e9dfc8"); P(hx - 2, ht - 3, 1, 1, "#e9dfc8");
      P(hx + d.hw, ht - 2, 1, 2, "#e9dfc8"); P(hx + d.hw + 1, ht - 3, 1, 1, "#e9dfc8");
    } else if (race === "어인" && !hat) {
      const fc = shade(skin, 0.68);
      P(cx - 1, hairTopY - 2, 2, 2, fc); P(cx, hairTopY - 3, 1, 1, fc);
    }

    // ── 천룡인 버블 헬멧 ──
    if (f.bubble) {
      const rx = (d.hw >> 1) + 2, ry = ((d.hh + d.hairH) >> 1) + 2, ccx = cx - 0.5, ccy = ht + d.hh / 2 - d.hairH / 2;
      for (let y = -ry - 1; y <= ry + 1; y++)
        for (let x = -rx - 1; x <= rx + 1; x++) {
          const v = (x * x) / (rx * rx) + (y * y) / (ry * ry);
          const px = Math.round(ccx + x), py = Math.round(ccy + y);
          if (v <= 1.0 && v > 0.72) { g.globalAlpha = 0.85; P(px, py, 1, 1, "#d6efff"); }
          else if (v <= 0.72) {
            const id = g.getImageData(px, py, 1, 1).data;
            if (id[3] < 10) { g.globalAlpha = 0.18; P(px, py, 1, 1, "#d6efff"); }
          }
        }
      g.globalAlpha = 1;
      P(Math.round(ccx - rx + 2), Math.round(ccy - ry + 1), 1, 2, "#ffffff");
    }

    // ── 배경 위에서도 잘 보이도록 옅은 외곽선 ──
    const img = g.getImageData(0, 0, GW, GH), D = img.data;
    const solid = (x, y) => x >= 0 && y >= 0 && x < GW && y < GH && D[(y * GW + x) * 4 + 3] > 200;
    const mark = [];
    for (let y = 0; y < GH; y++)
      for (let x = 0; x < GW; x++) {
        if (D[(y * GW + x) * 4 + 3] > 40) continue;
        if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) mark.push((y * GW + x) * 4);
      }
    for (const i of mark) { D[i] = 18; D[i + 1] = 20; D[i + 2] = 28; D[i + 3] = 110; }
    g.putImageData(img, 0, 0);
    return { c, headTop: ht - d.hairH, hw: d.hw, tw: d.tw, aw: d.aw };
  }

  const cache = new Map();
  function sprite(a, blink, breath) {
    const k = a.akey + "|" + (blink ? 1 : 0) + (breath ? 1 : 0);
    let s = cache.get(k);
    if (!s) {
      if (cache.size > 96) cache.clear();
      s = build(a, blink, breath);
      cache.set(k, s);
    }
    return s;
  }

  /* ---------------- 장면 판단 ---------------- */
  const ENCOUNTER = new Set(["mihawk", "summit war", "shanks", "bigmom", "teach", "kaido", "imu", "luffy", "zoro", "garp", "sanji", "ryuma", "seaking"]);
  let sceneCtx = "calm";
  function classify(x, phase) {
    if (phase === "birth") return "birth";
    if (phase === "death") return "death";
    if (phase === "yearend" || !x) return "calm";
    let k = "";
    try { k = String((typeof sceneKey === "function" ? sceneKey(x) : x.key) || ""); } catch (e) { k = String(x.key || ""); }
    const t = String(x.title || "");
    const tags = (Array.isArray(x.tags) ? x.tags : []).map((s) => String(s).toLowerCase());
    if (tags.some((s) => ENCOUNTER.has(s))) return "encounter";
    if (tags.includes("battle") ||
      /^(battle_|fight_|npc_(duel|enemy|betray)|revenge_|rivalfinal_|strong_foe|sword_|canon_marineford|job_raid|job_crewwar|job_occupy|hz_(pirate|navy))/.test(k))
      return "battle";
    if (/^(hz_|ship_)/.test(k) || k === "voyage") return "sea";
    if (/^(tragedy_|canon_(ohara|gray|flevance)|imu_|cel_imu)|flood/.test(k)) return "crisis";
    if (/^(fam_|npc_death|promise_|life_change|kid_)/.test(k) || /가족|결혼|출산|부모|아버지|어머니|배우자|자녀|손주|육아/.test(t)) return "family";
    if (/^job_/.test(k) || tags.includes("navy")) return "work";
    return "calm";
  }

  /* ---------------- 등장인물 구성 ---------------- */
  function npcNear(P, n) {
    const here = P.place && P.place.name;
    if (n.role === "배우자") return true;
    if (n.role === "자녀" && !n.indep) return true;
    if (n.home) return n.home === here;
    if (n.role === "부모" || n.role === "형제") return ((P.birthPlace || P.place) || {}).name === here;
    return true;
  }
  function makeActor(o) {
    const a = Object.assign({ alpha: 1, ghost: false, cane: false }, o);
    a.stage = stageOf(a.stageAge);
    a.outfit = outfitFor({
      status: a.status, job: a.job, track: a.track, rank: a.rank, tier: a.tier || 0,
      stage: a.stage, gender: a.gender, look: a.look, captain: a.captain,
    });
    if (a.stage === "elder" && (a.stageAge >= 75 || a.outfit.kind === "retiree" || a.outfit.kind === "casual")) a.cane = a.stageAge >= 70;
    a.size = a.race === "거인족" ? 1.3 : a.race === "소인족" ? 0.55 : 1;
    a.akey = hash(JSON.stringify([a.look, a.stage, a.gender, a.race, a.outfit, a.cane, a.stageAge >= 30, a.ageReal >= 80])).toString(36);
    a.off = hash(a.id) % 997;
    return a;
  }
  function playerActor(P) {
    const look = playerLook(P);
    const L = G("careerLadders");
    const job = P.careerTrack || P.job;
    const ladder = L && L[job];
    const lvl = ladder ? Math.min(ladder.length - 1, P.rankLevel || 0) : 0;
    let realA = P.age;
    try { if (typeof realAge === "function") realA = realAge(); } catch (e) {}
    return makeActor({
      id: "player", look, race: P.race, gender: P.gender, stageAge: P.age, ageReal: realA,
      status: P.status, job: P.job, track: P.careerTrack, rank: P.rankTitle, tier: tierOf(job, lvl),
      captain: P.status === "해적" && (P.rankTitle === "선장" || !!(P.flags && (P.flags.ownCrew || P.flags.warlord || P.flags.pirateKingAchieved))),
      player: true,
    });
  }
  function npcActor(P, n, pl, inheritHair) {
    const r = rng(hash(n.id || n.name));
    const race = n.race || (n.role === "배우자" ? (r() < 0.6 ? P.race : "인간") : P.race);
    const look = genLook(hash("npc|" + (n.id || n.name)), race);
    if (inheritHair) look.hair = pl.look.hair;
    const ageReal = Math.max(0, Math.floor(n.age || 0));
    const stageAge = Math.floor(ageReal / scaleOf(race));
    const job = n.job || "민간인";
    return makeActor({
      id: n.id || n.name, look, race, gender: n.gender || "남성", stageAge, ageReal,
      status: n.aff, job, track: job, rank: n.rank, tier: tierOf(job, levelOf(job, n.rank)),
      captain: n.aff === "해적" && /선장/.test(String(n.rank || "")),
    });
  }
  window.drawCompanionSD = function(n) {
    const P=G("p"),a=npcActor(P,n,playerActor(P),false),sp=sprite(a,false,0);
    const c=document.createElement("canvas");c.width=GW;c.height=GH;c.getContext("2d").drawImage(sp.c,0,0);c.setAttribute("aria-label",n.name);return c;
  };
  // Reuse the existing sprite renderer; named bosses get fixed cosmetic palettes.
  window.drawBattleSD = function(name, player) {
    const P=G("p");let a;
    if(player) a=playerActor(P);
    else {
      const profiles=[
        [/루피/, "#252020","#c83b32","#345a99","해적"],
        [/조로/, "#43834b","#e4e1d4","#273e35","해적"],
        [/샹크스/, "#a93630","#eee7d9","#49332e","해적"],
        [/미호크/, "#242026","#6c2534","#28242a","해적"],
        [/카이도/, "#24202c","#71558b","#343040","해적"],
        [/빅맘|링링/, "#e47eae","#d85c9e","#ad466e","해적"],
        [/티치|검은수염/, "#252020","#b82f32","#343039","해적"],
        [/크로커다일/, "#252020","#55734e","#343039","해적"],
        [/아론/, "#34304c","#e4b65a","#446b93","해적"],
        [/아카이누/, "#292329","#b62f39","#ece9e0","해군"],
        [/키자루/, "#342a20","#d9b64a","#ece9e0","해군"],
        [/이무/, "#24202c","#25202f","#25202f","민간인"]
      ];
      const pr=profiles.find(x=>x[0].test(name));
      const existing=(P.npcs||[]).find(n=>n.name===name);
      const n=existing||{id:"foe:"+name,name,age:35,race:/아론|호디|어인/.test(name)?"어인":"인간",gender:/빅맘|링링/.test(name)?"여성":"남성",aff:pr?pr[4]:/해군|정부/.test(name)?"해군":"해적",job:"전투원"};
      a=npcActor(P,n,playerActor(P),false);
      if(pr){a.look.hair=pr[1];a.outfit.shirt=pr[2];a.outfit.pants=pr[3];a.akey+="|canon:"+name;}
    }
    const sp=sprite(a,false,0),c=document.createElement("canvas");c.width=GW;c.height=GH;c.getContext("2d").drawImage(sp.c,0,0);return c;
  };
  function buildCast(P, ctx, maxC) {
    const pl = playerActor(P);
    if (["battle", "encounter", "sea", "crisis", "work"].includes(ctx)) return { list: [pl], pl };
    const fam = (P.npcs || []).filter((n) => n && n.alive);
    const parents = fam.filter((n) => n.role === "부모");
    const spouse = fam.find((n) => n.role === "배우자");
    const kids = fam.filter((n) => n.role === "자녀").sort((a, b) => (b.age || 0) - (a.age || 0));
    const near = (n) => npcNear(P, n);
    let L = [], R = [];
    if (ctx === "birth") L = parents.slice(0, 2);
    else if (ctx === "death") {
      if (spouse) R.push(spouse);
      R.push(...kids.filter(near).slice(0, 3));
      if (P.age < 40) L = parents.filter(near).slice(0, 2);
    } else if (P.age < 18) {
      L = parents.filter(near).slice(0, 2);
      if (ctx === "family" && spouse) R.push(spouse);
    } else {
      if (ctx === "family") L = parents.filter(near).slice(0, 2);
      if (spouse && near(spouse)) R.push(spouse);
      R.push(...kids.filter(near).slice(0, ctx === "family" ? 3 : 2));
    }
    // 화면 폭에 맞춰 인원 제한 (자녀 → 부모 순으로 줄인다)
    while (L.length + R.length > maxC) {
      if (R.length > (spouse && R[0] === spouse ? 1 : 0)) R.pop();
      else if (L.length) L.pop();
      else R.pop();
    }
    const la = L.map((n, i) => npcActor(P, n, pl, i === 0 && L.length > 0));
    const ra = R.map((n) => npcActor(P, n, pl, n.role === "자녀" && (hash(n.id) & 1) === 0));
    if (ctx === "death") pl.ghost = true;
    let list;
    if (la.length === 2 && (pl.stage === "infant" || pl.stage === "child")) list = [la[0], pl, la[1], ...ra];
    else list = [...la, pl, ...ra];
    return { list, pl };
  }

  /* ---------------- 캔버스 층 ---------------- */
  const cv = document.createElement("canvas");
  cv.className = "pxav";
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;image-rendering:pixelated;image-rendering:crisp-edges";
  const ctx2d = cv.getContext("2d");
  function attach() {
    if (cv.parentNode !== box) box.appendChild(cv); // 이미 있으면 건드리지 않는다(장면 연출 관찰자 재실행 방지)
  }
  new MutationObserver(() => { if (cv.parentNode !== box && G("p")) attach(); }).observe(box, { childList: true });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let cast = null, stateSig = "", lastSigCheck = 0, frameSig = "", inView = true, cw = 0, chh = 0;
  const blinkAt = new Map();

  function famSig(P) {
    let s = "";
    for (const n of P.npcs || []) {
      if (!n || !n.alive) continue;
      if (n.role !== "부모" && n.role !== "배우자" && n.role !== "자녀") continue;
      s += n.id + n.role + Math.floor(n.age || 0) + (n.home || "") + (n.indep ? 1 : 0) + (n.job || "") + (n.aff || "") + (n.rank || "") + ";";
    }
    return s;
  }
  function computeSig(P) {
    const f = P.flags || {};
    return [P.name, P.age, P.gender, P.race, P.job, P.status, P.rankTitle, P.careerTrack, P.rankLevel,
      f.ownCrew ? 1 : 0, f.warlord ? 1 : 0, f.pirateKingAchieved ? 1 : 0, P.place && P.place.name, P.ship ? 1 : 0,
      sceneCtx, G("finished") ? 1 : 0, cw < 380 ? 3 : 4, famSig(P)].join("|");
  }
  function resize() {
    const r = box.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    cw = r.width;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; frameSig = ""; }
    chh = h;
    return true;
  }
  function anchorFor(ctx) {
    return ctx === "encounter" || ctx === "battle" ? 0.24 : ctx === "sea" || ctx === "crisis" ? 0.34 : ctx === "work" ? 0.4 : 0.5;
  }

  function draw(now) {
    const P = G("p");
    if (!P || !cast) { if (cv.width) ctx2d.clearRect(0, 0, cv.width, cv.height); return; }
    const anim = !reduced.matches;
    let fs = cv.width + "x" + cv.height + "|" + stateSig + "|";
    const frames = cast.list.map((a) => {
      const breath = anim ? Math.floor((now + (a.off % 2) * 350) / 700) % 2 : 0;
      let blink = false;
      if (anim) {
        let t = blinkAt.get(a.id);
        if (t === undefined) { t = now + 600 + (a.off % 10) * 300; blinkAt.set(a.id, t); }
        if (now >= t + 140) { t = now + 2200 + Math.random() * 3800; blinkAt.set(a.id, t); }
        blink = now >= t && now < t + 140;
      }
      const hop = anim && a.stage === "child" && Math.floor((now + a.off * 31) / 450) % 9 === 0 ? 1 : 0;
      fs += (breath ? 1 : 0) + (blink ? 1 : 0) + hop;
      return { a, breath, blink, hop };
    });
    if (fs === frameSig) return; // 바뀐 게 없으면 다시 그리지 않는다
    frameSig = fs;
    const W = cv.width, H = cv.height;
    ctx2d.clearRect(0, 0, W, H);
    ctx2d.imageSmoothingEnabled = false;
    const u = (() => { const uf = (H * 0.35) / 28; return uf >= 3 ? Math.round(uf) : uf; })();
    const ground = Math.round(H * 0.94);
    const slots = frames.map((fr) => 15 * u * fr.a.size + 3 * u);
    let total = slots.reduce((s, v) => s + v, 0);
    let x = W * 0.03;
    x = Math.max(W * 0.03, Math.min(W * 0.97 - total, x));
    // 바닥 그림자 먼저
    const pos = frames.map((fr, i) => { const cxp = x + slots[i] / 2; x += slots[i]; return cxp; });
    frames.forEach((fr, i) => {
      const s = u * fr.a.size;
      const d = dimFor(fr.a.stage, fr.a.gender);
      const sw = (d.tw + d.aw * 2 + 2) * s;
      ctx2d.fillStyle = fr.a.ghost ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.26)";
      ctx2d.fillRect(Math.round(pos[i] - sw / 2 + s), ground - Math.round(s * 0.6), Math.round(sw - 2 * s), Math.max(1, Math.round(s * 1.2)));
      ctx2d.fillRect(Math.round(pos[i] - sw / 2), ground - Math.round(s * 0.3), Math.round(sw), Math.max(1, Math.round(s * 0.6)));
    });
    // 아이들이 앞에 오도록 키 큰 사람부터
    const order = frames.map((fr, i) => i).sort((a, b) => frames[b].a.size * (frames[b].a.stage === "infant" ? 0.4 : frames[b].a.stage === "child" ? 0.7 : 1) - frames[a].a.size * (frames[a].a.stage === "infant" ? 0.4 : frames[a].a.stage === "child" ? 0.7 : 1));
    for (const i of order) {
      const { a, breath, blink, hop } = frames[i];
      const s = u * a.size;
      const sp = sprite(a, blink, breath);
      const dw = Math.round(GW * s), dh = Math.round(GH * s);
      const lift = a.ghost ? Math.round(4 * s) : hop ? Math.round(s) : 0;
      const dx = Math.round(pos[i] - dw / 2), dy = Math.round(ground - (GH - 1) * s) - lift;
      ctx2d.globalAlpha = a.ghost ? 0.6 : a.alpha;
      ctx2d.drawImage(sp.c, dx, dy, dw, dh);
      ctx2d.globalAlpha = 1;
      if (a.ghost) {
        ctx2d.fillStyle = "rgba(255,226,120,0.9)";
        const hw = (sp.hw + 2) * s;
        ctx2d.fillRect(Math.round(pos[i] - hw / 2), dy + Math.round((sp.headTop - 3) * s), Math.round(hw), Math.max(1, Math.round(s)));
      } else if (a.player && frames.length > 1) {
        // 가족과 함께 있을 때 누가 '나'인지 보여 주는 작은 표식
        const my = dy + Math.round((sp.headTop - 6 - (breath ? 1 : 0)) * s);
        ctx2d.fillStyle = "#ffd75e";
        ctx2d.fillRect(Math.round(pos[i] - 1.5 * s), my, Math.round(3 * s), Math.round(s));
        ctx2d.fillRect(Math.round(pos[i] - 0.5 * s), my + Math.round(s), Math.max(1, Math.round(s)), Math.round(s));
      }
    }
  }

  // requestAnimationFrame 대신 0.1초 타이머로 돌린다: 도트 애니메이션엔 충분하고, 휴대폰이 매 프레임 깨어나지 않는다
  let timer = 0;
  function visible() {
    const P = G("p");
    return !!P && G("showArt") !== false && !document.hidden && inView && box.style.display !== "none" && box.offsetParent !== null;
  }
  function tick() {
    timer = 0;
    if (!visible()) return; // 보이지 않으면 멈춘다 (다시 보이면 kick()이 깨운다)
    const now = performance.now();
    const P = G("p");
    if (now - lastSigCheck > 400 || !cast) {
      lastSigCheck = now;
      if (!cw) resize();
      const sig = computeSig(P);
      if (sig !== stateSig || !cast) {
        stateSig = sig;
        try { cast = buildCast(P, sceneCtx, cw < 380 ? 3 : 4); } catch (e) { cast = null; }
        frameSig = "";
      }
    }
    try { draw(now); } catch (e) {}
    timer = setTimeout(tick, reduced.matches ? 400 : 100);
  }
  function kick() {
    if (visible()) {
      if (G("p")) attach();
      if (!timer) timer = setTimeout(tick, 0);
    }
  }

  /* ---------------- 기존 함수 감싸기 (동작은 그대로, 장면 종류만 읽는다) ---------------- */
  const _showArtFor = showArtFor;
  showArtFor = function (x, phase) {
    const r = _showArtFor.apply(this, arguments);
    try {
      sceneCtx = classify(x, phase);
      lastSigCheck = 0;
      if (G("p")) attach();
      kick();
    } catch (e) {}
    return r;
  };
  if (typeof setShowArt === "function") {
    const _setShowArt = setShowArt;
    setShowArt = function () { const r = _setShowArt.apply(this, arguments); try { kick(); } catch (e) {} return r; };
  }
  if (typeof tacOpenFight === "function") {
    // 전략 전투 화면은 장면 그림을 복제해 쓰는데, 캔버스는 복제하면 빈 그림이 되므로 현재 모습을 옮겨 그린다
    const _tac = tacOpenFight;
    tacOpenFight = function () {
      const r = _tac.apply(this, arguments);
      try {
        const cl = document.querySelector("#tacArt canvas.pxav");
        if (cl && cv.width) { cl.width = cv.width; cl.height = cv.height; cl.getContext("2d").drawImage(cv, 0, 0); }
      } catch (e) {}
      return r;
    };
  }

  if ("ResizeObserver" in window) new ResizeObserver(() => { if (resize()) { lastSigCheck = 0; kick(); } }).observe(box);
  else window.addEventListener("resize", () => { resize(); lastSigCheck = 0; kick(); });
  if ("IntersectionObserver" in window)
    new IntersectionObserver((es) => { inView = es.some((e) => e.isIntersecting); kick(); }).observe(box);
  document.addEventListener("visibilitychange", kick);
  // 게임 화면이 열리거나(새 인생·불러오기) 그림 켜기/끄기를 누른 뒤에도 깨어나도록 가볍게 확인
  setInterval(kick, 1000);
  resize();
  kick();
})();
