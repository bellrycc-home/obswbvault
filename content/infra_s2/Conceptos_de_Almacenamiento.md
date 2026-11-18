---
tipo: concepto
nivel: 3
tags:
  - Infraestructura
aliases:
  - Almacenamiento
  - Conceptos de almacenamiento
  - RAID
estado: pendiente_revision
fuentes:
  - InformeNotebook.txt
  - Informe1.txt
  - Informe2.txt
---

**Conceptos de almacenamiento** son los fundamentos sobre discos, particiones, volúmenes, sistemas de archivos y arreglos redundantes (**RAID**) que preceden a la administración práctica. Esta nota agrupa las definiciones mínimas para comprender [[Administracion_de_Discos]] y el dimensionamiento de almacenamiento en servidores.

## Bases y prerrequisitos
- Ninguno (nota de entrada conceptual).

## Ver también / Para profundizar
- [[Administracion_de_Discos]] — aplicación práctica: particiones, conversión FAT32→NTFS, MBR/GPT.
- [[Placas_Base_y_Chipsets]] — el firmware UEFI y GPT condicionan el arranque de discos grandes.

## Definiciones mínimas

- **Disco (unidad de almacenamiento):** dispositivo físico que guarda datos de forma persistente (HDD magnético, SSD flash).
- **Partición:** división lógica de un disco físico que el sistema operativo trata como una unidad independiente.
- **Volumen:** espacio de almacenamiento formateado con un sistema de archivos y asignado una letra de unidad (ej. `C:`, `I:`).
- **Sistema de archivos:** estructura lógica que organiza y gestiona los archivos en un volumen (FAT32, NTFS, exFAT).
- **Tabla de partición:** estructura que describe cómo se dividen las particiones en un disco (MBR o GPT).
- **Sector de arranque (boot sector):** región inicial del volumen que contiene el código para iniciar el sistema operativo.

## Relación con la administración práctica

Estos conceptos son el prerrequisito de [[Administracion_de_Discos]], donde se aplican: creación de particiones, conversión FAT32→NTFS y gestión de MBR/GPT.

## RAID: principios y niveles

**RAID** (*Redundant Array of Independent Disks*) combina varios discos físicos en una unidad lógica para mejorar rendimiento, capacidad o tolerancia a fallos. Se apoya en tres principios:

- **Striping** (franjas): divide los datos en bloques y los escribe simultáneamente en varios discos. Aumenta la velocidad, pero no protege.
- **Mirroring** (espejo): replica exactamente los datos en otro disco. Tolera el fallo de un disco a cambio de perder la mitad de la capacidad.
- **Paridad**: calcula sumas de comprobación distribuidas entre las unidades. Permite reconstruir un disco caído sin duplicar el almacenamiento.

| Nivel | Discos mínimos | Tolera el fallo de | Capacidad útil | Rasgo |
|---|---|---|---|---|
| **RAID 0** | 2 | Ningún disco | 100 % | Máximo rendimiento, sin redundancia |
| **RAID 1** | 2 | 1 disco | 50 % | Espejo completo |
| **RAID 5** | 3 | 1 disco | Un disco menos | Paridad distribuida |
| **RAID 6** | 4 | 2 discos | Dos discos menos | Doble paridad |
| **RAID 10** | 4 (dos espejos) | 1 disco por espejo | 50 % | Mirroring + striping |

> 🧠 **Idea clave:** RAID 0 solo suma velocidad; RAID 1 duplica; RAID 5 y 6 añaden paridad para sobrevivir a fallos; RAID 10 combina espejo y franjas para alto rendimiento con redundancia.

## IOPS y dimensionamiento

Las **IOPS** (*Input/Output Operations Per Second*) miden cuántas operaciones de entrada/salida por segundo admite un almacenamiento. El diseño de un servidor elige el arreglo según la carga de trabajo, la latencia y la tolerancia requeridas.

| Servicio / carga | Discos | RAID | Capacidad útil / rendimiento | Justificación |
|---|---|---|---|---|
| Sistema operativo y DNS | 2× SSD 72 GB | RAID 1 | 72 GB útiles / 20k IOPS lectura | Arranque rápido y disponibilidad ante fallo |
| Base de datos transaccional | 3× SSD 512 GB | RAID 5 | ~1 TB útil / 30k IOPS lectura | I/O crítico y tolerancia de 1 disco con paridad |
| Servidor de reportes | 4× HDD 512 GB | RAID 5 | ~1,5 TB útiles (75 %) / 20k IOPS | Consultas pesadas y almacenamiento masivo económico |
| Servidor de archivos | 2× HDD 1 TB | RAID 1 | 1 TB útil / 10k IOPS lectura | Documentos con redundancia en espejo |

## NVMe y arranque en servidores

- **NVMe** (*Non-Volatile Memory Express*) es un protocolo para SSD que usa el bus **PCIe** en lugar de la interfaz SATA. Reduce la latencia y aprovecha mejor el paralelismo del almacenamiento flash.
- **GPT con UEFI** permite volúmenes de gran tamaño y arranque seguro; sustituye a MBR, limitado a 2 TB. Es la combinación habitual en servidores actuales.

> ⚠️ **Punto de atención:** el límite de 9,4 ZB de GPT es teórico; los límites prácticos de Windows y del hardware son muy inferiores.
>
> ⚠️ **No confundir:** RAID 5 (tolera 1 disco) vs RAID 6 (tolera 2). RAID 6 exige un disco más y pierde más capacidad, a cambio de sobrevivir a un segundo fallo durante la reconstrucción.
>
> ⚠️ **No confundir:** RAID 0 (rendimiento sin protección) vs RAID 1 (protección con la mitad de capacidad).

## Idea clave
El almacenamiento se organiza en discos, particiones, volúmenes y sistemas de archivos; RAID añade rendimiento y tolerancia combinando discos con striping, mirroring o paridad (0 sin protección, 1 espejo, 5 un fallo, 6 dos fallos, 10 espejo más franjas). El dimensionamiento se decide por IOPS y carga, y NVMe sobre PCIe con GPT/UEFI es la base de los servidores actuales.