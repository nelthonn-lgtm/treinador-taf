// Guia de técnica de corrida: postura, passada, respiração, prevenção de lesão, educativos,
// treinos de velocidade, estratégia dos 12 minutos e tabela de ritmo. Abre em #dicas?corrida.
import { provas, normalizar } from './concursos.js';

const HASH = '#dicas?corrida';
const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
const vid = (rotulo, q) => `<a class="btn ghost small vid" target="_blank" rel="noopener" href="${yt(q)}">▶ ${rotulo}</a>`;
const mmss = (s) => { s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

function metasCorrida() {
  try {
    const p = normalizar(JSON.parse(JSON.stringify(JSON.parse(localStorage.getItem('tafpprn.v1'))?.profile || {})));
    const r = provas(p).find((x) => x.tipo === 'run12');
    return r ? { min: r.min, meta: r.meta } : null;
  } catch { return null; }
}

function tabelaRitmo(m) {
  const base = [1600, 1800, 2000, 2100, 2200, 2300, 2400, 2600, 2800];
  const ds = [...new Set([...base, ...(m ? [m.min, m.meta] : [])])].sort((a, b) => a - b);
  const linha = (d) => {
    const tag = m && d === m.meta ? ' <b>← sua meta</b>' : m && d === m.min ? ' <b>← mínimo do edital</b>' : '';
    const forte = m && (d === m.meta || d === m.min);
    return `<tr${forte ? ' style="font-weight:700"' : ''}><td>${d} m${tag}</td><td>${mmss(720 / (d / 1000))}/km</td><td>${mmss(720 * 400 / d)}</td><td>${mmss(720 * 100 / d)}</td></tr>`;
  };
  return `<table class="tab"><tr><th>Distância em 12 min</th><th>Ritmo</th><th>Volta de 400 m</th><th>A cada 100 m</th></tr>${ds.map(linha).join('')}</table>`;
}

function guia() {
  const m = metasCorrida();
  return `<header class="top"><a href="#dicas?escola" class="back">‹</a><h1>Guia de corrida</h1></header>
  <div class="card hl" id="tec-guia"><h3>🏃 As 6 regras de ouro</h3><ol>
    <li><b>Corpo alto e levemente inclinado para a frente</b>, a partir do tornozelo, não da cintura.</li>
    <li><b>Passos curtos e rápidos.</b> O pé toca o chão embaixo do quadril, nunca lá na frente.</li>
    <li><b>Pise leve.</b> Se a corrida faz muito barulho, o impacto está alto.</li>
    <li><b>Braços em 90°</b>, balançando para a frente e para trás, sem cruzar na frente do peito.</li>
    <li><b>Ombros e mãos soltos.</b> Mão fechada como se segurasse um ovo.</li>
    <li><b>Ritmo constante.</b> No TAF, quem sai rápido demais quase sempre termina caminhando.</li></ol>
    <div class="row gap wrap">${vid('Técnica de corrida para iniciantes', 'técnica de corrida para iniciantes postura passada braços')}</div></div>

  <div class="card"><h3>1. Postura</h3><ul>
    <li>Olhe para a frente, uns 15 a 20 metros, e não para o chão.</li>
    <li>Imagine um fio puxando o topo da cabeça para cima: peito aberto, sem curvar as costas.</li>
    <li>Incline o corpo inteiro só um pouco para a frente; a gravidade ajuda a andar.</li>
    <li>Quadril “encaixado” embaixo do corpo: sem empinar o bumbum nem sentar na corrida.</li>
    <li>Cansou? Confira a postura: é a primeira coisa que se perde no fim da prova.</li></ul>
    <div class="row gap wrap">${vid('Postura correta', 'postura correta na corrida como correr certo')}${vid('Movimento dos braços', 'movimento dos braços na corrida técnica')}</div></div>

  <div class="card"><h3>2. Passada e cadência</h3><ul>
    <li><b>Cadência</b> é quantos passos você dá por minuto. A faixa boa para a maioria é 165 a 180.</li>
    <li>Para correr mais rápido, primeiro aumente a <b>frequência</b> dos passos; não estique a passada.</li>
    <li>Passada longa demais (o pé batendo muito à frente do corpo) funciona como um freio e é a principal causa de dor no joelho e na canela.</li>
    <li>Use o <b>metrônomo</b> da tela Correr: suba de 5 em 5 passos por minuto, uma semana de cada vez.</li>
    <li>O pé pode tocar o chão com o meio do pé ou com o calcanhar. O que importa é tocar <b>embaixo do quadril</b>, não forçar um jeito de pisar.</li></ul>
    <div class="row gap wrap">${vid('Cadência: como aumentar', 'cadência na corrida como aumentar passos por minuto')}${vid('Passada longa (overstriding)', 'overstriding passada longa corrida erro como corrigir')}</div></div>

  <div class="card"><h3>3. Respiração</h3><ul>
    <li>Respire pelo nariz e pela boca ao mesmo tempo; na prova, a boca precisa ajudar.</li>
    <li>Respire “pela barriga”: a barriga enche, os ombros não sobem.</li>
    <li>Ritmo leve: inspire em 3 passos e solte em 3. Ritmo forte: 2 e 2.</li>
    <li><b>Teste da fala:</b> no treino leve, você consegue falar frases inteiras. Se não consegue, está rápido demais para um treino leve.</li>
    <li><b>Pontada do lado:</b> diminua o ritmo, solte o ar com força e pressione o local com a mão por alguns passos. Evite comer muito 2 horas antes.</li></ul>
    <div class="row gap wrap">${vid('Como respirar correndo', 'como respirar corretamente na corrida iniciante')}${vid('Dor do lado (pontada)', 'dor do lado correndo pontada como evitar')}</div></div>

  <div class="card warn"><h3>4. Correr sem se machucar</h3><ul>
    <li><b>Regra dos 10%:</b> não aumente o volume da semana (tempo ou km) mais que 10% de uma semana para outra. O plano do app já faz isso por você.</li>
    <li><b>Dia leve depois de dia forte.</b> Nunca dois treinos intensos seguidos.</li>
    <li><b>Aqueça sempre:</b> 5 a 10 minutos de caminhada e trote leve antes de qualquer ritmo forte.</li>
    <li><b>Prefira terra, grama ou pista</b> no começo. Evite descidas íngremes e calçadas irregulares.</li>
    <li><b>Força protege:</b> glúteo, coxa e panturrilha fortes seguram o joelho. Não pule os dias de força.</li>
    <li><b>Durma 7 a 9 horas.</b> A recuperação acontece no descanso.</li>
    <li><b>Dor que muda o jeito de correr = pare.</b> Mancar, dor que aumenta durante a corrida ou que piora no dia seguinte são sinais para parar e, se continuar, procurar avaliação.</li>
    <li><b>Canela doendo</b> (canelite) costuma vir de aumento rápido de volume ou de passada longa: reduza o volume e corrija a passada.</li>
    <li><b>Joelho na frente doendo:</b> encurte a passada, aumente a cadência e reforce o glúteo.</li></ul>
    <div class="row gap wrap">${vid('Prevenir lesões', 'como evitar lesões na corrida iniciante')}${vid('Canelite', 'canelite como evitar e tratar corrida')}${vid('Dor no joelho correndo', 'dor no joelho na corrida como evitar fortalecimento')}${vid('Fortalecimento para corredor', 'fortalecimento para corredores iniciantes em casa')}</div></div>

  <div class="card"><h3>5. Educativos de corrida</h3>
    <p class="muted small">Exercícios curtos que ensinam o corpo a correr melhor. Faça depois do aquecimento, 2 vezes por semana: 2 vezes de 20 metros cada, voltando caminhando. <b>Pule os educativos com salto no dia em que o joelho estiver em 3/10 ou mais.</b></p>
    <ul class="hist">
      <li><div><b>Skipping baixo</b><br><span class="muted small">Joelho sobe pouco, passos bem rápidos, na ponta dos pés.</span></div>${vid('vídeo', 'skipping baixo educativo corrida')}</li>
      <li><div><b>Skipping alto</b><br><span class="muted small">Joelho na altura do quadril, corpo alto, braços ativos.</span></div>${vid('vídeo', 'skipping alto educativo corrida execução')}</li>
      <li><div><b>Anfersen (calcanhar no bumbum)</b><br><span class="muted small">Calcanhar sobe em direção ao glúteo, passos rápidos.</span></div>${vid('vídeo', 'anfersen educativo corrida calcanhar no glúteo')}</li>
      <li><div><b>Dribling</b><br><span class="muted small">Passos curtinhos, rolando o pé no chão, tornozelo ativo.</span></div>${vid('vídeo', 'dribling educativo de corrida')}</li>
      <li><div><b>Hopserlauf (saltitos)</b><br><span class="muted small">Saltitar alternando as pernas com joelho alto. Tem impacto: só com joelho bem.</span></div>${vid('vídeo', 'hopserlauf educativo corrida saltito')}</li>
      <li><div><b>Acelerações (strides)</b><br><span class="muted small">15 a 20 segundos acelerando aos poucos até quase forte, soltos e relaxados.</span></div>${vid('vídeo', 'strides acelerações progressivas corrida como fazer')}</li>
    </ul></div>

  <div class="card"><h3>6. Treinos para ganhar velocidade</h3>
    <p class="muted small">O plano do app libera esses treinos aos poucos, conforme o nível. Entenda para que serve cada um:</p><ul>
    <li><b>Rodagem leve:</b> corrida em ritmo de conversa. É 70 a 80% do treino e constrói o fôlego.</li>
    <li><b>Tiros (intervalado):</b> trechos de 200 a 400 m no ritmo da prova ou um pouco mais rápido, com descanso caminhando. Ensina o corpo a aguentar o ritmo do TAF.</li>
    <li><b>Fartlek:</b> “brincar com o ritmo”: 1 minuto mais forte, 2 minutos leve, várias vezes. Bom para quem acha os tiros chatos.</li>
    <li><b>Ritmo de prova:</b> 6 a 8 minutos contínuos no ritmo da sua meta. É o treino mais parecido com o TAF.</li>
    <li><b>Progressivo:</b> começa leve e termina forte. Treina o final de prova.</li>
    <li><b>Simulado de 12 minutos:</b> a cada 3 ou 4 semanas, para medir a evolução. Use o modo Simulado da tela Correr.</li></ul>
    <p class="nota">Velocidade vem da soma de fôlego (rodagens), força (dias de força) e técnica. Fazer só tiros, todos os dias, é o caminho mais rápido para a lesão.</p>
    <div class="row gap wrap">${vid('Treino intervalado', 'treino intervalado corrida iniciante tiros 400 metros')}${vid('Fartlek', 'fartlek treino corrida iniciante')}${vid('Treino para o TAF de corrida', 'treino corrida 12 minutos TAF 2400 metros')}</div></div>

  <div class="card hl"><h3>7. Estratégia dos 12 minutos</h3><ul>
    <li><b>Ritmo igual do começo ao fim.</b> A largada é onde mais gente perde a prova: a adrenalina faz sair rápido demais.</li>
    <li><b>Primeira volta:</b> no máximo 5 segundos mais rápida que o seu tempo de volta da tabela abaixo.</li>
    <li><b>Conte as voltas</b> e confira o tempo a cada volta, se a pista tiver marcação.</li>
    <li><b>Do 6º ao 9º minuto</b> é a fase mais dura: segure a postura, solte os ombros e mantenha a cadência.</li>
    <li><b>Último minuto:</b> acelere com tudo o que sobrou.</li>
    <li>Se precisar, <b>caminhe rápido, mas não pare</b> (na maioria dos editais parar elimina).</li>
    <li>Corra pela parte de dentro da pista: cada volta por fora soma metros que não contam.</li></ul>
    <div class="row gap wrap">${vid('Estratégia para o TAF', 'estratégia corrida 12 minutos TAF como não quebrar')}${vid('Teste de Cooper', 'teste de cooper 12 minutos como fazer ritmo')}</div></div>

  <div class="card"><h3>8. Tabela de ritmo dos 12 minutos</h3>
    ${m ? `<p>Pelo seu concurso: mínimo <b>${m.min} m</b> e meta <b>${m.meta} m</b>.</p>` : ''}
    ${tabelaRitmo(m)}
    <p class="muted small">Volta de 400 m = uma volta em pista oficial de atletismo. Ex.: 2.400 m em 12 min pede 2:00 por volta (5:00/km); 2.000 m pede 2:24 por volta (6:00/km).</p></div>

  <p class="muted small center">Os vídeos abrem uma busca no YouTube. Prefira canais de educador físico ou fisioterapeuta e compare com as dicas acima.</p>`;
}

function mostrar() {
  if (location.hash !== HASH) return;
  const view = document.getElementById('view');
  if (!view || document.getElementById('tec-guia')) return;
  document.body.dataset.rota = 'tecnica'; // impede outros módulos de anexar cartões da página Dicas
  view.innerHTML = guia();
  window.scrollTo(0, 0);
}

function tick() { mostrar(); }
new MutationObserver(tick).observe(document.getElementById('view'), { childList: true });
window.addEventListener('hashchange', () => setTimeout(tick, 60));
setTimeout(tick, 300);
