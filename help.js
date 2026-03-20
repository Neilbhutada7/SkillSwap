// help.js – SkillSwap Help & FAQ Page

(function () {

  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      const item   = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(function (el) {
        el.classList.remove('open');
      });

      // Open clicked if it was closed
      if (!isOpen) item.classList.add('open');
    });
  });

})();
