"use strict";

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "forbeats.bei-sihuan.v1";
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const LABELS = ["主旋律", "和声铺底", "Clap 重拍", "Kick 底鼓", "Closed Hat", "808 低频"];
const DESCRIPTIONS = [
  "先用清楚、明亮的拨弦音建立记忆点。让音符之间有空隙，给演唱留出位置。",
  "四个音同时落下，用轻一点的和声托住主旋律。先把音量调小，再慢慢加。",
  "把重音稳稳放在每小节第 3 拍。先让旋律与 Clap 一起循环。",
  "用短尾底鼓建立推进感。每小节第一颗稍重，其余留一点弹性。",
  "八分音符打底，用力度起伏和两处结尾变化补上律动。",
  "低音起点贴着 Kick，拉开长短与停顿。先把音区和尾音弄清楚，再考虑滑音。",
];
const INSTRUCTIONS = [
  ["每小节主要从第 1、6、9、13 格开始；前四小节的长度依次是 3、2、2、2 格。", "第 5–7 小节复制第 1–3；第 8 小节第 13 格放 F#6、第 15 格放 E6，各长 1 格。", "力度先用 75%、60%、68%、55%；Delay 先关，混响保持很轻。"],
  ["每小节第 1 格同时放四个音，音高按左侧图谱逐颗输入。", "第 1–7 小节每颗长 15 格；第 8 小节缩短到 12 格，给结尾留空。", "力度约 50%。Pad 只补和声；可听尾音还由预设的 Release 决定。"],
  ["把 Clap_01.wav 拖入 Channel Rack，作为独立 Sampler Channel。", "每一小节第 9 格放一颗 C5，长度 1 格，力度约 80%。", "第 9 格是第 3 拍。鼓的 C5 表示原速触发键，不是鼓声的实际基频。"],
  ["把 Kick_02.wav 拖入独立 Sampler Channel。所有音都是 C5、长 1 格。", "第 1–4 小节落点依次为 1/7/12、1/6/11、1/7/15、1/8/12；第 5–8 小节重复。", "每小节第一颗力度约 85%，其余约 75%。"],
  ["用 ClosedHat_01.wav；基础落点 1、3、5、7、9、11、13、15，全部 C5、长 1 格。", "第 4 小节最后一拍改为 13、14、15、16；第 8 小节删掉 13、15。", "基础力度依次 60/38/50/40/60/38/50/40%；第 4 小节最后四颗为 45/30/50/35%。Swing 先设 0。"],
  ["选择 808 Clean。起点与 Kick 相同，长度按图；力度先统一约 80%。", "第 5–7 小节复制第 1–3；第 8 小节第 12 格的 D2 只长 1 格。", "用 Tuner 核对实际音区：FL 的 C2≈32.7 Hz、D2≈36.7 Hz、E2≈41.2 Hz。先不加滑音。"],
];
let score;
let currentTrack = 0;
let selectedIndex = 0;
let startBar = 1;
let barsVisible = window.innerWidth < 650 ? 1 : 4;
let zoom = 1;
let saved = { completed: [], notes: {}, track: 0 };
let storageWorks = true;
let playing = false;
let elapsedMs = 0;
let startedAt = 0;
let animationFrame = 0;
let audioContext;
let lastBeat = -1;
let svgLayout;
let toastTimer;
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const two = (n) => String(n).padStart(2, "0");
const pitchName = (n) => `${NAMES[n % 12]}${Math.floor(n / 12)}`;
const pitchNumber = (p) => Number(p.slice(-1)) * 12 + NAMES.indexOf(p.slice(0, -1));
const track = () => score.tracks[currentTrack];

function readSaved() {
  try {
    const input = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (input && typeof input === "object") {
      saved.completed = Array.isArray(input.completed) ? input.completed.filter((n) => Number.isInteger(n) && n >= 0 && n < 6) : [];
      saved.notes = input.notes && typeof input.notes === "object" && !Array.isArray(input.notes) ? input.notes : {};
      saved.track = Number.isInteger(input.track) && input.track >= 0 && input.track < 6 ? input.track : 0;
    }
  } catch { storageWorks = false; }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    $("saveStatus").textContent = "已保存到当前浏览器";
  } catch {
    storageWorks = false;
    $("saveStatus").textContent = "浏览器未允许保存，当前内容仅在此页保留";
  }
  if (!storageWorks) $("storageWarning").textContent = "本地存储不可用";
}

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2200);
}

