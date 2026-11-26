# 인수인계 (2026-11-26)

ONE PIECE LIFE 작업을 다른 도구로 이어 가기 위한 문서다. 먼저 `CLAUDE.md`(이벤트 설계 기준) 전체를 읽고, 이 문서를 읽는다.

## 1. 저장소와 배포

- 저장소: `c:\haejeoklife`, GitHub `one3883/haejeoklife-front` (예전 이름 `haejeoklife`로 푸시해도 넘겨줌)
- 배포: main에 병합되면 Cloudflare Pages가 haejeoklife.com에 올림. 브랜치마다 미리보기 `https://<브랜치이름>.haejeoklife.pages.dev`
- 작업 방식: 브랜치 → 커밋 → 푸시 → PR → 사용자가 병합. **커밋·푸시는 사용자가 요청할 때만.** 답변은 한국어.
- 사용자 정보(이름·이메일 등)를 공개 저장소에 넣지 않는다.

## 2. 지금 상태 — 브랜치 (2026-11-26 갱신)

| 브랜치 | 상태 | 할 일 |
| --- | --- | --- |
| `feat/feedback-form` | 푸시 완료, PR 없음 | 결과 화면의 건의함(이모지 평가·한마디)을 구글 폼 "의견 보내기" 카드로 교체. 미리보기 확인 후 PR |
| `feat/sticky-next` | 푸시 완료, PR 없음 | '다음 장면' 버튼을 사건 칸 아래에 sticky로 고정(선택지 있는 동안 숨김). 폰·컴퓨터 미리보기 확인 후 PR |
| `feat/vitality` (로컬 `feat/vitality-wip`) | 푸시 완료(`a7cbc4a`), PR 없음 | 건강·행복이 사망 위험·싸움·수입에 영향(`vitality.js`). main보다 뒤처져 있어 main을 합친 뒤 200판(`check.sh`) → 1,000판 확인 후 PR |

이미 끝난 것(다시 하지 말 것):
- 인연 줄기(ARC) 엔진 #67, 줄기 10종·장면 70개 #68 → main 병합됨. 로컬 `feat/story-arcs`는 옛 상태이니 쓰지 않는다.
- 동료 사건 개연성 수정 #66 → 병합됨(`fix/companion-plausibility`는 정리해도 됨).
- 원격 `feat/cb-chains` 삭제, 워크트리(`haejeoklife-auto50`·`-haki`·`-tools`·`.claude/worktrees/agent-*`) 정리 완료.
- 새 작업은 항상 `origin/main`에서 새 브랜치로 시작한다.

## 3. 다음에 할 만한 일

- 평균 수명이 62~67세로 예전(70세 안팎)보다 낮다. 항해·회수 사건·임펠다운·관계 감소를 나눠서 원인 측정(`feat/vitality` 병합 전에 보는 게 좋다).
- `CLAUDE.md` 7절의 기존 위반 11건(패기 반복, 세계경제신문·삶의 변화 제목 반복, 기록 말투 등).
- 동료 사건 30개에도 줄기 붙이기, 승진 사건의 정식 도전 vs 편법 밸런스, 죽을 패배 일부를 임펠다운 수감으로.
- 랭킹 서버(`api.haejeoklife.com`, 이 저장소에 없음)가 클라이언트가 보낸 현상금을 그대로 믿는지 확인. 현상금 상한·IP별 요청 제한 필요.

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
- 남은 아이디어는 3절에 정리함.
