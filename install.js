// Botão de instalação visível (Android/Chrome) + instrução manual quando o Chrome não oferece o atalho.
(function () {
  const instalado = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (instalado) return;
  let ev = null;
  const bar = document.createElement('div');
  bar.id = 'inst-bar';
  bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:150;background:#ea580c;color:#fff;border-radius:14px;padding:12px 14px;display:none;align-items:center;gap:10px;box-shadow:0 6px 20px #0005;font:600 15px system-ui,sans-serif';
  bar.innerHTML = '<span style="font-size:22px">📲</span><span id="inst-txt" style="flex:1">Instale o Treinador TAF no celular</span><button id="inst-btn" style="background:#fff;color:#ea580c;border:0;border-radius:10px;padding:10px 14px;font:700 15px system-ui">Instalar</button><button id="inst-x" aria-label="Fechar" style="background:none;border:0;color:#fff;font-size:22px;padding:0 4px">×</button>';
  const mostrar = () => { if (!document.body.contains(bar)) document.body.appendChild(bar); bar.style.display = 'flex'; };
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); ev = e; mostrar(); const t = document.getElementById('inst-txt'), b = document.getElementById('inst-btn'); if (t) t.textContent = 'Instale o Treinador TAF no celular'; if (b) b.style.display = ''; });
  window.addEventListener('appinstalled', () => { bar.remove(); });
  function manual() {
    document.getElementById('inst-txt').innerHTML = 'No Chrome: toque em <b>⋮</b> (canto superior direito) › <b>Adicionar à tela inicial</b> › <b>Instalar</b>.';
    document.getElementById('inst-btn').style.display = 'none';
  }
  document.addEventListener('click', async (e) => {
    if (e.target.id === 'inst-x') { bar.remove(); return; }
    if (e.target.id !== 'inst-btn') return;
    if (ev) { ev.prompt(); const r = await ev.userChoice; ev = null; if (r.outcome === 'accepted') bar.remove(); }
    else manual();
  });
  // Se o Chrome não oferecer o atalho em 4 s, mostra o caminho manual
  setTimeout(() => { if (!ev) { mostrar(); manual(); } }, 4000);
})();
