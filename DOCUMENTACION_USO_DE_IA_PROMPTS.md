# Documentación del Uso de Inteligencia Artificial (Prompts)

Registro obligatorio de asistencia por IA en el desarrollo y modificación de pantallas de **VetLink**.

---

## Pantalla: Búsqueda y Mapa de Veterinarias y Servicios (`app/(tabs)/mapa.tsx`)

### 1. Información General
- **Integrante / Responsable:** Equipo VetLink
- **Herramienta:** Antigravity (Gemini 3.8 Flash)
- **¿Para qué se usó? (Objetivo):** Implementación integral de la pantalla de búsqueda y mapa interactivo con OpenStreetMap y Leaflet, cubriendo 15 puntos clave en Pilar Centro (clínicas veterinarias, hospitales 24hs, centro de zoonosis municipal, pet shops y farmacias), con geolocalización, filtros por tipo, guardia médica y tarjetas de detalle.

### 2. Prompts Utilizados

#### Prompt 1: Implementación del mapa interactivo híbrido
> "Necesito implementar la pantalla de 'Búsqueda y Mapa de Veterinarias' en `app/(tabs)/mapa.tsx` utilizando OpenStreetMap y Leaflet (sin requerir Google Maps API Key ni tarjeta de crédito)..."

#### Prompt 2: Integración de 15 puntos reales y categorizados de Pilar Centro
> "Vamos a actualizar la lista del mapa para cubrir tanto veterinarias como pet shops, farmacias y zoonosis de Pilar Centro:
> 1. En `constants/veterinarias.ts`, reemplazá los datos existentes por la constante provista `PUNTOS_VETERINARIOS_PILAR` (con sus 15 lugares y tipos categorizados).
> 2. En `services/veterinariasService.ts`, retorná directamente esta lista completa sin hacer peticiones externas.
> 3. En `app/(tabs)/mapa.tsx`:
>    - El contador superior debe reflejar el total cargado en la zona.
>    - En la barra de búsqueda o filtros, permití filtrar por nombre o tipo ('clinica', 'hospital', 'petshop', 'publico').
>    - El filtro 'Guardia 24hs' debe seguir funcionando evaluando `guardia24hs: true`.
>    - En la tarjeta inferior de detalle, mostrá el tipo de comercio, la dirección, los servicios y conectá el botón 'Llamar' al número provisto."

### 3. ¿Qué devolvió la IA?
- **Componente de Mapa Híbrido ([components/map/LeafletMapView.tsx](file:///c:/Users/franc/Vetlink/components/map/LeafletMapView.tsx)):** Integración de Leaflet con OpenStreetMap usando `iframe` para Web y `react-native-webview` para Android/iOS, sincronizado mediante `postMessage`.
- **Marcadores y Popups Visuales ([components/map/leafletHtml.ts](file:///c:/Users/franc/Vetlink/components/map/leafletHtml.ts)):** Iconografía y colores diferenciados para cada tipo de lugar (Hospital, Zoonosis, Clínica, Pet Shop, Farmacia).
- **Lista de Lugares y Servicios ([constants/veterinarias.ts](file:///c:/Users/franc/Vetlink/constants/veterinarias.ts)):** Definición de la interfaz `LugarMascotas` y exportación de `PUNTOS_VETERINARIOS_PILAR` con 15 entidades geolocalizadas.
- **Servicio Desacoplado ([services/veterinariasService.ts](file:///c:/Users/franc/Vetlink/services/veterinariasService.ts)):** Retorno directo de la lista sin latencias ni dependencias de servidores públicos.
- **Pantalla Principal ([app/(tabs)/mapa.tsx](file:///c:/Users/franc/Vetlink/app/%28tabs%29/mapa.tsx)):**
  - Contador superior dinámico con total de lugares cargados.
  - Barra de búsqueda por texto (nombre, calle, servicios o tipo).
  - Scroll horizontal de chips de filtrado rápido ("Todos", "Guardia 24hs", "Clínicas", "Hospitales", "Pet Shops", "Zoonosis / Público", "Farmacias").
  - Tarjeta de detalle flotante al seleccionar un punto con badge de categoría, horario, dirección, teléfono, tags de servicios y botones de acción ("Llamar" y "Cómo llegar").

### 4. Validación del Integrante
- **TypeScript & Linter:** Validación ejecutada con `npx tsc --noEmit` y `npm run lint` (`expo lint`) con 0 errores y 0 warnings.
- **Verificación funcional:** Pruebas de filtrado por categoría y búsqueda en tiempo real, selección de pines en el mapa Leaflet, apertura de enlace telefónico (`tel:`) y cálculo de distancias por geolocalización.

---

## Tabla Resumen de Asistencia con IA

| Pantalla | Módulo / Archivo | Herramienta | Objetivo | Estado |
|---|---|---|---|---|
| **Mapa de Veterinarias y Servicios** | `app/(tabs)/mapa.tsx` | Antigravity (Gemini 3.8 Flash) | Mapa Leaflet OSM, 15 lugares en Pilar, filtros por tipo, guardia 24hs y tarjeta de detalle | Validado (0 errores) |
