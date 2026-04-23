// shared.js – injects the persistent topbar + sidebar into every app page
// v2 — API-backed state (replaces localStorage)

var _cachedCredits = 0;

// Restore cached credits from sessionStorage for instant rendering
(function () {
  try {
    var u = getCurrentUser();
    if (u && typeof u.credits === 'number') _cachedCredits = u.credits;
  } catch (e) { /* ignore */ }
})();

function formatCreditValue(value) {
  return Math.max(0, Math.round(value));
}

function getCredits() {
  var user = getCurrentUser();
  if (user && typeof user.credits === 'number') return formatCreditValue(user.credits);
  return formatCreditValue(_cachedCredits);
}

function setCredits(value) {
  _cachedCredits = formatCreditValue(value);
  var user = getCurrentUser();
  if (user) { user.credits = _cachedCredits; setCurrentUser(user); }
  syncCreditsUI();
  return _cachedCredits;
}

function adjustCredits(amount) {
  // Optimistic local update
  _cachedCredits = formatCreditValue(getCredits() + amount);
  var user = getCurrentUser();
  if (user) { user.credits = _cachedCredits; setCurrentUser(user); }
  syncCreditsUI();
  // Async: refresh true balance from server
  SkillSwapAPI.credits.balance().then(function (result) {
    if (result && result.success) {
      _cachedCredits = result.credits.balance;
      var u = getCurrentUser();
      if (u) { u.credits = _cachedCredits; setCurrentUser(u); }
      syncCreditsUI();
    }
  });
  return _cachedCredits;
}

function syncCreditsUI() {
  var creditsValue = getCredits();
  document.querySelectorAll('.credits-value').forEach(function (el) {
    el.textContent = creditsValue;
  });

  var profileCredit = document.querySelector('.credits-display');
  if (profileCredit) {
    profileCredit.textContent = 'Credits – ' + creditsValue;
  }

  var balanceNumber = document.querySelector('.credits-balance-bar .num-big');
  if (balanceNumber) {
    balanceNumber.textContent = creditsValue;
  }
}

