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
