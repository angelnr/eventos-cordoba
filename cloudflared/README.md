# cloudflared

Este directorio contiene la configuración del **túnel de Cloudflare** (Cloudflare Tunnel) para exponer la aplicación a Internet de forma segura sin necesidad de abrir puertos públicos en el servidor.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `config.yml` | Configuración del túnel: hostname público y servicio interno de destino |
| `Dockerfile` | Imagen de Cloudflared para ejecutar como servicio Docker |

## Configuración

El archivo `config.yml` define:
- El identificador del túnel (`my-tunnel`)
- La ruta al archivo de credenciales (`credentials.json`) montado como volumen
- Una regla de ingress que redirige el tráfico del dominio `eventoscordoba.xyz` al servicio interno `nginx:80`
- Respuesta `HTTP 404` para solicitudes sin hostname coincidente

## Integración en Docker Compose

Cloudflared se ejecuta como un servicio más dentro del stack de Docker Compose. Recibe tráfico público de Cloudflare y lo reenvía al contenedor `nginx` dentro de la red interna del compose.

## Notas de seguridad

- No expone puertos locales directamente; todo el tráfico entra cifrado por la red de Cloudflare.
- El archivo `credentials.json` **no debe versionarse**; se monta como secreto en el despliegue.
