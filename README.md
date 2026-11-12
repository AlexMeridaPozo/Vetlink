# 🐾 HuellApp

<p align="center">
  <a href="https://alexmeridapozo.github.io/Huellapp/" title="Hacé clic para visitar el sitio web oficial de HuellApp">
    <img src="./docs/assets/assets/banner.png" alt="HuellApp — El cuidado de tu mascota, conectado" width="100%">
  </a>
</p>

<p align="center">
  <a href="https://alexmeridapozo.github.io/Huellapp/">
    <img src="https://img.shields.io/badge/🌐_Sitio_Web-Abrir_página_oficial-0BB35E?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Abrir el sitio web oficial de HuellApp">
  </a>
  <a href="https://alexmeridapozo.github.io/Huellapp/">
    <img src="https://img.shields.io/badge/GitHub_Pages-Activo-07884A?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Pages">
  </a>
  <a href="https://expo.dev/">
    <img src="https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 57">
  </a>
  <a href="https://reactnative.dev/">
    <img src="https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native 0.86">
  </a>
  <a href="https://firebase.google.com/">
    <img src="https://img.shields.io/badge/Firebase-v12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  </a>
</p>

<p align="center">
  <strong>El cuidado de tu mascota, conectado.</strong><br>
  App móvil para la gestión sanitaria, con ficha clínica digital y la identificación inteligente de mascotas mediante chapitas con código QR y tags NFC.<br><br>
  👉 <strong><a href="https://alexmeridapozo.github.io/Huellapp/">Ingresá al sitio web oficial de HuellApp</a></strong> 👈
</p>

> 🌐 **Sitio web:** https://alexmeridapozo.github.io/Huellapp/

---

## 📸 Pantallas Principales

| Módulo | Ruta | Funcionalidad |
|---|---|---|
| **Dashboard** | `app/(tabs)/index.tsx` | Inicio personalizado con accesos directos y métricas de salud. |
| **Mis Mascotas** | `app/(tabs)/mascotas.tsx` | Fichas clínicas, características y estado de cada mascota. |
| **Emergencias SOS** | `app/(tabs)/sos.tsx` | Botón central de urgencias, guardias 24hs y llamadas directas. |
| **Mapa & Clínicas** | `app/(tabs)/mapa.tsx` | Geolocalización de veterinarias, hospitales y zoonosis en Pilar. |
| **Escáner QR & NFC** | `app/(tabs)/scan.tsx` | Identificación de chapitas inteligentes y vinculación de tags. |
| **Ficha de Rescate** | `app/pet.tsx` | Vista pública con contacto del tutor y envío de coordenadas GPS. |
| **Perfil & Ajustes** | `app/(tabs)/perfil.tsx` | Gestión de cuenta, modo oscuro/claro y credenciales clínicas. |
| **Autenticación** | `app/(auth)/` | Login y registro con Email y Google Sign-In con roles de usuario. |

---

## 🚀 Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| [Expo](https://expo.dev/) | `~57.0.0` | Framework principal del ecosistema móvil |
| [React Native](https://reactnative.dev/) | `0.86.3` | UI nativa multiplataforma con New Architecture |
| [expo-router](https://expo.github.io/router) | `^57.0.21` | Navegación nativa basada en archivos |
| [Firebase](https://firebase.google.com/) | `^12.18.0` | Autenticación y Cloud Firestore |
| [Hardware Nativo](https://docs.expo.dev/) | `SDK 57` | Cámara QR (`expo-camera`) y lectura NFC (`nfc-manager`) |
| [TypeScript](https://www.typescriptlang.org/) | `~6.0.3` | Tipado estático y robustez del código |

---

## 📁 Estructura del Proyecto

```text
Huellapp/
├── app/                  # Rutas y navegación (auth, tabs, fichas médicas)
├── components/           # Componentes UI reutilizables (tarjetas, modales, mapa)
├── services/             # Lógica de negocio e integraciones (Firebase, NFC, Chatbot)
├── context/              # Estado global (Autenticación y Tema Claro/Oscuro)
├── constants/            # Puntos veterinarios de Pilar y paleta de diseño
├── docs/                 # Landing Page oficial (desplegada en GitHub Pages)
└── assets/               # Recursos gráficos oficiales, íconos y capturas
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
git clone https://github.com/AlexMeridaPozo/Huellapp.git
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

Huellapp incorpora dos métodos de identificación rápida para mascotas extraviadas o consultas veterinarias:

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

Proyecto desarrollado por el equipo de **Huellapp** en el marco del **Proyecto Integrador Final de Aplicaciones Móviles**.
