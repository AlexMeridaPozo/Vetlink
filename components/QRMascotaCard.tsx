/**
 * QRMascotaCard.tsx
 * Componente que genera y muestra el QR de una mascota
 * con botones para descargar como PNG o STL (para impresión 3D).
 *
 * — El QR se dibuja con una <Canvas> nativa de React Native (sin dependencias).
 * — La imagen PNG se captura con expo-file-system y se comparte con expo-sharing.
 * — El STL se genera con el motor propio (stlGenerator.ts) y se comparte.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { generateQRMatrix } from '@/utils/qrGenerator';
import { generateSTL, arrayBufferToBase64 } from '@/utils/stlGenerator';

// ── SVG-like QR view (dibujado con Views de React Native) ─────────────────────

interface QRViewProps {
  matrix: boolean[][];
  size: number;   // tamaño total del componente en px
  color?: string; // color de los módulos oscuros
}

function QRView({ matrix, size, color = '#000000' }: QRViewProps) {
  const n = matrix.length;
  const cellSize = size / n;

  return (
    <View style={{ width: size, height: size, backgroundColor: '#ffffff' }}>
      {matrix.map((row, r) =>
        row.map((dark, c) =>
          dark ? (
            <View
              key={`${r}-${c}`}
              style={{
                position: 'absolute',
                left: c * cellSize,
                top: r * cellSize,
                width: cellSize,
                height: cellSize,
                backgroundColor: color,
              }}
            />
          ) : null,
        ),
      )}
    </View>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface QRMascotaCardProps {
  petId: string;       // Ej: "PET-001"
  petName: string;     // Ej: "Luna"
  isDark?: boolean;
}

export default function QRMascotaCard({ petId, petName, isDark = false }: QRMascotaCardProps) {
  const [descargandoPNG, setDescargandoPNG] = useState(false);
  const [descargandoSTL, setDescargandoSTL] = useState(false);

  // Generar la matriz QR de forma derivada cuando cambia el petId (evita cascading renders)
  const { matrix, error } = useMemo(() => {
    try {
      const m = generateQRMatrix(petId);
      return { matrix: m, error: null };
    } catch (e: any) {
      return { matrix: null, error: e?.message ?? 'Error generando QR' };
    }
  }, [petId]);

  // ── Descarga PNG ────────────────────────────────────────────────────────────
  /**
   * Genera un SVG del QR, lo guarda como .svg y lo comparte.
   * En web se descarga directamente.
   * Nota: expo-view-shot no está disponible en todos los builds; usamos SVG manual.
   */
  const handleDescargarPNG = useCallback(async () => {
    if (!matrix) return;
    setDescargandoPNG(true);
    try {
      const n = matrix.length;
      const cell = 10; // 10px por módulo
      const size = n * cell;
      const quiet = 4 * cell; // zona silenciosa
      const total = size + quiet * 2;

      // Construir SVG manualmente
      const rects: string[] = [];
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (matrix[r][c]) {
            rects.push(
              `<rect x="${quiet + c * cell}" y="${quiet + r * cell}" width="${cell}" height="${cell}" fill="#000"/>`,
            );
          }
        }
      }

      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total + 30}" viewBox="0 0 ${total} ${total + 30}">
  <rect width="${total}" height="${total + 30}" fill="white"/>
  ${rects.join('\n  ')}
  <text x="${total / 2}" y="${total + 22}" font-family="monospace" font-size="14" text-anchor="middle" fill="#333">${petName} · ${petId}</text>
