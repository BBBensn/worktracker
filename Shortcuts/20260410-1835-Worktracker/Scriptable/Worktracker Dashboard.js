// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;
// Worktracker Dashboard
// Reads worktracker_widget.txt and worktracker_logs.txt from iCloud/Scriptable/

const WIDGET_FILE = "worktracker/worktracker_widget.txt";
const LOGS_FILE = "worktracker/worktracker_logs.txt";

// ── Colors ──────────────────────────────────────────────────────────────────
const isDark = Device.isUsingDarkAppearance();
const C = {
  bg:         isDark ? new Color("#1C1C1E") : new Color("#F2F2F7"),
  card:       isDark ? new Color("#2C2C2E") : new Color("#FFFFFF"),
  cardAlt:    isDark ? new Color("#3A3A3C") : new Color("#F0F0F5"),
  accent:     new Color("#FF6B35"),
  accentBlue: new Color("#0A84FF"),
  accentGreen:new Color("#30D158"),
  accentRed:  new Color("#FF453A"),
  accentYellow:new Color("#FFD60A"),
  text:       isDark ? new Color("#FFFFFF") : new Color("#000000"),
  textSec:    isDark ? new Color("#ABABAB") : new Color("#6C6C70"),
  textTert:   isDark ? new Color("#636366") : new Color("#AEAEB2"),
  pauseRow:   isDark ? new Color("#252528") : new Color("#F8F8FC"),
  divider:    isDark ? new Color("#3A3A3C") : new Color("#E5E5EA"),
};

// ── Read files ───────────────────────────────────────────────────────────────
function readFile(filename) {
  const fm = FileManager.iCloud();
  const path = fm.joinPath(fm.documentsDirectory(), filename);
  if (!fm.fileExists(path)) return null;
  try {
    fm.downloadFileFromiCloud(path);
    return fm.readString(path);
  } catch(e) { return null; }
}

function parseJSON(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch(e) { return null; }
}

// ── Parse logs (newline-delimited JSON objects) ──────────────────────────────
function parseLogs(str) {
  if (!str) return [];
  // Try as JSON array first
  const arr = parseJSON(str);
  if (Array.isArray(arr)) return arr;
  // Fallback: one JSON object per line
  return str.split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("{"))
    .map(l => parseJSON(l))
    .filter(Boolean);
}

// ── Time helpers ─────────────────────────────────────────────────────────────
function parseISO(ts) {
  if (!ts || ts === "-") return null;
  return new Date(ts);
}

function fmtTime(d) {
  if (!d) return "--:--";
  return d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
}

