import CrearRecordatorioModal from '@/components/CrearRecordatorioModal';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { initNotifications } from '@/services/notificationService';
import {
  calcularTiempoRestante,
  eliminarRecordatorio,
  getRecordatorios,
  sincronizarNotificacionesUsuario,
  type Recordatorio,
} from '@/services/reminderService';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecordatoriosScreen() {
  const { isDark } = useAppTheme();
  const { user, profile, isVeterinario } = useAuth();

  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | 'proximos' | 'vencidos'>('todos');

  // Inicializar notificaciones al cargar
  useEffect(() => {
    initNotifications().catch(() => { });
  }, []);

  const cargarDatos = useCallback(async () => {
    if (!user) {
      setCargando(false);
      return;
    }

    try {
      const list = await getRecordatorios(user.uid, isVeterinario, user.email || undefined);
      setRecordatorios(list);

      // Si el usuario es propietario, sincronizar sus avisos en este dispositivo local
      if (!isVeterinario && list.length > 0) {
        sincronizarNotificacionesUsuario(list).catch(() => { });
      }
    } catch (e) {
      console.warn('[RecordatoriosScreen] Error cargando recordatorios:', e);
    } finally {
      setCargando(false);
    }
  }, [user, isVeterinario]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

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

  // Filtrado de lista
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
            Recordatorios Automáticos
          </Text>
          <Text style={[styles.screenSubtitle, isDark && styles.subtituloDark]}>
            {isVeterinario
              ? 'Gestión y programación de avisos automáticos para pacientes'
              : 'Avisos sanitarios programados por tu veterinaria'}
          </Text>
        </View>
        <ThemeToggleButton />
      </View>

      {/* Banner de Rol Veterinario con botón de Crear Recordatorio */}
      {isVeterinario && (
        <View style={[styles.vetHeaderBanner, isDark && styles.vetHeaderBannerDark]}>
          <View style={{ flex: 1 }}>
            <View style={[styles.vetBadge, isDark && styles.vetBadgeDark]}>
              <Ionicons name="shield-checkmark" size={14} color="#04b639" />
              <Text style={styles.vetBadgeText}>Veterinario Autorizado</Text>
            </View>
            <Text style={[styles.vetDoctorTitle, isDark && styles.textDark]}>
              {profile?.displayName || user?.displayName || 'Dr. Veterinario'}
            </Text>
            <Text style={[styles.vetDoctorDesc, isDark && styles.subtituloDark]}>
              Programa recordatorios con fecha y hora. El tutor recibirá la alerta aunque la app esté cerrada.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.createBtnText}>Nuevo Recordatorio</Text>
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
          <Text style={[styles.metricNumber, { color: '#04b639' }]}>{recordatorios.length}</Text>
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
          <Text style={[styles.metricNumber, { color: '#dc2626' }]}>{vencidosCount}</Text>
          <Text style={[styles.metricLabel, isDark && styles.subtituloDark]}>Vencidos</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido / Listado */}
      {cargando ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#04b639" />
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
              colors={['#04b639']}
              tintColor="#04b639"
            />
          }
        >
          {recordatoriosFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, isDark && styles.emptyIconCircleDark]}>
                <Ionicons name="notifications-off-outline" size={44} color="#04b639" />
              </View>
              <Text style={[styles.emptyTitle, isDark && styles.textDark]}>
                No hay recordatorios {filtro !== 'todos' ? filtro : ''}
              </Text>
              <Text style={[styles.emptySubtitle, isDark && styles.subtituloDark]}>
                {isVeterinario
                  ? 'Usa el botón "Nuevo Recordatorio" para programar avisos automáticos para tus pacientes.'
                  : 'Aquí aparecerán los avisos y recordatorios sanitarios programados por tu veterinaria.'}
              </Text>

              {isVeterinario && (
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.emptyActionBtnText}>Crear Primer Recordatorio</Text>
                </TouchableOpacity>
              )}
            </View>
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
                        <Ionicons name="person-outline" size={13} color="#04b639" />
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
                      <Ionicons name="calendar-outline" size={14} color="#64748b" />
                      <Text style={[styles.metaText, isDark && styles.subtituloDark]}>
                        {rec.fecha}
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={[styles.metaText, isDark && styles.subtituloDark]}>
                        {rec.hora} hs
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons name="medkit-outline" size={14} color="#64748b" />
                      <Text style={[styles.metaText, isDark && styles.subtituloDark]}>
                        {rec.veterinarioNombre}
                      </Text>
                    </View>
                  </View>

                  {/* Pie de tarjeta con indicador de estado y botón eliminar */}
                  <View style={[styles.cardFooter, isDark && styles.cardFooterDark]}>
                    <View style={styles.statusIndicatorRow}>
                      <Ionicons name="notifications" size={14} color="#04b639" />
                      <Text style={styles.statusIndicatorText}>
                        Aviso automático configurado
                      </Text>
                    </View>

                    {/* Botón de eliminación exclusivo para veterinarios */}
                    {isVeterinario && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleEliminar(rec)}
                        activeOpacity={0.7}
                        accessibilityLabel="Eliminar recordatorio"
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" style={{ marginRight: 4 }} />
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
    backgroundColor: '#ffffff',
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
    borderBottomColor: '#f1f5f9',
  },
  topBarDark: {
    borderBottomColor: '#27272a',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  // Banner Veterinario
  vetHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  vetHeaderBannerDark: {
    backgroundColor: '#132e1f',
    borderBottomColor: '#166534',
  },
  vetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  vetBadgeDark: {
    backgroundColor: '#052e16',
  },
  vetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  vetDoctorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  vetDoctorDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    lineHeight: 15,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04b639',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  // Métricas
  metricsBanner: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
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
    fontSize: 14,
    color: '#64748b',
  },
  // Empty State
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
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconCircleDark: {
    backgroundColor: '#132e1f',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04b639',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  emptyActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    }),
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  recipientText: {
    fontSize: 12,
    color: '#64748b',
  },
  badgeTime: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTimeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeToday: {
    backgroundColor: '#fef3c7',
  },
  badgeTodayText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeUpcoming: {
    backgroundColor: '#dcfce7',
  },
  badgeUpcomingText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeOverdue: {
    backgroundColor: '#fee2e2',
  },
  badgeOverdueText: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: '700',
  },
  descBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
  },
  descBoxDark: {
    backgroundColor: '#27272a',
  },
  descText: {
    fontSize: 13,
    color: '#334155',
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
    fontSize: 12,
    color: '#64748b',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
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
    fontSize: 11,
    color: '#04b639',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '700',
  },
  textDark: {
    color: '#fafafa',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
});
