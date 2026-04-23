// landing.js – SkillSwap Landing Page (v2 — real auth)

(function () {
  var modal       = document.getElementById('modal');
  var loginBtn    = document.getElementById('loginBtn');
  var signupBtn   = document.getElementById('signupBtn');
  var reserveBtn  = document.getElementById('reserveBtn');
  var modalClose  = document.getElementById('modalClose');
  var modalTitle  = document.getElementById('modalTitle');
  var nameInput   = document.getElementById('nameInput');
  var emailInput  = document.getElementById('emailInput');
  var passwordInput = document.getElementById('passwordInput');
  var continueBtn = document.getElementById('continueEmail');
  var authError   = document.getElementById('authError');

  var isSignup = false;

  function showError(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
  }
  function clearError() {
    authError.style.display = 'none';
  }

  function openModal(signupMode) {
    isSignup = signupMode;
    clearError();
    emailInput.value = '';
    passwordInput.value = '';
    nameInput.value = '';

    if (isSignup) {
      modalTitle.textContent = 'Create your account';
      nameInput.style.display = 'block';
      continueBtn.textContent = 'Sign up';
    } else {
      modalTitle.textContent = 'Welcome back';
      nameInput.style.display = 'none';
      continueBtn.textContent = 'Log in';
    }

    modal.classList.add('active');
    emailInput.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    clearError();
  }

  function goToApp() {
    window.location.href = 'home.html';
  }

  // ── Button listeners ─────────────────────────────────────

  loginBtn.addEventListener('click', function () { openModal(false); });
  signupBtn.addEventListener('click', function () { openModal(true); });
  reserveBtn.addEventListener('click', function () { openModal(true); });
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

  // Close on backdrop click
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // ── Google / LinkedIn → demo login ────────────────────────
  // These use the seeded Rayan account for demo purposes
  document.getElementById('continueGoogle').addEventListener('click', function () {
    demoLogin();
  });
  document.getElementById('continueLinkedIn').addEventListener('click', function () {
    demoLogin();
  });

  function demoLogin() {
    continueBtn.disabled = true;
    continueBtn.textContent = 'Logging in…';
    SkillSwapAPI.auth.login('rayan@skillswap.io', 'password123')
      .then(function (result) {
        if (result && result.success) {
          setCurrentUser(result.user);
          goToApp();
        } else {
          showError('Demo login failed. Is the database seeded?');
          continueBtn.disabled = false;
          continueBtn.textContent = isSignup ? 'Sign up' : 'Log in';
        }
      });
  }

  // ── Email + Password auth ────────────────────────────────
  continueBtn.addEventListener('click', function () {
    clearError();

    var email    = emailInput.value.trim();
    var password = passwordInput.value;
    var name     = nameInput.value.trim();

    if (!email) { emailInput.focus(); showError('Please enter your email.'); return; }
    if (!password) { passwordInput.focus(); showError('Please enter a password.'); return; }

    if (isSignup) {
      // ── SIGNUP ──
      if (!name) { nameInput.focus(); showError('Please enter your name.'); return; }
      if (password.length < 6) { showError('Password must be at least 6 characters.'); return; }

      continueBtn.disabled = true;
      continueBtn.textContent = 'Creating account…';

      SkillSwapAPI.auth.signup({ name: name, email: email, password: password })
        .then(function (result) {
          if (result && result.success) {
            setCurrentUser(result.user);
            goToApp();
          } else {
            showError(result ? result.message : 'Signup failed. Please try again.');
            continueBtn.disabled = false;
            continueBtn.textContent = 'Sign up';
          }
        });

    } else {
      // ── LOGIN ──
      continueBtn.disabled = true;
      continueBtn.textContent = 'Logging in…';

      SkillSwapAPI.auth.login(email, password)
        .then(function (result) {
          if (result && result.success) {
            setCurrentUser(result.user);
            goToApp();
          } else {
            showError(result ? result.message : 'Login failed. Please try again.');
            continueBtn.disabled = false;
            continueBtn.textContent = 'Log in';
          }
        });
    }
  });

  // ── Enter key submits ─────────────────────────────────────
  [emailInput, passwordInput, nameInput].forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') continueBtn.click();
    });
  });

  // ── If already logged in, redirect to app ─────────────────
  SkillSwapAPI.auth.check().then(function (result) {
    if (result && result.authenticated) {
      setCurrentUser(result.user);
      goToApp();
    }
  });

  // ── Fetch dynamic stats ───────────────────────────────────
  function animateValue(obj, start, end, duration) {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutQuart 
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeProgress * (end - start) + start);
      
      // Keep formatting depending on the element
      if (obj.id === 'heroSessionStat') {
        obj.innerHTML = (current / 1000).toFixed(1) + 'k+ sessions';
      } else if (obj.id === 'heroUserStat') {
        obj.innerHTML = (current / 1000).toFixed(1) + 'k+ active users';
      } else {
        obj.innerHTML = current;
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  fetch('api/stats.php').then(r => r.json()).then(result => {
    if (result && result.success && result.stats) {
      const stats = result.stats;
      const sessionStat = document.getElementById('heroSessionStat');
      const userStat = document.getElementById('heroUserStat');
      
      // The API returns real raw numbers. 
      // Example: sessions_completed = 1200, users = 500
      // Animate them up to the fetched value
      if (sessionStat) animateValue(sessionStat, 0, Math.max(100, stats.sessions_completed), 2000);
      if (userStat) animateValue(userStat, 0, Math.max(100, stats.users), 2000);
    }
  }).catch(() => {});

})();