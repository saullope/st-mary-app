# Sistema de Estilos LudiGame

Este directorio contiene el sistema de estilos mejorado para la aplicación LudiGame, organizado de manera modular y escalable.

## Estructura

```
src/styles/
├── variables.css          # Variables CSS globales
├── globals.css           # Estilos globales y reset
├── components/           # Componentes CSS reutilizables
│   ├── Button.module.css
│   ├── Card.module.css
│   └── Modal.module.css
├── pages/               # Estilos específicos de páginas
│   └── Home.module.css
└── utilities/           # Clases de utilidad
    └── utilities.css
```

## Variables CSS

El archivo `variables.css` define todas las variables CSS utilizadas en la aplicación:

- **Colores**: Paleta de colores principal, secundaria y específicos de LudiGame
- **Espaciado**: Sistema de espaciado consistente
- **Tipografía**: Fuentes, tamaños y pesos
- **Bordes**: Anchos y radios de borde
- **Sombras**: Sistema de sombras
- **Breakpoints**: Puntos de quiebre responsivos
- **Z-index**: Capas de apilamiento
- **Transiciones**: Duración y easing

## Componentes

### Button.module.css
Sistema completo de botones con:
- Variantes: primary, secondary, success, danger, warning, outline, ghost
- Tamaños: small, medium, large, extra-large
- Formas: default, rounded, square, pill
- Estados: loading, disabled, hover, focus

### Card.module.css
Sistema de tarjetas con:
- Estilos base y variantes
- Tarjetas específicas para actividades y grados
- Tarjetas de juegos con animaciones
- Tarjetas de importancia con efectos especiales

### Modal.module.css
Sistema de modales con:
- Diseño de barra lateral
- Paneles izquierdo y derecho
- Resultados en grid
- Responsive design

## Utilidades

El archivo `utilities.css` proporciona clases de utilidad para:
- Display y flexbox
- Grid
- Posicionamiento
- Espaciado (margin y padding)
- Tipografía
- Colores de texto y fondo
- Bordes y sombras
- Responsive utilities

## Uso

### Importar estilos globales
```typescript
// En layout.tsx
import '../styles/globals.css';
import '../styles/utilities/utilities.css';
```

### Usar componentes CSS Modules
```typescript
import styles from './Component.module.css';

<div className={styles.componentClass}>
  Contenido
</div>
```

### Usar utilidades
```typescript
<div className="d-flex justify-center align-center p-3 bg-primary text-white">
  Contenido centrado
</div>
```

### Usar el componente Button
```typescript
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="large" loading={isLoading}>
  Enviar
</Button>
```

## Convenciones

1. **Nomenclatura**: Usar camelCase para clases CSS Modules
2. **Variables**: Usar el prefijo `--` para variables CSS
3. **Responsive**: Usar breakpoints definidos en variables
4. **Consistencia**: Usar siempre las variables definidas en lugar de valores hardcodeados

## Migración

Para migrar componentes existentes:

1. Crear archivo CSS Module en la carpeta apropiada
2. Importar variables CSS si es necesario
3. Actualizar imports en el componente
4. Cambiar nombres de clases a camelCase
5. Usar variables CSS en lugar de valores hardcodeados

## Beneficios

- **Mantenibilidad**: Código más organizado y fácil de mantener
- **Reutilización**: Componentes CSS reutilizables
- **Consistencia**: Diseño coherente en toda la aplicación
- **Performance**: CSS optimizado y sin duplicaciones
- **Escalabilidad**: Fácil agregar nuevos componentes
- **Responsive**: Mejor manejo de diferentes dispositivos