function renderNavigation() {
  $("trackNav").replaceChildren();
  score.tracks.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "track-button";
    button.setAttribute("aria-current", String(index === currentTrack));
    button.setAttribute("aria-label", `${index + 1}. ${LABELS[index]}${saved.completed.includes(index) ? "，已完成" : ""}`);
    button.innerHTML = `<span class="track-number">${two(index + 1)}</span><span><span class="track-name">${LABELS[index]}</span><span class="track-kind">${escapeHTML(item.channel)}</span></span><span class="track-done">${saved.completed.includes(index) ? "✓" : ""}</span>`;
    button.addEventListener("click", () => selectTrack(index));
    $("trackNav").append(button);
  });
  const count = new Set(saved.completed).size;
  $("progressLabel").textContent = `${count} / 6`;
  $("progressFill").style.width = `${count / 6 * 100}%`;
  const done = saved.completed.includes(currentTrack);
  $("completeButton").setAttribute("aria-pressed", String(done));
  $("completeIcon").textContent = done ? "✓" : "○";
  $("completeText").textContent = done ? "这一层已完成" : "这一层做好了";
}

function selectTrack(index) {
  stopTransport(true);
  currentTrack = index;
  selectedIndex = 0;
  startBar = 1;
  saved.track = index;
  save();
  renderTrack();
}

function renderTrack() {
  const item = track();
  $("stepLabel").textContent = `${two(currentTrack + 1)} · ${LABELS[currentTrack]}`;
  $("trackTitle").textContent = LABELS[currentTrack];
  $("trackDescription").textContent = DESCRIPTIONS[currentTrack];
  $("presetName").textContent = item.preset.replaceAll(" > ", "  /  ");
  $("instrumentHint").textContent = item.sample_filename
    ? `本地素材：SampleRadar-Trap / Drum_Hits / ${item.sample_filename}`
    : `在 Channel Rack 添加 FLEX，选包和预设；Channel 命名为 ${item.channel}。`;
  $("taskNumber").textContent = `STEP ${two(currentTrack + 1)}`;
  $("instructions").replaceChildren(...INSTRUCTIONS[currentTrack].map((text) => {
    const li = document.createElement("li"); li.textContent = text; return li;
  }));
  $("personalNotes").value = typeof saved.notes[item.id] === "string" ? saved.notes[item.id] : "";
  $("saveStatus").textContent = "";
  $("previousTrack").disabled = currentTrack === 0;
  $("nextTrack").disabled = currentTrack === 5;
  $("nextTrack").textContent = currentTrack === 5 ? "六层图谱已到末尾" : `下一层：${LABELS[currentTrack + 1]} →`;
  $("footerStep").textContent = `${two(currentTrack + 1)} / 06`;
  renderNavigation(); renderRoll(); renderTable(); renderInspector();
}

