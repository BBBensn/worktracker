---
date_created: 2026-04-11 03:19:52
type: project
status: active
bereich: coding
tags:
  - project
date_modified: 2026-10-04 02:10:00
---

# Worktracker

Arbeitszeiterfassung für Schichten, Pausen und Rauchverhalten. Teil des [[Bensn-Hub]], Daten fließen auch in den [[Feed]]. Die Oberfläche lebt seit 2026-10-04 im Tab **Work** der Gesamt-App [[Tracking]]; `worktracker.bensn.me/` leitet dorthin um. **Die API unter `worktracker.bensn.me/api/` bleibt unverändert** (iOS-Kurzbefehle, OwnTracks, ohne Cookie, Nginx injiziert den API-Key).

## Stack

| Komponente | Details |
| --- | --- |
| Frontend | Modul `work.js` (+ `work-eingabe.js`) in [[Tracking]]; die alte `index.html` bleibt nur im Repo |
| Backend | Flask · Docker `bensn-api` · Port 5001 (Code im Repo `bensn-meta`, `hub-versions/`) |
| Datenbank | PostgreSQL 16 · `bensn-postgres` · DB `bensnos` |
| Kurzbefehle | iOS Shortcuts: Arbeitsbeginn, Arbeitsende, Pause (`Shortcuts/`) |
| Widgets | Scriptable iOS · `WT_Small.js`, `WT_Large.js`, `WT_XL.js` |

## Schichttypen & Sender

**Typen:** `früh` · `nachmittag` · `nacht` **Sender:** Puls4 · ATV · ATV2 · Puls24

## Features (im Work-Tab)

- **Aktiv:** laufender Dienst mit Pausen, Netto-/Brutto-Zeit
- **Schichten:** Verlauf mit einklappbaren Monaten und Kalenderansicht, Details je Schicht, nachträglich bearbeiten, Pausen hinzufügen/bearbeiten/löschen
- **Statistik:** Schichttypen, Pausen, Rauchverhalten (Spicy/Blend)
- **Eingabe:** Dienst starten, Pause starten/beenden, Sender wechseln (Duo-Partner), Dienst beenden — jeweils mit nachträglichen Uhrzeiten
- Café-Puls-Flag; Zigaretten pro Pause erscheinen auch im Habits-Verlauf ([[Tracking]])

## Betrieb

- Deploy des Frontends: Teil des Tracking-Deploys (`scp -r css js` nach `/var/www/tracking/`)
- Nginx `worktracker.bensn.me`: `/api/` ohne Cookie, `/` → Redirect auf `tracking.bensn.me/#/work`
- Kurzbefehle rufen weiter `worktracker.bensn.me/api/…` auf; ruft einer die alte Seite `…/eingabe?action=…` auf, landet er nur noch in der App (ohne Aktion)

## Offene Todos
```dataview
TASK
FROM "03_Projects/Coding PC/Bensn-Hub/Worktracker"
WHERE !completed
SORT file.name ASC
```

## Notizen

Verwandt: [[Bensn-Hub]] · [[Feed]] · [[Health]] · [[Location]] · [[Tracking]]
Details: `worktracker/CLAUDE.md`, Technisches: [[Bensn Hub Technical Overview]]

## Changelog
```dataviewjs
const pages = dv.pages('"03_Projects/Coding PC/Bensn-Hub/Worktracker/Changelogs" and #changelog')
  .sort(p => p.file.name, 'asc');

for (let p of pages) {
  dv.header(2, p.file.name);
  dv.paragraph(`![[${p.file.path}#Changes]]`);
}
```
