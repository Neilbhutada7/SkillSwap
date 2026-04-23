// teach.js – SkillSwap Host a Session Page (v2 — API-backed)

(function () {
  injectShell('nav-home');

  // ── Build days row (Mon–Sun for current week) ─────────────
  var days    = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  var today   = new Date();
  var dayOfWeek = today.getDay();
  var monday  = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  var daysRow = document.getElementById('daysRow');
  var selectedDay = today.getDay() === 0 ? 6 : today.getDay() - 1;

  days.forEach(function (name, i) {
    var d = new Date(monday);
    d.setDate(monday.getDate() + i);

    var btn = document.createElement('button');
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

  // ── Build preset time slots ────────────────────────────────
  var slots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
  var slotsGrid = document.getElementById('slotsGrid');

  function createSlotBtn(time, isCustom) {
    var btn = document.createElement('button');
    btn.className = 'time-slot' + (isCustom ? ' custom-added' : '');
    btn.textContent = time;

    btn.addEventListener('click', function () {
      btn.classList.toggle('active');
    });

    if (isCustom) {
      var removeBtn = document.createElement('button');
      removeBtn.className = 'slot-remove';
      removeBtn.textContent = '✕';
      removeBtn.title = 'Remove';
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        btn.remove();
      });
      btn.appendChild(removeBtn);
    }

    return btn;
  }

  slots.forEach(function (time) {
    slotsGrid.appendChild(createSlotBtn(time, false));
  });

  // ── Custom time slot dropdowns ────────────────────────────
  var hourSel   = document.getElementById('customHour');
  var minSel    = document.getElementById('customMinute');
  var ampmSel   = document.getElementById('customAmPm');
  var addCustomSlotBtn = document.getElementById('addCustomSlotBtn');

  for (var h = 1; h <= 12; h++) {
    var opt = document.createElement('option');
    opt.value = h;
    opt.textContent = h;
    if (h === 9) opt.selected = true;
    hourSel.appendChild(opt);
  }

  ['00', '15', '30', '45'].forEach(function (m) {
    var opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    minSel.appendChild(opt);
  });

  addCustomSlotBtn.addEventListener('click', function () {
    var h      = hourSel.value;
    var m      = minSel.value;
    var ampm   = ampmSel.value;
    var formatted = h + ':' + m + ' ' + ampm;

    var existing = Array.from(slotsGrid.querySelectorAll('.time-slot')).map(function (b) {
      return b.childNodes[0].textContent.trim();
    });
    if (existing.includes(formatted)) {
      addCustomSlotBtn.style.background = '#ef4444';
      setTimeout(function () { addCustomSlotBtn.style.background = ''; }, 1200);
      return;
    }

    var btn = createSlotBtn(formatted, true);
    btn.classList.add('active');
    slotsGrid.appendChild(btn);
  });

  // ── Customisable credits ───────────────────────────────────
  var creditsValEl   = document.getElementById('creditsVal');
  var previewCredits = document.getElementById('previewCredits');
  var creditsAmount = 10;

  function updateCreditsDisplay() {
    creditsValEl.textContent   = creditsAmount;
    previewCredits.textContent = creditsAmount + ' credits';
  }

  document.getElementById('creditsDecBtn').addEventListener('click', function () {
    if (creditsAmount > 1) { creditsAmount--; updateCreditsDisplay(); }
  });
  document.getElementById('creditsIncBtn').addEventListener('click', function () {
    if (creditsAmount < 100) { creditsAmount++; updateCreditsDisplay(); }
  });

  // ── Live preview update ────────────────────────────────────
  var titleInput = document.getElementById('titleInput');
  var skillInput = document.getElementById('skillInput');
  var previewTitle = document.getElementById('previewTitle');
  var previewCat   = document.getElementById('previewCat');

  titleInput.addEventListener('input', function () {
    previewTitle.textContent = this.value.trim() || 'Session Title';
  });

  skillInput.addEventListener('input', function () {
    var val = this.value.trim() || 'Skill Category';
    previewCat.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ' + val;
  });

  // ── Publish Session ────────────────────────────────────────
  document.getElementById('publishBtn').addEventListener('click', function () {
    var title = titleInput.value.trim();
    var skill = skillInput.value.trim();
    var desc  = (document.getElementById('descInput') || {}).value || '';

    if (!title || !skill) {
      if (!skill) { skillInput.focus(); skillInput.style.borderColor = '#ef4444'; }
      if (!title) { titleInput.focus(); titleInput.style.borderColor = '#ef4444'; }
      setTimeout(function () {
        titleInput.style.borderColor = '';
        skillInput.style.borderColor = '';
      }, 1500);
      return;
    }

    var selectedSlots = Array.from(document.querySelectorAll('.time-slot.active'))
      .map(function (s) { return s.childNodes[0].textContent.trim(); });

    if (selectedSlots.length === 0) {
      alert('Please select at least one time slot before publishing.');
      return;
    }

    // Build slots array for API
    var slotsData = selectedSlots.map(function (time) {
      // Map selectedDay (0=Mon..6=Sun) to DB day_of_week (0=Sun..6=Sat)
      var dbDay = (selectedDay + 1) % 7;
      return { day_of_week: dbDay, time_slot: time };
    });

    // Call API to create session
    var publishBtn = document.getElementById('publishBtn');
    publishBtn.disabled = true;
    publishBtn.textContent = 'Publishing…';

    SkillSwapAPI.sessions.create({
      title: title,
      skill: skill,
      description: desc,
      credits_per_session: creditsAmount,
      slots: slotsData
    }).then(function (result) {
      if (result && result.success) {
        // Credit earned for teaching (server handles it)
        adjustCredits(creditsAmount);
        alert('Session published!\n\nTitle: ' + title + '\nSkill: ' + skill + '\nSlots: ' + selectedSlots.join(', ') + '\nCredits per session: ' + creditsAmount);
        window.location.href = 'home.html';
      } else {
        alert('Failed to publish session: ' + (result ? result.message : 'Unknown error'));
        publishBtn.disabled = false;
        publishBtn.textContent = 'Publish Session';
      }
    });
  });

})();