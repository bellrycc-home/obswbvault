---
tipo: concepto
nivel: 3
tags:
  - Infraestructura
aliases:
  - CPU
  - Procesador
  - Unidad Central de Procesamiento
estado: pendiente_revision
fuentes:
  - InformeNotebook.txt
  - Informe1.txt
  - Informe2.txt
---

**Procesador (CPU, *Central Processing Unit*)** es el "cerebro" del equipo: ejecuta las instrucciones de cómputo. Es el componente que más energía consume y más calor genera, por lo que requiere un sistema de refrigeración adecuado y una instalación cuidadosa.

## Bases y prerrequisitos
- [[Placas_Base_y_Chipsets]] — la CPU se instala en el socket de la placa base; la compatibilidad depende del socket (LGA/PGA).

## Ver también / Para profundizar
- [[Memoria_RAM_y_ECC]] — la CPU accede a la RAM a través del northbridge.
- [[Fuentes_de_Alimentacion]] — la CPU recibe energía dedicada por el conector auxiliar de 4/8 pines.

## Instalación de la CPU (secuencia)

1. **Orientar** la CPU hacia su socket: identificar la muesca de orientación o la marca del Pin 1 en el procesador y alinearla con la clave del socket.
2. **Colocar** la CPU en el socket suavemente, sin forzar los pines o contactos.
3. **Asegurar** la CPU: bajar la cubierta de carga del socket y enganchar la palanca de retención.
4. **Aplicar pasta térmica** sobre el difusor térmico integrado (IHS) de la CPU (pequeña cantidad) para garantizar la conducción del calor.
5. **Instalar el disipador térmico** (heatsink/fan) sobre la CPU.
6. **Asegurar el disipador** con los pestillos o tornillos de retención al soporte de la placa base.

> ⚠️ **Punto de atención:** nunca forzar la CPU en el socket; si no entra con presión mínima, revisar la orientación.

## Sistemas de refrigeración

- **Disipador de aire (heatsink + fan):** solución estándar; la pasta térmica mejora la transferencia térmica entre CPU y disipador.
- **Refrigeración líquida:** para equipos de alto rendimiento.
- **Throttling:** la CPU moderna ajusta dinámicamente su frecuencia de reloj para reducir consumo y disipación de calor (especialmente en portátiles).

## Compatibilidad y tipos de socket

- **LGA (Intel):** pines en el socket, contactos planos en la CPU.
- **PGA (AMD):** pines en la CPU, orificios en el socket.

> ⚠️ **No confundir:** LGA (pines en socket) vs PGA (pines en procesador). Ver [[Placas_Base_y_Chipsets]].

## Arquitecturas de conjunto de instrucciones

| Arquitectura | Rasgo | Ámbito habitual |
|---|---|---|
| **CISC** (*Complex Instruction Set Computer*) | Instrucciones complejas que reducen el número de líneas de código por programa | x86/x64 de escritorio y servidor |
| **RISC** (*Reduced Instruction Set Computer*) | Conjunto reducido de instrucciones muy optimizadas para ejecutarse en pocos ciclos | Plataformas móviles y de bajo consumo |

No son mejores ni peores en abstracto: CISC prioriza densidad de código y compatibilidad; RISC, eficiencia por instrucción y consumo.

## Jerarquía de caché

La CPU no accede siempre a la RAM: guarda datos e instrucciones de uso frecuente en una memoria ultrarrápida integrada, organizada en niveles.

| Nivel | Ubicación | Rasgo |
|---|---|---|
| **L1** | Dentro del núcleo | La más rápida y pequeña |
| **L2** | En el encapsulado del procesador | Secundaria, mayor que L1 |
| **L3** | Compartida entre núcleos | Gran capacidad; típica en procesadores multinúcleo y servidores |

## Tecnologías de rendimiento

| Tecnología | Fabricante | Mecanismo |
|---|---|---|
| **Hyper-Threading** | Intel | Un núcleo físico ejecuta dos hilos simultáneos y el sistema operativo lo ve como dos procesadores lógicos |
| **HyperTransport** | AMD | Enlace serie punto a punto de alta velocidad y baja latencia entre CPU, memoria y chipset |
| **Overclocking** | General | Incrementa la frecuencia de reloj por encima de la nominal para elevar el rendimiento |
| **Throttling** | General | Reduce la frecuencia para proteger la CPU del sobrecalentamiento o ahorrar energía |

> 🧠 **Idea clave:** Hyper-Threading duplica los hilos lógicos de un núcleo físico, no los núcleos; el rendimiento mejora porque se aprovechan las pausas del núcleo, pero no equivale a tener el doble de CPU.

## Punto de atención
- ⚠️ **Punto de atención:** verificar que la CPU sea compatible con el socket y el chipset de la placa base (modelo y generación).
- ⚠️ **Punto de atención:** en portátiles, la CPU puede estar soldada (BGA) y no ser reemplazable.
- ⚠️ **No confundir:** overclocking (sube la frecuencia para rendir más) vs throttling (la baja para protegerse). Son respuestas opuestas.
- ⚠️ **No confundir:** Hyper-Threading crea hilos lógicos, no núcleos físicos.

## Idea clave
La CPU es el cerebro del equipo y se instala en el socket (LGA/PGA) siguiendo una secuencia precisa; su arquitectura puede ser CISC (x86/x64) o RISC, se apoya en caché L1/L2/L3 y en tecnologías como Hyper-Threading e HyperTransport, y su refrigeración es crítica para evitar throttling. El overclocking sube la frecuencia a cambio de más calor y consumo.