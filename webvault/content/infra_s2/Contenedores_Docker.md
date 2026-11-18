---
tipo: procedimiento
nivel: 4
tags:
  - Infraestructura
  - contenedores
aliases:
  - Docker
  - Contenedor
  - Docker Compose
  - Namespaces
  - cgroups
estado: pendiente_revision
fuentes:
  - Informe1.txt
  - Informe2.txt
  - gemini-code-1794944816414.html
---

**Docker** es la plataforma de contenedores que empaqueta una aplicación y sus dependencias en una **imagen** reproducible y la ejecuta como **contenedor** aislado. A diferencia de una máquina virtual, el contenedor comparte el kernel del sistema anfitrión, por lo que arranca en milisegundos y consume menos recursos. Es la unidad de despliegue de los servicios modernos.

## Bases y prerrequisitos
- [[Virtualizacion_e_Hipervisores]] — contraste con la VM y noción de aislamiento.
- [[Administracion_Windows_y_Linux]] — permisos, `usermod -aG` y administración del host.

## Ver también / Para profundizar
- [[Despliegue_Nginx_Docker]] — caso práctico completo con Nginx y volúmenes.
- [[Orquestacion_Kubernetes]] — qué ocurre cuando hay cientos de contenedores.
- [[Infraestructura_Cloud_y_DevOps]] — imágenes en registros y despliegue continuo.

## Imagen, contenedor y volumen

| Concepto | Qué es | Analogía |
|---|---|---|
| **Imagen** | Plantilla inmutable con el sistema de archivos y la configuración de la aplicación | Receta o molde |
| **Contenedor** | Instancia en ejecución de una imagen, con una capa superior de lectura/escritura efímera | Plato servido a partir del molde |
| **Volumen** | Almacenamiento persistente que sobrevive a la eliminación del contenedor | Disco externo |
| **Bind mount** | Directorio del host montado dentro del contenedor | Carpeta compartida |

La capa de escritura del contenedor es **efímera**: si se elimina, se pierde. Los datos que deben persistir van a un **volumen** o a un **bind mount**.

## Aislamiento: namespaces y cgroups

Docker no virtualiza hardware; aísla procesos con dos mecanismos del kernel Linux:

- **Namespaces**: separan lo que un proceso *ve* (PID, red, montajes, hostname, usuarios). Cada contenedor cree tener su propio sistema.
- **cgroups** (*control groups*): limitan y contabilizan lo que un proceso *consume* (CPU, memoria, I/O). Impiden que un contenedor sature el host.

> 🧠 **Idea clave:** *namespaces* = aislamiento de visibilidad; *cgroups* = límites de recursos. Juntos permiten ejecutar procesos aislados sin un kernel propio.

## Instalación y grupo `docker`

El demonio `dockerd` corre como `root`. Para usar Docker sin `sudo`, se añade el usuario al grupo secundario:

```bash
sudo usermod -aG docker $USER
```

Después hay que **cerrar sesión y volver a entrar** (o usar `newgrp docker`) para que el grupo se aplique. El cambio no afecta a la sesión ya abierta.

## Ciclo de vida de un contenedor

```bash
# Levantar servicios en segundo plano (detached)
docker compose up -d

# Ver contenedores activos y el mapeo de puertos
docker ps

# Inspeccionar registros en tiempo real
docker logs -f servidor_web

# Detener y eliminar contenedores y redes
docker compose down
```

- `up -d` crea y arranca los servicios sin bloquear la terminal.
- `ps` muestra los contenedores en ejecución, su imagen, estado y puertos publicados.
- `logs -f` sigue la salida del contenedor hasta que se interrumpe.
- `down` detiene y elimina los contenedores y la red creada por Compose.

*Salida esperada (razonada, no ejecutada):* `docker ps` lista una fila por contenedor con `CONTAINER ID`, `IMAGE`, `STATUS`, `PORTS` y `NAMES`. La fuente no reproduce la salida, así que no se transcribe.

## Docker Compose

**Docker Compose** define aplicaciones multicontenedor, redes internas y volúmenes en un archivo declarativo `docker-compose.yml`.

```yaml
services:
  web:
    image: nginx:alpine
    container_name: servidor_web
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
```

- `image` elige la imagen base; `container_name` fija el nombre del contenedor.
- `restart: unless-stopped` lo reinicia si falla o si el host se reinicia, salvo parada manual.
- `"8080:80"` publica el puerto **8080 del host** hacia el **80 del contenedor** (`HOST:CONTENEDOR`).
- `:ro` monta el volumen en solo lectura.

**Docker Compose v1 frente a v2:** el binario clásico es `docker-compose` (v1); el plugin integrado es `docker compose` (v2, con espacio). El archivo es el mismo, pero cambian los comandos. En instalaciones actuales se usa `docker compose`.

El desarrollo aplicado a un servicio web está en [[Despliegue_Nginx_Docker]].

> ⚠️ **No confundir:** imagen (plantilla inmutable) vs contenedor (instancia en ejecución). Se pueden lanzar varios contenedores de la misma imagen.
>
> ⚠️ **No confundir:** contenedor (comparte el kernel del host, arranque en milisegundos, MB de RAM) vs máquina virtual (hardware virtualizado, SO completo, GB de RAM). Ver [[Virtualizacion_e_Hipervisores]].
>
> ⚠️ **Punto de atención:** en `"8080:80"` el orden es host:contenedor. Invertirlo publica el servicio en un puerto inesperado.
>
> ⚠️ **Punto de atención:** la capa de escritura del contenedor es efímera; sin volumen, los datos desaparecen al recrearlo.

## Idea clave
Docker empaqueta la aplicación en una imagen inmutable y la ejecuta en contenedores aislados mediante namespaces y cgroups, compartiendo el kernel del host. Los datos persistentes van a volúmenes; Compose declara los servicios y sus puertos (`HOST:CONTENEDOR`), y el grupo `docker` evita `sudo` tras reiniciar la sesión.
