// home.js – SkillSwap Home Page (v2 — API-backed dashboard)

(function () {
  injectShell('nav-home');

  // ── Dismiss setup card ─────────────────────────────────────
  var setupClose = document.getElementById('setupClose');
  var setupCard  = document.getElementById('setupCard');
  if (setupClose && setupCard) {
    setupClose.addEventListener('click', function () {
      setupCard.style.display = 'none';
    });
  }

  // ── Start Teaching ─────────────────────────────────────────
  var btnTeach = document.querySelector('.btn-teach');
  if (btnTeach) {
    btnTeach.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'teach.html';
    });
  }

  // ── Welcome message ────────────────────────────────────────
  var welcomeEl = document.querySelector('.home-welcome h1');
  var subtitleEl = document.querySelector('.home-welcome p');

  SkillSwapAPI.auth.check().then(function (result) {
    if (result && result.authenticated) {
      var firstName = result.user.name.split(' ')[0];
      if (welcomeEl) welcomeEl.textContent = 'Welcome, ' + firstName;
    }
  });

  // ── Load upcoming bookings ─────────────────────────────────
  var bookingsSection = document.getElementById('upcomingBookingsSection');
  var bookingsList    = document.getElementById('upcomingBookingsList');

  SkillSwapAPI.bookings.list('upcoming').then(function (result) {
    if (result && result.success && result.bookings && result.bookings.length > 0) {
      bookingsSection.style.display = '';
      subtitleEl.textContent = 'You have ' + result.bookings.length + ' upcoming session' + (result.bookings.length > 1 ? 's' : '');

      result.bookings.forEach(function (b) {
        var card = document.createElement('div');
        card.style.cssText = 'display:flex;align-items:center;gap:14px;padding:14px;border:1px solid var(--border);border-radius:12px;margin-bottom:10px;background:var(--white);';

        card.innerHTML =
          '<div style="width:40px;height:40px;border-radius:50%;background:' + (b.avatar_color || '#0d9488') + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:15px;flex-shrink:0;">' +
            (b.avatar_initial || b.mentor_name.charAt(0).toUpperCase()) +
          '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-weight:600;font-size:14px;">' + escHtml(b.session_title) + '</div>' +
            '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">' +
              'with ' + escHtml(b.mentor_name) + ' · ' + formatDate(b.booking_date) + ' · ' + escHtml(b.time_slot) +
            '</div>' +
          '</div>' +
          '<span style="padding:4px 10px;border-radius:16px;font-size:11px;font-weight:600;background:#0d948815;color:#0d9488;">Upcoming</span>';

        bookingsList.appendChild(card);
      });
    } else {
      subtitleEl.textContent = 'You have no upcoming sessions';
    }
  });

  // ── Load my published sessions (as mentor) ─────────────────
  var sessionsSection = document.getElementById('mySessionsSection');
  var sessionsList    = document.getElementById('mySessionsList');

  SkillSwapAPI.sessions.list({ mine: '1' }).then(function (result) {
    if (result && result.success && result.sessions) {
      // Filter to only user's own sessions
      var user = getCurrentUser();
      var myId = user ? user.id : 0;

      var mySessions = result.sessions.filter(function (s) {
        return s.mentor_id === myId;
      });

      if (mySessions.length > 0) {
        sessionsSection.style.display = '';

        mySessions.forEach(function (s) {
          var card = document.createElement('div');
          card.style.cssText = 'display:flex;align-items:center;gap:14px;padding:14px;border:1px solid var(--border);border-radius:12px;margin-bottom:10px;background:var(--white);cursor:pointer;transition:border-color 0.15s;';

          card.innerHTML =
            '<div style="width:40px;height:40px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' +
            '</div>' +
            '<div style="flex:1;min-width:0;">' +
              '<div style="font-weight:600;font-size:14px;">' + escHtml(s.title) + '</div>' +
              '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">' +
                escHtml(s.skill) + ' · ' + s.credits_per_session + ' credits/session · ' + s.duration_minutes + ' min' +
              '</div>' +
            '</div>' +
            '<span style="padding:4px 10px;border-radius:16px;font-size:11px;font-weight:600;background:#10b98115;color:#10b981;">Active</span>';

          card.addEventListener('mouseover', function () { card.style.borderColor = 'var(--teal)'; });
          card.addEventListener('mouseout', function () { card.style.borderColor = 'var(--border)'; });

          sessionsList.appendChild(card);
        });
      }
    }
  });

  // ── Helpers ────────────────────────────────────────────────
  function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var days   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
  }

})();