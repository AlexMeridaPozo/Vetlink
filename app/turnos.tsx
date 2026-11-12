import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Alert,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { Palette, Radius, Shadows, Typography } from '@/constants/theme';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useTurnos, Turno, TurnoEstado } from '@/services/turnoService';
import SolicitarTurnoModal from '@/components/SolicitarTurnoModal';
import AtenderTurnoModal from '@/components/AtenderTurnoModal';

export default function TurnosScreen() {
  const { isDark } = useAppTheme();
  const { user, profile, isVeterinario } = useAuth();

  // Permite alternar la perspectiva visual (inicia según el rol en AuthContext)
  const [modoVista, setModoVista] = useState<'tutor' | 'veterinario'>(
    isVeterinario ? 'veterinario' : 'tutor'
  );

  // Filtros de navegación
  const [filtroTutor, setFiltroTutor] = useState<'proximos' | 'pasados'>('proximos');
  const [filtroVet, setFiltroVet] = useState<'pendientes' | 'confirmados' | 'historial'>('pendientes');

  // Modales
  const [modalSolicitarVisible, setModalSolicitarVisible] = useState(false);
  const [turnoAAtender, setTurnoAAtender] = useState<Turno | null>(null);

  // Hook de gestión de turnos
  const {
    turnos,
    loading,
    refreshing,
    refresh,
    solicitar,
    confirmar,
    completar,
    cancelar,
  } = useTurnos({
    tutorId: user?.uid,
    isVeterinario: modoVista === 'veterinario',
  });

  // Clasificación de turnos para Tutor
  const tutorProximos = useMemo(
    () => turnos.filter((t) => t.estado === 'solicitado' || t.estado === 'confirmado'),
    [turnos]
  );
  const tutorPasados = useMemo(
    () => turnos.filter((t) => t.estado === 'completado' || t.estado === 'cancelado'),
    [turnos]
  );

  // Clasificación de turnos para Veterinario
  const vetPendientes = useMemo(
    () => turnos.filter((t) => t.estado === 'solicitado'),
    [turnos]
  );
  const vetConfirmados = useMemo(
    () => turnos.filter((t) => t.estado === 'confirmado'),
    [turnos]
  );
  const vetHistorial = useMemo(
    () => turnos.filter((t) => t.estado === 'completado' || t.estado === 'cancelado'),
    [turnos]
  );

  // Lista activa según el modo y filtro
  const turnosMostrados = useMemo(() => {
    if (modoVista === 'tutor') {
      return filtroTutor === 'proximos' ? tutorProximos : tutorPasados;
    } else {
      if (filtroVet === 'pendientes') return vetPendientes;
      if (filtroVet === 'confirmados') return vetConfirmados;
      return vetHistorial;
    }
  }, [modoVista, filtroTutor, filtroVet, tutorProximos, tutorPasados, vetPendientes, vetConfirmados, vetHistorial]);

  // ── Acciones de Tutor ──────────────────────────────────────────────────────
  const handleCancelarTutor = (turno: Turno) => {
    const advertencia = `¿Estás seguro de que deseas cancelar el turno de ${turno.mascotaNombre} para el ${turno.fecha} a las ${turno.hora} hs?`;

    const ejecutarCancelacion = async () => {
      try {
        await cancelar(turno.id, 'Cancelado por el tutor');
        const exito = 'El turno ha sido cancelado.';
        if (Platform.OS === 'web') window.alert(exito);
        else Alert.alert('Turno Cancelado', exito);
      } catch (err: any) {
        const errorMsg = err?.message || 'No se pudo cancelar el turno.';
        if (Platform.OS === 'web') window.alert(errorMsg);
        else Alert.alert('Error', errorMsg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(advertencia)) {
        ejecutarCancelacion();
      }
    } else {
      Alert.alert('Cancelar Cita', advertencia, [
        { text: 'Volver', style: 'cancel' },
        { text: 'Sí, Cancelar', style: 'destructive', onPress: ejecutarCancelacion },
      ]);
    }
  };

  const handleLlamar = (telefono?: string) => {
    if (!telefono) {
      const msg = 'No se encuentra registrado el número de teléfono.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Teléfono no disponible', msg);
      return;
    }
    const telLimpio = telefono.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${telLimpio}`).catch(() => {
      const msg = `Teléfono de contacto: ${telefono}`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Contacto', msg);
    });
  };

  // ── Acciones de Veterinario ────────────────────────────────────────────────
  const handleConfirmarVet = async (turno: Turno) => {
    try {
      await confirmar(turno.id, {
        id: user?.uid,
        nombre: profile?.displayName || 'Dr. Profesional',
      });
      const msg = `¡Turno confirmado para ${turno.mascotaNombre}!\nFecha: ${turno.fecha} a las ${turno.hora} hs.`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Turno Confirmado', msg);
    } catch (err: any) {
      const errorMsg = err?.message || 'No se pudo confirmar el turno.';
      if (Platform.OS === 'web') window.alert(errorMsg);
      else Alert.alert('Error', errorMsg);
    }
  };

  const handleRechazarVet = (turno: Turno) => {
    const promptMsg = `¿Deseas rechazar o cancelar la solicitud de turno para ${turno.mascotaNombre}?`;

    const ejecutarRechazo = async () => {
      try {
        await cancelar(turno.id, 'Rechazado por disponibilidad de la clínica');
        const exito = 'La solicitud ha sido rechazada.';
        if (Platform.OS === 'web') window.alert(exito);
        else Alert.alert('Solicitud Rechazada', exito);
      } catch (err: any) {
        const errorMsg = err?.message || 'No se pudo rechazar la solicitud.';
        if (Platform.OS === 'web') window.alert(errorMsg);
        else Alert.alert('Error', errorMsg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(promptMsg)) {
        ejecutarRechazo();
      }
    } else {
      Alert.alert('Rechazar Turno', promptMsg, [
        { text: 'Atrás', style: 'cancel' },
        { text: 'Rechazar', style: 'destructive', onPress: ejecutarRechazo },
      ]);
    }
  };

  const getEstadoBadge = (estado: TurnoEstado) => {
    switch (estado) {
      case 'confirmado':
        return (
          <View style={styles.statusConfirmed}>
            <Ionicons name="checkmark-circle" size={13} color={Palette.greenDeep} />
            <Text style={styles.statusConfirmedText}>Confirmado</Text>
          </View>
        );
      case 'solicitado':
        return (
          <View style={styles.statusRequested}>
            <Ionicons name="time-outline" size={13} color="#0284c7" />
            <Text style={styles.statusRequestedText}>
              {modoVista === 'veterinario' ? 'Pendiente' : 'Solicitado'}
            </Text>
          </View>
        );
      case 'completado':
        return (
          <View style={styles.statusCompleted}>
            <Ionicons name="checkmark-done" size={13} color="#047857" />
            <Text style={styles.statusCompletedText}>Atendido</Text>
          </View>
        );
      case 'cancelado':
        return (
          <View style={styles.statusCancelled}>
            <Ionicons name="close-circle-outline" size={13} color="#dc2626" />
            <Text style={styles.statusCancelledText}>Cancelado</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
      {/* Navbar Superior */}
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

      {/* Selector de Perspectiva / Modo (Tutor vs Veterinario) */}
      <View style={[styles.modeBar, isDark && styles.modeBarDark]}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            modoVista === 'tutor' && styles.modeButtonActive,
            modoVista === 'tutor' && isDark && styles.modeButtonActiveDark,
          ]}
          onPress={() => setModoVista('tutor')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="person"
            size={14}
            color={modoVista === 'tutor' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
          />
          <Text
            style={[
              styles.modeButtonText,
              modoVista === 'tutor' && styles.modeButtonTextActive,
              isDark && modoVista !== 'tutor' && styles.textMutedDark,
            ]}
          >
            Vista Tutor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            modoVista === 'veterinario' && styles.modeButtonActive,
            modoVista === 'veterinario' && isDark && styles.modeButtonActiveDark,
          ]}
          onPress={() => setModoVista('veterinario')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="medkit"
            size={14}
            color={modoVista === 'veterinario' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
          />
          <Text
            style={[
              styles.modeButtonText,
              modoVista === 'veterinario' && styles.modeButtonTextActive,
              isDark && modoVista !== 'veterinario' && styles.textMutedDark,
            ]}
          >
            Vista Profesional
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={Palette.greenDeep}
            colors={[Palette.greenDeep]}
          />
        }
      >
        {/* Cabecera contextual */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, isDark && styles.textDark]}>
              {modoVista === 'veterinario' ? 'Panel de Turnos Clínicos' : 'Agenda de Citas'}
            </Text>
            <Text style={[styles.subtitle, isDark && styles.subtituloDark]}>
              {modoVista === 'veterinario'
                ? 'Gestioná las solicitudes, confirmá citas y registrá la atención clínica'
                : 'Consulta, programa y gestiona las citas médicas de tus mascotas'}
            </Text>
          </View>
        </View>

        {/* Botón Principal de Acción */}
        <TouchableOpacity
          style={[styles.mainActionButton, isDark && styles.mainActionButtonDark]}
          onPress={() => setModalSolicitarVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="calendar-outline" size={20} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainActionTitle}>
              {modoVista === 'veterinario' ? '+ Nuevo Turno en Clínica' : '+ Solicitar Turno Veterinario'}
            </Text>
            <Text style={styles.mainActionSubtitle}>
              {modoVista === 'veterinario'
                ? 'Agendar cita para paciente presencial o telefónico'
                : 'Elegí mascota, clínica veterinaria y horario deseado'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ffffff" />
        </TouchableOpacity>

        {/* Selector de Filtros según la perspectiva */}
        {modoVista === 'tutor' ? (
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                isDark && styles.filterPillDark,
                filtroTutor === 'proximos' && styles.filterPillActive,
              ]}
              onPress={() => setFiltroTutor('proximos')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color={filtroTutor === 'proximos' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.filterPillText,
                  isDark && styles.filterPillTextDark,
                  filtroTutor === 'proximos' && styles.filterPillTextActive,
                ]}
              >
                Próximos ({tutorProximos.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                isDark && styles.filterPillDark,
                filtroTutor === 'pasados' && styles.filterPillActive,
              ]}
              onPress={() => setFiltroTutor('pasados')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={filtroTutor === 'pasados' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.filterPillText,
                  isDark && styles.filterPillTextDark,
                  filtroTutor === 'pasados' && styles.filterPillTextActive,
                ]}
              >
                Historial ({tutorPasados.length})
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                isDark && styles.filterPillDark,
                filtroVet === 'pendientes' && styles.filterPillActive,
              ]}
              onPress={() => setFiltroVet('pendientes')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="alert-circle-outline"
                size={14}
                color={filtroVet === 'pendientes' ? '#ffffff' : '#0284c7'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.filterPillText,
                  isDark && styles.filterPillTextDark,
                  filtroVet === 'pendientes' && styles.filterPillTextActive,
                ]}
              >
                Pendientes ({vetPendientes.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                isDark && styles.filterPillDark,
                filtroVet === 'confirmados' && styles.filterPillActive,
              ]}
              onPress={() => setFiltroVet('confirmados')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color={filtroVet === 'confirmados' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.greenDeep)}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.filterPillText,
                  isDark && styles.filterPillTextDark,
                  filtroVet === 'confirmados' && styles.filterPillTextActive,
                ]}
              >
                Agenda ({vetConfirmados.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                isDark && styles.filterPillDark,
                filtroVet === 'historial' && styles.filterPillActive,
              ]}
              onPress={() => setFiltroVet('historial')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="archive-outline"
                size={14}
                color={filtroVet === 'historial' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.filterPillText,
                  isDark && styles.filterPillTextDark,
                  filtroVet === 'historial' && styles.filterPillTextActive,
                ]}
              >
                Historial ({vetHistorial.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contenido / Listado de Turnos */}
        {loading && turnos.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.greenDeep} />
            <Text style={[styles.loadingText, isDark && styles.subtituloDark]}>
              Cargando agenda de turnos...
            </Text>
          </View>
        ) : turnosMostrados.length === 0 ? (
          <EmptyState
            variant="appointments"
            title={
              modoVista === 'veterinario'
                ? filtroVet === 'pendientes'
                  ? 'No hay solicitudes pendientes'
                  : 'Sin turnos en esta sección'
                : filtroTutor === 'proximos'
                ? 'No tenés citas próximas programadas'
                : 'Historial de turnos vacío'
            }
            message={
              modoVista === 'veterinario'
                ? 'Los turnos solicitados por los tutores aparecerán aquí para ser confirmados o atendidos.'
                : 'Podés solicitar un turno veterinario fácilmente tocando el botón "+ Solicitar Turno".'
            }
          />
        ) : (
          <View style={styles.content}>
            {turnosMostrados.map((turno) => {
              const isGato = turno.mascotaEspecie?.toLowerCase().includes('gat');
              return (
                <View key={turno.id} style={[styles.card, isDark && styles.cardDark]}>
                  {/* Encabezado de la Tarjeta */}
                  <View style={styles.cardHeader}>
                    <View style={styles.petHeaderInfo}>
                      <View
                        style={[
                          styles.petIconCircle,
                          isGato && { backgroundColor: Palette.cyanLight },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={isGato ? 'cat' : 'dog'}
                          size={20}
                          color={isGato ? '#0284c7' : Palette.greenDeep}
                        />
                      </View>
                      <View>
                        <Text style={[styles.petName, isDark && styles.textDark]}>
                          {turno.mascotaNombre}
                        </Text>
                        <Text style={[styles.petSubtext, isDark && styles.subtituloDark]}>
                          {modoVista === 'veterinario'
                            ? `Tutor: ${turno.tutorNombre}`
                            : turno.motivo}
                        </Text>
                      </View>
                    </View>

                    {getEstadoBadge(turno.estado)}
                  </View>

                  {/* Fila Fecha y Hora */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                      <Ionicons name="calendar-outline" size={15} color={Palette.greenDeep} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, isDark && styles.subtituloDark]}>Fecha y Hora</Text>
                      <Text style={[styles.value, isDark && styles.textDark]}>
                        {turno.fecha} • {turno.hora} hs
                      </Text>
                    </View>
                  </View>

                  {/* Fila Veterinaria o Paciente */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                      <Ionicons
                        name={modoVista === 'veterinario' ? 'person-outline' : 'business-outline'}
                        size={15}
                        color={Palette.greenDeep}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, isDark && styles.subtituloDark]}>
                        {modoVista === 'veterinario' ? 'Contacto del Tutor' : 'Clínica Veterinaria'}
                      </Text>
                      <Text style={[styles.value, isDark && styles.textDark]}>
                        {modoVista === 'veterinario'
                          ? `${turno.tutorNombre} (${turno.tutorTelefono || 'Sin teléfono'})`
                          : turno.veterinariaNombre}
                      </Text>
                      {modoVista !== 'veterinario' && turno.veterinariaDireccion && (
                        <Text style={[styles.addressText, isDark && styles.subtituloDark]}>
                          {turno.veterinariaDireccion}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Motivo si estamos en modo veterinario */}
                  {modoVista === 'veterinario' && (
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconBox}>
                        <Ionicons name="medical-outline" size={15} color={Palette.greenDeep} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, isDark && styles.subtituloDark]}>Motivo de Consulta</Text>
                        <Text style={[styles.value, isDark && styles.textDark]}>{turno.motivo}</Text>
                      </View>
                    </View>
                  )}

                  {/* Notas del tutor (si las hay) */}
                  {turno.notasTutor ? (
                    <View style={[styles.notesBox, isDark && styles.notesBoxDark]}>
                      <Ionicons name="chatbubble-ellipses-outline" size={14} color={Palette.textSecondary} />
                      <Text style={[styles.notesText, isDark && styles.subtituloDark]}>
                        "{turno.notasTutor}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Observaciones del Veterinario (si está completado) */}
                  {turno.notasVeterinario ? (
                    <View style={[styles.diagnosisBox, isDark && styles.diagnosisBoxDark]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Ionicons name="shield-checkmark" size={14} color={Palette.greenDeep} />
                        <Text style={[styles.diagnosisTitle, isDark && styles.textDark]}>
                          Atención Clínica ({turno.veterinarioNombre || 'Profesional'})
                        </Text>
                      </View>
                      <Text style={[styles.diagnosisText, isDark && styles.subtituloDark]}>
                        {turno.notasVeterinario}
                      </Text>
                    </View>
                  ) : null}

                  {/* Botones de Acción según Modo y Estado */}
                  <View style={styles.cardActionsRow}>
                    {/* ACCIONES VISTA TUTOR */}
                    {modoVista === 'tutor' && (
                      <>
                        <TouchableOpacity
                          style={[styles.actionBtnOutline, isDark && styles.actionBtnOutlineDark]}
                          onPress={() => handleLlamar(turno.veterinariaTelefono)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="call-outline" size={14} color={Palette.greenDeep} />
                          <Text style={[styles.actionBtnOutlineText, isDark && styles.textDark]}>
                            Llamar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtnOutline, isDark && styles.actionBtnOutlineDark]}
                          onPress={() => router.push('/mapa')}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="map-outline" size={14} color={Palette.greenDeep} />
                          <Text style={[styles.actionBtnOutlineText, isDark && styles.textDark]}>
                            Mapa
                          </Text>
                        </TouchableOpacity>

                        {(turno.estado === 'solicitado' || turno.estado === 'confirmado') && (
                          <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => handleCancelarTutor(turno)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="close-circle-outline" size={14} color="#dc2626" />
                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}

                    {/* ACCIONES VISTA PROFESIONAL */}
                    {modoVista === 'veterinario' && (
                      <>
                        {turno.estado === 'solicitado' && (
                          <>
                            <TouchableOpacity
                              style={styles.confirmBtn}
                              onPress={() => handleConfirmarVet(turno)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="checkmark" size={15} color="#ffffff" />
                              <Text style={styles.confirmBtnText}>Aceptar Cita</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.rejectBtn}
                              onPress={() => handleRechazarVet(turno)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="close" size={15} color="#dc2626" />
                              <Text style={styles.rejectBtnText}>Rechazar</Text>
                            </TouchableOpacity>
                          </>
                        )}

                        {turno.estado === 'confirmado' && (
                          <>
                            <TouchableOpacity
                              style={styles.attendBtn}
                              onPress={() => setTurnoAAtender(turno)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="medkit-outline" size={15} color="#ffffff" />
                              <Text style={styles.attendBtnText}>Marcar Atendido</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.rejectBtn}
                              onPress={() => handleRechazarVet(turno)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="close-circle-outline" size={15} color="#dc2626" />
                              <Text style={styles.rejectBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                          </>
                        )}

                        {turno.estado === 'completado' && (
                          <TouchableOpacity
                            style={[styles.actionBtnOutline, isDark && styles.actionBtnOutlineDark]}
                            onPress={() => router.push('/recordatorios')}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="notifications-outline" size={14} color={Palette.greenDeep} />
                            <Text style={[styles.actionBtnOutlineText, isDark && styles.textDark]}>
                              Crear Recordatorio
                            </Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={[styles.actionBtnOutline, isDark && styles.actionBtnOutlineDark]}
                          onPress={() => handleLlamar(turno.tutorTelefono)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="call-outline" size={14} color={Palette.greenDeep} />
                          <Text style={[styles.actionBtnOutlineText, isDark && styles.textDark]}>
                            Tutor
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal para Solicitar Cita */}
      <SolicitarTurnoModal
        visible={modalSolicitarVisible}
        onClose={() => setModalSolicitarVisible(false)}
        onSolicitar={solicitar}
        onSuccess={() => {
          setModalSolicitarVisible(false);
          refresh();
        }}
      />

      {/* Modal para que el Veterinario complete la atención */}
      <AtenderTurnoModal
        visible={!!turnoAAtender}
        turno={turnoAAtender}
        onClose={() => setTurnoAAtender(null)}
        onConfirmarAtencion={async (turnoId, notasVet, vetInfo) => {
          await completar(turnoId, notasVet, vetInfo);
          refresh();
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
  modeBar: {
    flexDirection: 'row',
    backgroundColor: Palette.cardLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
    gap: 8,
  },
  modeBarDark: {
    backgroundColor: '#18181b',
    borderBottomColor: '#27272a',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  modeButtonActive: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.greenDeep,
  },
  modeButtonActiveDark: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.greenDeep,
  },
  modeButtonText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  modeButtonTextActive: {
    color: '#ffffff',
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 14,
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
    marginTop: 3,
    lineHeight: 18,
  },
  mainActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greenDeep,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    gap: 12,
    marginBottom: 16,
    ...Shadows.md,
  },
  mainActionButtonDark: {
    backgroundColor: '#15803d',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainActionTitle: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: '#ffffff',
  },
  mainActionSubtitle: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
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
    flex: 1,
  },
  petIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  petSubtext: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  statusConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusConfirmedText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  statusRequested: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.cyanLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusRequestedText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: '#0284c7',
    fontWeight: '700',
  },
  statusCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusCompletedText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: '#047857',
    fontWeight: '700',
  },
  statusCancelled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusCancelledText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: '#dc2626',
    fontWeight: '700',
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
  addressText: {
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 1,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Palette.backgroundLight,
    padding: 10,
    borderRadius: Radius.md,
    marginTop: 10,
  },
  notesBoxDark: {
    backgroundColor: '#27272a',
  },
  notesText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    flex: 1,
    fontStyle: 'italic',
  },
  diagnosisBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: Radius.md,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: Palette.greenDeep,
  },
  diagnosisBoxDark: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  diagnosisTitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
    color: Palette.greenDeep,
  },
  diagnosisText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    backgroundColor: Palette.cardLight,
  },
  actionBtnOutlineDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  actionBtnOutlineText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textPrimary,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenDeep,
    ...Shadows.sm,
  },
  confirmBtnText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: '#ffffff',
    fontWeight: '700',
  },
  attendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: '#0284c7',
    ...Shadows.sm,
  },
  attendBtnText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: '#ffffff',
    fontWeight: '700',
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectBtnText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: '#dc2626',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelBtnText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: '#dc2626',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  textDark: {
    color: '#fafafa',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
  textMutedDark: {
    color: '#71717a',
  },
});
