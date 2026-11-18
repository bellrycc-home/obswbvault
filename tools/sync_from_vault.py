#!/usr/bin/env python3
"""Copia las notas de Infraestructura del vault al proyecto y regenera los datos.

El vault es solo lectura: este script nunca escribe en `Notas/` ni en `Index/`.
Uso:

    python3 tools/sync_from_vault.py
    python3 tools/sync_from_vault.py --vault /ruta/al/vault
    python3 tools/sync_from_vault.py --seco
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_VAULT = ROOT.parents[2]
DESTINO = ROOT / "content" / "infra_s2"
MANIFEST = ROOT / "course.json"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--vault", default=str(DEFAULT_VAULT), help="ruta al vault de Obsidian")
    parser.add_argument("--seco", action="store_true", help="solo muestra lo que haría")
    args = parser.parse_args()

    origen = Path(args.vault).expanduser().resolve() / "Notas" / "Infraestructura"
    if not origen.is_dir():
        print(f"ERROR: no existe {origen}", file=sys.stderr)
        return 2

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    declaradas = {item["archivo"] for item in manifest["lecciones"] if item["archivo"] != "00_Guia_del_curso.md"}
    origen_notas = {p.name for p in origen.glob("*.md")}

    faltan = sorted(declaradas - origen_notas)
    nuevas = sorted(origen_notas - declaradas)
    if faltan:
        print("AVISO: declaradas en course.json y ausentes en el vault:")
        for nombre in faltan:
            print(f"  - {nombre}")
    if nuevas:
        print("AVISO: notas del vault que no están en course.json (no se publican):")
        for nombre in nuevas:
            print(f"  - {nombre}")

    copiadas = 0
    for ruta in sorted(origen.glob("*.md")):
        destino = DESTINO / ruta.name
        if destino.exists() and destino.stat().st_mtime_ns == ruta.stat().st_mtime_ns:
            continue
        print(f"{'[seco] ' if args.seco else ''}copiar {ruta.name}")
        if not args.seco:
            DESTINO.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ruta, destino)
        copiadas += 1

    print(f"\n{copiadas} archivo(s) {'a copiar' if args.seco else 'actualizados'} desde {origen}")
    if args.seco:
        return 0

    print()
    return subprocess.call([sys.executable, str(ROOT / "tools" / "build.py"), "--check"])


if __name__ == "__main__":
    raise SystemExit(main())
