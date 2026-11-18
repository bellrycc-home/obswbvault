---
tipo: concepto
nivel: 2
tags:
  - Infraestructura
aliases:
  - ESD
  - Descarga electrostática
estado: pendiente_revision
fuentes:
  - InformeNotebook.txt
---

**Seguridad eléctrica y manejo de ESD** (Descarga Electrostática) es el conjunto de prácticas y precauciones que evitan dañar componentes electrónicos sensibles por transferencia repentina de electricidad estática entre objetos con distintos potenciales eléctricos. Es el primer prerrequisito antes de manipular cualquier hardware: sin estas precauciones, una sola descarga puede destruir silenciosamente circuitos integrados.

## Bases y prerrequisitos
- Ninguno (nota de entrada al módulo de hardware).

## Ver también / Para profundizar
- [[Fuentes_de_Alimentacion]] — siguiente paso: una vez seguro el entorno, se manipula la fuente de poder.
- Conceptos_de_Almacenamiento *(sugerencia — nota pendiente)*

## Descarga Electrostática (ESD)

La ESD es una transferencia repentina de electricidad estática entre dos objetos con distintos potenciales eléctricos. El cuerpo humano puede acumular carga sin percibirla.

- Se requieren **al menos 3000 V** de acumulación para que una persona *sienta* la descarga.
- Sin embargo, cargas mucho menores (incluso **menos de 30 V**) pueden dañar componentes electrónicos sensibles sin que el técnico lo note al tacto.
- Por eso la protección no depende de "sentir" la descarga.

## Medidas de protección

- **Pulsera antiestática:** se conecta a tierra (ground) para igualar el potencial del técnico con el del equipo. Es recomendable ponerse una al trabajar dentro de equipos.
- Trabajar sobre superficies antiestáticas y evitar alfombras o ropa sintética.
- Manipular los componentes por los bordes, evitando tocar los pines o contactos dorados.
- Mantener los componentes en bolsas antiestáticas hasta el momento de instalación.

## Punto de atención
- ⚠️ **Punto de atención:** una descarga de 30 V es suficiente para dañar un componente, aunque el umbral de percepción humana sea 3000 V. Nunca asumas que "no pasó nada" porque no sentiste descarga.
- ⚠️ **No confundir:** ESD (descarga electrostática, daño por electricidad estática) con sobretensión de la red eléctrica (daño por voltaje de línea, protegido por la fuente de poder).

## Idea clave
La seguridad eléctrica y el control de ESD son el prerrequisito absoluto de todo trabajo sobre hardware: una descarga imperceptible puede destruir componentes, por lo que la protección (pulsera, superficie antiestática, manipulación por bordes) es obligatoria antes de tocar cualquier pieza.