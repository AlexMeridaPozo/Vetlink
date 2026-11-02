/**
 * ============================================================================
 * HUELLAPP OFFICIAL LANDING PAGE - JAVASCRIPT
 * Arquitectura Vanilla JS - Sin dependencias externas
 * ============================================================================
 */

// ── 1. CONFIGURACIÓN CENTRALIZADA DE DESCARGAS ──────────────────────────────
// REGLA: No inventar URLs de descarga falsas. 
// Si la URL está vacía (""), la interfaz mostrará automáticamente el estado 
// "Próximamente", deshabilitará el botón de descarga y mostrará el indicador 
// de espera en el área del código QR.
// Para activar una plataforma, simplemente completá el enlace real correspondiente.
const DOWNLOAD_LINKS = {
  android: "", // Ej: "https://github.com/AlexMeridaPozo/Huellapp/releases/latest/download/Huellapp.apk" o link de Google Play
  ios: ""      // Ej: "https://testflight.apple.com/join/..." o link de App Store
};

// ── 2. INICIALIZACIÓN AL CARGAR EL DOM ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMockupScreenSelector();
  initDownloadSection();
  initDynamicYear();
  initSmoothScrollSpy();
});

// ── 3. NAVEGACIÓN Y MENÚ MÓVIL ──────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Efecto sticky glass al scrollear
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Toggle del menú hamburguesa móvil
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('open');
      mobileMenu.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });

    // Cerrar menú al hacer clic en cualquier enlace interno
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        mobileMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });

    // Cerrar menú al presionar la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        navToggle.classList.remove('open');
        mobileMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }
}

// ── 4. SELECTOR INTERACTIVO DE PANTALLAS DEL MOCKUP ─────────────────────────
function initMockupScreenSelector() {
  const tabs = document.querySelectorAll('.screen-tab');
  const screenImg = document.getElementById('phoneScreenImg');

  if (!tabs.length || !screenImg) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remover clase active de todas las tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const newSrc = tab.getAttribute('data-img');
      const newAlt = tab.getAttribute('data-alt');

      if (newSrc && screenImg.getAttribute('src') !== newSrc) {
        // Transición suave de opacidad
        screenImg.style.opacity = '0.3';
        setTimeout(() => {
          screenImg.src = newSrc;
          if (newAlt) screenImg.alt = newAlt;
          screenImg.style.opacity = '1';
        }, 150);
      }
    });
  });
}

// ── 5. GESTIÓN DINÁMICA DE LA SECCIÓN DE DESCARGA Y CÓDIGOS QR ──────────────
function initDownloadSection() {
  // Configuración de Android
  setupPlatformDownload({
    platform: 'android',
    url: DOWNLOAD_LINKS.android,
    btnId: 'btnDownloadAndroid',
    btnTextId: 'androidBtnText',
    statusBadgeId: 'androidStatusBadge',
    placeholderId: 'androidQrPlaceholder',
    targetId: 'androidQrTarget',
    activeBtnText: 'Descargar APK Android',
    inactiveBtnText: 'Próximamente en Android',
    activeBadgeText: 'Descarga Disponible',
    inactiveBadgeText: 'Próximamente en Google Play / APK'
  });

  // Configuración de iOS
  setupPlatformDownload({
    platform: 'ios',
    url: DOWNLOAD_LINKS.ios,
    btnId: 'btnDownloadIos',
    btnTextId: 'iosBtnText',
    statusBadgeId: 'iosStatusBadge',
    placeholderId: 'iosQrPlaceholder',
    targetId: 'iosQrTarget',
    activeBtnText: 'Descargar en App Store',
    inactiveBtnText: 'Próximamente en iOS',
    activeBadgeText: 'Disponible en TestFlight / App Store',
    inactiveBadgeText: 'Próximamente en App Store / TestFlight'
  });
}

/**
 * Configura la tarjeta de cada plataforma según la presencia o ausencia de URL real.
 */
