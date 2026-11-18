---
tipo: concepto
nivel: 2
tags:
  - Infraestructura
aliases:
  - PSU
  - Fuente de poder
  - Power Supply Unit
estado: pendiente_revision
fuentes:
  - InformeNotebook.txt
  - Informe1.txt
  - Informe2.txt
---

**Fuentes de alimentación** (PSU, *Power Supply Unit*) son los dispositivos que convierten la corriente alterna (AC) de la red eléctrica en corriente continua (DC) de los voltajes que requieren los componentes internos del equipo. Es el segundo eslabón de la cadena de hardware: sin energía estable y correctamente distribuida, ningún otro componente puede funcionar.

## Bases y prerrequisitos
- [[Seguridad_Electrica_y_ESD]] — el entorno debe estar protegido contra ESD antes de manipular la fuente.

## Ver también / Para profundizar
- [[Placas_Base_y_Chipsets]] — la fuente se conecta a la placa base y a la CPU.
- [[Procesadores_CPU]] — la CPU consume la mayor parte de la energía de 12 V.

## Tipos de fuente de alimentación

- **AT:** estándar antiguo, ya en desuso.
- **ATX de 12 V:** la más extendida en el mercado actual. Incluye un conector auxiliar dedicado (4/8 pines) para suministrar energía directamente a la CPU. Hay varias versiones disponibles (ATX 2.x). Es la fuente más común en equipos de escritorio.
- **EPS12 V:** especificación orientada a servidores y estaciones de trabajo de alta gama. Aporta conectores adicionales para placas multiprocesador. No debe confundirse con la redundancia de fuentes (ver más abajo).

## Salidas de voltaje típicas (ATX)

| Salida | Uso principal |
|---|---|
| +3.3 V / +5 V | Circuitos digitales lógicos, memoria, periféricos de baja potencia |
| +12 V | Motores de discos duros, ventiladores, VRM de CPU/GPU, tarjetas de vídeo |
| -12 V / +5 VSB | Circuitos auxiliares y encendido por red (Wake-on-LAN) |

> 🧠 **Idea clave:** las líneas de 12 V alimentan los componentes con motores electromecánicos y las VRM de CPU/GPU; los circuitos digitales lógicos funcionan típicamente con 3.3 V o 5 V.

## Ley de Ohm y potencia

El dimensionamiento de la fuente se apoya en dos relaciones eléctricas básicas:

```text
V = I × R        P = V × I
```

| Magnitud | Símbolo | Unidad |
|---|---|---|
| Diferencia de potencial | V | voltio (V) |
| Intensidad de corriente | I | amperio (A) |
| Resistencia | R | ohmio (Ω) |
| Potencia | P | vatio (W) |

*Ejemplo ilustrativo:* un componente que consume 2 A por la línea de +12 V disipa `P = 12 × 2 = 24 W`. La potencia total de la fuente debe cubrir la suma de CPU, GPU, discos y ventiladores, con margen.

## Fuentes redundantes en servidores

Un servidor de producción puede montar **dos o más fuentes** conectadas a líneas de corriente independientes. Si una falla, las demás sostienen la carga sin apagar el equipo. Es una función de la arquitectura del servidor, no una característica del estándar EPS12V.

> [!warning] Posible error en la fuente
> `Informe2.txt` presenta «fuentes redundantes (EPS12V)» como una sola cosa. `Informe1.txt` describe EPS12V como la especificación que aporta conectores adicionales para placas multiprocesador. Se separan los conceptos: EPS12V es una especificación de alimentación; la redundancia es una arquitectura con varias fuentes en líneas independientes.

## Conectores principales

- **Conector principal de 20/24 pines:** alimenta la placa base.
- **Conector auxiliar de 4/8 pines (CPU):** alimentación dedicada al procesador (presente en ATX 12 V y EPS12 V).
- **Conectores SATA/Molex:** para discos y unidades ópticas.

## Punto de atención
- ⚠️ **Punto de atención:** verificar la potencia (vatios) total de la fuente frente al consumo de los componentes (CPU + GPU + discos) antes de armar un equipo.
- ⚠️ **No confundir:** ATX de 12 V (escritorio estándar) con EPS12 V (servidores / alta gama). Ambas tienen conector CPU auxiliar, pero EPS12 V ofrece conectores adicionales para placas multiprocesador.
- ⚠️ **No confundir:** EPS12 V (especificación de conectores) con redundancia de fuentes (dos fuentes en líneas independientes). Un servidor puede tener fuentes redundantes que no sean EPS12V y viceversa.

## Idea clave
La fuente convierte AC en DC y distribuye +3.3 V, +5 V y +12 V mediante conectores dedicados; ATX 12 V es el estándar de escritorio y EPS12 V añade conectores para placas multiprocesador. La ley de Ohm (`V = I·R`) y la potencia (`P = V·I`) permiten dimensionarla, y la redundancia de fuentes —dos unidades en líneas independientes— es una decisión de arquitectura del servidor, no del estándar.