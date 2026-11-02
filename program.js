// Base de conhecimento do treino: corrida, força, mobilidade, regras de dor.
// Toda progressão é por NÍVEL (sessões concluídas sem dor), não por calendário:
// se a semana falhar, o nível se repete. Nada de saltos de volume.

export const SEG = {
  aq:  { nome: 'Aquecimento (caminhada)', cor: '#64748b', voz: 'Aquecimento. Caminhe em ritmo confortável.' },
  cam: { nome: 'Caminhada rápida',        cor: '#0ea5e9', voz: 'Caminhada rápida.' },
  tro: { nome: 'Trote leve',              cor: '#22c55e', voz: 'Trote leve. Passos curtos e rápidos.' },
  cor: { nome: 'Corrida leve',            cor: '#16a34a', voz: 'Corrida leve. Você deve conseguir conversar.' },
  rit: { nome: 'Ritmo de prova (5:00/km)',cor: '#f97316', voz: 'Ritmo de prova. Cinco minutos por quilômetro.' },
  rec: { nome: 'Recuperação caminhando',  cor: '#0ea5e9', voz: 'Recuperação. Caminhe.' },
  des: { nome: 'Desaquecimento',          cor: '#64748b', voz: 'Desaquecimento. Caminhe devagar.' },
};

const m = (n) => n * 60;
const rep = (n, ...pares) => {
  const out = [];
  for (let i = 0; i < n; i++) for (const p of pares) out.push(p);
  return out;
};
const sess = (titulo, nucleo, extra = {}) => ({
  titulo,
  segs: [['aq', m(5)], ...nucleo, ['des', m(5)]],
  ...extra,
});

