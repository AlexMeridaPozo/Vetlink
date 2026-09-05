# VetLink Development Skill

## 1. CONTEXTO DEL PROYECTO

El proyecto es VetLink, una aplicación móvil para la gestión y cuidado de mascotas.

Tecnologías principales:
- Expo
- React Native
- Firebase
- Firebase Authentication
- Cloud Firestore
- Firebase Storage cuando sea necesario
- Git
- GitHub
- Trello / Kanban
- Scrum

La aplicación debe desarrollarse respetando la consigna académica del Proyecto Integrador Final de Aplicaciones Móviles.

La IA funciona como asistente técnico y metodológico.
La IA NO reemplaza al equipo de desarrollo.

Todo código generado por IA debe ser revisado, comprendido, probado y defendible por los integrantes del equipo.

---

# 2. REGLAS GENERALES

Antes de modificar código:

1. Analizar la estructura existente del proyecto.
2. Identificar qué archivos están relacionados con la tarea.
3. Revisar implementaciones existentes antes de crear nuevas.
4. Evitar duplicar lógica o componentes.
5. Explicar brevemente qué se va a modificar.
6. No modificar archivos que no sean necesarios.
7. No eliminar código existente sin justificación.
8. No cambiar arquitectura sin autorización del usuario.
9. No inventar requisitos que no estén definidos.
10. Mantener compatibilidad con Expo + React Native + Firebase.

La IA debe priorizar reutilización, claridad, mantenimiento y simplicidad.

---

# 3. TRABAJO POR USER STORIES

El desarrollo debe realizarse principalmente mediante User Stories.

Ejemplo:

US01 — Registro de usuario

Como dueño de una mascota,
quiero crear una cuenta,
para acceder a VetLink.

Criterios de aceptación:
- Nombre obligatorio.
- Email obligatorio.
- Contraseña obligatoria.
- Validación de campos.
- Registro exitoso.
- Persistencia mediante Firebase Authentication.

La IA debe trabajar sobre una User Story concreta antes de implementar.

No debe intentar desarrollar todo el proyecto de una sola vez.

Proceso recomendado:

1. Analizar User Story.
2. Revisar criterios de aceptación.
3. Analizar código existente.
4. Proponer implementación.
5. Implementar.
6. Probar.
7. Corregir errores.
8. Verificar criterios de aceptación.
9. Preparar cambios para Git.
10. Documentar uso de IA.

---

# 4. ARQUITECTURA

Mantener una estructura organizada.

Ejemplo:

VetLink/
├── app/
├── components/
├── config/
├── context/
├── services/
├── firebase/
├── assets/
├── hooks/
├── constants/
├── .agent/
│   └── skills/
│       └── vetlink-development/
│           └── SKILL.md
└── package.json

No crear carpetas innecesarias.

Si se necesita una nueva carpeta, explicar por qué.

---

# 5. FIREBASE

Firebase debe utilizarse de acuerdo con las necesidades del proyecto.

Utilizar:
- Firebase Authentication para autenticación.
- Firestore para datos persistentes.
- Storage para archivos/imágenes cuando sea necesario.

Nunca:

- Exponer claves privadas.
- Subir archivos .env con secretos.
- Guardar contraseñas manualmente.
- Desactivar reglas de seguridad para "hacer funcionar" una funcionalidad.
- Confiar únicamente en validaciones del frontend.

Toda información sensible debe manejarse de forma segura.

---

# 6. VALIDACIONES

Las funcionalidades deben validar correctamente los datos.

Ejemplos:

Registro:
- Nombre obligatorio.
- Email válido.
- Contraseña válida.
- Evitar registros duplicados.

La validación visual del frontend no reemplaza las validaciones necesarias del backend/Firebase.

Los mensajes de error deben ser claros para el usuario.

---

# 7. ROLES

VetLink puede manejar diferentes roles, por ejemplo:

- Dueño de mascota.
- Veterinario.
- Veterinaria/Clínica.

La información y las acciones disponibles deben respetar el rol correspondiente.

No permitir que un usuario acceda o modifique información que no le corresponde.

La IA debe preguntar o analizar el sistema existente antes de implementar permisos nuevos.

---

# 8. UI / UX

La interfaz debe mantener coherencia visual.

Respetar:
- Colores existentes.
- Tipografías.
- Espaciados.
- Componentes reutilizables.
- Navegación.
- Diseño realizado en Figma.

Si existe un diseño de Figma, utilizarlo como referencia visual y funcional.

No cambiar arbitrariamente el diseño aprobado.

---

# 9. GITHUB — REGLA FUNDAMENTAL

El repositorio oficial del proyecto está en GitHub.

La rama principal es:

main

NUNCA trabajar directamente sobre main para desarrollar una User Story.

Cada User Story debe tener su propia rama.

Formato:

feature/us01-registro
feature/us02-login
feature/us03-mascotas
feature/us04-historial

Ejemplo:

US01 → feature/us01-registro

US02 → feature/us02-login

---

# 10. INICIO DE UNA USER STORY

Antes de comenzar una nueva User Story:

