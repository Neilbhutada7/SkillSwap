// mentor.js – SkillSwap Mentor Profile Page

(function () {
  injectShell('nav-explore');

  // ── Tab switching ──────────────────────────────────────────
  const tabs   = document.querySelectorAll('.mentor-tab');
  const panels = document.querySelectorAll('.mentor-tab-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      const panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  // ── Like / save button toggle ──────────────────────────────
  const likeBtn = document.getElementById('likeBtn');
  let liked = false;
  likeBtn.addEventListener('click', function () {
    liked = !liked;
    likeBtn.classList.toggle('liked', liked);
    likeBtn.querySelector('svg').setAttribute('fill', liked ? '#ef4444' : 'none');
  });

  // ── Message button ─────────────────────────────────────────
  document.getElementById('msgBtn').addEventListener('click', function () {
    window.location.href = 'messages.html';
  });

  // ── Show more bio ──────────────────────────────────────────
  const fullBio = `Ronakkumar Bathani is a highly experienced Data Engineer with over 16 years in IT,\nspecialising in Data Warehousing and Business Intelligence across healthcare,\ntelecommunication and financial services sectors. He has deep expertise in building\nscalable data pipelines, cloud-based data warehousing on AWS and Azure, and mentoring\njunior engineers. He is passionate about sharing practical, real-world knowledge that\ngoes beyond textbooks.`;

  const shortBio = fullBio.split('\n').slice(0, 3).join('\n');
  const bioText  = document.getElementById('bioText');
  const showMore = document.getElementById('showMoreBtn');
  let   expanded = false;

  bioText.textContent = shortBio;
  showMore.addEventListener('click', function () {
    expanded = !expanded;
    bioText.textContent  = expanded ? fullBio : shortBio;
    showMore.textContent = expanded ? 'Show less' : 'Show more';
  });

  // ── Date / time helpers ────────────────────────────────────
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today    = new Date();
  let   selectedDate = 0;

  // ── Build inline dates row (4 days) ───────────────────────
  const datesRow   = document.getElementById('datesRow');
  const slotCounts = [10, 94, 94, 94];

  for (let i = 0; i < 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const btn = document.createElement('button');
    btn.className = 'mentor-date-btn' + (i === 0 ? ' active' : '');
    btn.innerHTML =
      '<span class="mentor-date-day">' + dayNames[d.getDay()] + '</span>' +
      '<span class="mentor-date-num">'  + d.getDate() + ' ' + months[d.getMonth()] + '</span>' +
      '<span class="mentor-date-slots">' + slotCounts[i] + ' slots</span>';

    (function (idx) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.mentor-date-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selectedDate = idx;
        updateBookBtn();
      });
    })(i);

    datesRow.appendChild(btn);
  }

  // View all → opens modal
  const viewAll = document.createElement('span');
  viewAll.className = 'mentor-view-all';
  viewAll.innerHTML = 'View all <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
  viewAll.style.cursor = 'pointer';
  datesRow.appendChild(viewAll);

  viewAll.addEventListener('click', function () {
    openBookingModal();
  });

  // ── Build inline time slots ────────────────────────────────
  const times    = ['9:30 PM', '9:45 PM', '10:00 PM', '10:15 PM', '10:30 PM', '10:45 PM'];
  const timeGrid = document.getElementById('timeGrid');
  let   selectedTime = null;

  times.forEach(function (t) {
    const btn = document.createElement('button');
    btn.className   = 'mentor-time-btn';
    btn.textContent = t;
    btn.addEventListener('click', function () {
      document.querySelectorAll('.mentor-time-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedTime = t;
      updateBookBtn();
    });
    timeGrid.appendChild(btn);
  });

  // ── Book button ────────────────────────────────────────────
  const bookBtn = document.getElementById('bookBtn');

  function updateBookBtn() {
    const d = new Date(today);
    d.setDate(today.getDate() + selectedDate);
    bookBtn.textContent = 'Book Session for ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }
  updateBookBtn();

  bookBtn.addEventListener('click', function () {
    if (!selectedTime) {
      alert('Please select a time slot first.');
      return;
    }
    const d = new Date(today);
    d.setDate(today.getDate() + selectedDate);
    const dateStr = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    showBookingConfirmed('Ronakkumar Bathani', dateStr, selectedTime);
  });

  // ── Booking Modal (View All) ───────────────────────────────
  const overlay = document.getElementById('bookingModalOverlay');

  let modalSelectedDate = null;
  let modalSelectedTime = null;

  function openBookingModal() {
    modalSelectedDate = null;
    modalSelectedTime = null;
    document.getElementById('modalConfirmBtn').disabled = true;
    document.getElementById('modalConfirmBtn').textContent = 'Select date & time to book';
    renderModalCalendar();
    renderModalTimes([]);
    overlay.classList.add('active');
  }

  function closeBookingModal() {
    overlay.classList.remove('active');
  }

  document.getElementById('modalCloseBtn').addEventListener('click', closeBookingModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeBookingModal();
  });

  function renderModalCalendar() {
    const grid = document.getElementById('modalCalGrid');
    grid.innerHTML = '';

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const cell = document.createElement('button');
      cell.className = 'modal-cal-cell';
      cell.innerHTML =
        '<span class="modal-cal-day">' + dayNames[d.getDay()] + '</span>' +
        '<span class="modal-cal-num">'  + d.getDate() + '</span>' +
        '<span class="modal-cal-mon">'  + months[d.getMonth()] + '</span>';

      (function (idx, dateObj) {
        cell.addEventListener('click', function () {
          grid.querySelectorAll('.modal-cal-cell').forEach(function (c) { c.classList.remove('active'); });
          cell.classList.add('active');
          modalSelectedDate = dateObj;

          const allTimes = ['8:00 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM',
                            '11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM',
                            '4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM',
                            '9:00 PM','9:30 PM','9:45 PM','10:00 PM','10:30 PM'];
          const daySlots = allTimes.filter(function (_, ti) {
            return (ti + idx) % 3 !== 0;
          });
          renderModalTimes(daySlots);
          updateModalConfirm();
        });
      })(i, d);

      grid.appendChild(cell);
    }
  }

  function renderModalTimes(times) {
    const grid = document.getElementById('modalTimeGrid');
    grid.innerHTML = '';
    modalSelectedTime = null;

    if (times.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;grid-column:1/-1;">Select a date to see available time slots.</p>';
      return;
    }

    times.forEach(function (t) {
      const btn = document.createElement('button');
      btn.className   = 'modal-time-btn';
      btn.textContent = t;
      btn.addEventListener('click', function () {
        grid.querySelectorAll('.modal-time-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        modalSelectedTime = t;
        updateModalConfirm();
      });
      grid.appendChild(btn);
    });
  }

  function updateModalConfirm() {
    const btn = document.getElementById('modalConfirmBtn');
    btn.disabled = !(modalSelectedDate && modalSelectedTime);
    if (modalSelectedDate && modalSelectedTime) {
      const ds = modalSelectedDate.getDate() + ' ' + months[modalSelectedDate.getMonth()] + ' ' + modalSelectedDate.getFullYear();
      btn.textContent = 'Book — ' + ds + ' at ' + modalSelectedTime;
    } else {
      btn.textContent = 'Select date & time to book';
    }
  }

  document.getElementById('modalConfirmBtn').addEventListener('click', function () {
    const ds = modalSelectedDate.getDate() + ' ' + months[modalSelectedDate.getMonth()] + ' ' + modalSelectedDate.getFullYear();
    closeBookingModal();
    showBookingConfirmed('Ronakkumar Bathani', ds, modalSelectedTime);
  });

  // ── Booking confirmed toast (no credit deduction) ──────────
  function showBookingConfirmed(mentor, date, time) {
    const toast = document.getElementById('bookingToast');
    document.getElementById('toastMentor').textContent = mentor;
    document.getElementById('toastDate').textContent   = date + ' at ' + time;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
      window.location.href = 'bookings.html';
    }, 2800);
  }

})();