# 🐾 HuellaApp — Documento de Contexto Integral del Proyecto (`PROJECT_CONTEXT.md`)

> **Versión del Documento:** 1.0.0  
> **Fecha de Actualización:** 9 de Noviembre de 2026  
> **Nombre Oficial de la Plataforma:** **HuellaApp** (anteriormente conocida durante prototipado como VetLink)  
> **Propósito:** Preservar la arquitectura, estado funcional, decisiones de diseño, tareas pendientes y propuestas conceptuales para garantizar la continuidad inmediata en cualquier nueva sesión de pair programming con IA.

---

## 1. PROJECT OVERVIEW (Visión General del Proyecto)

### 1.1. Descripción General
HuellaApp es una plataforma integral móvil y web diseñada para la salud, cuidado, libreta médica, rescate y gestión sanitaria de animales de compañía. Conecta en un mismo ecosistema a:
1. **Tutores / Propietarios de mascotas:** Consulta de historias clínicas, fichas sanitarias, recordatorios de vacunación, agenda de turnos, gestión de extravío y generación de chapitas identificatorias con códigos QR y modelos 3D STL.
2. **Veterinarios / Clínicas asociadas:** Alta médica oficial de pacientes, actualización de historiales clínicos, asignación y sobreescritura de microchips/etiquetas físicas NFC, emisión de recordatorios sanitarios a tutores y gestión de guardias 24hs.
3. **Comunidad / Rescatistas:** Acceso instantáneo a fichas públicas de rescate (`/pet?id=...`) mediante escaneo de QR o aproximación de chip NFC, permitiendo contactar al tutor por llamada/WhatsApp y enviar la geolocalización GPS exacta del hallazgo.

### 1.2. Propósito Principal y Estado de Desarrollo
* **Propósito:** Modernizar y humanizar la gestión de salud veterinaria y tenencia responsable, combinando tecnología física (QR + NFC) con accesibilidad WCAG 2.1 y una experiencia visual empática y moderna.
* **Estado Actual:** 
  * Fase 1 (Fundaciones, Autenticación, Fichas Clínicas, QR/NFC, Emergencias SOS, Ficha Pública de Rescate y Mapa) **100% implementada y funcional**.
  * Fase de Mejoras Visuales y Funcionales (Navegación horizontal de ficha clínica, modal de edición de mascota y componentes reutilizables de EmptyState) **implementada y testeada**.
  * Servidor de desarrollo Expo Web verificado y activo en `http://localhost:8081` (HTTP 200 OK).
  * **Fase 2 del roadmap original:** En pausa deliberada, esperando revisión y aprobación explícita del usuario.

---

## 2. PROJECT ARCHITECTURE (Arquitectura del Proyecto)

