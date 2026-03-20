// profile.js – SkillSwap Profile Page

(function () {
  injectShell('nav-profile');

  // ── Profile tab switching ─────────────────────────────────
  const profileTabs = document.getElementById('profileTabs');
  const tabPanelIds = ['overview', 'commendations', 'achievements', 'mentors'];

  profileTabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      profileTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const active = this.dataset.tab;
      tabPanelIds.forEach(id => {
        const panel = document.getElementById('tab-' + id);
        if (panel) panel.style.display = (id === active) ? '' : 'none';
      });
    });
  });

  // ── Edit profile button ───────────────────────────────────
  document.getElementById('editProfileBtn').addEventListener('click', function () {
    alert('Edit Profile – coming soon!\n\nYou can update your bio, expertise, and more.');
  });

  // ── Edit section icons (Experience / Education) ───────────
  document.querySelectorAll('.edit-icon').forEach(btn => {
    btn.addEventListener('click', function () {
      const section = this.closest('.profile-section').querySelector('h3').textContent;
      alert('Edit "' + section + '" – coming soon!');
    });
  });

  // ── Avatar edit ───────────────────────────────────────────
  document.querySelector('.avatar-edit').addEventListener('click', function () {
    alert('Photo upload – coming soon!');
  });

  // ── Profile strength card ─────────────────────────────────
  document.querySelector('.profile-strength-card-alt').addEventListener('click', function () {
    alert('Complete your profile to level up!\n\n• Add experience\n• Add education\n• Book a session');
  });
})();
