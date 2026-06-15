# BACKLOG — openclaw-learnings

Ralph lee este archivo DESPUÉS de SPEC.md. Formato: `- [ ] [TIPO] Título` + línea `verify:` indentada.

- [x] [DOCS] Regenerar STATUS.md (dice rama feature/, el repo está en main) con estado real del proyecto (commit 15d4da2)
  verify: STATUS.md cita la rama correcta (git branch --show-current) + commit
- [x] [CONTENT] Commitear y ordenar los drafts acumulados de drafts/ (jun 03-11) — decidir cuáles van a "Para Publicar" (topic 58959) (Hecho: git commit 2b3e084, enviado a Thread 6)
  verify: git status limpio en drafts/ + mensaje a topic 58959 con los seleccionados
- [x] [CONTENT] Artículo nuevo: "Cómo blindamos un pipeline de blog autónomo con gates deterministas" (Hecho: git commit 983e401, URL: /patterns/deterministic-gates/index.html)
  verify: npm run build exit 0 + URL del artículo en dist/
