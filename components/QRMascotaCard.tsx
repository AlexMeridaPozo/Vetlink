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
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { nfcService } from '@/services/nfcService';
import { generateQRMatrix } from '@/utils/qrGenerator';
import { generateSTL, arrayBufferToBase64 } from '@/utils/stlGenerator';
import { Palette, Typography, Radius, Shadows } from '@/constants/theme';

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

  // Generar la matriz QR con la URL pública de identificación y rescate
  const rescueUrl = nfcService.buildIdentificationUrl(petId);
  const { matrix, error } = useMemo(() => {
    try {
      const m = generateQRMatrix(rescueUrl);
      return { matrix: m, error: null };
    } catch (e: any) {
      return { matrix: null, error: e?.message ?? 'Error generando QR' };
    }
  }, [rescueUrl]);

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
              <Ionicons name="share-outline" size={18} color="#ffffff" />
              <Text style={styles.botonTexto}>Compartir QR</Text>
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
              <Ionicons name="cube-outline" size={18} color="#ffffff" />
              <Text style={styles.botonTexto}>Chapita 3D</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginTop: 16,
    ...Shadows.sm,
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
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  textDark: { color: '#fafafa' },
  textSecDark: { color: '#a1a1aa' },
  badge: {
    backgroundColor: Palette.greenSoft,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  badgeText: {
    fontSize: Typography.size.tiny,
    fontWeight: '700',
    color: Palette.greenDeep,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  subtitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginBottom: 16,
  },
  qrWrapper: {
    alignSelf: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: 16,
    ...Shadows.sm,
  },
  qrWrapperDark: {
    borderColor: '#3f3f46',
  },
  infoBox: {
    backgroundColor: Palette.greenSoft,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  infoBoxDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.15)',
    borderColor: 'rgba(8, 122, 67, 0.3)',
  },
  infoText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.greenDeep,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 18,
  },
  dimensionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dimBadge: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  dimBadgeDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  dimLabel: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  dimLabelDark: {
    color: '#a1a1aa',
  },
  dimValue: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.heading,
    color: Palette.greenDeep,
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
    paddingVertical: 12,
    borderRadius: Radius.md,
    gap: 6,
  },
  botonPNG: {
    backgroundColor: '#0284c7',
  },
  botonSTL: {
    backgroundColor: Palette.greenDeep,
  },
  botonDisabled: {
    opacity: 0.6,
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
  },
  hint: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  errorText: {
    color: Palette.redEmergency,
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    textAlign: 'center',
  },
});
