/* 오늘의 랭킹: 기존 게임 진행 로직과 독립적으로 동작합니다. */
(() => {
  'use strict';
  const API = 'https://api.haejeoklife.com/api/rankings';
  const $ = id => document.getElementById(id);
  const clean = (v, max = 40) => String(v ?? '').slice(0, max);
  const nicknameClean = v => String(v ?? '').replace(/[<>"'&]/g, '').slice(0, 12);
  const integer = v => { const n = Number(v); return Number.isFinite(n) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(n))) : 0; };
  const format = n => integer(n).toLocaleString('ko-KR');
  let submitting = false;
  let submitted = false;
  let lastPayload = null;
  const challengeActive = () => typeof p !== 'undefined' && !!p && !!p.flags?.rankingChallenge && typeof finished !== 'undefined' && finished === true;
  const deathPanel = () => $('ranking-death');
  function hideDeathRanking() {
    lastPayload = null;
    const panel = deathPanel();
    if (panel) { panel.hidden = true; panel.style.display = 'none'; }
    if ($('ranking-form')) $('ranking-form').hidden = true;
    if ($('ranking-register-open')) $('ranking-register-open').hidden = true;
  }
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function renderRanking(target, data) {
    if (!target) return;
    const count = integer(data?.totalCount);
    const rows = Array.isArray(data?.topRankings) ? data.topRankings.slice(0, 30) : [];
    const total = target.querySelector('.ranking-total');
    const list = target.querySelector('.ranking-list');
    if (total) total.textContent = `오늘의 도전자 ${format(count)}명`;
    if (!list) return;
    if (count > rows.length && rows.length === 10) {
      console.warn('랭킹 서버가 10개 기록만 반환했습니다. 서버의 TOP 30 배포를 확인해야 합니다.');
      if (total) total.textContent += ' · 서버에서 10개 기록만 전달됨 (서버 업데이트 필요)';
    }
    if (!rows.length) { list.innerHTML = '<p class="small ranking-empty">아직 등록된 기록이 없습니다. 첫 번째 도전자가 되어 보세요!</p>'; return; }
    list.innerHTML = rows.map((r, i) => `<div class="ranking-row">
      <span class="ranking-place">${esc(Number.isFinite(Number(r.rank)) ? integer(r.rank) : i + 1)}위</span>
      <div class="ranking-person"><strong>${esc(r.nickname || '이름 없음')}</strong><small>${esc(r.title || '칭호 없음')} · ${format(r.age)}세 · ${esc(r.raceAndJob || '직업 없음')}</small><small class="ranking-death">${esc(r.causeOfDeath || '')}</small></div>
      <b class="ranking-bounty">${format(r.bounty)} <small>베리</small></b>
    </div>`).join('');
  }
  async function request(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal, cache: options.cache || 'no-store', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) } });
      if (!response.ok) throw new Error(`서버 응답 오류 (${response.status})`);
      return await response.json();
    } finally { clearTimeout(timer); }
  }
  async function refreshRankings() {
    const panels = [$('ranking-home'), $('ranking-death')];
    try {
      const data = await request(`${API}/today?limit=30&_=${Date.now()}`, { cache: 'no-store' });
      panels.forEach(el => renderRanking(el, data));
    } catch (error) {
      panels.forEach(el => { if (!el) return; const list = el.querySelector('.ranking-list'); if (list && !list.querySelector('.ranking-row')) list.textContent = '랭킹을 불러오지 못했습니다. 새로고침을 눌러 다시 시도해 주세요.'; });
    }
  }
  function deathResult(cause) {
    if (typeof p === 'undefined' || !p) return null;
    return {
      bounty: integer(p.bounty),
      title: clean(typeof endingTitle === 'function' ? endingTitle(cause) : (p.flags?.endingTitle || ''), 40),
      age: integer(typeof realAge === 'function' ? realAge() : p.age),
      raceAndJob: clean([p.race, typeof jobTitle === 'function' ? jobTitle() : p.job].filter(Boolean).join(' · '), 40),
      causeOfDeath: clean(cause?.type || p.flags?.deathCause?.type || '인생 종료', 40)
    };
  }
  function openDeathRanking(cause) {
    const panel = $('ranking-death');
    if (!panel) return;
    if (!challengeActive()) { hideDeathRanking(); return; }
    lastPayload = deathResult(cause);
    if (!lastPayload) return;
    submitted = false;
    submitting = false;
    // 단계 줄이기: 닉네임 입력칸을 처음부터 펼치고 캐릭터 이름을 미리 채워, '랭킹 등록' 한 번만 누르면 되게 한다.
    // (휴대폰 키보드가 갑자기 올라오지 않도록 자동 포커스는 하지 않는다)
    $('ranking-form').hidden = false;
    $('ranking-register-open').hidden = true;
    $('ranking-submit').disabled = false;
    $('ranking-nickname').value = nicknameClean(typeof p !== 'undefined' && p ? p.name : '').trim();
    $('ranking-my-rank').hidden = true;
    $('ranking-message').textContent = '';
    panel.hidden = false;
    panel.style.display = '';
    refreshRankings();
  }
  function showRankingForm() {
    if (!challengeActive() || !lastPayload || submitted || submitting) { if (!challengeActive()) hideDeathRanking(); return; }
    $('ranking-form').hidden = false;
    $('ranking-register-open').hidden = true;
    $('ranking-nickname').focus();
  }
  async function submitRanking(event) {
    event.preventDefault();
    if (!challengeActive() || submitted || submitting || !lastPayload) { if (!challengeActive()) hideDeathRanking(); return; }
    const input = $('ranking-nickname');
    const nick = nicknameClean(input.value).trim();
    input.value = nick;
    const message = $('ranking-message');
    if (!nick) { message.textContent = '닉네임을 1~12자로 입력해 주세요.'; input.focus(); return; }
    submitting = true;
    $('ranking-submit').disabled = true;
    message.textContent = '기록을 등록하는 중입니다…';
    try {
      const data = await request(API, { method: 'POST', body: JSON.stringify({ nickname: nick, ...lastPayload }) });
      submitted = true;
      $('ranking-form').hidden = true;
      $('ranking-register-open').hidden = true;
      $('ranking-my-rank').hidden = false;
      $('ranking-my-rank').textContent = `오늘 ${format(data.totalCount)}명 중 ${format(data.myRank)}위`;
      message.textContent = '랭킹 등록이 완료되었습니다!';
      renderRanking($('ranking-death'), data);
      renderRanking($('ranking-home'), data);
    } catch (error) {
      message.textContent = error.name === 'AbortError' ? '응답 시간이 초과되었습니다. 등록 여부를 확인한 후 다시 시도해 주세요.' : `등록에 실패했습니다. ${error.message}`;
      // 타임아웃이나 연결 끊김 시 서버에 등록됐을 수 있으므로 무조건 재전송하지 않도록 안내합니다.
    } finally {
      submitting = false;
      if (!submitted) $('ranking-submit').disabled = false;
    }
  }
  hideDeathRanking();
  $('ranking-register-open')?.addEventListener('click', showRankingForm);
  $('ranking-nickname')?.addEventListener('input', event => { event.target.value = nicknameClean(event.target.value); });
  // 미리 채운 캐릭터 이름을 바꾸고 싶을 때 바로 새로 쓸 수 있게, 입력칸을 누르면 전체 선택한다.
  $('ranking-nickname')?.addEventListener('focus', event => { try { event.target.select(); } catch (e) {} });
  $('ranking-form')?.addEventListener('submit', submitRanking);
  document.querySelectorAll('.ranking-refresh').forEach(button => button.addEventListener('click', refreshRankings));
  refreshRankings();
  // 새 인생 및 이어하기에서 이전 사망의 등록 UI를 반드시 초기화합니다.
  if (typeof begin === 'function') {
    const originalBegin = begin;
    begin = function() { hideDeathRanking(); return originalBegin.apply(this, arguments); };
  }
  if (typeof loadGame === 'function') {
    const originalLoadGame = loadGame;
    loadGame = function() { hideDeathRanking(); return originalLoadGame.apply(this, arguments); };
  }
  // 원본 afterDeath 및 기존 수배서/분석 래퍼를 그대로 실행한 뒤 랭킹만 표시합니다.
  if (typeof afterDeath === 'function') {
    const originalAfterDeath = afterDeath;
    afterDeath = function(cause) {
      const result = originalAfterDeath.apply(this, arguments);
      try { openDeathRanking(cause); } catch (error) { console.error('ranking UI', error); }
      return result;
    };
  }
})();
