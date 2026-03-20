// mentor.js – SkillSwap Mentor Profile Page

(function () {
  injectShell('nav-explore');

  // ── Tab switching ─────────────────────────────────────────
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

  // ── Like / save button toggle ─────────────────────────────
  const likeBtn = document.getElementById('likeBtn');
  let liked = false;
  likeBtn.addEventListener('click', function () {
    liked = !liked;
    likeBtn.classList.toggle('liked', liked);
    likeBtn.querySelector('svg').setAttribute('fill', liked ? '#ef4444' : 'none');
  });

  // ── Message button ────────────────────────────────────────
  document.getElementById('msgBtn').addEventListener('click', function () {
    window.location.href = 'messages.html';
  });

  // ── Show more bio ─────────────────────────────────────────
  const fullBio = `Ronakkumar Bathani is a highly experienced Data Engineer with over 16 years in IT,
specialising in Data Warehousing and Business Intelligence across healthcare,
telecommunication and financial services sectors. He has deep expertise in building
scalable data pipelines, cloud-based data warehousing on AWS and Azure, and mentoring
junior engineers. He is passionate about sharing practical, real-world knowledge that
goes beyond textbooks.`;

  const shortBio = fullBio.split('\n').slice(0, 3).join('\n');
  const bioText  = document.getElementById('bioText');
  const showMore = document.getElementById('showMoreBtn');
  let   expanded = false;

  bioText.textContent = shortBio;

  showMore.addEventListener('click', function () {
    expanded = !expanded;
    bioText.textContent   = expanded ? fullBio : shortBio;
    showMore.textContent  = expanded ? 'Show less' : 'Show more';
  });

  // ── Build dates row (4 days from today) ───────────────────
  const datesRow = document.getElementById('datesRow');
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today    = new Date();
  let   selectedDate = 0;

  const slotCounts = [10, 94, 94, 94];

  for (let i = 0; i < 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const btn = document.createElement('button');
    btn.className = 'mentor-date-btn' + (i === 0 ? ' active' : '');
    btn.innerHTML =
      '<span class="mentor-date-day">' + dayNames[d.getDay()] + '</span>' +
      '<span class="mentor-date-num">' + d.getDate() + ' ' + months[d.getMonth()] + '</span>' +
      '<span class="mentor-date-slots">' + slotCounts[i] + ' slots</span>';

    (function (idx) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.mentor-date-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        selectedDate = idx;
        updateBookBtn();
      });
    })(i);

    datesRow.appendChild(btn);
  }

  // View all link
  const viewAll = document.createElement('span');
  viewAll.className = 'mentor-view-all';
  viewAll.innerHTML = 'View all <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
  datesRow.appendChild(viewAll);

  // ── Build time slots ──────────────────────────────────────
  const times = ['9:30 PM', '9:45 PM', '10:00 PM', '10:15 PM', '10:30 PM', '10:45 PM'];
  const timeGrid = document.getElementById('timeGrid');
  let   selectedTime = null;

  times.forEach(function (t) {
    const btn = document.createElement('button');
    btn.className    = 'mentor-time-btn';
    btn.textContent  = t;
    btn.addEventListener('click', function () {
      document.querySelectorAll('.mentor-time-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      selectedTime = t;
      updateBookBtn();
    });
    timeGrid.appendChild(btn);
  });

  // ── Book button label update ──────────────────────────────
  const bookBtn  = document.getElementById('bookBtn');
  const months2  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function updateBookBtn() {
    const d = new Date(today);
    d.setDate(today.getDate() + selectedDate);
    bookBtn.textContent = 'Book Session for ' + d.getDate() + ' ' + months2[d.getMonth()] + ' ' + d.getFullYear();
  }
  updateBookBtn();

  bookBtn.addEventListener('click', function () {
    if (!selectedTime) {
      alert('Please select a time slot first.');
      return;
    }
    const d = new Date(today);
    d.setDate(today.getDate() + selectedDate);
    const dateStr = d.getDate() + ' ' + months2[d.getMonth()] + ' ' + d.getFullYear();
    alert('Session booked!\n\nMentor: Ronakkumar Bathani\nDate: ' + dateStr + '\nTime: ' + selectedTime + '\n\nCheck your Bookings page for details.');
    window.location.href = 'bookings.html';
  });

})();
