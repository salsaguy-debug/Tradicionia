// v16 — Worker API + Optimized

const API_URL = "https://tradicion-api.tradicion.workers.dev/api";

const $email = document.getElementById('email');
const $pin = document.getElementById('pin');
const $query = document.getElementById('query');
const $output = document.getElementById('output');
const $lang = document.getElementById('langSelect');

let currentId = null;
const storageKey = 'tradicion_v16_fortress';

function scrollToBottom() {
  $output.scrollTop = $output.scrollHeight;
}

window.onload = () => {
  render();
  startNewChat();
  updateUILanguage();
};

function updateUILanguage() {
  const lang = $lang.value;
  document.getElementById('main-title').innerText =
    lang === "Spanish" ? "EL PATRÓN DICE:" : "EL PATRÓN SAYS:";
  document.getElementById('history-label').innerText =
    lang === "Spanish" ? "HISTORIAL" : "HISTORY";
  document.getElementById('new-chat-btn').innerText =
    lang === "Spanish" ? "+ Nuevo Chat" : "+ New Chat";
  $query.placeholder =
    lang === "Spanish" ? "Pregunta al Patrón..." : "Ask El Patrón...";
}

async function ask() {
  const q = $query.value.trim();
  const e = $email.value.trim();
  const p = $pin.value.trim();
  const l = $lang.value;

  if (!e || !p) return alert("¡Coño! Enter Email and PIN first.");
  if (!q) return;

  if (!currentId) {
    currentId = Date.now().toString();
    saveChat(currentId, q.substring(0, 25));
  }

  $output.insertAdjacentHTML("beforeend",
    `<div class="user-msg">${q}</div>
     <div class="ai-msg" id="loading">...</div>`
  );

  $query.value = "";
  scrollToBottom();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, email: e, pin: p, lang: l })
    });

    const json = await res.json();
    document.getElementById("loading").remove();

    if (json.data === "USER_NOT_FOUND_ERROR")
      return alert(`Email ${e} not found.`);

    if (json.data === "INVALID_PIN_ERROR")
      return alert(`PIN incorrect for ${e}.`);

    const formatted = json.data
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    $output.insertAdjacentHTML("beforeend",
      `<div class="ai-msg">${formatted}</div>`
    );

    updateMsgs(currentId, q, json.data);
  } catch {
    if (document.getElementById("loading"))
      document.getElementById("loading").remove();
    alert("Connection error. Check deployment.");
  }

  scrollToBottom();
}

function saveChat(id, title) {
  let chats = JSON.parse(localStorage.getItem(storageKey) || '[]');
  chats.unshift({ id, title, msgs: [], pinned: false });
  localStorage.setItem(storageKey, JSON.stringify(chats));
  render();
}

function updateMsgs(id, q, a) {
  let chats = JSON.parse(localStorage.getItem(storageKey));
  let c = chats.find(x => x.id === id);
  if (c) {
    c.msgs.push({ q, a });
    localStorage.setItem(storageKey, JSON.stringify(chats));
  }
}

function render() {
  const chats = JSON.parse(localStorage.getItem(storageKey) || '[]');
  document.getElementById('chatsList').innerHTML = chats
    .map(c => `
      <div class="chat-item ${c.id === currentId ? 'active' : ''}"
           onclick="loadChat('${c.id}')">
        <span>${c.pinned ? '📌 ' : ''}${c.title}</span>
      </div>
    `).join('');
}

function loadChat(id) {
  currentId = id;
  const c = JSON.parse(localStorage.getItem(storageKey)).find(x => x.id === id);
  $output.innerHTML = c.msgs.map(m => `
    <div class="user-msg">${m.q}</div>
    <div class="ai-msg">${m.a.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</div>
  `).join('');
  render();
  scrollToBottom();
}

function startNewChat() {
  currentId = null;
  $output.innerHTML = "";
  render();
}

function copyChat() {
  let t = "";
  document.querySelectorAll('#output > div').forEach(d =>
    t += (d.classList.contains('user-msg') ? "ME: " : "PATRÓN: ") + d.innerText + "\n\n"
  );
  navigator.clipboard.writeText(t);
  alert("Chat copied!");
}

function downloadChat() {
  let t = "";
  document.querySelectorAll('#output > div').forEach(d =>
    t += (d.classList.contains('user-msg') ? "ME: " : "PATRÓN: ") + d.innerText + "\n\n"
  );
  const blob = new Blob([t], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "Tradicion_Chat_Export.txt";
  a.click();
}

function cycleTheme() {
  const themes = ['theme-hq', 'theme-tropical', 'theme-salsa'];
  const body = document.body;
  let idx = themes.findIndex(t => body.classList.contains(t));
  body.classList.remove(themes[idx]);
  body.classList.add(themes[(idx + 1) % themes.length]);
}

function toggleMode() {
  document.body.classList.toggle('dark-mode');
  document.getElementById('modeIcon').innerText =
    document.body.classList.contains('dark-mode') ? 'light_mode' : 'dark_mode';
}
