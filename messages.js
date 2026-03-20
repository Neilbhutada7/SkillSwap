// messages.js – SkillSwap Messages Page

(function () {
  injectShell('nav-messages');

  // ── Compose button ────────────────────────────────────────
  document.getElementById('composeBtn').addEventListener('click', function () {
    const name = prompt('Start a new conversation with (enter mentor name):');
    if (name && name.trim()) {
      addConversation(name.trim());
    }
  });

  // ── Member search ─────────────────────────────────────────
  document.getElementById('memberSearch').addEventListener('input', function () {
    const q = this.value.toLowerCase();
    document.querySelectorAll('.conv-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  // ── Helper: add a conversation item ──────────────────────
  function addConversation(name) {
    const noMsg  = document.getElementById('noMessages');
    const list   = document.getElementById('convList');
    if (noMsg) noMsg.style.display = 'none';

    const item = document.createElement('div');
    item.className = 'conv-item';
    item.style.cssText = `
      display:flex; align-items:center; gap:12px; padding:14px 16px;
      cursor:pointer; border-bottom:1px solid var(--border); transition:background 0.15s;
    `;
    item.innerHTML = `
      <div style="width:40px;height:40px;border-radius:50%;background:var(--teal);
        color:#fff;display:flex;align-items:center;justify-content:center;
        font-weight:700;font-size:16px;flex-shrink:0;">
        ${name.charAt(0).toUpperCase()}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;font-size:14px;">${name}</div>
        <div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          Tap to start chatting…
        </div>
      </div>
    `;
    item.addEventListener('mouseenter', () => item.style.background = '#f9fafb');
    item.addEventListener('mouseleave', () => item.style.background = '');
    item.addEventListener('click', () => openChat(name));
    list.appendChild(item);
    openChat(name);
  }

  // ── Helper: open a chat window ────────────────────────────
  function openChat(name) {
    const panel = document.getElementById('mainPanel');
    panel.style.cssText = 'display:flex;flex-direction:column;height:100%;';
    panel.innerHTML = `
      <div style="padding:16px 24px;border-bottom:1px solid var(--border);
        display:flex;align-items:center;gap:12px;background:#fff;">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--teal);
          color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">
          ${name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-weight:700;font-size:15px;">${name}</div>
          <div style="font-size:12px;color:var(--text-muted);">Online</div>
        </div>
      </div>
      <div id="chatMessages" style="flex:1;overflow-y:auto;padding:24px;
        display:flex;flex-direction:column;gap:12px;background:var(--bg);">
        <div style="text-align:center;color:var(--text-muted);font-size:13px;">
          This is the beginning of your conversation with ${name}
        </div>
      </div>
      <div style="padding:16px 24px;border-top:1px solid var(--border);
        display:flex;gap:12px;background:#fff;">
        <input id="chatInput" type="text" placeholder="Type a message…"
          style="flex:1;padding:10px 16px;border:1.5px solid var(--border);
          border-radius:100px;outline:none;font-family:Inter,sans-serif;font-size:14px;">
        <button id="sendBtn" style="padding:10px 20px;background:var(--teal);color:#fff;
          border:none;border-radius:100px;font-weight:600;cursor:pointer;">Send</button>
      </div>
    `;

    function sendMessage() {
      const input = document.getElementById('chatInput');
      const text  = input.value.trim();
      if (!text) return;
      const msg = document.createElement('div');
      msg.style.cssText = `align-self:flex-end;background:var(--teal);color:#fff;
        padding:10px 16px;border-radius:18px 18px 4px 18px;font-size:14px;max-width:70%;`;
      msg.textContent = text;
      document.getElementById('chatMessages').appendChild(msg);
      input.value = '';
      msg.scrollIntoView({ behavior: 'smooth' });

      // Fake reply after 800 ms
      setTimeout(() => {
        const reply = document.createElement('div');
        reply.style.cssText = `align-self:flex-start;background:#fff;border:1px solid var(--border);
          padding:10px 16px;border-radius:18px 18px 18px 4px;font-size:14px;max-width:70%;`;
        reply.textContent = 'Thanks for reaching out! Let\'s find a time to connect.';
        document.getElementById('chatMessages').appendChild(reply);
        reply.scrollIntoView({ behavior: 'smooth' });
      }, 800);
    }

    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage();
    });
  }
})();
