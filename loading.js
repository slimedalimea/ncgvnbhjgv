(() => {
  function injectLoading() {
    if (!document.body) {
      setTimeout(injectLoading, 50);
      return;
    }

    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    Object.assign(loadingOverlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: '#111',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '99999',
      fontFamily: "'Press Start 2P', monospace, Arial, sans-serif",
      transition: 'opacity 0.6s ease',
      opacity: '1',
    });

    if (!document.querySelector('link[href*="Press+Start+2P"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css?family=Press+Start+2P&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    loadingOverlay.innerHTML = `
      <h1 style="margin:0 0 10px 0;">Loading...</h1>
      <div style="font-size:12px; opacity:0.8;">This could take a minute</div>
      <img src="/images/logo.png" alt="logo" style="margin-top:20px; max-width:150px; height:auto;" />
    `;

    document.body.appendChild(loadingOverlay);

    function fadeOutAndRemove() {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.remove();
        document.documentElement.style.overflow = '';
      }, 600);
    }

    if (document.readyState === 'complete') {
      fadeOutAndRemove();
    } else {
      window.addEventListener('load', fadeOutAndRemove);
    }
  }

  injectLoading();
})();
