// ─── PROGRAMME 31 JOURS ───────────────────────────────────────────────────────

const PROGRAM = [
  { day: 1,  total: 50,  classique: 50, profond: 0,  saute: 0,  iso: 0  },
  { day: 2,  total: 50,  classique: 30, profond: 20, saute: 0,  iso: 0  },
  { day: 3,  total: 60,  classique: 30, profond: 20, saute: 10, iso: 0  },
  { day: 4,  rest: true },
  { day: 5,  total: 70,  classique: 40, profond: 20, saute: 10, iso: 0  },
  { day: 6,  total: 75,  classique: 40, profond: 20, saute: 15, iso: 0  },
  { day: 7,  total: 80,  classique: 40, profond: 25, saute: 15, iso: 0  },
  { day: 8,  rest: true },
  { day: 9,  total: 100, classique: 50, profond: 25, saute: 15, iso: 10 },
  { day: 10, total: 105, classique: 50, profond: 25, saute: 20, iso: 10 },
  { day: 11, total: 110, classique: 50, profond: 30, saute: 20, iso: 10 },
  { day: 12, rest: true },
  { day: 13, total: 130, classique: 60, profond: 30, saute: 25, iso: 15 },
  { day: 14, total: 135, classique: 60, profond: 35, saute: 25, iso: 15 },
  { day: 15, total: 140, classique: 60, profond: 35, saute: 30, iso: 15 },
  { day: 16, rest: true },
  { day: 17, total: 150, classique: 60, profond: 40, saute: 30, iso: 20 },
  { day: 18, total: 155, classique: 60, profond: 40, saute: 35, iso: 20 },
  { day: 19, total: 160, classique: 60, profond: 45, saute: 35, iso: 20 },
  { day: 20, rest: true },
  { day: 21, total: 180, classique: 70, profond: 45, saute: 40, iso: 25 },
  { day: 22, total: 185, classique: 70, profond: 50, saute: 40, iso: 25 },
  { day: 23, total: 190, classique: 70, profond: 50, saute: 45, iso: 25 },
  { day: 24, rest: true },
  { day: 25, total: 220, classique: 80, profond: 55, saute: 55, iso: 30 },
  { day: 26, total: 225, classique: 80, profond: 55, saute: 60, iso: 30 },
  { day: 27, total: 230, classique: 80, profond: 60, saute: 60, iso: 30 },
  { day: 28, rest: true },
  { day: 29, total: 240, classique: 80, profond: 65, saute: 60, iso: 35 },
  { day: 30, total: 250, classique: 85, profond: 65, saute: 65, iso: 35 },
  { day: 31, total: 250, classique: 75, profond: 70, saute: 70, iso: 35 },
];

const SQUAT_TYPES = [
  { key: 'classique', label: 'Classique',    difficulty: 1 },
  { key: 'profond',   label: 'Profond',       difficulty: 2 },
  { key: 'saute',     label: 'Sauté longue',  difficulty: 2 },
  { key: 'iso',       label: 'Isométrie 5s',  difficulty: 3 },
];

const USERS = {
  Barbara: 'password',
  Nicolas: 'password',
};

// ─── CHALLENGE START DATE ─────────────────────────────────────────────────────
function getChallengeStart() {
  return new Date('2026-03-01T00:00:00');
}

function getCurrentDayIndex() {
  const start = getChallengeStart();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return diff;
}

function getCurrentDay() {
  const idx = getCurrentDayIndex();
  if (idx < 0 || idx >= PROGRAM.length) return null;
  return PROGRAM[idx];
}

// ─── JSONBIN CONFIG ───────────────────────────────────────────────────────────
// 1. Va sur https://jsonbin.io et crée un compte gratuit
// 2. Crée un nouveau Bin avec ce contenu initial : {"Barbara":{},"Nicolas":{}}
// 3. Copie ton API key (Settings > API Keys) et l'ID du bin (dans l'URL du bin)
// 4. Colle-les ci-dessous
const JSONBIN_BIN_ID  = '69a33fbcae596e708f530049';
const JSONBIN_API_KEY = '$2a$10$T0Rm5XYlnftuVDNqPq0Tt.lLbpY.pkqp3l3PKL2QruZqZ2xwM6vcm';

const JSONBIN_URL     = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
const JSONBIN_HEADERS = {
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_API_KEY,
  'X-Bin-Versioning': 'false',
};

function isRemoteConfigured() {
  return !JSONBIN_BIN_ID.startsWith('REMPLACE') && !JSONBIN_API_KEY.startsWith('REMPLACE');
}

async function remoteGet() {
  const res = await fetch(JSONBIN_URL, { headers: JSONBIN_HEADERS });
  const json = await res.json();
  return json.record || {};
}

async function remoteSet(data) {
  await fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: JSONBIN_HEADERS,
    body: JSON.stringify(data),
  });
}
