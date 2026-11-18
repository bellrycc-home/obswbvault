---
tipo: concepto
nivel: 2
tags:
  - Infraestructura
  - redes
aliases:
  - Modelo OSI
  - OSI
  - TCP/IP
  - Capas de red
estado: pendiente_revision
fuentes:
  - Informe2.txt
  - gemini-code-1794973044653.html
---

Los **modelos de referencia OSI y TCP/IP** son abstracciones en capas que explican cómo se encapsulan y transportan los datos entre dispositivos. OSI es el modelo teórico de siete capas; TCP/IP es el modelo práctico de cuatro que usan las redes reales. Sirven para diseñar protocolos, ubicar dispositivos y diagnosticar fallos capa por capa.

## Bases y prerrequisitos
- Ninguno (nota de entrada al módulo de redes).

## Ver también / Para profundizar
- [[Redes_y_Direccionamiento_IP]] — aplicación: direcciones IPv4/IPv6 y máscaras que operan en la capa de red.
- [[Conmutacion_VLAN_y_STP]] — capa 2: tramas, VLAN y switches.
- [[Servicios_de_Red_y_ACL]] — capas 4-7: puertos, traducción y filtrado.
- [[Mantenimiento_y_Troubleshooting]] — uso del modelo para aislar averías.

## Clasificación de redes y topologías

| Tipo | Alcance | Rasgo que la identifica |
|---|---|---|
| **LAN** (*Local Area Network*) | Oficina, campus, hogar | Alta velocidad y administración bajo un mismo dominio |
| **WMN** (*Wireless Mesh Network*) | Cobertura inalámbrica local | Varios puntos de acceso se interconectan entre sí de forma resiliente |
| **MAN** (*Metropolitan Area Network*) | Ciudad o varias sedes urbanas | Interconexión metropolitana |
| **WAN** (*Wide Area Network*) | Países o continentes | Une LAN separadas geográficamente mediante enlaces de proveedores |
| **VPN** (*Virtual Private Network*) | Túnel sobre Internet | Cifra el tráfico para entrar en una red privada a través de una red no confiable |

La topología no es el tamaño: dos LAN pueden usar estrella o malla. La clasificación anterior describe el alcance; la topología describe cómo se conectan los nodos.

## Las siete capas del modelo OSI

| Capa | Nombre | PDU | Función y dispositivos clave |
|---|---|---|---|
| 7 | Aplicación | Datos | Interfaz con las aplicaciones: HTTP, DNS, DHCP, SSH, SNMP |
| 6 | Presentación | Datos | Cifrado (TLS), compresión y codificación de formatos |
| 5 | Sesión | Datos | Apertura, mantenimiento y cierre de sesiones entre hosts |
| 4 | Transporte | Segmento (TCP) / datagrama (UDP) | Comunicación extremo a extremo y control de flujo |
| 3 | Red | Paquete | Direccionamiento lógico (IPv4/IPv6) y selección de ruta; routers y switches de capa 3 |
| 2 | Enlace de datos | Trama | Direccionamiento físico (MAC) y acceso al medio; switches y bridges |
| 1 | Física | Bits | Transmisión eléctrica, óptica o inalámbrica; cables, hubs y repetidores |

**PDU** (*Protocol Data Unit*) es el nombre que recibe la unidad de datos en cada capa. Al bajar por la pila, cada capa añade su cabecera: el paquete se convierte en trama y la trama en bits.

> 🧠 **Idea clave:** capa 2 mueve tramas dentro de la red local con direcciones MAC; capa 3 mueve paquetes entre redes distintas con direcciones IP.

## TCP/IP: el modelo que se implementa

| Capa TCP/IP | Equivale a OSI | Protocolos y funciones |
|---|---|---|
| Aplicación | 5, 6 y 7 | HTTP, DNS, DHCP, SSH, SNMP |
| Transporte | 4 | TCP y UDP |
| Internet | 3 | IP, ICMP |
| Acceso a la red | 1 y 2 | Ethernet, Wi-Fi, MAC, medios físicos |

TCP/IP agrupa las tres capas superiores de OSI porque en la práctica las aplicaciones gestionan presentación y sesión. El modelo de cuatro capas es el que se usa para describir Internet.

## TCP frente a UDP

- **TCP** (*Transmission Control Protocol*): orientado a conexión. Establece la sesión con un *three-way handshake*, confirma la recepción con acuses (ACK) y retransmite los segmentos perdidos. Se usa cuando la integridad importa más que la latencia (web, SSH, correo).
- **UDP** (*User Datagram Protocol*): no orientado a conexión. Entrega en modo *best-effort*, sin confirmación ni retransmisión. Se usa cuando prima la latencia (VoIP, streaming, DNS).

## Puertos bien conocidos

| Servicio | Puerto | Transporte |
|---|---|---|
| SSH | 22 | TCP |
| DNS | 53 | UDP y TCP |
| DHCP | 67 (servidor) / 68 (cliente) | UDP |
| HTTP | 80 | TCP |
| HTTPS | 443 | TCP |
| Syslog | 514 | UDP |

Un puerto identifica el servicio dentro de un host; la IP identifica el host. Por eso una conexión se describe con la pareja `IP:puerto`.

## ICMP y diagnóstico por capas

**ICMP** (*Internet Control Message Protocol*) opera en capa 3 y transporta mensajes de control y error. `ping` usa *Echo Request* / *Echo Reply* para comprobar alcanzabilidad; `traceroute` lo usa para descubrir el camino.

El modelo sirve para aislar fallos en orden ascendente: primero el enlace físico (capa 1: cable, LED), después la tabla MAC y la VLAN (capa 2), luego la IP, la máscara y la puerta de enlace (capa 3) y, por último, los puertos y servicios (capas 4-7). Empezar por la capa más baja evita perseguir un problema de aplicación cuando el cable está desconectado.

> ⚠️ **No confundir:** modelo OSI (7 capas, referencia teórica) vs TCP/IP (4 capas, implementación práctica). No son dos realidades distintas: TCP/IP se corresponde con OSI agrupando capas.
>
> ⚠️ **No confundir:** switch de capa 2 (decide por MAC) vs router (decide por IP). Un switch de capa 3 hace ambas funciones.

## Idea clave
OSI describe siete capas con su PDU (datos, segmento, paquete, trama, bits) y TCP/IP las reduce a cuatro; en la práctica, la dirección MAC mueve tramas por la LAN, la IP mueve paquetes entre redes y los puertos identifican el servicio, lo que permite diagnosticar de la capa 1 hacia arriba.