function renderRoll() {
  const item = track();
  const lo = pitchNumber(item.pitch_low), hi = pitchNumber(item.pitch_high);
  const row = document.body.classList.contains("focus-mode") ? 24 : 28;
  const left = 62, top = 73;
  const cells = barsVisible * 16;
  const cell = Math.max(12, ($( "rollScroll").clientWidth - left - 2) / cells) * zoom;
  const width = left + cells * cell + 1;
  const gridHeight = (hi - lo + 1) * row;
  const height = top + gridHeight + 48;
  const endBar = Math.min(8, startBar + barsVisible - 1);
  $("barRangeLabel").textContent = startBar === endBar ? `第 ${startBar} 小节` : `第 ${startBar}–${endBar} 小节`;
  $("previousBars").disabled = startBar === 1;
  $("nextBars").disabled = endBar === 8;
  $("zoomLabel").textContent = `${Math.round(zoom * 100)}%`;
  const svg = $("pianoRoll");
  svg.setAttribute("width", width); svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-label", `${LABELS[currentTrack]}，第 ${startBar} 至 ${endBar} 小节，1 格等于四分之一拍`);
  const parts = [`<rect width="${width}" height="${height}" fill="#26392f"/>`];
  for (let n = hi; n >= lo; n--) {
    const y = top + (hi - n) * row;
    const sharp = [1, 3, 6, 8, 10].includes(n % 12);
    parts.push(`<rect x="${left}" y="${y}" width="${width - left}" height="${row}" fill="${sharp ? "#273b31" : "#2e4436"}"/>`);
    parts.push(`<rect x="0" y="${y + .5}" width="${left - 1}" height="${row - 1}" fill="${sharp ? "#1b2921" : "#abb7a5"}"/>`);
    parts.push(`<text x="${left - 10}" y="${y + 18}" fill="${sharp ? "#b5c2ad" : "#2b3b2a"}" text-anchor="end" font-size="11" font-family="Consolas,monospace">${pitchName(n)}</text>`);
    parts.push(`<line x1="${left}" x2="${width}" y1="${y}" y2="${y}" stroke="#24372d" stroke-width=".6"/>`);
  }
  parts.push(`<rect width="${width}" height="${top}" fill="#1c2a21"/>`);
  for (let j = 0; j < barsVisible; j++) {
    const bx = left + j * 16 * cell;
    const bar = startBar + j;
    const chord = ["Cmaj7", "Dadd9", "Em7", "Dadd9"][(bar - 1) % 4];
    parts.push(`<text x="${bx + 8}" y="25" fill="#d6e1ce" font-size="12" font-family="Segoe UI,Microsoft YaHei,sans-serif">${two(bar)}${barsVisible <= 4 ? ` · ${[0, 1, 5].includes(currentTrack) ? chord : "第 " + bar + " 小节"}` : ""}</text>`);
    for (let step = 1; step <= 16; step++) {
      const x = bx + (step - .5) * cell;
      if (cell >= 11 || [1, 5, 9, 13].includes(step))
        parts.push(`<text x="${x}" y="54" fill="${step % 4 === 1 ? "#c7ef97" : "#829782"}" text-anchor="middle" font-size="9" font-family="Consolas,monospace">${step}</text>`);
    }
  }
  for (let i = 0; i <= cells; i++) {
    const x = left + i * cell;
    parts.push(`<line x1="${x}" x2="${x}" y1="${i % 16 === 0 ? 0 : top}" y2="${top + gridHeight}" stroke="${i % 16 === 0 ? "#7b9479" : i % 4 === 0 ? "#55704f" : "#23392b"}" stroke-width="${i % 16 === 0 ? 1.2 : .7}"/>`);
  }
  const lane = top + gridHeight;
  parts.push(`<rect x="0" y="${lane}" width="${width}" height="48" fill="#1c2b21"/><text x="10" y="${lane + 28}" fill="#8d9f87" font-size="9">力度</text>`);
  item.notes.forEach((note, index) => {
    if (note.bar < startBar || note.bar > endBar) return;
    const x = left + ((note.bar - startBar) * 16 + note.step - 1) * cell;
    const y = top + (hi - note.midi) * row;
    const w = note.length_steps * cell - 1.3;
    const desc = `第 ${note.bar} 小节，第 ${note.step} 格，${note.pitch}，长 ${note.length_steps} 格，力度 ${note.velocity_percent}%`;
    parts.push(`<g class="note-group" tabindex="0" role="button" data-note="${index}" aria-label="${escapeHTML(desc)}"><title>${escapeHTML(desc)}</title><rect class="note-block${index === selectedIndex ? " is-selected" : ""}" x="${x + .65}" y="${y + 3}" width="${w}" height="${row - 6}" rx="2" fill="#c7e5a5"/>`);
    if (w >= 23) parts.push(`<text pointer-events="none" x="${x + 5}" y="${y + 17}" fill="#2f4529" font-size="${w < 31 ? 8 : 10}" font-family="Consolas,monospace">${note.pitch}${w > 72 ? ` · ${note.length_steps}格` : ""}</text>`);
    parts.push("</g>");
    parts.push(`<line x1="${x + 2}" x2="${x + 2}" y1="${lane + 43}" y2="${lane + 43 - note.velocity_percent * .32}" stroke="#b7d993" stroke-width="1.4"/><circle cx="${x + 2}" cy="${lane + 43 - note.velocity_percent * .32}" r="1.8" fill="#c7ef97"/>`);
  });
  parts.push(`<line id="playhead" x1="${left}" x2="${left}" y1="34" y2="${lane + 48}" stroke="#f1cd8d" stroke-width="1.6" visibility="hidden" pointer-events="none"/>`);
  svg.innerHTML = parts.join("");
  svg.querySelectorAll("[data-note]").forEach((group) => {
    group.addEventListener("click", () => selectNote(Number(group.dataset.note)));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectNote(Number(group.dataset.note)); }
    });
  });
  svgLayout = { left, cell };
}

function selectNote(index) {
  selectedIndex = index;
  $("pianoRoll").querySelectorAll("[data-note]").forEach((group) => group.querySelector("rect").classList.toggle("is-selected", Number(group.dataset.note) === index));
  $("noteTable").querySelectorAll("[data-note]").forEach((button) => button.classList.toggle("selected", Number(button.dataset.note) === index));
  renderInspector();
}

