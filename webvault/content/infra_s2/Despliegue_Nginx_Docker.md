---
tipo: procedimiento
nivel: 3
tags:
  - Infraestructura
aliases:
  - Docker Compose
  - Nginx contenerizado
  - Despliegue web
estado: pendiente_revision
fuentes:
  - InformeNotebook.txt
  - gemini-code-1794944816414.html
---

**Despliegue de servicios con Nginx y Docker Compose** es el procedimiento para contenerizar y servir una aplicación web (HTML estático) usando Nginx sobre Docker en Ubuntu 22.04. Permite aislar aplicaciones y desplegar infraestructura web rápidamente.

## Bases y prerrequisitos
- [[Redes_y_Direccionamiento_IP]] — conceptos de puertos y redes (el contenedor mapea puertos host:contenedor).
- [[Administracion_Windows_y_Linux]] — permisos Linux, grupo `docker` y cron.
- Conceptos básicos de Linux (CLI) *(sugerencia — nota pendiente)*

## Ver también / Para profundizar
- [[Enrutamiento_Estatico_Cisco]] — redes y conectividad.
- [[Redes_y_Direccionamiento_IP]] — direccionamiento y puertos.
- [[Administracion_Windows_y_Linux]] — `chmod`, `chown`, `usermod -aG` y `crontab`.
- [[Contenedores_Docker]] — imagen, contenedor, volumen y `docker compose`.

## Estructura del proyecto

```
nginx-html-docker/
├── docker-compose.yml
├── nginx/
│   └── default.conf
└── html/
    └── index.html
```

## Paso 1 — Crear el archivo HTML (`html/index.html`)

```html
<!DOCTYPE html>
<html>
<head>
<title>Mi página Dockerizada</title>
</head>
<body>
<h1>¡Hola desde Nginx en Docker FASC 2025!</h1>
</body>
</html>
```

## Paso 2 — Configuración de Nginx (`nginx/default.conf`)

```nginx
server {
    listen 80;
    server_name localhost;
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
```

Configura el servidor para escuchar en el puerto 80 interno y servir archivos estáticos desde `/usr/share/nginx/html`.

## Paso 3 — Definición del servicio (`docker-compose.yml`)

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:latest
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
```

- Vincula el puerto del host **8080** al puerto interno **80** del contenedor.
- Monta volúmenes en modo solo lectura (`:ro`): HTML y configuración de Nginx.
- `restart: unless-stopped` reinicia el contenedor si falla o si el host se reinicia, salvo que se haya detenido a propósito.

## Paso 4 — Construcción y ejecución

```bash
cd nginx-html-docker
sudo docker-compose up -d
```

- La opción `-d` (detached) ejecuta el contenedor en segundo plano.
- **Docker Compose v1 frente a v2:** `docker-compose` es el binario clásico (v1); `docker compose` (con espacio) es el plugin integrado en Docker современo (v2). La sintaxis del archivo es la misma, pero los comandos cambian de forma. En instalaciones actuales se usa `docker compose up -d`.

### Validación

- Acceder en el navegador a `http://localhost:8080`.
- Comprobar estado con `docker ps`.
- Ver registros con `docker-compose logs nginx` o, en v2, `docker compose logs -f nginx` (la `-f` sigue la salida en tiempo real).

### Limpieza

```bash
sudo docker-compose down
```

Detiene y elimina los contenedores creados.

## Gestión de tareas programadas (Cron)

- **Cron** (Linux/macOS): servicio en segundo plano que ejecuta tareas automáticas en fechas y horas específicas (mantenimiento, respaldos).
- `crontab -e`: edita las tareas cron del usuario actual.
- `crontab -l`: lista las tareas programadas configuradas.

La sintaxis de los cinco campos y un ejemplo de respaldo diario están en [[Administracion_Windows_y_Linux#Tareas programadas con cron]].

## Estados de energía ACPI

| Estado | Descripción |
|---|---|
| S0 | Equipo encendido, CPU en funcionamiento pleno |
| S1 | CPU y RAM con energía; dispositivos no usados apagados |
| S2 | CPU apagada; RAM actualizada |
| S3 | Suspensión ("Guardar en RAM"), frecuencia de RAM reducida |
| S4 | Hibernación ("Guardar en disco"), contenido de RAM escrito en disco |
| S5 | Equipo completamente apagado |

## Comandos Linux de permisos

- `sudo chmod a+r /etc/apt/keyrings/docker.asc`: añade permiso de lectura a todos los usuarios sobre la clave GPG de Docker, permitiendo que `apt` la lea para autenticar paquetes.
- `chmod`: cambia permisos de archivos (lectura/escritura/ejecución).
- `chown`: cambia el propietario del archivo.

El modo octal, el simbólico y `usermod -aG` se explican en [[Administracion_Windows_y_Linux#Permisos, propiedad y grupos]].

## Punto de atención
- ⚠️ **Punto de atención:** tras añadir el usuario al grupo `docker` (`sudo usermod -aG docker ${USER}`), es necesario cerrar sesión (`logout`) e iniciarla de nuevo para que se actualicen los privilegios.
- ⚠️ **No confundir:** Docker (contenedores) vs hipervisores Tipo 1/2 (máquinas virtuales completas). Docker comparte el kernel del host; las VMs virtualizan hardware completo.
- ⚠️ **Punto de atención:** los volúmenes en modo `:ro` son de solo lectura; cambios en el host se reflejan en el contenedor, pero no al revés.

## Idea clave
Docker Compose permite desplegar Nginx contenerizado vinculando el puerto del host 8080 al puerto 80 del contenedor y montando volúmenes de HTML y configuración en modo solo lectura, con validación mediante `docker ps` y `curl localhost:8080`.