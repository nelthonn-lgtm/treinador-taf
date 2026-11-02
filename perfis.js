// Vários perfis no mesmo celular + ritmo de prova calculado pela meta de cada pessoa.
import { SEG } from './program.js';
import { meta as metaDe, normalizar } from './concursos.js';

const KEY = 'tafpprn.v1', REG = 'tafpprn.perfis', PREF = 'tafpprn.perfil.';
const ler = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const gravar = (k, v) => { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch {} };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function registro() {
  let r = ler(REG);
  if (!r || !r.lista || !r.lista.length) { r = { ativo: 'p1', lista: [{ id: 'p1', nome: '' }] }; gravar(REG, r); }
  const atual = ler(KEY);
  const a = r.lista.find((x) => x.id === r.ativo);
  if (a && atual?.profile?.nome && a.nome !== atual.profile.nome) { a.nome = atual.profile.nome; gravar(REG, r); }
  return r;
}

function trocar(id) {
  const r = registro();
  if (id === r.ativo) return;
  const atual = localStorage.getItem(KEY);
  if (atual) gravar(PREF + r.ativo, atual);
  const alvo = localStorage.getItem(PREF + id);
  if (alvo) gravar(KEY, alvo); else localStorage.removeItem(KEY);
  r.ativo = id; gravar(REG, r);
  location.hash = '#hoje'; location.reload();
}
function novo() {
  const r = registro();
  const id = 'p' + Date.now().toString(36);
  r.lista.push({ id, nome: '' }); gravar(REG, r);
  trocar(id);
}
function excluir(id) {
  const r = registro();
  if (id === r.ativo) return;
  const n = r.lista.find((x) => x.id === id);
  if (!confirm(`Apagar o perfil "${n?.nome || 'sem nome'}" e todos os treinos dele neste celular?`)) return;
  r.lista = r.lista.filter((x) => x.id !== id); gravar(REG, r);
  localStorage.removeItem(PREF + id); decorar(true);
}

// Ritmo de prova = ritmo necessário para a meta de 12 min de cada pessoa
function ajustarRitmo() {
  const pf = ler(KEY)?.profile; const meta = pf ? metaDe(normalizar({ ...pf, metas: { ...(pf.metas || {}) } }), 'run12', 2400) : 2400;
  const seg = 720 / (meta / 1000), m = Math.floor(seg / 60), s = Math.round(seg % 60);
  const txt = `${m}:${String(s).padStart(2, '0')}`;
  SEG.rit.nome = `Ritmo de prova (${txt}/km)`;
  SEG.rit.voz = `Ritmo de prova. ${m} minutos${s ? ' e ' + s : ''} por quilômetro.`;
}

function decorar(forcar) {
  ajustarRitmo();
  const view = document.getElementById('view');
  if (document.body.dataset.rota !== 'mais' || !view) return;
  const old = document.getElementById('perfis-card');
  if (old && !forcar) return;
  if (old) old.remove();
  const r = registro();
  const html = `<div class="card" id="perfis-card"><h3>👥 Perfis neste celular</h3>
    <p class="muted small">Cada pessoa tem plano, níveis, testes e histórico separados. Se cada um usar o próprio celular, não precisa disso: basta instalar lá.</p>
    <ul class="hist">${r.lista.map((p) => `<li><div>${p.id === r.ativo ? '✅ ' : ''}<b>${esc(p.nome || 'Sem nome (cadastro pendente)')}</b>${p.id === r.ativo ? ' <small>(em uso)</small>' : ''}</div>
      ${p.id === r.ativo ? '' : `<button class="btn small" data-pf="${p.id}">Usar</button><button class="link" data-pfdel="${p.id}">apagar</button>`}</li>`).join('')}</ul>
    <button class="btn ghost" id="pf-novo">+ Novo perfil</button></div>`;
  const top = view.querySelector('.top');
  top ? top.insertAdjacentHTML('afterend', html) : view.insertAdjacentHTML('afterbegin', html);
  view.querySelectorAll('[data-pf]').forEach((b) => (b.onclick = () => trocar(b.dataset.pf)));
  view.querySelectorAll('[data-pfdel]').forEach((b) => (b.onclick = () => excluir(b.dataset.pfdel)));
  document.getElementById('pf-novo').onclick = novo;
}

registro();
ajustarRitmo();
new MutationObserver(() => decorar(false)).observe(document.getElementById('view'), { childList: true });
window.addEventListener('hashchange', () => setTimeout(() => decorar(false), 50));
setTimeout(() => decorar(false), 300);