// 20 níveis de corrida. Cada nível = 3 sessões (A, B, C). Avança após 3 sessões sem dor > 2.
export const RUN_LEVELS = [
  { fase: 'Fase 1 · Adaptação', nota: 'Só caminhada. Prepara tendões e articulações depois de 4 anos parado.',
    s: [sess('Caminhada rápida 20 min', [['cam', m(20)]]), sess('Caminhada rápida 20 min', [['cam', m(20)]]), sess('Caminhada rápida 25 min', [['cam', m(25)]])] },
  { fase: 'Fase 1 · Adaptação', nota: 'Primeiros trotes de 1 minuto, sempre seguidos de caminhada.',
    s: [sess('8 × (1 trote / 2 caminhada)', rep(8, ['tro', m(1)], ['cam', m(2)])), sess('8 × (1 trote / 2 caminhada)', rep(8, ['tro', m(1)], ['cam', m(2)])), sess('Caminhada rápida 25 min', [['cam', m(25)]])] },
  { fase: 'Fase 1 · Adaptação', nota: 'Trote e caminhada no mesmo tempo.',
    s: [sess('7 × (2 trote / 2 caminhada)', rep(7, ['tro', m(2)], ['cam', m(2)])), sess('7 × (2 trote / 2 caminhada)', rep(7, ['tro', m(2)], ['cam', m(2)])), sess('8 × (1 trote / 2 caminhada)', rep(8, ['tro', m(1)], ['cam', m(2)]))] },
  { fase: 'Fase 1 · Semana leve', nota: 'Semana de alívio: menos volume para consolidar.',
    s: [sess('5 × (2 trote / 2 caminhada)', rep(5, ['tro', m(2)], ['cam', m(2)])), sess('Caminhada rápida 20 min', [['cam', m(20)]]), sess('5 × (2 trote / 2 caminhada)', rep(5, ['tro', m(2)], ['cam', m(2)]))] },
  { fase: 'Fase 2 · Trote', nota: 'Blocos de trote ficam maiores; a caminhada encurta.',
    s: [sess('6 × (3 trote / 1:30 caminhada)', rep(6, ['tro', m(3)], ['cam', 90])), sess('6 × (3 trote / 1:30 caminhada)', rep(6, ['tro', m(3)], ['cam', 90])), sess('7 × (2 trote / 2 caminhada)', rep(7, ['tro', m(2)], ['cam', m(2)]))] },
  { fase: 'Fase 2 · Trote', nota: '',
    s: [sess('5 × (4 trote / 1:30 caminhada)', rep(5, ['tro', m(4)], ['cam', 90])), sess('5 × (4 trote / 1:30 caminhada)', rep(5, ['tro', m(4)], ['cam', 90])), sess('6 × (3 trote / 1:30 caminhada)', rep(6, ['tro', m(3)], ['cam', 90]))] },
  { fase: 'Fase 2 · Trote', nota: '',
    s: [sess('4 × (5 trote / 1:30 caminhada)', rep(4, ['tro', m(5)], ['cam', 90])), sess('4 × (5 trote / 1:30 caminhada)', rep(4, ['tro', m(5)], ['cam', 90])), sess('5 × (4 trote / 1:30 caminhada)', rep(5, ['tro', m(4)], ['cam', 90]))] },
  { fase: 'Fase 2 · Semana leve', nota: 'Alívio antes dos trotes contínuos.',
    s: [sess('3 × (5 trote / 2 caminhada)', rep(3, ['tro', m(5)], ['cam', m(2)])), sess('Caminhada rápida 25 min', [['cam', m(25)]]), sess('3 × (5 trote / 2 caminhada)', rep(3, ['tro', m(5)], ['cam', m(2)]))] },
  { fase: 'Fase 2 · Trote', nota: '',
    s: [sess('3 × (7 trote / 1:30 caminhada)', rep(3, ['tro', m(7)], ['cam', 90])), sess('3 × (7 trote / 1:30 caminhada)', rep(3, ['tro', m(7)], ['cam', 90])), sess('4 × (5 trote / 1:30 caminhada)', rep(4, ['tro', m(5)], ['cam', 90]))] },
  { fase: 'Fase 2 · Trote', nota: '',
    s: [sess('2 × (10 trote / 1:30 caminhada)', rep(2, ['tro', m(10)], ['cam', 90])), sess('2 × (10 trote / 1:30 caminhada)', rep(2, ['tro', m(10)], ['cam', 90])), sess('3 × (7 trote / 1:30 caminhada)', rep(3, ['tro', m(7)], ['cam', 90]))] },
  { fase: 'Fase 3 · Contínuo', nota: 'Primeiro trote contínuo. Ritmo de conversa.',
    s: [sess('Trote contínuo 15 min', [['tro', m(15)]]), sess('Trote contínuo 18 min', [['tro', m(18)]]), sess('2 × (10 trote / 1:30 caminhada)', rep(2, ['tro', m(10)], ['cam', 90]))] },
  { fase: 'Fase 3 · Semana leve', nota: '',
    s: [sess('Trote contínuo 15 min', [['tro', m(15)]]), sess('Caminhada rápida 25 min', [['cam', m(25)]]), sess('Trote contínuo 15 min', [['tro', m(15)]])] },
  { fase: 'Fase 3 · Contínuo', nota: 'Corrida leve contínua.',
    s: [sess('Corrida leve 20 min', [['cor', m(20)]]), sess('Corrida leve 20 min', [['cor', m(20)]]), sess('Corrida leve 22 min', [['cor', m(22)]])] },
  { fase: 'Fase 4 · Específico', nota: 'Primeiros estímulos no ritmo de prova: curtos e com recuperação longa. Prefira terra/grama.',
    s: [sess('Corrida leve 20 min', [['cor', m(20)]]), sess('6 × (1 ritmo de prova / 2 caminhada)', [['cor', m(5)], ...rep(6, ['rit', m(1)], ['rec', m(2)])]), sess('Corrida leve 22 min', [['cor', m(22)]])] },
  { fase: 'Fase 4 · Específico', nota: '≈ 400 m em ritmo de prova (2 min).',
    s: [sess('Corrida leve 25 min', [['cor', m(25)]]), sess('5 × (2 ritmo de prova / 2 caminhada)', [['cor', m(5)], ...rep(5, ['rit', m(2)], ['rec', m(2)])]), sess('Corrida leve 25 min', [['cor', m(25)]])] },
  { fase: 'Fase 4 · Semana leve + teste', nota: 'Primeiro simulado de 12 minutos (só se o check-in estiver verde).',
    s: [sess('Corrida leve 20 min', [['cor', m(20)]]), sess('4 × (2 ritmo de prova / 2 caminhada)', [['cor', m(5)], ...rep(4, ['rit', m(2)], ['rec', m(2)])]), { titulo: 'SIMULADO 12 minutos', simulado: true, segs: [['aq', m(5)], ['cor', m(5)], ['rit', m(12)], ['des', m(5)]] }] },
  { fase: 'Fase 4 · Específico', nota: '',
    s: [sess('Corrida leve 25 min', [['cor', m(25)]]), sess('7 × (2 ritmo de prova / 1:30 caminhada)', [['cor', m(5)], ...rep(7, ['rit', m(2)], ['rec', 90])]), sess('3 × (4 ritmo de prova / 2 caminhada)', [['cor', m(5)], ...rep(3, ['rit', m(4)], ['rec', m(2)])])] },
  { fase: 'Fase 4 · Específico', nota: '',
    s: [sess('Corrida leve 30 min', [['cor', m(30)]]), sess('5 × (3 ritmo de prova / 1:30 caminhada)', [['cor', m(5)], ...rep(5, ['rit', m(3)], ['rec', 90])]), sess('2 × (6 ritmo de prova / 3 caminhada)', [['cor', m(5)], ...rep(2, ['rit', m(6)], ['rec', m(3)])])] },
  { fase: 'Fase 5 · Prova', nota: 'Simulado a cada 2 semanas.',
    s: [sess('Corrida leve 30 min', [['cor', m(30)]]), sess('6 × (3 ritmo de prova / 1:30 caminhada)', [['cor', m(5)], ...rep(6, ['rit', m(3)], ['rec', 90])]), { titulo: 'SIMULADO 12 minutos', simulado: true, segs: [['aq', m(5)], ['cor', m(5)], ['rit', m(12)], ['des', m(5)]] }] },
  { fase: 'Fase 5 · Manutenção', nota: 'Nível final: mantenha até o TAF, alternando com o nível anterior.',
    s: [sess('Corrida leve 30 min', [['cor', m(30)]]), sess('2 × (6 ritmo de prova / 3 caminhada)', [['cor', m(5)], ...rep(2, ['rit', m(6)], ['rec', m(3)])]), sess('Corrida leve 25 min + 4 × 1 min ritmo', [['cor', m(25)], ...rep(4, ['rit', m(1)], ['rec', m(1)])])] },
];

