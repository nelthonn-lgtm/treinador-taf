// "Apoie o projeto": quadro compacto com mascote animado; o Pix abre ao tocar.
(function () {
  const CHAVE = 'abd3df69-e7f5-4666-b746-e83ba2afdca5';
  const NOME_EXIBIDO = 'Francisco Josinelton Freitas de Araújo';
  const NOME_PIX = 'Francisco Josinelton'; // o padrão Pix aceita até 25 caracteres, sem acento
  const CIDADE = 'CAICO';

  const campo = (id, v) => id + String(v.length).padStart(2, '0') + v;
  function crc16(s) {
    let c = 0xffff;
    for (let i = 0; i < s.length; i++) {
      c ^= s.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff;
    }
    return c.toString(16).toUpperCase().padStart(4, '0');
  }
  function payload() {
    const p = campo('00', '01') + campo('26', campo('00', 'br.gov.bcb.pix') + campo('01', CHAVE)) + campo('52', '0000') + campo('53', '986') + campo('58', 'BR') + campo('59', NOME_PIX) + campo('60', CIDADE) + campo('62', campo('05', '***')) + '6304';
    return p + crc16(p);
  }
  window.__pixPayload = payload;

  const sexo = () => { try { return JSON.parse(localStorage.getItem('tafpprn.v1'))?.profile?.sexo || 'M'; } catch { return 'M'; } };

  // Mascote: atleta fazendo barra fixa (mesmo sexo do perfil: "você chega lá")
  function mascote() {
    const F = sexo() === 'F';
    const pele = '#f2c094', roupa = '#f97316', cabelo = '#3b2a1f';
    const cab = F
      ? `<path d="M31 17 q9-11 18 0 v4 h-18z" fill="${cabelo}"/><path d="M48 18 q9 4 6 16 q-3-8-7-10z" fill="${cabelo}"/>`
      : `<path d="M31 18 q9-10 18 0 v2 h-18z" fill="${cabelo}"/>`;
    const tronco = F
      ? `<path d="M30 34 h20 l-2 18 h-16z" fill="${roupa}"/>`
      : `<path d="M28 34 h24 l-4 18 h-16z" fill="${roupa}"/>`;
    return `<svg viewBox="0 0 80 96" width="72" height="86" aria-hidden="true" style="flex:none">
      <rect x="6" y="4" width="68" height="5" rx="2.5" fill="#94a3b8"/>
      <g stroke="${pele}" stroke-width="5" stroke-linecap="round">
        <line x1="24" y1="7" x2="28" y2="36"><animate attributeName="y2" values="36;22;36" dur="1.6s" repeatCount="indefinite"/></line>
        <line x1="56" y1="7" x2="52" y2="36"><animate attributeName="y2" values="36;22;36" dur="1.6s" repeatCount="indefinite"/></line>
      </g>
      <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -14;0 0" dur="1.6s" repeatCount="indefinite"/>
        <circle cx="40" cy="24" r="9" fill="${pele}"/>${cab}
        <path d="M36 27 q4 3 8 0" stroke="#7c2d12" stroke-width="1.5" fill="none"/>
        ${tronco}
        <rect x="32" y="51" width="16" height="9" rx="2" fill="#1e3a8a"/>
        <g stroke="${pele}" stroke-width="5" stroke-linecap="round"><line x1="35" y1="59" x2="33" y2="78"/><line x1="45" y1="59" x2="47" y2="78"/></g>
        <g fill="#111827"><rect x="28" y="77" width="9" height="5" rx="2"/><rect x="43" y="77" width="9" height="5" rx="2"/></g>
      </g>
    </svg>`;
  }

  function carregarQR(cb) {
    if (window.qrcode) return cb();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
    s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }
  function copiar(btn) {
    const txt = payload();
    const ok = () => { const t = btn.textContent; btn.textContent = 'Copiado ✔ Agora cole no app do banco'; setTimeout(() => (btn.textContent = t), 2500); };
    const falha = () => { window.prompt('Copie o código Pix:', txt); };
    try { navigator.clipboard ? navigator.clipboard.writeText(txt).then(ok).catch(falha) : falha(); } catch { falha(); }
  }

  function montar(view) {
    view.insertAdjacentHTML('beforeend', `<div class="card" id="apoio-card">
      <div style="display:flex;gap:12px;align-items:center">${mascote()}
        <div style="flex:1"><h3 style="margin:0 0 4px">☕ Apoie o projeto</h3>
        <p class="muted small" style="margin:0">App gratuito, sem anúncios. Ajude com qualquer valor.</p></div></div>
      <button class="btn" id="apoio-abrir" style="width:100%;margin-top:10px">Doar via Pix</button>
      <div id="apoio-pix" class="hide" style="text-align:center">
        <div id="apoio-qr" style="display:inline-block;background:#fff;padding:8px;border-radius:10px;margin:10px 0"></div>
        <button class="btn" id="apoio-cc" style="width:100%">Copiar código Pix</button>
        <p class="muted small">Cole em Pix › Pix copia e cola, ou leia o QR Code. Recebedor: ${NOME_EXIBIDO}.</p>
      </div></div>`);
    document.getElementById('apoio-cc').onclick = (e) => copiar(e.target);
    document.getElementById('apoio-abrir').onclick = (e) => {
      e.target.classList.add('hide');
      document.getElementById('apoio-pix').classList.remove('hide');
      carregarQR(() => {
        const box = document.getElementById('apoio-qr');
        if (!box) return;
        if (!window.qrcode) { box.remove(); return; }
        const q = window.qrcode(0, 'M'); q.addData(payload()); q.make();
        box.innerHTML = q.createSvgTag({ cellSize: 3, margin: 0 });
      });
    };
  }
  function decorar() {
    const view = document.getElementById('view');
    if (!view || document.getElementById('apoio-card')) return;
    if (document.body.dataset.rota === 'mais') montar(view);
    else if (document.body.dataset.rota === 'conquistas') view.insertAdjacentHTML('beforeend', '<div class="card" id="apoio-card"><p>Curtindo o app? <a href="#mais">☕ Apoie o projeto</a> na aba Mais.</p></div>');
  }
  new MutationObserver(decorar).observe(document.getElementById('view'), { childList: true });
  window.addEventListener('hashchange', () => setTimeout(decorar, 60));
  setTimeout(decorar, 300);
})();
