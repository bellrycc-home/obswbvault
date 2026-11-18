---
tipo: concepto
nivel: 4
tags:
  - Infraestructura
  - redes
aliases:
  - OSPF
  - EIGRP
  - HSRP
  - VRRP
  - FHRP
  - Enrutamiento dinámico
estado: pendiente_revision
fuentes:
  - Informe2.txt
  - gemini-code-1794973044653.html
---

El **enrutamiento dinámico y la alta disponibilidad** agrupan los protocolos con los que los routers descubren rutas automáticamente (**OSPF**, **EIGRP**) y los que evitan que la puerta de enlace sea un punto único de fallo (**FHRP**: HSRP, VRRP, GLBP). Complementan el enrutamiento estático en redes medianas y grandes, donde configurar cada ruta a mano no escala.

## Bases y prerrequisitos
- [[Enrutamiento_Estatico_Cisco]] — `ip route`, siguiente salto y distancia administrativa.
- [[Redes_y_Direccionamiento_IP]] — subredes y máscaras para interpretar las rutas.
- [[Conmutacion_VLAN_y_STP]] — las VLAN que hay que enrutar.

## Ver también / Para profundizar
- [[Servicios_de_Red_y_ACL]] — NAT, ACL y servicios que corren sobre estas rutas.
- [[Mantenimiento_y_Troubleshooting]] — `show ip route` y diagnóstico.

## Estático frente a dinámico

| Criterio | Estático | Dinámico |
|---|---|---|
| Configuración | Manual, ruta por ruta | El protocolo descubre y actualiza |
| Escala | Redes pequeñas y rutas por defecto | Redes medianas y grandes |
| Reacción a fallos | No reacciona solo | Recalcula y converge |
| Coste | Cero protocolo, mucho mantenimiento | Consumo de CPU, memoria y ancho de banda |

El enrutamiento estático sigue siendo la elección para **rutas por defecto** (`0.0.0.0/0`) y enlaces punto a punto. El dinámico añade tolerancia a fallos: si un enlace cae, el router aprende el camino alternativo sin intervención.

## OSPF

**OSPF** (*Open Shortest Path First*) es un protocolo de **estado de enlace** (*link-state*), estándar abierto.

- Cada router construye un mapa completo de la topología y calcula la ruta más corta con el **algoritmo de Dijkstra** (SPF).
- La métrica es el **coste**, derivado del ancho de banda del enlace.
- La red se organiza en **áreas** jerárquicas; el **Área 0** es el *backbone* por el que se conectan las demás.
- Al ser estándar, funciona entre fabricantes distintos.

## EIGRP

**EIGRP** (*Enhanced Interior Gateway Routing Protocol*) es un protocolo de **vector distancia** avanzado, propietario de Cisco.

- Usa el algoritmo **DUAL** (*Diffusing Update Algorithm*), que guarda rutas de respaldo y permite una convergencia muy rápida.
- Soporta **balanceo de carga de coste desigual**, útil cuando hay caminos de distinta capacidad.
- Su uso queda restringido a equipos Cisco (o a implementaciones compatibles).

> 🧠 **Idea clave:** OSPF = mapa completo + Dijkstra + áreas + estándar abierto. EIGRP = vector distancia + DUAL + convergencia rápida + Cisco.

## Enrutamiento inter-VLAN

Para que dos VLAN se comuniquen hace falta un dispositivo de capa 3. Hay dos métodos:

1. **Router-on-a-Stick:** un switch de capa 2 se conecta a una interfaz física del router mediante un trunk 802.1Q. Esa interfaz se divide en **subinterfaces** (`Fa0/0.10`, `Fa0/0.20`), y cada una actúa como puerta de enlace de su VLAN.
2. **Switch multicapa (capa 3):** usa **SVI** (*Switch Virtual Interface*), una interfaz virtual por VLAN dentro del propio switch. El enrutamiento ocurre a velocidad de cable, sin salir al router.

| Método | Ventaja | Limitación |
|---|---|---|
| Router-on-a-Stick | Sencillo y económico; reutiliza un router | Todo el tráfico inter-VLAN pasa por un solo enlace |
| SVI en switch multicapa | Alto rendimiento y menos latencia | Requiere hardware de capa 3 |

## FHRP: redundancia de la puerta de enlace

Si el router que hace de *default gateway* falla, los hosts de la subred pierden la salida aunque haya otro router disponible. Los **FHRP** (*First Hop Redundancy Protocols*) presentan una **IP y una MAC virtuales** compartidas entre varios routers; los hosts apuntan a esa IP virtual y no notan el cambio.

| Protocolo | Estándar | Funcionamiento |
|---|---|---|
| **HSRP** (*Hot Standby Router Protocol*) | Propietario de Cisco | Un router *Active* y otro *Standby* comparten una IP virtual |
| **VRRP** (*Virtual Router Redundancy Protocol*) | Estándar abierto (IETF) | Un *Master* y uno o más *Backup*; interoperable entre fabricantes |
| **GLBP** (*Gateway Load Balancing Protocol*) | Propietario de Cisco | Redundancia y **balanceo activo-activo** en capa 2/3 |

> 🧠 **Idea clave:** HSRP y VRRP dan redundancia *activo-pasivo*; GLBP reparte carga entre varios routers activos.

## Sintaxis: pendiente en las fuentes

Las fuentes explican el funcionamiento de OSPF, EIGRP y los FHRP, pero **no conservan los comandos de configuración**. Los bloques `<pre>` de la guía solo cubren interfaz, ruta estática y VLAN. Por eso esta nota no incluye sintaxis inventada: la configuración de `router ospf`, `network`, `router eigrp`, `standby` o `vrrp` queda como **pendiente de verificación** para una próxima fuente.

> ⚠️ **Punto de atención:** no se debe confundir la distancia administrativa (criterio de preferencia entre fuentes de ruta) con la métrica del protocolo (coste dentro de OSPF, métrica compuesta en EIGRP). La primera decide qué ruta se instala; la segunda, cuál es la mejor dentro de un protocolo.
>
> ⚠️ **No confundir:** OSPF (estado de enlace, Dijkstra, áreas) vs EIGRP (vector distancia, DUAL, Cisco). Ambos son dinámicos, pero no interoperan entre sí.
>
> ⚠️ **No confundir:** HSRP (Cisco, activo/standby) vs VRRP (estándar, master/backup). GLBP añade balanceo activo-activo.
>
> ⚠️ **No confundir:** STP evita bucles de capa 2; FHRP evita que la puerta de enlace sea un punto único de fallo. Son problemas y soluciones distintos.

## Idea clave
OSPF calcula el camino más corto con Dijkstra sobre un mapa de áreas y EIGRP converge rápido con DUAL; para comunicar VLAN se usa Router-on-a-Stick o SVI; y HSRP, VRRP y GLBP comparten una puerta de enlace virtual para que el fallo de un router no corte la salida de la subred.