export const TAPER_RUN = sess('Polimento: 15 leve + 4 × 1 min ritmo', [['cor', m(15)], ...rep(4, ['rit', m(1)], ['rec', m(2)])]);

// ---------- Exercícios ----------
// tipo: 'reps' | 'tempo'  · lado: true = por lado
export const EX = {
  remada_elastico: { nome: 'Remada com elástico', tipo: 'reps', dica: 'Elástico preso na altura do peito. Puxe levando os cotovelos para trás e junte as escápulas. Sem dor no ombro.', alt: 'Sem elástico: remada curvada com mochila carregada, coluna neutra.' },
  rot_externa: { nome: 'Rotação externa com elástico', tipo: 'reps', dica: 'Cotovelo colado ao corpo a 90°, gire o antebraço para fora devagar. Fortalece o manguito rotador.', alt: 'Sem elástico: deitado de lado com garrafa de 500 ml.' },
  retracao_w: { nome: 'Retração escapular em "W"', tipo: 'reps', dica: 'Braços em W, aperte as escápulas para trás e para baixo por 2 s.' },
  hang_parcial: { nome: 'Suspensão com pés apoiados', tipo: 'tempo', dica: 'Segure a barra com os pés no chão/banco aliviando parte do peso. Ombros longe das orelhas.' },
  dead_hang: { nome: 'Suspensão na barra (dead hang)', tipo: 'tempo', dica: 'Pendurado, braços estendidos, escápulas levemente ativas. Desça com apoio, nunca soltando de uma vez.' },
  ativ_escap: { nome: 'Ativação escapular na barra', tipo: 'reps', dica: 'Pendurado, sem dobrar os cotovelos, desça os ombros (afaste das orelhas) e volte. Movimento pequeno.' },
  remada_aus: { nome: 'Remada australiana (barra baixa)', tipo: 'reps', dica: 'Barra na altura da cintura, corpo inclinado e reto, puxe o peito até a barra. Quanto mais em pé, mais fácil.', alt: 'Sem barra baixa: remada com elástico pesado.' },
  iso_topo: { nome: 'Isometria no topo da barra', tipo: 'tempo', dica: 'Suba com ajuda de um banco até o queixo passar a barra e segure. É o mesmo teste feminino do edital.' },
  negativa: { nome: 'Barra negativa (descida de 5 s)', tipo: 'reps', dica: 'Suba com o banco e desça contando 5 segundos até estender os braços. Só se o ombro estiver sem dor. Descanse 2 min entre séries.' },
  barra_band: { nome: 'Barra assistida com superband', tipo: 'reps', dica: 'Elástico preso na barra e no pé/joelho. Amplitude completa, sem balanço.' },
  barra_livre: { nome: 'Barra fixa livre (padrão do edital)', tipo: 'reps', dica: 'Pegada pronada, sem balanço, sem impulso de salto, queixo acima da barra, extensão total na descida. Pare antes da falha.' },
  barra_escada: { nome: 'Escada na barra (1-2-3)', tipo: 'reps', dica: '1 repetição, descansa; 2, descansa; 3. Repita a escada se a técnica estiver perfeita.' },

  dead_bug: { nome: 'Dead bug', tipo: 'reps', lado: true, dica: 'Deitado, lombar colada no chão, estenda braço e perna opostos devagar.' },
  prancha: { nome: 'Prancha', tipo: 'tempo', dica: 'Antebraços no chão, glúteos contraídos, sem afundar a lombar. Pode apoiar os joelhos no início.' },
  prancha_lat: { nome: 'Prancha lateral', tipo: 'tempo', lado: true, dica: 'Apoio no antebraço, quadril alto. Pode apoiar o joelho de baixo.' },
  bird_dog: { nome: 'Perdigueiro (bird dog)', tipo: 'reps', lado: true, dica: 'Quatro apoios, estenda braço e perna opostos e segure 2 s. Protege a lombar.' },
  ponte: { nome: 'Ponte de glúteo', tipo: 'reps', dica: 'Suba o quadril apertando os glúteos, segure 2 s no alto.' },
  crunch: { nome: 'Abdominal parcial (crunch)', tipo: 'reps', dica: 'Suba só até as escápulas saírem do chão. Queixo longe do peito.' },
  abd_edital: { nome: 'Abdominal completo (técnica do edital)', tipo: 'reps', dica: 'Pés presos (alguém segura ou sob um móvel), braços cruzados no peito, suba até tocar os cotovelos nas coxas e desça até as escápulas tocarem o chão.' },
  abd_30: { nome: 'Abdominal do edital: máximo em 30 s', tipo: 'reps', dica: 'Ritmo constante e técnica válida. Anote quantas fez.' },
  superman: { nome: 'Superman', tipo: 'reps', dica: 'Deitado de bruços, eleve braços e pernas levemente e segure 2 s.' },

  ostra: { nome: 'Ostra (clamshell)', tipo: 'reps', lado: true, dica: 'Deitado de lado, joelhos dobrados, abra o joelho de cima sem girar o quadril. Fortalece o glúteo médio, que estabiliza o joelho.' },
  abducao: { nome: 'Abdução de quadril deitado', tipo: 'reps', lado: true, dica: 'Deitado de lado, perna de cima reta, suba até 30-40° com o pé neutro.' },
  sentar_levantar: { nome: 'Sentar e levantar da cadeira', tipo: 'reps', dica: 'Joelhos alinhados com os pés, sem deixar o joelho entrar. Desça em 3 s.' },
  panturrilha: { nome: 'Elevação de panturrilha', tipo: 'reps', dica: 'Suba na ponta dos pés e desça em 3 s. Absorve impacto na corrida.' },
  wall_sit: { nome: 'Isometria na parede (cadeirinha)', tipo: 'tempo', dica: 'Costas na parede, joelhos a ~60° (não desça até 90°). Isometria costuma aliviar dor no joelho; pare se piorar.' },
  agach_caixa: { nome: 'Agachamento na caixa/cadeira', tipo: 'reps', dica: 'Encoste o glúteo na cadeira e suba. Peso nos calcanhares e no meio do pé.' },
  ponte_uni: { nome: 'Ponte de glúteo unilateral', tipo: 'reps', lado: true, dica: 'Uma perna estendida, suba com a outra.' },
  step_up: { nome: 'Subida no degrau baixo', tipo: 'reps', lado: true, dica: 'Degrau de 15-20 cm. Joelho alinhado com o 2º dedo do pé.' },
  panturrilha_uni: { nome: 'Panturrilha unilateral', tipo: 'reps', lado: true, dica: 'Apoie a mão na parede, uma perna de cada vez.' },
  step_down: { nome: 'Descida controlada do degrau', tipo: 'reps', lado: true, dica: 'Em pé no degrau, desça o calcanhar da outra perna até tocar o chão em 3 s. Controle o joelho.' },
  afundo: { nome: 'Afundo estático curto', tipo: 'reps', lado: true, dica: 'Passada curta, desça só até onde não houver dor, tronco reto.' },

  flex_parede: { nome: 'Flexão na parede', tipo: 'reps', dica: 'Mãos na parede na altura do peito, corpo reto como prancha. Desça o peito até perto da parede e empurre. Sem dor no ombro.' },
  flex_inclinada: { nome: 'Flexão inclinada (mesa ou bancada)', tipo: 'reps', dica: 'Mãos numa superfície firme na altura do quadril. Quanto mais baixa a superfície, mais difícil. Cotovelos a 45° do corpo, não abertos.' },
  flex_joelhos: { nome: 'Flexão com joelhos apoiados', tipo: 'reps', dica: 'Joelhos no chão, corpo reto do joelho à cabeça. Peito desce até quase tocar o solo.' },
  flex_negativa: { nome: 'Flexão negativa (descida de 4 s)', tipo: 'reps', dica: 'Posição de flexão completa, desça em 4 s até o peito tocar o chão, apoie os joelhos para subir e repita.' },
  flexao: { nome: 'Flexão de braço completa', tipo: 'reps', dica: 'Corpo reto, mãos um pouco além da largura dos ombros, peito desce até a altura exigida no edital e sobe com braços estendidos. Pare antes da falha.' },
  prancha_alta: { nome: 'Prancha alta (braços estendidos)', tipo: 'tempo', dica: 'Posição de flexão parada, glúteo contraído. Fortalece ombro e core para a flexão.' },
  pulo_corda: { nome: 'Saltitos baixos (pular corda, real ou imaginária)', tipo: 'tempo', dica: 'Saltos bem baixos na ponta dos pés, aterrissando macio. Prepara tendões para impacto. Pare se o joelho doer.' },
  salto_sub: { nome: 'Salto horizontal submáximo', tipo: 'reps', dica: 'Salto à frente com os dois pés a 60-70% da força, braços ajudando, aterrissagem macia com joelhos flexionados e alinhados. Descanse 1 min.' },
  salto_imp: { nome: 'Impulsão horizontal (técnica de prova)', tipo: 'reps', dica: 'Pés paralelos atrás da linha, balanço de braços, projeção a 45° e queda amortecida sem rolar para trás. Meça o melhor salto.' },
  mudanca_dir: { nome: 'Mudança de direção (técnica do shuttle)', tipo: 'reps', dica: 'Trote 9 m, abaixe o quadril, apoie a mão no chão e volte. Comece devagar: é a técnica de parar e voltar que economiza tempo.' },
  acelera: { nome: 'Acelerações curtas (20 m)', tipo: 'reps', dica: 'Acelere até 80% da velocidade em 20 m e volte caminhando. Só em piso plano e com aquecimento completo.' },
  mob_tornozelo: { nome: 'Mobilidade de tornozelo na parede', tipo: 'reps', lado: true, dica: 'Pé a um palmo da parede, leve o joelho até tocar a parede sem tirar o calcanhar do chão.' },
  gato_camelo: { nome: 'Gato-camelo', tipo: 'reps', dica: 'Quatro apoios, arredonde e estenda a coluna devagar.' },
  rot_toracica: { nome: 'Rotação torácica (livro aberto)', tipo: 'reps', lado: true, dica: 'Deitado de lado, joelhos dobrados, abra o braço de cima acompanhando com o olhar.' },
  flexor_quadril: { nome: 'Alongamento de flexor do quadril', tipo: 'tempo', lado: true, dica: 'Ajoelhado em afundo, contraia o glúteo e leve o quadril à frente.' },
  pendulo: { nome: 'Pêndulo de ombro', tipo: 'tempo', dica: 'Inclinado à frente, deixe o braço solto e faça pequenos círculos. Alivia o ombro.' },
  iso_rot_ext: { nome: 'Rotação externa isométrica na parede', tipo: 'tempo', dica: 'Cotovelo a 90°, empurre o dorso da mão contra a parede com força leve (30%). Sem dor.' },
  caminhada_leve: { nome: 'Caminhada leve (terreno plano)', tipo: 'tempo', dica: 'Ritmo confortável, só se não aumentar a dor.' },
  respiracao: { nome: 'Respiração diafragmática', tipo: 'tempo', dica: 'Deitado, inspire pelo nariz expandindo o abdômen, solte devagar.' },
};