1. Actualizar la rama main.

Comandos:

git switch main

git pull origin main

2. Crear la rama correspondiente:

git switch -c feature/us02-login

3. Comprobar la rama:

git branch

La rama activa debe ser la correspondiente a la User Story.

---

# 11. TRABAJO EN LA RAMA

Mientras se desarrolla una User Story:

- Trabajar únicamente en su rama.
- No hacer commits directamente en main.
- No mezclar User Stories diferentes en un mismo commit.
- No modificar funcionalidades ajenas sin necesidad.
- Mantener cambios pequeños y comprensibles.

Si se descubre un problema independiente de la User Story actual, informarlo antes de modificarlo.

---

# 12. COMMITS

Los commits deben ser claros y descriptivos.

Utilizar Conventional Commits cuando sea posible.

Formato:

tipo: descripción

Tipos principales:

feat:
Nueva funcionalidad.

fix:
Corrección de un error.

refactor:
Refactorización sin cambiar comportamiento.

style:
Cambios de estilo/formato.

test:
Pruebas.

docs:
Documentación.

chore:
Configuración o tareas auxiliares.

Ejemplos:

feat: implementar registro de usuario

fix: corregir validación de email

feat: agregar inicio de sesión con Firebase

fix: corregir navegación después del registro

test: agregar validaciones de registro

docs: documentar configuración de Firebase

Evitar commits como:

"cambios"

"cosas"

"arreglos"

"final"

"final final"

"ahora si"

---

# 13. COMMITS Y PARTICIPACIÓN DEL EQUIPO

Cada integrante debe realizar sus propios commits utilizando su propia cuenta de GitHub.

NO utilizar la cuenta de otro integrante.

NO hacer todos los commits desde una única cuenta.

El historial de GitHub debe reflejar la participación real de los integrantes.

La IA nunca debe inventar autores de commits.

La IA nunca debe falsificar contribuciones.

---

# 14. CUÁNDO HACER COMMIT

No esperar necesariamente hasta terminar toda la User Story para realizar un único commit gigante.

Se pueden realizar commits pequeños y lógicos.

Ejemplo:

feat: crear pantalla de registro

feat: agregar validación de campos

feat: integrar registro con Firebase

fix: corregir mensaje de error de email

Esto permite entender mejor la evolución del desarrollo.

---

# 15. PUSH

Después de realizar commits:

git push -u origin feature/us02-login

Para una rama que ya está vinculada:

git push

La IA debe explicar qué se está subiendo antes de hacerlo si tiene acceso a ejecutar comandos.

---

# 16. PULL REQUEST

Cuando una User Story está terminada:

Rama:

feature/us02-login

debe generar un:

Pull Request

hacia:

main

Ejemplo:

feature/us02-login → main

El Pull Request debe permitir revisar:

- Archivos modificados.
- Código agregado.
- Código eliminado.
- Criterios de aceptación.
- Pruebas realizadas.

No hacer merge automáticamente sin autorización del usuario/equipo.

---

# 17. MERGE

El Merge debe realizarse después de:

1. Terminar la implementación.
2. Probar la funcionalidad.
3. Verificar criterios de aceptación.
4. Revisar el Pull Request.
5. Confirmar que no existen errores conocidos.
6. Obtener la aprobación correspondiente del equipo.

Después del Merge:

main contiene la User Story terminada.

---

# 18. ACTUALIZAR EL PROYECTO DESPUÉS DE UN MERGE

Cuando una User Story fue mergeada:

git switch main

git pull origin main

La siguiente User Story debe comenzar desde este main actualizado.

Ejemplo:

US01 fue mergeada.

Luego:

git switch main
git pull origin main
git switch -c feature/us02-login

Así US02 comienza con todo el código de US01.

---

# 19. NO HACER FORCE PUSH

Nunca utilizar:

git push --force

ni:

git push -f

sobre main.

Tampoco utilizar comandos destructivos como:

git reset --hard

git clean -fd

sin autorización explícita del usuario y sin comprobar primero qué cambios se perderían.

Si existe un problema con Git, primero analizar:

git status

git branch -vv

git log --oneline --graph --all

---

# 20. ANTES DE COMENZAR A PROGRAMAR

La IA debe comprobar:

- Rama actual.
- Estado del repositorio.
- Último commit.
- Cambios sin guardar.
- User Story que se está implementando.

Comandos útiles:

git status

git branch

git log --oneline --max-count=10

No asumir que el usuario está en la rama correcta.

---

# 21. TESTING

Cada User Story debe probarse antes del Pull Request.

La IA debe proponer casos de prueba relacionados con los criterios de aceptación.

Ejemplo para registro:

1. Registro correcto.
2. Nombre vacío.
3. Email vacío.
4. Contraseña vacía.
5. Email inválido.
6. Email ya registrado.
7. Contraseña débil.
8. Error de conexión.
9. Pulsaciones múltiples del botón.
10. Verificar que el usuario realmente aparece en Firebase.

No considerar una User Story terminada únicamente porque la pantalla "se ve bien".

---

