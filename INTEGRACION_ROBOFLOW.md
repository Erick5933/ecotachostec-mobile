# Integración de Roboflow - Frontend Móvil con Backend Django

## Estado Actual ✅

El sistema de clasificación de residuos con IA está **completamente integrado** entre el frontend móvil (React Native) y el backend Django.

## Arquitectura

```
📱 React Native (Expo)
    ↓
    └─→ DeteccionesIA.jsx (pantalla principal)
        ↓
        └─→ deteccionIAApi.js (módulo de API)
            ↓
            └─→ POST /api/core/ai/detect/
                ↓
                🐍 Django Backend
                    ↓
                    └─→ views.py (ai_detect endpoint)
                        ↓
                        └─→ Roboflow Workflow API
                            ↓
                            └─→ Retorna: {success, clasificacion_principal, category_info, top_predicciones}
```

## Endpoints

### Backend Django
- **URL**: `POST /api/core/ai/detect/`
- **Ubicación**: `src/core/ai/views.py`
- **Entrada**: `{ imagen: "base64_string" }`
- **Salida**: `{ success, clasificacion_principal, category_info, top_predicciones }`

### Frontend Móvil
- **Función**: `detectWasteWithAI(imageBase64)`
- **Ubicación**: `src/api/deteccionIAApi.js`
- **Uso**: Se llama desde `DeteccionesIA.jsx` en `handleAnalyze()`

## Flujo de Datos

### 1️⃣ Captura de Imagen
```javascript
// En DeteccionesIA.jsx
const startCamera = async () => {
  // Abre la cámara
  // Usuario captura foto
  // Imagen se convierte a base64
  // Se guarda en: capturedImage = "data:image/jpeg;base64,..."
}

const pickImage = async () => {
  // Abre la galería
  // Usuario selecciona imagen
  // Imagen se convierte a base64
}
```

### 2️⃣ Análisis con IA
```javascript
// En DeteccionesIA.jsx
const handleAnalyze = async () => {
  setLoading(true);
  
  // Llama a la API
  const response = await detectWasteWithAI(capturedImage);
  
  // Maneja respuesta
  if (response.success) {
    // Mostrar resultados
  } else if (response.no_detection) {
    // Mostrar advertencia
  } else {
    // Mostrar error
  }
  
  setLoading(false);
}
```

### 3️⃣ Procesamiento en Backend
```python
# En Django views.py
@api_view(['POST'])
def ai_detect(request):
    # 1. Extrae imagen base64
    # 2. La convierte a archivo PIL
    # 3. Llama a detect_with_roboflow()
    # 4. Procesa respuesta con process_roboflow_response()
    # 5. Retorna resultado formateado
```

## Configuración Necesaria

### Variables de Entorno (.env)
```
EXPO_PUBLIC_API_URL=http://192.168.54.8:8000/api
```

### Backend Django (src/core/ai/views.py)
```python
ROBOFLOW_CONFIG = {
    'api_url': 'https://serverless.roboflow.com',
    'api_key': 'T02OsUf25gIOG7id3A9r',  # Tú proporcionas esto
    'workspace': 'frosdh',
    'workflow_id': 'find-inorganicos-reciclables-and-organicos-2'
}
```

## Estructura de Respuesta

### Caso: Éxito ✅
```json
{
  "success": true,
  "clasificacion_principal": {
    "categoria": "organico",
    "confianza": 85.5
  },
  "category_info": {
    "label": "ORGÁNICO",
    "icon": "🌱",
    "color": "#10b981",
    "description": "Residuos biodegradables..."
  },
  "top_predicciones": [
    { "categoria": "organico", "confianza": 85.5 },
    { "categoria": "reciclable", "confianza": 10.2 }
  ]
}
```

### Caso: No se detectó nada ⚠️
```json
{
  "success": false,
  "no_detection": true,
  "message": "No se detectaron objetos en la imagen",
  "suggestions": [
    "Asegúrate de que el objeto esté bien iluminado",
    "Intenta acercar más la cámara",
    "..."
  ]
}
```

### Caso: Error ❌
```json
{
  "success": false,
  "error": "Error al conectar con Roboflow",
  "suggestions": [...]
}
```

## Categorías Disponibles

| Categoría | Label | Icon | Color | Descripción |
|-----------|-------|------|-------|-------------|
| `organico` | ORGÁNICO | 🌱 | #10b981 | Residuos biodegradables |
| `reciclable` | RECICLABLE | ♻️ | #3b82f6 | Materiales reciclables |
| `inorganico` | INORGÁNICO | 🗑️ | #6b7280 | Residuos no reciclables |

## Testing

### 1. Verificar Backend
```bash
curl -X POST http://192.168.54.8:8000/api/core/ai/health/
# Respuesta: {"status": "operational", "roboflow_available": true}
```

### 2. Verificar Imagen Base64
```javascript
// En DeteccionesIA.jsx
console.log("Base64 length:", capturedImage.length);
console.log("Starts with:", capturedImage.substring(0, 50));
```

### 3. Ver Logs
- **Frontend**: Abre la consola de Expo
- **Backend**: Revisa `django logs` o `python manage.py runserver`

## Solución de Problemas

### Error: "Error en detectWasteWithAI"
**Causa**: Endpoint no encontrado o IP incorrecta
**Solución**:
1. Verifica que `EXPO_PUBLIC_API_URL` sea correcto
2. Asegúrate que Django está corriendo en `192.168.54.8:8000`
3. Verifica que el endpoint existe: `GET /api/core/ai/health/`

### Error: "No se detectaron objetos"
**Causa**: La imagen no contiene residuos claros
**Solución**:
1. Mejora la iluminación
2. Acerca más la cámara
3. Centra mejor el objeto

### Error: "Timeout"
**Causa**: Roboflow tarda más de 60 segundos
**Solución**: Aumenta el timeout en `deteccionIAApi.js` (timeout: 120000)

## Archivos Clave

### Frontend
- `src/pages/Detecciones/DeteccionesIA.jsx` - Pantalla principal
- `src/api/deteccionIAApi.js` - Módulo de API
- `src/api/axiosConfig.js` - Configuración de Axios

### Backend
- `src/core/ai/views.py` - Endpoints
- `src/core/ai/urls.py` - Rutas
- `src/core/ai/services.py` - Servicios auxiliares

## Siguientes Pasos

- [ ] Implementar guardado automático de detecciones en BD
- [ ] Agregar histórico de detecciones
- [ ] Mejorar interfaz de resultados
- [ ] Agregar predicción en tiempo real (camar en vivo)

---

**Última actualización**: Enero 27, 2026
**Estado**: ✅ Funcionando
**IP Local**: 192.168.54.8
**Puerto**: 8000
