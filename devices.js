// Som, voz, vibração, tela ligada e GPS.
let ctx;
function ac() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; }

export function beep(freq = 880, dur = 0.12, vol = 0.35) {
  try {
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.frequency.value = freq; o.type = 'square';
    g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + dur);
  } catch {}
}
export function vibrate(p) { try { navigator.vibrate && navigator.vibrate(p); } catch {} }

let vozOn = true;
export function setVoz(on) { vozOn = on; }
export function falar(txt) {
  if (!vozOn || !('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(txt); u.lang = 'pt-BR'; u.rate = 1.05;
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith('pt'));
    if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch {}
}
export function unlockAudio() { ac(); if ('speechSynthesis' in window) speechSynthesis.getVoices(); }

// Metrônomo de cadência (passos por minuto)
let metroTimer = null;
export function metronomo(spm) {
  pararMetronomo();
  if (!spm) return;
  const iv = 60000 / spm;
  metroTimer = setInterval(() => beep(1500, 0.03, 0.18), iv);
}
export function pararMetronomo() { if (metroTimer) clearInterval(metroTimer); metroTimer = null; }

// Tela sempre ligada
let lock = null;
export async function manterTela() {
  try { if ('wakeLock' in navigator) { lock = await navigator.wakeLock.request('screen'); } } catch {}
}
export function liberarTela() { try { lock && lock.release(); } catch {} lock = null; }
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && lock === null && window.__querTela) manterTela();
  if (document.visibilityState === 'hidden' && rastAtivo && rastAtivo.running && !rastAtivo.paused) rastAtivo.saiuEm = Date.now();
  if (document.visibilityState === 'visible' && rastAtivo && rastAtivo.saiuEm) {
    const seg = (Date.now() - rastAtivo.saiuEm) / 1000; rastAtivo.saiuEm = 0;
    if (seg > 15) falar('Com a tela apagada o GPS fica parado. Esse trecho foi estimado pelo seu ritmo. Deixe a tela ligada para medir certo.');
  }
});

// ---------- Formatação ----------
export function fmtTempo(s, comHora = false) {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h || comHora ? `${h}:${p(mm)}:${p(ss)}` : `${p(mm)}:${p(ss)}`;
}
export function fmtPace(secPorKm) {
  if (!isFinite(secPorKm) || secPorKm <= 0 || secPorKm > 3600) return '--:--';
  const m = Math.floor(secPorKm / 60), s = Math.round(secPorKm % 60);
  return s === 60 ? `${m + 1}:00` : `${m}:${String(s).padStart(2, '0')}`;
}
export function falarTempo(s) {
  s = Math.round(s); const m = Math.floor(s / 60), r = s % 60;
  return `${m ? `${m} minuto${m > 1 ? 's' : ''}` : ''}${m && r ? ' e ' : ''}${r ? `${r} segundo${r > 1 ? 's' : ''}` : ''}` || 'zero';
}
export function falarPace(p) {
  if (!isFinite(p) || p <= 0) return '';
  const m = Math.floor(p / 60), s = Math.round(p % 60);
  return `${m} e ${String(s).padStart(2, '0')} por quilômetro`;
}