function renderInspector() {
  const n = track().notes[selectedIndex];
  const end = n.step + n.length_steps;
  $("rollSelection").textContent = `${n.pitch} · 第 ${n.bar} 小节 / ${n.step} 格 · 长 ${n.length_steps} 格`;
  $("noteDetails").innerHTML = `<div class="note-main"><div class="note-pitch">${n.pitch}</div><div><strong>第 ${n.bar} 小节 · 第 ${n.step} 格</strong><p>从这一格的左边界开始</p></div></div><div class="note-stats"><div class="note-stat"><span>长度</span><strong>${n.length_steps} <small>格 / ${n.length_steps / 4} 拍</small></strong></div><div class="note-stat"><span>力度</span><strong>${n.velocity_percent}<small>%</small></strong></div><div class="note-stat"><span>按住时长</span><strong>${(n.length_steps * 60 / 140 / 4).toFixed(3)}<small> 秒</small></strong></div></div>`;
  $("noteExplanation").textContent = `占第 ${n.step}${n.length_steps > 1 ? `–${end - 1}` : ""} 格，到${end === 17 ? "下一小节第 1" : `本小节第 ${end}`}格左边界松开。音源的尾音可能继续延伸。`;
}

function renderTable() {
  $("noteTable").replaceChildren();
  for (let bar = startBar; bar < startBar + barsVisible; bar++) {
    const row = document.createElement("div"); row.className = "note-table-row";
    const label = document.createElement("span"); label.className = "bar-name"; label.textContent = `第 ${bar} 小节`;
    const list = document.createElement("div"); list.className = "note-chips";
    track().notes.forEach((note, index) => {
      if (note.bar !== bar) return;
      const button = document.createElement("button");
      button.className = `note-chip${index === selectedIndex ? " selected" : ""}`;
      button.dataset.note = index;
      button.innerHTML = `<span>${two(note.step)} →</span> ${note.pitch} <span>× ${note.length_steps}格</span>`;
      button.setAttribute("aria-label", `定位第 ${bar} 小节第 ${note.step} 格 ${note.pitch}`);
      button.addEventListener("click", () => {
        selectNote(index);
        const group = $("pianoRoll").querySelector(`[data-note="${index}"]`);
        if (group) {
          const x = Number(group.querySelector("rect").getAttribute("x"));
          $("rollScroll").scrollLeft = Math.max(0, x - $("rollScroll").clientWidth / 2);
        }
      });
      list.append(button);
    });
    row.append(label, list); $("noteTable").append(row);
  }
}

function changeRange(bar) {
  startBar = Math.max(1, Math.min(9 - barsVisible, bar));
  const candidate = track().notes.findIndex((n) => n.bar >= startBar && n.bar < startBar + barsVisible);
  if (candidate !== -1) selectedIndex = candidate;
  renderRoll(); renderTable(); renderInspector();
  $("rollScroll").scrollLeft = 0;
}

async function prepareAudio() {
  if (!$("metronome").checked) return;
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error("Audio unavailable");
    if (!audioContext) audioContext = new Context();
    if (audioContext.state === "suspended") await audioContext.resume();
  } catch { $("metronome").checked = false; toast("当前浏览器不能发声，仍可使用走拍定位"); }
}

function clickBeat(beat) {
  if (!$("metronome").checked || !audioContext || audioContext.state !== "running") return;
  const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.frequency.value = beat % 4 === 0 ? 1200 : 850;
  gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.06, now + .003);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .045);
  oscillator.connect(gain); gain.connect(audioContext.destination);
  oscillator.start(now); oscillator.stop(now + .05);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}

function animate(now) {
  if (!playing) return;
  const stepMs = 60000 / score.bpm / 4;
  const step = ((elapsedMs + now - startedAt) / stepMs) % 128;
  const bar = Math.floor(step / 16) + 1, inside = Math.floor(step % 16) + 1;
  const beat = Math.floor(step / 4);
  if (beat !== lastBeat) { clickBeat(beat); lastBeat = beat; }
  if (bar < startBar || bar >= startBar + barsVisible) {
    changeRange(Math.floor((bar - 1) / barsVisible) * barsVisible + 1);
  }
  const x = svgLayout.left + (step - (startBar - 1) * 16) * svgLayout.cell;
  const line = $("playhead");
  if (line) { line.setAttribute("x1", x); line.setAttribute("x2", x); line.setAttribute("visibility", "visible"); }
  $("transportPosition").innerHTML = `${two(bar)} <span>:</span> ${two(inside)}`;
  animationFrame = requestAnimationFrame(animate);
}

