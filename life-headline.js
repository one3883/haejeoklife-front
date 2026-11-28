// Death records use display ages, including the longer calendars of other races.
// History is newest first. Match completed outcomes rather than offered scenes.
function selectLifeHeadline(player, cause, age) {
  const history = (player.history || [])
    .map((line) => /^(\d+)세 · (.+)$/.exec(line))
    .filter(Boolean)
    .map((match) => ({ age: Number(match[1]), text: match[2] }));
  const achievements = new Set(player.achievements || []);
  const latest = (text) => history.find((event) => event.text === text);
  const type = cause?.type || "";
  const detail = cause?.detail || "";
  let best = { priority: -1, text: "" };
  function offer(priority, text) {
    if (priority > best.priority) best = { priority, text };
  }

  const goal = latest("신의 기사단을 목표로 삼음");
  const joined = latest("신의 기사단에 입단함");
  if (joined) {
    const start =
      goal && goal.age <= joined.age
        ? goal.age + "세에 신의 기사단을 꿈꿨다. "
        : "";
    const career =
      start +
      joined.age +
      "세에 " +
      (start ? "입단했다." : "신의 기사단에 입단했다.");
    offer(82, career);
    if (type === "이무에게 처형당함")
      offer(100, career + " " + age + "세에 이무에게 숙청됐다.");
  }

  const prison = history.find((e) =>
    /^임펠다운 LEVEL [1-6]에 수감됨$/.test(e.text),
  );
  if (prison && type === "임펠다운에서 처형") {
    const level = prison.text.match(/LEVEL \d/)[0];
    const when = age > prison.age ? age - prison.age + "년 뒤" : "같은 해";
    const ending = detail.includes("탈옥에 실패")
      ? "탈옥에 실패해 처형됐다."
      : "사형이 집행됐다.";
    offer(
      96,
      prison.age +
        "세에 임펠다운 " +
        level +
        "에 갇혔다. " +
        when +
        " " +
        ending,
    );
  }

  const discovery = latest("공백의 100년의 비밀을 완전히 알아냄");
  const delay = latest("진실을 세상에 알리는 일을 미룸");
  const disclosure = latest("공백의 100년의 진실을 세계에 알림");
  if (disclosure) {
    offer(94, disclosure.age + "세에 공백의 100년의 진실을 세계에 알렸다.");
    if (
      discovery &&
      delay &&
      discovery.age <= delay.age &&
      delay.age <= disclosure.age &&
      disclosure.age > discovery.age
    )
      offer(
        98,
        "공백의 100년을 밝혀내고도 " +
          (disclosure.age - discovery.age) +
          "년 뒤에야 세상에 알렸다.",
      );
  }

  for (const event of history) {
    const stolen =
      /^어둠어둠 열매의 힘으로 (.+)을\(를\) 빼앗아 두 번째 열매 능력을 얻음$/.exec(
        event.text,
      );
    if (stolen) {
      offer(92, "어둠어둠 열매로 " + stolen[1] + "의 힘까지 빼앗았다.");
      if (stolen[1] === "흔들흔들 열매") {
        const fight = history.find(
          (e) =>
            e.age === event.age &&
            /^흔들흔들 열매 능력자 에드워드 뉴게이트와 싸워 승리함 \(승률 \d+%\)$/.test(
              e.text,
            ),
        );
        if (fight)
          offer(
            99,
            "승률 " +
              fight.text.match(/\d+%/)[0] +
              "로 흰수염을 꺾고 흔들흔들 열매의 힘까지 빼앗았다.",
          );
      }
    }
    const expo = /^해적 박람회에서 (.+?)(?:와|과) 싸워 이김$/.exec(event.text);
    if (expo)
      offer(
        93,
        event.age + "세에 해적 박람회에서 " + expo[1] + "에게 승리했다.",
      );
    const promotion = /^(.+) 경력에서 (.+?)\(으\)로 승진함$/.exec(event.text);
    if (promotion)
      offer(34, event.age + "세에 " + promotion[2] + " 자리까지 올랐다.");
  }
  if (player.flags?.childhoodLuffyReunited)
    offer(88, "어린 시절 함께 놀던 루피가 바다에서 먼저 알아봤다.");
  const milestones = [
    ["바다를 얼려 건넘", 86, "바다를 얼려 길을 내고 그 위를 건넜다."],
    [
      "상디에게 검은다리 유파를 배움",
      79,
      "상디에게 직접 검은다리 유파를 배웠다.",
    ],
    ["라그니르(철뢰)를 손에 넣음", 85, "철뢰 라그니르를 손에 넣었다."],
    ["베가펑크와 협업함", 84, "베가펑크와 함께 연구했다."],
    ["이무와 신의 기사단을 쓰러뜨림", 92, "이무와 신의 기사단을 쓰러뜨렸다."],
    ["임펠다운 탈옥", 82, "임펠다운에서 탈옥해 자유를 되찾았다."],
    ["천룡인의 지위를 버림", 78, "스스로 천룡인의 지위를 버렸다."],
    [
      "세계 침수에서 인연의 손에 구조됨",
      73,
      "세계가 물에 잠기던 날, 인연을 맺었던 사람의 손에 구조됐다.",
    ],
    ["자녀가 모험의 동료가 됨", 58, "자기 자식과 동료가 되어 함께 모험했다."],
    ["평생의 라이벌과 화해함", 54, "평생 겨뤄 온 라이벌과 화해했다."],
    ["첫 발명 성공", 40, "자기 손으로 첫 발명품을 완성했다."],
  ];
  for (const [key, priority, line] of milestones)
    if (achievements.has(key)) offer(priority, line);
  for (const key of achievements) {
    if (key.startsWith("꿈을 이룸: "))
      offer(45, "‘" + key.slice("꿈을 이룸: ".length) + "’라는 꿈을 이뤘다.");
  }

  const stories = [
    [
      "세계정부 첩보원의 암살",
      "작전에서 돌아오던 길에 세계정부 첩보원에게 암살당했다.",
    ],
    [
      "세계 최강의 검사와의 전투",
      "세계 최강의 검사에게 도전해 결투 끝에 쓰러졌다.",
    ],
    ["카이도와의 전투", "사황 카이도에게 도전했다가 쓰러졌다."],
    [
      "해군 대령 히나의 부대가 벌인 오인 사격",
      "해군 대령 히나의 부대가 쏜 오인 사격에 목숨을 잃었다.",
    ],
    ["정상전쟁 전사", "정상전쟁에서 마지막 전투를 치렀다."],
  ];
  for (const [death, line] of stories) if (type === death) offer(72, line);
  if (type === "동료 구출 중 전사")
    offer(84, "해군에 붙잡힌 동료를 구하러 돌아갔지만 포위망을 뚫지 못했다.");
  if (type === "이무에게 처형당함")
    offer(90, "판게아 성에서 이무에게 숙청됐다.");
  if (type === "세계의 수몰")
    offer(32, "끝까지 높은 곳으로 피했지만 차오르는 바다를 벗어나지 못했다.");
  if (type === "노환" && detail.includes("곁에서 조용히 눈을 감았습니다.")) {
    const bedside = detail
      .split(/[.!?]\s*/)
      .find((s) => s.includes("곁에서 조용히 눈을 감았습니다"));
    if (bedside) offer(55, bedside.replace(/눈을 감았습니다$/, "눈을 감았다."));
  }
  if (type && !["노환", "질병", "병", "돌림병", "영아 사망"].includes(type))
    offer(35, age + "세에 생을 마쳤다. 사인은 ‘" + type + "’.");
  const home = player.birthPlace?.name;
  if (age === 0)
    offer(10, (home ? home + "에서 " : "") + "태어나 첫날 눈을 감았다.");
  else
    offer(
      10,
      (home ? home + "에서 태어나 " : "") +
        age +
        "세에 생을 마쳤다" +
        (type ? " (" + type + ")." : "."),
    );
  return best.text;
}
