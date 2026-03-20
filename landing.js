// landing.js – SkillSwap Landing Page

(function () {
  const modal      = document.getElementById('modal');
  const loginBtn   = document.getElementById('loginBtn');
  const signupBtn  = document.getElementById('signupBtn');
  const reserveBtn = document.getElementById('reserveBtn');
  const modalClose = document.getElementById('modalClose');

  function openModal()  { modal.classList.add('active'); }
  function closeModal() { modal.classList.remove('active'); }
  function goToApp()    { window.location.href = 'home.html'; }

  loginBtn.addEventListener('click', openModal);
  signupBtn.addEventListener('click', openModal);
  reserveBtn.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);

  // Help → FAQ page
  document.getElementById('helpBtn').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'help.html';
  });

  // About Us → About page
  document.getElementById('aboutBtn').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'about.html';
  });

  // Close when clicking the overlay backdrop
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  // Auth buttons → redirect into the app
  document.getElementById('continueGoogle').addEventListener('click', goToApp);
  document.getElementById('continueLinkedIn').addEventListener('click', goToApp);
  document.getElementById('continueEmail').addEventListener('click', function () {
    const email = document.getElementById('emailInput').value.trim();
    if (!email) { document.getElementById('emailInput').focus(); return; }
    goToApp();
  });

  // Escape key closes modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
})();