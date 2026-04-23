// bookings.js – SkillSwap Bookings Page (v2 — API-backed, fixed selectors)

(function () {
  injectShell('nav-bookings');

  // ── DOM refs (matching bookings.html) ──────────────────────
  var upcomingList = document.getElementById('bookingListUpcoming');
  var historyList  = document.getElementById('bookingListHistory');
  var tabBtns      = document.querySelectorAll('#bookingTabs .tab-btn');
  var tabPanels    = {
    upcoming: document.getElementById('tab-upcoming'),
    history:  document.getElementById('tab-history')
  };
  var currentTab = 'upcoming';

  // ── Tab switching ──────────────────────────────────────────
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTab = btn.dataset.tab;

      // Show/hide panels
      Object.keys(tabPanels).forEach(function (key) {
        if (tabPanels[key]) {
          tabPanels[key].style.display = (key === currentTab) ? '' : 'none';
        }
      });

      // Load data for this tab
      if (currentTab === 'upcoming') {
        loadBookings('upcoming', upcomingList);
      } else {
        loadBookings('all', historyList);
      }
    });
  });

  // ── Load bookings from API ────────────────────────────────
  function loadBookings(status, container) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Loading bookings…</div>';

    SkillSwapAPI.bookings.list(status).then(function (result) {
      if (result && result.success) {
        var bookings = result.bookings || [];
        // For history, show only completed/cancelled
        if (status === 'all') {
          var filtered = bookings.filter(function (b) {
            return b.status === 'completed' || b.status === 'cancelled';
          });
          renderBookings(filtered, container, true);
        } else {
          renderBookings(bookings, container, false);
        }
      } else {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;">Failed to load bookings.</div>';
      }
    });
  }

  function renderBookings(bookings, container, isHistory) {
    if (bookings.length === 0) {
      container.innerHTML =
        '<div class="no-bookings">' +
          '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:12px;">' +
            '<rect x="3" y="4" width="18" height="18" rx="2"/>' +
            '<line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>' +
            '<line x1="3" y1="10" x2="21" y2="10"/>' +
          '</svg>' +
          '<p>' + (isHistory
            ? 'You haven\'t completed any sessions yet.'
            : 'You have no upcoming bookings – start sharing a conversation with a mentor.') +
          '</p>' +
          '<button class="btn-explore-mentors" onclick="window.location.href=\'explore.html\'">' +
            (isHistory ? 'Book your first session' : 'Explore mentors') +
          '</button>' +
        '</div>';
      return;
    }

    container.innerHTML = '';

    bookings.forEach(function (booking) {
      var card = document.createElement('div');
      card.className = 'booking-card';
      card.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:20px;border:1px solid var(--border);border-radius:12px;margin-bottom:12px;background:var(--bg-card);';

      var dateFormatted = formatDate(booking.booking_date);
      var statusColor = booking.status === 'upcoming' ? '#0d9488'
                      : booking.status === 'completed' ? '#10b981'
                      : '#ef4444';

      card.innerHTML =
        '<div style="display:flex;align-items:center;gap:14px;">' +
          '<div style="width:44px;height:44px;border-radius:50%;background:' + (booking.avatar_color || '#0d9488') + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:16px;">' +
            (booking.avatar_initial || booking.mentor_name.charAt(0).toUpperCase()) +
          '</div>' +
          '<div>' +
            '<div style="font-weight:600;font-size:15px;margin-bottom:2px;">' + escHtml(booking.session_title) + '</div>' +
            '<div style="font-size:13px;color:var(--text-muted);">with ' + escHtml(booking.mentor_name) + '</div>' +
            '<div style="font-size:13px;color:var(--text-muted);margin-top:4px;">' +
              '📅 ' + dateFormatted + ' · ⏰ ' + escHtml(booking.time_slot) + ' · 💰 ' + booking.credits_paid + ' credits' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:' + statusColor + '15;color:' + statusColor + ';">' +
            booking.status.charAt(0).toUpperCase() + booking.status.slice(1) +
          '</span>' +
          (booking.status === 'upcoming'
            ? '<button class="booking-cancel-btn" data-id="' + booking.id + '" style="padding:6px 14px;border-radius:8px;border:1px solid #fecaca;background:#fff;color:#ef4444;font-size:13px;cursor:pointer;">Cancel</button>'
            : '') +
        '</div>';

      // Cancel handler
      var cancelBtn = card.querySelector('.booking-cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
          if (!confirm('Cancel this booking? Credits will be refunded.')) return;
          cancelBtn.disabled = true;
          cancelBtn.textContent = 'Cancelling…';

          SkillSwapAPI.bookings.cancel(booking.id).then(function (result) {
            if (result && result.success) {
              adjustCredits(booking.credits_paid);
              loadBookings('upcoming', upcomingList);
            } else {
              alert('Failed to cancel: ' + (result ? result.message : 'Unknown error'));
              cancelBtn.disabled = false;
              cancelBtn.textContent = 'Cancel';
            }
          });
        });
      }

      container.appendChild(card);
    });
  }

  // ── Helpers ────────────────────────────────────────────────
  function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var days   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  // ── Initial load ───────────────────────────────────────────
  loadBookings('upcoming', upcomingList);

})();
