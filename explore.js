// explore.js – SkillSwap Explore Page

(function () {
  injectShell('nav-explore');

  // ── Tab switching ──────────────────────────────────────────
  const mainTabs = document.getElementById('mainTabs');
  mainTabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      mainTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // ── Filter state ───────────────────────────────────────────
  const chips   = document.querySelectorAll('#catChips .cat-chip');
  const cards   = document.querySelectorAll('#mentorsGrid .mentor-card');

  let activeCat     = 'all';
  let activeSearch  = '';
  let activeFilters = { experience: 'any', availability: 'any', rating: 'any' };

  function applyFilters() {
    cards.forEach(card => {
      const cats  = (card.dataset.cat || '').split(' ');
      const text  = card.textContent.toLowerCase();

      const catOk    = activeCat === 'all' || cats.includes(activeCat);
      const searchOk = !activeSearch || text.includes(activeSearch);

      let availOk = true;
      if (activeFilters.availability === 'asap') availOk = cats.includes('asap');

      let ratingOk = true;
      if (activeFilters.rating === 'high')
        ratingOk = text.includes('97%') || text.includes('95%') || text.includes('100%') || text.includes('93%');

      let expOk = true;
      if (activeFilters.experience === 'senior')
        expOk = text.includes('yrs') || text.includes('lead') || text.includes('head') || text.includes('cto') || text.includes('senior');

      card.style.display = (catOk && searchOk && availOk && ratingOk && expOk) ? '' : 'none';
    });

    // Update result count
    const visible = Array.from(cards).filter(c => c.style.display !== 'none').length;
    const countEl = document.getElementById('mentorCount');
    if (countEl) countEl.textContent = visible + ' mentor' + (visible !== 1 ? 's' : '');
  }

  // ── Category chips ─────────────────────────────────────────
  chips.forEach(chip => {
    chip.addEventListener('click', function () {
      chips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      activeCat = this.dataset.cat;
      applyFilters();
    });
  });

  // ── Search ─────────────────────────────────────────────────
  const searchInput = document.getElementById('mentorSearch');
  searchInput.addEventListener('input', function () {
    activeSearch = this.value.toLowerCase();
    if (activeSearch) chips.forEach(c => c.classList.remove('active'));
    else { document.querySelector('[data-cat="all"]').classList.add('active'); activeCat = 'all'; }
    applyFilters();
  });

  // ── Filter panel ───────────────────────────────────────────
  const filtersLink   = document.querySelector('.filters-link');
  const filterPanel   = document.getElementById('filterPanel');
  const filterOverlay = document.getElementById('filterOverlay');

  function openPanel()  { filterPanel.classList.add('open'); filterOverlay.classList.add('active'); }
  function closePanel() { filterPanel.classList.remove('open'); filterOverlay.classList.remove('active'); }

  filtersLink.addEventListener('click', openPanel);
  document.getElementById('closeFilterBtn').addEventListener('click', closePanel);
  filterOverlay.addEventListener('click', closePanel);

  filterPanel.querySelectorAll('.fp-option').forEach(opt => {
    opt.addEventListener('click', function () {
      const group = this.dataset.group;
      filterPanel.querySelectorAll('.fp-option[data-group="' + group + '"]').forEach(o => o.classList.remove('active'));
      this.classList.add('active');
    });
  });

  document.getElementById('applyFiltersBtn').addEventListener('click', function () {
    const expEl    = filterPanel.querySelector('.fp-option[data-group="experience"].active');
    const availEl  = filterPanel.querySelector('.fp-option[data-group="availability"].active');
    const ratingEl = filterPanel.querySelector('.fp-option[data-group="rating"].active');

    activeFilters.experience   = expEl    ? expEl.dataset.val    : 'any';
    activeFilters.availability = availEl  ? availEl.dataset.val  : 'any';
    activeFilters.rating       = ratingEl ? ratingEl.dataset.val : 'any';

    const hasActive = Object.values(activeFilters).some(v => v !== 'any');
    filtersLink.classList.toggle('filter-active', hasActive);

    applyFilters();
    closePanel();
  });

  document.getElementById('resetFiltersBtn').addEventListener('click', function () {
    filterPanel.querySelectorAll('.fp-option').forEach(o => {
      o.classList.remove('active');
      if (o.dataset.val === 'any') o.classList.add('active');
    });
    activeFilters = { experience: 'any', availability: 'any', rating: 'any' };
    filtersLink.classList.remove('filter-active');
    applyFilters();
    closePanel();
  });

  // ── Mentor card click ──────────────────────────────────────
  cards.forEach(card => {
    card.addEventListener('click', function () {
      window.location.href = 'mentor.html';
    });
  });

  applyFilters();
})();