# Guía de Diseño UI para Alias

## Paleta de Colores

### Colores Principales
- **Naranja (Primary)**: #FF5722
  - Light: #FF8A65
  - Dark: #E64A19
- **Negro (Secondary)**: #212121
  - Light: #484848
  - Dark: #000000
- **Blanco (Background)**: #FFFFFF
  - Paper: #F5F5F5

### Colores de Estado
- **Éxito**: #4CAF50
- **Advertencia**: #FFC107
- **Error**: #F44336
- **Información**: #2196F3

## Tipografía

- **Familia principal**: Poppins
- **Familia secundaria**: Roboto, Helvetica, Arial, sans-serif

### Jerarquía de Texto
- **H1**: 2.5rem, 700 (bold)
- **H2**: 2rem, 600 (semibold)
- **H3**: 1.75rem, 600 (semibold)
- **H4**: 1.5rem, 600 (semibold)
- **H5**: 1.25rem, 500 (medium)
- **H6**: 1rem, 500 (medium)
- **Subtitle1**: 1rem, 400 (regular)
- **Subtitle2**: 0.875rem, 400 (regular)
- **Body1**: 1rem, 400 (regular)
- **Body2**: 0.875rem, 400 (regular)
- **Button**: 0.875rem, 500 (medium), sin transformación de texto

## Componentes

### Botones
- **Bordes redondeados**: 8px
- **Sin sombras** por defecto, sombras al hover
- **Padding vertical**: 8px (default), 12px (large)
- **Sin transformación de texto** (no mayúsculas)

### Tarjetas
- **Bordes redondeados**: 12px
- **Sombra**: 0px 4px 20px rgba(0, 0, 0, 0.05)
- **Padding**: 16px - 24px

### Inputs
- **Bordes redondeados**: 8px
- **Con iconos** para mejorar la usabilidad
- **Estados claros** (error, disabled, focused)

### Tablas
- **Encabezados** con fondo ligeramente diferenciado
- **Filas alternadas** para mejor legibilidad
- **Acciones** en la última columna

## Principios de Diseño

### Consistencia
- Mantener la misma apariencia y comportamiento en toda la aplicación
- Usar los mismos patrones de interacción para acciones similares

### Jerarquía Visual
- Usar tamaños, pesos y colores para establecer jerarquía
- Elementos más importantes deben destacar visualmente

### Espaciado
- Usar espaciado consistente (múltiplos de 8px)
- Agrupar elementos relacionados
- Separar secciones distintas

### Feedback
- Proporcionar feedback visual para todas las acciones
- Usar animaciones sutiles para transiciones
- Mostrar estados de carga cuando sea necesario

## Componentes Específicos

### Dashboard
- **Tarjetas de estadísticas**: Destacar métricas clave con iconos y colores
- **Gráficos**: Usar colores consistentes y etiquetas claras
- **Tablas de datos**: Mostrar información condensada con acciones rápidas

### Punto de Venta (POS)
- **Diseño de dos paneles**: Productos a la izquierda, carrito a la derecha
- **Tarjetas de productos**: Imagen destacada, nombre y precio visible
- **Carrito**: Lista clara de productos con acciones de cantidad
- **Proceso de pago**: Flujo simple con opciones claras

### Formularios
- **Validación en tiempo real**: Mostrar errores mientras el usuario escribe
- **Agrupación lógica**: Agrupar campos relacionados
- **Acciones claras**: Botones con etiquetas descriptivas

## Responsive Design

### Breakpoints
- **xs**: < 600px (móviles)
- **sm**: 600px - 960px (tablets verticales)
- **md**: 960px - 1280px (tablets horizontales, laptops pequeñas)
- **lg**: 1280px - 1920px (laptops, desktops)
- **xl**: > 1920px (pantallas grandes)

### Consideraciones Móviles
- Menú colapsable
- Diseño de una columna para formularios
- Botones más grandes para interacción táctil
- Priorizar contenido esencial