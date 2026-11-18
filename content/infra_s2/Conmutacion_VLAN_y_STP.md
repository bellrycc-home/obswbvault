---
tipo: procedimiento
nivel: 3
tags:
  - Infraestructura
  - redes
aliases:
  - VLAN
  - STP
  - Spanning Tree
  - EtherChannel
  - 802.1Q
estado: pendiente_revision
fuentes:
  - Informe2.txt
  - gemini-code-1794973044653.html
  - gemini-code-1794944816414.html
---

La **conmutación VLAN y STP** es el conjunto de técnicas de capa 2 que segmentan una red local en dominios lógicos aislados (**VLAN**), transportan varias VLAN por un mismo enlace (**trunk 802.1Q**) y evitan bucles cuando hay enlaces redundantes (**STP**). Es la base de las redes de campus y del direccionamiento por departamentos.

## Bases y prerrequisitos
- [[Modelos_de_Red_OSI_y_TCPIP]] — la trama, la MAC y la capa 2 son el punto de partida.
- [[Redes_y_Direccionamiento_IP]] — cada VLAN suele corresponder a una subred IP.

## Ver también / Para profundizar
- [[Enrutamiento_Dinamico_y_Alta_Disponibilidad]] — cómo se comunican VLAN distintas (Router-on-a-Stick y SVI).
- [[Servicios_de_Red_y_ACL]] — filtrado del tráfico entre VLAN.
- [[Simulacion_y_Emulacion_Redes]] — laboratorios con switches Cisco.

## VLAN: segmentar el dominio de broadcast

Un switch de capa 2 inspecciona la **MAC de destino** de cada trama y la reenvía solo por el puerto donde está conectado ese dispositivo, sin inundar toda la red. Una **VLAN** (*Virtual Local Area Network*) lleva esa lógica más lejos: divide un switch físico en varias redes virtuales aisladas.

- Cada VLAN es un **dominio de broadcast** independiente: un *broadcast* de la VLAN 10 no llega a la VLAN 20.
- La segmentación mejora seguridad y eficiencia: el tráfico de un departamento no circula por los puertos de otro.
- Cada VLAN necesita su propio direccionamiento IP; dos VLAN distintas son dos subredes distintas.

**Ejemplo típico:** VLAN 10 para Ventas, VLAN 20 para IT, VLAN 30 para invitados.

## Puertos access y trunk

| Modo | Qué transporta | Uso |
|---|---|---|
| **Access** | Una sola VLAN, tramas sin etiquetar | Puerto hacia un PC, impresora o servidor final |
| **Trunk** | Varias VLAN, cada trama etiquetada | Enlace entre switches o hacia un router |

El etiquetado de trunk lo define el estándar **IEEE 802.1Q**: inserta una etiqueta con el identificador de VLAN en la trama, de modo que el switch del otro extremo sabe a qué VLAN pertenece.

> 🧠 **Idea clave:** *access* = una VLAN sin etiqueta; *trunk* = muchas VLAN con etiqueta 802.1Q.

## STP: evitar bucles de capa 2

Con enlaces redundantes, una trama de broadcast puede circular indefinidamente: es una **tormenta de broadcast** que satura la red. **STP** (*Spanning Tree Protocol*, IEEE 802.1D) evita el bucle construyendo un árbol lógico sin ciclos.

1. Los switches intercambian **BPDU** (*Bridge Protocol Data Units*) con información de prioridad y coste.
2. Se elige un **Root Bridge**: el switch con menor prioridad (y, en empate, la menor MAC).
3. Cada switch elige su puerto raíz hacia el Root Bridge y bloquea lógicamente los puertos alternativos.
4. Si el enlace activo falla, STP recalcula y activa el puerto bloqueado.

**RSTP** (IEEE 802.1w) es la versión rápida, con convergencia en segundos. **MST** agrupa varias VLAN en instancias para reducir el número de árboles y mejorar el uso de los enlaces.

## EtherChannel: varios cables, un enlace lógico

**EtherChannel** agrupa de 2 a 8 enlaces físicos Ethernet en un único canal lógico de mayor ancho de banda y tolerancia a fallos. Sin él, STP bloquearía los enlaces redundantes; con él, todos transportan tráfico y el fallo de un cable no corta la conexión.

- **LACP** (*Link Aggregation Control Protocol*): estándar abierto, negocia la agregación entre fabricantes.
- **PAgP** (*Port Aggregation Protocol*): propietario de Cisco.

## Sintaxis en Cisco IOS

Configuración de una VLAN, un puerto access y un trunk (origen: `gemini-code-1794944816414.html`, bloque de VLAN; no ejecutada en esta sesión).

```text
Switch(config)# vlan 10
Switch(config-vlan)# name ADMINISTRACION
Switch(config-vlan)# exit

Switch(config)# interface fastEthernet 0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10

Switch(config)# interface gigabitEthernet 0/1
Switch(config-if)# switchport mode trunk
```

- `vlan 10` crea la VLAN; `name` le asigna una etiqueta legible.
- `switchport mode access` fija el puerto para un dispositivo final y `switchport access vlan 10` lo asigna a la VLAN.
- `switchport mode trunk` convierte el puerto en enlace troncal.

*Salida esperada (razonada, no ejecutada):* el puerto `Fa0/1` queda en la VLAN 10 y el `Gi0/1` transporta todas las VLAN etiquetadas. La fuente no incluye la salida de `show vlan brief`, así que no se reproduce.

## Inter-VLAN: el paso siguiente

Dos VLAN no se comunican solas: hace falta un dispositivo de capa 3. Se resuelve con **Router-on-a-Stick** (subinterfaces 802.1Q en un router) o con un **switch multicapa** y sus **SVI** (*Switch Virtual Interface*). El desarrollo está en [[Enrutamiento_Dinamico_y_Alta_Disponibilidad]].

> ⚠️ **No confundir:** VLAN (segmento lógico de capa 2) vs subred IP (segmento de capa 3). Se diseñan juntas, pero una VLAN puede tener varias subredes y una subred puede repartirse entre VLAN.
>
> ⚠️ **No confundir:** *access* (una VLAN, sin etiqueta) vs *trunk* (varias VLAN, con etiqueta 802.1Q).
>
> ⚠️ **No confundir:** STP evita bucles de capa 2 entre switches; FHRP da redundancia a la puerta de enlace de capa 3. No compiten: resuelven fallos distintos.

## Idea clave
Las VLAN dividen un switch en dominios de broadcast aislados; los trunk 802.1Q transportan varias VLAN entre switches; STP elige un Root Bridge y bloquea puertos para evitar bucles; y EtherChannel suma enlaces físicos en uno lógico para ganar ancho de banda y redundancia sin que STP los bloquee.
