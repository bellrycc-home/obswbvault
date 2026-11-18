# Infraestructura · Curso S2 (web)

Sitio estático del curso de Infraestructura. Reúne las **22 notas** del vault en ocho etapas, con grafo de enlaces en modo ruta, búsqueda, progreso local y una pestaña de laboratorios preparada pero deshabilitada.

El vault **no se modifica**: este proyecto solo copia las notas y genera sus propios datos.

## Estructura

```
webvault/
├── index.html              Página única (shell de la aplicación)
├── course.json             Manifiesto: módulos, orden, rutas y estado de labs
├── content/infra_s2/       Notas .md copiadas del vault + guía del curso
├── data/
│   ├── course.js           Datos generados (lo carga el navegador)
│   └── course.json         Los mismos datos, legibles para agentes
├── assets/
│   ├── app.css             Estilos
│   └── app.js              Lógica: navegación, markdown, grafo, progreso
└── tools/
    ├── build.py            Genera data/ desde course.json + content/
    └── sync_from_vault.py  Recopia las notas del vault y regenera data/
```

## Ejecutar

No necesita build ni dependencias. Solo un servidor estático:

```bash
cd webvault
python3 -m http.server 8080
# abrir http://localhost:8080
```

También funciona abriendo `index.html` con doble clic (no usa `fetch`).

## Regenerar los datos

Cada vez que cambie una nota o el manifiesto:

```bash
python3 tools/build.py --check
```

Salida esperada: lecciones, palabras, enlaces y `Verificación: 0 problemas`.

Para traer los cambios del vault y regenerar en un solo paso:

```bash
python3 tools/sync_from_vault.py
```

El script copia `Notas/Infraestructura/*.md` conservando la fecha de modificación, avisa de notas nuevas o ausentes del manifiesto y **nunca escribe en el vault**.

## Añadir una lección

1. Copia el `.md` a `content/infra_s2/`.
2. Añade una entrada en `course.json` dentro de `lecciones` con `slug`, `archivo`, `modulo` y `titulo`.
3. Si debe entrar en alguna ruta, añade el `slug` a `rutas[].lecciones`.
4. Ejecuta `python3 tools/build.py --check`.

El título, las etiquetas, el estado y los enlaces se extraen del frontmatter y del propio Markdown. El `slug` es el identificador de la URL (`#/leccion/<slug>`).

## Fechas

`build.py` sella cada lección con la **fecha de modificación del archivo** y el sitio con la **fecha de generación**. No hay fechas inventadas ni actualización automática: si quieres fechas nuevas, ejecuta el build (a mano, por cron o por un agente en el servidor).

## Laboratorios

La pestaña `Lab` existe y está deshabilitada. Para activarla cuando el simulador esté listo:

1. En `course.json`, pon `labs.disponible` en `true` y regenera.
2. Define el punto de montaje antes de `assets/app.js`:

```html
<script>
window.CURSO_LABS = {
  mount: function (slug, contenedor) {
    // contenedor es la vista del laboratorio; aquí se inyecta el simulador
  }
};
</script>
```

La aplicación llama a `mount(slug, contenedor)` al abrir la pestaña. La estructura de la vista ya está hecha: no hay que rehacer la web.

## Grafo

El grafo se construye con:

- **Nodos**: las 22 lecciones, agrupadas por etapa en columnas (modo ruta).
- **Aristas**: los wikilinks reales entre notas (100 enlaces, sin huérfanos).
- **Rutas**: los botones resaltan el subconjunto definido en `course.json`.
- **Interacción**: rueda para zoom, arrastrar el fondo para mover, clic en una nota para abrirla.

## Despliegue

Es estático: sirve la carpeta tal cual con Nginx, Apache, GitHub Pages o cualquier CDN. No hay secretos ni base de datos. El progreso vive en `localStorage` del navegador.

## Estado

- Las notas conservan `estado: pendiente_revision`; la web lo muestra como aviso.
- Las notas no se editan aquí: la fuente sigue siendo el vault.
- El proyecto es una instantánea: si el vault cambia, hay que ejecutar `sync_from_vault.py`.
