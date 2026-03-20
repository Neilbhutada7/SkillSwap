// bookings.js – SkillSwap Bookings Page

(function () {
  injectShell('nav-bookings');

  // ── Dismiss alert banners ─────────────────────────────────
  document.querySelectorAll('.booking-alert-close').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.dataset.target;
      const el = document.getElementById(targetId);
      if (el) {
        el.style.height   = el.offsetHeight + 'px';
        el.style.overflow = 'hidden';
        el.style.transition = 'height 0.3s, opacity 0.3s, margin 0.3s';
        requestAnimationFrame(() => {
          el.style.height  = '0';
          el.style.opacity = '0';
          el.style.marginBottom = '0';
        });
        setTimeout(() => el.remove(), 320);
      }
    });
  });

  // ── Tab switching ─────────────────────────────────────────
  const tabs = document.getElementById('bookingTabs');
  tabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      // Update active tab
      tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Show/hide panels
      const active = this.dataset.tab;
      ['upcoming', 'pending', 'history'].forEach(t => {
        const panel = document.getElementById('tab-' + t);
        if (panel) panel.style.display = (t === active) ? '' : 'none';
      });
    });
  });

  // ── Calendar connect ──────────────────────────────────────
  document.querySelector('[href="#"]')?.addEventListener('click', function (e) {
    e.preventDefault();
    alert('Google Calendar integration coming soon!');
  });
})();
