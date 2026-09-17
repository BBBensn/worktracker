---
date_created: 2026-09-17 03:56:00
type: changelog
tags:
  - project
  - changelog
date_modified: 2026-09-17 03:56:00
---

# v2.4.1 — Fix: veraltete Button-Styles durch Service-Worker-Cache (2026-09-17)
- Bug gefunden über Feedback: "Bearbeiten"/"+ Pause"/"Löschen" erschienen als unstyled
  Standard-Browser-Buttons statt als `.btn-pill`. Ursache: `sw.js` cachte `/shared/bensn.css`
  cache-first für immer (`CACHE = 'bensn-wt-v2'` seit Erstellung nie gebumpt) — das installierte
  PWA hatte einen älteren Stand von `bensn.css` gecacht und bekam spätere Design-System-Updates
  (u.a. die `.btn-pill`-Zentralisierung von 2026-09-16) nie mehr mit
- Fix: `/shared/*`-Assets laufen jetzt über Stale-while-revalidate statt Cache-only — der Cache
  wird sofort ausgeliefert (schnell), aber im Hintergrund immer neu geholt, sodass zukünftige
  Änderungen an `bensn.css`/`bensn.js` (aus anderen App-Repos) automatisch ankommen, ohne dass
  hier jedes Mal die Cache-Version manuell gebumpt werden muss. `CACHE`-Name zusätzlich auf
  `bensn-wt-v3` erhöht, damit der aktuell falsch gecachte Stand einmalig verworfen wird
- Derselbe Cache-only-Fehler existiert unverändert in `health`/`feed`/`tracking`/`location`s
  jeweils eigenem `sw.js` — dort noch nicht angefasst, eigener Punkt falls gewünscht
