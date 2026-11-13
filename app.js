import * as P from './program.js';
import * as St from './store.js';
import * as D from './devices.js';
import * as C from './concursos.js';

const { S, save, hoje } = St;
St.load();
D.setVoz(S().profile.voice);

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const view = $('#view');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const fmtData = (iso) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y.slice(2)}`; };
const diasAte = (iso) => { if (!iso) return null; const a = new Date(hoje() + 'T00:00:00'), b = new Date(iso + 'T00:00:00'); return Math.round((b - a) / 864e5); };
const concurso = () => C.CONCURSOS[S().profile.concurso] || C.CONCURSOS.pprn;
const provas = () => C.provas(S().profile);
const temProva = (t) => C.temProva(S().profile, t);
const minimo = (t, d) => C.minimo(S().profile, t, d);
const metaDe = (t, d) => C.meta(S().profile, t, d);
const potenciaLiberada = () => (temProva('impulsao') || temProva('shuttle')) && S().levels.run >= (P.STRENGTH_TRACKS.potencia.liberaNivelCorrida || 12);
const tracksAtivos = () => ['barra', 'core', 'pernas', ...(temProva('flexao') ? ['flexao'] : []), ...(potenciaLiberada() ? ['potencia'] : [])];

// ---------- UI básica ----------
export function toast(msg, ms = 3200) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms);
}
function modal(html, bind) {
  const m = $('#modal'); m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`; m.classList.add('open');
  const close = () => { m.classList.remove('open'); m.innerHTML = ''; };
  m.onclick = (ev) => { if (ev.target === m) close(); };
  $$('[data-close]', m).forEach((b) => (b.onclick = close));
  bind && bind(m.firstElementChild, close);
  return close;
}
function confirmar(txt, okTxt, fn) {
  modal(`<h3>${txt}</h3><div class="row gap"><button class="btn ghost" data-close>Cancelar</button><button class="btn danger" id="okc">${okTxt}</button></div>`, (el, close) => { $('#okc', el).onclick = () => { close(); fn(); }; });
}
function celebrar(novos) { novos.forEach((b, i) => setTimeout(() => toast(`${b.icone} Conquista: ${b.nome} (+25 XP)`), 800 + i * 3400)); }

function slider(id, label, val = 0) {
  return `<label class="slider"><span>${label}: <b id="${id}-v">${val}</b>/10 <i id="${id}-e">${emojiDor(val)}</i></span>
  <input type="range" min="0" max="10" step="1" value="${val}" id="${id}" oninput="document.getElementById('${id}-v').textContent=this.value;document.getElementById('${id}-e').textContent=window.__emoji(this.value)"></label>`;
}
function emojiDor(v) { v = +v; return v === 0 ? 'sem dor' : v <= 2 ? 'leve' : v <= 4 ? 'incômodo' : v <= 6 ? 'dor moderada' : 'dor forte'; }
window.__emoji = emojiDor;

// ---------- Plano do dia ----------
function sessaoCorridaAtual() {
  const lv = P.RUN_LEVELS[S().levels.run];
  return { lv, sess: lv.s[S().runIdx % 3], idx: S().runIdx % 3 };
}
function suavizar(segs, fator = 0.7) {
  const map = { rit: 'cor', cor: 'tro', tro: 'cam' };
  return segs.map(([t, d]) => [t === 'aq' || t === 'des' ? t : (map[t] || t), t === 'aq' || t === 'des' ? d : Math.max(30, Math.round((d * fator) / 30) * 30)]);
}
const ARRISCADOS = ['negativa', 'barra_livre', 'barra_escada', 'barra_band', 'step_down', 'afundo'];
function montarForca(ci) {
  const L = S().levels, T = P.STRENGTH_TRACKS;
  const j = ci?.joelho || 0, o = ci?.ombro || 0;
  const blocos = [];
  const add = (track, reduzir) => {
    let ex = T[track].levels[L[track]].ex.map((x) => ({ ...x }));
    if (reduzir) {
      ex = ex.filter((x) => !ARRISCADOS.includes(x.id)).map((x) => ({ ...x, series: Math.max(1, Math.ceil(x.series / 2)) }));
      if (track === 'barra' && !ex.some((x) => x.id === 'dead_hang' || x.id === 'hang_parcial')) ex.unshift({ id: 'hang_parcial', series: 2, alvo: 15 });
    }
    blocos.push({ track, titulo: T[track].nome + (reduzir ? ' (reduzido)' : ''), ex });
  };
  const notas = [];
  if (o >= 5) { blocos.push({ track: null, titulo: 'Regenerativo de ombro', ex: P.REGEN_OMBRO }); notas.push('Sem barra hoje: ombro com dor.'); }
  else add('barra', o >= 3);
  add('core', false);
  if (j >= 5) { blocos.push({ track: null, titulo: 'Regenerativo de joelho', ex: P.REGEN_JOELHO }); notas.push('Sem exercícios de perna com carga: joelho com dor.'); }
  else add('pernas', j >= 3);
  if (temProva('flexao')) { if (o >= 5) notas.push('Sem flexão de braço hoje: ombro com dor.'); else add('flexao', o >= 3); }
  if (temProva('impulsao') || temProva('shuttle')) {
    if (!potenciaLiberada()) notas.push(`Treino de impulsão e shuttle é liberado a partir do nível ${P.STRENGTH_TRACKS.potencia.liberaNivelCorrida} da corrida, para proteger os joelhos.`);
    else if (j >= 3) notas.push('Sem saltos hoje: joelho com incômodo.');
    else add('potencia', false);
  }
  return { blocos, notas };
}

function planoDoDia(dateIso = hoje(), override = null) {
  const s = S(), ci = s.checkins[dateIso], st = P.statusDor(ci);
  const wd = new Date(dateIso + 'T12:00:00').getDay();
  const dTaf = diasAte(s.profile.tafDate) ?? 999;
  const base = override ? { ...override } : { ...P.SEMANA[wd] };
  const notas = [];
  if (!override && dateIso === hoje()) {
    if (dTaf === 0) return { tipo: 'taf', titulo: 'DIA DO TAF', st };
    if (dTaf > 0 && dTaf <= 2) return { tipo: 'mobilidade', titulo: 'Véspera do TAF: só mobilidade e caminhada leve', ex: P.MOBILIDADE, st, notas: ['Descanse as pernas e os braços. Nada de testes máximos.'] };
    if (dTaf > 2 && dTaf <= 7 && base.tipo === 'forca') return { tipo: 'mobilidade', titulo: 'Semana do TAF: mobilidade', ex: P.MOBILIDADE, st, notas: ['Na semana da prova, a força fica em manutenção leve para chegar descansado.'] };
  }
  if (st?.nivel === 'vermelho') return { tipo: 'descanso', titulo: 'Descanso total', st, notas: [st.txt] };
  if (base.tipo === 'run') {
    const j = ci?.joelho || 0;
    if (j >= 5) return { tipo: 'regen', titulo: 'Regenerativo de joelho (no lugar da corrida)', ex: P.REGEN_JOELHO, st, notas: ['Corrida suspensa hoje. A sessão de corrida fica para o próximo dia de corrida.'] };
    let { lv, sess, idx } = sessaoCorridaAtual();
    if (dateIso === hoje() && dTaf > 2 && dTaf <= 7) { sess = P.TAPER_RUN; notas.push('Semana do TAF: volume baixo, só para manter o ritmo.'); }
    if (sess.simulado && st?.nivel !== 'verde') { sess = lv.s[0]; notas.push('Simulado adiado: só faça o teste de 12 min com check-in verde.'); }
    let segs = sess.segs;
    if (j >= 3) { segs = suavizar(segs); notas.push('Joelho com incômodo: treino suavizado (30% menos e sem ritmo de prova). Prefira terra ou grama.'); }
    if ((ci?.ombro || 0) >= 5) notas.push('Ombro com dor: corra com os braços relaxados; a força de barra fica suspensa.');
    return { tipo: 'run', titulo: sess.titulo, fase: lv.fase, nota: lv.nota, segs, simulado: !!sess.simulado && st?.nivel === 'verde', adaptado: j >= 3, st, notas, nivel: s.levels.run, idx };
  }
  if (base.tipo === 'forca') { const f = montarForca(ci); return { tipo: 'forca', titulo: 'Força em casa', blocos: f.blocos, st, notas: f.notas }; }
  if (base.tipo === 'mobilidade') return { tipo: 'mobilidade', titulo: 'Mobilidade + caminhada leve', ex: P.MOBILIDADE, st, notas };
  if (base.tipo === 'regen') {
    const j = ci?.joelho || 0, o = ci?.ombro || 0;
    const ex = j >= o ? P.REGEN_JOELHO : P.REGEN_OMBRO;
    return { tipo: 'regen', titulo: 'Treino regenerativo', ex: j || o ? ex : P.REGEN_GERAL, st, notas };
  }
  return { tipo: 'descanso', titulo: 'Descanso', st, notas: ['Descanso também é treino: é quando o corpo se adapta. Uma caminhada leve de 20 min é opcional.'] };
}
const durTotal = (segs) => segs.reduce((a, [, d]) => a + d, 0);

// ---------- Telas ----------
const rotas = {};
let planoAtivo = null; // treino carregado para executar
let limpeza = null;

function ir(hash) { if (location.hash === hash) render(); else location.hash = hash; }
window.addEventListener('hashchange', render);

