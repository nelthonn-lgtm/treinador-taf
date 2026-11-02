// Catálogo de provas e de editais. Índices conferidos nas fontes citadas em cada concurso.
// "maior": true = quanto mais, melhor (reps, metros); false = quanto menos, melhor (tempo).
export const TIPOS = {
  run12: { nome: 'Corrida 12 min', un: 'm', maior: true, dec: 0 },
  barra: { nome: 'Barra fixa (dinâmica)', un: 'reps', maior: true, dec: 0 },
  iso: { nome: 'Barra estática (isometria)', un: 's', maior: true, dec: 0 },
  abd: { nome: 'Abdominal em 1 min', un: 'reps', maior: true, dec: 0 },
  flexao: { nome: 'Flexão de braço no solo', un: 'reps', maior: true, dec: 0 },
  impulsao: { nome: 'Impulsão horizontal', un: 'm', maior: true, dec: 2 },
  shuttle: { nome: 'Shuttle run (vai e vem)', un: 's', maior: false, dec: 2 },
  natacao50: { nome: 'Natação 50 m', un: 's', maior: false, dec: 1 },
  hang: { nome: 'Suspensão (dead hang)', un: 's', maior: true, dec: 0, treino: true },
};

export const CONCURSOS = {
  pprn: {
    nome: 'Polícia Penal RN 2026 (Policial Penal)', curto: 'PPRN 2026', banca: 'Instituto Avalia',
    fonte: 'Edital PPRN 2026, item 14 (DOE/RN de 18/06/2026)',
    M: { barra: 3, abd: 15, run12: 2000 }, F: { iso: 5, abd: 10, run12: 1600 },
    regras: [
      'Barra (masc.): sem balanço, sem impulso de salto na 1ª repetição, sem luvas ou magnésio, sem apoiar o queixo na barra. Só conta a repetição completa.',
      'Isometria (fem.): o tempo começa quando os pés saem do apoio e para quando o queixo desce ao nível da barra.',
      'Abdominal em 60 s: pés seguros pelo avaliador, mãos cruzadas no peito, escápulas tocam o solo a cada repetição.',
      'Corrida de 12 min: pode caminhar, mas não pode parar.',
      'Uma única tentativa por teste; reprovar em um teste elimina.',
      'Atestado médico específico para o TAF, emitido até 30 dias antes. Chegar 30 min antes, com documento com foto.',
    ],
  },
  pcrn: {
    nome: 'Polícia Civil RN (Agente e Delegado, FGV)', curto: 'PC-RN', banca: 'FGV',
    fonte: 'Edital de convocação para o TAF da PC-RN (FGV, atualizado em 29/11/2021), Anexo I',
    M: { barra: 5, impulsao: 1.8, abd: 35, run12: 2100 }, F: { iso: 15, impulsao: 1.4, abd: 26, run12: 1600 },
    regras: [
      'Barra (masc.): parte com cotovelos estendidos, sobe até o queixo passar a barra; sem toque no solo, ajuda, luvas ou apoio do queixo.',
      'Isometria (fem.): o cronômetro para quando o queixo desce abaixo da barra ou toca nela.',
      'Impulsão: salto à frente com os dois pés em caixa de areia; não pode perder contato com o solo antes do salto, tocar a linha ou rolar.',
      'Abdominal em 1 min, contado pelo auxiliar da banca; só conta a repetição completa.',
      'Corrida de 12 min: pode caminhar; não pode sair da pista antes de liberado.',
      'Uma tentativa por teste; precisa atingir o mínimo em todos.',
      'Atestado médico declarando aptidão sem restrição, emitido até 15 dias antes. Chegar 40 min antes.',
    ],
  },
  prf: {
    nome: 'PRF (Policial Rodoviário Federal, Cebraspe 2021)', curto: 'PRF', banca: 'Cebraspe',
    fonte: 'Edital nº 1 PRF 2021 (Cebraspe), Anexo III; índices de nota mínima 2,0',
    M: { barra: 3, shuttle: 13.99, impulsao: 2.01, abd: 35, run12: 2301 }, F: { iso: 10, shuttle: 15.99, impulsao: 1.61, abd: 28, run12: 2001 },
    obs: 'Na PRF cada teste vale de 0 a 5. Os índices acima são o mínimo de nota 2,0 em cada teste, mas a média dos 5 testes precisa ser no mínimo 3,0: treine acima do mínimo.',
    regras: [
      'Barra (masc.): sem ajuda, luvas, apoio do queixo, "pedalada" ou chute. Isometria (fem.): sem flexionar quadril ou joelhos e sem tocar o solo.',
      'Shuttle run: colocar (não jogar) o bloco no solo; largar só após o apito.',
      'Impulsão: sem perder contato com o solo antes do salto, tocar a linha ou rolar após cair.',
      'Corrida de 12 min: não sair da pista nem se deslocar após o fim sem liberação.',
      'Nota mínima 2,0 em cada teste e média mínima 3,0 no conjunto.',
    ],
  },
  pf: {
    nome: 'Polícia Federal 2025 (Cebraspe)', curto: 'PF', banca: 'Cebraspe',
    fonte: 'Edital nº 1 PF 2025 (Cebraspe), conforme divulgado por Profissão Policial e Revista Sociedade Militar',
    M: { barra: 5, impulsao: 2.05, run12: 2300, natacao50: 56 }, F: { iso: 15, impulsao: 1.56, run12: 1800, natacao50: 64 },
    obs: 'A natação de 50 m precisa ser treinada em piscina, de preferência com orientação. O app registra seus tempos.',
    regras: [
      'Barra (masc.) em barra coberta de cerca de 2 polegadas; isometria (fem.) de 15 s.',
      'Impulsão horizontal em caixa de areia, saída de superfície plana.',
      'Corrida de 12 min em pista com marcação a cada 10 m.',
      'Natação 50 m em piscina de 25 m, com bloco de partida.',
      'Os testes são gravados em vídeo; abaixo do mínimo em qualquer prova elimina.',
    ],
  },
  outro: {
    nome: 'Outro concurso (personalizado)', curto: 'Personalizado', banca: '',
    fonte: 'Índices digitados por você a partir do edital',
    M: { barra: 3, abd: 30, run12: 2200 }, F: { iso: 10, abd: 25, run12: 1800 },
    regras: ['Confira no edital do seu concurso a forma de execução de cada prova, o número de tentativas e o prazo do atestado médico.'],
  },
};

