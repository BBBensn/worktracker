# worktracker — CLAUDE.md

Projekt-spezifischer Kontext. Ergänzt `~/.claude/CLAUDE.md`.
Ablageort: `~/Documents/Coding/bensn-hub/worktracker/CLAUDE.md`

---

## Projekt-Basics

- **Name:** worktracker
- **Domain:** worktracker.bensn.me
- **Version:** v2.4.0
- **Status:** active
- **Stack:** Vanilla JS (PWA, kein Build-Schritt) + Flask + PostgreSQL 16 (Docker)

---

## Lokale Struktur

```
~/Documents/Coding/bensn-hub/worktracker/
├── index.html               ← aktuelle PWA
├── eingabe/index.html       ← Korrektur-/Manuell-Eingabe-Unterseite
├── Shortcuts/               ← iOS Shortcuts (Arbeitsbeginn, Arbeitsende, Pause)
│   └── 20260410-1835-Worktracker/
├── icon/                    ← PWA App-Icons (favicon, apple-touch, 192/512)
├── docs/
│   └── changelogs/          ← Claude Code schreibt Changelogs hierher
├── CLAUDE.md
└── .gitignore
```

---

## Remote-Struktur

```
/var/www/worktracker/
├── index.html               ← Frontend (wird per scp deployed)
├── manifest.json            ← PWA Manifest
├── sw.js                    ← Service Worker
└── icons/                   ← PWA Icons
```

---

## Services & Ports

| Dienst | Port | Deployment |
|--------|------|------------|
| bensn-api | 5001 | Docker: `bensn-api` Container (`/root/bensn-hub/`) |

Die API ist **nicht in diesem Repo** — sie ist der geteilte "bensn Personal OS"-Backend (verwaltet in `~/Documents/Coding/bensn-hub/bensn-meta/hub-versions/`).

---

## Deploy

```bash
# Frontend (nur index.html ändern sich normalerweise)
scp ~/Documents/Coding/bensn-hub/worktracker/index.html \
  bensn:/var/www/worktracker/index.html
scp ~/Documents/Coding/bensn-hub/worktracker/eingabe/index.html \
  bensn:/var/www/worktracker/eingabe/index.html

# API-Änderungen: in bensn-meta/hub-versions/vX.X.X/api.py bearbeiten, dann:
scp ~/Documents/Coding/bensn-hub/bensn-meta/hub-versions/v3.0.0/api.py \
  bensn:/root/bensn-hub/api.py
ssh bensn "cd /root/bensn-hub && docker compose up -d --build"

# nginx-Config (bei Infrastruktur-Änderungen)
scp ~/Documents/Coding/bensn-hub/bensn-meta/nginx/worktracker.bensn.me \
  bensn:/etc/nginx/sites-enabled/worktracker.bensn.me
ssh bensn "nginx -t && systemctl reload nginx"
```

---

## Git

- **Repo:** `https://github.com/BBBensn/worktracker`
- **Remote:** `git@github.com:BBBensn/worktracker.git`

```bash
git add index.html
git commit -m "Add [feature]"
git push origin main
```

---

## Auth

- **Cookie-Auth (bensn-auth)** auf `/` — verifiziert gegen die Live-nginx-Config
  (`bensn-meta/nginx/worktracker.bensn.me`), entgegen einer älteren Notiz hier, die das
  Frontend fälschlich als auth-los beschrieb
- **API:** nginx injiziert `X-API-Key` automatisch via `proxy_set_header` (kein Key im Frontend-Code)
- Der API-Key liegt nur in der nginx-Config (`/etc/nginx/sites-enabled/worktracker.bensn.me`)

---

## API-Endpoints (Port 5001, bensn-api Docker)

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | /health | Health Check |
| POST | /api/shift/start | Schicht beginnen |
| POST | /api/shift/end | Schicht beenden |
| GET | /api/shift/current | Aktuelle Schicht + Pausen (für Widget) |
| GET | /api/shift/`<id>` | Einzelne Schicht mit Pausen |
| GET | /api/shifts | Schichtliste (limit/offset/date) |
| PATCH | /api/shift/`<id>`/correct | Schicht korrigieren (speichert Snapshot in original_data) |
| DELETE | /api/shift/`<id>` | Schicht soft-löschen |
| POST | /api/break/start | Pause beginnen |
| POST | /api/break/end | Pause beenden (zig_spicy/zig_blend) |
| POST | /api/break/add | Pause nachträglich hinzufügen |
| PATCH | /api/break/`<id>`/correct | Pause korrigieren |
| DELETE | /api/break/`<id>` | Pause soft-löschen |

