---
date_created: 2026-09-17 04:20:00
type: changelog
tags:
  - project
  - changelog
date_modified: 2026-09-17 04:20:00
---

# v2.5.0 — Brutto/Netto-Übersicht in der Schichten-Liste (2026-09-17)
- Root Cause gefunden: die zugeklappte Schichten-Zeile zeigte nur eine Zahl, beschriftet als
  "Netto", die aber mangels Backend-Daten (siehe bensn-meta v1.0.8) tatsächlich immer Brutto war
  — daher der Eindruck, 06.09. (22:00→06:00) hätte "8h 0m Netto"
- Zeigt jetzt beides klar beschriftet: "Netto Xh Ym" + "Brutto Xh Ym" darunter, sobald
  `/api/shifts` echte Pausen-Minuten liefert (bensn-meta v1.0.8 vorausgesetzt)
- Stats: Schichttyp-Aufteilung beschriftet den Dienst-Durchschnitt jetzt explizit als
  "Ø Brutto" statt nur "Dienst"; "Längster/Kürzester Dienst" in der Extremwerte-Card heißen jetzt
  "(Netto)" und zeigen zusätzlich den Brutto-Wert in der Meta-Zeile — soll genau die Verwirrung
  verhindern, die zur 12.09.-Rückfrage geführt hat
