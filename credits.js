// credits.js – SkillSwap Credits Page

(function () {
  injectShell('nav-credits');
  syncCreditsUI();

  // View Activity button — scrolls to progress section
  document.getElementById('viewActivityBtn').addEventListener('click', function () {
    document.querySelector('.progress-card').scrollIntoView({ behavior: 'smooth' });
  });

  // Earn card buttons are handled via inline onclick in HTML
  // (navigate to relevant pages)
})();
