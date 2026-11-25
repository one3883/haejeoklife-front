#!/usr/bin/env bash
# 자동 플레이를 여러 브라우저 프로세스로 나눠 병렬로 돌린다.
#
#   tools/autoplay/run.sh <결과폴더> <판수> [--procs N] [--game index.html경로] [--keys "key1,key2"] [--max-eval 3]
#
# - 판 수를 프로세스 수로 나눠 각자 part<i>.json을 만든다. 끝나면 meta.json을 쓴다(meta.json이 있으면 완료된 결과).
# - --keys를 주면 그 사건만 선택지 효과를 잰다(나머지는 등장 횟수만 셈). 훨씬 빠르다.
# - --game을 안 주면 이 저장소의 index.html(작업 중인 파일)을 돌린다.
# - 브라우저는 EDGE 환경 변수 → Windows Edge 기본 경로 → PATH의 msedge/chrome 순서로 찾는다.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
. "$HERE/lib.sh"

OUT="${1:?결과 폴더를 주세요}"; LIVES="${2:?판 수를 주세요}"; shift 2
PROCS=""; GAME="$ROOT/index.html"; KEYS=""; MAXEVAL=3
while [ $# -gt 0 ]; do
  case "$1" in
    --procs) PROCS="$2"; shift 2 ;;
    --game) GAME="$2"; shift 2 ;;
    --keys) KEYS="$2"; shift 2 ;;
    --max-eval) MAXEVAL="$2"; shift 2 ;;
    *) echo "모르는 인자: $1" >&2; exit 2 ;;
  esac
done
# 프로세스 수: 기본은 (코어 수 - 4), 최대 16, 한 프로세스에 최소 10판
if [ -z "$PROCS" ]; then
  C=$(nproc 2>/dev/null || echo 4); PROCS=$(( C > 8 ? C - 4 : 4 )); [ "$PROCS" -gt 16 ] && PROCS=16
fi
[ $(( LIVES / PROCS )) -lt 10 ] && PROCS=$(( LIVES / 10 > 0 ? LIVES / 10 : 1 ))
PER=$(( (LIVES + PROCS - 1) / PROCS ))

mkdir -p "$OUT"; rm -f "$OUT"/part*.json "$OUT/meta.json"
PROFILES="$(mktemp -d)"
GAME_URL="$(file_url "$GAME")"; PLAY_URL="$(file_url "$HERE/play.html")"
KEYS_ENC="$(urlenc "$KEYS")"
echo "자동 플레이: ${LIVES}판 = ${PROCS}개 프로세스 × ${PER}판 · 게임 $GAME${KEYS:+ · 측정 대상 $KEYS}"
t0=$(date +%s)
for i in $(seq 1 "$PROCS"); do
  n=$PER; [ $(( i * PER )) -gt "$LIVES" ] && n=$(( LIVES - (i - 1) * PER )); [ "$n" -le 0 ] && continue
  # 가상 시간 한도는 판당 넉넉히(4,000초) 준다. 모자라면 결과 없이 끝난다.
  dump_pre "$PLAY_URL#lives=$n&maxEval=$MAXEVAL&samples=6&game=$(urlenc "$GAME_URL")${KEYS:+&keys=$KEYS_ENC}&r=$i" o \
    "$PROFILES/p$i" $(( n * 4000000 )) > "$OUT/part$i.json" &
done
wait
secs=$(( $(date +%s) - t0 ))
rm -rf "$PROFILES" 2>/dev/null || true

# 결과 확인: 모든 part가 맡은 판 수를 채웠는지
parts=0; ok=1; errs=""
for f in "$OUT"/part*.json; do
  parts=$((parts + 1))
  got=$(grep -o '"lives":[0-9]*' "$f" | head -1 | cut -d: -f2)
  [ -z "$got" ] && { echo "실패: $(basename "$f") 결과가 비었습니다" >&2; ok=0; continue; }
  e=$(grep -o '"errors":\[[^]]*\]' "$f" | head -1); [ "$e" != '"errors":[]' ] && errs="$errs $e"
done
[ "$ok" = 1 ] || exit 1
COMMIT=$(git -C "$(dirname "$GAME")" rev-parse HEAD 2>/dev/null || echo "?")
DIRTY=$(git -C "$(dirname "$GAME")" status --porcelain 2>/dev/null | grep -q . && echo true || echo false)
cat > "$OUT/meta.json" <<EOF
{"lives":$LIVES,"procs":$PROCS,"parts":$parts,"game":"$GAME","commit":"$COMMIT","dirty":$DIRTY,"keys":"$KEYS","seconds":$secs,"date":"$(date '+%Y-%m-%d %H:%M')"}
EOF
echo "끝: ${secs}초, part ${parts}개${errs:+ · 페이지 오류:$errs}"
