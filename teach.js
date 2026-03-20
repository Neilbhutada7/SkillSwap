// teach.js – SkillSwap Host a Session Page

(function () {
  injectShell('nav-home');

  // ── Build days row (Mon–Sun for current week) ─────────────
  const days    = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const today   = new Date();
  // Find Monday of this week
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday  = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const daysRow = document.getElementById('daysRow');
  let selectedDay = today.getDay() === 0 ? 6 : today.getDay() - 1; // default today

  days.forEach(function (name, i) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const btn = document.createElement('button');
    btn.className = 'day-btn' + (i === selectedDay ? ' active' : '');
    btn.innerHTML =
      '<span class="day-name">' + name + '</span>' +
      '<span class="day-num">'  + d.getDate() + '</span>';

    btn.addEventListener('click', function () {
      document.querySelectorAll('.day-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedDay = i;
    });

    daysRow.appendChild(btn);
  });

  // ── Build time slots ──────────────────────────────────────
  const slots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
  const slotsGrid = document.getElementById('slotsGrid');

  slots.forEach(function (time) {
    const btn = document.createElement('button');
    btn.className = 'time-slot';
    btn.textContent = time;
    btn.addEventListener('click', function () {
      btn.classList.toggle('active');
    });
    slotsGrid.appendChild(btn);
  });

  // ── Session type toggle ───────────────────────────────────
  const btn1on1    = document.getElementById('btn1on1');
  const btnGroup   = document.getElementById('btnGroup');
  const creditsLbl = document.getElementById('creditsLabel');
  const prevCredits = document.getElementById('previewCredits');

  btn1on1.addEventListener('click', function () {
    btn1on1.classList.add('active');
    btnGroup.classList.remove('active');
    creditsLbl.textContent  = '+10 credits';
    prevCredits.textContent = '+10 credits';
  });

  btnGroup.addEventListener('click', function () {
    btnGroup.classList.add('active');
    btn1on1.classList.remove('active');
    creditsLbl.textContent  = '+15 credits';
    prevCredits.textContent = '+15 credits';
  });

  // ── Live preview update ───────────────────────────────────
  const titleInput = document.getElementById('titleInput');
  const skillInput = document.getElementById('skillInput');
  const previewTitle = document.getElementById('previewTitle');
  const previewCat   = document.getElementById('previewCat');

  titleInput.addEventListener('input', function () {
    previewTitle.textContent = this.value.trim() || 'Session Title';
  });

  skillInput.addEventListener('input', function () {
    const val = this.value.trim() || 'Skill Category';
    previewCat.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ' + val;
  });

  // ── Save Draft ────────────────────────────────────────────
  document.getElementById('saveDraftBtn').addEventListener('click', function () {
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      titleInput.style.borderColor = '#ef4444';
      setTimeout(function () { titleInput.style.borderColor = ''; }, 1500);
      return;
    }
    alert('Draft saved: "' + title + '"');
  });

  // ── Publish Session ───────────────────────────────────────
  document.getElementById('publishBtn').addEventListener('click', function () {
    const title = titleInput.value.trim();
    const skill = skillInput.value.trim();
    const desc  = document.getElementById('descInput').value.trim();

    if (!title || !skill) {
      if (!skill) { skillInput.focus(); skillInput.style.borderColor = '#ef4444'; }
      if (!title) { titleInput.focus(); titleInput.style.borderColor = '#ef4444'; }
      setTimeout(function () {
        titleInput.style.borderColor = '';
        skillInput.style.borderColor = '';
      }, 1500);
      return;
    }

    const selectedSlots = Array.from(document.querySelectorAll('.time-slot.active'))
      .map(function (s) { return s.textContent; });

    if (selectedSlots.length === 0) {
      alert('Please select at least one time slot before publishing.');
      return;
    }

    alert('Session published!\n\nTitle: ' + title + '\nSkill: ' + skill + '\nSlots: ' + selectedSlots.join(', '));
    window.location.href = 'home.html';
  });

})();
