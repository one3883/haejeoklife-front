#!/usr/bin/env bash
# main 기준 자동 플레이 결과를 커밋별로 저장해 두고, main이 그대로면 다시 쓴다.
#
#   tools/autoplay/baseline.sh [판수=1000]
#
# - origin/main을 받아 와서 그 커밋의 결과가 캐시에 있으면 경로만 알려 주고 끝난다.
# - 없으면 그 커밋을 따로 꺼낸 폴더(작업 중인 파일은 건드리지 않음)에서 모든 사건을 측정해 저장한다.
# - 캐시는 .git/autoplay-cache/main-<커밋>-<판수>/ 에 있고, main 결과는 최근 5개만 남긴다.
# - 마지막 줄에 결과 폴더 경로를 출력한다.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
. "$HERE/lib.sh"
LIVES="${1:-1000}"

git -C "$ROOT" fetch -q origin main
C="$(git -C "$ROOT" rev-parse origin/main)"
CACHE="$(cache_dir)"
D="$CACHE/main-$C-$LIVES"
if [ -f "$D/meta.json" ]; then
  echo "main ${C:0:7} 결과 재사용 (${LIVES}판)" >&2
  echo "$D"; exit 0
fi

# main 커밋을 캐시 안의 별도 워크트리로 꺼낸다 (있으면 그 커밋으로 옮김)
WT="$CACHE/main-worktree"
if [ -d "$WT/.git" ] || [ -f "$WT/.git" ]; then
  git -C "$WT" checkout -q --detach "$C"
else
  git -C "$ROOT" worktree add -q --detach "$WT" "$C"
fi
echo "main ${C:0:7} 결과가 없어 새로 돌립니다 (${LIVES}판)" >&2
"$HERE/run.sh" "$D" "$LIVES" --game "$WT/index.html" >&2

# 오래된 main 결과 정리 (최근 5개만)
ls -1dt "$CACHE"/main-*-* 2>/dev/null | grep -v main-worktree | tail -n +6 | xargs -r rm -rf
echo "$D"