// ---------- GPS ----------
export function haversine(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// Rastreador com filtro de Kalman (tira o "tremido" do GPS), filtro de velocidade irreal
// e estimativa pelo ritmo quando o GPS para (tela apagada ou app em segundo plano).
let rastAtivo = null;
export class Rastreador {
  constructor(onUpdate) {
    this.onUpdate = onUpdate; this.reset();
  }
  reset() {
    this.pts = []; this.dist = 0; this.elapsed = 0; this.running = false; this.paused = false;
    this.lastTick = null; this.watch = null; this.acc = null; this.hist = []; this.gpsOk = false; this.gapAviso = false;
    this.gapM = 0; this.gapS = 0; this.kf = null; this.lastPt = null; this.ultimoBom = 0; this.lastFix = 0;
  }
  ligarGPS() {
    if (!('geolocation' in navigator)) { this.erro = 'Este aparelho não oferece GPS ao navegador.'; this.onUpdate(this); return; }
    if (this.watch !== null) return;
    this.watch = navigator.geolocation.watchPosition((p) => this.pos(p), (e) => { this.erro = e.code === 1 ? 'Permissão de localização negada. Libere a localização para este site nas configurações do Chrome.' : 'Sinal de GPS fraco. Vá para céu aberto.'; this.onUpdate(this); }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  }
  iniciar() {
    this.ligarGPS();
    this.running = true; this.paused = false; this.lastTick = performance.now(); rastAtivo = this;
    this.tick = setInterval(() => this.step(), 250);
  }
  step() {
    const now = performance.now();
    if (this.running && !this.paused) this.elapsed += (now - this.lastTick) / 1000;
    this.lastTick = now; this.onUpdate(this);
  }
  pausar() { this.paused = true; this.lastPt = null; this.kf = null; }
  continuar() { this.paused = false; this.lastTick = performance.now(); }
  parar() {
    this.running = false; if (rastAtivo === this) rastAtivo = null;
    if (this.watch !== null) navigator.geolocation.clearWatch(this.watch);
    clearInterval(this.tick); this.watch = null;
  }
  // velocidade recente (m/s) pelo histórico dos últimos ~90 s de corrida
  velRecente() {
    const h = this.hist; if (h.length < 2) return this.elapsed > 30 && this.dist > 50 ? this.dist / this.elapsed : 0;
    const fim = h[h.length - 1]; let ini = h[0];
    for (let i = h.length - 1; i >= 0; i--) { if (fim.t - h[i].t >= 90) { ini = h[i]; break; } }
    const tt = fim.t - ini.t, dd = fim.d - ini.d;
    if (tt >= 20 && dd > 0) return dd / tt;
    return fim.t > 15 && fim.d > 30 ? fim.d / fim.t : 0; // pouco histórico: média até o último ponto bom
  }
  // filtro de Kalman simples em metros (posição suavizada pela precisão informada)
  suavizar(lat, lon, acc, t) {
    const mLat = 111320, mLon = 111320 * Math.cos(lat * Math.PI / 180);
    const x = lon * mLon, y = lat * mLat;
    if (!this.kf || t - this.kf.t > 15000) { this.kf = { x, y, v: acc * acc, t, mLat, mLon }; return { lat, lon }; }
    const k = this.kf, dt = (t - k.t) / 1000, Q = 5; // incerteza de movimento (m/s), ajustada em simulação de pista
    k.v += dt * Q * Q; const g = k.v / (k.v + acc * acc);
    k.x += g * (x - k.x); k.y += g * (y - k.y); k.v *= (1 - g); k.t = t;
    return { lat: k.y / k.mLat, lon: k.x / k.mLon };
  }
  pos(p) {
    const { latitude: lat, longitude: lon, accuracy } = p.coords;
    const agora = Date.now();
    this.acc = accuracy; this.erro = null;
    // aceita leituras de até 40 m; se faz mais de 10 s sem leitura boa, aceita até 65 m
    const lim = agora - this.ultimoBom > 10000 ? 65 : 40;
    if (accuracy > lim) return;
    if (accuracy <= 40) this.ultimoBom = agora;
    this.gpsOk = true;
    if (!this.running || this.paused) { this.kf = null; this.suavizar(lat, lon, accuracy, agora); this.lastPt = { lat, lon, t: agora }; this.lastFix = agora; return; }
    const lacuna = this.lastFix ? (agora - this.lastFix) / 1000 : 0;
    this.lastFix = agora;
    // GPS parou por mais de 15 s (tela apagada, app em segundo plano, túnel):
    // a linha reta entre os pontos não representa o trajeto; estima o trecho pelo ritmo recente.
    if (this.lastPt && lacuna > 15) {
      const reto = haversine(this.lastPt, { lat, lon });
      const v = Math.min(this.velRecente(), 6.5);
      const est = Math.max(reto, v * lacuna);
      this.dist += est; this.gapM += est - reto; this.gapS += lacuna; this.gapAviso = true;
      this.hist.push({ t: this.elapsed, d: this.dist }); if (this.hist.length > 400) this.hist.shift();
      this.kf = null; const s0 = this.suavizar(lat, lon, accuracy, agora);
      this.lastPt = { lat: s0.lat, lon: s0.lon, t: agora }; this.pts.push([+lat.toFixed(6), +lon.toFixed(6)]);
      return;
    }
    const s = this.suavizar(lat, lon, accuracy, agora);
    const pt = { lat: s.lat, lon: s.lon, t: agora };
    if (this.lastPt) {
      const d = haversine(this.lastPt, pt), dt = (pt.t - this.lastPt.t) / 1000;
      if (d < Math.max(2, accuracy * 0.15)) return; // ruído parado
      if (dt > 0 && d / dt > 9) return; // > 9 m/s não é corrida
      this.dist += d;
      this.hist.push({ t: this.elapsed, d: this.dist });
      if (this.hist.length > 400) this.hist.shift();
    }
    this.lastPt = pt; this.pts.push([+lat.toFixed(6), +lon.toFixed(6)]);
  }
  paceMedio() { return this.dist > 20 ? this.elapsed / (this.dist / 1000) : NaN; }
  paceAtual() {
    const h = this.hist; if (h.length < 2) return NaN;
    const fim = h[h.length - 1]; let ini = h[0];
    for (let i = h.length - 1; i >= 0; i--) { if (fim.t - h[i].t >= 30) { ini = h[i]; break; } }
    const dd = fim.d - ini.d, tt = fim.t - ini.t;
    if (dd < 15 || tt < 8) return NaN;
    return tt / (dd / 1000);
  }
}
