---
tipo: procedimiento
nivel: 3
tags:
  - Infraestructura
  - sistemas-operativos
aliases:
  - Administración de sistemas operativos
  - Windows CLI
  - Linux CLI
  - iproute2
estado: pendiente_revision
fuentes:
  - Informe1.txt
  - Informe2.txt
  - gemini-code-1794944816414.html
---

La **administración de Windows y Linux** reúne las tareas de línea de comandos que un técnico necesita para elegir una edición de Windows, migrar perfiles, diagnosticar la red, gestionar permisos y programar tareas en Linux. Es la capa operativa que convierte el hardware y el direccionamiento en un sistema administrable.

## Bases y prerrequisitos
- [[Placas_Base_y_Chipsets]] — firmware, arranque y virtualización habilitada desde BIOS/UEFI.
- [[Administracion_de_Discos]] — particiones y sistemas de archivos sobre los que se instala el SO.

## Ver también / Para profundizar
- [[Redes_y_Direccionamiento_IP]] — IP, máscaras y puerta de enlace que se consultan con estos comandos.
- [[Servicios_de_Red_y_ACL]] — puertos y servicios que se inspeccionan con `ss` o `netstat`.
- [[Contenedores_Docker]] — administración del host y grupo `docker`.
- [[Seguridad_y_Hardening_TI]] — SSH, UFW y endurecimiento de servidores.

## Ediciones de Windows

| Edición | Orientación | Rasgos que la distinguen |
|---|---|---|
| **Home** | Usuarios domésticos | Controles parentales e integración con la red Xbox |
| **Pro** | Pequeñas y medianas empresas | Políticas de grupo, BitLocker, escritorio remoto y unión a dominios |
| **Enterprise** | Grandes corporaciones | Administración remota centralizada, despliegue automatizado y seguridad avanzada |
| **Education** | Ámbito académico | Basada en Enterprise, con licenciamiento por volumen |

La diferencia práctica está en las funciones de administración y seguridad, no en el núcleo del sistema: Home no permite unirse a un dominio ni usar BitLocker.

## Migración de perfiles

| Herramienta | Tipo | Uso |
|---|---|---|
| **USMT** (*User State Migration Tool*) | Línea de comandos (`scanstate`, `loadstate`) | Migración masiva y automatizada de cuentas, configuración y archivos |
| **Windows Easy Transfer** | Interfaz gráfica | Transferencia de archivos personales desde Windows 7 y 8 |
| **PCmover Express** | Interfaz gráfica | Transferencia asistida hacia Windows 10 |

## `msconfig`: tipos de inicio

`msconfig` (*Configuración del Sistema*) permite alternar entre **Inicio normal**, **Inicio con diagnóstico** (solo controladores y servicios básicos) e **Inicio selectivo**, además de gestionar servicios y opciones de arranque. Es la herramienta que la fuente describe sin nombrarla; el nombre se recupera aquí y queda marcado como tal.

## Diagnóstico de red en Windows

```powershell
# Información completa: IP, máscara, gateway, DNS, MAC y DHCP
ipconfig /all

# Liberar y renovar la concesión DHCP
ipconfig /release && ipconfig /renew

# Consultar y vaciar la caché de resolución DNS
ipconfig /displaydns
ipconfig /flushdns

# Conexiones activas, puertos en escucha y PID del proceso
netstat -ano
```

*Salida esperada (razonada, no ejecutada):* `ipconfig /all` muestra un bloque por adaptador con su dirección física y los servidores DNS; `netstat -ano` lista cada conexión con su estado y el PID que la posee. La fuente no reproduce la salida, así que no se transcribe.

## Linux: de net-tools a iproute2

En distribuciones modernas como Ubuntu Server, `net-tools` (`ifconfig`, `netstat`, `route`, `arp`) está obsoleto y se sustituye por **iproute2**.

| Tarea | net-tools (obsoleto) | iproute2 |
|---|---|---|
| Interfaces e IP | `ifconfig` | `ip addr show` (`ip a`) |
| Tabla de rutas | `route -n` | `ip route show` (`ip r`) |
| Sockets y puertos | `netstat -tuln` | `ss -tuln` |
| Tabla de vecinos (ARP) | `arp -a` | `ip neigh` (`ip n`) |

```bash
ip addr show                  # Direcciones y estado de las interfaces
ip route show                 # Tabla de enrutamiento del kernel
ss -tulpn                     # Sockets TCP/UDP, puertos y procesos
```

`ss -tulpn` es el sustituto directo de `netstat`: la `t` limita a TCP, la `u` a UDP, la `l` a sockets en escucha, la `p` muestra el proceso y la `n` evita resolver nombres.

## Permisos, propiedad y grupos

Cada archivo tiene tres permisos —lectura (`r` = 4), escritura (`w` = 2) y ejecución (`x` = 1)— aplicados a propietario (`u`), grupo (`g`) y otros (`o`).

```bash
# Modo octal: dueño rwx, grupo r-x, otros ---
chmod 750 script.sh

# Modo simbólico: lectura para todos
chmod a+r documento.txt

# Propietario y grupo (requiere sudo)
sudo chown usuario:grupo archivo.conf
sudo chown -R www-data:www-data /var/www/html

# Añadir a grupos secundarios sin quitar los actuales
sudo usermod -aG sudo,docker alumno
```

- `chmod` cambia **permisos**; `chown` cambia **propietario y grupo**.
- `usermod -aG` añade grupos sin eliminar los existentes; la `a` es la diferencia entre añadir y reemplazar.
- Los permisos de grupo se leen al iniciar sesión: tras `usermod` hay que cerrar sesión y volver a entrar (o usar `newgrp`) para aplicarlos.

## Tareas programadas con cron

`cron` ejecuta tareas periódicas definidas en `crontab -e`, con cinco campos temporales:

```text
minuto (0-59) | hora (0-23) | día del mes (1-31) | mes (1-12) | día de la semana (0-7)
```

```bash
# Respaldo diario a las 02:30
30 2 * * * /usr/local/bin/backup.sh
```

`crontab -l` lista las tareas del usuario actual. El ejemplo ejecuta el script todos los días a las 02:30.

## 32 frente a 64 bits

Un sistema de 32 bits (x86) direcciona como máximo 4 GB de RAM; uno de 64 bits (x64) puede direccionar volúmenes mucho mayores y ejecutar aplicaciones de 64 bits. La arquitectura del procesador y la edición del SO deben coincidir.

> ⚠️ **No confundir:** `chmod` (permisos) vs `chown` (propiedad). Cambiar el dueño no cambia los permisos, y viceversa.
>
> ⚠️ **No confundir:** `iproute2` (`ip`, `ss`) vs `net-tools` (`ifconfig`, `netstat`). En sistemas actuales, los primeros son los vigentes.
>
> ⚠️ **No confundir:** `usermod -aG` (añade grupos) vs `usermod -G` (reemplaza la lista de grupos). Omitir la `a` puede dejar al usuario fuera de sus grupos anteriores.
>
> ⚠️ **Punto de atención:** un sistema de 32 bits no aprovecha más de 4 GB de RAM aunque se instalen módulos mayores.

## Idea clave
Windows se elige por edición (Home, Pro, Enterprise, Education) y se administra con `ipconfig`, `netstat` y `msconfig`; Linux moderno usa iproute2 (`ip addr`, `ip route`, `ss`, `ip neigh`) en lugar de net-tools, controla el acceso con `chmod`/`chown`/`usermod -aG` y automatiza con cron. La arquitectura de 32 bits limita la RAM a 4 GB; la de 64 bits no.
