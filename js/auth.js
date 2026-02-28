// ─── AUTH ─────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'squat_session';

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function login(user, password) {
  if (!USERS[user]) return false;
  if (USERS[user] !== password) return false;
  setSession(user);
  return true;
}

// ─── UI AUTH SETUP ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const appScreen   = document.getElementById('app-screen');
  const loginBtn    = document.getElementById('login-btn');
  const logoutBtn   = document.getElementById('logout-btn');
  const pwInput     = document.getElementById('password-input');
  const loginError  = document.getElementById('login-error');
  const userBtns    = document.querySelectorAll('.user-btn');

  let selectedUser = 'Barbara';

  userBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      userBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedUser = btn.dataset.user;
      loginError.textContent = '';
    });
  });

  function doLogin() {
    const pw = pwInput.value;
    if (login(selectedUser, pw)) {
      loginError.textContent = '';
      pwInput.value = '';
      showApp();
    } else {
      loginError.textContent = 'Mot de passe incorrect.';
      pwInput.classList.add('shake');
      setTimeout(() => pwInput.classList.remove('shake'), 400);
    }
  }

  loginBtn.addEventListener('click', doLogin);
  pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

  logoutBtn.addEventListener('click', () => {
    clearSession();
    appScreen.classList.remove('active');
    loginScreen.classList.add('active');
  });

  function showApp() {
    loginScreen.classList.remove('active');
    appScreen.classList.add('active');
    initApp(getSession().user);
  }

  // Auto-login if session exists
  const session = getSession();
  if (session && session.user && USERS[session.user]) {
    showApp();
  }
});
