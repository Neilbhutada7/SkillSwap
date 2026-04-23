// mentor.js – SkillSwap Mentor Profile (v3 — fully dynamic from API)

(function () {
  injectShell('nav-explore');

  // ── Read URL params ────────────────────────────────────────
  var urlParams = new URLSearchParams(window.location.search);
  var mentorId  = parseInt(urlParams.get('id') || '2', 10);
  var sessionId = parseInt(urlParams.get('session') || '1', 10);

  var mentorData = null;
  var sessionData = null;

  // ── Load mentor profile from API ───────────────────────────
  SkillSwapAPI.profile.read(mentorId).then(function (result) {
    if (result && result.success && result.profile) {
      mentorData = result.profile;
      populateMentorUI(mentorData);
      loadSimilarMentors(mentorId);
    }
  });

  // ── Load session data from API ─────────────────────────────
  SkillSwapAPI.sessions.read(sessionId).then(function (result) {
    if (result && result.success && result.session) {
      sessionData = result.session;
      var creditsText = document.getElementById('mentorCreditsText');
      if (creditsText) {
        creditsText.innerHTML = '<strong>' + sessionData.credits_per_session + ' credits</strong> per Hour';
      }
    }
  });

  // ── Populate mentor UI ─────────────────────────────────────
  function populateMentorUI(m) {
    // Name
    var nameEl = document.getElementById('mentorName');
    if (nameEl) nameEl.textContent = m.name;
    document.title = 'SkillSwap – ' + m.name;

    // Avatar
    var avatarEl = document.getElementById('mentorAvatar');
    if (avatarEl) {
      avatarEl.textContent = m.avatar_initial || m.name.charAt(0).toUpperCase();
      avatarEl.style.background = m.avatar_color || '#0d4f47';
    }

    // Role
    var roleEl = document.getElementById('mentorRole');
    if (roleEl) {
      roleEl.innerHTML = escHtml(m.role || '') +
        (m.company ? ' <strong>at ' + escHtml(m.company) + '</strong>' : '');
    }

    // Bio
    var bioText = document.getElementById('bioText');
    if (bioText && m.about) {
      fullBio = m.about;
      shortBio = m.about.split('\n').slice(0, 3).join('\n');
      if (m.about.length > 200) {
        shortBio = m.about.substring(0, 200) + '…';
      }
      bioText.textContent = shortBio;
    }

    // Skills
    var skillsEl = document.getElementById('mentorSkills');
    if (skillsEl && m.skills) {
      var skills = m.skills.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      skillsEl.innerHTML = skills.map(function (s) {
        return '<span class="bg-tag grey">' + escHtml(s) + '</span>';
      }).join('');
    }

    // Languages
    var langEl = document.getElementById('mentorLanguages');
    if (langEl && m.languages) {
      var langs = m.languages.split(',').map(function (l) { return l.trim(); }).filter(Boolean);
      langEl.innerHTML = langs.map(function (l) {
        return '<span class="bg-tag grey">' + escHtml(l) + '</span>';
      }).join('');
    }

    // Open to learn
    var learnEl = document.getElementById('mentorOpenToLearn');
    if (learnEl && m.open_to_learn) {
      var items = m.open_to_learn.split(',').map(function (i) { return i.trim(); }).filter(Boolean);
      learnEl.innerHTML = items.map(function (i) {
        return '<span>' + escHtml(i) + '</span>';
      }).join('');
    }

    // Stats
    var sessCount = document.getElementById('mentorSessionCount');
    if (sessCount) sessCount.textContent = m.sessions_taught || 0;

    var minutes = document.getElementById('mentorMinutes');
    if (minutes) {
      var mins = (m.sessions_taught || 0) * 45;
      minutes.textContent = mins.toLocaleString();
    }

    // Expertise/categories
    var expertEl = document.getElementById('mentorExpertise');
    if (expertEl && m.categories) {
      var cats = m.categories.split(' ').filter(Boolean);
      var colors = { engineering: 'teal', design: 'orange', product: 'teal', ai: 'teal', marketing: 'orange', soft: 'orange' };
      expertEl.innerHTML = cats.map(function (c) {
        var color = colors[c] || 'grey';
        return '<span class="bg-tag ' + color + '">' + capitalize(c) + '</span>';
      }).join('');
    }
  }

  // ── Load similar mentors ───────────────────────────────────
  function loadSimilarMentors(excludeId) {
    SkillSwapAPI.sessions.list().then(function (result) {
      if (!result || !result.success) return;

      var mentors = result.sessions
        .filter(function (s) { return s.mentor_id !== excludeId; })
        .slice(0, 3);

      var container = document.getElementById('similarMentors');
      if (!container) return;
      container.innerHTML = '';

      mentors.forEach(function (s) {
        var item = document.createElement('div');
        item.className = 'similar-mentor-item';
        item.style.cursor = 'pointer';
        item.innerHTML =
          '<div class="similar-mentor-avatar" style="background:' + (s.avatar_color || '#0d9488') + ';">' +
            (s.avatar_initial || s.mentor_name.charAt(0).toUpperCase()) +
          '</div>' +
          '<div>' +
            '<div class="similar-mentor-name">' + escHtml(s.mentor_name) + '</div>' +
            '<div class="similar-mentor-role">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> ' +
              escHtml(s.mentor_role || '') + (s.mentor_company ? ' at ' + escHtml(s.mentor_company) : '') +
            '</div>' +
          '</div>';
        item.addEventListener('click', function () {
          window.location.href = 'mentor.html?id=' + s.mentor_id + '&session=' + s.id;
        });
        container.appendChild(item);
      });
    });
  }

  // ── Tab switching ──────────────────────────────────────────
  var tabs   = document.querySelectorAll('.mentor-tab');
  var panels = document.querySelectorAll('.mentor-tab-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  // ── Like / save button toggle ──────────────────────────────
  var likeBtn = document.getElementById('likeBtn');
  var liked = false;
  likeBtn.addEventListener('click', function () {
    liked = !liked;
    likeBtn.classList.toggle('liked', liked);
    likeBtn.querySelector('svg').setAttribute('fill', liked ? '#ef4444' : 'none');
  });

  // ── Message button ─────────────────────────────────────────
  document.getElementById('msgBtn').addEventListener('click', function () {
    window.location.href = 'messages.html';
  });

  // ── Bio show more/less ─────────────────────────────────────
  var fullBio  = '';
  var shortBio = '';
  var expanded  = false;
  var showMore  = document.getElementById('showMoreBtn');

  showMore.addEventListener('click', function () {
    expanded = !expanded;
    document.getElementById('bioText').textContent = expanded ? fullBio : shortBio;
    showMore.textContent = expanded ? 'Show less' : 'Show more';
  });

  // ── Date / time helpers ────────────────────────────────────
  var dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  var months   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var today    = new Date();
  var selectedDate = 0; // offset from today

  // ── Fetch availability and build UI ────────────────────────
  var sessionSlotsData = {}; // mapped by day_of_week (0-6)
  var datesRow   = document.getElementById('datesRow');
  var timeGrid = document.getElementById('timeGrid');
  var selectedTime = null;
  var bookBtn = document.getElementById('bookBtn');

  function updateBookBtn() {
    var d = new Date(today);
    d.setDate(today.getDate() + selectedDate);
    bookBtn.textContent = 'Book Session for ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  SkinSwapAvailabilityFetch();

  function SkinSwapAvailabilityFetch() {
    SkillSwapAPI.sessions.slots(sessionId).then(function(res) {
      if (res && res.success && res.slots) {
        // Group by day_of_week
        res.slots.forEach(function(slot) {
          if (!sessionSlotsData[slot.day_of_week]) sessionSlotsData[slot.day_of_week] = [];
          sessionSlotsData[slot.day_of_week].push(slot.time_slot);
        });
      }
      buildAvailabilityUI();
    });
  }

  function renderTimeSlotsForDayOffset(offset) {
    timeGrid.innerHTML = '';
    selectedTime = null;
    var d = new Date(today);
    d.setDate(today.getDate() + offset);
    var targetDay = d.getDay();
    var times = sessionSlotsData[targetDay] || [];

    if (times.length === 0) {
      timeGrid.innerHTML = '<span style="color:var(--text-muted);font-size:14px;">No available slots.</span>';
      updateBookBtn();
      return;
    }

    times.forEach(function (t) {
      var btn = document.createElement('button');
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
    updateBookBtn();
  }

  function buildAvailabilityUI() {
    datesRow.innerHTML = '';
    
    // Build 4 days out
    for (var i = 0; i < 4; i++) {
      var d = new Date(today);
      d.setDate(today.getDate() + i);
      var dayOfWeek = d.getDay();
      var slotCount = sessionSlotsData[dayOfWeek] ? sessionSlotsData[dayOfWeek].length : 0;

      var btn = document.createElement('button');
      btn.className = 'mentor-date-btn' + (i === 0 ? ' active' : '');
      if (slotCount === 0) btn.style.opacity = 0.5;

      btn.innerHTML =
        '<span class="mentor-date-day">' + dayNames[dayOfWeek] + '</span>' +
        '<span class="mentor-date-num">'  + d.getDate() + ' ' + months[d.getMonth()] + '</span>' +
        '<span class="mentor-date-slots">' + slotCount + ' slots</span>';

      (function (idx) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.mentor-date-btn').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          selectedDate = idx;
          renderTimeSlotsForDayOffset(idx);
        });
      })(i);

      datesRow.appendChild(btn);
    }

    var viewAll = document.createElement('span');
    viewAll.className = 'mentor-view-all';
    viewAll.innerHTML = 'View all <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
    viewAll.style.cursor = 'pointer';
    datesRow.appendChild(viewAll);
    viewAll.addEventListener('click', function () { openBookingModal(); });

    // Initial render
    renderTimeSlotsForDayOffset(0);
  }

  bookBtn.addEventListener('click', function () {
    if (!selectedTime) { alert('Please select a time slot first.'); return; }
    var d = new Date(today);
    d.setDate(today.getDate() + selectedDate);
    var dateStr = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    var isoDate = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

    bookBtn.disabled = true;
    bookBtn.textContent = 'Booking…';

    SkillSwapAPI.bookings.create({
      session_id: sessionId,
      booking_date: isoDate,
      time_slot: selectedTime
    }).then(function (result) {
      if (result && result.success) {
        var name = mentorData ? mentorData.name : 'Mentor';
        showBookingConfirmed(name, dateStr, selectedTime);
      } else {
        alert('Booking failed: ' + (result ? result.message : 'Unknown error'));
        bookBtn.disabled = false;
        updateBookBtn();
      }
    });
  });

  // ── Booking Modal ──────────────────────────────────────────
  var overlay = document.getElementById('bookingModalOverlay');
  var modalSelectedDate = null;
  var modalSelectedTime = null;

  function openBookingModal() {
    modalSelectedDate = null;
    modalSelectedTime = null;
    document.getElementById('modalConfirmBtn').disabled = true;
    document.getElementById('modalConfirmBtn').textContent = 'Select date & time to book';
    renderModalCalendar();
    renderModalTimes([]);
    overlay.classList.add('active');
  }

  function closeBookingModal() { overlay.classList.remove('active'); }

  document.getElementById('modalCloseBtn').addEventListener('click', closeBookingModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeBookingModal(); });

  function renderModalCalendar() {
    var grid = document.getElementById('modalCalGrid');
    grid.innerHTML = '';
    for (var i = 0; i < 14; i++) {
      var dd = new Date(today);
      dd.setDate(today.getDate() + i);
      var dayOfWeek = dd.getDay();
      var hasSlots = sessionSlotsData[dayOfWeek] && sessionSlotsData[dayOfWeek].length > 0;

      var cell = document.createElement('button');
      cell.className = 'modal-cal-cell';
      if (!hasSlots) {
        cell.style.opacity = 0.5;
      }
      cell.innerHTML =
        '<span class="modal-cal-day">' + dayNames[dayOfWeek] + '</span>' +
        '<span class="modal-cal-num">'  + dd.getDate() + '</span>' +
        '<span class="modal-cal-mon">'  + months[dd.getMonth()] + '</span>';
      
      (function (idx, dateObj, targetDayOfWeek) {
        cell.addEventListener('click', function () {
          grid.querySelectorAll('.modal-cal-cell').forEach(function (c) { c.classList.remove('active'); });
          cell.classList.add('active');
          modalSelectedDate = dateObj;
          var daySlots = sessionSlotsData[targetDayOfWeek] || [];
          renderModalTimes(daySlots);
          updateModalConfirm();
        });
      })(i, dd, dayOfWeek);
      grid.appendChild(cell);
    }
  }

  function renderModalTimes(times) {
    var grid = document.getElementById('modalTimeGrid');
    grid.innerHTML = '';
    modalSelectedTime = null;
    if (times.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;grid-column:1/-1;">Select a date to see available time slots.</p>';
      return;
    }
    times.forEach(function (t) {
      var btn = document.createElement('button');
      btn.className = 'modal-time-btn';
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
    var btn = document.getElementById('modalConfirmBtn');
    btn.disabled = !(modalSelectedDate && modalSelectedTime);
    if (modalSelectedDate && modalSelectedTime) {
      var ds = modalSelectedDate.getDate() + ' ' + months[modalSelectedDate.getMonth()] + ' ' + modalSelectedDate.getFullYear();
      btn.textContent = 'Book — ' + ds + ' at ' + modalSelectedTime;
    } else {
      btn.textContent = 'Select date & time to book';
    }
  }

  document.getElementById('modalConfirmBtn').addEventListener('click', function () {
    var ds = modalSelectedDate.getDate() + ' ' + months[modalSelectedDate.getMonth()] + ' ' + modalSelectedDate.getFullYear();
    var isoDate = modalSelectedDate.getFullYear() + '-' +
      String(modalSelectedDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(modalSelectedDate.getDate()).padStart(2, '0');

    var confirmBtn = document.getElementById('modalConfirmBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Booking…';

    SkillSwapAPI.bookings.create({
      session_id: sessionId,
      booking_date: isoDate,
      time_slot: modalSelectedTime
    }).then(function (result) {
      closeBookingModal();
      if (result && result.success) {
        var name = mentorData ? mentorData.name : 'Mentor';
        showBookingConfirmed(name, ds, modalSelectedTime);
      } else {
        alert('Booking failed: ' + (result ? result.message : 'Unknown error'));
      }
    });
  });

  // ── Booking confirmed toast ────────────────────────────────
  function showBookingConfirmed(mentor, date, time) {
    var toast = document.getElementById('bookingToast');
    document.getElementById('toastMentor').textContent = mentor;
    document.getElementById('toastDate').textContent   = date + ' at ' + time;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
      window.location.href = 'bookings.html';
    }, 2800);
  }

  // ── Reviews ────────────────────────────────────────────────
  var selectedRating = 0;

  // Load reviews from API
  function loadReviews() {
    SkillSwapAPI.reviews.list(mentorId).then(function (result) {
      if (!result || !result.success) return;

      var statsEl = document.getElementById('reviewStats');
      if (statsEl) {
        var stars = '★'.repeat(Math.round(result.avg_rating)) + '☆'.repeat(5 - Math.round(result.avg_rating));
        statsEl.innerHTML = '<span style="color:#fbbf24;">' + stars + '</span> ' +
          result.avg_rating + ' · ' + result.review_count + ' review' + (result.review_count !== 1 ? 's' : '');
      }

      var listEl = document.getElementById('reviewsList');
      if (!listEl) return;

      if (result.reviews.length === 0) {
        listEl.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No reviews yet. Be the first to review!</p>';
        return;
      }

      listEl.innerHTML = '';
      result.reviews.forEach(function (r) {
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var d = new Date(r.created_at);
        var dateStr = months[d.getMonth()] + ' ' + d.getFullYear();
        var stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);

        var item = document.createElement('div');
        item.className = 'review-item';
        item.style.cssText = 'padding:16px 0;border-bottom:1px solid var(--border);';
        item.innerHTML =
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
            '<div style="width:36px;height:36px;border-radius:50%;background:' + (r.avatar_color || 'var(--teal)') + ';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;">' +
              (r.avatar_initial || r.reviewer_name.charAt(0).toUpperCase()) +
            '</div>' +
            '<div style="flex:1;">' +
              '<div style="font-weight:600;font-size:14px;">' + escHtml(r.reviewer_name) + '</div>' +
              '<div style="font-size:12px;color:var(--text-muted);">' + dateStr + '</div>' +
            '</div>' +
            '<div style="color:#fbbf24;font-size:16px;">' + stars + '</div>' +
          '</div>' +
          '<p style="font-size:14px;color:var(--text-muted);line-height:1.6;">' + escHtml(r.review_text) + '</p>';
        listEl.appendChild(item);
      });
    });
  }

  // Star picker
  var starPicker = document.getElementById('starPicker');
  if (starPicker) {
    var stars = starPicker.querySelectorAll('.star-pick');
    stars.forEach(function (star) {
      star.addEventListener('click', function () {
        selectedRating = parseInt(star.dataset.val);
        stars.forEach(function (s) {
          s.style.color = parseInt(s.dataset.val) <= selectedRating ? '#fbbf24' : 'var(--border)';
        });
      });
      star.addEventListener('mouseenter', function () {
        var val = parseInt(star.dataset.val);
        stars.forEach(function (s) {
          s.style.color = parseInt(s.dataset.val) <= val ? '#fbbf24' : 'var(--border)';
        });
      });
      star.addEventListener('mouseleave', function () {
        stars.forEach(function (s) {
          s.style.color = parseInt(s.dataset.val) <= selectedRating ? '#fbbf24' : 'var(--border)';
        });
      });
    });
  }

  // Submit review
  var submitBtn = document.getElementById('submitReviewBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      var text = document.getElementById('reviewText').value.trim();
      if (selectedRating === 0) { alert('Please select a star rating.'); return; }
      if (!text) { alert('Please write a review.'); return; }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';

      SkillSwapAPI.reviews.create({
        mentor_id:   mentorId,
        session_id:  sessionId,
        rating:      selectedRating,
        review_text: text
      }).then(function (result) {
        if (result && result.success) {
          document.getElementById('reviewText').value = '';
          selectedRating = 0;
          starPicker.querySelectorAll('.star-pick').forEach(function (s) {
            s.style.color = 'var(--border)';
          });
          loadReviews();
          submitBtn.textContent = '✓ Review submitted!';
          setTimeout(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Review';
          }, 2000);
        } else {
          alert('Failed: ' + (result ? result.message : 'Unknown error'));
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Review';
        }
      });
    });
  }

  loadReviews();

  // ── Helpers ────────────────────────────────────────────────
  function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

})();