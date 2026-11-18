---
tipo: procedimiento
nivel: 3
tags:
  - Infraestructura
aliases:
  - Particiones de disco
  - Conversión FAT32 a NTFS
  - MBR
  - GPT
estado: pendiente_revision
fuentes:
  - InformeNotebook.txt
  - Informe1.txt
  - Informe2.txt
  - gemini-code-1794944816414.html
---
**Administración de discos** abarca la creación de particiones, la conversión de sistemas de archivos (FAT32 → NTFS) y la gestión de tablas de partición (MBR / GPT). Es un procedimiento operativo que se ejecuta a nivel de sistema operativo (Windows).

## Bases y prerrequisitos
- [[Conceptos_de_Almacenamiento]] — conceptos previos de almacenamiento (partición, volumen, sistema de archivos).

## Ver también / Para profundizar
- [[Conceptos_de_Almacenamiento]] — RAID, IOPS y NVMe como contexto de servidores.
- [[Placas_Base_y_Chipsets]] — BIOS/UEFI, POST y Secure Boot.

## Tablas de partición: MBR vs GPT

| Característica | MBR | GPT |
|---|---|---|
| Tamaño máximo de partición | 2 TB | 9.4 ZB (teórico) |
| Particiones primarias | 4 (o 3 + extendida) | Hasta 128 |
| Partición activa | Sí (para arranque) | No aplica igual |
| Uso típico | Equipos antiguos / BIOS | Equipos modernos / UEFI |

- **MBR (*Master Boot Record*):** sector inicial del disco que contiene la tabla de particiones e identifica el Registro de arranque del volumen (VBR). La **partición activa** se designa para almacenar los archivos del sistema operativo y ejecutar el proceso de arranque.
- **GPT (*GUID Partition Table*):** esquema moderno con mayor capacidad y más particiones.

> ⚠️ **No confundir:** MBR (límite 2 TB, 4 particiones) vs GPT (9.4 ZB, 128 particiones). No confundir con el sistema de archivos (NTFS/FAT32), que es independiente de la tabla de partición.

## Sistemas de archivos: FAT32 vs NTFS

- **FAT32:** límite de 4 GB por archivo; sin permisos ni seguridad avanzada; compatible con casi todo.
- **NTFS:** soporta archivos mayores de 4 GB; incluye permisos (ACL), cifrado (EFS), compresión y journaling.
- **exFAT:** pensado para memorias flash y USB. Supera el límite de 4 GB por archivo de FAT32 (hasta 16 EB teóricos) sin la sobrecarga de metadatos de NTFS; carece de journaling y de ACL de NTFS.

## Conversión FAT32 → NTFS sin pérdida de datos

Comando (ejecutar como Administrador):

```
convert I: /fs:ntfs
```

- Requiere **consola de símbolo del sistema como Administrador** (sin privilegios, la operación se rechaza).
- Solicita la **etiqueta del volumen** actual (ej. `ITE`).
- La conversión preserva los datos existentes.

### Cambios estructurales tras la conversión a NTFS

Aparece la pestaña **Seguridad** en las propiedades de la unidad y de sus archivos, permitiendo asignar permisos explícitos de Lectura, Escritura, Modificación y Control Total a usuarios o grupos mediante **ACL** (Listas de Control de Acceso).

> ⚠️ **Punto de atención:** la conversión es unidireccional en la práctica (NTFS → FAT32 requiere reformateo, con pérdida de datos). Verificar la etiqueta del volumen antes de ejecutar.

## Formateo: bajo nivel vs estándar

- **Formato de bajo nivel:** crea las pistas del disco (marcadores de sector); se realiza en fábrica.
- **Formato estándar (alto nivel):** crea el sector de arranque y la tabla de asignación de archivos (NTFS/FAT32). Marca el espacio como disponible, pero **no borra los datos subyacentes**.

## Higienización y baja segura

Antes de reutilizar o dar de baja un soporte hay que garantizar que la información no se pueda recuperar. Los métodos dependen del tipo de medio:

| Método | Cómo actúa | Medio adecuado |
|---|---|---|
| **Borrado seguro** (*wiping*) | Sobrescribe cada sector con patrones de ceros, unos o datos pseudoaleatorios en varias pasadas | SSD y memorias flash; también HDD |
| **Desmagnetización** (*degaussing*) | Campo electromagnético intenso que destruye los dominios magnéticos y el servo-posicionamiento | HDD y cintas magnéticas |
| **Destrucción física** | Trituración o daño irreversible del soporte | Cualquier medio; cuando no basta el borrado lógico |

El formateo estándar **no** es un método de higienización: solo reescribe la estructura lógica. En SSD y memorias flash no se aplica degaussing (no son magnéticos): el método indicado es la sobrescritura por software.

> ⚠️ **Punto de atención:** el degaussing inutiliza el disco (destruye también las pistas de servo); no es un borrado reutilizable.

## Punto de atención
- ⚠️ **No confundir:** tabla de partición (MBR/GPT) vs sistema de archivos (FAT32/NTFS/exFAT). Son capas independientes.
- ⚠️ **Punto de atención:** un disco con esquema MBR solo admite particiones de hasta 2 TB; para discos mayores se requiere GPT.
- ⚠️ **Punto de atención:** el límite de 9,4 ZB de GPT es teórico; los límites prácticos de Windows y del hardware son muy inferiores.
- ⚠️ **Punto de atención:** GPT se combina con UEFI; un disco GPT en un equipo con BIOS tradicional no arranca.

## Idea clave
La administración de discos combina dos capas independientes —tabla de partición (MBR hasta 2 TB / GPT hasta 9,4 ZB teóricos) y sistema de archivos (FAT32 límite 4 GB por archivo / NTFS con ACL / exFAT para flash)— y permite convertir FAT32 a NTFS sin pérdida de datos con `convert I: /fs:ntfs` como Administrador. Antes de dar de baja un soporte, la higienización exige borrado seguro, degaussing o destrucción física; el formateo estándar no borra los datos.

![[gemini-code-1794944816414.html|height: calc(100vh - 140px)]]

