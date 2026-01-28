# 📱 GUÍA COMPLETA - Ejecutar EcoTachosTec Mobile en Expo Go

## ✅ Estado Actual

**¡TODO ESTÁ LISTO! ✨** 

El Dashboard Mobile ha sido actualizado y está funcionando con las mismas características que la versión web.

---

## 🎯 Pasos para Ejecutar

### 1️⃣ El servidor Expo YA ESTÁ CORRIENDO

Tu terminal muestra:

```
› Metro waiting on exp://192.168.100.26:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 2️⃣ Instala Expo Go en tu celular

**📱 Android:**
- Abre Google Play Store
- Busca "Expo Go"
- Instala la aplicación
- [Link directo](https://play.google.com/store/apps/details?id=host.exp.exponent)

**🍎 iOS:**
- Abre App Store
- Busca "Expo Go"
- Instala la aplicación
- [Link directo](https://apps.apple.com/app/expo-go/id982107779)

### 3️⃣ Conecta tu celular

**IMPORTANTE:** Tu celular debe estar en la **misma red WiFi** que tu computadora.

### 4️⃣ Escanea el código QR

**En Android:**
1. Abre la app Expo Go
2. Toca "Scan QR Code"
3. Escanea el código QR que aparece en tu terminal

**En iOS:**
1. Abre la app de Cámara del iPhone
2. Apunta a el código QR en tu terminal
3. Toca la notificación que aparece
4. Se abrirá en Expo Go

**O también puedes:**
- En Expo Go, busca el proyecto "ecotachostec-mobile" en la lista de proyectos locales

### 5️⃣ La app se cargará automáticamente

Verás:
1. Pantalla de carga
2. Pantalla de Login (si no has iniciado sesión)
3. **¡El nuevo Dashboard mejorado!** 🎉

---

## 🎨 Características del Nuevo Dashboard

### ✨ Tarjetas de Estadísticas
- **Tachos Activos** (verde) - Con tendencia del 12%
- **Detecciones IA** (azul) - Con tendencia del 28%
- **Usuarios Registrados** (morado) - Con tendencia del 5%
- **Ubicaciones** (naranja) - Con tendencia del 3%

### 📊 Actividad Reciente
- Lista de las últimas 5 detecciones
- Muestra nombre de la detección
- Tacho asociado
- Hora de detección
- Porcentaje de confianza

### ⚡ Acciones Rápidas
Botones grandes para acceso rápido a:
- Nuevo Tacho
- Nuevo Usuario
- Nueva Ubicación
- Ver Reportes

### 🔍 Estado del Sistema
Monitoreo en tiempo real de:
- API Backend (🟢 Conectado)
- Base de Datos (🟢 Operativa)
- Servicios IoT (🟢 X activos)
- IA/ML Engine (🟢 Funcionando)

### 🔄 Funciones Interactivas
- **Pull to Refresh:** Arrastra hacia abajo para actualizar
- **Botón Actualizar:** En el header para refrescar manualmente
- **Animaciones suaves:** Transiciones elegantes
- **Diseño responsive:** Se adapta a todos los tamaños de pantalla

---

## 🛠️ Comandos Útiles en la Terminal

Una vez que Expo esté corriendo, puedes usar estos atajos:

```
r - Recargar la aplicación
m - Abrir menú de desarrollo
j - Abrir debugger
a - Abrir en emulador Android (si lo tienes)
? - Mostrar todos los comandos

