// shared.js – injects the persistent topbar + sidebar into every app page

function injectShell(activeNavId) {

  // ── Topbar ────────────────────────────────────────────────
  const topbar = document.createElement('header');
  topbar.className = 'app-topbar';
  topbar.innerHTML = `
    <div class="logo-area">
      <div class="logo-icon" onclick="window.location.href='index.html'">S</div>
    </div>
    <div class="app-topbar-center">
      <button class="browse-btn" onclick="window.location.href='explore.html'">Browse
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4l4 4 4-4"/></svg>
      </button>
      <div class="app-search">
        <svg class="app-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Search mentors">
      </div>
    </div>
    <div class="app-topbar-right">
      <div class="notif-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <div class="notif-badge">9+</div>
      </div>
      <button class="book-session-btn" onclick="window.location.href='explore.html'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Book session
      </button>
    </div>
  `;
  document.body.prepend(topbar);

  // ── Sidebar ───────────────────────────────────────────────
  const nav = [
    {
      id: 'nav-home', href: 'home.html', label: 'Home',
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`
    },
    {
      id: 'nav-explore', href: 'explore.html', label: 'Explore',
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`
    },
    {
      id: 'nav-messages', href: 'messages.html', label: 'Messages',
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
    },
    {
      id: 'nav-bookings', href: 'bookings.html', label: 'Bookings',
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    },

    {
      id: 'nav-credits', href: 'credits.html', label: 'Credits',
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    },
  ];

  const sidebar = document.createElement('nav');
  sidebar.className = 'app-sidebar';

  nav.forEach(function(item) {
    const a = document.createElement('a');
    a.id        = item.id;
    a.className = 'sidebar-item' + (item.id === activeNavId ? ' active' : '');
    a.href      = item.href;
    a.innerHTML = '<span class="si-icon">' + item.svg + '</span><span class="si-label">' + item.label + '</span>';

    // Explicit click handler — never relies on native <a> navigation alone
    a.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = item.href;
    });

    sidebar.appendChild(a);
  });

  // Avatar → profile
  const avatar = document.createElement('div');
  avatar.className = 'sidebar-avatar';
  avatar.textContent = 'R';
  avatar.title = 'My Profile';
  avatar.addEventListener('click', function() {
    window.location.href = 'profile.html';
  });
  sidebar.appendChild(avatar);

  document.body.insertBefore(sidebar, document.body.children[1]);
}