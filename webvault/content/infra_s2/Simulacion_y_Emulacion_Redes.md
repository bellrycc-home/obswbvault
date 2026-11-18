---
tipo: concepto
nivel: 2
tags:
  - Infraestructura
  - redes
aliases:
  - Packet Tracer
  - GNS3
  - Simulador
  - Emulador
  - Idle-PC
estado: pendiente_revision
fuentes:
  - Informe1.txt
  - Informe2.txt
  - gemini-code-1794973044653.html
---

La **simulación y emulación de redes** son las técnicas para probar topologías y configuraciones sin arriesgar la producción. Un **simulador** imita el comportamiento con modelos de software; un **emulador** ejecuta la imagen real del sistema operativo del dispositivo. La diferencia decide la fidelidad, el consumo de recursos y el tipo de prácticas posibles.

## Bases y prerrequisitos
- [[Conmutacion_VLAN_y_STP]] — VLAN y STP son las prácticas habituales en estos entornos.
- [[Enrutamiento_Estatico_Cisco]] — IOS, modos y rutas que se configuran.

## Ver también / Para profundizar
- [[Enrutamiento_Dinamico_y_Alta_Disponibilidad]] — OSPF y FHRP que se practican en el laboratorio.
- [[Virtualizacion_e_Hipervisores]] — GNS3 se apoya en una VM y en virtualización.
- [[Mantenimiento_y_Troubleshooting]] — validar antes de tocar producción.

## Simulador frente a emulador

| Criterio | Simulador | Emulador |
|---|---|---|
| Qué ejecuta | Un modelo de software que imita el comportamiento | La imagen binaria real del sistema operativo |
| Fidelidad | Limitada al subconjunto implementado | Alta: responde como el hardware real |
| Consumo | Bajo | Alto: CPU y RAM del equipo anfitrión |
| Ejemplo | Cisco Packet Tracer | GNS3 |

> 🧠 **Idea clave:** simular es imitar; emular es ejecutar el software real sobre hardware emulado. La emulación da más fidelidad a cambio de más recursos.

## Cisco Packet Tracer

- Programa de Cisco Networking Academy orientado a CCNA.
- Simula el comportamiento de los dispositivos con algoritmos programados; no ejecuta imágenes reales.
- Ligero: no requiere ajustes de CPU ni una VM auxiliar.
- Incluye vista física y lógica, dispositivos IoT y modo de simulación paso a paso para observar el encapsulamiento PDU.
- Limitación: solo cubre el subconjunto de comandos previsto para el curso; los comandos avanzados o de otros fabricantes no existen.
- Los switches Catalyst (por ejemplo, 2960 o 3650) se simulan de forma nativa.

## GNS3

- Emulador de código abierto que ejecuta firmware real: Cisco IOS, IOU, Fortinet, VyOS y otros.
- Arquitectura cliente-servidor: interfaz gráfica más **GNS3 VM**, con motores como Dynamips, QEMU y libvirt.
- Soporta el conjunto de comandos de la imagen instalada, no un subconjunto didáctico.
- Los switches se emulan con routers c37xx y la tarjeta **NM-16ESW** (*EtherSwitch*), no con switches Catalyst reales.
- Permite conectar la topología a redes físicas mediante el objeto *Cloud* y capturar tráfico con Wireshark.

## Idle-PC y virtualización anidada

**Idle-PC** es un valor que GNS3 calcula para poner en reposo las instrucciones inactivas de la CPU del dispositivo emulado. Sin él, un router Cisco puede consumir un núcleo entero aunque no esté haciendo nada.

**Virtualización anidada:** la GNS3 VM debe tener habilitadas las extensiones VT-x/AMD-V dentro del hipervisor anfitrión. Sin virtualización anidada, las imágenes KVM/QEMU no arrancan o rinden mal.

Requisitos prácticos: CPU con VT-x/AMD-V, RAM suficiente para la VM y las imágenes, y ajuste de Idle-PC por dispositivo.

> ⚠️ **No confundir:** Packet Tracer (simulador, ligero, comandos limitados) vs GNS3 (emulador, pesado, imagen real). Para CCNA básico basta el primero; para validar comportamiento real, el segundo.
>
> ⚠️ **No confundir:** Idle-PC (valor para reducir el consumo en reposo) con la velocidad de la CPU. No acelera el dispositivo; evita que consuma de más.
>
> ⚠️ **Punto de atención:** GNS3 no emula switches Catalyst nativos; usa routers con tarjeta EtherSwitch, así que algunas funciones de switching no se comportan igual.

## Idea clave
Packet Tracer simula dispositivos con modelos ligeros y un subconjunto de IOS; GNS3 emula imágenes reales sobre GNS3 VM, con más fidelidad y más consumo. GNS3 exige VT-x/AMD-V con virtualización anidada y el ajuste de Idle-PC, y emula switches con routers y tarjetas EtherSwitch en lugar de switches Catalyst nativos.
