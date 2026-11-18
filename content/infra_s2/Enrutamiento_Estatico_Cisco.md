---
tipo: procedimiento
nivel: 3
tags:
  - Infraestructura
aliases:
  - Cisco IOS
  - Rutas estáticas
  - Enrutamiento estático
estado: pendiente_revision
fuentes:
  - InformeNotebook.txt
  - Informe2.txt
  - gemini-code-1794973044653.html
---

**Enrutamiento estático en routers Cisco** es la configuración manual de rutas en dispositivos Cisco IOS para interconectar redes no directamente conectadas. Se realiza mediante la línea de comandos (CLI) y es fundamental para comprender cómo los routers toman decisiones de reenvío.

## Bases y prerrequisitos
- [[Redes_y_Direccionamiento_IP]] — direccionamiento IP, máscaras y /30 son prerrequisito.

## Ver también / Para profundizar
- [[Enrutamiento_Dinamico_y_Alta_Disponibilidad]] — OSPF, EIGRP y FHRP: cuándo una ruta deja de configurarse a mano.
- [[Redes_y_Direccionamiento_IP]] — referencia de direccionamiento.
- [[Servicios_de_Red_y_ACL]] — ACL y NAT aplicadas al tráfico enrutado.

## Topología de ejemplo

```
LAN 1: PC1 → SW1 → R1 (GigabitEthernet 0/0/0)
WAN:   R1 (Serial 0/0/0) ↔ R2 (Serial 0/0/0)
LAN 2: R2 (GigabitEthernet 0/0/0) → SW2 → PC2
```

## Asignación de direcciones IP

- **PC1:** IP 192.168.1.2, máscara /24, gateway 192.168.1.1
- **PC2:** IP 192.168.2.2, máscara /24, gateway 192.168.2.1
- **R1 (LAN):** 192.168.1.1/24 — **R1 (WAN):** 10.0.0.1/30
- **R2 (LAN):** 192.168.2.1/24 — **R2 (WAN):** 10.0.0.2/30

## Configuración CLI — Router R1

```
enable
configure terminal
hostname R1
interface gigabitEthernet 0/0/0
 ip address 192.168.1.1 255.255.255.0
 no shutdown
 exit
interface serial 0/0/0
 ip address 10.0.0.1 255.255.255.252
 no shutdown
 exit
ip route 192.168.2.0 255.255.255.0 10.0.0.2
end
write memory
```

## Configuración CLI — Router R2

```
enable
configure terminal
hostname R2
interface gigabitEthernet 0/0/0
 ip address 192.168.2.1 255.255.255.0
 no shutdown
 exit
interface serial 0/0/0
 ip address 10.0.0.2 255.255.255.252
 no shutdown
 exit
ip route 192.168.1.0 255.255.255.0 10.0.0.1
end
write memory
```

## Análisis del enrutamiento

- **Siguiente salto (Next Hop):** en `ip route 192.168.2.0 255.255.255.0 10.0.0.2`, la IP `10.0.0.2` es la dirección de la interfaz del router vecino (R2) en el enlace serial. Enseña al router cómo alcanzar redes no directamente conectadas.
- **Máscara /30 (255.255.255.252):** enlace punto a punto entre routers; evita desperdicio de IPs.
- `write memory` guarda la configuración en la NVRAM (persistente tras reinicio).
- `no shutdown` activa la interfaz (por defecto las interfaces están apagadas).

> 🧠 **Idea clave:** `ip route <red_destino> <máscara> <next_hop>` — el router aprende a llegar a redes remotas indicando el siguiente salto.

## Ruta por defecto

La **ruta por defecto** es una ruta estática que coincide con cualquier destino: se representa como `0.0.0.0/0` (prefijo cero, máscara `0.0.0.0`). Se usa para enviar a un único vecino todo el tráfico que no tenga una ruta más específica, típicamente hacia el proveedor de Internet o hacia el router de salida de una sucursal.

*Sintaxis adaptada de la plantilla de la fuente (no aparece literalmente en sus bloques):*

```text
ip route 0.0.0.0 0.0.0.0 <IP_siguiente_salto>
```

Es la ruta menos específica de la tabla: cualquier otra ruta con un prefijo mayor tiene prioridad. Por eso convive con las rutas concretas sin sustituirlas.

## Verificación: `show ip route`

`show ip route` muestra la tabla de enrutamiento del router: redes directamente conectadas, rutas estáticas y rutas aprendidas por protocolos dinámicos. Es el comando de comprobación tras configurar `ip route`.

*Salida esperada (razonada, no ejecutada):* una entrada por red, con el código de origen de la ruta (`C` para conectada, `S` para estática) y el siguiente salto o la interfaz de salida. La fuente no reproduce la salida literal, así que no se transcribe.

## Distancia administrativa

Cuando dos fuentes ofrecen una ruta al mismo destino, el router elige la de **menor distancia administrativa** (*administrative distance*). Es un valor de preferencia entre el origen de la información (ruta conectada, estática o protocolo dinámico), no una medida de velocidad del enlace.

- Menor distancia = fuente más fiable.
- La distancia administrativa decide **qué ruta se instala**; la métrica decide cuál es la mejor **dentro de un mismo protocolo**.
- Una ruta estática suele preferirse a una dinámica, salvo que se ajuste su distancia.

Los protocolos que aprenden rutas automáticamente se estudian en [[Enrutamiento_Dinamico_y_Alta_Disponibilidad]].

## Punto de atención
- ⚠️ **Punto de atención:** el next hop debe ser alcanzable (directamente conectado). Si el enlace serial está down, la ruta estática queda inactiva.
- ⚠️ **Punto de atención:** `write memory` es necesario para persistir la configuración; sin él, los cambios se pierden al reiniciar.
- ⚠️ **Punto de atención:** la ruta por defecto es la menos específica; si existe una ruta con prefijo mayor hacia el destino, esa gana.
- ⚠️ **No confundir:** `ip route` (ruta estática manual) vs protocolos dinámicos (OSPF, RIP, EIGRP) que aprenden rutas automáticamente.
- ⚠️ **No confundir:** distancia administrativa (preferencia entre fuentes de ruta) vs métrica (coste dentro de un protocolo).

## Idea clave
El enrutamiento estático en Cisco IOS se configura con `ip route <red> <máscara> <next_hop>` para alcanzar redes remotas por el siguiente salto, con máscaras /30 en enlaces punto a punto y `write memory` para persistir. La ruta por defecto `0.0.0.0/0` cubre cualquier destino sin ruta específica, `show ip route` verifica la tabla y la distancia administrativa decide qué fuente de ruta se instala.