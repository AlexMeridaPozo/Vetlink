import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { Palette, Radius, Shadows, Typography } from '@/constants/theme';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';

export default function TurnosScreen() {
  const { isDark } = useAppTheme();
  const [filtro, setFiltro] = useState<'proximos' | 'pasados'>('proximos');

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
      {/* Navbar Superior con Volver y Theme Toggle */}
      <View style={[styles.navbar, isDark && styles.navbarDark]}>
        <TouchableOpacity
          style={[styles.backButton, isDark && styles.buttonDark]}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#fafafa' : Palette.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, isDark && styles.textDark]}>
          Turnos Veterinarios
        </Text>

        <ThemeToggleButton />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.textDark]}>Agenda de Citas</Text>
          <Text style={[styles.subtitle, isDark && styles.subtituloDark]}>
            Consulta y gestiona las citas médicas y revisiones de tus mascotas
          </Text>
        </View>

        {/* Selector de Filtros de Turnos */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              isDark && styles.filterPillDark,
              filtro === 'proximos' && styles.filterPillActive,
            ]}
            onPress={() => setFiltro('proximos')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={filtro === 'proximos' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.filterPillText,
                isDark && styles.filterPillTextDark,
                filtro === 'proximos' && styles.filterPillTextActive,
              ]}
            >
              Próximos (2)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              isDark && styles.filterPillDark,
              filtro === 'pasados' && styles.filterPillActive,
            ]}
            onPress={() => setFiltro('pasados')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={filtro === 'pasados' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.filterPillText,
                isDark && styles.filterPillTextDark,
                filtro === 'pasados' && styles.filterPillTextActive,
              ]}
            >
              Historial de Turnos (0)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {filtro === 'proximos' ? (
            <>
              {/* Turno 1 */}
              <View style={[styles.card, isDark && styles.cardDark]}>
                <View style={styles.cardHeader}>
                  <View style={styles.petHeaderInfo}>
                    <View style={styles.petIconCircle}>
                      <MaterialCommunityIcons name="dog" size={20} color={Palette.greenDeep} />
                    </View>
                    <Text style={[styles.petName, isDark && styles.textDark]}>Santino</Text>
                  </View>

                  <View style={styles.statusConfirmed}>
                    <Ionicons name="checkmark-circle-outline" size={13} color={Palette.greenDeep} />
                    <Text style={styles.statusConfirmedText}>Confirmado</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <Ionicons name="calendar-outline" size={15} color={Palette.greenDeep} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, isDark && styles.subtituloDark]}>Fecha</Text>
                    <Text style={[styles.value, isDark && styles.textDark]}>20 de septiembre de 2026</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <Ionicons name="time-outline" size={15} color={Palette.greenDeep} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, isDark && styles.subtituloDark]}>Hora</Text>
                    <Text style={[styles.value, isDark && styles.textDark]}>15:30 hs</Text>
                  </View>
                </View>

                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.infoIconBox}>
                    <Ionicons name="business-outline" size={15} color={Palette.greenDeep} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, isDark && styles.subtituloDark]}>Veterinaria</Text>
                    <Text style={[styles.value, isDark && styles.textDark]}>Veterinaria San Martín</Text>
                  </View>
                </View>
              </View>

              {/* Turno 2 */}
              <View style={[styles.card, isDark && styles.cardDark]}>
                <View style={styles.cardHeader}>
                  <View style={styles.petHeaderInfo}>
                    <View style={[styles.petIconCircle, { backgroundColor: Palette.cyanLight }]}>
                      <MaterialCommunityIcons name="cat" size={20} color="#0284c7" />
                    </View>
                    <Text style={[styles.petName, isDark && styles.textDark]}>Milo</Text>
                  </View>

                  <View style={styles.statusRequested}>
                    <Ionicons name="time-outline" size={13} color="#0284c7" />
                    <Text style={styles.statusRequestedText}>Solicitado</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={[styles.infoIconBox, { backgroundColor: Palette.cyanLight }]}>
                    <Ionicons name="calendar-outline" size={15} color="#0284c7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, isDark && styles.subtituloDark]}>Fecha</Text>
                    <Text style={[styles.value, isDark && styles.textDark]}>25 de septiembre de 2026</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={[styles.infoIconBox, { backgroundColor: Palette.cyanLight }]}>
                    <Ionicons name="time-outline" size={15} color="#0284c7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, isDark && styles.subtituloDark]}>Hora</Text>
                    <Text style={[styles.value, isDark && styles.textDark]}>10:00 hs</Text>
                  </View>
                </View>

                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <View style={[styles.infoIconBox, { backgroundColor: Palette.cyanLight }]}>
                    <Ionicons name="business-outline" size={15} color="#0284c7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, isDark && styles.subtituloDark]}>Veterinaria</Text>
                    <Text style={[styles.value, isDark && styles.textDark]}>Clínica Veterinaria Central</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.emptyMessage, isDark && styles.emptyMessageDark]}>
                <Ionicons name="information-circle-outline" size={16} color={Palette.textMuted} />
                <Text style={[styles.emptyText, isDark && styles.subtituloDark]}>
                  Estos turnos son de ejemplo para fines ilustrativos.
                </Text>
              </View>
            </>
          ) : (
            <EmptyState
              variant="appointments"
              title="Todavía no tenés turnos agendados."
              message="Comunicate con tu veterinaria de confianza para programar citas y revisiones médicas para tu mascota."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Palette.cardLight,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  navbarDark: {
    backgroundColor: '#18181b',
    borderBottomColor: '#27272a',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDark: {
    backgroundColor: '#27272a',
  },
  navTitle: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: Typography.size.h2,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  subtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Palette.cardLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  filterPillDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  filterPillActive: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.greenDeep,
    ...Shadows.sm,
  },
  filterPillText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  filterPillTextDark: {
    color: '#a1a1aa',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
  },
  content: {
    gap: 14,
  },
  card: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    ...Shadows.sm,
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  petHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  petIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  statusConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusConfirmedText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
  statusRequested: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.cyanLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusRequestedText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: '#0284c7',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  value: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textPrimary,
    marginTop: 1,
  },
  emptyMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.cardLight,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  emptyMessageDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  emptyText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    flex: 1,
  },
  textDark: {
    color: '#fafafa',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
});
