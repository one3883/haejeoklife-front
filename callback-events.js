/* 회수 사건 — 어린 시절 선택이 남긴 플래그(f_*)가 몇 년 뒤 어른이 된 주인공에게 돌아온다.
   형식과 동작은 place-events.js의 '회수 사건 (CB)' 설명을 본다. CLAUDE.md 5절(씨앗/회수)·6절(문체)·8~9절을 따른다.
   - flags: 이 플래그가 있어야 나옴 / after: 플래그가 생긴 뒤 최소 몇 년(5 이상) / when: 나이·신분 조건
   - by: 신분별 변형("해적|혁명군", "해군", "*" 등). 같은 플래그라도 지금의 신분에 따라 장면과 결과가 다르다
   - 본문 토큰: {고향} {여기} {해적단} {단짝} {npc:칭호}, 조사 {고향|로}
   묶음: 13~15세 수련(f_train_*) · 학교(f_school_*) · 장래희망(f_dream_*) · 취미(f_hobby_*) · 인생의 꿈(f_goal_*) · 어린 시절 사건(f_kid_*) */

/* ───────────── train_school ───────────── */
CB([
  // ── 검술 도장 (f_train_sword) ──
  {
    key: "cb_train_sword",
    flags: ["f_train_sword"],
    after: 6,
    when: { minAge: 19, maxAge: 60 },
    title: "사범의 마지막 목검",
    body: "열세 살 무렵 수강료를 내고 다니던 검술 도장에서 편지가 왔습니다. 멍든 정강이를 죽도로 툭툭 치며 자세를 고쳐 주던 사범이 이제 칼을 놓는다고 합니다. 도장 벽의 목검 하나를 당신 몫으로 남겼고, 도장을 누가 맡을지는 아직 정하지 못했다고 적었습니다.",
    choices: [
      { title: "도장을 맡아 아이들을 가르친다", desc: "검은 깊어지지만 발이 묶인다",
        effect: { skills: { "검술": 6 }, relationship: 3, money: -60000, traits: { "선량": 1 },
                  flags: ["f_cb_sword_dojo"], log: "옛 검술 도장을 맡아 아이들을 가르침" } },
      { title: "목검만 받아 들고 떠난다", desc: "검은 남지만 도장은 문을 닫는다",
        effect: { combat: 3, happiness: -4, traits: { "신중": 1 },
                  memory: "사범의 손때 묻은 목검", log: "사범의 목검만 받아 들고 도장을 떠남" } },
      { title: "사범에게 마지막 대련을 청한다", desc: "많이 배우지만 몸이 성치 않다",
        effect: { skills: { "검술": 8 }, health: -6, traits: { "용기": 1 },
                  log: "은퇴하는 사범과 마지막 대련을 벌임" },
        risk: { chance: 0.25, effect: { health: -8, log: "사범의 마지막 일격에 어깨가 빠짐" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "사범의 편지는 당신의 수배서 뒷면에 적혀 왔습니다. 칼을 놓기 전에 얼굴을 보고 싶지만, 도장에 오면 어린 제자들까지 해군에게 의심받는다고 합니다. 편지 끝에는 목검을 뒷산 사당에 묻어 두겠다는 말이 있습니다.",
        choices: [
          { title: "밤에 몰래 도장에 들른다", desc: "얼굴은 보지만 꼬리가 밟힐 수 있다",
            effect: { happiness: 6, relationship: 3, traits: { "용기": 1 },
                      memory: "등불 하나 켜진 밤의 도장", log: "한밤중에 옛 도장에 들러 사범과 인사함" },
            risk: { chance: 0.3, effect: { bounty: "+20%", health: -6, log: "도장을 나서다 해군 순찰대와 칼을 섞음" } } },
          { title: "사당의 목검만 찾아간다", desc: "안전하지만 작별은 못 한다",
            effect: { combat: 3, happiness: -4, traits: { "신중": 1 },
                      memory: "사당 흙 속의 목검", log: "사당에 묻힌 사범의 목검만 찾아감" } },
          { title: "도장 문 앞에 돈을 두고 간다", desc: "제자들을 돕지만 이름이 남는다",
            effect: { money: -150000, standing: 5, traits: { "선량": 1 },
                      log: "옛 도장 문 앞에 운영비를 두고 떠남" },
            risk: { chance: 0.2, effect: { bounty: "+20%", log: "돈 꾸러미의 출처가 해군에 새어 나감" } } }
        ]
      },
      "해군": {
        body: "사범이 해군 제복을 입은 당신에게 편지를 보냈습니다. 칼을 놓기 전에 가장 쓸 만한 제자 둘을 해군에 추천해 달라는 부탁입니다. 둘 다 검은 곧지만, 하나는 성질이 급하고 하나는 몸이 약합니다.",
        choices: [
          { title: "두 제자를 모두 추천한다", desc: "사범은 기뻐하지만 책임이 따른다",
            effect: { relationship: 5, standing: 3, traits: { "선량": 1 },
                      flags: ["f_cb_sword_recruits"], log: "옛 사범의 제자 둘을 해군에 추천함" },
            risk: { chance: 0.3, effect: { standing: -6, log: "추천한 제자가 훈련소에서 사고를 침" } } },
          { title: "직접 시험해 하나만 고른다", desc: "공정하지만 하나는 상처받는다",
            effect: { standing: 6, relationship: -3, traits: { "신중": 1 },
                      log: "사범의 제자 중 하나만 골라 해군에 추천함" } },
          { title: "사범에게 마지막 대련을 청한다", desc: "많이 배우지만 몸이 성치 않다",
            effect: { skills: { "검술": 8 }, health: -6, traits: { "용기": 1 },
                      log: "제복을 벗어 두고 사범과 마지막 대련을 벌임" },
            risk: { chance: 0.25, effect: { health: -8, log: "사범의 마지막 일격에 어깨가 빠짐" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 무술 도장 (f_train_martial) ──
  {
    key: "cb_train_martial",
    flags: ["f_train_martial"],
    after: 5,
    when: { minAge: 18, maxAge: 50 },
    title: "멍 자국을 나눈 동기",
    body: "{여기}의 뒷골목 투기장 벽보에서 낯익은 이름을 봅니다. 무술 도장에서 서로 온몸에 멍이 들도록 맞붙던 동기입니다. 투기장 문 앞에서 마주친 그는 붕대 감은 주먹을 들어 보입니다. \"그때 승부, 아직 안 끝났지?\"",
    choices: [
      { title: "판돈을 걸고 링에 오른다", desc: "이기면 큰돈이지만 다칠 수 있다",
        effect: { money: 120000, combat: 3, health: -5, traits: { "용기": 1 },
                  log: "투기장에서 도장 동기와 판돈을 걸고 맞붙음" },
        risk: { chance: 0.3, effect: { health: -10, money: -60000, log: "동기의 발차기에 쓰러져 판돈을 잃음" } } },
      { title: "도장 마당에서 대련만 한다", desc: "돈은 없지만 옛 정이 돌아온다",
        effect: { relationship: 5, skills: { "무투술": 3 }, health: -3, traits: { "선량": 1 },
                  memory: "흙먼지 날리던 도장 마당", log: "옛 동기와 돈 없이 맨손 대련을 나눔" } },
      { title: "그의 투기장 빚을 갚아 준다", desc: "그를 빼내지만 지갑이 빈다",
        effect: { money: -100000, relationship: 4, happiness: 3, traits: { "신중": 1 },
                  flags: ["f_cb_martial_friend"], log: "도장 동기의 투기장 빚을 대신 갚아 줌" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{여기} 선술집에서 누군가 당신의 수배서를 탁자에 내려놓습니다. 무술 도장에서 서로 온몸에 멍이 들도록 맞붙던 동기가 현상금 사냥꾼이 되어 있습니다. 그는 주먹을 풀며 웃습니다. \"잡으러 온 건 아니야. 아직은.\"",
        choices: [
          { title: "뒷마당에서 맞붙어 끝을 본다", desc: "이기면 소문이 나지만 위험하다",
            effect: { combat: 4, standing: 5, bounty: "+20%", health: -6, traits: { "용기": 1 },
                      log: "현상금 사냥꾼이 된 동기와 맨손으로 결판을 냄" },
            risk: { chance: 0.3, effect: { health: -12, log: "동기의 관절기에 팔이 꺾임" } } },
          { title: "술값을 내고 조용히 빠져나간다", desc: "무사하지만 그는 다시 온다",
            effect: { money: -30000, happiness: -3, traits: { "신중": 1 },
                      flags: ["f_cb_martial_hunter"], log: "사냥꾼이 된 동기에게 술값만 내고 자리를 뜸" } },
          { title: "그에게 함께 가자고 권한다", desc: "든든한 주먹이지만 믿을 수 있을까",
            effect: { relationship: 6, money: -60000, traits: { "선량": 1 },
                      log: "현상금 사냥꾼이 된 동기를 동료로 끌어들임" },
            risk: { chance: 0.25, effect: { bounty: "+20%", relationship: -6, log: "동기가 항로를 해군에 흘리고 사라짐" } } }
        ]
      },
      "해군": {
        body: "이번 작전에서 붙잡은 해적의 얼굴을 보고 당신은 걸음을 멈춥니다. 무술 도장에서 서로 온몸에 멍이 들도록 맞붙던 동기입니다. 감방 창살 너머로 그가 주먹을 내밉니다. \"마지막으로 한 판만 하자. 그다음엔 끌고 가.\"",
        choices: [
          { title: "규정대로 본부에 압송한다", desc: "공은 서지만 마음이 무겁다",
            effect: { standing: 6, happiness: -5, traits: { "신중": 1 },
                      log: "해적이 된 도장 동기를 본부에 압송함" },
            risk: { chance: 0.2, effect: { happiness: -4, log: "압송선에서 동기의 원망 섞인 고함을 들음" } } },
          { title: "감방 문을 열고 한 판 붙는다", desc: "약속은 지키지만 규정을 어긴다",
            effect: { skills: { "무투술": 4 }, happiness: 4, health: -4, traits: { "용기": 1 },
                      memory: "감방 안의 마지막 대련", log: "감방에서 해적이 된 동기와 마지막 대련을 함" },
            risk: { chance: 0.3, effect: { standing: -6, log: "대련 중 동기가 달아나 책임을 추궁당함" } } },
          { title: "밤사이 문을 잠그지 않는다", desc: "동기를 살리지만 들키면 끝이다",
            effect: { relationship: 4, happiness: 3, traits: { "선량": 1 },
                      flags: ["f_cb_martial_freed"], log: "해적이 된 동기를 몰래 풀어 줌" },
            risk: { chance: 0.35, effect: { standing: -8, reputation: -5, log: "감방 문을 열어 둔 일이 들통나 징계받음" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 어선·상선 견습 (f_train_sea) ──
  {
    key: "cb_train_sea",
    flags: ["f_train_sea"],
    after: 7,
    when: { minAge: 20, maxAge: 60 },
    title: "늙은 어선의 마지막 출어",
    body: "열네 살 때 견습으로 탔던 어선이 {여기} 부두에 들어옵니다. 거친 파도에 미끄러지던 당신의 멱살을 잡아 올려 주던 선장은 이제 밧줄 하나 감는 데도 숨이 찹니다. 그는 배를 팔기 전에 마지막 출어를 함께 나가 달라고 청합니다.",
    choices: [
      { title: "마지막 출어를 함께 나간다", desc: "뜻깊지만 늙은 배는 위험하다",
        effect: { skills: { "항해술": 5 }, happiness: 6, health: -3, traits: { "용기": 1 },
                  memory: "늙은 선장과 본 새벽 바다", log: "옛 선장과 늙은 어선의 마지막 출어를 나감" },
        risk: { chance: 0.25, effect: { health: -10, log: "썩은 돛대가 부러져 바다에 빠질 뻔함" } } },
      { title: "배를 사들여 손본다", desc: "배는 살지만 큰돈이 묶인다",
        effect: { money: -250000, relationship: 5, traits: { "야심": 1 },
                  flags: ["f_cb_old_boat"], log: "옛 선장의 늙은 어선을 사들여 손봄" } },
      { title: "해도만 사고 은퇴를 권한다", desc: "현명하지만 노인은 서운해한다",
        effect: { skills: { "항해술": 3 }, knowledge: 2, relationship: -4, money: -20000, traits: { "신중": 1 },
                  log: "옛 선장의 해도를 사고 은퇴를 권함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{여기} 앞바다를 해군 봉쇄선이 막아섰을 때, 낯익은 어선 한 척이 당신 배 옆에 붙습니다. 열네 살 때 견습으로 탔던 배의 늙은 선장입니다. \"생선 짐칸이면 몇은 숨길 수 있다.\" 그러나 들키면 그 노인도 끝입니다.",
        choices: [
          { title: "생선 짐칸에 숨어 빠져나간다", desc: "확실하지만 노인이 위험해진다",
            effect: { health: -3, relationship: 4, traits: { "선량": 1 },
                      memory: "비린내 나는 짐칸의 어둠", log: "옛 선장의 어선 짐칸에 숨어 봉쇄를 빠져나감" },
            risk: { chance: 0.25, effect: { relationship: -5, happiness: -6, log: "선장이 해군에 끌려갔다는 소식을 들음" } } },
          { title: "노인을 보내고 정면 돌파한다", desc: "노인은 안전하지만 피가 흐른다",
            effect: { combat: 3, bounty: "+25%", health: -8, traits: { "용기": 1 },
                      log: "옛 선장을 돌려보내고 봉쇄선을 정면으로 뚫음" },
            risk: { chance: 0.3, effect: { health: -8, log: "봉쇄선 포격에 갑판이 불탐" } } },
          { title: "어선을 사서 미끼로 띄운다", desc: "영리하지만 노인의 배를 잃는다",
            effect: { money: -200000, standing: 5, relationship: -4, traits: { "야심": 1 },
                      log: "옛 선장의 어선을 사들여 봉쇄선의 미끼로 씀" } }
        ]
      },
      "해군": {
        body: "검문 중인 어선 짐칸에서 밀수품 상자가 나옵니다. 배를 몰던 노인은 열네 살 때 당신이 견습으로 탔던 어선의 선장입니다. 그는 고개를 숙인 채 배를 팔아도 빚이 남아 어쩔 수 없었다고 말합니다.",
        choices: [
          { title: "규정대로 배를 압류한다", desc: "원칙대로지만 은인을 잃는다",
            effect: { standing: 6, relationship: -5, traits: { "신중": 1 },
                      log: "옛 선장의 어선을 밀수 혐의로 압류함" },
            risk: { chance: 0.2, effect: { relationship: -3, log: "압류 소식에 옛 뱃사람들이 등을 돌림" } } },
          { title: "상자만 바다에 버리게 한다", desc: "노인을 살리지만 들킬 수 있다",
            effect: { relationship: 5, happiness: 3, traits: { "선량": 1 },
                      log: "옛 선장의 밀수품을 바다에 버리게 하고 보내 줌" },
            risk: { chance: 0.3, effect: { standing: -6, log: "검문 기록이 맞지 않아 상관에게 불려 감" } } },
          { title: "벌금과 빚을 대신 갚아 준다", desc: "깨끗하지만 내 돈이 든다",
            effect: { money: -200000, relationship: 4, standing: 2, traits: { "선량": 1 },
                      log: "옛 선장의 벌금과 빚을 대신 갚아 줌" } }
        ]
      },
      "*": {}
    }
  },

  // ── 항구 식당 주방 (f_train_cook) ──
  {
    key: "cb_train_cook",
    flags: ["f_train_cook"],
    after: 5,
    when: { minAge: 18, maxAge: 60 },
    title: "식당 주인의 데인 손",
    body: "열네 살에 접시를 닦고 감자를 깎던 항구 식당에서 급한 전갈이 옵니다. 주인 요리사가 기름에 손을 크게 데어 국자를 못 쥔다고 합니다. 단골들은 당신이 그때 배운 생선 수프를 기억하며 하루만이라도 주방을 맡아 달라고 기다립니다.",
    choices: [
      { title: "앞치마를 두르고 주방에 선다", desc: "솜씨는 늘지만 몸이 녹초가 된다",
        effect: { skills: { "요리": 6 }, relationship: 3, health: -5, traits: { "선량": 1 },
                  memory: "김 서린 항구 식당 주방", log: "옛 식당 주방을 하루 맡아 단골들을 먹임" } },
      { title: "주인의 비법 수첩을 사들인다", desc: "비법은 얻지만 정이 식는다",
        effect: { skills: { "요리": 8 }, money: -80000, relationship: -3, traits: { "야심": 1 },
                  log: "식당 주인의 비법 수첩을 값을 치르고 사들임" } },
      { title: "약값을 보내고 일은 사양한다", desc: "마음은 전하지만 단골은 서운하다",
        effect: { money: -30000, relationship: -2, happiness: -2, traits: { "신중": 1 },
                  log: "식당 주인에게 약값만 보내고 주방 일은 사양함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "열네 살에 일하던 항구 식당 뒷문이 살짝 열려 있습니다. 손을 데어 국자를 못 쥐는 주인이 당신을 알아보고 손짓합니다. 홀에는 해군 수병들이 저녁을 기다리고 있고, 주인은 오늘 주방을 맡아 주면 배에 실을 식량을 내주겠다고 속삭입니다.",
        choices: [
          { title: "수병들 앞에서 수프를 끓인다", desc: "식량을 얻지만 얼굴이 드러난다",
            effect: { skills: { "요리": 5 }, relationship: 4, money: 60000, traits: { "용기": 1 },
                      memory: "수병들이 비운 수프 그릇", log: "해군 수병들 몰래 옛 식당 주방에서 요리함" },
            risk: { chance: 0.3, effect: { bounty: "+20%", health: -6, log: "수병 하나가 수배서 얼굴을 알아봄" } } },
          { title: "식량만 받고 뒷문으로 나간다", desc: "안전하지만 주인을 이용한 셈이다",
            effect: { money: 60000, relationship: -4, traits: { "야심": 1 },
                      log: "옛 식당 주인에게 식량만 받아 챙김" } },
          { title: "식량을 사양하고 떠난다", desc: "주인은 지키지만 배가 굶는다",
            effect: { relationship: 2, happiness: -4, traits: { "신중": 1 },
                      log: "옛 식당 주인을 위험에 빠뜨리지 않으려 그냥 떠남" } }
        ]
      },
      "해군": {
        body: "상부에서 해적에게 밥을 판 식당을 조사하라는 명령이 내려옵니다. 명단 맨 위에 열네 살의 당신이 접시를 닦던 항구 식당이 있습니다. 손을 데어 붕대를 감은 주인은 배고픈 사람에게 밥을 판 것뿐이라고 말합니다.",
        choices: [
          { title: "있는 그대로 보고한다", desc: "원칙대로지만 식당이 문을 닫는다",
            effect: { standing: 6, happiness: -5, traits: { "신중": 1 },
                      log: "옛 식당이 해적에게 밥을 판 사실을 보고함" } },
          { title: "장부의 해적 이름을 지워 준다", desc: "식당을 살리지만 위험하다",
            effect: { relationship: 5, happiness: 2, traits: { "선량": 1 },
                      flags: ["f_cb_cook_ledger"], log: "옛 식당 장부에서 해적 손님 이름을 지움" },
            risk: { chance: 0.3, effect: { standing: -7, log: "고쳐 쓴 장부가 들통나 감찰을 받음" } } },
          { title: "주방을 도우며 손님을 지켜본다", desc: "정보를 얻지만 몸이 고되다",
            effect: { skills: { "요리": 4 }, standing: 4, health: -4, traits: { "용기": 1 },
                      log: "옛 식당 주방을 도우며 해적 손님을 감시함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 공방·조선소 (f_train_craft) ──
  {
    key: "cb_train_craft",
    flags: ["f_train_craft"],
    after: 6,
    when: { minAge: 19, maxAge: 60 },
    title: "용골에 새긴 머리글자",
    body: "{여기} 수리 도크로 반쯤 부서진 배가 끌려 들어옵니다. 용골 안쪽에 열다섯 살의 당신이 조선소에서 몰래 새겨 둔 서툰 머리글자가 그대로 남아 있습니다. 배 주인은 고쳐 쓸지 뜯어 목재로 팔지 정하지 못하고 당신을 쳐다봅니다.",
    choices: [
      { title: "직접 용골을 고쳐 띄운다", desc: "솜씨는 늘지만 몸을 갈아 넣는다",
        effect: { skills: { "제작": 6 }, health: -5, happiness: 3, traits: { "용기": 1 },
                  memory: "다시 물에 뜬 그 용골", log: "어린 날 만든 배의 용골을 직접 고쳐 띄움" },
        risk: { chance: 0.2, effect: { health: -8, log: "받침목이 미끄러져 배 밑에 깔릴 뻔함" } } },
      { title: "목재로 뜯어 팔자고 권한다", desc: "돈은 되지만 마음 한쪽이 빈다",
        effect: { money: 150000, happiness: -5, traits: { "야심": 1 },
                  log: "어린 날 만든 배를 뜯어 목재로 팔게 함" } },
      { title: "머리글자 판자만 사 간다", desc: "추억은 남지만 배는 사라진다",
        effect: { money: -20000, happiness: 4, relationship: -2, traits: { "신중": 1 },
                  memory: "머리글자가 새겨진 판자", log: "머리글자가 새겨진 용골 판자만 떼어 사 감" } }
    ],
    by: {
      "해적|혁명군": {
        body: "당신 배의 용골에 금이 갔습니다. 배 밑으로 들어간 당신은 열다섯 살에 조선소에서 몰래 새겨 둔 서툰 머리글자를 발견합니다. 당신이 처음 망치질한 그 배가 돌고 돌아 지금 당신 발밑에 있던 것입니다. 큰 조선소는 해군 눈이 많습니다.",
        choices: [
          { title: "직접 용골을 고친다", desc: "솜씨는 늘지만 출항이 늦어진다",
            effect: { skills: { "제작": 7 }, health: -5, relationship: 3, traits: { "용기": 1 },
                      memory: "내 손으로 두 번 만든 용골", log: "어린 날 만든 용골을 자기 배에서 다시 고침" },
            risk: { chance: 0.25, effect: { health: -6, bounty: "+20%", log: "수리가 늦어져 해군에 꼬리를 잡힘" } } },
          { title: "큰 조선소에 몰래 맡긴다", desc: "빠르지만 돈과 눈이 든다",
            effect: { money: -300000, happiness: 2, traits: { "야심": 1 },
                      log: "큰 조선소에 뒷돈을 주고 용골을 고침" },
            risk: { chance: 0.25, effect: { bounty: "+20%", log: "조선소 일꾼이 배 생김새를 해군에 흘림" } } },
          { title: "금 간 채로 조심히 몬다", desc: "돈은 아끼지만 바다가 두렵다",
            effect: { skills: { "항해술": 3 }, happiness: -4, traits: { "신중": 1 },
                      log: "금 간 용골을 달래며 조심스레 항해함" } }
        ]
      },
      "해군": {
        body: "함대 정비창에서 수송선 한 척의 용골에 금이 간 것이 발견됩니다. 그 안쪽에 열다섯 살의 당신이 조선소에서 몰래 새겨 둔 머리글자가 있습니다. 정비 책임자는 날림으로 만든 조선소를 고발하겠다고 벼릅니다.",
        choices: [
          { title: "내가 만든 배라고 밝힌다", desc: "정직하지만 체면이 깎인다",
            effect: { reputation: -4, relationship: 4, skills: { "제작": 3 }, traits: { "선량": 1 },
                      log: "금 간 용골이 어린 날 자기 솜씨임을 밝힘" },
            risk: { chance: 0.2, effect: { standing: -4, log: "날림 공사의 책임을 일부 떠안음" } } },
          { title: "입을 다물고 수리를 지휘한다", desc: "공은 서지만 조선소가 혼난다",
            effect: { standing: 6, happiness: -4, traits: { "신중": 1 },
                      log: "머리글자를 숨긴 채 용골 수리를 지휘함" } },
          { title: "직접 망치를 들고 고친다", desc: "솜씨는 늘지만 몸을 갈아 넣는다",
            effect: { skills: { "제작": 6 }, standing: 3, health: -5, traits: { "용기": 1 },
                      log: "정비창에서 직접 용골을 고쳐 수송선을 띄움" },
            risk: { chance: 0.2, effect: { health: -8, log: "받침목이 미끄러져 배 밑에 깔릴 뻔함" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 마을 의원 조수 (f_train_medic) ──
  {
    key: "cb_train_medic",
    flags: ["f_train_medic"],
    after: 5,
    when: { minAge: 18, maxAge: 65 },
    title: "짐수레에 깔린 다리",
    body: "{여기} 장터 한복판에서 짐수레가 넘어져 한 사람의 다리가 깔립니다. 열다섯 살 때 마을 의원 옆에서 피 묻은 붕대를 감던 손이 먼저 움직입니다. 그러나 도구는 하나도 없고, 서툴게 손대면 저 다리를 영영 못 쓰게 할 수도 있습니다.",
    choices: [
      { title: "그 자리에서 부목을 댄다", desc: "다리를 살릴 수 있지만 책임이 크다",
        effect: { skills: { "의술": 5 }, relationship: 4, traits: { "용기": 1 },
                  log: "장터에서 깔린 사람의 다리에 부목을 댐" },
        risk: { chance: 0.25, effect: { reputation: -6, happiness: -6, log: "서툰 처치로 다리가 굳어 원망을 들음" } } },
      { title: "의원을 부르러 뛴다", desc: "안전하지만 늦을 수 있다",
        effect: { relationship: 2, health: -2, traits: { "신중": 1 },
                  log: "장터의 사고에 의원을 부르러 뜀" },
        risk: { chance: 0.2, effect: { happiness: -5, log: "의원이 늦게 도착해 다리를 잃었다는 말을 들음" } } },
      { title: "구경꾼을 모아 들것을 만든다", desc: "모두를 움직이지만 내 돈이 든다",
        effect: { reputation: 5, money: -20000, traits: { "선량": 1 },
                  memory: "장대와 돛천으로 만든 들것", log: "구경꾼들을 모아 들것을 만들어 부상자를 옮김" } }
    ],
    by: {
      "해적|혁명군": {
        body: "해군과 한바탕 부딪친 뒤, 쓰러진 적 수병 하나가 다리를 감싸 쥐고 신음합니다. 열다섯 살 때 마을 의원 옆에서 피 묻은 붕대를 감던 손이 먼저 움직입니다. 동료들은 어서 배로 돌아가자고 재촉합니다.",
        choices: [
          { title: "수병의 다리를 묶어 준다", desc: "목숨을 살리지만 도망이 늦어진다",
            effect: { skills: { "의술": 5 }, happiness: 4, traits: { "선량": 1 },
                      flags: ["f_cb_medic_saved_marine"], log: "쓰러진 해군 수병의 다리를 지혈해 줌" },
            risk: { chance: 0.3, effect: { health: -8, bounty: "+20%", log: "지혈하다 늦어져 추격대에 쫓김" } } },
          { title: "붕대만 던져 주고 떠난다", desc: "빠르지만 살지 장담 못 한다",
            effect: { happiness: -3, relationship: 2, traits: { "신중": 1 },
                      reputation: 3, memory: "모래에 던진 붕대 한 묶음", log: "쓰러진 수병에게 붕대만 던져 주고 배로 돌아감" },
            risk: { chance: 0.2, effect: { happiness: -4, log: "그 수병이 끝내 숨졌다는 소문을 들음" } } },
          { title: "동료들 상처부터 돌본다", desc: "동료는 지키지만 적을 버린다",
            effect: { skills: { "의술": 3 }, relationship: 5, happiness: -4, traits: { "야심": 1 },
                      log: "적 수병을 두고 동료들 상처부터 꿰맴" } }
        ]
      },
      "해군": {
        body: "토벌 작전이 끝난 바닷가에 다리를 다친 어린 해적이 버려져 있습니다. 열다섯 살 때 마을 의원 옆에서 피 묻은 붕대를 감던 손이 먼저 움직입니다. 상관은 포로를 치료할 시간은 없다며 이동을 명령합니다.",
        choices: [
          { title: "명령을 미루고 치료한다", desc: "아이를 살리지만 상관이 노한다",
            effect: { skills: { "의술": 5 }, happiness: 4, traits: { "선량": 1 },
                      flags: ["f_cb_medic_saved_pirate"], log: "명령을 미루고 다친 어린 해적을 치료함" },
            risk: { chance: 0.3, effect: { standing: -6, log: "명령 불복으로 경고를 받음" } } },
          { title: "군의관에게 넘기고 이동한다", desc: "원칙대로지만 마음에 걸린다",
            effect: { standing: 5, happiness: -3, traits: { "신중": 1 },
                      log: "다친 어린 해적을 군의관에게 넘기고 이동함" },
            risk: { chance: 0.2, effect: { happiness: -4, log: "그 아이가 다리를 잃었다는 소식을 들음" } } },
          { title: "업고 가며 행군을 늦춘다", desc: "명령도 아이도 지키지만 몸이 상한다",
            effect: { relationship: 3, standing: 2, health: -6, traits: { "용기": 1 },
                      log: "다친 어린 해적을 업고 행군을 따라감" } }
        ]
      },
      "*": {}
    }
  },

  // ── 상점 장사 (f_train_trade) ──
  {
    key: "cb_train_trade",
    flags: ["f_train_trade"],
    after: 6,
    when: { minAge: 19, maxAge: 60 },
    title: "흥정에 잃은 친구의 좌판",
    body: "{여기} 시장 구석에서 낯익은 얼굴이 좌판을 걷고 있습니다. 열세 살에 상점에서 장사를 배우던 시절, 당신이 한 푼까지 값을 깎다 사이가 틀어진 동네 친구입니다. 그는 빚 때문에 가게를 넘겨야 한다며 쓴웃음을 짓습니다.",
    choices: [
      { title: "말없이 빚을 갚아 준다", desc: "친구를 되찾지만 큰돈이 나간다",
        effect: { money: -300000, relationship: 6, happiness: 3, traits: { "선량": 1 },
                  flags: ["f_cb_trade_friend"], log: "흥정으로 멀어진 친구의 빚을 갚아 줌" } },
      { title: "가게를 헐값에 사들인다", desc: "이문이 남지만 친구는 다시 등 돌린다",
        effect: { money: 200000, relationship: -5, traits: { "야심": 1 },
                  log: "흥정으로 멀어진 친구의 가게를 헐값에 사들임" } },
      { title: "함께 장부를 들여다본다", desc: "길을 찾을 수 있지만 장담은 없다",
        effect: { skills: { "장사": 4 }, knowledge: 2, relationship: 2, traits: { "신중": 1 },
                  log: "옛 친구와 밤새 장부를 고쳐 씀" },
        risk: { chance: 0.3, effect: { money: -60000, relationship: -3, log: "살리려던 가게가 끝내 문을 닫아 돈이 묶임" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "보급을 구하러 들른 {여기} 암시장에서 낯익은 얼굴이 장물을 팝니다. 열세 살에 상점에서 장사를 배우던 시절, 당신이 값을 깎다 사이가 틀어진 동네 친구입니다. 그는 당신의 수배서를 알아보고 씩 웃으며 값을 부릅니다.",
        choices: [
          { title: "그때처럼 끝까지 깎는다", desc: "싸게 사지만 그는 앙심을 품는다",
            effect: { money: 80000, skills: { "장사": 3 }, relationship: -4, traits: { "야심": 1 },
                      log: "암시장의 옛 친구에게 보급품을 끝까지 깎아 삼" },
            risk: { chance: 0.25, effect: { bounty: "+20%", log: "앙심을 품은 친구가 정박지를 해군에 팖" } } },
          { title: "부르는 값을 다 쳐준다", desc: "비싸지만 그의 입이 무거워진다",
            effect: { money: -100000, relationship: 5, traits: { "선량": 1 },
                      flags: ["f_cb_trade_fence"], log: "암시장의 옛 친구에게 값을 다 쳐주고 손을 잡음" } },
          { title: "아무것도 사지 않고 떠난다", desc: "깔끔하지만 배는 빈손이다",
            effect: { happiness: -3, health: -2, traits: { "신중": 1 },
                      log: "옛 친구의 좌판을 지나쳐 보급 없이 출항함" },
            risk: { chance: 0.2, effect: { health: -4, log: "보급 없이 나선 항해에서 굶주림" } } }
        ]
      },
      "해군": {
        body: "밀수 단속 명단에 낯익은 이름이 있습니다. 열세 살에 상점에서 장사를 배우던 시절, 당신이 값을 깎다 사이가 틀어진 동네 친구입니다. 빚에 몰린 그는 장물인 줄 알면서 받아 팔았다고 털어놓고, 윗선의 이름을 대겠다고 합니다.",
        choices: [
          { title: "그를 체포해 윗선을 캔다", desc: "큰 공이지만 친구는 감옥에 간다",
            effect: { standing: 7, relationship: -5, traits: { "야심": 1 },
                      log: "옛 친구를 체포해 밀수 윗선을 캐냄" } },
          { title: "정보를 받고 조용히 놓아준다", desc: "공도 세우지만 규정을 어긴다",
            effect: { standing: 4, relationship: 3, traits: { "선량": 1 },
                      log: "옛 친구에게 정보를 받고 체포를 미룸" },
            risk: { chance: 0.3, effect: { standing: -7, log: "정보원과의 거래가 감찰에 걸림" } } },
          { title: "규정대로 벌금만 매긴다", desc: "공정하지만 아무도 만족하지 않는다",
            effect: { standing: 2, happiness: -2, skills: { "장사": 2 }, traits: { "신중": 1 },
                      log: "옛 친구에게 규정대로 벌금만 물림" },
            risk: { chance: 0.2, effect: { relationship: -3, log: "벌금에 몰린 친구가 원망을 퍼뜨림" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 마을 학교 (f_school_village) ──
  {
    key: "cb_school_village",
    flags: ["f_school_village"],
    after: 12,
    when: { minAge: 20, maxAge: 70 },
    title: "녹여 팔게 된 학교 종",
    body: "{고향}의 마을 학교가 문을 닫는다는 편지가 옵니다. 처음 책가방을 메고 들어선 그 교실 앞의 종을 녹여 팔아 빚을 갚을 거라고 합니다. 옛 반 친구들이 마지막으로 교실에 모이자며 당신 이름도 명단에 적어 두었습니다.",
    choices: [
      { title: "수리비를 보태 학교를 살린다", desc: "학교는 남지만 큰돈이 든다",
        effect: { money: -250000, standing: 5, relationship: 3, traits: { "선량": 1 },
                  flags: ["f_cb_school_saved"], log: "문 닫을 뻔한 마을 학교에 수리비를 보탬" } },
      { title: "마지막 동창 모임에 간다", desc: "옛 친구를 보지만 학교는 사라진다",
        effect: { relationship: 5, happiness: 3, money: -20000, health: -2, traits: { "용기": 1 },
                  memory: "마지막으로 앉은 나무 책상", log: "문 닫는 마을 학교의 마지막 모임에 감" } },
      { title: "종을 사서 간직한다", desc: "추억은 남지만 친구들은 서운하다",
        effect: { money: -60000, happiness: 6, relationship: -3, traits: { "신중": 1 },
                  memory: "녹슨 학교 종소리", log: "마을 학교의 종을 사들여 간직함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{고향}의 마을 학교가 문을 닫는다는 소식을 항구 소문으로 듣습니다. 처음 책가방을 메고 들어선 그 교실에 이제 옛 반 친구들이 마지막으로 모인다고 합니다. 그러나 그 교실 게시판에는 당신의 수배서도 붙어 있을 겁니다.",
        choices: [
          { title: "이름 없이 돈 꾸러미를 보낸다", desc: "학교를 살리지만 출처가 의심받는다",
            effect: { money: -250000, happiness: 5, traits: { "선량": 1 },
                      flags: ["f_cb_school_saved"], log: "마을 학교에 이름 없이 돈 꾸러미를 보냄" },
            risk: { chance: 0.25, effect: { relationship: -4, log: "해적 돈이라는 소문에 학교가 돈을 돌려보냄" } } },
          { title: "얼굴을 가리고 모임에 간다", desc: "친구들을 보지만 들키면 곤란하다",
            effect: { relationship: 5, happiness: 3, traits: { "용기": 1 },
                      memory: "마지막으로 앉은 나무 책상", log: "얼굴을 가리고 마을 학교 마지막 모임에 감" },
            risk: { chance: 0.3, effect: { bounty: "+20%", relationship: -3, log: "옛 반 친구 하나가 해군에 신고함" } } },
          { title: "멀리서 종소리만 듣는다", desc: "아무도 다치지 않지만 쓸쓸하다",
            effect: { happiness: -5, standing: 2, traits: { "신중": 1 },
                      log: "고향 앞바다에서 학교 종소리만 듣고 돌아섬" } }
        ]
      },
      "해군": {
        body: "{고향}의 마을 학교가 문을 닫는다는 편지가 옵니다. 옛 반 친구들은 해군이 된 당신에게 학교를 해군 훈련소 분소로 쓰게 해 달라고 부탁해 줄 수 없느냐고 묻습니다. 처음 책가방을 메고 들어선 교실에 군화 소리가 울리게 될지도 모릅니다.",
        choices: [
          { title: "상부에 분소 건의서를 올린다", desc: "학교 건물은 살지만 마을이 바뀐다",
            effect: { standing: 6, relationship: 3, happiness: -2, traits: { "야심": 1 },
                      log: "옛 마을 학교를 해군 분소로 쓰자고 건의함" } },
          { title: "월급을 떼어 수리비를 보탠다", desc: "학교로 남지만 큰돈이 든다",
            effect: { money: -250000, relationship: 4, traits: { "선량": 1 },
                      flags: ["f_cb_school_saved"], log: "월급을 떼어 마을 학교 수리비를 보탬" } },
          { title: "군 일과 엮지 않겠다고 답한다", desc: "선을 지키지만 친구들은 실망한다",
            effect: { relationship: -4, happiness: -2, knowledge: 2, traits: { "신중": 1 },
                      log: "마을 학교 일을 군과 엮지 않겠다고 거절함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 가족의 일 (f_school_family_work) ──
  {
    key: "cb_school_family_work",
    flags: ["f_school_family_work"],
    after: 12,
    when: { minAge: 20, maxAge: 55 },
    title: "꾹꾹 눌러 쓴 집안 편지",
    body: "여섯 살부터 책 대신 집안일을 거들던 당신에게 {고향}에서 편지가 옵니다. 가족이 몸져누워 손에 익은 그 일을 이제 이어받아 달라는 내용입니다. 편지 끝에는 \"네가 아니면 맡길 사람이 없다\"는 한 줄이 꾹꾹 눌려 있습니다.",
    choices: [
      { title: "고향에 돌아가 일을 잇는다", desc: "가족은 안심하지만 지금 길이 멈춘다",
        effect: { relationship: 6, happiness: 4, money: -100000, reputation: -3, traits: { "선량": 1 },
                  flags: ["f_cb_family_returned"], log: "고향으로 돌아가 가족의 일을 이어받음" } },
      { title: "돈을 보내 일꾼을 들이게 한다", desc: "길은 지키지만 정은 멀어진다",
        effect: { money: -200000, relationship: -2, traits: { "신중": 1 },
                  log: "고향에 돈을 보내 대신 일할 사람을 들이게 함" } },
      { title: "일을 접으라고 답장한다", desc: "내 길을 가지만 가족이 원망한다",
        effect: { relationship: -6, standing: 5, happiness: -3, traits: { "야심": 1 },
                  log: "가족의 일을 접으라고 답장하고 제 길을 감" } }
    ],
    by: {
      "해적|혁명군": {
        body: "여섯 살부터 집안일을 거들던 당신에게 {고향}에서 온 편지가 뱃사람 손을 거쳐 닿습니다. 가족이 몸져누워 그 일을 이어받아 달라는 내용입니다. 가족은 당신이 무슨 깃발 아래 있는지 아직 모르는 듯하고, 고향 항구에는 해군 지부가 있습니다.",
        choices: [
          { title: "몰래 돌아가 일을 돕는다", desc: "가족을 돕지만 고향에 꼬리가 남는다",
            effect: { relationship: 6, happiness: 4, health: -3, traits: { "용기": 1 },
                      memory: "한 철 돌아간 고향 일터", log: "몰래 고향에 돌아가 한 철 가족의 일을 도움" },
            risk: { chance: 0.3, effect: { bounty: "+20%", relationship: -3, log: "고향에서 정체가 드러나 가족이 조사받음" } } },
          { title: "약탈한 돈을 익명으로 보낸다", desc: "가족은 살지만 진실은 숨긴다",
            effect: { money: -200000, happiness: -2, traits: { "신중": 1 },
                      log: "고향 가족에게 출처를 숨긴 돈을 보냄" } },
          { title: "가족에게 정체를 털어놓는다", desc: "속은 시원하지만 가족이 흔들린다",
            effect: { relationship: -5, happiness: 5, standing: 3, traits: { "야심": 1 },
                      log: "고향 가족에게 지금의 깃발을 털어놓음" } }
        ]
      },
      "해군": {
        body: "여섯 살부터 집안일을 거들던 당신에게 {고향}에서 편지가 옵니다. 가족이 몸져누워 그 일을 이어받아 달라는 내용입니다. 마침 상부에서는 당신을 먼 바다 원정대에 넣으려 하고, 휴가를 내면 그 자리는 다른 사람에게 갑니다.",
        choices: [
          { title: "휴가를 내고 고향에 간다", desc: "가족을 돌보지만 원정 기회를 잃는다",
            effect: { relationship: 6, happiness: 4, standing: -4, traits: { "선량": 1 },
                      flags: ["f_cb_family_returned"], log: "원정을 포기하고 휴가를 내 고향 일을 도움" } },
          { title: "원정대에 들고 돈을 보낸다", desc: "출세는 하지만 가족은 서운하다",
            effect: { standing: 6, money: -150000, relationship: -3, traits: { "야심": 1 },
                      log: "원정대에 들어가며 고향에는 돈만 보냄" } }
        ]
      },
      "*": {}
    }
  },

  // ── 가정교사 (f_school_tutor) ──
  {
    key: "cb_school_tutor",
    flags: ["f_school_tutor"],
    after: 14,
    when: { minAge: 21, maxAge: 65 },
    title: "옛 선생님의 원고 뭉치",
    body: "또래 대신 단둘이 마주 앉아 공부하던 가정교사가 {여기}에 나타납니다. 그는 끈으로 묶은 원고 뭉치를 내밀며, 평생 모은 바다 지리 기록을 세상에 내놓을 사람을 찾아다녔다고 말합니다. 낡은 외투와 해진 구두가 그동안의 형편을 말해 줍니다.",
    choices: [
      { title: "인쇄소에 넘겨 책으로 낸다", desc: "선생님 이름이 남지만 돈이 든다",
        effect: { money: -150000, reputation: 6, relationship: 3, traits: { "선량": 1 },
                  log: "옛 가정교사의 원고를 책으로 펴냄" } },
      { title: "원고를 받아 혼자 공부한다", desc: "많이 배우지만 선생님은 쓸쓸하다",
        effect: { knowledge: 6, relationship: -3, traits: { "신중": 1 },
                  memory: "선생님의 빽빽한 원고", log: "옛 가정교사의 원고를 받아 홀로 익힘" } },
      { title: "원고를 팔아 노후를 챙긴다", desc: "선생님은 편해지지만 뜻은 꺾인다",
        effect: { money: 100000, relationship: 2, happiness: -4, traits: { "야심": 1 },
                  log: "옛 가정교사의 원고를 학자에게 팔아 노후 자금을 마련함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "또래 대신 단둘이 공부하던 가정교사가 당신 배를 찾아옵니다. 그가 내민 원고에는 세계정부가 지운 섬들의 이름과 옛 항로가 빼곡합니다. \"이걸 세상에 낼 수 있는 건 이제 법 바깥의 사람뿐이더군.\"",
        choices: [
          { title: "원고를 베껴 바다에 뿌린다", desc: "세상이 알게 되지만 정부가 노린다",
            effect: { reputation: 6, standing: 5, bounty: "+30%", traits: { "용기": 1 },
                      log: "정부가 지운 기록을 베껴 항구마다 뿌림" },
            risk: { chance: 0.25, effect: { health: -8, log: "정부 첩보원의 추격에 부상을 입음" } } },
          { title: "원고로 항로만 익힌다", desc: "쓸모는 크지만 선생님 뜻은 묻힌다",
            effect: { knowledge: 5, skills: { "항해술": 4 }, relationship: -3, traits: { "신중": 1 },
                      log: "옛 가정교사의 원고로 숨은 항로를 익힘" } },
          { title: "선생님을 배에 태워 모신다", desc: "곁에 두지만 그를 위험에 끌어들인다",
            effect: { knowledge: 3, relationship: 6, money: -60000, traits: { "선량": 1 },
                      flags: ["f_cb_tutor_aboard"], log: "옛 가정교사를 배에 태워 모심" },
            risk: { chance: 0.2, effect: { happiness: -8, log: "배에 탄 선생님이 해전 중에 크게 다침" } } }
        ]
      },
      "해군": {
        body: "또래 대신 단둘이 공부하던 가정교사가 해군 지부로 당신을 찾아옵니다. 그가 내민 원고에는 정부가 지운 섬들의 이름과 옛 항로가 적혀 있습니다. 규정대로라면 이런 기록은 발견 즉시 보고해야 합니다.",
        choices: [
          { title: "규정대로 원고를 보고한다", desc: "공은 서지만 선생님이 끌려간다",
            effect: { standing: 7, relationship: -6, happiness: -4, traits: { "야심": 1 },
                      log: "옛 가정교사의 금지된 원고를 상부에 보고함" } },
          { title: "원고를 태우고 선생님을 보낸다", desc: "선생님은 살지만 기록은 사라진다",
            effect: { relationship: 3, happiness: -4, knowledge: 2, traits: { "신중": 1 },
                      memory: "재가 된 선생님의 원고", log: "금지된 원고를 태우고 옛 선생님을 돌려보냄" } },
          { title: "원고를 몰래 숨겨 둔다", desc: "기록은 지키지만 들키면 끝이다",
            effect: { knowledge: 5, relationship: 4, traits: { "용기": 1 },
                      flags: ["f_cb_tutor_hidden"], log: "옛 가정교사의 원고를 관사에 몰래 숨김" },
            risk: { chance: 0.25, effect: { standing: -8, reputation: -5, log: "숨긴 원고가 감찰에 발각됨" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 도제 수업 (f_school_apprentice) ──
  {
    key: "cb_school_apprentice",
    flags: ["f_school_apprentice"],
    after: 12,
    when: { minAge: 20, maxAge: 60 },
    title: "굽은 손의 낡은 망치",
    body: "여섯 살의 당신에게 처음 망치를 쥐여 주던 {고향}의 장인이 찾아옵니다. 그는 굽은 손으로 낡은 망치를 내밀며 마지막으로 맡은 다리 공사를 혼자서는 끝낼 수 없다고 털어놓습니다. 기한은 한 달, 어기면 평생 쌓은 이름이 무너집니다.",
    choices: [
      { title: "한 달 동안 망치를 든다", desc: "스승을 지키지만 몸이 상한다",
        effect: { skills: { "제작": 6 }, relationship: 4, health: -6, traits: { "용기": 1 },
                  memory: "스승과 놓은 마지막 다리", log: "옛 스승과 한 달 동안 다리 공사를 끝냄" },
        risk: { chance: 0.2, effect: { health: -8, log: "다리 난간에서 떨어져 갈비뼈를 다침" } } },
      { title: "일꾼들을 구해 보내 준다", desc: "공사는 끝나지만 스승은 서운하다",
        effect: { money: -150000, relationship: -2, reputation: 3, traits: { "신중": 1 },
                  log: "옛 스승의 다리 공사에 일꾼들을 구해 보냄" } },
      { title: "공사를 넘겨받아 이름을 건다", desc: "이름은 내 것이 되지만 스승이 지워진다",
        effect: { money: 200000, standing: 5, relationship: -5, traits: { "야심": 1 },
                  log: "옛 스승의 다리 공사를 넘겨받아 자기 이름으로 끝냄" } }
    ],
    by: {
      "해적|혁명군": {
        body: "여섯 살의 당신에게 처음 망치를 쥐여 주던 {고향}의 장인이 소문을 듣고 찾아옵니다. 그가 맡은 마지막 일은 해군 요새로 이어지는 다리입니다. 굽은 손으로 망치를 내밀며 그는 말합니다. \"너라면 어디가 약한지 알 거다.\"",
        choices: [
          { title: "스승과 함께 다리를 놓는다", desc: "스승을 지키지만 적의 다리다",
            effect: { skills: { "제작": 6 }, relationship: 4, health: -4, traits: { "선량": 1 },
                      log: "해군 요새로 가는 다리를 옛 스승과 함께 놓음" },
            risk: { chance: 0.25, effect: { bounty: "+20%", health: -6, log: "공사장 감독관에게 얼굴을 들킴" } } },
          { title: "다리에 몰래 약한 곳을 남긴다", desc: "훗날 쓸모 있지만 스승을 속인다",
            effect: { standing: 6, relationship: -4, traits: { "야심": 1 },
                      flags: ["f_cb_bridge_weakspot"], log: "요새 다리 이음새에 몰래 약한 곳을 남김" },
            risk: { chance: 0.25, effect: { bounty: "+25%", log: "이음새 공작이 발각되어 수배가 커짐" } } },
          { title: "스승에게 손을 떼라고 말린다", desc: "스승은 안전하지만 이름이 무너진다",
            effect: { relationship: -3, happiness: -3, money: -60000, traits: { "신중": 1 },
                      log: "옛 스승에게 위약금을 보태며 공사에서 손 떼게 함" } }
        ]
      },
      "해군": {
        body: "여섯 살의 당신에게 처음 망치를 쥐여 주던 {고향}의 장인이 해군 지부로 찾아옵니다. 그가 맡은 마지막 일은 이 지부의 새 부두 다리인데, 한 달 기한을 맞추기엔 일손이 턱없이 모자랍니다. 당신은 수병들을 차출할 권한이 있습니다.",
        choices: [
          { title: "수병들을 차출해 돕게 한다", desc: "공사는 끝나지만 사사로운 일이다",
            effect: { relationship: 5, standing: 3, traits: { "선량": 1 },
                      log: "수병들을 차출해 옛 스승의 부두 공사를 도움" },
            risk: { chance: 0.3, effect: { standing: -7, log: "사적 차출이 문제 되어 견책받음" } } },
          { title: "비번 날마다 직접 망치를 든다", desc: "떳떳하지만 몸이 상한다",
            effect: { skills: { "제작": 6 }, relationship: 4, health: -6, traits: { "용기": 1 },
                      memory: "비번 날의 부두 망치 소리", log: "비번 날마다 옛 스승의 부두 공사를 도움" },
            risk: { chance: 0.2, effect: { health: -8, log: "부두 말뚝 사이로 떨어져 다침" } } },
          { title: "규정대로 기한 연장을 거절한다", desc: "공정하지만 스승의 이름이 무너진다",
            effect: { standing: 5, relationship: -6, traits: { "신중": 1 },
                      log: "옛 스승의 공사 기한 연장 요청을 거절함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 명문 학교 낙방 (f_school_elite_failed) ──
  {
    key: "cb_school_elite_failed",
    flags: ["f_school_elite_failed"],
    after: 12,
    when: { minAge: 19, maxAge: 60 },
    title: "높은 철문 앞의 낙방 쪽지",
    body: "{여기}의 학교 높은 철문 앞에서 낙방 쪽지를 쥐고 우는 아이를 봅니다. 여섯 살의 당신도 명문 학교 정문 앞에서 꼭 저렇게 서 있었습니다. 아이 곁에는 아무도 없고, 구겨진 쪽지 귀퉁이에는 내년 시험 날짜가 적혀 있습니다.",
    choices: [
      { title: "한 해 동안 공부를 봐 준다", desc: "아이는 기회를 얻지만 시간이 든다",
        effect: { relationship: 5, knowledge: 2, happiness: -3, traits: { "선량": 1 },
                  flags: ["f_cb_elite_tutored"], log: "낙방한 아이의 공부를 한 해 동안 봐 줌" } },
      { title: "학비 장학금을 대 준다", desc: "확실하지만 큰돈이 든다",
        effect: { money: -200000, reputation: 5, traits: { "야심": 1 },
                  log: "낙방한 아이에게 학비를 대 주기로 함" },
        risk: { chance: 0.2, effect: { happiness: -4, log: "이듬해 아이가 또 떨어졌다는 소식을 들음" } } },
      { title: "내 낙방 이야기를 들려준다", desc: "아이는 웃지만 옛 상처가 쓰리다",
        effect: { happiness: -3, relationship: 3, traits: { "신중": 1 },
                  memory: "철문 앞에서 나눈 낙방담", log: "낙방한 아이에게 자기 낙방 이야기를 들려줌" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{여기}의 학교 철문 앞에서 낙방 쪽지를 쥔 아이가 당신의 수배서를 올려다봅니다. \"공부 못 해도 저렇게 유명해질 수 있어요?\" 여섯 살의 당신도 명문 학교 정문 앞에서 저렇게 울며 서 있었습니다.",
        choices: [
          { title: "공부는 계속하라고 타이른다", desc: "아이를 붙잡지만 체면이 우습다",
            effect: { happiness: -2, relationship: 3, traits: { "선량": 1 },
                      log: "낙방한 아이에게 공부를 놓지 말라고 타이름" } },
          { title: "금화로 학비를 쥐여 준다", desc: "확실하지만 돈의 출처가 남는다",
            effect: { money: -200000, standing: 4, traits: { "야심": 1 },
                      log: "낙방한 아이에게 금화로 학비를 쥐여 줌" },
            risk: { chance: 0.25, effect: { bounty: "+20%", log: "아이 가족이 금화 출처를 해군에 털어놓음" } } },
          { title: "배에 사환으로 데려간다", desc: "아이는 꿈을 얻지만 바다는 험하다",
            effect: { relationship: 5, happiness: 3, health: -3, traits: { "용기": 1 },
                      flags: ["f_cb_elite_cabin_kid"], log: "낙방한 아이를 배에 사환으로 태움" },
            risk: { chance: 0.25, effect: { happiness: -8, log: "사환 아이가 해전 중에 다침" } } }
        ]
      },
      "해군": {
        body: "{여기} 해군 학교 철문 앞에서 낙방 쪽지를 쥐고 우는 아이를 봅니다. 여섯 살의 당신도 명문 학교 정문 앞에서 저렇게 서 있었습니다. 아이는 당신 제복을 보고 해군이 되려면 꼭 학교를 나와야 하냐고 묻습니다.",
        choices: [
          { title: "추천서를 써 준다", desc: "길을 열어 주지만 이름을 건다",
            effect: { relationship: 5, standing: 3, traits: { "선량": 1 },
                      flags: ["f_cb_elite_tutored"], log: "낙방한 아이에게 해군 추천서를 써 줌" },
            risk: { chance: 0.25, effect: { standing: -6, log: "추천한 아이가 훈련소에서 도망쳐 책임을 짐" } } },
          { title: "신병으로 들어오라고 일러 준다", desc: "정직하지만 고된 길이다",
            effect: { standing: 2, happiness: -2, knowledge: 2, traits: { "신중": 1 },
                      log: "낙방한 아이에게 신병으로 시작하는 길을 일러 줌" },
            risk: { chance: 0.2, effect: { happiness: -3, log: "아이가 끝내 꿈을 접었다는 소식을 들음" } } },
          { title: "내 낙방 이야기를 들려준다", desc: "아이는 웃지만 옛 상처가 쓰리다",
            effect: { happiness: -3, relationship: 3, traits: { "용기": 1 },
                      memory: "철문 앞에서 나눈 낙방담", log: "제복 차림으로 자기 낙방 이야기를 들려줌" } }
        ]
      },
      "*": {}
    }
  }
]);

/* ───────────── dream_hobby ───────────── */
CB([
  // ───────── 장래희망 (10~11세 숙제 '커서 무엇이 되고 싶은가') ─────────
  {
    key: "cb_dream_navy",
    flags: ["f_dream_navy"],
    after: 7,
    when: { minAge: 18, maxAge: 55 },
    title: "숙제장 속의 해군",
    body: "{고향}에서 온 짐 꾸러미 속에 열 살 때의 숙제장이 끼어 있습니다. 삐뚤빼뚤한 글씨로 '정의로운 해군'이라고 적혀 있습니다. 같은 주에 {여기}의 해군 지부가 마을을 지킬 민간 경비대를 모은다는 공고를 붙였습니다.",
    choices: [
      { title: "경비대에 자원한다", desc: "꿈에 다가가지만 몸이 고되다",
        effect: { combat: 5, health: -5, standing: 3, traits: { "용기": 1 }, memory: "경비대 완장의 무게", log: "어릴 적 꿈을 좇아 민간 경비대에 자원함" },
        risk: { chance: 0.3, effect: { health: -10, log: "경비 중 해적 무리와 맞닥뜨려 다침" } } },
      { title: "동네 자경단을 꾸린다", desc: "이웃은 든든하지만 돈이 든다",
        effect: { relationship: 5, standing: 4, money: -60000, traits: { "선량": 1 }, log: "숙제장의 꿈을 동네 자경단으로 바꿔 꾸림" } },
      { title: "숙제장을 서랍에 넣는다", desc: "평온하지만 마음 한구석이 빈다",
        effect: { happiness: -4, health: 3, relationship: 2, traits: { "신중": 1 }, memory: "서랍 속 연필 글씨", log: "해군의 꿈을 접고 지금의 삶을 지키기로 함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "추격해 오던 해군선에서 앳된 병사 하나가 파도에 휩쓸려 떨어집니다. 허우적대는 얼굴을 보자 '정의로운 해군'이라고 적었던 열 살의 숙제장이 떠오릅니다. 그 꿈과 정반대 편에 선 당신의 손에 밧줄이 쥐여 있습니다.",
        choices: [
          { title: "밧줄을 던져 건진다", desc: "마음은 편하지만 동료가 의아해한다",
            effect: { happiness: 6, standing: -4, relationship: -2, traits: { "선량": 1 }, flags: ["f_cb_saved_marine"], memory: "젖은 해군 모자", log: "물에 빠진 해군 병사를 건져 보트에 태워 보냄" },
            risk: { chance: 0.3, effect: { health: -8, log: "병사를 건지는 사이 포탄 파편에 맞음" } } },
          { title: "그대로 뱃머리를 돌린다", desc: "모두 무사하지만 그 얼굴이 남는다",
            effect: { happiness: -6, relationship: 3, traits: { "신중": 1 }, log: "물에 빠진 해군을 두고 추격을 따돌림" } },
          { title: "흔들린 해군선을 들이친다", desc: "이름은 오르지만 대가가 크다",
            effect: { standing: 6, bounty: "+25%", health: -10, traits: { "용기": 1 }, log: "구조로 흐트러진 해군선을 역습함" } }
        ]
      },
      "해군": {
        body: "어릴 적 숙제장에 적었던 '정의로운 해군'이 된 지 여러 해입니다. 오늘 지부에 빵을 훔친 아이가 붙잡혀 왔고, 상관은 본보기로 무거운 벌을 내리라고 합니다. 아이가 고개를 들어 당신의 제복을 봅니다.",
        choices: [
          { title: "숙제장의 정의대로 감싼다", desc: "떳떳하지만 상관의 눈 밖에 난다",
            effect: { happiness: 6, standing: -5, traits: { "선량": 1 }, flags: ["f_cb_navy_kept_dream"], log: "빵 도둑 아이를 감싸고 상관과 맞섬" },
            risk: { chance: 0.25, effect: { standing: -4, reputation: -4, log: "명령 불복으로 경고 처분을 받음" } } },
          { title: "규정대로 처리한다", desc: "공적은 쌓이지만 마음이 무겁다",
            effect: { standing: 6, happiness: -6, traits: { "신중": 1 }, log: "빵 도둑 아이를 규정대로 처벌함" } },
          { title: "벌금을 몰래 대신 낸다", desc: "아이는 풀려나지만 내 돈이 든다",
            effect: { money: -80000, relationship: 4, happiness: 3, traits: { "야심": 1 }, log: "아이의 벌금을 몰래 대신 치러 줌" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_dream_pirate",
    flags: ["f_dream_pirate"],
    after: 7,
    when: { minAge: 18, maxAge: 55 },
    title: "숙제장 귀퉁이의 해골",
    body: "{여기} 항구 술집에 검은 깃발을 단 배의 선원들이 들어옵니다. 열 살 때 '자유로운 해적'이라고 숙제를 써 냈다가 어른들에게 혀 차는 소리를 들었던 일이 떠오릅니다. 선장이 당신 쪽을 보며 짐꾼을 구한다고 말합니다.",
    choices: [
      { title: "몰래 짐을 실어 준다", desc: "돈이 되지만 뒷말이 돈다",
        effect: { money: 80000, reputation: -6, traits: { "야심": 1 }, log: "해적선의 짐을 몰래 실어 주고 삯을 받음" },
        risk: { chance: 0.25, effect: { health: -8, log: "해군 단속에 휘말려 몸싸움 끝에 다침" } } },
      { title: "선장의 이야기를 밤새 듣는다", desc: "가슴이 뛰지만 술값이 든다",
        effect: { happiness: 7, knowledge: 2, money: -15000, traits: { "선량": 1 }, memory: "술집에서 들은 바다 이야기", log: "해적 선장의 항해담을 밤새 들음" } },
      { title: "해군 지부에 알린다", desc: "칭찬은 받지만 꿈을 배신한 기분이다",
        effect: { standing: 5, happiness: -6, traits: { "신중": 1 }, log: "항구에 든 해적선을 해군에 신고함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{고향} 근처 바다를 지나는데, 부두에서 한 아이가 당신 배를 향해 쪽지를 던집니다. '커서 자유로운 해적이 될 거예요.' 열 살의 당신이 숙제장에 썼던 바로 그 말입니다. 그 길이 얼마나 험한지 지금은 압니다.",
        choices: [
          { title: "꿈의 대가를 솔직히 말한다", desc: "진심이 닿지만 씁쓸하다",
            effect: { relationship: 5, happiness: -3, traits: { "선량": 1 }, log: "해적을 꿈꾸는 아이에게 바다의 대가를 들려줌" } },
          { title: "깃발 한 장을 선물한다", desc: "아이는 기뻐하지만 마을이 위험하다",
            effect: { standing: 5, happiness: 5, traits: { "용기": 1 }, memory: "부두에 남긴 검은 깃발", log: "부두의 아이에게 해적 깃발을 던져 줌" },
            risk: { chance: 0.3, effect: { reputation: -6, relationship: -3, log: "깃발 때문에 마을이 해군 조사를 받음" } } },
          { title: "고향 항로를 피해 간다", desc: "안전하지만 마음이 멀어진다",
            effect: { health: 3, happiness: -6, traits: { "신중": 1 }, log: "고향 바다를 피해 먼 항로로 돌아감" } }
        ]
      },
      "해군": {
        body: "붙잡은 해적의 소지품에서 해골 깃발 그림이 나옵니다. 열 살 때 '자유로운 해적'이라는 숙제장 귀퉁이에 당신이 그렸던 그림과 똑같습니다. 포로가 웃으며 말합니다. \"너도 한때 바다를 꿈꾼 얼굴이군.\"",
        choices: [
          { title: "포로의 사슬을 느슨히 둔다", desc: "속은 시원하지만 들키면 끝이다",
            effect: { happiness: 5, standing: -6, traits: { "용기": 1 }, flags: ["f_cb_navy_let_pirate"], log: "해적 포로가 달아날 틈을 일부러 남겨 둠" },
            risk: { chance: 0.3, effect: { standing: -5, reputation: -5, log: "포로 탈주의 책임을 지고 징계받음" } } },
          { title: "그림을 태우고 보고서를 쓴다", desc: "공은 쌓이지만 무언가 타 버린다",
            effect: { standing: 6, happiness: -5, traits: { "신중": 1 }, log: "어릴 적 그림 같은 깃발을 태우고 보고함" } },
          { title: "포로의 항해담을 듣는다", desc: "배울 게 많지만 눈총을 받는다",
            effect: { knowledge: 3, skills: { "항해술": 4 }, standing: -2, traits: { "선량": 1 }, log: "해적 포로에게서 먼바다 항로를 배움" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_dream_swordsman",
    flags: ["f_dream_swordsman"],
    after: 6,
    when: { minAge: 17, maxAge: 50 },
    title: "멍투성이 팔의 맹세",
    body: "{여기}에 떠돌이 검객이 나타나 도장마다 문을 두드립니다. 아직 아무도 이기지 못했다고 합니다. 열 살 때 멍 가실 날 없는 팔로 '최강의 검사'라고 숙제를 써 냈던 당신의 손이 저도 모르게 칼자루를 찾습니다.",
    choices: [
      { title: "녹슨 칼을 들고 맞선다", desc: "실력이 늘지만 크게 다칠 수 있다",
        effect: { combat: 5, health: -8, traits: { "용기": 1 }, memory: "떠돌이 검객의 칼끝", log: "떠돌이 검객에게 결투를 청해 맞섬" },
        risk: { chance: 0.3, effect: { health: -10, log: "검객의 칼에 어깨를 깊이 베임" } } },
      { title: "검객에게 가르침을 청한다", desc: "배우는 건 많지만 사례가 비싸다",
        effect: { skills: { "검술": 6 }, money: -100000, traits: { "신중": 1 }, log: "떠돌이 검객에게 사례를 치르고 검을 배움" } },
      { title: "동네 아이들에게 검을 가르친다", desc: "아이들은 따르지만 생업이 밀린다",
        effect: { relationship: 5, skills: { "검술": 2 }, money: -30000, traits: { "선량": 1 }, log: "어릴 적 꿈을 동네 아이들의 검술로 나눔" } }
    ],
    by: {
      "해적|혁명군": {
        body: "이름난 검객이 당신을 찾아와 결투를 청합니다. 동료들이 술렁입니다. 열 살 때 멍투성이 팔로 '최강의 검사'라고 써 냈던 숙제장이 떠오르고, 그 꿈이 이렇게 바다 위에서 시험받을 줄은 몰랐습니다.",
        choices: [
          { title: "결투를 받아들인다", desc: "이기면 이름이 나지만 피를 본다",
            effect: { combat: 7, health: -12, bounty: "+20%", traits: { "용기": 1 }, memory: "갑판 위의 일대일", log: "찾아온 검객과 갑판 위에서 결투함" },
            risk: { chance: 0.3, effect: { health: -12, log: "결투 끝에 깊은 상처가 남음" } } },
          { title: "동료들 앞에서 물러선다", desc: "몸은 지키지만 체면을 잃는다",
            effect: { standing: -4, happiness: -5, traits: { "신중": 1 }, log: "검객의 결투 신청을 거절함" } },
          { title: "검객을 동료로 꾀어 본다", desc: "든든한 칼이 생기지만 돈이 든다",
            effect: { relationship: 6, standing: 3, money: -150000, traits: { "선량": 1 }, log: "결투 대신 검객을 동료로 끌어들임" } }
        ]
      },
      "해군": {
        body: "지부에서 장교들이 지켜보는 검술 대회가 열립니다. 결승 상대는 당신의 직속 상관입니다. 열 살 때 '최강의 검사'라고 숙제장에 적었던 당신과, 진급을 앞둔 지금의 당신이 칼자루 위에서 다툽니다.",
        choices: [
          { title: "전력으로 우승을 노린다", desc: "실력은 증명하지만 상관이 언짢다",
            effect: { combat: 6, health: -5, relationship: -3, traits: { "용기": 1 }, log: "검술 대회 결승에서 상관에게 전력으로 맞섬" },
            risk: { chance: 0.25, effect: { health: -10, log: "결승전에서 목검에 갈비뼈를 다침" } } },
          { title: "상관에게 져 준다", desc: "앞날은 밝지만 칼이 부끄럽다",
            effect: { standing: 6, happiness: -6, traits: { "야심": 1 }, log: "검술 대회 결승에서 상관에게 일부러 짐" } },
          { title: "신병들의 칼을 봐 준다", desc: "따르는 이는 늘지만 내 수련은 준다",
            effect: { relationship: 5, skills: { "검술": 2 }, combat: -1, traits: { "선량": 1 }, log: "대회 대신 신병들의 검술을 봐 줌" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_dream_navigator",
    flags: ["f_dream_navigator"],
    after: 7,
    when: { minAge: 18, maxAge: 55 },
    title: "숙제장 뒷면의 해도",
    body: "{여기} 하늘에 낮게 깔린 구름이 몰려옵니다. 항구에서는 어선 한 척이 돌아오지 않았다고 웅성거립니다. 열 살 때 친구들과 놀지 않고 숙제장 뒷면에 엉터리 해도를 그리던 당신은, 지금 그 구름이 어디로 흐를지 압니다.",
    choices: [
      { title: "작은 배로 찾아 나선다", desc: "사람을 구하지만 바다가 험하다",
        effect: { relationship: 5, skills: { "항해술": 4 }, traits: { "용기": 1 }, memory: "폭풍 속 어선의 등불", log: "폭풍 속에 돌아오지 않은 어선을 찾아 나섬" },
        risk: { chance: 0.35, effect: { health: -12, log: "높은 파도에 배가 뒤집힐 뻔해 다침" } } },
      { title: "등대에서 물길을 일러 준다", desc: "안전하지만 애가 탄다",
        effect: { skills: { "항해술": 2 }, knowledge: 2, happiness: -3, traits: { "신중": 1 }, log: "등대에서 구조선에 바람길을 일러 줌" } },
      { title: "선주에게 길잡이 삯을 부른다", desc: "돈은 되지만 인심을 잃는다",
        effect: { money: 80000, relationship: -5, traits: { "야심": 1 }, log: "폭풍 구조 길잡이로 삯을 받음" } }
    ],
    by: {
      "해적|혁명군": {
        body: "해군 함대가 포위망을 좁혀 옵니다. 빠져나갈 길은 암초가 이빨처럼 솟은 좁은 물길뿐입니다. 열 살 때 숙제장 뒷면에 '세계 제일의 항해사'라고 쓰고 그렸던 엉터리 해도가, 지금 당신 머릿속에서 진짜 길이 됩니다.",
        choices: [
          { title: "암초 사이로 키를 꺾는다", desc: "빠져나가면 전설, 아니면 좌초다",
            effect: { skills: { "항해술": 6 }, bounty: "+20%", traits: { "용기": 1 }, memory: "암초 사이 한 뼘 물길", log: "암초 물길로 해군 포위망을 빠져나감" },
            risk: { chance: 0.35, effect: { health: -10, log: "배 밑이 암초에 긁혀 크게 흔들림" } } },
          { title: "키를 동료에게 맡긴다", desc: "믿음은 쌓이지만 내 꿈은 미룬다",
            effect: { relationship: 5, happiness: -4, traits: { "선량": 1 }, log: "포위망 돌파의 키를 동료에게 맡김" } },
          { title: "먼 바다로 돌아간다", desc: "안전하지만 보급이 바닥난다",
            effect: { money: -80000, health: -3, traits: { "신중": 1 }, log: "포위망을 피해 먼 바다로 크게 돌아감" } }
        ]
      },
      "해군": {
        body: "수송선 호위 임무에서 상관이 정한 항로 위로 폭풍 구름이 몰려옵니다. 열 살 때 숙제장 뒷면에 해도를 그리며 '세계 제일의 항해사'를 꿈꾸던 당신은 다른 길이 더 안전하다는 걸 압니다. 그러나 명령은 명령입니다.",
        choices: [
          { title: "내 판단대로 항로를 바꾼다", desc: "옳다면 공, 틀리면 문책이다",
            effect: { skills: { "항해술": 5 }, standing: 4, traits: { "용기": 1 }, log: "명령과 달리 폭풍을 피해 항로를 바꿈" },
            risk: { chance: 0.3, effect: { standing: -7, log: "항로 무단 변경으로 문책을 받음" } } },
          { title: "명령대로 폭풍을 뚫는다", desc: "규정은 지키지만 몸이 상한다",
            effect: { standing: 3, health: -7, traits: { "신중": 1 }, log: "명령받은 항로대로 폭풍을 뚫고 나아감" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_dream_cook",
    flags: ["f_dream_cook"],
    after: 6,
    when: { minAge: 17, maxAge: 55 },
    title: "전설의 요리사라는 숙제",
    body: "{여기}에 이름난 요리 대회가 열린다는 방이 붙었습니다. 열 살 때 '전설의 요리사'라고 숙제를 써 내고, 용돈을 털어 재료를 사 식구들에게 서툰 요리를 해 주던 날이 생각납니다. 같은 날이 가족의 생일이기도 합니다.",
    choices: [
      { title: "가게를 닫고 대회에 나간다", desc: "솜씨를 겨루지만 손해가 크다",
        effect: { skills: { "요리": 5 }, reputation: 4, money: -60000, traits: { "용기": 1 }, log: "어릴 적 꿈을 걸고 요리 대회에 나감" },
        risk: { chance: 0.3, effect: { happiness: -7, log: "요리 대회 첫 판에서 떨어짐" } } },
      { title: "대회 손님에게 국밥을 판다", desc: "돈은 벌지만 꿈은 구경만 한다",
        effect: { money: 70000, health: -4, happiness: -2, traits: { "야심": 1 }, log: "요리 대회 구경꾼에게 국밥을 팔아 돈을 범" } },
      { title: "생일상을 차린다", desc: "식구는 기뻐하지만 기회는 놓친다",
        effect: { relationship: 6, happiness: 3, money: -20000, traits: { "선량": 1 }, memory: "식구들과 둘러앉은 생일상", log: "대회 대신 가족의 생일상을 차림" } }
    ],
    by: {
      "해적|혁명군": {
        body: "배의 요리 담당이 열병으로 쓰러져 당신이 주방에 섭니다. 식량 창고에는 사흘 치도 남지 않았습니다. 열 살 때 '전설의 요리사'라고 숙제장에 썼던 손으로, 지금은 동료들의 마지막 끼니를 짜내야 합니다.",
        choices: [
          { title: "남은 고기를 다 나눈다", desc: "모두 든든하지만 나는 굶는다",
            effect: { relationship: 6, health: -6, traits: { "선량": 1 }, log: "마지막 고기를 동료들에게 다 나눠 먹임" } },
          { title: "거친 바다에서 고기를 낚는다", desc: "솜씨가 늘지만 위험하다",
            effect: { skills: { "요리": 4 }, happiness: 3, traits: { "용기": 1 }, memory: "파도 속 냄비 끓는 소리", log: "풍랑 속에 잡은 고기로 한 솥을 끓임" },
            risk: { chance: 0.3, effect: { health: -8, log: "풍랑에 미끄러져 갑판에 부딪힘" } } },
          { title: "배급을 반으로 줄인다", desc: "버티지만 원망을 듣는다",
            effect: { relationship: -4, health: -2, knowledge: 2, traits: { "신중": 1 }, log: "식량 배급을 반으로 줄여 버팀" } }
        ]
      },
      "해군": {
        body: "기지에 장성이 시찰을 와서 당신에게 오찬을 맡깁니다. 열 살 때 '전설의 요리사'를 꿈꾸며 식구들에게 끓여 주던 고향 음식이 떠오르지만, 정해진 식단표도 있습니다. 같은 시각 병사들은 찬밥을 먹습니다.",
        choices: [
          { title: "고향 음식을 낸다", desc: "마음을 담지만 격식에 어긋난다",
            effect: { happiness: 6, skills: { "요리": 3 }, traits: { "용기": 1 }, log: "장성의 오찬에 고향 음식을 올림" },
            risk: { chance: 0.3, effect: { standing: -5, log: "식단을 어겼다고 지적받음" } } },
          { title: "식단표대로 낸다", desc: "흠잡힐 일은 없지만 재미도 없다",
            effect: { standing: 5, happiness: -3, traits: { "신중": 1 }, log: "장성의 오찬을 식단표대로 차림" } },
          { title: "병사들 밥부터 챙긴다", desc: "병사들은 따르지만 윗선이 언짢다",
            effect: { relationship: 6, standing: -3, traits: { "선량": 1 }, memory: "병사들과 나눈 더운밥", log: "오찬 대신 병사들의 더운밥을 먼저 챙김" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_dream_shipwright",
    flags: ["f_dream_shipwright"],
    after: 6,
    when: { minAge: 17, maxAge: 60 },
    title: "숙제장에 그린 배",
    body: "{여기} 부두에 바닥이 썩은 낡은 어선이 들어옵니다. 가난한 어부는 싸게만 고쳐 달라고 사정합니다. 열 살 때 연장값을 모아 산 작은 대패와, '최고의 조선 장인'이라 적고 배를 그려 넣었던 숙제장이 문득 떠오릅니다.",
    choices: [
      { title: "자재값만 받고 고친다", desc: "고마워하지만 내 몫은 없다",
        effect: { relationship: 5, skills: { "제작": 3 }, money: -60000, traits: { "선량": 1 }, log: "가난한 어부의 배를 자재값만 받고 고침" } },
      { title: "제값을 받고 제대로 고친다", desc: "돈은 되지만 어부가 서운하다",
        effect: { money: 120000, relationship: -4, traits: { "야심": 1 }, log: "어부의 배를 제값 받고 고쳐 줌" } },
      { title: "용골부터 새로 짠다", desc: "솜씨가 늘지만 밤을 새운다",
        effect: { skills: { "제작": 6 }, health: -6, traits: { "용기": 1 }, memory: "새벽 부두의 대패 소리", log: "낡은 어선의 용골부터 새로 짜 맞춤" },
        risk: { chance: 0.2, effect: { health: -5, log: "대패질하다 손을 다침" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "포격에 맞은 배의 용골에 금이 갔습니다. 가장 가까운 섬까지는 사흘이고, 배를 손볼 줄 아는 사람은 당신뿐입니다. 열 살 때 숙제장에 '최고의 조선 장인'이라 쓰고 그렸던 배가, 지금 발밑에서 삐걱댑니다.",
        choices: [
          { title: "밤새 용골을 덧댄다", desc: "모두 살리지만 몸이 축난다",
            effect: { skills: { "제작": 5 }, relationship: 4, health: -8, traits: { "선량": 1 }, log: "금 간 용골을 밤새 덧대어 배를 살림" } },
          { title: "섬 조선소에 맡긴다", desc: "확실하지만 돈과 시간이 든다",
            effect: { money: -150000, health: 2, relationship: 3, traits: { "신중": 1 }, memory: "섬 조선소의 늙은 목수", log: "섬 조선소에 큰돈을 주고 배를 맡김" } },
          { title: "고치는 김에 배를 개조한다", desc: "빨라지지만 무리가 따른다",
            effect: { skills: { "제작": 4 }, standing: 5, happiness: -2, traits: { "용기": 1 }, log: "수리하며 돛대와 키를 고쳐 배를 빠르게 함" },
            risk: { chance: 0.3, effect: { health: -10, log: "개조한 돛대가 부러져 크게 다침" } } }
        ]
      },
      "해군": {
        body: "출항 하루 전, 군함 정비 중 당신만 아는 결함을 찾았습니다. 보고하면 출항이 늦어지고 상관이 크게 화를 낼 것입니다. 열 살 때 '최고의 조선 장인'이 되겠다던 당신의 눈에는 그 금이 너무 선명합니다.",
        choices: [
          { title: "결함을 그대로 보고한다", desc: "원칙대로지만 질책을 받는다",
            effect: { standing: 3, happiness: -4, traits: { "신중": 1 }, log: "출항 전 군함의 결함을 보고함" } },
          { title: "혼자 밤새 고친다", desc: "티 안 나게 해결하지만 고되다",
            effect: { skills: { "제작": 5 }, health: -7, traits: { "용기": 1 }, log: "군함 결함을 밤새 몰래 고침" },
            risk: { chance: 0.2, effect: { standing: -4, log: "무단 정비가 들켜 꾸중을 들음" } } },
          { title: "정비병들과 나눠 고친다", desc: "함께 해내지만 출항이 늦어진다",
            effect: { relationship: 5, skills: { "제작": 2 }, standing: -2, traits: { "선량": 1 }, log: "정비병들과 함께 군함 결함을 고침" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_dream_doctor",
    flags: ["f_dream_doctor"],
    after: 7,
    when: { minAge: 18, maxAge: 60 },
    title: "외워 두었던 약초 이름",
    body: "{여기} 길가에서 한 사내가 가슴을 움켜쥐고 쓰러집니다. 의원은 마을 반대편에 있습니다. 열 살 때 '사람을 살리는 의사'라고 숙제를 써 놓고 밤마다 외웠던 약초 이름과 맥 짚는 법이 머릿속에서 뒤엉킵니다.",
    choices: [
      { title: "기억나는 대로 처치한다", desc: "살릴 수 있지만 틀릴 수도 있다",
        effect: { skills: { "의술": 4 }, relationship: 4, traits: { "용기": 1 }, memory: "길가에서 짚은 첫 맥", log: "길에 쓰러진 사내를 직접 응급처치함" },
        risk: { chance: 0.3, effect: { happiness: -8, log: "처치가 서툴러 환자가 한동안 위독했음" } } },
      { title: "업고 의원까지 달린다", desc: "확실하지만 몸이 상한다",
        effect: { relationship: 5, health: -6, traits: { "선량": 1 }, log: "쓰러진 사내를 업고 의원까지 달림" } },
      { title: "사람들을 불러 모은다", desc: "안전하지만 손 놓고 지켜본다",
        effect: { relationship: 2, reputation: 4, happiness: -3, traits: { "신중": 1 }, log: "침착하게 사람들을 모아 의원을 부르러 보냄" } }
    ],
    by: {
      "해적|혁명군": {
        body: "격전이 끝난 갑판에 신음하는 부상자가 줄지어 눕습니다. 배에는 의사가 한 명도 없습니다. 열 살 때 '사람을 살리는 의사'라고 숙제장에 쓰고 약초 이름을 외우던 당신에게 동료들의 눈이 쏠립니다.",
        choices: [
          { title: "직접 칼을 들어 꿰맨다", desc: "살리지만 손이 떨린다",
            effect: { skills: { "의술": 6 }, relationship: 4, traits: { "용기": 1 }, memory: "피 묻은 바늘과 실", log: "의사 없는 배에서 직접 부상자를 꿰맴" },
            risk: { chance: 0.3, effect: { happiness: -8, log: "끝내 한 동료를 살리지 못함" } } },
          { title: "적선의 의사를 끌고 온다", desc: "빠르지만 원한을 산다",
            effect: { standing: 5, health: -6, relationship: -2, bounty: "+15%", traits: { "야심": 1 }, log: "적선에 뛰어들어 의사를 붙잡아 옴" } },
          { title: "가까운 섬으로 전속력을 낸다", desc: "확실하지만 비싸고 늦다",
            effect: { money: -100000, relationship: 3, knowledge: 2, traits: { "신중": 1 }, memory: "섬 의원의 불 켜진 창", log: "부상자를 싣고 가까운 섬 의원으로 감" } }
        ]
      },
      "해군": {
        body: "작전이 끝나자 아군과 해적 부상자가 한데 실려 옵니다. 상관은 아군부터 치료하라고 못 박습니다. 열 살 때 '사람을 살리는 의사'라고 쓴 숙제장의 아이라면 누구부터 살렸을지, 당신은 압니다.",
        choices: [
          { title: "해적 부상자도 함께 돌본다", desc: "떳떳하지만 명령을 어긴다",
            effect: { skills: { "의술": 4 }, happiness: 5, standing: -4, traits: { "선량": 1 }, flags: ["f_cb_navy_healed_enemy"], log: "명령을 어기고 해적 부상자도 치료함" },
            risk: { chance: 0.25, effect: { standing: -4, log: "명령 불복으로 견책을 받음" } } },
          { title: "명령대로 아군부터 돌본다", desc: "공은 쌓이지만 신음이 귀에 남는다",
            effect: { standing: 5, happiness: -6, traits: { "신중": 1 }, log: "명령대로 아군 부상자만 치료함" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_dream_scholar",
    flags: ["f_dream_scholar"],
    after: 7,
    when: { minAge: 18, maxAge: 65 },
    title: "역사를 밝히겠다던 아이",
    body: "{여기}의 헌 창고를 치우다 이상한 문양이 새겨진 돌판 조각이 나옵니다. 정부가 읽기를 금한 옛 글자와 닮았습니다. 열 살 때 친구들과 놀지 않고 책만 붙들며 '역사를 밝히는 학자'라고 숙제를 썼던 당신의 가슴이 뜁니다.",
    choices: [
      { title: "밤마다 몰래 해독한다", desc: "알게 되지만 위험한 앎이다",
        effect: { knowledge: 6, health: -3, traits: { "용기": 1 }, flags: ["f_cb_studied_stone"], memory: "등잔 아래 낯선 문양", log: "금지된 옛 글자를 밤마다 몰래 해독함" },
        risk: { chance: 0.25, effect: { reputation: -8, log: "금서를 연구한다는 소문이 퍼짐" } } },
      { title: "해군 지부에 넘긴다", desc: "안전하지만 꿈을 내준다",
        effect: { standing: 4, happiness: -6, traits: { "신중": 1 }, log: "금지된 문양의 돌판을 해군에 넘김" } },
      { title: "수집가에게 판다", desc: "돈은 되지만 행방을 모른다",
        effect: { money: 90000, happiness: -5, traits: { "야심": 1 }, log: "옛 돌판 조각을 수집가에게 팔아넘김" } }
    ],
    by: {
      "해적|혁명군": {
        body: "빼앗은 화물 속에서 불에 그을린 고문서 한 묶음이 나옵니다. 지워진 역사의 한 조각일지도 모릅니다. 열 살 때 '역사를 밝히는 학자'라고 숙제장에 썼던 당신은, 이 종이가 얼마나 위험하고 귀한지 압니다.",
        choices: [
          { title: "선실에서 직접 읽어 낸다", desc: "알게 되지만 밤잠을 잃는다",
            effect: { knowledge: 6, health: -4, traits: { "신중": 1 }, flags: ["f_cb_studied_stone"], log: "그을린 고문서를 선실에서 밤새 읽어 냄" } },
          { title: "암시장에 비싸게 넘긴다", desc: "큰돈이지만 역사는 사라진다",
            effect: { money: 300000, happiness: -6, traits: { "야심": 1 }, log: "고문서를 암시장에 비싸게 넘김" } },
          { title: "숨은 학자에게 전해 준다", desc: "뜻은 있지만 추적이 붙는다",
            effect: { relationship: 4, standing: 5, traits: { "선량": 1 }, log: "고문서를 숨어 사는 학자에게 전해 줌" },
            risk: { chance: 0.3, effect: { health: -10, log: "고문서를 전하다 추적대에 쫓겨 다침" } } }
        ]
      },
      "해군": {
        body: "압수품 가운데 금지된 고문서를 모두 태우라는 명령이 떨어집니다. 불길 앞에서 종이를 넘기던 당신의 손이 멈춥니다. 열 살 때 '역사를 밝히는 학자'라고 숙제를 써 냈던 아이가 아직 당신 안에 있습니다.",
        choices: [
          { title: "명령대로 불에 던진다", desc: "공은 쌓이지만 재가 날린다",
            effect: { standing: 5, happiness: -7, traits: { "신중": 1 }, log: "금지된 고문서를 명령대로 태움" } },
          { title: "한 장을 몰래 베껴 둔다", desc: "역사를 지키지만 들키면 끝이다",
            effect: { knowledge: 5, happiness: 3, traits: { "용기": 1 }, flags: ["f_cb_navy_copied_text"], log: "태울 고문서 한 장을 몰래 베껴 둠" },
            risk: { chance: 0.3, effect: { standing: -8, log: "고문서를 베낀 것이 들켜 징계받음" } } },
          { title: "보존을 건의서로 올린다", desc: "떳떳하지만 눈 밖에 난다",
            effect: { standing: -4, knowledge: 2, relationship: 3, traits: { "선량": 1 }, log: "고문서 보존을 공식 건의서로 올림" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_dream_merchant",
    flags: ["f_dream_merchant"],
    after: 7,
    when: { minAge: 18, maxAge: 60 },
    title: "깍쟁이의 첫 장부",
    body: "{여기}의 큰 상단이 당신에게 동업을 제안합니다. 같은 날 오랜 단골이 찾아와 외상을 부탁합니다. 열 살 때 '큰 부자 상인'이라고 숙제를 쓰고 동전을 세다가 깍쟁이 소리를 들었던 당신의 셈이 빨라집니다.",
    choices: [
      { title: "상단과 손을 잡는다", desc: "큰돈이 오가지만 위험하다",
        effect: { money: 300000, happiness: -4, traits: { "야심": 1 }, log: "큰 상단과 동업 계약을 맺음" },
        risk: { chance: 0.3, effect: { reputation: -8, log: "상단의 거래가 틀어져 신용을 잃음" } } },
      { title: "단골에게 외상을 준다", desc: "정은 쌓이지만 돈이 묶인다",
        effect: { relationship: 6, money: -60000, traits: { "선량": 1 }, log: "어려운 단골에게 외상을 내줌" } },
      { title: "장부부터 다시 맞춘다", desc: "탄탄해지지만 기회는 놓친다",
        effect: { skills: { "장사": 5 }, knowledge: 2, happiness: -3, traits: { "신중": 1 }, log: "동업 대신 장부를 처음부터 다시 맞춤" } }
    ],
    by: {
      "해적|혁명군": {
        body: "창고에 쌓인 노획물을 처분할 때가 왔습니다. 암상인은 값을 후하게 쳐 주겠다지만 뒤가 구립니다. 열 살 때 '큰 부자 상인'이라고 숙제장에 쓰고 동전을 세던 아이의 셈법이 아직 당신 머릿속에서 돌아갑니다.",
        choices: [
          { title: "암상인에게 통째로 넘긴다", desc: "큰돈이지만 함정일 수 있다",
            effect: { money: 300000, reputation: -6, traits: { "야심": 1 }, log: "노획물을 암상인에게 통째로 넘김" },
            risk: { chance: 0.3, effect: { health: -8, log: "거래 장소에 해군이 들이닥쳐 다침" } } },
          { title: "동료 몫을 공평히 나눈다", desc: "믿음은 얻지만 내 몫은 작다",
            effect: { relationship: 6, money: 60000, happiness: -2, traits: { "선량": 1 }, log: "노획물 값을 동료들과 공평히 나눔" } },
          { title: "섬 상인들과 거래망을 튼다", desc: "길게 보면 남지만 밑천이 든다",
            effect: { skills: { "장사": 5 }, standing: 4, money: -60000, traits: { "신중": 1 }, flags: ["f_cb_island_trade"], log: "섬 상인들과 은밀한 거래망을 틈" } }
        ]
      },
      "해군": {
        body: "보급 계약을 노리는 상인이 묵직한 봉투를 당신 책상에 놓고 갑니다. 열 살 때 '큰 부자 상인'을 꿈꾸며 동전을 세던 당신은 이 봉투의 무게를 한눈에 압니다. 제복의 무게도 압니다.",
        choices: [
          { title: "봉투를 챙긴다", desc: "주머니는 두둑하지만 위험하다",
            effect: { money: 200000, happiness: -4, traits: { "야심": 1 }, log: "보급 상인의 뇌물 봉투를 챙김" },
            risk: { chance: 0.3, effect: { standing: -8, reputation: -5, log: "뇌물이 감찰에 걸려 징계받음" } } },
          { title: "돌려주고 보고한다", desc: "떳떳하지만 적이 생긴다",
            effect: { standing: 5, relationship: -4, traits: { "신중": 1 }, log: "뇌물을 돌려주고 상부에 보고함" } },
          { title: "더 싼 상인을 찾아낸다", desc: "예산을 아끼지만 발품이 든다",
            effect: { skills: { "장사": 5 }, standing: 3, health: -3, traits: { "선량": 1 }, log: "발품을 팔아 더 싼 보급 상인을 찾음" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_dream_adventurer",
    flags: ["f_dream_adventurer"],
    after: 7,
    when: { minAge: 18, maxAge: 55 },
    title: "무릎 흉터의 지도",
    body: "{여기}의 늙은 뱃사람이 어느 해도에도 없는 섬의 지도 조각을 당신에게 내밉니다. 열 살 때 '세계를 누비는 모험가'라고 숙제를 쓰고 쏘다니다 생긴 무릎의 흉터가 근질거립니다. 떠나면 지금의 삶은 한동안 멈춥니다.",
    choices: [
      { title: "일을 접고 그 섬을 찾는다", desc: "가슴이 뛰지만 모든 걸 건다",
        effect: { happiness: 10, money: -150000, traits: { "용기": 1 }, memory: "이름 없는 섬의 첫 발자국", log: "지도 조각을 들고 이름 없는 섬을 찾아 떠남" },
        risk: { chance: 0.3, effect: { health: -12, log: "이름 없는 섬의 절벽에서 굴러 크게 다침" } } },
      { title: "지도를 탐험가에게 판다", desc: "돈은 되지만 꿈이 떠난다",
        effect: { money: 100000, happiness: -6, traits: { "야심": 1 }, log: "이름 없는 섬의 지도를 탐험가에게 팖" } },
      { title: "가족과 가까운 섬에 다녀온다", desc: "작은 모험이지만 정이 쌓인다",
        effect: { relationship: 5, happiness: 4, money: -60000, traits: { "선량": 1 }, log: "큰 모험 대신 가족과 가까운 섬을 다녀옴" } }
    ],
    by: {
      "해적|혁명군": {
        body: "항로 밖 수평선에 어느 해도에도 없는 섬 그림자가 보입니다. 목적지는 반대쪽이고 동료들은 지쳐 있습니다. 열 살 때 '세계를 누비는 모험가'라고 숙제를 쓰고 쏘다니다 생긴 무릎 흉터가 당신을 부추깁니다.",
        choices: [
          { title: "뱃머리를 틀어 상륙한다", desc: "발견의 기쁨, 그러나 위험하다",
            effect: { happiness: 8, standing: 4, traits: { "용기": 1 }, memory: "해도 밖 섬의 모래", log: "항로를 틀어 해도에 없는 섬에 상륙함" },
            risk: { chance: 0.3, effect: { health: -12, log: "미지의 섬에서 맹수에게 습격당함" } } },
          { title: "위치만 적어 두고 지나간다", desc: "언젠가를 기약하지만 아쉽다",
            effect: { knowledge: 4, happiness: -4, traits: { "신중": 1 }, flags: ["f_cb_unknown_isle_map"], log: "해도 밖 섬의 위치만 기록하고 지나감" } },
          { title: "동료들의 뜻을 묻는다", desc: "믿음은 얻지만 결정은 늦다",
            effect: { relationship: 5, happiness: -2, traits: { "선량": 1 }, log: "미지의 섬 상륙을 동료들의 뜻에 맡김" } }
        ]
      },
      "해군": {
        body: "순찰 경로 바깥에 해도에 없는 섬이 보입니다. 정찰은 임무에 없고, 보고서 한 줄이면 끝날 일입니다. 열 살 때 '세계를 누비는 모험가'라고 숙제를 쓰던 아이의 흉터가 제복 무릎 아래에서 근질거립니다.",
        choices: [
          { title: "정찰을 자청한다", desc: "가슴이 뛰지만 위험하다",
            effect: { happiness: 7, standing: 3, traits: { "용기": 1 }, memory: "해도 밖 섬의 모래", log: "해도에 없는 섬의 정찰을 자청함" },
            risk: { chance: 0.3, effect: { health: -12, log: "정찰 중 섬의 늪에 빠져 크게 다침" } } },
          { title: "보고서에만 남긴다", desc: "규정대로지만 꿈은 접는다",
            effect: { standing: 4, happiness: -5, traits: { "신중": 1 }, log: "해도 밖 섬을 보고서 한 줄로만 남김" } }
        ]
      },
      "*": {}
    }
  },

  // ───────── 취미 ('마음이 가는 일') ─────────
  {
    key: "cb_hobby_fishing",
    flags: ["f_hobby_fishing"],
    after: 5,
    when: { minAge: 16, maxAge: 75 },
    title: "늘 앉던 낚시 바위",
    body: "처음 제 손으로 낚은 물고기를 들고 한참 자랑하던 날부터, 당신은 늘 같은 바위에서 혼자 낚싯대를 드리웠습니다. 오늘 그 바위에 낯선 아이가 엉킨 줄을 붙들고 울상을 짓고 있습니다. 먼바다에는 큰 고기 떼가 들었다는 소문도 돕니다.",
    choices: [
      { title: "아이에게 매듭을 가르친다", desc: "인연이 생기지만 혼자의 시간은 준다",
        effect: { relationship: 5, happiness: -2, traits: { "선량": 1 }, memory: "바위 위 두 개의 낚싯대", log: "낚시 바위의 아이에게 매듭을 가르쳐 줌" } },
      { title: "다른 바위로 옮겨 혼자 낚는다", desc: "마음은 편하지만 정이 멀어진다",
        effect: { health: 4, happiness: 4, relationship: -4, traits: { "신중": 1 }, log: "아이를 두고 다른 바위에서 혼자 낚시함" } },
      { title: "먼바다 고기 떼를 쫓는다", desc: "큰 수확이지만 위험하다",
        effect: { money: 60000, happiness: 3, traits: { "용기": 1 }, log: "먼바다 고기 떼를 쫓아 큰 고기를 낚음" },
        risk: { chance: 0.3, effect: { health: -10, log: "먼바다에서 풍랑을 만나 다침" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "바람이 끊긴 바다에서 배가 열흘째 떠돌고 식량이 바닥났습니다. 처음 낚은 물고기를 자랑하던 그날부터 놓지 않은 낚싯대가, 이제 동료들 목숨줄이 됩니다. 저 아래 깊은 물에는 해왕류의 그림자도 어른거립니다.",
        choices: [
          { title: "밤새 줄을 드리운다", desc: "모두 먹이지만 몸이 축난다",
            effect: { relationship: 6, health: -6, traits: { "선량": 1 }, log: "표류 중 밤새 낚시해 동료들을 먹임" } },
          { title: "해왕류 영역에서 대물을 노린다", desc: "잔치가 되거나 큰일이 난다",
            effect: { happiness: 8, standing: 4, traits: { "용기": 1 }, memory: "갑판을 덮은 거대한 비늘", log: "해왕류 영역에서 거대한 고기를 낚아 올림" },
            risk: { chance: 0.35, effect: { health: -14, log: "해왕류에게 줄째 끌려가 크게 다침" } } },
          { title: "배급을 줄이고 바람을 기다린다", desc: "버티지만 원망을 듣는다",
            effect: { relationship: -4, health: -3, knowledge: 2, traits: { "신중": 1 }, log: "낚시 대신 배급을 줄여 바람을 기다림" } }
        ]
      },
      "해군": {
        body: "기지에서 장교들의 낚시 모임에 끼라는 권유가 옵니다. 같은 날 병사들은 당신이 낚은 고기로 잔치를 하자고 조릅니다. 처음 낚은 물고기를 자랑하던 아이는 이제 낚싯대 하나로도 사람 사이를 오가게 되었습니다.",
        choices: [
          { title: "장교들의 모임에 낀다", desc: "앞날에 좋지만 즐겁진 않다",
            effect: { standing: 5, happiness: -3, traits: { "야심": 1 }, log: "장교들의 낚시 모임에 끼어 얼굴을 알림" } },
          { title: "병사들과 생선 잔치를 연다", desc: "정이 쌓이지만 돈이 든다",
            effect: { relationship: 6, money: -20000, traits: { "선량": 1 }, log: "낚은 고기로 병사들과 잔치를 엶" } },
          { title: "혼자 방파제로 나간다", desc: "쉬지만 양쪽 다 서운해한다",
            effect: { health: 4, happiness: 5, relationship: -4, traits: { "신중": 1 }, log: "모임도 잔치도 마다하고 혼자 낚시함" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_hobby_painting",
    flags: ["f_hobby_painting"],
    after: 5,
    when: { minAge: 16, maxAge: 75 },
    title: "벽에 붙여 둔 첫 그림",
    body: "처음 완성해 벽에 붙여 두었던 삐뚤빼뚤한 그림을, 지나가던 부유한 수집가가 한참 들여다봅니다. 서툴러서 오히려 마음이 간다며 값을 넉넉히 치르겠다고 합니다. 마침 마을 사람들은 낡은 벽에 그림을 그려 줄 사람을 찾습니다.",
    choices: [
      { title: "첫 그림을 판다", desc: "큰돈이지만 다시 못 그린다",
        effect: { money: 200000, happiness: -7, traits: { "야심": 1 }, log: "처음 완성한 그림을 수집가에게 팖" } },
      { title: "새 그림을 밤새 그려 준다", desc: "첫 그림은 지키지만 고되다",
        effect: { money: 60000, health: -5, traits: { "신중": 1 }, log: "첫 그림 대신 새 그림을 밤새 그려 팖" } },
      { title: "마을 벽화를 그린다", desc: "모두의 그림이지만 물감값이 든다",
        effect: { relationship: 6, reputation: 3, money: -30000, traits: { "선량": 1 }, memory: "물감 냄새 나는 마을 벽", log: "마을의 낡은 벽에 벽화를 그림" } }
    ],
    by: {
      "해적|혁명군": {
        body: "다음 작전을 앞두고 동료가 해군 기지의 모습을 그려 줄 사람을 찾습니다. 처음 그림을 벽에 붙이던 날 이후 한 번도 붓을 놓지 않은 당신의 손이 눈에 띄었습니다. 그림은 이제 무기도, 위안도 될 수 있습니다.",
        choices: [
          { title: "기지를 몰래 스케치한다", desc: "작전에 보탬이 되지만 위험하다",
            effect: { standing: 6, skills: { "항해술": 2 }, traits: { "용기": 1 }, log: "해군 기지에 숨어들어 지형을 스케치함" },
            risk: { chance: 0.35, effect: { health: -10, log: "스케치하다 경비병에게 들켜 쫓김" } } },
          { title: "동료들의 얼굴을 그린다", desc: "정이 깊어지지만 작전엔 못 쓴다",
            effect: { relationship: 6, money: -20000, traits: { "선량": 1 }, memory: "선실 벽의 동료 초상", log: "작전 대신 동료들의 초상을 그려 줌" } },
          { title: "그림을 팔아 자금을 댄다", desc: "돈은 되지만 붓이 무겁다",
            effect: { money: 100000, happiness: -6, traits: { "야심": 1 }, log: "아끼던 그림을 팔아 배의 자금을 댐" } }
        ]
      },
      "해군": {
        body: "전사한 동기의 유족이 아들의 얼굴을 남겨 달라고 당신을 찾아옵니다. 같은 주에 장성은 집무실에 걸 자기 초상화를 그려 오라고 합니다. 처음 그린 그림을 벽에 붙이던 아이의 붓이 두 곳에 불려 갑니다.",
        choices: [
          { title: "동기의 초상을 먼저 그린다", desc: "유족은 울지만 장성이 언짢다",
            effect: { relationship: 6, happiness: -4, standing: -2, traits: { "선량": 1 }, memory: "액자 속 동기의 웃음", log: "전사한 동기의 초상을 그려 유족에게 줌" } },
          { title: "장성의 초상부터 바친다", desc: "앞날에 좋지만 마음이 쓰리다",
            effect: { standing: 6, happiness: -5, traits: { "야심": 1 }, log: "장성의 초상화를 그려 집무실에 걸게 함" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_hobby_music",
    flags: ["f_hobby_music"],
    after: 5,
    when: { minAge: 16, maxAge: 75 },
    title: "끝까지 연주한 그 곡",
    body: "처음으로 한 곡을 끝까지 연주하자 박수가 쏟아지던 날을 당신은 잊지 못합니다. {여기} 축제 악단에 빈자리가 생겼다는 소식이 옵니다. 같은 밤, 앓아누운 옛 이웃이 그 곡을 한 번만 더 듣고 싶다고 전해 왔습니다.",
    choices: [
      { title: "축제 무대에 선다", desc: "이름이 나지만 실수할 수 있다",
        effect: { reputation: 5, happiness: 6, traits: { "용기": 1 }, memory: "축제 무대의 등불", log: "축제 악단의 빈자리에 서서 연주함" },
        risk: { chance: 0.25, effect: { happiness: -8, log: "무대에서 줄이 끊겨 웃음거리가 됨" } } },
      { title: "이웃의 창가에서 연주한다", desc: "마음은 닿지만 무대는 놓친다",
        effect: { relationship: 6, happiness: -2, traits: { "선량": 1 }, memory: "창가에 닿은 마지막 곡", log: "앓는 옛 이웃의 창가에서 그 곡을 연주함" } },
      { title: "주점 연주로 돈을 받는다", desc: "돈은 되지만 노래가 닳는다",
        effect: { money: 60000, happiness: -4, traits: { "야심": 1 }, log: "축제 밤 주점에서 삯을 받고 연주함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "큰일을 치른 밤, 동료들이 악기를 내밀며 그 곡을 청합니다. 처음 끝까지 연주했을 때의 박수가 떠오르지만, 근처 바다에는 해군 순찰선의 불빛이 어른거립니다. 노랫소리는 바다 위에서 멀리 갑니다.",
        choices: [
          { title: "갑판 연회를 연다", desc: "흥이 오르지만 소리가 샌다",
            effect: { relationship: 6, happiness: 5, traits: { "선량": 1 }, memory: "갑판 위 떼창", log: "순찰선 근처에서 갑판 연회를 열고 연주함" },
            risk: { chance: 0.3, effect: { health: -10, log: "노랫소리를 쫓아온 순찰선과 교전함" } } },
          { title: "악기를 내려놓고 망을 본다", desc: "안전하지만 흥이 깨진다",
            effect: { happiness: -6, health: 2, traits: { "신중": 1 }, log: "연주를 미루고 밤새 순찰선을 살핌" } },
          { title: "순찰선을 향해 크게 연주한다", desc: "배짱을 알리지만 쫓긴다",
            effect: { standing: 6, bounty: "+20%", traits: { "용기": 1 }, log: "해군 순찰선을 향해 보란 듯이 연주함" },
            risk: { chance: 0.3, effect: { health: -12, log: "도발에 응한 순찰선의 포격을 맞음" } } }
        ]
      },
      "해군": {
        body: "기지 군악대가 당신을 차출하겠다고 합니다. 그날 밤 감옥선 아래층에서 해적 포로들이 당신이 처음 끝까지 연주했던 그 곡을 흥얼거리는 소리가 들립니다. 같은 노래가 양쪽에서 당신을 부릅니다.",
        choices: [
          { title: "군악대 차출에 응한다", desc: "앞날엔 좋지만 곡은 정해져 있다",
            effect: { standing: 5, happiness: -4, traits: { "야심": 1 }, log: "기지 군악대에 차출되어 행진곡을 연주함" } },
          { title: "포로들과 그 곡을 켠다", desc: "마음이 통하지만 눈총을 받는다",
            effect: { relationship: 5, happiness: 4, standing: -4, traits: { "선량": 1 }, flags: ["f_cb_navy_prison_song"], log: "감옥선에서 포로들과 같은 곡을 연주함" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_hobby_cooking",
    flags: ["f_hobby_cooking"],
    after: 5,
    when: { minAge: 16, maxAge: 75 },
    title: "짰던 첫 국의 맛",
    body: "처음 끓인 국은 짰지만 가족들은 말없이 다 먹어 주었습니다. {고향}에서 그때 맛을 아는 이웃 할머니가 입맛을 잃었다는 편지가 옵니다. 한편 {여기} 부두에서는 당신 국 맛을 아는 일꾼들이 노점을 내 보라고 부추깁니다.",
    choices: [
      { title: "그 국을 끓여 찾아간다", desc: "마음은 닿지만 뱃삯이 든다",
        effect: { relationship: 6, happiness: 3, money: -30000, traits: { "선량": 1 }, memory: "짭짤한 첫 국 냄새", log: "고향 할머니에게 그때 그 국을 끓여 감" } },
      { title: "부두에 국 노점을 낸다", desc: "돈은 되지만 몸이 고되다",
        effect: { money: 100000, skills: { "요리": 3 }, health: -5, traits: { "야심": 1 }, log: "부두에 국 노점을 내 일꾼들에게 팖" },
        risk: { chance: 0.2, effect: { health: -5, log: "끓는 솥에 팔을 데임" } } },
      { title: "그 맛을 기록으로 남긴다", desc: "솜씨는 늘지만 누구도 못 먹는다",
        effect: { skills: { "요리": 4 }, knowledge: 2, happiness: -3, traits: { "신중": 1 }, log: "첫 국부터의 요리법을 공책에 정리함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "붙잡아 온 적 선원이 사흘째 아무것도 먹지 않습니다. 동료들은 굶기라며 웃습니다. 처음 끓인 짠 국을 말없이 다 먹어 주던 가족의 얼굴이 떠올라, 당신의 손이 냄비 쪽으로 갑니다.",
        choices: [
          { title: "포로에게도 국을 떠 준다", desc: "사람을 얻지만 동료가 수군댄다",
            effect: { relationship: 3, standing: -4, happiness: 4, traits: { "선량": 1 }, flags: ["f_cb_fed_captive"], log: "굶는 포로에게 국을 떠 먹임" } },
          { title: "항구 식당에 숨어 정보를 캔다", desc: "쓸모 있지만 위험하다",
            effect: { standing: 5, skills: { "요리": 3 }, traits: { "용기": 1 }, log: "항구 식당 주방에 숨어들어 정보를 캠" },
            risk: { chance: 0.3, effect: { health: -8, log: "정체가 들켜 주방 뒷문으로 도망침" } } },
          { title: "동료들 잔칫상을 차린다", desc: "흥이 오르지만 식량이 준다",
            effect: { relationship: 5, happiness: 4, money: -60000, traits: { "신중": 1 }, log: "포로는 두고 동료들 잔칫상을 차림" } }
        ]
      },
      "해군": {
        body: "기지 취사병이 모자라 당신이 주방을 돕게 되었습니다. 처음 끓인 국은 짰지만, 지금 병사들은 당신이 끓인 국을 두고 고향 맛이라며 줄을 섭니다. 그런데 장성이 손님 만찬을 당신에게 맡기겠다는 전갈을 보냅니다.",
        choices: [
          { title: "병사들의 국을 계속 끓인다", desc: "병사들은 따르지만 본업이 밀린다",
            effect: { relationship: 6, skills: { "요리": 3 }, standing: -2, traits: { "선량": 1 }, log: "병사들의 국을 끓이느라 만찬을 사양함" } },
          { title: "장성의 만찬을 맡는다", desc: "눈에 띄지만 병사들이 서운하다",
            effect: { standing: 6, relationship: -3, traits: { "야심": 1 }, log: "장성의 손님 만찬을 맡아 차림" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_hobby_woodwork",
    flags: ["f_hobby_woodwork"],
    after: 5,
    when: { minAge: 16, maxAge: 75 },
    title: "다리 짧은 첫 의자",
    body: "처음 깎은 의자는 한쪽 다리가 짧았지만 지금도 쓰고 있습니다. 그 의자가 마침내 삐걱 하고 주저앉은 날, {여기}의 부잣집에서 큰 가구를 주문하고 싶다는 전갈이 옵니다. 이웃 아이들은 목마를 만들어 달라고 조릅니다.",
    choices: [
      { title: "부잣집 가구를 맡는다", desc: "돈은 되지만 손이 상한다",
        effect: { money: 150000, health: -5, traits: { "야심": 1 }, log: "부잣집의 큰 가구 주문을 맡아 만듦" },
        risk: { chance: 0.25, effect: { health: -6, log: "끌이 미끄러져 손을 깊이 베임" } } },
      { title: "첫 의자를 고쳐 쓴다", desc: "추억은 지키지만 돈은 안 된다",
        effect: { happiness: 6, skills: { "제작": 3 }, money: -10000, traits: { "신중": 1 }, memory: "다리를 맞춘 첫 의자", log: "다리 짧던 첫 의자를 고쳐 다시 씀" } },
      { title: "아이들의 목마를 깎는다", desc: "아이들은 기뻐하지만 나무값이 든다",
        effect: { relationship: 5, money: -20000, traits: { "선량": 1 }, memory: "아이들이 타던 나무 목마", log: "이웃 아이들에게 목마를 깎아 줌" } }
    ],
    by: {
      "해적|혁명군": {
        body: "지난 싸움에서 다리를 잃은 동료가 선실에 틀어박혀 나오지 않습니다. 배에는 쓸 만한 목재가 조금 남았고, 다음 항구가 멀지 않습니다. 다리 짧은 첫 의자를 깎던 손이 다시 끌을 찾습니다.",
        choices: [
          { title: "동료의 나무 다리를 깎는다", desc: "동료가 일어서지만 밤을 새운다",
            effect: { relationship: 7, skills: { "제작": 4 }, health: -4, traits: { "선량": 1 }, memory: "선실 바닥의 나무 부스러기", log: "다리 잃은 동료에게 나무 다리를 깎아 줌" } },
          { title: "목재로 미끼 배를 만든다", desc: "적을 속이지만 위험하다",
            effect: { standing: 6, skills: { "제작": 2 }, traits: { "용기": 1 }, log: "남은 목재로 해군을 속일 미끼 배를 만듦" },
            risk: { chance: 0.3, effect: { health: -10, log: "미끼 배를 띄우다 포격에 휘말림" } } },
          { title: "목재를 아껴 배 수리에 쓴다", desc: "배는 튼튼하지만 동료가 서운하다",
            effect: { health: 3, relationship: -4, traits: { "신중": 1 }, log: "남은 목재를 배 수리에만 씀" } }
        ]
      },
      "해군": {
        body: "폭풍이 쓸고 간 바닷가 마을에 배 한 척 남지 않았습니다. 같은 주에 장교 하나가 새 집무 책상을 짜 달라며 넉넉한 사례를 약속합니다. 다리 짧은 첫 의자를 깎던 손으로, 당신은 어느 쪽 나무를 먼저 다듬을지 정해야 합니다.",
        choices: [
          { title: "마을의 고깃배를 짜 준다", desc: "마을이 살지만 몸이 고되다",
            effect: { relationship: 5, standing: 3, health: -6, traits: { "선량": 1 }, log: "폭풍 맞은 마을에 고깃배를 짜 줌" } },
          { title: "장교의 책상을 짠다", desc: "사례는 두둑하지만 뒷맛이 쓰다",
            effect: { money: 60000, standing: 2, happiness: -3, traits: { "야심": 1 }, log: "장교의 집무 책상을 짜고 사례를 받음" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_hobby_gardening",
    flags: ["f_hobby_gardening"],
    after: 5,
    when: { minAge: 16, maxAge: 80 },
    title: "처음 싹이 튼 텃밭",
    body: "처음 심은 씨앗에서 싹이 오르던 날 몇 번이나 들여다보던 텃밭이, 올여름 가뭄 속에서 마을에 하나 남은 푸른 땅이 되었습니다. 이웃들이 바구니를 들고 기웃거리고, 시장 상인은 값을 세 배로 쳐 주겠다고 합니다.",
    choices: [
      { title: "이웃과 나눠 먹는다", desc: "정은 깊어지지만 내 몫이 준다",
        effect: { relationship: 6, health: -3, traits: { "선량": 1 }, memory: "가뭄 속 푸른 이랑", log: "가뭄에 남은 텃밭 채소를 이웃과 나눔" } },
      { title: "시장에 비싸게 판다", desc: "돈은 되지만 눈총을 받는다",
        effect: { money: 80000, relationship: -5, traits: { "야심": 1 }, log: "가뭄 속 텃밭 채소를 시장에 비싸게 팖" } },
      { title: "씨앗을 받아 둔다", desc: "내년을 기약하지만 지금은 아깝다",
        effect: { knowledge: 3, happiness: -3, traits: { "신중": 1 }, flags: ["f_cb_seed_kept"], log: "가뭄을 견딘 작물에서 씨앗을 받아 둠" } }
    ],
    by: {
      "해적|혁명군": {
        body: "긴 항해 끝에 동료들의 잇몸에서 피가 납니다. 괴혈병입니다. 처음 싹 틔운 날부터 손을 놓지 않은 당신이 선미에 몰래 둔 화분 몇 개에 푸른 잎이 달려 있습니다. 근처 무인도에는 약초가 자란다는 말도 있습니다.",
        choices: [
          { title: "화분 잎을 모두 나눈다", desc: "동료가 살지만 텃밭은 끝난다",
            effect: { relationship: 6, happiness: -3, traits: { "선량": 1 }, log: "선미 화분의 잎을 괴혈병 동료들에게 나눔" } },
          { title: "무인도에 내려 약초를 찾는다", desc: "더 구할 수 있지만 위험하다",
            effect: { skills: { "의술": 4 }, relationship: 3, traits: { "용기": 1 }, memory: "무인도의 쓴 풀 냄새", log: "무인도에 내려 괴혈병 약초를 찾아옴" },
            risk: { chance: 0.3, effect: { health: -10, log: "무인도 덤불에서 독충에 물림" } } }
        ]
      },
      "해군": {
        body: "해적에게 불탄 마을의 밭이 잿더미가 되었습니다. 당신은 처음 싹 틔운 날의 설렘을 기억하는 손으로 다시 흙을 고를 수 있습니다. 하지만 기지 사령관은 시찰단이 오기 전에 기지 정원을 꾸며 두라고 합니다.",
        choices: [
          { title: "휴가를 반납하고 밭을 일군다", desc: "마을이 살지만 몸이 고되다",
            effect: { relationship: 5, standing: 3, health: -5, traits: { "선량": 1 }, memory: "잿더미 위 첫 새싹", log: "휴가를 반납하고 불탄 마을의 밭을 일굼" } },
          { title: "기지 정원을 꾸민다", desc: "사령관 눈에 들지만 마을은 잊는다",
            effect: { standing: 6, relationship: -3, traits: { "야심": 1 }, log: "시찰 전 기지 정원을 꾸며 칭찬받음" } }
        ]
      },
      "*": {}
    }
  },
  {
    key: "cb_hobby_reading",
    flags: ["f_hobby_reading"],
    after: 5,
    when: { minAge: 16, maxAge: 80 },
    title: "밤새 읽은 그 책",
    body: "{여기}의 헌책방에서, 오래전 밤새 읽고도 머릿속을 떠나지 않던 바로 그 책을 다시 만납니다. 그런데 여백에 누군가 섬 이름과 항로를 빼곡히 적어 두었습니다. 책방 주인은 값을 꽤 부르고, 손님들은 그 책 이야기를 나누고 싶어 합니다.",
    choices: [
      { title: "여백의 항로를 따라간다", desc: "모험이지만 헛걸음일 수 있다",
        effect: { happiness: 6, money: -60000, traits: { "용기": 1 }, memory: "여백에 적힌 낯선 항로", log: "헌책 여백에 적힌 항로를 따라 떠남" },
        risk: { chance: 0.3, effect: { health: -8, log: "여백의 항로 끝에서 험한 바위에 다침" } } },
      { title: "값을 치르고 소장한다", desc: "아는 게 늘지만 지갑이 얇다",
        effect: { knowledge: 4, money: -60000, traits: { "신중": 1 }, log: "그 책을 비싸게 사서 여백까지 읽어 냄" } },
      { title: "책방에서 읽기 모임을 연다", desc: "친구가 생기지만 일이 밀린다",
        effect: { relationship: 5, knowledge: 2, money: -20000, traits: { "선량": 1 }, log: "헌책방에서 그 책의 읽기 모임을 엶" } }
    ],
    by: {
      "해적|혁명군": {
        body: "빼앗은 짐 속에서 오래전 밤새 읽었던 바로 그 책이 나옵니다. 글을 모르는 동료 몇이 표지만 만지작거립니다. 책장 사이에는 옛 장군의 전술이 적혀 있고, 장물아비는 귀한 판본이라며 값을 쳐 주겠다고 합니다.",
        choices: [
          { title: "동료들에게 글을 가르친다", desc: "고마워하지만 밤잠을 잃는다",
            effect: { relationship: 6, knowledge: 2, health: -3, traits: { "선량": 1 }, memory: "선실 등잔 아래 받아쓰기", log: "그 책으로 동료들에게 글을 가르침" } },
          { title: "책 속 전술을 써 본다", desc: "통하면 이름이 나지만 위험하다",
            effect: { standing: 5, combat: 3, traits: { "용기": 1 }, log: "책에서 읽은 옛 전술로 싸움을 이끔" },
            risk: { chance: 0.3, effect: { health: -10, log: "책 속 전술이 어긋나 크게 다침" } } },
          { title: "장물아비에게 판다", desc: "돈은 되지만 다시 못 읽는다",
            effect: { money: 100000, happiness: -5, traits: { "야심": 1 }, log: "그 책을 귀한 판본이라며 팔아넘김" } }
        ]
      },
      "해군": {
        body: "기지 도서실 관리를 맡게 되었습니다. 서가 구석에서 밤새 읽었던 그 책을 발견하고 반가워하던 참에, 승진 시험 날짜가 공고됩니다. 병사들은 도서실 문을 더 오래 열어 달라고 부탁합니다.",
        choices: [
          { title: "병사들에게 책을 빌려준다", desc: "고마워하지만 내 공부는 밀린다",
            effect: { relationship: 6, standing: -2, traits: { "선량": 1 }, log: "도서실을 늦게까지 열어 병사들에게 책을 빌려줌" } },
          { title: "시험 공부에 매달린다", desc: "앞날에 좋지만 병사들이 서운하다",
            effect: { knowledge: 5, standing: 3, relationship: -4, traits: { "야심": 1 }, log: "도서실 문을 닫고 승진 시험 공부에 매달림" } },
          { title: "옛 전투 기록을 정리한다", desc: "쓸모 있지만 몸이 축난다",
            effect: { standing: 5, knowledge: 2, health: -4, traits: { "신중": 1 }, log: "도서실의 옛 전투 기록을 정리해 보고함" } }
        ]
      },
      "*": {}
    }
  }
]);

/* ───────────── goal ───────────── */
CB([
  // ── 해적왕이 되기 ──
  {
    key: "cb_goal_pirate_king",
    flags: ["f_goal_pirate_king"],
    after: 5,
    when: { minAge: 20, maxAge: 55 },
    title: "술집에서 들은 해적왕",
    body: "바다를 바라보며 해적왕을 꿈꾸겠다고 정한 날로부터 몇 해가 흘렀지만, 당신은 아직 해적 깃발을 올리지 못했습니다. {여기}의 항구 술집에서 누군가 신문을 접으며 \"해적왕 같은 건 미친놈들 얘기지\" 하고 웃습니다. 잔을 쥔 손에 저도 모르게 힘이 들어갑니다.",
    choices: [
      { title: "낡은 배를 사들인다", desc: "가슴은 뛰지만 가진 돈이 바닥난다",
        effect: { money: -150000, happiness: 7, skills: { "항해술": 3 }, traits: { "용기": 1 }, flags: ["f_cb_pk_bought_boat"],
                  memory: "물이 새던 첫 내 배", log: "해적왕의 꿈을 좇아 낡은 배를 사들임" },
        risk: { chance: 0.25, effect: { health: -8, log: "낡은 배의 시운전 중 돛대에 맞아 다침" } } },
      { title: "같은 꿈을 꾸는 사람을 찾는다", desc: "동료가 생기지만 허풍쟁이 소리를 듣는다",
        effect: { relationship: 5, reputation: -4, traits: { "선량": 1 }, flags: ["f_cb_pk_found_mate"],
                  log: "술집에서 같은 꿈을 꾸는 사람과 의기투합함" } },
      { title: "꿈을 묻고 일에 매달린다", desc: "주머니는 두둑해지지만 밤이 길어진다",
        effect: { money: 120000, happiness: -7, traits: { "신중": 1 },
                  log: "해적왕의 꿈을 접어 두고 일에 몰두함" } }
    ],
    by: {
      "해적": {
        body: "해적왕이 되겠다고 정한 날로부터 몇 해, 당신의 배는 아직 위대한 항로의 끝을 보지 못했습니다. 신문에는 연일 사황의 이름이 오르내리고, 밤 당직을 서던 선원이 조심스레 묻습니다. \"선장, 우리 정말 거기까지 가는 겁니까?\"",
        choices: [
          { title: "더 험한 항로로 키를 돌린다", desc: "이름은 오르지만 배가 버틸지 모른다",
            effect: { bounty: "+25%", standing: 6, health: -5, traits: { "용기": 1 },
                      log: "해적왕을 향해 더 험한 항로를 택함" },
            risk: { chance: 0.3, effect: { health: -10, log: "험한 항로에서 폭풍을 만나 크게 다침" } } },
          { title: "선원들에게 꿈을 다시 말한다", desc: "배가 하나가 되지만 잔치에 돈이 든다",
            effect: { relationship: 6, happiness: 3, money: -100000, traits: { "선량": 1 },
                      memory: "갑판 위 횃불 잔치", log: "잔치를 열고 선원들에게 꿈을 다시 말함" } },
          { title: "옛 항해 기록부터 모은다", desc: "길은 보이지만 선원들이 지루해한다",
            effect: { knowledge: 5, skills: { "항해술": 4 }, relationship: -3, traits: { "신중": 1 },
                      log: "해적왕의 길을 찾아 옛 항해 기록을 모음" } }
        ]
      },
      "해군": {
        body: "해적왕을 꿈꾸겠다던 당신은 지금 해적을 잡는 제복을 입고 있습니다. 오늘 붙잡은 해적 선장이 감방 창살 너머로 당신을 오래 바라보다 웃습니다. \"당신 눈빛, 우리랑 똑같군.\" 그 말이 밤새 귀에서 떠나지 않습니다.",
        choices: [
          { title: "제복을 벗을 날을 헤아린다", desc: "마음은 가볍지만 군에서 눈 밖에 난다",
            effect: { happiness: 6, standing: -5, traits: { "용기": 1 }, flags: ["f_cb_pk_doubt_uniform"],
                      log: "해적왕의 꿈이 되살아나 제복을 벗을 날을 헤아림" } },
          { title: "해적에게 먼 바다를 묻는다", desc: "배우는 게 많지만 들키면 곤란하다",
            effect: { knowledge: 4, skills: { "항해술": 4 }, traits: { "선량": 1 },
                      log: "감방의 해적 선장에게 먼 바다 이야기를 들음" },
            risk: { chance: 0.25, effect: { standing: -6, log: "해적과 오래 이야기한 일이 상부에 보고됨" } } },
          { title: "꿈을 접고 임무에 충실한다", desc: "공적은 쌓이지만 가슴 한쪽이 식는다",
            effect: { standing: 6, happiness: -7, traits: { "신중": 1 },
                      log: "해적왕의 꿈을 접고 임무에 충실하기로 함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 세계 최고의 검사가 되기 ──
  {
    key: "cb_goal_swordsman",
    flags: ["f_goal_swordsman"],
    after: 5,
    when: { minAge: 20, maxAge: 55 },
    title: "흉터로 센 세월",
    body: "세계 최고의 검사가 되겠다고 정한 날부터 당신은 검을 놓은 날이 없습니다. 몸에 남은 흉터를 세어 보면 그동안의 세월이 보입니다. 그런데 {여기}에 이름난 떠돌이 검객이 들렀다는 소문이 돌고, 당신의 손바닥이 먼저 땀에 젖습니다.",
    choices: [
      { title: "검객에게 진검 승부를 청한다", desc: "한 단계 오르지만 크게 베일 수 있다",
        effect: { combat: 6, skills: { "검술": 4 }, traits: { "용기": 1 },
                  memory: "달빛 아래 맞부딪친 칼날", log: "떠돌이 검객에게 진검 승부를 청해 겨룸" },
        risk: { chance: 0.35, effect: { health: -14, log: "진검 승부에서 어깨를 깊이 베임" } } },
      { title: "고개를 숙이고 가르침을 청한다", desc: "솜씨는 늘지만 자존심과 돈이 든다",
        effect: { skills: { "검술": 7 }, money: -100000, reputation: -3, traits: { "신중": 1 },
                  log: "떠돌이 검객에게 고개 숙여 가르침을 받음" } },
      { title: "동네 아이들에게 검을 가르친다", desc: "따르는 이가 생기지만 내 검은 더디다",
        effect: { relationship: 5, money: 60000, happiness: -3, traits: { "선량": 1 },
                  log: "검객을 쫓는 대신 아이들에게 검을 가르침" } }
    ],
    by: {
      "해적|혁명군": {
        body: "세계 최고의 검사가 되겠다고 정한 날부터 당신은 검을 놓은 날이 없습니다. 그 사이 당신을 쫓는 해군 중에도 이름난 검사가 생겼습니다. 오늘 {여기}의 부두에서 그 검사의 하얀 코트가 보이고, 칼자루를 쥔 손이 먼저 반응합니다.",
        choices: [
          { title: "해군 검사에게 정면으로 맞선다", desc: "이름이 퍼지지만 크게 베일 수 있다",
            effect: { combat: 6, bounty: "+20%", traits: { "용기": 1 },
                      log: "쫓아온 해군 검사와 부두에서 정면으로 겨룸" },
            risk: { chance: 0.35, effect: { health: -15, log: "해군 검사의 칼에 옆구리를 베임" } } },
          { title: "숨어서 그의 검을 훔쳐본다", desc: "배우는 게 있지만 도망쳤다는 말을 듣는다",
            effect: { skills: { "검술": 5 }, standing: -4, happiness: -3, traits: { "신중": 1 },
                      log: "해군 검사를 피해 숨어서 그의 검술을 익힘" } },
          { title: "동료에게 검을 가르친다", desc: "배가 든든해지지만 내 검은 더디다",
            effect: { relationship: 5, standing: 3, happiness: -3, traits: { "선량": 1 },
                      log: "검사 대신 동료들에게 검을 가르치는 데 힘씀" } }
        ]
      },
      "해군": {
        body: "세계 최고의 검사가 되겠다고 정한 날부터 당신은 검을 놓은 날이 없습니다. 이번에 기지 감옥에 이름난 해적 검객이 들어왔습니다. 순찰을 도는 당신에게 그가 낮게 말합니다. \"문을 열어 주면 한 수 보여 주지.\"",
        choices: [
          { title: "감방 문을 열고 겨뤄 본다", desc: "검이 깊어지지만 들키면 큰일이다",
            effect: { combat: 7, happiness: 4, traits: { "용기": 1 },
                      log: "감옥의 해적 검객과 몰래 칼을 맞대 봄" },
            risk: { chance: 0.35, effect: { standing: -8, health: -6, log: "몰래 한 대련이 들켜 징계를 받음" } } },
          { title: "창살 너머로 말만 나눈다", desc: "규정은 지키지만 배움이 얕다",
            effect: { skills: { "검술": 4 }, knowledge: 3, happiness: -3, traits: { "신중": 1 },
                      log: "해적 검객과 창살을 사이에 두고 검을 논함" } },
          { title: "부하들의 검술 교관을 자청한다", desc: "공적은 쌓이지만 내 검은 더디다",
            effect: { standing: 6, relationship: 3, happiness: -3, traits: { "선량": 1 },
                      log: "해적 검객 대신 부하들의 검술 교관을 맡음" } }
        ]
      },
      "*": {}
    }
  },

  // ── 만병통치약과도 같은 의사 되기 ──
  {
    key: "cb_goal_doctor",
    flags: ["f_goal_doctor"],
    after: 5,
    when: { minAge: 20, maxAge: 60 },
    title: "한밤의 문 두드림",
    body: "어떤 병이든 고치는 의사가 되겠다고 정한 날부터 당신의 방에는 의학책이 쌓여 갑니다. 오늘 밤 누군가 문을 다급하게 두드립니다. 이웃집 아이가 불덩이 같은 열에 시달리는데, 그 집에는 의원에게 낼 돈이 한 푼도 없다고 합니다.",
    choices: [
      { title: "밤새 아이 곁을 지킨다", desc: "실력이 늘지만 몸이 상한다",
        effect: { skills: { "의술": 5 }, relationship: 5, health: -5, traits: { "선량": 1 },
                  memory: "새벽에 내린 아이의 열", log: "열에 시달리는 이웃 아이를 밤새 돌봄" },
        risk: { chance: 0.2, effect: { health: -8, log: "아이의 열병이 옮아 며칠을 앓아누움" } } },
      { title: "제대로 된 의원에게 데려간다", desc: "확실하지만 치료비를 내가 낸다",
        effect: { money: -80000, relationship: 3, knowledge: 3, traits: { "신중": 1 },
                  log: "치료비를 대신 내고 아이를 의원에게 데려감" } },
      { title: "치료비를 받고 고쳐 준다", desc: "제값을 받지만 이웃이 서운해한다",
        effect: { money: 80000, skills: { "의술": 4 }, relationship: -5, traits: { "야심": 1 },
                  log: "가난한 이웃에게도 치료비를 받고 아이를 고침" } }
    ],
    by: {
      "해적|혁명군": {
        body: "어떤 병이든 고치는 의사가 되겠다고 정한 날부터 당신은 배의 의무실을 지켜 왔습니다. 오늘 싸움이 끝나자 피 흘리는 동료들 사이에 붙잡힌 해군 병사 하나가 섞여 있습니다. 수술대는 하나뿐이고, 선원들이 당신의 손끝을 지켜봅니다.",
        choices: [
          { title: "적이라도 먼저 수술한다", desc: "가장 위급한 이를 살리지만 원성을 산다",
            effect: { skills: { "의술": 6 }, standing: -4, happiness: 3, traits: { "선량": 1 },
                      log: "가장 위급했던 해군 포로부터 수술함" },
            risk: { chance: 0.25, effect: { health: -6, log: "정신을 차린 포로가 메스를 빼앗아 휘두름" } } },
          { title: "동료부터 차례로 꿰맨다", desc: "배는 하나가 되지만 마음이 무겁다",
            effect: { relationship: 5, skills: { "의술": 3 }, happiness: -5, traits: { "신중": 1 },
                      log: "포로를 뒤로 미루고 동료들부터 치료함" } },
          { title: "포로를 살려 몸값을 받는다", desc: "돈이 들어오지만 씁쓸하다",
            effect: { money: 200000, standing: 4, happiness: -6, traits: { "야심": 1 },
                      log: "치료한 해군 포로를 몸값을 받고 넘김" } }
        ]
      },
      "해군": {
        body: "어떤 병이든 고치는 의사가 되겠다고 정한 날부터 당신은 군의 의무실을 지켜 왔습니다. 오늘 소탕전이 끝나자 부상병들 사이에 숨이 넘어가는 해적 포로가 실려 옵니다. 상관은 \"우리 병사부터\"라고 못 박고 돌아섭니다.",
        choices: [
          { title: "숨이 급한 포로부터 수술한다", desc: "의사의 도리지만 명령을 어긴다",
            effect: { skills: { "의술": 6 }, standing: -5, happiness: 3, traits: { "선량": 1 },
                      log: "명령을 어기고 위급한 해적 포로부터 수술함" } },
          { title: "명령대로 병사부터 치료한다", desc: "공적은 쌓이지만 한 사람을 놓친다",
            effect: { standing: 5, skills: { "의술": 3 }, happiness: -5, traits: { "신중": 1 },
                      log: "명령대로 아군 부상병부터 치료함" } },
          { title: "군의관 시험 공부에 매달린다", desc: "출세가 빨라지지만 밤이 사라진다",
            effect: { knowledge: 5, standing: 3, health: -5, traits: { "야심": 1 },
                      log: "그날 이후 군의관 시험 공부에 밤을 새움" } }
        ]
      },
      "*": {}
    }
  },

  // ── 세계일주하기 ──
  {
    key: "cb_goal_world_tour",
    flags: ["f_goal_world_tour"],
    after: 5,
    when: { minAge: 20, maxAge: 60 },
    title: "지도 위의 빈칸",
    body: "세계를 한 바퀴 돌겠다고 정한 날, 당신은 벽에 세계지도를 붙이고 가 본 바다에 표시를 하기로 했습니다. 몇 해가 지난 지금도 지도에는 빈칸이 많습니다. 마침 먼 바다로 가는 상선이 일손을 구하는데, 한번 떠나면 몇 해는 돌아오지 못한다고 합니다.",
    choices: [
      { title: "짐을 꾸려 상선에 오른다", desc: "설레지만 남은 사람들과 멀어진다",
        effect: { happiness: 8, skills: { "항해술": 4 }, relationship: -5, traits: { "용기": 1 },
                  memory: "지도에 새로 그은 선", log: "먼 바다로 가는 상선에 일손으로 올라탐" },
        risk: { chance: 0.25, effect: { health: -8, log: "낯선 바다의 풍토병에 걸려 고생함" } } },
      { title: "다음을 기약하며 돈을 모은다", desc: "든든해지지만 지도는 그대로다",
        effect: { money: 100000, happiness: -6, traits: { "신중": 1 },
                  log: "상선을 보내고 다음 여행을 위해 돈을 모음" } },
      { title: "여행자들의 이야기를 모은다", desc: "세상을 배우지만 발은 묶여 있다",
        effect: { knowledge: 5, relationship: 3, happiness: -3, traits: { "선량": 1 },
                  memory: "나그네들이 그려 준 지도", log: "항구의 여행자들에게 먼 바다 이야기를 모음" } }
    ],
    by: {
      "해적|혁명군": {
        body: "세계를 한 바퀴 돌겠다고 정한 날부터 당신은 해도에 지나온 바다를 표시해 왔습니다. 다음 빈칸으로 가는 가장 빠른 길에는 해군의 봉쇄선이 걸려 있습니다. 항해사가 해도를 펼치며 돌아가는 길은 석 달이 더 걸린다고 말합니다.",
        choices: [
          { title: "봉쇄선을 뚫고 지나간다", desc: "빠르고 이름도 나지만 포격이 쏟아진다",
            effect: { bounty: "+20%", skills: { "항해술": 5 }, traits: { "용기": 1 },
                      log: "해군 봉쇄선을 정면으로 뚫고 지나감" },
            risk: { chance: 0.35, effect: { health: -12, log: "봉쇄선을 뚫다 포탄 파편에 맞음" } } },
          { title: "석 달을 돌아 안전하게 간다", desc: "안전하지만 보급에 돈이 든다",
            effect: { money: -100000, skills: { "항해술": 3 }, happiness: -3, traits: { "신중": 1 },
                      log: "봉쇄선을 피해 석 달을 돌아서 항해함" } },
          { title: "현지 어부를 안내인으로 태운다", desc: "샛길을 알지만 품삯이 든다",
            effect: { relationship: 5, knowledge: 3, money: -60000, traits: { "선량": 1 },
                      log: "현지 어부의 안내로 샛길을 지나감" } }
        ]
      },
      "해군": {
        body: "세계를 한 바퀴 돌겠다고 정한 날부터 당신은 근무지가 바뀔 때마다 해도에 표시를 해 왔습니다. 이번에 먼 바다로 가는 원정 함대가 지원자를 받습니다. 몇 해짜리 원정이라 가족과도, 본부의 승진 줄과도 멀어집니다.",
        choices: [
          { title: "원정 함대에 자원한다", desc: "새 바다를 보지만 가족과 멀어진다",
            effect: { happiness: 7, skills: { "항해술": 5 }, relationship: -5, traits: { "용기": 1 },
                      log: "먼 바다로 가는 원정 함대에 자원함" },
            risk: { chance: 0.25, effect: { health: -8, log: "원정 중 해왕류의 습격을 받아 다침" } } },
          { title: "본부에 남아 승진을 노린다", desc: "출세가 빠르지만 지도는 그대로다",
            effect: { standing: 6, happiness: -6, traits: { "야심": 1 },
                      log: "원정을 포기하고 본부에 남아 승진을 노림" } },
          { title: "해도 작성반에 들어간다", desc: "바다를 배우지만 책상 앞이다",
            effect: { knowledge: 5, skills: { "항해술": 3 }, happiness: -3, traits: { "신중": 1 },
                      log: "원정 대신 본부의 해도 작성반에 들어감" } }
        ]
      },
      "*": {}
    }
  },

  // ── 엄청난 부자가 되기 ──
  {
    key: "cb_goal_rich",
    flags: ["f_goal_rich"],
    after: 5,
    when: { minAge: 20, maxAge: 60 },
    title: "장부 끝의 숫자",
    body: "엄청난 부자가 되겠다고 정한 날부터 당신은 한 푼도 허투루 쓰지 않았고, 장부의 숫자는 조금씩 불어났습니다. 그런데 오랜 친구가 찾아와 큰 장사를 함께하자고 합니다. 친구의 눈은 진지하지만, 이야기에는 빈틈이 보입니다.",
    choices: [
      { title: "모은 돈을 걸고 판을 키운다", desc: "크게 벌 수도, 다 잃을 수도 있다",
        effect: { money: 400000, skills: { "장사": 4 }, traits: { "야심": 1 },
                  log: "친구의 장사에 모은 돈을 걸어 판을 키움" },
        risk: { chance: 0.35, effect: { money: -400000, happiness: -6, log: "장사가 엎어져 번 돈을 고스란히 날림" } } },
      { title: "친구에게 돈만 빌려준다", desc: "우정은 지키지만 돌려받기 어렵다",
        effect: { relationship: 6, money: -100000, traits: { "선량": 1 },
                  log: "장사는 사양하고 친구에게 돈을 빌려줌" } },
      { title: "번 돈으로 한 해 쉬어 간다", desc: "마음은 편하지만 꿈에서 멀어진다",
        effect: { happiness: 8, relationship: 3, money: -150000, traits: { "신중": 1 },
                  memory: "장부를 덮고 보낸 한 해", log: "장부를 덮고 번 돈으로 한 해를 쉬어 감" } }
    ],
    by: {
      "해적": {
        body: "엄청난 부자가 되겠다고 정한 날부터 당신은 약탈한 보물을 착실히 쌓아 왔습니다. 이번에 턴 상선의 금고는 지금까지 본 것 중 가장 큽니다. 선원들은 벌써부터 제 몫을 셈하며 웅성거리고, 당신은 금화 더미 앞에서 셈을 다시 합니다.",
        choices: [
          { title: "선장 몫을 크게 떼어 간다", desc: "금고가 차지만 선원들이 수군댄다",
            effect: { money: 600000, relationship: -6, traits: { "야심": 1 },
                      log: "약탈한 금고에서 선장 몫을 크게 떼어 감" },
            risk: { chance: 0.3, effect: { health: -10, log: "몫에 불만을 품은 선원들과 칼부림이 남" } } },
          { title: "공평하게 나눠 준다", desc: "배가 하나가 되지만 내 몫은 적다",
            effect: { money: 150000, relationship: 5, standing: 3, traits: { "선량": 1 },
                      log: "약탈한 보물을 선원들과 공평하게 나눔" } },
          { title: "무인도에 묻어 둔다", desc: "훗날을 위하지만 당장은 손에 없다",
            effect: { skills: { "항해술": 3 }, happiness: -3, traits: { "신중": 1 }, flags: ["f_cb_rich_buried"],
                      memory: "무인도에 묻은 금고", log: "약탈한 보물을 무인도에 몰래 묻어 둠" } }
        ]
      },
      "해군": {
        body: "엄청난 부자가 되겠다고 정한 날부터 당신은 해군 봉급을 착실히 모아 왔지만, 장부의 숫자는 좀처럼 꿈에 닿지 않습니다. 오늘 밤 한 상인이 묵직한 봉투를 내밀며 \"검문 한 번만 눈감아 주시면 됩니다\" 하고 속삭입니다.",
        choices: [
          { title: "봉투를 받아 품에 넣는다", desc: "단번에 불어나지만 들키면 끝이다",
            effect: { money: 500000, standing: -5, traits: { "야심": 1 },
                      log: "상인의 뇌물을 받고 검문을 눈감아 줌" },
            risk: { chance: 0.3, effect: { standing: -8, reputation: -6, log: "뇌물을 받은 일이 들통나 징계를 받음" } } },
          { title: "봉투를 돌려보내고 보고한다", desc: "공적은 쌓이지만 적이 생긴다",
            effect: { standing: 6, relationship: -4, traits: { "신중": 1 },
                      log: "뇌물을 거절하고 상인을 상부에 보고함" } },
          { title: "비번 날에 부업을 시작한다", desc: "정직하게 벌지만 몸이 고되다",
            effect: { money: 150000, skills: { "장사": 5 }, health: -5, traits: { "용기": 1 },
                      log: "뇌물 대신 비번 날마다 부업 장사를 함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 가족을 지키기 ──
  {
    key: "cb_goal_family",
    flags: ["f_goal_family"],
    after: 5,
    when: { minAge: 22, maxAge: 60 },
    title: "식탁의 빈자리",
    body: "가족을 지키겠다고 정한 날부터 당신은 무엇보다 집을 먼저 생각해 왔습니다. 그런데 오늘은 가족이 모두 모이는 저녁인데, 마침 놓치기 아까운 큰 일감이 들어왔습니다. 식탁에 놓일 빈 의자 하나가 자꾸 눈앞에 그려집니다.",
    choices: [
      { title: "일감을 미루고 집으로 간다", desc: "가족은 기뻐하지만 일을 놓친다",
        effect: { relationship: 6, happiness: 4, money: -80000, traits: { "선량": 1 },
                  memory: "모두 모인 저녁 식탁", log: "큰 일감을 미루고 가족과 저녁을 보냄" } },
      { title: "일을 끝내고 선물을 사 간다", desc: "형편은 나아지지만 자리는 비었다",
        effect: { money: 120000, relationship: -4, traits: { "야심": 1 },
                  log: "일을 마치고 늦게 선물을 들고 귀가함" } },
      { title: "그 돈으로 집을 손본다", desc: "오래 남지만 내 손이 고되다",
        effect: { skills: { "제작": 4 }, relationship: 3, health: -4, traits: { "신중": 1 },
                  log: "일감을 마친 돈으로 직접 집을 고쳐 손봄" } }
    ],
    by: {
      "해적|혁명군": {
        body: "가족을 지키겠다고 정한 날부터 당신은 바다 위에서도 집 쪽 하늘을 먼저 바라보았습니다. 그런데 가족이 사는 {고향}에 당신의 수배서가 붙고, 해군이 주민들을 캐묻기 시작했다는 소식이 들려옵니다.",
        choices: [
          { title: "몰래 가족을 찾아간다", desc: "얼굴을 보지만 꼬리가 밟힐 수 있다",
            effect: { relationship: 6, happiness: 5, traits: { "용기": 1 },
                      log: "해군의 눈을 피해 몰래 가족을 찾아감" },
            risk: { chance: 0.35, effect: { health: -10, relationship: -4, log: "뒤를 밟힌 탓에 가족까지 조사를 받음" } } },
          { title: "돈만 보내고 멀리 있는다", desc: "가족은 안전하지만 마음이 아프다",
            effect: { money: -150000, relationship: 2, happiness: -6, traits: { "신중": 1 },
                      log: "가족 곁에 가지 않고 돈만 몰래 보냄" } },
          { title: "가족을 배로 데려온다", desc: "곁에 두지만 동료들이 불안해한다",
            effect: { relationship: 6, standing: -4, traits: { "선량": 1 }, flags: ["f_cb_family_aboard"],
                      log: "가족을 배에 태워 함께 지내기로 함" },
            risk: { chance: 0.3, effect: { health: -8, log: "가족을 감싸다 추격전에서 다침" } } }
        ]
      },
      "해군": {
        body: "가족을 지키겠다고 정한 날부터 당신은 휴가를 한 번도 허투루 쓰지 않았습니다. 그런데 오늘 먼 기지로 가라는 전근 명령이 내려왔습니다. 받아들이면 승진이 빨라지지만, 가족과는 몇 해를 떨어져 지내야 합니다.",
        choices: [
          { title: "가족 곁 근무를 신청한다", desc: "곁을 지키지만 승진이 늦어진다",
            effect: { relationship: 6, standing: -5, traits: { "선량": 1 },
                      log: "전근 대신 가족 곁 근무를 신청함" } },
          { title: "명령대로 먼 기지로 간다", desc: "공적이 쌓이지만 집이 멀어진다",
            effect: { standing: 6, relationship: -5, traits: { "신중": 1 },
                      log: "명령대로 가족을 두고 먼 기지로 전근함" } },
          { title: "가족과 함께 이사한다", desc: "함께하지만 모두가 낯선 땅에 선다",
            effect: { relationship: 4, happiness: -4, money: -150000, traits: { "용기": 1 },
                      log: "가족을 데리고 먼 기지 근처로 이사함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 천룡인에게 복수하기 ──
  {
    key: "cb_goal_revenge",
    flags: ["f_goal_revenge"],
    after: 5,
    when: { minAge: 20, maxAge: 60 },
    title: "낙인이 쑤시는 날",
    body: "천룡인에게 복수하겠다고 정한 날부터 그 기억은 한 번도 식은 적이 없습니다. 오늘 {여기}에 천룡인의 행차가 지나간다는 소식이 돌고, 사람들은 벌써 길가에 엎드릴 채비를 합니다. 오래된 상처 자리가 욱신거립니다.",
    choices: [
      { title: "행차 길목에 숨어 기다린다", desc: "응어리가 풀리지만 목숨이 걸린다",
        effect: { combat: 5, happiness: 5, traits: { "용기": 1 }, flags: ["f_cb_revenge_ambush"],
                  log: "천룡인 행차의 길목에 숨어 기회를 엿봄" },
        risk: { chance: 0.4, effect: { health: -18, log: "호위병에게 발각되어 크게 다침" } } },
      { title: "그들의 비밀을 캐 모은다", desc: "칼보다 길지만 속이 탄다",
        effect: { knowledge: 5, happiness: -4, traits: { "신중": 1 }, flags: ["f_cb_revenge_ledger"],
                  log: "행차의 일정과 호위를 몰래 적어 모음" } },
      { title: "같은 상처를 가진 이를 돕는다", desc: "사람을 얻지만 복수는 미뤄진다",
        effect: { relationship: 6, money: -100000, happiness: 3, traits: { "선량": 1 },
                  log: "행차에 끌려갈 뻔한 사람을 숨겨 도움" } }
    ],
    by: {
      "해적|혁명군": {
        body: "천룡인에게 복수하겠다고 정한 날부터 그 기억은 한 번도 식은 적이 없습니다. 오늘 망대에서 천룡인의 깃발을 단 함선이 이 해역을 지난다는 신호가 옵니다. 함선 뒤에는 쇠사슬 소리가 나는 노예선 한 척이 따라붙어 있습니다.",
        choices: [
          { title: "천룡인의 함선을 습격한다", desc: "이름이 치솟지만 목숨이 걸린다",
            effect: { bounty: "+40%", standing: 7, traits: { "용기": 1 },
                      log: "천룡인의 깃발을 단 함선을 습격함" },
            risk: { chance: 0.4, effect: { health: -18, log: "함선의 호위에게 반격당해 크게 다침" } } },
          { title: "노예선만 노려 사슬을 끊는다", desc: "사람을 구하지만 원수는 놓친다",
            effect: { relationship: 6, standing: 5, bounty: "+15%", traits: { "선량": 1 },
                      memory: "끊어진 쇠사슬 소리", log: "뒤따르던 노예선을 덮쳐 사슬을 끊어 줌" },
            risk: { chance: 0.25, effect: { health: -8, log: "노예선 간수와 싸우다 다침" } } },
          { title: "때를 기다리며 힘을 기른다", desc: "더 강해지지만 독기가 쌓인다",
            effect: { combat: 5, happiness: -6, traits: { "신중": 1 },
                      log: "함선을 보내고 이를 악물며 수련함" } }
        ]
      },
      "해군": {
        body: "천룡인에게 복수하겠다고 정한 날부터 그 기억은 한 번도 식은 적이 없습니다. 그런데 하필 오늘 당신의 부대에 천룡인 행차를 호위하라는 명령이 내려왔습니다. 그들 뒤로 목에 쇠고리를 찬 사람들이 줄지어 걷게 될 것입니다.",
        choices: [
          { title: "호위 명령을 거부한다", desc: "떳떳하지만 군에서 찍힌다",
            effect: { standing: -8, happiness: 6, traits: { "용기": 1 }, flags: ["f_cb_revenge_refused_guard"],
                      log: "천룡인 호위 명령을 정면으로 거부함" } },
          { title: "이를 악물고 호위한다", desc: "공적은 쌓이지만 속이 썩는다",
            effect: { standing: 6, happiness: -10, traits: { "신중": 1 },
                      log: "이를 악물고 천룡인 행차를 끝까지 호위함" } },
          { title: "호위 중 노예 하나를 빼돌린다", desc: "한 사람을 구하지만 들키면 끝이다",
            effect: { relationship: 5, happiness: 4, traits: { "선량": 1 },
                      memory: "행렬에서 놓아준 손", log: "행차 호위 중 노예 하나를 몰래 빼돌림" },
            risk: { chance: 0.35, effect: { standing: -10, health: -8, log: "노예를 빼돌린 일이 드러나 문책당함" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 세계정부 무너뜨리기 ──
  {
    key: "cb_goal_overthrow",
    flags: ["f_goal_overthrow"],
    after: 5,
    when: { minAge: 20, maxAge: 60 },
    title: "지워진 기사 한 줄",
    body: "세계정부를 무너뜨리겠다고 정한 날부터 당신은 신문의 행간을 의심하며 읽어 왔습니다. 어제 실렸던 기사 한 줄이 오늘 신문에서는 감쪽같이 사라졌습니다. 그날 밤 {여기}의 뒷골목에서 낯선 사람이 다가와 낮게 말합니다. \"그 기사, 당신도 봤지요?\"",
    choices: [
      { title: "낯선 이의 손을 잡는다", desc: "길이 열리지만 쫓기게 될 수 있다",
        effect: { happiness: 5, reputation: -4, traits: { "용기": 1 }, flags: ["f_cb_overthrow_contact"],
                  log: "뒷골목에서 혁명군 연락원과 손을 잡음" },
        risk: { chance: 0.3, effect: { health: -8, log: "연락원과 만난 뒤 정부 첩보원에게 쫓김" } } },
      { title: "사라진 기사를 몰래 베껴 둔다", desc: "진실이 쌓이지만 들키면 위험하다",
        effect: { knowledge: 5, happiness: -3, traits: { "신중": 1 },
                  log: "지워진 기사를 몰래 베껴 숨겨 둠" },
        risk: { chance: 0.2, effect: { reputation: -6, log: "베낀 기사가 발견되어 요주의 인물이 됨" } } },
      { title: "이웃에게 들은 것을 전한다", desc: "눈을 뜨게 하지만 수상한 사람이 된다",
        effect: { relationship: 5, reputation: -5, traits: { "선량": 1 },
                  log: "이웃들에게 지워진 기사 이야기를 전함" } }
    ],
    by: {
      "혁명군": {
        body: "세계정부를 무너뜨리겠다고 정한 날로부터 몇 해, 당신은 이제 그 싸움 한가운데에 있습니다. 이번 작전 목표는 {여기}의 정부 기록 보관소입니다. 그곳에는 지워진 역사와 함께, 이 섬 주민들을 옭아맨 세금 장부가 잠들어 있습니다.",
        choices: [
          { title: "보관소에 직접 잠입한다", desc: "큰 공이지만 목숨이 걸린다",
            effect: { standing: 7, knowledge: 4, bounty: "+25%", traits: { "용기": 1 },
                      log: "정부 기록 보관소에 직접 잠입해 기록을 빼냄" },
            risk: { chance: 0.35, effect: { health: -12, log: "잠입 중 경비병의 총탄에 맞음" } } },
          { title: "주민들을 모아 봉기를 연다", desc: "사람을 얻지만 진압이 거세다",
            effect: { relationship: 5, standing: 5, traits: { "선량": 1 },
                      log: "세금 장부를 앞세워 주민 봉기를 이끎" },
            risk: { chance: 0.3, effect: { health: -8, log: "봉기 진압 중 곤봉에 맞아 다침" } } },
          { title: "정보만 빼내 본부에 넘긴다", desc: "안전하지만 공은 남의 것이 된다",
            effect: { standing: 4, knowledge: 4, happiness: -3, traits: { "신중": 1 },
                      log: "보관소의 정보만 빼내 본부에 넘김" } }
        ]
      },
      "해군": {
        body: "세계정부를 무너뜨리겠다고 정한 날부터 당신은 제복 안에 그 생각을 숨겨 왔습니다. 오늘 당신의 책상 위로 한 섬을 지도에서 지우라는 기밀 명령서가 지나갑니다. 서명란은 아직 비어 있고, 촛불이 흔들립니다.",
        choices: [
          { title: "명령서를 혁명군에 흘린다", desc: "섬을 살리지만 들키면 끝이다",
            effect: { happiness: 5, relationship: 3, traits: { "용기": 1 }, flags: ["f_cb_navy_leak"],
                      log: "기밀 명령서를 혁명군 쪽에 몰래 흘림" },
            risk: { chance: 0.35, effect: { standing: -10, health: -8, log: "정보 유출 혐의로 붙잡혀 심문을 받음" } } },
          { title: "안에서 바꾸려 승진에 매달린다", desc: "힘이 생기지만 그 섬은 못 구한다",
            effect: { standing: 7, happiness: -6, traits: { "야심": 1 },
                      log: "명령서를 덮고 위로 올라가기로 마음먹음" } },
          { title: "명령서를 외워 두고 덮는다", desc: "증거는 남지만 양심이 무겁다",
            effect: { knowledge: 5, happiness: -6, traits: { "신중": 1 },
                      memory: "촛불 아래의 빈 서명란", log: "기밀 명령서의 내용을 외워 두고 덮음" } }
        ]
      },
      "*": {}
    }
  },

  // ── 해군 영웅이 되기 ──
  {
    key: "cb_goal_navy_hero",
    flags: ["f_goal_navy_hero"],
    after: 5,
    when: { minAge: 20, maxAge: 60 },
    title: "영웅을 찍는 사진기",
    body: "해군 영웅이 되겠다고 정한 날부터 당신은 남보다 먼저 위험한 곳으로 달려갔습니다. 오늘 소탕전이 끝난 부두에 신문기자가 사진기를 들고 찾아옵니다. \"포즈 한 번이면 내일 아침 당신은 영웅입니다.\" 진짜 공을 세운 부하는 아직 의무실에 누워 있습니다.",
    choices: [
      { title: "사진기 앞에 선다", desc: "이름이 나지만 부하들이 서운해한다",
        effect: { reputation: 8, standing: 4, relationship: -4, traits: { "야심": 1 },
                  log: "기자의 사진기 앞에서 영웅처럼 포즈를 취함" },
        risk: { chance: 0.2, effect: { reputation: -8, log: "연출된 사진이란 소문이 퍼져 망신당함" } } },
      { title: "공을 다친 부하에게 돌린다", desc: "부하가 따르지만 내 이름은 묻힌다",
        effect: { relationship: 6, happiness: 3, reputation: -3, traits: { "선량": 1 },
                  memory: "의무실에 걸린 신문", log: "기자를 의무실로 보내 부하의 공을 알림" } },
      { title: "기자를 돌려보내고 순찰을 돈다", desc: "할 일은 하지만 기회가 사라진다",
        effect: { standing: 4, combat: 3, reputation: -4, traits: { "신중": 1 },
                  log: "기자를 돌려보내고 남은 순찰을 마침" } }
    ],
    by: {
      "해적|혁명군": {
        body: "해군 영웅이 되겠다고 정했던 당신은 지금 해군에게 쫓기는 쪽에 서 있습니다. 오늘 폭풍이 지나간 바다에서 반쯤 가라앉은 군함과 물에 빠진 해군 병사들을 발견합니다. 선원들이 당신의 명령을 기다립니다.",
        choices: [
          { title: "물에 빠진 병사들을 건진다", desc: "옛 꿈다운 일이지만 위치가 드러난다",
            effect: { happiness: 6, relationship: 4, standing: -5, traits: { "선량": 1 }, flags: ["f_cb_saved_marines"],
                      memory: "젖은 해군 모자 더미", log: "난파한 군함의 해군 병사들을 건져 냄" },
            risk: { chance: 0.3, effect: { bounty: "+15%", health: -6, log: "구해 준 병사의 보고로 추격대가 붙음" } } },
          { title: "못 본 척 키를 돌린다", desc: "배는 안전하지만 꿈이 아프다",
            effect: { standing: 3, happiness: -6, traits: { "신중": 1 },
                      log: "가라앉는 군함을 두고 키를 돌림" } },
          { title: "가라앉는 군함을 빼앗는다", desc: "이름이 오르지만 위험하다",
            effect: { bounty: "+30%", standing: 6, happiness: -4, traits: { "야심": 1 },
                      log: "폭풍에 부서진 군함을 빼앗아 끌고 감" },
            risk: { chance: 0.3, effect: { health: -10, log: "군함을 빼앗다 남은 병사들과 싸움" } } }
        ]
      },
      "민간인|현상금 사냥꾼": {
        body: "해군 영웅이 되겠다고 정했지만 당신은 아직 제복을 입지 못했습니다. 오늘 {여기}에 해적 무리가 들이닥쳤고, 가장 가까운 해군 지부는 반나절 거리입니다. 마을 사람들이 겁에 질려 당신을 쳐다봅니다.",
        choices: [
          { title: "몽둥이를 들고 막아선다", desc: "영웅답지만 크게 다칠 수 있다",
            effect: { combat: 5, reputation: 6, traits: { "용기": 1 },
                      log: "해적 무리 앞을 몽둥이 하나로 막아섬" },
            risk: { chance: 0.35, effect: { health: -12, log: "해적의 칼에 베여 크게 다침" } } },
          { title: "주민들을 산으로 대피시킨다", desc: "사람은 살리지만 가게가 털린다",
            effect: { relationship: 6, money: -80000, traits: { "선량": 1 },
                      log: "주민들을 이끌고 산으로 대피시킴" } },
          { title: "지부까지 달려가 알린다", desc: "정석이지만 마을이 털리는 걸 본다",
            effect: { standing: 4, happiness: -5, traits: { "신중": 1 },
                      log: "해군 지부까지 밤길을 달려 습격을 알림" } }
        ]
      },
      "*": {}
    }
  },

  // ── 고향을 발전시키기 ──
  {
    key: "cb_goal_hometown",
    flags: ["f_goal_hometown"],
    after: 5,
    when: { minAge: 20, maxAge: 65 },
    title: "고향에서 온 편지",
    body: "고향을 일으키겠다고 정한 날부터 당신은 {고향}의 소식을 한 번도 흘려듣지 않았습니다. 오늘 고향의 어른이 보낸 편지가 도착합니다. 새 방파제를 쌓는 데 돈과 일손이 모자라, 올겨울 폭풍을 넘길 수 있을지 모르겠다고 합니다.",
    choices: [
      { title: "모은 돈을 고향에 보낸다", desc: "고향이 반기지만 주머니가 빈다",
        effect: { money: -200000, relationship: 5, standing: 3, traits: { "선량": 1 },
                  log: "방파제를 쌓을 돈을 고향에 보냄" } },
      { title: "직접 돌아가 돌을 나른다", desc: "손으로 쌓지만 몸이 상한다",
        effect: { skills: { "제작": 5 }, relationship: 4, health: -6, traits: { "용기": 1 },
                  memory: "고향 바닷가의 젖은 돌", log: "고향에 돌아가 방파제 공사를 도움" },
        risk: { chance: 0.2, effect: { health: -6, log: "공사 중 무너진 돌에 다리를 다침" } } },
      { title: "외지 상인을 고향에 끌어들인다", desc: "돈이 돌지만 옛 이웃이 반발한다",
        effect: { money: 100000, skills: { "장사": 4 }, relationship: -4, traits: { "야심": 1 },
                  log: "외지 상인을 끌어들여 공사비를 마련함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "고향을 일으키겠다고 정한 날부터 당신은 {고향}의 소식을 흘려듣지 않았습니다. 그런데 오늘 들려온 소식은 고향에 당신의 수배서가 붙었고, 해군이 주민들을 캐묻고 다닌다는 것입니다. 당신의 이름이 고향에 짐이 되고 있습니다.",
        choices: [
          { title: "몰래 돈을 남기고 떠난다", desc: "고향을 돕지만 얼굴은 못 비친다",
            effect: { money: -200000, relationship: 4, happiness: -4, traits: { "선량": 1 },
                      log: "고향 사람들 몰래 돈을 남기고 떠남" } },
          { title: "고향을 내 깃발 아래 지킨다", desc: "고향을 지키지만 표적이 된다",
            effect: { standing: 6, bounty: "+20%", relationship: -3, traits: { "용기": 1 },
                      log: "고향 앞바다에 깃발을 걸고 해군을 막음" },
            risk: { chance: 0.3, effect: { health: -10, log: "고향 앞바다에서 해군과 교전하다 다침" } } },
          { title: "고향과 인연을 끊는다", desc: "고향은 안전하지만 가슴이 빈다",
            effect: { happiness: -8, standing: 3, traits: { "신중": 1 }, flags: ["f_cb_cut_hometown"],
                      log: "고향을 위해 스스로 고향과 연을 끊음" } }
        ]
      },
      "해군": {
        body: "고향을 일으키겠다고 정한 날부터 당신은 {고향}의 소식을 흘려듣지 않았습니다. 마침 본부가 새 해군 지부를 세울 섬을 고르고 있습니다. 지부가 서면 항구가 살아나지만, 다른 후보 섬이 더 급하다는 것도 당신은 알고 있습니다.",
        choices: [
          { title: "고향을 지부 터로 추천한다", desc: "고향이 살아나지만 공정성을 의심받는다",
            effect: { relationship: 5, reputation: -5, traits: { "선량": 1 },
                      log: "새 해군 지부 터로 고향을 추천함" } },
          { title: "고향 순찰 근무를 자청한다", desc: "곁에서 지키지만 승진이 늦다",
            effect: { happiness: 6, relationship: 3, standing: -4, traits: { "신중": 1 },
                      log: "승진 대신 고향 해역 순찰 근무를 자청함" } },
          { title: "공을 쌓아 이름으로 알린다", desc: "출세하지만 고향은 기다려야 한다",
            effect: { standing: 6, happiness: -4, traits: { "야심": 1 },
                      log: "공을 쌓아 고향의 이름을 알리기로 함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 평범하고 행복한 삶을 살기 ──
  {
    key: "cb_goal_happy",
    flags: ["f_goal_happy"],
    after: 5,
    when: { minAge: 20, maxAge: 60 },
    title: "부두에서 흔든 손",
    body: "평범하고 행복하게 살겠다고 정한 날부터 당신은 작은 하루들을 지켜 왔습니다. 오늘 {단짝|이} 큰 배를 타고 {여기}에 들렀습니다. 신문에 이름까지 오른 그가 당신의 손을 잡고 말합니다. \"같이 가자. 너 정말 이대로 괜찮아?\"",
    choices: [
      { title: "웃으며 배웅한다", desc: "내 삶을 지키지만 뒷말을 듣는다",
        effect: { happiness: 7, reputation: -4, traits: { "신중": 1 },
                  memory: "부두에서 흔든 손", log: "옛 친구의 권유를 웃으며 사양하고 배웅함" } },
      { title: "한 철만 따라가 본다", desc: "가슴이 뛰지만 일상이 흔들린다",
        effect: { combat: 4, happiness: 5, relationship: -5, traits: { "용기": 1 },
                  log: "옛 친구의 배에 올라 한 철을 바다에서 보냄" },
        risk: { chance: 0.3, effect: { health: -10, log: "친구의 배에서 싸움에 휘말려 다침" } } },
      { title: "돌아올 자리를 약속한다", desc: "인연은 남지만 내 몫을 나눈다",
        effect: { relationship: 6, money: -80000, traits: { "선량": 1 }, flags: ["f_cb_happy_promised_seat"],
                  log: "옛 친구에게 언제든 돌아올 자리를 약속함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "평범하고 행복하게 살겠다고 정했던 당신은 지금 수배서에 얼굴이 붙은 몸입니다. 하룻밤 머문 작은 섬마을에서, 늦게까지 문을 열어 둔 가게 주인이 술을 따르며 묻습니다. \"여기 눌러살 생각은 없소? 빈집이 하나 있는데.\"",
        choices: [
          { title: "깃발을 내리고 눌러앉는다", desc: "꿈에 다가가지만 쫓던 이들이 온다",
            effect: { happiness: 10, standing: -8, traits: { "신중": 1 }, flags: ["f_cb_happy_settle_try"],
                      memory: "작은 마을의 빈집 열쇠", log: "깃발을 내리고 섬마을에 눌러앉아 봄" },
            risk: { chance: 0.3, effect: { health: -8, happiness: -5, log: "추적대가 섬마을까지 찾아와 다시 쫓겨남" } } },
          { title: "하룻밤 꿈으로 남기고 떠난다", desc: "길은 지키지만 마음이 허전하다",
            effect: { standing: 3, happiness: -5, traits: { "용기": 1 },
                      memory: "섬마을의 늦은 등불", log: "섬마을의 권유를 뒤로하고 새벽에 떠남" } },
          { title: "동료들에게 긴 휴가를 준다", desc: "모두 쉬어 가지만 돈이 든다",
            effect: { relationship: 6, money: -150000, traits: { "선량": 1 },
                      log: "섬마을에 닻을 내리고 동료들에게 휴가를 줌" } }
        ]
      },
      "해군": {
        body: "평범하고 행복하게 살겠다고 정한 날부터 당신은 제복을 입고도 퇴근 뒤의 저녁을 지켜 왔습니다. 그런데 상관이 이번 승진 시험을 보라고 권합니다. 붙으면 이름이 오르지만, 지금의 조용한 근무지와 저녁은 사라집니다.",
        choices: [
          { title: "시험을 사양하고 지금을 지킨다", desc: "저녁을 지키지만 상관이 실망한다",
            effect: { happiness: 7, standing: -5, traits: { "신중": 1 },
                      memory: "조용한 기지의 저녁놀", log: "승진 시험을 사양하고 지금의 근무지에 남음" } },
          { title: "시험을 보고 위로 올라간다", desc: "출세하지만 저녁이 사라진다",
            effect: { standing: 6, happiness: -6, traits: { "야심": 1 },
                      log: "평범한 저녁을 내려놓고 승진 시험을 봄" } },
          { title: "부하들과 휴가를 나눈다", desc: "모두 웃지만 내 평가는 깎인다",
            effect: { relationship: 5, happiness: 3, standing: -3, traits: { "선량": 1 },
                      log: "시험 대신 부하들과 번갈아 휴가를 나눔" } }
        ]
      },
      "*": {}
    }
  },

  // ── 모든 명검 모으기 ──
  {
    key: "cb_goal_blades",
    flags: ["f_goal_blades"],
    after: 5,
    when: { minAge: 20, maxAge: 60 },
    title: "골동품상의 검집",
    body: "세상의 명검을 모두 모으겠다고 정한 날부터 당신의 벽에는 빈 검걸이가 늘 남아 있었습니다. 오늘 {여기}의 골동품상이 먼지 쌓인 검집 하나를 꺼내며 명검이라고 속삭입니다. 값은 터무니없고, 칼날을 뽑아 보기도 전에 돈부터 내라고 합니다.",
    choices: [
      { title: "있는 돈을 털어 사들인다", desc: "손에 넣지만 가짜일 수도 있다",
        effect: { money: -200000, happiness: 6, skills: { "검술": 3 }, traits: { "야심": 1 },
                  log: "골동품상의 명검을 큰돈을 주고 사들임" },
        risk: { chance: 0.4, effect: { happiness: -8, log: "사들인 검이 이름만 빌린 가짜로 드러남" } } },
      { title: "검의 원래 주인을 찾아 나선다", desc: "진짜에 다가가지만 길이 험하다",
        effect: { combat: 4, happiness: 3, traits: { "용기": 1 }, flags: ["f_cb_blade_owner_lead"],
                  log: "검집의 문양을 단서로 원래 주인을 찾아 나섬" },
        risk: { chance: 0.3, effect: { health: -12, log: "검의 행방을 쫓다 칼잡이들과 시비가 붙음" } } },
      { title: "대장장이에게 안목을 배운다", desc: "눈은 트이지만 명검은 멀어진다",
        effect: { skills: { "제작": 5 }, knowledge: 3, happiness: -4, traits: { "신중": 1 },
                  log: "검을 사는 대신 대장장이에게 검 보는 법을 배움" } }
    ],
    by: {
      "해적|혁명군": {
        body: "세상의 명검을 모두 모으겠다고 정한 날부터 당신은 이름난 검의 행방을 좇아 왔습니다. 오늘 {여기}에 정박한 해군 함선의 장교가 이름 있는 검을 차고 내렸다는 소식이 들립니다. 그 칼집의 문양을 당신은 책에서 본 적이 있습니다.",
        choices: [
          { title: "검을 빼앗으러 간다", desc: "검에 다가가지만 목숨이 걸린다",
            effect: { combat: 5, bounty: "+25%", traits: { "용기": 1 },
                      log: "해군 장교의 명검을 노리고 정면으로 덤빔" },
            risk: { chance: 0.35, effect: { health: -14, log: "장교의 검에 베여 크게 다침" } } },
          { title: "판돈으로 걸고 내기를 청한다", desc: "이기면 얻지만 판돈이 크다",
            effect: { money: -150000, skills: { "검술": 4 }, happiness: 3, traits: { "야심": 1 },
                      log: "해군 장교에게 큰 판돈을 걸고 검 내기를 청함" } },
          { title: "검 대신 그의 솜씨를 훔쳐본다", desc: "실력은 늘지만 검은 놓친다",
            effect: { skills: { "검술": 6 }, happiness: -4, traits: { "신중": 1 },
                      log: "장교의 검술을 몰래 지켜보며 익힘" } }
        ]
      },
      "해군": {
        body: "세상의 명검을 모두 모으겠다고 정한 날부터 당신은 이름난 검의 행방을 좇아 왔습니다. 이번에 붙잡은 해적에게서 압수한 검이 증거물 창고에 들어갔는데, 바로 당신이 찾던 명검입니다. 창고 열쇠는 오늘 당신이 쥐고 있습니다.",
        choices: [
          { title: "창고에서 몰래 꺼내 쓴다", desc: "손에 쥐지만 들키면 끝이다",
            effect: { combat: 5, happiness: 5, traits: { "야심": 1 },
                      log: "증거물 창고의 명검을 몰래 꺼내 휘둘러 봄" },
            risk: { chance: 0.35, effect: { standing: -10, log: "증거물에 손댄 일이 들통나 징계를 받음" } } },
          { title: "정식으로 하사를 청한다", desc: "떳떳하지만 몇 해를 기다려야 한다",
            effect: { standing: 4, happiness: -4, traits: { "신중": 1 }, flags: ["f_cb_blade_requested"],
                      log: "압수한 명검의 하사를 정식으로 청원함" } },
          { title: "원래 주인 가문에 돌려준다", desc: "옳은 일이지만 검은 영영 멀어진다",
            effect: { relationship: 5, reputation: 4, standing: -3, traits: { "선량": 1 },
                      log: "명검을 약탈당한 대장장이 가문에 돌려보냄" } }
        ]
      },
      "*": {}
    }
  }
]);

/* ───────────── kid ───────────── */
CB([
  // ── 첫 친구: 내 성은 내가 쌓겠다고 함 ──
  {
    key: "cb_kid_sandcastle_alone",
    flags: ["f_kid_sandcastle_alone"],
    after: 12,
    when: { minAge: 18, maxAge: 50 },
    title: "모래밭의 아이가 내민 손",
    body: "{여기}의 부두에서 낯익은 얼굴과 마주칩니다. 어릴 적 같이 만들자던 손을 돌려보내고 당신 혼자 모래성을 끝까지 쌓았던 날, 그 앞에 서 있던 {npc:모래밭의 아이}입니다. 이제 일꾼 여럿을 거느린 그는 큰 일감에 당신 솜씨를 빌리고 싶다고 합니다.",
    choices: [
      { title: "이번엔 손을 잡는다", desc: "함께하지만 내 방식은 접는다",
        effect: { relationship: 6, money: 80000, happiness: -3, traits: { "선량": 1 },
                  flags: ["f_cb_sandcastle_partner"], memory: "둘이서 다시 쌓은 일터",
                  log: "모래밭의 아이와 손잡고 큰 일감을 함께 맡음" } },
      { title: "혼자 해내겠다고 한다", desc: "솜씨는 늘지만 또 혼자다",
        effect: { skills: { "제작": 6 }, happiness: 4, relationship: -5, traits: { "야심": 1 },
                  log: "모래밭의 아이의 제안을 거절하고 혼자 일을 해냄" },
        risk: { chance: 0.2, effect: { health: -6, log: "혼자 무리하다 몸져누움" } } },
      { title: "술 한잔 사며 사과한다", desc: "응어리는 풀리지만 일감은 놓친다",
        effect: { relationship: 4, happiness: 6, money: -20000, traits: { "용기": 1 },
                  memory: "모래성 이야기로 웃던 밤", log: "모래밭의 아이에게 그날 일을 사과함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{여기}의 조선소에서 낯익은 얼굴과 마주칩니다. 어릴 적 당신이 돌려보내고 혼자 모래성을 쌓았던 날의 {npc:모래밭의 아이}입니다. 조선소 감독이 된 그는 수배자의 배를 몰래 고쳐 주는 대신, 당신 손으로 직접 일을 거들라고 합니다.",
        choices: [
          { desc: "배는 고치지만 발이 묶인다",
            effect: { relationship: 6, money: 100000, happiness: -3, traits: { "선량": 1 },
                      flags: ["f_cb_sandcastle_partner"], log: "모래밭의 아이의 조선소에서 배를 함께 고침" },
            risk: { chance: 0.25, effect: { health: -8, log: "조선소에 해군 순찰이 들이닥쳐 도망침" } } },
          { desc: "빚은 없지만 손이 많이 간다",
            effect: { skills: { "항해술": 5 }, standing: 3, relationship: -5, traits: { "야심": 1 },
                      log: "조선소 도움 없이 배를 직접 고쳐 띄움" } },
          {}
        ]
      },
      "해군": {
        body: "기지 납품 명단에서 낯익은 이름을 발견합니다. 어릴 적 당신이 돌려보내고 혼자 모래성을 쌓았던 날의 {npc:모래밭의 아이}입니다. 납품을 따내려는 그는 옛 동네 친구로서 심사관인 당신에게 한 번만 같이 가자고 부탁합니다.",
        choices: [
          { title: "납품을 함께 밀어준다", desc: "인연은 잇지만 뒷말이 돈다",
            effect: { relationship: 6, happiness: 3, standing: -3, traits: { "선량": 1 },
                      flags: ["f_cb_sandcastle_partner"], log: "모래밭의 아이의 기지 납품을 밀어줌" },
            risk: { chance: 0.25, effect: { reputation: -6, log: "옛 친구를 봐준 일로 감사를 받음" } } },
          { title: "규정대로 혼자 심사한다", desc: "공정하지만 또 등을 돌린다",
            effect: { standing: 6, relationship: -5, traits: { "신중": 1 },
                      log: "모래밭의 아이의 납품을 규정대로 심사함" } },
          {}
        ]
      },
      "*": {}
    }
  },

  // ── 첫 친구: 부끄러워 도망침 ──
  {
    key: "cb_kid_shy_first_friend",
    flags: ["f_kid_shy_first_friend"],
    after: 12,
    when: { minAge: 17, maxAge: 45 },
    title: "모닥불 곁의 같이 할래",
    body: "{여기}의 축제 날, 모닥불 곁에서 낯선 사람이 당신에게 \"같이 할래?\" 하고 묻습니다. 어릴 적 모래밭에서 같은 말을 듣고 도망쳤던 날이 떠오릅니다. 그 뒤로 당신은 사람들 틈에서 한 발 물러나 지켜보는 버릇이 생겼습니다.",
    choices: [
      { title: "이번엔 끝까지 남는다", desc: "어색하지만 새 인연이 생긴다",
        effect: { relationship: 6, money: -20000, traits: { "용기": 1 }, flags: ["f_cb_shy_stayed"],
                  memory: "도망치지 않은 모닥불 밤", log: "축제의 낯선 무리에 끝까지 남아 어울림" } },
      { title: "물러서서 사람들을 읽는다", desc: "눈은 밝아지지만 또 혼자다",
        effect: { knowledge: 5, relationship: -3, traits: { "신중": 1 },
                  log: "축제 무리에서 물러나 사람들을 지켜봄" } },
      { title: "고향의 모래밭을 찾아간다", desc: "옛 후회를 풀지만 헛걸음일 수 있다",
        effect: { happiness: 7, relationship: 2, money: -30000, traits: { "선량": 1 },
                  log: "어릴 적 도망쳤던 모래밭의 아이를 찾아 나섬" },
        risk: { chance: 0.35, effect: { happiness: -8, log: "모래밭의 아이를 끝내 찾지 못함" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "{여기}의 은신처에서 다른 무리의 우두머리가 술잔을 내밀며 \"같이 할래?\" 하고 묻습니다. 어릴 적 모래밭에서 같은 말을 듣고 도망쳤던 날이 떠오릅니다. 손을 잡으면 힘이 커지지만, 남의 무리에 얽히는 일이기도 합니다.",
        choices: [
          { title: "그 잔을 받는다", desc: "힘은 커지지만 남의 싸움도 진다",
            effect: { relationship: 5, standing: 5, bounty: "+10%", traits: { "용기": 1 },
                      flags: ["f_cb_shy_stayed"], log: "다른 무리와 손을 잡기로 함" },
            risk: { chance: 0.3, effect: { health: -10, log: "손잡은 무리의 싸움에 휘말려 다침" } } },
          { desc: "속셈을 읽지만 동맹은 놓친다",
            effect: { knowledge: 5, relationship: -3, traits: { "신중": 1 },
                      log: "동맹 제안을 미루고 상대의 속셈을 살핌" } },
          {}
        ]
      },
      "해군": {
        body: "출항 전날 밤, 같은 함선의 동기들이 갑판 모닥불 곁에서 당신에게 \"같이 할래?\" 하고 묻습니다. 어릴 적 모래밭에서 같은 말을 듣고 도망쳤던 날이 떠오릅니다. 당직표를 보면, 내일 새벽 경계는 당신 차례입니다.",
        choices: [
          { title: "동기들 곁에 끝까지 남는다", desc: "전우가 생기지만 새벽이 힘들다",
            effect: { relationship: 6, health: -4, traits: { "용기": 1 }, flags: ["f_cb_shy_stayed"],
                      memory: "갑판 모닥불의 동기들", log: "출항 전날 밤 동기들과 끝까지 어울림" } },
          { title: "먼저 당직 준비를 한다", desc: "흠잡힐 데 없지만 겉돈다",
            effect: { standing: 4, relationship: -3, traits: { "신중": 1 },
                      log: "모닥불 자리를 사양하고 당직을 준비함" } },
          {}
        ]
      },
      "*": {}
    }
  },

  // ── 다친 갈매기: 직접 돌봐 날려 보냄 ──
  {
    key: "cb_kid_saved_gull",
    flags: ["f_kid_saved_gull"],
    after: 8,
    when: { minAge: 16, maxAge: 40 },
    title: "안개 속의 굽은 날개",
    body: "짙은 안개에 갇힌 배 위로 갈매기 한 마리가 내려와 뱃머리를 맴돕니다. 왼쪽 날개가 조금 굽은 모양이, 어릴 적 당신이 부목을 대고 밤새 돌봐 날려 보낸 그 갈매기를 꼭 닮았습니다. 갈매기는 울면서 자꾸 한쪽 방향으로 날아갑니다.",
    choices: [
      { title: "갈매기를 따라 키를 돌린다", desc: "믿음이 통하면 길이 열린다",
        effect: { skills: { "항해술": 5 }, happiness: 4, traits: { "용기": 1 },
                  memory: "안개 속 굽은 날개", log: "안개 속에서 갈매기를 따라 뱃길을 찾음" },
        risk: { chance: 0.3, effect: { health: -8, log: "갈매기를 따르다 암초에 배를 긁힘" } } },
      { title: "해도와 나침반을 믿는다", desc: "안전하지만 하루를 잃는다",
        effect: { knowledge: 4, money: -30000, traits: { "신중": 1 },
                  log: "갈매기 대신 해도를 믿고 안개가 걷히길 기다림" } },
      { title: "모이를 던져 배에 머물게 한다", desc: "배의 식구가 늘지만 길은 늦는다",
        effect: { relationship: 4, happiness: 3, money: -10000, traits: { "선량": 1 },
                  flags: ["f_cb_gull_mascot"], log: "굽은 날개의 갈매기를 배에 머물게 함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "해군 순찰선을 피해 들어간 짙은 안개 속, 갈매기 한 마리가 내려와 뱃머리를 맴돕니다. 왼쪽 날개가 조금 굽은 모양이, 어릴 적 당신이 부목을 대고 돌봐 날려 보낸 그 갈매기를 닮았습니다. 해도에 적힌 길은 순찰선이 자주 다니는 길입니다.",
        choices: [
          { desc: "포위망을 빠져나갈지 모른다",
            effect: { skills: { "항해술": 5 }, standing: 5, traits: { "용기": 1 },
                      memory: "안개 속 굽은 날개", log: "갈매기를 따라 해군 포위망을 빠져나감" },
            risk: { chance: 0.3, effect: { health: -8, log: "갈매기를 따르다 암초에 배를 긁힘" } } },
          { desc: "익숙하지만 순찰선과 마주칠 수 있다",
            effect: { knowledge: 4, happiness: -3, traits: { "신중": 1 },
                      log: "해도대로 순찰선이 다니는 길을 지나감" },
            risk: { chance: 0.3, effect: { health: -10, bounty: "+10%", log: "안개가 걷히자 해군 순찰선과 교전함" } } },
          {}
        ]
      },
      "해군": {
        body: "짙은 안개 속 순찰 중, 갈매기 한 마리가 내려와 함선 뱃머리를 맴돕니다. 왼쪽 날개가 조금 굽은 모양이, 어릴 적 당신이 부목을 대고 돌봐 날려 보낸 그 갈매기를 닮았습니다. 갈매기는 순찰 항로를 벗어난 쪽으로만 날아갑니다.",
        choices: [
          { title: "항로를 벗어나 따라간다", desc: "누군가를 찾을지도, 문책도 있다",
            effect: { standing: 6, relationship: 3, traits: { "용기": 1 },
                      memory: "안개 속 조난선의 불빛", log: "갈매기를 따라가 표류하던 조난선을 구함" },
            risk: { chance: 0.3, effect: { reputation: -5, log: "무단으로 항로를 벗어나 문책받음" } } },
          { title: "정해진 순찰 항로를 지킨다", desc: "규정대로지만 마음에 걸린다",
            effect: { standing: 3, happiness: -4, traits: { "신중": 1 },
                      log: "갈매기를 두고 정해진 순찰 항로를 지킴" } },
          {}
        ]
      },
      "*": {}
    }
  },

  // ── 다친 갈매기: 마을 의원에게 데려감 ──
  {
    key: "cb_kid_gull_to_doctor",
    flags: ["f_kid_gull_to_doctor"],
    after: 10,
    when: { minAge: 18, maxAge: 50 },
    title: "늙은 의원의 편지",
    body: "{고향}의 마을 의원에게서 편지가 옵니다. 다친 갈매기를 품에 안고 뛰어왔던 꼬마를 아직 기억한다며, 이제 손이 떨려 의원 문을 닫게 생겼다고 적었습니다. 편지 끝에는 갈매기 날개에 부목을 대던 그림이 서툴게 그려져 있습니다.",
    choices: [
      { title: "고향에 돌아가 일을 배운다", desc: "손기술은 늘지만 벌이를 놓친다",
        effect: { skills: { "의술": 8 }, money: -80000, happiness: 3, traits: { "선량": 1 },
                  memory: "늙은 의원의 떨리는 손", log: "고향 의원에게 돌아가 일을 거들며 배움" } },
      { title: "약값을 보내 의원을 돕는다", desc: "의원은 버티지만 내 손은 빈다",
        effect: { money: -120000, relationship: 5, reputation: 3, traits: { "신중": 1 },
                  log: "고향 의원에게 약값을 보내 문을 지키게 함" } },
      { title: "처방 노트만 받아 둔다", desc: "배울 건 챙기지만 섭섭하게 한다",
        effect: { knowledge: 5, relationship: -4, traits: { "야심": 1 },
                  log: "의원의 처방 노트만 받고 고향엔 가지 않음" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{고향}의 마을 의원에게서 몰래 전해진 편지가 옵니다. 다친 갈매기를 안고 뛰어왔던 꼬마가 수배서에 오른 걸 봤다며, 다친 동료가 있으면 밤에 뒷문으로 데려오라고 적었습니다. 그러나 {고향}의 항구에는 해군 지부가 있습니다.",
        choices: [
          { title: "다친 동료를 데리고 간다", desc: "동료를 살리지만 위험한 길이다",
            effect: { skills: { "의술": 6 }, relationship: 6, traits: { "용기": 1 },
                      memory: "의원 뒷문의 등불", log: "고향 의원에게 다친 동료를 몰래 데려가 고침" },
            risk: { chance: 0.3, effect: { health: -12, log: "고향 항구에서 해군에게 쫓겨 다침" } } },
          { desc: "안전하지만 동료는 기다려야 한다",
            effect: { money: -120000, relationship: 3, standing: 3, traits: { "신중": 1 },
                      log: "고향 의원에게 약값을 보내고 약만 받아 옴" } },
          {}
        ]
      },
      "해군": {
        body: "{고향}의 마을 의원에게서 편지가 옵니다. 다친 갈매기를 안고 뛰어왔던 꼬마가 해군이 됐다니 기쁘다며, 약이 떨어져 의원 문을 닫게 생겼다고 적었습니다. 당신의 기지 창고에는 남는 의약품 상자가 쌓여 있습니다.",
        choices: [
          { title: "남는 의약품을 몰래 보낸다", desc: "의원은 살지만 규정을 어긴다",
            effect: { relationship: 6, happiness: 4, traits: { "선량": 1 },
                      log: "기지 의약품을 고향 의원에게 몰래 보냄" },
            risk: { chance: 0.3, effect: { standing: -6, reputation: -4, log: "의약품 유출이 들통나 징계받음" } } },
          { title: "정식으로 지원을 상신한다", desc: "떳떳하지만 늦을 수 있다",
            effect: { standing: 5, happiness: -4, traits: { "신중": 1 },
                      log: "고향 의원 지원을 정식으로 상신함" } },
          {}
        ]
      },
      "*": {}
    }
  },

  // ── 생선 가게: 놀기로 한 약속을 깨고 손님을 끌어모음 ──
  {
    key: "cb_kid_fishshop_crier",
    flags: ["f_kid_fishshop_crier"],
    after: 10,
    when: { minAge: 18, maxAge: 50 },
    title: "또 겹친 두 약속",
    body: "{고향}의 생선 가게 아저씨가 늙은 손으로 편지를 보냈습니다. 큰 장이 서는 날, 비린내 나는 앞치마를 두르고 목청껏 손님을 부르던 그 꼬마가 한 번만 더 와 달라고 합니다. 하필 그날은 {단짝|이} 부두에서 혼례를 올리는 날입니다.",
    choices: [
      { title: "장터에서 목청을 높인다", desc: "장사는 크게 되지만 또 약속을 깬다",
        effect: { money: 120000, skills: { "장사": 3 }, relationship: -6, traits: { "야심": 1 },
                  log: "옛 친구의 혼례 대신 생선 가게 장터에 섬" } },
      { title: "부두의 혼례에 간다", desc: "옛 빚을 갚지만 아저씨는 섭섭하다",
        effect: { relationship: 6, happiness: 5, reputation: -3, traits: { "선량": 1 },
                  memory: "부두에서 올린 친구의 혼례", log: "장터 대신 옛 친구의 혼례에 감" } },
      { title: "가게 앞에서 잔치를 연다", desc: "둘 다 잡지만 손해를 본다",
        effect: { happiness: 6, relationship: 4, money: -80000, traits: { "용기": 1 },
                  log: "생선 가게 앞에 혼례 잔칫상을 차려 둘을 이음" },
        risk: { chance: 0.25, effect: { relationship: -5, log: "잔치 소동에 혼례가 엉망이 됨" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "{고향}의 생선 가게 아저씨가 몰래 편지를 보냈습니다. 목청껏 손님을 부르던 그 꼬마가 수배자가 된 건 알지만, 큰 장이 서는 날 한 번만 와 달라고 합니다. 그날은 {단짝|이} 부두에서 혼례를 올리는 날이고, 부두에는 해군이 깔릴 것입니다.",
        choices: [
          { title: "장터에서 약탈품까지 판다", desc: "큰돈이 되지만 얼굴이 알려진다",
            effect: { money: 150000, standing: 4, relationship: -6, traits: { "야심": 1 },
                      log: "생선 장터에서 약탈품을 몰래 팔아 치움" },
            risk: { chance: 0.3, effect: { health: -8, bounty: "+10%", log: "장터에서 해군에게 얼굴이 알려져 쫓김" } } },
          { title: "혼례를 멀리서 지켜본다", desc: "들키진 않지만 축하는 못 한다",
            effect: { happiness: -4, relationship: 3, traits: { "신중": 1 },
                      memory: "멀리서 본 부두의 혼례", log: "부두의 혼례를 지붕 위에서 지켜봄" } },
          {}
        ]
      },
      "해군": {
        body: "{고향}의 생선 가게 아저씨가 편지를 보냈습니다. 목청껏 손님을 부르던 그 꼬마가 해군이 됐다며, 가게가 기울었으니 부대 식재료 납품을 한 번만 맡겨 달라고 합니다. 같은 날 {단짝|이} 부두에서 혼례를 올린다는 소식도 함께 왔습니다.",
        choices: [
          { title: "부대 납품을 가게에 맡긴다", desc: "아저씨는 살지만 뒷말이 돈다",
            effect: { relationship: 4, happiness: 4, standing: -3, traits: { "야심": 1 },
                      log: "부대 식재료 납품을 옛 생선 가게에 맡김" },
            risk: { chance: 0.25, effect: { reputation: -6, log: "납품 특혜 소문으로 감사를 받음" } } },
          {},
          { title: "휴가를 내 둘 다 챙긴다", desc: "둘 다 잡지만 근무를 비운다",
            effect: { happiness: 6, relationship: 5, standing: -4, traits: { "용기": 1 },
                      log: "휴가를 내 장터와 혼례를 모두 챙김" } }
        ]
      },
      "*": {}
    }
  },

  // ── 해적선: 몰래 숨어들어 구경함 ──
  {
    key: "cb_kid_stowaway",
    flags: ["f_kid_stowaway"],
    after: 7,
    when: { minAge: 18, maxAge: 55 },
    title: "화물칸의 생쥐",
    body: "{여기}의 항구에 낯익은 깃발을 단 배가 들어옵니다. 어릴 적 술 취한 해적들 몰래 숨어들었던 그 화물칸의 배, {해적단}의 배입니다. 부두에 내린 늙은 갑판장이 당신을 빤히 보더니 \"화물칸의 생쥐 아니냐\" 하고 웃습니다.",
    choices: [
      { title: "갑판장과 술잔을 나눈다", desc: "바다 이야기를 듣지만 눈총을 산다",
        effect: { skills: { "항해술": 4 }, relationship: 3, reputation: -3, traits: { "선량": 1 },
                  log: "옛 해적선의 갑판장과 술잔을 나눔" } },
      { title: "한 구간만 태워 달라고 한다", desc: "가슴은 뛰지만 해적선이다",
        effect: { happiness: 8, skills: { "항해술": 3 }, traits: { "용기": 1 },
                  flags: ["f_cb_stowaway_sailed"], memory: "다시 탄 해적선의 갑판",
                  log: "옛 해적선에 올라 한 구간을 함께 항해함" },
        risk: { chance: 0.35, effect: { health: -10, log: "선상에서 해적들과 시비가 붙어 다침" } } },
      { title: "모른 척 자리를 뜬다", desc: "탈은 없지만 그날의 설렘도 접는다",
        effect: { happiness: -4, reputation: 3, traits: { "신중": 1 },
                  log: "해적 갑판장을 모른 척하고 자리를 뜸" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{여기}의 항구에 낯익은 깃발을 단 배가 들어옵니다. 어릴 적 몰래 숨어들었던 그 화물칸의 배, {해적단}의 배입니다. 늙은 갑판장이 당신의 수배서를 흔들며 \"화물칸의 생쥐가 다 컸구나\" 하고 웃습니다. 그들의 화물칸은 그때처럼 묵직해 보입니다.",
        choices: [
          { effect: { skills: { "항해술": 4 }, relationship: 4, money: -20000, traits: { "선량": 1 },
                      log: "옛 해적선의 갑판장과 술잔을 나눔" }, desc: "옛정은 쌓지만 술값이 든다" },
          { title: "동맹을 제안한다", desc: "힘은 커지지만 결렬될 수 있다",
            effect: { standing: 7, bounty: "+15%", traits: { "용기": 1 },
                      flags: ["f_cb_stowaway_ally"], log: "옛 해적선과 동맹을 맺음" },
            risk: { chance: 0.3, effect: { health: -10, log: "동맹 협상이 결렬되어 칼부림이 남" } } },
          { title: "그 화물칸을 턴다", desc: "배짱 있는 수지만 원한을 산다",
            effect: { money: 300000, relationship: -6, traits: { "야심": 1 },
                      log: "어릴 적 숨었던 화물칸을 털어 감" },
            risk: { chance: 0.3, effect: { health: -12, log: "화물칸을 털다 갑판장의 칼에 베임" } } }
        ]
      },
      "해군": {
        body: "{여기}의 항구에 수배 중인 깃발을 단 배가 들어옵니다. 어릴 적 몰래 숨어들었던 그 화물칸의 배, {해적단}의 배입니다. 해군 제복을 입은 당신을 본 늙은 갑판장이 \"화물칸의 생쥐가 해군이 됐어?\" 하고 웃습니다.",
        choices: [
          { title: "몰래 술잔을 나눈다", desc: "바다 이야기를 듣지만 위험하다",
            effect: { skills: { "항해술": 4 }, relationship: 4, traits: { "용기": 1 },
                      log: "옛 해적선 갑판장과 몰래 술잔을 나눔" },
            risk: { chance: 0.3, effect: { standing: -6, log: "해적과 어울린 일이 들통나 징계받음" } } },
          { title: "옛정을 접고 체포한다", desc: "공은 세우지만 마음이 쓰리다",
            effect: { standing: 8, happiness: -5, traits: { "신중": 1 },
                      log: "어릴 적 숨었던 해적선의 갑판장을 체포함" } },
          { title: "출항할 때를 일러 준다", desc: "빚은 갚지만 공을 놓친다",
            effect: { relationship: 4, happiness: 4, standing: -4, traits: { "선량": 1 },
                      log: "옛 해적선에 순찰 시간을 일러 줌" } }
        ]
      },
      "*": {}
    }
  },

  // ── 해적선: 해군에 알림 ──
  {
    key: "cb_kid_reported_ship",
    flags: ["f_kid_reported_ship"],
    after: 8,
    when: { minAge: 18, maxAge: 55 },
    title: "옛 신고 장부의 이름",
    body: "{고향}의 항구에서 머리가 센 해군 장교가 당신을 불러 세웁니다. 어릴 적 해적선 정박을 알려 왔던 그 아이가 맞느냐고 묻더니, 수상한 배를 몰래 알려 주면 사례하겠다고 합니다. 그날 이후 등을 돌렸던 동네 친구들의 얼굴이 떠오릅니다.",
    choices: [
      { title: "항구의 눈 노릇을 맡는다", desc: "돈은 되지만 이웃 눈이 차갑다",
        effect: { money: 150000, standing: 4, relationship: -6, traits: { "야심": 1 },
                  flags: ["f_cb_harbor_informant"], log: "해군 장교의 항구 정보원 노릇을 맡음" } },
      { title: "정중히 거절한다", desc: "조용하지만 해군 눈 밖에 난다",
        effect: { happiness: 3, reputation: -4, traits: { "신중": 1 },
                  log: "해군 장교의 정보원 제안을 거절함" } },
      { title: "옛 친구들에게 먼저 사과한다", desc: "늦은 사과지만 받아 줄지 모른다",
        effect: { relationship: 6, money: -20000, traits: { "선량": 1 },
                  log: "해적선 신고로 멀어진 옛 친구들에게 사과함" },
        risk: { chance: 0.3, effect: { happiness: -6, log: "옛 친구들이 사과를 받아 주지 않음" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "당신 배의 늙은 조타수가 술에 취해 옛이야기를 꺼냅니다. 어린 시절 {고향}의 항구에서 꼬마 하나의 신고로 해군이 들이닥쳐 타던 배를 잃었다는 이야기입니다. 그날 화물칸 문을 보고 해군에게 달려간 꼬마는 바로 당신입니다.",
        choices: [
          { title: "사실을 털어놓는다", desc: "떳떳해지지만 칼이 나올 수 있다",
            effect: { relationship: 5, standing: 3, traits: { "용기": 1 },
                      log: "옛 해적선을 신고한 꼬마가 자신임을 털어놓음" },
            risk: { chance: 0.35, effect: { health: -10, log: "분노한 조타수와 칼부림을 벌임" } } },
          { title: "끝까지 숨긴다", desc: "평화는 지키지만 마음이 무겁다",
            effect: { happiness: -6, standing: 3, traits: { "신중": 1 },
                      log: "옛 해적선을 신고한 일을 끝내 숨김" } },
          { title: "조타수에게 새 배를 약속한다", desc: "빚을 갚지만 돈이 크게 든다",
            effect: { money: -200000, relationship: 6, traits: { "선량": 1 },
                      log: "옛 일을 갚으려 조타수에게 새 배를 약속함" } }
        ]
      },
      "해군": {
        body: "새로 부임한 참모가 당신 이름을 보고 웃습니다. 어린 시절 {고향}의 항구에서 해적선 정박을 알려 온 꼬마의 신고를 받았던 장교가 바로 그입니다. 그는 그때의 눈썰미를 기억한다며, 당신을 정보 부서로 끌어 주겠다고 합니다.",
        choices: [
          { title: "정보 부서로 옮긴다", desc: "출셋길이지만 동기들과 멀어진다",
            effect: { standing: 8, relationship: -5, traits: { "야심": 1 },
                      flags: ["f_cb_navy_intel"], log: "옛 신고를 기억한 참모를 따라 정보 부서로 옮김" } },
          { title: "지금 부대에 남는다", desc: "정은 지키지만 기회를 놓친다",
            effect: { relationship: 4, happiness: 3, standing: -2, traits: { "신중": 1 },
                      log: "정보 부서 제안을 사양하고 부대에 남음" } },
          { title: "그 해적선의 뒷일을 묻는다", desc: "알게 되지만 마음이 무거워진다",
            effect: { knowledge: 4, happiness: -6, traits: { "선량": 1 },
                      memory: "신고 뒤에 남은 이름들", log: "어릴 적 신고한 해적선 선원들의 뒷일을 알게 됨" } }
        ]
      },
      "*": {}
    }
  },

  // ── 해적의 스카우트: 해적단 이름을 기억해 둠 ──
  {
    key: "cb_kid_pirate_scout_kept",
    flags: ["f_kid_pirate_scout_kept"],
    after: 5,
    when: { minAge: 20, maxAge: 55 },
    title: "애꾸눈 해적의 귀환",
    body: "{여기}의 뒷골목에서 피 묻은 소매를 감싼 노인이 당신을 붙잡습니다. 한쪽 눈을 가린 그 얼굴은 어릴 적 \"꼬마, 배 위에서 일해 볼 생각 없나?\" 하고 묻던 {해적단}의 해적입니다. 해군에게 쫓기는 그는 하룻밤만 숨겨 달라고 합니다.",
    choices: [
      { title: "창고에 숨겨 준다", desc: "옛정을 지키지만 들킬 수 있다",
        effect: { happiness: 6, traits: { "선량": 1 }, flags: ["f_cb_hid_oneeye"],
                  memory: "창고에 숨긴 애꾸눈 노인", log: "쫓기던 애꾸눈 해적을 창고에 숨겨 줌" },
        risk: { chance: 0.3, effect: { reputation: -6, health: -5, log: "해적을 숨긴 일이 들켜 해군에게 끌려감" } } },
      { title: "해군을 부른다", desc: "사례금을 받지만 뒷맛이 쓰다",
        effect: { money: 100000, standing: 3, happiness: -5, traits: { "야심": 1 },
                  log: "어릴 적 만난 애꾸눈 해적을 해군에 넘김" } },
      { title: "약값만 쥐여 보낸다", desc: "얽히지 않지만 돈이 든다",
        effect: { money: -30000, happiness: 2, traits: { "신중": 1 },
                  log: "애꾸눈 해적에게 약값만 주어 돌려보냄" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{여기}의 술집에서 한쪽 눈을 가린 늙은 해적이 당신 맞은편에 앉습니다. 어릴 적 뒷골목에서 배 위에서 일해 볼 생각 없냐고 묻던 {해적단}의 그 해적입니다. 그는 당신의 수배서를 탁자에 펼치더니 낡은 해도 한 장을 내밉니다.",
        choices: [
          { title: "노해적을 배에 태운다", desc: "길잡이를 얻지만 입이 하나 는다",
            effect: { relationship: 5, skills: { "항해술": 5 }, money: -30000, traits: { "선량": 1 },
                      flags: ["f_cb_oneeye_crew"], log: "애꾸눈 노해적을 배에 태워 길잡이로 삼음" } },
          { title: "값을 치르고 해도를 산다", desc: "깔끔하지만 비싸다",
            effect: { money: -150000, skills: { "항해술": 6 }, traits: { "신중": 1 },
                      log: "애꾸눈 노해적에게 낡은 해도를 사들임" } },
          { title: "해도를 빼앗고 쫓아낸다", desc: "이름은 오르지만 원한을 산다",
            effect: { standing: 6, bounty: "+15%", relationship: -5, traits: { "야심": 1 },
                      log: "애꾸눈 노해적의 해도를 빼앗고 쫓아냄" },
            risk: { chance: 0.25, effect: { health: -8, log: "노해적의 숨긴 칼에 옆구리를 베임" } } }
        ]
      },
      "해군": {
        body: "{여기} 지부 감옥에 새로 잡혀 온 늙은 해적이 당신을 보자 껄껄 웃습니다. 한쪽 눈을 가린 그는 어릴 적 뒷골목에서 당신을 꾀던 {해적단}의 해적입니다. 그는 옛정을 봐서 선장의 은신처를 불 테니 형량을 줄여 달라고 합니다.",
        choices: [
          { title: "몰래 풀어 준다", desc: "옛정은 갚지만 들키면 끝이다",
            effect: { happiness: 5, relationship: 3, traits: { "선량": 1 }, flags: ["f_cb_hid_oneeye"],
                      log: "감옥의 애꾸눈 해적을 몰래 풀어 줌" },
            risk: { chance: 0.35, effect: { standing: -8, reputation: -5, log: "해적을 풀어 준 일이 들통나 징계받음" } } },
          { title: "규정대로 심문한다", desc: "흠은 없지만 정보는 적다",
            effect: { standing: 5, happiness: -3, traits: { "신중": 1 },
                      reputation: 3, flags: ["f_cb_oneeye_by_rule"], log: "애꾸눈 해적을 규정대로 심문함" } },
          { title: "거래를 받아들인다", desc: "큰 공이 될지, 함정일지 모른다",
            effect: { standing: 8, traits: { "용기": 1 },
                      reputation: -3, log: "애꾸눈 해적의 제보로 해적 은신처를 급습함" },
            risk: { chance: 0.3, effect: { health: -12, log: "은신처가 함정이라 매복에 걸림" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 해적의 스카우트: 해군에 신고함 ──
  {
    key: "cb_kid_reported_pirate",
    flags: ["f_kid_reported_pirate"],
    after: 6,
    when: { minAge: 20, maxAge: 55 },
    title: "출소한 애꾸눈",
    body: "{여기}의 골목에서 한쪽 눈을 가린 사내가 당신 앞을 막아섭니다. 어릴 적 항구 술집 뒤에서 당신을 꾀다가, 당신의 신고로 해군에게 끌려갔던 그 해적입니다. 감옥에서 막 나왔다는 그는 \"그때 꼬마 덕에 몇 해를 썩었지\" 하고 이를 드러냅니다.",
    choices: [
      { title: "물러서지 않고 맞선다", desc: "기세는 세우지만 다칠 수 있다",
        effect: { combat: 4, reputation: 5, traits: { "용기": 1 },
                  log: "출소한 애꾸눈 해적에게 물러서지 않고 맞섬" },
        risk: { chance: 0.35, effect: { health: -12, log: "애꾸눈 해적과 맞붙다 크게 다침" } } },
      { title: "돈을 쥐여 돌려보낸다", desc: "조용히 끝나지만 비싸다",
        effect: { money: -100000, happiness: -3, traits: { "신중": 1 },
                  relationship: 4, flags: ["f_cb_oneeye_paid"], log: "출소한 애꾸눈 해적에게 돈을 주어 돌려보냄" } },
      { title: "어린 마음이었다고 털어놓는다", desc: "응어리를 풀지만 통할지 모른다",
        effect: { relationship: 5, happiness: 4, traits: { "선량": 1 },
                  memory: "골목에서 나눈 늦은 사과", log: "애꾸눈 해적에게 그날의 신고를 사과함" },
        risk: { chance: 0.3, effect: { health: -8, log: "사과가 통하지 않아 골목에서 얻어맞음" } } }
    ],
    by: {
      "해적": {
        body: "당신 배에 새로 탄 한쪽 눈의 늙은 선원이 갑판에서 당신을 노려봅니다. 어릴 적 항구 술집 뒤에서 당신을 꾀다가, 당신의 신고로 해군에게 끌려갔던 그 해적입니다. 그는 선원들 앞에서 \"우리 대장이 밀고꾼 출신이라니\" 하고 비웃습니다.",
        choices: [
          { title: "결투로 입을 막는다", desc: "위세는 서지만 피를 본다",
            effect: { combat: 5, standing: 6, traits: { "용기": 1 },
                      log: "밀고꾼이라 비웃은 애꾸눈 선원과 결투해 이김" },
            risk: { chance: 0.35, effect: { health: -12, log: "애꾸눈 선원과의 결투에서 크게 다침" } } },
          { title: "몰래 배에서 내리게 한다", desc: "소문은 막지만 돈과 인심을 잃는다",
            effect: { money: -60000, relationship: -3, traits: { "신중": 1 },
                      log: "애꾸눈 선원에게 돈을 주어 배에서 내리게 함" } },
          { title: "웃으며 사실이라고 인정한다", desc: "솔직하지만 체면이 깎인다",
            effect: { relationship: 5, reputation: -4, traits: { "선량": 1 },
                      log: "어릴 적 해적을 신고한 일을 선원들 앞에서 인정함" } }
        ]
      },
      "해군": {
        body: "순찰 중 골목에서 한쪽 눈을 가린 사내가 당신 앞을 막아섭니다. 어릴 적 당신의 신고로 끌려갔던 그 스카우트 해적으로, 감옥에서 나와 다시 배를 탔다고 합니다. 그의 뒤로 칼을 든 부하들이 골목 양쪽을 막아섭니다.",
        choices: [
          { title: "혼자 맞서 싸운다", desc: "공을 세우거나 크게 다친다",
            effect: { combat: 5, standing: 6, traits: { "용기": 1 },
                      log: "골목을 막은 애꾸눈 해적 일당과 홀로 싸움" },
            risk: { chance: 0.35, effect: { health: -15, log: "애꾸눈 해적 일당에게 둘러싸여 크게 다침" } } },
          { title: "호루라기로 지원을 부른다", desc: "안전하지만 체면이 깎인다",
            effect: { standing: 3, reputation: -3, traits: { "신중": 1 },
                      log: "지원을 불러 애꾸눈 해적 일당을 몰아냄" } },
          { title: "그의 말을 먼저 들어 본다", desc: "속사정을 알지만 틈을 보인다",
            effect: { knowledge: 4, relationship: 3, traits: { "선량": 1 },
                      log: "애꾸눈 해적의 옛 원한과 속사정을 들어 줌" },
            risk: { chance: 0.25, effect: { health: -8, log: "말을 듣던 틈에 기습을 당함" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 해적의 스카우트: 해적선 짐만 날라 줌 ──
  {
    key: "cb_kid_pirate_odd_job",
    flags: ["f_kid_pirate_odd_job"],
    after: 5,
    when: { minAge: 20, maxAge: 55 },
    title: "밀수 장부 속 이름",
    body: "{여기}의 창고 거리에서 낯선 상인이 당신 이름을 부릅니다. 그는 어릴 적 해적선 짐을 날라 주고 품삯을 받던 당신을 기억한다며, 낡은 장부의 한 줄을 손가락으로 짚어 보입니다. 이번에도 묻지 말고 상자 몇 개만 옮겨 주면 두둑이 쳐주겠다고 합니다.",
    choices: [
      { title: "묻지 않고 상자를 옮긴다", desc: "큰돈이지만 뒤탈이 날 수 있다",
        effect: { money: 200000, happiness: -3, traits: { "야심": 1 },
                  log: "묻지 않고 수상한 상자를 옮겨 품삯을 받음" },
        risk: { chance: 0.3, effect: { reputation: -8, log: "옮긴 상자가 밀수품으로 드러나 이름이 더럽혀짐" } } },
      { title: "상자를 열어 보고 신고한다", desc: "떳떳하지만 주먹이 날아온다",
        effect: { standing: 5, knowledge: 3, traits: { "용기": 1 },
                  log: "상자 속 밀수품을 확인하고 신고함" },
        risk: { chance: 0.25, effect: { health: -8, log: "밀수 상인의 경호원에게 얻어맞음" } } },
      { title: "값을 치르고 이름을 지운다", desc: "과거를 지우지만 돈이 든다",
        effect: { money: -80000, happiness: 6, traits: { "신중": 1 },
                  flags: ["f_cb_ledger_cleared"], log: "돈을 주고 밀수 장부에서 이름을 지움" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{여기}의 창고 거리에서 늙은 장물아비가 당신을 알아봅니다. 어릴 적 해적선 짐을 날라 주던 꼬마가 수배서에 이름을 올렸다며 웃더니, 해군 눈을 피하는 보급 길을 싸게 열어 주겠다고 합니다. 대신 그의 상자 몇 개를 당신 배로 옮겨 달라고 합니다.",
        choices: [
          { title: "상자를 싣고 보급 길을 얻는다", desc: "든든하지만 속은 모른다",
            effect: { money: 100000, standing: 4, traits: { "야심": 1 },
                      flags: ["f_cb_smuggle_route"], log: "장물아비의 상자를 싣고 보급 길을 얻음" },
            risk: { chance: 0.3, effect: { health: -10, log: "상자 속 화약이 터져 다침" } } },
          { title: "보급 길만 빼앗는다", desc: "이름은 오르지만 원한을 산다",
            effect: { standing: 5, bounty: "+10%", relationship: -5, traits: { "용기": 1 },
                      log: "장물아비를 겁박해 보급 길만 빼앗음" },
            risk: { chance: 0.25, effect: { health: -8, log: "장물아비의 패거리에게 기습당함" } } },
          { title: "상자를 열어 보고 싣는다", desc: "안전하지만 장물아비가 언짢다",
            effect: { knowledge: 3, relationship: -4, money: 30000, traits: { "신중": 1 },
                      log: "장물아비의 상자를 확인한 뒤에야 실어 줌" } }
        ]
      },
      "해군": {
        body: "압수한 밀수 장부를 넘기던 당신의 손이 멈춥니다. 어린 시절 해적선 짐을 날라 주고 품삯을 받은 꼬마, 당신의 이름이 거기 적혀 있습니다. 함께 장부를 보던 동료는 아직 그 줄을 보지 못했습니다.",
        choices: [
          { title: "그 장을 몰래 찢는다", desc: "경력은 지키지만 들킬 수 있다",
            effect: { happiness: 4, standing: 2, traits: { "야심": 1 },
                      log: "밀수 장부에서 자기 이름이 적힌 장을 찢음" },
            risk: { chance: 0.3, effect: { standing: -8, reputation: -5, log: "장부 훼손이 드러나 징계받음" } } },
          { title: "상관에게 먼저 털어놓는다", desc: "떳떳하지만 점수를 잃는다",
            effect: { reputation: 5, standing: -3, happiness: -3, traits: { "신중": 1 },
                      log: "밀수 장부 속 옛 이름을 상관에게 털어놓음" } },
          { title: "그 장부로 조직을 쫓는다", desc: "큰 공이 될지, 다칠지 모른다",
            effect: { standing: 8, traits: { "용기": 1 },
                      log: "옛 장부를 실마리로 밀수 조직을 쫓음" },
            risk: { chance: 0.3, effect: { health: -10, log: "밀수 조직을 쫓다 매복에 걸려 다침" } } }
        ]
      },
      "*": {}
    }
  }
]);