Ctrl+C - Detener Expo
```

---

## 📊 Conexión al Backend

La app está configurada para conectarse a:

```
http://192.168.100.26:8000/api
```

### ✅ Verifica que tu backend Django esté corriendo:

```powershell
# En otra terminal (NO cierres la de Expo)
cd [ruta-a-tu-backend-django]
python manage.py runserver 0.0.0.0:8000
```

### 🔧 Si necesitas cambiar la IP del backend:

1. Detén Expo (Ctrl+C)
2. Edita el archivo `.env`:
   ```
   EXPO_PUBLIC_API_URL=http://TU_NUEVA_IP:8000/api
   ```
3. Reinicia Expo:
   ```powershell
   npm start
   ```

---

## 🐛 Solución de Problemas

### ❌ No aparece el código QR
```powershell
# Reinicia Expo con caché limpio
expo start --clear
```

### ❌ "Network Error" en la app
- ✅ Verifica que el backend Django esté corriendo
- ✅ Confirma que tu celular y PC estén en la misma WiFi
- ✅ Prueba hacer ping desde tu celular a la IP de tu PC
- ✅ Desactiva temporalmente el firewall de Windows

### ❌ "Unable to connect"
- ✅ Cierra y vuelve a abrir Expo Go
- ✅ Escanea el QR de nuevo
- ✅ Presiona `r` en la terminal para recargar

### ❌ No aparecen los datos en el dashboard
- ✅ Verifica que tu backend tenga datos de prueba
- ✅ Toca el botón "Actualizar" en el dashboard
- ✅ Usa "Pull to Refresh" arrastrando hacia abajo

### ❌ Advertencia de versiones de paquetes
```powershell
# Actualizar paquetes (opcional)
npm install @react-native-picker/picker@2.11.1
npm install expo@~54.0.32
expo start
```

---

## 📸 ¿Cómo se ve el Dashboard?

### Header (Verde Gradient)
```
┌──────────────────────────────────┐
│ Bienvenido a EcoTachosTec       │
│ Panel de control y gestión...   │
│ [🔄 Actualizar]                  │
└──────────────────────────────────┘
```

### Tarjetas de Stats (2x2 Grid)
```
┌──────────┐ ┌──────────┐
│🗑️ Tachos │ │🧠 IA    │
│   [12]    │ │  [45]   │
│  ↑ 12%    │ │ ↑ 28%  │
└──────────┘ └──────────┘

┌──────────┐ ┌──────────┐
│👥 Users  │ │📍 Ubic  │
│   [8]     │ │  [15]   │
│  ↑ 5%     │ │ ↑ 3%   │
└──────────┘ └──────────┘
```

### Actividad Reciente
```
┌──────────────────────────────────┐
│ Actividad Reciente    [🔴 En Vivo]│
├──────────────────────────────────┤
│ 🧠 Plástico PET detectado        │
│    en Tacho A-01                 │
│    🕐 10:30 • 95%                │
│                                  │
│ 🧠 Vidrio detectado              │
│    en Tacho B-02                 │
│    🕐 09:15 • 88%                │
└──────────────────────────────────┘
```

---

## 🚀 Próximos Pasos

Una vez que la app cargue:

1. **Login:** Ingresa con tu usuario admin
2. **Explora:** Navega por el dashboard
3. **Refresca:** Prueba el pull-to-refresh
4. **Interactúa:** Toca los botones de acciones rápidas

---

## 📞 ¿Necesitas Ayuda?

### Logs en Tiempo Real
Todos los logs aparecen en la terminal donde corre Expo. Obsérvalos para detectar errores.

### Debug
Presiona `j` en la terminal para abrir el debugger de Chrome.

### Reiniciar Todo
```powershell
# Ctrl+C para detener
# Luego:
expo start --clear
```

---

## ✅ Checklist Final

Antes de escanear el QR, verifica:

- [ ] ✅ Backend Django corriendo en `0.0.0.0:8000`
- [ ] ✅ Expo corriendo (`npm start`)
- [ ] ✅ Expo Go instalado en el celular
- [ ] ✅ Celular y PC en la misma WiFi
- [ ] ✅ Firewall permite conexiones (si es necesario)
- [ ] ✅ Código QR visible en la terminal

---

## 🎉 ¡Listo para Escanear!

**El código QR está esperando en tu terminal de PowerShell.**

**Solo escanéalo con Expo Go y disfruta del nuevo dashboard móvil!** 🚀📱

---

**¿Preguntas?** Los logs en la terminal te dirán todo lo que necesitas saber.

**¡Buena suerte! 🍀**
