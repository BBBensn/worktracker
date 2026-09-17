---
date_created: 2026-09-17 03:30:00
type: changelog
tags:
  - project
  - changelog
date_modified: 2026-09-17 03:30:00
---

# v2.3.0 — Zeit-Eingabe, History-Collapse & Stats-Seite (2026-09-17)
- Eingabe-Seite: "Dienst starten" und "Dienst beenden" fragen jetzt nach Start-/Endzeit (vorbelegt mit aktueller Uhrzeit, editierbar) — analog zum bestehenden Pause-Start/-Ende-Muster. Deckt den Fall "Eintrag vergessen, muss nachträglich mit korrekter Zeit starten" ab, ohne den Umweg über die Korrektur-Funktion in der Schichten-Liste
- Overnight-Handling für "Dienst beenden": liegt die eingegebene Endzeit vor der Startzeit des Diensts, wird automatisch der Folgetag angenommen (wie bei Pause-Ende)
- Schichten-Liste: Monate sind jetzt einzeln zuklappbar (Klick auf Monatsüberschrift). Beim Öffnen ist nur der aktuelle Monat aufgeklappt, alle vergangenen Monate starten zugeklappt — sofort besserer Überblick bei langer Historie
- Neuer "Stats"-Tab: Gesamt-Netto-Stunden, Anzahl Schichten, Ø Netto/Pause pro Schicht, Zigaretten gesamt; Aufteilung nach Schichttyp (früh/nachmittag/nacht) mit Anteil und Durchschnittswerten; Verlauf der Netto-Stunden der letzten 12 Monate als Balkendiagramm. Bewusst als leichte In-App-Seite umgesetzt statt Grafana-Board — die Datenbasis ist klein genug, dass ein eigenes Dashboard mit eigener Infra-Pflege nicht gerechtfertigt wäre
- Backend (`bensn-meta/hub-versions/v3.0.0/api.py`): neuer Endpoint `GET /api/stats/monthly` — aggregiert alle abgeschlossenen Schichten nach Monat (Anzahl, Brutto-/Pausenminuten, Zigaretten). Bestehender `/api/stats/shift-summary` unverändert wiederverwendet für die Schichttyp-Aufteilung
