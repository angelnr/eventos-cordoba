# Estrategia de Despliegue — Avatar Upload

## 1. Orden de despliegue

```
1. Backend  → 2. Nginx  → 3. Frontend
```

### Paso 1: Backend
```bash
docker compose build backend
docker compose up -d backend
```
**Verificar**: `curl -s http://localhost:3001/api/users/me/avatar -X POST` retorna 400 (esperado, falta auth)

### Paso 2: Nginx
```bash
docker compose build nginx
docker compose up -d nginx
```
**Verificar**: `curl -s -o /dev/null -w "%{content_type}" http://localhost/uploads/avatars/test.png` retorna `image/png`

### Paso 3: Frontend
```bash
docker compose build frontend
docker compose up -d frontend
```
**Verificar**: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/profile/edit` retorna 200

## 2. Migraciones

**No se requieren migraciones.** El campo `avatar` ya existe como `String?` en el modelo `User` de Prisma.

## 3. Rollback

### Backend
```bash
git revert HEAD --no-commit  # o checkout del commit anterior
docker compose build backend && docker compose up -d backend
```
**Efectos del rollback**:
- Los endpoints `POST/DELETE /me/avatar` dejan de existir → 404
- Las imágenes existentes en `/uploads/avatars/` quedan intactas pero huérfanas
- Los usuarios que ya subieron avatar conservan `User.avatar` en BD pero el frontend muestra fallback (iniciales) por el `onError` handler
- No hay pérdida de datos

### Frontend
```bash
git checkout HEAD~1 -- frontend/  # revertir solo frontend
docker compose build frontend && docker compose up -d frontend
```
**Efectos del rollback**:
- La sección "Foto de perfil" desaparece de `/profile/edit`
- `UserMenu` y `profile/[id]` siguen funcionando (el `onError` muestra fallback)
- `refreshUser()` sigue disponible (era nueva, pero no rompe nada si se llama)

### Nginx
```bash
git checkout HEAD~1 -- nginx/nginx.conf
docker compose build nginx && docker compose up -d nginx
```
**Efectos del rollback**:
- Los archivos en `/uploads/avatars/` se sirven con MIME type `text/plain` en vez de `image/png`
- `X-Content-Type-Options: nosniff` evita MIME sniffing, pero la imagen no se renderiza en el navegador
- **Solución temporal**: los avatares se siguen sirviendo correctamente via backend (puerto 3001)

## 4. Feature flags

No se requiere. La funcionalidad está aislada y no afecta a rutas existentes.

## 5. Monitoreo

### Logs
```bash
docker logs eventos-cordoba-backend-1 | grep "\[AVATAR\]"
```

Formato de logs:
```
[AVATAR] Upload success: userId=1, file=uuid.png, size=72
[AVATAR] Upload failed: userId=1, error=FILE_TOO_LARGE
[AVATAR] Delete success: userId=1, oldFile=uuid.png
[AVATAR] Delete skipped: userId=1, no avatar to delete
[AVATAR] Delete file error: userId=1, file=uuid.png, error=ENOENT
```

### Métricas sugeridas (futuro)
- Uploads por hora/día
- Tamaño promedio de avatar
- Tasa de error en uploads
- Archivos en `/uploads/avatars/`

### Alertas
| Alerta | Condición | Acción |
|--------|-----------|--------|
| Uploads fallando | >5% tasa error en 1h | Revisar permisos de disco, validación MIME |
| Disco lleno | >80% en partición uploads | Limpiar avatares huérfanos, aumentar storage |
| Errores 500 | Cualquier 500 en `/me/avatar` | Revisar logs, posible bug en validación |

## 6. Validación post-deploy

Ejecutar después de cada despliegue:

```bash
# 1. Verificar que el endpoint existe
curl -s -X POST http://localhost:3001/api/users/me/avatar \
  -H "Content-Type: application/json" \
  -d '{}' | grep -q "No se ha proporcionado ningún archivo" && echo "BACKEND OK"

# 2. Verificar que Nginx sirve uploads
curl -s -o /dev/null -w "%{http_code}" http://localhost/uploads/ > /dev/null && echo "NGINX OK"

# 3. Verificar que el frontend compila
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/profile/edit | grep -q 200 && echo "FRONTEND OK"

# 4. Ejecutar suite completa
bash test-avatar.sh
```

## 7. Compatibilidad con usuarios existentes

| Escenario | Comportamiento |
|-----------|---------------|
| Usuario sin avatar | Fallback a iniciales (sin cambios) |
| Usuario con avatar existente (URL externa) | `isLocalImage()` retorna false, no se elimina al reemplazar |
| Usuario se registra nuevo | `avatar: null` por defecto |
| Usuario elimina cuenta | Avatar eliminado del FS + BD |

## 8. Backfill

No se requiere backfill. Los usuarios existentes tienen `avatar: null` y verán el fallback con iniciales hasta que suban un avatar.
