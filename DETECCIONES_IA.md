# Sistema de Detecciones con IA - Móvil

## 📱 Componentes Creados

### 1. DeteccionesIA.jsx
Pantalla principal para análisis de residuos con IA
- Permite capturar/subir imágenes
- Muestra resultados del análisis
- Interfaz optimizada para móvil

### 2. CameraCapture.jsx
Componente modal para captura de imágenes
- Acceso a cámara nativa
- Selección desde galería
- Análisis en tiempo real con Roboflow
- Visualización de resultados

### 3. deteccionIAApi.js
API para comunicación con backend
- Función `detectWasteWithAI()` para análisis
- Manejo de respuestas y errores
- Información de categorías

## 🚀 Características

### ✅ Funcionalidades Implementadas

1. **Captura de Imágenes**
   - Cámara nativa con permisos
   - Selección desde galería
   - Preview antes de analizar

2. **Análisis con IA**
   - Clasificación automática (Orgánico/Reciclable/Inorgánico)
   - Nivel de confianza
   - Top predicciones

3. **Resultados Detallados**
   - Categoría detectada
   - Porcentaje de confianza
   - Descripción y ejemplos
   - Visualización de imagen analizada

4. **Manejo de Errores**
   - Sin detección de objetos
   - Errores de conexión
   - Sugerencias al usuario

## 📋 Navegación

```
DeteccionList (Lista principal)
    └── DeteccionesIA (Análisis con cámara/galería)
    └── DeteccionDetail (Ver detalles)
```

## 🔧 Configuración

### Permisos (app.json)
```json
{
  "android": {
    "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE"]
  },
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "...",
      "NSPhotoLibraryUsageDescription": "..."
    }
  },
  "plugins": [
    ["expo-camera", {...}],
    ["expo-image-picker", {...}]
  ]
}
```

### Dependencias Instaladas
- `expo-camera` - Acceso a cámara
- `expo-image-picker` - Selección de imágenes
- `expo-file-system` - Manejo de archivos

## 🎯 Flujo de Uso

1. Usuario abre "Detecciones"
2. Presiona botón "Analizar con IA"
3. Selecciona capturar foto o subir desde galería
4. La imagen se envía al backend (Roboflow)
5. Se muestra el resultado con categoría y confianza
6. Usuario puede guardar o hacer nuevo análisis

## 🔗 Integración con Backend

El endpoint debe estar en:
```
POST /api/detecciones/clasificar-ia/
Body: { "imagen": "data:image/jpeg;base64,..." }
```

Respuesta esperada:
```json
{
  "success": true,
  "clasificacion_principal": {
    "categoria": "organico",
    "confianza": 95.5
  },
  "top_predicciones": [...],
  "category_info": {...}
}
```

## 🎨 Estilo Visual

- **Color Principal**: Verde #10b981 (eco-friendly)
- **Íconos**: Ionicons
- **Gradientes**: LinearGradient de Expo
- **Diseño**: Material Design adaptado

## 📝 Notas Importantes

- ✅ Las detecciones se crean SOLO con IA (no hay formulario manual)
- ✅ El botón "Nueva Detección" fue eliminado
- ✅ La navegación se simplificó
- ✅ Todos los permisos están configurados
- ✅ Compatible con Android e iOS

## 🐛 Solución de Problemas

### Cámara no funciona
- Verificar permisos en configuración del dispositivo
- Reconstruir app: `npx expo start -c`

### Error de red
- Verificar IP en `.env`
- Confirmar servidor Django corriendo
- Revisar `usesCleartextTraffic: true` en Android

### Imagen no se analiza
- Verificar endpoint `/clasificar-ia/` en backend
- Revisar formato base64 de imagen
- Confirmar Roboflow configurado
