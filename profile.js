// profile.js – SkillSwap Profile Page (v2 — API-backed)

(function () {
  injectShell('nav-profile');

  // ── Tab switching ──────────────────────────────────────────
  var profileTabs = document.getElementById('profileTabs');
  var tabPanelIds = ['overview', 'commendations', 'achievements', 'mentors'];

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

  // ── Edit Profile Modal ──────────────────────────────────────
  var editModal = document.createElement('div');
  editModal.id = 'editProfileModal';
  editModal.className = 'modal-overlay';
  editModal.innerHTML =
    '<div class="modal" style="max-width:520px;">' +
      '<button class="modal-close" id="editModalClose">&times;</button>' +
      '<h2 style="font-size:22px;margin-bottom:20px;">Edit Profile</h2>' +
      '<label class="modal-label">Full Name</label>' +
      '<input class="modal-input" id="editName" placeholder="Your name">' +
      '<label class="modal-label">Role / Title</label>' +
      '<input class="modal-input" id="editRole" placeholder="e.g. Software Engineer">' +
      '<label class="modal-label">Company / School</label>' +
      '<input class="modal-input" id="editCompany" placeholder="e.g. Google">' +
      '<label class="modal-label">Skills (comma-separated)</label>' +
      '<input class="modal-input" id="editSkills" placeholder="e.g. React, Node.js, Python">' +
      '<label class="modal-label">Languages (comma-separated)</label>' +
      '<input class="modal-input" id="editLanguages" placeholder="e.g. English, Hindi">' +
      '<label class="modal-label">Open to Learn (comma-separated)</label>' +
      '<input class="modal-input" id="editOpenToLearn" placeholder="e.g. Cooking, Guitar">' +
      '<button class="btn-email-continue" id="editSaveBtn" style="margin-top:8px;">Save Changes</button>' +
    '</div>';
  document.body.appendChild(editModal);

  document.getElementById('editProfileBtn').addEventListener('click', function () {
    var user = getCurrentUser();
    if (user) {
      document.getElementById('editName').value = user.name || '';
      document.getElementById('editRole').value = user.role || '';
      document.getElementById('editCompany').value = user.company || '';
    }
    // Load full profile for skills/languages
    SkillSwapAPI.profile.read().then(function (result) {
      if (result && result.success && result.profile) {
        document.getElementById('editSkills').value = result.profile.skills || '';
        document.getElementById('editLanguages').value = result.profile.languages || '';
        document.getElementById('editOpenToLearn').value = result.profile.open_to_learn || '';
      }
    });
    editModal.classList.add('active');
  });

  document.getElementById('editModalClose').addEventListener('click', function () {
    editModal.classList.remove('active');
  });
  editModal.addEventListener('click', function (e) {
    if (e.target === editModal) editModal.classList.remove('active');
  });

  document.getElementById('editSaveBtn').addEventListener('click', function () {
    var btn = document.getElementById('editSaveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    var payload = {
      name: document.getElementById('editName').value.trim(),
      role: document.getElementById('editRole').value.trim(),
      company: document.getElementById('editCompany').value.trim(),
      skills: document.getElementById('editSkills').value.trim(),
      languages: document.getElementById('editLanguages').value.trim(),
      open_to_learn: document.getElementById('editOpenToLearn').value.trim()
    };

    SkillSwapAPI.profile.update(payload).then(function (result) {
      if (result && result.success) {
        // Update displayed UI
        var p = result.profile;
        document.querySelector('.profile-name').textContent = p.name;
        document.querySelector('.profile-role').innerHTML = p.role + (p.company ? ' <span>at ' + escHtml(p.company) + '</span>' : '');
        document.querySelector('.profile-avatar').childNodes[0].textContent = p.avatar_initial || p.name.charAt(0).toUpperCase();

        // Update cached user
        var user = getCurrentUser();
        if (user) {
          user.name = p.name;
          user.role = p.role;
          user.company = p.company;
          setCurrentUser(user);
        }

        editModal.classList.remove('active');
        btn.disabled = false;
        btn.textContent = 'Save Changes';
      } else {
        alert('Failed: ' + (result ? result.message : 'Unknown error'));
        btn.disabled = false;
        btn.textContent = 'Save Changes';
      }
    });
  });

  document.getElementById('avatarEditBtn').addEventListener('click', function (e) {
    e.stopPropagation(); // prevent edit profile from triggering if we had overlapping listeners
    document.getElementById('avatarFileInput').click();
  });

  document.getElementById('avatarFileInput').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Max size is 2MB.');
      return;
    }

    var formData = new FormData();
    formData.append('avatar', file);

    var avatarBlock = document.getElementById('profileAvatarBlock');
    var oldContent = avatarBlock.innerHTML;
    avatarBlock.innerHTML = '<div style="font-size:14px;color:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;width:100%;height:100%;">...</div>';

    SkillSwapAPI.profile.uploadAvatar(formData).then(function (res) {
      if (res && res.success) {
        // update cached user
        var u = getCurrentUser();
        if (u) {
          u.avatar_url = res.avatar_url;
          setCurrentUser(u);
        }
        // update UI
        avatarBlock.innerHTML = '<img src="' + res.avatar_url + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />' +
          '<div class="avatar-edit" id="avatarEditBtn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>';
        
        // reattach listener
        document.getElementById('avatarEditBtn').addEventListener('click', function(ev) {
          ev.stopPropagation();
          document.getElementById('avatarFileInput').click();
        });

        // also update sidebar avatar if possible
        var sidebarAvatar = document.querySelector('.sidebar-avatar');
        if (sidebarAvatar) {
          sidebarAvatar.innerHTML = '<img src="' + res.avatar_url + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />';
        }
      } else {
        avatarBlock.innerHTML = oldContent;
        alert('Upload failed: ' + (res ? res.message : 'Unknown error'));
        document.getElementById('avatarEditBtn').addEventListener('click', function(ev) {
          ev.stopPropagation();
          document.getElementById('avatarFileInput').click();
        });
      }
    });
  });

  document.querySelector('.profile-strength-card-alt').addEventListener('click', function () {
    alert('Complete your profile to level up!\n\n• Add about info\n• Add experience\n• Add education\n• Book a session');
  });

  // ── Profile data (loaded from API) ─────────────────────────
  var data = {
    about:      '',
    experience: [],
    education:  []
  };

  // Load profile from API
  SkillSwapAPI.profile.read().then(function (result) {
    if (result && result.success && result.profile) {
      var p = result.profile;
      data.about      = p.about || '';
      data.experience = p.experience || [];
      data.education  = p.education || [];

      // Update displayed name, role, credits
      var nameEl = document.querySelector('.profile-name');
      if (nameEl) nameEl.textContent = p.name;

      var roleEl = document.querySelector('.profile-role');
      if (roleEl) roleEl.innerHTML = p.role + (p.company ? ' <span>at ' + escHtml(p.company) + '</span>' : '');

      var avatarEl = document.querySelector('.profile-avatar');
      if (avatarEl) {
        if (p.avatar_url) {
          avatarEl.innerHTML = '<img src="' + p.avatar_url + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />' +
            '<div class="avatar-edit" id="avatarEditBtn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>';
          // Re-bind the click event listener for the edit button because we just overwrote the HTML
          document.getElementById('avatarEditBtn').addEventListener('click', function (e) {
            e.stopPropagation();
            document.getElementById('avatarFileInput').click();
          });
        } else {
          avatarEl.childNodes[0].textContent = p.avatar_initial || p.name.charAt(0).toUpperCase();
        }
      }

      renderAbout();
      renderExperience();
      renderEducation();
      syncCreditsUI();
    }
  });

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
    void sec.offsetWidth;
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

    // Save to API
    SkillSwapAPI.profile.update({ about: data.about });
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

    // Save to API
    SkillSwapAPI.profile.update({ experience: data.experience });
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

    // Save to API
    SkillSwapAPI.profile.update({ education: data.education });
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