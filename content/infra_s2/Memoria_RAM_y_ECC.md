---
tipo: concepto
nivel: 2
tags:
  - Infraestructura
aliases:
  - RAM
  - Memoria principal
  - ECC
estado: pendiente_revision
fuentes:
  - InformeNotebook.txt
  - Informe1.txt
---

**Memoria RAM** (*Random Access Memory*) es la memoria principal de acceso aleatorio que actúa como almacenamiento temporal para los datos y programas en ejecución activa. La **memoria caché** es una memoria ultrarrápida integrada en o cerca de la CPU que reduce el tiempo de acceso a datos frecuentes. La **ECC** (*Error-Correcting Code*) es la tecnología que detecta y corrige errores en la memoria.

## Bases y prerrequisitos
- [[Procesadores_CPU]] — la CPU accede a la RAM a través del northbridge (ver [[Placas_Base_y_Chipsets]]).

## Ver también / Para profundizar
- [[Placas_Base_y_Chipsets]] — la RAM se conecta a la placa base; el northbridge controla su acceso.

## Tipos de memoria RAM

- **DDR / DDR2 / DDR3 / DDR4 / DDR5:** generaciones sucesivas de memoria síncrona de doble tasa de datos (*Double Data Rate*). Cada generación mejora velocidad y eficiencia energética; **no son intercambiables** entre slots de diferente generación.
- La RAM es volátil: pierde su contenido al apagar el equipo.

## Factores de forma: DIMM y SODIMM

| Formato | Equipo | Rasgo |
|---|---|---|
| **DIMM** (*Dual In-line Memory Module*) | Escritorio y servidor | Módulo de memoria estándar |
| **SODIMM** (*Small Outline DIMM*) | Portátiles y equipos compactos | Versión de menor tamaño |

El formato debe coincidir con la ranura de la placa: un SODIMM no entra en una ranura DIMM ni al contrario.

## Memoria caché

- Memoria ultrarrápida ubicada en o junto a la CPU (niveles L1, L2, L3).
- Almacena datos e instrucciones usados con frecuencia para reducir la latencia de acceso a la RAM principal.

## Detección y corrección de errores: ECC

La memoria **ECC** (*Error-Correcting Code*) se utiliza en servidores y sistemas críticos donde la integridad de los datos es vital.

- **Capacidad:** detecta errores de memoria de múltiples bits y corrige automáticamente los errores de un solo bit en tiempo real, sin provocar caídas del sistema (pantallas azules).
- **Diferencia con paridad simple:** un bit de paridad solo *detecta* errores de un bit, no los corrige.
- **Requisito:** la placa base y la CPU deben soportar ECC (típico en servidores/workstations, no en equipos de escritorio estándar).

> ⚠️ **No confundir:** ECC (detecta multi-bit y corrige single-bit) vs paridad (solo detecta single-bit). ECC no corrige "cualquier cantidad" de bits erróneos.

## Punto de atención
- ⚠️ **Punto de atención:** verificar compatibilidad entre generación de RAM (DDR4 vs DDR5) y slots de la placa base antes de comprar.
- ⚠️ **Punto de atención:** la memoria ECC requiere soporte de CPU y placa base; instalarla en un equipo no compatible no activa la corrección.

## Idea clave
La RAM es la memoria temporal de trabajo (generaciones DDR no intercambiables, en formato DIMM para escritorio o SODIMM para portátil), acelerada por la caché L1/L2/L3 de la CPU; la ECC añade detección multi-bit y corrección de single-bit, esencial en servidores pero requiere soporte de CPU y placa base.