const r2 = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
export function metaPadrao(tipo, min) {
  const t = TIPOS[tipo];
  if (tipo === 'run12') return Math.ceil((min * 1.15) / 50) * 50;
  if (!t.maior) return r2(min * 0.93, t.dec);
  if (t.dec) return r2(min * 1.08, t.dec);
  return Math.max(min + 2, Math.ceil(min * 1.4));
}

// Lista das provas do perfil: [{tipo, min, meta}]
export function provas(p) {
  const c = CONCURSOS[p.concurso] || CONCURSOS.pprn;
  const sexo = p.sexo === 'F' ? 'F' : 'M';
  const base = p.concurso === 'outro' && p.indices?.[sexo] && Object.keys(p.indices[sexo]).length ? p.indices[sexo] : { ...c[sexo], ...(p.indices?.[sexo] || {}) };
  return Object.entries(base).filter(([t]) => TIPOS[t]).map(([tipo, min]) => ({ tipo, min: +min, meta: p.metas?.[tipo] ?? metaPadrao(tipo, +min) }));
}
export const temProva = (p, tipo) => provas(p).some((x) => x.tipo === tipo);
export const minimo = (p, tipo, padrao) => provas(p).find((x) => x.tipo === tipo)?.min ?? padrao;
export const meta = (p, tipo, padrao) => provas(p).find((x) => x.tipo === tipo)?.meta ?? padrao;
export const atingiu = (tipo, valor, alvo) => valor !== null && valor !== undefined && (TIPOS[tipo].maior ? valor >= alvo : valor <= alvo);

// Migra perfis antigos (só PPRN, com profile.edital e metas {corrida, barra, abd, iso})
export function normalizar(p) {
  if (!p.concurso) p.concurso = 'pprn';
  if (!p.indices) p.indices = { M: {}, F: {} };
  if (p.metas && 'corrida' in p.metas) {
    const m = p.metas; p.metas = {};
    for (const [de, para] of [['corrida', 'run12'], ['barra', 'barra'], ['abd', 'abd'], ['iso', 'iso']]) if (m[de]) p.metas[para] = m[de];
  }
  if (p.edital) {
    const e = p.edital, d = CONCURSOS.pprn;
    if (e.barra !== undefined && e.barra !== d.M.barra) p.indices.M.barra = e.barra;
    if (e.abd !== undefined && e.abd !== d.M.abd) p.indices.M.abd = e.abd;
    if (e.corrida !== undefined && e.corrida !== d.M.run12) p.indices.M.run12 = e.corrida;
    if (e.iso !== undefined && e.iso !== d.F.iso) p.indices.F.iso = e.iso;
    if (e.abdF !== undefined && e.abdF !== d.F.abd) p.indices.F.abd = e.abdF;
    if (e.corridaF !== undefined && e.corridaF !== d.F.run12) p.indices.F.run12 = e.corridaF;
    delete p.edital;
  }
  if (!p.metas) p.metas = {};
  return p;
}

export function fmtValor(tipo, v) {
  const t = TIPOS[tipo]; if (v === null || v === undefined) return '—';
  return (t.dec ? Number(v).toFixed(t.dec).replace('.', ',') : Math.round(v)) + ' ' + t.un;
}