const e = (id, series, alvo, extra = {}) => ({ id, series, alvo, ...extra }); // alvo = reps ou segundos

export const STRENGTH_TRACKS = {
  barra: {
    nome: 'Barra (costas e ombros)', regiao: 'ombro',
    levels: [
      { nome: 'B1 · Base do ombro', ex: [e('remada_elastico', 3, 12), e('rot_externa', 2, 15), e('retracao_w', 2, 12), e('hang_parcial', 3, 15)], sessoes: 6, gate: null, criterio: '6 sessões sem dor no ombro (≤ 2).' },
      { nome: 'B2 · Adaptação na barra', ex: [e('dead_hang', 3, 20), e('ativ_escap', 3, 5), e('remada_aus', 3, 8), e('rot_externa', 2, 15)], sessoes: 4, gate: { teste: 'hang', min: 30, txt: 'Dead hang de 30 s registrado em Testes' }, criterio: '4 sessões sem dor + dead hang de 30 s.' },
      { nome: 'B3 · Força de tração', ex: [e('dead_hang', 3, 30), e('ativ_escap', 3, 8), e('remada_aus', 3, 10), e('iso_topo', 3, 5)], sessoes: 4, gate: { teste: 'iso', min: 10, txt: 'Isometria no topo de 10 s registrada em Testes' }, criterio: '4 sessões sem dor + isometria no topo de 10 s.' },
      { nome: 'B4 · Negativas', ex: [e('negativa', 3, 3), e('iso_topo', 3, 10), e('remada_aus', 3, 12), e('rot_externa', 2, 15)], sessoes: 4, gate: null, criterio: '4 sessões sem dor no ombro.' },
      { nome: 'B5 · Barra assistida', ex: [e('barra_band', 4, 5), e('negativa', 3, 3), e('dead_hang', 2, 40), e('rot_externa', 2, 15)], sessoes: 4, gate: { teste: 'barra', min: 1, txt: '1 barra livre registrada em Testes' }, criterio: '4 sessões sem dor + 1 barra livre válida.' },
      { nome: 'B6 · Barra livre', ex: [e('barra_livre', 5, 1), e('barra_band', 2, 5), e('negativa', 2, 3), e('rot_externa', 2, 15)], sessoes: 4, gate: { teste: 'barra', min: 3, txt: '3 barras livres (mínimo do edital) registradas em Testes' }, criterio: '4 sessões sem dor + 3 barras livres.' },
      { nome: 'B7 · Margem de segurança', ex: [e('barra_escada', 3, 6), e('barra_livre', 2, 2), e('negativa', 2, 3), e('rot_externa', 2, 15)], sessoes: 999, gate: null, criterio: 'Nível final: busque sua meta com folga sobre o edital.' },
    ],
  },
  core: {
    nome: 'Abdominal e lombar', regiao: null,
    levels: [
      { nome: 'C1 · Estabilidade', ex: [e('dead_bug', 3, 8), e('prancha', 3, 20), e('ponte', 3, 12), e('bird_dog', 2, 8)], sessoes: 4, gate: null, criterio: '4 sessões.' },
      { nome: 'C2 · Resistência', ex: [e('prancha', 3, 30), e('prancha_lat', 2, 20), e('crunch', 3, 12), e('ponte', 3, 15)], sessoes: 4, gate: null, criterio: '4 sessões.' },
      { nome: 'C3 · Técnica do edital', ex: [e('abd_edital', 3, 10), e('prancha', 3, 40), e('superman', 2, 10), e('bird_dog', 2, 10)], sessoes: 4, gate: null, criterio: '4 sessões.' },
      { nome: 'C4 · Velocidade', ex: [e('abd_30', 2, 12), e('abd_edital', 3, 12), e('prancha', 2, 45), e('superman', 2, 12)], sessoes: 6, gate: { teste: 'abd', min: 15, txt: 'Abdominal 60 s com o mínimo do edital' }, criterio: '6 sessões + mínimo do edital no teste de 60 s.' },
      { nome: 'C5 · Margem de segurança', ex: [e('abd_30', 3, 15), e('abd_edital', 3, 15), e('prancha', 2, 60), e('superman', 2, 12)], sessoes: 999, gate: null, criterio: 'Nível final: teste de 60 s a cada 2 semanas.' },
    ],
  },
  pernas: {
    nome: 'Pernas e glúteos (proteção do joelho)', regiao: 'joelho',
    levels: [
      { nome: 'P1 · Base do joelho', ex: [e('ostra', 2, 15), e('abducao', 2, 12), e('sentar_levantar', 3, 10), e('panturrilha', 3, 15), e('wall_sit', 3, 20)], sessoes: 6, gate: null, criterio: '6 sessões sem dor no joelho (≤ 2).' },
      { nome: 'P2 · Força', ex: [e('agach_caixa', 3, 12), e('ponte_uni', 3, 8), e('step_up', 3, 8), e('panturrilha_uni', 3, 12), e('wall_sit', 3, 30)], sessoes: 6, gate: null, criterio: '6 sessões sem dor no joelho.' },
      { nome: 'P3 · Controle', ex: [e('step_down', 3, 8), e('afundo', 3, 8), e('agach_caixa', 3, 15), e('panturrilha_uni', 3, 15), e('ostra', 2, 20)], sessoes: 999, gate: null, criterio: 'Nível final.' },
    ],
  },
};

