// Registros anônimos do app (aparelhos, instalações, cidade opcional) e sugestões dos usuários.
// Tudo vai para um Google Formulário do desenvolvedor. Nunca envia treino, peso, dor, nome ou GPS.
(function () {
  const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSeOc4xsEHWO7PdqpX3gJ6t3dA-d0UYH9-VGQT1rDUUDPhZIcw/formResponse';
  const E = { tipo: 'entry.447516661', cidade: 'entry.564372988', uf: 'entry.1793891250', concurso: 'entry.862926955', versao: 'entry.1573682729', modo: 'entry.1113202775', mensagem: 'entry.1494306158', contato: 'entry.815182519', nome: 'entry.1468400997', interesse: 'entry.1610901043', aceite: 'entry.587729189' };
  const LINK = 'https://nelthonn-lgtm.github.io/treinador-taf/';
  const ACEITE = 'Autorizo o Prof. Josinelton a me enviar mensagens com dicas de TAF e novidades do Treinador TAF. Posso pedir para sair a qualquer momento.';
  const VERSAO = '1.1';
  const K = 'tafpprn.reg';
  const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');

  const ler = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch { return {}; } };
  const gravar = (r) => { try { localStorage.setItem(K, JSON.stringify(r)); } catch {} };
  const instalado = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const concurso = () => { try { return JSON.parse(localStorage.getItem('tafpprn.v1'))?.profile?.concurso || 'pprn'; } catch { return 'pprn'; } };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toast = (t) => { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:90px;background:#0f172a;color:#fff;padding:12px 14px;border-radius:12px;z-index:99;text-align:center'; document.body.appendChild(d); setTimeout(() => d.remove(), 2800); };

  // Fila: se estiver sem internet, guarda e envia depois
  function enviar(dados) {
    const r = ler(); r.fila = r.fila || []; r.fila.push({ ...dados, concurso: concurso(), versao: VERSAO, modo: instalado() ? 'app instalado' : 'navegador' }); gravar(r);
    esvaziar();
  }
  let enviando = false;
  async function esvaziar() {
    if (enviando || !navigator.onLine) return;
    enviando = true;
    try {
      // relê o armazenamento a cada passo: outras partes do app gravam nele enquanto o envio acontece
      for (let f = ler().fila; f && f.length; f = ler().fila) {
        const d = f[0], b = new URLSearchParams();
        for (const [k, id] of Object.entries(E)) if (d[k]) b.append(id, String(d[k]).slice(0, 1500));
        await fetch(FORM, { method: 'POST', mode: 'no-cors', body: b });
        const r = ler(); r.fila.shift(); gravar(r);
      }
    } catch { /* tenta de novo depois */ }
    enviando = false;
  }

  function registrarAparelho() {
    const r = ler();
    if (!r.novo) { r.novo = Date.now(); gravar(r); enviar({ tipo: 'novo aparelho' }); }
    if (instalado() && !ler().inst) { const x = ler(); x.inst = Date.now(); gravar(x); enviar({ tipo: 'instalado' }); }
  }
  window.addEventListener('appinstalled', () => { const r = ler(); if (!r.inst) { r.inst = Date.now(); gravar(r); enviar({ tipo: 'instalado' }); } });
  window.addEventListener('online', esvaziar);

  const selUF = (id) => `<select id="${id}"><option value="">UF</option>${UFS.map((u) => `<option>${u}</option>`).join('')}</select>`;
  const camposCidade = (p) => `<div style="display:flex;gap:8px"><label style="flex:1;margin:4px 0">Cidade<input id="${p}-cid" maxlength="60" placeholder="Ex.: Caicó"></label><label style="width:90px;margin:4px 0">UF${selUF(p + '-uf')}</label></div>`;

  // "caicó " -> "Caicó"; "SAO JOSE DO SERIDO" -> "Sao Jose do Serido" (para contar a mesma cidade junta)
  const nomeCidade = (t) => t.trim().replace(/\s+/g, ' ').toLowerCase().split(' ').map((w, i) => (i && /^(de|da|do|das|dos|e)$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
  function salvarCidade(p) {
    const cid = nomeCidade(document.getElementById(p + '-cid').value), uf = document.getElementById(p + '-uf').value;
    if (cid.length < 2 || !uf) { toast('Escreva a cidade e escolha a UF.'); return false; }
    const r = ler(); r.cidade = cid + '/' + uf; gravar(r);
    enviar({ tipo: 'cidade', cidade: cid, uf });
    toast('Obrigado! Cidade enviada.'); return true;
  }

  // Cartão único na aba Hoje (aparece uma vez; dá para responder depois em Mais)
  function cartaoHoje(view) {
    const r = ler();
    if (r.cidade || r.semCidade || document.getElementById('com-hoje')) return;
    view.insertAdjacentHTML('beforeend', `<div class="card tip" id="com-hoje"><h3 style="margin:0 0 4px">📍 De qual cidade você é?</h3>
      <p class="muted small" style="margin:0 0 6px">Ajuda o criador do app a saber onde ele está sendo usado. É opcional e anônimo: vai só a cidade, sem nome nem dados de treino.</p>
      ${camposCidade('ch')}
      <div style="display:flex;gap:8px;margin-top:6px"><button class="btn small" id="ch-ok" style="flex:1">Enviar</button><button class="btn small ghost" id="ch-no">Agora não</button></div></div>`);
    document.getElementById('ch-ok').onclick = () => { if (salvarCidade('ch')) document.getElementById('com-hoje').remove(); };
    document.getElementById('ch-no').onclick = () => { const x = ler(); x.semCidade = Date.now(); gravar(x); document.getElementById('com-hoje').remove(); };
  }

  // Lista de contatos (com autorização expressa, LGPD) para avisar sobre novidades do app
  const contatoValido = (c) => /@.+\./.test(c) || c.replace(/\D/g, '').length >= 10;
  function cartaoLead(view, onde) {
    const id = 'com-lead-' + onde, r = ler();
    if (document.getElementById(id)) return;
    if (r.lead) {
      if (onde === 'mais') {
        view.insertAdjacentHTML('beforeend', `<div class="card" id="${id}"><h3 style="margin:0 0 4px">📣 Novidades do app</h3><p class="muted small" style="margin:0">✅ Você está na lista de contatos${r.leadNome ? ' como ' + esc(r.leadNome) : ''}. Você vai ser avisado(a) das melhorias do app.</p><button class="btn small ghost" id="${id}-sair" style="margin-top:8px">Sair da lista</button></div>`);
        document.getElementById(id + '-sair').onclick = () => {
          const x = ler(), dados = { tipo: 'descadastro', nome: x.leadNome, contato: x.leadContato }; delete x.lead; delete x.leadNome; delete x.leadContato; x.semLead = Date.now(); gravar(x); enviar(dados);
          toast('Pronto: você saiu da lista.'); document.getElementById(id).remove(); cartaoLead(view, onde);
        };
      }
      return;
    }
    view.insertAdjacentHTML('beforeend', `<div class="card ${onde === 'hoje' ? 'tip' : ''}" id="${id}"><h3 style="margin:0 0 4px">📣 Quer saber das novidades do app?</h3>
      <p class="muted small" style="margin:0 0 6px">Deixe seu contato para ser avisado(a) quando sair uma melhoria que os usuários pediram, além de dicas de TAF. É gratuito e opcional.</p>
      <label style="margin:4px 0">Seu nome<input id="${id}-nome" maxlength="60" autocomplete="name"></label>
      <label style="margin:4px 0">WhatsApp (com DDD) ou e-mail<input id="${id}-cont" maxlength="80" inputmode="email" placeholder="84 9 9999-9999"></label>
      <label class="check" style="margin:8px 0;align-items:flex-start"><input type="checkbox" id="${id}-ok"> <span class="small">${ACEITE}</span></label>
      <div style="display:flex;gap:8px"><button class="btn small" id="${id}-env" style="flex:1">Quero ser avisado(a)</button>${onde === 'hoje' ? `<button class="btn small ghost" id="${id}-no">Agora não</button>` : ''}</div></div>`);
    const g = (k) => document.getElementById(id + '-' + k);
    g('env').onclick = () => {
      const nome = g('nome').value.trim(), cont = g('cont').value.trim();
      const int = 'novidades do app';
      if (nome.length < 2) return toast('Escreva seu nome.');
      if (!contatoValido(cont)) return toast('Confira o WhatsApp (com DDD) ou o e-mail.');
      if (!g('ok').checked) return toast('Marque a autorização para podermos enviar mensagens.');
      const [cid, uf] = (ler().cidade || '').split('/');
      const x = ler(); x.lead = Date.now(); x.leadNome = nome; x.leadContato = cont; gravar(x);
      enviar({ tipo: 'lead', nome, contato: cont, interesse: int, aceite: 'sim: ' + ACEITE, cidade: cid, uf });
      toast('Obrigado, ' + nome.split(' ')[0] + '! Você está na lista.');
      document.getElementById(id).remove(); if (onde === 'mais') cartaoLead(view, onde);
    };
    if (g('no')) g('no').onclick = () => { const x = ler(); x.semLead = Date.now(); gravar(x); document.getElementById(id).remove(); };
  }

  // Indicar o app: quem treina junto é quem mais traz novos usuários
  function cartaoIndicar(view) {
    if (document.getElementById('com-ind')) return;
    view.insertAdjacentHTML('beforeend', `<div class="card" id="com-ind"><h3 style="margin:0 0 4px">📤 Indique o app</h3>
      <p class="muted small" style="margin:0 0 8px">Conhece alguém que vai fazer TAF? Mande o link: o app é gratuito.</p>
      <button class="btn" id="ci-ok" style="width:100%">Compartilhar o app</button></div>`);
    document.getElementById('ci-ok').onclick = async () => {
      const txt = 'Estou usando o Treinador TAF para treinar para o teste físico do concurso. É gratuito: ';
      try {
        if (navigator.share) { await navigator.share({ title: 'Treinador TAF', text: txt, url: LINK }); enviar({ tipo: 'compartilhou' }); return; }
      } catch (e) { if (e && e.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(txt + LINK); toast('Link copiado. Cole no WhatsApp.'); enviar({ tipo: 'compartilhou' }); }
      catch { window.prompt('Copie o link:', LINK); }
    };
  }

  // Cartão de sugestões na aba Mais
  function cartaoMais(view) {
    if (document.getElementById('com-mais')) return;
    const r = ler();
    view.insertAdjacentHTML('beforeend', `<div class="card" id="com-mais"><h3 style="margin:0 0 4px">💬 Sugestões para o app</h3>
      <p class="muted small" style="margin:0 0 6px">Achou um erro ou tem uma ideia? Escreva aqui: a mensagem vai direto para o criador do app.</p>
      <textarea id="cm-msg" rows="4" maxlength="1500" placeholder="Ex.: queria um treino de barra mais curto..." style="width:100%;box-sizing:border-box;padding:11px 12px;font:inherit;color:var(--txt);background:var(--bg);border:1px solid var(--line);border-radius:10px"></textarea>
      <label>WhatsApp ou e-mail para resposta (opcional)<input id="cm-cont" maxlength="80"></label>
      <button class="btn" id="cm-ok" style="width:100%">Enviar sugestão</button>
      ${r.cidade ? `<p class="muted small" style="margin:8px 0 0">Cidade informada: ${esc(r.cidade)}.</p>` : `<details style="margin-top:10px"><summary>Informar minha cidade</summary>${camposCidade('cm')}<button class="btn small" id="cm-cid" style="width:100%;margin-top:6px">Enviar cidade</button></details>`}
      <p class="muted small" style="margin:8px 0 0">O app também conta, sem identificar ninguém, quantos aparelhos abriram e instalaram o app. Treinos, peso e dores nunca saem do seu celular.</p></div>`);
    document.getElementById('cm-ok').onclick = () => {
      const m = document.getElementById('cm-msg').value.trim();
      if (m.length < 5) return toast('Escreva a sugestão antes de enviar.');
      const x = ler();
      const [cid, uf] = (x.cidade || '').split('/');
      enviar({ tipo: 'sugestão', mensagem: m, contato: document.getElementById('cm-cont').value.trim(), cidade: cid, uf });
      document.getElementById('cm-msg').value = ''; document.getElementById('cm-cont').value = '';
      toast(navigator.onLine ? 'Sugestão enviada. Obrigado!' : 'Sem internet: a sugestão será enviada quando a conexão voltar.');
    };
    const bc = document.getElementById('cm-cid');
    if (bc) bc.onclick = () => { if (salvarCidade('cm')) { document.getElementById('com-mais').remove(); cartaoMais(view); } };
  }

  function decorar() {
    const view = document.getElementById('view'); if (!view) return;
    const rota = document.body.dataset.rota;
    if (rota === 'hoje') {
      cartaoHoje(view);
      const r = ler();
      // depois de 3 dias de uso, uma única vez, e nunca junto com o cartão da cidade
      if (!r.lead && !r.semLead && r.novo && Date.now() - r.novo > 3 * 864e5 && !document.getElementById('com-hoje')) cartaoLead(view, 'hoje');
    }
    if (rota === 'mais') {
      // fica antes do cartão de apoio
      cartaoMais(view); cartaoLead(view, 'mais'); cartaoIndicar(view);
      view.querySelectorAll('p.muted.small.center').forEach((p) => { if (p.textContent.includes('versão 1.0')) p.textContent = 'Treinador TAF · versão ' + VERSAO + ' · treinos, peso e dores ficam só neste aparelho.'; });
      const ap = document.getElementById('apoio-card');
      if (ap) ['com-mais', 'com-lead-mais', 'com-ind'].forEach((k) => { const c = document.getElementById(k); if (c && ap.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING) view.insertBefore(c, ap); });
    }
  }
  new MutationObserver(decorar).observe(document.getElementById('view'), { childList: true });
  window.addEventListener('hashchange', () => setTimeout(decorar, 80));
  setTimeout(() => { decorar(); registrarAparelho(); }, 1500);
  window.__comunidade = { ler, enviar, esvaziar };
})();
