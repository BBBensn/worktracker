// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;
const fm = FileManager.iCloud();
const path = fm.joinPath(fm.documentsDirectory(), "worktracker/worktracker_widget.txt");

await fm.downloadFileFromiCloud(path);
const raw = fm.readString(path);
const data = JSON.parse(raw);

const onBreak = data.on_break === "true";
const station = data.station || "–";
const shift = data.shift || "–";
const breakStart = data.break_start || "–";
const breakEnd = data.break_end || "–";

const w = new ListWidget();
w.backgroundColor = Color.dynamic(new Color("#ffffff"), new Color("#1c1c1e"));

const title = w.addText(station);
title.font = Font.boldSystemFont(12);


const sub = w.addText(shift);
sub.font = Font.systemFont(11);
sub.textColor = Color.gray();

w.addSpacer();

if (onBreak) {
  const status = w.addText("Pause aktiv seit " + breakStart);
  status.font = Font.boldSystemFont(12);
  status.textColor = new Color("#ff9500");
} else {
  const status = w.addText("Pause inaktiv");
  status.font = Font.boldSystemFont(12);
  status.textColor = new Color("#30d158");
  if (breakEnd !== "–") {
    const last = w.addText("Letzte Pause: " + breakEnd);
    last.font = Font.systemFont(11);
    last.textColor = Color.gray();
  }
}

Script.setWidget(w);
Script.complete();
w.presentSmall();