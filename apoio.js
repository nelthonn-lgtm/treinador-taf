// "Apoie o projeto": doação via Pix (copia e cola + QR Code).
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

  function carregarQR(cb) {
    if (window.qrcode) return cb();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
    s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }
  function copiar(txt, btn) {
    const ok = () => { const t = btn.textContent; btn.textContent = 'Copiado ✔'; setTimeout(() => (btn.textContent = t), 2000); };
    const falha = () => { window.prompt('Copie o código abaixo:', txt); };
    try { navigator.clipboard ? navigator.clipboard.writeText(txt).then(ok).catch(falha) : falha(); } catch { falha(); }
  }

  function montar(view) {
    view.insertAdjacentHTML('beforeend', `<div class="card" id="apoio-card"><h3>☕ Apoie o projeto</h3>
      <p>O Treinador TAF é gratuito, sem anúncios e não coleta seus dados. Se ele está ajudando na sua preparação, você pode contribuir com qualquer valor pelo Pix.</p>
      <div id="apoio-qr" style="display:flex;justify-content:center;margin:10px 0"></div>
      <div class="col gap">
        <button class="btn" id="apoio-cc">Copiar Pix copia e cola</button>
        <button class="btn ghost" id="apoio-ch">Copiar chave Pix</button>
      </div>
      <p class="muted small">No app do banco: Pix › Pix copia e cola (ou ler QR Code) e escolha o valor.<br>Recebedor: ${NOME_EXIBIDO}.</p></div>`);
    document.getElementById('apoio-cc').onclick = (e) => copiar(payload(), e.target);
    document.getElementById('apoio-ch').onclick = (e) => copiar(CHAVE, e.target);
    carregarQR(() => {
      const box = document.getElementById('apoio-qr');
      if (!box) return;
      if (!window.qrcode) { box.remove(); return; }
      const q = window.qrcode(0, 'M'); q.addData(payload()); q.make();
      box.innerHTML = `<div style="background:#fff;padding:10px;border-radius:12px">${q.createSvgTag({ cellSize: 5, margin: 0 })}</div>`;
    });
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
