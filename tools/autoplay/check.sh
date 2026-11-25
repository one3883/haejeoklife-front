#!/usr/bin/env bash
# 고친 사건이 기준을 통과하는지 빠르게 검사한다.
#
#   tools/autoplay/check.sh "<key1,key2,…>" [--final] [--lives N] [--procs N] [--game 다른폴더/index.html]
#
# - key는 사건 key의 앞부분(kid_dream, kid_train …)이나 제목(학교에 갈까?)을 쉼표로 준다.
# - 작업 중에는 기본 200판, 커밋 전 최종 확인은 --final(1,000판)로 돌린다 (CLAUDE.md 10절).
# - 지금 작업 중인 index.html을 돌리되, 준 사건만 선택지 효과를 재서 빠르다.
# - main 기준 결과(baseline.sh, 1,000판, 커밋별 캐시)와 비교해
#     1) 사건별 통과/실패 (main 기준 → 작업본)
#     2) 15세 시점 스탯·꿈 분포·직업별 직급·평균 수명 차이
#   를 출력하고 결과 폴더에 report.md로 남긴다. 실패한 사건이 있으면 종료 코드 1.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
. "$HERE/lib.sh"

KEYS="${1:?검사할 사건 key를 쉼표로 주세요}"; shift
LIVES=200; PROCS_ARG=(); GAME="$ROOT/index.html"
while [ $# -gt 0 ]; do
  case "$1" in
    --final) LIVES=1000; shift ;;
    --lives) LIVES="$2"; shift 2 ;;
    --procs) PROCS_ARG=(--procs "$2"); shift 2 ;;
    --game) GAME="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"; shift 2 ;;
    *) echo "모르는 인자: $1" >&2; exit 2 ;;
  esac
done

BASE="$("$HERE/baseline.sh" 1000 | tail -1)"
CACHE="$(cache_dir)"
GDIR="$(dirname "$GAME")"
BR="$(git -C "$GDIR" rev-parse --abbrev-ref HEAD | tr '/' '-')"
OUT="$CACHE/work/$BR-$(date +%Y%m%d-%H%M%S)-$LIVES"
"$HERE/run.sh" "$OUT" "$LIVES" --keys "$KEYS" --game "$GAME" "${PROCS_ARG[@]}"

parts_of() { grep -o '"parts":[0-9]*' "$1/meta.json" | cut -d: -f2; }
GAME_URL="$(file_url "$GAME")"
PROF="$(mktemp -d)"
judge() { dump_pre "$(file_url "$HERE/judge.html")#dir=$(urlenc "$(file_url "$1")")&parts=$(parts_of "$1")&game=$(urlenc "$GAME_URL")&keys=$(urlenc "$KEYS")" md "$PROF/j$2" 600000; }
{
  echo "# 사건 검사: $KEYS"
  echo
  echo "- 작업본: $(git -C "$GDIR" rev-parse --abbrev-ref HEAD) ($(git -C "$GDIR" rev-parse --short HEAD), 커밋 안 된 변경 포함) · ${LIVES}판 · $GAME"
  echo "- 기준: main $(grep -o '"commit":"[0-9a-f]*' "$BASE/meta.json" | cut -d'"' -f4 | cut -c1-7) · 1,000판 (캐시)"
  echo
  echo "## 작업본 판정"
  echo '```'; judge "$OUT" a; echo '```'
  echo
  echo "## main 기준 판정 (고치기 전)"
  echo '```'; judge "$BASE" b; echo '```'
  echo
  echo "## main 기준과 비교"
  echo
  dump_pre "$(file_url "$HERE/compare.html")#a=$(urlenc "$(file_url "$BASE")")&pa=$(parts_of "$BASE")&b=$(urlenc "$(file_url "$OUT")")&pb=$(parts_of "$OUT")" o "$PROF/c" 600000
} | tee "$OUT/report.md"
rm -rf "$PROF" 2>/dev/null || true
echo
echo "보고서: $OUT/report.md"
# 결과를 못 읽었으면 2, 작업본 판정에 실패가 있으면 1로 끝낸다
if grep -q '판 수 0,\|^ERR ' "$OUT/report.md"; then echo "결과 파일을 읽지 못했습니다. 위 보고서를 확인하세요." >&2; exit 2; fi
sed -n '/## 작업본 판정/,/## main 기준 판정/p' "$OUT/report.md" | grep -q '^실패' && exit 1 || exit 0
