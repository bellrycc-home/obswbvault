---
tipo: concepto
nivel: 3
tags:
  - Infraestructura
aliases:
  - IPv4
  - Direccionamiento IP
  - Subredes
estado: pendiente_revision
fuentes:
  - InformeNotebook.txt
  - Informe2.txt
  - gemini-code-1794973044653.html
---

**Redes y direccionamiento IP** abarca los fundamentos del direccionamiento IPv4 (clases, conversión decimal-binario, rangos privados RFC 1918), las máscaras de subred y CIDR, las direcciones MAC y la notación IPv6. Es la base para comprender el enrutamiento y la configuración de dispositivos de red.

## Bases y prerrequisitos
- [[Modelos_de_Red_OSI_y_TCPIP]] — capas, PDU y ubicación de IP en la capa de red.

## Ver también / Para profundizar
- [[Enrutamiento_Estatico_Cisco]] — aplicación: configuración de routers con estas direcciones.
- [[Conmutacion_VLAN_y_STP]] — cada VLAN se asocia a una subred.
- [[Servicios_de_Red_y_ACL]] — DHCP, DNS, NAT y puertos.
- [[Despliegue_Nginx_Docker]] — los contenedores usan puertos y redes.

## Conversión decimal a binario

Ejemplo con la IP `192.168.1.25`:

- `192` → `11000000` (128 + 64)
- `168` → `10101000` (128 + 32 + 8)
- `1` → `00000001` (1)
- `25` → `00011001` (16 + 8 + 1)

Cada octeto son 8 bits (1 byte); una IPv4 completa son 32 bits.

## Clases de direcciones IPv4 y rangos privados (RFC 1918)

| Clase | Rango privado | Máscara típica | Hosts útiles |
|---|---|---|---|
| A | 10.0.0.0 – 10.255.255.255 | /8 (255.0.0.0) | ~16 millones |
| B | 172.16.0.0 – 172.31.255.255 | /12 (255.240.0.0) | ~65 mil |
| C | 192.168.0.0 – 192.168.255.255 | /24 (255.255.255.0) | 254 |

## Máscaras de subred y /30

- La máscara define qué parte de la IP es red y qué parte es host.
- **Máscara /30 (255.255.255.252):** asigna 2 bits para hosts (2² − 2 = 2 hosts útiles). Es la máscara óptima para enlaces punto a punto entre routers porque evita el desperdicio de direcciones IP.

## CIDR, hosts útiles y sumarización

La notación **CIDR** expresa la máscara como el número de bits de red: `/24` equivale a `255.255.255.0` (24 bits de red y 8 de host).

**Hosts útiles = 2ⁿ − 2**, donde `n` es el número de bits de host. Se restan la dirección de red (todos los bits de host a 0) y la de broadcast (todos a 1).

| Prefijo | Máscara | Bits de host | Hosts útiles |
|---|---|---|---|
| /30 | 255.255.255.252 | 2 | 2 |
| /29 | 255.255.255.248 | 3 | 6 |
| /28 | 255.255.255.240 | 4 | 14 |
| /24 | 255.255.255.0 | 8 | 254 |

**Sumarización de rutas** (*route summarization*): varias subredes contiguas se agrupan en una única ruta resumida. Reduce el tamaño de las tablas de enrutamiento y el número de anuncios; se aplica en [[Enrutamiento_Estatico_Cisco]] y en los protocolos de [[Enrutamiento_Dinamico_y_Alta_Disponibilidad]].

## Direcciones especiales

- **APIPA (169.254.x.x):** autoconfiguración cuando no hay servidor DHCP. Solo permite comunicación local en la misma subred física; no permite enrutamiento hacia redes externas ni hacia Internet.
- **Broadcast:** transmisión desde un emisor hacia todos los dispositivos de la red simultáneamente.

## Direcciones MAC

- **MAC (48 bits en hexadecimal):** dirección física del adaptador. Formato estándar: `00-50-56-BE-D7-87` (6 pares hexadecimales separados por guiones o dos puntos).
- Opera en la **capa 2** y solo tiene alcance dentro del dominio local; un router la reescribe en cada salto.

## IPv6

- **128 bits** escritos como 8 grupos de 16 bits en hexadecimal (ej. `2001:db8:cafe:200::6`, `FF02::1`). Los ceros a la izquierda de cada grupo se omiten y `::` sustituye una secuencia de grupos nulos.
- **SLAAC** (*Stateless Address Autoconfiguration*): el host forma su propia dirección a partir del prefijo anunciado por el router, sin servidor DHCP.
- **Sin NAT:** el espacio de direcciones es suficiente para dar una dirección global a cada dispositivo; NAT deja de ser una necesidad de conservación.
- **Cabecera simplificada** respecto a IPv4, lo que reduce el procesamiento en los routers.

La fuente no detalla los tipos de dirección IPv6 (global, link-local, ULA) ni el subnetting, así que quedan como **pendiente** para una próxima fuente.

## Protocolos clave (de los patrones de examen)

- **DHCP:** asigna automáticamente direcciones IP, máscara y gateway a los hosts.
- **DNS:** traduce nombres de dominio (cisco.com) a direcciones IP.
- **POP3:** descarga correo del servidor y lo elimina del servidor.
- **IDS vs IPS:** IDS monitorea pasivamente y alerta; IPS actúa activamente bloqueando.

## TCP, UDP y puertos

| Protocolo | Conexión | Garantía | Uso típico |
|---|---|---|---|
| **TCP** | Orientado a conexión (*three-way handshake*) | ACK y retransmisión de segmentos perdidos | Web, SSH, correo |
| **UDP** | No orientado a conexión | Entrega *best-effort*, sin confirmación | VoIP, streaming, DNS |

Los servicios se identifican por **puerto**: SSH 22/TCP, DNS 53/UDP y TCP, DHCP 67-68/UDP, HTTP 80/TCP, HTTPS 443/TCP y Syslog 514/UDP. La pareja `IP:puerto` identifica una conexión concreta. El detalle está en [[Servicios_de_Red_y_ACL]].

## ICMP y topologías

**ICMP** (*Internet Control Message Protocol*) es el protocolo de diagnóstico y control de la capa 3. `ping` envía *Echo Request* y espera *Echo Reply*; `traceroute` lo usa para descubrir el camino salto a salto. ICMP no transporta datos de usuario: informa de alcanzabilidad y errores.

Las redes se clasifican por alcance (LAN, MAN, WAN, VPN y malla inalámbrica WMN); la topología describe cómo se conectan los nodos. Ambos conceptos se desarrollan en [[Modelos_de_Red_OSI_y_TCPIP]].

> ⚠️ **No confundir:** IDS (detección pasiva, solo alerta) vs IPS (prevención activa, bloquea). DHCP (asigna IP) vs DNS (traduce nombres). ICMP (ping) vs TCP (transporte).

## Punto de atención
- ⚠️ **Punto de atención:** una IP `169.254.x.x` indica fallo de DHCP (APIPA), no conectividad normal.
- ⚠️ **No confundir:** dirección IP (lógica, enrutable) vs dirección MAC (física, de enlace).

## Idea clave
El direccionamiento IPv4 se organiza en clases (A/B/C) con rangos privados RFC 1918, se convierte bit a bit entre decimal y binario y usa CIDR: los hosts útiles son 2ⁿ − 2 y /30 sirve para enlaces punto a punto. La MAC (48 bits) identifica el adaptador en la LAN, IPv6 aporta 128 bits con SLAAC y sin NAT, y TCP/UDP con sus puertos identifican los servicios; APIPA (169.254.x.x) señala un fallo de DHCP.