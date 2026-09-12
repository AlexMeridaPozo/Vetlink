# Registro de Uso de IA en VetLink (Para Google Docs)

Este documento contiene el registro del prompt utilizado para el diseño, interfaz y funcionalidad de la **pantalla de registro** de la aplicación **VetLink**, con formato simple y asignación por integrante para volcar directamente en Google Docs.

---

## US01 — Pantalla de Registro de Usuarios (`app/(auth)/register.tsx`)
- **Integrante / Responsable:** Alex Mérida Pozo *(o asignar integrante del equipo)*
- **Herramienta:** Antigravity (Gemini 3.7 Flash)
- **¿Para qué se usó? (Objetivo):** Diseñar y programar la pantalla de registro con sus campos de entrada, botones de selección de rol, validaciones visuales y conexión con Firebase.
- **Prompt utilizado:**
```text
Crea la pantalla de registro en app/(auth)/register.tsx para VetLink. Debe tener:
1. Interfaz limpia y moderna con campos para: Nombre completo, Email, Contraseña y Confirmar Contraseña.
2. Un selector interactivo de rol para elegir entre "Dueño de Mascota" y "Veterinario".
3. Validaciones visuales (que los campos no estén vacíos, formato correcto de email y contraseñas iguales).
4. Botón de registro con estado de carga (spinner) mientras se procesa la cuenta en Firebase.
5. Mensajes de error amigables y en español debajo de los campos o en alerta si falla el registro.
```
- **¿Qué devolvió la IA?:** El componente completo de React Native con estilos, estados locales (`useState`) para los inputs, selector de roles, validaciones visuales y la función de envío conectada a Firebase Authentication y Firestore.
- **Validación del integrante:** Se probó la pantalla en emulador y navegador web, verificando el diseño visual, la respuesta táctil de los botones, los mensajes de error y el registro exitoso del usuario.

---

## US02 — Pantalla de Login de Usuarios (`app/(auth)/login.tsx`)
- **Integrante / Responsable:** Alex Mérida Pozo *(o asignar integrante del equipo)*
- **Herramienta:** Antigravity (Gemini 3.7 Flash)
- **¿Para qué se usó? (Objetivo):** Diseñar y programar la pantalla de inicio de sesión manteniendo el mismo estilo que la pantalla de registro, con conexión a Firebase Authentication.
- **Prompt utilizado:**
```text
En base a la skill que agregue para que cumpla con las consignas, quiero agregar la pantalla de login en app/(auth)/login.tsx.
Debe tener:
1. Mismo estilo visual que register.tsx.
2. Campos para Email y Contraseña.
3. Validaciones de campos obligatorios.
4. Conexión con signInWithEmailAndPassword de Firebase.
5. Mensajes de error en español y botón con estado de carga.
```
- **¿Qué devolvió la IA?:** El código completo de React Native para la pantalla de login, actualización del enrutador de Expo, y documentación correspondiente.
- **Validación del integrante:** Se probó el acceso correcto a cuentas existentes, alertas en caso de contraseñas incorrectas o nulas.

---

## 📋 Tabla Resumen para Google Docs

| Integrante | Pantalla / Módulo | Herramienta | Resumen del Prompt | Resultado en la Pantalla | Validación Humana |
|---|---|---|---|---|---|
| Alex Mérida | Registro (`register.tsx`) | Antigravity | Crear formulario completo con selección de rol y validaciones | Pantalla interactiva con campos, selector de rol y estados de carga | Pruebas de diseño, inputs y registro en Firebase |
| Alex Mérida | Login (`login.tsx`) | Antigravity | Crear pantalla de inicio de sesión compatible visualmente y validaciones | Formulario de login interactivo con auth en Firebase | Pruebas de credenciales correctas e incorrectas |
