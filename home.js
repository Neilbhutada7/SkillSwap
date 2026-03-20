// home.js – SkillSwap Home Page

(function () {
  injectShell('nav-home');

  // Dismiss setup card
  const setupClose = document.getElementById('setupClose');
  const setupCard  = document.getElementById('setupCard');
  if (setupClose && setupCard) {
    setupClose.addEventListener('click', function () {
      setupCard.style.display = 'none';
    });
  }

  // Start Teaching — redirect directly, no popup
  const btnTeach = document.querySelector('.btn-teach');
  if (btnTeach) {
    btnTeach.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'teach.html';
    });
  }

  // Gift invite
  const giftLink = document.querySelector('.gift-link');
  if (giftLink) {
    giftLink.addEventListener('click', function () {
      alert('Share your invite link:\nhttps://skillswap.io/invite/rayan');
    });
  }

})();