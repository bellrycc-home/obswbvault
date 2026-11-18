---
tipo: concepto
nivel: 3
tags:
  - Infraestructura
  - virtualizacion
aliases:
  - Hipervisor
  - Virtualización
  - Tipo 1
  - Tipo 2
  - VT-x
  - AMD-V
estado: pendiente_revision
fuentes:
  - Informe1.txt
  - Informe2.txt
  - gemini-code-1794973044653.html
---

La **virtualización** abstrae los recursos físicos de un servidor para ejecutar varias máquinas virtuales (VM) independientes sobre el mismo hardware. El componente que lo hace posible es el **hipervisor**, clasificado en Tipo 1 (sobre el hardware) y Tipo 2 (sobre un sistema operativo anfitrión). Es la base de los centros de datos, los laboratorios y la nube.

## Bases y prerrequisitos
- [[Procesadores_CPU]] — la virtualización necesita extensiones de virtualización de la CPU.
- [[Placas_Base_y_Chipsets]] — VT-x/AMD-V se habilita en BIOS/UEFI.
- [[Administracion_Windows_y_Linux]] — administración del sistema anfitrión.

## Ver también / Para profundizar
- [[Contenedores_Docker]] — alternativa ligera: comparte el kernel en lugar de virtualizar hardware.
- [[Orquestacion_Kubernetes]] — orquestación de contenedores a escala.
- [[Simulacion_y_Emulacion_Redes]] — GNS3 ejecuta imágenes reales sobre emulación.
- [[Infraestructura_Cloud_y_DevOps]] — IaaS, PaaS y IaC.

## Qué abstrae un hipervisor

Un servidor físico tiene CPU, memoria, almacenamiento y red. El hipervisor reparte esos recursos entre varias VM, cada una con su propio sistema operativo invitado y su propio kernel. La VM cree tener hardware dedicado; el hipervisor traduce sus instrucciones al hardware real.

Ventajas: consolidación (menos servidores físicos), aislamiento, instantáneas, migración en caliente y laboratorios reproducibles. Coste: una capa de abstracción y la memoria/CPU reservadas a cada VM.

## Hipervisores Tipo 1 y Tipo 2

| Tipo | Dónde se ejecuta | Rendimiento | Ejemplos |
|---|---|---|---|
| **Tipo 1** (*bare-metal*) | Directamente sobre el hardware, sin SO intermedio | Máximo, menor latencia | VMware ESXi, Microsoft Hyper-V, Proxmox VE, KVM, Xen |
| **Tipo 2** (*hosted*) | Como aplicación sobre un SO anfitrión (Windows, Linux, macOS) | Menor: las peticiones atraviesan el SO | Oracle VirtualBox, VMware Workstation/Player, Parallels |

- **Tipo 1:** propio de centros de datos y *homelabs*; el hipervisor es el sistema operativo del servidor.
- **Tipo 2:** propio de pruebas de escritorio y laboratorios locales; cómodo porque convive con las aplicaciones del anfitrión.

> [!warning] Matiz de clasificación
> La fuente clasifica Hyper-V y KVM como Tipo 1. En KVM, el soporte de virtualización es un módulo del kernel Linux, por lo que su encuadre como *bare-metal* puro se discute. Se conserva la clasificación de la fuente y se deja constancia de la matización.

## Requisitos de hardware

- **Intel VT-x** o **AMD-V**: extensiones de la CPU que permiten ejecutar instrucciones de la VM directamente en el procesador, sin emulación por software.
- Deben estar **habilitadas en BIOS/UEFI**; si están desactivadas, el hipervisor no arranca las VM o funciona en modo muy lento.
- **SLAT** (*Second Level Address Translation*): soporte de traducción de direcciones de segundo nivel que acelera el acceso de la VM a la memoria.
- Memoria suficiente para el anfitrión y todas las VM; la RAM se reserva y no se comparte como en los contenedores.

## VM frente a contenedor

| Criterio | Máquina virtual | Contenedor |
|---|---|---|
| Qué virtualiza | Hardware completo | Procesos sobre el kernel del host |
| Sistema operativo | Invitado completo, con su kernel | No incluye kernel propio |
| Arranque | Decenas de segundos o minutos | Milisegundos |
| Consumo | GB de RAM y disco | MB de RAM y disco |
| Aislamiento | Fuerte, a nivel de hardware | A nivel de procesos (*namespaces* y *cgroups*) |
| Uso típico | Distintos SO, aislamiento fuerte, legado | Microservicios y despliegues densos |

El contenedor no sustituye a la VM en todos los casos: si necesitas otro kernel u otro sistema operativo, la VM sigue siendo la respuesta. El desarrollo de los contenedores está en [[Contenedores_Docker]].

> ⚠️ **No confundir:** hipervisor (virtualiza hardware) vs contenedor (aisla procesos compartiendo el kernel). Una VM incluye un SO completo; un contenedor, no.
>
> ⚠️ **No confundir:** emulación (GNS3 ejecuta la imagen real de otro hardware) vs virtualización (la VM usa el mismo tipo de CPU que el anfitrión).
>
> ⚠️ **Punto de atención:** sin VT-x/AMD-V habilitado en el firmware, el hipervisor puede negarse a crear VM de 64 bits o degradar el rendimiento.

## Idea clave
El hipervisor abstrae el hardware y reparte CPU, RAM, disco y red entre VM aisladas; el Tipo 1 se instala sobre el hardware (ESXi, Hyper-V, Proxmox, KVM, Xen) y el Tipo 2 sobre un SO anfitrión (VirtualBox, VMware Workstation). Necesita VT-x/AMD-V habilitado en el firmware y SLAT, y se distingue del contenedor en que la VM virtualiza hardware completo mientras el contenedor comparte el kernel.
