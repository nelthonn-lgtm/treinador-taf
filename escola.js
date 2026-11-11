// Escola de corrida: aulas curtas com quiz, sessões guiadas (cronômetro + voz + metrônomo),
// medição de cadência e autoavaliação por vídeo. Rotas: #dicas?escola[=...]
import { provas, normalizar } from './concursos.js';
import { beep, falar, metronomo, pararMetronomo, manterTela, liberarTela, unlockAudio, vibrate } from './devices.js';

const BASE = '#dicas?escola';
const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
const vid = (rot, q) => `<a class="btn ghost small vid" target="_blank" rel="noopener" href="${yt(q)}">▶ ${rot}</a>`;
const mmss = (s) => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const app = () => window.__app;
const est = () => { const s = app().S(); s.escola = s.escola || {}; const e = s.escola; e.aulas = e.aulas || {}; e.sessoes = e.sessoes || []; e.cad = e.cad || []; e.video = e.video || []; return e; };
const salvar = () => app().St.save();
const dorJoelho = () => { try { const s = app().S(); return s.checkins[app().St.hoje()]?.joelho ?? null; } catch { return null; } };
const toast = (t) => { const d = document.createElement('div'); d.textContent = t; d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:90px;background:#0f172a;color:#fff;padding:12px 14px;border-radius:12px;z-index:99;text-align:center'; document.body.appendChild(d); setTimeout(() => d.remove(), 2800); };

function metaCorrida() {
  try { const p = normalizar(JSON.parse(JSON.stringify(app().S().profile))); const r = provas(p).find((x) => x.tipo === 'run12'); return r ? { min: r.min, meta: r.meta } : null; } catch { return null; }
}

// ---------------- Aulas ----------------
const AULAS = [
  { id: 'postura', ic: '🧍', t: 'Postura da cabeça aos pés',
    p: ['Olhar 15 a 20 m à frente, queixo neutro (nem para cima, nem no peito).', 'Corpo alto, como se um fio puxasse o topo da cabeça.', 'Inclinação leve para a frente vinda do tornozelo, não da cintura.', 'Quadril encaixado: sem “sentar” na corrida nem empinar o bumbum.'],
    pr: 'Na próxima corrida, a cada 2 minutos faça o “check do fio”: cresça, solte os ombros e siga.', q: 'postura correta na corrida da cabeça aos pés',
    quiz: ['De onde vem a inclinação do corpo para a frente?', ['Da cintura, dobrando o tronco', 'Do tornozelo, com o corpo inteiro alinhado', 'Não deve existir inclinação nenhuma'], 1] },
  { id: 'bracos', ic: '💪', t: 'Braços que ajudam a correr',
    p: ['Cotovelos perto de 90°.', 'Balanço para a frente e para trás, a partir do ombro; as mãos não cruzam a linha do peito.', 'Mãos soltas, como se segurassem um ovo.', 'Ombros longe das orelhas. Tensão nos ombros gasta energia à toa.', 'Quer acelerar? Balance os braços mais rápido: as pernas acompanham.'],
    pr: 'Faça 3 vezes de 20 segundos correndo só pensando nos braços: para trás, para trás, para trás.', q: 'movimento dos braços na corrida técnica correta',
    quiz: ['Para acelerar no final da prova, o que ajuda?', ['Balançar os braços mais rápido', 'Prender os braços junto ao corpo', 'Cruzar os braços na frente do peito'], 0] },
  { id: 'pisada', ic: '🦶', t: 'Aterrissagem e passada',
    p: ['O pé deve tocar o chão embaixo do quadril, e não lá na frente do corpo.', 'Pé muito à frente com a perna esticada é a “passada de freio”: aumenta o impacto no joelho e na canela.', 'Calcanhar, meio ou ponta do pé? O ponto de contato importa menos que o lugar onde o pé cai. Não force mudar sua pisada de uma vez.', 'Pise leve e silencioso. Barulho alto = impacto alto.'],
    pr: 'Corra 1 minuto tentando fazer o mínimo de barulho possível. Repita 3 vezes durante a corrida.', q: 'overstriding passada longa erro corrida como corrigir',
    quiz: ['O que mais importa na aterrissagem do pé?', ['Sempre pisar com a ponta do pé', 'O pé cair perto e embaixo do quadril', 'Dar passadas bem longas'], 1] },
  { id: 'cadencia', ic: '🎵', t: 'Cadência: o ajuste mais estudado',
    p: ['Cadência = passos por minuto. Muitos iniciantes correm entre 150 e 165.', 'Estudos mostram que aumentar a cadência em 5 a 10%, mantendo a mesma velocidade, encurta a passada e reduz a carga no joelho e no quadril.', 'Não existe número mágico (o famoso 180). Suba aos poucos a partir da sua cadência atual.', 'Use a ferramenta “Medir minha cadência” e treine com o metrônomo.'],
    pr: 'Meça sua cadência aqui na Escola. O app ajusta o metrônomo da tela Correr para +5%.', q: 'cadência na corrida como aumentar passos por minuto metrônomo',
    quiz: ['Qual é a forma segura de mudar a cadência?', ['Pular direto para 180', 'Subir cerca de 5% e adaptar por algumas semanas', 'Diminuir a cadência e alongar a passada'], 1] },
  { id: 'respiracao', ic: '🌬️', t: 'Respiração',
    p: ['Nariz e boca juntos. No esforço forte, a boca precisa ajudar.', 'Respire “pela barriga”: a barriga enche e os ombros não sobem.', 'Ritmo leve: inspira em 3 passos e solta em 3 (3:3). Forte: 2:2.', 'Teste da fala: no treino leve você fala frases inteiras.', 'Pontada do lado: diminua, solte o ar com força e pressione o local.'],
    pr: 'Faça 2 minutos de trote contando 3 passos para inspirar e 3 para soltar.', q: 'como respirar corretamente na corrida',
    quiz: ['No treino leve, como saber se o ritmo está certo?', ['Consigo falar frases inteiras', 'Não consigo falar nada', 'Preciso respirar só pelo nariz'], 0] },
  { id: 'erros', ic: '⚠️', t: 'Os 5 erros mais comuns',
    p: ['1) Passada longa demais, com o pé lá na frente.', '2) Olhar para o chão e curvar as costas.', '3) Ombros tensos e braços cruzando o corpo.', '4) Quicar demais para cima: energia que não leva você para a frente.', '5) Sair rápido demais na largada e “quebrar” no meio da prova.'],
    pr: 'Grave um vídeo seu correndo e faça a Autoavaliação aqui na Escola.', q: 'erros comuns na corrida iniciantes técnica',
    quiz: ['Qual erro mais faz candidatos caminharem no fim do TAF?', ['Correr com os braços em 90°', 'Sair rápido demais na largada', 'Olhar para a frente'], 1] },
  { id: 'velocidades', ic: '⚡', t: 'Técnica em velocidades diferentes',
    p: ['Leve: passos curtos, relaxado, respiração 3:3.', 'Ritmo de prova: mesma postura, braços mais ativos, cadência um pouco maior.', 'Final forte: aumente a frequência dos passos e dos braços; o joelho sobe um pouco mais.', 'Em qualquer velocidade, o pé continua caindo embaixo do quadril.'],
    pr: 'Faça 4 acelerações de 20 segundos no fim da corrida leve, crescendo aos poucos.', q: 'técnica de corrida em diferentes velocidades acelerações strides',
    quiz: ['Para correr mais rápido, o primeiro ajuste é…', ['Esticar muito a passada', 'Aumentar a frequência dos passos e dos braços', 'Inclinar o tronco a partir da cintura'], 1] },
  { id: 'lesao', ic: '🛡️', t: 'Correr sem se machucar',
    p: ['A maioria das lesões de corrida vem de carga demais, cedo demais.', 'Regra prática: não aumente o volume semanal mais que ~10%. O plano do app já controla isso.', 'Dia forte seguido de dia leve. Durma 7 a 9 h.', 'Glúteo, coxa e panturrilha fortes protegem o joelho: não pule a força.', 'Dor que muda o jeito de correr, que aumenta durante o treino ou piora no dia seguinte = pare e, se continuar, procure avaliação.'],
    pr: 'Faça o check-in de dor todos os dias: o app reduz o treino quando o joelho reclama.', q: 'como evitar lesões na corrida iniciante fisioterapeuta',
    quiz: ['Qual é a principal causa de lesão em quem está começando?', ['Aumentar o treino rápido demais', 'Correr devagar', 'Fazer fortalecimento'], 0] },
  { id: 'forca', ic: '🏋️', t: 'Força e potência deixam a corrida mais econômica',
    p: ['Treino de força e de saltos melhora a “economia de corrida”: o mesmo ritmo passa a custar menos energia.', 'Por isso o plano alterna corrida com dias de força.', 'Panturrilha forte = tornozelo que devolve energia a cada passo.', 'Saltos e educativos só com o joelho sem dor (abaixo de 3/10).'],
    pr: 'No próximo dia de força, capriche na panturrilha e no glúteo.', q: 'fortalecimento para corredores economia de corrida',
    quiz: ['Por que treinar força ajuda na corrida de 12 minutos?', ['Porque substitui a corrida', 'Porque o mesmo ritmo passa a gastar menos energia', 'Não ajuda'], 1] },
  { id: 'estrategia', ic: '⏱️', t: 'Estratégia dos 12 minutos',
    p: ['Ritmo constante do início ao fim é o que rende mais metros.', 'Primeira volta no máximo 5 segundos mais rápida que o planejado.', 'Do 6º ao 9º minuto é a fase mais dura: postura, ombros soltos, cadência.', 'Último minuto: acelere com tudo.', 'Corra pela parte de dentro da pista. Se precisar, caminhe rápido, mas não pare.'],
    pr: 'Use o “Pacer dos 12 minutos” aqui na Escola para treinar o ritmo certo.', q: 'estratégia corrida 12 minutos TAF ritmo constante',
    quiz: ['Qual estratégia rende mais metros em 12 minutos?', ['Sair no máximo e segurar', 'Ritmo constante e acelerar no fim', 'Correr e caminhar alternando'], 1] },
];

// ---------------- Sessões guiadas ----------------
function sessoes() {
  const m = metaCorrida(), alvo = m ? m.meta : 2400, volta = 720 * 400 / alvo;
  const j = dorJoelho() ?? 0;
  const cad = app().S().profile.cadence || 170;
  const S = {
    leve: { t: '🚶 Técnica leve (dia de dor ou recuperação)', d: '≈10 min caminhando. Treina postura, braços e respiração sem impacto.', minJ: 10, passos: [
      ['Caminhada leve', 120, 'Aqueça caminhando no seu ritmo.'], ['Postura', 60, 'Cresça, olhar à frente, ombros soltos.'], ['Braços', 60, 'Cotovelo em 90 graus, mãos soltas, sem cruzar o peito.'],
      ['Passos curtos e rápidos', 60, 'Caminhe rápido com passos curtos, pé embaixo do corpo.'], ['Respiração pela barriga', 90, 'Inspire em 4 passos, solte em 4. A barriga enche.'], ['Caminhada rápida com tudo junto', 120, 'Postura, braços e passos curtos juntos.'], ['Desaquecer', 60, 'Diminua o ritmo e solte o corpo.']] },
    educ: { t: '🔁 Educativos de corrida', d: '≈12 min. Skipping, anfersen, dribling e acelerações. Faça antes de uma corrida leve.', minJ: 5, passos: [
      ['Aquecimento: caminhada e trote leve', 180, 'Comece caminhando e passe para um trote bem leve.'],
      ['Skipping baixo', 30, 'Joelhos sobem pouco, passos bem rápidos.', 'skipping baixo educativo corrida'], ['Volte caminhando', 30, '', null, 1],
      ['Anfersen', 30, 'Calcanhar em direção ao glúteo, passos rápidos.', 'anfersen educativo corrida'], ['Volte caminhando', 30, '', null, 1],
      ['Dribling', 30, 'Passos curtinhos rolando o pé no chão.', 'dribling educativo corrida'], ['Volte caminhando', 30, '', null, 1],
      ['Skipping alto', 20, 'Joelho na altura do quadril, corpo alto, braços ativos.', 'skipping alto educativo corrida'], ['Volte caminhando', 40, '', null, 1],
      ...(j < 3 ? [['Hopserlauf (saltitos)', 20, 'Saltite alternando as pernas com joelho alto. Pouso leve.', 'hopserlauf educativo'], ['Volte caminhando', 40, '', null, 1]] : []),
      ['Aceleração 1', 20, 'Acelere aos poucos até quase forte, solto.'], ['Caminhada', 60, '', null, 1],
      ['Aceleração 2', 20, 'Mesmo esforço: passos rápidos, braços ativos.'], ['Caminhada', 60, '', null, 1],
      ['Aceleração 3', 20, 'Última! Relaxe o rosto e os ombros.'], ['Caminhada', 60, 'Pronto. Agora siga para a corrida do dia, se tiver.', null, 1]] },
    cadencia: { t: `🎵 Cadência com metrônomo (${cad} passos/min)`, d: '≈18 min de trote. Alterna trechos com metrônomo para o corpo aprender a nova cadência.', minJ: 3, passos: [
      ['Aquecimento: trote leve', 240, 'Trote leve, sem metrônomo.'],
      ['Com metrônomo', 180, 'Um passo a cada bip. Passos curtos, mesma velocidade.', null, 0, 1], ['Trote livre', 120, 'Desliga o metrônomo. Tente manter os passos curtos.', null, 1],
      ['Com metrônomo', 180, 'Um passo a cada bip.', null, 0, 1], ['Trote livre', 120, 'Livre, sem bip.', null, 1],
      ['Com metrônomo', 180, 'Último bloco: relaxe e acompanhe o bip.', null, 0, 1], ['Desaquecer caminhando', 120, 'Muito bem. Caminhe para recuperar.', null, 1]] },
    tiros: { t: `🏁 Tiros de 400 m no ritmo da meta (${mmss(volta)} por volta)`, d: `Na pista de 400 m. 6 tiros no ritmo de ${alvo} m em 12 min, com 2 min caminhando entre eles. Só se você já corre 20 min contínuos.`, minJ: 3, passos: [
      ['Aquecimento: trote leve', 480, 'Trote leve por 8 minutos.'],
      ...Array.from({ length: 6 }, (_, i) => [[`Tiro ${i + 1} de 6: uma volta`, Math.round(volta), 'Ritmo de prova. Ao ouvir o bip final, você deveria completar a volta.'], ['Recupere caminhando', 120, '', null, 1]]).flat(),
      ['Desaquecer: trote leve', 300, 'Trote bem leve e depois caminhe.']] },
    pacer: { t: `⏱️ Pacer dos 12 minutos (meta ${alvo} m)`, d: `Para simulado na pista. A voz avisa a cada minuto onde você deveria estar e um bip marca cada volta de 400 m (${mmss(volta)}).`, minJ: 3, pacer: true, passos: [
      ['Aquecimento: trote leve', 480, 'Trote leve e algumas acelerações curtas no fim.'], ['Prepare-se na linha', 30, 'Na largada, saia no ritmo, não mais rápido.', null, 1],
      ['Teste de 12 minutos', 720, 'Valendo! Ritmo constante.'], ['Desaquecer caminhando', 300, 'Fim! Registre a distância na tela Evolução.', null, 1]] },
  };
  return { S, alvo, volta, j };
}

// ---------------- Telas ----------------
function hub() {
  const e = est(), feitas = AULAS.filter((a) => e.aulas[a.id]).length, j = dorJoelho();
  const prox = AULAS.find((a) => !e.aulas[a.id]);
  const ult = e.cad[e.cad.length - 1], cadAlvo = app().S().profile.cadence;
  const { S } = sessoes();
  const bloq = (k) => j !== null && j >= S[k].minJ;
  return `<header class="top"><a href="#mais" class="back">‹</a><h1>Escola de corrida</h1></header>
  <div class="card hl" id="esc-hub"><h3>🏃 Aprenda a correr melhor, sem se machucar</h3>
    <p class="muted small">Aulas de 2 minutos, treinos guiados com voz e ferramentas para medir sua técnica. Baseado no que os estudos de biomecânica mostram e voltado para a corrida de 12 minutos do TAF.</p>
    <div class="xp"><div class="bar"><i style="width:${Math.round(feitas / AULAS.length * 100)}%"></i></div></div>
    <p class="small"><b>${feitas} de ${AULAS.length} aulas concluídas</b>${prox ? ` · próxima: ${prox.ic} ${prox.t}` : ' · todas feitas! 🎉'}</p>
    ${prox ? `<a class="btn" href="${BASE}=aula-${prox.id}">Fazer a próxima aula</a>` : ''}</div>
  ${j !== null && j >= 3 ? `<div class="card warn"><p>Seu joelho está em <b>${j}/10</b> hoje. As sessões com impacto ficam bloqueadas; faça a <b>Técnica leve</b> ou uma aula.</p></div>` : ''}
  <div class="card"><h3>📚 Aulas</h3><ul class="hist">${AULAS.map((a, i) => `<li><span>${e.aulas[a.id] ? '✅' : i + 1 + '.'}</span><div><a href="${BASE}=aula-${a.id}">${a.ic} ${a.t}</a></div></li>`).join('')}</ul></div>
  <div class="card"><h3>🎧 Treinos guiados</h3><p class="muted small">O celular fala cada etapa e marca o tempo. Pode correr com ele no bolso e fone de ouvido.</p>
    <ul class="hist">${Object.entries(S).map(([k, s]) => `<li><div><b>${s.t}</b><br><span class="muted small">${s.d}</span></div>${bloq(k) ? '<span class="small">🔒 joelho</span>' : `<a class="btn small" href="${BASE}=sessao-${k}">Iniciar</a>`}</li>`).join('')}</ul></div>
  <div class="card"><h3>📏 Medir minha cadência</h3><p class="muted small">${ult ? `Última medição: <b>${ult.v} passos/min</b> (${ult.d.split('-').reverse().join('/')}). ` : ''}Metrônomo da tela Correr: <b>${cadAlvo} passos/min</b>.</p><a class="btn ghost" href="${BASE}=cadencia">Medir agora</a></div>
  <div class="card"><h3>🎥 Autoavaliação por vídeo</h3><p class="muted small">Peça para alguém filmar 10 segundos de você correndo e confira a técnica num checklist.${e.video.length ? ` Última nota: <b>${e.video[e.video.length - 1].n}/8</b>.` : ''}</p><a class="btn ghost" href="${BASE}=video">Fazer autoavaliação</a></div>
  <div class="card"><h3>📖 Guia completo</h3><p class="muted small">Todas as dicas num só lugar, com a tabela de ritmo dos 12 minutos.</p><a class="btn ghost" href="#dicas?corrida">Abrir o guia</a></div>`;
}

function aula(id) {
  const i = AULAS.findIndex((a) => a.id === id), a = AULAS[i]; if (!a) return hub();
  const feita = est().aulas[a.id], nx = AULAS[i + 1];
  return `<header class="top"><a href="${BASE}" class="back">‹</a><h1>Aula ${i + 1}</h1></header>
  <div class="card hl" id="esc-aula"><h3>${a.ic} ${a.t}</h3><ul>${a.p.map((x) => `<li>${x}</li>`).join('')}</ul>
    <div class="row gap wrap">${vid('Ver vídeos sobre isso', a.q)}</div></div>
  <div class="card tip"><h3>👟 Na prática</h3><p>${a.pr}</p></div>
  <div class="card"><h3>❓ Confira se entendeu</h3><p><b>${a.quiz[0]}</b></p>
    <div class="col gap">${a.quiz[1].map((o, k) => `<button class="btn ghost" data-q="${k}">${o}</button>`).join('')}</div><p id="esc-res" class="small"></p></div>
  ${feita ? '<p class="center small">✅ Aula concluída</p>' : ''}
  ${nx ? `<p class="center"><a href="${BASE}=aula-${nx.id}">Próxima aula: ${nx.ic} ${nx.t} ›</a></p>` : `<p class="center"><a href="${BASE}">Voltar à Escola</a></p>`}`;
}
function ligarAula(id) {
  const a = AULAS.find((x) => x.id === id); if (!a) return;
  document.querySelectorAll('[data-q]').forEach((b) => b.onclick = () => {
    const ok = +b.dataset.q === a.quiz[2], r = document.getElementById('esc-res');
    if (ok) {
      r.innerHTML = '✅ Isso mesmo!';
      const e = est(); if (!e.aulas[a.id]) { e.aulas[a.id] = app().St.hoje(); app().St.addXP(15); salvar(); toast('Aula concluída! +15 XP'); }
    } else r.innerHTML = '❌ Ainda não. Releia os pontos acima e tente de novo.';
  });
}

function cadenciaTela() {
  return `<header class="top"><a href="${BASE}" class="back">‹</a><h1>Medir cadência</h1></header>
  <div class="card hl" id="esc-cad"><h3>📏 Como medir</h3><ol>
    <li>Corra no seu ritmo leve de sempre por uns 3 minutos.</li><li>Toque em <b>Começar 30 s</b> e conte quantas vezes o <b>pé direito</b> toca o chão até o bip final.</li><li>Digite o número abaixo.</li></ol>
    <button class="btn" id="cad-go">Começar 30 s</button><p id="cad-t" class="center" style="font-size:2rem;font-weight:800"></p>
    <label>Toques do pé direito em 30 s<input id="cad-n" type="text" inputmode="numeric" maxlength="3"></label>
    <button class="btn" id="cad-ok">Calcular</button><div id="cad-r"></div></div>
  <div class="card"><p class="muted small">A conta: toques do pé direito × 2 (os dois pés) × 2 (para 1 minuto). Faixa comum: 160 a 180. Estudos indicam subir 5 a 10% a partir da sua cadência, sem pular direto para 180.</p></div>`;
}
let cadTimer = null;
function ligarCadencia() {
  document.getElementById('cad-go').onclick = () => {
    unlockAudio(); clearInterval(cadTimer); const fim = Date.now() + 30000, el = document.getElementById('cad-t');
    beep(1200, 0.2); vibrate(200); falar('Valendo. Conte o pé direito.');
    cadTimer = setInterval(() => { const r = (fim - Date.now()) / 1000; el.textContent = Math.max(0, Math.ceil(r)) + ' s'; if (r <= 0) { clearInterval(cadTimer); beep(900, 0.5); vibrate([200, 100, 200]); falar('Pare de contar.'); el.textContent = 'Fim!'; } }, 200);
  };
  document.getElementById('cad-ok').onclick = () => {
    const n = parseInt(document.getElementById('cad-n').value, 10);
    if (!(n >= 30 && n <= 56)) return toast('Confira o número: contando só o pé direito em 30 s, costuma ficar entre 38 e 46.');
    const v = n * 4, alvo = v >= 175 ? v : Math.min(180, Math.round(v * 1.05));
    const s = app().S(), e = est(); e.cad.push({ d: app().St.hoje(), v }); s.profile.cadence = alvo; salvar();
    document.getElementById('cad-r').innerHTML = `<p class="nota">Sua cadência: <b>${v} passos/min</b>. ${v >= 175 ? 'Já está numa faixa ótima: mantenha.' : `Nova meta: <b>${alvo} passos/min</b> (+5%). O metrônomo da tela Correr e o treino de cadência já usam esse valor. Meça de novo em 2 a 3 semanas.`}</p>`;
  };
}

const CHECK = [
  ['Olhar para a frente, cabeça neutra', 'postura'], ['Tronco alto, sem curvar as costas', 'postura'], ['Ombros soltos, longe das orelhas', 'bracos'], ['Braços em ~90°, sem cruzar o peito', 'bracos'],
  ['Pé caindo perto e embaixo do quadril (vista de lado)', 'pisada'], ['Joelho levemente dobrado ao tocar o chão', 'pisada'], ['Joelhos não “caem” para dentro (vista de trás)', 'lesao'], ['Pouco “quique” para cima', 'erros'],
];
function videoTela() {
  return `<header class="top"><a href="${BASE}" class="back">‹</a><h1>Autoavaliação</h1></header>
  <div class="card hl" id="esc-vid"><h3>🎥 Como gravar</h3><ol><li>Peça para alguém filmar 10 segundos <b>de lado</b> e 10 segundos <b>de trás</b>, com você no ritmo leve.</li><li>Assista em câmera lenta ou pausando (a maioria dos celulares tem).</li><li>Marque o que você vê:</li></ol>
  ${CHECK.map(([t], i) => `<label class="check"><input type="checkbox" data-c="${i}"> ${t}</label>`).join('')}
  <button class="btn" id="vid-ok" style="margin-top:8px">Ver resultado</button><div id="vid-r"></div></div>
  <div class="card"><p class="muted small">Joelho caindo para dentro ou dor que não passa merecem avaliação de um fisioterapeuta ou educador físico.</p></div>`;
}
function ligarVideo() {
  document.getElementById('vid-ok').onclick = () => {
    const ok = [...document.querySelectorAll('[data-c]')].map((c) => c.checked), n = ok.filter(Boolean).length;
    const falhas = [...new Set(CHECK.filter((_, i) => !ok[i]).map((c) => c[1]))].map((id) => AULAS.find((a) => a.id === id));
    const e = est(); e.video.push({ d: app().St.hoje(), n }); salvar();
    document.getElementById('vid-r').innerHTML = `<p class="nota">Nota: <b>${n}/8</b>. ${n === 8 ? 'Técnica muito boa! Repita a avaliação a cada mês.' : 'Revise estas aulas:'}</p>${falhas.length ? `<ul>${falhas.map((a) => `<li><a href="${BASE}=aula-${a.id}">${a.ic} ${a.t}</a></li>`).join('')}</ul>` : ''}`;
  };
}

// ---------------- Executor das sessões ----------------
let run = null;
function pararSessao() { if (!run) return; clearInterval(run.timer); pararMetronomo(); liberarTela(); try { speechSynthesis.cancel(); } catch {} run = null; }

function sessaoTela(k) {
  const { S, j } = sessoes(), s = S[k]; if (!s) return hub();
  if (j !== null && j >= s.minJ) return `<header class="top"><a href="${BASE}" class="back">‹</a><h1>Treino guiado</h1></header><div class="card warn" id="esc-sess"><p>Com o joelho em ${j}/10 hoje, este treino fica para outro dia. Faça a <a href="${BASE}=sessao-leve">Técnica leve</a>.</p></div>`;
  const total = s.passos.reduce((t, p) => t + p[1], 0);
  return `<header class="top"><a href="${BASE}" class="back">‹</a><h1>Treino guiado</h1></header>
  <div class="card hl" id="esc-sess"><h3>${s.t}</h3><p class="muted small">${s.d} Duração total: ${mmss(total)}.</p>
    <div id="ss-now" class="center"><p class="small muted" id="ss-et">Toque em Começar. Deixe o volume alto.</p><h2 id="ss-n" style="margin:6px 0">Pronto?</h2><div id="ss-t" style="font-size:3rem;font-weight:800">${mmss(s.passos[0][1])}</div><p id="ss-d" class="small"></p><div id="ss-v"></div></div>
    <div class="xp"><div class="bar"><i id="ss-bar" style="width:0%"></i></div></div><p class="small muted" id="ss-nx">Primeira etapa: ${esc(s.passos[0][0])}</p>
    <div class="row gap"><button class="btn" id="ss-go" style="flex:1">Começar</button><button class="btn ghost" id="ss-skip">Pular etapa</button></div>
    <button class="btn ghost" id="ss-end" style="margin-top:8px">Encerrar</button></div>
  <div class="card"><h3>Etapas</h3><ul class="hist">${s.passos.map((p) => `<li><span>${mmss(p[1])}</span><div>${esc(p[0])}</div></li>`).join('')}</ul></div>`;
}
function ligarSessao(k) {
  const { S, alvo, volta } = sessoes(), s = S[k]; if (!s || !document.getElementById('ss-go')) return;
  const total = s.passos.reduce((t, p) => t + p[1], 0);
  const $ = (id) => document.getElementById(id);
  const iniciarEtapa = (i) => {
    const p = s.passos[i]; run.i = i; run.fim = Date.now() + p[1] * 1000; run.avisos = {};
    $('ss-n').textContent = p[0]; $('ss-d').textContent = p[2] || ''; $('ss-et').textContent = `Etapa ${i + 1} de ${s.passos.length}`;
    $('ss-v').innerHTML = p[3] ? vid('ver o exercício', p[3]) : '';
    $('ss-nx').textContent = s.passos[i + 1] ? 'Depois: ' + s.passos[i + 1][0] : 'Última etapa';
    pararMetronomo(); if (p[5]) metronomo(app().S().profile.cadence || 170);
    beep(p[4] ? 700 : 1200, 0.25); vibrate(250); falar(p[0] + '. ' + (p[2] || ''));
  };
  const tick = () => {
    if (!run || run.pausa) return;
    const p = s.passos[run.i], rest = (run.fim - Date.now()) / 1000, feito = s.passos.slice(0, run.i).reduce((t, x) => t + x[1], 0) + (p[1] - rest);
    $('ss-t').textContent = mmss(Math.ceil(rest)); $('ss-bar').style.width = Math.min(100, feito / total * 100) + '%';
    const r = Math.ceil(rest);
    if (r <= 3 && r >= 1 && !run.avisos[r]) { run.avisos[r] = 1; beep(1000, 0.08); }
    if (p[1] >= 60 && !p[4] && Math.abs(rest - p[1] / 2) < 0.3 && !run.avisos.m) { run.avisos.m = 1; falar('Metade.'); }
    if (s.pacer && p[0] === 'Teste de 12 minutos') {
      const dec = p[1] - rest, min = Math.floor(dec / 60), vol = Math.floor(dec / volta);
      if (min >= 1 && min < 12 && !run.avisos['m' + min]) { run.avisos['m' + min] = 1; falar(`${min} minuto${min > 1 ? 's' : ''}. Você deveria estar em ${Math.round(alvo / 12 * min / 10) * 10} metros.`); }
      if (vol >= 1 && !run.avisos['v' + vol]) { run.avisos['v' + vol] = 1; beep(1600, 0.15); vibrate(120); }
      if (r === 60 && !run.avisos.ult) { run.avisos.ult = 1; falar('Último minuto! Acelere!'); }
    }
    if (rest <= 0) {
      if (run.i + 1 < s.passos.length) iniciarEtapa(run.i + 1);
      else { concluir(); }
    }
  };
  const concluir = () => {
    pararSessao(); beep(1500, 0.6); vibrate([300, 100, 300]); falar('Treino concluído. Muito bem!');
    const e = est(); e.sessoes.push({ d: app().St.hoje(), k }); app().St.addXP(20); salvar();
    $('ss-n').textContent = 'Concluído! 🎉'; $('ss-t').textContent = '✓'; $('ss-d').textContent = '+20 XP. ' + (k === 'pacer' ? 'Registre a distância do teste em Evolução › Registrar teste.' : '');
    $('ss-go').disabled = true; $('ss-skip').disabled = true; $('ss-bar').style.width = '100%';
  };
  $('ss-go').onclick = () => {
    if (!run) { unlockAudio(); manterTela(); run = { i: 0, timer: setInterval(tick, 250) }; iniciarEtapa(0); $('ss-go').textContent = 'Pausar'; return; }
    if (!run.pausa) { run.pausa = Date.now(); pararMetronomo(); $('ss-go').textContent = 'Continuar'; falar('Pausado.'); }
    else { run.fim += Date.now() - run.pausa; run.pausa = 0; if (s.passos[run.i][5]) metronomo(app().S().profile.cadence || 170); $('ss-go').textContent = 'Pausar'; }
  };
  $('ss-skip').onclick = () => { if (!run) return; if (run.i + 1 < s.passos.length) { run.pausa = 0; $('ss-go').textContent = 'Pausar'; iniciarEtapa(run.i + 1); } else concluir(); };
  $('ss-end').onclick = () => { pararSessao(); location.hash = BASE; };
}

// ---------------- Roteamento e atalhos ----------------
function mostrar() {
  const h = location.hash;
  if (!h.startsWith(BASE)) return;
  const view = document.getElementById('view'); if (!view) return;
  const q = h.slice(BASE.length + 1);
  const chave = 'esc:' + q;
  if (view.dataset.esc === chave && view.querySelector('#esc-hub,#esc-aula,#esc-cad,#esc-vid,#esc-sess')) return;
  pararSessao(); clearInterval(cadTimer);
  document.body.dataset.rota = 'escola';
  let html, ligar = () => {};
  if (q.startsWith('aula-')) { const id = q.slice(5); html = aula(id); ligar = () => ligarAula(id); }
  else if (q.startsWith('sessao-')) { const k = q.slice(7); html = sessaoTela(k); ligar = () => ligarSessao(k); }
  else if (q === 'cadencia') { html = cadenciaTela(); ligar = ligarCadencia; }
  else if (q === 'video') { html = videoTela(); ligar = ligarVideo; }
  else html = hub();
  view.dataset.esc = chave; view.innerHTML = html; ligar(); window.scrollTo(0, 0);
}

function atalhos() {
  const rota = document.body.dataset.rota, view = document.getElementById('view'); if (!view) return;
  if (!location.hash.startsWith(BASE)) { if (view.dataset.esc) delete view.dataset.esc; if (run) pararSessao(); }
  if (rota === 'mais') {
    const menu = view.querySelector('.menu');
    if (menu && !menu.querySelector(`a[href="${BASE}"]`)) {
      menu.querySelectorAll('a[href="#dicas?corrida"]').forEach((a) => a.remove());
      menu.insertAdjacentHTML('afterbegin', `<a href="${BASE}">🏃 Escola de corrida: técnica, treinos guiados e cadência</a>`);
    }
  }
  if ((rota === 'dicas' || rota === 'correr') && !document.getElementById('esc-atalho')) {
    const old = document.getElementById('tec-atalho'); if (old) old.remove();
    const html = `<a class="card tip" id="esc-atalho" href="${BASE}" style="display:block;text-decoration:none;color:inherit"><b>🏃 Escola de corrida</b><br><span class="muted small">Aulas de técnica, treinos guiados com voz, pacer dos 12 minutos e medição de cadência.</span></a>`;
    const h = view.querySelector('header.top');
    if (rota === 'dicas' && h) h.insertAdjacentHTML('afterend', html); else view.insertAdjacentHTML('beforeend', html);
  }
  if (rota === 'hoje' && !document.getElementById('esc-hoje') && app()?.S().profile.onboarded) {
    const e = est(), prox = AULAS.find((a) => !e.aulas[a.id]), j = dorJoelho();
    const sug = j !== null && j >= 3 ? `<a class="btn small" href="${BASE}=sessao-leve">Técnica leve (sem impacto)</a>` : prox ? `<a class="btn small" href="${BASE}=aula-${prox.id}">Aula: ${prox.ic} ${prox.t}</a>` : `<a class="btn small" href="${BASE}=sessao-educ">Educativos guiados</a>`;
    view.insertAdjacentHTML('beforeend', `<div class="card" id="esc-hoje"><h3>🏃 Técnica do dia</h3><p class="muted small">2 minutos que deixam sua corrida mais leve e segura.</p>${sug} <a class="small" href="${BASE}" style="margin-left:8px">Escola de corrida ›</a></div>`);
  }
}

function tick() { mostrar(); atalhos(); }
new MutationObserver(tick).observe(document.getElementById('view'), { childList: true });
window.addEventListener('hashchange', () => setTimeout(tick, 60));
setTimeout(tick, 300);
window.__escola = { AULAS, est };
