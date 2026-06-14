# SPEC — openclaw-learnings

status: active
risk: dev
owner-thread: 6

## Goal

Portal de contenido (Astro, repo público kaiserchiese/openclaw-learnings) que documenta aprendizajes del sistema OpenClaw + pipeline de drafts para LinkedIn/Twitter. Sano = build verde, contenido curado al día, drafts generándose y STATUS.md veraz.

## Constraints (HARD)

- Repo PÚBLICO: jamás commitear tokens, credenciales, IDs de chat privados ni rutas con datos personales.
- No publicar directamente en redes — los drafts van al flujo de revisión existente (Thread 6 / topic 58959 Para Publicar).

## Verification commands

- build: `npm run build` (cwd `website/`) → exit 0
- git: `git log -1 --format=%h` para citar commits

## Definition of done

Cada `- [x]` cita commit hash o URL del contenido publicado.

## Ralph rules

- Máx 1 tarea por ciclo. Verificación fallida → revertir + avisar Thread 6.
