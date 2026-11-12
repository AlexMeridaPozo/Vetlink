import { Veterinaria } from '@/constants/veterinarias';

interface GenerateLeafletHtmlParams {
  initialLat: number;
  initialLng: number;
  zoom?: number;
  veterinarias: Veterinaria[];
  userLocation?: { latitude: number; longitude: number } | null;
  isDark?: boolean;
}

export function generateLeafletHtml({
  initialLat,
  initialLng,
  zoom = 13,
  veterinarias,
  userLocation,
  isDark = false,
}: GenerateLeafletHtmlParams): string {
  const veterinariasJson = JSON.stringify(veterinarias).replace(/</g, '\\u003c');
  const userLocationJson = JSON.stringify(userLocation || null).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>HuellaApp Mapa</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: ${isDark ? '#09090b' : '#f8fafc'};
    }
    #map {
      width: 100%;
      height: 100%;
      background-color: ${isDark ? '#09090b' : '#f8fafc'};
    }
    
    ${
      isDark
        ? `
      /* Filtro elegante modo oscuro para tiles de OpenStreetMap */
      .leaflet-tile {
        filter: brightness(0.65) invert(1) contrast(1.15) hue-rotate(200deg) saturate(0.35) !important;
      }
      .leaflet-container {
        background: #09090b !important;
      }
      .leaflet-bar a {
        background-color: #18181b !important;
        color: #f4f4f5 !important;
        border-color: #27272a !important;
      }
      .leaflet-bar a:hover {
        background-color: #27272a !important;
      }
    `
        : `
      .leaflet-bar a {
        background-color: #ffffff !important;
        color: #0f172a !important;
        border-color: #e2e8f0 !important;
      }
      .leaflet-bar a:hover {
        background-color: #f1f5f9 !important;
      }
    `
    }

    /* Marcador de usuario con pulso animado */
    .user-marker-container {
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-marker-pulse {
      position: absolute;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(14, 165, 233, 0.35);
      animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    .user-marker-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #0ea5e9;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      position: relative;
      z-index: 2;
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    /* Marcador de veterinarias: Verde (En Huellapp) vs Gris (No adherida) */
    .vet-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .vet-marker:hover, .vet-marker.active {
      transform: scale(1.15) translateY(-4px);
      z-index: 9999 !important;
    }
    .vet-bubble {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      border: 2.5px solid #ffffff;
    }
    /* EN HUELLAPP -> VERDE VIBRANTE */
    .vet-marker.huellapp-on .vet-bubble {
      background: linear-gradient(135deg, #04b639, #059669) !important;
      box-shadow: 0 4px 14px rgba(4, 182, 57, 0.5) !important;
      border-color: #ffffff !important;
      color: #ffffff !important;
    }
    .vet-marker.huellapp-on .vet-arrow {
      border-top-color: #059669 !important;
    }

    /* SOLO VETERINARIAS NO ADHERIDAS -> GRIS NEUTRO */
    .vet-marker.huellapp-off.clinica .vet-bubble {
      background: linear-gradient(135deg, #94a3b8, #64748b) !important;
      box-shadow: 0 4px 10px rgba(100, 116, 139, 0.35) !important;
      border-color: #e2e8f0 !important;
      color: #f8fafc !important;
    }
    .vet-marker.huellapp-off.clinica .vet-arrow {
      border-top-color: #64748b !important;
    }

    /* OTRAS CATEGORÍAS MANTIENEN SU COLOR IDENTIFICATIVO */
    .vet-marker.guardia .vet-bubble, .vet-marker.hospital .vet-bubble {
      background: linear-gradient(135deg, #e11d48, #be123c) !important;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4) !important;
    }
    .vet-marker.guardia .vet-arrow, .vet-marker.hospital .vet-arrow {
      border-top-color: #be123c !important;
    }
    .vet-marker.petshop .vet-bubble {
      background: linear-gradient(135deg, #f59e0b, #d97706) !important;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4) !important;
    }
    .vet-marker.petshop .vet-arrow {
      border-top-color: #d97706 !important;
    }
    .vet-marker.publico .vet-bubble {
      background: linear-gradient(135deg, #0284c7, #0369a1) !important;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4) !important;
    }
    .vet-marker.publico .vet-arrow {
      border-top-color: #0369a1 !important;
    }
    .vet-marker.farmacia .vet-bubble {
      background: linear-gradient(135deg, #0d9488, #0f766e) !important;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4) !important;
    }
    .vet-marker.farmacia .vet-arrow {
      border-top-color: #0f766e !important;
    }

    .vet-arrow {
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 7px solid #059669;
      margin-top: -1px;
    }

    /* Mini Leyenda en el mapa */
    .map-huellapp-legend {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 1000;
      background: ${isDark ? 'rgba(24, 24, 27, 0.92)' : 'rgba(255, 255, 255, 0.94)'};
      backdrop-filter: blur(8px);
      border: 1px solid ${isDark ? '#27272a' : '#e2e8f0'};
      padding: 7px 11px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      font-size: 11px;
      font-weight: 700;
      color: ${isDark ? '#f4f4f5' : '#0f172a'};
      pointer-events: none;
    }
    .legend-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .ind-green {
      background: #04b639;
      box-shadow: 0 0 6px rgba(4, 182, 57, 0.6);
    }
    .ind-gray {
      background: #64748b;
    }

    /* Popup elegante */
    .leaflet-popup-content-wrapper {
      background: ${isDark ? '#18181b' : '#ffffff'};
      color: ${isDark ? '#f4f4f5' : '#0f172a'};
      border-radius: 16px;
      padding: 0;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid ${isDark ? '#27272a' : '#e2e8f0'};
    }
    .leaflet-popup-content {
      margin: 0;
      padding: 14px 16px;
      min-width: 220px;
      line-height: 1.4;
    }
    .leaflet-popup-tip {
      background: ${isDark ? '#18181b' : '#ffffff'};
    }
    .popup-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      margin-bottom: 0;
    }
    .popup-huellapp-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .badge-huellapp-on {
      background: ${isDark ? 'rgba(4, 182, 57, 0.25)' : '#dcfce7'};
      color: ${isDark ? '#4ade80' : '#15803d'};
      border: 1px solid ${isDark ? '#059669' : '#86efac'};
    }
    .badge-huellapp-off {
      background: ${isDark ? 'rgba(100, 116, 139, 0.25)' : '#f1f5f9'};
      color: ${isDark ? '#94a3b8' : '#64748b'};
      border: 1px solid ${isDark ? '#475569' : '#cbd5e1'};
    }
    .badge-guardia, .badge-hospital {
      background: ${isDark ? 'rgba(244, 63, 94, 0.2)' : '#ffe4e6'};
      color: ${isDark ? '#fb7185' : '#e11d48'};
    }
    .badge-petshop {
      background: ${isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7'};
      color: ${isDark ? '#fbbf24' : '#b45309'};
    }
    .badge-publico {
      background: ${isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe'};
      color: ${isDark ? '#38bdf8' : '#0369a1'};
    }
    .badge-farmacia {
      background: ${isDark ? 'rgba(13, 148, 136, 0.2)' : '#ccfbf1'};
      color: ${isDark ? '#2dd4bf' : '#0f766e'};
    }
    .badge-normal, .badge-clinica {
      background: ${isDark ? 'rgba(4, 182, 57, 0.2)' : '#dcfce7'};
      color: ${isDark ? '#4ade80' : '#15803d'};
    }
    .popup-inner {
      cursor: pointer;
    }
    .popup-title {
      font-size: 15px;
      font-weight: 700;
      color: ${isDark ? '#f4f4f5' : '#0f172a'};
      margin-bottom: 4px;
    }
    .popup-address {
      font-size: 12px;
      color: ${isDark ? '#a1a1aa' : '#64748b'};
      margin-bottom: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .leaflet-container a.leaflet-popup-close-button {
      color: ${isDark ? '#a1a1aa' : '#94a3b8'};
      padding: 8px 10px 0 0;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="map-huellapp-legend">
    <div class="legend-row">
      <span class="legend-indicator ind-green"></span>
      <span>En HuellaApp</span>
    </div>
    <div class="legend-row">
      <span class="legend-indicator ind-gray"></span>
      <span>Clínica externa</span>
    </div>
  </div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function() {
      var map;
      var markers = {};
      var userMarker = null;
      var veterinariasData = ${veterinariasJson};
      var initialUserLoc = ${userLocationJson};

      function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function notifyParent(data) {
        try {
          var payload = JSON.stringify(data);
          // Móvil (React Native WebView)
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(payload);
          }
          // Web (iframe parent)
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(payload, '*');
          }
        } catch(e) {
          console.error('[Leaflet] Error al notificar a la app:', e);
        }
      }

      // Inicializar mapa
      map = L.map('map', {
        zoomControl: false,
        attributionControl: false
      }).setView([${initialLat}, ${initialLng}], ${zoom});

      // Controles de zoom abajo a la derecha
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Attribution discreto abajo a la izquierda
      L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>')
        .addTo(map);

      // Tiles estándar de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Icono de usuario
      function updateUserMarker(lat, lng) {
        if (!lat || !lng) return;
        var userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: '<div class="user-marker-container"><div class="user-marker-pulse"></div><div class="user-marker-dot"></div></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        if (userMarker) {
          userMarker.setLatLng([lat, lng]);
        } else {
          userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
          userMarker.bindPopup('<b>Tu ubicación actual</b>');
        }
      }

      if (initialUserLoc && initialUserLoc.latitude && initialUserLoc.longitude) {
        updateUserMarker(initialUserLoc.latitude, initialUserLoc.longitude);
      }

      // Renderizar marcadores de veterinarias
      function renderVeterinarias(data) {
        Object.keys(markers).forEach(function(k) {
          try {
            map.removeLayer(markers[k]);
          } catch(e) {}
        });
        markers = {};

        if (!Array.isArray(data)) return;

        data.forEach(function(vet) {
          if (!vet) return;
          var lat = typeof vet.lat === 'number' ? vet.lat : (vet.coordenadas ? vet.coordenadas.latitude : null);
          var lng = typeof vet.lng === 'number' ? vet.lng : (vet.coordenadas ? vet.coordenadas.longitude : null);
          if (typeof lat !== 'number' || typeof lng !== 'number') {
            return;
          }
          var is24hs = Boolean(vet.guardia24hs);
          var isHuellapp = (vet.enHuellapp === true || vet.enVetlink === true);
          var tipo = vet.tipo || (is24hs ? 'hospital' : 'clinica');

          var markerClass = 'vet-marker ' + (isHuellapp ? 'huellapp-on' : 'huellapp-off') + ' ' + tipo + (is24hs ? ' guardia' : '');

          var badgeClass = 'badge-' + (is24hs ? 'guardia' : tipo);
          var badgeText = (function() {
            if (is24hs) return 'Guardia 24hs';
            if (tipo === 'hospital') return 'Hospital 24hs';
            if (tipo === 'publico') return 'Zoonosis / Público';
            if (tipo === 'petshop') return 'Pet Shop';
            if (tipo === 'farmacia') return 'Farmacia';
            return 'Clínica';
          })();

          var huellappBadgeHtml = isHuellapp
            ? '<span class="popup-huellapp-badge badge-huellapp-on">✓ En Red HuellaApp</span>'
            : '<span class="popup-huellapp-badge badge-huellapp-off">✕ No adherida</span>';

          var iconSvg = (function() {
            if (is24hs || tipo === 'hospital') {
              return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12M6 12h12"/></svg>';
            }
            if (tipo === 'petshop') {
              return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
            }
            if (tipo === 'publico') {
              return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 10-5 10 5v5c0 5.5-4 10-10 12C6 22 2 17.5 2 12V7z"/></svg>';
            }
            if (tipo === 'farmacia') {
              return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
            }
            return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>';
          })();

          var safeId = escapeHtml(vet.id || '');
          var safeNombre = escapeHtml(vet.nombre || 'Veterinaria');
          var safeDireccion = escapeHtml(vet.direccion || '');

          var iconHtml = '<div class="' + markerClass + '" id="pin-' + safeId + '">' +
            '<div class="vet-bubble">' + iconSvg + '</div>' +
            '<div class="vet-arrow"></div>' +
          '</div>';

          var vetIcon = L.divIcon({
            className: 'custom-vet-icon',
            html: iconHtml,
            iconSize: [38, 45],
            iconAnchor: [19, 45],
            popupAnchor: [0, -45]
          });

          var popupContent = '' +
            '<div class="popup-inner" data-vet-id="' + safeId + '" onclick="window.selectVet(this.getAttribute(\\'data-vet-id\\'))">' +
              '<div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px;">' +
                huellappBadgeHtml +
                '<span class="popup-badge ' + badgeClass + '">' + badgeText + '</span>' +
              '</div>' +
              '<h3 class="popup-title">' + safeNombre + '</h3>' +
              '<p class="popup-address">📍 ' + safeDireccion + '</p>' +
            '</div>';

          var marker = L.marker([lat, lng], {
            icon: vetIcon,
            title: vet.nombre
          }).addTo(map);

          marker.bindPopup(popupContent);

          marker.on('click', function() {
            notifyParent({ type: 'SELECT_CLINIC', id: vet.id });
          });

          markers[vet.id] = marker;
        });
      }

      // Render inicial
      renderVeterinarias(veterinariasData);

      // Clics en el mapa general
      map.on('click', function(e) {
        if (!e.originalEvent.defaultPrevented) {
          notifyParent({ type: 'MAP_TAP' });
        }
      });

      // API pública accesible desde ventana o mensajes
      window.selectVet = function(id) {
        notifyParent({ type: 'SELECT_CLINIC', id: id });
      };

      window.setVeterinarias = function(data) {
        renderVeterinarias(data);
      };

      window.focusClinic = function(id) {
        var marker = markers[id];
        if (marker) {
          var latlng = marker.getLatLng();
          map.flyTo(latlng, 16, { animate: true, duration: 1.0 });
          marker.openPopup();
        }
      };

      window.centerOnUser = function(lat, lng) {
        if (lat && lng) {
          updateUserMarker(lat, lng);
          map.flyTo([lat, lng], 15, { animate: true, duration: 1.0 });
        }
      };

      window.fitAll = function() {
        var group = [];
        Object.keys(markers).forEach(function(k) {
          group.push(markers[k].getLatLng());
        });
        if (userMarker) {
          group.push(userMarker.getLatLng());
        }
        if (group.length > 0) {
          map.fitBounds(L.latLngBounds(group), { padding: [50, 50], maxZoom: 16 });
        }
      };

      // Escuchar mensajes entrantes (Web iframe o injectJavaScript)
      window.addEventListener('message', function(event) {
        try {
          var msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (!msg || !msg.action) return;

          if (msg.action === 'FOCUS_CLINIC') {
            window.focusClinic(msg.id);
          } else if (msg.action === 'CENTER_USER') {
            window.centerOnUser(msg.lat, msg.lng);
          } else if (msg.action === 'FIT_ALL') {
            window.fitAll();
          } else if (msg.action === 'SET_CLINICS') {
            window.setVeterinarias(msg.data);
          }
        } catch(err) {
          // ignore invalid json
        }
      });

      // Notificar que el mapa terminó de cargar
      setTimeout(function() {
        notifyParent({ type: 'MAP_READY' });
      }, 300);

    })();
  </script>
</body>
</html>`;
}
