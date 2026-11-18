#!/usr/bin/env python3
"""Genera data/course.js y data/course.json a partir de course.json + content/.

No escribe en el vault: solo lee los .md copiados en content/ y produce los
datos que consume la web. Uso:

    python3 tools/build.py            # genera y reporta
    python3 tools/build.py --check    # además falla si hay enlaces rotos
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "course.json"
CONTENT = ROOT / "content" / "infra_s2"
DATA = ROOT / "data"

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n?", re.S)
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
LIST_RE = re.compile(r"^(\s*)([-*+]|\d+\.)\s+(.*)$")
TABLE_SEP_RE = re.compile(r"^\s*\|?[\s:|-]+\|[\s:|-]*$")
CODE_RE = re.compile(r"`([^`]+)`")


def sin_acentos(texto: str) -> str:
    normal = unicodedata.normalize("NFD", texto)
    return "".join(c for c in normal if unicodedata.category(c) != "Mn")


def normalizar(texto: str) -> str:
    """Clave de búsqueda: sin tildes, minúsculas, _ y - como espacio."""
    texto = sin_acentos(texto).lower()
    texto = re.sub(r"[_\-]+", " ", texto)
    texto = re.sub(r"[^a-z0-9ñü ]+", " ", texto)
    return re.sub(r"\s+", " ", texto).strip()


def parse_frontmatter(texto: str) -> tuple[dict, str]:
    match = FRONTMATTER_RE.match(texto)
    if not match:
        return {}, texto
    meta: dict[str, object] = {}
    clave = None
    for linea in match.group(1).splitlines():
        if not linea.strip() or linea.lstrip().startswith("#"):
            continue
        if linea.startswith("  - ") or linea.startswith("- "):
            if clave:
                valor = linea.split("- ", 1)[1].strip()
                actual = meta.get(clave)
                if not isinstance(actual, list):
                    actual = []
                    meta[clave] = actual
                actual.append(valor)
            continue
        if ":" in linea:
            clave, _, valor = linea.partition(":")
            clave = clave.strip()
            valor = valor.strip()
            meta[clave] = valor if valor else []
    return meta, texto[match.end():]


def texto_plano(markdown: str) -> str:
    texto = re.sub(r"```.*?```", " ", markdown, flags=re.S)
    texto = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", texto)
    texto = re.sub(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]", lambda m: m.group(2) or m.group(1), texto)
    texto = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", texto)
    texto = re.sub(r"[*_`>#|]", " ", texto)
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip()


def resumen(markdown: str, limite: int = 190) -> str:
    for bloque in re.split(r"\n\s*\n", markdown):
        linea = bloque.strip()
        if not linea:
            continue
        if linea.startswith(("#", ">", "|", "-", "*", "!", "```")):
            continue
        plano = texto_plano(linea)
        if len(plano) < 40:
            continue
        if len(plano) > limite:
            corte = plano[:limite].rsplit(" ", 1)[0]
            plano = corte + "…"
        return plano
    return ""


def fecha_archivo(ruta: Path) -> str:
    return datetime.fromtimestamp(ruta.stat().st_mtime).strftime("%Y-%m-%d")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="falla si hay enlaces sin resolver")
    args = parser.parse_args()

    if not MANIFEST.exists():
        print(f"ERROR: no existe {MANIFEST}", file=sys.stderr)
        return 2

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    modulos = {m["id"]: m for m in manifest["modulos"]}
    lecciones = []
    indice: dict[str, str] = {}
    problemas: list[str] = []
    avisos: list[str] = []

    for orden, item in enumerate(manifest["lecciones"], start=1):
        ruta = CONTENT / item["archivo"]
        if not ruta.exists():
            problemas.append(f"falta el archivo {ruta.relative_to(ROOT)}")
            continue
        if item["modulo"] not in modulos:
            problemas.append(f"'{item['slug']}' apunta al módulo inexistente '{item['modulo']}'")

        crudo = ruta.read_text(encoding="utf-8")
        meta, cuerpo = parse_frontmatter(crudo)
        cuerpo = cuerpo.lstrip("\n").rstrip() + "\n"

        tags = meta.get("tags") or []
        aliases = meta.get("aliases") or []
        if isinstance(tags, str):
            tags = [tags]
        if isinstance(aliases, str):
            aliases = [aliases]

        enlaces = []
        for match in WIKILINK_RE.finditer(cuerpo):
            destino = match.group(1).strip()
            if destino.lower().endswith((".html", ".png", ".jpg", ".jpeg", ".svg", ".pdf")):
                continue
            enlaces.append(normalizar(destino))
        enlaces = sorted(set(enlaces))

        leccion = {
            "slug": item["slug"],
            "titulo": item["titulo"],
            "archivo": item["archivo"],
            "modulo": item["modulo"],
            "orden": orden,
            "fecha": fecha_archivo(ruta),
            "hash": hashlib.sha256(cuerpo.encode("utf-8")).hexdigest()[:12],
            "bytes": len(cuerpo.encode("utf-8")),
            "palabras": len(cuerpo.split()),
            "estado": meta.get("estado", ""),
            "nivel": meta.get("nivel", ""),
            "tipo": meta.get("tipo", ""),
            "tags": tags,
            "aliases": aliases,
            "resumen": resumen(cuerpo),
            "enlaces": enlaces,
            "md": cuerpo,
        }
        lecciones.append(leccion)

        for clave in [item["slug"], item["archivo"].rsplit(".md", 1)[0], item["titulo"], *aliases]:
            llave = normalizar(clave)
            if not llave:
                continue
            if llave in indice and indice[llave] != item["slug"]:
                avisos.append(f"alias duplicado '{clave}' ({indice[llave]} y {item['slug']})")
            else:
                indice[llave] = item["slug"]

    slugs = {l["slug"] for l in lecciones}
    for leccion in lecciones:
        for destino in leccion["enlaces"]:
            if destino not in indice:
                problemas.append(f"[{leccion['slug']}] enlace sin resolver: [[{destino}]]")

    for ruta_def in manifest.get("rutas", []):
        for slug in ruta_def["lecciones"]:
            if slug not in slugs:
                problemas.append(f"ruta '{ruta_def['id']}' menciona la lección inexistente '{slug}'")

    # Enlaces inversos (para no calcularlos en el navegador).
    for leccion in lecciones:
        leccion["enlaces"] = [indice[d] for d in leccion["enlaces"] if d in indice]
    backlinks = {slug: [] for slug in slugs}
    for leccion in lecciones:
        for destino in leccion["enlaces"]:
            if destino != leccion["slug"]:
                backlinks[destino].append(leccion["slug"])

    ahora = datetime.now().astimezone()
    salida = {
        "id": manifest["id"],
        "titulo": manifest["titulo"],
        "subtitulo": manifest["subtitulo"],
        "version": manifest["version"],
        "generado": ahora.strftime("%Y-%m-%d %H:%M"),
        "generado_iso": ahora.isoformat(timespec="seconds"),
        "fuente": manifest["fuente"],
        "modulos": manifest["modulos"],
        "rutas": manifest.get("rutas", []),
        "labs": manifest.get("labs", {"disponible": False}),
        "lecciones": lecciones,
        "indice": indice,
        "backlinks": backlinks,
        "estadisticas": {
            "lecciones": len(lecciones),
            "modulos": len(manifest["modulos"]),
            "palabras": sum(l["palabras"] for l in lecciones),
            "enlaces": sum(len(l["enlaces"]) for l in lecciones),
            "bytes": sum(l["bytes"] for l in lecciones),
        },
    }

    DATA.mkdir(exist_ok=True)
    texto_json = json.dumps(salida, ensure_ascii=False, indent=2)
    (DATA / "course.json").write_text(texto_json + "\n", encoding="utf-8")
    compacto = json.dumps(salida, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    (DATA / "course.js").write_text(f"window.CURSO = {compacto};\n", encoding="utf-8")

    print(f"Curso:      {salida['titulo']} · {salida['subtitulo']}")
    print(f"Lecciones:  {salida['estadisticas']['lecciones']} en {salida['estadisticas']['modulos']} módulos")
    print(f"Palabras:   {salida['estadisticas']['palabras']:,}".replace(",", "."))
    print(f"Enlaces:    {salida['estadisticas']['enlaces']} (grafo y backlinks)")
    print(f"Generado:   {salida['generado']}")
    print(f"Salida:     data/course.js · data/course.json")

    for aviso in avisos:
        print(f"AVISO: {aviso}")
    if problemas:
        print("\nPROBLEMAS:", file=sys.stderr)
        for problema in problemas:
            print(f"  - {problema}", file=sys.stderr)
        return 1 if args.check else 0
    print("Verificación: 0 problemas")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