### 2.1. Tecnologías y Frameworks Principales
* **Framework Principal:** [Expo](https://expo.dev/) `~57.0.0` con New Architecture.
* **Librería UI:** [React Native](https://reactnative.dev/) `0.86.3` / [React](https://react.dev/) `19.2.3`.
* **Enrutamiento y Navegación:** [expo-router](https://docs.expo.dev/router/introduction/) `^57.0.21` (File-based routing).
* **Tipado Estático:** [TypeScript](https://www.typescriptlang.org/) `~6.0.3`.
* **Backend y Base de Datos:** [Firebase SDK](https://firebase.google.com/) `^12.18.0` (Cloud Firestore, Firebase Authentication, Cloud Storage).
* **Hardware e Integraciones Nativas:**
  * Cámara y lectura QR: `expo-camera` `~57.0.5`.
  * Lectura/Escritura de etiquetas NFC: `react-native-nfc-manager` `^4.0.0`.
  * Geolocalización GPS: `expo-location` `~57.0.22`.
  * Notificaciones locales: `expo-notifications` `~57.0.23`.
  * Selección y captura de fotos: `expo-image-picker` `~57.0.20` y `expo-image` `~57.0.5`.
  * Haptic Feedback: `expo-haptics` `~57.0.2`.
  * Mapas: Visor Leaflet multiplataforma (`react-native-webview` en móvil, iframe en web).

### 2.2. Estructura de Directorios y Responsabilidades

```text
Vetlink/
├── app/                          # Enrutamiento basado en archivos (Expo Router)
│   ├── (auth)/                   # Flujos de login y registro
│   │   ├── login.tsx             # Inicio de sesión con Email/Contraseña y Google
│   │   ├── register.tsx          # Registro de usuario (rol tutor por defecto)
│   │   └── _layout.tsx           # Layout de autenticación
│   ├── (tabs)/                   # Navegación principal por pestañas inferiores
│   │   ├── index.tsx             # Dashboard principal (diferenciado por rol Tutor/Vet)
│   │   ├── mascotas.tsx          # Nómina de mascotas del tutor o pacientes de la clínica
│   │   ├── sos.tsx               # Módulo de urgencias SOS y clínicas de guardia 24hs
│   │   ├── scan.tsx              # Escáner de cámara QR y lectura rápida NFC
│   │   ├── mapa.tsx              # Mapa georreferenciado de veterinarias en Pilar
│   │   ├── perfil.tsx            # Perfil de usuario, conmutador de rol y tema
│   │   └── _layout.tsx           # Barra de navegación inferior
│   ├── mascotas/
│   │   └── [id].tsx              # Ficha Clínica detallada de la mascota con pestañas horizontales
│   ├── pet.tsx                   # Ficha Pública Web de Rescate (acceso por QR/NFC)
│   ├── chat.tsx                  # Asistente virtual veterinario HuellaApp
│   ├── recordatorios.tsx         # Gestión de recordatorios sanitarios automáticos
│   ├── turnos.tsx                # Agenda y consulta de citas veterinarias
│   ├── veterinarias.tsx          # Directorio y listado de clínicas asociadas
│   ├── _layout.tsx               # Layout raíz con ThemeProvider y AuthProvider
│   └── index.tsx                 # Entrada y redirección según estado de sesión
├── components/                   # Componentes visuales y lógicos reutilizables
│   ├── EmptyState.tsx            # Estados vacíos modulares con ilustraciones amigables
│   ├── EditarMascotaModal.tsx    # Modal de edición completa de mascota
│   ├── PetCard.tsx               # Tarjeta interactiva de mascota para listados
│   ├── QRMascotaCard.tsx         # Generador de QR nativo, compartir y exportar STL 3D
│   ├── VincularNfcModal.tsx      # Modal de vinculación física de chips NFC
│   ├── CrearRecordatorioModal.tsx# Modal para que veterinarios programen avisos
│   ├── FriendlyPetBanner.tsx     # Banners con microilustraciones y mensajes cálidos
│   ├── SosIcon.tsx               # Icono de emergencia
│   ├── ThemeToggleButton.tsx     # Conmutador de Modo Claro / Modo Oscuro
│   └── map/                      # Componentes de mapa interactivo Leaflet
├── services/                     # Servicios de lógica de negocio y Firebase
│   ├── petService.ts             # CRUD de mascotas, escaneos de rescate, extravío y usePets
│   ├── nfcService.ts             # Inicialización, lectura, escritura NDEF y vinculación
│   ├── reminderService.ts        # Programación y cálculo de recordatorios sanitarios
│   ├── notificationService.ts    # Configuración de notificaciones del dispositivo
│   ├── googleAuthService.ts      # Autenticación con Google
│   ├── chatService.ts            # Lógica y llamadas del Asistente Virtual
│   ├── chatContextService.ts     # Contexto de salud inyectado al chatbot
│   └── veterinariasService.ts    # Datos y filtros de veterinarias de Pilar
├── context/                      # Contextos globales de React
│   ├── AuthContext.tsx           # Sesión de Firebase, datos de perfil y rol (Tutor/Vet)
│   └── ThemeContext.tsx          # Modo Claro / Oscuro dinámico y tokens
├── constants/                    # Tokens de diseño y constantes estáticas
│   ├── theme.ts                  # Paleta oficial, tipografías, espaciados y sombras
│   └── veterinarias.ts           # Clínicas de Pilar, coordenadas y guardias 24hs
├── firestore.rules               # Reglas de seguridad declarativas de Cloud Firestore
└── start.ps1                     # Script PowerShell para iniciar Expo
```

---

## 3. CURRENT IMPLEMENTATION (Estado Actual de Implementación)

### 3.1. Funcionalidades Completamente Implementadas

1. **Gestión de Ficha Clínica con Navegación Horizontal (`app/mascotas/[id].tsx`):**
   * Pestañas horizontales scrollables (`Radius.full`):
     * **General:** Foto ampliada con badge flotante, datos vitales (peso, edad, sexo, código), datos del tutor y notas clínicas.
     * **Historial:** Historial clínico de consultas, intervenciones y altas médicas (`pet?.historialClinico`), con estado vacío amigable si no hay registros.
     * **Seguridad:** Control del estado de extravío (Modo Búsqueda / En Casa), alerta SOS, geolocalización del último escaneo GPS con apertura en Google Maps y previsualización de la ficha pública.
     * **NFC:** Estado de vinculación, ID de tag, URL técnica NDEF, fecha y veterinario emisor con acciones de vincular/reasignar.
     * **Placa QR:** Generador QR dinámico, guardado en galería, compartir y descarga del archivo de impresión 3D STL de la chapita.
     * **Ver Todo:** Visualización continua de todas las secciones en un único scroll vertical.
   * **Mini-Header Persistente:** Muestra permanentemente avatar, nombre, raza, ID oficial y badge de extravío para no perder el contexto al alternar entre pestañas.

2. **Edición Completa de Información de Mascota (`components/EditarMascotaModal.tsx`):**
   * Accesible desde el Navbar superior y desde la sección General para usuarios autorizados.
   * **Campos editables:** Nombre, Foto de perfil (con ImagePicker y subida a Firebase Storage), **Sexo (selector interactivo Macho / Hembra con íconos lineales)**, Especie (Perro / Gato), Raza, Peso, Fecha de nacimiento / Edad, Tutor/Propietario, Teléfono de emergencia y Notas clínicas.
   * **Integridad de datos:** El identificador clínico (ej: `PET-001`) es de solo lectura; se actualiza el documento existente en Firestore mediante `updatePetData` sin duplicar registros ni romper referencias de NFC o QR.
   * **Permisos estrictos:** Veterinarios pueden editar cualquier mascota; los tutores solo pueden editar sus mascotas vinculadas (`pet.userId === user.uid || pet.ownerId === user.uid`).

3. **Componente Reusable de Estados Vacíos (`components/EmptyState.tsx`):**
   * Reemplaza contenedores vacíos genéricos en Mascotas (`app/(tabs)/mascotas.tsx`), Recordatorios (`app/recordatorios.tsx`), Turnos (`app/turnos.tsx`) y en el Historial de la Ficha Clínica.
   * Soporta variantes tipificadas, mensajes contextuales en Quicksand y Nunito Sans, botón de acción en píldora y compatibilidad total con temas claro y oscuro.

4. **Identificación y Rescate Inteligente:**
   * **Ficha Pública de Rescate (`app/pet.tsx`):** Vista web ligera accesible sin necesidad de autenticación. Permite a cualquier persona que encuentre a un animal perdido ver su información de emergencia, llamar al dueño, abrir chat directo de WhatsApp o enviar las coordenadas GPS exactas del rescate a la colección `escaneosRescate` de Firestore.
   * **Módulo NFC (`services/nfcService.ts`):** Lectura e interpretación de etiquetas NDEF. La vinculación y reasignación técnica está reservada exclusivamente a veterinarios en `firestore.rules`.
   * **Generación STL 3D:** Generación y exportación de archivo paramétrico STL para impresión física 3D de chapitas con código QR grabado.

5. **Servidor Web y Ejecución:**
   * Script `start.ps1` configurado.
   * Resuelto el problema de inicio en Windows mediante `$env:EXPO_NO_TELEMETRY="1"`, logrando que Metro Bundler enlace el puerto 8081 y responda exitosamente con **HTTP 200 OK**.

---

## 4. DESIGN SYSTEM (Sistema de Diseño HuellaApp)

Todos los lineamientos están normados bajo `DESIGN_SYSTEM.md` y centralizados en `constants/theme.ts`:

### 4.1. Paleta de Colores Oficial (WCAG 2.1 AA/AAA)

| Token | HEX / Valor | Rol en la Interfaz |
|:---|:---:|:---|
| `Palette.greenPrimary` | `#13A857` | Verde Logo / Acentos / Bordes activos / Iconos decorativos |
| `Palette.greenDeep` | `#087A43` | **Verde accesible para botones principales y texto sobre fondo blanco (5.38:1)** |
| `Palette.greenSoft` | `#EAF8F0` | Superficies de chips, píldoras y contenedores suaves |
| `Palette.greenBorder` | `#BCEAD0` | Borde delimitador para contenedores verdes |
| `Palette.cyanSecondary` | `#65CFE0` | Cian informativo y roles secundarios |
| `Palette.cyanLight` | `#E8F9FC` | Superficie cian suave para chips y turnos solicitados |
| `Palette.peachWarm` | `#FFB38A` | Acento cálido complementario para avisos no críticos |
| `Palette.peachSoft` | `#FFF3EB` | Fondo durazno suave para recordatorios |
| `Palette.redEmergency` | `#D94A4A` | Rojo de urgencias médicas, alertas de extravío y botón SOS |
| `Palette.redSoft` | `#FEF2F2` | Fondo suave para banners de pérdida y emergencias |
| `Palette.backgroundLight` | `#F8FCF8` | Fondo base general cálido con leve matiz menta orgánico |
| `Palette.cardLight` | `#FFFFFF` | Superficie de tarjetas y modales en tema claro |
| `Palette.textPrimary` | `#26332E` | Carbón bosque de alto contraste (14.12:1 - AAA) |
| `Palette.textSecondary` | `#5A6E65` | Gris pizarra legible para subtítulos y metadatos |
| `Palette.textMuted` | `#8B9E95` | Placeholders y textos secundarios |

### 4.2. Tipografía Oficial
* **Encabezados (Headings):** `Quicksand` (`Quicksand_700Bold`, `Quicksand_600SemiBold`). Terminaciones redondeadas, cálidas y empáticas.
* **Cuerpo y Formularios (Body):** `Nunito Sans` (`NunitoSans_400Regular`, `NunitoSans_600SemiBold`, `NunitoSans_700Bold`). Óptima legibilidad en interfaces móviles.

### 4.3. Reglas Iconográficas (Line Art System)
* **Primaria:** `Ionicons` con variante `-outline` para el 95% de la interfaz.
* **Excepciones permitidas:** `MaterialCommunityIcons` únicamente para los 4 glifos que no existen como contorno en Ionicons: `cat`, `dog`, `paw` y `nfc`.
* **Prohibición estricta:** No usar emojis en botones o títulos de la UI (`🐶`, `🐱`, `🚨`, etc.).

### 4.4. Radios y Sombras
* Píldoras y chips: `Radius.full` (`9999px`).
* Tarjetas: `Radius.xl` (`20px`) o `Radius.lg` (`16px`).
* Botones principales: `Radius.md` (`12px`) a `Radius.xl` (`20px`).
* Sombras: Desenfoques suaves y difusos (`shadowOpacity: 0.04-0.10`, `shadowRadius: 6-16`).

---

## 5. PREVIOUS DECISIONS (Decisiones Previas Registradas)

### 5.1. Decisiones Aprobadas e Implementadas
1. **Identidad Unificada:** Uso exclusivo del nombre de marca **HuellaApp** (o `Huell` + `App` en logotipos bicolores), reemplazando referencias heredadas a *VetLink*.
2. **Inmutabilidad del ID de Mascota:** Los identificadores estables (`PET-001`, `PET-002`) no son editables para evitar duplicados en Firestore y proteger la sincronización 1:1 con etiquetas NFC y códigos QR físicos.
3. **Selector de Sexo Editable:** Se resolvió la imposibilidad previa de cambiar el sexo post-registro incorporando el selector Macho/Hembra en `EditarMascotaModal`.
4. **Navegación Horizontal sin Secciones Falsas:** Se organizó la ficha clínica en pestañas horizontales basadas exclusivamente en las 5 secciones existentes en el código (`General`, `Historial`, `Seguridad`, `NFC`, `Placa QR` + `Ver Todo`).
5. **Solución del Servidor Web:** Inclusión de `EXPO_NO_TELEMETRY=1` para evitar bloqueos por `EPERM` en Windows al iniciar Metro en el puerto 8081.

### 5.2. Ideas Discutidas AÚN NO Aprobadas (En Pausa)
1. **Fase 2 del Roadmap Original:** El usuario solicitó expresamente **no iniciar la Fase 2** hasta concluir y revisar las mejoras actuales.
2. **Rediseño Estilo PetCare (Referencia Visual):** Se analizaron propuestas de transformación visual (barra de tabs inferior flotante en píldora expansiva, cuadrícula de servicios tipo app icons, fondos con degradados orgánicos *soft blobs* y sombras neumórficas difusas). Estas sugerencias quedaron planteadas como propuesta conceptual, sin autorización de implementación.
3. **Propuesta de Mascotas Ilustradas Animadas para Empty States:** Detallada en la Sección 7; presentada como propuesta y **pendiente de aprobación**.

---

## 6. PENDING TASKS & KNOWN ISSUES (Tareas Pendientes y Errores Conocidos)

### 6.1. Tareas Pendientes Inmediatas
* Esperar revisión y feedback del usuario sobre las propuestas visuales y la ficha clínica.
* Definir la aprobación o ajustes sobre la propuesta de Empty States con personajes animales animados (Sección 7).

### 6.2. Errores Técnicos Preexistentes en el Repositorio (No causados por los cambios recientes)
1. **`app/veterinarias.tsx` (Línea 136):** Clave duplicada en objeto de estilos (`error TS1117: An object literal cannot have multiple properties with the same name`).
2. **`app/(tabs)/scan.tsx` (Línea 589):** Referencia a `StyleSheet.absoluteFillObject` en lugar de `StyleSheet.absoluteFill`.
3. **Módulos de Firebase sin Declaración de Tipos (`TS7016`):**
   TypeScript 6 reporta falta de archivos `.d.ts` para subrutas de Firebase (`firebase/auth`, `firebase/firestore`, `firebase/storage`, `firebase/app`, `expo-notifications`). Se soluciona creando un archivo global `declarations.d.ts` cuando el usuario autorice mantenimiento técnico.
4. **Parámetros con tipo implícito `any` (`TS7006`):** En `AuthContext.tsx`, `chatContextService.ts`, `petService.ts` y `reminderService.ts`.

---

## 7. EMPTY STATES PROJECT (Proyecto de Estados Vacíos con Mascotas Animadas)

### 7.1. Origen de la Discusión
El usuario consultó específicamente:  
> *"en las pantalla que tengan espacios, es decir, por ej: faltan recordatorios. en vez de una campanita, podrias colocar como un perrito o gatito animado, (no icono) y el mensaje abajo?"*

Posteriormente indicó con claridad:  
> *"pero no quiero que lo apliques o modifiques, primero mostrame tu sugerencia/propuesta"*

Por tanto, **esta funcionalidad se encuentra en estado de PROPUESTA CONCEPTUAL PENDIENTE DE APROBACIÓN**. No debe aplicarse al código hasta que el usuario dé su confirmación expresa.

### 7.2. Concepto Central: *"Mascotas que Acompañan"*
En lugar de íconos abstractos del sistema (campanas, calendarios o documentos vacíos), las pantallas sin datos muestran personajes ilustrados de mascotas que transmiten calidez, tranquilidad o bienvenida según el contexto.

### 7.3. Los Cuatro Personajes Específicos por Pantalla

#### 1. Pantalla de Recordatorios Sanitarios (`app/recordatorios.tsx`)
* **Personaje:** **Perrito esperando pacientemente** (estilo mestizo/Golden tierno con orejitas caídas y collar con medallita).
* **Actitud / Animación:** Sentado o asomando la cabeza, moviendo suavemente las orejitas o la colita con respiración relajada. Transmite que todo está bajo control y no hay medicamentos urgentes vencidos.
* **Mensaje:**
  * *Título:* "¡Todo al día por acá!" o "No tenés recordatorios pendientes."
  * *Subtítulo:* "Tu compañero está al día con sus vacunas y cuidados sanitarios."
  * *Acción (solo si es veterinario):* Botón redondeado en píldora `+ Programar recordatorio`.

#### 2. Pantalla de Turnos y Citas Veterinarias (`app/turnos.tsx`)
* **Personaje:** **Gatito relajado tomando una siesta** o estirándose tiernamente.
* **Actitud / Animación:** Respiración rítmica suave, ojos rasgados felices con destellos sutiles. Comunica descanso y ausencia de citas pendientes.
* **Mensaje:**
  * *Título:* "Sin visitas médicas en agenda."
  * *Subtítulo:* "Cuando reserves un turno con tu veterinaria de confianza, lo vas a ver acá."
  * *Acción:* Botón `Solicitar turno` o `Buscar veterinaria de guardia`.

#### 3. Pantalla Inicial de Mis Mascotas (`app/(tabs)/mascotas.tsx` - Usuario Nuevo)
* **Personaje:** **Dúo de perrito y gatito asomados juntos** sobre un halo menta suave.
* **Actitud / Animación:** Mirada curiosa y alegre, pequeña inclinación de cabeza dando la bienvenida al nuevo tutor.
* **Mensaje:**
  * *Título:* "Tu familia todavía no tiene integrantes acá."
  * *Subtítulo:* "Agregá a tu primer compañero para comenzar a cuidar su salud y vincular su chapita inteligente."
  * *Acción:* Botón `+ Registrar a mi compañero`.

#### 4. Historial Clínico de Mascota sin Consultas (`app/mascotas/[id].tsx` - Sección Historial)
* **Personaje:** **Perrito curioso con libreta médica tierna o anteojos de salud**.
* **Actitud / Animación:** Parpadeo suave mirando una hoja limpia, transmitiendo salud preventiva.
* **Mensaje:**
  * *Título:* "Hoja clínica en blanco."
  * *Subtítulo:* "Las consultas veterinarias, desparasitaciones y vacunas aplicadas aparecerán registradas en esta sección."

### 7.4. Requerimientos Técnicos y de Animación
* **Uso exclusivo de Native Driver:** Animaciones con `Animated.loop` y `Animated.sequence` controlando únicamente `transform: [{ translateY }, { rotate }]` y `opacity` a 60 fps sin sobrecargar el hilo JS ni drenar batería.
* **Compatibilidad de Temas:**
  * *Modo Claro:* Halos en verde menta suave (`Palette.greenSoft`) o durazno suave (`Palette.peachSoft`), colores de pelaje cálidos y textos en carbón (#26332E).
  * *Modo Oscuro:* Halos translúcidos (`rgba(19, 168, 87, 0.16)`), tonalidades caramelo/miel de alto contraste y textos claros (#F4F4F5).
* **Disposición Vertical Estricta:**
  1. Ilustración animada en el tercio superior/medio.
  2. Título destacado en `Quicksand-Bold`.
  3. Mensaje descriptivo centrado en `NunitoSans-Regular` (ancho máximo 290px).
  4. Botón de acción opcional en píldora al pie.

### 7.5. Estado de Implementación
* **Estado:** **A la espera de revisión y aprobación del usuario.**
* **Regla para futuras sesiones:** No aplicar cambios al código de `EmptyState.tsx` ni a pantallas relacionadas hasta que el usuario confirme si aprueba la propuesta conceptual.

---

*Fin del documento `PROJECT_CONTEXT.md`.*

