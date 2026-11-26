/* 건강과 행복 — 두 스탯이 실제로 삶을 바꾸게 한다.
   예전에는 건강은 30 미만에서만 사망 위험에 쓰였고, 행복은 꿈 '평범하고 행복한 삶'과 일대기 칭호 말고는 쓰이지 않았다.
   그래서 건강 +5·행복 +4 같은 보상과 건강 -3·행복 -3 같은 대가가 대부분 의미가 없었다.

   건강
   - 젊을 때 저절로 차오르는 양(40세 전 해마다 +1~4)은 그대로 둔다. 줄이면 건강 30 미만으로 떨어지는 사람이 늘어 평균 수명이 4~5년 줄었다
   - 사망 위험이 건강에 따라 부드럽게 바뀐다: 100이면 -20%, 55(어른 평균)면 그대로, 25면 +20% (0.8~1.3배)
   - 건강이 낮으면 싸움에서 힘이 덜 난다: 전투 힘 × (0.9 + 0.1 × 건강/100), 최대 -10%
   행복
   - 해마다 55 쪽으로 차이의 10%만큼 돌아간다. 높게 유지하려면 그에 맞는 선택을 계속해야 한다
   - 80 이상: 해마다 건강 +1, 수입 +3%
   - 30 이하: 해마다 건강 -1, 수입 -5%
   임펠다운에 갇혀 있는 동안에는 적용하지 않는다(감옥은 따로 규칙이 있다). */
(() => {
  "use strict";
  if (typeof p === "undefined") return;
  const inPrison = () => !!(p && p.flags && p.flags.impelDown);
  const clamp01 = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  if (typeof annualDrift === "function") {
    const _ad = annualDrift;
    annualDrift = function () {
      const r = _ad.apply(this, arguments);
      try {
        if (!inPrison() && p.age >= 6) {
          // 행복은 55 쪽으로 조금씩 돌아간다
          p.happiness += Math.round((55 - p.happiness) * 0.1);
          if (p.age >= 16) {
            if (p.happiness >= 80) p.health += 1;
            else if (p.happiness <= 30) p.health -= 1;
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
        if (inPrison()) return r;
        return r * clamp01(1 + (55 - p.health) / 150, 0.8, 1.3);
      } catch (e) {
        return r;
      }
    };
  }
  if (typeof myPower === "function") {
    const _mp = myPower;
    myPower = function () {
      const v = _mp.apply(this, arguments);
      try {
        return v * (0.9 + 0.1 * clamp01(p.health, 0, 100) / 100);
      } catch (e) {
        return v;
      }
    };
  }
  if (typeof annualSalary === "function") {
    const _as = annualSalary;
    annualSalary = function () {
      const s = _as.apply(this, arguments);
      try {
        if (!s || inPrison()) return s;
        if (p.happiness >= 80) return Math.round(s * 1.03);
        if (p.happiness <= 30) return Math.round(s * 0.95);
      } catch (e) {}
      return s;
    };
  }
})();
