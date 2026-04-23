// explore.js – SkillSwap Explore Page (v3 — API-backed with live search & filters)

(function () {
  injectShell('nav-explore');

  // ── DOM refs ───────────────────────────────────────────────
  var mentorGrid     = document.querySelector('.mentors-grid');
  var searchInput    = document.getElementById('mentorSearch');
  var filtersBtn     = document.getElementById('filtersBtn');
  var filterPanel    = document.getElementById('filterPanel');
  var filterOverlay  = document.getElementById('filterOverlay');
  var closeFilterBtn = document.getElementById('closeFilterBtn');
  var resetBtn       = document.getElementById('resetFiltersBtn');
  var applyBtn       = document.getElementById('applyFiltersBtn');
  var countRow       = document.querySelector('.explore-count-row');
  var categoryChips  = document.querySelectorAll('.cat-chip');

  var allSessions    = [];
  var filteredSessions = [];
  var activeFilters  = { area: 'any', search: '' };

  // ── Load sessions from API ─────────────────────────────────
  function loadSessions() {
    SkillSwapAPI.sessions.list().then(function (result) {
      if (result && result.success) {
        allSessions = result.sessions || [];
        applyFilters();
      }
    });
  }

  // ── Apply all filters ──────────────────────────────────────
  function applyFilters() {
    var search = activeFilters.search.toLowerCase();
    var area   = activeFilters.area;

    filteredSessions = allSessions.filter(function (s) {
      // Search filter: name, skill, title, company
      var matchSearch = !search ||
        (s.mentor_name || '').toLowerCase().indexOf(search) !== -1 ||
        (s.title || '').toLowerCase().indexOf(search) !== -1 ||
        (s.skill || '').toLowerCase().indexOf(search) !== -1 ||
        (s.mentor_company || '').toLowerCase().indexOf(search) !== -1 ||
        (s.mentor_role || '').toLowerCase().indexOf(search) !== -1;

      // Category filter
      var matchArea = area === 'any' ||
        (s.categories || '').toLowerCase().indexOf(area) !== -1 ||
        (s.skill || '').toLowerCase().indexOf(area) !== -1;

      return matchSearch && matchArea;
    });

    renderMentorCards();
  }

  // ── Render mentor cards dynamically ────────────────────────
  function renderMentorCards() {
    mentorGrid.innerHTML = '';

    if (countRow) {
      countRow.textContent = filteredSessions.length + ' mentor' + (filteredSessions.length !== 1 ? 's' : '') + ' found';
    }

    if (filteredSessions.length === 0) {
      mentorGrid.innerHTML =
        '<div style="text-align:center;padding:60px 20px;color:var(--text-muted);font-size:15px;grid-column:1/-1;">' +
          '<p>No mentors found matching your search.</p>' +
          '<button onclick="location.reload()" style="margin-top:12px;padding:10px 20px;border-radius:10px;border:1.5px solid var(--border);cursor:pointer;background:var(--white);font-weight:600;">Reset filters</button>' +
        '</div>';
      return;
    }

    filteredSessions.forEach(function (s) {
      var card = document.createElement('div');
      card.className = 'mentor-card';
      card.style.cursor = 'pointer';

      var bgColor = s.avatar_color || '#0d9488';
      var initial = s.avatar_initial || (s.mentor_name ? s.mentor_name.charAt(0).toUpperCase() : 'M');

      card.innerHTML =
        '<div class="mentor-card-img">' +
          '<div class="mentor-card-img-inner" style="background:linear-gradient(135deg,' + bgColor + ',' + adjustColor(bgColor) + ');">' +
            '<span class="mentor-card-avatar">' + initial + '</span>' +
          '</div>' +
          (s.is_active ? '<span class="asap-badge"><span style="width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;"></span> Available ASAP</span>' : '') +
        '</div>' +
        '<div class="mentor-card-body">' +
          '<div class="mentor-name">' + escHtml(s.mentor_name) +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="var(--teal)" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>' +
          '</div>' +
          '<div class="mentor-role">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> ' +
            escHtml(s.mentor_role || '') + (s.mentor_company ? ' at ' + escHtml(s.mentor_company) : '') +
          '</div>' +
          '<div class="mentor-stats">' +
            '<div><div class="stat-label">Skill</div><div class="stat-val">' + escHtml(s.skill) + '</div></div>' +
            '<div><div class="stat-label">Credits</div><div class="stat-val">' + s.credits_per_session + '</div></div>' +
            '<div><div class="stat-label">Duration</div><div class="stat-val">' + s.duration_minutes + 'min</div></div>' +
          '</div>' +
        '</div>';

      card.addEventListener('click', function () {
        window.location.href = 'mentor.html?id=' + s.mentor_id + '&session=' + s.id;
      });

      mentorGrid.appendChild(card);
    });
  }

  // ── Search input (debounced) ───────────────────────────────
  var searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        activeFilters.search = searchInput.value.trim();
        applyFilters();
      }, 250);
    });
  }

  // ── Category chips ─────────────────────────────────────────
  categoryChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      categoryChips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var category = (chip.dataset.cat || chip.querySelector('.cat-chip-label') || {}).textContent;
      if (category) {
        category = category.trim().toLowerCase();
      }
      // Map category to filter
      if (!category || category === 'all' || category === '⚡') {
        activeFilters.area = 'any';
      } else {
        activeFilters.area = category;
      }
      applyFilters();
    });
  });

  // ── Filter panel ───────────────────────────────────────────
  function openFilterPanel() {
    filterPanel.classList.add('active');
    filterOverlay.classList.add('active');
  }
  function closeFilterPanel() {
    filterPanel.classList.remove('active');
    filterOverlay.classList.remove('active');
  }

  if (filtersBtn) filtersBtn.addEventListener('click', openFilterPanel);
  if (closeFilterBtn) closeFilterBtn.addEventListener('click', closeFilterPanel);
  if (filterOverlay) filterOverlay.addEventListener('click', closeFilterPanel);

  // Filter panel option buttons
  document.querySelectorAll('.fp-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      var group = opt.dataset.group;
      // Deactivate siblings in same group
      document.querySelectorAll('.fp-option[data-group="' + group + '"]').forEach(function (o) {
        o.classList.remove('active');
      });
      opt.classList.add('active');
    });
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', function () {
      // Read selected filter values
      var areaOpt = document.querySelector('.fp-option[data-group="area"].active');
      activeFilters.area = areaOpt ? areaOpt.dataset.val : 'any';
      applyFilters();
      closeFilterPanel();

      // Update filter button appearance
      var hasFilters = activeFilters.area !== 'any';
      filtersBtn.classList.toggle('filter-active', hasFilters);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      document.querySelectorAll('.fp-option').forEach(function (opt) {
        opt.classList.toggle('active', opt.dataset.val === 'any');
      });
      activeFilters.area = 'any';
      applyFilters();
      filtersBtn.classList.remove('filter-active');
    });
  }

  // ── Helpers ────────────────────────────────────────────────
  function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function adjustColor(hex) {
    // Create a slightly darker shade for gradient
    if (!hex || hex.charAt(0) !== '#') return '#0f766e';
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, r - 30);
    g = Math.max(0, g - 30);
    b = Math.max(0, b - 30);
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
  }

  // ── Initial load ───────────────────────────────────────────
  loadSessions();

})();