# 22. CRITERIOS DE ACEPTACIÓN

Antes de considerar una User Story como terminada:

Preguntar/verificar:

- ¿Cumple todos los criterios?
- ¿Se probó el flujo correcto?
- ¿Se probaron errores?
- ¿Se guardan correctamente los datos?
- ¿La navegación funciona?
- ¿Firebase responde correctamente?
- ¿Hay errores en consola?
- ¿El código es comprensible?

Si algún criterio no se cumple, la User Story NO debe marcarse como Done.

---

# 23. TRELLO / SCRUM

Las User Stories deben seguir un flujo similar a:

Product Backlog
↓
Sprint Backlog
↓
En desarrollo
↓
Testing
↓
Done

GitHub y Trello deben mantenerse coherentes.

Ejemplo:

US02 comienza:
Trello → En desarrollo

Se termina programación:
Trello → Testing

Se verifica correctamente:
Trello → Done

Luego se realiza/termina el Merge correspondiente.

---

# 24. PRODUCT OWNER Y SCRUM MASTER

Product Owner:
- Prioriza Product Backlog.
- Define/valida necesidades del producto.
- Valida criterios de aceptación.
- Decide si la funcionalidad cumple el objetivo del producto.

Scrum Master:
- Facilita el proceso Scrum.
- Ayuda a eliminar impedimentos.
- Facilita reuniones y coordinación.
- Ayuda a mantener el flujo de trabajo.

Developers:
- Diseñan la solución técnica.
- Programan.
- Prueban.
- Hacen commits.
- Crean ramas.
- Participan en Pull Requests.
- Mantienen el código.

La IA no debe tratar al Product Owner o Scrum Master como jefe técnico de los Developers.

---

# 25. USO DE INTELIGENCIA ARTIFICIAL

La IA está permitida como apoyo metodológico y técnico.

Puede utilizarse para:

- Análisis.
- Arquitectura.
- Código.
- UI/UX.
- Firebase.
- Debugging.
- Refactorización.
- Tests.
- Documentación.
- Explicaciones.
- Generación de datos de prueba.

Sin embargo:

La IA NO reemplaza al equipo.

Todo código generado debe ser:

1. Revisado.
2. Probado.
3. Comprendido.
4. Validado.
5. Defendible por el equipo.

---

# 26. DOCUMENTACIÓN DEL USO DE IA

Cada utilización importante de IA debe poder documentarse.

Registrar:

- Herramienta utilizada.
- Propósito.
- Prompt o descripción de la solicitud.
- Resultado obtenido.
- Cambios realizados por el equipo.
- Validaciones/pruebas realizadas.

Ejemplo:

Herramienta:
Antigravity / ChatGPT

Propósito:
Implementación de registro de usuarios.

Prompt:
"Implementar el registro de usuario de VetLink utilizando Firebase Authentication..."

Resultado:
Generación inicial de pantalla y lógica de registro.

Validación:
El equipo revisó el código y realizó pruebas de registro, errores de email y contraseña.

---

# 27. LA IA NO DEBE OCULTAR SU PARTICIPACIÓN

No afirmar que un código fue escrito manualmente si fue generado mediante IA.

La utilización de IA debe documentarse de manera transparente.

El equipo es responsable del resultado final independientemente de que el código haya sido generado con IA.

---

# 28. REGLAS PARA ANTIGRAVITY

Antes de realizar cambios importantes, Antigravity debe responder:

## Análisis
Qué entiende de la tarea.

## Archivos afectados
Qué archivos necesita modificar.

## Plan
Qué cambios realizará.

Después puede implementar.

Al finalizar:

## Implementación
Qué hizo.

## Testing
Qué probó.

## Criterios de aceptación
Qué criterios se cumplen.

## Git
Qué cambios quedaron listos para commit.

## IA
Qué parte fue realizada con asistencia de IA.

No hacer commit automáticamente salvo que el usuario lo solicite explícitamente.

No hacer push automáticamente salvo que el usuario lo solicite explícitamente.

No hacer merge automáticamente.

No modificar main directamente para implementar User Stories.

---

# 29. FORMATO DE RESPUESTA DE LA IA

Para tareas de desarrollo importantes utilizar:

## Análisis
Descripción breve del problema.

## Archivos afectados
Lista de archivos.

## Plan
Pasos de implementación.

## Implementación
Cambios realizados.

## Testing
Pruebas realizadas.

## Criterios de aceptación
Checklist:

- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## Git
Indicar:

Rama:
feature/usXX-nombre

Commit sugerido:
feat: descripción

## IA
Indicar qué parte fue realizada con asistencia de IA.

---

# 30. REGLA FINAL

Priorizar siempre:

1. Cumplimiento de la consigna.
2. Funcionamiento real.
3. Seguridad.
4. Calidad del código.
5. Comprensión por parte del equipo.
6. Trabajo colaborativo.
7. Historial correcto de Git.
8. Trazabilidad de User Stories.
9. Documentación.
10. Simplicidad.

Nunca sacrificar el funcionamiento o la seguridad solamente para terminar una tarea más rápido.