STRENGTH_TRACKS.flexao = {
  nome: 'Flexão de braço (peito e ombros)', regiao: 'ombro',
  levels: [
    { nome: 'F1 · Base', ex: [e('flex_parede', 3, 12), e('flex_inclinada', 3, 8), e('prancha_alta', 3, 20)], sessoes: 4, gate: null, criterio: '4 sessões sem dor no ombro.' },
    { nome: 'F2 · Inclinada baixa', ex: [e('flex_inclinada', 4, 10), e('flex_joelhos', 3, 8), e('prancha_alta', 3, 30)], sessoes: 4, gate: null, criterio: '4 sessões sem dor no ombro.' },
    { nome: 'F3 · Negativas', ex: [e('flex_joelhos', 3, 12), e('flex_negativa', 3, 5), e('prancha_alta', 3, 40)], sessoes: 4, gate: { teste: 'flexao', min: 5, txt: '5 flexões completas registradas em Testes' }, criterio: '4 sessões sem dor + 5 flexões completas.' },
    { nome: 'F4 · Completa', ex: [e('flexao', 5, 5), e('flex_negativa', 2, 5), e('flex_joelhos', 2, 12)], sessoes: 6, gate: { teste: 'flexao', min: 20, txt: 'Flexão com o mínimo do edital registrada em Testes' }, criterio: '6 sessões + mínimo do edital.' },
    { nome: 'F5 · Margem de segurança', ex: [e('flexao', 4, 12), e('flex_negativa', 2, 6), e('prancha_alta', 2, 45)], sessoes: 999, gate: null, criterio: 'Nível final: teste a cada 2 semanas.' },
  ],
};
// Potência (impulsão, shuttle): só depois da fase de corrida contínua, por causa dos joelhos.
STRENGTH_TRACKS.potencia = {
  nome: 'Potência (impulsão e shuttle)', regiao: 'joelho', liberaNivelCorrida: 12,
  levels: [
    { nome: 'X1 · Preparação', ex: [e('pulo_corda', 4, 30), e('salto_sub', 3, 3), e('mudanca_dir', 4, 2)], sessoes: 4, gate: null, criterio: '4 sessões sem dor no joelho.' },
    { nome: 'X2 · Técnica de prova', ex: [e('salto_imp', 4, 3), e('mudanca_dir', 5, 2), e('acelera', 4, 1)], sessoes: 6, gate: null, criterio: '6 sessões sem dor no joelho.' },
    { nome: 'X3 · Específico', ex: [e('salto_imp', 5, 2), e('mudanca_dir', 6, 2), e('acelera', 6, 1)], sessoes: 999, gate: null, criterio: 'Nível final: meça a impulsão e o shuttle a cada 2 semanas.' },
  ],
};

