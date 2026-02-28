// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
// Uses JSONBin if configured, falls back to localStorage

let _cachedData = null;
let _syncTimeout = null;

function getLocalData() {
  try { return JSON.parse(localStorage.getItem('squat_data')) || {}; }
  catch { return {}; }
}

function saveLocalData(data) {
  localStorage.setItem('squat_data', JSON.stringify(data));
}

// Load data — remote if configured, else local
async function loadData() {
  if (isRemoteConfigured()) {
    try {
      _cachedData = await remoteGet();
      saveLocalData(_cachedData); // keep local copy as backup
    } catch (e) {
      console.warn('Remote fetch failed, using local data', e);
      _cachedData = getLocalData();
    }
  } else {
    _cachedData = getLocalData();
  }
  return _cachedData;
}

// Save data — always local immediately, debounce remote
function persistData(data) {
  _cachedData = data;
  saveLocalData(data);

  if (isRemoteConfigured()) {
    clearTimeout(_syncTimeout);
    _syncTimeout = setTimeout(async () => {
      try {
        await remoteSet(data);
      } catch (e) {
        console.warn('Remote sync failed', e);
      }
    }, 800);
  }
}

function getData() {
  return _cachedData || getLocalData();
}

function getTodaySquats(user) {
  const dayIdx = getCurrentDayIndex();
  const data = getData();
  return (data[user] && data[user][dayIdx]) ? data[user][dayIdx] : 0;
}

function getTotalSquats(user) {
  const data = getData();
  if (!data[user]) return 0;
  return Object.values(data[user]).reduce((a, b) => a + b, 0);
}

function addSquats(user, amount) {
  const dayIdx = getCurrentDayIndex();
  const data = getData();
  if (!data[user]) data[user] = {};
  data[user][dayIdx] = (data[user][dayIdx] || 0) + amount;
  persistData(data);
}

// ─── APP INIT ─────────────────────────────────────────────────────────────────

async function initApp(currentUser) {
  document.getElementById('header-user').textContent = currentUser;

  const dayIdx = getCurrentDayIndex();
  const dayData = getCurrentDay();

  const headerDay = document.getElementById('header-day');
  if (!dayData) {
    headerDay.textContent = dayIdx < 0 ? 'BIENTÔT' : 'TERMINÉ !';
  } else {
    headerDay.textContent = `JOUR ${dayData.day}`;
  }

  // Show loading state
  document.getElementById('leaderboard').innerHTML = '<div class="lb-loading">Chargement…</div>';

  await loadData();

  renderToday(dayData, dayIdx);
  renderLogCard(dayData, currentUser, dayIdx);
  renderLeaderboard(currentUser, dayIdx);
  renderProgramGrid(dayIdx);

  // Auto-refresh leaderboard every 30s if remote
  if (isRemoteConfigured()) {
    setInterval(async () => {
      await loadData();
      renderLeaderboard(currentUser, dayIdx);
      renderProgramGrid(dayIdx);
    }, 30000);
  }
}

// ─── TODAY CARD ───────────────────────────────────────────────────────────────

function renderToday(dayData, dayIdx) {
  const el = document.getElementById('today-content');

  if (!dayData) {
    if (dayIdx < 0) {
      const start = getChallengeStart();
      const now = new Date(); now.setHours(0,0,0,0);
      const daysLeft = Math.ceil((start - now) / (1000*60*60*24));
      el.innerHTML = `<div class="rest-msg">⏳<br>DÉBUT DANS ${daysLeft} JOUR${daysLeft>1?'S':''}<br><span>1er mars 2026</span></div>`;
    } else {
      el.innerHTML = `<div class="rest-msg">🏆<br>CHALLENGE TERMINÉ<br><span>Bien joué !</span></div>`;
    }
    return;
  }

  if (dayData.rest) {
    el.innerHTML = `<div class="rest-msg">💤<br>REPOS<br><span>Récupère bien !</span></div>`;
    return;
  }

  const types = SQUAT_TYPES.filter(t => dayData[t.key] > 0);
  const bars = types.map((t, i) => {
    const pct = Math.round((dayData[t.key] / dayData.total) * 100);
    return `
      <div class="type-row">
        <div class="type-meta">
          <span class="type-dot" style="background:var(--c${i+1})"></span>
          <span class="type-label">${t.label}</span>
          <span class="type-count">${dayData[t.key]}</span>
        </div>
        <div class="type-bar-bg">
          <div class="type-bar" style="width:0%; background:var(--c${i+1})" data-width="${pct}%"></div>
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="today-total">
      <span class="total-num">${dayData.total}</span>
      <span class="total-label">squats aujourd'hui</span>
    </div>
    <div class="types-breakdown">${bars}</div>
  `;

  requestAnimationFrame(() => {
    document.querySelectorAll('.type-bar').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.width; }, 100);
    });
  });
}

// ─── LOG CARD ─────────────────────────────────────────────────────────────────

