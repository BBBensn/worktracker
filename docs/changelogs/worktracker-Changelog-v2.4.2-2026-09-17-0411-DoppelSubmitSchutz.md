---
date_created: 2026-09-17 04:11:00
type: changelog
tags:
  - project
  - changelog
date_modified: 2026-09-17 04:11:00
---

# v2.4.2 — Doppel-Submit-Schutz (Root Cause für die Duplikat-Pausen) (2026-09-17)
- Untersucht: die duplizierten, bereits soft-gelöschten Pausen-Einträge vom 14.04./13.07./08.06.
  waren keine Ausreißer — alle drei Fälle sind exakte Zeit-Duplikate, ohne aktive Duplikate mehr
  in der DB (bereits händisch bereinigt). Wahrscheinlichste Ursache: Doppel-Tap oder ein erneuter
  Tap bei langsamer Verbindung, da keine der Submit-Funktionen einen zweiten Klick währenddessen
  ignoriert hat
- Fix: `eingabe/index.html` (Dienst starten/beenden, Pause starten/beenden, Sender ändern) und
  `index.html` (+ Pause hinzufügen) ignorieren jetzt einen zweiten Submit, solange der erste
  Request noch läuft — verhindert doppelt angelegte Schichten/Pausen für die Zukunft
- Die 2026-09-12-Schicht (vom User als "wieder derselbe Bug" gemeldet) wurde geprüft und ist
  sauber — 6 echte, nicht-duplizierte Pausen. Sie erscheint aktuell zurecht als kürzester Dienst
