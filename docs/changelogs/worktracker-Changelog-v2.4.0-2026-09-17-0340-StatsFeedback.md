---
date_created: 2026-09-17 03:40:00
type: changelog
tags:
  - project
  - changelog
date_modified: 2026-09-17 03:40:00
---

# v2.4.0 — Stats-Feedback: Spicy-Ø, volle History, Extremwerte (2026-09-17)
- Fix: Schichten-Tab lud nur `limit=30` — bei vielen Schichten pro Monat blieben ältere Monate
  komplett unsichtbar (nicht nur zugeklappt, sondern gar nicht geladen). Limit auf 500 angehoben,
  API-seitige Obergrenze dafür von 100 auf 500 erhöht
- Stats: Schichttyp-Aufteilung zeigt jetzt zusätzlich zum Zigaretten-Ø auch den Spicy-Ø separat
- Stats: neue "Extremwerte"-Card — längste Pause, längster/kürzester Dienst (netto), inkl. Datum
  und Station. Hilft, fehlerhafte Einträge (z.B. vergessenes Dienstende) auf einen Blick zu erkennen
- Backend (`bensn-meta/hub-versions/v3.0.0/api.py`): `/api/stats/shift-summary` um `avg_spicy`
  erweitert, neuer Endpoint `GET /api/stats/extremes`, `/api/shifts`-Limit-Obergrenze 100 → 500
