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
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = newsletterForm.querySelector('button');
    const status = document.getElementById('newsletter-status');
    const email = newsletterForm.querySelector('input[name="email"]')?.value?.trim();

    if (!email) return;

    btn.textContent = 'Sending...';
    btn.disabled = true;
    if (status) status.style.display = 'none';

    try {
      const response = await fetch('https://formsubmit.co/ajax/willianzacarias77@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: 'New Subscribe Free lead - WealthAxis',
          email,
          message: `New newsletter subscription request from: ${email}`,
          source: 'Homepage - Subscribe Free'
        })
      });
      if (!response.ok) throw new Error('newsletter submit failed');

      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#3ecf8e';
      if (status) {
        status.textContent = 'Subscription sent successfully.';
        status.style.display = 'block';
      }
      newsletterForm.reset();
    } catch (error) {
      if (status) {
        status.textContent = 'Could not send automatically. Please email willianzacarias77@gmail.com.';
        status.style.display = 'block';
      }
      btn.textContent = 'Try Again';
    } finally {
      setTimeout(() => {
        btn.textContent = 'Subscribe Free';
        btn.style.background = '';
        btn.disabled = false;
      }, 2000);
    }
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

// Homepage: live market data
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
    aapl: 'AAPL',
    msft: 'MSFT',
    nvda: 'NVDA',
    tsla: 'TSLA',
    us500: '^GSPC',
    nasdaq: '^IXIC',
    uk100: '^FTSE',
    jp225: '^N225'
  };

  try {
    const list = Object.values(symbols).join(',');
    const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(list)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('market feed unavailable');
    const data = await response.json();
    const lines = data?.quoteResponse?.result || [];
    const bySymbol = {};

    lines.forEach((item) => {
      const key = item.symbol?.toUpperCase();
      if (!key) return;
      bySymbol[key] = {
        changePct: Number(item.regularMarketChangePercent),
        price: Number(item.regularMarketPrice)
      };
    });

    Object.entries(symbols).forEach(([id, symbol]) => {
      const value = bySymbol[symbol.toUpperCase()];
      const el = tickers[id];
      if (!el) return;

      if (!value || Number.isNaN(value.changePct)) {
        el.textContent = '—';
        el.classList.remove('up', 'down');
        return;
      }

      const num = value.changePct;
      const sign = num > 0 ? '+' : '';
      el.textContent = `${sign}${num.toFixed(2)}%`;
      el.classList.remove('up', 'down');
      el.classList.add(num >= 0 ? 'up' : 'down');
    });

    const spx = bySymbol['^GSPC'];
    const spxPrice = document.getElementById('spx-live-price');
    const spxChange = document.getElementById('spx-live-change');
    const spxUpdated = document.getElementById('spx-live-updated');
    if (spx && spxPrice && spxChange && spxUpdated) {
      const sign = spx.changePct > 0 ? '+' : '';
      spxPrice.textContent = spx.price.toLocaleString('en-US', { maximumFractionDigits: 2 });
      spxChange.textContent = `${sign}${spx.changePct.toFixed(2)}% today`;
      spxChange.classList.remove('up', 'down');
      spxChange.classList.add(spx.changePct >= 0 ? 'up' : 'down');
      spxUpdated.textContent = `Updated: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
  } catch (error) {
    Object.values(tickers).forEach((el) => {
      if (el) el.textContent = 'Offline';
    });
    const badge = document.getElementById('market-live-badge');
    if (badge) {
      badge.textContent = 'OFFLINE';
      badge.classList.remove('up');
    }
    const spxPrice = document.getElementById('spx-live-price');
    const spxChange = document.getElementById('spx-live-change');
    if (spxPrice) spxPrice.textContent = 'Offline';
    if (spxChange) spxChange.textContent = 'Market feed unavailable';
  }
}

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.cf-submit');
    const success = document.getElementById('cf-success');
    const error = document.getElementById('cf-error');
    const formData = new FormData(contactForm);
    const payload = {
      _subject: `Contact form: ${formData.get('subject') || 'General Question'}`,
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject') || 'General Question',
      message: formData.get('message'),
      source: 'Contact page - Send a Message'
    };

    btn.textContent = 'Sending...';
    btn.disabled = true;
    if (success) success.style.display = 'none';
    if (error) error.style.display = 'none';

    try {
      const response = await fetch('https://formsubmit.co/ajax/willianzacarias77@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('contact submit failed');

      contactForm.reset();
      if (success) success.style.display = 'block';
      btn.textContent = 'Message sent ✓';
    } catch (submitError) {
      if (error) error.style.display = 'block';
      btn.textContent = 'Try Again';
    } finally {
      setTimeout(() => {
        btn.textContent = 'Send Message →';
        btn.disabled = false;
      }, 2500);
    }
  });
}

syncTopicCounts();
loadLiveMarkets();
setInterval(loadLiveMarkets, 60000);