export const MOBILIDADE = [e('mob_tornozelo', 2, 10), e('gato_camelo', 1, 10), e('rot_toracica', 2, 8), e('flexor_quadril', 2, 30), e('ponte', 2, 12), e('caminhada_leve', 1, 1200)];
export const REGEN_JOELHO = [e('wall_sit', 5, 30), e('ostra', 2, 12), e('ponte', 2, 12), e('mob_tornozelo', 2, 10), e('respiracao', 1, 180)];
export const REGEN_OMBRO = [e('pendulo', 2, 45), e('iso_rot_ext', 4, 30), e('retracao_w', 2, 10), e('rot_toracica', 2, 8), e('respiracao', 1, 180)];
export const REGEN_GERAL = [e('respiracao', 1, 300), e('gato_camelo', 1, 10), e('rot_toracica', 2, 8), e('mob_tornozelo', 2, 10)];

export const AQUECIMENTO_CORRIDA = [
  '5 min de caminhada (já incluída no treino guiado).',
  'Mobilidade de tornozelo: 10 por lado.',
  'Elevação de joelhos caminhando: 2 × 20 m.',
  'Calcanhar ao glúteo caminhando: 2 × 20 m.',
  'Panturrilha: 15 elevações.',
];

// Semana fixa: 3 corridas, 2 forças, 1 mobilidade, 1 descanso. Domingo = 0.
export const SEMANA = {
  0: { tipo: 'descanso', titulo: 'Descanso' },
  1: { tipo: 'run', idx: 0, titulo: 'Corrida A' },
  2: { tipo: 'forca', idx: 0, titulo: 'Força A' },
  3: { tipo: 'mobilidade', titulo: 'Mobilidade + caminhada leve' },
  4: { tipo: 'run', idx: 1, titulo: 'Corrida B' },
  5: { tipo: 'forca', idx: 1, titulo: 'Força B' },
  6: { tipo: 'run', idx: 2, titulo: 'Corrida C' },
};

