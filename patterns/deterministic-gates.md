# Pipeline de Blog Autónomo Blindado con Gates Deterministas

## El Problema

Los modelos de lenguaje (LLMs) son herramientas excelentes para la generación de contenido y el análisis, pero son inherentemente probabilísticos. En un pipeline de publicación de blog 100% autónomo, confiar ciegamente en la salida de un agente para publicar directamente en producción es una receta para el desastre. Es común enfrentarse a problemas como:
- Borradores duplicados creados por reintentos o crons solapados.
- Publicaciones sin categoría asignada ("Sin categoría") o con la categoría predeterminada incorrecta.
- Reuso accidental de imágenes destacadas (featured media) que degradan el SEO y la estética del sitio.
- Ausencia de enlaces internos esenciales.
- Artículos demasiado cortos o con formatos HTML rotos.
- Fallos en la publicación donde el post queda en estado de borrador sin que el sistema lo note.

## Arquitectura de Gates Deterministas

Para solucionar esto de manera robusta, el pipeline del blog de AirCO2 implementa **gates deterministas LLM-independientes** que actúan como barreras de calidad automáticas antes, durante y después de cada fase de publicación.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Fase Research  │ ────> │  Fase de Review │ ────> │  Fase Publish   │
└─────────────────┘       └─────────────────┘       └─────────────────┘
         │                         │                         │
         ▼                         │                         ▼
┌─────────────────┐                │               ┌─────────────────┐
│ Gate: validate  │ <──────────────┘               │ Gate: validate  │
│ --stage research│                                │  --stage publish│
└─────────────────┘                                └─────────────────┘
         │                                                   │
         ▼                                                   ▼
┌─────────────────┐                                ┌─────────────────┐
│   Watchdog      │                                │  Post-Publish   │
│   (Perro Guardián)                               │     Check       │
└─────────────────┘                                └─────────────────┘
```

El pipeline se divide en tres fases principales, cada una protegida por un validador determinista implementado en Node.js que interactúa directamente con la API de WordPress y el sistema de archivos local. Si un validador falla (exit code != 0), el pipeline se detiene inmediatamente, revierte cualquier cambio destructivo y genera una alerta sonora y visual en Telegram (Thread 8 / Canal de Operaciones) detallando el motivo exacto del fallo.

---

## Detalle Técnico de los Gates

### 1. Gate de Research (`validate-stage.js --stage research`)
Este gate se ejecuta inmediatamente después de que el agente de investigación y redacción genera el borrador del post del día. Comprueba:
- **Existencia del borrador:** Llama a la API de WordPress (`/posts`) para comprobar si existe un borrador con fecha del día de hoy.
- **Categorías permitidas:** Garantiza que no se use la categoría predeterminada "Sin categoría" ni IDs de categorías prohibidas.
- **Imagen destacada única:** Compara el `media_id` de la imagen destacada con un registro local histórico de hashes (`image_hashes.json`). Si la imagen ya fue usada en otro post, el gate falla para evitar duplicación visual.
- **Enlaces internos:** Escanea el cuerpo del HTML para verificar la existencia de un enlace hacia el dominio principal (`airco2.earth`).
- **Problemas de contenido:** Detecta bloques de texto rotos o marcadores de posición típicos de alucinaciones de LLMs.

### 2. Gate de Review (`validate-stage.js --stage review`)
Garantiza que el borrador haya pasado por un proceso de auditoría y revisión humana u agéntica secundaria:
- Verifica la existencia y frescura del archivo de estado `review_result.md`.
- Lee el resultado de la revisión: si el estado no es un rotundo `pass`, el pipeline se bloquea.

### 3. Gate de Publicación (`validate-stage.js --stage publish`)
Una vez confirmada la acción de publicar:
- Comprueba que el estado del post en `todays_post.md` sea estrictamente `published`.
- Valida la URL pública generada contrastándola con un patrón regular estricto (ej. `https://www.airco2.earth/blog/YYYY/MM/DD/slug/`).

---

## Mecanismos de Robustez LLM-Independientes

### El Perro Guardián (`watchdog.js`)
Para evitar que un fallo silencioso a nivel de LLM o API de red impida la publicación, se ejecuta un script **Watchdog** a las 08:55 (25 minutos después del cron de generación). El Watchdog funciona de forma totalmente independiente del agente y analiza el estado actual:
- **Día de publicación:** Si hoy no toca publicar según el calendario de publicación, sale limpiamente (`OK_NO_PUBLISH_DAY`).
- **Doble borrador:** Si detecta más de un borrador para el día de hoy, envía una alerta para purgar duplicados conservando el primero (`DUPLICATES`).
- **Pipeline caído:** Si no encuentra un borrador a la hora límite, envía un comando `RETRIGGER` al orquestador principal y emite una alerta crítica a Telegram indicando que el pipeline de las 08:30 falló estrepitosamente.

### Verificación Post-Publicación (`post-publish-check.js`)
Un gate final realiza un test de humo de caja negra directamente sobre la web en producción:
1. Realiza una petición `GET` HTTP real sobre la URL pública del post.
2. Comprueba que retorne un código de estado `HTTP 200`.
3. Valida la integridad del body: comprueba que el cuerpo tenga un tamaño mínimo razonable (mínimo 10KB) para descartar publicaciones vacías o truncadas.
4. Busca palabras clave del título del post dentro del body renderizado final para asegurar la consistencia.
5. Comprueba que la imagen destacada asociada sea accesible y devuelva `HTTP 200` de forma pública.

---

## Ejemplo de Código: Verificación de Reuso de Imagen Destacada

Este fragmento de `validate-stage.js` ilustra la lógica determinista para evitar reusar imágenes destacadas:

```javascript
function imageReused(mediaId) {
  const file = path.join(STATE_DIR, 'image_hashes.json');
  if (!fs.existsSync(file)) return false;
  try {
    const db = JSON.parse(fs.readFileSync(file, 'utf8'));
    // El registro más reciente es el del propio post de hoy — una coincidencia única no es reuso.
    const hits = (db.images || []).filter((i) => i.media_id === mediaId);
    return hits.length > 1;
  } catch { return false; }
}
```

---

## Lecciones Clave para Diseñadores de Agentes

1. **La telemetría es obligatoria:** Cada gate del pipeline de AirCO2 añade un registro estructurado a un histórico de telemetría local. Esto nos permite saber en qué milisegundo exacto falló una etapa y por qué.
2. **LLM para generar, Código para validar:** Las tareas creativas y de redacción pertenecen al dominio del LLM. Las comprobaciones de seguridad, integridad y estructura pertenecen al dominio del código tradicional determinista.
3. **Falla rápido, alerta temprano:** En lugar de intentar corregir automáticamente fallos estructurales complejos en bucle (lo que puede llevar a bucles de costes infinitos de API), el sistema frena de inmediato y delega en el canal de Telegram para que el operador intervenga si es necesario.
