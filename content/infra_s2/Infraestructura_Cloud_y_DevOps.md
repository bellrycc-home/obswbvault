---
tipo: concepto
nivel: 4
tags:
  - Infraestructura
  - cloud
  - devops
aliases:
  - Cloud
  - IaaS
  - PaaS
  - SaaS
  - Terraform
  - Ansible
  - SDN
  - IaC
estado: pendiente_revision
fuentes:
  - Informe1.txt
  - Informe2.txt
  - gemini-code-1794973044653.html
---

La **infraestructura cloud y DevOps** es el modelo en el que los recursos (servidores, red y almacenamiento) se aprovisionan como servicio y se definen mediante código versionable (**IaC**). Incluye los modelos IaaS/PaaS/SaaS, la responsabilidad compartida, las herramientas Terraform y Ansible y las redes definidas por software (**SDN**). Es la capa que convierte la infraestructura en algo reproducible y elástico.

## Bases y prerrequisitos
- [[Virtualizacion_e_Hipervisores]] — las VM son la unidad que ofrece IaaS.
- [[Contenedores_Docker]] — PaaS y los despliegues modernos se apoyan en contenedores.
- [[Orquestacion_Kubernetes]] — orquestación declarativa en el clúster.

## Ver también / Para profundizar
- [[Seguridad_y_Hardening_TI]] — responsabilidad del cliente y hardening en la nube.
- [[Despliegue_Nginx_Docker]] — ejemplo concreto de servicio desplegado.
- [[Mantenimiento_y_Troubleshooting]] — operación del servicio.

## Modelos de servicio y responsabilidad compartida

| Modelo | Gestiona el proveedor | Gestiona el cliente | Ejemplos |
|---|---|---|---|
| **IaaS** (*Infrastructure as a Service*) | Hardware, red física, almacenamiento e hipervisor | SO, parches, middleware, runtime, datos y aplicaciones | AWS EC2, Google Compute Engine, Azure VMs |
| **PaaS** (*Platform as a Service*) | Todo lo anterior más el SO, el runtime y el escalado base | Solo el código de la aplicación y sus datos | Heroku, Google App Engine, Azure App Service |
| **SaaS** (*Software as a Service*) | La pila completa hasta la aplicación final | Configuración de usuario, permisos y datos introducidos | Microsoft 365, Google Workspace, Salesforce |

La **responsabilidad compartida** no desaparece al subir de modelo: cambia de manos. En IaaS el cliente sigue parcheando el sistema operativo; en PaaS lo delega; en SaaS solo responde de sus datos y accesos.

> 🧠 **Idea clave:** a más servicio (de IaaS a SaaS), menos administración para el cliente y menos control sobre la plataforma.

## Infraestructura como Código (IaC)

La IaC sustituye la configuración manual por archivos de definición ejecutables y versionables en Git. Aporta reproducibilidad, auditoría y capacidad de repetir un entorno sin deriva de configuración.

| Criterio | Terraform (HashiCorp) | Ansible (Red Hat) |
|---|---|---|
| Rol en DevOps | Aprovisionamiento del **Día 0**: crear infraestructura | Gestión de configuración del **Día 1 y 2**: instalar, parchear, desplegar |
| Lenguaje | Declarativo, **HCL** | Procedimental por tareas, **YAML** (*playbooks*) |
| Estado | **Con estado** (`terraform.tfstate`) | **Sin estado**: idempotencia sobre el host |
| Actualización | Infraestructura **inmutable**: destruye y reemplaza | Infraestructura **mutable**: modifica in situ |
| Conexión | APIs de los proveedores cloud (AWS, Azure, GCP) | SSH (Linux) o WinRM (Windows), sin agente |
| Enfoque | Crear redes, VM, clústeres | Configurar el software dentro de esos recursos |

En producción suelen usarse juntos: Terraform crea la infraestructura y Ansible configura lo que corre dentro.

```bash
terraform init      # Descarga providers y prepara el directorio
terraform plan      # Muestra qué se crea, modifica o destruye
terraform apply     # Aplica los cambios aprobados
```

*Salida esperada (razonada, no ejecutada):* `terraform plan` lista los recursos que se añadirán, cambiarán o destruirán y pide confirmación antes de `apply`. La fuente no reproduce la salida, así que no se transcribe.

## Redes definidas por software (SDN)

Una red tradicional tiene el **plano de control** (decidir la ruta) y el **plano de datos** (reenviar el paquete) dentro del mismo dispositivo. **SDN** los separa: un controlador central calcula las rutas y programa los dispositivos, que solo reenvían.

| Capa SDN | Función |
|---|---|
| **Aplicación** | Programas que piden políticas de red (seguridad, QoS, balanceo) |
| **Control centralizado** | Controlador que traduce esas políticas en reglas para los dispositivos |
| **Infraestructura física** | Switches y routers que ejecutan el reenvío |

La ventaja es programabilidad y visión global; el riesgo, que el controlador se convierta en un punto crítico que hay que redundar.

> ⚠️ **No confundir:** IaaS (el cliente administra el SO) vs PaaS (el proveedor lo administra) vs SaaS (el proveedor administra todo).
>
> ⚠️ **No confundir:** Terraform (aprovisiona infraestructura, con estado) vs Ansible (configura servidores existentes, sin estado). Se complementan.
>
> ⚠️ **No confundir:** IaC (definir infraestructura en código) vs SDN (separar control y datos en la red). Son capas distintas.
>
> ⚠️ **Punto de atención:** `terraform.tfstate` contiene el mapeo de recursos reales; si se pierde o se edita a mano, el plan deja de ser fiable.

## Idea clave
La nube reparte responsabilidades según el modelo (IaaS: el cliente administra el SO; PaaS: solo el código; SaaS: solo el uso). DevOps la hace reproducible con IaC: Terraform aprovisiona de forma declarativa con estado y Ansible configura de forma idempotente sin agente. SDN separa el plano de control del de datos para programar la red desde un controlador central.
