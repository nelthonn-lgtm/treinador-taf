// Estado local (fica só no celular). Inclui progressão por níveis, XP e conquistas.
import { RUN_LEVELS, STRENGTH_TRACKS } from './program.js';

const KEY = 'tafpprn.v1';

const DEFAULT = () => ({
  v: 1,
  profile: {
    onboarded: false, nome: '', sexo: 'M', peso: 75, tafDate: '', startDate: hoje(),
    cadence: 170, voice: true, announce: 400, showMap: true,
    edital: { barra: 3, iso: 5, abd: 15, abdF: 10, corrida: 2000, corridaF: 1600 },
    metas: { barra: 6, iso: 15, abd: 25, corrida: 2400 },
    equip: { elastico: true, barraFixa: 'praca', superband: false },
    tenisKmInicial: 0, tenis: 'Olympikus Corre Max', altura: null, pesoInicial: null, pesoMeta: null,
  },
  checkins: {},
  sessions: [],
  tests: [],
  levels: { run: 0, barra: 0, core: 0, pernas: 0 },
  prog: { run: 0, barra: 0, core: 0, pernas: 0 },
  runIdx: 0,
  forcaIdx: 0,
  water: {},
  pesos: [],
  xp: 0,
  badges: {},
});

export function hoje(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

let state;
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? merge(DEFAULT(), JSON.parse(raw)) : DEFAULT();
  } catch { state = DEFAULT(); }
  return state;
}
function merge(base, data) {
  for (const k of Object.keys(data)) {
    if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && data[k] && typeof data[k] === 'object' && !Array.isArray(data[k])) base[k] = merge(base[k], data[k]);
    else base[k] = data[k];
  }
  return base;
}
export function save() {
  const p = state.profile;
  // Metas padrão adequadas ao feminino (edital: 1.600 m, 10 abdominais, 5 s de isometria)
  if (p.sexo === 'F' && !p.metasF) { if (p.metas.corrida === 2400) p.metas.corrida = 2000; if (p.metas.abd === 25) p.metas.abd = 18; p.metasF = true; }
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}
export const S = () => state;
export function resetAll() { state = DEFAULT(); save(); }
export function importJSON(txt) { const d = JSON.parse(txt); if (!d || !d.profile) throw new Error('Arquivo inválido'); state = merge(DEFAULT(), d); save(); }
export function exportJSON() { return JSON.stringify(state, null, 1); }

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// ---------- Progressão ----------
export function trackInfo(track) {
  if (track === 'run') return { levels: RUN_LEVELS, need: 3 };
  const t = STRENGTH_TRACKS[track];
  return { levels: t.levels, need: t.levels[state.levels[track]].sessoes };
}

export function bestTest(type, sinceDays = null) {
  const lim = sinceDays ? Date.now() - sinceDays * 864e5 : 0;
  const arr = state.tests.filter((t) => t.type === type && new Date(t.date).getTime() >= lim);
  return arr.length ? Math.max(...arr.map((t) => t.value)) : null;
}

// Critério do nível. No feminino, o teste do edital é isometria (não barra livre): os critérios de barra viram tempo de isometria.
function gateReal(track) {
  const lv = STRENGTH_TRACKS[track].levels[state.levels[track]];
  if (!lv.gate) return null;
  const F = state.profile.sexo === 'F';
  let teste = lv.gate.teste, min = lv.gate.min, txt = lv.gate.txt;
  if (teste === 'abd') { min = F ? state.profile.edital.abdF : state.profile.edital.abd; txt = `Abdominal 60 s com o mínimo do edital (${min})`; }
  if (F && teste === 'barra') { teste = 'iso'; min = lv.gate.min >= 3 ? 25 : 15; txt = `Isometria no topo de ${min} s registrada em Testes`; }
  return { teste, min, txt };
}
export function gateOk(track) {
  if (track === 'run') return true;
  const g = gateReal(track);
  if (!g) return true;
  const b = bestTest(g.teste);
  return b !== null && b >= g.min;
}

