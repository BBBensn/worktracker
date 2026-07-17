# worktracker — CLAUDE.md

Projekt-spezifischer Kontext. Ergänzt `~/.claude/CLAUDE.md`.
Ablageort: `~/Documents/Coding/bensn-hub/worktracker/CLAUDE.md`

---

## Projekt-Basics

- **Name:** worktracker
- **Domain:** worktracker.bensn.me
- **Version:** v2.2.0
- **Status:** active
- **Stack:** Vanilla JS (PWA, kein Build-Schritt) + Flask + PostgreSQL 16 (Docker)

---

## Lokale Struktur

```
~/Documents/Coding/bensn-hub/worktracker/
├── worktracker_2.1.6.1/     ← aktuellste Version
│   └── index.html
├── worktracker_2.1.6/       ← ältere Versionen (Archiv)
│   └── index.html
├── ... (weitere Archiv-Ordner worktracker_X.X.X/)
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
scp ~/Documents/Coding/bensn-hub/worktracker/worktracker_2.1.6.1/index.html \
  bensn:/var/www/worktracker/index.html

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
git add worktracker_2.1.6.1/index.html
git commit -m "Add [feature]"
git push origin main
```

---

## Auth

- **Kein Frontend-Auth** — die Seite ist öffentlich erreichbar
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

- Neue Versionen als separate Ordner anlegen: `worktracker_X.X.X/`
- Die aktuellste Version ist immer der Ordner mit der höchsten Versionsnummer
- iOS Shortcuts werden in `Shortcuts/` versioniert (ZIP + entpackt)
- API-Änderungen **nicht** in diesem Repo — in `bensn-meta/hub-versions/` bearbeiten
- Frontend ist reines Vanilla JS — kein Build-Prozess, kein npm

---

## Roadmap

| Version | Feature | Status |
|---------|---------|--------|
| v2.1.6.1 | Vorheriger Stand | ✅ done |
| v2.2.0 | Zeit-Editierbarkeit in der Eingabe-Seite (Pause Start/Ende) + Long-Press-Edit im Aktiv-Tab | ✅ done |

---

## Obsidian-Doku

- Projekt-MD: `03_Projects/Coding PC/worktracker/worktracker.md`
- Changelogs: `03_Projects/Coding PC/worktracker/Changelogs/`
- Changelog-All: `03_Projects/Coding PC/worktracker/worktracker-Changelog-All.md`
