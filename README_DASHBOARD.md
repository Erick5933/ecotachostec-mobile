# 🚀 EcoTachosTec Mobile - Dashboard Mejorado

## ✅ Cambios Implementados

Se ha actualizado el Dashboard Mobile para que funcione **igual que la versión web** pero optimizado para React Native y Expo Go.

### 📋 Características Implementadas

✅ **Tarjetas de Estadísticas con Gradientes**
- Tachos Activos (verde)
- Detecciones IA (azul)
- Usuarios Registrados (morado)
- Ubicaciones (naranja)
- Cada tarjeta muestra tendencia con iconos

✅ **Actividad Reciente**
- Lista de detecciones recientes
- Muestra nombre de detección y tacho
- Hora de detección
- Porcentaje de confianza

✅ **Acciones Rápidas**
- Nuevo Tacho
- Nuevo Usuario
- Nueva Ubicación
- Ver Reportes

✅ **Estado del Sistema**
- API Backend
- Base de Datos
- Servicios IoT
- IA/ML Engine
- Indicadores visuales online/warning/offline

✅ **Funcionalidades**
- Pull to refresh
- Botón de actualizar manual
- Animaciones suaves
- Diseño responsive
- Colores idénticos al web

---

## 🛠️ Instalación y Ejecución

### 1️⃣ Instalar dependencias (si es necesario)

```bash
npm install
```

### 2️⃣ Configurar la URL del backend

Edita el archivo `.env` en la raíz del proyecto (si no existe, créalo):

```env
EXPO_PUBLIC_API_URL=http://TU_IP:8000/api
```

**⚠️ IMPORTANTE:** Reemplaza `TU_IP` con la IP de tu computadora donde corre el backend Django.

Para obtener tu IP:

**Windows:**
```bash
ipconfig
```
Busca "IPv4 Address" de tu adaptador de red activo.

**Mac/Linux:**
```bash
ifconfig
```

Ejemplo: `EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api`

### 3️⃣ Iniciar Expo

```bash
npm start
```

O también puedes usar:

```bash
expo start
```

### 4️⃣ Abrir en Expo Go

1. **Instala Expo Go** en tu celular:
   - 🍎 iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - 🤖 Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Escanea el código QR:**
   - iOS: Usa la cámara del iPhone
   - Android: Abre Expo Go y escanea desde la app

3. **O conecta por la misma red WiFi:**
   - Asegúrate que tu celular y computadora estén en la misma red WiFi
   - La app se cargará automáticamente

---

## 📱 Navegación en la App

Una vez que la app cargue:

1. **Login:** Inicia sesión con tu usuario
2. **Dashboard:** Verás el nuevo dashboard mejorado
3. **Pull to Refresh:** Arrastra hacia abajo para actualizar datos
4. **Tap en tarjetas:** Algunas son clickeables (próximamente navegarán a detalles)

---

## 🔍 Estructura de Archivos Modificados

```
src/
├── pages/
│   └── Dashboard/
│       └── DashboardAdmin.jsx  ✅ NUEVO - Dashboard mejorado
├── styles/
│   └── DashboardAdminStyles.js ✅ NUEVO - Estilos actualizados
└── api/
    └── axiosConfig.js          ✅ Ya existía - Configuración de API
```

---

## 🎨 Colores Usados (Idénticos a Web)

```javascript
Verde (Tachos):     #10b981 → #059669
Azul (Detecciones): #3b82f6 → #1d4ed8
Morado (Usuarios):  #8b5cf6 → #7c3aed
Naranja (Ubicaciones): #f97316 → #ea580c
```

---

## 🐛 Troubleshooting

### El backend no se conecta
- ✅ Verifica que tu backend Django esté corriendo: `python manage.py runserver 0.0.0.0:8000`
- ✅ Verifica que la IP en `.env` sea correcta
- ✅ Verifica que el celular y la PC estén en la misma red WiFi
- ✅ Desactiva firewall si es necesario

### No aparecen los datos
- ✅ Verifica que el backend tenga datos de prueba
- ✅ Mira los logs de Expo en la terminal
- ✅ Toca el botón "Actualizar" en el dashboard

### Error de módulos
```bash
npm install
expo start --clear
```

---

## 📊 Endpoints que usa el Dashboard

```javascript
GET /tachos/              // Lista de tachos
GET /detecciones/         // Lista de detecciones
GET /usuarios/            // Lista de usuarios
GET /ubicacion/cantones/  // Lista de ubicaciones
```

---

## 🚀 Próximas Mejoras

- [ ] Navegación a detalles al tocar tarjetas
- [ ] Gráficos con react-native-chart-kit
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Caché de datos offline

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la terminal de Expo
2. Verifica la conexión al backend
3. Asegúrate que Expo Go esté actualizado

---

**¡Listo! 🎉 Tu dashboard mobile está funcionando igual que el web.**
