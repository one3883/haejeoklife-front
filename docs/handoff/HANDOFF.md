# 인수인계 (2026-11-26)

ONE PIECE LIFE 작업을 다른 도구로 이어 가기 위한 문서다. 먼저 `CLAUDE.md`(이벤트 설계 기준) 전체를 읽고, 이 문서를 읽는다.

## 1. 저장소와 배포

- 저장소: `c:\haejeoklife`, GitHub `one3883/haejeoklife-front` (예전 이름 `haejeoklife`로 푸시해도 넘겨줌)
- 배포: main에 병합되면 Cloudflare Pages가 haejeoklife.com에 올림. 브랜치마다 미리보기 `https://<브랜치이름>.haejeoklife.pages.dev`
- 작업 방식: 브랜치 → 커밋 → 푸시 → PR → 사용자가 병합. **커밋·푸시는 사용자가 요청할 때만.** 답변은 한국어.
- 사용자 정보(이름·이메일 등)를 공개 저장소에 넣지 않는다.

## 2. 지금 상태 — 브랜치

| 브랜치 | 상태 | 할 일 |
| --- | --- | --- |
| `fix/companion-plausibility` | 커밋·푸시 완료 (`b04dca5`), PR 없음 | PR 만들기. 동료 사건에 곁에 있을 수 없는 사람(다른 섬 친구, 소속이 다른 사람)이 나오던 문제 수정 |
| `feat/vitality-wip` | 커밋 완료 (`a7cbc4a`), **푸시 안 함** | 사용자 확인 후 `git push -u origin feat/vitality-wip:feat/vitality`. 건강·행복이 사망 위험·싸움·수입에 영향을 주게 한 변경(`vitality.js`) |
| `feat/story-arcs` | **커밋 안 함, 작업 중** (아래 3절) | 줄기 데이터를 받아 검사 후 커밋 |
| `feat/cb-chains` (원격) | 이미 병합된 브랜치가 실수로 다시 생김 | GitHub에서 삭제: `git push origin --delete feat/cb-chains` |

로컬 워크트리(정리해도 됨): `c:\haejeoklife-tools`, `c:\haejeoklife-haki`, `c:\haejeoklife-auto50` — 모두 병합 끝난 작업. `git worktree remove <경로>`로 지운다.

## 3. 진행 중인 작업: 인연 줄기(ARC)

**목표(사용자 요청):** 씨앗 이벤트가 한 번 돌아오고 끝나지 않고, 고른 선택지가 다음 장면을 정하고 그 장면이 또 다음을 부르는 "꼬리에 꼬리를 무는" 3~4단계 이야기. 줄기 6개로 시작(기존 사건에서 키운 것 4개 + 새 줄기 2개).

**이미 된 것 (`feat/story-arcs`, 커밋 안 됨):**
- `place-events.js`의 "인연 줄기 (ARC)" 엔진: `ARC({ id, name, start:[...], nodes:{...} })`. 시작 규칙(플래그·나이·확률·동료 사건에서 인물 이어받기 `npcFrom`), 노드별 선택지 `next`(또는 점수로 가르는 표)·`delay`·`score`, 인물 효과(`npc` 만들기, `npcRel`·`npcRole`·`npcJoin`·`npcLeave`·`npcStory`), 신분별 변형 `by`, 결말 `end:true`, 보여 주기 직전 확인(`valid`), 장면 위 "🔁 ○○ · n단계" 표시. 어른의 한 해마다 때가 된 줄기 장면을 70% 확률로 하나 끼움.
- 인생 끝 요약 "🔁 내 선택이 바꾼 것"에 "📖 이어진 이야기"(줄기마다 고른 길) 추가.
- 동료 사건에서 고른 동료를 줄기가 이어받도록 `p.arcHint[사건key] = 동료id` 기록.
- `arc-events.js`(머리 주석만 있음)와 `index.html`의 로드 줄(`companion-events.js` 다음), `place-events.js` 캐시 버전 `20261126c`.

