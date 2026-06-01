# scripts

Este directorio contiene **scripts de utilidad, automatización y validación** para el despliegue y operación del sistema.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `post-deploy-check.sh` | Script de validación post-despliegue que verifica el correcto funcionamiento del sistema de avatares, autenticación y frontend |

## post-deploy-check.sh

Este script ejecuta una batería de comprobaciones automáticas tras un despliegue:

1. **Health check** del backend (`/health`)
2. **Autenticación**: login con credenciales de prueba y verificación de token
3. **Avatar endpoints**:
   - Rechazo de peticiones sin autenticación (401)
   - Rechazo de subidas sin archivo adjunto
   - Subida válida de imagen PNG generada inline
   - Verificación de acceso público a través de Nginx
   - Verificación de `Content-Type` correcto
   - Eliminación de avatar y confirmación de estado nulo
4. **Verificación JWT**: endpoint `/auth/verify` con retorno de datos de usuario
5. **Frontend**: accesibilidad de la ruta `/profile/edit`

Al finalizar, muestra un resumen con el número de pruebas pasadas y fallidas, y devuelve un código de salida igual al número de errores (útil para CI/CD).

## Uso

```bash
# Validación contra entorno local
bash scripts/post-deploy-check.sh http://localhost:3001

# Validación contra producción
bash scripts/post-deploy-check.sh https://eventoscordoba.xyz
```

## Notas

- Requiere `curl` y `python3` disponibles en el entorno de ejecución.
- Genera un archivo PNG temporal en `/tmp/deploy-test.png` que se elimina al finalizar.
