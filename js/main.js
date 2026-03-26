// WealthAxis – Main JS

// Mobile nav
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');
if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });
}

// Newsletter form
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = newsletterForm.querySelector('button');
    btn.textContent = '✓ Subscribed!';
    btn.style.background = '#3ecf8e';
    setTimeout(() => {
      btn.textContent = 'Subscribe Free';
      btn.style.background = '';
      newsletterForm.reset();
    }, 3000);
  });
}

// Scroll nav shadow
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) {
    nav.style.boxShadow = window.scrollY > 20 ? '0 4px 30px rgba(0,0,0,0.4)' : '';
  }
});

// Animate elements on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.article-card, .tool-chip, .cat-card, .blog-article, .tool-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.2s ease';
  observer.observe(el);
});

// Homepage: sync "Explore by Topic" with real blog categories
async function syncTopicCounts() {
  const cards = document.querySelectorAll('.cat-card[data-topics]');
  if (!cards.length) return;

  try {
    const response = await fetch('blog/index.html', { cache: 'no-store' });
    if (!response.ok) throw new Error('blog index unavailable');
    const html = await response.text();
    const categoryMatches = [...html.matchAll(/<span class="article-category">([^<]+)<\/span>/g)];
    const counts = categoryMatches.reduce((acc, match) => {
      const name = match[1].trim();
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    cards.forEach((card) => {
      const aliases = (card.dataset.topics || '').split(',').map((v) => v.trim()).filter(Boolean);
      const total = aliases.reduce((sum, alias) => sum + (counts[alias] || 0), 0);
      const el = card.querySelector('[data-topic-count]');
      if (el) el.textContent = `${total} artigos`;
    });

    const totalEl = document.getElementById('topics-total');
    if (totalEl) totalEl.textContent = `${categoryMatches.length} artigos no blog (contagem automática por categoria).`;
  } catch (error) {
    const totalEl = document.getElementById('topics-total');
    if (totalEl) totalEl.textContent = 'Não foi possível sincronizar as categorias agora.';
  }
}

// Homepage: live market data (stooq via CORS proxy)
async function loadLiveMarkets() {
  const tickers = {
    aapl: document.getElementById('ticker-aapl'),
    msft: document.getElementById('ticker-msft'),
    nvda: document.getElementById('ticker-nvda'),
    tsla: document.getElementById('ticker-tsla'),
    us500: document.getElementById('ticker-us500'),
    nasdaq: document.getElementById('ticker-nasdaq'),
    uk100: document.getElementById('ticker-uk100'),
    jp225: document.getElementById('ticker-jp225')
  };
  if (!tickers.aapl) return;

  const symbols = {
    aapl: 'aapl.us',
    msft: 'msft.us',
    nvda: 'nvda.us',
    tsla: 'tsla.us',
    us500: '^spx',
    nasdaq: '^ixic',
    uk100: '^ukx',
    jp225: '^nkx'
  };

  try {
    const list = Object.values(symbols).join(',');
    const source = encodeURIComponent(`https://stooq.com/q/l/?s=${list}&f=sd2t2ohlcvncp&e=csv`);
    const response = await fetch(`https://api.allorigins.win/raw?url=${source}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('market feed unavailable');
    const csv = await response.text();
    const lines = csv.trim().split('\n').slice(1);
    const bySymbol = {};

    lines.forEach((line) => {
      const [symbol, , , , , , , , , changePct] = line.split(',');
      bySymbol[symbol?.toLowerCase()] = changePct;
    });

    Object.entries(symbols).forEach(([id, symbol]) => {
      const value = bySymbol[symbol.toLowerCase()];
      const el = tickers[id];
      if (!el) return;

      if (!value || value === 'N/D') {
        el.textContent = '—';
        el.classList.remove('up', 'down');
        return;
      }

      const num = Number(value);
      const sign = num > 0 ? '+' : '';
      el.textContent = `${sign}${num.toFixed(2)}%`;
      el.classList.remove('up', 'down');
      el.classList.add(num >= 0 ? 'up' : 'down');
    });
  } catch (error) {
    Object.values(tickers).forEach((el) => {
      if (el) el.textContent = 'Offline';
    });
    const badge = document.getElementById('market-live-badge');
    if (badge) {
      badge.textContent = 'OFFLINE';
      badge.classList.remove('up');
    }
  }
}

syncTopicCounts();
loadLiveMarkets();
