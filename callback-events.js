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

/* ───────────── 2단계 회수 사건: 회수 사건이 남긴 f_cb_* 플래그를 받아 이야기를 마무리한다 (58) ───────────── */
CB([
  // ── 명검의 원래 주인 (f_cb_blade_owner_lead ← cb_goal_blades) ──
  {
    key: "cb2_blade_owner_lead",
    flags: ["f_cb_blade_owner_lead"],
    after: 6,
    when: { minAge: 26, maxAge: 70 },
    title: "문양이 걸린 대장간",
    body: "몇 해 전 골동품상의 먼지 쌓인 검집에서 본 문양을 단서로 떠났던 길이, {여기}의 외딴 대장간 간판 앞에서 끝납니다. 허리 굽은 대장장이는 그 검이 자기가 마지막으로 벼린 것이라며, 도둑맞았다 되찾은 녹슨 칼날을 벽에서 내립니다. 그의 손은 이제 망치를 들지 못합니다.",
    choices: [
      { title: "칼날을 함께 다시 벼린다", desc: "검은 살아나지만 화덕 일은 고되다",
        effect: { skills: { "제작": 6 }, relationship: 4, health: -5, traits: { "선량": 1 },
                  memory: "다시 벼린 칼날의 불꽃", log: "늙은 대장장이와 녹슨 명검을 다시 벼림" },
        risk: { chance: 0.25, effect: { health: -6, log: "화덕 불똥에 팔을 크게 데임" } } },
      { title: "값을 치르고 칼날을 사 간다", desc: "꿈이 채워지지만 노인은 쓸쓸하다",
        effect: { money: -300000, happiness: 8, skills: { "검술": 4 }, relationship: -3, traits: { "야심": 1 },
                  log: "대장장이에게 큰돈을 치르고 명검의 칼날을 사들임" } },
      { title: "검을 노인 곁에 남겨 둔다", desc: "이야기는 얻지만 검걸이는 빈다",
        effect: { knowledge: 5, happiness: -4, relationship: 2, traits: { "신중": 1 },
                  memory: "끝내 비워 둔 검걸이", log: "명검의 내력만 받아 적고 노인 곁에 남겨 둠" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 골동품상의 검집 문양을 따라 떠났던 길이 {여기}의 외딴 대장간에서 끝납니다. 대장장이 노인은 당신의 수배서를 보고도 문을 닫지 않습니다. 그 검을 훔쳐 간 것은 해군 장교였고, 지금도 근처 지부 장교의 허리에 차여 있다고 합니다. \"되찾아 오면 그 칼은 자네 것이오.\"",
        choices: [
          { title: "지부에 숨어들어 되찾는다", desc: "검을 쥐지만 목숨이 걸린다",
            effect: { combat: 6, bounty: "+25%", traits: { "용기": 1 },
                      memory: "지부 담장 너머의 칼집", log: "해군 지부에 숨어들어 명검을 되찾아 옴" },
            risk: { chance: 0.35, effect: { health: -14, log: "지부 장교와 맞붙어 크게 베임" } } },
          { title: "노인에게 새 검을 주문한다", desc: "확실하지만 그 검은 아니다",
            effect: { money: -250000, skills: { "검술": 5 }, happiness: -3, traits: { "신중": 1 },
                      log: "명검 대신 대장장이 노인에게 새 검을 주문함" } },
          { title: "노인을 배의 대장장이로 모신다", desc: "곁에 두지만 바다는 노인에게 험하다",
            effect: { relationship: 6, skills: { "제작": 4 }, money: -60000, traits: { "선량": 1 },
                      log: "명검을 벼린 노인을 배의 대장장이로 모심" },
            risk: { chance: 0.2, effect: { happiness: -6, log: "배에 오른 노인이 뱃멀미로 앓아누움" } } }
        ]
      },
      "해군": {
        body: "몇 해 전 골동품상의 검집 문양을 따라 떠났던 길이 {여기}의 외딴 대장간에서 끝납니다. 대장장이 노인은 당신의 제복을 보더니, 그 검을 훔쳐 간 해적단이 아직 근해를 돈다고 말합니다. 토벌을 건의하면 검도 공도 손에 들어오지만, 노인은 검보다 손자의 원수를 갚아 달라고 합니다.",
        choices: [
          { title: "토벌을 건의해 검을 되찾는다", desc: "공이 서지만 싸움은 험하다",
            effect: { standing: 6, combat: 4, traits: { "용기": 1 },
                      log: "명검을 훔친 해적단 토벌을 건의해 이끔" },
            risk: { chance: 0.3, effect: { health: -12, log: "토벌 중 해적의 칼에 깊이 베임" } } },
          { title: "휴가 동안 망치를 배운다", desc: "솜씨는 늘지만 진급이 밀린다",
            effect: { skills: { "제작": 6 }, standing: -3, relationship: 3, traits: { "신중": 1 },
                      memory: "노인의 대장간 휴가", log: "휴가를 내 대장장이 노인에게 검 벼리는 법을 배움" } },
          { title: "되찾은 검을 노인에게 바친다", desc: "옳은 일이지만 검은 내 것이 아니다",
            effect: { relationship: 6, happiness: -5, reputation: 3, traits: { "선량": 1 },
                      log: "증거물로 찾은 명검을 대장장이 노인에게 돌려줌" } }
        ]
      },
      "*": {}
    }
  },

  // ── 하사 청원의 답 (f_cb_blade_requested ← cb_goal_blades, 해군) ──
  {
    key: "cb2_blade_requested",
    flags: ["f_cb_blade_requested"],
    after: 5,
    when: { minAge: 25, maxAge: 70 },
    title: "늦게 온 하사 통지",
    body: "제복을 벗은 지 오래인데 옛 부대에서 편지가 옵니다. 몇 해 전 증거물 창고의 명검을 정식으로 하사해 달라고 낸 청원서에 이제야 답이 났지만, 퇴역자에게는 줄 수 없어 경매에 넘긴다는 내용입니다. 옛 동기는 경매 전에 한 번 보러 오라고 덧붙였습니다.",
    choices: [
      { title: "경매장에서 값을 부른다", desc: "손에 넣지만 주머니가 빈다",
        effect: { money: -400000, happiness: 8, skills: { "검술": 3 }, traits: { "야심": 1 },
                  memory: "경매장의 낙찰 망치 소리", log: "옛 청원의 명검을 경매에서 사들임" },
        risk: { chance: 0.25, effect: { money: -150000, log: "경쟁자가 값을 끝까지 올려 웃돈을 치름" } } },
      { title: "동기에게 몰래 빼 달라 한다", desc: "싸게 얻지만 동기를 위험에 판다",
        effect: { happiness: 5, skills: { "검술": 3 }, relationship: -3, traits: { "용기": 1 },
                  log: "옛 동기를 통해 경매 전에 명검을 빼냄" },
        risk: { chance: 0.3, effect: { relationship: -6, reputation: -6, log: "빼돌린 일이 들통나 동기가 징계받음" } } },
      { title: "동기와 술잔만 기울인다", desc: "인연은 남지만 꿈 한 칸이 빈다",
        effect: { relationship: 5, happiness: -5, traits: { "신중": 1 },
                  memory: "옛 동기와 기울인 잔", log: "명검 경매를 지켜보기만 하고 동기와 회포를 품" } }
    ],
    by: {
      "해군": {
        body: "몇 해 전 증거물 창고의 명검을 정식으로 하사해 달라고 낸 청원서에 마침내 답이 옵니다. 하사는 허락되었지만, 그 검을 약탈당했던 대장장이 가문도 반환을 청해 하사식에 그 집 손자가 함께 섭니다. 손자는 검을 걸고 한 번만 겨뤄 달라고 청합니다.",
        choices: [
          { title: "검을 받아 허리에 찬다", desc: "꿈을 이루지만 가문의 원망을 산다",
            effect: { happiness: 8, skills: { "검술": 5 }, relationship: -4, traits: { "야심": 1 },
                      memory: "하사식의 명검 무게", log: "청원한 명검을 하사받아 허리에 참" } },
          { title: "대장장이 가문에 양보한다", desc: "칭송받지만 기다린 세월이 아깝다",
            effect: { relationship: 6, reputation: 4, happiness: -6, traits: { "선량": 1 },
                      log: "하사받을 명검을 대장장이 가문에 양보함" } },
          { title: "검을 걸고 손자와 겨룬다", desc: "떳떳하게 가리지만 다칠 수 있다",
            effect: { combat: 5, standing: 4, traits: { "용기": 1 },
                      log: "명검을 걸고 대장장이 가문 손자와 겨룸" },
            risk: { chance: 0.3, effect: { health: -10, happiness: -4, log: "손자의 칼에 베이고 검도 내줌" } } }
        ]
      },
      "해적|혁명군": {
        body: "깃발 아래 사는 당신에게 옛 해군 동기의 편지가 몰래 닿습니다. 몇 해 전 당신이 하사를 청했던 그 명검이 이번 호송선에 실려 본부로 간다는 소식입니다. 편지 끝에는 \"너라면 어쩔지 궁금해서\"라는 한 줄과 호송 날짜가 적혀 있습니다.",
        choices: [
          { title: "호송선을 습격한다", desc: "검을 쥐지만 해군이 이를 간다",
            effect: { combat: 5, bounty: "+25%", happiness: 4, traits: { "용기": 1 },
                      log: "명검을 실은 해군 호송선을 습격함" },
            risk: { chance: 0.35, effect: { health: -12, log: "호송선 갑판에서 장교와 맞붙어 다침" } } },
          { title: "동기를 통해 값을 치른다", desc: "피는 안 보지만 동기가 위험하다",
            effect: { money: -300000, skills: { "검술": 4 }, traits: { "야심": 1 },
                      log: "옛 동기를 통해 호송 전에 명검을 사들임" },
            risk: { chance: 0.3, effect: { relationship: -5, happiness: -5, log: "동기가 내통 혐의로 끌려감" } } },
          { title: "검을 잊고 안부만 전한다", desc: "동기를 지키지만 꿈을 내려놓는다",
            effect: { relationship: 4, happiness: -6, traits: { "신중": 1 },
                      memory: "답장에 적은 짧은 안부", log: "명검을 포기하고 옛 동기에게 안부만 전함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 다리 이음새의 약한 곳 (f_cb_bridge_weakspot ← cb_school_apprentice, 해적|혁명군) ──
  {
    key: "cb2_bridge_weakspot",
    flags: ["f_cb_bridge_weakspot"],
    after: 6,
    when: { minAge: 26, maxAge: 70 },
    title: "금이 간 요새 다리",
    body: "해군 요새로 이어지는 다리가 무너졌다는 기사가 신문에 실립니다. 몇 해 전 옛 스승과 함께 놓으며 당신이 몰래 약하게 남긴 바로 그 이음새입니다. 해군은 굽은 손의 스승을 부실 공사 책임자로 붙잡아 재판에 넘겼습니다.",
    choices: [
      { title: "자수하고 사실을 밝힌다", desc: "스승을 구하지만 이름이 무너진다",
        effect: { reputation: -10, relationship: 6, happiness: 4, traits: { "선량": 1 },
                  memory: "법정에서 마주친 스승의 눈", log: "다리 이음새를 망친 것이 자신임을 자수함" },
        risk: { chance: 0.3, effect: { health: -8, log: "자수 뒤 감옥에서 모진 심문을 받음" } } },
      { title: "몰래 변호인을 붙여 준다", desc: "죄는 숨기지만 큰돈이 든다",
        effect: { money: -300000, relationship: 2, happiness: -4, traits: { "신중": 1 },
                  log: "옛 스승에게 이름을 숨긴 채 변호인을 붙여 줌" } },
      { title: "입을 다물고 지켜본다", desc: "몸은 안전하지만 평생 짐이 된다",
        effect: { happiness: -8, knowledge: 2, traits: { "야심": 1 },
                  log: "스승이 다리 붕괴의 죄를 쓰는 것을 지켜봄" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 옛 스승과 놓은 해군 요새 다리, 그 이음새에 당신이 몰래 남긴 약한 곳이 아직 그대로입니다. 그런데 그 요새 감옥에 동료가 잡혀 있고, 다리에 금이 간 것을 본 해군은 스승을 부실 공사 혐의로 같은 감옥에 넣었습니다.",
        choices: [
          { title: "이음새를 무너뜨려 습격한다", desc: "동료를 구하지만 스승의 죄가 굳는다",
            effect: { standing: 8, bounty: "+30%", relationship: -4, traits: { "용기": 1 },
                      memory: "무너지는 요새 다리", log: "약하게 남긴 이음새를 끊고 요새를 습격함" },
            risk: { chance: 0.35, effect: { health: -12, log: "무너진 다리 잔해에 휩쓸려 다침" } } },
          { title: "공작의 증거를 흘린다", desc: "스승은 풀려나지만 내 이름이 걸린다",
            effect: { relationship: 6, bounty: "+40%", standing: -4, traits: { "선량": 1 },
                      log: "다리 공작이 자기 짓이라는 증거를 해군에 흘림" } },
          { title: "때를 기다리며 숨어 지낸다", desc: "배는 지키지만 둘 다 갇혀 있다",
            effect: { happiness: -8, standing: 4, traits: { "신중": 1 },
                      log: "요새 감옥의 동료와 스승을 두고 때를 기다림" } }
        ]
      },
      "해군": {
        body: "제복을 입은 당신에게 요새 다리 보강 공사를 감찰하라는 명령이 내려옵니다. 서류를 넘기다 손이 멈춥니다. 몇 해 전 옛 스승과 다리를 놓으며 당신이 몰래 약하게 남긴 바로 그 이음새가 점검 목록 맨 위에 있습니다.",
        choices: [
          { title: "감찰 보고서에 다 적는다", desc: "떳떳하지만 경력이 흔들린다",
            effect: { standing: -8, happiness: 5, reputation: 3, traits: { "용기": 1 },
                      log: "다리 이음새를 망친 옛일까지 보고서에 적음" } },
          { title: "밤마다 몰래 이음새를 고친다", desc: "흔적은 지우지만 몸이 상한다",
            effect: { skills: { "제작": 6 }, health: -5, traits: { "신중": 1 },
                      memory: "밤중의 요새 다리 아래", log: "아무도 모르게 요새 다리 이음새를 보강함" },
            risk: { chance: 0.25, effect: { standing: -6, log: "야간 작업이 순찰에 걸려 추궁받음" } } },
          { title: "스승의 부실 공사로 적는다", desc: "공은 서지만 스승을 판다",
            effect: { standing: 6, relationship: -8, happiness: -3, traits: { "야심": 1 },
                      log: "다리의 흠을 옛 스승의 부실 공사로 보고함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 지워 준 장부의 이름 (f_cb_cook_ledger ← cb_train_cook, 해군) ──
  {
    key: "cb2_cook_ledger",
    flags: ["f_cb_cook_ledger"],
    after: 6,
    when: { minAge: 24, maxAge: 70 },
    title: "식당 주인의 봉투",
    body: "오랜만에 들른 옛 항구 식당에서, 붕대를 푼 주인이 두툼한 봉투를 내밉니다. 몇 해 전 당신이 장부에서 이름을 지워 준 해적 손님이 두고 간 돈인데, 꼭 당신에게 전해 달라 했다고 합니다. 그 해적은 지금 수배서 맨 윗줄에 있습니다.",
    choices: [
      { title: "봉투를 받아 챙긴다", desc: "돈은 크지만 뒷말이 붙는다",
        effect: { money: 300000, happiness: 3, traits: { "야심": 1 },
                  log: "장부에서 지워 준 해적이 남긴 돈을 받음" },
        risk: { chance: 0.3, effect: { reputation: -8, log: "해적 돈을 받았다는 소문이 항구에 퍼짐" } } },
      { title: "식당 수리에 보태게 한다", desc: "식당은 살지만 내 몫은 없다",
        effect: { relationship: 6, money: -30000, traits: { "선량": 1 },
                  memory: "새 간판을 단 항구 식당", log: "해적의 돈에 보태 옛 식당을 고치게 함" } },
      { title: "봉투를 해군에 넘긴다", desc: "떳떳하지만 주인이 곤란해진다",
        effect: { reputation: 6, relationship: -6, traits: { "신중": 1 },
                  log: "해적이 남긴 돈 봉투를 해군 지부에 넘김" } }
    ],
    by: {
      "해군": {
        body: "감찰관이 옛 식당 조사 서류를 다시 꺼내 듭니다. 같은 날 그 식당 주인이 쪽지 하나를 몰래 전해 옵니다. 몇 해 전 당신이 장부에서 이름을 지워 준 해적 손님이 이제 큰 선장이 되어, 은혜를 갚겠다며 자기 해적단 동료들의 은신처를 적어 보냈습니다.",
        choices: [
          { title: "쪽지대로 은신처를 친다", desc: "큰 공이지만 함정일 수 있다",
            effect: { standing: 8, relationship: -4, traits: { "야심": 1 },
                      log: "옛 해적 손님이 보낸 쪽지로 은신처를 급습함" },
            risk: { chance: 0.3, effect: { health: -10, log: "쪽지의 은신처가 함정이라 매복에 걸림" } } },
          { title: "쪽지를 태우고 모른 척한다", desc: "흔적은 없애지만 감찰이 남았다",
            effect: { happiness: -4, relationship: 3, traits: { "신중": 1 },
                      log: "옛 해적 손님의 쪽지를 태워 없앰" },
            risk: { chance: 0.3, effect: { standing: -7, log: "감찰관이 쪽지가 오간 사실을 알아냄" } } },
          { title: "감찰관에게 다 털어놓는다", desc: "짐을 벗지만 경력에 흠이 난다",
            effect: { standing: -8, happiness: 6, reputation: 3, traits: { "용기": 1 },
                      memory: "감찰실의 긴 침묵", log: "옛 식당 장부를 고친 일을 감찰관에게 자백함" } }
        ]
      },
      "해적|혁명군": {
        body: "{여기} 항구에 닻을 내리자 이름난 해적선의 선장이 당신을 찾아옵니다. 몇 해 전 해군 제복을 입은 당신이 옛 식당 장부에서 이름을 지워 준 그 손님입니다. 그는 같은 깃발 아래 서게 된 것을 반기며 은혜를 갚겠다고 합니다.",
        choices: [
          { title: "그의 배와 손을 잡는다", desc: "세가 커지지만 믿을 수 있을까",
            effect: { standing: 6, bounty: "+20%", traits: { "야심": 1 },
                      log: "장부에서 지워 준 옛 손님의 해적단과 손잡음" },
            risk: { chance: 0.3, effect: { health: -10, money: -100000, log: "동맹 선장이 전리품을 들고 등을 돌림" } } },
          { title: "은혜를 식당에 돌리게 한다", desc: "식당은 살지만 내 몫은 없다",
            effect: { relationship: 6, money: -60000, traits: { "선량": 1 },
                      memory: "다시 문을 연 항구 식당", log: "옛 손님의 보답을 항구 식당 주인에게 돌림" } },
          { title: "항로 정보만 받고 헤어진다", desc: "쓸모는 있지만 정은 식는다",
            effect: { skills: { "항해술": 5 }, relationship: -3, traits: { "신중": 1 },
                      log: "옛 해적 손님에게서 비밀 항로만 받아 냄" } }
        ]
      },
      "*": {}
    }
  },

  // ── 끊어 낸 고향 (f_cb_cut_hometown ← cb_goal_hometown, 해적|혁명군) ──
  {
    key: "cb2_cut_hometown",
    flags: ["f_cb_cut_hometown"],
    after: 8,
    when: { minAge: 28, maxAge: 75 },
    title: "고향에서 온 부고",
    body: "고향을 지키려 스스로 연을 끊은 지 몇 해, {고향}에서 부고가 옵니다. 당신을 길러 준 어른이 돌아가셨고, 마지막까지 당신 이름을 불렀다고 합니다. 이제 깃발을 내린 당신이 돌아가도, 고향 사람들은 그 시절의 수배서를 아직 기억할지 모릅니다.",
    choices: [
      { title: "장례에 얼굴을 비친다", desc: "끊긴 연을 잇지만 뒷말이 돈다",
        effect: { relationship: 6, happiness: 3, traits: { "선량": 1 },
                  memory: "고향 언덕의 마지막 인사", log: "연을 끊었던 고향의 장례에 찾아감" },
        risk: { chance: 0.3, effect: { reputation: -6, log: "옛 수배를 기억한 이웃들이 등을 돌림" } } },
      { title: "멀리서 혼자 제를 올린다", desc: "고향은 조용하지만 마음이 빈다",
        effect: { happiness: -6, knowledge: 2, traits: { "신중": 1 },
                  memory: "바다에 띄운 작은 등불", log: "고향에 가지 않고 홀로 제를 올림" } },
      { title: "남은 땅을 정리해 판다", desc: "돈은 되지만 고향이 완전히 멀어진다",
        effect: { money: 200000, relationship: -6, traits: { "야심": 1 },
                  log: "고향에 남은 몫의 땅을 정리해 팖" } }
    ],
    by: {
      "해적|혁명군": {
        body: "고향을 지키려 스스로 연을 끊은 지 몇 해, {고향} 앞바다에 낯선 해적단이 닻을 내렸다는 소문이 들립니다. 고향 사람들은 당신 이름을 입에 올리지 않은 지 오래고, 당신이 나타나면 다시 해군의 표적이 될 것입니다.",
        choices: [
          { title: "얼굴을 가리고 몰래 지킨다", desc: "고향을 지키지만 아무도 모른다",
            effect: { combat: 5, health: -6, traits: { "용기": 1 },
                      memory: "이름 없이 지킨 고향 앞바다", log: "정체를 숨긴 채 고향 앞바다의 해적을 몰아냄" },
            risk: { chance: 0.3, effect: { health: -10, log: "밤 습격 중 칼에 옆구리를 베임" } } },
          { title: "깃발을 걸고 고향을 구한다", desc: "고향이 알아보지만 다시 짐이 된다",
            effect: { relationship: 7, happiness: 6, bounty: "+30%", traits: { "선량": 1 },
                      log: "깃발을 걸고 고향을 구하며 다시 이름을 밝힘" },
            risk: { chance: 0.3, effect: { relationship: -5, log: "해군이 고향 사람들을 다시 캐묻기 시작함" } } },
          { title: "끊은 연대로 지나친다", desc: "고향은 안전하지만 가슴이 찢긴다",
            effect: { happiness: -8, standing: 5, traits: { "신중": 1 },
                      log: "고향의 위기를 모른 척하고 항로를 지킴" } }
        ]
      },
      "해군": {
        body: "깃발을 내리고 제복을 입은 당신에게 {고향} 해역 순찰 명령이 떨어집니다. 몇 해 전 고향을 지키려 스스로 연을 끊었던 그곳 사람들은, 당신을 아직 해적이던 사람으로 기억합니다. 부두에는 옛 이웃들이 모여 해군 함선을 바라보고 있습니다.",
        choices: [
          { title: "부두에 내려 먼저 인사한다", desc: "연을 다시 잇지만 부하들이 수군댄다",
            effect: { relationship: 6, standing: -4, traits: { "선량": 1 },
                      memory: "제복 차림의 귀향", log: "고향 부두에 내려 옛 이웃들에게 인사함" } },
          { title: "함선에서 내리지 않는다", desc: "평판은 지키지만 고향은 남이 된다",
            effect: { standing: 4, happiness: -6, traits: { "신중": 1 },
                      log: "고향 순찰 내내 함선에서 내리지 않음" } },
          { title: "순찰 구역 변경을 청한다", desc: "피할 수 있지만 상관이 의심한다",
            effect: { happiness: 3, standing: -5, traits: { "야심": 1 },
                      log: "고향 해역 순찰을 다른 구역으로 바꿔 달라 청함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 사환으로 태운 아이 (f_cb_elite_cabin_kid ← cb_school_elite_failed, 해적|혁명군) ──
  {
    key: "cb2_elite_cabin_kid",
    flags: ["f_cb_elite_cabin_kid"],
    after: 7,
    when: { minAge: 26, maxAge: 70 },
    title: "갑판에서 자란 사환",
    body: "깃발을 내린 당신을 키 큰 청년이 찾아옵니다. 몇 해 전 철문 앞에서 낙방 쪽지를 쥐고 울다 당신 배에 사환으로 올랐던 그 아이입니다. 그는 이제 작은 배의 선장이 되었다며, 당신을 갑판장으로 모시고 싶다고 모자를 벗습니다.",
    choices: [
      { title: "한 철만 그의 배에 탄다", desc: "가슴이 뛰지만 뭍의 삶이 흔들린다",
        effect: { combat: 4, happiness: 5, reputation: -5, traits: { "용기": 1 },
                  memory: "옛 사환이 잡은 키", log: "옛 사환이 선장인 배에 한 철 갑판장으로 탐" },
        risk: { chance: 0.3, effect: { health: -10, log: "옛 사환의 배에서 해전에 휘말려 다침" } } },
      { title: "뭍에 남아 축복만 건넨다", desc: "삶은 지키지만 청년이 서운해한다",
        effect: { happiness: -3, relationship: 4, traits: { "신중": 1 },
                  log: "옛 사환의 권유를 사양하고 뱃길을 축복함" } },
      { title: "배를 접고 시험을 보라 한다", desc: "옛 꿈을 일깨우지만 사이가 틀어진다",
        effect: { relationship: -5, reputation: 4, knowledge: 2, traits: { "선량": 1 },
                  log: "옛 사환에게 배를 접고 학교 시험을 보라 권함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 철문 앞에서 낙방 쪽지를 쥐고 울던 아이를 사환으로 태웠던 일이 어제 같습니다. 그 아이가 이제 훌쩍 자라 항해사 자리를 달라고 청합니다. 그런데 밤에 혼자 낡은 교과서를 펴 보는 모습을, 당신은 몇 번이나 보았습니다.",
        choices: [
          { title: "항해사 자리를 맡긴다", desc: "든든하지만 아직 서툴다",
            effect: { standing: 5, relationship: 5, traits: { "야심": 1 },
                      log: "사환으로 태웠던 아이를 항해사로 세움" },
            risk: { chance: 0.3, effect: { health: -8, log: "새 항해사의 실수로 암초에 부딪힘" } } },
          { title: "뭍에 내려 시험을 보게 한다", desc: "꿈을 돌려주지만 곁을 떠난다",
            effect: { money: -150000, relationship: 4, happiness: -5, traits: { "선량": 1 },
                      memory: "부두에서 흔든 교과서", log: "사환이던 아이를 뭍에 내려 다시 시험을 보게 함" } },
          { title: "제 배를 내주어 독립시킨다", desc: "이름이 퍼지지만 큰돈이 든다",
            effect: { money: -300000, standing: 6, happiness: 3, traits: { "용기": 1 },
                      log: "옛 사환에게 작은 배를 내주어 선장으로 세움" } }
        ]
      },
      "해군": {
        body: "해적선 토벌 뒤 포로 명단에 낯익은 이름이 있습니다. 몇 해 전 철문 앞에서 낙방 쪽지를 쥐고 울던 아이, 깃발 아래 시절의 당신이 사환으로 태웠던 그 아이가 이제 해적 항해사가 되어 묶여 있습니다. 그는 당신의 제복을 보고 고개를 돌립니다.",
        choices: [
          { title: "규정대로 압송한다", desc: "흠은 없지만 가슴이 무겁다",
            effect: { standing: 6, happiness: -8, traits: { "신중": 1 },
                      log: "사환으로 태웠던 아이를 규정대로 압송함" } },
          { title: "신병으로 받아 달라 청한다", desc: "길을 열지만 내 이름을 건다",
            effect: { relationship: 5, standing: -4, traits: { "선량": 1 },
                      memory: "제복을 입은 옛 사환", log: "옛 사환을 신병으로 받아 달라 상부에 청함" },
            risk: { chance: 0.3, effect: { standing: -6, log: "옛 사환이 훈련소에서 달아나 책임을 짐" } } },
          { title: "밤중에 몰래 풀어 준다", desc: "옛정은 지키지만 들키면 끝이다",
            effect: { relationship: 6, happiness: 4, traits: { "용기": 1 },
                      log: "묶여 있던 옛 사환을 밤중에 풀어 줌" },
            risk: { chance: 0.35, effect: { standing: -8, reputation: -5, log: "포로를 풀어 준 일이 들통나 징계받음" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 길을 열어 준 아이 (f_cb_elite_tutored ← cb_school_elite_failed, 기본·해군) ──
  {
    key: "cb2_elite_tutored",
    flags: ["f_cb_elite_tutored"],
    after: 8,
    when: { minAge: 27, maxAge: 75 },
    title: "철문을 지난 아이",
    body: "몇 해 전 높은 철문 앞에서 낙방 쪽지를 쥐고 울던 아이가, 관청 서기의 옷을 입고 당신을 찾아옵니다. 당신이 손을 내민 덕에 이듬해 붙었고 수석으로 졸업했다고 합니다. 그는 은혜를 갚겠다며, 당신의 세금 장부를 슬쩍 손봐 주겠다고 속삭입니다.",
    choices: [
      { title: "호의를 받아들인다", desc: "돈은 아끼지만 흠이 남는다",
        effect: { money: 200000, happiness: 2, traits: { "야심": 1 },
                  log: "옛 낙방생 서기의 손을 빌려 세금을 덜어 냄" },
        risk: { chance: 0.3, effect: { reputation: -8, relationship: -3, log: "고친 세금 장부가 들통나 둘 다 곤란해짐" } } },
      { title: "바르게 살라 타이른다", desc: "떳떳하지만 청년이 무안해한다",
        effect: { reputation: 4, relationship: -4, traits: { "신중": 1 },
                  log: "옛 낙방생에게 장부에 손대지 말라 타이름" } },
      { title: "함께 공부방을 연다", desc: "아이들은 기뻐하지만 돈과 시간이 든다",
        effect: { knowledge: 4, relationship: 5, money: -60000, traits: { "선량": 1 },
                  memory: "철문 옆 작은 공부방", log: "옛 낙방생과 낙방한 아이들의 공부방을 엶" } }
    ],
    by: {
      "해군": {
        body: "몇 해 전 철문 앞에서 낙방 쪽지를 쥐고 울던 아이가 장교 후보생이 되어 당신 부대에 배속됩니다. 그런데 그가 훈련 중 동기를 다치게 한 일을 숨겼다는 고발장이 올라옵니다. 그의 서류에는 당신이 길을 열어 준 흔적이 고스란히 남아 있습니다.",
        choices: [
          { title: "고발을 덮어 준다", desc: "아이를 지키지만 내 이름이 걸린다",
            effect: { relationship: 5, happiness: 2, traits: { "선량": 1 },
                      log: "옛 낙방생 후보생의 고발장을 덮어 줌" },
            risk: { chance: 0.35, effect: { standing: -8, log: "덮은 고발이 다시 올라와 함께 문책받음" } } },
          { title: "규정대로 처리한다", desc: "공정하지만 아이가 등을 돌린다",
            effect: { standing: 5, relationship: -6, traits: { "신중": 1 },
                      log: "옛 낙방생 후보생을 규정대로 징계에 넘김" } },
          { title: "직접 데리고 다시 단련한다", desc: "사람을 만들지만 몸이 고되다",
            effect: { combat: 4, relationship: 3, health: -5, traits: { "용기": 1 },
                      memory: "새벽 연병장의 두 그림자", log: "옛 낙방생 후보생을 곁에 두고 다시 단련함" } }
        ]
      },
      "해적|혁명군": {
        body: "해군 함선이 당신 배를 에워쌉니다. 뱃머리에 선 젊은 소위는, 몇 해 전 철문 앞에서 낙방 쪽지를 쥐고 울던 그 아이입니다. 당신이 길을 열어 준 덕에 여기까지 왔다는 그가 외칩니다. \"은혜는 잊지 않았습니다. 하지만 놓아 드릴 수는 없습니다.\"",
        choices: [
          { title: "포위를 정면으로 뚫는다", desc: "빠져나가지만 그와 칼을 섞는다",
            effect: { combat: 5, bounty: "+25%", relationship: -3, traits: { "용기": 1 },
                      log: "옛 낙방생 소위의 포위를 정면으로 뚫음" },
            risk: { chance: 0.35, effect: { health: -12, log: "포위를 뚫다 포탄 파편에 다침" } } },
          { title: "짐을 버려 그에게 공을 준다", desc: "피는 안 보지만 전리품을 잃는다",
            effect: { money: -200000, relationship: 5, traits: { "선량": 1 },
                      memory: "바다에 버린 금화 상자", log: "전리품을 버려 옛 낙방생 소위에게 공을 쥐여 줌" } },
          { title: "옛 이야기로 흔들어 틈을 낸다", desc: "빠져나가지만 그의 마음을 이용한다",
            effect: { standing: 5, relationship: -6, traits: { "야심": 1 },
                      log: "철문 앞 이야기로 옛 낙방생을 흔들어 달아남" } }
        ]
      },
      "*": {}
    }
  },

  // ── 배에 태운 가족 (f_cb_family_aboard ← cb_goal_family, 해적|혁명군) ──
  {
    key: "cb2_family_aboard",
    flags: ["f_cb_family_aboard"],
    after: 6,
    when: { minAge: 28, maxAge: 75 },
    title: "바다에서 자란 막내",
    body: "깃발을 내리고 뭍에 정착했지만, 한때 배에서 함께 지낸 가족은 땅 위 생활에 서툽니다. 그때 갑판에서 자란 막내는 밤마다 부두에 나가 앉아 있더니, 오늘 다른 배에 선원으로 오르겠다고 말합니다. 그 배는 평판이 좋지 않습니다.",
    choices: [
      { title: "막내를 바다로 보내 준다", desc: "막내는 웃지만 걱정이 남는다",
        effect: { relationship: 4, happiness: -5, traits: { "용기": 1 },
                  memory: "부두에서 멀어지는 돛", log: "배에서 자란 막내를 바다로 떠나보냄" },
        risk: { chance: 0.3, effect: { happiness: -6, log: "막내가 탄 배가 해전에 휘말렸다는 소식을 들음" } } },
      { title: "붙잡고 뭍의 일을 가르친다", desc: "곁에 두지만 막내가 시든다",
        effect: { relationship: -5, skills: { "장사": 4 }, traits: { "신중": 1 },
                  log: "막내를 붙잡아 뭍의 일을 가르침" } },
      { title: "가족 몫으로 작은 어선을 산다", desc: "함께 바다에 나가지만 돈이 든다",
        effect: { money: -300000, relationship: 6, skills: { "항해술": 3 }, traits: { "선량": 1 },
                  log: "가족과 함께 탈 작은 어선을 사들임" } }
    ],
    by: {
      "해적|혁명군": {
        body: "가족을 배에 태운 지 몇 해, 갑판에서 자란 막내는 어엿한 선원이 되었습니다. 하지만 나이 든 어른은 흔들리는 침상에서 점점 야위어 가고, 해군의 추격은 해마다 거세집니다. 동료들은 가족이 탄 배라 싸움을 피한다며 수군댑니다.",
        choices: [
          { title: "가족을 안전한 섬에 내린다", desc: "가족은 살지만 곁을 떠난다",
            effect: { money: -300000, relationship: 4, happiness: -6, traits: { "신중": 1 },
                      memory: "섬에 마련한 가족의 집", log: "배에 태웠던 가족을 안전한 섬에 내려 줌" } },
          { title: "끝까지 배에서 함께한다", desc: "곁을 지키지만 바다는 험하다",
            effect: { happiness: 7, relationship: 4, traits: { "용기": 1 },
                      log: "가족과 끝까지 한배를 타기로 함" },
            risk: { chance: 0.3, effect: { health: -12, log: "해전 중 가족을 감싸다 크게 다침" } } },
          { title: "가족을 정식 선원으로 세운다", desc: "세는 커지지만 동료가 불평한다",
            effect: { standing: 5, relationship: -4, traits: { "야심": 1 },
                      log: "배에 태운 가족에게 정식 선원 몫을 줌" } }
        ]
      },
      "해군": {
        body: "제복을 입은 당신의 인사 서류에 한 줄이 덧붙습니다. 깃발 아래 시절 가족을 배에 태워 함께 지냈다는 기록입니다. 감찰관은 가족이 지금도 해적과 닿아 있는지 묻고, 해적선에서 자란 막내는 해군 함정에 오르고 싶다고 조릅니다.",
        choices: [
          { title: "있는 그대로 밝힌다", desc: "떳떳하지만 진급이 막힌다",
            effect: { standing: -6, happiness: 4, traits: { "용기": 1 },
                      log: "가족이 해적선에 탔던 일을 감찰관에게 밝힘" } },
          { title: "막내를 신병으로 데려온다", desc: "곁에 두지만 막내 과거가 걸린다",
            effect: { relationship: 6, traits: { "선량": 1 },
                      memory: "제복을 입은 막내", log: "해적선에서 자란 막내를 해군 신병으로 데려옴" },
            risk: { chance: 0.3, effect: { standing: -6, log: "막내의 과거가 드러나 함께 조사받음" } } },
          { title: "가족을 먼 섬으로 옮긴다", desc: "흔적은 지우지만 가족이 멀어진다",
            effect: { money: -200000, relationship: -4, standing: 3, traits: { "신중": 1 },
                      log: "감찰을 피해 가족을 먼 섬으로 이주시킴" } }
        ]
      },
      "*": {}
    }
  },

  // ── 이어받은 가업 (f_cb_family_returned ← cb_school_family_work, 기본·해군) ──
  {
    key: "cb2_family_returned",
    flags: ["f_cb_family_returned"],
    after: 8,
    when: { minAge: 28, maxAge: 75 },
    title: "손에 익은 집안 일",
    body: "몇 해 전 꾹꾹 눌러 쓴 편지를 받고 {고향}에 돌아가 이어받은 집안 일이 이제 손에 익었습니다. 몸져누웠던 가족은 다시 일어나 \"이젠 네 길을 가라\"고 말합니다. 같은 날 외지 상단에서 가업을 통째로 사겠다는 제안이 들어옵니다.",
    choices: [
      { title: "가업을 계속 지킨다", desc: "고향은 든든하지만 꿈은 접는다",
        effect: { relationship: 5, money: 100000, happiness: -4, traits: { "신중": 1 },
                  memory: "손에 익은 고향 일터", log: "다시 떠나는 대신 고향의 가업을 지킴" } },
      { title: "가족 말대로 다시 떠난다", desc: "가슴이 뛰지만 가업이 흔들린다",
        effect: { happiness: 7, relationship: -5, traits: { "용기": 1 },
                  log: "가족의 허락을 받고 다시 제 길을 떠남" } },
      { title: "가업을 상단에 넘긴다", desc: "큰돈이 되지만 가족이 서운해한다",
        effect: { money: 400000, relationship: -6, traits: { "야심": 1 },
                  log: "고향의 가업을 외지 상단에 팔아넘김" } }
    ],
    by: {
      "해군": {
        body: "몇 해 전 원정을 포기하고 휴가를 내 고향 일을 도왔던 그 여름, 원정대 자리를 대신 간 동기가 이제 당신의 상관으로 부임합니다. 그는 그때 당신 덕에 출세했다며 이번엔 위로 끌어 주겠다고 합니다. 대가는 고향 가까운 지금 근무지를 떠나는 것입니다.",
        choices: [
          { title: "동기를 따라 위로 간다", desc: "출셋길이지만 고향이 멀어진다",
            effect: { standing: 7, relationship: -5, traits: { "야심": 1 },
                      log: "옛 원정 자리를 대신 간 동기를 따라 본부로 감" } },
          { title: "고향 근무지에 남는다", desc: "가족 곁이지만 또 기회를 놓친다",
            effect: { happiness: 6, standing: -4, traits: { "신중": 1 },
                      memory: "또 한 번 고른 고향", log: "승진 대신 고향 가까운 근무지에 남음" } },
          { title: "호의를 고향 지원으로 돌린다", desc: "고향이 덕을 보지만 사사로운 청이다",
            effect: { relationship: 6, reputation: 3, traits: { "선량": 1 },
                      log: "동기의 호의를 고향 항구 보수 지원으로 돌림" },
            risk: { chance: 0.25, effect: { standing: -6, log: "사사로운 청탁이라는 말이 돌아 견책받음" } } }
        ]
      },
      "해적|혁명군": {
        body: "몇 해 전 {고향}에 돌아가 이어받았던 가업은 지금 가족이 맡고 있습니다. 그런데 그 장부에 해적 돈이 섞였다는 의심으로 해군 조사관이 가족을 캐묻기 시작했다는 소식이 옵니다. 깃발 아래의 당신 이름이 가업에 그림자를 드리웠습니다.",
        choices: [
          { title: "몰래 돌아가 장부를 정리한다", desc: "가족을 지키지만 꼬리가 밟힌다",
            effect: { relationship: 5, skills: { "장사": 4 }, traits: { "용기": 1 },
                      log: "몰래 고향에 돌아가 가업 장부를 정리함" },
            risk: { chance: 0.3, effect: { bounty: "+20%", health: -6, log: "고향 항구에서 조사관에게 얼굴을 들킴" } } },
          { title: "가업에서 이름을 지운다", desc: "가족은 안전하지만 연이 끊긴다",
            effect: { relationship: -4, happiness: -5, standing: 3, traits: { "신중": 1 },
                      log: "고향 가업의 장부에서 자기 이름을 지움" } },
          { title: "조사관에게 돈을 쥐여 준다", desc: "빨리 끝나지만 약점을 잡힌다",
            effect: { money: -200000, relationship: 3, traits: { "야심": 1 },
                      log: "고향 가업을 조사하던 해군에게 뒷돈을 줌" },
            risk: { chance: 0.25, effect: { money: -150000, log: "조사관이 해마다 뒷돈을 더 요구함" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 국을 받아먹던 포로 (f_cb_fed_captive ← cb_hobby_cooking, 해적|혁명군) ──
  {
    key: "cb2_fed_captive",
    flags: ["f_cb_fed_captive"],
    after: 6,
    when: { minAge: 22, maxAge: 70 },
    title: "국 한 그릇의 값",
    body: "{여기}에서 차린 작은 밥집에 낯선 사내가 앉아 국을 한 숟갈 뜨더니 웃습니다. 몇 해 전 사흘을 굶다 당신이 떠 준 국을 받아먹던 그 포로입니다. 지금은 큰 상선의 선주가 되었다며, 이 국을 배에 대 달라고 계약서를 내밉니다.",
    choices: [
      { title: "납품 계약을 맺는다", desc: "돈은 되지만 몸이 녹초가 된다",
        effect: { money: 200000, health: -5, traits: { "야심": 1 },
                  log: "옛 포로였던 선주와 국 납품 계약을 맺음" },
        risk: { chance: 0.2, effect: { health: -5, log: "밤새 솥을 지키다 몸살로 쓰러짐" } } },
      { title: "국 끓이는 법을 나눠 준다", desc: "인연은 깊어지지만 돈은 안 된다",
        effect: { relationship: 5, skills: { "요리": 4 }, money: -20000, traits: { "선량": 1 },
                  memory: "선주와 함께 저은 국솥", log: "옛 포로에게 국 끓이는 법을 가르쳐 줌" } },
      { title: "옛 얼굴이라 거절한다", desc: "과거는 묻히지만 기회를 놓친다",
        effect: { reputation: 4, relationship: -4, traits: { "신중": 1 },
                  log: "해적 시절을 아는 선주의 제안을 거절함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "적선과 뱃전을 맞댄 순간, 상대 갑판장이 칼을 거두며 외칩니다. 몇 해 전 당신 배에서 사흘을 굶다 당신이 떠 준 국을 받아먹던 그 포로입니다. 그는 국 한 그릇 값이라며 휴전하고 전리품을 반씩 나누자고 합니다.",
        choices: [
          { title: "휴전을 받아들인다", desc: "피는 안 보지만 동료가 약하다 한다",
            effect: { relationship: 5, money: 150000, standing: -4, traits: { "선량": 1 },
                      memory: "칼 대신 나눈 전리품", log: "국을 먹였던 옛 포로와 휴전하고 전리품을 나눔" } },
          { title: "휴전의 틈을 노려 친다", desc: "다 가지지만 은혜를 칼로 갚는다",
            effect: { standing: 7, bounty: "+20%", relationship: -6, traits: { "야심": 1 },
                      log: "휴전을 청한 옛 포로의 배를 기습함" },
            risk: { chance: 0.3, effect: { health: -10, log: "옛 포로의 반격에 크게 다침" } } },
          { title: "그를 우리 배로 부른다", desc: "사람을 얻지만 그쪽과 척을 진다",
            effect: { relationship: 6, standing: 3, traits: { "용기": 1 },
                      log: "옛 포로 갑판장을 자기 배로 데려옴" },
            risk: { chance: 0.3, effect: { health: -8, log: "갑판장을 빼앗긴 선장이 쫓아와 칼을 섞음" } } }
        ]
      },
      "해군": {
        body: "붙잡아 온 해적들 가운데 하나가 당신 얼굴을 보고 웃습니다. 몇 해 전 깃발 아래 시절의 당신이 떠 준 국을 받아먹던 그 포로입니다. 그는 당신이 해적이었던 것을 아는 사람은 자기뿐이라며, 국 한 그릇만 다시 달라고 합니다.",
        choices: [
          { title: "국을 떠 주고 입을 막는다", desc: "옛정을 지키지만 약점이 남는다",
            effect: { relationship: 4, happiness: 3, traits: { "선량": 1 },
                      memory: "감옥 창살 너머의 국그릇", log: "옛 포로에게 다시 국을 떠 주며 입을 막음" },
            risk: { chance: 0.3, effect: { standing: -8, log: "옛 포로가 당신 과거를 심문관에게 흘림" } } },
          { title: "규정대로 심문한다", desc: "원칙대로지만 과거가 튀어나올 수 있다",
            effect: { standing: 5, happiness: -5, traits: { "신중": 1 },
                      log: "국을 먹였던 옛 포로를 규정대로 심문함" },
            risk: { chance: 0.3, effect: { reputation: -6, log: "옛 포로가 심문 중 당신의 해적 시절을 폭로함" } } },
          { title: "이감 길에 몰래 풀어 준다", desc: "빚을 갚지만 들키면 끝이다",
            effect: { happiness: 4, relationship: 3, traits: { "용기": 1 },
                      log: "이감되는 옛 포로를 몰래 풀어 줌" },
            risk: { chance: 0.35, effect: { standing: -8, reputation: -5, log: "포로를 놓친 책임으로 징계받음" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 배에 머문 굽은 날개 갈매기 (f_cb_gull_mascot ← cb_kid_saved_gull, 기본) ──
  {
    key: "cb2_gull_mascot",
    flags: ["f_cb_gull_mascot"],
    after: 5,
    when: { minAge: 21, maxAge: 60 },
    title: "새끼를 데려온 갈매기",
    body: "모이를 던져 배에 머물게 했던 굽은 날개의 갈매기가 봄이 되자 새끼 셋을 데리고 돌아옵니다. 늙은 갈매기는 이제 멀리 날지 못하고, 새끼들 울음소리에 선원들은 잠을 설칩니다. 다음 항구까지는 아직 길이 멉니다.",
    choices: [
      { title: "갑판에 둥지 자리를 만든다", desc: "배가 북적이지만 품과 돈이 든다",
        effect: { happiness: 6, skills: { "제작": 3 }, money: -30000, traits: { "선량": 1 },
                  memory: "돛대 아래의 갈매기 둥지", log: "굽은 날개 갈매기 가족에게 갑판 둥지를 만들어 줌" } },
      { title: "가까운 섬에 내려 준다", desc: "항해는 편해지지만 이별이 쓰리다",
        effect: { happiness: -5, health: 4, skills: { "항해술": 3 }, traits: { "신중": 1 }, memory: "섬에 내려 준 갈매기 가족",
                  log: "굽은 날개 갈매기와 새끼들을 가까운 섬에 내려 줌" } },
      { title: "새끼들을 전령으로 길들인다", desc: "쓸모 있지만 바다가 새끼를 앗는다",
        effect: { skills: { "항해술": 5 }, relationship: 2, traits: { "용기": 1 },
                  log: "갈매기 새끼들을 섬 사이 전령으로 길들임" },
        risk: { chance: 0.25, effect: { happiness: -6, log: "새끼 하나가 폭풍 속에서 돌아오지 않음" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "새로 나온 당신의 수배서 아래쪽에 한 줄이 붙었습니다. \"굽은 날개 갈매기가 따라다니는 배.\" 모이를 던져 배에 머물게 했던 그 갈매기가 이제 해군이 당신 배를 알아보는 표식이 된 것입니다. 갈매기는 오늘도 돛대 꼭대기에서 웁니다.",
        choices: [
          { title: "갈매기를 멀리 날려 보낸다", desc: "흔적은 지우지만 식구를 잃는다",
            effect: { happiness: -8, standing: 3, traits: { "신중": 1 },
                      memory: "멀어지는 굽은 날개", log: "표식이 된 굽은 날개 갈매기를 날려 보냄" } },
          { title: "그대로 배에 둔다", desc: "식구는 지키지만 쉽게 들킨다",
            effect: { relationship: 4, happiness: 4, traits: { "용기": 1 },
                      log: "수배서에 실린 갈매기를 그대로 배에 둠" },
            risk: { chance: 0.3, effect: { health: -10, bounty: "+10%", log: "갈매기를 알아본 순찰선과 교전함" } } },
          { title: "갈매기를 깃발에 그려 넣는다", desc: "이름이 퍼지지만 표적도 커진다",
            effect: { standing: 6, bounty: "+20%", relationship: -2, traits: { "야심": 1 },
                      log: "굽은 날개 갈매기를 해적 깃발에 그려 넣음" } }
        ]
      },
      "해군": {
        body: "함선에 머물게 한 굽은 날개의 갈매기가 이제 수병들의 마스코트가 되었습니다. 그런데 본부에서 전령 갈매기 부대를 꾸린다며, 사람을 잘 따르는 이 갈매기를 징발하겠다는 명령서가 내려옵니다. 갈매기는 당신 어깨에서 고개를 갸웃합니다.",
        choices: [
          { title: "명령대로 내준다", desc: "공은 서지만 함선이 쓸쓸해진다",
            effect: { standing: 5, happiness: -6, traits: { "신중": 1 },
                      log: "굽은 날개 갈매기를 전령 부대에 내줌" } },
          { title: "늙었다며 몰래 감춘다", desc: "식구를 지키지만 거짓 보고다",
            effect: { happiness: 5, relationship: 3, traits: { "선량": 1 },
                      memory: "선실에 숨긴 갈매기", log: "징발 명령을 피해 갈매기를 선실에 감춤" },
            risk: { chance: 0.3, effect: { standing: -6, log: "감춘 갈매기가 감찰에 들켜 견책받음" } } },
          { title: "직접 정찰조로 길들인다", desc: "곁에 두지만 위험한 일에 쓴다",
            effect: { standing: 4, skills: { "항해술": 4 }, traits: { "용기": 1 },
                      log: "굽은 날개 갈매기를 함선 정찰조로 길들임" },
            risk: { chance: 0.25, effect: { happiness: -6, log: "정찰 나간 갈매기가 총소리에 다쳐 돌아옴" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 약속한 자리 (f_cb_happy_promised_seat ← cb_goal_happy, 기본) ──
  {
    key: "cb2_happy_promised_seat",
    flags: ["f_cb_happy_promised_seat"],
    after: 7,
    when: { minAge: 27, maxAge: 70 },
    title: "돌아온 옛 친구",
    body: "몇 해 전 부두에서 언제든 돌아올 자리를 약속했던 {단짝|이} 정말로 돌아옵니다. 신문에 이름이 오르던 그는 배를 잃고 다리를 절며, 뒤로는 빚쟁이들이 따라붙었습니다. \"그때 그 말, 아직 유효하지?\" 그가 겸연쩍게 웃습니다.",
    choices: [
      { title: "빚을 대신 갚아 준다", desc: "약속을 지키지만 큰돈이 든다",
        effect: { money: -300000, relationship: 7, traits: { "선량": 1 },
                  memory: "다시 채워진 식탁 자리", log: "돌아온 옛 친구의 빚을 대신 갚아 줌" } },
      { title: "빚쟁이들과 담판을 짓는다", desc: "돈은 아끼지만 몸이 다칠 수 있다",
        effect: { relationship: 5, combat: 3, traits: { "용기": 1 },
                  log: "옛 친구를 쫓던 빚쟁이들과 담판을 지음" },
        risk: { chance: 0.35, effect: { health: -10, log: "빚쟁이들과 주먹다짐 끝에 다침" } } },
      { title: "방만 내주고 빚은 그에게 둔다", desc: "선은 지키지만 친구가 서운해한다",
        effect: { relationship: 2, happiness: -3, traits: { "신중": 1 },
                  log: "옛 친구에게 방만 내주고 빚은 맡기지 않음" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 부두에서 돌아올 자리를 약속했던 당신이 지금은 깃발 아래 있습니다. 그런데 큰 해적단에서 버림받은 {단짝|이} 그 약속 하나를 믿고 당신 배를 찾아왔습니다. 그의 뒤를 쫓는 옛 선장의 배가 수평선에 보입니다.",
        choices: [
          { title: "약속대로 배에 태운다", desc: "친구를 얻지만 추격이 붙는다",
            effect: { relationship: 6, bounty: "+20%", traits: { "선량": 1 },
                      memory: "약속대로 내준 갑판 자리", log: "약속대로 옛 친구를 배에 태움" },
            risk: { chance: 0.3, effect: { health: -10, log: "옛 친구를 쫓던 선장과 교전함" } } },
          { title: "섬에 숨겨 주고 떠난다", desc: "친구는 살지만 약속은 반쪽이다",
            effect: { money: -150000, relationship: 2, happiness: 3, traits: { "신중": 1 }, memory: "외딴 섬의 숨은 오두막",
                      log: "옛 친구를 외딴 섬에 숨겨 주고 떠남" } },
          { title: "말단 자리부터 주겠다 한다", desc: "규율은 서지만 친구가 상처받는다",
            effect: { standing: 5, relationship: -4, traits: { "야심": 1 },
                      log: "옛 친구에게 약속 대신 말단 선원 자리를 줌" } }
        ]
      },
      "해군": {
        body: "새로 잡혀 온 해적들 사이에 {단짝|이} 있습니다. 몇 해 전 부두에서 당신이 언제든 돌아올 자리를 약속했던 그 친구입니다. 그는 창살 너머로 쓴웃음을 짓습니다. \"돌아올 자리가 여기일 줄은 몰랐네.\"",
        choices: [
          { title: "이감 길에 몰래 놓아준다", desc: "약속은 지키지만 들키면 끝이다",
            effect: { relationship: 6, happiness: 3, traits: { "용기": 1 },
                      log: "약속을 지키려 옛 친구를 이감 길에 놓아줌" },
            risk: { chance: 0.35, effect: { standing: -8, reputation: -5, log: "죄수를 놓아준 일이 들통나 징계받음" } } },
          { title: "재판에서 정상을 증언한다", desc: "떳떳하게 돕지만 경력에 흠이 간다",
            effect: { relationship: 5, standing: -5, traits: { "선량": 1 },
                      memory: "법정에서 부른 친구 이름", log: "옛 친구의 재판에서 선처를 증언함" } },
          { title: "규정대로 압송한다", desc: "흠은 없지만 약속이 깨진다",
            effect: { standing: 6, happiness: -8, traits: { "신중": 1 },
                      log: "약속했던 옛 친구를 규정대로 압송함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 눌러앉아 본 섬마을 (f_cb_happy_settle_try ← cb_goal_happy, 해적|혁명군) ──
  {
    key: "cb2_happy_settle_try",
    flags: ["f_cb_happy_settle_try"],
    after: 6,
    when: { minAge: 26, maxAge: 70 },
    title: "섬마을 술집의 사냥꾼",
    body: "몇 해 전 깃발을 내리고 눌러앉은 섬마을 생활이 겨우 몸에 붙을 무렵, 낡은 수배서를 든 현상금 사냥꾼이 마을 술집에 앉습니다. 그때 빈집 열쇠를 건네준 가게 주인이 술을 따르다 말고 당신에게 뒷문 쪽으로 눈짓을 합니다.",
    choices: [
      { title: "뒷문으로 마을을 떠난다", desc: "몸은 살지만 꿈의 집을 잃는다",
        effect: { happiness: -8, skills: { "항해술": 2 }, traits: { "신중": 1 },
                  memory: "두고 온 빈집 열쇠", log: "사냥꾼을 피해 정든 섬마을을 떠남" } },
      { title: "사냥꾼과 마주 앉는다", desc: "지킬 수 있지만 피를 볼 수 있다",
        effect: { combat: 4, happiness: 4, traits: { "용기": 1 },
                  log: "섬마을 술집에서 현상금 사냥꾼과 담판을 지음" },
        risk: { chance: 0.35, effect: { health: -12, log: "사냥꾼과 칼을 섞다 크게 다침" } } },
      { title: "마을 사람들 손에 맡긴다", desc: "정은 깊어지지만 마을이 위험해진다",
        effect: { relationship: 6, traits: { "선량": 1 },
                  log: "마을 사람들이 사냥꾼 몰래 당신을 숨겨 줌" },
        risk: { chance: 0.3, effect: { relationship: -6, happiness: -5, log: "당신을 숨긴 가게 주인이 사냥꾼에게 맞음" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 섬마을에 눌러앉으려다 다시 바다로 쫓겨난 뒤에도, 당신은 그 빈집 열쇠를 목에 걸고 다닙니다. 오늘 그 마을 가게 주인의 편지가 닿습니다. 다른 해적들이 마을을 털어 가고 있고, 빈집은 아직 당신을 위해 비워 두었다고 합니다.",
        choices: [
          { title: "이번엔 정말 깃발을 내린다", desc: "꿈에 닿지만 동료를 떠난다",
            effect: { happiness: 10, standing: -8, relationship: -4, traits: { "신중": 1 },
                      memory: "다시 연 빈집의 문", log: "깃발을 내리고 다시 섬마을 빈집으로 돌아감" },
            risk: { chance: 0.25, effect: { health: -8, log: "옛 추적대가 다시 마을을 찾아옴" } } },
          { title: "마을을 털던 해적을 몰아낸다", desc: "마을을 지키지만 피를 본다",
            effect: { combat: 5, relationship: 5, bounty: "+15%", traits: { "용기": 1 },
                      log: "섬마을을 털던 해적들을 몰아냄" },
            risk: { chance: 0.3, effect: { health: -10, log: "해적들과 싸우다 다리를 다침" } } },
          { title: "열쇠를 돌려보낸다", desc: "미련은 끊지만 마음이 빈다",
            effect: { happiness: -6, standing: 4, traits: { "야심": 1 },
                      log: "섬마을 빈집 열쇠를 편지와 함께 돌려보냄" } }
        ]
      },
      "해군": {
        body: "제복을 입고 순찰을 돌다 닻을 내린 곳이, 몇 해 전 깃발을 내리고 눌러앉아 보려 했던 그 섬마을입니다. 빈집 열쇠를 건네던 가게 주인이 당신을 알아보고 굳은 얼굴로 섭니다. 부하들은 이 마을에 해적이 숨어든다는 제보를 들고 왔습니다.",
        choices: [
          { title: "주인에게 먼저 인사한다", desc: "정을 잇지만 부하들이 의아해한다",
            effect: { relationship: 5, standing: -3, traits: { "선량": 1 },
                      memory: "다시 마주한 가게 등불", log: "옛 섬마을 가게 주인에게 제복 차림으로 인사함" } },
          { title: "제보대로 마을을 수색한다", desc: "공은 서지만 옛 은인을 뒤진다",
            effect: { standing: 6, relationship: -5, happiness: -3, traits: { "야심": 1 },
                      log: "옛 섬마을을 제보대로 샅샅이 수색함" } },
          { title: "이 마을 순찰을 자청한다", desc: "마을은 든든하지만 출세는 늦다",
            effect: { happiness: 6, standing: -4, traits: { "신중": 1 },
                      log: "옛 섬마을을 맡아 지키는 순찰 근무를 자청함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 항구의 눈 (f_cb_harbor_informant ← cb_kid_reported_ship, 기본) ──
  {
    key: "cb2_harbor_informant",
    flags: ["f_cb_harbor_informant"],
    after: 6,
    when: { minAge: 24, maxAge: 70 },
    title: "늙은 장교의 마지막 부탁",
    body: "항구의 눈 노릇을 한 지 몇 해, 머리가 센 해군 장교가 은퇴를 앞두고 마지막 부탁을 합니다. 오늘 들어온 배의 선원 명단을 살펴 달라는 것인데, 그 명단에 {단짝}의 이름이 있습니다. 어릴 적 해적선 신고로 등을 돌렸던 동네 친구들 가운데 하나입니다.",
    choices: [
      { title: "장교에게 그대로 알린다", desc: "사례는 크지만 친구를 또 판다",
        effect: { money: 150000, relationship: -7, traits: { "야심": 1 },
                  log: "옛 친구가 탄 배를 은퇴하는 장교에게 알림" } },
      { title: "친구에게 먼저 귀띔한다", desc: "친구를 지키지만 이중 노릇이다",
        effect: { relationship: 6, happiness: 3, traits: { "선량": 1 },
                  memory: "새벽 부두의 귓속말", log: "장교보다 먼저 옛 친구에게 귀띔함" },
        risk: { chance: 0.3, effect: { reputation: -8, log: "이중 노릇이 들통나 장교의 신임을 잃음" } } },
      { title: "정보원 노릇을 그만둔다", desc: "홀가분하지만 해군 눈 밖에 난다",
        effect: { happiness: 5, reputation: -4, money: -30000, traits: { "신중": 1 },
                  log: "명단을 돌려주고 항구 정보원 노릇을 그만둠" } }
    ],
    by: {
      "해적|혁명군": {
        body: "당신 배를 쫓던 해군 함선에서 머리가 센 장교가 백기를 들고 건너옵니다. 몇 해 전 {고향} 항구에서 당신을 정보원으로 부리던 바로 그 장교입니다. 그는 항구의 눈 노릇을 다시 하면 이번 추격은 없던 일로 하겠다고 낮게 말합니다.",
        choices: [
          { title: "이중첩자 제안을 받는다", desc: "추격은 멎지만 동료를 속인다",
            effect: { money: 200000, standing: -3, traits: { "야심": 1 },
                      log: "옛 장교의 제안으로 해군에 정보를 흘리기로 함" },
            risk: { chance: 0.35, effect: { health: -12, relationship: -6, log: "이중첩자 노릇이 동료들에게 들킴" } } },
          { title: "동료들에게 옛일을 털어놓는다", desc: "믿음을 얻지만 추격은 계속된다",
            effect: { relationship: 5, happiness: 3, traits: { "용기": 1 },
                      memory: "갑판에서 털어놓은 옛일", log: "항구 정보원이던 과거를 동료들에게 털어놓음" },
            risk: { chance: 0.3, effect: { health: -10, log: "제안을 거절한 뒤 해군의 포격을 받음" } } },
          { title: "항로를 바꿔 멀리 달아난다", desc: "피하지만 비싼 길을 돈다",
            effect: { skills: { "항해술": 4 }, money: -60000, traits: { "신중": 1 },
                      log: "옛 장교를 피해 먼 바닷길로 돌아감" } }
        ]
      },
      "해군": {
        body: "제복을 입은 당신 앞에 정보원 시절 당신을 부리던 머리 센 장교의 추천장이 놓입니다. 항구의 눈 노릇을 하던 기록을 근거로 정보 부서에 끌어 주겠다는 것입니다. 하지만 {고향} 항구의 옛 이웃들은 아직도 당신을 밀고자라 부릅니다.",
        choices: [
          { title: "정보 부서로 옮긴다", desc: "출셋길이지만 이웃이 더 멀어진다",
            effect: { standing: 7, relationship: -5, traits: { "야심": 1 },
                      log: "정보원 시절 기록으로 정보 부서에 들어감" } },
          { title: "고향 항구 근무를 자청한다", desc: "이웃과 화해하지만 진급은 늦다",
            effect: { relationship: 5, standing: -4, traits: { "선량": 1 },
                      memory: "고향 항구의 늦은 화해", log: "고향 항구 근무를 자청해 옛 이웃들과 화해함" } },
          { title: "정보원 기록을 지워 달라 한다", desc: "과거를 덮지만 상관이 서운해한다",
            effect: { happiness: 4, standing: -3, traits: { "신중": 1 },
                      log: "항구 정보원 시절 기록을 폐기해 달라 청함" } }
        ]
      },
      "*": {}
    }
  },

]);

CB([
  // ── 섬 상인 거래망의 끝 (f_cb_island_trade ← cb_dream_merchant 해적|혁명군) ──
  {
    key: "cb2_island_trade",
    flags: ["f_cb_island_trade"],
    after: 6,
    when: { minAge: 24, maxAge: 65 },
    title: "거래망의 마지막 장부",
    body: "몇 해 전 노획물을 처분하며 섬 상인들과 터 두었던 은밀한 거래망의 늙은 여주인이 {여기}의 당신 집을 찾아옵니다. 그녀는 이제 장사를 접으려 한다며, 거래망을 양지로 끌어내든 통째로 맡든 당신이 정하라고 합니다. 그 장부에는 아직 갚지 못한 신세와 위험한 이름들이 함께 적혀 있습니다.",
    choices: [
      { title: "거래망을 통째로 맡는다", desc: "큰돈이 오가지만 뒤가 구리다",
        effect: { money: 250000, reputation: -5, traits: { "야심": 1 },
                  log: "섬 상인들의 은밀한 거래망을 통째로 넘겨받음" },
        risk: { chance: 0.3, effect: { reputation: -6, happiness: -3, log: "거래망의 옛 장물이 드러나 조사를 받음" } } },
      { title: "정식 상단으로 바꿔 세운다", desc: "떳떳해지지만 밑천이 든다",
        effect: { skills: { "장사": 6 }, relationship: 5, money: -120000, traits: { "선량": 1 },
                  memory: "새로 단 상단 간판", log: "섬 상인들의 거래망을 정식 상단으로 바꿔 세움" } },
      { title: "장부를 태우고 손을 뗀다", desc: "홀가분하지만 인연이 끊긴다",
        effect: { happiness: -4, relationship: -4, health: 3, traits: { "신중": 1 },
                  log: "섬 상인들의 장부를 태우고 거래에서 손을 뗌" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 노획물을 처분하며 터 두었던 섬 상인들의 거래망에 해군의 손이 닿았습니다. 창고 셋이 압수되고, 늙은 여주인은 해군 지부 창고에 화물과 함께 갇혔다는 전갈이 옵니다. 그녀는 당신 배의 보급을 한 번도 거른 적이 없었습니다.",
        choices: [
          { title: "지부 창고를 털어 되찾는다", desc: "의리는 지키지만 해군이 노한다",
            effect: { standing: 6, bounty: "+20%", relationship: 4, traits: { "용기": 1 },
                      log: "해군 지부 창고를 털어 섬 상인들의 화물을 되찾음" },
            risk: { chance: 0.35, effect: { health: -12, log: "창고 습격 중 경비병의 총탄에 맞음" } } },
          { title: "남은 거래망을 사들인다", desc: "길은 내 것이 되지만 비싸다",
            effect: { money: -200000, skills: { "장사": 6 }, standing: 3, traits: { "야심": 1 },
                      log: "무너진 섬 상인 거래망의 남은 몫을 사들임" } },
          { title: "흔적을 지우고 항로를 바꾼다", desc: "안전하지만 그녀를 버린다",
            effect: { happiness: -6, relationship: -5, traits: { "신중": 1 },
                      log: "섬 상인들과의 흔적을 지우고 항로를 바꿈" } }
        ]
      },
      "해군": {
        body: "밀수 수사 서류철을 넘기던 당신의 손이 멈춥니다. 몇 해 전 노획물을 처분하며 당신이 직접 터 두었던 섬 상인들의 거래망이 거기 그려져 있습니다. 내일 새벽 일제 단속이 잡혀 있고, 명단 맨 위에는 당신을 기억할 늙은 여주인의 이름이 있습니다.",
        choices: [
          { title: "단속 전에 몰래 알린다", desc: "옛 인연을 살리지만 들킬 수 있다",
            effect: { relationship: 5, standing: -4, traits: { "선량": 1 },
                      log: "일제 단속 전에 섬 상인들에게 몰래 알림" },
            risk: { chance: 0.3, effect: { standing: -6, reputation: -5, log: "단속 정보 유출을 의심받아 조사받음" } } },
          { title: "단속을 앞장서 지휘한다", desc: "공은 크지만 옛 얼굴과 마주친다",
            effect: { standing: 8, happiness: -6, traits: { "야심": 1 },
                      log: "자신이 터 둔 섬 상인 거래망의 단속을 지휘함" } },
          { title: "내 흔적만 서류에서 뺀다", desc: "경력은 지키지만 돈이 든다",
            effect: { money: -100000, happiness: -3, traits: { "신중": 1 },
                      log: "수사 서류에서 자신의 옛 흔적만 지움" } }
        ]
      },
      "*": {}
    }
  },

  // ── 지운 이름의 값 (f_cb_ledger_cleared ← cb_kid_pirate_odd_job 기본) ──
  {
    key: "cb2_ledger_cleared",
    flags: ["f_cb_ledger_cleared"],
    after: 6,
    when: { minAge: 26, maxAge: 65 },
    title: "다시 펼친 밀수 장부",
    body: "몇 해 전 돈을 치르고 밀수 장부에서 지운 당신의 이름이, 칼로 긁어낸 자국째로 다시 당신 앞에 펼쳐집니다. 그 낯선 상인이 찾아와 긁힌 줄을 손톱으로 두드립니다. \"지운 줄은 다시 쓸 수도 있지.\" 이번에는 값이 두 배라고 합니다.",
    choices: [
      { title: "장부째 해군에 넘긴다", desc: "끝을 내지만 과거가 알려진다",
        effect: { standing: 5, reputation: -5, happiness: 4, traits: { "용기": 1 },
                  log: "협박하던 상인의 밀수 장부를 해군에 넘김" },
        risk: { chance: 0.3, effect: { health: -8, log: "밀수 상인의 패거리에게 보복을 당함" } } },
      { title: "한 번 더 값을 치른다", desc: "조용하지만 또 올지 모른다",
        effect: { money: -150000, happiness: -4, traits: { "신중": 1 },
                  log: "밀수 상인에게 한 번 더 입막음 값을 치름" } },
      { title: "그의 약점을 캐서 맞선다", desc: "판을 뒤집지만 원한이 남는다",
        effect: { money: 80000, knowledge: 2, relationship: -5, traits: { "야심": 1 },
                  log: "밀수 상인의 약점을 캐내 거꾸로 돈을 받아 냄" },
        risk: { chance: 0.25, effect: { reputation: -8, log: "앙심을 품은 상인이 옛일을 퍼뜨림" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 돈을 치르고 밀수 장부에서 지웠던 당신의 이름이 다시 문제가 됩니다. 그 상인이 해군에 붙잡혔는데, 긁어내기 전의 그 장을 몰래 베껴 두었다고 합니다. 감옥에서 그는 사본을 당신과 해군 가운데 더 비싸게 사는 쪽에 넘기겠다는 전갈을 보내옵니다.",
        choices: [
          { title: "감옥선을 들이쳐 사본을 뺏는다", desc: "끝을 내지만 이름이 오른다",
            effect: { standing: 6, bounty: "+20%", health: -4, traits: { "용기": 1 },
                      log: "감옥선을 들이쳐 밀수 장부 사본을 빼앗음" },
            risk: { chance: 0.3, effect: { health: -12, log: "감옥선 경비대의 포격에 맞음" } } },
          { title: "옥중 상인에게 값을 치른다", desc: "조용하지만 돈이 크게 든다",
            effect: { money: -200000, happiness: 3, traits: { "신중": 1 },
                      log: "옥중의 밀수 상인에게 값을 치르고 사본을 받음" } },
          { title: "사본이 팔리게 내버려 둔다", desc: "악명은 늘지만 고향이 시끄럽다",
            effect: { standing: 4, bounty: "+15%", relationship: -5, traits: { "야심": 1 },
                      log: "어린 시절 밀수 기록이 해군 손에 넘어가게 둠" },
            risk: { chance: 0.25, effect: { happiness: -6, log: "고향 가족이 해군 조사를 받았다는 소식을 들음" } } }
        ]
      },
      "해군": {
        body: "밀수 조직 사건이 당신 책상에 올라옵니다. 압수된 장부 한 장에 칼로 긁어낸 자국이 있고, 몇 해 전 당신이 돈을 치르고 지운 바로 그 줄입니다. 함께 일하는 감찰관이 긁힌 줄을 등불에 비춰 보며 누구 이름이었을지 궁금해합니다.",
        choices: [
          { title: "내 이름이었다고 밝힌다", desc: "떳떳하지만 경력에 흠이 간다",
            effect: { standing: -5, happiness: 6, traits: { "용기": 1 },
                      log: "긁힌 장부의 줄이 자기 이름이었다고 밝힘" },
            risk: { chance: 0.3, effect: { standing: -6, log: "옛 밀수 연루로 승진 심사에서 빠짐" } } },
          { title: "상인을 직접 잡아들인다", desc: "공을 세우지만 그가 입을 열 수 있다",
            effect: { standing: 6, health: -4, traits: { "신중": 1 },
                      log: "이름을 지워 주었던 밀수 상인을 직접 체포함" },
            risk: { chance: 0.25, effect: { reputation: -6, log: "붙잡힌 상인이 심문에서 옛일을 떠벌림" } } },
          { title: "감찰관의 눈을 딴 줄로 돌린다", desc: "덮을 수 있지만 들키면 끝이다",
            effect: { standing: 4, happiness: -5, traits: { "야심": 1 },
                      log: "감찰관의 관심을 다른 이름으로 돌림" },
            risk: { chance: 0.3, effect: { standing: -8, reputation: -5, log: "수사 방해가 드러나 징계받음" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 풀어 준 동기의 답례 (f_cb_martial_freed ← cb_train_martial 해군) ──
  {
    key: "cb2_martial_freed",
    flags: ["f_cb_martial_freed"],
    after: 6,
    when: { minAge: 24, maxAge: 60 },
    title: "열어 둔 감방의 답례",
    body: "몇 해 전 밤새 감방 문을 잠그지 않아 달아나게 했던 도장 동기가 {여기}의 당신 집 문을 두드립니다. 그는 해적 일을 접었다며 베리가 든 묵직한 주머니를 내밉니다. \"그 문값이야.\" 주머니에서는 바닷소금과 화약 냄새가 함께 납니다.",
    choices: [
      { title: "주머니를 받아 둔다", desc: "돈은 되지만 해적 돈이다",
        effect: { money: 200000, reputation: -5, traits: { "야심": 1 },
                  log: "풀어 주었던 동기가 가져온 해적 돈을 받음" },
        risk: { chance: 0.25, effect: { happiness: -6, log: "해적 돈을 받았다는 소문에 해군 조사를 받음" } } },
      { title: "돈 대신 대련을 청한다", desc: "옛 승부를 끝내지만 몸이 상한다",
        effect: { skills: { "무투술": 5 }, health: -6, traits: { "용기": 1 },
                  memory: "마당에서 끝낸 옛 승부", log: "돈 대신 풀어 준 동기와 마지막 대련을 함" } },
      { title: "그 돈을 마을 도장에 넘긴다", desc: "마음은 놓이지만 손엔 남지 않는다",
        effect: { relationship: 5, happiness: 3, traits: { "선량": 1 },
                  log: "동기가 가져온 돈을 마을 도장에 넘김" } }
    ],
    by: {
      "해군": {
        body: "{여기} 앞바다에서 당신의 순찰정이 해적선 세 척에 둘러싸입니다. 몇 해 전 당신이 감방 문을 잠그지 않아 달아났던 도장 동기가 기함 뱃머리에서 손을 들어 포격을 멈춥니다. \"봉쇄선만 열어 주면 네 부하들은 털끝 하나 안 건드리지.\"",
        choices: [
          { title: "봉쇄선을 열어 준다", desc: "부하를 살리지만 군법을 어긴다",
            effect: { relationship: 5, standing: -6, traits: { "선량": 1 },
                      log: "풀어 주었던 동기의 해적선에 봉쇄선을 열어 줌" },
            risk: { chance: 0.3, effect: { standing: -6, reputation: -5, log: "봉쇄선을 연 일이 들통나 징계받음" } } },
          { title: "그를 붙잡아 빚을 끝낸다", desc: "큰 공이지만 은혜를 칼로 갚는다",
            effect: { standing: 8, happiness: -6, traits: { "야심": 1 },
                      log: "봉쇄선 앞에서 해적이 된 동기를 붙잡음" },
            risk: { chance: 0.3, effect: { health: -10, log: "동기의 부하들과 난전 끝에 다침" } } },
          { title: "맨손 승부로 길을 정한다", desc: "명예는 지키지만 몸이 상한다",
            effect: { skills: { "무투술": 5 }, health: -6, traits: { "용기": 1 },
                      memory: "갑판 위의 마지막 대련", log: "뱃머리에서 동기와 맨손으로 길을 걸고 싸움" } }
        ]
      },
      "해적|혁명군": {
        body: "{여기} 항구에 이름난 해적 선단이 들어오고, 그 선장이 당신을 찾습니다. 몇 해 전 당신이 해군 제복을 입고 감방 문을 잠그지 않아 달아나게 했던 도장 동기입니다. 그는 당신 수배서를 흔들며 웃습니다. \"이제 같은 바다네. 그 문값을 치를 때가 왔어.\"",
        choices: [
          { title: "그의 선단과 손을 잡는다", desc: "힘이 붙지만 표적도 커진다",
            effect: { standing: 6, bounty: "+20%", traits: { "야심": 1 },
                      log: "풀어 주었던 동기의 해적 선단과 동맹을 맺음" },
            risk: { chance: 0.3, effect: { health: -10, log: "동맹 소문에 몰려든 해군 함대와 교전함" } } },
          { title: "빚은 없다며 술잔만 나눈다", desc: "정은 남지만 술값이 든다",
            effect: { relationship: 5, happiness: 4, money: -30000, traits: { "선량": 1 },
                      log: "풀어 준 동기와 빚 없이 술잔만 나눔" } },
          { title: "옛 대련을 청한다", desc: "승부를 끝내지만 몸이 상한다",
            effect: { skills: { "무투술": 5 }, health: -6, traits: { "용기": 1 },
                      memory: "부둣가의 마지막 대련", log: "해적 선장이 된 동기와 옛 승부를 끝냄" } }
        ]
      },
      "*": {}
    }
  },

  // ── 빚을 갚아 준 동기의 도장 (f_cb_martial_friend ← cb_train_martial 기본) ──
  {
    key: "cb2_martial_friend",
    flags: ["f_cb_martial_friend"],
    after: 6,
    when: { minAge: 24, maxAge: 65 },
    title: "동기가 연 작은 도장",
    body: "몇 해 전 투기장 빚을 대신 갚아 주었던 도장 동기가 {여기}에 작은 도장을 열었다며 찾아옵니다. 그는 빚의 절반이 든 주머니를 내밀고, 나머지는 몸으로 갚겠다며 사범 자리를 권합니다. 그런데 도장 골목에 투기장 수금꾼이 어슬렁거린다는 말도 들립니다.",
    choices: [
      { title: "사범 자리를 맡는다", desc: "다시 땀 흘리지만 빚이 따라올까",
        effect: { skills: { "무투술": 6 }, relationship: 4, health: -4, traits: { "용기": 1 },
                  memory: "새 도장의 첫 구령", log: "동기가 연 도장에서 사범 자리를 맡음" },
        risk: { chance: 0.3, effect: { money: -100000, log: "동기가 다시 진 투기장 빚을 떠안음" } } },
      { title: "돈만 받고 선을 긋는다", desc: "돈은 돌아오지만 정은 식는다",
        effect: { money: 50000, relationship: -5, traits: { "야심": 1 },
                  log: "동기에게 빚의 절반만 받고 선을 그음" } },
      { title: "남은 빚을 없던 일로 한다", desc: "마음은 넉넉하지만 돈은 잊는다",
        effect: { relationship: 6, happiness: 3, money: -20000, traits: { "선량": 1 },
                  log: "동기의 남은 빚을 지우고 개관 축하금까지 냄" } }
    ],
    by: {
      "해군": {
        body: "기지 신병 훈련장에 맨손 교관이 필요하다는 공고가 붙던 날, 몇 해 전 투기장 빚을 대신 갚아 주었던 도장 동기가 지원서를 들고 옵니다. 그런데 같은 주에 {여기} 투기장 일당을 수사하라는 명령이 내려오고, 명단 귀퉁이에 그의 옛 이름이 있습니다.",
        choices: [
          { title: "그를 교관으로 추천한다", desc: "든든하지만 과거가 걸린다",
            effect: { relationship: 5, standing: 3, traits: { "선량": 1 },
                      log: "빚을 갚아 준 동기를 신병 교관으로 추천함" },
            risk: { chance: 0.3, effect: { standing: -6, log: "추천한 교관의 투기장 연루가 드러남" } } },
          { title: "수사에 그의 증언을 받는다", desc: "공을 세우지만 그를 이용한다",
            effect: { standing: 7, relationship: -6, traits: { "야심": 1 },
                      log: "옛 동기의 증언으로 투기장 일당을 잡음" } },
          { title: "함께 투기장을 소탕한다", desc: "통쾌하지만 피를 본다",
            effect: { combat: 5, health: -8, traits: { "용기": 1 },
                      memory: "부서진 투기장 철문", log: "옛 동기와 나란히 투기장 일당을 소탕함" } }
        ]
      },
      "해적|혁명군": {
        body: "{여기} 부두에서 몇 해 전 투기장 빚을 대신 갚아 주었던 도장 동기가 당신 배를 기다리고 있습니다. 그는 당신 수배서를 보고 빚을 주먹으로 갚으러 왔다고 합니다. 다만 그 뒤를 투기장 주인의 사내들이 멀찍이 따라오고 있습니다.",
        choices: [
          { title: "그를 배에 태운다", desc: "든든하지만 빚쟁이가 따라온다",
            effect: { relationship: 6, combat: 3, traits: { "선량": 1 },
                      log: "빚을 갚아 준 동기를 배에 태움" },
            risk: { chance: 0.3, effect: { money: -100000, log: "따라온 투기장 사내들에게 배를 털림" } } },
          { title: "빚 대신 소식통으로 쓴다", desc: "쓸모 있지만 거리를 둔다",
            effect: { knowledge: 3, standing: 3, relationship: -3, traits: { "신중": 1 },
                      log: "옛 동기를 뒷골목 소식통으로 삼음" } },
          { title: "함께 투기장 금고를 턴다", desc: "큰돈이지만 피를 본다",
            effect: { money: 200000, bounty: "+20%", health: -5, traits: { "용기": 1 },
                      log: "옛 동기와 투기장 금고를 털어 빚을 청산함" },
            risk: { chance: 0.3, effect: { health: -10, log: "투기장 경호원들과 난투 끝에 다침" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 사냥꾼이 된 동기, 다시 오다 (f_cb_martial_hunter ← cb_train_martial 해적|혁명군) ──
  {
    key: "cb2_martial_hunter",
    flags: ["f_cb_martial_hunter"],
    after: 6,
    when: { minAge: 24, maxAge: 60 },
    title: "다시 찾아온 사냥꾼",
    body: "몇 해 전 술값만 내고 빠져나왔던 그 선술집의 동기가, 현상금 사냥꾼의 옷을 벗고 {여기}의 당신 집에 나타납니다. 그는 이제 혼자 사냥하기엔 무릎이 아프다며 당신에게 동업을 권합니다. \"그때 술값, 이번엔 내가 낼게.\"",
    choices: [
      { title: "사냥 동업을 받아들인다", desc: "돈은 되지만 몸을 건다",
        effect: { money: 150000, combat: 3, health: -6, traits: { "용기": 1 },
                  log: "옛 도장 동기와 현상금 사냥 동업을 시작함" },
        risk: { chance: 0.3, effect: { health: -10, log: "첫 사냥에서 표적의 칼에 베임" } } },
      { title: "이번엔 끝까지 술잔을 비운다", desc: "정은 돌아오지만 술값이 든다",
        effect: { relationship: 6, money: -40000, traits: { "선량": 1 },
                  memory: "새벽까지 비운 술잔", log: "사냥꾼이었던 동기와 새벽까지 술을 마심" } },
      { title: "이삿짐을 꾸린다", desc: "엮이지 않지만 터전을 잃는다",
        effect: { money: -80000, happiness: -4, health: 2, traits: { "신중": 1 },
                  log: "옛 동기를 피해 조용히 이사함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 술값만 내고 빠져나왔던 그 동기가, 이번에는 {여기}의 밤 부두에서 당신 앞을 막아섭니다. 새로 붙은 당신 수배서를 쥔 그의 한쪽 다리는 눈에 띄게 절고 있습니다. \"그때 다시 온다고 했지. 이번엔 술로 안 끝나.\"",
        choices: [
          { title: "이번엔 정면으로 맞선다", desc: "끝을 보지만 목숨을 건다",
            effect: { combat: 5, standing: 5, health: -8, traits: { "용기": 1 },
                      log: "현상금 사냥꾼이 된 동기와 부두에서 결판을 냄" },
            risk: { chance: 0.35, effect: { health: -15, log: "동기의 관절기에 쓰러져 크게 다침" } } },
          { title: "그때처럼 술을 산다", desc: "피는 안 보지만 돈이 든다",
            effect: { money: -60000, knowledge: 3, happiness: 3, traits: { "신중": 1 },
                      log: "동기에게 술을 사고 다른 사냥꾼들의 소식을 들음" } },
          { title: "사냥에서 손을 떼게 돕는다", desc: "그를 건지지만 믿을 수 있을까",
            effect: { relationship: 6, money: -100000, traits: { "선량": 1 },
                      log: "동기가 사냥꾼 일을 접도록 밑천을 대 줌" },
            risk: { chance: 0.25, effect: { bounty: "+20%", relationship: -6, log: "동기가 돈만 받고 항로를 해군에 팔아넘김" } } }
        ]
      },
      "해군": {
        body: "기지 접수처에 현상금을 받으러 온 사냥꾼이 당신을 보고 웃습니다. 몇 해 전 해적이던 당신이 술값만 내고 빠져나왔던 바로 그 도장 동기입니다. 그는 목소리를 낮춥니다. \"제복이 잘 어울리네. 옛 수배서 얘기는 얼마면 묻어 줄까?\"",
        choices: [
          { title: "상관에게 과거를 털어놓는다", desc: "떳떳하지만 경력이 흔들린다",
            effect: { standing: -5, happiness: 6, traits: { "용기": 1 },
                      log: "협박을 받고 상관에게 해적 시절을 털어놓음" },
            risk: { chance: 0.3, effect: { standing: -6, log: "해적 전력 때문에 한직으로 밀려남" } } },
          { title: "입막음 값을 치른다", desc: "조용하지만 또 올지 모른다",
            effect: { money: -150000, happiness: -3, traits: { "신중": 1 },
                      log: "사냥꾼이 된 동기에게 입막음 값을 치름" } },
          { title: "그의 불법 사냥을 잡아들인다", desc: "공을 세우지만 그가 떠벌린다",
            effect: { standing: 7, relationship: -5, traits: { "야심": 1 },
                      log: "협박하던 동기를 불법 사냥 혐의로 체포함" },
            risk: { chance: 0.3, effect: { reputation: -6, log: "체포된 동기가 옛 수배 이야기를 퍼뜨림" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 다리를 묶어 준 수병 (f_cb_medic_saved_marine ← cb_train_medic 해적|혁명군) ──
  {
    key: "cb2_medic_saved_marine",
    flags: ["f_cb_medic_saved_marine"],
    after: 6,
    when: { minAge: 24, maxAge: 65 },
    title: "다리를 저는 손님",
    body: "{여기}의 당신 집에 지팡이를 짚은 퇴역 해군이 찾아옵니다. 몇 해 전 해전 뒤 모래밭에서 당신이 다리를 묶어 준 그 수병입니다. 그는 해군 병원 의무관 추천서를 내밀며, 옛 해적 시절은 자기가 모르는 일로 하겠다고 합니다.",
    choices: [
      { title: "해군 병원 일자리를 받는다", desc: "안정되지만 옛 동료가 등을 돌린다",
        effect: { money: 150000, skills: { "의술": 4 }, relationship: -4, traits: { "야심": 1 },
                  log: "구해 준 수병의 추천으로 해군 병원에 들어감" },
        risk: { chance: 0.25, effect: { happiness: -6, log: "병원에서 해적 시절이 알려져 수군거림을 들음" } } },
      { title: "그의 다리를 다시 봐 준다", desc: "마음은 닿지만 일자리는 놓친다",
        effect: { skills: { "의술": 5 }, relationship: 4, money: -20000, traits: { "선량": 1 },
                  memory: "다시 풀어 본 그 붕대", log: "추천서 대신 옛 수병의 다리를 다시 치료함" } },
      { title: "추천서를 돌려보낸다", desc: "과거를 묻지만 길 하나가 닫힌다",
        effect: { happiness: -4, health: 2, traits: { "신중": 1 },
                  log: "옛 수병의 추천서를 정중히 돌려보냄" } }
    ],
    by: {
      "해적|혁명군": {
        body: "{여기} 앞바다에서 해군 함대에 길이 막힙니다. 지휘선 갑판에서 한쪽 다리를 조금 저는 장교가 망원경을 내립니다. 몇 해 전 해전 뒤 당신이 다리를 묶어 준 그 수병입니다. 그가 보낸 작은 보트에는 \"한 번은 길을 비켜 주겠다\"는 쪽지가 실려 있습니다.",
        choices: [
          { title: "쪽지를 무시하고 돌파한다", desc: "이름은 오르지만 피를 본다",
            effect: { standing: 6, bounty: "+25%", health: -5, traits: { "용기": 1 },
                      log: "은혜를 갚겠다는 장교의 함대를 정면 돌파함" },
            risk: { chance: 0.35, effect: { health: -12, log: "돌파 중 포탄 파편에 맞음" } } },
          { title: "답장을 실어 보낸다", desc: "인연을 잇지만 그가 위험하다",
            effect: { relationship: 5, knowledge: 2, traits: { "선량": 1 },
                      log: "길을 열어 준 해군 장교에게 답장을 보냄" },
            risk: { chance: 0.25, effect: { happiness: -6, log: "답장이 가로채져 그 장교가 좌천됨" } } },
          { title: "그가 열어 준 길로 빠진다", desc: "무사하지만 등을 보인다",
            effect: { health: 3, standing: -4, happiness: -2, traits: { "신중": 1 },
                      log: "옛 수병이 열어 준 길로 조용히 빠져나감" } }
        ]
      },
      "해군": {
        body: "새 부대에 부임하자 다리를 조금 저는 상관이 당신을 따로 부릅니다. 몇 해 전 해전 뒤 모래밭에서 해적이던 당신이 다리를 묶어 준 그 수병입니다. 그는 문을 닫고 말합니다. \"네 과거는 내 다리가 안다. 그래서 묻겠다, 왜 이 제복을 입었나.\"",
        choices: [
          { title: "숨김없이 털어놓는다", desc: "믿음을 얻지만 귀가 많다",
            effect: { relationship: 6, happiness: 4, traits: { "용기": 1 },
                      log: "다리를 묶어 준 상관에게 해적 시절을 털어놓음" },
            risk: { chance: 0.3, effect: { standing: -8, log: "대화를 엿들은 장교가 과거를 문제 삼음" } } },
          { title: "그의 밑에서 묵묵히 일한다", desc: "탈은 없지만 벽이 남는다",
            effect: { standing: 5, happiness: -3, traits: { "신중": 1 },
                      log: "옛 수병이던 상관 밑에서 말없이 공을 쌓음" } },
          { title: "그 은혜를 승진으로 바꾼다", desc: "출셋길이지만 빚이 생긴다",
            effect: { standing: 8, relationship: -4, happiness: -3, traits: { "야심": 1 },
                      log: "옛 수병이던 상관의 은혜를 승진 추천으로 받음" } }
        ]
      },
      "*": {}
    }
  },

  // ── 치료받은 어린 해적의 귀환 (f_cb_medic_saved_pirate ← cb_train_medic 해군) ──
  {
    key: "cb2_medic_saved_pirate",
    flags: ["f_cb_medic_saved_pirate"],
    after: 6,
    when: { minAge: 24, maxAge: 65 },
    title: "멀쩡히 걷는 그 다리",
    body: "{여기}에 떠돌이 의사가 들어와 앓는 이웃들을 공짜로 돌봅니다. 그는 몇 해 전 당신이 명령을 미루고 다리를 치료해 준 그 어린 해적입니다. 해군 주둔소가 그를 수상히 여기자, 그는 당신에게 보증을 서 달라고 부탁합니다.",
    choices: [
      { title: "그의 보증인이 된다", desc: "이웃은 살지만 이름을 건다",
        effect: { relationship: 6, reputation: -4, traits: { "선량": 1 },
                  log: "옛 어린 해적이었던 의사의 보증인이 됨" },
        risk: { chance: 0.3, effect: { happiness: -6, log: "보증 때문에 해군 주둔소에 불려 가 조사받음" } } },
      { title: "그 곁에서 의술을 배운다", desc: "많이 배우지만 밑천이 든다",
        effect: { skills: { "의술": 6 }, money: -60000, traits: { "신중": 1 },
                  memory: "떠돌이 의사의 약상자", log: "옛 어린 해적이었던 의사 곁에서 의술을 배움" } },
      { title: "주둔소에 정체를 알린다", desc: "탈은 없지만 은혜를 판다",
        effect: { standing: 5, relationship: -6, happiness: -4, traits: { "야심": 1 },
                  log: "떠돌이 의사의 해적 전력을 주둔소에 알림" } }
    ],
    by: {
      "해군": {
        body: "폭풍에 배가 부서져 표류하던 당신의 부하들을 해적선 한 척이 건져 줍니다. 그 배의 의사는 몇 해 전 당신이 명령을 미루고 다리를 치료해 준 어린 해적이고, 이제 그 다리로 멀쩡히 갑판을 오갑니다. 사흘 뒤 함대는 이 해역의 해적선을 모두 치라는 명령을 받습니다.",
        choices: [
          { title: "위치를 모른다고 보고한다", desc: "은혜를 갚지만 들킬 수 있다",
            effect: { relationship: 5, happiness: 4, standing: -4, traits: { "선량": 1 },
                      log: "부하들을 건진 해적선의 위치를 숨김" },
            risk: { chance: 0.3, effect: { standing: -6, log: "허위 보고를 의심받아 견책을 받음" } } },
          { title: "그에게 바다를 떠나라 전한다", desc: "그를 살리려 하지만 위험하다",
            effect: { relationship: 4, knowledge: 2, traits: { "용기": 1 },
                      memory: "밤바다에 띄운 쪽지", log: "옛 어린 해적에게 토벌을 미리 알리고 떠나라 함" },
            risk: { chance: 0.3, effect: { health: -10, log: "쪽지를 전하다 해적선 선원들에게 붙잡혀 다침" } } },
          { title: "함대에 위치를 알린다", desc: "공은 크지만 은인을 넘긴다",
            effect: { standing: 8, happiness: -7, traits: { "야심": 1 },
                      log: "부하들을 건진 해적선의 위치를 함대에 알림" } }
        ]
      },
      "해적|혁명군": {
        body: "{여기} 항구에서 약상자를 멘 젊은 의사가 당신 배에 오르겠다고 찾아옵니다. 몇 해 전 해군이던 당신이 명령을 미루고 다리를 치료해 준 어린 해적입니다. 그는 멀쩡해진 다리를 탕탕 두드리며 이제 당신 배의 다리가 되겠다고 합니다.",
        choices: [
          { title: "배의 의사로 맞아들인다", desc: "든든하지만 그를 쫓는 눈이 있다",
            effect: { relationship: 6, money: -60000, traits: { "선량": 1 },
                      log: "치료해 준 어린 해적을 배의 의사로 맞아들임" },
            risk: { chance: 0.3, effect: { health: -8, log: "그를 쫓던 해군 추격대와 교전함" } } },
          { title: "그의 의술만 배워 둔다", desc: "솜씨는 늘지만 그는 떠난다",
            effect: { skills: { "의술": 6 }, happiness: -2, traits: { "신중": 1 },
                      log: "옛 어린 해적에게서 의술만 배워 둠" } },
          { title: "그 은혜값을 요구한다", desc: "주머니는 차지만 정이 식는다",
            effect: { money: 200000, relationship: -6, traits: { "야심": 1 },
                      log: "치료해 준 어린 해적에게 은혜값을 받아 냄" } }
        ]
      },
      "*": {}
    }
  },

  // ── 베껴 둔 고문서 한 장 (f_cb_navy_copied_text ← cb_dream_scholar 해군) ──
  {
    key: "cb2_navy_copied_text",
    flags: ["f_cb_navy_copied_text"],
    after: 6,
    when: { minAge: 24, maxAge: 70 },
    title: "서랍 밑의 고문서",
    body: "몇 해 전 불길 앞에서 몰래 베껴 둔 고문서 한 장이 아직 당신 집 서랍 밑판에 있습니다. 어느 밤 {여기}에 숨어 사는 늙은 학자가 찾아와, 그 글자를 한 번만 보여 달라고 머리를 숙입니다. 요즘 정부 첩보원이 금서를 찾아 집집이 문을 두드린다는 소문도 돕니다.",
    choices: [
      { title: "학자에게 사본을 건넨다", desc: "뜻을 잇지만 화가 미칠 수 있다",
        effect: { knowledge: 3, relationship: 4, traits: { "선량": 1 },
                  log: "베껴 둔 고문서를 숨어 사는 학자에게 건넴" },
        risk: { chance: 0.3, effect: { reputation: -6, log: "금서를 넘겼다는 소문이 동네에 퍼짐" } } },
      { title: "아궁이에 넣는다", desc: "안전하지만 역사가 재가 된다",
        effect: { happiness: -6, health: 2, traits: { "신중": 1 },
                  log: "몇 해 숨겨 온 고문서 사본을 불태움" } },
      { title: "몰래 해독을 이어 간다", desc: "깊이 알게 되지만 위험하다",
        effect: { knowledge: 7, health: -4, traits: { "용기": 1 },
                  memory: "등잔 아래 옛 글자", log: "베껴 둔 고문서를 밤마다 몰래 해독함" },
        risk: { chance: 0.3, effect: { reputation: -8, log: "금서를 읽는다는 밀고가 들어감" } } }
    ],
    by: {
      "해군": {
        body: "몇 해 전 불길 앞에서 몰래 베껴 둔 고문서 한 장이 아직 당신 숙소 서랍 밑판에 있습니다. 이번 주 본부 감찰단이 장교 숙소를 하나하나 뒤진다는 통지가 내려옵니다. 같은 날 항구에 숨어 사는 늙은 학자가 그 글자를 한 번만 보여 달라는 전갈을 보내옵니다.",
        choices: [
          { title: "학자에게 사본을 넘긴다", desc: "역사를 살리지만 꼬리가 밟힌다",
            effect: { knowledge: 4, relationship: 4, traits: { "선량": 1 },
                      log: "감찰 직전 고문서 사본을 숨은 학자에게 넘김" },
            risk: { chance: 0.3, effect: { standing: -8, log: "학자와 만난 일이 감찰단에 알려짐" } } },
          { title: "감찰 전에 불태운다", desc: "경력은 지키지만 다시 태운다",
            effect: { standing: 3, happiness: -6, traits: { "신중": 1 },
                      log: "감찰을 앞두고 고문서 사본을 불태움" } },
          { title: "끝까지 직접 해독한다", desc: "진실에 닿지만 목숨이 걸린다",
            effect: { knowledge: 8, health: -5, traits: { "용기": 1 },
                      memory: "숙소 등잔 아래 옛 글자", log: "감찰을 피해 가며 고문서를 끝까지 해독함" },
            risk: { chance: 0.35, effect: { standing: -10, log: "금서 소지가 들켜 군법 회의에 회부됨" } } }
        ]
      },
      "해적|혁명군": {
        body: "제복을 벗고 나올 때 품에 넣어 온 고문서 사본 한 장이 이제 바다에서 소문이 되었습니다. 몇 해 전 태우라는 명령 앞에서 당신이 몰래 베낀 그 종이입니다. {여기}에서는 숨은 학자들과 암시장 경매인이 동시에 사람을 보내오고, 정부 첩보원도 냄새를 맡았다고 합니다.",
        choices: [
          { title: "숨은 학자들에게 넘긴다", desc: "뜻을 잇지만 추적이 붙는다",
            effect: { relationship: 5, standing: 5, traits: { "선량": 1 },
                      log: "고문서 사본을 숨은 학자들에게 넘김" },
            risk: { chance: 0.3, effect: { health: -10, log: "사본을 건네다 정부 첩보원에게 쫓겨 다침" } } },
          { title: "경매에 부친다", desc: "큰돈이지만 역사는 팔린다",
            effect: { money: 400000, happiness: -5, traits: { "야심": 1 },
                      log: "고문서 사본을 암시장 경매에 부침" } },
          { title: "직접 해독에 매달린다", desc: "깊이 알지만 정부가 노린다",
            effect: { knowledge: 8, health: -6, traits: { "용기": 1 },
                      memory: "선실 등불 아래 옛 글자", log: "고문서 사본을 선실에서 직접 해독함" },
            risk: { chance: 0.3, effect: { bounty: "+30%", log: "해독 소문에 정부가 현상금을 올림" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 함께 치료한 해적 부상자 (f_cb_navy_healed_enemy ← cb_dream_doctor 해군) ──
  {
    key: "cb2_navy_healed_enemy",
    flags: ["f_cb_navy_healed_enemy"],
    after: 6,
    when: { minAge: 24, maxAge: 65 },
    title: "꿰맨 자리의 주인",
    body: "{여기}의 당신 집 앞에 낯선 뱃사람이 서 있습니다. 그가 소매를 걷자, 몇 해 전 명령을 어기고 당신이 꿰매 준 해적 부상자의 흉터가 드러납니다. 그는 사례금 주머니를 내밀지만, 아직 수배가 풀리지 않아 며칠만 숨겨 달라고 합니다.",
    choices: [
      { title: "그를 집에 숨겨 준다", desc: "은혜를 잇지만 이웃 눈이 있다",
        effect: { relationship: 5, happiness: 3, traits: { "선량": 1 },
                  log: "옛날 꿰매 준 해적을 며칠 집에 숨겨 줌" },
        risk: { chance: 0.3, effect: { reputation: -6, log: "해적을 숨겼다는 소문이 동네에 퍼짐" } } },
      { title: "사례금만 받는다", desc: "돈은 되지만 해적 돈이다",
        effect: { money: 150000, reputation: -3, traits: { "야심": 1 },
                  log: "옛날 꿰매 준 해적의 사례금만 받고 돌려보냄" },
        risk: { chance: 0.25, effect: { happiness: -5, log: "해적 돈을 받았다는 뒷말에 시달림" } } },
      { title: "옛 동료에게 알린다", desc: "탈은 없지만 은혜를 판다",
        effect: { standing: 4, relationship: -5, traits: { "신중": 1 },
                  log: "찾아온 해적을 해군 시절 동료에게 알림" } }
    ],
    by: {
      "해군": {
        body: "순찰정이 해적선에 붙잡혀 당신과 부하들이 갑판에 무릎을 꿇습니다. 해적 갑판장이 소매를 걷자 몇 해 전 명령을 어기고 당신이 꿰매 준 흉터가 보입니다. 그는 당신 귀에 속삭입니다. \"순찰 항로만 알려 주면 다 살려 보내지.\"",
        choices: [
          { title: "항로를 주고 부하들을 살린다", desc: "목숨은 지키지만 군을 판다",
            effect: { relationship: 6, standing: -7, traits: { "선량": 1 },
                      log: "꿰매 준 해적에게 항로를 주고 부하들을 살림" },
            risk: { chance: 0.3, effect: { standing: -6, log: "항로 유출을 의심받아 조사받음" } } },
          { title: "거절하고 탈출을 노린다", desc: "원칙은 지키지만 피를 본다",
            effect: { standing: 6, health: -8, traits: { "용기": 1 },
                      log: "항로를 넘기길 거절하고 해적선에서 탈출함" },
            risk: { chance: 0.3, effect: { health: -12, log: "탈출 중 해적의 칼에 깊이 베임" } } },
          { title: "흉터를 봐 주며 시간을 번다", desc: "모두 살지만 은인이 잡힌다",
            effect: { skills: { "의술": 5 }, standing: 3, happiness: -5, traits: { "신중": 1 },
                      log: "흉터를 봐 주며 시간을 끌어 구조대를 기다림" } }
        ]
      },
      "해적|혁명군": {
        body: "{여기} 항구에서 이름난 해적 선장이 당신을 찾아옵니다. 그가 소매를 걷자, 몇 해 전 해군이던 당신이 명령을 어기고 꿰매 준 흉터가 드러납니다. \"그날 네 바늘 덕에 산 놈들이 지금 내 선원이다.\" 그는 무엇으로 갚을지 물어 옵니다.",
        choices: [
          { title: "함께 해군 기지를 친다", desc: "이름은 오르지만 피를 본다",
            effect: { standing: 7, bounty: "+25%", health: -4, traits: { "용기": 1 },
                      log: "꿰매 준 해적 선장과 해군 기지를 들이침" },
            risk: { chance: 0.35, effect: { health: -12, log: "기지 포대의 포격에 맞음" } } },
          { title: "은혜값으로 보급을 받는다", desc: "넉넉하지만 출처가 구리다",
            effect: { money: 200000, relationship: -3, traits: { "야심": 1 },
                      log: "옛 은혜값으로 해적 선장의 보급을 받음" },
            risk: { chance: 0.25, effect: { health: -8, log: "보급품이 장물로 드러나 추격을 받음" } } },
          { title: "그의 부상병들을 돌본다", desc: "또 살리지만 내 몫이 줄어든다",
            effect: { skills: { "의술": 5 }, relationship: 5, money: -40000, traits: { "선량": 1 },
                      memory: "다시 든 바늘과 실", log: "해적 선장의 부상병들을 다시 꿰매 줌" } }
        ]
      },
      "*": {}
    }
  },

  // ── 정보 부서의 마지막 파일 (f_cb_navy_intel ← cb_kid_reported_ship 해군) ──
  {
    key: "cb2_navy_intel",
    flags: ["f_cb_navy_intel"],
    after: 6,
    when: { minAge: 24, maxAge: 65 },
    title: "참모의 마지막 파일",
    body: "어릴 적 해적선 신고를 기억해 당신을 정보 부서로 끌어 주었던 참모가 은퇴해 {여기}의 당신 집을 찾아옵니다. 그는 한 상단이 정보원을 찾는다며 소개장을 내밀고, 자기 회고록을 정리할 손도 필요하다고 합니다. 그 회고록 첫 장은 {고향} 항구의 해적선 이야기입니다.",
    choices: [
      { title: "상단 정보원으로 일한다", desc: "돈은 되지만 뒷일이 생긴다",
        effect: { money: 200000, relationship: -4, traits: { "야심": 1 },
                  log: "옛 참모의 소개로 상단 정보원 일을 맡음" },
        risk: { chance: 0.3, effect: { reputation: -6, log: "상단의 뒷거래에 이름이 얽힘" } } },
      { title: "참모의 회고록을 돕는다", desc: "옛일을 정리하지만 돈은 안 된다",
        effect: { knowledge: 4, relationship: 4, money: -20000, traits: { "선량": 1 },
                  memory: "회고록 첫 장의 항구", log: "옛 참모의 회고록 정리를 도움" } },
      { title: "그 시절과 선을 긋는다", desc: "조용하지만 은인을 등진다",
        effect: { happiness: -3, relationship: -3, health: 3, traits: { "신중": 1 },
                  log: "정보 부서 시절과 정중히 선을 그음" } }
    ],
    by: {
      "해군": {
        body: "당신을 정보 부서로 끌어 준 참모가 은퇴를 앞두고 {고향} 해적선 사건 파일을 꺼냅니다. 어린 당신의 신고로 배를 잃은 해적 몇이 아직 {고향} 근처에 숨어 산다며, 마지막 일로 그들을 정리하자고 합니다. 파일 속 이름 가운데 하나는 당신이 어릴 적 동네에서 보던 얼굴입니다.",
        choices: [
          { title: "홀로 고향에 내려가 본다", desc: "진실을 보지만 위험하다",
            effect: { knowledge: 4, health: -5, traits: { "용기": 1 },
                      memory: "고향 항구의 낡은 선창", log: "파일 속 해적들을 확인하러 홀로 고향에 감" },
            risk: { chance: 0.3, effect: { health: -10, log: "고향 뒷골목에서 옛 해적들에게 습격당함" } } },
          { title: "파일을 덮자고 설득한다", desc: "옛일을 놓아주지만 눈 밖에 난다",
            effect: { relationship: 5, standing: -5, traits: { "선량": 1 },
                      log: "참모에게 옛 해적선 파일을 덮자고 설득함" },
            risk: { chance: 0.25, effect: { happiness: -5, log: "참모가 실망해 연락을 끊음" } } },
          { title: "참모와 함께 그들을 잡는다", desc: "공은 크지만 고향이 등을 돌린다",
            effect: { standing: 8, happiness: -5, traits: { "야심": 1 },
                      log: "옛 참모와 함께 고향에 숨은 해적들을 체포함" } }
        ]
      },
      "해적|혁명군": {
        body: "정보 부서를 떠나 바다로 나온 뒤, 당신의 옛 수법을 아는 사람이 하나 남았습니다. 어릴 적 해적선 신고를 기억해 당신을 끌어 주었던 그 참모입니다. 그가 {여기}의 등대 아래에서 단둘이 만나자는 전갈을 보내옵니다.",
        choices: [
          { title: "등대로 만나러 간다", desc: "옛 정을 믿지만 함정일 수 있다",
            effect: { knowledge: 4, relationship: 4, traits: { "용기": 1 },
                      log: "등대 아래에서 옛 참모를 단둘이 만남" },
            risk: { chance: 0.35, effect: { health: -12, log: "등대 주변에 숨은 저격수의 총탄에 맞음" } } },
          { title: "정보 부서 암호를 팔아넘긴다", desc: "큰돈이지만 표적이 된다",
            effect: { money: 300000, bounty: "+20%", traits: { "야심": 1 },
                      log: "옛 정보 부서의 암호를 암시장에 팔아넘김" },
            risk: { chance: 0.3, effect: { health: -8, log: "정보 부서의 추적대에 기습당함" } } },
          { title: "모든 연락을 끊는다", desc: "안전하지만 마지막 끈을 놓는다",
            effect: { happiness: -5, health: 2, traits: { "신중": 1 },
                      log: "옛 참모의 전갈을 태우고 연락을 끊음" } }
        ]
      },
      "*": {}
    }
  },


  // ── 흘린 명령서의 섬 (f_cb_navy_leak ← cb_goal_overthrow 해군) ──
  {
    key: "cb2_navy_leak",
    flags: ["f_cb_navy_leak"],
    after: 6,
    when: { minAge: 26, maxAge: 65 },
    title: "지도에 남은 섬",
    body: "몇 해 전 당신이 흘린 기밀 명령서 덕분에 지도에서 지워질 뻔한 섬은 아직 남아 있습니다. 그 섬 사람들이 수소문 끝에 {여기}의 당신을 찾아내 축제의 손님으로 모시겠다고 합니다. 그러나 그 섬에 다녀온 사람은 여전히 혁명군 연루자로 눈총을 받습니다.",
    choices: [
      { title: "섬의 초대에 응한다", desc: "가슴이 벅차지만 소문이 난다",
        effect: { relationship: 6, happiness: 4, money: -40000, traits: { "선량": 1 },
                  memory: "살아남은 섬의 축제", log: "명령서를 흘려 살린 섬의 축제에 다녀옴" },
        risk: { chance: 0.3, effect: { reputation: -6, log: "혁명군 연루자라는 소문이 퍼짐" } } },
      { title: "이름을 숨기고 사양한다", desc: "탈은 없지만 마음이 허전하다",
        effect: { happiness: -4, health: 2, traits: { "신중": 1 },
                  log: "살린 섬의 초대를 이름을 숨긴 채 사양함" } },
      { title: "혁명군 연락망에 남는다", desc: "길을 잇지만 위험을 진다",
        effect: { knowledge: 3, reputation: -5, traits: { "용기": 1 },
                  log: "섬 사람들을 통해 혁명군 연락망에 남음" },
        risk: { chance: 0.3, effect: { health: -8, log: "연락원과 만난 뒤 정부 첩보원에게 쫓김" } } }
    ],
    by: {
      "해군": {
        body: "몇 해 전 당신이 혁명군 쪽에 흘린 기밀 명령서 덕분에, 지도에서 지워질 뻔한 섬은 아직 남아 있습니다. 그런데 본부 감찰단이 그때의 유출을 다시 파기 시작했고, 문서를 함께 다루던 부관이 용의자로 붙잡혔습니다. 그는 아무것도 모릅니다.",
        choices: [
          { title: "감찰단에 스스로 나선다", desc: "부관을 살리지만 모든 걸 잃는다",
            effect: { standing: -8, happiness: 6, traits: { "용기": 1 },
                      log: "명령서 유출이 자신의 일이었다고 감찰단에 밝힘" },
            risk: { chance: 0.35, effect: { health: -12, log: "감찰단의 혹독한 심문을 받음" } } },
          { title: "부관이 대신 지게 둔다", desc: "자리는 지키지만 죄가 남는다",
            effect: { standing: 4, happiness: -8, traits: { "야심": 1 },
                      log: "유출 혐의를 부관이 대신 지게 내버려 둠" } },
          { title: "부관의 알리바이를 꾸민다", desc: "둘 다 살 수 있지만 위태롭다",
            effect: { relationship: 5, health: -3, traits: { "선량": 1 },
                      log: "붙잡힌 부관의 알리바이를 몰래 꾸며 줌" },
            risk: { chance: 0.3, effect: { standing: -8, reputation: -5, log: "꾸민 알리바이가 들통나 함께 조사받음" } } }
        ]
      },
      "혁명군|해적": {
        body: "몇 해 전 제복을 입은 채 흘린 명령서로 살아남은 섬에 처음 발을 디딥니다. 주민들은 당신 이름을 새긴 등불을 걸어 두었습니다. 그러나 정부가 그 섬을 다시 지우려 새 함대를 보낸다는 소식이 같은 날 들어옵니다.",
        choices: [
          { title: "섬의 방어를 맡는다", desc: "섬을 지키지만 목숨이 걸린다",
            effect: { standing: 7, bounty: "+20%", health: -5, traits: { "용기": 1 },
                      log: "명령서로 살린 섬의 방어를 맡음" },
            risk: { chance: 0.35, effect: { health: -12, log: "정부 함대의 포격에 크게 다침" } } },
          { title: "주민들을 다른 섬으로 옮긴다", desc: "목숨은 살리지만 섬은 버린다",
            effect: { relationship: 5, money: -150000, happiness: -3, traits: { "신중": 1 },
                      log: "살린 섬의 주민들을 배에 실어 다른 섬으로 옮김" } },
          { title: "그 섬의 일을 바다에 알린다", desc: "이름은 오르지만 표적이 된다",
            effect: { standing: 6, bounty: "+15%", traits: { "야심": 1 },
                      log: "명령서로 섬을 살린 일을 바다에 퍼뜨림" },
            risk: { chance: 0.3, effect: { health: -8, log: "소문을 쫓아온 정부 첩보원에게 습격당함" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 느슨히 둔 사슬의 해적 (f_cb_navy_let_pirate ← cb_dream_pirate 해군) ──
  {
    key: "cb2_navy_let_pirate",
    flags: ["f_cb_navy_let_pirate"],
    after: 6,
    when: { minAge: 24, maxAge: 65 },
    title: "돌아온 해골 그림",
    body: "{여기}의 당신 집에 주인 없는 상자 하나가 배달됩니다. 안에는 금화와 함께, 몇 해 전 당신이 사슬을 느슨히 두어 달아나게 한 해적 포로가 그린 해골 깃발 그림이 들어 있습니다. 숙제장 귀퉁이의 그 그림 아래 \"그때 그 틈값\"이라고 적혀 있습니다.",
    choices: [
      { title: "금화를 받아 둔다", desc: "넉넉하지만 해적 돈이다",
        effect: { money: 300000, reputation: -5, traits: { "야심": 1 },
                  log: "달아난 해적 포로가 보낸 금화를 받음" },
        risk: { chance: 0.25, effect: { happiness: -6, log: "해적 금화 때문에 해군 조사를 받음" } } },
      { title: "상자째 해군에 신고한다", desc: "탈은 없지만 은혜를 등진다",
        effect: { standing: 3, happiness: -4, traits: { "신중": 1 },
                  log: "해적이 보낸 금화 상자를 해군에 신고함" },
        risk: { chance: 0.2, effect: { health: -8, log: "신고 소식을 들은 해적 패거리에게 보복당함" } } },
      { title: "답장으로 그림을 그려 보낸다", desc: "마음은 통하지만 엮인다",
        effect: { happiness: 6, relationship: 3, traits: { "선량": 1 },
                  memory: "두 장의 해골 그림", log: "달아난 해적에게 해골 그림으로 답장함" },
        risk: { chance: 0.25, effect: { reputation: -6, log: "해적과 편지를 주고받는다는 소문이 남" } } }
    ],
    by: {
      "해군": {
        body: "몇 해 전 사슬을 느슨히 두어 달아나게 한 해적 포로가 이제 이름난 선장이 되어 {여기} 근처에 나타났습니다. 그는 당신 앞으로 해골 깃발 그림 한 장과 다른 해적단의 은신처 지도를 보내왔습니다. 그림 아래에는 \"이번엔 내가 틈을 남겨 주지\"라고 적혀 있습니다.",
        choices: [
          { title: "그의 배를 끝까지 쫓는다", desc: "빚을 끊지만 피를 본다",
            effect: { standing: 7, health: -6, traits: { "용기": 1 },
                      log: "풀어 주었던 해적 선장의 배를 끝까지 추격함" },
            risk: { chance: 0.3, effect: { health: -12, log: "추격 끝에 그의 포격에 맞음" } } },
          { title: "그림을 상관에게 제출한다", desc: "원칙대로지만 옛일이 들춰진다",
            effect: { standing: 3, happiness: -4, traits: { "신중": 1 },
                      log: "해적 선장이 보낸 그림과 지도를 상관에게 제출함" },
            risk: { chance: 0.3, effect: { standing: -6, log: "옛 포로 탈주 사건과 엮여 조사받음" } } },
          { title: "그 지도로 다른 해적을 친다", desc: "큰 공이지만 해적과 거래한다",
            effect: { standing: 8, relationship: -3, traits: { "야심": 1 },
                      log: "풀어 준 해적의 지도로 다른 해적단을 소탕함" },
            risk: { chance: 0.3, effect: { standing: -8, reputation: -5, log: "해적과 내통했다는 의심을 받아 징계받음" } } }
        ]
      },
      "해적|혁명군": {
        body: "{여기} 항구에 해골 깃발을 단 큰 배가 들어오고, 선장이 당신을 부릅니다. 몇 해 전 해군이던 당신이 사슬을 느슨히 두어 달아나게 한 그 포로입니다. 그는 당신 깃발을 보고 크게 웃습니다. \"결국 이쪽 바다로 왔군. 자, 그 빚을 어떻게 받겠나?\"",
        choices: [
          { title: "깃발을 나란히 건다", desc: "든든하지만 표적이 커진다",
            effect: { relationship: 5, standing: 4, traits: { "선량": 1 },
                      log: "풀어 주었던 해적 선장과 깃발을 나란히 검" },
            risk: { chance: 0.3, effect: { bounty: "+20%", health: -6, log: "연합 소문에 해군 함대가 몰려옴" } } },
          { title: "빚을 베리로 받아 낸다", desc: "넉넉하지만 정이 식는다",
            effect: { money: 250000, relationship: -5, traits: { "야심": 1 },
                      log: "풀어 준 해적 선장에게 빚을 베리로 받아 냄" },
            risk: { chance: 0.25, effect: { health: -8, log: "앙심을 품은 그의 선원들에게 기습당함" } } },
          { title: "결투로 서열을 정한다", desc: "이름은 오르지만 몸을 건다",
            effect: { standing: 7, bounty: "+25%", health: -4, traits: { "용기": 1 },
                      log: "풀어 준 해적 선장과 결투로 서열을 정함" },
            risk: { chance: 0.35, effect: { health: -12, log: "결투에서 그의 칼에 깊이 베임" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 감옥선의 그 곡 (f_cb_navy_prison_song ← cb_hobby_music 해군) ──
  {
    key: "cb2_navy_prison_song",
    flags: ["f_cb_navy_prison_song"],
    after: 6,
    when: { minAge: 22, maxAge: 75 },
    title: "바다로 퍼진 그 곡",
    body: "몇 해 전 감옥선 아래층에서 포로들과 함께 켰던 그 곡이 이제 {여기}의 선술집마다 흘러나옵니다. 풀려난 포로 하나가 떠돌이 악사가 되어 바다에 퍼뜨린 것입니다. 그가 당신을 찾아와 함께 순회공연을 돌자고 하고, 한 악보 출판사는 곡을 사겠다고 합니다.",
    choices: [
      { title: "함께 순회공연을 떠난다", desc: "가슴이 뛰지만 뒷말이 붙는다",
        effect: { happiness: 7, reputation: 4, health: -3, traits: { "용기": 1 },
                  memory: "항구마다 울린 그 곡", log: "옛 포로였던 악사와 순회공연을 다님" },
        risk: { chance: 0.25, effect: { reputation: -6, log: "해적 노래 악단이라는 소문이 따라붙음" } } },
      { title: "곡을 출판사에 판다", desc: "돈은 되지만 노래가 남의 것이 된다",
        effect: { money: 150000, happiness: -4, traits: { "야심": 1 },
                  log: "감옥선에서 켰던 곡을 악보 출판사에 팖" },
        risk: { chance: 0.2, effect: { relationship: -4, log: "옛 포로 악사가 곡을 판 일에 서운해함" } } },
      { title: "동네 아이들에게 가르친다", desc: "오래 남지만 이름은 없다",
        effect: { relationship: 5, knowledge: 2, money: -20000, traits: { "선량": 1 },
                  log: "감옥선의 그 곡을 동네 아이들에게 가르침" } }
    ],
    by: {
      "해군": {
        body: "몇 해 전 감옥선 아래층에서 포로들과 켰던 그 곡이 이제 바다마다 퍼졌습니다. 오늘 인질을 잡고 버티는 해적선 안에서도 그 곡이 들려옵니다. 선장은 그때 감옥선에서 당신과 함께 연주하던 포로이고, 상관은 당장 돌격하라고 명령합니다.",
        choices: [
          { title: "악기를 들고 협상에 나선다", desc: "인질을 살릴 수 있지만 위험하다",
            effect: { relationship: 5, standing: 3, traits: { "용기": 1 },
                      memory: "인질선 갑판의 그 곡", log: "그 곡을 연주하며 옛 포로와 인질 협상을 벌임" },
            risk: { chance: 0.35, effect: { health: -12, log: "협상이 틀어져 총탄에 맞음" } } },
          { title: "명령대로 돌격한다", desc: "공은 서지만 노래가 끊긴다",
            effect: { standing: 7, happiness: -6, traits: { "신중": 1 },
                      log: "그 곡이 들리는 해적선으로 명령대로 돌격함" },
            risk: { chance: 0.25, effect: { health: -8, log: "돌격 중 갑판에서 칼에 베임" } } },
          { title: "그 곡을 금지곡으로 올린다", desc: "의심은 피하지만 노래를 버린다",
            effect: { standing: 5, relationship: -5, happiness: -3, traits: { "야심": 1 },
                      log: "감옥선의 그 곡을 금지곡으로 보고함" } }
        ]
      },
      "해적|혁명군": {
        body: "몇 해 전 제복을 입고 감옥선 아래층에서 포로들과 켰던 그 곡이, 이제는 해적들이 서로를 알아보는 노래가 되었습니다. {여기} 근처 해역에 그때 그 감옥선이 다시 떠 있고, 동료들은 그 곡을 신호 삼아 포로들을 빼내자고 합니다.",
        choices: [
          { title: "그 곡을 신호로 감옥선을 친다", desc: "포로를 살리지만 목숨을 건다",
            effect: { standing: 7, bounty: "+25%", traits: { "용기": 1 },
                      log: "그 곡을 신호로 감옥선을 습격해 포로를 빼냄" },
            risk: { chance: 0.35, effect: { health: -12, log: "감옥선 포대의 포격에 맞음" } } },
          { title: "그 곡으로 공연해 돈을 번다", desc: "돈은 되지만 소리가 샌다",
            effect: { money: 150000, relationship: -3, traits: { "야심": 1 },
                      log: "해적들의 노래가 된 그 곡으로 공연해 돈을 범" },
            risk: { chance: 0.25, effect: { health: -8, log: "공연 소문을 쫓아온 순찰선과 교전함" } } },
          { title: "그때의 포로들을 찾아 나선다", desc: "옛 정을 잇지만 발품이 든다",
            effect: { relationship: 6, money: -50000, traits: { "선량": 1 },
                      memory: "다시 모인 감옥선 악단", log: "감옥선에서 함께 연주한 포로들을 찾아 모음" } }
        ]
      },
      "*": {}
    }
  }
]);

CB([




  // ── 뒷골목의 혁명군 연락원과 손잡음 (cb_goal_overthrow → f_cb_overthrow_contact) ──
  {
    key: "cb2_overthrow_contact",
    flags: ["f_cb_overthrow_contact"],
    after: 6,
    when: { minAge: 26, maxAge: 65 },
    title: "피 묻은 명단",
    body: "몇 해 전 지워진 기사 이야기를 하며 {여기}의 뒷골목에서 손을 내밀었던 낯선 이가, 피 묻은 외투 차림으로 당신 집 문을 두드립니다. 정부 첩보원에게 쫓기는 그의 품에는 연락망 명단이 있고, 그 가운데 당신의 이름도 적혀 있습니다.",
    choices: [
      { title: "명단을 들고 거점까지 간다", desc: "약속을 잇지만 목숨이 걸린다",
        effect: { happiness: 6, knowledge: 4, health: -4, traits: { "용기": 1 },
                  memory: "외투 속의 피 묻은 명단", log: "연락원 대신 명단을 혁명군 거점까지 전함" },
        risk: { chance: 0.35, effect: { health: -12, log: "첩보원에게 따라잡혀 크게 다침" } } },
      { title: "그를 숨기고 의원을 부른다", desc: "사람을 살리지만 돈과 눈총이 든다",
        effect: { relationship: 6, money: -100000, traits: { "선량": 1 },
                  log: "쫓기던 연락원을 숨기고 의원을 불러 치료함" },
        risk: { chance: 0.25, effect: { reputation: -6, log: "수상한 손님을 들였다는 소문이 돎" } } },
      { title: "명단에서 내 이름만 지운다", desc: "몸은 지키지만 그가 등을 돌린다",
        effect: { reputation: 4, relationship: -6, happiness: -4, traits: { "신중": 1 },
                  log: "연락망 명단에서 자기 이름만 지우고 그를 보냄" } }
    ],
    by: {
      "혁명군": {
        body: "몇 해 전 {여기}의 뒷골목에서 당신의 손을 잡아 이 길로 이끈 연락원이 정부에 붙잡혔다는 소식이 옵니다. 본부는 연락망이 들킬까 봐 그를 버리고 거점을 옮기라고 명령합니다. 그가 갇힌 지부의 경비 교대 시간은 당신만 알고 있습니다.",
        choices: [
          { title: "명령을 어기고 그를 구한다", desc: "은인을 구하지만 본부가 노한다",
            effect: { relationship: 6, standing: -5, bounty: "+20%", traits: { "용기": 1 },
                      log: "본부의 명령을 어기고 옛 연락원을 구해 냄" },
            risk: { chance: 0.35, effect: { health: -12, log: "지부 경비대와 맞붙어 크게 다침" } } },
          { title: "명령대로 거점을 옮긴다", desc: "조직은 지키지만 은인을 버린다",
            effect: { standing: 6, happiness: -8, traits: { "신중": 1 },
                      log: "옛 연락원을 두고 명령대로 거점을 옮김" } },
          { title: "그의 가족부터 빼돌린다", desc: "남은 사람을 지키지만 돈이 든다",
            effect: { relationship: 5, money: -150000, standing: 2, traits: { "선량": 1 },
                      memory: "새벽 부두의 낯선 가족", log: "붙잡힌 연락원의 가족을 몰래 섬 밖으로 보냄" } }
        ]
      },
      "해군": {
        body: "몇 해 전 {여기}의 뒷골목에서 손을 잡았던 혁명군 연락원이, 이제 제복을 입은 당신에게 쪽지를 보내옵니다. 다음 달 이 해역 기지의 수송 일정을 알려 달라는 부탁입니다. 쪽지 끝에는 그날 당신이 했던 말이 그대로 적혀 있습니다.",
        choices: [
          { title: "수송 일정을 몰래 흘린다", desc: "옛 약속은 지키지만 들키면 끝이다",
            effect: { happiness: 5, relationship: 4, traits: { "용기": 1 },
                      log: "기지 수송 일정을 혁명군 연락원에게 흘림" },
            risk: { chance: 0.35, effect: { standing: -10, health: -6, log: "정보 유출 혐의로 붙잡혀 심문받음" } } },
          { title: "쪽지를 상부에 보고한다", desc: "공은 서지만 옛 손을 놓는다",
            effect: { standing: 7, happiness: -6, relationship: -3, traits: { "야심": 1 },
                      log: "혁명군 연락원의 쪽지를 상부에 보고함" } },
          { title: "쪽지를 태우고 답하지 않는다", desc: "아무도 다치지 않지만 마음이 식는다",
            effect: { happiness: -5, health: 2, knowledge: 2, traits: { "신중": 1 },
                      memory: "촛불에 오그라든 쪽지", log: "연락원의 쪽지를 태우고 답하지 않음" } }
        ]
      },
      "*": {}
    }
  },

  // ── 해적왕의 꿈으로 낡은 배를 삼 (cb_goal_pirate_king → f_cb_pk_bought_boat) ──
  {
    key: "cb2_pk_bought_boat",
    flags: ["f_cb_pk_bought_boat"],
    after: 6,
    when: { minAge: 26, maxAge: 65 },
    title: "물이 새던 첫 배",
    body: "해적왕의 꿈을 좇아 사들였던 물이 새는 낡은 배는 몇 해째 {여기} 포구에서 당신 손을 기다리고 있습니다. 오늘 열여섯쯤 된 소년이 그 배 앞에 서서, 자기도 해적왕이 되고 싶다며 배를 팔라고 조릅니다. 소년의 주머니에서 짤랑거리는 돈은 얼마 되지 않습니다.",
    choices: [
      { title: "이번엔 내가 먼 바다로 몬다", desc: "가슴은 뛰지만 배가 버틸지 모른다",
        effect: { skills: { "항해술": 6 }, happiness: 7, traits: { "용기": 1 },
                  memory: "첫 배로 본 수평선 너머", log: "낡은 첫 배를 몰고 처음으로 먼 바다에 나감" },
        risk: { chance: 0.3, effect: { health: -10, log: "물이 새던 배가 기울어 겨우 돌아옴" } } },
      { title: "소년에게 배를 넘겨준다", desc: "꿈을 물려주지만 내 꿈은 끝난다",
        effect: { relationship: 5, happiness: -4, money: 20000, traits: { "선량": 1 },
                  log: "해적왕을 꿈꾸는 소년에게 낡은 배를 넘겨줌" } },
      { title: "고깃배로 고쳐 세를 준다", desc: "돈이 되지만 꿈은 접힌다",
        effect: { money: 200000, happiness: -7, traits: { "야심": 1 },
                  log: "해적왕의 배를 고깃배로 고쳐 세를 놓음" } }
    ],
    by: {
      "해적": {
        body: "해적왕의 꿈을 좇아 처음 사들였던 물이 새는 낡은 배는, 이제 당신 해적선 꽁무니에 매달린 보트가 되었습니다. 오늘 해군 함대가 뒤를 바짝 쫓아오고, 항해사가 그 낡은 배를 미끼로 띄워 보내자고 외칩니다. 선원들은 그 배를 선장의 첫 배로 알고 있습니다.",
        choices: [
          { title: "첫 배를 미끼로 띄워 보낸다", desc: "모두 살지만 첫 꿈을 잃는다",
            effect: { standing: 4, happiness: -6, traits: { "신중": 1 },
                      memory: "멀어지던 첫 배의 돛", log: "낡은 첫 배를 미끼로 띄워 함대를 따돌림" } },
          { title: "첫 배를 지키며 맞서 싸운다", desc: "배는 지키지만 피를 본다",
            effect: { combat: 5, bounty: "+25%", relationship: 3, traits: { "용기": 1 },
                      log: "첫 배를 버리지 않고 해군 함대와 맞섬" },
            risk: { chance: 0.35, effect: { health: -12, log: "함대의 포격에 갑판이 부서짐" } } },
          { title: "선원들에게 배를 버릴지 묻는다", desc: "배가 하나가 되지만 시간을 잃는다",
            effect: { relationship: 6, health: -5, traits: { "선량": 1 },
                      log: "첫 배의 운명을 선원들과 함께 정함" },
            risk: { chance: 0.25, effect: { health: -8, log: "머뭇거린 사이 포탄이 날아듦" } } }
        ]
      },
      "해군": {
        body: "해적왕의 꿈을 좇아 사들였던 물이 새는 낡은 배가 {여기} 포구에 아직 묶여 있습니다. 오늘 기지 동료가 그 배 돛대에 새겨진 해골 낙서를 보고, 제복 입은 사람이 이런 배를 왜 갖고 있느냐고 웃으며 묻습니다. 웃음 끝에 의심이 묻어 있습니다.",
        choices: [
          { title: "배를 기지에 기증한다", desc: "의심은 씻지만 첫 꿈을 내준다",
            effect: { standing: 5, happiness: -6, traits: { "신중": 1 },
                      log: "해골 낙서가 새겨진 첫 배를 기지에 기증함" } },
          { title: "배를 다른 섬으로 옮겨 둔다", desc: "꿈은 지키지만 들킬 수 있다",
            effect: { happiness: 5, money: -60000, traits: { "용기": 1 },
                      log: "첫 배를 몰래 먼 섬의 포구로 옮겨 둠" },
            risk: { chance: 0.25, effect: { standing: -6, log: "배를 숨긴 일로 감찰을 받음" } } },
          { title: "동료에게 옛 꿈을 털어놓는다", desc: "벗을 얻지만 소문이 돈다",
            effect: { relationship: 5, standing: -4, traits: { "선량": 1 },
                      memory: "돛대의 해골 낙서", log: "동료에게 해적왕을 꿈꾸던 시절을 털어놓음" } }
        ]
      },
      "*": {}
    }
  },

  // ── 제복을 벗을 날을 헤아림 (cb_goal_pirate_king 해군 → f_cb_pk_doubt_uniform) ──
  {
    key: "cb2_pk_doubt_uniform",
    flags: ["f_cb_pk_doubt_uniform"],
    after: 7,
    when: { minAge: 27, maxAge: 60 },
    title: "창살 너머의 해적 선장",
    body: "몇 해 전 감방에서 \"당신 눈빛, 우리랑 똑같군\" 하던 해적 선장이 깊은 감옥으로 이송된다는 명령이 내려옵니다. 호송선 지휘관은 당신입니다. 그날부터 제복을 벗을 날을 헤아려 온 당신의 서랍에는 아직 내지 못한 사직서가 들어 있습니다.",
    choices: [
      { title: "사직서를 내고 바다로 간다", desc: "마음은 홀가분하지만 다 잃는다",
        effect: { happiness: 8, standing: -8, traits: { "용기": 1 },
                  memory: "서랍 속 사직서", log: "호송 명령 대신 사직서를 내고 제복을 벗음" } },
      { title: "호송을 끝까지 마친다", desc: "공은 쌓이지만 그 눈빛이 남는다",
        effect: { standing: 6, happiness: -6, traits: { "신중": 1 },
                  log: "옛 해적 선장의 호송을 끝까지 마침" } },
      { title: "호송 중 탈옥을 눈감는다", desc: "빚은 갚지만 들키면 끝이다",
        effect: { happiness: 5, relationship: 3, traits: { "선량": 1 },
                  log: "호송 중 해적 선장의 탈옥을 모른 척함" },
        risk: { chance: 0.35, effect: { standing: -10, reputation: -5, log: "탈옥을 방조한 일이 드러나 문책당함" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "제복을 벗고 바다로 나온 지 몇 해, {여기} 앞바다에서 낯익은 해적선이 당신 배 옆에 붙습니다. 몇 해 전 감방 창살 너머에서 당신 눈빛이 자기들과 똑같다던 그 선장입니다. 그는 껄껄 웃으며 자기 함대에 들어오라고 손짓합니다.",
        choices: [
          { title: "그의 함대에 들어간다", desc: "든든하지만 남의 깃발 아래다",
            effect: { standing: 5, relationship: 3, happiness: -4, traits: { "신중": 1 },
                      log: "감방에서 만났던 해적 선장의 함대에 합류함" } },
          { title: "술 한잔 나누고 갈라선다", desc: "자유롭지만 뒷배는 없다",
            effect: { happiness: 6, money: -30000, traits: { "선량": 1 },
                      memory: "갑판 위의 늦은 건배", log: "옛 해적 선장과 술을 나누고 각자 길을 감" } },
          { title: "누가 옳았는지 결투를 청한다", desc: "이름은 오르지만 목숨이 걸린다",
            effect: { combat: 6, bounty: "+25%", traits: { "용기": 1 },
                      log: "감방에서 만났던 해적 선장과 결투를 벌임" },
            risk: { chance: 0.35, effect: { health: -12, log: "옛 해적 선장의 칼에 크게 베임" } } }
        ]
      },
      "민간인|현상금 사냥꾼": {
        body: "제복을 벗은 지 몇 해, 당신은 아직 해적 깃발을 올리지 못했습니다. 오늘 밤 깊은 감옥에서 달아났다는 해적 선장이 당신 집 문을 두드립니다. 몇 해 전 창살 너머에서 당신 눈빛이 자기들과 똑같다던 그 사람이 배 한 척만 구해 달라고 합니다.",
        choices: [
          { title: "배를 구해 주고 함께 꿈꾼다", desc: "가슴은 뛰지만 쫓기게 될 수 있다",
            effect: { happiness: 6, money: -100000, relationship: 3, traits: { "용기": 1 },
                      log: "탈옥한 해적 선장에게 배를 구해 줌" },
            risk: { chance: 0.3, effect: { reputation: -6, log: "탈옥수를 도운 일로 해군 조사를 받음" } } },
          { title: "옛 버릇대로 해군에 알린다", desc: "사례금은 받지만 꿈을 판다",
            effect: { money: 100000, happiness: -6, traits: { "야심": 1 },
                      log: "탈옥한 해적 선장을 해군에 신고함" } },
          { title: "문을 닫고 지금을 지킨다", desc: "평온하지만 그 밤이 남는다",
            effect: { health: 3, happiness: -4, relationship: 2, traits: { "신중": 1 },
                      memory: "닫힌 문 너머의 발소리", log: "탈옥한 해적 선장을 돌려보내고 문을 닫음" } }
        ]
      },
      "*": {}
    }
  },

  // ── 같은 꿈을 꾸는 사람을 찾음 (cb_goal_pirate_king → f_cb_pk_found_mate) ──
  {
    key: "cb2_pk_found_mate",
    flags: ["f_cb_pk_found_mate"],
    after: 6,
    when: { minAge: 26, maxAge: 60 },
    title: "술집의 그 사람",
    body: "몇 해 전 {여기}의 술집에서 해적왕 이야기로 밤새 의기투합했던 그 사람이, 이제 현상수배서 속에서 웃고 있습니다. 그날 밤 그가 그랬듯 그는 당신 집 앞에 배를 대고 소리칩니다. \"약속대로 데리러 왔어. 부선장 자리는 비워 뒀다고.\"",
    choices: [
      { title: "한 항해만 함께 나간다", desc: "꿈을 맛보지만 이름이 더럽혀진다",
        effect: { skills: { "항해술": 5 }, happiness: 6, reputation: -4, traits: { "용기": 1 },
                  memory: "그 사람 배의 해골 깃발", log: "술집에서 만난 꿈의 동지와 한 항해를 함께함" },
        risk: { chance: 0.3, effect: { health: -10, log: "그의 배가 해군에게 쫓겨 크게 다침" } } },
      { title: "보급만 대 주고 배웅한다", desc: "우정은 지키지만 돈이 든다",
        effect: { relationship: 6, money: -100000, traits: { "선량": 1 },
                  log: "꿈의 동지에게 보급을 대 주고 배웅함" } },
      { title: "현상금을 노려 신고한다", desc: "목돈이 생기지만 친구를 판다",
        effect: { money: 300000, relationship: -6, happiness: -4, traits: { "야심": 1 },
                  log: "술집에서 꿈을 나눈 동지를 해군에 신고함" } }
    ],
    by: {
      "해적": {
        body: "몇 해 전 {여기}의 술집에서 해적왕 이야기로 의기투합했던 그 사람이, 이제 다른 해적단의 선장이 되어 당신 배 옆에 닻을 내립니다. 꿈은 같지만 해적왕은 한 사람뿐입니다. 그는 손을 잡고 함께 갈지, 여기서 승부를 낼지 묻습니다.",
        choices: [
          { title: "동맹을 맺고 함께 간다", desc: "힘은 커지지만 꿈을 나눠야 한다",
            effect: { standing: 5, relationship: 5, happiness: -3, traits: { "선량": 1 },
                      log: "술집에서 만난 꿈의 동지와 해적 동맹을 맺음" } },
          { title: "결투로 꿈의 주인을 가린다", desc: "이름은 치솟지만 목숨이 걸린다",
            effect: { combat: 6, bounty: "+25%", relationship: -4, traits: { "용기": 1 },
                      log: "꿈의 동지와 해적왕의 자리를 걸고 결투함" },
            risk: { chance: 0.35, effect: { health: -15, log: "옛 동지의 칼에 깊이 베임" } } },
          { title: "그의 항로 정보만 사 둔다", desc: "길은 보이지만 우정이 식는다",
            effect: { knowledge: 4, money: -100000, relationship: -2, traits: { "신중": 1 },
                      log: "꿈의 동지에게서 위대한 항로의 정보를 사들임" } }
        ]
      },
      "해군": {
        body: "체포 명령서에 붙은 수배 사진 속 얼굴을 당신은 압니다. 몇 해 전 {여기}의 술집에서 해적왕 이야기로 밤새 의기투합했던 그 사람입니다. 오늘 밤 그의 배가 이 항구에 닿는다는 정보가 들어왔고, 체포조의 지휘는 당신 몫입니다.",
        choices: [
          { title: "직접 체포한다", desc: "큰 공이지만 옛 밤을 배신한다",
            effect: { standing: 8, happiness: -8, traits: { "신중": 1 },
                      log: "술집에서 꿈을 나눴던 해적을 직접 체포함" },
            risk: { chance: 0.25, effect: { health: -10, log: "체포 중 그의 선원들과 칼싸움이 남" } } },
          { title: "일부러 놓친다", desc: "옛 정은 지키지만 들킬 수 있다",
            effect: { happiness: 5, relationship: 3, traits: { "선량": 1 },
                      log: "꿈의 동지가 항구를 빠져나가게 일부러 놓침" },
            risk: { chance: 0.35, effect: { standing: -10, log: "체포 실패의 책임을 물어 좌천됨" } } },
          { title: "홀로 찾아가 투항을 권한다", desc: "둘 다 살 길이지만 위험하다",
            effect: { relationship: 5, standing: 4, traits: { "용기": 1 },
                      log: "홀로 그의 배를 찾아가 투항을 권함" },
            risk: { chance: 0.3, effect: { health: -12, log: "설득이 통하지 않아 그의 배에서 싸움이 남" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 행차 길목에 숨어 기다림 (cb_goal_revenge → f_cb_revenge_ambush) ──
  {
    key: "cb2_revenge_ambush",
    flags: ["f_cb_revenge_ambush"],
    after: 6,
    when: { minAge: 26, maxAge: 65 },
    title: "길목의 얼굴을 찾는 사람",
    body: "몇 해 전 천룡인 행차의 길목에 숨어 칼을 쥐고 있던 당신을, 그날 누군가 보았던 모양입니다. 오늘 {여기}에 정부 조사관이 와서 그해 행차 길에 숨어 있던 사람을 찾는다며 집집이 캐묻고 다닙니다. 이웃 몇은 벌써 당신 쪽을 흘끔거립니다.",
    choices: [
      { title: "{고향|로} 몸을 피한다", desc: "몸은 지키지만 여기 삶을 잃는다",
        effect: { money: -100000, relationship: -4, health: 3, traits: { "신중": 1 },
                  log: "정부 조사관을 피해 고향으로 몸을 숨김" } },
      { title: "조사관 앞에 당당히 선다", desc: "응어리는 풀리지만 끌려갈 수 있다",
        effect: { reputation: 6, happiness: 6, traits: { "용기": 1 },
                  log: "정부 조사관 앞에서 그날의 일을 따져 물음" },
        risk: { chance: 0.35, effect: { health: -14, log: "조사관에게 끌려가 모진 심문을 받음" } } },
      { title: "그날의 칼을 바다에 던진다", desc: "마음은 놓이지만 겁쟁이 소리를 듣는다",
        effect: { happiness: 8, relationship: 3, reputation: -4, traits: { "선량": 1 },
                  memory: "물속으로 가라앉던 칼", log: "복수를 내려놓고 그날의 칼을 바다에 던짐" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 행차 길목에 숨어 기다리다 끝내 칼을 뽑지 못했던 그 천룡인의 깃발이 오늘 망원경 속에 들어옵니다. 이제 당신에게는 배와 동료가 있습니다. 함선 뒤로 쇠사슬 소리가 나는 노예선이 따라붙어 있고, 호위 군함은 두 척뿐입니다.",
        choices: [
          { title: "그때 못 한 일을 끝낸다", desc: "응어리가 풀리지만 목숨이 걸린다",
            effect: { standing: 8, bounty: "+50%", traits: { "용기": 1 },
                      log: "길목에서 놓쳤던 천룡인의 함선을 들이침" },
            risk: { chance: 0.4, effect: { health: -18, log: "호위 군함의 반격에 크게 다침" } } },
          { title: "노예선의 사슬만 끊는다", desc: "사람을 구하지만 원수는 또 놓친다",
            effect: { relationship: 6, bounty: "+15%", traits: { "선량": 1 },
                      memory: "다시 들린 쇠사슬 소리", log: "원수 대신 노예선을 덮쳐 사슬을 끊어 줌" },
            risk: { chance: 0.25, effect: { health: -8, log: "노예선 간수와 싸우다 다침" } } },
          { title: "깃발을 보내고 칼을 거둔다", desc: "모두 살지만 독기가 남는다",
            effect: { combat: 4, happiness: -8, traits: { "신중": 1 },
                      log: "천룡인의 함선을 또 한 번 그냥 보냄" } }
        ]
      },
      "해군": {
        body: "기록 보관소에서 몇 해 전 천룡인 행차의 경비 보고서가 다시 꺼내졌습니다. 길목에 숨어 있던 수상한 자의 인상착의가 적혀 있고, 그 얼굴은 제복을 입은 당신과 꼭 닮았습니다. 보고서를 들고 온 부하가 조심스레 당신 얼굴을 살핍니다.",
        choices: [
          { title: "그날의 일을 털어놓는다", desc: "떳떳하지만 군에서 찍힌다",
            effect: { standing: -8, happiness: 6, traits: { "용기": 1 },
                      log: "행차 길목에 숨었던 일을 상부에 털어놓음" } },
          { title: "보고서를 몰래 없앤다", desc: "흔적은 지우지만 부하가 안다",
            effect: { standing: 3, relationship: -4, traits: { "야심": 1 },
                      log: "행차 경비 보고서를 몰래 없앰" },
            risk: { chance: 0.3, effect: { standing: -10, log: "보고서를 없앤 일이 드러나 문책당함" } } },
          { title: "부하에게 사정을 말하고 맡긴다", desc: "믿음은 얻지만 운을 남에게 건다",
            effect: { relationship: 6, happiness: -3, traits: { "선량": 1 },
                      memory: "부하가 덮어 준 보고서", log: "부하에게 그날의 사정을 말하고 판단을 맡김" },
            risk: { chance: 0.2, effect: { standing: -6, log: "부하의 보고로 감찰을 받음" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 천룡인의 비밀을 캐 모음 (cb_goal_revenge → f_cb_revenge_ledger) ──
  {
    key: "cb2_revenge_ledger",
    flags: ["f_cb_revenge_ledger"],
    after: 7,
    when: { minAge: 27, maxAge: 70 },
    title: "두꺼워진 수첩",
    body: "몇 해 전부터 천룡인 행차의 일정과 호위를 몰래 적어 온 수첩이 이제 손바닥만큼 두꺼워졌습니다. 오늘 {여기}의 여관에 한 신문기자가 찾아와 그 수첩의 존재를 안다고 말합니다. 그는 세상에 알리자고 하지만, 그 뒤의 일은 아무도 장담하지 못합니다.",
    choices: [
      { title: "기자에게 넘겨 세상에 알린다", desc: "진실이 퍼지지만 목숨이 걸린다",
        effect: { reputation: 8, happiness: 6, traits: { "용기": 1 },
                  log: "천룡인의 비밀을 적은 수첩을 신문기자에게 넘김" },
        risk: { chance: 0.35, effect: { health: -14, log: "정체 모를 자객에게 습격당함" } } },
      { title: "혁명군 연락원에게 맡긴다", desc: "쓸모 있게 쓰이지만 의심을 산다",
        effect: { relationship: 5, knowledge: 3, reputation: -5, traits: { "선량": 1 },
                  log: "수첩을 혁명군 연락원에게 몰래 맡김" } },
      { title: "정보상에게 비싸게 판다", desc: "목돈이 생기지만 복수는 끝난다",
        effect: { money: 400000, happiness: -7, traits: { "야심": 1 },
                  log: "천룡인의 비밀을 적은 수첩을 정보상에게 팖" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전부터 몰래 적어 온 천룡인 행차의 일정과 호위 수첩을 펼치자, 다음 달 이 해역을 지나는 함선의 항로가 맞아떨어집니다. 호위가 가장 얇아지는 시각까지 적혀 있습니다. 오랜 세월 쌓은 글씨가 마침내 칼이 될 순간입니다.",
        choices: [
          { title: "수첩대로 함선을 친다", desc: "복수를 이루지만 목숨이 걸린다",
            effect: { standing: 8, bounty: "+40%", traits: { "용기": 1 },
                      log: "수첩에 적은 항로대로 천룡인 함선을 습격함" },
            risk: { chance: 0.35, effect: { health: -16, log: "함선 호위의 반격에 크게 다침" } } },
          { title: "동지들에게 수첩을 나눈다", desc: "길게 쓰이지만 내 손을 떠난다",
            effect: { relationship: 6, standing: 4, happiness: -3, traits: { "선량": 1 },
                      log: "수첩을 베껴 바다의 동지들에게 나눠 줌" } },
          { title: "수첩을 불태우고 칼을 거둔다", desc: "흔적은 사라지지만 세월도 사라진다",
            effect: { health: 4, happiness: -8, knowledge: 2, traits: { "신중": 1 },
                      memory: "불길 속에 말린 수첩", log: "오랫동안 적어 온 수첩을 불태움" } }
        ]
      },
      "해군": {
        body: "제복을 입은 뒤에도 몰래 적어 온 천룡인 행차의 수첩에는, 이제 군만 아는 호위 배치까지 빼곡합니다. 오늘 감찰관이 내무반 소지품 검사를 한다는 소식이 돕니다. 수첩이 나오면 당신은 끝이고, 그 속의 비밀은 다시 묻힙니다.",
        choices: [
          { title: "혁명군 쪽에 수첩을 흘린다", desc: "비밀은 살지만 들키면 끝이다",
            effect: { happiness: 6, relationship: 3, traits: { "용기": 1 },
                      log: "천룡인 수첩을 혁명군 쪽에 몰래 흘림" },
            risk: { chance: 0.35, effect: { standing: -10, health: -6, log: "정보 유출 혐의로 심문을 받음" } } },
          { title: "수첩을 태우고 검사를 받는다", desc: "무사하지만 세월이 재가 된다",
            effect: { standing: 3, happiness: -8, traits: { "신중": 1 },
                      memory: "아궁이 속의 수첩", log: "감찰 전에 천룡인 수첩을 불태움" } },
          { title: "수첩을 감찰부 고발에 쓴다", desc: "부패를 치지만 적이 많아진다",
            effect: { standing: 6, reputation: 4, relationship: -5, traits: { "야심": 1 },
                      log: "수첩의 기록으로 행차 비리를 감찰부에 고발함" } }
        ]
      },
      "*": {}
    }
  },

  // ── 천룡인 호위 명령을 거부함 (cb_goal_revenge 해군 → f_cb_revenge_refused_guard) ──
  {
    key: "cb2_revenge_refused_guard",
    flags: ["f_cb_revenge_refused_guard"],
    after: 6,
    when: { minAge: 26, maxAge: 60 },
    title: "멈춰 버린 진급표",
    body: "몇 해 전 천룡인 호위 명령을 정면으로 거부한 뒤로 당신의 진급표는 그 자리에 멈춰 있습니다. 오늘 새 상관이 그 기록을 지워 주겠다며 조건을 내밉니다. 이번 행차의 호위를 맡으라는 것입니다. 그날 이야기를 전해 들은 젊은 병사들이 당신의 대답을 지켜봅니다.",
    choices: [
      { title: "이번에도 거부한다", desc: "병사들은 따르지만 진급은 끝이다",
        effect: { standing: -8, happiness: 6, relationship: 3, traits: { "용기": 1 },
                  memory: "두 번째로 내려놓은 명령서", log: "천룡인 호위 명령을 두 번째로 거부함" } },
      { title: "호위를 맡아 기록을 지운다", desc: "길은 열리지만 그날이 무색해진다",
        effect: { standing: 8, happiness: -8, relationship: -3, traits: { "야심": 1 },
                  log: "기록을 지우는 대가로 천룡인 행차를 호위함" } },
      { title: "호위 중 쇠고리를 몰래 푼다", desc: "한 사람을 구하지만 들키면 끝이다",
        effect: { relationship: 5, happiness: 5, standing: 3, traits: { "선량": 1 },
                  log: "행차 호위 중 노예의 쇠고리를 몰래 풀어 줌" },
        risk: { chance: 0.35, effect: { standing: -10, health: -8, log: "쇠고리를 푼 일이 드러나 문책당함" } } }
    ],
    by: {
      "해군": {},
      "해적|혁명군": {
        body: "제복을 벗은 지금도 천룡인 호위를 거부한 해군이었다는 이야기는 당신을 따라다닙니다. 오늘 천룡인의 호위 함대를 습격할 기회가 왔는데, 망원경 속 호위선 갑판에 그날 당신 곁에 서 있던 옛 부하들의 얼굴이 보입니다.",
        choices: [
          { title: "노예선만 골라 친다", desc: "사람을 구하지만 원수는 놓친다",
            effect: { relationship: 5, bounty: "+15%", traits: { "선량": 1 },
                      log: "옛 부하들의 배를 피해 노예선만 덮침" },
            risk: { chance: 0.25, effect: { health: -8, log: "노예선 간수와 싸우다 다침" } } },
          { title: "깃발을 향해 정면으로 간다", desc: "이름은 오르지만 옛 부하와 싸운다",
            effect: { standing: 7, bounty: "+40%", happiness: -5, traits: { "용기": 1 },
                      log: "옛 부하들이 지키는 천룡인 함선을 정면으로 들이침" },
            risk: { chance: 0.35, effect: { health: -16, log: "옛 부하의 칼에 크게 다침" } } },
          { title: "옛 부하에게 편지를 띄운다", desc: "길을 열지 모르지만 그를 위험에 빠뜨린다",
            effect: { knowledge: 4, relationship: 3, traits: { "신중": 1 },
                      log: "호위선의 옛 부하에게 몰래 편지를 띄움" },
            risk: { chance: 0.3, effect: { relationship: -6, log: "편지가 들통나 옛 부하가 끌려갔다는 소식을 들음" } } }
        ]
      },
      "*": {
        body: "제복을 벗은 지금도 천룡인 호위를 거부한 해군이었다는 이야기는 당신을 따라다닙니다. 오늘 {여기}의 당신 집에 목에 쇠고리 자국이 남은 사람들이 찾아옵니다. 그날 행렬에서 걸었던 이들이라며, 떠도는 소문만 믿고 숨을 곳을 청합니다.",
        choices: [
          { title: "집을 내어 숨겨 준다", desc: "사람을 살리지만 쫓기게 될 수 있다",
            effect: { relationship: 6, money: -100000, traits: { "선량": 1 },
                      memory: "쇠고리 자국의 손님들", log: "행렬에서 걸었던 사람들을 집에 숨겨 줌" },
            risk: { chance: 0.3, effect: { health: -8, log: "추적자들이 들이닥쳐 몸싸움이 남" } } },
          { title: "옛 인맥으로 새 신분을 만든다", desc: "확실하지만 내 이름도 걸린다",
            effect: { happiness: 6, money: -60000, traits: { "용기": 1 },
                      log: "해군 시절 인맥으로 그들의 새 신분을 마련함" },
            risk: { chance: 0.3, effect: { reputation: -6, log: "서류를 꾸민 일이 들통나 조사를 받음" } } },
          { title: "길만 일러 주고 떠나보낸다", desc: "안전하지만 마음이 무겁다",
            effect: { relationship: 2, happiness: -5, health: 2, traits: { "신중": 1 },
                      log: "쇠고리 자국의 사람들에게 길만 일러 주고 보냄" } }
        ]
      }
    }
  },

  // ── 약탈한 보물을 무인도에 묻음 (cb_goal_rich 해적 → f_cb_rich_buried) ──
  {
    key: "cb2_rich_buried",
    flags: ["f_cb_rich_buried"],
    after: 7,
    when: { minAge: 27, maxAge: 70 },
    title: "무인도의 금고",
    body: "몇 해 전 선원들 몰래 무인도에 묻어 둔 약탈 금고를 파내러 갑니다. 그런데 모래를 헤치는 당신 뒤로 늙은 갑판장이 따라와 서 있습니다. 그동안 당신이 홀로 배를 떠나던 밤들을 그는 다 세고 있었다고 합니다. 뒤로 선원들의 발소리가 들립니다.",
    choices: [
      { title: "선장 몫이라며 다 챙긴다", desc: "금고는 차지만 선원들이 등을 돌린다",
        effect: { money: 650000, relationship: -6, traits: { "야심": 1 },
                  log: "무인도에 묻은 금고를 선장 몫으로 다 챙김" },
        risk: { chance: 0.3, effect: { health: -12, log: "몫에 성난 선원들과 칼부림이 남" } } },
      { title: "선원들과 공평하게 나눈다", desc: "배는 하나가 되지만 내 몫은 적다",
        effect: { money: 150000, relationship: 6, standing: 3, traits: { "선량": 1 },
                  memory: "모래 위에 쏟은 금화", log: "무인도의 금고를 선원들과 공평하게 나눔" } },
      { title: "금고를 배 수리에 쏟는다", desc: "배는 튼튼해지지만 손에는 없다",
        effect: { skills: { "제작": 5 }, standing: 4, happiness: -4, traits: { "신중": 1 },
                  log: "무인도의 금고를 털어 배를 통째로 손봄" } }
    ],
    by: {
      "해군": {
        body: "몇 해 전 해적 시절 무인도에 묻어 둔 약탈 금고가 아직 그 모래 속에 있습니다. 오늘 지부에 그 섬 일대를 측량하라는 명령이 내려왔고, 측량대를 이끌 사람은 당신입니다. 금고가 나오면 그것은 당신 과거의 증거가 됩니다.",
        choices: [
          { title: "먼저 가서 몰래 파낸다", desc: "목돈이 생기지만 들키면 끝이다",
            effect: { money: 400000, happiness: -3, traits: { "야심": 1 },
                      log: "측량 전에 무인도의 금고를 몰래 파냄" },
            risk: { chance: 0.3, effect: { standing: -10, log: "섬을 몰래 드나든 일로 감찰을 받음" } } },
          { title: "압수품으로 보고한다", desc: "공은 서지만 과거가 드러날 수 있다",
            effect: { standing: 7, happiness: -6, traits: { "신중": 1 },
                      log: "무인도의 금고를 압수품으로 보고함" },
            risk: { chance: 0.2, effect: { reputation: -6, log: "금고의 옛 주인이 누구냐는 뒷말이 돎" } } },
          { title: "위치를 고아원에 알린다", desc: "누군가 살지만 내 몫은 없다",
            effect: { relationship: 5, happiness: 5, standing: -3, traits: { "선량": 1 },
                      memory: "이름 없이 보낸 지도", log: "금고의 위치를 고아원에 익명으로 알림" } }
        ]
      },
      "민간인|현상금 사냥꾼|혁명군": {
        body: "검은 깃발을 내린 지 몇 해, 당신은 해적 시절 무인도에 묻어 둔 약탈 금고를 떠올립니다. 그런데 {여기}의 항구에 옛 선원 하나가 나타나, 그 섬의 위치를 아는 사람이 당신 말고도 있다고 귀띔합니다. 그는 반을 주면 함께 가 주겠다고 합니다.",
        choices: [
          { title: "혼자 몰래 섬으로 간다", desc: "몫은 다 갖지만 위험하다",
            effect: { money: 500000, relationship: -3, traits: { "용기": 1 },
                      log: "옛 선원을 따돌리고 혼자 금고를 파 옴" },
            risk: { chance: 0.35, effect: { health: -12, money: -200000, log: "섬에서 옛 해적들과 맞닥뜨려 다침" } } },
          { title: "옛 선원과 반씩 나눈다", desc: "안전하지만 몫은 절반이다",
            effect: { money: 250000, relationship: 4, traits: { "선량": 1 },
                      log: "옛 선원과 무인도의 금고를 반씩 나눔" } },
          { title: "금고를 {고향}에 내놓는다", desc: "옛 죄를 씻지만 손에는 없다",
            effect: { reputation: 6, happiness: 6, money: -30000, traits: { "신중": 1 },
                      memory: "고향 부두의 새 방파제", log: "무인도의 금고를 고향의 방파제 공사에 내놓음" } }
        ]
      },
      "*": {}
    }
  },

  // ── 모래밭의 아이와 손잡음 (cb_kid_sandcastle_alone → f_cb_sandcastle_partner) ──
  {
    key: "cb2_sandcastle_partner",
    flags: ["f_cb_sandcastle_partner"],
    after: 6,
    when: { minAge: 24, maxAge: 60 },
    title: "파도가 쓸고 간 일터",
    body: "몇 해 전 {npc:모래밭의 아이}와 손잡고 둘이서 다시 쌓은 일터가, 간밤의 해일에 반쯤 쓸려 나갔습니다. 어릴 적 혼자 쌓던 모래성이 파도에 무너지던 날처럼, 그가 젖은 벽돌을 들고 당신을 바라봅니다. \"이번엔 어떻게 할래?\"",
    choices: [
      { title: "둘이서 처음부터 다시 쌓는다", desc: "함께 일어서지만 모은 돈이 든다",
        effect: { relationship: 6, money: -150000, happiness: 4, traits: { "선량": 1 },
                  memory: "젖은 벽돌을 나르던 새벽", log: "모래밭의 아이와 무너진 일터를 다시 쌓음" } },
      { title: "그의 몫까지 혼자 짊어진다", desc: "솜씨는 늘지만 몸이 상한다",
        effect: { skills: { "제작": 6 }, relationship: 3, health: -5, traits: { "용기": 1 },
                  log: "무너진 일터의 복구를 도맡아 홀로 짊어짐" },
        risk: { chance: 0.25, effect: { health: -8, log: "무리하다 무너진 벽에 깔릴 뻔함" } } },
      { title: "보상금을 나누고 갈라선다", desc: "돈은 남지만 다시 혼자가 된다",
        effect: { money: 200000, relationship: -6, traits: { "야심": 1 },
                  log: "해일 보상금을 나누고 모래밭의 아이와 갈라섬" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전부터 수배자인 당신의 배를 몰래 고쳐 주던 {npc:모래밭의 아이}의 조선소에 해군이 들이닥쳤다는 소식이 옵니다. 어릴 적 모래성 앞에서 등을 돌렸던 당신에게 그가 손을 내밀어 준 곳입니다. 그는 끌려가면서도 당신 이름을 대지 않았다고 합니다.",
        choices: [
          { title: "조선소를 지키러 쳐들어간다", desc: "그를 구하지만 피를 본다",
            effect: { relationship: 6, combat: 4, bounty: "+20%", traits: { "용기": 1 },
                      log: "해군에 넘어간 옛 친구의 조선소를 되찾음" },
            risk: { chance: 0.35, effect: { health: -12, log: "조선소 순찰대와 싸우다 크게 다침" } } },
          { title: "그를 빼내 배에 태운다", desc: "곁에 두지만 그의 일터는 잃는다",
            effect: { relationship: 5, skills: { "제작": 4 }, money: -100000, traits: { "선량": 1 },
                      memory: "갑판 위의 조선소 감독", log: "모래밭의 아이를 빼내 배에 태워 함께 떠남" } },
          { title: "연락을 끊고 멀리 떠난다", desc: "그를 지키지만 등을 돌린 셈이다",
            effect: { relationship: -6, standing: 4, happiness: -3, traits: { "신중": 1 },
                      log: "옛 친구를 위해 조선소와 연락을 끊고 떠남" } }
        ]
      },
      "해군": {
        body: "몇 해 전 당신이 밀어준 {npc:모래밭의 아이}의 기지 납품은 지금까지 한 번도 탈이 없었습니다. 그런데 새로 온 감사관이 옛 계약서를 넘기다가, 심사관과 납품업자가 한 동네 출신이라는 데 동그라미를 칩니다. 어릴 적 모래성 앞에서 등을 돌렸던 그 친구가 걱정스레 당신을 찾아옵니다.",
        choices: [
          { title: "사실대로 밝히고 책임진다", desc: "떳떳하지만 진급이 늦어진다",
            effect: { standing: -5, reputation: 4, relationship: 3, traits: { "용기": 1 },
                      log: "옛 친구의 납품을 밀어준 사정을 스스로 밝힘" } },
          { title: "납품 기록으로 맞서 변호한다", desc: "친구를 지키지만 감사관과 척진다",
            effect: { relationship: 6, knowledge: 3, traits: { "선량": 1 },
                      log: "흠 없는 납품 기록을 내밀어 옛 친구를 변호함" },
            risk: { chance: 0.3, effect: { standing: -8, log: "감사관의 미움을 사 한직으로 밀려남" } } },
          { title: "그가 혼자 책임지게 둔다", desc: "흠은 피하지만 친구를 또 잃는다",
            effect: { standing: 4, relationship: -7, traits: { "야심": 1 },
                      log: "감사의 책임을 옛 친구에게 떠넘김" } }
        ]
      },
      "*": {}
    }
  },

  // ── 물에 빠진 해군 병사를 건짐 (cb_dream_navy 해적|혁명군 → f_cb_saved_marine) ──
  {
    key: "cb2_saved_marine",
    flags: ["f_cb_saved_marine"],
    after: 7,
    when: { minAge: 25, maxAge: 60 },
    title: "젖은 모자의 주인",
    body: "{여기} 앞바다에서 해군 군함이 당신 배의 앞길을 막아섭니다. 뱃머리에 선 젊은 장교는 몇 해 전 당신이 밧줄을 던져 건져 낸 그 앳된 병사입니다. 그는 확성기 대신 낮은 목소리로 외칩니다. \"한 번은 빚을 갚겠소. 오늘 실은 짐을 두고 가면 길을 열어 주지.\"",
    choices: [
      { title: "짐을 두고 그 길로 빠져나간다", desc: "모두 살지만 한 철 벌이를 잃는다",
        effect: { money: -200000, happiness: 4, relationship: 3, traits: { "신중": 1 },
                  log: "건져 줬던 해군 장교가 열어 준 길로 빠져나감" } },
      { title: "빚은 필요 없다며 맞붙는다", desc: "이름은 오르지만 은인과 싸운다",
        effect: { combat: 5, bounty: "+25%", happiness: -4, traits: { "용기": 1 },
                  log: "건져 줬던 해군 장교의 군함과 정면으로 맞붙음" },
        risk: { chance: 0.35, effect: { health: -12, log: "옛 병사가 지휘하는 포격에 크게 다침" } } },
      { title: "보트를 내려 그와 이야기한다", desc: "마음이 통할지 함정일지 모른다",
        effect: { relationship: 6, knowledge: 3, traits: { "선량": 1 },
                  memory: "두 배 사이의 작은 보트", log: "건져 줬던 해군 장교와 바다 위에서 이야기를 나눔" },
        risk: { chance: 0.25, effect: { health: -8, bounty: "+10%", log: "보트로 다가간 틈에 저격을 당함" } } }
    ],
    by: {
      "해군": {
        body: "새로 부임한 상관의 얼굴을 보는 순간 당신은 숨을 멈춥니다. 몇 해 전 해적이던 당신이 밧줄을 던져 건져 낸 그 앳된 병사입니다. 그도 당신을 알아본 듯, 둘만 남은 집무실에서 오래 말이 없다가 묻습니다. \"그때 그 배에 있던 사람, 당신이었지?\"",
        choices: [
          { title: "그때 일을 털어놓는다", desc: "마음은 놓이지만 운을 그에게 건다",
            effect: { relationship: 6, happiness: 4, traits: { "용기": 1 },
                      memory: "집무실의 긴 침묵", log: "새 상관에게 해적 시절 그를 건진 일을 털어놓음" },
            risk: { chance: 0.3, effect: { standing: -8, log: "옛 해적 경력이 상부에 알려짐" } } },
          { title: "사람을 잘못 봤다고 한다", desc: "흠은 없지만 그가 서운해한다",
            effect: { standing: 3, relationship: -4, happiness: -3, traits: { "신중": 1 },
                      log: "새 상관의 물음에 끝내 모른다고 답함" } },
          { title: "그 빚을 갚으라고 요구한다", desc: "길은 열리지만 은혜가 거래가 된다",
            effect: { standing: 7, relationship: -6, traits: { "야심": 1 },
                      log: "건져 준 빚을 내세워 새 상관에게 승진을 청함" } }
        ]
      },
      "민간인|현상금 사냥꾼": {
        body: "바다를 떠나 뭍에 자리 잡은 당신의 집에 해군 장교 하나가 찾아와 젖은 해군 모자를 내밉니다. 몇 해 전 당신이 밧줄을 던져 건져 낸 그 앳된 병사입니다. 그는 은혜를 갚고 싶다며 사례금과 함께 해군 기지의 일자리를 권합니다.",
        choices: [
          { title: "사례금을 받는다", desc: "살림은 펴지만 은혜가 값이 된다",
            effect: { money: 200000, relationship: -3, traits: { "야심": 1 },
                      log: "건져 줬던 해군 장교의 사례금을 받음" } },
          { title: "술 한잔으로 갈음한다", desc: "벗이 생기지만 손에 남는 건 없다",
            effect: { relationship: 6, money: -20000, traits: { "선량": 1 },
                      memory: "다시 받은 젖은 모자", log: "사례를 사양하고 해군 장교와 술잔을 나눔" } },
          { title: "기지 경비 일을 맡는다", desc: "자리는 생기지만 몸이 고되다",
            effect: { standing: 5, health: -5, traits: { "용기": 1 },
                      log: "건져 줬던 장교의 소개로 기지 경비 일을 맡음" },
            risk: { chance: 0.25, effect: { health: -8, log: "옛 해적 동료와 마주쳐 다툼이 남" } } }
        ]
      },
      "*": {}
    }
  },

]);

CB([
  // ── 해적 시절 물에 빠진 해군 병사들을 건짐 (f_cb_saved_marines ← cb_goal_navy_hero) ──
  {
    key: "cb2_saved_marines",
    flags: ["f_cb_saved_marines"],
    after: 6,
    when: { minAge: 26, maxAge: 66 },
    title: "젖은 모자의 장교",
    body: "몇 해 전 폭풍이 지난 바다에서 반쯤 가라앉은 군함의 해군 병사들을 건져 올린 일이 있습니다. 오늘 {여기}의 집 앞에 해군 장교 하나가 찾아와 젖은 모자를 내밀며 그때 건져진 병사라고 말합니다. 그는 당신의 옛 해적 기록을 지워 주겠다며, 대신 옛 동료들의 행방을 묻습니다.",
    choices: [
      { title: "옛 동료들의 행방을 알려 준다", desc: "기록은 지워지지만 배신이다",
        effect: { standing: 6, reputation: 4, relationship: -6, traits: { "야심": 1 },
                  log: "옛 동료의 행방을 넘기고 해적 기록을 지움" },
        risk: { chance: 0.25, effect: { health: -8, log: "배신을 알게 된 옛 동료에게 습격당함" } } },
      { title: "모자만 받고 돌려보낸다", desc: "의리는 지키지만 기록은 남는다",
        effect: { happiness: 4, relationship: 3, reputation: -4, traits: { "신중": 1 },
                  memory: "돌려받은 젖은 해군 모자", log: "옛 동료의 행방을 끝내 말하지 않음" } },
      { title: "그와 함께 바다를 지킨다", desc: "새 길이 열리지만 옛 동료가 등 돌린다",
        effect: { combat: 4, standing: 4, relationship: -4, traits: { "용기": 1 },
                  memory: "장교와 나란히 선 방파제", log: "옛날 건진 장교를 따라 해안 경비에 나섬" },
        risk: { chance: 0.25, effect: { health: -8, log: "해안 경비 중 해적의 칼에 베임" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 폭풍 뒤 가라앉던 군함에서 건져 올린 해군 병사들, 젖은 모자를 쥐고 떨던 얼굴을 당신은 기억합니다. 오늘 해협을 막은 추격선 뱃머리에 선 장교가 바로 그때의 병사입니다. 그가 신호기로 \"서쪽 물길은 한 시간 비어 있다\"고 알려 옵니다.",
        choices: [
          { title: "서쪽 물길로 빠져나간다", desc: "살아 나가지만 그에게 빚을 진다",
            effect: { relationship: 4, standing: -4, traits: { "신중": 1 },
                      memory: "한 시간 비어 있던 물길", log: "옛날 건진 장교가 열어 준 물길로 빠져나감" },
            risk: { chance: 0.2, effect: { happiness: -6, log: "길을 열어 준 장교가 강등됐다는 소식을 들음" } } },
          { title: "함정이라 보고 정면 돌파한다", desc: "이름은 오르지만 피를 본다",
            effect: { standing: 7, bounty: "+25%", health: -5, traits: { "용기": 1 },
                      log: "옛 은인의 신호를 무시하고 포위망을 뚫음" },
            risk: { chance: 0.3, effect: { health: -10, log: "포위망을 뚫다 포탄 파편에 맞음" } } },
          { title: "그에게 함대 정보를 청한다", desc: "쓸모는 크지만 그를 벼랑에 세운다",
            effect: { knowledge: 4, standing: 5, relationship: -3, traits: { "야심": 1 },
                      memory: "신호기로 오간 마지막 부탁", log: "옛날 건진 해군 장교에게 함대 정보를 받아 냄" },
            risk: { chance: 0.3, effect: { happiness: -7, log: "정보를 흘린 장교가 군법회의에 넘겨짐" } } }
        ]
      },
      "해군": {
        body: "해적 시절 폭풍 속에서 건져 올린 해군 병사가 지금 당신의 상관이 되어 있습니다. 그는 당신의 과거를 아는 유일한 사람이고, 이번 진급 심사의 추천서를 쓸 사람도 그입니다. 오늘 그가 오래된 젖은 모자 하나를 책상에 올려놓고 당신을 부릅니다.",
        choices: [
          { title: "과거를 감찰에 먼저 밝힌다", desc: "떳떳하지만 진급이 늦어진다",
            effect: { standing: -5, reputation: 4, happiness: 3, traits: { "신중": 1 },
                      log: "해적 시절의 과거를 감찰에 스스로 밝힘" },
            risk: null },
          { title: "그의 추천서로 진급한다", desc: "빠르지만 그에게 매인다",
            effect: { standing: 7, happiness: -3, traits: { "야심": 1 },
                      memory: "상관이 써 준 추천서", log: "옛날 건진 상관의 추천서로 진급함" },
            risk: { chance: 0.25, effect: { standing: -8, log: "상관과의 옛 인연이 들통나 진급이 취소됨" } } },
          { title: "그와 같은 배를 자원한다", desc: "믿을 전우지만 험한 배다",
            effect: { relationship: 6, health: -4, traits: { "선량": 1 },
                      memory: "상관 책상 위 젖은 모자", log: "옛날 건진 상관과 같은 함선을 자원함" },
            risk: { chance: 0.2, effect: { health: -8, log: "상관과 함께 나선 출동에서 다침" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 마을 학교에 수리비를 보탬 (f_cb_school_saved ← cb_school_village) ──
  {
    key: "cb2_school_saved",
    flags: ["f_cb_school_saved"],
    after: 8,
    when: { minAge: 28, maxAge: 78 },
    title: "다시 울리는 학교 종",
    body: "{고향}의 마을 학교 종이 아직 울린다는 편지가 옵니다. 몇 해 전 녹여 팔릴 뻔한 그 종을 당신이 보탠 수리비로 지켜 냈습니다. 올해 졸업생 하나가 당신 이름을 딴 장학금을 만들자고 나섰고, 교장은 당신이 졸업식 단상에서 한마디 해 주기를 바랍니다.",
    choices: [
      { title: "장학금을 직접 맡는다", desc: "아이들이 배우지만 해마다 돈이 든다",
        effect: { money: -200000, standing: 5, relationship: 3, traits: { "선량": 1 },
                  memory: "다시 울린 학교 종소리", log: "마을 학교에 자기 이름의 장학금을 세움" } },
      { title: "단상에 서서 이름을 알린다", desc: "이름은 나지만 빈말이란 뒷말도 돈다",
        effect: { reputation: 6, happiness: 3, money: -20000, traits: { "야심": 1 },
                  memory: "졸업식 단상의 떨리는 손", log: "마을 학교 졸업식 단상에서 축사를 함" },
        risk: { chance: 0.25, effect: { relationship: -4, log: "말뿐인 후원자라는 뒷말이 돎" } } },
      { title: "이름은 빼 달라고 답한다", desc: "조용하지만 학교와 멀어진다",
        effect: { happiness: -3, relationship: -2, knowledge: 2, traits: { "신중": 1 },
                  log: "장학금에서 자기 이름을 빼 달라고 답함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 이름 없이 보낸 돈 꾸러미로 {고향}의 마을 학교가 살아남았습니다. 오늘 그 학교를 나온 젊은 교사가 당신 배를 찾아와, 해군이 돈의 출처를 캐며 학교를 닫으려 한다고 알립니다. 그는 당신이 직접 나서야 학교가 산다고 믿습니다.",
        choices: [
          { title: "돈의 주인이 나라고 밝힌다", desc: "학교는 살지만 이름이 퍼진다",
            effect: { standing: 6, bounty: "+20%", happiness: 4, traits: { "용기": 1 },
                      memory: "교사가 전한 종소리 이야기", log: "학교 돈의 주인이 자신이라고 해군에 밝힘" },
            risk: { chance: 0.25, effect: { health: -8, log: "고향 앞바다에서 해군 추격선과 부딪침" } } },
          { title: "교사에게 새 돈을 쥐여 보낸다", desc: "급한 불은 끄지만 의심은 커진다",
            effect: { money: -150000, relationship: 4, traits: { "선량": 1 },
                      log: "젊은 교사에게 학교를 지킬 돈을 쥐여 보냄" },
            risk: { chance: 0.3, effect: { relationship: -5, log: "두 번째 돈 꾸러미 때문에 교사가 끌려감" } } },
          { title: "학교와 연을 끊는다", desc: "학교를 지키려 멀어진다",
            effect: { happiness: -6, knowledge: 2, traits: { "신중": 1 },
                      memory: "끝내 듣지 못한 고향 종소리", log: "학교를 지키려 모든 연락을 끊음" } }
        ]
      },
      "해군": {
        body: "월급을 떼어 지켜 낸 {고향}의 마을 학교에서 올해 졸업생 셋이 해군 신병 모집에 붙었습니다. 교장은 당신을 보고 바다를 꿈꾸게 된 아이들이라며 편지에 이름을 적어 보냈습니다. 신병들이 어디로 배치될지는 당신 손에 일부 달려 있습니다.",
        choices: [
          { title: "세 아이를 내 함선에 받는다", desc: "든든하지만 아이들이 험한 바다에 선다",
            effect: { relationship: 5, standing: 3, traits: { "선량": 1 },
                      memory: "고향 억양의 신병 셋", log: "고향 학교 출신 신병 셋을 자기 함선에 받음" },
            risk: { chance: 0.25, effect: { happiness: -8, log: "고향 아이 하나가 첫 출동에서 크게 다침" } } },
          { title: "안전한 지부로 보낸다", desc: "아이들은 무사하지만 서운해한다",
            effect: { relationship: -3, happiness: 3, standing: 2, traits: { "신중": 1 },
                      memory: "후방으로 떠난 고향 신병들", log: "고향 학교 출신 신병들을 후방 지부로 보냄" },
            risk: null },
          { title: "규정대로 배치를 맡긴다", desc: "공정하지만 인연은 묻힌다",
            effect: { standing: 5, relationship: -4, traits: { "야심": 1 },
                      log: "고향 신병들의 배치를 규정대로 맡김" },
            risk: null }
        ]
      },
      "*": {}
    }
  },

  // ── 가뭄 작물의 씨앗을 받아 둠 (f_cb_seed_kept ← cb_hobby_gardening) ──
  {
    key: "cb2_seed_kept",
    flags: ["f_cb_seed_kept"],
    after: 6,
    when: { minAge: 22, maxAge: 86 },
    title: "찬장 위의 씨앗 주머니",
    body: "가뭄을 견딘 작물에서 받아 둔 씨앗 주머니가 몇 해째 찬장 위에 있습니다. 올해 {여기}에 다시 가뭄이 들자 이웃 밭은 모두 누렇게 타들어 가는데, 그 씨앗을 심은 당신의 이랑만 푸르게 버팁니다. 소문을 들은 큰 상단이 씨앗을 통째로 사겠다고 찾아왔습니다.",
    choices: [
      { title: "이웃 밭마다 씨앗을 나눈다", desc: "마을이 살지만 내 몫은 없다",
        effect: { relationship: 6, standing: 4, money: -20000, traits: { "선량": 1 },
                  memory: "이웃 밭마다 오른 푸른 싹", log: "가뭄 씨앗을 이웃 밭마다 나눠 줌" } },
      { title: "상단에 통째로 판다", desc: "큰돈이지만 이웃은 등을 돌린다",
        effect: { money: 400000, relationship: -6, traits: { "야심": 1 },
                  log: "가뭄 씨앗을 큰 상단에 통째로 팖" } },
      { title: "직접 종자를 늘려 판다", desc: "오래 남지만 몸이 고되다",
        effect: { knowledge: 3, money: 120000, health: -6, traits: { "용기": 1 },
                  memory: "새벽 종자밭의 흙냄새", log: "가뭄 씨앗을 직접 늘려 종자로 팖" },
        risk: { chance: 0.25, effect: { money: -60000, log: "늘리던 종자밭이 병충해로 망함" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "해군의 봉쇄로 식량이 끊긴 섬에 배를 댔습니다. 짐 속에는 몇 해 전 가뭄을 견딘 작물에서 받아 둔 씨앗 주머니가 아직 있습니다. 마른 밭을 일구던 섬 노인이 그 주머니를 보더니, 배의 식량과 무엇이든 바꾸자고 합니다.",
        choices: [
          { title: "섬사람들에게 씨앗을 준다", desc: "섬이 살지만 배는 굶는다",
            effect: { relationship: 5, standing: 4, health: -3, traits: { "선량": 1 },
                      memory: "봉쇄된 섬의 푸른 이랑", log: "봉쇄된 섬에 가뭄 씨앗을 나눠 줌" },
            risk: null },
          { title: "씨앗을 식량과 바꾼다", desc: "배는 배부르지만 섬은 굶는다",
            effect: { health: 6, relationship: -5, traits: { "야심": 1 },
                      log: "가뭄 씨앗을 섬의 마지막 식량과 바꿈" },
            risk: null },
          { title: "봉쇄선을 뚫고 식량을 들인다", desc: "섬을 살리지만 해군과 부딪친다",
            effect: { standing: 6, bounty: "+20%", traits: { "용기": 1 },
                      memory: "씨앗 주머니를 쥔 노인", log: "씨앗은 섬에 두고 봉쇄선을 뚫어 식량을 들임" },
            risk: { chance: 0.3, effect: { health: -10, log: "봉쇄선을 뚫다 포격에 다침" } } }
        ]
      },
      "해군": {
        body: "주둔 중인 섬이 흉년으로 굶주립니다. 몇 해 전 가뭄을 견딘 작물에서 받아 둔 씨앗 주머니를 꺼내자, 보급 장교는 군 식량 시험 재배에 쓰자고 하고 섬 노인들은 자기 밭에 심게 해 달라고 합니다.",
        choices: [
          { title: "섬 노인들의 밭에 나눈다", desc: "섬이 살지만 상부는 못마땅하다",
            effect: { relationship: 6, standing: -3, traits: { "선량": 1 },
                      memory: "주둔지 밭의 첫 푸른 싹", log: "가뭄 씨앗을 주둔지 섬 노인들에게 나눔" },
            risk: null },
          { title: "군 시험 재배에 넘긴다", desc: "공이 되지만 섬은 기다려야 한다",
            effect: { standing: 6, relationship: -4, knowledge: 2, traits: { "야심": 1 },
                      log: "가뭄 씨앗을 군 식량 시험 재배에 넘김" },
            risk: null },
          { title: "휴가를 내고 직접 심는다", desc: "둘 다 챙기지만 몸이 고되다",
            effect: { relationship: 3, standing: 2, health: -6, traits: { "용기": 1 },
                      memory: "휴가 내내 맨 흙 묻은 군화", log: "휴가를 내고 주둔지 밭에 가뭄 씨앗을 심음" },
            risk: { chance: 0.25, effect: { standing: -4, log: "밭일에 매달린 사이 당직을 놓쳐 문책당함" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 모닥불 곁에 끝까지 남음 (f_cb_shy_stayed ← cb_kid_shy_first_friend) ──
  {
    key: "cb2_shy_stayed",
    flags: ["f_cb_shy_stayed"],
    after: 6,
    when: { minAge: 23, maxAge: 55 },
    title: "모닥불 벗들의 부름",
    body: "몇 해 전 축제 모닥불 곁에서 도망치지 않고 끝까지 남았던 밤, 그때 처음 본 무리가 이제 당신의 가장 가까운 벗들이 되었습니다. 그중 하나가 큰 빚을 지고 섬을 떠나려 하는데, 다른 벗들은 당신이 먼저 나서 주기를 바라는 눈치입니다.",
    choices: [
      { title: "앞장서 돈을 모은다", desc: "벗을 붙잡지만 큰돈이 든다",
        effect: { money: -200000, relationship: 6, traits: { "선량": 1 },
                  memory: "다시 피운 축제 모닥불", log: "모닥불 벗들과 돈을 모아 친구의 빚을 막음" } },
      { title: "떠나는 배를 함께 탄다", desc: "곁을 지키지만 삶을 접는다",
        effect: { relationship: 5, happiness: -4, skills: { "항해술": 3 }, traits: { "용기": 1 },
                  memory: "벗과 나눠 쥔 뱃삯", log: "빚을 진 벗과 함께 섬을 떠나는 배를 탐" },
        risk: { chance: 0.25, effect: { health: -8, log: "벗과 떠난 뱃길에서 폭풍을 만남" } } },
      { title: "한 걸음 물러나 지켜본다", desc: "옛 버릇이 돌아온다",
        effect: { knowledge: 3, relationship: -5, traits: { "신중": 1 },
                  log: "벗의 빚 앞에서 다시 한 발 물러섬" } }
    ],
    by: {
      "해적|혁명군": {
        title: "그 잔의 무게",
        body: "몇 해 전 은신처에서 다른 무리의 우두머리가 내민 잔을 받은 뒤로, 두 무리는 같은 편에서 싸워 왔습니다. 오늘 그 우두머리가 해군 함대에 쫓겨 당신에게 구원을 청합니다. 그를 도우면 함대가 당신 쪽으로도 뱃머리를 돌릴 겁니다.",
        choices: [
          { title: "함대 앞에 뱃머리를 들이민다", desc: "의리를 지키지만 큰 싸움이다",
            effect: { standing: 7, bounty: "+30%", health: -5, traits: { "용기": 1 },
                      memory: "같은 편에서 맡은 포연", log: "잔을 나눈 우두머리를 구하러 함대에 맞섬" },
            risk: { chance: 0.3, effect: { health: -10, log: "함대와의 포격전에서 크게 다침" } } },
          { title: "그의 선원들을 거두어 숨긴다", desc: "무리를 살리지만 짐이 는다",
            effect: { relationship: 5, money: -150000, traits: { "선량": 1 },
                      memory: "은신처에 늘어난 해먹", log: "쫓기는 동맹의 선원들을 거두어 숨김" },
            risk: null },
          { title: "그의 항로를 차지한다", desc: "실리는 크지만 배신자가 된다",
            effect: { money: 300000, standing: -5, relationship: -4, traits: { "야심": 1 },
                      log: "쫓기는 동맹을 버리고 그의 항로를 차지함" },
            risk: null }
        ]
      },
      "해군": {
        title: "모닥불 동기의 군법회의",
        body: "출항 전날 밤 갑판 모닥불 곁에 끝까지 남았던 동기들이 이제 각자 함선을 맡는 장교가 되었습니다. 그중 하나가 작전 실패의 책임을 뒤집어쓰고 군법회의에 섰는데, 그날 밤 그가 털어놓은 말을 들은 사람은 당신뿐입니다.",
        choices: [
          { title: "동기 편에서 증언한다", desc: "전우를 살리지만 상부 눈 밖에 난다",
            effect: { relationship: 6, standing: -5, traits: { "선량": 1 },
                      memory: "군법회의장의 동기 얼굴", log: "군법회의에서 모닥불 동기의 편에 서서 증언함" },
            risk: null },
          { title: "보고서만 제출한다", desc: "흠은 없지만 동기는 홀로 선다",
            effect: { standing: 4, relationship: -5, traits: { "신중": 1 },
                      log: "동기의 군법회의에 보고서만 내고 물러섬" },
            risk: null },
          { title: "진짜 책임자를 캐낸다", desc: "판을 뒤집지만 적이 생긴다",
            effect: { standing: 7, knowledge: 3, traits: { "용기": 1 },
                      memory: "밤새 뒤진 작전 일지", log: "작전 실패의 진짜 책임자를 캐내 동기를 구함" },
            risk: { chance: 0.3, effect: { health: -8, log: "윗선의 사람에게 밤길에 습격당함" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 장물아비의 상자를 싣고 보급 길을 얻음 (f_cb_smuggle_route ← cb_kid_pirate_odd_job) ──
  {
    key: "cb2_smuggle_route",
    flags: ["f_cb_smuggle_route"],
    after: 6,
    when: { minAge: 26, maxAge: 61 },
    title: "장물아비의 마지막 상자",
    body: "몇 해 전 늙은 장물아비의 상자를 싣고 얻은 보급 길은, 당신이 바다를 떠난 뒤에도 그의 장부에 당신 이름으로 남아 있습니다. 오늘 {여기}에 그의 아들이 찾아와 아버지가 해군에 잡혔다며, 그 길을 아는 마지막 사람인 당신에게 짐 한 번만 옮겨 달라고 합니다.",
    choices: [
      { title: "마지막 짐을 옮겨 준다", desc: "의리는 지키지만 옛 길로 돌아간다",
        effect: { money: 150000, relationship: 3, traits: { "용기": 1 },
                  memory: "밤바다의 마지막 짐", log: "장물아비의 아들 대신 마지막 짐을 옮겨 줌" },
        risk: { chance: 0.3, effect: { reputation: -8, log: "옛 밀수 길이 드러나 이름이 더럽혀짐" } } },
      { title: "아들에게 길을 넘겨준다", desc: "손을 떼지만 아이를 그 길에 세운다",
        effect: { relationship: 4, happiness: -5, traits: { "선량": 1 },
                  memory: "장물아비 아들의 젖은 장부", log: "옛 보급 길을 장물아비의 아들에게 넘겨줌" } },
      { title: "보급 길을 해군에 알린다", desc: "과거를 끊지만 원한을 산다",
        effect: { standing: 5, relationship: -5, traits: { "신중": 1 },
                  log: "옛 밀수 보급 길을 해군에 알림" },
        risk: { chance: 0.25, effect: { health: -8, log: "장물아비 패거리에게 밤길에 습격당함" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 늙은 장물아비의 상자를 싣고 얻은 보급 길 덕분에 당신 배는 한 번도 굶지 않았습니다. 오늘 그가 보낸 마지막 상자를 열자 화약 대신 해군 기밀 문서가 나옵니다. 장물아비는 이미 잡혔고, 문서를 찾는 해군과 다른 해적단이 이 항로로 몰려옵니다.",
        choices: [
          { title: "문서를 비싸게 판다", desc: "큰돈이지만 보급 길이 끊긴다",
            effect: { money: 500000, happiness: -4, traits: { "야심": 1 },
                      log: "장물아비의 마지막 상자 속 기밀 문서를 팔아넘김" },
            risk: { chance: 0.25, effect: { health: -10, log: "문서를 노린 해적단과 바다에서 부딪침" } } },
          { title: "장물아비를 구하러 간다", desc: "은혜를 갚지만 목숨을 건다",
            effect: { relationship: 6, bounty: "+25%", traits: { "용기": 1 },
                      memory: "호송선의 녹슨 쇠사슬", log: "잡혀간 장물아비를 구하러 호송선을 덮침" },
            risk: { chance: 0.35, effect: { health: -12, log: "호송선을 덮치다 총탄에 맞음" } } },
          { title: "문서를 바다에 버린다", desc: "화는 피하지만 보급 길을 잃는다",
            effect: { knowledge: 2, health: -3, happiness: -3, traits: { "신중": 1 },
                      memory: "가라앉는 문서 꾸러미", log: "기밀 문서를 읽고 바다에 버림" },
            risk: null }
        ]
      },
      "해군": {
        body: "해적 시절 장물아비에게 얻은 보급 길이 이번 단속 지도에 그대로 그려져 있습니다. 그 길을 가장 잘 아는 사람은 당신이고, 붙잡힌 장물아비는 심문실에서 당신 이름을 댈지 말지 고민하고 있습니다.",
        choices: [
          { title: "단속을 직접 이끈다", desc: "큰 공이지만 옛 얼굴과 마주한다",
            effect: { standing: 8, happiness: -5, traits: { "야심": 1 },
                      log: "옛 밀수 보급 길의 단속을 직접 이끎" },
            risk: { chance: 0.3, effect: { standing: -8, log: "장물아비가 옛 일을 불어 감찰이 붙음" } } },
          { title: "장물아비와 입을 맞춘다", desc: "과거는 묻히지만 빚이 생긴다",
            effect: { money: -100000, happiness: 3, traits: { "신중": 1 },
                      memory: "심문실 창살 너머의 눈짓", log: "심문실의 장물아비와 몰래 입을 맞춤" },
            risk: { chance: 0.25, effect: { reputation: -6, log: "장물아비와의 밀담이 소문으로 번짐" } } },
          { title: "상관에게 옛 일을 털어놓는다", desc: "떳떳하지만 점수를 잃는다",
            effect: { standing: -5, reputation: 4, relationship: 3, traits: { "선량": 1 },
                      memory: "상관 앞에 내려놓은 옛 장부", log: "해적 시절 밀수 길을 상관에게 털어놓음" },
            risk: null }
        ]
      },
      "*": {}
    }
  },

  // ── 옛 해적선과 동맹을 맺음 (f_cb_stowaway_ally ← cb_kid_stowaway) ──
  {
    key: "cb2_stowaway_ally",
    flags: ["f_cb_stowaway_ally"],
    after: 7,
    when: { minAge: 25, maxAge: 62 },
    title: "갑판장의 마지막 술잔",
    body: "바다를 떠난 당신에게, 몇 해 전 동맹을 맺었던 {해적단}의 선원 하나가 찾아옵니다. 화물칸의 생쥐라 부르던 늙은 갑판장이 죽으며 당신 몫이라고 남긴 상자를 건네고, 동맹의 맹세대로 이번 싸움에 한 번만 함께해 달라고 합니다.",
    choices: [
      { title: "마지막으로 한 번 더 나선다", desc: "맹세는 지키지만 삶이 흔들린다",
        effect: { combat: 5, relationship: 4, reputation: -5, traits: { "용기": 1 },
                  memory: "갑판장 없는 갑판의 밤", log: "옛 동맹의 맹세대로 마지막 싸움에 나섬" },
        risk: { chance: 0.3, effect: { health: -10, log: "옛 동맹의 싸움에서 깊이 베임" } } },
      { title: "상자만 받고 맹세를 거둔다", desc: "돈은 남지만 옛정이 끊긴다",
        effect: { money: 200000, relationship: -5, traits: { "야심": 1 },
                  log: "갑판장의 상자만 받고 동맹의 맹세를 거둠" } },
      { title: "상자도 맹세도 돌려보낸다", desc: "깨끗하지만 쓸쓸하다",
        effect: { happiness: -5, reputation: 3, traits: { "신중": 1 },
                  memory: "돌려보낸 갑판장의 상자", log: "갑판장의 상자와 동맹의 맹세를 모두 돌려보냄" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 동맹을 맺은 {해적단}의 늙은 갑판장이 숨을 거두기 직전 당신을 부릅니다. \"화물칸의 생쥐에게 이 배를 맡기고 싶다\"는 말에 그쪽 선원들이 술렁입니다. 선장 자리를 노리던 부선장이 칼자루를 쥡니다.",
        choices: [
          { title: "두 배를 합쳐 깃발을 올린다", desc: "세력은 커지지만 부선장과 싸운다",
            effect: { standing: 7, bounty: "+30%", traits: { "용기": 1 },
                      memory: "갑판장의 마지막 술잔", log: "옛 동맹의 배를 물려받아 두 배를 합침" },
            risk: { chance: 0.35, effect: { health: -12, log: "부선장과 결투하다 깊이 베임" } } },
          { title: "부선장에게 배를 넘긴다", desc: "피는 안 보지만 동맹은 식는다",
            effect: { relationship: 5, standing: -4, traits: { "선량": 1 },
                      log: "갑판장의 유언을 사양하고 부선장에게 배를 넘김" },
            risk: null },
          { title: "화물칸만 물려받는다", desc: "실속은 있지만 원망을 산다",
            effect: { money: 400000, relationship: -5, traits: { "야심": 1 },
                      memory: "다시 연 그 화물칸", log: "배 대신 갑판장의 화물칸만 물려받음" },
            risk: null }
        ]
      },
      "해군": {
        body: "해적 시절 동맹을 맺었던 {해적단}의 배가 붙잡혀 당신 함선 옆에 묶여 있습니다. 늙은 갑판장이 쇠사슬에 묶인 채 \"생쥐, 우리 맹세를 기억하나\" 하고 묻습니다. 압송 명령서에는 당신의 서명이 필요합니다.",
        choices: [
          { title: "명령서에 서명한다", desc: "공은 서지만 옛 맹세를 저버린다",
            effect: { standing: 7, happiness: -6, traits: { "야심": 1 },
                      log: "옛 동맹 해적단의 압송 명령서에 서명함" },
            risk: null },
          { title: "갑판장만 선처를 청한다", desc: "반은 지키고 반은 잃는다",
            effect: { relationship: 3, reputation: 3, happiness: -2, traits: { "선량": 1 },
                      memory: "쇠사슬 너머 갑판장의 눈", log: "늙은 갑판장 한 사람의 선처를 상부에 청함" },
            risk: null },
          { title: "밤중에 쇠사슬을 풀어 준다", desc: "맹세는 지키지만 들키면 끝이다",
            effect: { relationship: 5, happiness: 4, traits: { "용기": 1 },
                      memory: "풀려난 쇠사슬 소리", log: "한밤중에 옛 동맹의 쇠사슬을 풀어 줌" },
            risk: { chance: 0.35, effect: { standing: -9, log: "해적을 풀어 준 일이 드러나 강등됨" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 옛 해적선에서 한 구간을 항해함 (f_cb_stowaway_sailed ← cb_kid_stowaway) ──
  {
    key: "cb2_stowaway_sailed",
    flags: ["f_cb_stowaway_sailed"],
    after: 6,
    when: { minAge: 24, maxAge: 61 },
    title: "한 구간의 항해 기록",
    body: "몇 해 전 {해적단}의 배에 다시 올라 한 구간을 함께 항해했던 일이 있습니다. 그 배가 큰 사건을 일으키자, 해군 조사관이 그 항해의 승객이던 당신을 {여기}까지 찾아왔습니다. 그는 아는 대로 증언하면 일이 조용히 끝난다고 말합니다.",
    choices: [
      { title: "아는 대로 증언한다", desc: "조용히 끝나지만 옛 인연을 판다",
        effect: { standing: 4, relationship: -4, happiness: -3, traits: { "신중": 1 },
                  log: "옛 해적선의 항해를 조사관에게 증언함" } },
      { title: "모른다고 버틴다", desc: "의리는 지키지만 의심을 산다",
        effect: { happiness: 3, relationship: 3, traits: { "용기": 1 },
                  memory: "조사관 앞에서 다문 입", log: "옛 해적선의 일을 끝까지 모른다고 버팀" },
        risk: { chance: 0.3, effect: { reputation: -7, log: "해적과 한패라는 소문이 동네에 퍼짐" } } },
      { title: "그 항해를 책으로 써 낸다", desc: "이름은 나지만 말이 많아진다",
        effect: { reputation: 7, money: 80000, traits: { "야심": 1 },
                  memory: "다시 탄 해적선의 기록", log: "옛 해적선과의 항해를 책으로 펴냄" },
        risk: { chance: 0.25, effect: { relationship: -5, log: "해적 이야기를 팔았다고 손가락질받음" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 {해적단}의 배에서 한 구간을 얻어 탔던 당신이 이제 제 배의 깃발을 올렸습니다. 오늘 그 배의 늙은 갑판장이 지친 선원 몇을 데리고 찾아와, 배가 가라앉았으니 당신 밑에서 일하게 해 달라고 합니다.",
        choices: [
          { title: "모두 선원으로 받아들인다", desc: "은혜를 갚지만 식량이 빠듯하다",
            effect: { relationship: 5, skills: { "항해술": 4 }, health: -3, traits: { "선량": 1 },
                      memory: "늙은 갑판장의 새 해먹", log: "가라앉은 옛 해적선의 선원들을 모두 받아들임" },
            risk: null },
          { title: "갑판장만 항해사로 앉힌다", desc: "실력은 얻지만 선원들은 떠난다",
            effect: { skills: { "항해술": 6 }, relationship: -3, traits: { "신중": 1 },
                      memory: "갑판장이 그린 새 해도", log: "옛 해적선의 갑판장만 항해사로 받아들임" },
            risk: null },
          { title: "선원은 거절하고 지도만 받는다", desc: "큰 단서지만 냉정하다",
            effect: { knowledge: 4, standing: 4, relationship: -5, traits: { "야심": 1 },
                      log: "옛 해적선의 선원은 거절하고 해도만 받아 냄" },
            risk: null }
        ]
      },
      "해군": {
        body: "몇 해 전 해적선에 올라 한 구간을 함께 항해했던 일이, 해군 장교인 당신의 신원 조사 서류에 적혀 있습니다. 조사관은 그 배 {해적단}의 은신처를 대면 기록을 덮어 주겠다고 합니다.",
        choices: [
          { title: "은신처를 알려 준다", desc: "기록은 지워지지만 옛 인연을 판다",
            effect: { standing: 6, happiness: -5, traits: { "야심": 1 },
                      log: "옛 해적선의 은신처를 대고 신원 기록을 지움" },
            risk: null },
          { title: "그때 일을 있는 그대로 말한다", desc: "떳떳하지만 진급이 막힌다",
            effect: { standing: -5, reputation: 3, knowledge: 2, traits: { "신중": 1 },
                      memory: "조사실의 긴 진술서", log: "해적선에 탔던 일을 숨김없이 진술함" },
            risk: null },
          { title: "옛 배에 몰래 경고를 보낸다", desc: "빚은 갚지만 들킬 수 있다",
            effect: { relationship: 5, happiness: 3, traits: { "선량": 1 },
                      memory: "몰래 띄운 경고 편지", log: "옛 해적선에 단속을 몰래 알림" },
            risk: { chance: 0.3, effect: { standing: -8, log: "해적에게 경고한 일이 들통나 징계받음" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 금지된 옛 글자를 해독함 (f_cb_studied_stone ← cb_dream_scholar) ──
  {
    key: "cb2_studied_stone",
    flags: ["f_cb_studied_stone"],
    after: 7,
    when: { minAge: 25, maxAge: 72 },
    title: "등잔 아래 해독 노트",
    body: "몇 해 전 헌 창고에서 나온 돌판의 옛 글자를 밤마다 등잔 아래서 해독하던 일을 당신은 아무에게도 말하지 않았습니다. 오늘 {여기}에 낯선 학자가 찾아와 그 해독 노트를 보여 달라고 합니다. 같은 날 거리에는 금서 연구자를 찾는 수배 전단이 붙었습니다.",
    choices: [
      { title: "노트를 학자에게 건넨다", desc: "앎은 이어지지만 화가 미칠 수 있다",
        effect: { knowledge: 5, relationship: 4, traits: { "선량": 1 },
                  memory: "학자에게 건넨 해독 노트", log: "옛 글자 해독 노트를 낯선 학자에게 건넴" },
        risk: { chance: 0.3, effect: { health: -10, log: "정부 요원에게 끌려가 심문당함" } } },
      { title: "노트를 불태운다", desc: "안전하지만 몇 해의 밤이 재가 된다",
        effect: { happiness: -7, health: 3, traits: { "신중": 1 },
                  log: "몇 해 동안 쓴 해독 노트를 불태움" } },
      { title: "학자와 함께 섬을 떠난다", desc: "연구는 이어지지만 삶을 버린다",
        effect: { knowledge: 8, money: -200000, traits: { "용기": 1 },
                  memory: "학자와 오른 새벽 배", log: "해독 노트를 들고 학자와 함께 섬을 떠남" },
        risk: { chance: 0.25, effect: { health: -8, log: "추적을 피해 숨어 지내다 병을 얻음" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 선실에서 밤새 읽어 낸 그을린 고문서 덕에, 당신은 남들이 못 읽는 옛 글자를 조금 읽게 되었습니다. 오늘 상륙한 폐허 섬의 바위에 같은 글자가 새겨져 있습니다. 동료들은 보물 이야기로 들떴고, 수평선에는 군함의 돛이 보입니다.",
        choices: [
          { title: "글자를 끝까지 읽어 낸다", desc: "비밀을 얻지만 해군이 다가온다",
            effect: { knowledge: 6, traits: { "용기": 1 },
                      memory: "폐허 섬 바위의 옛 글자", log: "폐허 섬 바위의 옛 글자를 끝까지 읽어 냄" },
            risk: { chance: 0.35, effect: { health: -8, bounty: "+20%", log: "글자를 읽다 해군에 포위되어 다침" } } },
          { title: "탁본만 뜨고 출항한다", desc: "안전하지만 반쪽짜리다",
            effect: { knowledge: 3, happiness: -3, traits: { "신중": 1 },
                      memory: "선실 벽에 붙인 탁본", log: "폐허 섬 바위의 글자를 탁본만 떠 옴" },
            risk: null },
          { title: "바위의 위치를 정보상에 판다", desc: "돈은 되지만 비밀이 새어 나간다",
            effect: { money: 300000, happiness: -5, traits: { "야심": 1 },
                      log: "옛 글자 바위의 위치를 정보상에 팖" },
            risk: null }
        ]
      },
      "해군": {
        body: "몇 해 전 몰래 해독하던 옛 글자 때문에 해군인 당신 앞에 특별 임무가 떨어집니다. 압수한 돌판을 읽을 사람을 찾던 상부가 당신의 소문을 들은 겁니다. 읽어 내면 공이지만, 읽은 사람은 오래 감시받는다고 합니다.",
        choices: [
          { title: "읽어 내고 공을 세운다", desc: "공은 크지만 감시가 붙는다",
            effect: { standing: 7, knowledge: 3, happiness: -5, traits: { "야심": 1 },
                      memory: "감시 속에 읽은 돌판", log: "압수한 돌판을 해독해 상부에 바침" },
            risk: null },
          { title: "모른다고 잡아뗀다", desc: "몸은 편하지만 꿈을 버린다",
            effect: { happiness: -5, health: 3, standing: -2, traits: { "신중": 1 },
                      log: "옛 글자를 읽을 줄 모른다고 잡아뗌" },
            risk: null },
          { title: "일부러 틀리게 읽어 준다", desc: "비밀은 지키지만 들키면 끝이다",
            effect: { knowledge: 5, happiness: 4, traits: { "용기": 1 },
                      memory: "거짓으로 적은 해독문", log: "돌판을 일부러 틀리게 읽어 비밀을 지킴" },
            risk: { chance: 0.3, effect: { standing: -9, log: "엉터리 해독이 드러나 문책당함" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 옛 검술 도장을 맡음 (f_cb_sword_dojo ← cb_train_sword) ──
  {
    key: "cb2_sword_dojo",
    flags: ["f_cb_sword_dojo"],
    after: 8,
    when: { minAge: 27, maxAge: 75 },
    title: "도장을 떠나는 제자",
    body: "몇 해 전 사범에게 물려받은 검술 도장에서 가르친 아이들이 이제 제법 자랐습니다. 오늘 가장 오래 다닌 제자가 바다로 나가겠다며 인사를 옵니다. 해적이 될지 해군이 될지 말은 흐리지만, 그의 칼끝은 이미 당신을 닮았습니다.",
    choices: [
      { title: "마지막 대련으로 보내 준다", desc: "제자는 자라지만 몸이 상한다",
        effect: { skills: { "검술": 5 }, health: -6, traits: { "용기": 1 },
                  memory: "도장 마루의 마지막 대련", log: "떠나는 제자와 마지막 대련을 벌임" },
        risk: { chance: 0.2, effect: { health: -6, log: "제자의 칼끝에 손목을 다침" } } },
      { title: "도장을 줄 테니 남으라 한다", desc: "도장은 잇지만 그의 꿈을 꺾는다",
        effect: { happiness: 5, relationship: -5, traits: { "신중": 1 },
                  log: "도장을 물려주겠다며 떠나는 제자를 붙잡음" } },
      { title: "여비를 쥐여 보낸다", desc: "인연은 남지만 도장이 텅 빈다",
        effect: { money: -100000, relationship: 6, traits: { "선량": 1 },
                  memory: "도장 문 앞의 큰절", log: "떠나는 제자에게 여비를 쥐여 보냄" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 맡았던 검술 도장은 당신이 수배된 뒤 문을 닫았습니다. 오늘 그곳에서 가르친 제자가 당신 배를 찾아와, 해군이 도장 출신을 모조리 의심해 아이들이 갈 곳이 없다고 말합니다.",
        choices: [
          { title: "제자들을 배에 태운다", desc: "식구는 늘지만 아이들이 바다에 선다",
            effect: { relationship: 5, standing: 4, traits: { "선량": 1 },
                      memory: "갑판 위의 목검 수련", log: "갈 곳 잃은 도장 제자들을 배에 태움" },
            risk: { chance: 0.3, effect: { happiness: -8, log: "배에 태운 제자 하나가 해전에서 다침" } } },
          { title: "새 도장 열 돈을 보낸다", desc: "아이들은 살지만 큰돈이 든다",
            effect: { money: -200000, relationship: 3, traits: { "신중": 1 },
                      memory: "먼 섬에 선 새 도장 간판", log: "제자에게 돈을 보내 먼 섬에 새 도장을 열게 함" },
            risk: null },
          { title: "해군 지부를 들이친다", desc: "속은 시원하지만 이름이 더 퍼진다",
            effect: { standing: 6, bounty: "+30%", health: -5, traits: { "용기": 1 },
                      log: "도장 출신을 핍박한 해군 지부를 들이침" },
            risk: { chance: 0.3, effect: { health: -10, log: "지부를 들이치다 총탄에 맞음" } } }
        ]
      },
      "해군": {
        body: "몇 해 전 맡았던 검술 도장의 제자 몇이 해군 신병 시험에 붙었습니다. 그런데 교관은 도장 칼버릇이 군 검술과 안 맞는다며 당신 앞에서 그들을 낙제시키려 합니다. 제자들이 당신만 쳐다봅니다.",
        choices: [
          { title: "교관과 공개 대련을 청한다", desc: "칼로 증명하지만 위계를 어긴다",
            effect: { skills: { "검술": 5 }, standing: -3, traits: { "용기": 1 },
                      memory: "연병장의 공개 대련", log: "도장 제자들을 위해 교관과 공개 대련을 벌임" },
            risk: { chance: 0.25, effect: { health: -8, log: "교관의 목검에 갈비뼈를 다침" } } },
          { title: "군 검술로 다시 가르친다", desc: "제자는 붙지만 도장 검은 잊힌다",
            effect: { standing: 4, happiness: -4, traits: { "신중": 1 },
                      log: "도장 제자들에게 군 검술을 다시 가르침" },
            risk: null },
          { title: "제자들을 내 부대로 데려온다", desc: "지키지만 편애라는 말을 듣는다",
            effect: { relationship: 5, reputation: -4, traits: { "선량": 1 },
                      memory: "내 부대의 도장 제자들", log: "도장 제자들을 자기 부대로 데려옴" },
            risk: null }
        ]
      },
      "*": {}
    }
  },

  // ── 사범의 제자 둘을 해군에 추천함 (f_cb_sword_recruits ← cb_train_sword) ──
  {
    key: "cb2_sword_recruits",
    flags: ["f_cb_sword_recruits"],
    after: 6,
    when: { minAge: 25, maxAge: 66 },
    title: "추천서의 두 이름",
    body: "제복을 벗은 당신에게, 몇 해 전 해군에 추천했던 옛 사범의 두 제자 이야기가 들려옵니다. 몸이 약하던 쪽은 전장에서 팔을 잃고 군을 떠났고, 성질 급하던 쪽은 장교가 되어 그를 외면했습니다. 팔 잃은 제자가 찾아와 추천한 사람이 책임지라고 말합니다.",
    choices: [
      { title: "그를 맡아 일자리를 구해 준다", desc: "책임은 지지만 손이 많이 간다",
        effect: { money: -100000, relationship: 5, traits: { "선량": 1 },
                  memory: "빈 소매로 쥔 목검", log: "팔 잃은 사범의 제자에게 일자리를 구해 줌" } },
      { title: "장교 제자를 찾아가 꾸짖는다", desc: "바로잡지만 인연이 틀어진다",
        effect: { happiness: 4, reputation: 3, relationship: -4, traits: { "용기": 1 },
                  memory: "장교 숙소 앞의 큰소리", log: "동기를 외면한 장교 제자를 찾아가 꾸짖음" },
        risk: { chance: 0.2, effect: { reputation: -5, log: "장교 제자가 퇴역병의 행패라고 소문냄" } } },
      { title: "추천은 거기까지라고 답한다", desc: "짐은 덜지만 원망을 듣는다",
        effect: { health: 2, relationship: -5, traits: { "신중": 1 },
                  log: "추천한 제자의 부탁을 거절함" } }
    ],
    by: {
      "해군": {
        body: "몇 해 전 옛 사범의 부탁으로 해군에 추천한 두 제자가 이제 둘 다 하사관이 되었습니다. 오늘 성질 급한 쪽이 상관을 때린 죄로 영창에 갇혔고, 몸 약하던 쪽이 당신을 찾아와 형을 살려 달라고 매달립니다.",
        choices: [
          { title: "추천인으로서 선처를 탄원한다", desc: "제자를 살리지만 이름에 흠이 간다",
            effect: { relationship: 5, standing: -5, traits: { "선량": 1 },
                      memory: "영창 창살 너머의 제자", log: "영창에 갇힌 사범의 제자를 위해 탄원함" },
            risk: null },
          { title: "규정대로 처분을 맡긴다", desc: "흠은 없지만 사범 볼 낯이 없다",
            effect: { standing: 4, happiness: -6, traits: { "신중": 1 },
                      log: "추천한 제자의 처분을 규정대로 맡김" },
            risk: null },
          { title: "맞은 상관의 비리를 캔다", desc: "판을 뒤집지만 적을 만든다",
            effect: { standing: 6, knowledge: 3, traits: { "용기": 1 },
                      memory: "밤새 뒤진 보급 장부", log: "제자에게 맞은 상관의 비리를 캐냄" },
            risk: { chance: 0.3, effect: { health: -10, log: "상관의 패거리에게 밤길에 습격당함" } } }
        ]
      },
      "해적|혁명군": {
        body: "당신을 쫓는 추격대 지휘관이, 몇 해 전 해군에 추천했던 옛 사범의 제자입니다. 몸이 약하던 그 아이는 이제 당신의 칼버릇을 가장 잘 아는 사람이 되었습니다. 그가 일대일 결투로 끝내자는 서신을 보냅니다.",
        choices: [
          { title: "결투에 응한다", desc: "이름은 오르지만 목숨이 걸린다",
            effect: { skills: { "검술": 6 }, bounty: "+30%", traits: { "용기": 1 },
                      memory: "같은 사범에게 배운 칼끝", log: "추천했던 사범의 제자와 결투를 벌임" },
            risk: { chance: 0.35, effect: { health: -14, log: "제자의 칼에 깊이 베임" } } },
          { title: "결투를 피해 바다로 빠진다", desc: "무사하지만 비겁하다는 말이 돈다",
            effect: { health: 2, standing: -5, traits: { "신중": 1 },
                      log: "옛 제자의 결투 신청을 피해 달아남" },
            risk: null },
          { title: "칼 대신 술잔을 든다", desc: "옛정을 확인하지만 그가 곤란해진다",
            effect: { relationship: 5, happiness: 4, traits: { "선량": 1 },
                      memory: "결투장에 놓인 술잔 둘", log: "결투장에 칼 대신 술을 들고 나감" },
            risk: { chance: 0.3, effect: { happiness: -7, log: "제자가 해적과 내통한 죄로 강등됨" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 암시장의 옛 친구와 손을 잡음 (f_cb_trade_fence ← cb_train_trade) ──
  {
    key: "cb2_trade_fence",
    flags: ["f_cb_trade_fence"],
    after: 6,
    when: { minAge: 25, maxAge: 66 },
    title: "암시장 친구의 제안",
    body: "바다를 떠난 당신에게, 몇 해 전 암시장에서 값을 다 쳐주고 손을 잡았던 옛 동네 친구가 찾아옵니다. 그는 이제 장물 시장을 쥔 거물이 되었고, 당신 이름으로 번듯한 상회를 차려 주겠다고 합니다. 돈의 출처는 묻지 말라고 합니다.",
    choices: [
      { title: "그 상회를 맡는다", desc: "큰돈이 들어오지만 장물 돈이다",
        effect: { money: 400000, happiness: -3, traits: { "야심": 1 },
                  log: "옛 친구가 차려 준 상회를 맡음" },
        risk: { chance: 0.3, effect: { reputation: -8, log: "상회 돈이 장물이라는 소문이 퍼짐" } } },
      { title: "정직한 거래만 하자고 한다", desc: "떳떳하지만 판이 작아진다",
        effect: { skills: { "장사": 4 }, money: 60000, relationship: -3, traits: { "신중": 1 },
                  memory: "깨끗한 장부의 첫 줄", log: "옛 친구와 정직한 거래만 하기로 함" } },
      { title: "그에게 손을 씻으라고 권한다", desc: "옛 친구를 위하지만 그가 노한다",
        effect: { relationship: 4, happiness: 3, traits: { "선량": 1 },
                  memory: "시장 골목의 긴 밤 이야기", log: "옛 친구에게 장물 장사를 그만두라고 권함" },
        risk: { chance: 0.3, effect: { relationship: -6, log: "손을 씻으라는 말에 친구가 등을 돌림" } } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 {여기} 암시장에서 값을 다 쳐주고 손잡은 옛 동네 친구가, 이제 이 바다에서 가장 큰 장물 시장을 쥐고 있습니다. 오늘 그가 해군 장교 하나를 매수할 돈을 반만 대 달라고 합니다. 일이 되면 이 바다의 항구가 당신에게 열립니다.",
        choices: [
          { title: "매수할 돈을 반 댄다", desc: "판이 커지지만 함께 엮인다",
            effect: { money: -300000, standing: 6, traits: { "야심": 1 },
                      memory: "장교에게 건넨 돈 상자", log: "옛 친구와 해군 장교 매수에 돈을 댐" },
            risk: { chance: 0.3, effect: { bounty: "+25%", log: "매수가 틀어져 해군이 이름을 쫓음" } } },
          { title: "돈 대신 배를 빌려준다", desc: "돈은 아끼지만 배가 위험해진다",
            effect: { relationship: 4, standing: 3, traits: { "용기": 1 },
                      memory: "빌려준 배의 빈 정박지", log: "옛 친구의 일에 돈 대신 배를 빌려줌" },
            risk: { chance: 0.3, effect: { health: -10, log: "빌려준 배를 지키다 해군 포격에 다침" } } },
          { title: "이번에는 거절한다", desc: "깨끗하지만 그가 서운해한다",
            effect: { relationship: -5, knowledge: 2, traits: { "신중": 1 },
                      log: "옛 친구의 장교 매수 제안을 거절함" },
            risk: null }
        ]
      },
      "해군": {
        body: "해적 시절 암시장에서 값을 다 쳐주고 손잡은 옛 동네 친구가, 지금 당신이 단속하는 장물 조직의 우두머리입니다. 그는 그때의 거래를 기억한다며, 눈감아 주면 다른 조직의 비밀을 넘기겠다고 제안합니다.",
        choices: [
          { title: "그를 체포한다", desc: "큰 공이지만 옛 일이 드러날 수 있다",
            effect: { standing: 8, relationship: -5, traits: { "신중": 1 },
                      memory: "수갑 찬 옛 친구의 웃음", log: "암시장의 옛 친구를 체포함" },
            risk: { chance: 0.3, effect: { standing: -6, log: "체포된 친구가 해적 시절 거래를 털어놓음" } } },
          { title: "제안을 받는다", desc: "공도 세우지만 그에게 매인다",
            effect: { standing: 5, happiness: -2, traits: { "야심": 1 },
                      log: "옛 친구의 정보를 받고 그를 눈감아 줌" },
            risk: { chance: 0.3, effect: { reputation: -7, log: "장물 조직과의 거래가 소문으로 번짐" } } },
          { title: "손 씻을 시간을 준다", desc: "옛정은 지키지만 공을 놓친다",
            effect: { relationship: 5, standing: -4, traits: { "선량": 1 },
                      memory: "암시장 좌판의 마지막 흥정", log: "옛 친구에게 손 씻을 시간을 주고 물러남" },
            risk: null }
        ]
      },
      "*": {}
    }
  },

  // ── 흥정으로 멀어진 친구의 빚을 갚아 줌 (f_cb_trade_friend ← cb_train_trade) ──
  {
    key: "cb2_trade_friend",
    flags: ["f_cb_trade_friend"],
    after: 6,
    when: { minAge: 25, maxAge: 70 },
    title: "갚으러 온 빚",
    body: "몇 해 전 {여기} 시장에서 말없이 빚을 갚아 주었던 옛 친구의 좌판이 이제 번듯한 가게가 되었습니다. 오늘 그가 두툼한 장부를 들고 찾아와 그때 돈을 갚겠다고 합니다. 장부 맨 끝에는 함께 장사하자는 제안도 적혀 있습니다.",
    choices: [
      { title: "돈을 돌려받고 끝낸다", desc: "깔끔하지만 인연은 거기까지다",
        effect: { money: 300000, relationship: -2, traits: { "신중": 1 },
                  log: "옛 친구에게 갚아 준 빚을 돌려받음" } },
      { title: "돈 대신 동업을 한다", desc: "이문이 클 수 있지만 다시 틀어질 수 있다",
        effect: { skills: { "장사": 5 }, relationship: 4, traits: { "야심": 1 },
                  memory: "둘이 함께 쓴 장부", log: "빚 대신 옛 친구와 동업을 시작함" },
        risk: { chance: 0.3, effect: { money: -150000, relationship: -5, log: "동업 장부를 두고 다시 다툼" } } },
      { title: "그 돈을 남의 빚에 돌린다", desc: "뜻은 이어지지만 내 손엔 없다",
        effect: { relationship: 5, standing: 4, happiness: 3, traits: { "선량": 1 },
                  memory: "시장에 이어진 빚 갚기", log: "돌려받을 돈으로 다른 상인의 빚을 갚게 함" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 빚을 갚아 주었던 옛 친구가, 해적이 된 당신의 소식을 듣고 {여기}의 부두로 찾아옵니다. 그는 당신 배에 실을 보급품을 잔뜩 가져왔지만, 그를 미행한 해군 정보원이 창고 뒤에 숨어 있습니다.",
        choices: [
          { title: "보급만 받고 바로 출항한다", desc: "배는 채우지만 친구가 남겨진다",
            effect: { health: 5, happiness: -4, traits: { "신중": 1 },
                      log: "옛 친구의 보급품만 받고 서둘러 출항함" },
            risk: { chance: 0.3, effect: { relationship: -6, log: "남겨진 친구가 해군에 끌려갔다는 소식을 들음" } } },
          { title: "정보원을 붙잡아 친구를 지킨다", desc: "친구는 지키지만 이름이 퍼진다",
            effect: { relationship: 5, bounty: "+20%", traits: { "용기": 1 },
                      memory: "창고 뒤의 짧은 격투", log: "옛 친구를 미행한 정보원을 붙잡음" },
            risk: { chance: 0.25, effect: { health: -8, log: "정보원과 엉켜 싸우다 다침" } } },
          { title: "친구를 배에 태워 데려간다", desc: "곁에 두지만 그의 삶을 빼앗는다",
            effect: { relationship: 6, skills: { "장사": 3 }, happiness: -3, traits: { "선량": 1 },
                      memory: "부두에 둔 가게 열쇠", log: "옛 친구를 배에 태워 보급 담당으로 삼음" },
            risk: null }
        ]
      },
      "해군": {
        body: "몇 해 전 빚을 갚아 주었던 옛 친구의 가게가 밀수품 거래처로 신고되었습니다. 단속 명단을 받아 든 장교가 바로 당신입니다. 친구는 모르고 받은 물건이라며 겁먹은 눈으로 당신을 똑바로 봅니다.",
        choices: [
          { title: "규정대로 압수한다", desc: "공정하지만 친구를 잃는다",
            effect: { standing: 5, relationship: -5, traits: { "신중": 1 },
                      memory: "봉인 딱지 붙은 친구 가게", log: "옛 친구 가게의 밀수품을 규정대로 압수함" },
            risk: null },
          { title: "직접 조사해 누명을 벗긴다", desc: "친구를 믿지만 밤을 새운다",
            effect: { relationship: 4, knowledge: 3, health: -4, traits: { "선량": 1 },
                      memory: "밤새 맞춘 가게 장부", log: "옛 친구 가게의 누명을 직접 조사해 벗김" },
            risk: { chance: 0.3, effect: { standing: -6, log: "친구 편을 든다는 감찰을 받음" } } },
          { title: "진짜 밀수꾼을 쫓는다", desc: "큰 공이지만 위험하다",
            effect: { standing: 7, traits: { "용기": 1 },
                      log: "친구 가게에 물건을 댄 밀수꾼을 쫓음" },
            risk: { chance: 0.3, effect: { health: -10, log: "밀수꾼을 쫓다 매복에 걸려 다침" } } }
        ]
      },
      "*": {}
    }
  },

  // ── 옛 가정교사를 배에 태움 (f_cb_tutor_aboard ← cb_school_tutor) ──
  {
    key: "cb2_tutor_aboard",
    flags: ["f_cb_tutor_aboard"],
    after: 6,
    when: { minAge: 27, maxAge: 71 },
    title: "선생님의 마지막 장",
    body: "바다를 떠난 당신의 집에, 오래 배에 모셨던 옛 가정교사가 원고 뭉치 하나를 들고 찾아옵니다. 정부가 지운 섬과 항로를 다 적었다며 함께 인쇄소를 차리자고 하지만, 금지된 기록이라 인쇄공들은 손사래를 칩니다.",
    choices: [
      { title: "직접 인쇄기를 돌린다", desc: "책은 나오지만 위험하다",
        effect: { reputation: 6, knowledge: 3, money: -150000, traits: { "용기": 1 },
                  memory: "잉크 묻은 선생님의 손", log: "옛 가정교사의 금지된 원고를 직접 찍어 냄" },
        risk: { chance: 0.3, effect: { health: -8, log: "인쇄소에 정부 요원이 들이닥쳐 다침" } } },
      { title: "금지된 부분을 빼고 낸다", desc: "안전하지만 반쪽 책이다",
        effect: { money: 60000, happiness: -4, relationship: -3, traits: { "신중": 1 },
                  log: "금지된 대목을 뺀 선생님의 책을 펴냄" } },
      { title: "선생님과 조용히 여생을 보낸다", desc: "마음은 편하지만 원고는 잠든다",
        effect: { happiness: 6, relationship: 4, traits: { "선량": 1 },
                  memory: "툇마루의 늦은 수업", log: "원고를 묻어 두고 옛 선생님 곁을 지킴" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 배에 모신 옛 가정교사는 이제 선원들에게 글을 가르치는 배의 선생님이 되었습니다. 오늘 그가 원고 마지막 장을 끝냈다며, 이 기록을 세상에 내놓을 항구에 자신을 내려 달라고 합니다. 그 항구는 해군 본부와 가깝습니다.",
        choices: [
          { title: "그 항구까지 직접 모신다", desc: "뜻을 이루지만 위험한 바다다",
            effect: { relationship: 5, reputation: 6, traits: { "용기": 1 },
                      memory: "선생님이 남긴 마지막 장", log: "옛 가정교사를 원고를 낼 항구까지 모셔다 드림" },
            risk: { chance: 0.35, effect: { health: -10, log: "해군 본부 앞바다에서 포격을 받음" } } },
          { title: "배에 남으시라고 설득한다", desc: "선생님은 안전하지만 꿈이 묻힌다",
            effect: { knowledge: 4, relationship: -4, traits: { "신중": 1 },
                      log: "항구에 내리려는 선생님을 배에 붙잡아 둠" },
            risk: null },
          { title: "원고를 베껴 대신 뿌린다", desc: "기록은 퍼지지만 선생님 이름은 빠진다",
            effect: { standing: 6, bounty: "+25%", relationship: -3, traits: { "야심": 1 },
                      memory: "항구마다 날린 베낀 원고", log: "선생님의 원고를 베껴 자기 이름으로 뿌림" },
            risk: null }
        ]
      },
      "해군": {
        body: "해적 시절 배에 모셨던 옛 가정교사가, 해군이 된 당신을 찾아 지부 문을 두드립니다. 그는 늙고 병들어 쉴 곳이 필요하지만, 품에 꼭 안은 원고는 여전히 정부가 엄히 금한 기록입니다.",
        choices: [
          { title: "관사에 몰래 모신다", desc: "은혜를 갚지만 들키면 끝이다",
            effect: { relationship: 6, happiness: 3, traits: { "선량": 1 },
                      memory: "관사 다락의 선생님", log: "병든 옛 가정교사를 관사에 몰래 모심" },
            risk: { chance: 0.3, effect: { standing: -8, log: "금서를 지닌 손님을 숨긴 일이 발각됨" } } },
          { title: "원고를 버리는 조건으로 돕는다", desc: "둘 다 살지만 평생의 기록이 사라진다",
            effect: { relationship: 2, happiness: -5, traits: { "신중": 1 },
                      memory: "아궁이에 넣은 원고 뭉치", log: "원고를 태우는 조건으로 옛 선생님을 도움" },
            risk: null },
          { title: "원고를 바치고 선처를 얻는다", desc: "선생님은 쉬지만 기록은 압수된다",
            effect: { standing: 6, relationship: -3, happiness: -3, traits: { "야심": 1 },
                      log: "선생님의 원고를 상부에 바치고 요양을 얻어 냄" },
            risk: null }
        ]
      },
      "*": {}
    }
  },

  // ── 옛 가정교사의 원고를 관사에 숨김 (f_cb_tutor_hidden ← cb_school_tutor) ──
  {
    key: "cb2_tutor_hidden",
    flags: ["f_cb_tutor_hidden"],
    after: 6,
    when: { minAge: 27, maxAge: 71 },
    title: "마룻장 밑의 원고",
    body: "해군 시절 관사에 숨겼던 옛 가정교사의 원고를, 당신은 제복을 벗을 때 몰래 들고 나왔습니다. 오늘 선생님의 손녀가 {여기}로 찾아와, 할아버지가 평생 쓴 기록이 아직 남아 있느냐고 조심스레 묻습니다.",
    choices: [
      { title: "원고를 손녀에게 돌려준다", desc: "뜻은 이어지지만 아이가 위험을 안는다",
        effect: { relationship: 5, happiness: 4, traits: { "선량": 1 },
                  memory: "손녀 품에 안긴 원고", log: "옛 가정교사의 원고를 손녀에게 돌려줌" },
        risk: { chance: 0.2, effect: { happiness: -6, log: "원고 때문에 손녀가 조사를 받았다는 소식을 들음" } } },
      { title: "함께 책으로 펴낸다", desc: "이름이 남지만 돈과 위험이 든다",
        effect: { reputation: 6, money: -150000, traits: { "용기": 1 },
                  memory: "선생님 이름이 박힌 표지", log: "선생님의 손녀와 숨겨 온 원고를 책으로 펴냄" },
        risk: { chance: 0.3, effect: { health: -8, log: "금서를 낸 일로 정부 요원에게 쫓겨 다침" } } },
      { title: "아무것도 없다고 답한다", desc: "안전하지만 거짓을 안고 산다",
        effect: { happiness: -5, knowledge: 3, traits: { "신중": 1 },
                  log: "원고를 묻는 손녀에게 아무것도 없다고 답함" } }
    ],
    by: {
      "해군": {
        body: "몇 해 전 관사 마룻장 밑에 숨긴 옛 가정교사의 원고가 아직 그 자리에 있습니다. 오늘 관사를 모두 뒤지는 감찰 통보가 내려왔고, 사흘 뒤 감찰관이 옵니다. 같은 날 선생님의 부고도 함께 도착했습니다.",
        choices: [
          { title: "원고를 몰래 출판사에 넘긴다", desc: "선생님 뜻은 잇지만 들킬 수 있다",
            effect: { reputation: 5, happiness: 5, traits: { "용기": 1 },
                      memory: "부고와 함께 보낸 원고", log: "숨겨 둔 원고를 출판업자에게 몰래 넘김" },
            risk: { chance: 0.35, effect: { standing: -9, log: "원고를 빼돌린 일이 감찰에 드러남" } } },
          { title: "원고를 태운다", desc: "경력은 지키지만 유품이 재가 된다",
            effect: { standing: 3, happiness: -8, traits: { "신중": 1 },
                      memory: "관사 아궁이의 마지막 원고", log: "감찰을 앞두고 숨겨 둔 원고를 태움" },
            risk: null },
          { title: "원고를 상부에 바친다", desc: "공은 서지만 선생님을 배신한다",
            effect: { standing: 7, relationship: -5, traits: { "야심": 1 },
                      log: "숨겨 둔 금지 원고를 스스로 상부에 바침" },
            risk: null }
        ]
      },
      "해적|혁명군": {
        body: "해군 시절 관사에 숨겼던 옛 가정교사의 원고를, 당신은 제복을 벗고 바다로 나설 때 챙겨 왔습니다. 오늘 정부 첩보원이 그 원고를 찾아 당신 배를 뒤쫓는다는 소식이 옵니다. 선생님은 이미 세상을 떠났습니다.",
        choices: [
          { title: "원고를 항구마다 뿌린다", desc: "기록은 퍼지지만 정부의 표적이 된다",
            effect: { standing: 6, bounty: "+30%", traits: { "용기": 1 },
                      memory: "항구마다 날린 선생님의 글", log: "옛 선생님의 원고를 베껴 항구마다 뿌림" },
            risk: { chance: 0.3, effect: { health: -10, log: "정부 첩보원의 추격에 부상을 입음" } } },
          { title: "숨은 학자에게 맡긴다", desc: "기록은 살지만 그가 위험해진다",
            effect: { relationship: 4, knowledge: 3, traits: { "선량": 1 },
                      memory: "학자의 서가에 꽂은 원고", log: "옛 선생님의 원고를 숨은 학자에게 맡김" },
            risk: { chance: 0.25, effect: { happiness: -7, log: "원고를 맡은 학자가 붙잡혀 갔다는 소식을 들음" } } },
          { title: "첩보원에게 원고를 판다", desc: "큰돈이지만 선생님 뜻을 판다",
            effect: { money: 400000, happiness: -7, traits: { "야심": 1 },
                      log: "옛 선생님의 원고를 정부 첩보원에게 팖" },
            risk: null }
        ]
      },
      "*": {}
    }
  },

  // ── 해도 밖 섬의 위치만 적어 둠 (f_cb_unknown_isle_map ← cb_dream_adventurer) ──
  {
    key: "cb2_unknown_isle_map",
    flags: ["f_cb_unknown_isle_map"],
    after: 6,
    when: { minAge: 24, maxAge: 61 },
    title: "기록장 속 이름 없는 섬",
    body: "바다를 떠난 뒤에도 당신은 몇 해 전 위치만 적어 두고 지나친 해도 밖 섬의 기록장을 버리지 못했습니다. 오늘 {여기}에 온 젊은 탐험가가 그런 섬을 찾아 배를 띄울 사람을 모은다며, 무릎 흉터가 있는 당신에게 길잡이를 청합니다.",
    choices: [
      { title: "길잡이로 함께 떠난다", desc: "가슴이 뛰지만 삶을 멈춘다",
        effect: { happiness: 8, money: -100000, traits: { "용기": 1 },
                  memory: "기록장 속 섬의 첫 모래", log: "기록장 속 섬을 찾아 탐험가와 함께 떠남" },
        risk: { chance: 0.3, effect: { health: -12, log: "이름 없는 섬의 암초에서 크게 다침" } } },
      { title: "기록장을 탐험가에게 판다", desc: "돈은 되지만 꿈을 넘긴다",
        effect: { money: 200000, happiness: -6, traits: { "야심": 1 },
                  log: "해도 밖 섬의 기록장을 탐험가에게 팖" } },
      { title: "바닷길만 가르쳐 준다", desc: "인연은 남지만 섬은 남의 것이다",
        effect: { relationship: 4, skills: { "항해술": 3 }, happiness: -2, traits: { "선량": 1 },
                  memory: "탐험가의 해도에 그은 선", log: "젊은 탐험가에게 섬으로 가는 바닷길만 일러 줌" } }
    ],
    by: {
      "해적|혁명군": {
        body: "몇 해 전 항로 밖에서 보고 위치만 적어 둔 해도 밖의 섬, 그 낡은 기록장이 아직 선실 서랍에 있습니다. 오늘 술집에서 다른 해적단이 그 바다 근처에 보물섬이 있다는 소문을 떠벌립니다. 그들은 내일 아침 출항한다고 합니다.",
        choices: [
          { title: "오늘 밤 먼저 출항한다", desc: "첫발을 딛지만 서두른 항해다",
            effect: { happiness: 8, standing: 5, traits: { "용기": 1 },
                      memory: "기록장 속 섬의 첫 모래", log: "기록장 속 섬을 찾아 밤중에 먼저 출항함" },
            risk: { chance: 0.3, effect: { health: -12, log: "서두른 항해 끝에 섬의 암초에 부딪쳐 다침" } } },
          { title: "기록장을 그 해적단에 판다", desc: "큰돈이지만 꿈을 넘긴다",
            effect: { money: 400000, happiness: -7, traits: { "야심": 1 },
                      log: "해도 밖 섬의 기록장을 다른 해적단에 팖" },
            risk: null },
          { title: "그 해적단과 함께 간다", desc: "든든하지만 몫이 반이다",
            effect: { relationship: 4, standing: 3, money: 100000, traits: { "선량": 1 },
                      memory: "두 깃발이 꽂힌 모래톱", log: "다른 해적단과 함께 기록장 속 섬을 찾음" },
            risk: { chance: 0.2, effect: { health: -6, log: "섬의 몫을 나누다 칼부림이 남" } } }
        ]
      },
      "해군": {
        body: "해적 시절 위치만 적어 둔 해도 밖 섬의 기록장이, 해군이 된 당신의 짐 속에 있습니다. 해군 측량국이 미지의 섬 정보를 모은다는 공문이 돌았고, 그 섬은 아직 어느 해도에도 없습니다.",
        choices: [
          { title: "측량국에 기록을 바친다", desc: "공은 서지만 섬은 정부의 것이 된다",
            effect: { standing: 6, knowledge: 3, happiness: -4, traits: { "야심": 1 },
                      log: "해도 밖 섬의 기록장을 측량국에 바침" },
            risk: null },
          { title: "휴가를 내고 혼자 찾아간다", desc: "꿈을 이루지만 위험하다",
            effect: { happiness: 8, traits: { "용기": 1 },
                      memory: "혼자 디딘 섬의 모래", log: "휴가를 내고 기록장 속 섬을 혼자 찾아감" },
            risk: { chance: 0.3, effect: { health: -12, log: "홀로 오른 섬의 절벽에서 굴러 다침" } } },
          { title: "기록장을 그대로 간직한다", desc: "아무도 모르지만 아쉽다",
            effect: { happiness: -3, knowledge: 2, traits: { "신중": 1 },
                      memory: "서랍 속 낡은 기록장", log: "해도 밖 섬의 기록장을 아무에게도 보이지 않음" },
            risk: null }
        ]
      },
      "*": {}
    }
  }
]);