function renderLogCard(dayData, currentUser, dayIdx) {
  const card = document.getElementById('log-card');
  const logBtn = document.getElementById('log-btn');
  const feedback = document.getElementById('log-feedback');
  const input = document.getElementById('squat-input');
  const minusBtn = document.getElementById('minus-btn');
  const plusBtn = document.getElementById('plus-btn');

  const disabled = !dayData || dayData.rest || dayIdx < 0 || dayIdx >= PROGRAM.length;

  if (disabled) {
    card.classList.add('card-disabled');
    logBtn.disabled = true;
    input.disabled = true;
    minusBtn.disabled = true;
    plusBtn.disabled = true;
    feedback.textContent = dayData && dayData.rest ? 'Jour de repos — rien à enregistrer.' : '';
    return;
  }

  card.classList.remove('card-disabled');
  logBtn.disabled = false;
  input.disabled = false;
  minusBtn.disabled = false;
  plusBtn.disabled = false;

  function updateFeedback() {
    const alreadyDone = getTodaySquats(currentUser);
    const goal = dayData.total;
    feedback.innerHTML = alreadyDone > 0
      ? `Déjà fait aujourd'hui : <strong>${alreadyDone} / ${goal}</strong>`
      : `Objectif : <strong>${goal} squats</strong>`;
  }

  updateFeedback();

  minusBtn.onclick = () => {
    const v = parseInt(input.value) || 1;
    input.value = Math.max(1, v - 5);
  };
  plusBtn.onclick = () => {
    const v = parseInt(input.value) || 1;
    input.value = v + 5;
  };

  logBtn.onclick = () => {
    const amount = parseInt(input.value);
    if (!amount || amount < 1) return;

    addSquats(currentUser, amount);
    input.value = 10;

    const total = getTodaySquats(currentUser);
    const diff = dayData.total - total;
    feedback.innerHTML = diff <= 0
      ? `✅ Objectif atteint ! <strong>${total}</strong> squats aujourd'hui.`
      : `+${amount} enregistrés — <strong>${total} / ${dayData.total}</strong> (encore ${diff})`;

    renderLeaderboard(currentUser, dayIdx);
    renderProgramGrid(dayIdx);

    logBtn.classList.add('flash');
    setTimeout(() => logBtn.classList.remove('flash'), 300);
  };
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────

function renderLeaderboard(currentUser, dayIdx) {
  const el = document.getElementById('leaderboard');
  const users = Object.keys(USERS);

  const remote = isRemoteConfigured();
  const syncLabel = remote
    ? `<div class="lb-sync">🔴 En direct</div>`
    : `<div class="lb-sync lb-sync-local">📱 Local uniquement — <a href="#setup">configurer le partage</a></div>`;

  const entries = users.map(u => {
    const todayDone = getTodaySquats(u);
    const todayGoal = (PROGRAM[dayIdx] && !PROGRAM[dayIdx].rest) ? PROGRAM[dayIdx].total : 0;
    const total = getTotalSquats(u);
    const pct = todayGoal > 0 ? Math.min(100, Math.round((todayDone / todayGoal) * 100)) : 0;
    return { u, todayDone, todayGoal, total, pct };
  }).sort((a, b) => b.total - a.total);

  const rows = entries.map((e, i) => `
    <div class="lb-row ${e.u === currentUser ? 'lb-me' : ''}">
      <div class="lb-rank">${i === 0 && e.total > 0 ? '🥇' : i === 1 ? '🥈' : '·'}</div>
      <div class="lb-info">
        <div class="lb-name">${e.u}</div>
        <div class="lb-today-bar-bg">
          <div class="lb-today-bar" style="width:${e.pct}%"></div>
        </div>
        <div class="lb-today-label">${e.todayDone}${e.todayGoal > 0 ? ' / ' + e.todayGoal : ''} aujourd'hui</div>
      </div>
      <div class="lb-total">
        <span class="lb-total-num">${e.total}</span>
        <span class="lb-total-sub">total</span>
      </div>
    </div>
  `).join('');

  el.innerHTML = syncLabel + rows;
}

// ─── PROGRAM GRID ─────────────────────────────────────────────────────────────

function renderProgramGrid(currentDayIdx) {
  const el = document.getElementById('program-grid');
  const data = getData();

  el.innerHTML = PROGRAM.map((d, idx) => {
    let cls = 'pg-day';
    let status = '';

    if (d.rest) {
      cls += ' pg-rest';
      status = '💤';
    } else if (idx < currentDayIdx) {
      const done = Object.keys(USERS).every(u => (data[u] && data[u][idx] > 0));
      cls += done ? ' pg-done' : ' pg-past';
      status = done ? '✓' : '–';
    } else if (idx === currentDayIdx) {
      cls += ' pg-current';
      status = '▶';
    } else {
      cls += ' pg-future';
      status = d.total || '';
    }

    return `
      <div class="${cls}" title="Jour ${d.day}${d.rest ? ' – Repos' : ' – ' + (d.total||0) + ' squats'}">
        <span class="pg-num">${d.day}</span>
        <span class="pg-status">${status}</span>
      </div>
    `;
  }).join('');
}
