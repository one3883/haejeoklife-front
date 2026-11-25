#!/usr/bin/env bash
# 재미없는 선택 이벤트 감사 문서(docs/boring-events.md)를 main 1,000판 결과로 다시 만든다.
#
#   tools/autoplay/report.sh [출력 파일=docs/boring-events.md]
#
# - baseline.sh의 main 결과(커밋별 캐시)를 쓰므로, main이 그대로면 자동 플레이를 다시 돌리지 않는다.
# - 판정 기준은 check.sh와 같다(CLAUDE.md 8~10절). 인연 씨앗·회수 사건은 뺀다.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
. "$HERE/lib.sh"
OUTFILE="${1:-$ROOT/docs/boring-events.md}"
BASE="$("$HERE/baseline.sh" 1000 | tail -1)"
PARTS=$(grep -o '"parts":[0-9]*' "$BASE/meta.json" | cut -d: -f2)
COMMIT=$(grep -o '"commit":"[0-9a-f]*' "$BASE/meta.json" | cut -d'"' -f4)
PROF="$(mktemp -d)"
dump_pre "$(file_url "$HERE/judge.html")#dir=$(urlenc "$(file_url "$BASE")")&parts=$PARTS&commit=$COMMIT&game=$(urlenc "$(file_url "$ROOT/index.html")")" md "$PROF/r" 900000 > "$OUTFILE"
rm -rf "$PROF" 2>/dev/null || true
head -c 300 "$OUTFILE" | grep -q '^# ' || { echo "문서를 만들지 못했습니다: $OUTFILE" >&2; exit 1; }
echo "만듦: $OUTFILE (main ${COMMIT:0:7}, $(grep -c '^| [0-9]' "$OUTFILE") 줄)"
