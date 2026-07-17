---
date_created: 2026-07-18 00:37:00
type: changelog
tags:
  - worktracker
  - changelog
date_modified: 2026-07-18 00:37:00
---

# v2.2.0 — Zeit-Editierbarkeit & Long-Press-Edit (2026-07-18)
- Eingabe-Seite: form-pause_start hat jetzt ein editierbares Startzeit-Feld (vorausgefüllt mit aktueller Vienna-Zeit)
- Eingabe-Seite: form-pause_end hat jetzt editierbare Start-/Endzeit-Felder (Start vorausgefüllt aus der offenen Pause, Ende mit aktueller Zeit), inkl. Overnight-Handling
- Backend: `/api/break/end` akzeptiert jetzt optional `break_start`, um den Startzeitpunkt beim Beenden mitzukorrigieren
- Haupt-Dashboard: Long-Press-Edit für Pausen ist jetzt auch im Aktiv-Tab verfügbar (bisher nur im Schichten-Tab), nutzt das bestehende `openBreakEdit()`-Overlay
- Lokale `bensn-meta/hub-versions/v3.0.0/api.py` war gegenüber dem deployten Stand veraltet (fehlende Location-RDP-Simplify-, Stays- und Tracking-Endpoints) und wurde vor der Änderung synchronisiert
