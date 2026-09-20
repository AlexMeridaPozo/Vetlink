# 🐾 VetLink

Aplicación móvil para la gestión, cuidado e identificación inteligente de mascotas. Desarrollada con **React Native** y **Expo**, permite a los propietarios registrar y gestionar sus mascotas, identificarlas de manera rápida y segura mediante **códigos QR** y tecnología **NFC**, acceder a servicios de turnos, recordatorios veterinarios, mapas de atención y administrar su perfil con autenticación en **Firebase**.

---

## 📸 Pantallas y Módulos

| Pantalla | Módulo / Ruta | Descripción |
|---|---|---|
| **Inicio** | `app/(tabs)/index.tsx` | Dashboard principal con bienvenida personalizada, métricas rápidas y accesos directos a todos los servicios. |
| **Mis Mascotas** | `app/(tabs)/mascotas.tsx` | Listado y administración de mascotas del usuario conectado con Firestore, fotos, características y estado de salud. |
| **Ficha de Mascota** | `app/mascotas/[id].tsx` | Vista detallada con información médica, datos de contacto del tutor y especificaciones de la mascota. |
| **Escanear QR / NFC** | `app/(tabs)/scan.tsx` | Identificación instantánea de mascotas mediante escaneo de código QR (cámara) o lectura de tag NFC con vinculación al usuario. |
| **Mapa Veterinario** | `app/(tabs)/mapa.tsx` | Ubicación geográfica de clínicas veterinarias, centros de urgencia y puntos de atención cercanos. |
| **Tienda** | `app/(tabs)/tienda.tsx` | Catálogo de productos, accesorios, alimentos y promociones especiales para mascotas. |
| **Perfil** | `app/(tabs)/perfil.tsx` | Datos del usuario autenticado, rol en el sistema y opción para cerrar sesión de manera segura. |
| **Autenticación** | `app/(auth)/login.tsx`<br>`app/(auth)/register.tsx` | Formularios de inicio de sesión y registro de usuarios con selección de rol y validaciones en tiempo real. |
| **Turnos y Recordatorios** | `app/turnos.tsx`<br>`app/recordatorios.tsx` | Gestión de citas médicas, calendario de vacunación, desparasitación y tratamientos periódicos. |

---

