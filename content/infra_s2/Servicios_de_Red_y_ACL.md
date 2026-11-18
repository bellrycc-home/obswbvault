---
tipo: concepto
nivel: 3
tags:
  - Infraestructura
  - redes
aliases:
  - NAT
  - PAT
  - ACL
  - DHCP
  - DNS
  - Servicios de red
estado: pendiente_revision
fuentes:
  - gemini-code-1794973044653.html
---

Los **servicios de red y las ACL** son el conjunto de funciones que hacen utilizable una red ya conectada: traducir direcciones privadas a públicas (**NAT/PAT**), repartir configuración automática (**DHCP**), resolver nombres (**DNS**), filtrar tráfico (**ACL**) y operar los dispositivos (**CDP/LLDP, NTP, Syslog, SNMP, QoS**). Sin ellos, la conectividad existe pero la red no es administrable ni segura.

## Bases y prerrequisitos
- [[Modelos_de_Red_OSI_y_TCPIP]] — puertos, TCP/UDP e ICMP.
- [[Redes_y_Direccionamiento_IP]] — direcciones privadas RFC 1918 y subredes.

## Ver también / Para profundizar
- [[Enrutamiento_Dinamico_y_Alta_Disponibilidad]] — las rutas sobre las que se aplican NAT y ACL.
- [[Conmutacion_VLAN_y_STP]] — segmentación que las ACL pueden reforzar.
- [[Seguridad_y_Hardening_TI]] — filtrado defensivo y bastionado.

## NAT y PAT

**NAT** (*Network Address Translation*) traduce direcciones IPv4 privadas (RFC 1918) a una dirección pública en el borde de Internet. Resuelve la escasez de IPv4 y oculta la estructura interna.

**PAT** (*Port Address Translation*), también llamado NAT con sobrecarga, va un paso más allá: miles de hosts internos comparten **una única IP pública** y se distinguen por el **puerto de origen**. Es lo que ocurre en un router doméstico.

| Técnica | Qué traduce | Cuántos hosts por IP pública |
|---|---|---|
| NAT básico | IP privada ↔ IP pública | Una correspondencia por host |
| PAT | IP + puerto de origen | Muchos hosts comparten una IP |

> 🧠 **Idea clave:** NAT traduce direcciones; PAT añade el puerto para multiplexar muchos hosts bajo una sola IP pública.

## ACL: listas de control de acceso

Una **ACL** (*Access Control List*) es una lista secuencial de reglas `permit` / `deny` que se aplica a una interfaz de router para filtrar tráfico. Se evalúa **de arriba abajo** y actúa con la primera regla que coincide; por eso el orden cambia el resultado.

| Tipo | Filtra por | Cuándo se usa |
|---|---|---|
| **Estándar** | Solo IP de origen | Filtrado simple, cerca del destino |
| **Extendida** | IP origen y destino, protocolo y puertos TCP/UDP | Control preciso, cerca del origen |

Una ACL termina con una regla implícita `deny any`: lo que no está permitido explícitamente se descarta. Ese detalle explica muchos fallos de conectividad tras aplicar un filtro.

## DHCP y el ciclo DORA

**DHCP** (*Dynamic Host Configuration Protocol*) asigna automáticamente IP, máscara, puerta de enlace y servidores DNS. La conversación sigue cuatro mensajes, conocido como **DORA**:

| Mensaje | Quién lo envía | Qué significa |
|---|---|---|
| **D**iscover | Cliente | «¿Hay algún servidor DHCP?» |
| **O**ffer | Servidor | «Te ofrezco esta configuración» |
| **R**equest | Cliente | «Acepto esa oferta» |
| **A**cknowledge | Servidor | «Confirmado, úsala» |

Si el cliente no obtiene respuesta, Windows recurre a **APIPA** (`169.254.x.x`), señal de que DHCP falló.

## DNS

**DNS** (*Domain Name System*) traduce nombres jerárquicos a direcciones IP. Los registros principales:

| Registro | Función |
|---|---|
| `A` | Nombre → IPv4 |
| `AAAA` | Nombre → IPv6 |
| `CNAME` | Alias de otro nombre |
| `MX` | Servidor de correo del dominio |

## Gestión y calidad de servicio

- **CDP / LLDP:** descubren vecinos directamente conectados en capa 2. CDP es propietario de Cisco; LLDP es el estándar abierto equivalente.
- **NTP** (*Network Time Protocol*): sincroniza relojes. Es imprescindible para correlacionar registros (*logs*) y validar certificados.
- **Syslog:** recoge eventos de los dispositivos en un servidor central.
- **SNMP** (*Simple Network Management Protocol*): monitoriza métricas y estado de los dispositivos.
- **QoS** (*Quality of Service*): prioriza tráfico sensible a latencia (voz, vídeo) frente a tráfico masivo.

## Sintaxis: pendiente en las fuentes

La fuente explica estos servicios, pero **no incluye los comandos de configuración** de NAT, ACL, DHCP ni de los protocolos de gestión. No se copia sintaxis inventada: queda como **pendiente de verificación** para una próxima fuente.

> ⚠️ **No confundir:** NAT (traduce direcciones) vs PAT (traduce dirección y puerto). Todo PAT es NAT, pero no todo NAT es PAT.
>
> ⚠️ **No confundir:** ACL estándar (solo origen) vs extendida (origen, destino, protocolo y puerto). La extendida permite un control mucho más fino.
>
> ⚠️ **No confundir:** DHCP asigna direcciones; DNS traduce nombres. Que un equipo tenga IP no implica que resuelva nombres, ni al contrario.
>
> ⚠️ **Punto de atención:** en una ACL, el orden de las reglas y el `deny any` implícito final son la causa habitual de un bloqueo inesperado.

## Idea clave
NAT/PAT permiten que las redes privadas salgan a Internet compartiendo direcciones públicas; las ACL filtran por origen, destino, protocolo o puerto en orden secuencial; DHCP entrega configuración con DORA y DNS resuelve nombres; y CDP/LLDP, NTP, Syslog, SNMP y QoS convierten una red conectada en una red observable y administrable.