function stopTransport(reset = false) {
  if (playing) elapsedMs += performance.now() - startedAt;
  playing = false; cancelAnimationFrame(animationFrame);
  $("playIcon").textContent = "▶"; $("playText").textContent = "走拍";
  $("playButton").setAttribute("aria-label", "开始走拍");
  if (reset) { elapsedMs = 0; lastBeat = -1; $("transportPosition").innerHTML = "01 <span>:</span> 01"; }
  if ($("playhead")) $("playhead").setAttribute("visibility", "hidden");
}

function bindControls() {
  $("barsVisible").value = barsVisible;
  $("barsVisible").addEventListener("change", () => { barsVisible = Number($("barsVisible").value); changeRange(Math.floor((startBar - 1) / barsVisible) * barsVisible + 1); });
  $("previousBars").addEventListener("click", () => changeRange(startBar - barsVisible));
  $("nextBars").addEventListener("click", () => changeRange(startBar + barsVisible));
  $("zoomIn").addEventListener("click", () => { zoom = Math.min(2.5, Math.round((zoom + .25) * 100) / 100); renderRoll(); });
  $("zoomOut").addEventListener("click", () => { zoom = Math.max(.75, Math.round((zoom - .25) * 100) / 100); renderRoll(); });
  $("previousTrack").addEventListener("click", () => currentTrack > 0 && selectTrack(currentTrack - 1));
  $("nextTrack").addEventListener("click", () => currentTrack < 5 && selectTrack(currentTrack + 1));
  $("completeButton").addEventListener("click", () => {
    saved.completed = saved.completed.includes(currentTrack) ? saved.completed.filter((n) => n !== currentTrack) : [...saved.completed, currentTrack];
    save(); renderNavigation();
  });
  $("personalNotes").addEventListener("input", () => { saved.notes[track().id] = $("personalNotes").value; save(); });
  $("copyPreset").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(track().preset); toast("音色名称已复制"); }
    catch { toast("请直接选中音色名称复制"); }
  });
  $("helpButton").addEventListener("click", () => $("helpDialog").showModal());
  $("imageButton").addEventListener("click", () => {
    $("imageTitle").textContent = `${LABELS[currentTrack]} · 完整八小节`;
    $("fullImage").src = `assets/${track().id}.png`;
    $("downloadImage").href = $("fullImage").src;
    $("imageDialog").showModal();
  });
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
  $("focusButton").addEventListener("click", () => {
    const focused = document.body.classList.toggle("focus-mode");
    $("focusButton").setAttribute("aria-pressed", String(focused));
    $("focusButton").textContent = focused ? "退出专注 ⛶" : "专注模式 ⛶";
    requestAnimationFrame(renderRoll);
  });
  $("playButton").addEventListener("click", async () => {
    if (playing) { stopTransport(); return; }
    await prepareAudio(); playing = true; startedAt = performance.now(); lastBeat = -1;
    $("playIcon").textContent = "Ⅱ"; $("playText").textContent = "暂停";
    $("playButton").setAttribute("aria-label", "暂停走拍");
    animationFrame = requestAnimationFrame(animate);
  });
  $("metronome").addEventListener("change", prepareAudio);
  $("restartButton").addEventListener("click", () => { stopTransport(true); changeRange(1); });
  // Browsers throttle background frames; pause instead of implying DAW-grade sync.
  document.addEventListener("visibilitychange", () => { if (document.hidden && playing) stopTransport(); });
  let previousWidth = 0;
  new ResizeObserver((entries) => {
    const width = Math.round(entries[0].contentRect.width);
    if (width !== previousWidth && score) { previousWidth = width; renderRoll(); }
  }).observe($("rollScroll"));
  $("helpGrid").innerHTML = Array.from({ length: 16 }, (_, i) => `<span class="${i % 4 === 0 ? "beat " : ""}${[5, 6].includes(i) ? "example" : ""}">${i + 1}</span>`).join("");
}

async function init() {
  const response = await fetch("score.json", { cache: "no-cache" });
  if (!response.ok) throw new Error(`Score HTTP ${response.status}`);
  score = await response.json();
  if (score.bpm !== 140 || score.tracks?.length !== 6 || score.bars !== 8) throw new Error("Score schema mismatch");
  readSaved(); currentTrack = saved.track;
  bindControls(); renderTrack();
}
init().catch((error) => {
  console.error("Unable to load studio", error);
  $("trackTitle").textContent = "谱面暂时未载入";
  $("trackDescription").textContent = "请刷新页面重试；若问题持续，检查 score.json 是否随页面一起部署。";
});
