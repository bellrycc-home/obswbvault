---
tipo: concepto
nivel: 2
tags:
  - Infraestructura
aliases:
  - Motherboard
  - Tarjeta madre
  - Chipset
estado: pendiente_revision
fuentes:
  - InformeNotebook.txt
  - Informe1.txt
  - Informe2.txt
---

**Placas base** (motherboard) son el circuito impreso principal que interconecta todos los componentes de un equipo (CPU, RAM, almacenamiento, periféricos). El **chipset** es el conjunto de chips que gestiona la comunicación entre la CPU y el resto de los dispositivos. Comprender la placa base es esencial porque determina qué componentes son compatibles y cómo se comunican entre sí.

## Bases y prerrequisitos
- [[Fuentes_de_Alimentacion]] — la placa base recibe energía de la fuente.

## Ver también / Para profundizar
- [[Procesadores_CPU]] — la CPU se instala en el socket de la placa base.
- [[Memoria_RAM_y_ECC]] — la RAM se conecta a la placa base.
- [[Administracion_de_Discos]] — MBR/GPT y el límite de arranque de 2 TB.
- [[Fuentes_de_Alimentacion]] — requisitos de alimentación según el factor de forma.

## Factores de forma (form factors)

Los factores de forma definen el tamaño físico y la disposición de conectores de la placa base. Condicionan la caja (gabinete) compatible, el flujo de aire y los requisitos de la fuente de alimentación.

| Factor | Medidas | Orientación |
|---|---|---|
| **ATX** | 30,5 × 24,4 cm (12 × 9,6 pulgadas) | Máxima capacidad de expansión |
| **Micro-ATX** | 24,4 × 24,4 cm (9,6 × 9,6 pulgadas) | Equilibrio entre coste y expansión |
| **Mini-ITX** | 17 × 17 cm (6,7 × 6,7 pulgadas) | Sistemas integrados o de bajo consumo |

## Chipset: puente norte y puente sur

Dentro del conjunto de chips (chipset) de la placa base:

- **Puente norte (Northbridge):** controla el acceso de alta velocidad a la RAM y a la tarjeta de vídeo. Conecta el procesador con los componentes que requieren mayor velocidad de transferencia de datos (memoria RAM y ranuras PCIe de vídeo).
- **Puente sur (Southbridge):** permite la comunicación de la CPU con dispositivos de menor velocidad: discos duros (SATA), puertos USB, audio, red.

> 🧠 **Idea clave:** northbridge = alta velocidad (RAM, GPU); southbridge = baja velocidad (discos, USB, audio). En arquitecturas modernas ambos se integran en un único chip (PCH).

## Sockets de CPU: LGA vs PGA

- **LGA (Land Grid Array):** los pines de contacto están ubicados en la propia placa base (socket); la superficie inferior del procesador tiene contactos dorados planos (*lands*). Usado por Intel.
- **PGA (Pin Grid Array):** los pines sobresalen directamente del procesador; el socket tiene orificios. Usado por AMD (históricamente).

> ⚠️ **No confundir:** LGA (pines en el socket) vs PGA (pines en el procesador). Forzar un procesador en el socket incorrecto destruye los pines.

## Ranuras de expansión

Las **ranuras de expansión** (PCI / PCIe) son conectores físicos integrados en la tarjeta madre para añadir tarjetas adaptadoras adicionales (GPU, red, captura, etc.).

## Firmware: BIOS, UEFI y POST

El **firmware** es el software grabado en una memoria no volátil reprogramable (**EEPROM/Flash**) que se ejecuta al encender el equipo, antes de que el sistema operativo tome el control.

- **BIOS** (*Basic Input/Output System*): firmware tradicional. Inicializa el hardware y localiza el dispositivo de arranque.
- **POST** (*Power-On Self-Test*): autoevaluación de encendido. Comprueba la presencia e integridad del procesador, la memoria RAM, la tarjeta de vídeo y las unidades de almacenamiento. Si falla, el arranque se detiene con un código o aviso.
- **UEFI** (*Unified Extensible Firmware Interface*): firmware moderno que sustituye a la BIOS. Aporta interfaz gráfica, tiempos de inicio optimizados, soporte para discos de más de 2 TB y **Secure Boot**.
- **Secure Boot**: valida la firma digital del cargador del sistema operativo antes de ejecutarlo, lo que impide arrancar código no firmado.

El arranque con BIOS tradicional usa MBR y queda limitado a 2 TB por volumen; UEFI usa GPT y supera ese límite. El desarrollo del particionado está en [[Administracion_de_Discos]].

## Punto de atención
- ⚠️ **Punto de atención:** verificar compatibilidad entre socket de la placa base y el procesador (modelo y generación) antes de comprar.
- ⚠️ **No confundir:** el BIOS/UEFI y la batería CMOS guardan la configuración de arranque; el chipset gestiona la comunicación entre componentes. Son funciones distintas.

## Idea clave
La placa base es el backbone del equipo: su factor de forma (ATX, micro-ATX, mini-ITX), socket (LGA/PGA) y chipset (northbridge para alta velocidad, southbridge para baja velocidad) determinan qué CPU, RAM y periféricos son compatibles. Su firmware (BIOS/UEFI sobre EEPROM/Flash) ejecuta el POST y decide el arranque: UEFI con Secure Boot y GPT supera el límite de 2 TB de BIOS con MBR.