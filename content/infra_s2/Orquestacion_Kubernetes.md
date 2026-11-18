---
tipo: concepto
nivel: 4
tags:
  - Infraestructura
  - contenedores
aliases:
  - Kubernetes
  - K8s
  - Helm
  - Pod
  - Deployment
  - Ingress
estado: pendiente_revision
fuentes:
  - Informe1.txt
  - Informe2.txt
  - gemini-code-1794973044653.html
  - gemini-code-1794944816414.html
---

**Kubernetes (K8s)** es el orquestador de contenedores que automatiza el despliegue, el escalado y la recuperación de aplicaciones en un clúster de servidores. Cuando hay decenas o cientos de contenedores, gestionarlos a mano es inviable: Kubernetes mantiene el estado deseado, reparte la carga y sustituye los contenedores que fallan.

## Bases y prerrequisitos
- [[Contenedores_Docker]] — imagen, contenedor, volumen y ciclo de vida.
- [[Virtualizacion_e_Hipervisores]] — el clúster corre sobre VM o servidores físicos.

## Ver también / Para profundizar
- [[Despliegue_Nginx_Docker]] — el servicio que Kubernetes puede escalar.
- [[Infraestructura_Cloud_y_DevOps]] — clústeres gestionados y IaC.
- [[Mantenimiento_y_Troubleshooting]] — diagnóstico de servicios.

## Por qué hace falta un orquestador

Docker resuelve ejecutar un contenedor en un host. Kubernetes resuelve preguntas que aparecen al escalar: ¿en qué nodo se ejecuta?, ¿cuántas réplicas hay?, ¿qué pasa si una cae?, ¿cómo se reparte el tráfico?, ¿cómo se actualiza sin cortar el servicio? El orquestador declara el **estado deseado** y los controladores lo reconcilian con el estado real.

## Arquitectura del clúster

### Control Plane (nodo maestro)

| Componente | Función |
|---|---|
| **kube-apiserver** | Punto de entrada REST; valida y procesa las llamadas y comandos |
| **etcd** | Almacén distribuido clave-valor con el estado persistente del clúster |
| **kube-scheduler** | Asigna cada Pod nuevo al nodo adecuado según los recursos |
| **kube-controller-manager** | Ejecuta los controladores que acercan el estado real al deseado |

### Worker Nodes (nodos de trabajo)

| Componente | Función |
|---|---|
| **kubelet** | Agente que asegura que los contenedores de los Pods asignados estén corriendo |
| **kube-proxy** | Reglas de red y balanceo interno del nodo |
| **Runtime** | Motor de contenedores, por ejemplo `containerd` |

## Objetos fundamentales

| Objeto | Qué representa | Para qué sirve |
|---|---|---|
| **Pod** | Unidad mínima ejecutable; uno o más contenedores que comparten IP y volúmenes | Ejecutar la carga |
| **Deployment** | Controlador declarativo de réplicas y actualizaciones | Escalar, auto-reparar y hacer *rolling updates* |
| **Service** | IP interna fija y nombre DNS | Balancear tráfico hacia un conjunto dinámico de Pods |
| **Ingress** | Reglas HTTP/HTTPS de entrada | Exponer Services al exterior con rutas y TLS |

Un **Pod** es efímero: no se repara, se sustituye. El **Deployment** garantiza que siempre haya el número de réplicas deseado; el **Service** da una identidad estable a un conjunto cambiante de Pods; el **Ingress** publica ese Service hacia fuera.

## Manifiesto de Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: nginx
        image: nginx:1.27-alpine
        ports:
        - containerPort: 80
```

- `replicas: 3` declara tres Pods idénticos.
- `selector.matchLabels` conecta el Deployment con los Pods que llevan `app: webapp`.
- `template` describe el Pod: un contenedor `nginx` que escucha en el puerto 80.

*Salida esperada (razonada, no ejecutada):* el clúster crea tres Pods con la etiqueta `app: webapp` y los mantiene vivos; si uno falla, el controlador crea otro. La fuente no incluye la salida de `kubectl`, así que no se transcribe.

## Helm

**Helm** es el gestor de paquetes de Kubernetes. Empaqueta los manifiestos YAML en **Charts** parametrizables mediante `values.yaml`, de modo que un despliegue complejo se instala con un comando.

```bash
helm install mi-redis bitnami/redis
```

El ejemplo instala el chart `redis` del repositorio `bitnami` con el nombre de release `mi-redis`. La fuente no detalla los valores del chart ni los comandos de actualización, así que quedan como **pendiente**.

## Límites de esta nota

Las fuentes explican la arquitectura y los objetos, pero **no conservan una secuencia completa de `kubectl`** (crear, escalar, exponer o depurar). Tampoco detallan manifiestos de Service o Ingress. Esos comandos quedan como pendiente de verificación para una próxima fuente.

> ⚠️ **No confundir:** Pod (instancia efímera) vs Deployment (controlador que mantiene réplicas). No se escala un Pod directamente; se escala el Deployment.
>
> ⚠️ **No confundir:** Service (IP interna estable y balanceo) vs Ingress (enrutamiento HTTP/HTTPS externo). El Ingress necesita un controlador de ingress.
>
> ⚠️ **No confundir:** Kubernetes (orquestador) vs Docker (motor de contenedores). Kubernetes puede usar `containerd` u otro runtime; no es un sustituto de Docker.
>
> ⚠️ **Punto de atención:** un Pod sin Deployment no se recrea si falla; para producción se usan controladores.

## Idea clave
Kubernetes mantiene el estado deseado de un clúster: el Control Plane (apiserver, etcd, scheduler, controller-manager) decide y los Worker Nodes (kubelet, kube-proxy, runtime) ejecutan. El Pod es la unidad mínima, el Deployment gestiona réplicas y actualizaciones, el Service da una IP estable y el Ingress publica HTTP/HTTPS; Helm empaqueta todo en Charts parametrizables.