// Registra uma sessão concluída num trilho. dor = dor máxima relatada na região após o treino.
// Retorna mensagem sobre progressão.
export function registrarProgresso(track, dor) {
  const { levels, need } = trackInfo(track);
  const lv = state.levels[track];
  if (dor >= 5) { state.prog[track] = 0; return `Dor ${dor}/10: o nível ${lv + 1} será repetido do início. Se persistir, volte um nível em Mais › Níveis.`; }
  if (dor >= 3) return `Dor ${dor}/10: sessão registrada, mas não conta para subir de nível.`;
  state.prog[track] = (state.prog[track] || 0) + 1;
  if (state.prog[track] >= need && lv < levels.length - 1) {
    if (!gateOk(track)) return `Sessões completas no nível. Falta o critério: ${gateReal(track).txt}.`;
    state.levels[track] = lv + 1; state.prog[track] = 0;
    if (track === 'run') state.runIdx = 0;
    addXP(50);
    const nome = track === 'run' ? `nível ${lv + 2} de corrida` : levels[lv + 1].nome;
    return `Subiu de nível! Agora: ${nome}.`;
  }
  return `Progresso no nível: ${state.prog[track]}/${need === 999 ? '∞' : need}.`;
}

export function mudarNivel(track, delta) {
  const { levels } = trackInfo(track);
  state.levels[track] = Math.max(0, Math.min(levels.length - 1, state.levels[track] + delta));
  state.prog[track] = 0;
  if (track === 'run') state.runIdx = 0;
  save();
}

// ---------- XP e conquistas ----------
export function addXP(n) { state.xp = (state.xp || 0) + n; }
export function nivelXP() {
  const xp = state.xp || 0;
  const lvl = Math.floor(Math.sqrt(xp / 40)) + 1;
  const base = 40 * (lvl - 1) ** 2, prox = 40 * lvl ** 2;
  return { lvl, xp, pct: Math.round(((xp - base) / (prox - base)) * 100), falta: prox - xp };
}

export const BADGES = [
  { id: 'primeiro_checkin', icone: '✅', nome: 'Primeiro check-in', desc: 'Respondeu o check-in de dor.' },
  { id: 'primeira_corrida', icone: '👟', nome: 'Primeiro treino de corrida', desc: 'Concluiu um treino de corrida.' },
  { id: 'primeira_forca', icone: '💪', nome: 'Primeiro treino de força', desc: 'Concluiu um treino de força.' },
  { id: 'streak7', icone: '🔥', nome: '7 dias seguidos', desc: '7 check-ins em dias seguidos.' },
  { id: 'streak30', icone: '🏅', nome: '30 dias seguidos', desc: '30 check-ins em dias seguidos.' },
  { id: 'km10', icone: '🛣️', nome: '10 km acumulados', desc: 'Somou 10 km de corrida/caminhada.' },
  { id: 'km100', icone: '🌎', nome: '100 km acumulados', desc: 'Somou 100 km.' },
  { id: 'trote_continuo', icone: '🏃', nome: '15 min contínuos', desc: 'Chegou ao trote contínuo (nível 11).' },
  { id: 'hang30', icone: '🧗', nome: 'Dead hang 30 s', desc: 'Ficou 30 s pendurado na barra.' },
  { id: 'primeira_barra', icone: '🎯', nome: 'Primeira barra', desc: 'Registrou a primeira barra livre.' },
  { id: 'barra_edital', icone: '🏆', nome: 'Barra do edital', desc: 'Atingiu o mínimo do edital na barra.' },
  { id: 'abd_edital', icone: '🏆', nome: 'Abdominal do edital', desc: 'Atingiu o mínimo do edital no abdominal.' },
  { id: 'corrida_edital', icone: '🏆', nome: 'Corrida do edital', desc: 'Atingiu a distância mínima do edital em 12 min.' },
  { id: 'meta2400', icone: '🥇', nome: 'Meta 2.400 m', desc: 'Correu sua meta em 12 minutos.' },
  { id: 'peso_reg', icone: '⚖️', nome: 'Peso registrado', desc: 'Registrou o peso pela primeira vez.' },
  { id: 'peso3', icone: '📉', nome: '-3 kg', desc: 'Perdeu 3 kg desde o início.' },
  { id: 'peso6', icone: '🏋️', nome: '-6 kg', desc: 'Perdeu 6 kg desde o início.' },
  { id: 'agua7', icone: '💧', nome: 'Hidratação em dia', desc: 'Bateu a meta de água em 7 dias.' },
];

