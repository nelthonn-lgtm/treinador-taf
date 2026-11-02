// Botão "Ver vídeo" em cada exercício: abre no YouTube uma busca já filtrada em português.
(function () {
  const Q = {
    'Remada com elástico': 'remada com elástico em pé como fazer',
    'Rotação externa com elástico': 'rotação externa de ombro com elástico manguito rotador',
    'Retração escapular em "W"': 'retração escapular exercício W ombro',
    'Suspensão com pés apoiados': 'suspensão na barra com pés apoiados iniciante',
    'Suspensão na barra (dead hang)': 'dead hang suspensão na barra iniciante como fazer',
    'Ativação escapular na barra': 'ativação escapular na barra fixa scapular pull up',
    'Remada australiana (barra baixa)': 'remada australiana barra baixa iniciante',
    'Isometria no topo da barra': 'isometria no topo da barra fixa queixo acima',
    'Barra negativa (descida de 5 s)': 'barra fixa negativa excêntrica iniciante',
    'Barra assistida com superband': 'barra fixa assistida com elástico superband',
    'Barra fixa livre (padrão do edital)': 'barra fixa pronada execução correta TAF',
    'Escada na barra (1-2-3)': 'barra fixa treino em escada iniciante',
    'Dead bug': 'dead bug exercício core como fazer',
    'Prancha': 'prancha abdominal execução correta iniciante',
    'Prancha lateral': 'prancha lateral execução correta',
    'Perdigueiro (bird dog)': 'perdigueiro bird dog exercício lombar',
    'Ponte de glúteo': 'ponte de glúteo execução correta',
    'Abdominal parcial (crunch)': 'abdominal crunch execução correta',
    'Abdominal completo (técnica do edital)': 'abdominal remador braços cruzados no peito TAF',
    'Abdominal do edital: máximo em 30 s': 'abdominal TAF braços cruzados pés presos como treinar',
    'Superman': 'exercício superman lombar',
    'Ostra (clamshell)': 'exercício ostra clamshell glúteo médio joelho',
    'Abdução de quadril deitado': 'abdução de quadril deitado de lado glúteo médio',
    'Sentar e levantar da cadeira': 'sentar e levantar da cadeira exercício joelho',
    'Elevação de panturrilha': 'elevação de panturrilha em pé execução',
    'Isometria na parede (cadeirinha)': 'isometria na parede cadeirinha joelho',
    'Agachamento na caixa/cadeira': 'agachamento no banco box squat iniciante',
    'Ponte de glúteo unilateral': 'ponte de glúteo unilateral',
    'Subida no degrau baixo': 'step up subida no degrau exercício joelho',
    'Panturrilha unilateral': 'elevação de panturrilha unilateral',
    'Descida controlada do degrau': 'step down excêntrico joelho fisioterapia',
    'Afundo estático curto': 'afundo estático execução correta iniciante',
    'Mobilidade de tornozelo na parede': 'mobilidade de tornozelo na parede joelho',
    'Gato-camelo': 'gato camelo mobilidade coluna',
    'Rotação torácica (livro aberto)': 'rotação torácica livro aberto mobilidade',
    'Alongamento de flexor do quadril': 'alongamento flexor do quadril ajoelhado',
    'Pêndulo de ombro': 'exercício pendular de codman ombro',
    'Rotação externa isométrica na parede': 'rotação externa isométrica ombro parede',
    'Respiração diafragmática': 'respiração diafragmática deitado como fazer',
    'Flexão na parede': 'flexão de braço na parede iniciante',
    'Flexão inclinada (mesa ou bancada)': 'flexão de braço inclinada iniciante',
    'Flexão com joelhos apoiados': 'flexão de braço com joelhos apoiados execução correta',
    'Flexão negativa (descida de 4 s)': 'flexão de braço negativa excêntrica',
    'Flexão de braço completa': 'flexão de braço execução correta TAF',
    'Prancha alta (braços estendidos)': 'prancha alta braços estendidos',
    'Saltitos baixos (pular corda, real ou imaginária)': 'pular corda iniciante técnica',
    'Salto horizontal submáximo': 'impulsão horizontal técnica iniciante',
    'Impulsão horizontal (técnica de prova)': 'impulsão horizontal TAF técnica',
    'Mudança de direção (técnica do shuttle)': 'shuttle run técnica TAF',
    'Acelerações curtas (20 m)': 'educativo aceleração corrida 20 metros',
    'Caminhada leve (terreno plano)': 'técnica de caminhada rápida postura',
  };
  const url = (n) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(Q[n] || n + ' exercício como fazer');
  const btn = (n) => `<a class="btn ghost small vid" target="_blank" rel="noopener" href="${url(n)}">▶ Ver vídeo</a>`;

  function decorar() {
    document.querySelectorAll('.card.ex').forEach((c) => {
      if (c.querySelector('.vid')) return;
      const n = c.querySelector('h3')?.textContent.trim(); if (!n) return;
      const sets = c.querySelector('.sets'); if (sets) sets.insertAdjacentHTML('beforeend', btn(n));
    });
    const view = document.getElementById('view');
    if (document.body.dataset.rota === 'dicas' && view && !document.getElementById('bib-vid')) {
      view.insertAdjacentHTML('beforeend', `<div class="card" id="bib-vid"><h3>🎬 Vídeos de todos os exercícios</h3>
        <p class="muted small">Abre no YouTube uma busca pelo exercício. Escolha vídeos de educador físico ou fisioterapeuta e compare com as dicas do app.</p>
        <ul class="hist">${Object.keys(Q).map((n) => `<li><div>${n}</div><a class="link" target="_blank" rel="noopener" href="${url(n)}">▶ vídeo</a></li>`).join('')}</ul></div>`);
    }
  }
  new MutationObserver(decorar).observe(document.getElementById('view') || document.body, { childList: true, subtree: false });
  window.addEventListener('hashchange', () => setTimeout(decorar, 50));
  setTimeout(decorar, 300);
})();
