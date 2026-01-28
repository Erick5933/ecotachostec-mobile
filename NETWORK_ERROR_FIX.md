## 🔧 Solución de Error: Network Error

### ❌ Error Actual
```
ERROR  Error cargando estadísticas públicas [AxiosError: Network Error]
```

### ✅ Soluciones

#### 1️⃣ **Verificar que el servidor backend esté corriendo**
```powershell
# En la terminal del backend
cd C:\Users\edwin\OneDrive\Documentos\ecotachostec-backend2\src
python manage.py runserver 0.0.0.0:8000
```

Deberías ver:
```
Starting development server at http://0.0.0.0:8000/
```

#### 2️⃣ **Verificar la dirección IP correcta**

En `src/api/axiosConfig.js`, la URL actual es:
```javascript
const API_URL = "http://192.168.100.26:8000/api";
```

Opciones según tu caso:

**Si ejecutas en Emulador Android:**
```javascript
const API_URL = "http://10.0.2.2:8000/api"; // Acceso al host desde emulador
```

**Si ejecutas en dispositivo físico (misma red):**
```javascript
const API_URL = "http://192.168.100.26:8000/api"; // Tu IP local
```

**Si ejecutas en web/localhost:**
```javascript
const API_URL = "http://127.0.0.1:8000/api";
```

#### 3️⃣ **Verificar conectividad de red**

```bash
# Abre PowerShell y ejecuta:
ping 192.168.100.26

# Deberías ver respuestas exitosas
```

#### 4️⃣ **Verificar que CORS esté configurado en Django**

En tu `settings.py` del backend, asegúrate de tener:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://192.168.100.26:8000",
    # Agregar según sea necesario
]
```

#### 5️⃣ **Si aún hay problemas, prueba con timeout más largo**

En `src/api/axiosConfig.js`:
```javascript
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000, // Aumentado de 20000 a 30000
    ...
});
```

---

### 🔍 Debugging

Si todavía falla, ejecuta esto en la terminal del proyecto mobile:

```powershell
# Verifica logs en consola
# Busca líneas que digan:
# ❌ Error de Conexión: [Network Error]
# 💡 Tip: ...
```

---

### 📋 Checklist de solución

- [ ] Backend corriendo: `python manage.py runserver 0.0.0.0:8000`
- [ ] IP correcta en `axiosConfig.js` (192.168.100.26 o 10.0.2.2)
- [ ] Firewall permite puerto 8000
- [ ] Red es la misma (misma WiFi)
- [ ] Timeout configurado correctamente

---

### ⚡ Si nada funciona

Usa **Expo CLI** para obtener tu IP local:
```powershell
# En terminal del proyecto mobile
npm start
# Verás: `exp://192.168.xxx.xxx:19000`
# Usa esa IP para conectar el backend
```
