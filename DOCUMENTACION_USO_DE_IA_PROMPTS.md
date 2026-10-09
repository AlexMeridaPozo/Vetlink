# Registro de Uso de IA en VetLink (Para Google Docs)

Este documento contiene el registro del prompt utilizado para el diseño, interfaz y funcionalidad de la **pantalla de registro** de la aplicación **VetLink**, con formato simple y asignación por integrante para volcar directamente en Google Docs.

---

## US01 — Pantalla de Registro de Usuarios (`app/(auth)/register.tsx`)
- **Integrante / Responsable:** Alex Mérida Pozo *(o asignar integrante del equipo)*
- **Herramienta:** Antigravity (Gemini 3.7 Flash)
- **¿Para qué se usó? (Objetivo):** Diseñar y programar la pantalla de registro con sus campos de entrada, botones de selección de rol, validaciones visuales y conexión con Firebase.

```
- **¿Qué devolvió la IA?:** El componente completo de React Native con estilos, estados locales (`useState`) para los inputs, selector de roles, validaciones visuales y la función de envío conectada a Firebase Authentication y Firestore.
- **Validación del integrante:** Se probó la pantalla en emulador y navegador web, verificando el diseño visual, la respuesta táctil de los botones, los mensajes de error y el registro exitoso del usuario.

---

## US02 — Pantalla de Inicio de Sesión / Login (`app/(auth)/login.tsx`)
- **Integrante / Responsable:** Alex Mérida Pozo *(o asignar integrante del equipo)*
- **Herramienta:** Antigravity (Gemini 3.7 Flash)
- **¿Para qué se usó? (Objetivo):** Diseñar y programar la pantalla de inicio de sesión con campos de email y contraseña, validaciones visuales, conexión con Firebase Authentication y navegación cruzada al registro.

```
- **¿Qué devolvió la IA?:** El componente `LoginScreen` en React Native (`app/(auth)/login.tsx`) con estilos coherentes a la pantalla de registro, estados locales (`useState`), validaciones de campos obligatorios, integración con `signInWithEmailAndPassword` de Firebase Authentication, alertas amigables en español según códigos de error de Firebase y enlace de navegación a la pantalla de registro.
- **Validación del integrante:** Se probó el renderizado del formulario, validación de inputs vacíos, mensajes ante credenciales incorrectas, navegación hacia la pantalla de registro y login exitoso contra Firebase.

---

## US-QR — Generador de Códigos QR y Placas STL 3D Propios (`utils/qrGenerator.ts`, `utils/stlGenerator.ts`, `components/QRMascotaCard.tsx`)
- **Integrante / Responsable:** Alex Mérida Pozo *(o asignar integrante del equipo)*
- **Herramienta:** Antigravity (Gemini Flash)
- **¿Para qué se usó? (Objetivo):** Desarrollar un generador propio de códigos QR y un exportador de modelos 3D en formato STL sin dependencias externas de terceros, permitiendo visualizar el código de cada mascota y exportarlo en formato SVG o STL para impresión 3D física de placas identificatorias.

```
- **¿Qué devolvió la IA?:**
  1. `utils/qrGenerator.ts`: Algoritmo completo de matriz QR en TypeScript puro (versiones 1 a 10, corrección de errores Reed-Solomon ECC M, patrones de alineación y evaluación de máscaras) sin usar paquetes de terceros.
  2. `utils/stlGenerator.ts`: Generador binario de archivos STL con cálculo de normales y facetas triangulares en formato `ArrayBuffer` para una placa con relieve de los módulos oscuros.
  3. `components/QRMascotaCard.tsx`: Tarjeta interactiva con renderizado nativo en `<View>`, descarga/compartir en SVG y descarga/compartir en STL mediante `expo-file-system/legacy` y `expo-sharing`.
  4. Integración en pantalla de detalle (`app/mascotas/[id].tsx`) y en la lista de mascotas (`app/(tabs)/mascotas.tsx`) mediante botón rápido y modal inferior (bottom sheet).
- **Validación del integrante:** Verificación estricta de TypeScript (`npx tsc --noEmit`), validación de compatibilidad con Expo SDK 57 y pruebas de renderizado e interfaz en la app.
```

---

## 📋 Tabla Resumen para Google Docs

| Integrante | Pantalla / Módulo | Herramienta | Resumen del Prompt | Resultado en la Pantalla | Validación Humana |
|---|---|---|---|---|---|
| Alex Mérida | Registro (`register.tsx`) | Antigravity | Crear formulario completo con selección de rol y validaciones | Pantalla interactiva con campos, selector de rol y estados de carga | Pruebas de diseño, inputs y registro en Firebase |
| Alex Mérida | Login (`login.tsx`) | Antigravity | Agregar pantalla de login basándose en las reglas de la skill | Formulario de autenticación con Firebase, validaciones de email/password y enlace a registro | Pruebas de inputs, errores de credenciales y navegación |
| Alex Mérida | QR y Placas 3D (`utils/`, `QRMascotaCard.tsx`) | Antigravity | Crear generador QR propio y exportador STL sin librerías de terceros | Renderizado nativo del QR, exportación a SVG y archivo STL 3D | Verificación estricta con tsc, compatibilidad Expo SDK 57 y pruebas en UI |


