---
tipo: procedimiento
nivel: 3
tags:
  - Infraestructura
  - operacion
aliases:
  - Mantenimiento preventivo
  - Troubleshooting
  - Resolución de problemas
  - ITIL
  - S.M.A.R.T.
estado: pendiente_revision
fuentes:
  - Informe2.txt
  - gemini-code-1794973044653.html
---

El **mantenimiento y la resolución de problemas** son las rutinas con las que se prolonga la vida de los equipos y se restaura el servicio cuando falla. Combina mantenimiento preventivo, un método de diagnóstico en seis pasos, el marco **ITIL v4** y comandos de verificación de red. Es la parte operativa de la infraestructura: lo que se hace antes y después del incidente.

## Bases y prerrequisitos
- [[Modelos_de_Red_OSI_y_TCPIP]] — diagnóstico capa por capa.
- [[Redes_y_Direccionamiento_IP]] — IP, máscara y puerta de enlace que se comprueban.
- [[Administracion_Windows_y_Linux]] — CLI del sistema y permisos.

## Ver también / Para profundizar
- [[Seguridad_y_Hardening_TI]] — respuesta ante incidentes de seguridad.
- [[Servicios_de_Red_y_ACL]] — servicios y filtros que pueden causar fallos.
- [[Enrutamiento_Dinamico_y_Alta_Disponibilidad]] — `show ip route` y redundancia.
- [[Conmutacion_VLAN_y_STP]] — `show mac address-table` y bucles de capa 2.

## Mantenimiento preventivo

El mantenimiento preventivo es un conjunto de rutinas periódicas de inspección física y optimización lógica para evitar interrupciones no programadas.

- Limpieza interna del polvo con aire comprimido.
- Verificación de temperaturas de operación.
- Inspección de cables de datos y de alimentación.
- Monitorización del estado del disco mediante **S.M.A.R.T.** (*Self-Monitoring, Analysis and Reporting Technology*).
- Actualización sistemática de parches de seguridad del sistema operativo.

El objetivo no es "arreglar" sino anticipar: un disco con sectores reasignados o una temperatura alta avisan antes de fallar.

## Método de resolución en seis pasos

| Paso | Acción | Qué se hace |
|---|---|---|
| 1 | **Identificar el problema** | Preguntas abiertas y cerradas al usuario, revisar visores de eventos y observar síntomas físicos |
| 2 | **Establecer una teoría de causa probable** | Formular hipótesis, empezando por las causas más simples y comunes |
| 3 | **Probar la teoría** | Diagnosticar con pruebas dirigidas; si no se confirma, volver al paso 2 |
| 4 | **Plan de acción e implementación** | Diseñar la reparación minimizando el impacto y ejecutarla |
| 5 | **Verificar la funcionalidad total** | Confirmar que todo funciona y aplicar medidas preventivas |
| 6 | **Documentar** | Registrar el incidente y la solución en el sistema de tickets |

El ciclo no es lineal: si la teoría falla en el paso 3, se vuelve al 2. Documentar en el paso 6 alimenta la base de conocimiento y acelera los incidentes futuros.

> 🧠 **Idea clave:** primero se entiende y se comprueba la causa; después se repara. Saltar a la solución sin teoría convierte el incidente en una sucesión de pruebas a ciegas.

## ITIL v4 y el Service Desk

**ITIL v4** es un marco de gestión de servicios de TI. El proceso de seis pasos se alinea con la **gestión de incidentes** y el **Service Desk**: el usuario reporta, se clasifica la incidencia, se restaura el servicio y se documenta.

- **Incidente:** interrupción no planificada o reducción de la calidad del servicio. El objetivo es restaurar cuanto antes.
- **Problema:** causa raíz de uno o varios incidentes. Se investiga después de restablecer el servicio.
- **Base de conocimiento:** registro de hallazgos y soluciones; el paso 6 la alimenta.
- **Ticket:** unidad de registro del incidente, con historial y responsables.

ITIL no impone herramientas: ordena el flujo y asigna responsabilidades.

## Diagnóstico por capas y comandos

El modelo OSI guía el orden: capa 1 (cable, LED), capa 2 (MAC/VLAN), capa 3 (IP/gateway), capas 4-7 (puertos y servicios). Empezar abajo evita perseguir un problema de aplicación cuando el enlace está caído.

```bash
ping 192.168.1.1          # Alcanzabilidad y latencia (ICMP)
traceroute example.com    # Saltos hasta el destino
```

```text
show mac address-table    # MAC aprendidas por puerto y VLAN (capa 2)
show ip route             # Tabla de enrutamiento (capa 3)
```

- `ping` usa ICMP *Echo Request/Reply*: si falla, el problema puede ser de capa 1-3 o un filtro.
- `traceroute` muestra por dónde pasa el tráfico y dónde se pierde.
- `show mac address-table` revela en qué puerto se ha aprendido una MAC; útil para localizar un equipo o un bucle.
- `show ip route` confirma si el router conoce la red de destino y por qué interfaz sale.

Los vecinos directos se descubren con **CDP** (propietario de Cisco) o **LLDP** (estándar); permiten reconstruir la topología real antes de tocar configuraciones.

*Salida esperada (razonada, no ejecutada):* la tabla MAC lista una entrada por MAC con puerto y VLAN; la tabla de rutas muestra redes conectadas y aprendidas con su siguiente salto. La fuente no reproduce la salida, así que no se transcribe.

> ⚠️ **No confundir:** incidente (restaurar el servicio ya) vs problema (encontrar la causa raíz). ITIL separa ambos para no mezclar urgencia con investigación.
>
> ⚠️ **No confundir:** mantenimiento preventivo (evita la falla) vs correctivo (repara después). El método de seis pasos es correctivo; S.M.A.R.T. y la limpieza son preventivos.
>
> ⚠️ **Punto de atención:** documentar después de reparar, no antes, pierde detalles que luego no se recuerdan; conviene anotar síntomas y pruebas durante el proceso.

## Idea clave
El mantenimiento preventivo (limpieza, temperaturas, cables, S.M.A.R.T. y parches) evita fallos; cuando ocurren, el método de seis pasos —identificar, teorizar, probar, planificar, verificar y documentar— ordena la reparación y se alinea con ITIL v4. El diagnóstico baja por las capas OSI y se apoya en `ping`, `traceroute`, `show mac address-table` y `show ip route`.
