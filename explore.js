// explore.js – SkillSwap Explore Page

(function () {
  injectShell('nav-explore');

  // ── Tab switching (Mentors / Group Sessions) ──────────────
  const mainTabs = document.getElementById('mainTabs');
  mainTabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      mainTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // ── Category chip filtering ───────────────────────────────
  const chips   = document.querySelectorAll('#catChips .cat-chip');
  const cards   = document.querySelectorAll('#mentorsGrid .mentor-card');

  chips.forEach(chip => {
    chip.addEventListener('click', function () {
      chips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');

      const cat = this.dataset.cat;
      cards.forEach(card => {
        const cats = (card.dataset.cat || '').split(' ');
        card.style.display = (cat === 'all' || cats.includes(cat)) ? '' : 'none';
      });
    });
  });

  // ── Live search filter ────────────────────────────────────
  const searchInput = document.getElementById('mentorSearch');
  searchInput.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
    // Reset chip active state when searching
    if (q) chips.forEach(c => c.classList.remove('active'));
  });

  // ── Mentor card click → mentor profile page ─────────────
  cards.forEach(card => {
    card.addEventListener('click', function () {
      window.location.href = 'mentor.html';
    });
  });

  // ── AI Search button ──────────────────────────────────────
  document.querySelector('.ai-search-btn').addEventListener('click', function () {
    const goal = prompt('Describe your learning goal and we\'ll find the best mentor for you:');
    if (goal) alert('Finding mentors for: "' + goal + '"…\n\nAI search coming soon!');
  });
})();