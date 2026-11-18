---
tipo: procedimiento
nivel: 4
tags:
  - Infraestructura
  - seguridad
aliases:
  - Hardening
  - Bastionado
  - Ciberseguridad
  - Zero Trust
  - BitLocker
  - UFW
  - Fail2ban
estado: pendiente_revision
fuentes:
  - Informe1.txt
  - Informe2.txt
  - gemini-code-1794944816414.html
  - gemini-code-1794973044653.html
---

La **seguridad y el hardening de TI** reúnen las prácticas para reducir la superficie de ataque de servidores y equipos: proteger la tríada **CID**, reconocer amenazas y aplicar cifrado, cortafuegos, autenticación por claves y mínimo privilegio. No es un producto que se instala, sino un conjunto de decisiones que se verifican.

## Bases y prerrequisitos
- [[Administracion_Windows_y_Linux]] — permisos, SSH, usuarios y grupos.
- [[Redes_y_Direccionamiento_IP]] — puertos y direcciones que se filtran.
- [[Servicios_de_Red_y_ACL]] — ACL y servicios expuestos.

## Ver también / Para profundizar
- [[Infraestructura_Cloud_y_DevOps]] — responsabilidad compartida en la nube.
- [[Mantenimiento_y_Troubleshooting]] — diagnóstico tras un incidente.
- [[Placas_Base_y_Chipsets]] — Secure Boot y firmware.

## Tríada CID y superficie de ataque

La seguridad persigue tres propiedades:

| Propiedad | Qué protege | Ejemplo de fallo |
|---|---|---|
| **Confidencialidad** | Que solo quien debe acceda a la información | Credenciales filtradas |
| **Integridad** | Que los datos no se alteren sin detectarse | Modificación silenciosa de un binario |
| **Disponibilidad** | Que el servicio siga operativo | Ataque DDoS o ransomware |

**Hardening** (*bastionado*) es reducir la superficie de ataque: eliminar software y servicios innecesarios, aplicar parches, cerrar puertos, cifrar volúmenes y limitar privilegios. Cuanto menos expuesto, menos que defender.

## Amenazas: malware, red e ingeniería social

| Categoría | Ejemplos | Rasgo |
|---|---|---|
| **Malware** | Ransomware, troyanos, rootkits | Cifra datos, se oculta o abre acceso persistente |
| **Ataques de red** | DDoS, Man-in-the-Middle (MitM), suplantación DNS | Interrumpen, interceptan o desvían el tráfico |
| **Ingeniería social** | Phishing, spear phishing, baiting, pretexting, dumpster diving, impersonation | Manipulan a la persona, no a la máquina |

- **Phishing** envía señuelos masivos y genéricos; **spear phishing** investiga antes a una víctima concreta para personalizar el ataque.
- **Baiting** deja un señuelo físico (por ejemplo, una memoria USB infectada) apelando a la curiosidad.
- **Pretexting** inventa un escenario verosímil (soporte técnico, auditoría) para obtener credenciales.
- **Dumpster diving** busca documentos o contraseñas en la basura; **impersonation** suplanta una identidad física.
- **MitM** intercepta o altera comunicaciones que las partes creen directas (ARP spoofing, Wi-Fi falso).

> ⚠️ **No confundir:** phishing (masivo y genérico) vs spear phishing (personalizado tras investigar a la víctima).

## Normativas y evidencia

- **PII** (*Personally Identifiable Information*): datos que permiten identificar a una persona; su protección es obligatoria.
- **PCI-DSS**: estándar de seguridad para la industria de tarjetas de pago.
- **Informática forense**: preservación de la **cadena de custodia** para que la evidencia digital sea válida legalmente. Alterar el ordenador antes de documentarlo puede invalidarla.

## Cifrado y arranque seguro en Windows

- **TPM** (*Trusted Platform Module*): microcontrolador criptográfico de la placa base que guarda claves, certificados y medidas de integridad del hardware.
- **Secure Boot** (UEFI): verifica la firma del gestor de arranque y del kernel antes de cargarlos; bloquea *bootkits* y rootkits de bajo nivel.
- **BitLocker**: cifra volúmenes completos del sistema. Requiere TPM para validar que el hardware no se manipuló antes de liberar la clave.
- **BitLocker To Go**: cifra unidades extraíbles (USB, discos externos) sin TPM; la clave se protege con contraseña o tarjeta inteligente para que la unidad funcione en otros equipos.

## Bastionado de SSH en Linux

```bash
# 1. Cortafuegos UFW: denegar entrada, permitir salida y abrir solo lo necesario
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw enable

# 2. Endurecer /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no

# 3. Fail2ban: bloquear IP tras intentos fallidos
sudo apt install fail2ban -y
```

- `PermitRootLogin no` impide el acceso directo como `root`; se entra con un usuario y se escala con `sudo`.
- `PasswordAuthentication no` obliga a usar llaves criptográficas (Ed25519 o RSA 4096), no contraseñas.
- **Fail2ban** lee `/var/log/auth.log` y aplica reglas dinámicas en UFW/iptables a las IP que superan el umbral de intentos fallidos.

*Salida esperada (razonada, no ejecutada):* tras `ufw enable`, el cortafuegos queda activo y solo el puerto 22 acepta conexiones entrantes; `fail2ban` añade reglas temporales para las IP bloqueadas. La fuente no reproduce la salida.

## Zero Trust y defensa en profundidad

**Zero Trust** parte de no confiar implícitamente en nada por estar dentro de la red local: cada identidad, dispositivo y sesión se verifica. Se combina con **mínimo privilegio** (solo los permisos necesarios) y **defensa en profundidad** (varias capas: segmentación, ACL, cifrado, parches, monitorización).

- Segmentar la red con VLAN y filtrar con ACL reduce el movimiento lateral.
- Cifrar en reposo (BitLocker, LUKS) protege el dato si se roba el disco.
- Deshabilitar servicios y puertos innecesarios reduce la superficie de ataque.

> ⚠️ **No confundir:** IDS (pasivo, analiza copias y alerta) vs IPS (en línea, bloquea y descarta paquetes en tiempo real).
>
> ⚠️ **No confundir:** BitLocker (volúmenes fijos con TPM) vs BitLocker To Go (extraíbles con contraseña, sin TPM).
>
> ⚠️ **Punto de atención:** desactivar la autenticación por contraseña sin haber instalado antes la clave pública deja el servidor inaccesible por SSH.

## Idea clave
La seguridad protege confidencialidad, integridad y disponibilidad reduciendo la superficie de ataque: reconocer malware, ataques de red e ingeniería social; cifrar con BitLocker/TPM y Secure Boot; bastionar SSH con claves, UFW y Fail2ban; y aplicar Zero Trust con mínimo privilegio. El IDS alerta y el IPS bloquea; la evidencia forense exige cadena de custodia.