function fmtDuration(minutes) {
  const m = parseInt(minutes) || 0;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

function minutesBetween(a, b) {
  if (!a || !b) return 0;
  return Math.round((b - a) / 60000);
}

// ── Extract break pairs from logs since work_start ───────────────────────────
function getBreaksForShift(logs, workStartISO) {
  const wsDate = parseISO(workStartISO);
  if (!wsDate) return [];

  // Filter logs that belong to this shift (after work_start)
  const shiftLogs = logs.filter(l => {
    const t = parseISO(l.timestamp);
    return t && t >= wsDate;
  });

  // Build break pairs
  const breaks = [];
  let currentStart = null;

  // Sort ascending by timestamp
  shiftLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  for (const entry of shiftLogs) {
    if (entry.event === "break_start") {
      currentStart = entry;
    } else if (entry.event === "break_end" && currentStart) {
      const startDate = parseISO(currentStart.timestamp);
      const endDate = parseISO(entry.timestamp);
      const dur = minutesBetween(startDate, endDate);
      breaks.push({
        start: fmtTime(startDate),
        end: fmtTime(endDate),
        duration: dur,
        type: entry.pause_type || "-",
        zig_spicy: parseInt(entry.zig_spicy) || 0,
        zig_blend: parseInt(entry.zig_blend) || 0,
      });
      currentStart = null;
    }
  }

  // Active break (started but not ended yet)
  if (currentStart) {
    const startDate = parseISO(currentStart.timestamp);
    const now = new Date();
    const dur = minutesBetween(startDate, now);
    breaks.push({
      start: fmtTime(startDate),
      end: null, // active
      duration: dur,
      type: "aktiv",
      zig_spicy: 0,
      zig_blend: 0,
      active: true,
    });
  }

  return breaks;
}

// ── UI helpers ───────────────────────────────────────────────────────────────
function addCard(parent, padding = 14) {
  const card = parent.addStack();
  card.backgroundColor = C.card;
  card.cornerRadius = 14;
  card.setPadding(padding, padding, padding, padding);
  card.layoutVertically();
  return card;
}

function addRow(parent, gap = 0) {
  if (gap > 0) parent.addSpacer(gap);
  const row = parent.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  return row;
}

function addLabel(parent, text, size, color, bold = false, lines = 1) {
  const t = parent.addText(String(text));
  t.font = bold ? Font.boldSystemFont(size) : Font.systemFont(size);
  t.textColor = color;
  t.lineLimit = lines;
  return t;
}

function addSectionHeader(parent, text, gap = 16) {
  parent.addSpacer(gap);
  addLabel(parent, text.toUpperCase(), 10, C.textTert, true);
  parent.addSpacer(4);
}

function divider(parent) {
  parent.addSpacer(8);
  const d = parent.addStack();
  d.backgroundColor = C.divider;
  d.size = new Size(0, 1);
  parent.addSpacer(8);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const rawWidget = readFile(WIDGET_FILE);
  const rawLogs = readFile(LOGS_FILE);

  const w = parseJSON(rawWidget);
  const logs = parseLogs(rawLogs);

  // Present full-screen table view
  const table = new UITable();
  table.showSeparators = false;

  if (!w) {
    const row = new UITableRow();
    row.addText("Keine Daten", "worktracker_widget.txt nicht gefunden");
    table.addRow(row);
    await table.present(true);
    return;
  }

  // ── Parse widget data ────────────────────────────────────────────────────
  const working = w.working === "true";
  const onBreak = w.on_break === "true";
  const station = w.station || "-";
  const shift = w.shift || "-";
  const workStartISO = w.work_start || null;
  const workStartDate = parseISO(workStartISO);
  const breakType = w.break_type || "-";
  const breakDuration = parseInt(w.break_duration) || 0;
  const zigSpicyCurrent = parseInt(w.zig_spicy) || 0;
  const zigBlendCurrent = parseInt(w.zig_blend) || 0;

  // ── Get breaks from logs ─────────────────────────────────────────────────
  const breaks = getBreaksForShift(logs, workStartISO);
  const totalBreakMin = breaks.reduce((s, b) => s + (b.active ? 0 : b.duration), 0);

  // Total zig from all breaks
  const totalZigSpicy = breaks.reduce((s, b) => s + b.zig_spicy, 0);
  const totalZigBlend = breaks.reduce((s, b) => s + b.zig_blend, 0);

  // Net work time
  const now = new Date();
  const totalWorkMin = workStartDate ? minutesBetween(workStartDate, now) : 0;
  const netWorkMin = Math.max(0, totalWorkMin - totalBreakMin);

  // ── Build WebView-based UI ───────────────────────────────────────────────
  // We use a WebView for rich layout
  const statusColor = !working ? "#FF453A" : onBreak ? "#FFD60A" : "#30D158";
  const statusText = !working ? "Kein Dienst" : onBreak ? "⏸ Pause" : "● Aktiv";

  const breakRowsHTML = breaks.length === 0
    ? `<tr><td colspan="4" class="empty">Keine Pausen bisher</td></tr>`
    : breaks.map((b, i) => {
        const endStr = b.active ? '<span class="active-badge">AKTIV</span>' : b.end;
        const durStr = b.active
          ? `<span class="active-dur">${b.duration} min</span>`
          : fmtDuration(b.duration);
        const typeStr = b.type;
        const zigStr = (b.zig_spicy > 0 || b.zig_blend > 0)
          ? `🚬 ${b.zig_spicy > 0 ? b.zig_spicy + "S" : ""}${b.zig_spicy > 0 && b.zig_blend > 0 ? "+" : ""}${b.zig_blend > 0 ? b.zig_blend + "N" : ""}`
          : "";
        return `<tr class="${b.active ? "active-row" : i % 2 === 0 ? "row-even" : "row-odd"}">
          <td>${b.start}</td>
          <td>${endStr}</td>
          <td>${durStr}</td>
          <td>${typeStr} ${zigStr}</td>
        </tr>`;
      }).join("");

  const workStartStr = workStartDate ? fmtTime(workStartDate) : "--:--";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body {
    font-family: -apple-system, sans-serif;
    background: ${isDark ? "#1C1C1E" : "#F2F2F7"};
    color: ${isDark ? "#FFFFFF" : "#000000"};
    padding: 16px;
    padding-bottom: 32px;
  }
  .card {
    background: ${isDark ? "#2C2C2E" : "#FFFFFF"};
    border-radius: 14px;
    padding: 14px 16px;
    margin-bottom: 12px;
  }
  .section-label {
    font-size: 11px;
    font-weight: 600;
    color: ${isDark ? "#636366" : "#AEAEB2"};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  /* Header */
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .station { font-size: 24px; font-weight: 700; }
  .shift { font-size: 14px; color: ${isDark ? "#ABABAB" : "#6C6C70"}; margin-top: 2px; }
  .status-badge {
    font-size: 13px;
    font-weight: 600;
    color: ${isDark ? "#1C1C1E" : "#FFFFFF"};
    background: ${statusColor};
    padding: 5px 12px;
    border-radius: 20px;
  }
  /* Stat grid */
  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }
  .stat-card {
    background: ${isDark ? "#2C2C2E" : "#FFFFFF"};
    border-radius: 14px;
    padding: 12px;
    text-align: center;
  }
  .stat-value { font-size: 20px; font-weight: 700; }
  .stat-label { font-size: 10px; color: ${isDark ? "#ABABAB" : "#6C6C70"}; margin-top: 3px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
  /* Timeline */
  .time-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
  }
  .time-label { font-size: 13px; color: ${isDark ? "#ABABAB" : "#6C6C70"}; }
  .time-value { font-size: 15px; font-weight: 600; }
  .divider { height: 1px; background: ${isDark ? "#3A3A3C" : "#E5E5EA"}; margin: 4px 0; }
  /* Break table */
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 0 6px 8px 6px; font-size: 11px; font-weight: 600; color: ${isDark ? "#636366" : "#AEAEB2"}; text-transform: uppercase; }
  td { padding: 7px 6px; vertical-align: middle; }
  .row-even td { background: ${isDark ? "#252528" : "#F8F8FC"}; }
  .row-even td:first-child { border-radius: 8px 0 0 8px; }
  .row-even td:last-child { border-radius: 0 8px 8px 0; }
  .active-row td { background: rgba(255,214,10,0.12); }
  .active-row td:first-child { border-radius: 8px 0 0 8px; }
  .active-row td:last-child { border-radius: 0 8px 8px 0; }
  .active-badge { color: #FFD60A; font-weight: 700; font-size: 11px; }
  .active-dur { color: #FFD60A; font-weight: 700; }
  .empty { text-align: center; padding: 16px; color: ${isDark ? "#636366" : "#AEAEB2"}; font-style: italic; }
  /* Zig section */
  .zig-row { display: flex; gap: 10px; }
  .zig-card {
    flex: 1;
    background: ${isDark ? "#2C2C2E" : "#FFFFFF"};
    border-radius: 14px;
    padding: 12px;
    text-align: center;
  }
  .zig-value { font-size: 28px; font-weight: 700; }
  .zig-label { font-size: 11px; color: ${isDark ? "#ABABAB" : "#6C6C70"}; margin-top: 3px; font-weight: 500; }
  /* Updated */
  .updated { text-align: center; font-size: 11px; color: ${isDark ? "#48484A" : "#C7C7CC"}; margin-top: 8px; }
</style>
</head>
<body>

<!-- Header Card -->
<div class="card">
  <div class="header-row">
    <div>
      <div class="station">${station}</div>
      <div class="shift">${shift}</div>
    </div>
    <div class="status-badge">${statusText}</div>
  </div>
</div>

<!-- Stats -->
<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-value" style="color:#0A84FF">${workStartStr}</div>
    <div class="stat-label">Beginn</div>
  </div>
  <div class="stat-card">
    <div class="stat-value" style="color:#FF6B35">${fmtDuration(totalBreakMin)}</div>
    <div class="stat-label">Gesamtpause</div>
  </div>
  <div class="stat-card">
    <div class="stat-value" style="color:#30D158">${fmtDuration(netWorkMin)}</div>
    <div class="stat-label">Nettozeit</div>
  </div>
</div>

<!-- Pause table -->
<div class="section-label">Pausen</div>
<div class="card" style="padding: 14px 10px;">
  <table>
    <thead>
      <tr>
        <th>Von</th>
        <th>Bis</th>
        <th>Dauer</th>
        <th>Typ</th>
      </tr>
    </thead>
    <tbody>
      ${breakRowsHTML}
    </tbody>
  </table>
</div>

<!-- Zigaretten -->
<div class="section-label">Zigaretten (Dienst gesamt)</div>
<div class="zig-row">
  <div class="zig-card">
    <div class="zig-value" style="color:#FF6B35">${totalZigSpicy}</div>
    <div class="zig-label">🌶 Spicy</div>
  </div>
  <div class="zig-card">
    <div class="zig-value" style="color:#ABABAB">${totalZigBlend}</div>
    <div class="zig-label">🚬 Normal</div>
  </div>
  <div class="zig-card">
    <div class="zig-value">${totalZigSpicy + totalZigBlend}</div>
    <div class="zig-label">Gesamt</div>
  </div>
</div>

<div class="updated">Zuletzt aktualisiert: ${fmtTime(new Date())}</div>

</body>
</html>`;

  const wv = new WebView();
  await wv.loadHTML(html);
  await wv.present(false); // false = fullscreen
}

await main();