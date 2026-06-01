# docs

Este directorio agrupa la **documentación técnica y diagramas** del proyecto Eventos Córdoba.

## Estructura

| Ruta | Descripción |
|------|-------------|
| `diagrams/` | Diagramas de arquitectura y diseño en formato PlantUML (`.puml`) y renderizados en SVG (`.svg`) |

## Diagramas disponibles

| Archivo | Tipo | Contenido |
|---------|------|-----------|
| `class-diagram.puml` / `.svg` | Diagrama de clases | Entidades del dominio y sus relaciones (User, Event, Booking, Ticket, etc.) |
| `backend-packages.puml` / `.svg` | Diagrama de paquetes | Estructura de módulos y capas del backend |
| `frontend-packages.puml` / `.svg` | Diagrama de paquetes | Organización de componentes y páginas del frontend |
| `global-packages.puml` / `.svg` | Diagrama de paquetes | Vista global de la arquitectura del sistema |

## Cómo visualizar

Los archivos `.svg` pueden abrirse directamente en cualquier navegador. Si deseas regenerarlos a partir de los `.puml`, puedes usar el [servidor de PlantUML](https://www.plantuml.com/plantuml/) o una extensión de editor compatible.

## Notas

- Mantén los diagramas actualizados si modificas la arquitectura de paquetes o el modelo de datos.