</svg>`;

      if (Platform.OS === 'web') {
        // Descarga directa en el navegador
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `QR_${petId}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // Mobile: guardar con expo-file-system y compartir
      const path = `${FileSystem.cacheDirectory}QR_${petId}.svg`;
      await FileSystem.writeAsStringAsync(path, svg, { encoding: FileSystem.EncodingType.UTF8 });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, {
          mimeType: 'image/svg+xml',
          dialogTitle: `QR de ${petName}`,
          UTI: 'public.svg-image',
        });
      } else {
        Alert.alert('Compartir no disponible', `El archivo SVG fue guardado en: ${path}`);
      }
    } catch (e: any) {
      Alert.alert('Error', `No se pudo generar el archivo: ${e?.message}`);
    } finally {
      setDescargandoPNG(false);
    }
  }, [matrix, petId, petName]);

  // ── Descarga STL ────────────────────────────────────────────────────────────
  const handleDescargarSTL = useCallback(async () => {
    if (!matrix) return;
    setDescargandoSTL(true);
    try {
      // Generar STL binario
      const stlBuffer = generateSTL(matrix, {
        moduleSize: 2,
        moduleHeight: 1.5,
        baseHeight: 1.5,
        margin: 4,
      });

      const base64 = arrayBufferToBase64(stlBuffer);
      const filename = `QR_${petId}.stl`;

      if (Platform.OS === 'web') {
        // Descarga directa
        const byteArray = new Uint8Array(stlBuffer);
        const blob = new Blob([byteArray], { type: 'model/stl' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const path = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, {
          mimeType: 'model/stl',
          dialogTitle: `STL 3D de ${petName}`,
          UTI: 'public.data',
        });
      } else {
        Alert.alert('Guardado', `STL guardado en: ${path}`);
      }
    } catch (e: any) {
      Alert.alert('Error al generar STL', e?.message ?? 'Error desconocido');
    } finally {
      setDescargandoSTL(false);
    }
  }, [matrix, petId, petName]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <View style={[styles.card, isDark && styles.cardDark]}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>🏷️ Código QR</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{petId}</Text>
        </View>
      </View>
      <Text style={[styles.subtitle, isDark && styles.textSecDark]}>
        Escaneá este código para identificar a {petName}
      </Text>

      {/* QR */}
      <View style={[styles.qrWrapper, isDark && styles.qrWrapperDark]}>
        {matrix ? (
          <QRView matrix={matrix} size={200} color="#000000" />
        ) : (
          <ActivityIndicator size="large" color="#04b639" />
        )}
      </View>

      {/* Info de impresión 3D */}
      <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
        <Text style={[styles.infoText, isDark && styles.textSecDark]}>
          📐 El STL genera una placa {'\n'}lista para imprimir en 3D
        </Text>
        <View style={styles.dimensionsRow}>
          <DimBadge label="Módulo" value="2mm" isDark={isDark} />
          <DimBadge label="Relieve" value="1.5mm" isDark={isDark} />
          <DimBadge label="Base" value="1.5mm" isDark={isDark} />
        </View>
      </View>

      {/* Botones */}
      <View style={styles.botonesRow}>
        <TouchableOpacity
          style={[styles.boton, styles.botonPNG, descargandoPNG && styles.botonDisabled]}
          onPress={handleDescargarPNG}
          disabled={descargandoPNG || !matrix}
          activeOpacity={0.8}
        >
          {descargandoPNG ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.botonIcono}>🖼️</Text>
              <Text style={styles.botonTexto}>Imagen SVG</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonSTL, descargandoSTL && styles.botonDisabled]}
          onPress={handleDescargarSTL}
          disabled={descargandoSTL || !matrix}
          activeOpacity={0.8}
        >
          {descargandoSTL ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.botonIcono}>🖨️</Text>
              <Text style={styles.botonTexto}>STL 3D</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.hint, isDark && styles.textSecDark]}>
        El STL puede abrirse en Cura, PrusaSlicer o cualquier laminador 3D
      </Text>
    </View>
  );
}

// ── Sub-componente de dimensión ───────────────────────────────────────────────
function DimBadge({ label, value, isDark }: { label: string; value: string; isDark?: boolean }) {
  return (
    <View style={[styles.dimBadge, isDark && styles.dimBadgeDark]}>
      <Text style={[styles.dimLabel, isDark && styles.dimLabelDark]}>{label}</Text>
      <Text style={styles.dimValue}>{value}</Text>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
    }),
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  textDark: { color: '#fafafa' },
  textSecDark: { color: '#a1a1aa' },
  badge: {
    backgroundColor: '#ecfdf5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#04b639',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#04b639',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  qrWrapper: {
    alignSelf: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
    }),
  },
  qrWrapperDark: {
    borderColor: '#3f3f46',
  },
  infoBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  infoBoxDark: {
    backgroundColor: '#14532d22',
    borderColor: '#166534',
  },
  infoText: {
    fontSize: 13,
    color: '#166534',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  dimensionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dimBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  dimBadgeDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  dimLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  dimLabelDark: {
    color: '#a1a1aa',
  },
  dimValue: {
    fontSize: 13,
    color: '#04b639',
    fontWeight: '700',
  },
  botonesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  boton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  botonPNG: {
    backgroundColor: '#0ea5e9',
  },
  botonSTL: {
    backgroundColor: '#04b639',
  },
  botonDisabled: {
    opacity: 0.6,
  },
  botonIcono: {
    fontSize: 16,
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
  },
});