function render() {
  if (limpeza) { try { limpeza(); } catch {} limpeza = null; }
  const md = $('#modal'); md.classList.remove('open'); md.innerHTML = '';
  const s = S();
  let rota = (location.hash || '#hoje').slice(1).split('?')[0];
  if (!s.profile.onboarded) rota = 'boasvindas';
  if (!rotas[rota]) rota = 'hoje';
  $$('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.r === rota || (a.dataset.r === 'mais' && ['niveis', 'perfil', 'dicas', 'edital', 'conquistas', 'lembretes', 'backup'].includes(rota))));
  document.body.dataset.rota = rota;
  view.scrollTop = 0; window.scrollTo(0, 0);
  rotas[rota]();
}

// ===== Boas-vindas =====
rotas.boasvindas = () => {
  const p = S().profile;
  view.innerHTML = `
  <section class="hero"><div class="logo">TAF</div><h1>Treinador TAF</h1><p>Seu plano de corrida, barra, abdominal e demais provas do TAF do seu concurso, com progressão segura para joelhos e ombros.</p></section>
  <div class="card warn"><h3>Antes de começar</h3>
  <p>Este app organiza o treino, mas não substitui avaliação médica. Depois de anos parado e com histórico nos joelhos e ombros, faça uma consulta e, se possível, acompanhamento de fisioterapeuta ou educador físico. O edital exige atestado médico emitido até 30 dias antes do TAF.</p>
  <label class="check"><input type="checkbox" id="ob-ok"> Entendi e vou respeitar a dor e os sinais de alerta.</label></div>
  <div class="card"><h3>Seus dados</h3>
  <label>Nome<input id="ob-nome" value="${esc(p.nome)}" placeholder="Como quer ser chamado"></label>
  <div class="grid2"><label>Sexo (define os índices do edital)<select id="ob-sexo"><option value="M">Masculino</option><option value="F">Feminino</option></select></label>
  <label>Peso (kg)<input id="ob-peso" type="text" inputmode="decimal" step="0.1" value="${p.peso}"></label></div>
  <label>Altura (m)<input id="ob-alt" type="text" inputmode="decimal" step="0.01" value="${p.altura || ''}" placeholder="1,71"></label>
  <label>Concurso<select id="ob-conc">${Object.entries(C.CONCURSOS).map(([k, c]) => `<option value="${k}" ${p.concurso === k ? 'selected' : ''}>${c.nome}</option>`).join('')}</select></label>
  <label>Data do TAF (deixe em branco se ainda não saiu)<input id="ob-taf" type="date" value="${p.tafDate}"></label>
  <h3>Equipamentos</h3>
  <label class="check"><input type="checkbox" id="ob-elas" checked> Tenho elástico de resistência (ou vou comprar)</label>
  <label class="check"><input type="checkbox" id="ob-band"> Tenho superband (elástico longo para barra)</label>
  <label>Barra fixa<select id="ob-barra"><option value="casa">Tenho em casa</option><option value="praca" selected>Uso em praça/academia</option><option value="nao">Ainda não tenho acesso</option></select></label>
  <h3>Ponto de partida</h3>
  <label class="check"><input type="checkbox" id="ob-cam"> Caminho 30 min em ritmo rápido sem dor</label>
  <label class="check"><input type="checkbox" id="ob-tro"> Troto 5 min seguidos sem dor</label>
  <button class="btn big" id="ob-go">Montar meu plano</button></div>`;
  $('#ob-go').onclick = () => {
    if (!$('#ob-ok').checked) return toast('Marque que entendeu o aviso de segurança.');
    Object.assign(p, { nome: $('#ob-nome').value.trim(), sexo: $('#ob-sexo').value, altura: +String($('#ob-alt').value).replace(',', '.') || p.altura, tafDate: $('#ob-taf').value, concurso: $('#ob-conc').value, startDate: hoje(), onboarded: true });
    St.registrarPeso(+String($('#ob-peso').value).replace(',', '.') || 75);
    p.equip = { elastico: $('#ob-elas').checked, superband: $('#ob-band').checked, barraFixa: $('#ob-barra').value };
    S().levels.run = $('#ob-cam').checked && $('#ob-tro').checked ? 1 : 0;
    save(); D.unlockAudio(); ir('#hoje');
  };
};

// ===== Hoje =====
rotas.hoje = () => {
  const s = S(), p = s.profile, h = hoje(), ci = s.checkins[h];
  const xp = St.nivelXP(), dTaf = diasAte(p.tafDate), agua = s.water[h] || 0, metaA = St.metaAgua();
  const plano = ci ? planoDoDia() : null;
  view.innerHTML = `
  <header class="top"><div><small>${DIAS[new Date().getDay()]}, ${fmtData(h)}</small><h1>Olá${p.nome ? ', ' + esc(p.nome.split(' ')[0]) : ''}!</h1></div>
  <div class="pill">${dTaf === null ? 'TAF: data a definir' : dTaf >= 0 ? `<b>${dTaf}</b> dias para o TAF` : 'TAF já passou'}</div></header>
  <div class="xp"><span>Nível ${xp.lvl}</span><div class="bar"><i style="width:${xp.pct}%"></i></div><span>🔥 ${St.streak()}</span></div>
  ${ci ? cardStatus(ci) : cardCheckin()}
  ${plano ? cardPlano(plano) : ''}
  <div class="card"><div class="row between"><h3>💧 Hidratação</h3><small>${agua * 250} / ${metaA * 250} ml</small></div>
  <div class="cups">${Array.from({ length: metaA }, (_, i) => `<span class="${i < agua ? 'on' : ''}">💧</span>`).join('')}</div>
  <div class="row gap"><button class="btn ghost" id="ag-m">− copo</button><button class="btn" id="ag-p">+ copo (250 ml)</button></div>
  ${P.SEMANA[new Date().getDay()].tipo === 'run' ? '<small>Dia de corrida: beba mais 500 ml além da meta.</small>' : ''}</div>
  ${cardPeso()}
  <div class="card"><h3>Próximos dias</h3><div class="semana">${proximos()}</div></div>
  <div class="card tip"><h3>Dica do dia</h3><p>${dicaDoDia()}</p></div>`;
  if (!ci) bindCheckin();
  else {
    $('#ci-refazer') && ($('#ci-refazer').onclick = () => { delete S().checkins[h]; save(); render(); });
    bindPlano(plano);
  }
  bindPeso();
  $('#ag-p').onclick = () => { s.water[h] = agua + 1; if (agua + 1 === metaA) { St.addXP(10); toast('Meta de água batida! +10 XP'); } save(); celebrar(St.checkBadges()); save(); render(); };
  $('#ag-m').onclick = () => { s.water[h] = Math.max(0, agua - 1); save(); render(); };
};

function cardPeso() {
  const s = S(), p = s.profile, ult = s.pesos[s.pesos.length - 1];
  const dias = ult ? Math.round((new Date(hoje()) - new Date(ult.date)) / 864e5) : 999;
  const v = St.imc();
  const resumo = ult ? `<p><b>${ult.kg.toFixed(1)} kg</b>${v ? ` · IMC ${v.toFixed(1)} (${St.faixaIMC(v)})` : ''}${p.pesoInicial && p.pesoInicial !== ult.kg ? ` · <b>${(ult.kg - p.pesoInicial > 0 ? '+' : '') + (ult.kg - p.pesoInicial).toFixed(1)} kg</b> desde o início` : ''}${p.pesoMeta ? ` · meta ${p.pesoMeta} kg` : ''}</p>` : '<p>Registre seu peso para acompanhar a evolução.</p>';
  if (dias < 7) return `<div class="card"><div class="row between"><h3>⚖️ Peso</h3><small>próxima pesagem em ${7 - dias} dia${7 - dias > 1 ? 's' : ''}</small></div>${resumo}</div>`;
  return `<div class="card hl"><h3>⚖️ Pesagem da semana</h3>${resumo}<p class="muted small">Pese-se 1 vez por semana, de manhã, em jejum, depois de ir ao banheiro, sempre na mesma balança.</p>
  <div class="row gap"><input id="pz-kg" type="text" inputmode="decimal" step="0.1" placeholder="Peso em kg" style="flex:1">${p.altura ? '' : '<input id="pz-alt" type="text" inputmode="decimal" step="0.01" placeholder="Altura (m)" style="flex:1">'}<button class="btn" id="pz-ok">Salvar</button></div></div>`;
}
function bindPeso() {
  const b = $('#pz-ok'); if (!b) return;
  b.onclick = () => {
    const kg = +String($('#pz-kg').value).replace(',', '.');
    if (!kg || kg < 30 || kg > 250) return toast('Digite um peso válido.');
    const ant = S().pesos[S().pesos.length - 1];
    const alt = $('#pz-alt') && +String($('#pz-alt').value).replace(',', '.');
    if (alt && alt > 1 && alt < 2.3) S().profile.altura = alt;
    St.registrarPeso(kg); St.addXP(10); save(); const nov = St.checkBadges(); save();
    let msg = 'Peso registrado (+10 XP).';
    if (ant) { const d = kg - ant.kg, lim = ant.kg * 0.01; msg = d < -lim ? `${d.toFixed(1)} kg. Perda rápida: priorize comida de verdade e proteína para não perder músculo.` : d < 0 ? `${d.toFixed(1)} kg. Ritmo ideal, continue assim!` : d === 0 ? 'Peso estável. Oscilações semanais são normais; olhe a tendência do mês.' : `+${d.toFixed(1)} kg. Pode ser retenção de líquido; observe a tendência do mês.`; }
    render(); toast(msg, 5000); celebrar(nov);
  };
}
function cardCheckin() {
  return `<div class="card hl"><h3>Check-in de hoje</h3><p>Como estão as articulações agora? (0 = nada, 10 = pior dor possível)</p>
  ${slider('ci-j', 'Joelhos')}${slider('ci-o', 'Ombros')}
  <label>Disposição<select id="ci-c"><option value="3">Normal</option><option value="4">Ótima</option><option value="2">Cansado</option><option value="1">Muito cansado / dormi mal</option></select></label>
  <details><summary>Algum sinal de alerta?</summary>${P.SINAIS_ALERTA.map((t, i) => `<label class="check"><input type="checkbox" class="ci-al" value="${i}"> ${t}</label>`).join('')}</details>
  <button class="btn big" id="ci-ok">Salvar check-in</button></div>`;
}
function bindCheckin() {
  $('#ci-ok').onclick = () => {
    const ci = { joelho: +$('#ci-j').value, ombro: +$('#ci-o').value, disp: +$('#ci-c').value, alerta: $$('.ci-al').some((c) => c.checked), ts: Date.now() };
    S().checkins[hoje()] = ci; St.addXP(5); save();
    const nov = St.checkBadges(); save(); render(); toast('Check-in salvo (+5 XP)'); celebrar(nov);
  };
}
function cardStatus(ci) {
  const st = P.statusDor(ci);
  const ontem = S().checkins[hoje(new Date(Date.now() - 864e5))];
  const piora = ontem && (ci.joelho >= 5 && ontem.joelho >= 5 || ci.ombro >= 5 && ontem.ombro >= 5);
  return `<div class="card st-${st.nivel}"><div class="row between"><h3>${{ verde: '🟢 Liberado', amarelo: '🟡 Atenção', laranja: '🟠 Regenerativo', vermelho: '🔴 Descanso' }[st.nivel]}</h3><button class="link" id="ci-refazer">refazer check-in</button></div>
  <p>Joelhos ${ci.joelho}/10 · Ombros ${ci.ombro}/10${ci.disp <= 1 ? ' · muito cansado' : ''}</p><p>${st.txt}</p>
  ${ci.disp <= 1 && st.nivel === 'verde' ? '<p><b>Cansaço alto:</b> faça o treino, mas pode trocar por mobilidade se não estiver bem.</p>' : ''}
  ${piora ? '<p><b>Dor ≥ 5 por 2 dias seguidos.</b> Considere voltar um nível (Mais › Níveis) e procurar avaliação profissional.</p>' : ''}</div>`;
}
function cardPlano(pl) {
  let corpo = '';
  if (pl.tipo === 'run') {
    corpo = `<p class="muted">${pl.fase} · nível ${pl.nivel + 1}/${P.RUN_LEVELS.length} · sessão ${'ABC'[pl.idx]}${pl.adaptado ? ' · <b>adaptado</b>' : ''}</p>
    <div class="segbar">${pl.segs.map(([t, d]) => `<i style="flex:${d};background:${P.SEG[t].cor}" title="${P.SEG[t].nome}"></i>`).join('')}</div>
    <p>Duração: ${Math.round(durTotal(pl.segs) / 60)} min${pl.nota ? ' · ' + pl.nota : ''}</p>
    <details><summary>Aquecimento e técnica</summary><ul>${P.AQUECIMENTO_CORRIDA.map((x) => `<li>${x}</li>`).join('')}<li>Cadência alvo: ${S().profile.cadence} passos/min (passos curtos, pé aterrissa embaixo do corpo).</li></ul></details>
    ${pl.simulado ? '<button class="btn big orange" id="pl-sim">Abrir simulado de 12 min</button><small>Aqueça 10 min antes (caminhada + trote) e depois inicie o simulado.</small>' : '<button class="btn big" id="pl-go">Iniciar treino guiado (GPS)</button>'}`;
  } else if (pl.tipo === 'forca') {
    corpo = `<p class="muted">${pl.blocos.map((b) => b.titulo).join(' · ')}</p><p>≈ 35-45 min</p><button class="btn big" id="pl-go">Iniciar treino de força</button>`;
  } else if (pl.tipo === 'mobilidade' || pl.tipo === 'regen') {
    corpo = `<p class="muted">${pl.ex.map((x) => P.EX[x.id].nome).join(' · ')}</p><button class="btn big" id="pl-go">Iniciar</button>`;
  } else if (pl.tipo === 'taf') {
    corpo = `<p>É hoje! Revise:</p><ul>${concurso().regras.map((x) => `<li>${x}</li>`).join('')}<li>Aqueça 10-15 min: caminhada, trote leve, mobilidade de ombro e 2 suspensões curtas na barra.</li><li>Na corrida, saia no seu ritmo de treino (5:00/km). Não dispare na largada.</li></ul>`;
  } else corpo = '';
  return `<div class="card plano"><div class="row between"><h3>Treino de hoje</h3><button class="link" id="pl-troca">trocar</button></div><h2>${pl.titulo}</h2>
  ${(pl.notas || []).map((n) => `<p class="nota">${n}</p>`).join('')}${corpo}</div>`;
}
function bindPlano(pl) {
  const go = $('#pl-go');
  if (go) go.onclick = () => { planoAtivo = pl; D.unlockAudio(); ir(pl.tipo === 'run' ? '#correr?guiado' : '#treino'); };
  const sim = $('#pl-sim'); if (sim) sim.onclick = () => { D.unlockAudio(); planoAtivo = pl; ir('#correr?simulado'); };
  $('#pl-troca').onclick = () => modal(`<h3>Trocar o treino de hoje</h3><p>Use quando o dia não encaixar. A progressão continua contando as sessões feitas.</p>
    <div class="col gap"><button class="btn" data-t="run">Corrida (próxima sessão do nível)</button><button class="btn" data-t="forca">Força em casa</button><button class="btn" data-t="mobilidade">Mobilidade + caminhada leve</button><button class="btn" data-t="regen">Regenerativo</button><button class="btn ghost" data-close>Fechar</button></div>`, (el, close) => {
    $$('[data-t]', el).forEach((b) => (b.onclick = () => { close(); const n = planoDoDia(hoje(), { tipo: b.dataset.t }); planoAtivo = n; D.unlockAudio(); ir(n.tipo === 'run' ? (n.simulado ? '#correr?simulado' : '#correr?guiado') : '#treino'); }));
  });
}
function proximos() {
  let out = '';
  for (let i = 1; i <= 6; i++) {
    const d = new Date(Date.now() + i * 864e5), b = P.SEMANA[d.getDay()];
    out += `<div><b>${DIAS[d.getDay()]}</b><span>${b.titulo}</span></div>`;
  }
  return out;
}
const DICAS = [
  'Cadência: passos curtos e rápidos (≈ 170 por minuto) reduzem a freada no calcanhar e a carga no joelho. Use o metrônomo na tela Correr.',
  'Prefira terra batida, grama ou pista de atletismo nas primeiras semanas. Asfalto e cimento só quando o joelho estiver sem dor.',
  'Regra dos 10%: nunca aumente o volume semanal de corrida mais que isso. O app já respeita essa regra pelos níveis.',
  'Dor que aparece durante o treino e piora a cada minuto = pare. Dor leve (até 2/10) que some no aquecimento costuma ser aceitável.',
  'Na barra, a escápula trabalha antes do braço: comece cada repetição puxando os ombros para baixo, longe das orelhas.',
  'Nunca solte o corpo de uma vez ao descer da barra. Use um banco para subir e descer, protegendo o ombro.',
  'Cada 1 kg perdido tira cerca de 4 kg de carga do joelho a cada passada. Perder peso devagar é o melhor protetor de joelho que existe.',
  'Barra fixa é força relativa: cada kg a menos torna a barra mais fácil, mesmo sem ganhar força.',
  'Acompanhe a quilometragem do seu tênis em Evolução: amortecimento gasto aumenta o impacto no joelho.',
  'Sono é treino: menos de 6 h por noite aumenta o risco de lesão. Se dormiu mal, marque "muito cansado" no check-in.',
  'No TAF, a corrida permite caminhar, mas não parar. Treine a estratégia: ritmo constante de 5:00/km desde a largada.',
  'Abdominal do edital: braços cruzados no peito e escápulas tocando o chão em toda repetição. Repetição incompleta não conta.',
  'Coma algo leve 1-2 h antes de correr e tome água ao longo do dia, não tudo de uma vez.',
  'Glúteo médio forte (ostra, abdução) mantém o joelho alinhado na corrida. Não pule os exercícios de perna.',
];
function dicaDoDia() { const n = Math.floor(Date.now() / 864e5); return DICAS[n % DICAS.length]; }

// ===== Correr (GPS) =====
rotas.correr = () => {
  const modo = (location.hash.split('?')[1] || (planoAtivo?.tipo === 'run' ? 'guiado' : 'livre'));
  const p = S().profile;
  const plano = modo === 'guiado' && planoAtivo?.tipo === 'run' ? planoAtivo : null;
  const segs = plano ? plano.segs : null;
  const simul = modo === 'simulado';
  const planoSim = simul && planoAtivo?.simulado ? planoAtivo : null;
  const MIN = minimo('run12', p.sexo === 'F' ? 1600 : 2000), META = metaDe('run12', 2400);
  let map = null, linha = null, marcador = null, metroOn = false;
  let segAtual = -1, proxAnuncio = p.announce, avisos = {};
  const rast = new D.Rastreador(atualizar);

  view.innerHTML = `
  <header class="top"><h1>${simul ? 'Simulado 12 min' : plano ? 'Treino guiado' : 'Corrida livre'}</h1>
  <div class="seg-tabs"><a href="#correr?livre" class="${modo === 'livre' ? 'on' : ''}">Livre</a><a href="#correr?simulado" class="${simul ? 'on' : ''}">Simulado</a>${planoAtivo?.tipo === 'run' ? `<a href="#correr?guiado" class="${modo === 'guiado' ? 'on' : ''}">Guiado</a>` : ''}</div></header>
  ${plano ? `<div class="card seg-card"><div id="seg-nome" class="seg-nome">${esc(plano.titulo)}</div><div id="seg-rest" class="seg-rest">${D.fmtTempo(durTotal(segs))}</div><div id="seg-prox" class="muted">Toque em Iniciar</div><div class="segbar" id="segbar">${segs.map(([t, d]) => `<i style="flex:${d};background:${P.SEG[t].cor}"></i>`).join('')}<b id="seg-cursor"></b></div></div>` : ''}
  ${simul ? `<div class="card"><p>Distância no edital: <b>${MIN} m</b> · sua meta: <b>${META} m</b> (ritmo ${D.fmtPace(720 / (META / 1000))}/km). Aqueça antes. O teste termina sozinho em 12:00.</p></div>` : ''}
  <div class="metrics">
    <div class="m big"><small>${simul ? 'Restante' : 'Tempo'}</small><b id="r-t">${simul ? '12:00' : '00:00'}</b></div>
    <div class="m"><small>Distância</small><b id="r-d">0 m</b></div>
    <div class="m"><small>Pace médio</small><b id="r-pm">--:--</b></div>
    <div class="m"><small>Pace atual</small><b id="r-pa">--:--</b></div>
    ${simul ? '<div class="m"><small>Projeção 12 min</small><b id="r-proj">-</b></div><div class="m"><small>Pace p/ meta</small><b id="r-need">-</b></div>' : ''}
  </div>
  <div id="gps" class="gps">Procurando GPS…</div>
  <div class="row gap ctrl"><button class="btn big" id="r-start">Iniciar</button><button class="btn big ghost hide" id="r-pause">Pausar</button><button class="btn big danger hide" id="r-stop">Finalizar</button></div>
  <div class="row gap"><button class="btn ghost" id="r-metro">🎵 Metrônomo ${p.cadence} ppm: desligado</button></div>
  <div id="map" class="${p.showMap ? '' : 'hide'}"></div>
  <p class="muted small">Mantenha a tela ligada e o app aberto durante a corrida: o navegador pausa o GPS quando a tela apaga. O app pede para a tela ficar acesa.</p>`;

  if (p.showMap && window.L) {
    try {
      map = L.map('map', { zoomControl: false, attributionControl: true }).setView([-6.46, -37.1], 15);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
      linha = L.polyline([], { color: '#f97316', weight: 5 }).addTo(map);
    } catch { map = null; }
  }
  rast.ligarGPS();

  function atualizar(r) {
    const g = $('#gps'); if (!g) return;
    g.className = 'gps ' + (r.erro ? 'bad' : r.gpsOk ? 'ok' : '');
    g.textContent = r.erro || (r.acc ? `GPS ${r.gpsOk ? 'pronto' : 'ajustando'} · precisão ${Math.round(r.acc)} m` : 'Procurando GPS…');
    if (r.lastPt && map) {
      const ll = [r.lastPt.lat, r.lastPt.lon];
      if (!marcador) { marcador = L.circleMarker(ll, { radius: 7, color: '#fff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 }).addTo(map); map.setView(ll, 17); }
      else marcador.setLatLng(ll);
      if (r.running) { linha.setLatLngs(r.pts); if (!r.paused) map.panTo(ll, { animate: false }); }
    }
    if (!r.running) return;
    const t = r.elapsed, pm = r.paceMedio(), pa = r.paceAtual();
    $('#r-t').textContent = simul ? D.fmtTempo(720 - t) : D.fmtTempo(t);
    $('#r-d').textContent = r.dist >= 1000 ? (r.dist / 1000).toFixed(2) + ' km' : Math.round(r.dist) + ' m';
    $('#r-pm').textContent = D.fmtPace(pm); $('#r-pa').textContent = D.fmtPace(pa);
    if (r.dist >= proxAnuncio) {
      D.beep(1200, 0.15); D.vibrate(200);
      D.falar(`${proxAnuncio >= 1000 && proxAnuncio % 1000 === 0 ? proxAnuncio / 1000 + ' quilômetro' + (proxAnuncio > 1000 ? 's' : '') : proxAnuncio + ' metros'}. Tempo ${D.falarTempo(t)}. Ritmo ${D.falarPace(pm)}.`);
      proxAnuncio += p.announce;
    }
    if (simul) {
      const proj = t > 30 ? Math.round((r.dist / t) * 720) : null;
      $('#r-proj').textContent = proj ? proj + ' m' : '-';
      const resto = 720 - t, falta = META - r.dist;
      $('#r-need').textContent = falta <= 0 ? 'meta ✔' : D.fmtPace(resto / (falta / 1000));
      $('#r-proj').className = proj ? (proj >= META ? 'good' : proj >= MIN ? 'mid' : 'bad') : '';
      for (const [k, msg] of [[360, 'Metade da prova. Mantenha o ritmo.'], [540, 'Faltam 3 minutos.'], [660, 'Falta 1 minuto! Acelere se puder.']]) {
        if (t >= k && !avisos[k]) { avisos[k] = 1; D.falar(`${msg} ${Math.round(r.dist)} metros.`); D.vibrate([200, 100, 200]); }
      }
      if (t >= 720) { r.elapsed = 720; finalizar(); }
    }
    if (segs) atualizarSeg(t);
  }
  function atualizarSeg(t) {
    let acc = 0, i = 0;
    for (; i < segs.length; i++) { if (t < acc + segs[i][1]) break; acc += segs[i][1]; }
    const total = durTotal(segs);
    $('#seg-cursor').style.left = Math.min(100, (t / total) * 100) + '%';
    if (i >= segs.length) {
      if (segAtual !== 99) { segAtual = 99; D.beep(880, 0.4); D.vibrate([300, 100, 300]); D.falar('Treino concluído! Pode finalizar quando quiser.'); $('#seg-nome').textContent = 'Treino concluído ✔'; $('#seg-rest').textContent = ''; $('#seg-prox').textContent = 'Toque em Finalizar para salvar.'; }
      return;
    }
    const [tipo, dur] = segs[i], rest = acc + dur - t;
    if (i !== segAtual) {
      segAtual = i; D.beep(988, 0.15); setTimeout(() => D.beep(1318, 0.2), 180); D.vibrate([150, 80, 150]);
      D.falar(`${P.SEG[tipo].voz} ${D.falarTempo(dur)}.`);
      $('#seg-nome').textContent = P.SEG[tipo].nome; $('#seg-nome').style.color = P.SEG[tipo].cor;
      const prox = segs[i + 1]; $('#seg-prox').textContent = prox ? `Depois: ${P.SEG[prox[0]].nome} ${D.fmtTempo(prox[1])} · bloco ${i + 1}/${segs.length}` : 'Último bloco';
    }
    $('#seg-rest').textContent = D.fmtTempo(rest);
    if (rest <= 3.2 && rest > 0 && !avisos['s' + i + Math.ceil(rest)]) { avisos['s' + i + Math.ceil(rest)] = 1; D.beep(660, 0.08); }
  }

  $('#r-start').onclick = () => {
    D.unlockAudio(); window.__querTela = true; D.manterTela();
    rast.iniciar(); $('#r-start').classList.add('hide'); $('#r-pause').classList.remove('hide'); $('#r-stop').classList.remove('hide');
    if (!segs) D.falar(simul ? 'Valendo! Doze minutos.' : 'Corrida iniciada.');
    if (simul) { D.beep(1000, 0.5); }
  };
  $('#r-pause').onclick = () => {
    if (rast.paused) { rast.continuar(); $('#r-pause').textContent = 'Pausar'; D.falar('Continuando.'); }
    else { rast.pausar(); $('#r-pause').textContent = 'Continuar'; D.falar('Pausado.'); }
  };
  $('#r-stop').onclick = () => confirmar('Finalizar e salvar a corrida?', 'Finalizar', finalizar);
  $('#r-metro').onclick = () => {
    metroOn = !metroOn; metroOn ? D.metronomo(p.cadence) : D.pararMetronomo();
    $('#r-metro').textContent = `🎵 Metrônomo ${p.cadence} ppm: ${metroOn ? 'ligado' : 'desligado'}`;
  };

  let finalizado = false;
  function finalizar() {
    if (finalizado) return; finalizado = true;
    rast.parar(); D.pararMetronomo(); window.__querTela = false; D.liberarTela();
    const dist = Math.round(rast.dist), dur = Math.round(rast.elapsed);
    if (simul) D.falar(`Fim do teste. ${dist} metros.`);
    modal(`<h3>${simul ? 'Resultado do simulado' : 'Corrida finalizada'}</h3>
      <div class="metrics small"><div class="m"><small>Distância</small><b>${dist} m</b></div><div class="m"><small>Tempo</small><b>${D.fmtTempo(dur)}</b></div><div class="m"><small>Pace</small><b>${D.fmtPace(rast.paceMedio())}</b></div></div>
      ${simul ? `<p>${dist >= META ? '🥇 Meta batida!' : dist >= MIN ? '✅ Acima do mínimo do edital.' : `Faltaram ${MIN - dist} m para o mínimo do edital.`}</p>` : ''}
      ${rast.gapAviso ? `<p class="nota">⚠️ O GPS ficou parado por ${rast.gapS < 60 ? Math.round(rast.gapS) + ' s' : Math.round(rast.gapS / 60) + ' min'} (tela apagada ou app em segundo plano). Esse trecho foi estimado pelo seu ritmo (cerca de ${Math.round(rast.gapM)} m) e pode ter pequena diferença. Para medir certo, deixe a tela ligada com o app aberto durante a corrida.</p>` : ''}
      <p>Como ficaram as articulações depois do treino?</p>${slider('fj', 'Joelhos')}${slider('fo', 'Ombros')}
      <label>Esforço percebido (1 = muito fácil, 10 = máximo)<input type="range" id="frpe" min="1" max="10" value="5"></label>
      <label>Anotações<input id="fnota" placeholder="Piso, clima, sensação…"></label>
      <div class="row gap"><button class="btn ghost" id="fdesc">Descartar</button><button class="btn" id="fsalvar">Salvar</button></div>`, (el, close) => {
      $('#fdesc', el).onclick = () => { close(); planoAtivo = null; ir('#hoje'); };
      $('#fsalvar', el).onclick = () => {
        const s = S(), j = +$('#fj', el).value, o = +$('#fo', el).value;
        s.sessions.push({ id: St.uid(), date: hoje(), ts: Date.now(), kind: 'run', modo, titulo: simul ? 'Simulado 12 min' : plano ? plano.titulo : 'Corrida livre', dist, dur, pace: rast.paceMedio(), dorJ: j, dorO: o, rpe: +$('#frpe', el).value, nota: $('#fnota', el).value, route: rast.pts.length > 2500 ? rast.pts.filter((_, i) => i % 2 === 0) : rast.pts, nivel: s.levels.run });
        St.addXP(simul ? 60 : 40);
        let msg = 'Corrida salva!';
        if (simul && dur >= 700) s.tests.push({ id: St.uid(), date: hoje(), type: 'run12', value: dist, origem: 'gps' });
        if (plano && !plano.adaptado && dur >= durTotal(segs) * 0.85) { s.runIdx++; msg = St.registrarProgresso('run', j); }
        else if (plano && plano.adaptado) msg = 'Treino adaptado salvo. Ele não conta para subir de nível.';
        else if (plano) msg = 'Treino salvo, mas foi encerrado antes de 85% do tempo: não conta para o nível.';
        if (planoSim && dur >= 700) { s.runIdx++; msg = St.registrarProgresso('run', j); }
        save(); const nov = St.checkBadges(); save(); close(); planoAtivo = null; toast(msg, 5000); celebrar(nov); ir('#evolucao');
      };
    });
  }
  limpeza = () => { if (!finalizado) { rast.parar(); D.pararMetronomo(); window.__querTela = false; D.liberarTela(); } if (map) map.remove(); };
};

// ===== Treino de força / mobilidade =====
rotas.treino = () => {
  const pl = planoAtivo && planoAtivo.tipo !== 'run' ? planoAtivo : planoDoDia(hoje(), { tipo: 'forca' });
  const blocos = pl.blocos || [{ track: null, titulo: pl.titulo, ex: pl.ex }];
  const feito = {};
  view.innerHTML = `<header class="top"><h1>${esc(pl.titulo)}</h1></header>
  ${(pl.notas || []).map((n) => `<p class="nota">${n}</p>`).join('')}
  <div class="card tip"><b>Aquecimento (5 min):</b> círculos de ombro e quadril, gato-camelo, 10 agachamentos sem peso. Descanso entre séries: 60-90 s (barra e negativas: 2 min).</div>
  ${blocos.map((b, bi) => `<h2 class="sec">${esc(b.titulo)}${b.track ? ` <small>${P.STRENGTH_TRACKS[b.track].levels[S().levels[b.track]].nome}</small>` : ''}</h2>
    ${b.ex.map((x, xi) => { const E = P.EX[x.id]; const alvo = E.tipo === 'tempo' ? (x.alvo >= 120 ? Math.round(x.alvo / 60) + ' min' : x.alvo + ' s') : x.alvo + ' reps'; return `
    <div class="card ex"><div class="row between"><h3>${E.nome}</h3><span class="pill">${x.series} × ${alvo}${E.lado ? ' por lado' : ''}</span></div>
    <p class="muted">${E.dica}</p>${E.alt && (x.id === 'remada_elastico' || x.id === 'rot_externa') && !S().profile.equip.elastico ? `<p class="nota">${E.alt}</p>` : E.alt && x.id === 'remada_aus' ? `<p class="muted small">${E.alt}</p>` : ''}
    <div class="sets">${Array.from({ length: x.series }, (_, si) => `<button class="set" data-k="${bi}-${xi}-${si}">${si + 1}</button>`).join('')}
    ${E.tipo === 'tempo' ? `<button class="btn small" data-timer="${x.alvo}">▶ ${alvo}</button>` : ''}</div></div>`; }).join('')}`).join('')}
  <div class="row gap sticky-bottom"><button class="btn ghost" data-rest="60">⏱ 60 s</button><button class="btn ghost" data-rest="90">⏱ 90 s</button><button class="btn ghost" data-rest="120">⏱ 2 min</button><button class="btn" id="t-fim">Concluir</button></div>`;
  $$('.set').forEach((b) => (b.onclick = () => { b.classList.toggle('on'); feito[b.dataset.k] = b.classList.contains('on'); D.vibrate(30); }));
  $$('[data-timer]').forEach((b) => (b.onclick = () => timerOverlay(+b.dataset.timer, 'Segure firme!')));
  $$('[data-rest]').forEach((b) => (b.onclick = () => timerOverlay(+b.dataset.rest, 'Descanso')));
  $('#t-fim').onclick = () => {
    const total = $$('.set').length, ok = $$('.set.on').length;
    modal(`<h3>Concluir treino</h3><p>Séries marcadas: ${ok}/${total}</p><p>Como ficaram as articulações?</p>${slider('tj', 'Joelhos')}${slider('to', 'Ombros')}
    <div class="row gap"><button class="btn ghost" data-close>Voltar</button><button class="btn" id="tsalvar">Salvar</button></div>`, (el, close) => {
      $('#tsalvar', el).onclick = () => {
        const s = S(), j = +$('#tj', el).value, o = +$('#to', el).value;
        const kind = pl.tipo === 'forca' ? 'forca' : pl.tipo;
        s.sessions.push({ id: St.uid(), date: hoje(), ts: Date.now(), kind, titulo: pl.titulo, series: ok, total, dorJ: j, dorO: o });
        const msgs = [];
        if (kind === 'forca' && ok >= total * 0.8) {
          for (const b of blocos) if (b.track && !b.titulo.includes('reduzido')) {
            const dor = b.track === 'barra' || b.track === 'flexao' ? o : b.track === 'pernas' || b.track === 'potencia' ? j : 0;
            msgs.push(`${P.STRENGTH_TRACKS[b.track].nome.split(' (')[0]}: ${St.registrarProgresso(b.track, dor)}`);
          }
          St.addXP(30);
        } else if (kind === 'forca') { msgs.push('Menos de 80% das séries: salvo, sem contar para o nível.'); St.addXP(15); }
        else St.addXP(15);
        save(); const nov = St.checkBadges(); save(); close(); planoAtivo = null;
        ir('#hoje');
        setTimeout(() => modal(`<h3>Treino salvo ✔</h3>${msgs.map((m) => `<p>${m}</p>`).join('') || '<p>Bom trabalho na recuperação!</p>'}<button class="btn big" data-close>Ok</button>`), 120);
        celebrar(nov);
      };
    });
  };
};

function timerOverlay(seg, titulo) {
  D.unlockAudio();
  let rest = seg, iv;
  const close = modal(`<div class="timer-ov"><small>${titulo}</small><b id="tov">${D.fmtTempo(rest)}</b><button class="btn ghost" data-close>Parar</button></div>`);
  const el = $('#tov');
  D.beep(1000, 0.1);
  iv = setInterval(() => {
    rest--; if (!document.body.contains(el)) return clearInterval(iv);
    el.textContent = D.fmtTempo(rest);
    if (rest <= 3 && rest > 0) D.beep(660, 0.08);
    if (rest <= 0) { clearInterval(iv); D.beep(1300, 0.5); D.vibrate([300, 100, 300]); close(); toast('Tempo!'); }
  }, 1000);
}

// ===== Cronômetro =====
rotas.crono = () => {
  const aba = location.hash.split('?')[1] || 'int';
  view.innerHTML = `<header class="top"><h1>Cronômetro</h1>
  <div class="seg-tabs"><a href="#crono?int" class="${aba === 'int' ? 'on' : ''}">Intervalado</a><a href="#crono?abd" class="${aba === 'abd' ? 'on' : ''}">Abdominal 60 s</a><a href="#crono?hang" class="${aba === 'hang' ? 'on' : ''}">Barra</a><a href="#crono?livre" class="${aba === 'livre' ? 'on' : ''}">Livre</a></div></header><div id="cr"></div>`;
  ({ int: cronoInt, abd: cronoAbd, hang: cronoHang, livre: cronoLivre })[aba]();
};
function cronoInt() {
  const pre = [['Tiros 6 × 2:00 / 1:30', 120, 90, 6], ['Tiros 8 × 1:00 / 2:00', 60, 120, 8], ['Trote 1 / caminhada 2 × 8', 60, 120, 8], ['Prancha 3 × 30 s / 45 s', 30, 45, 3]];
  $('#cr').innerHTML = `<div class="card"><h3>Modelos</h3><div class="col gap">${pre.map((p, i) => `<button class="btn ghost" data-p="${i}">${p[0]}</button>`).join('')}</div></div>
  <div class="card"><div class="grid3"><label>Esforço (s)<input id="i-w" type="number" value="120"></label><label>Descanso (s)<input id="i-r" type="number" value="90"></label><label>Rodadas<input id="i-n" type="number" value="6"></label></div>
  <button class="btn big" id="i-go">Iniciar</button></div><div id="i-disp" class="crono-disp hide"><small id="i-fase"></small><b id="i-t"></b><span id="i-rd"></span><button class="btn ghost" id="i-stop">Parar</button></div>`;
  $$('[data-p]').forEach((b) => (b.onclick = () => { const p = pre[+b.dataset.p]; $('#i-w').value = p[1]; $('#i-r').value = p[2]; $('#i-n').value = p[3]; }));
  let iv;
  $('#i-go').onclick = () => {
    D.unlockAudio(); window.__querTela = true; D.manterTela();
    const w = +$('#i-w').value, r = +$('#i-r').value, n = +$('#i-n').value;
    const fases = [['Prepare-se', 10, '#64748b']];
    for (let i = 0; i < n; i++) { fases.push(['VAI!', w, '#f97316', i + 1]); if (i < n - 1) fases.push(['Descanso', r, '#0ea5e9', i + 1]); }
    let fi = 0, rest = fases[0][1];
    const disp = $('#i-disp'); disp.classList.remove('hide');
    const show = () => { const f = fases[fi]; $('#i-fase').textContent = f[0]; $('#i-t').textContent = D.fmtTempo(rest); disp.style.background = f[2]; $('#i-rd').textContent = f[3] ? `Rodada ${f[3]}/${n}` : ''; };
    show(); D.falar('Prepare-se');
    iv = setInterval(() => {
      rest--;
      if (rest <= 3 && rest > 0) D.beep(660, 0.08);
      if (rest <= 0) {
        fi++;
        if (fi >= fases.length) { clearInterval(iv); D.beep(1300, 0.6); D.falar('Fim do treino!'); D.vibrate([400, 100, 400]); $('#i-fase').textContent = 'Fim!'; $('#i-t').textContent = '00:00'; window.__querTela = false; D.liberarTela(); return; }
        rest = fases[fi][1]; D.beep(1100, 0.25); D.vibrate(250); D.falar(fases[fi][0] === 'VAI!' ? 'Vai!' : 'Descanso');
      }
      show();
    }, 1000);
  };
  $('#i-stop').onclick = () => { clearInterval(iv); $('#i-disp').classList.add('hide'); window.__querTela = false; D.liberarTela(); };
  limpeza = () => { clearInterval(iv); window.__querTela = false; D.liberarTela(); };
}
function cronoAbd() {
  const min = minimo('abd', S().profile.sexo === 'F' ? 10 : 15), meta = metaDe('abd', 25);
  $('#cr').innerHTML = `<div class="card"><p>Simulado do abdominal do edital: 60 s, pés presos, braços cruzados no peito, escápulas tocam o chão. Toque na área grande a cada repetição válida (ou peça para alguém contar). Mínimo do edital: <b>${min}</b> · sua meta: <b>${meta}</b>.</p></div>
  <div class="crono-disp" id="a-disp"><small id="a-f">Pronto</small><b id="a-t">01:00</b></div>
  <button class="tap" id="a-tap" disabled><span id="a-n">0</span><small>toque = +1</small></button>
  <div class="row gap"><button class="btn big" id="a-go">Iniciar (3-2-1)</button><button class="btn ghost" id="a-menos">−1</button></div>`;
  let n = 0, iv, rodando = false;
  const tap = $('#a-tap');
  tap.onclick = () => { if (!rodando) return; n++; $('#a-n').textContent = n; D.beep(1400, 0.03); D.vibrate(20); };
  $('#a-menos').onclick = () => { n = Math.max(0, n - 1); $('#a-n').textContent = n; };
  $('#a-go').onclick = () => {
    D.unlockAudio(); n = 0; $('#a-n').textContent = 0; $('#a-go').disabled = true; window.__querTela = true; D.manterTela();
    let c = 3; $('#a-f').textContent = 'Prepare-se'; D.falar('Três'); D.beep(800, 0.1);
    const cd = setInterval(() => {
      c--; if (c > 0) { $('#a-t').textContent = c; D.beep(800, 0.1); return; }
      clearInterval(cd); rodando = true; tap.disabled = false; D.beep(1300, 0.4); $('#a-f').textContent = 'VALENDO'; let t = 60;
      iv = setInterval(() => {
        t--; $('#a-t').textContent = D.fmtTempo(t);
        if (t === 30) D.falar('Trinta segundos'); if (t === 10) D.falar('Dez');
        if (t <= 0) { clearInterval(iv); rodando = false; tap.disabled = true; D.beep(1300, 0.7); D.vibrate([400, 100, 400]); window.__querTela = false; D.liberarTela(); $('#a-go').disabled = false; salvarTeste('abd', n, `${n} abdominais em 60 s.`); }
      }, 1000);
    }, 1000);
    limpeza = () => { clearInterval(cd); clearInterval(iv); window.__querTela = false; D.liberarTela(); };
  };
}
function cronoHang() {
  const F = S().profile.sexo === 'F';
  $('#cr').innerHTML = `<div class="card"><p><b>Suspensão (dead hang):</b> mede a adaptação do ombro à barra. <b>Isometria no topo:</b> queixo acima da barra, ${F ? (temProva('iso') ? 'é o teste feminino do edital (mínimo ' + minimo('iso', 5) + ' s)' : 'fortalece a pegada e os ombros') : 'prepara para as primeiras barras'}. Inicie quando os pés saírem do apoio.</p>
  <div class="seg-tabs"><a id="h-hang" class="on">Suspensão</a><a id="h-iso">Isometria no topo</a></div></div>
  <div class="crono-disp"><small id="h-f">Suspensão</small><b id="h-t">00.0</b></div>
  <button class="btn big" id="h-go">Iniciar</button>
  <div class="card"><h3>Teste de barra (repetições)</h3><p class="muted">Só faça o teste máximo de barra a partir do nível B5, com check-in verde e após aquecer.</p>
  <div class="row gap"><input id="h-reps" type="number" min="0" value="0" inputmode="numeric"><button class="btn" id="h-salvar">Salvar barras</button></div></div>`;
  let tipo = 'hang', t0 = 0, iv = null;
  $('#h-hang').onclick = () => { tipo = 'hang'; $('#h-hang').classList.add('on'); $('#h-iso').classList.remove('on'); $('#h-f').textContent = 'Suspensão'; };
  $('#h-iso').onclick = () => { tipo = 'iso'; $('#h-iso').classList.add('on'); $('#h-hang').classList.remove('on'); $('#h-f').textContent = 'Isometria no topo'; };
  $('#h-go').onclick = () => {
    D.unlockAudio();
    if (!iv) { t0 = performance.now(); D.beep(1200, 0.15); $('#h-go').textContent = 'Parar'; iv = setInterval(() => { const s = (performance.now() - t0) / 1000; $('#h-t').textContent = s.toFixed(1); if (Math.floor(s) % 10 === 0 && s % 1 < 0.1 && s > 1) D.beep(900, 0.05); }, 100); }
    else { clearInterval(iv); iv = null; D.beep(700, 0.3); $('#h-go').textContent = 'Iniciar'; const v = Math.round((performance.now() - t0) / 1000); salvarTeste(tipo, v, `${v} s de ${tipo === 'hang' ? 'suspensão' : 'isometria no topo'}.`); }
  };
  $('#h-salvar').onclick = () => salvarTeste('barra', +$('#h-reps').value || 0, `${+$('#h-reps').value || 0} barras.`);
  limpeza = () => clearInterval(iv);
}
function cronoLivre() {
  $('#cr').innerHTML = `<div class="crono-disp"><small>Cronômetro</small><b id="l-t">00:00.0</b></div><div class="row gap"><button class="btn big" id="l-go">Iniciar</button><button class="btn ghost" id="l-volta">Volta</button><button class="btn ghost" id="l-zero">Zerar</button></div><ol id="l-voltas" class="voltas"></ol>`;
  let acc = 0, t0 = 0, iv = null, ult = 0;
  const fmt = (s) => D.fmtTempo(Math.floor(s)) + '.' + Math.floor((s % 1) * 10);
  const now = () => acc + (iv ? (performance.now() - t0) / 1000 : 0);
  $('#l-go').onclick = () => { if (iv) { acc = now(); clearInterval(iv); iv = null; $('#l-go').textContent = 'Continuar'; } else { t0 = performance.now(); iv = setInterval(() => ($('#l-t').textContent = fmt(now())), 100); $('#l-go').textContent = 'Pausar'; } };
  $('#l-volta').onclick = () => { const n = now(); $('#l-voltas').insertAdjacentHTML('afterbegin', `<li>${fmt(n - ult)} <small>(${fmt(n)})</small></li>`); ult = n; D.beep(1000, 0.05); };
  $('#l-zero').onclick = () => { clearInterval(iv); iv = null; acc = 0; ult = 0; $('#l-t').textContent = '00:00.0'; $('#l-voltas').innerHTML = ''; $('#l-go').textContent = 'Iniciar'; };
  const tempos = Object.entries(C.TIPOS).filter(([, t]) => !t.maior);
  $('#cr').insertAdjacentHTML('beforeend', `<div class="card"><h3>Salvar tempo como teste</h3><p class="muted small">Para provas por tempo (shuttle run, natação). Pare o cronômetro e salve.</p>
    <div class="row gap"><select id="l-tipo" style="flex:1">${tempos.map(([k, t]) => `<option value="${k}" ${temProva(k) ? 'selected' : ''}>${t.nome}</option>`).join('')}</select><button class="btn" id="l-salvar">Salvar</button></div></div>`);
  $('#l-salvar').onclick = () => { const v = Math.round(now() * 100) / 100; if (!v) return toast('Use o cronômetro primeiro.'); const k = $('#l-tipo').value; salvarTeste(k, v, `${C.TIPOS[k].nome}: ${C.fmtValor(k, v)}.`); };
  limpeza = () => clearInterval(iv);
}
function salvarTeste(type, value, desc) {
  modal(`<h3>Salvar teste?</h3><p>${desc}</p><div class="row gap"><button class="btn ghost" data-close>Descartar</button><button class="btn" id="st-ok">Salvar</button></div>`, (el, close) => {
    $('#st-ok', el).onclick = () => {
      S().tests.push({ id: St.uid(), date: hoje(), type, value }); St.addXP(20); save();
      const nov = St.checkBadges(); save(); close(); toast('Teste salvo (+20 XP)'); celebrar(nov);
    };
  });
}

// ===== Evolução =====
const TESTES = Object.fromEntries(Object.entries(C.TIPOS).map(([k, t]) => [k, [t.nome, t.un]]));
let charts = [];
rotas.evolucao = () => {
  const s = S(), p = s.profile, F = p.sexo === 'F';
  const proj = projecao12();
  const linha = (pv) => {
    const t = C.TIPOS[pv.tipo], val = St.bestTest(pv.tipo), { min, meta } = pv;
    const prog = (v) => (t.maior ? v / meta : meta / v);
    const pct = val === null ? 0 : Math.min(100, prog(val) * 100), pm = Math.min(100, prog(min) * 100);
    const cls = C.atingiu(pv.tipo, val, meta) ? 'good' : C.atingiu(pv.tipo, val, min) ? 'mid' : '';
    return `<div class="kpi"><div class="row between"><b>${t.nome}</b><span>${C.fmtValor(pv.tipo, val)}</span></div>
    <div class="prog"><i style="width:${pct}%" class="${cls}"></i><em style="left:${pm}%" title="edital"></em></div>
    <small class="muted">edital ${t.maior ? '' : 'até '}${C.fmtValor(pv.tipo, min)} · meta ${C.fmtValor(pv.tipo, meta)}</small></div>`;
  };
  const extras = provas().filter((x) => !['run12', 'barra', 'iso', 'abd'].includes(x.tipo));
  view.innerHTML = `<header class="top"><h1>Evolução</h1><button class="btn small" id="ev-add">+ Registrar teste</button></header>
  <div class="card"><p class="muted small">${esc(concurso().nome)}</p>${provas().map(linha).join('')}
  ${concurso().obs ? `<p class="nota">${concurso().obs}</p>` : ''}
  ${proj && temProva('run12') ? `<p class="nota">Estimativa para 12 min com base no seu melhor ritmo recente em treinos contínuos: <b>${proj} m</b>. É só uma referência; o simulado é que vale.</p>` : ''}</div>
  <div class="grid2"><div class="card mini"><small>Km acumulados</small><b>${St.kmTotal().toFixed(1)}</b></div><div class="card mini"><small>Sessões</small><b>${s.sessions.length}</b></div>
  <div class="card mini"><small>Tênis (${esc(p.tenis || 'tênis')})</small><b>${(St.kmTotal() + (+p.tenisKmInicial || 0)).toFixed(0)} km</b></div><div class="card mini"><small>Nível corrida</small><b>${s.levels.run + 1}/${P.RUN_LEVELS.length}</b></div></div>
  <div class="card"><h3>Peso (kg)</h3>${pesoResumo()}<canvas id="c-peso"></canvas></div>
  <div class="card"><h3>Corrida 12 min (m)</h3><canvas id="c-run"></canvas></div>
  <div class="card"><h3>${F ? 'Isometria (s)' : 'Barra (reps)'} e suspensão (s)</h3><canvas id="c-barra"></canvas></div>
  ${temProva('abd') ? '<div class="card"><h3>Abdominal em 1 min</h3><canvas id="c-abd"></canvas></div>' : ''}
  ${extras.map((x) => `<div class="card"><h3>${C.TIPOS[x.tipo].nome} (${C.TIPOS[x.tipo].un})</h3><canvas id="c-${x.tipo}"></canvas></div>`).join('')}
  <div class="card"><h3>Km por semana</h3><canvas id="c-km"></canvas></div>
  <div class="card"><h3>Dor nos últimos 30 dias</h3><canvas id="c-dor"></canvas></div>
  <div class="card"><h3>Histórico</h3>${historico()}</div>`;
  $('#ev-add').onclick = registrarTeste;
  $$('[data-del]').forEach((x) => (x.onclick = () => confirmar('Apagar este registro?', 'Apagar', () => { const [k, id] = x.dataset.del.split(':'); s[k] = s[k].filter((i) => i.id !== id); save(); render(); })));
  desenharGraficos(F);
};
function pesoResumo() {
  const s = S(), p = s.profile, v = St.imc(), r = St.ritmoPeso();
  if (!s.pesos.length) return '<p class="muted">Registre o peso na tela Hoje.</p>';
  const lim = (p.peso * 0.007).toFixed(1);
  return `<p>Atual <b>${p.peso.toFixed(1)} kg</b>${v ? ` · IMC <b>${v.toFixed(1)}</b> (${St.faixaIMC(v)})` : ''} · início ${p.pesoInicial} kg${p.pesoMeta ? ` · meta ${p.pesoMeta} kg` : ''}</p>
  ${r !== null ? `<p class="${r > p.peso * 0.01 ? 'nota' : 'muted'}">Ritmo: ${r >= 0 ? 'perdendo' : 'ganhando'} ${Math.abs(r).toFixed(2)} kg/semana${r > p.peso * 0.01 ? ' (rápido demais: risco de perder músculo e força na barra)' : ''}. Ritmo saudável: até ~${lim} kg/semana.</p>` : ''}`;
}
function projecao12() {
  const lim = Date.now() - 28 * 864e5;
  const ok = S().sessions.filter((x) => x.kind === 'run' && x.ts >= lim && x.dist >= 1500 && x.pace > 0 && x.pace < 480);
  if (!ok.length) return null;
  const best = Math.min(...ok.map((x) => x.pace));
  return Math.round((720 / best) * 1000 * 0.97);
}
function historico() {
  const s = S();
  const itens = [...s.sessions.map((x) => ({ ...x, k: 'sessions' })), ...s.tests.map((x) => ({ ...x, k: 'tests', ts: x.ts || new Date(x.date + 'T12:00:00').getTime() }))].sort((a, b) => b.ts - a.ts).slice(0, 40);
  if (!itens.length) return '<p class="muted">Nenhum registro ainda.</p>';
  return `<ul class="hist">${itens.map((x) => `<li><span>${fmtData(x.date)}</span><div>${x.k === 'tests' ? `🎯 ${TESTES[x.type] ? TESTES[x.type][0] : x.type}: <b>${C.fmtValor(x.type, x.value)}</b>` : x.kind === 'run' ? `🏃 ${esc(x.titulo)} · ${(x.dist / 1000).toFixed(2)} km · ${D.fmtTempo(x.dur)} · ${D.fmtPace(x.pace)}/km` : `💪 ${esc(x.titulo)}${x.total ? ` · ${x.series}/${x.total} séries` : ''}`}${x.dorJ !== undefined ? ` <small>· dor J${x.dorJ} O${x.dorO}</small>` : ''}</div><button class="link" data-del="${x.k}:${x.id}">✕</button></li>`).join('')}</ul>`;
}
function registrarTeste() {
  modal(`<h3>Registrar teste</h3><label>Teste<select id="rt-t">${[...provas().map((x) => x.tipo), ...Object.keys(C.TIPOS).filter((k) => !provas().some((x) => x.tipo === k))].map((k) => `<option value="${k}">${C.TIPOS[k].nome} (${C.TIPOS[k].un})</option>`).join('')}</select></label>
  <label>Resultado<input id="rt-v" type="text" inputmode="decimal" placeholder="Ex.: 12 · 2,05 · 13,8"></label><label>Data<input id="rt-d" type="date" value="${hoje()}"></label>
  <p class="muted small">Barra máxima: só a partir do nível B5. Corrida de 12 min: só com check-in verde.</p>
  <div class="row gap"><button class="btn ghost" data-close>Cancelar</button><button class="btn" id="rt-ok">Salvar</button></div>`, (el, close) => {
    $('#rt-ok', el).onclick = () => {
      const v = +String($('#rt-v', el).value).replace(',', '.'); if (!$('#rt-v', el).value || isNaN(v)) return toast('Informe o resultado.');
      S().tests.push({ id: St.uid(), date: $('#rt-d', el).value || hoje(), type: $('#rt-t', el).value, value: v }); St.addXP(20); save();
      const nov = St.checkBadges(); save(); close(); render(); celebrar(nov);
    };
  });
}
function desenharGraficos(F) {
  charts.forEach((c) => c.destroy()); charts = [];
  if (!window.Chart) return;
  const s = S(), p = s.profile;
  const css = getComputedStyle(document.documentElement);
  const cTxt = css.getPropertyValue('--muted').trim(), cGrid = css.getPropertyValue('--line').trim();
  Chart.defaults.color = cTxt; Chart.defaults.borderColor = cGrid; Chart.defaults.font.family = 'system-ui, sans-serif';
  const serie = (t) => s.tests.filter((x) => x.type === t).sort((a, b) => a.date.localeCompare(b.date));
  const ref0 = (v) => ({ label: 'Meta', data: [], borderColor: '#22c55e', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5, refValue: v });
  const ref = (v, n, cor) => ({ label: n, data: [], borderColor: cor, borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5, refValue: v });
  const lineChart = (id, sets, refs, menor = false) => {
    if (!$('#' + id)) return;
    const labels = [...new Set(sets.flatMap((d) => d.pts.map((x) => x.date)))].sort();
    if (!labels.length) { $('#' + id).replaceWith(Object.assign(document.createElement('p'), { className: 'muted', textContent: 'Sem registros ainda.' })); return; }
    const ds = sets.map((d) => ({ label: d.label, data: labels.map((l) => { const v = d.pts.filter((x) => x.date === l); return v.length ? (menor ? Math.min : Math.max)(...v.map((x) => +x.value)) : null; }), borderColor: d.cor, backgroundColor: d.cor, spanGaps: true, tension: 0.25, pointRadius: 4, yAxisID: d.y || 'y' }));
    refs.forEach((r) => ds.push({ ...r, data: labels.map(() => r.refValue) }));
    charts.push(new Chart($('#' + id), { type: 'line', data: { labels: labels.map(fmtData), datasets: ds }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 12 } } }, scales: { y: { beginAtZero: false } } } }));
  };
  if (s.pesos.length) { const ref = s.profile.pesoMeta ? [ref0(s.profile.pesoMeta)] : []; lineChart('c-peso', [{ label: 'Peso (kg)', pts: s.pesos.map((x) => ({ date: x.date, value: x.kg })), cor: '#0ea5e9' }], ref); } else { const c = $('#c-peso'); c && c.remove(); }
  const refs = (t) => { const pv = provas().find((x) => x.tipo === t); return pv ? [ref(pv.min, 'Edital', '#ef4444'), ref(pv.meta, 'Meta', '#22c55e')] : []; };
  lineChart('c-run', [{ label: 'Distância', pts: serie('run12'), cor: '#f97316' }], refs('run12'));
  lineChart('c-barra', [{ label: F ? 'Isometria (s)' : 'Barras', pts: serie(F ? 'iso' : 'barra'), cor: '#8b5cf6' }, { label: 'Suspensão (s)', pts: serie('hang'), cor: '#0ea5e9' }], refs(F ? 'iso' : 'barra').slice(0, 1));
  lineChart('c-abd', [{ label: 'Abdominais', pts: serie('abd'), cor: '#14b8a6' }], refs('abd'));
  provas().filter((x) => !['run12', 'barra', 'iso', 'abd'].includes(x.tipo)).forEach((x) => lineChart('c-' + x.tipo, [{ label: C.TIPOS[x.tipo].nome, pts: serie(x.tipo), cor: '#ec4899' }], refs(x.tipo), !C.TIPOS[x.tipo].maior));
  // km por semana (8 semanas)
  const semanas = []; const seg = new Date(); seg.setHours(0, 0, 0, 0); seg.setDate(seg.getDate() - ((seg.getDay() + 6) % 7));
  for (let i = 7; i >= 0; i--) { const ini = new Date(seg.getTime() - i * 7 * 864e5), fim = ini.getTime() + 7 * 864e5; semanas.push({ l: fmtData(hoje(ini)).slice(0, 5), km: s.sessions.filter((x) => x.kind === 'run' && x.ts >= ini.getTime() && x.ts < fim).reduce((a, x) => a + x.dist, 0) / 1000 }); }
  charts.push(new Chart($('#c-km'), { type: 'bar', data: { labels: semanas.map((x) => x.l), datasets: [{ label: 'km', data: semanas.map((x) => +x.km.toFixed(2)), backgroundColor: '#f97316', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }));
  const dias = []; for (let i = 29; i >= 0; i--) dias.push(hoje(new Date(Date.now() - i * 864e5)));
  charts.push(new Chart($('#c-dor'), { type: 'line', data: { labels: dias.map((d) => fmtData(d).slice(0, 5)), datasets: [{ label: 'Joelhos', data: dias.map((d) => s.checkins[d]?.joelho ?? null), borderColor: '#f59e0b', spanGaps: true, tension: 0.3, pointRadius: 2 }, { label: 'Ombros', data: dias.map((d) => s.checkins[d]?.ombro ?? null), borderColor: '#8b5cf6', spanGaps: true, tension: 0.3, pointRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 10 } } } }));
}

// ===== Mais =====
let promptInstalar = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); promptInstalar = e; });
rotas.mais = () => {
  view.innerHTML = `<header class="top"><h1>Mais</h1></header>
  <div class="menu">
  <a href="#perfil">👤 Perfil, concurso, metas e índices</a>
  <a href="#niveis">📈 Níveis do plano</a>
  <a href="#conquistas">🏅 Conquistas</a>
  <a href="#dicas">💡 Dicas, aquecimento e sinais de alerta</a>
  <a href="#edital">📋 Regras do TAF (${esc(concurso().curto)})</a>
  <a href="#lembretes">⏰ Lembretes</a>
  <a href="#backup">💾 Backup dos dados</a>
  ${promptInstalar ? '<a id="m-inst">📲 Instalar o app</a>' : ''}
  <a href="privacidade.html" target="_blank" rel="noopener">🔒 Política de privacidade</a>
  </div><p class="muted small center">Treinador TAF · versão 1.0 · os dados ficam só neste aparelho.</p>`;
  const i = $('#m-inst'); if (i) i.onclick = async () => { promptInstalar.prompt(); await promptInstalar.userChoice; promptInstalar = null; render(); };
};
rotas.perfil = () => {
  const p = S().profile;
  view.innerHTML = `<header class="top"><a href="#mais" class="back">‹</a><h1>Perfil</h1></header>
  <div class="card"><label>Nome<input id="p-nome" value="${esc(p.nome)}"></label>
  <div class="grid2"><label>Sexo<select id="p-sexo"><option value="M" ${p.sexo === 'M' ? 'selected' : ''}>Masculino</option><option value="F" ${p.sexo === 'F' ? 'selected' : ''}>Feminino</option></select></label><label>Altura (m)<input id="p-alt" type="text" inputmode="decimal" step="0.01" value="${p.altura || ''}"></label></div>
  <div class="grid2"><label>Peso atual (kg)<input id="p-peso" type="text" inputmode="decimal" step="0.1" value="${p.peso}"></label><label>Meta de peso (kg)<input id="p-pmeta" type="text" inputmode="decimal" step="0.5" value="${p.pesoMeta || ''}" placeholder="opcional"></label></div>
  <p class="muted small">Sugestão de meta: perder 5 a 10% do peso nos primeiros 3 a 6 meses${p.peso ? ` (${(p.peso * 0.9).toFixed(0)} a ${(p.peso * 0.95).toFixed(0)} kg)` : ''}. Para um plano alimentar, procure um nutricionista.</p>
  <label>Data do TAF<input id="p-taf" type="date" value="${p.tafDate}"></label></div>
  <div class="card"><h3>Concurso</h3><label>Edital<select id="p-conc">${Object.entries(C.CONCURSOS).map(([k, c]) => `<option value="${k}" ${p.concurso === k ? 'selected' : ''}>${c.nome}</option>`).join('')}</select></label>
  <p class="muted small">Ao trocar, salve e volte aqui para ajustar índices e metas do novo concurso.</p></div>
  <div class="card"><h3>Provas, índices mínimos e metas</h3><p class="muted small">Fonte: ${esc(concurso().fonte)}. Confira no edital oficial e ajuste se houver retificação.${p.concurso === 'outro' ? ' Marque as provas do seu edital.' : ''}</p>
  ${Object.entries(C.TIPOS).filter(([k, t]) => !t.treino).map(([k, t]) => { const pv = provas().find((x) => x.tipo === k); if (!pv && p.concurso !== 'outro') return ''; return `<div class="grid3" style="align-items:end">${p.concurso === 'outro' ? `<label class="check" style="grid-column:1/-1"><input type="checkbox" data-pv="${k}" ${pv ? 'checked' : ''}> ${t.nome}</label>` : `<b style="grid-column:1/-1">${t.nome}</b>`}
    <label>Mínimo (${t.un})<input data-min="${k}" type="text" inputmode="decimal" value="${pv ? String(pv.min).replace('.', ',') : ''}"></label><label>Meta (${t.un})<input data-meta="${k}" type="text" inputmode="decimal" value="${pv ? String(pv.meta).replace('.', ',') : ''}"></label><small class="muted">${t.maior ? 'mais é melhor' : 'tempo: menos é melhor'}</small></div>`; }).join('')}</div>
  <div class="card"><h3>Corrida</h3><div class="grid2"><label>Cadência alvo (ppm)<input id="p-cad" type="number" value="${p.cadence}"></label>
  <label>Aviso de voz a cada<select id="p-ann"><option value="400" ${p.announce == 400 ? 'selected' : ''}>400 m (volta de pista)</option><option value="1000" ${p.announce == 1000 ? 'selected' : ''}>1 km</option><option value="200" ${p.announce == 200 ? 'selected' : ''}>200 m</option></select></label></div>
  <label class="check"><input type="checkbox" id="p-voz" ${p.voice ? 'checked' : ''}> Instruções por voz</label>
  <label class="check"><input type="checkbox" id="p-map" ${p.showMap ? 'checked' : ''}> Mostrar mapa (usa internet; desligue para poupar bateria)</label>
  <div class="grid2"><label>Tênis<input id="p-tenis" value="${esc(p.tenis || '')}"></label><label>Km que o tênis já tinha<input id="p-ten" type="number" value="${p.tenisKmInicial}"></label></div>
  <h3>Equipamentos</h3><label class="check"><input type="checkbox" id="p-elas" ${p.equip.elastico ? 'checked' : ''}> Tenho elástico de resistência</label>
  <label class="check"><input type="checkbox" id="p-band" ${p.equip.superband ? 'checked' : ''}> Tenho superband</label></div>
  <button class="btn big" id="p-ok">Salvar</button>`;
  $('#p-ok').onclick = () => {
    const sexoAntes = p.sexo;
    const n = (id) => +$(id).value;
    const novoPeso = +String($('#p-peso').value).replace(',', '.');
    if (novoPeso && novoPeso !== p.peso) St.registrarPeso(novoPeso);
    Object.assign(p, { altura: +String($('#p-alt').value).replace(',', '.') || p.altura, pesoMeta: +String($('#p-pmeta').value).replace(',', '.') || null, tenis: $('#p-tenis').value.trim() || p.tenis });
    Object.assign(p, { nome: $('#p-nome').value.trim(), sexo: $('#p-sexo').value, tafDate: $('#p-taf').value, cadence: n('#p-cad') || 170, announce: n('#p-ann'), voice: $('#p-voz').checked, showMap: $('#p-map').checked, tenisKmInicial: n('#p-ten') || 0 });
    const num = (v) => { const x = +String(v).replace(',', '.'); return v !== '' && !isNaN(x) ? x : null; };
    const sx = p.sexo === 'F' ? 'F' : 'M', novoConc = $('#p-conc').value, base = C.CONCURSOS[p.concurso] || C.CONCURSOS.pprn;
    if (novoConc !== p.concurso || sexoAntes !== p.sexo) { p.concurso = novoConc; p.indices = { M: {}, F: {} }; p.metas = {}; toast('Concurso/sexo alterado: índices e metas foram atualizados para o novo edital.', 4500); }
    else {
      const ind = {}; p.indices = p.indices || { M: {}, F: {} };
      $$('[data-min]').forEach((i) => { const k = i.dataset.min, chk = $(`[data-pv="${k}"]`); if (chk && !chk.checked) return; const v = num(i.value); if (v === null) return; if (p.concurso === 'outro' || v !== base[sx][k]) ind[k] = v; });
      p.indices[sx] = ind;
      $$('[data-meta]').forEach((i) => { const v = num(i.value); if (v !== null) p.metas[i.dataset.meta] = v; });
    }
    p.equip.elastico = $('#p-elas').checked; p.equip.superband = $('#p-band').checked;
    D.setVoz(p.voice); save(); toast('Perfil salvo'); ir('#mais');
  };
};
rotas.niveis = () => {
  const s = S();
  const bloco = (track, nome, levels, desc) => `<div class="card"><h3>${nome}</h3><p><b>${desc}</b></p>
    <p class="muted">Progresso: ${s.prog[track]}/${St.trackInfo(track).need === 999 ? '∞' : St.trackInfo(track).need} sessões sem dor${track !== 'run' ? ' · ' + P.STRENGTH_TRACKS[track].levels[s.levels[track]].criterio : ''}</p>
    <div class="lv">${levels.map((_, i) => `<i class="${i < s.levels[track] ? 'done' : i === s.levels[track] ? 'cur' : ''}"></i>`).join('')}</div>
    <div class="row gap"><button class="btn ghost small" data-lv="${track}:-1">− Voltar um nível</button><button class="btn ghost small" data-lv="${track}:1">Avançar +</button></div></div>`;
  const T = P.STRENGTH_TRACKS;
  view.innerHTML = `<header class="top"><a href="#mais" class="back">‹</a><h1>Níveis</h1></header>
  <p class="nota">O app sobe de nível sozinho quando você completa as sessões sem dor. Use os botões só se precisar: voltar é sempre seguro; avançar à força aumenta o risco de lesão.</p>
  ${bloco('run', 'Corrida', P.RUN_LEVELS, `Nível ${s.levels.run + 1}: ${P.RUN_LEVELS[s.levels.run].fase}`)}
  ${tracksAtivos().map((t) => bloco(t, T[t].nome, T[t].levels, T[t].levels[s.levels[t]].nome + ': ' + T[t].levels[s.levels[t]].ex.map((x) => P.EX[x.id].nome).join(', '))).join('')}`;
  $$('[data-lv]').forEach((b) => (b.onclick = () => { const [t, d] = b.dataset.lv.split(':'); const go = () => { St.mudarNivel(t, +d); render(); }; +d > 0 ? confirmar('Avançar sem cumprir o critério aumenta o risco de lesão. Continuar?', 'Avançar', go) : go(); }));
};
rotas.conquistas = () => {
  const s = S(), xp = St.nivelXP();
  view.innerHTML = `<header class="top"><a href="#mais" class="back">‹</a><h1>Conquistas</h1></header>
  <div class="card"><h3>Nível ${xp.lvl} · ${xp.xp} XP</h3><div class="xp"><div class="bar"><i style="width:${xp.pct}%"></i></div></div><p class="muted small">Faltam ${xp.falta} XP para o próximo nível. Check-in +5 · corrida +40 · força +30 · simulado +60 · teste +20 · meta de água +10 · subir de nível +50.</p></div>
  <div class="badges">${St.BADGES.map((b) => `<div class="badge ${s.badges[b.id] ? 'on' : ''}"><span>${b.icone}</span><b>${b.nome}</b><small>${s.badges[b.id] ? 'em ' + fmtData(s.badges[b.id]) : b.desc}</small></div>`).join('')}</div>`;
};
rotas.dicas = () => {
  const km = St.kmTotal() + (+S().profile.tenisKmInicial || 0);
  view.innerHTML = `<header class="top"><a href="#mais" class="back">‹</a><h1>Dicas</h1></header>
  <div class="card warn"><h3>Sinais de alerta: pare e procure avaliação</h3><ul>${P.SINAIS_ALERTA.map((x) => `<li>${x}</li>`).join('')}<li>Dor acima de 5/10 por mais de 2 dias seguidos</li><li>Dor que piora durante o treino</li></ul></div>
  <div class="card"><h3>Aquecimento antes de correr</h3><ul>${P.AQUECIMENTO_CORRIDA.map((x) => `<li>${x}</li>`).join('')}</ul></div>
  <div class="card"><h3>Joelhos na corrida</h3><ul><li>Cadência de 165-175 passos por minuto (use o metrônomo).</li><li>Pé aterrissa embaixo do quadril, não à frente.</li><li>Terra batida, grama ou pista nas primeiras fases.</li><li>Descidas íngremes sobrecarregam o joelho: evite no início.</li><li>Fortalecer glúteo e quadríceps (dias de força) é a melhor proteção.</li></ul></div>
  <div class="card"><h3>Ombros na barra</h3><ul><li>Nada de barra livre antes do nível B5.</li><li>Comece cada puxada pelas escápulas (ombro longe da orelha).</li><li>Suba e desça da barra com um banco, nunca soltando o corpo.</li><li>Negativas: no máximo 2 vezes por semana, com 48-72 h de intervalo.</li><li>Rotação externa com elástico protege o manguito rotador: não pule.</li></ul></div>
  <div class="card"><h3>Tênis ${esc(S().profile.tenis || '')}</h3><p>Rodagem estimada: <b>${km.toFixed(0)} km</b>. Tênis de amortecimento máximo protege bem o joelho, mas a espuma cede com o uso; com o peso atual, avalie trocar por volta de 500 a 600 km, ou antes se a sola estiver marcada ou o joelho reclamar sem outra causa.</p></div>
  <div class="card"><h3>Peso, joelhos e barra</h3><ul><li>Cada 1 kg perdido tira cerca de 4 kg de carga do joelho por passada.</li><li>Na barra, você levanta o próprio corpo: perder gordura facilita a barra tanto quanto ganhar força.</li><li>Ritmo seguro: até ~0,5 a 1% do peso por semana. Mais rápido que isso costuma levar à perda de músculo, cansaço e queda de rendimento.</li><li>Base da alimentação: proteína em todas as refeições, verduras e legumes, menos açúcar, refrigerante, frituras e álcool.</li><li>Não corte comida perto dos treinos: coma algo leve 1 a 2 h antes.</li><li>Sono de 7 a 9 h ajuda a controlar a fome.</li><li>Um nutricionista consegue montar o plano certo para você; o app só acompanha a tendência.</li></ul></div>
  <div class="card"><h3>Hidratação e alimentação</h3><ul><li>Meta diária: cerca de 35 ml por kg (${St.metaAgua() * 250} ml para você).</li><li>Em dia de corrida, mais 500 ml; no calor do Seridó, beba antes de sentir sede.</li><li>Lanche leve com carboidrato 1-2 h antes de correr.</li><li>Proteína em todas as refeições ajuda na recuperação muscular.</li></ul></div>
  <div class="card"><h3>Sono e recuperação</h3><p>7-9 h por noite. Dor, cansaço e sono ruim entram no check-in e o app reduz o treino automaticamente.</p></div>`;
};
rotas.edital = () => {
  const p = S().profile, c = concurso();
  const linhas = Object.keys(C.TIPOS).filter((k) => k in c.M || k in c.F || (p.concurso === 'outro' && provas().some((x) => x.tipo === k)));
  const mostra = (sx, k) => { const pv = C.provas({ ...p, sexo: sx }).find((x) => x.tipo === k); return pv ? (C.TIPOS[k].maior ? '' : 'até ') + C.fmtValor(k, pv.min) : '—'; };
  view.innerHTML = `<header class="top"><a href="#mais" class="back">‹</a><h1>Regras do TAF</h1></header>
  <div class="card"><h3>${esc(c.nome)}</h3>${c.banca ? `<p class="muted small">Banca: ${esc(c.banca)}</p>` : ''}<table class="tab"><tr><th>Prova</th><th>Masc.</th><th>Fem.</th></tr>
  ${linhas.map((k) => `<tr><td>${C.TIPOS[k].nome}</td><td>${mostra('M', k)}</td><td>${mostra('F', k)}</td></tr>`).join('')}</table>
  ${c.obs ? `<p class="nota">${c.obs}</p>` : ''}
  <p class="muted small">Fonte: ${esc(c.fonte)}. Índices podem mudar a cada edital: confira sempre o edital e a convocação do TAF do seu concurso.</p></div>
  <div class="card"><h3>Execução e regras</h3><ul>${c.regras.map((x) => `<li>${x}</li>`).join('')}</ul></div>
  <p class="center"><a href="#perfil">Trocar de concurso</a></p>`;
};
rotas.lembretes = () => {
  const cal = (titulo, hora, det) => { const d = new Date(); d.setDate(d.getDate() + 1); const ymd = hoje(d).replace(/-/g, ''); const [h, m] = hora.split(':'); const ini = `${ymd}T${h}${m}00`; const fim = `${ymd}T${String(+h + (titulo.includes('água') ? 0 : 1)).padStart(2, '0')}${titulo.includes('água') ? String(+m + 10).padStart(2, '0') : m}00`; return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&details=${encodeURIComponent(det + '\n' + location.href.split('#')[0])}&dates=${ini}/${fim}&ctz=America/Fortaleza&recur=${encodeURIComponent('RRULE:FREQ=DAILY')}`; };
  view.innerHTML = `<header class="top"><a href="#mais" class="back">‹</a><h1>Lembretes</h1></header>
  <div class="card"><p>Apps instalados pelo navegador não conseguem agendar notificações sozinhos com segurança. A forma mais confiável é criar lembretes repetidos no Google Agenda, que já avisa no seu celular:</p>
  <div class="col gap"><a class="btn" target="_blank" rel="noopener" href="${cal('Treino TAF: check-in e treino do dia', '06:00', 'Abra o Treinador TAF, faça o check-in de dor e o treino do dia.')}">Treino diário às 6h</a>
  <a class="btn ghost" target="_blank" rel="noopener" href="${cal('Beber água 💧', '10:00', 'Registre no Treinador TAF.')}">Água às 10h</a>
  <a class="btn ghost" target="_blank" rel="noopener" href="${cal('Beber água 💧', '15:00', 'Registre no Treinador TAF.')}">Água às 15h</a></div>
  <p class="muted small">O Google Agenda abre já preenchido: confira o horário e toque em Salvar.</p></div>`;
};
rotas.backup = () => {
  view.innerHTML = `<header class="top"><a href="#mais" class="back">‹</a><h1>Backup</h1></header>
  <div class="card"><p>Seus dados ficam apenas neste celular. Se limpar os dados do Chrome ou trocar de aparelho, eles se perdem. Exporte um backup de vez em quando (salve no Google Drive, por exemplo).</p>
  <div class="col gap"><button class="btn" id="b-exp">Exportar backup (.json)</button><label class="btn ghost file">Importar backup<input type="file" id="b-imp" accept="application/json,.json"></label></div></div>
  <div class="card warn"><h3>Zona de perigo</h3><button class="btn danger" id="b-reset">Apagar todos os dados</button></div>`;
  $('#b-exp').onclick = () => { const blob = new Blob([St.exportJSON()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `treinador-taf-backup-${hoje()}.json`; document.body.appendChild(a); a.click(); a.remove(); toast('Backup gerado'); };
  $('#b-imp').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { St.importJSON(await f.text()); toast('Backup restaurado'); ir('#hoje'); } catch (err) { toast('Arquivo inválido: ' + err.message); } };
  $('#b-reset').onclick = () => confirmar('Apagar TODOS os dados do app? Não dá para desfazer.', 'Apagar tudo', () => { St.resetAll(); ir('#hoje'); });
};

// Inicialização
render();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
window.__app = { S, planoDoDia, St };
