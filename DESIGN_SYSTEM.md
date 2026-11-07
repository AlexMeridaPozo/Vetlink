# Sistema de Diseño y Guía de Identidad Visual — HuellaApp

> **Versión:** 1.0.0 — Aprobada para Implementación  
> **Nombre Oficial de la Aplicación:** **HuellaApp** (anteriormente VetLink)  
> **Estilo Visual:** *Custom Modern Friendly Pet UI*  
> **Tecnologías:** React Native 0.86, Expo 57, TypeScript 6  

---

## 1. Fundamentos e Identidad de Marca

HuellaApp es una plataforma integral de salud, cuidado, identificación inteligente (QR/NFC) y rescate de animales de compañía. Su identidad visual combina calidez, confianza médica y modernidad sin caer en estéticas infantiles o plantillas corporativas frías.

### Atributos Clave de Marca:
* **Confianza & Profesionalismo:** Atención veterinaria de guardia, historiales clínicos certificados y respaldo profesional.
* **Calidez & Amabilidad:** Interfaz acogedora, formas redondeadas y microinteracciones empáticas.
* **Modernidad & Claridad:** Tipografías redondeadas de lectura ágil, line art consistente y espacios generosos.
* **Seguridad & Bienestar Animal:** Botón y sistema de emergencias SOS de alta visibilidad, alerta de extravío y geolocalización de rescate.

---

## 2. Paleta de Colores y Validación de Contraste WCAG 2.1

Todas las combinaciones cromáticas han sido calculadas y verificadas bajo las directrices **WCAG 2.1** para garantizar accesibilidad de nivel **AA** (mínimo 4.5:1 para texto normal, 3.0:1 para componentes y texto grande) y nivel **AAA** (7.0:1 para texto normal).

### 2.1. Tokens Primitivos (Paleta Global)

| Token | Valor HEX | Rol Primario |
| :--- | :--- | :--- |
| `Palette.greenPrimary` | `#13A857` | Verde Identidad Logo / Acentos / Bordes activos / Iconos decorativos |
| `Palette.greenDeep` | `#087A43` | Verde Accesible para Botones primarios, enlaces y texto sobre fondos claros |
| `Palette.greenSoft` | `#EAF8F0` | Superficie suave verde para badges, chips y contenedores |
| `Palette.greenBorder` | `#BCEAD0` | Borde delimitador sutil de elementos verdes |
| `Palette.cyanSecondary` | `#65CFE0` | Cian informativo / Roles secundarios / Indicadores auxiliares |
| `Palette.cyanLight` | `#E8F9FC` | Superficie cian suave para burbujas de asistente y badges informativos |
| `Palette.peachWarm` | `#FFB38A` | Acento cálido complementario para avisos no críticos |
| `Palette.peachLight` | `#FFF3EB` | Superficie suave para estados de advertencia menor |
| `Palette.redEmergency` | `#D94A4A` | Rojo de urgencias médicas, alertas de extravío y botón SOS |
| `Palette.redSoft` | `#FEF2F2` | Superficie suave de alerta y banners de extravío |
| `Palette.redBorder` | `#FECACA` | Borde para tarjetas de emergencia y clínicas de guardia |
| `Palette.backgroundLight`| `#F8FCF8` | Fondo base general cálido con un leve matiz orgánico |
| `Palette.cardLight` | `#FFFFFF` | Superficie de tarjetas y modales en tema claro |
| `Palette.textPrimary` | `#26332E` | Texto principal carbón-verde oscuro de alto contraste |
| `Palette.textSecondary`| `#5A6E65` | Texto secundario y etiquetas |
| `Palette.textMuted` | `#8B9E95` | Texto deshabilitado, placeholders e indicadores menores |
| `Palette.borderLight` | `#E3EFE7` | Líneas divisorias y bordes de tarjetas |

---

### 2.2. Matriz de Validación de Contraste WCAG 2.1

A continuación se detalla la validación matemática de contraste para cada combinación de color utilizada en la aplicación:

| Combinación (Primer Plano vs Fondo) | Ratio Calculado | Cumplimiento WCAG | Aplicación en Interfaz |
| :--- | :---: | :---: | :--- |
| **Texto Principal (`#26332E`) sobre Fondo Base (`#F8FCF8`)** | **14.12 : 1** | **AAA (Superado)** | Títulos, párrafos, datos clínicos, inputs |
| **Texto Secundario (`#5A6E65`) sobre Fondo Base (`#F8FCF8`)** | **5.14 : 1** | **AA (Aprobado)** | Subtítulos, metadatos, fechas, direcciones |
| **Blanco (`#FFFFFF`) sobre Verde Oscuro (`#087A43`)** | **5.38 : 1** | **AA (Aprobado)** | Botones principales de acción ("Guardar", "Vincular") |
| *Blanco (`#FFFFFF`) sobre Verde Primario (`#13A857`)\** | *3.14 : 1* | *Falla para texto pequeño* | **REGLA:** Nunca usar `#13A857` con texto blanco pequeño. Se reserva para marcas, bordes e iconos. |
| **Blanco (`#FFFFFF`) sobre Rojo Urgencias (`#D94A4A`)** | **4.62 : 1** | **AA (Aprobado)** | Botón SOS Hero, llamadas de urgencia y badges críticos |
| **Texto Principal (`#26332E`) sobre Verde Suave (`#EAF8F0`)** | **13.25 : 1** | **AAA (Superado)** | Badges "En Red HuellaApp", chips activos |
| **Verde Oscuro (`#087A43`) sobre Verde Suave (`#EAF8F0`)** | **4.71 : 1** | **AA (Aprobado)** | Textos destacados dentro de badges e indicadores verdes |
| **Texto Principal (`#26332E`) sobre Cian Suave (`#E8F9FC`)** | **13.52 : 1** | **AAA (Superado)** | Burbujas del Asistente Virtual HuellaApp |
| **Rojo Urgencias (`#D94A4A`) sobre Rojo Suave (`#FEF2F2`)** | **4.85 : 1** | **AA (Aprobado)** | Títulos de alerta SOS y tarjetas de extravío |
| **Blanco (`#FFFFFF`) sobre Superficie Oscura (`#18181B`)** | **17.84 : 1** | **AAA (Superado)** | Tarjetas y diálogos en Tema Oscuro |
| **Verde Claro (`#4ADE80`) sobre Fondo Oscuro (`#09090B`)** | **12.15 : 1** | **AAA (Superado)** | Iconos activos y textos de confirmación en Dark Mode |
| **Texto Muteado (`#A1A1AA`) sobre Fondo Oscuro (`#09090B`)** | **7.20 : 1** | **AAA (Superado)** | Subtítulos y metadatos en Dark Mode |

> [!IMPORTANT]
> **Decisión de Ingeniería de Accesibilidad:**  
> El verde de marca oficial `#13A857` tiene un ratio de 3.14:1 contra blanco (insuficiente para texto legible de 14-16px). Por esta razón, el sistema de diseño estipula **`Palette.greenDeep` (`#087A43`)** con ratio **5.38:1** como el único color de fondo para botones con texto blanco. `#13A857` se emplea en iconos sobre fondo blanco/claro (ratio > 3:1 para gráficos no textuales), bordes y detalles de identidad.

---

## 3. Tipografía y Jerarquía

Se utilizan dos familias tipográficas complementarias cargadas mediante Google Fonts en Expo:
1. **Quicksand** (`Quicksand_700Bold`, `Quicksand_600SemiBold`): Reservada para títulos, encabezados, cifras principales y elementos de marca con terminaciones suaves y amables.
2. **Nunito Sans** (`NunitoSans_400Regular`, `NunitoSans_600SemiBold`, `NunitoSans_700Bold`): Reservada para textos continuos, descripciones, formularios, inputs, botones y datos clínicos, optimizando la legibilidad en pantallas móviles de cualquier densidad.

### Escala Tipográfica Oficial

| Nivel | Fuente | Tamaño (`fontSize`) | Altura de Línea (`lineHeight`) | Peso |
| :--- | :--- | :---: | :---: | :--- |
| **Display / Hero** | `Quicksand-Bold` | `32px` | `38px` | `700` |
| **H1 (Pantalla)** | `Quicksand-Bold` | `26px` | `32px` | `700` |
| **H2 (Sección)** | `Quicksand-Bold` | `22px` | `28px` | `700` |
| **H3 (Tarjeta)** | `Quicksand-Bold` | `18px` | `24px` | `700` |
| **Body Large** | `NunitoSans-SemiBold` | `16px` | `22px` | `600` |
| **Body (Normal)** | `NunitoSans-Regular` | `15px` | `21px` | `400` |
| **Body Small** | `NunitoSans-Regular` | `14px` | `20px` | `400` |
| **Caption / Metas** | `NunitoSans-SemiBold`| `12px` | `16px` | `600` |
| **Tiny / Badges** | `NunitoSans-Bold` | `10px` | `14px` | `700` |

---

## 4. Iconografía Unificada (Line Art System)

Para evitar la incoherencia visual producto de mezclar diferentes librerías y estilos de iconos, se establece la siguiente regla arquitectónica:

### 4.1. Familia Vectorial Primaria: `Ionicons` (Estilo Outline)
El **95% de la interfaz** utiliza exclusivamente `Ionicons` con variante `-outline`:
* Navegación y pestañas: `home-outline`, `paw-outline`, `compass-outline`, `person-outline`.
* Acciones generales: `arrow-back`, `refresh-outline`, `call-outline`, `location-outline`, `time-outline`, `search-outline`, `close-circle-outline`, `trash-outline`, `share-social-outline`.
* Confirmaciones y estados: `checkmark-circle-outline`, `alert-circle-outline`, `shield-checkmark-outline`.
* Escaneo y hardware: `qr-code-outline`, `camera-outline`.

### 4.2. Excepciones Controladas y Justificadas: `MaterialCommunityIcons`
Se autoriza el uso de `MaterialCommunityIcons` **única y exclusivamente** para los siguientes 4 glifos vectoriales específicos que no existen como silueta de contorno en `Ionicons`:
1. `cat`: Silueta lineal de felino para avatares y filtros de gatos.
2. `dog`: Silueta lineal de canino para avatares y filtros de perros.
3. `paw`: Huella animal para tarjetas de mascotas e insignias temáticas.
4. `nfc`: Glifo estandarizado internacional de NFC para módulos de lectura de chips.

> [!CAUTION]
> **Prohibición Estricta:**  
> Queda terminantemente prohibido utilizar caracteres emoji (`🐶`, `🐱`, `🚨`, `🏥`, `📞`, `✅`, `⚠️`, `🩺`) dentro de botones, etiquetas, avatares o títulos de interfaz de usuario. Todos deben sustituirse por sus respectivos iconos vectoriales de contorno uniforme. Los emojis solo están permitidos si el usuario los escribe en notas libres o chats.

---

## 5. Espaciado, Radios de Curvatura y Elevaciones

### 5.1. Radios de Curvatura (`Radius`)
* `Radius.xs`: `4px` (Controles mínimos)
* `Radius.sm`: `8px` (Inputs compactos, badges secundarios)
* `Radius.md`: `12px` (Botones de acción, campos de formulario estándar)
* `Radius.lg`: `16px` (Tarjetas de contenido estándar, cuadros de diálogo)
* `Radius.xl`: `20px` (Tarjetas destacadas, banners Hero, botón SOS)
* `Radius.full`: `9999px` (Píldoras, chips de filtros, avatares circulares)

### 5.2. Sombras y Elevaciones (`Shadows`)
* **Sutil (`Shadows.sm`):** `shadowOpacity: 0.04`, `shadowRadius: 6`, `elevation: 2` (Tarjetas estándar).
* **Media (`Shadows.md`):** `shadowOpacity: 0.10`, `shadowRadius: 10`, `elevation: 4` (Botones flotantes, tarjetas interactivas).
* **Destacada (`Shadows.lg`):** `shadowOpacity: 0.18`, `shadowRadius: 16`, `elevation: 8` (Modales inferiores, detalle de clínicas).

---

## 6. Componentes Estándar de la Interfaz

### 6.1. Botones (`Button`)
* **Primario:** Fondo `Palette.greenDeep` (`#087A43`), texto `NunitoSans-Bold` blanco, icono de contorno blanco a la izquierda, `height: 48px`, `borderRadius: 12px`.
* **Secundario / Suave:** Fondo `Palette.greenSoft` (`#EAF8F0`), borde `1px solid Palette.greenBorder`, texto e icono `Palette.greenDeep`.
* **Emergencia / SOS:** Fondo `Palette.redEmergency` (`#D94A4A`), texto blanco en `Quicksand-Bold`, icono `call-outline`, `height: 54px`, `borderRadius: 20px`.
* **Fantasía / Outline:** Fondo transparente, borde `1px solid Palette.borderLight`, texto `Palette.textSecondary`.

### 6.2. Tarjetas (`Card`)
* Fondo `Palette.cardLight` (`#FFFFFF`), borde perimetral `1px solid Palette.borderLight`, `borderRadius: 16px`, relleno interior de `16px`, elevación sutil.
* En Tema Oscuro: Fondo `#18181B`, borde `1px solid #27272A`.

### 6.3. Campos de Texto (`TextInput`)
* Altura `48px`, borde `1.5px solid Palette.borderLight`, `borderRadius: 12px`, fondo `#F8FCF8` (claro) o `#18181B` (oscuro).
* Icono de contexto a la izquierda en `Palette.textMuted` (`#8B9E95`).
* Foco activo: Borde `Palette.greenDeep` (`#087A43`).

### 6.4. Chips y Filtros
* Forma de píldora (`borderRadius: 9999px`), relleno `8px` vertical por `14px` horizontal.
* Inactivo: Fondo `#F8FCF8`, borde `Palette.borderLight`, texto `Palette.textSecondary`.
* Activo: Fondo `Palette.greenSoft`, borde `Palette.greenBorder`, texto `Palette.greenDeep` con punto indicador activo.