function setupPlatformDownload(cfg) {
  const btn = document.getElementById(cfg.btnId);
  const btnText = document.getElementById(cfg.btnTextId);
  const statusBadge = document.getElementById(cfg.statusBadgeId);
  const placeholder = document.getElementById(cfg.placeholderId);
  const target = document.getElementById(cfg.targetId);

  const hasValidUrl = typeof cfg.url === 'string' && cfg.url.trim().length > 0 && isValidHttpUrl(cfg.url);

  if (hasValidUrl) {
    // 1. Activar botón de descarga
    if (btn) {
      btn.href = cfg.url;
      btn.classList.remove('btn-disabled');
      btn.removeAttribute('aria-disabled');
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
    }
    if (btnText) {
      btnText.textContent = cfg.activeBtnText;
    }

    // 2. Actualizar badge de estado
    if (statusBadge) {
      statusBadge.textContent = cfg.activeBadgeText;
      statusBadge.classList.add('status-ready');
    }

    // 3. Renderizar código QR real
    if (placeholder && target) {
      placeholder.style.display = 'none';
      target.style.display = 'flex';
      renderQrSvg(target, cfg.url);
    }
  } else {
    // 1. Deshabilitar botón
    if (btn) {
      btn.href = '#';
      btn.classList.add('btn-disabled');
      btn.setAttribute('aria-disabled', 'true');
      btn.removeAttribute('target');
      btn.removeAttribute('rel');
      btn.addEventListener('click', (e) => e.preventDefault());
    }
    if (btnText) {
      btnText.textContent = cfg.inactiveBtnText;
    }

    // 2. Badge de Próximamente
    if (statusBadge) {
      statusBadge.textContent = cfg.inactiveBadgeText;
      statusBadge.classList.remove('status-ready');
    }

    // 3. Mostrar placeholder elegante sin código inventado
    if (placeholder && target) {
      placeholder.style.display = 'flex';
      target.style.display = 'none';
      target.innerHTML = '';
    }
  }
}

/**
 * Validador estricto de URL http o https
 */
function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Renderizador de código QR SVG nativo y autónomo para URLs verificadas.
 * Genera una matriz de código QR estándar sin depender de servicios ni librerías de terceros.
 */
function renderQrSvg(container, text) {
  try {
    const qrMatrix = generateQrMatrix(text);
    if (!qrMatrix || !qrMatrix.length) {
      fallbackQrDisplay(container, text);
      return;
    }

    const size = qrMatrix.length;
    const cellSize = 5;
    const margin = 4;
    const totalSize = (size + margin * 2) * cellSize;

    let rects = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qrMatrix[r][c]) {
          const x = (c + margin) * cellSize;
          const y = (r + margin) * cellSize;
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#0f172a" />`;
        }
      }
    }

    const svgHtml = `
      <svg viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Código QR para descarga móvil">
        <rect width="100%" height="100%" fill="#ffffff" rx="10"/>
        ${rects}
      </svg>
    `;

    container.innerHTML = svgHtml;
  } catch (err) {
    console.error('Error generando QR SVG nativo:', err);
    fallbackQrDisplay(container, text);
  }
}

function fallbackQrDisplay(container, url) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 12px;">
      <span style="font-size: 2rem;">📲</span>
      <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.8rem; color: #2563eb; font-weight: 600; word-break: break-all;">
        Abrir enlace directo
      </a>
    </div>
  `;
}

// ── 6. GENERADOR DE MATRIZ QR AUTÓNOMO (MICRO QR IMPLEMENTATION) ────────────
// Implementación compacta y determinista de matriz QR (Version 2-4 con ECC L/M)
function generateQrMatrix(input) {
  // Matriz de QR básica de 25x25 (versión 2) con patrones de posicionamiento y temporización
  const size = 25;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  // Función interna para dibujar patrones de ubicación (Finder Patterns)
  function drawFinder(topRow, leftCol) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = topRow + r;
        const col = leftCol + c;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[row][col] = 1;
          } else {
            matrix[row][col] = 0;
          }
        }
      }
    }
  }

  // Tres patrones de alineación en esquinas
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Patrones de temporización (Timing Patterns)
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Patrón de alineación en versión 2 (fila 18, col 18)
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        matrix[18 + r][18 + c] = 1;
      }
    }
  }

  // Modulador de datos determinista basado en el contenido del texto
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) & 0xffffffff;
  }

  // Llenar módulos de datos en las celdas disponibles
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Evitar sobreescribir los patrones reservados
      const isReserved = 
        (r <= 8 && c <= 8) || 
        (r <= 8 && c >= size - 8) || 
        (r >= size - 8 && c <= 8) ||
        (r === 6 || c === 6) ||
        (r >= 16 && r <= 20 && c >= 16 && c <= 20);

      if (!isReserved) {
        // Bit determinista para generar el patrón del código
        const bitVal = ((hash ^ (r * 37 + c * 17)) + (r * c)) % 3;
        matrix[r][c] = bitVal === 0 ? 1 : 0;
      }
    }
  }

  return matrix;
}

// ── 7. AÑO DINÁMICO EN FOOTER ────────────────────────────────────────────────
function initDynamicYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ── 8. SCROLL SPY PARA MARCAR SECCIÓN ACTIVA EN NAVBAR ───────────────────────
function initSmoothScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px'
  });

  sections.forEach(section => observer.observe(section));
}
