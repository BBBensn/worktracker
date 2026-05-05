// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
// Worktracker Medium Widget v7.2
// Row 3 overhaul: Pause ohne Typ, Letzte Pause mit Von-Bis-Dauer, Dienstende mit Datum
// Emojis für Zigaretten wiederhergestellt

const WIDGET_FILE = "worktracker/worktracker_widget.txt";
const LOGS_FILE   = "worktracker/worktracker_logs.txt";

function readFile(name) {
  try {
    const fm = FileManager.iCloud();
    const path = fm.joinPath(fm.documentsDirectory(), name);
    if (!fm.fileExists(path)) return null;
    if (!fm.isFileDownloaded(path)) fm.downloadFileFromiCloud(path);
    return fm.readString(path);
  } catch(e) { return null; }
}

function parseJSON(s) {
  if (!s) return null;
  try { return JSON.parse(s); } catch(e) { return null; }
}

function parseLogs(s) {
  if (!s) return [];
  const arr = parseJSON(s);
  if (Array.isArray(arr)) return arr;
  return s.split("\n").map(l => l.trim()).filter(l => l.startsWith("{")).map(l => parseJSON(l)).filter(Boolean);
}

function parseISO(ts) {
  if (!ts || ts === "-") return null;
  return new Date(ts);
}

function fmtTime(d) {
  if (!d) return "--:--";
  return d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d) {
  if (!d) return "";
  return d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" });
}

function fmtDur(min) {
  min = parseInt(min) || 0;
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), r = min % 60;
  return r > 0 ? `${h}h ${r}m` : `${h}h`;
}

function minBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((b - a) / 60000));
}

function getBreakStats(logs, workStartISO) {
  const wsDate = parseISO(workStartISO);
  if (!wsDate) return { totalMin: 0, zigSpicy: 0, zigBlend: 0, activeBreak: null, lastBreak: null };
  const shiftLogs = logs
    .filter(l => { const t = parseISO(l.timestamp); return t && t >= wsDate; })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  let totalMin = 0, zigSpicy = 0, zigBlend = 0, pendingStart = null, activeBreak = null, lastBreak = null;
  for (const e of shiftLogs) {
    if (e.event === "break_start") {
      pendingStart = parseISO(e.timestamp);
    } else if (e.event === "break_end" && pendingStart) {
      const endDate = parseISO(e.timestamp);
      const dur = minBetween(pendingStart, endDate);
      totalMin += dur;
      zigSpicy  += parseInt(e.zig_spicy) || 0;
      zigBlend  += parseInt(e.zig_blend) || 0;
      lastBreak = { since: pendingStart, end: endDate, dur };
      pendingStart = null;
    }
  }
  if (pendingStart) {
    activeBreak = { since: pendingStart, dur: minBetween(pendingStart, new Date()) };
  }
  return { totalMin, zigSpicy, zigBlend, activeBreak, lastBreak };
}

// Colors
const WHITE   = new Color("#FFFFFF");
const WHITE70 = new Color("#FFFFFF", 0.7);
const WHITE40 = new Color("#FFFFFF", 0.4);
const GREEN   = new Color("#30D158");
const YELLOW  = new Color("#FFD60A");
const RED     = new Color("#FF453A");
const ORANGE  = new Color("#FF6B35");
const BLUE    = new Color("#64D2FF");
const TRANSP  = new Color("#000000", 0);