// Classificação da dor (0 a 10) e da resposta do app.
export function statusDor(ci) {
  if (!ci) return null;
  const max = Math.max(ci.joelho || 0, ci.ombro || 0);
  if (ci.alerta || max >= 7) return { nivel: 'vermelho', txt: 'Descanso. Se houver inchaço, travamento, dor que acorda à noite ou que não melhora em 48 h, procure ortopedista ou fisioterapeuta.' };
  if (max >= 5) return { nivel: 'laranja', txt: 'Treino regenerativo hoje: nada de impacto ou carga na região com dor.' };
  if (max >= 3) return { nivel: 'amarelo', txt: 'Treino adaptado: volume reduzido e sem estímulos fortes na região com dor.' };
  return { nivel: 'verde', txt: 'Tudo certo para o treino do dia.' };
}

export const SINAIS_ALERTA = [
  'Inchaço visível no joelho ou ombro',
  'Travamento ou sensação de falseio',
  'Dor que acorda você à noite',
  'Formigamento ou perda de força no braço',
];

export const REGRAS_EDITAL = [
  'Barra fixa (masculino): pegada livre, sem balanço, sem impulso de salto na 1ª repetição, sem luvas ou magnésio, sem apoiar o queixo na barra. Só conta a repetição completa.',
  'Isometria (feminino): o tempo começa quando os pés saem do apoio e para quando o queixo desce ao nível da barra.',
  'Abdominal em 60 s: pés seguros pelo avaliador, mãos cruzadas no peito, escápulas tocam o solo a cada repetição.',
  'Corrida de 12 min: pode caminhar, mas não pode parar.',
  'Uma única tentativa por teste; não há segunda chamada.',
  'Atestado médico original ou autenticado, específico para o TAF/exercício físico, emitido até 30 dias antes da prova.',
  'Chegar 30 minutos antes, com documento com foto e roupa esportiva.',
];
