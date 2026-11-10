import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, ThemeToggleButton } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import CrearRecordatorioModal from '@/components/CrearRecordatorioModal';
import { EmptyState } from '@/components/EmptyState';
import {
  getRecordatorios,
  eliminarRecordatorio,
  sincronizarNotificacionesUsuario,
  calcularTiempoRestante,
  type Recordatorio,
} from '@/services/reminderService';
import { initNotifications } from '@/services/notificationService';
import { Palette, Typography, Radius, Shadows } from '@/constants/theme';

export default function RecordatoriosScreen() {
  const { isDark } = useAppTheme();
  const { user, profile, isVeterinario } = useAuth();

  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | 'proximos' | 'vencidos'>('todos');

  useEffect(() => {
    initNotifications().catch(() => {});
  }, []);

  const cargarDatos = useCallback(async () => {
    if (!user) {
      setCargando(false);
      return;
    }

    try {
      const list = await getRecordatorios(user.uid, isVeterinario, user.email || undefined);
      setRecordatorios(list);

      if (!isVeterinario && list.length > 0) {
        sincronizarNotificacionesUsuario(list).catch(() => {});
      }
    } catch (e) {
      console.warn('[RecordatoriosScreen] Error cargando recordatorios:', e);
    } finally {
      setCargando(false);
    }
  }, [user, isVeterinario]);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      if (!isMounted) return;
      if (!user) {
        setCargando(false);
        return;
      }

      try {
        const list = await getRecordatorios(user.uid, isVeterinario, user.email || undefined);
        if (!isMounted) return;
        setRecordatorios(list);
        if (!isVeterinario && list.length > 0) {
          sincronizarNotificacionesUsuario(list).catch(() => {});
        }
      } catch (e) {
        console.warn('[RecordatoriosScreen] Error cargando recordatorios:', e);
      } finally {
        if (isMounted) setCargando(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user, isVeterinario]);

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  const handleEliminar = (rec: Recordatorio) => {
    if (!isVeterinario) return;

    Alert.alert(
      'Eliminar Recordatorio',
      `¿Deseas eliminar el recordatorio "${rec.titulo}" programado para ${rec.userName}?\n\nLa notificación automática será cancelada en el sistema.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarRecordatorio(rec.id, isVeterinario);
              setRecordatorios((prev) => prev.filter((item) => item.id !== rec.id));
              Alert.alert('Eliminado', 'El recordatorio ha sido eliminado correctamente.');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo eliminar el recordatorio.');
            }
          },
        },
      ]
    );
  };

  const recordatoriosFiltrados = recordatorios.filter((r) => {
    const tiempo = calcularTiempoRestante(r.fechaCompleta);
    if (filtro === 'proximos') return !tiempo.esVencido;
    if (filtro === 'vencidos') return tiempo.esVencido;
    return true;
  });

  const proximosCount = recordatorios.filter((r) => !calcularTiempoRestante(r.fechaCompleta).esVencido).length;
  const vencidosCount = recordatorios.filter((r) => calcularTiempoRestante(r.fechaCompleta).esVencido).length;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['bottom', 'left', 'right']}>
      {/* Barra Superior con ThemeToggleButton */}
      <View style={[styles.topBar, isDark && styles.topBarDark]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.screenTitle, isDark && styles.textDark]}>
            Recordatorios Sanitarios
          </Text>
          <Text style={[styles.screenSubtitle, isDark && styles.subtituloDark]}>
            {isVeterinario
              ? 'Gestión y programación de avisos automáticos para pacientes'
              : 'Avisos y cuidados programados por tu veterinaria'}
          </Text>
        </View>
        <ThemeToggleButton />
      </View>

      {/* Banner de Rol Veterinario */}
      {isVeterinario && (
        <View style={[styles.vetHeaderBanner, isDark && styles.vetHeaderBannerDark]}>
          <View style={{ flex: 1 }}>
            <View style={[styles.vetBadge, isDark && styles.vetBadgeDark]}>
              <Ionicons name="shield-checkmark-outline" size={13} color={Palette.greenDeep} />
              <Text style={styles.vetBadgeText}>Veterinario Autorizado</Text>
            </View>
            <Text style={[styles.vetDoctorTitle, isDark && styles.textDark]}>
              {profile?.displayName || user?.displayName || 'Dr. Veterinario'}
            </Text>
            <Text style={[styles.vetDoctorDesc, isDark && styles.subtituloDark]}>
              Programa recordatorios para tus pacientes. El tutor recibirá la alerta local en su dispositivo.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={styles.createBtnText}>Nuevo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Métricas / Contadores rápidos */}
      <View style={[styles.metricsBanner, isDark && styles.metricsBannerDark]}>
        <TouchableOpacity
          style={[styles.metricItem, filtro === 'todos' && styles.metricItemActive]}
          onPress={() => setFiltro('todos')}
          activeOpacity={0.7}
        >
          <Text style={[styles.metricNumber, { color: Palette.greenDeep }]}>{recordatorios.length}</Text>
          <Text style={[styles.metricLabel, isDark && styles.subtituloDark]}>Total</Text>
        </TouchableOpacity>

        <View style={[styles.metricDivider, isDark && styles.metricDividerDark]} />

        <TouchableOpacity
          style={[styles.metricItem, filtro === 'proximos' && styles.metricItemActive]}
          onPress={() => setFiltro('proximos')}
          activeOpacity={0.7}
        >
          <Text style={[styles.metricNumber, { color: '#0284c7' }]}>{proximosCount}</Text>
          <Text style={[styles.metricLabel, isDark && styles.subtituloDark]}>Próximos</Text>
        </TouchableOpacity>

        <View style={[styles.metricDivider, isDark && styles.metricDividerDark]} />

        <TouchableOpacity
          style={[styles.metricItem, filtro === 'vencidos' && styles.metricItemActive]}
          onPress={() => setFiltro('vencidos')}
          activeOpacity={0.7}
        >
          <Text style={[styles.metricNumber, { color: Palette.redEmergency }]}>{vencidosCount}</Text>
          <Text style={[styles.metricLabel, isDark && styles.subtituloDark]}>Vencidos</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido / Listado */}
      {cargando ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Palette.greenPrimary} />
          <Text style={[styles.loadingText, isDark && styles.subtituloDark]}>
            Cargando recordatorios...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Palette.greenPrimary]}
              tintColor={Palette.greenPrimary}
            />
          }
        >
          {recordatoriosFiltrados.length === 0 ? (
            <EmptyState
              variant="reminders"
              title="No tenés recordatorios pendientes."
              message={
                isVeterinario
                  ? 'Programá avisos automáticos sanitarios y fechas de vacunación para tus pacientes.'
                  : 'Los avisos, vacunas y recordatorios sanitarios programados por tu veterinaria se mostrarán en esta sección.'
              }
              actionLabel={isVeterinario ? 'Crear Primer Recordatorio' : undefined}
              actionIcon="add-circle-outline"
              onAction={isVeterinario ? () => setModalVisible(true) : undefined}
            />
          ) : (
            recordatoriosFiltrados.map((rec) => {
              const tiempo = calcularTiempoRestante(rec.fechaCompleta);

              return (
                <View key={rec.id} style={[styles.card, isDark && styles.cardDark]}>
                  {/* Encabezado de la tarjeta */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderInfo}>
                      <Text style={[styles.cardTitle, isDark && styles.textDark]}>{rec.titulo}</Text>
                      <View style={styles.recipientRow}>
                        <Ionicons name="person-outline" size={13} color={Palette.greenDeep} />
                        <Text style={[styles.recipientText, isDark && styles.subtituloDark]}>
                          Tutor: <Text style={{ fontWeight: '700' }}>{rec.userName}</Text> ({rec.userEmail})
                        </Text>
                      </View>
                    </View>

                    {/* Badge de tiempo */}
                    <View
                      style={[
                        styles.badgeTime,
                        tiempo.esVencido
                          ? styles.badgeOverdue
                          : tiempo.esHoy
                          ? styles.badgeToday
                          : styles.badgeUpcoming,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeTimeText,
                          tiempo.esVencido
                            ? styles.badgeOverdueText
                            : tiempo.esHoy
                            ? styles.badgeTodayText
                            : styles.badgeUpcomingText,
                        ]}
                      >
                        {tiempo.texto}
                      </Text>
                    </View>
                  </View>

                  {/* Descripción o indicaciones */}
                  {rec.descripcion ? (
                    <View style={[styles.descBox, isDark && styles.descBoxDark]}>
                      <Text style={[styles.descText, isDark && styles.descTextDark]}>
                        {rec.descripcion}
                      </Text>
                    </View>
                  ) : null}

                  {/* Datos de Fecha, Hora y Emisor */}
                  <View style={styles.cardMetaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={Palette.textSecondary} />
                      <Text style={[styles.metaText, isDark && styles.subtituloDark]}>
                        {rec.fecha}
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={Palette.textSecondary} />
                      <Text style={[styles.metaText, isDark && styles.subtituloDark]}>
                        {rec.hora} hs
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons name="medkit-outline" size={14} color={Palette.textSecondary} />
                      <Text style={[styles.metaText, isDark && styles.subtituloDark]}>
                        {rec.veterinarioNombre}
                      </Text>
                    </View>
                  </View>

                  {/* Pie de tarjeta con indicador de estado y botón eliminar */}
                  <View style={[styles.cardFooter, isDark && styles.cardFooterDark]}>
                    <View style={styles.statusIndicatorRow}>
                      <Ionicons name="notifications-outline" size={14} color={Palette.greenDeep} />
                      <Text style={styles.statusIndicatorText}>
                        Aviso automático configurado
                      </Text>
                    </View>

                    {isVeterinario && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleEliminar(rec)}
                        activeOpacity={0.7}
                        accessibilityLabel="Eliminar recordatorio"
                      >
                        <Ionicons name="trash-outline" size={14} color={Palette.redEmergency} style={{ marginRight: 4 }} />
                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal para Crear Recordatorio */}
      <CrearRecordatorioModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          cargarDatos();
        }}
      />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
    backgroundColor: Palette.cardLight,
  },
  topBarDark: {
    borderBottomColor: '#27272a',
    backgroundColor: '#09090b',
  },
  screenTitle: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  screenSubtitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  vetHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greenSoft,
    borderBottomWidth: 1,
    borderBottomColor: Palette.greenBorder,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  vetHeaderBannerDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.15)',
    borderBottomColor: 'rgba(8, 122, 67, 0.3)',
  },
  vetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.cardLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  vetBadgeDark: {
    backgroundColor: '#052e16',
  },
  vetBadgeText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.greenDeep,
  },
  vetDoctorTitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  vetDoctorDesc: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greenDeep,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    marginLeft: 4,
  },
  metricsBanner: {
    flexDirection: 'row',
    backgroundColor: Palette.cardLight,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
    paddingVertical: 10,
    alignItems: 'center',
  },
  metricsBannerDark: {
    backgroundColor: '#18181b',
    borderBottomColor: '#27272a',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  metricItemActive: {
    opacity: 1,
  },
  metricNumber: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Palette.borderLight,
  },
  metricDividerDark: {
    backgroundColor: '#27272a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  emptyIconCircleDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
  },
  emptyTitle: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greenDeep,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: Radius.md,
  },
  emptyActionBtnText: {
    color: '#ffffff',
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
  },
  card: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.lg,
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.size.body,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  recipientText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  badgeTime: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeTimeText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
  },
  badgeToday: {
    backgroundColor: '#fef3c7',
  },
  badgeTodayText: {
    color: '#b45309',
  },
  badgeUpcoming: {
    backgroundColor: Palette.greenSoft,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  badgeUpcomingText: {
    color: Palette.greenDeep,
  },
  badgeOverdue: {
    backgroundColor: Palette.redSoft,
    borderWidth: 1,
    borderColor: Palette.redBorder,
  },
  badgeOverdueText: {
    color: Palette.redEmergency,
  },
  descBox: {
    backgroundColor: Palette.backgroundLight,
    borderRadius: Radius.md,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  descBoxDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  descText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
    lineHeight: 18,
  },
  descTextDark: {
    color: '#d4d4d8',
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 4,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  cardFooterDark: {
    borderTopColor: '#27272a',
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusIndicatorText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.redSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Palette.redBorder,
  },
  deleteButtonText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.redEmergency,
  },
  textDark: {
    color: '#fafafa',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
});