function injectShell(activeNavId) {

  // ── Verify auth (async — updates UI when done) ──────────────
  SkillSwapAPI.auth.check().then(function (result) {
    if (!result || !result.authenticated) {
      window.location.href = 'index.html';
      return;
    }
    setCurrentUser(result.user);
    _cachedCredits = result.user.credits;
    syncCreditsUI();

    // Update sidebar avatar with real initial
    var avatar = document.querySelector('.sidebar-avatar');
    if (avatar) {
      avatar.textContent = result.user.avatar_initial || result.user.name.charAt(0).toUpperCase();
    }
  });

  // ── Topbar ────────────────────────────────────────────────
  var topbar = document.createElement('header');
  topbar.className = 'app-topbar';
  topbar.innerHTML = '\
    <div class="logo-area">\
      <div class="logo-icon" onclick="window.location.href=\'index.html\'"><img src="images/skillswap_final_logo.png" alt="SkillSwap logo" class="logo-icon-img"></div>\
    </div>\
    <div class="app-topbar-center">\
      <button class="browse-btn" onclick="window.location.href=\'explore.html\'">Browse\
      </button>\
      <div class="app-search">\
        <svg class="app-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>\
        <input type="text" placeholder="Search mentors">\
      </div>\
    </div>\
    <div class="app-topbar-right">\
      <div class="app-notifications" id="notifBtn" style="position:relative; cursor:pointer; width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:background 0.2s;">\
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>\
        <span class="notif-badge" id="notifBadge" style="display:none; position:absolute; top:2px; right:4px; width:8px; height:8px; background:#ef4444; border-radius:50%;"></span>\
        <!-- Dropdown menu -->\
        <div class="notif-dropdown" id="notifDropdown" style="display:none; position:absolute; top:100%; right:0; margin-top:8px; width:320px; background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.1); border:1px solid var(--border); overflow:hidden; z-index:100;">\
          <div style="padding:14px 16px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">\
            <h4 style="margin:0; font-size:15px; font-weight:600;">Notifications</h4>\
            <button id="notifMarkAllReadBtn" style="background:none; border:none; color:var(--teal); font-size:12px; font-weight:600; cursor:pointer;">Mark all read</button>\
          </div>\
          <div id="notifContent" style="max-height:360px; overflow-y:auto; padding:0;"></div>\
        </div>\
      </div>\
      <div class="app-credits">\
        <span>Credits</span>\
        <strong class="credits-value">' + getCredits() + '</strong>\
      </div>\
      <button class="book-session-btn" onclick="window.location.href=\'explore.html\'">\
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>\
        Book session\
      </button>\
    </div>';
  document.body.prepend(topbar);

  // ── Sidebar ───────────────────────────────────────────────
  var nav = [
    {
      id: 'nav-home', href: 'home.html', label: 'Home',
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>'
    },
    {
      id: 'nav-explore', href: 'explore.html', label: 'Explore',
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>'
    },
    {
      id: 'nav-messages', href: 'messages.html', label: 'Messages',
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    },
    {
      id: 'nav-bookings', href: 'bookings.html', label: 'Bookings',
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    },
    {
      id: 'nav-credits', href: 'credits.html', label: 'Credits',
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
    },
    {
      id: 'nav-profile', href: 'profile.html', label: 'Profile',
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/></svg>'
    },
  ];

  var sidebar = document.createElement('nav');
  sidebar.className = 'app-sidebar';

  nav.forEach(function (item) {
    var a = document.createElement('a');
    a.id        = item.id;
    a.className = 'sidebar-item' + (item.id === activeNavId ? ' active' : '');
    a.href      = item.href;
    a.innerHTML = '<span class="si-icon">' + item.svg + '</span><span class="si-label">' + item.label + '</span>';

    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = item.href;
    });

    sidebar.appendChild(a);
  });

  // Avatar → profile
  var user = getCurrentUser();
  var avatar = document.createElement('div');
  avatar.className = 'sidebar-avatar';
  if (user && user.avatar_url) {
    avatar.innerHTML = '<img src="' + user.avatar_url + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />';
  } else {
    avatar.textContent = (user && user.avatar_initial) ? user.avatar_initial : 'R';
  }
  avatar.title = 'My Profile';
  avatar.addEventListener('click', function () {
    window.location.href = 'profile.html';
  });
  sidebar.appendChild(avatar);

  // Logout button
  var logoutBtn = document.createElement('a');
  logoutBtn.className = 'sidebar-item sidebar-logout';
  logoutBtn.href = '#';
  logoutBtn.innerHTML = '<span class="si-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span><span class="si-label">Logout</span>';
  logoutBtn.style.cssText = 'margin-top:auto;color:var(--text-muted);';
  logoutBtn.addEventListener('click', function (e) {
    e.preventDefault();
    SkillSwapAPI.auth.logout().then(function () {
      setCurrentUser(null);
      sessionStorage.clear();
      window.location.href = 'index.html';
    });
  });
  sidebar.appendChild(logoutBtn);

  // ── Notifications Logic ────────────────────────────────────
  var notifBtn = document.getElementById('notifBtn');
  var notifDropdown = document.getElementById('notifDropdown');
  var notifBadge = document.getElementById('notifBadge');
  var notifContent = document.getElementById('notifContent');
  var notifMarkAllReadBtn = document.getElementById('notifMarkAllReadBtn');

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', function (e) {
      if (e.target.closest('.notif-dropdown')) return; // Ignore clicks inside the dropdown
      var isShowing = notifDropdown.style.display === 'block';
      notifDropdown.style.display = isShowing ? 'none' : 'block';
      if (!isShowing) fetchNotifications();
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!notifBtn.contains(e.target)) {
        notifDropdown.style.display = 'none';
      }
    });

    notifMarkAllReadBtn.addEventListener('click', function () {
      SkillSwapAPI.notifications.markAllRead().then(function() {
        notifBadge.style.display = 'none';
        fetchNotifications();
      });
    });

    function fetchNotifications() {
      SkillSwapAPI.notifications.list().then(function (res) {
        if (res && res.success) {
          if (res.unread_count > 0) {
            notifBadge.style.display = 'block';
          } else {
            notifBadge.style.display = 'none';
          }

          if (res.notifications.length === 0) {
            notifContent.innerHTML = '<div style="padding:24px 16px; text-align:center; color:var(--text-muted); font-size:14px;">No notifications.</div>';
            return;
          }

          notifContent.innerHTML = res.notifications.map(function(n) {
            var bg = n.is_read ? 'var(--white)' : '#f0fdfa'; // light teal for unread
            var icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
            if (n.type === 'booking_confirmed') {
              icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
            } else if (n.type === 'feedback_request') {
              icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
            } else if (n.type === 'credit_earned') {
               icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
            }

            var itemHtml = '<div data-id="'+n.id+'" data-link="'+(n.link || '')+'" class="notif-item" style="display:flex; gap:12px; padding:16px; border-bottom:1px solid var(--border); background:'+bg+'; cursor:pointer; transition:background 0.15s;">' +
              '<div style="flex-shrink:0; margin-top:2px;">'+icon+'</div>' +
              '<div>' +
                '<div style="font-size:13.5px; color:var(--text); line-height:1.4; margin-bottom:4px;">'+escHtml(n.message)+'</div>' +
                '<div style="font-size:11px; color:var(--text-muted);">'+formatDateSmall(n.created_at)+'</div>' +
              '</div>' +
            '</div>';
            return itemHtml;
          }).join('');

          // Click handler for items
          notifContent.querySelectorAll('.notif-item').forEach(function(el) {
            el.addEventListener('click', function(e) {
              if (e.target.closest('button')) return;
              var id = this.dataset.id;
              var link = this.dataset.link;
              SkillSwapAPI.notifications.markRead(id).then(function() {
                if (link) window.location.href = link;
                else fetchNotifications();
              });
            });
          });
        }
      });
    }

    function formatDateSmall(dt) {
      if (!dt) return '';
      var d = new Date(dt);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return d.getDate() + ' ' + months[d.getMonth()];
    }

    // Initial fetch to show badge
    fetchNotifications();
  }

  function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  document.body.insertBefore(sidebar, document.body.children[1]);
  syncCreditsUI();
}