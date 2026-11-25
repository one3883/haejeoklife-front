# 자동 플레이 스크립트 공용 함수 (run.sh · baseline.sh · check.sh가 불러 씀)

# 브라우저 찾기: EDGE 환경 변수 → Windows Edge 기본 경로 → PATH
find_edge() {
  if [ -n "${EDGE:-}" ]; then echo "$EDGE"; return; fi
  for c in "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" "/c/Program Files/Microsoft/Edge/Application/msedge.exe"; do
    [ -x "$c" ] && { echo "$c"; return; }
  done
  for c in msedge microsoft-edge google-chrome chromium chrome; do
    command -v "$c" >/dev/null 2>&1 && { command -v "$c"; return; }
  done
  echo "브라우저(Edge/Chrome)를 찾지 못했습니다. EDGE 환경 변수로 경로를 주세요." >&2; exit 1
}
EDGE_BIN="$(find_edge)"

# 경로 → file:// 주소 (Git Bash에서는 C:/… 형태로 바꾼다)
file_url() {
  local p; p="$(cygpath -m "$1" 2>/dev/null || echo "$1")"
  echo "file:///${p#/}"
}
# 해시 인자에 넣을 값의 최소 인코딩 (%, 공백, &, #)
urlenc() { printf '%s' "$1" | sed 's/%/%25/g; s/ /%20/g; s/&/%26/g; s/#/%23/g'; }

# 페이지를 헤드리스로 열어 <pre id="…">의 내용을 출력한다
#   dump_pre <주소> <pre id> <프로필 폴더> <가상 시간 한도(ms)>
dump_pre() {
  local url="$1" id="$2" prof="$3" budget="${4:-600000}"
  local profw; profw="$(cygpath -m "$prof" 2>/dev/null || echo "$prof")"
  "$EDGE_BIN" --headless=new --disable-gpu --allow-file-access-from-files --user-data-dir="$profw" \
    --virtual-time-budget="$budget" --timeout=3600000 --dump-dom "$url" 2>/dev/null \
    | sed -n "/<pre id=\"$id\">/,/<\/pre>/{p;/<\/pre>/q}" | sed "s/.*<pre id=\"$id\">//; s/<\/pre>.*//" \
    | sed 's/&lt;/</g; s/&gt;/>/g; s/&quot;/"/g; s/&#39;/'"'"'/g; s/&amp;/\&/g'
}

# 결과 캐시: 저장소의 .git 안(모든 워크트리가 함께 씀). git이 추적하지 않는다.
cache_dir() {
  local d; d="$(git -C "$ROOT" rev-parse --path-format=absolute --git-common-dir)/autoplay-cache"
  mkdir -p "$d"; echo "$d"
}