---

## Datenbank

- **Engine:** PostgreSQL 16 (Docker Container `bensn-postgres`)
- **DB:** `bensnos`
- **User:** `bensn`
- **Port:** `127.0.0.1:5432` (nur lokal auf Server)
- Relevante Tabellen: `shifts`, `breaks`
- Views: `current_shift`, `daily_summary`
- Soft-Delete: `deleted = true` statt physical delete
- Korrekturen: Snapshot wird in `original_data` (JSONB) gespeichert

---

## Projekt-spezifische Konventionen

- Flacher Repo-Root (kein `worktracker_X.X.X/`-Versionsarchiv mehr) — Versionshistorie läuft
  über Git-Commits + `docs/changelogs/`
- iOS Shortcuts werden in `Shortcuts/` versioniert (ZIP + entpackt)
- API-Änderungen **nicht** in diesem Repo — in `bensn-meta/hub-versions/` bearbeiten
- Frontend ist reines Vanilla JS — kein Build-Prozess, kein npm
- **Design-Sprache:** worktracker ist der visuelle Ursprung von `.btn-pill` ("Bearbeiten"/
  "+ Pause"), die Klasse selbst wurde hier aber nie eingeführt — nur als Inline-`style`
  wiederholt (mit leicht abweichenden Werten je Stelle). Seit 2026-09-16 nutzen
  "Bearbeiten"/"+ Pause" die echte `.btn-pill`-Klasse aus `bensn-meta/shared/bensn.css`
  (identisch zu health/feed/tracking). Seit v2.2.2 nutzen auch die "Löschen"-Buttons
  (`deleteShift`, `deleteBreak`) `.btn-pill.red` statt eigener Inline-Styles. Noch offen
  (beim Aufräumen entdeckt, nicht angefasst): die zugehörigen Speichern/Abbrechen-Buttons in
  denselben Formularzeilen sind ebenfalls Inline und weichen leicht von `.btn-save`/
  `.btn-cancel` ab (8px/10px statt 11px Padding-Basis) — eigener Punkt für später.
  Vollständiger Style-Guide: `bensn-meta/design-system.html`

---

## Roadmap

| Version | Feature | Status |
|---------|---------|--------|
| v2.1.6.1 | Vorheriger Stand | ✅ done |
| v2.2.0 | Zeit-Editierbarkeit in der Eingabe-Seite (Pause Start/Ende) + Long-Press-Edit im Aktiv-Tab | ✅ done |
| v2.2.1 | "Bearbeiten"/"+ Pause" auf die zentrale `.btn-pill`-Klasse umgestellt (vorher Inline-Styles) | ✅ deployed (2026-09-16) |
| v2.2.2 | "Löschen"-Buttons (`deleteShift`, `deleteBreak`) auf `.btn-pill.red` umgestellt — beide vorherigen Inline-Varianten unterschieden sich sowohl voneinander als auch von tracking/health | ✅ deployed (2026-09-16) |
| v2.3.0 | Zeit-Eingabe für "Dienst starten"/"Dienst beenden" (analog Pause-Muster) + monatsweises Zuklappen der Schichten-Liste + neuer "Stats"-Tab (Gesamt/Ø-Werte, Schichttyp-Aufteilung, 12-Monats-Verlauf) mit neuem Backend-Endpoint `GET /api/stats/monthly` | ✅ deployed (2026-09-17) |
| v2.4.0 | Stats-Feedback: Fix für `/api/shifts`-Limit (30→500, ältere Monate wurden gar nicht geladen), Spicy-Ø in der Schichttyp-Aufteilung, neue Extremwerte-Card (längste Pause, längster/kürzester Dienst) via neuem `GET /api/stats/extremes` | ✅ deployed (2026-09-17) |

---

## Obsidian-Doku

- Projekt-MD: `03_Projects/Coding PC/worktracker/worktracker.md`
- Changelogs: `03_Projects/Coding PC/worktracker/Changelogs/`
- Changelog-All: `03_Projects/Coding PC/worktracker/worktracker-Changelog-All.md`
