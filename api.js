// api.js – Central API client for SkillSwap
// Include this script BEFORE shared.js on every page.

var API_BASE = 'https://skillswap-production-16be.up.railway.app/api';

var SkillSwapAPI = {

  /**
   * Core fetch wrapper. All API calls go through here.
   */
  request: function (endpoint, options) {
    var url = API_BASE + endpoint;
    var config = Object.assign({
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'      // send session cookies
    }, options || {});

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    return fetch(url, config)
      .then(function (response) {
        return response.json().then(function (data) {
          // Auto-redirect on 401 (except auth endpoints)
          if (response.status === 401 && endpoint.indexOf('/auth/') === -1) {
            window.location.href = 'index.html';
            return null;
          }
          return data;
        });
      })
      .catch(function (err) {
        console.error('API error:', endpoint, err);
        return { success: false, message: 'Network error. Please try again.' };
      });
  },

  get:  function (ep)       { return this.request(ep); },
  post: function (ep, body) { return this.request(ep, { method: 'POST',   body: body }); },
  put:  function (ep, body) { return this.request(ep, { method: 'PUT',    body: body }); },
  del:  function (ep)       { return this.request(ep, { method: 'DELETE' }); },

  // ── Auth ────────────────────────────────────────────────────
  auth: {
    login:  function (email, password)  { return SkillSwapAPI.post('/auth/login.php',  { email: email, password: password }); },
    signup: function (data)             { return SkillSwapAPI.post('/auth/signup.php',  data); },
    logout: function ()                 { return SkillSwapAPI.post('/auth/logout.php',  {}); },
    check:  function ()                 { return SkillSwapAPI.get('/auth/check.php'); }
  },

  // ── Sessions ────────────────────────────────────────────────
  sessions: {
    list:   function (params) {
      var qs = params ? new URLSearchParams(params).toString() : '';
      return SkillSwapAPI.get('/sessions/list.php' + (qs ? '?' + qs : ''));
    },
    read:   function (id, day) {
      var qs = 'id=' + id;
      if (day !== undefined && day !== null) qs += '&day=' + day;
      return SkillSwapAPI.get('/sessions/read.php?' + qs);
    },
    slots:  function (id) { return SkillSwapAPI.get('/sessions/availability.php?session_id=' + id); },
    create: function (data) { return SkillSwapAPI.post('/sessions/create.php', data); },
    update: function (data) { return SkillSwapAPI.put('/sessions/update.php',  data); },
    del:    function (id)   { return SkillSwapAPI.del('/sessions/delete.php?id=' + id); }
  },

  // ── Bookings ────────────────────────────────────────────────
  bookings: {
    create: function (data)   { return SkillSwapAPI.post('/bookings/create.php', data); },
    list:   function (status) { return SkillSwapAPI.get('/bookings/list.php?status=' + (status || 'all')); },
    cancel: function (id)     { return SkillSwapAPI.post('/bookings/cancel.php?id=' + id, { id: id }); }
  },

  // ── Messages ────────────────────────────────────────────────
  messages: {
    send:          function (receiverId, content) { return SkillSwapAPI.post('/messages/send.php', { receiver_id: receiverId, content: content }); },
    conversations: function ()                    { return SkillSwapAPI.get('/messages/conversations.php'); },
    thread:        function (withUserId)           { return SkillSwapAPI.get('/messages/thread.php?with=' + withUserId); }
  },

  // ── Credits ─────────────────────────────────────────────────
  credits: {
    balance: function ()      { return SkillSwapAPI.get('/credits/balance.php'); },
    history: function (limit) { return SkillSwapAPI.get('/credits/history.php?limit=' + (limit || 50)); }
  },

  // ── Reviews ──────────────────────────────────────────────────
  reviews: {
    list:   function (mentorId) { return SkillSwapAPI.get('/reviews/list.php?mentor_id=' + mentorId); },
    create: function (data)     { return SkillSwapAPI.post('/reviews/create.php', data); }
  },

  // ── Notifications ────────────────────────────────────────────
  notifications: {
    list:        function () { return SkillSwapAPI.get('/notifications/list.php'); },
    markRead:    function (id) { return SkillSwapAPI.post('/notifications/read.php', { id: id }); },
    markAllRead: function () { return SkillSwapAPI.post('/notifications/read_all.php'); }
  },

  // ── Profile ─────────────────────────────────────────────────
  profile: {
    read:   function (id) { return SkillSwapAPI.get('/profile/read.php' + (id ? '?id=' + id : '')); },
    update: function (data) { return SkillSwapAPI.post('/profile/update.php', data); },
    uploadAvatar: function (formData) {
      // Use standard fetch for FormData, ensuring credentials are included for the session
      return fetch('api/profile/upload_avatar.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      }).then(function(r) { return r.json(); }).catch(function() { return null; });
    },
    uploadBanner: function (formData) {
      return fetch('api/profile/upload_banner.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      }).then(function(r) { return r.json(); }).catch(function() { return null; });
    }
  }
};

// ── Current-user cache ────────────────────────────────────────
var _currentUser = null;

// Try to restore from sessionStorage for instant rendering
(function () {
  try {
    var cached = sessionStorage.getItem('skillswap_user');
    if (cached) _currentUser = JSON.parse(cached);
  } catch (e) { /* ignore */ }
})();

function getCurrentUser() {
  return _currentUser;
}

function setCurrentUser(user) {
  _currentUser = user;
  if (user) {
    sessionStorage.setItem('skillswap_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('skillswap_user');
  }
}
