// WealthAxis – Main JS

// ── Mobile nav ──────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');
if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });
}

// ── Scroll nav shadow ───────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) {
    nav.style.boxShadow = window.scrollY > 20 ? '0 4px 30px rgba(0,0,0,0.4)' : '';
  }
});

// ── Animate elements on scroll ──────────────────────────
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

// ── Forms: loading state on submit ──────────────────────
// Both newsletter and contact use FormSubmit.co (action="https://formsubmit.co/...")
// FormSubmit handles the POST + redirect natively — no JS needed for that.
// This JS only shows a "Sending..." state while the POST is in flight.

document.querySelectorAll('#newsletter-form, #contact-form').forEach(form => {
  form.addEventListener('submit', () => {
    const btn = form.querySelector('button[type="submit"], .cf-submit');
    if (btn) {
      btn.textContent = 'Sending...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    }
  });
});

// ── Sync topic counts from blog index ──────────────────
async function syncTopicCounts() {
  const cards = document.querySelectorAll('.cat-card[data-topics]');
  if (!cards.length) return;
  try {
    const response = await fetch('blog/index.html', { cache: 'no-store' });
    if (!response.ok) return;
    const html = await response.text();
    const matches = [...html.matchAll(/<span class="article-category">([^<]+)<\/span>/g)];
    const counts = matches.reduce((acc, m) => {
      const n = m[1].trim(); acc[n] = (acc[n] || 0) + 1; return acc;
    }, {});
    cards.forEach(card => {
      const aliases = (card.dataset.topics || '').split(',').map(v => v.trim()).filter(Boolean);
      const total = aliases.reduce((s, a) => s + (counts[a] || 0), 0);
      const el = card.querySelector('[data-topic-count]');
      if (el && total > 0) el.textContent = `${total} articles`;
    });
  } catch (_) {}
}

syncTopicCounts();

// ── Cookie consent banner ──────────────────────────────
(function initCookieConsent() {
  const storageKey = 'wa_cookie_consent_v1';

  function resolvePrivacyLink() {
    const depth = (location.pathname.match(/\//g) || []).length - 1;
    if (depth <= 1) return '/privacy-policy.html';
    return `${'../'.repeat(depth - 1)}privacy-policy.html`;
  }

  function applyConsent(consent) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      analytics_storage: consent === 'accepted' ? 'granted' : 'denied',
      ad_storage: consent === 'accepted' ? 'granted' : 'denied',
      ad_user_data: consent === 'accepted' ? 'granted' : 'denied',
      ad_personalization: consent === 'accepted' ? 'granted' : 'denied'
    });
  }

  const existingConsent = localStorage.getItem(storageKey);
  if (existingConsent) {
    applyConsent(existingConsent);
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    .wa-cookie-banner {
      position: fixed;
      left: 16px;
      right: 16px;
      bottom: 16px;
      z-index: 9999;
      background: rgba(16,16,19,0.97);
      border: 1px solid rgba(201,168,76,0.45);
      border-radius: 14px;
      padding: 14px;
      color: #f2f2f2;
      box-shadow: 0 12px 35px rgba(0,0,0,0.45);
      backdrop-filter: blur(6px);
      font-family: 'DM Sans', sans-serif;
    }
    .wa-cookie-banner__inner {
      max-width: 1080px;
      margin: 0 auto;
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .wa-cookie-banner p {
      margin: 0;
      line-height: 1.5;
      font-size: 0.92rem;
      color: #dddddd;
      flex: 1 1 520px;
    }
    .wa-cookie-banner a {
      color: #d5b970;
      text-decoration: underline;
    }
    .wa-cookie-banner__actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .wa-cookie-btn {
      border: 1px solid #5f5f69;
      border-radius: 8px;
      background: transparent;
      color: #f2f2f2;
      cursor: pointer;
      font-size: 0.86rem;
      font-weight: 600;
      padding: 9px 12px;
      min-width: 130px;
    }
    .wa-cookie-btn:hover { border-color: #9a9aa3; }
    .wa-cookie-btn--primary {
      background: #c9a84c;
      color: #171717;
      border-color: #c9a84c;
    }
  `;

  const banner = document.createElement('div');
  banner.className = 'wa-cookie-banner';
  banner.innerHTML = `
    <div class="wa-cookie-banner__inner">
      <p>
        We use cookies to improve your experience and to help support WealthAxis with analytics and ads.
        You can accept or decline non-essential cookies. See our
        <a href="${resolvePrivacyLink()}">Privacy Policy</a>.
      </p>
      <div class="wa-cookie-banner__actions">
        <button type="button" class="wa-cookie-btn" data-consent="declined">Decline</button>
        <button type="button" class="wa-cookie-btn wa-cookie-btn--primary" data-consent="accepted">Accept Cookies</button>
      </div>
    </div>
  `;

  banner.addEventListener('click', (event) => {
    const button = event.target.closest('[data-consent]');
    if (!button) return;
    const consent = button.getAttribute('data-consent');
    localStorage.setItem(storageKey, consent);
    applyConsent(consent);
    banner.remove();
    style.remove();
  });

  document.head.appendChild(style);
  document.body.appendChild(banner);
})();
