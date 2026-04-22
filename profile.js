// profile.js – SkillSwap Profile Page

(function () {
  injectShell('nav-profile');

  // ── Tab switching ──────────────────────────────────────────
  const profileTabs = document.getElementById('profileTabs');
  const tabPanelIds = ['overview', 'commendations', 'achievements', 'mentors'];

  profileTabs.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      profileTabs.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      var active = this.dataset.tab;
      tabPanelIds.forEach(function (id) {
        var panel = document.getElementById('tab-' + id);
        if (panel) panel.style.display = (id === active) ? '' : 'none';
      });
    });
  });

  // ── Avatar / Edit Profile ──────────────────────────────────
  document.getElementById('editProfileBtn').addEventListener('click', function () {
    alert('Edit Profile – coming soon!\n\nYou can update your name, role, and photo.');
  });
  document.querySelector('.avatar-edit').addEventListener('click', function () {
    alert('Photo upload – coming soon!');
  });
  document.querySelector('.profile-strength-card-alt').addEventListener('click', function () {
    alert('Complete your profile to level up!\n\n• Add about info\n• Add experience\n• Add education\n• Book a session');
  });

  // ── In-memory data ─────────────────────────────────────────
  var data = {
    about:      'Currently a student, interested in engineering and passionate about hobbies like guitar.',
    experience: [],   // [{role, company, period}]
    education:  []    // [{degree, school, period}]
  };

  // ── Helpers ────────────────────────────────────────────────
  function openSection(sectionId) {
    var sec = document.getElementById('section-' + sectionId);
    sec.classList.add('editing');
    sec.classList.remove('saved');
  }

  function closeSection(sectionId) {
    var sec = document.getElementById('section-' + sectionId);
    sec.classList.remove('editing');
  }

  function flashSaved(sectionId) {
    var sec = document.getElementById('section-' + sectionId);
    sec.classList.remove('saved');
    void sec.offsetWidth; // reflow to restart animation
    sec.classList.add('saved');
    setTimeout(function () { sec.classList.remove('saved'); }, 1000);
  }

  // ── ABOUT ──────────────────────────────────────────────────
  function renderAbout() {
    document.getElementById('about-display').textContent = data.about || 'No description added yet.';
  }

  document.querySelector('.edit-icon[data-section="about"]').addEventListener('click', function () {
    document.getElementById('about-input').value = data.about;
    openSection('about');
    document.getElementById('about-input').focus();
  });

  document.querySelector('.btn-cancel-edit[data-section="about"]').addEventListener('click', function () {
    closeSection('about');
  });

  document.querySelector('.btn-save-edit[data-section="about"]').addEventListener('click', function () {
    var val = document.getElementById('about-input').value.trim();
    data.about = val || data.about;
    renderAbout();
    closeSection('about');
    flashSaved('about');
  });

  // ── EXPERIENCE ─────────────────────────────────────────────
  function renderExperience() {
    var display = document.getElementById('experience-display');
    if (data.experience.length === 0) {
      display.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No experience added yet.</p>';
      return;
    }
    display.innerHTML = data.experience.map(function (e) {
      return '<div class="exp-entry">' +
        '<div class="entry-title">' + escHtml(e.role) + '</div>' +
        '<div class="entry-sub">' + escHtml(e.company) +
          (e.period ? ' &nbsp;·&nbsp; ' + escHtml(e.period) : '') +
        '</div></div>';
    }).join('');
  }

  function buildExperienceEditUI() {
    var container = document.getElementById('experience-edit-entries');
    container.innerHTML = '';
    var entries = data.experience.length > 0
      ? data.experience.map(function (e) { return Object.assign({}, e); })
      : [{ role: '', company: '', period: '' }];

    entries.forEach(function (entry, idx) {
      container.appendChild(makeExpRow(entry, idx, entries, container));
    });
    container._entries = entries;
  }

  function makeExpRow(entry, idx, entries, container) {
    var wrap = document.createElement('div');
    wrap.className = 'edit-entry-group';
    wrap.innerHTML =
      '<div class="edit-entry-fields">' +
        '<input class="edit-input" placeholder="Job title / Role" value="' + escAttr(entry.role) + '" data-field="role">' +
        '<input class="edit-input" placeholder="Company" value="' + escAttr(entry.company) + '" data-field="company">' +
      '</div>' +
      '<input class="edit-input" placeholder="Period  e.g.  2022 – Present" value="' + escAttr(entry.period) + '" data-field="period" style="margin-top:4px;">' +
      (entries.length > 1
        ? '<button class="btn-add-entry" style="color:#ef4444;border-color:#fecaca;margin-top:4px;" data-remove="' + idx + '">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg> Remove</button>'
        : '');

    wrap.querySelectorAll('[data-field]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        entries[idx][this.dataset.field] = this.value;
      });
    });

    var removeBtn = wrap.querySelector('[data-remove]');
    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        entries.splice(idx, 1);
        container.innerHTML = '';
        entries.forEach(function (e, i) { container.appendChild(makeExpRow(e, i, entries, container)); });
        container._entries = entries;
      });
    }

    return wrap;
  }

  document.querySelector('.edit-icon[data-section="experience"]').addEventListener('click', function () {
    buildExperienceEditUI();
    openSection('experience');
  });

  document.getElementById('add-experience-btn').addEventListener('click', function () {
    var container = document.getElementById('experience-edit-entries');
    var entries = container._entries || [];
    var newEntry = { role: '', company: '', period: '' };
    entries.push(newEntry);
    container.appendChild(makeExpRow(newEntry, entries.length - 1, entries, container));
    container._entries = entries;
  });

  document.querySelector('.btn-cancel-edit[data-section="experience"]').addEventListener('click', function () {
    closeSection('experience');
  });

  document.querySelector('.btn-save-edit[data-section="experience"]').addEventListener('click', function () {
    var container = document.getElementById('experience-edit-entries');
    var entries = container._entries || [];
    data.experience = entries.filter(function (e) { return e.role.trim() || e.company.trim(); });
    renderExperience();
    closeSection('experience');
    flashSaved('experience');
  });

  // ── EDUCATION ──────────────────────────────────────────────
  function renderEducation() {
    var display = document.getElementById('education-display');
    if (data.education.length === 0) {
      display.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No education added yet.</p>';
      return;
    }
    display.innerHTML = data.education.map(function (e) {
      return '<div class="edu-entry">' +
        '<div class="entry-title">' + escHtml(e.degree) + '</div>' +
        '<div class="entry-sub">' + escHtml(e.school) +
          (e.period ? ' &nbsp;·&nbsp; ' + escHtml(e.period) : '') +
        '</div></div>';
    }).join('');
  }

  function buildEducationEditUI() {
    var container = document.getElementById('education-edit-entries');
    container.innerHTML = '';
    var entries = data.education.length > 0
      ? data.education.map(function (e) { return Object.assign({}, e); })
      : [{ degree: '', school: '', period: '' }];

    entries.forEach(function (entry, idx) {
      container.appendChild(makeEduRow(entry, idx, entries, container));
    });
    container._entries = entries;
  }

  function makeEduRow(entry, idx, entries, container) {
    var wrap = document.createElement('div');
    wrap.className = 'edit-entry-group';
    wrap.innerHTML =
      '<div class="edit-entry-fields">' +
        '<input class="edit-input" placeholder="Degree / Course" value="' + escAttr(entry.degree) + '" data-field="degree">' +
        '<input class="edit-input" placeholder="School / University" value="' + escAttr(entry.school) + '" data-field="school">' +
      '</div>' +
      '<input class="edit-input" placeholder="Period  e.g.  2021 – 2025" value="' + escAttr(entry.period) + '" data-field="period" style="margin-top:4px;">' +
      (entries.length > 1
        ? '<button class="btn-add-entry" style="color:#ef4444;border-color:#fecaca;margin-top:4px;" data-remove="' + idx + '">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg> Remove</button>'
        : '');

    wrap.querySelectorAll('[data-field]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        entries[idx][this.dataset.field] = this.value;
      });
    });

    var removeBtn = wrap.querySelector('[data-remove]');
    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        entries.splice(idx, 1);
        container.innerHTML = '';
        entries.forEach(function (e, i) { container.appendChild(makeEduRow(e, i, entries, container)); });
        container._entries = entries;
      });
    }

    return wrap;
  }

  document.querySelector('.edit-icon[data-section="education"]').addEventListener('click', function () {
    buildEducationEditUI();
    openSection('education');
  });

  document.getElementById('add-education-btn').addEventListener('click', function () {
    var container = document.getElementById('education-edit-entries');
    var entries = container._entries || [];
    var newEntry = { degree: '', school: '', period: '' };
    entries.push(newEntry);
    container.appendChild(makeEduRow(newEntry, entries.length - 1, entries, container));
    container._entries = entries;
  });

  document.querySelector('.btn-cancel-edit[data-section="education"]').addEventListener('click', function () {
    closeSection('education');
  });

  document.querySelector('.btn-save-edit[data-section="education"]').addEventListener('click', function () {
    var container = document.getElementById('education-edit-entries');
    var entries = container._entries || [];
    data.education = entries.filter(function (e) { return e.degree.trim() || e.school.trim(); });
    renderEducation();
    closeSection('education');
    flashSaved('education');
  });

  // ── Sanitise helpers ───────────────────────────────────────
  function escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escAttr(str) {
    return (str || '').replace(/"/g, '&quot;');
  }

  // ── Initial render ─────────────────────────────────────────
  renderAbout();
  renderExperience();
  renderEducation();

})();