export function streak() {
  let n = 0; const d = new Date();
  if (!state.checkins[hoje(d)]) d.setDate(d.getDate() - 1);
  while (state.checkins[hoje(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export function kmTotal() { return state.sessions.reduce((a, s) => a + (s.dist || 0), 0) / 1000; }
// Peso e IMC
export function imc(peso = state.profile.peso, alt = state.profile.altura) { return peso && alt ? peso / (alt * alt) : null; }
export function faixaIMC(v) { return v === null ? '' : v < 18.5 ? 'abaixo do peso' : v < 25 ? 'peso adequado' : v < 30 ? 'sobrepeso' : v < 35 ? 'obesidade grau I' : 'obesidade grau II ou mais'; }
export function registrarPeso(kg, data = hoje()) {
  state.pesos = state.pesos.filter((x) => x.date !== data);
  state.pesos.push({ date: data, kg }); state.pesos.sort((a, b) => a.date.localeCompare(b.date));
  if (!state.profile.pesoInicial) state.profile.pesoInicial = state.pesos[0].kg;
  state.profile.peso = state.pesos[state.pesos.length - 1].kg;
}
// Ritmo saudável: até ~0,7% do peso por semana
export function ritmoPeso() {
  const ps = state.pesos; if (ps.length < 2) return null;
  const a = ps[0], b = ps[ps.length - 1];
  const sem = (new Date(b.date) - new Date(a.date)) / (7 * 864e5); if (sem < 1) return null;
  return (a.kg - b.kg) / sem; // kg perdidos por semana
}
export function metaAgua() { return Math.round(((state.profile.peso || 70) * 35) / 250); } // copos de 250 ml

export function checkBadges() {
  const novos = []; const P = state.profile;
  const give = (id, cond) => { if (cond && !state.badges[id]) { state.badges[id] = hoje(); novos.push(BADGES.find((b) => b.id === id)); addXP(25); } };
  give('primeiro_checkin', Object.keys(state.checkins).length > 0);
  give('primeira_corrida', state.sessions.some((s) => s.kind === 'run'));
  give('primeira_forca', state.sessions.some((s) => s.kind === 'forca'));
  const st = streak(); give('streak7', st >= 7); give('streak30', st >= 30);
  const km = kmTotal(); give('km10', km >= 10); give('km100', km >= 100);
  give('trote_continuo', state.levels.run >= 10);
  give('hang30', (bestTest('hang') || 0) >= 30);
  give('primeira_barra', (bestTest('barra') || 0) >= 1);
  give('barra_edital', P.sexo === 'M' ? (bestTest('barra') || 0) >= P.edital.barra : (bestTest('iso') || 0) >= P.edital.iso);
  give('abd_edital', (bestTest('abd') || 0) >= (P.sexo === 'F' ? P.edital.abdF : P.edital.abd));
  const run = bestTest('run12') || 0;
  give('corrida_edital', run >= (P.sexo === 'F' ? P.edital.corridaF : P.edital.corrida));
  give('meta2400', run >= P.metas.corrida);
  const pi = state.profile.pesoInicial, pa = state.profile.peso;
  give('peso_reg', state.pesos.length > 0);
  give('peso3', pi && pa && pi - pa >= 3); give('peso6', pi && pa && pi - pa >= 6);
  const dias = Object.entries(state.water).filter(([, n]) => n >= metaAgua()).length; give('agua7', dias >= 7);
  return novos;
}