## 🚀 Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| [Expo](https://expo.dev/) | `~57.0.0` | Framework principal para el ecosistema móvil |
| [React Native](https://reactnative.dev/) | `0.86.3` | Biblioteca base para UI nativa multiplataforma |
| [expo-router](https://expo.github.io/router) | `^57.0.21` | Navegación basada en el sistema de archivos (*file-based routing*) |
| [Firebase JS SDK](https://firebase.google.com/) | `^12.18.0` | Autenticación de usuarios (`Auth`) y base de datos en la nube (`Firestore`) |
| [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/) | `~57.0.5` | Acceso y lectura visual de códigos QR identificatorios |
| [react-native-nfc-manager](https://github.com/revtel/react-native-nfc-manager) | `^3.5.0` | Lectura y comunicación con tags NFC en placas de identificación |
| [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) | `~57.0.2` | Feedback táctil vibratorio en botones y pestañas de navegación |
| [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) | `^57.0.4` | Carga eficiente y almacenamiento en caché de imágenes de mascotas |
| [TypeScript](https://www.typescriptlang.org/) | `~6.0.3` | Tipado estático y robustez del desarrollo |

---

## 📁 Estructura del Proyecto

```text
Vetlink/
├── app/
│   ├── (auth)/                    # Flujo de autenticación
│   │   ├── _layout.tsx            # Stack layout de login/registro
│   │   ├── login.tsx              # Inicio de sesión con Firebase Auth
│   │   └── register.tsx           # Registro de usuarios y roles
│   ├── (tabs)/                    # Navegación principal por pestañas
│   │   ├── _layout.tsx            # Barra de pestañas inferior con HapticTab
│   │   ├── index.tsx              # Dashboard / Pantalla de inicio
│   │   ├── mascotas.tsx           # Pantalla de "Mis Mascotas"
│   │   ├── scan.tsx               # Escáner de QR y lector de NFC
│   │   ├── mapa.tsx               # Mapa de veterinarias y centros de atención
│   │   ├── tienda.tsx             # Catálogo y productos para mascotas
│   │   └── perfil.tsx             # Perfil de usuario y cierre de sesión
│   ├── mascotas/
│   │   └── [id].tsx               # Detalle / Ficha médica de la mascota
│   ├── _layout.tsx                # Layout raíz con AuthProvider y temas
│   ├── index.tsx                  # Redirección inicial según estado de sesión
│   ├── modal.tsx                  # Ventana modal genérica
│   ├── recordatorios.tsx          # Gestión de recordatorios y vacunas
│   ├── turnos.tsx                 # Consulta y reserva de turnos
│   └── veterinarias.tsx           # Directorio de clínicas veterinarias
├── assets/                        # Imágenes, íconos y recursos estáticos
├── components/                    # Componentes modulares reutilizables
├── config/
│   └── firebase.ts                # Inicialización de Firebase Auth y Firestore
├── context/
│   └── AuthContext.tsx            # Estado global del usuario autenticado
├── services/
│   └── petService.ts              # Consultas y vinculación de mascotas en Firestore
├── hooks/                         # Hooks personalizados (tema, esquemas de color)
├── constants/                     # Paletas de colores y configuración general
├── .env.example                   # Plantilla de variables de entorno
├── app.json                       # Configuración de Expo y permisos (Cámara, NFC)
├── package.json
└── tsconfig.json
```

---

## ⚙️ Configuración y Puesta en Marcha

### Requisitos previos
- [Node.js](https://nodejs.org/) `>= 18`
- [npm](https://www.npmjs.com/) `>= 9`
- [Expo Go](https://expo.dev/go) instalado en tu dispositivo móvil o un emulador configurado
- Proyecto creado en [Firebase Console](https://console.firebase.google.com/)

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/AlexMeridaPozo/Vetlink.git
cd "Aplicacion Movil"
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto a partir de la plantilla `.env.example`:

```bash
cp .env.example .env
```

Completa las variables con las claves de tu proyecto en Firebase:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=tu_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

### 3. Iniciar el servidor de desarrollo
```bash
npx expo start
```

Luego puedes seleccionar el modo de ejecución:
- **Escanear el código QR** con la aplicación **Expo Go** (Android o iOS).
- Presionar `a` para abrir en un **emulador de Android**.
- Presionar `i` para abrir en el **simulador de iOS**.
- Presionar `w` para abrir en el **navegador web**.

---

## 🔥 Firebase & Base de Datos

La aplicación utiliza la infraestructura de Google Firebase para la gestión de usuarios y almacenamiento de datos:

- **Autenticación (Firebase Auth):** Control de acceso y sesiones de usuarios mediante correo electrónico y contraseña.
- **Cloud Firestore:**
  - **Colección `mascotas`:** Almacena los perfiles de los animales.
  - **Campos:** `nombre`, `especie`, `raza`, `sexo`, `peso`, `edad`, `fechaNacimiento`, `propietario`, `telefonoContacto`, `userId` / `ownerId`, `fotoUrl`, `descripcion`.
  - **Vinculación dinámica:** Asignación y consulta de mascotas pertenecientes al `uid` del usuario en sesión activa.

> [!NOTE]
> Las variables de entorno con prefijo `EXPO_PUBLIC_` son inyectadas en tiempo de compilación por Expo. Asegúrate de nunca subir el archivo `.env` con credenciales de producción al repositorio público.

---

## 🏷️ Identificación Inteligente (QR & NFC)

VetLink incorpora dos métodos de identificación rápida para mascotas extraviadas o consultas veterinarias:

1. **Escaneo de Código QR:** Emplea `expo-camera` para enfocar y leer de inmediato el identificador único (ej. `PET-001`) grabado en la chapa identificatoria.
2. **Tecnología NFC:** Permite aproximar el dispositivo móvil a un tag o placa con chip NFC mediante `react-native-nfc-manager` para recuperar la ficha médica de la mascota al instante.

---

## 🎨 Diseño y Experiencia de Usuario (UI/UX)

- **Color de identidad:** `#22c55e` (Verde esmeralda / salud animal) y matices `#15803d` / `#16a34a`.
- **Barra de navegación:** Barra inferior estilizada con soporte de feedback táctil (`HapticTab`) al alternar pantallas.
- **Tema adaptable:** Preparada para soporte de modo claro y modo oscuro.
- **Iconografía moderna:** Íconos vectoriales coherentes utilizando `@expo/vector-icons` (`Ionicons` y `MaterialIcons`).

---

## 🗂️ Ramas del Repositorio

| Rama | Descripción |
|---|---|
| `main` | Rama principal estable del proyecto. |
| `feature/integracion-pantallas2` | Versión integrada con dashboard, servicios, navegación unificada y vinculación de mascotas. |
| `feature/us01-registro` | Desarrollo de la pantalla y validaciones de registro de usuarios (US01). |
| `feature/us02-login` | Implementación de inicio de sesión con Firebase Authentication (US02). |
| `feature/mascotas` | Módulo de gestión y listado de mascotas vinculadas a Firestore. |
| `feature/config-nfc-qr` | Configuración de permisos e integración de escáner QR y NFC. |
| `feature/mvp05-turnos` | Vistas y reserva de turnos veterinarios. |

---

## 📜 Scripts Disponibles

```bash
npm start          # Inicia el servidor de desarrollo de Expo
npm run android    # Inicia la aplicación en dispositivo o emulador Android
npm run ios        # Inicia la aplicación en el simulador de iOS
npm run web        # Compila y abre la aplicación en el navegador web
npm run lint       # Analiza el código fuente en busca de errores con ESLint
```

---

## 👥 Equipo de Desarrollo

Proyecto desarrollado por el equipo de **VetLink** en el marco del **Proyecto Integrador Final de Aplicaciones Móviles**.
