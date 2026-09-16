---
date_created: 2026-09-16 22:44:00
type: changelog
tags:
  - project
  - changelog
date_modified: 2026-09-16 22:44:00
---

# v2.2.1 — .btn-pill übernommen (2026-09-16)
- "Bearbeiten" und "+ Pause" (Schicht-Detailansicht) nutzen jetzt die echte `.btn-pill`/
  `.btn-pill.green`-Klasse aus dem neu versionierten `bensn-meta/shared/bensn.css` statt
  wiederholter Inline-`style`-Attribute — worktracker war der visuelle Ursprung dieses
  Buttons, hatte selbst aber nie eine wiederverwendbare Klasse dafür
- Die "Löschen"-Buttons in den Save/Cancel/Delete-Formularzeilen (Schicht bearbeiten,
  Pause löschen) sind bewusst NICHT angefasst — die drei vorhandenen Varianten
  (worktracker × 2, `.btn-danger` in tracking) unterscheiden sich in Padding/Radius und eine
  Vereinheitlichung ist eine echte Design-Entscheidung, keine mechanische. Dokumentiert in
  `bensn-meta/design-system.html` unter "Bekannte Inkonsistenzen"
