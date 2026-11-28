// Serialized with the character. Tactical battle rollback restores these fields too.
const LifeScore = (() => {
  const bands = [
    [80000000, 100],
    [30000000, 80],
    [10000000, 60],
    [5000000, 45],
    [1000000, 25],
    [100000, 10],
  ];
  const whole = (n) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0);
  const nonCareers = new Set([
    "구직 준비생",
    "은퇴자",
    "학생",
    "노예",
    "수감자",
    "가족 일을 돕는 아이",
  ]);
  const navyGrades = [100, 145, 190, 240, 280, 320, 360, 400, 440, 475, 500];

  function career(player, track, level, ladder, years = 0) {
    if (!ladder?.length || nonCareers.has(track)) return;
    const record = player.scoreHistory;
    const last = ladder.length - 1;
    const index = Math.min(whole(level), last);
    const navy = track === "해군" || track === "해군 후보생";
    const grade =
      navy && ladder.length === navyGrades.length
        ? navyGrades[index]
        : 100 + Math.round((400 * index) / Math.max(1, last));
    const service = whole(years);
    let points = grade;
    if (index < last && !(track === "천룡인" && index < 2)) {
      const experience = index
        ? Math.min(100, service * 4)
        : Math.min(50, service * 2);
      points = Math.min(490, grade + experience);
    }
    if (track === "천룡인" && index >= 1) {
      // A house head can pursue politics even without joining the Holy Knights.
      const influence = Math.min(100, whole(player.standing?.천룡인));
      points = Math.max(points, 180 + 2 * influence);
    }
    if (track === "혁명군" && index >= 1) {
      const trust = Math.min(100, whole(player.standing?.혁명군));
      points = Math.max(points, 160 + 2 * trust);
    }
    if (
      track === "해적" &&
      index === last &&
      !record.promotedCaptain &&
      !player.flags?.emperor &&
      !player.flags?.pirateKingAchieved
    ) {
      // Founding a crew can grant the top job title on the day of entry.
      const notoriety = Math.min(100, whole(player.standing?.해적));
      const command = Math.min(
        150,
        Math.max(service * 4, (record.captainWins?.length || 0) * 25),
      );
      points = 150 + notoriety * 2 + command;
    }
    if (points > record.careerPoints) {
      record.careerPoints = points;
      record.bestCareer = (navy ? "해군" : track) + " · " + ladder[index];
    }
  }
  function attach(player) {
    const record = (player.scoreHistory ||= {
      skills: {},
      dreamPoints: 0,
      peakMoney: 0,
    });
    if (record.careerVersion !== 2) {
      const previousTitle = record.bestCareer;
      record.careerVersion = 2;
      record.careerPoints = 0;
      record.bestCareer = "";
      const logs = player.history || [];
      record.promotedCaptain = logs.some((line) =>
        line.endsWith("세 · 해적 경력에서 선장(으)로 승진함"),
      );
      for (const [track, memory] of Object.entries(player.careerMemory || {}))
        career(
          player,
          track,
          memory.rankLevel,
          careerLadders[track],
          memory.years,
        );
      // An interrupted or retired career may no longer have a careerMemory entry.
      if (previousTitle) {
        const [track, title] = previousTitle.split(" · ");
        const ladder = careerLadders[track];
        const level = ladder?.indexOf(title) ?? -1;
        if (level >= 0) career(player, track, level, ladder);
      }
      for (const entry of logs) {
        const match = /세 · (.+?) 경력에서 (.+?)\(으\)로 승진함$/.exec(entry);
        if (!match) continue;
        const ladder = careerLadders[match[1]];
        const index = ladder?.indexOf(match[2]) ?? -1;
        if (index >= 0) career(player, match[1], index, ladder);
      }
    }
    player.scoreHistory.peakMoney = Math.max(
      player.scoreHistory.peakMoney,
      whole(player.money),
    );
    // Many event effects credit and spend money within the same turn.
    return new Proxy(player, {
      set(target, key, value) {
        target[key] = value;
        if (key === "money" && target.scoreHistory) {
          const r = target.scoreHistory;
          r.peakMoney = Math.max(r.peakMoney, whole(value));
          if (target.dream?.id === "rich" && target.dream.status === "진행")
            r.dreamPoints = Math.max(
              r.dreamPoints,
              Math.min(150, 50 * whole(value / 20000000)),
            );
        }
        return true;
      },
    });
  }
  function observe() {
    const r = p?.scoreHistory;
    if (!r) return;
    if (p.careerStartAge != null && p.careerTrack)
      career(
        p,
        p.careerTrack,
        p.rankLevel,
        careerLadder(),
        p.age - p.careerStartAge,
      );
    for (const key of KID_SKILLS)
      r.skills[key] = Math.max(
        r.skills[key] || 0,
        Math.min(100, whole(p.kid?.skills?.[key])),
      );
    if (
      p.dream?.status === "달성" ||
      p.completedDreams?.some((d) => d.status === "달성")
    )
      r.dreamPoints = 200;
    else if (p.dream?.status === "진행" && DREAMS[p.dream.id]) {
      const progress = DREAMS[p.dream.id].progress();
      r.dreamPoints = Math.max(
        r.dreamPoints,
        Math.min(150, 50 * whole(progress * 4)),
      );
    }
  }
  function battleWon(foe, foePower) {
    if (
      !p.scoreHistory ||
      p.careerTrack !== "해적" ||
      p.status !== "해적" ||
      p.rankTitle !== "선장" ||
      foePower < 60 ||
      !foe
    )
      return;
    const wins = (p.scoreHistory.captainWins ||= []);
    if (wins.length < 6 && !wins.includes(foe)) wins.push(foe);
  }
  function result() {
    observe();
    const r = p.scoreHistory;
    const topSkills = KID_SKILLS.map((name) => ({
      name,
      points: r.skills[name] || 0,
    }))
      .filter((skill) => skill.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 2);
    const skillPoints = topSkills.reduce((sum, skill) => sum + skill.points, 0);
    const wealthPoints =
      bands.find(([threshold]) => r.peakMoney >= threshold)?.[1] || 0;
    return {
      scoreVersion: 2,
      totalScore: r.careerPoints + skillPoints + r.dreamPoints + wealthPoints,
      careerPoints: r.careerPoints,
      skillPoints,
      dreamPoints: r.dreamPoints,
      wealthPoints,
      bestCareer: r.bestCareer,
      topSkills,
      peakMoney: r.peakMoney,
    };
  }
  return { attach, observe, battleWon, result };
})();