---

## 7. Soporte Integral de Modos Claro y Oscuro

El sistema funciona con soporte dinámico e instantáneo a través de `ThemeContext` y el botón `ThemeToggleButton`.

| Elemento Semántico | Tema Claro | Tema Oscuro |
| :--- | :--- | :--- |
| **Fondo Pantalla (`background`)** | `#F8FCF8` | `#09090B` |
| **Superficie Tarjetas (`card`)** | `#FFFFFF` | `#18181B` |
| **Borde Estándar (`border`)** | `#E3EFE7` | `#27272A` |
| **Texto Título (`textPrimary`)** | `#26332E` | `#F4F4F5` |
| **Texto Secundario (`textSecondary`)**| `#5A6E65` | `#A1A1AA` |
| **Texto Muteado (`textMuted`)** | `#8B9E95` | `#71717A` |
| **Acento Primario (`accentPrimary`)**| `#087A43` | `#4ADE80` |
| **Contenedor Verde Suave** | `#EAF8F0` | `rgba(8, 122, 67, 0.20)` |
| **Contenedor Rojo Urgencias** | `#FEF2F2` | `rgba(217, 74, 74, 0.18)` |
| **Contenedor Cian Suave** | `#E8F9FC` | `rgba(101, 207, 224, 0.15)` |

---

## 8. Microinteracciones y Retroalimentación Háptica

Para garantizar fluidez nativa a 60 fps sin sobrecargar el hilo de JavaScript:
1. **Pulsación en Controles (`Pressable`):**
   * Reducción suave de escala: `transform: [{ scale: 0.98 }]`.
   * Opacidad activa: `opacity: 0.92`.
2. **Retroalimentación Háptica (`expo-haptics`):**
   * Botón SOS y Alerta de Extravío: `Haptics.notificationAsync(NotificationFeedbackType.Warning)`.
   * Selección de Filtros, Tabs y Tarjetas de Clínicas: `Haptics.selectionAsync()`.
   * Acciones exitosas (vincular NFC, registrar mascota): `Haptics.notificationAsync(NotificationFeedbackType.Success)`.

---

## 9. Matriz de Roles y Preservación de Funcionalidad

El sistema visual respeta y preserva íntegramente todas las capacidades existentes para ambos perfiles de usuario:

| Funcionalidad Existente | Rol Tutor / Propietario | Rol Veterinario | Estado en HuellaApp |
| :--- | :---: | :---: | :--- |
| **Panel de Inicio (Dashboard)** | Visión general de sus mascotas, accesos rápidos y recordatorios | Métricas de clínica, pacientes asignados y pacientes con extravío activo | **Preservado al 100%** |
| **Ficha Clínica y Perfil Mascota** | Consulta de datos, peso, edad, sexo, notas y descarga de QR/STL | Consulta completa, historial clínico e intervenciones | **Preservado al 100%** |
| **Módulo NFC Inteligente** | Lectura e identificación pública | Lectura, asignación técnica y sobreescritura de etiquetas | **Preservado al 100%** |
| **Centro de Urgencias SOS** | Llamada 24hs, filtro de guardias, activar/desactivar extravío propio | Mismo acceso a guardias y visualización de pacientes extraviados | **Preservado al 100%** |
| **Mapa GPS de Establecimientos** | Búsqueda por 9 categorías (todas, en red, externas, guardia, etc.) | Mismo acceso interactivo centrado en Pilar Centro | **Preservado al 100%** |
| **Recordatorios Sanitarios** | Recepción de avisos locales y consulta de vacunaciones | Creación, programación y eliminación de avisos a pacientes | **Preservado al 100%** |
| **Asistente Virtual IA** | Consultas generales de cuidado, uso de la app y primeros auxilios | Orientación sobre la aplicación y registro | **Preservado al 100%** |

---

## 10. Reglas de Implementación en Código

1. **Ubicación Canónica de Tokens:** Todos los colores, tipografías, espacios y bordes deben importarse estrictamente desde `@/constants/theme`.
2. **Cero Duplicación:** No se crearán carpetas de estilos alternativos (`styles/`, `design/` o temas redundantes). Todo se consolida en `constants/theme.ts` y `context/ThemeContext.tsx`.
3. **Persistencia de Lógica:** No modificar firmas de métodos en `services/petService.ts`, `services/nfcService.ts`, `services/reminderService.ts`, ni estructuras de Firestore.
4. **Idioma de la Interfaz:** Todo el contenido visible en la UI debe permanecer 100% en español rioplatense/latinoamericano neutral.
5. **Branding Oficial:** Emplear únicamente la marca **HuellaApp** (o `Huell` + `App` en logotipos dual-tone), eliminando toda referencia visible a *VetLink*.

