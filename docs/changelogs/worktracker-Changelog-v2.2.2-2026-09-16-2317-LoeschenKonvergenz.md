---
date_created: 2026-09-16 23:17:00
type: changelog
tags:
  - project
  - changelog
date_modified: 2026-09-16 23:17:00
---

# v2.2.2 — Löschen-Buttons konvergiert (2026-09-16)
- Die beiden "Löschen"-Buttons (Schicht-Bearbeiten-Formular via `deleteShift`, Pause via
  `deleteBreak`) nutzten je eigene Inline-Styles, die sich sowohl voneinander (8×16px vs.
  10×14px Padding) als auch von `.btn-pill.red` in tracking/health unterschieden. Beide auf
  `.btn-pill.red` umgestellt
- Dabei entdeckt, aber bewusst nicht angefasst: die zugehörigen Speichern/Abbrechen-Buttons
  in denselben Formularzeilen sind ebenfalls Inline und weichen leicht von `.btn-save`/
  `.btn-cancel` ab — eigener Punkt für später