async function buildWidget() {
  const w    = parseJSON(readFile(WIDGET_FILE));
  const logs = parseLogs(readFile(LOGS_FILE));
  const widget = new ListWidget();
  widget.backgroundColor = TRANSP;
  widget.setPadding(12, 14, 10, 14);
  widget.refreshAfterDate = new Date(Date.now() + 60 * 1000);

  if (!w) {
    const t = widget.addText("Keine Daten");
    t.textColor = WHITE;
    t.font = Font.boldSystemFont(13);
    return widget;
  }

  const working       = w.working === "true";
  const onBreak       = w.on_break === "true";
  const station       = w.station   || "-";
  const shift         = w.shift     || "-";
  const workStartISO  = w.work_start || null;
  const workStartDate = parseISO(workStartISO);

  const { totalMin, zigSpicy, zigBlend, activeBreak, lastBreak } = getBreakStats(logs, workStartISO);

  const now = new Date();

  // Wenn kein aktiver Dienst → letztes shift_end-Log als Dienstende
  let workEndDate = null;
  if (!working) {
    const endLog = [...logs].reverse().find(l => l.event === "shift_end");
    if (endLog) workEndDate = parseISO(endLog.timestamp);
  }

  // Netto endet bei Dienstende, nicht bei now
  const refEnd   = working ? now : workEndDate;
  const grossMin = (workStartDate && refEnd) ? minBetween(workStartDate, refEnd) : 0;
  const netMin   = Math.max(0, grossMin - totalMin - (working && activeBreak ? activeBreak.dur : 0));

  const statusColor = !working ? RED : onBreak ? YELLOW : GREEN;
  const statusLabel = !working ? "Kein Dienst" : onBreak ? "Pause" : "Aktiv";

  // ── Timestamp top center ──────────────────────────────────────────────────
  const tsRow = widget.addStack();
  tsRow.layoutHorizontally();
  tsRow.addSpacer();
  const ts = tsRow.addText(fmtTime(now));
  ts.font = Font.systemFont(9);
  ts.textColor = WHITE40;
  tsRow.addSpacer();
  widget.addSpacer(4);

  // ── Row 1: Station + Status ───────────────────────────────────────────────
  const r1 = widget.addStack();
  r1.layoutHorizontally();
  r1.centerAlignContent();
  const left = r1.addStack();
  left.layoutVertically();
  const stTxt = left.addText(station);
  stTxt.font = Font.boldSystemFont(22);
  stTxt.textColor = WHITE;
  stTxt.lineLimit = 1;
  const shTxt = left.addText(shift);
  shTxt.font = Font.systemFont(12);
  shTxt.textColor = WHITE70;
  shTxt.lineLimit = 1;
  r1.addSpacer();
  const statusTxt = r1.addText(statusLabel);
  statusTxt.font = Font.boldSystemFont(13);
  statusTxt.textColor = statusColor;
  widget.addSpacer(10);

  // ── Row 2: 4 stat blocks ──────────────────────────────────────────────────
  const r2 = widget.addStack();
  r2.layoutHorizontally();

  function statBlock(parent, val, label, labelColor) {
    const block = parent.addStack();
    block.layoutVertically();
    const v = block.addText(String(val));
    v.font = Font.boldSystemFont(16);
    v.textColor = WHITE;
    v.minimumScaleFactor = 0.6;
    v.lineLimit = 1;
    const l = block.addText(label);
    l.font = Font.systemFont(10);
    l.textColor = labelColor;
    l.lineLimit = 1;
  }

  statBlock(r2, workStartDate ? fmtTime(workStartDate) : "--:--", "Beginn",     WHITE40);
  r2.addSpacer();
  statBlock(r2, fmtDur(netMin),                                   "Netto",      WHITE40);
  r2.addSpacer();
  statBlock(r2, fmtDur(totalMin + (working && activeBreak ? activeBreak.dur : 0)), "Pausen", WHITE40);
  r2.addSpacer();
  statBlock(r2, String(zigSpicy + zigBlend),                      "Zigaretten", WHITE40);
  widget.addSpacer(8);

  // ── Row 3: Info-Zeile ─────────────────────────────────────────────────────
  const r3 = widget.addStack();
  r3.layoutHorizontally();
  r3.centerAlignContent();

  if (onBreak && activeBreak) {
    // Pause aktiv: "🌶 2  🚬 0  Pause: seit HH:MM · Xm"
    const sv = r3.addText(`🌶 ${zigSpicy}`);
    sv.font = Font.boldSystemFont(13);
    sv.textColor = WHITE70;
    r3.addSpacer(10);
    const bv = r3.addText(`🚬 ${zigBlend}`);
    bv.font = Font.boldSystemFont(13);
    bv.textColor = WHITE70;
    r3.addSpacer(10);
    const pd = r3.addText(`Pause: seit ${fmtTime(activeBreak.since)} · ${activeBreak.dur}m`);
    pd.font = Font.boldSystemFont(13);
    pd.textColor = YELLOW;
    pd.lineLimit = 1;

  } else if (!working && workEndDate) {
    // Kein Dienst → Zigaretten + Dienstende mit Datum
    const sv = r3.addText(`🌶 ${zigSpicy}`);
    sv.font = Font.boldSystemFont(13);
    sv.textColor = WHITE70;
    r3.addSpacer(10);
    const bv = r3.addText(`🚬 ${zigBlend}`);
    bv.font = Font.boldSystemFont(13);
    bv.textColor = WHITE70;
    r3.addSpacer();
    const lb = r3.addText("Dienstende ");
    lb.font = Font.boldSystemFont(13);
    lb.textColor = WHITE70;
    const lv = r3.addText(`${fmtTime(workEndDate)}, ${fmtDate(workEndDate)}`);
    lv.font = Font.boldSystemFont(13);
    lv.textColor = WHITE70;

  } else if (lastBreak) {
    // Dienst aktiv, Pause war → "🌶 X  🚬 X  Letzte Pause: HH:MM–HH:MM"
    const sv = r3.addText(`🌶 ${zigSpicy}`);
    sv.font = Font.boldSystemFont(13);
    sv.textColor = WHITE70;
    r3.addSpacer(10);
    const bv = r3.addText(`🚬 ${zigBlend}`);
    bv.font = Font.boldSystemFont(13);
    bv.textColor = WHITE70;
    r3.addSpacer();
    const ll = r3.addText("Letzte Pause: ");
    ll.font = Font.systemFont(12);
    ll.textColor = WHITE70;
    const lv = r3.addText(`${fmtTime(lastBreak.since)}-${fmtTime(lastBreak.end)}`);
    lv.font = Font.boldSystemFont(13);
    lv.textColor = WHITE70;
    lv.lineLimit = 1;

  } else {
    // Dienst aktiv, noch keine Pause
    const sv = r3.addText(`🌶 ${zigSpicy}`);
    sv.font = Font.boldSystemFont(13);
    sv.textColor = WHITE70;
    r3.addSpacer(10);
    const bv = r3.addText(`🚬 ${zigBlend}`);
    bv.font = Font.boldSystemFont(13);
    bv.textColor = WHITE70;
    r3.addSpacer();
    const lb = r3.addText("Letzte Pause: --:--");
    lb.font = Font.systemFont(12);
    lb.textColor = WHITE40;
  }

  return widget;
}

const widget = await buildWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();