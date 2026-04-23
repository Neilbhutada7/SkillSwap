// messages.js – SkillSwap Messages Page (v3 — real-time polling)

(function () {
  injectShell('nav-messages');

  // ── DOM refs ───────────────────────────────────────────────
  var convList     = document.getElementById('convList');
  var chatPanel    = document.getElementById('chatPanel');
  var chatEmpty    = document.getElementById('chatEmpty');
  var chatHeader   = document.getElementById('chatHeader');
  var chatMessages = document.getElementById('chatMessages');
  var chatInput    = document.getElementById('chatInput');
  var chatSendBtn  = document.getElementById('chatSendBtn');
  var searchInput  = document.getElementById('memberSearch');

  var currentPartnerId = null;
  var conversations    = [];
  var pollTimer        = null;
  var threadPollTimer  = null;

  // ── Load conversations from API ────────────────────────────
  function loadConversations(silent) {
    SkillSwapAPI.messages.conversations().then(function (result) {
      if (result && result.success) {
        conversations = result.conversations || [];
        renderConversations();

        // Auto-select first conversation if none selected
        if (conversations.length > 0 && !currentPartnerId && !silent) {
          selectConversation(conversations[0].partner_id);
        }
      }
    });
  }

  function renderConversations() {
    var searchTerm = (searchInput.value || '').trim().toLowerCase();

    var filtered = conversations;
    if (searchTerm) {
      filtered = conversations.filter(function (c) {
        return c.partner_name.toLowerCase().indexOf(searchTerm) !== -1;
      });
    }

    convList.innerHTML = '';

    if (filtered.length === 0) {
      convList.innerHTML =
        '<p style="padding:24px;color:var(--text-muted);font-size:14px;text-align:center;">' +
        (searchTerm ? 'No matches found.' : 'No conversations yet.<br>Book a session and start chatting!') +
        '</p>';
      return;
    }

    filtered.forEach(function (conv) {
      var item = document.createElement('div');
      item.className = 'msg-conv-item' + (conv.partner_id === currentPartnerId ? ' active' : '');
      item.innerHTML =
        '<div class="msg-conv-avatar" style="background:' + (conv.avatar_color || '#0d9488') + '">' +
          (conv.avatar_initial || conv.partner_name.charAt(0).toUpperCase()) +
        '</div>' +
        '<div class="msg-conv-info">' +
          '<div class="msg-conv-name">' + escHtml(conv.partner_name) +
            (conv.unread_count > 0 ? ' <span class="msg-unread-badge">' + conv.unread_count + '</span>' : '') +
          '</div>' +
          '<div class="msg-conv-preview">' + escHtml(truncate(conv.last_message, 40)) + '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);flex-shrink:0;">' + formatRelative(conv.last_at) + '</div>';

      item.addEventListener('click', function () {
        selectConversation(conv.partner_id);
      });

      convList.appendChild(item);
    });
  }

  // ── Select a conversation ──────────────────────────────────
  function selectConversation(partnerId) {
    currentPartnerId = partnerId;

    // Show chat panel, hide empty
    chatPanel.style.display = '';
    chatEmpty.style.display = 'none';

    // Update active state
    renderConversations();

    // Find partner info
    var partner = conversations.find(function (c) { return c.partner_id === partnerId; });
    if (!partner) return;

    // Update header
    chatHeader.innerHTML =
      '<div class="msg-conv-avatar" style="background:' + (partner.avatar_color || '#0d9488') + '">' +
        (partner.avatar_initial || partner.partner_name.charAt(0).toUpperCase()) +
      '</div>' +
      '<div>' +
        '<div style="font-weight:600;font-size:15px;">' + escHtml(partner.partner_name) + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);">Click to view profile</div>' +
      '</div>';

    chatHeader.style.cursor = 'pointer';
    chatHeader.onclick = function () {
      window.location.href = 'mentor.html?id=' + partnerId;
    };

    loadThread(partnerId);
    startThreadPolling(partnerId);
  }

  // ── Load chat thread ───────────────────────────────────────
  function loadThread(partnerId) {
    SkillSwapAPI.messages.thread(partnerId).then(function (result) {
      if (result && result.success) {
        renderMessages(result.messages || []);
      }
    });
  }

  function renderMessages(messages) {
    var wasAtBottom = chatMessages.scrollTop + chatMessages.clientHeight >= chatMessages.scrollHeight - 20;
    var oldCount = chatMessages.children.length;

    chatMessages.innerHTML = '';
    var user = getCurrentUser();
    var myId = user ? user.id : 0;

    messages.forEach(function (msg) {
      var div = document.createElement('div');
      div.className = 'msg-bubble ' + (msg.sender_id === myId ? 'sent' : 'received');
      div.innerHTML =
        '<div class="msg-bubble-content">' + escHtml(msg.content) + '</div>' +
        '<div class="msg-bubble-time">' + formatTime(msg.created_at) + '</div>';
      chatMessages.appendChild(div);
    });

    // Auto-scroll if at bottom or new messages arrived
    if (wasAtBottom || messages.length > oldCount) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // ── Send message ───────────────────────────────────────────
  function sendMessage() {
    var text = chatInput.value.trim();
    if (!text || !currentPartnerId) return;

    chatInput.value = '';
    chatInput.focus();

    // Optimistic UI: add message immediately
    var div = document.createElement('div');
    div.className = 'msg-bubble sent';
    div.innerHTML =
      '<div class="msg-bubble-content">' + escHtml(text) + '</div>' +
      '<div class="msg-bubble-time">Just now</div>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Send via API
    SkillSwapAPI.messages.send(currentPartnerId, text).then(function (result) {
      if (!result || !result.success) {
        div.style.opacity = '0.5';
        div.title = 'Failed to send';
      } else {
        // Refresh conversation list to update preview
        loadConversations(true);
      }
    });
  }

  chatSendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ── Search conversations ───────────────────────────────────
  searchInput.addEventListener('input', function () {
    renderConversations();
  });

  // ── Polling: auto-refresh conversations every 5s ───────────
  function startPolling() {
    pollTimer = setInterval(function () {
      loadConversations(true);
    }, 5000);
  }

  // ── Polling: auto-refresh thread every 3s ──────────────────
  function startThreadPolling(partnerId) {
    if (threadPollTimer) clearInterval(threadPollTimer);
    threadPollTimer = setInterval(function () {
      if (currentPartnerId === partnerId) {
        loadThread(partnerId);
      }
    }, 3000);
  }

  // Cleanup on page leave
  window.addEventListener('beforeunload', function () {
    if (pollTimer) clearInterval(pollTimer);
    if (threadPollTimer) clearInterval(threadPollTimer);
  });

  // ── Compose button: show user picker ───────────────────────
  document.getElementById('composeBtn').addEventListener('click', function () {
    var userId = prompt('Enter the mentor user ID to message:');
    if (userId && parseInt(userId) > 0) {
      selectConversation(parseInt(userId));
      // Force add to conversations if not exists
      var exists = conversations.find(function (c) { return c.partner_id === parseInt(userId); });
      if (!exists) {
        SkillSwapAPI.profile.read(parseInt(userId)).then(function (result) {
          if (result && result.success && result.profile) {
            conversations.unshift({
              partner_id: result.profile.id,
              partner_name: result.profile.name,
              avatar_initial: result.profile.avatar_initial,
              avatar_color: result.profile.avatar_color,
              last_message: '',
              last_at: new Date().toISOString(),
              unread_count: 0
            });
            renderConversations();
            selectConversation(result.profile.id);
          }
        });
      }
    }
  });

  // ── Helpers ────────────────────────────────────────────────
  function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '…' : str;
  }

  function formatTime(datetime) {
    if (!datetime) return '';
    var d = new Date(datetime);
    var h = d.getHours();
    var m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + String(m).padStart(2, '0') + ' ' + ampm;
  }

  function formatRelative(datetime) {
    if (!datetime) return '';
    var d = new Date(datetime);
    var now = new Date();
    var diff = now - d;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return mins + 'm';
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h';
    var days = Math.floor(hours / 24);
    if (days < 7) return days + 'd';
    return d.getDate() + '/' + (d.getMonth() + 1);
  }

  // ── Initial load ───────────────────────────────────────────
  loadConversations();
  startPolling();

})();
