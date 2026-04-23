// credits.js – SkillSwap Credits Page (v2 — API-backed)

(function () {
  injectShell('nav-credits');

  // ── Load credit balance and history from API ───────────────
  SkillSwapAPI.credits.balance().then(function (result) {
    if (result && result.success && result.credits) {
      var c = result.credits;

      // Update balance display
      var balanceEl = document.querySelector('.credits-balance-bar .num-big');
      if (balanceEl) balanceEl.textContent = c.balance;

      // Update earned / spent numbers
      var earnedEl = document.querySelector('.credits-earned');
      if (earnedEl) earnedEl.textContent = c.total_earned;

      var spentEl = document.querySelector('.credits-spent');
      if (spentEl) spentEl.textContent = c.total_spent;

      syncCreditsUI();
    }
  });

  // ── Load transaction history ───────────────────────────────
  var historyList = document.getElementById('creditHistoryList');

  // "View Activity" button scrolls to history
  var viewActivityBtn = document.getElementById('viewActivityBtn');
  if (viewActivityBtn) {
    viewActivityBtn.addEventListener('click', function () {
      if (historyList) historyList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  SkillSwapAPI.credits.history(50).then(function (result) {
    if (result && result.success && result.history) {
      renderHistory(result.history);
    }
  });

  function renderHistory(transactions) {
    if (!historyList) return;

    if (transactions.length === 0) {
      historyList.innerHTML = '<p style="color:var(--text-muted);font-size:14px;padding:16px;text-align:center;">No transactions yet.</p>';
      return;
    }

    historyList.innerHTML = '';

    transactions.forEach(function (tx) {
      var item = document.createElement('div');
      item.className = 'credit-history-item';

      var isEarn  = tx.type === 'earn';
      var signStr = isEarn ? '+' : '';
      var color   = isEarn ? '#10b981' : '#ef4444';
      var icon    = isEarn
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';

      item.innerHTML =
        '<div class="credit-history-icon">' + icon + '</div>' +
        '<div class="credit-history-info">' +
          '<div class="credit-history-desc">' + escHtml(tx.description) + '</div>' +
          '<div class="credit-history-date">' + formatDate(tx.created_at) + '</div>' +
        '</div>' +
        '<div class="credit-history-amount" style="color:' + color + ';font-weight:600;">' +
          signStr + tx.amount +
        '</div>';

      historyList.appendChild(item);
    });
  }

  // ── Helpers ────────────────────────────────────────────────
  function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatDate(datetime) {
    if (!datetime) return '';
    var d = new Date(datetime);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

})();