**남은 것:**
1. 줄기 6개 데이터 작성 → `arc-events.js`에 `ARC({...});`로 추가. 작성 지침: `docs/handoff/SPEC_arc.md`(문체·수치는 `SPEC_callback.md`).
   - 빵 도둑의 이야기(`baker`): 씨앗 `callback-events.js`의 `cb_dream_navy` 해군 "숙제장의 정의대로 감싼다"(f_cb_navy_kept_dream). 지금의 `cb2_navy_kept_dream`을 1단계로 다시 쓰고 그 사건은 지운다.
   - 늙은 어선의 선장(`old_boat`): `cb_train_sea`에서 고른 선택(`f_cbpick_cb_train_sea_1~3`)마다 다른 노드에서 시작. 대신하는 `cb2_old_boat`는 지운다.
   - 애꾸눈 해적(`oneeye`): `cb_kid_pirate_scout_kept`의 선택(`f_cbpick_cb_kid_pirate_scout_kept_1~3`)에서 시작. 대신하는 `cb2_oneeye_*`·`cb2_hid_oneeye` 등은 지운다.
   - 비밀 쪽지의 동료(`secret`): `companion-events.js`의 `cmp_w_secret` 선택(`f_cbpick_cmp_w_secret_1~3`), start 규칙에 `npcFrom: "cmp_w_secret"`.
   - 새 줄기 2개: 17~28세에 해마다 6~10% 확률로 시작하는 새 씨앗 노드부터.
   - (이 세션에서 다른 AI 작업자 3명이 위 6개를 쓰고 있었다. 결과 파일이 남아 있으면 쓰면 된다: `%TEMP%\claude\fc46f8e8a2c331de\6ec252da-a3d5-45d0-b13a-5d77cbfb81dd\scratchpad\arc\arc1.js`(빵 도둑·늙은 어선) `arc2.js`(애꾸눈·비밀 쪽지) `arc3.js`(새 줄기 2개). 없으면 새로 쓴다.)
2. 검사: `docs/handoff/arctest.html`을 Edge 헤드리스로 연다(아래 4절). 문제 0건이 될 때까지 고친다(막다른 길, 못 가는 노드, 토큰 남음, 글 길이, 우위 선택지, 실행 오류).
3. 자동 플레이 200판(`tools/autoplay/check.sh "arc_"`)으로 오류·줄기 진행 확인, 커밋 전 1,000판(`--final`).
4. 줄기 하나(예: 빵 도둑)가 실제로 어떻게 흘러가는지 사용자에게 보여 주기.

## 4. 검증 방법

- node·python 없음. Git Bash + Edge 헤드리스.
- 자동 플레이·판정: `tools/autoplay/check.sh "<key 앞부분,…>"` (작업 중 200판), `--final` (커밋 전 1,000판). 규칙은 `CLAUDE.md` 10절.
- 검사 페이지 실행 예:
  ```
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --allow-file-access-from-files --user-data-dir="C:/tmp/edgeprof" --virtual-time-budget=120000 --dump-dom "file:///C:/haejeoklife/docs/handoff/arctest.html" | sed -n '/<pre id="o">/,/<\/pre>/p'
  ```
  (`arctest.html`은 `file:///c:/haejeoklife/index.html`을 불러 줄기 전체를 검사한다. `cbdom.html`은 회수 사건의 우위 선택지 검사.)
- 같은 코드도 1,000판 평균 수명이 측정마다 2~3년씩 다르다. 수명 비교는 대조군을 같이 돌린다.

## 5. 알아 둘 점

- 사건 설계 기준: `CLAUDE.md` 2절(수치), 6절(문체: ~습니다체, 기록은 명사형 ~함/~음), 8절(모든 선택지에 득실, 우위 선택지 금지), 9절(성향은 용기·신중·선량·야심 네 가지뿐).
- 감사 문서 `docs/boring-events.md`, 재생성은 `tools/autoplay/report.sh`.
- 최근 main의 평균 수명이 62~67세로 예전(70세 안팎)보다 낮다. 항해·회수 사건·임펠다운·관계 감소가 겹친 결과일 수 있어 원인을 나눠 재 볼 필요가 있다.
- 남은 아이디어(사용자와 이야기함): 동료 사건 30개에도 후속(줄기) 붙이기, 승진 사건의 정식 도전 vs 편법 밸런스, 싸움에서 죽을 패배 일부를 임펠다운 수감으로, 반복 제목(세계경제신문·삶의 변화)·기록 말투 정리.
