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

// ── Helpers comunes ──────────────────────────────────────────────────────────
function renderEstadoBadge(estado: TurnoEstado, isProfessionalView = false) {
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
            {isProfessionalView ? 'Pendiente' : 'Solicitado'}
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
}

function llamarTelefono(telefono?: string) {
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
}

// ══════════════════════════════════════════════════════════════════════════════
// VISTA EXCLUSIVA PARA EL TUTOR / PROPIETARIO
// ══════════════════════════════════════════════════════════════════════════════
function TurnosUsuarioView() {
  const { isDark } = useAppTheme();
  const { user } = useAuth();
  const [filtro, setFiltro] = useState<'proximos' | 'pasados'>('proximos');
  const [modalSolicitarVisible, setModalSolicitarVisible] = useState(false);

  const {
    turnos,
    loading,
    refreshing,
    refresh,
    solicitar,
    cancelar,
  } = useTurnos({
    tutorId: user?.uid,
    isVeterinario: false,
  });

  const proximos = useMemo(
    () => turnos.filter((t) => t.estado === 'solicitado' || t.estado === 'confirmado'),
    [turnos]
  );
  const pasados = useMemo(
    () => turnos.filter((t) => t.estado === 'completado' || t.estado === 'cancelado'),
    [turnos]
  );

  const turnosMostrados = filtro === 'proximos' ? proximos : pasados;

  const handleCancelarTutor = (turno: Turno) => {
    const advertencia = `¿Estás seguro de que deseas cancelar el turno de ${turno.mascotaNombre} para el ${turno.fecha} a las ${turno.hora} hs?`;

    const ejecutar = async () => {
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
        ejecutar();
      }
    } else {
      Alert.alert('Cancelar Cita', advertencia, [
        { text: 'Volver', style: 'cancel' },
        { text: 'Sí, Cancelar', style: 'destructive', onPress: ejecutar },
      ]);
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
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.textDark]}>Agenda de Citas</Text>
          <Text style={[styles.subtitle, isDark && styles.subtituloDark]}>
            Consulta, programa y gestiona las citas médicas de tus mascotas
          </Text>
        </View>

        {/* Botón Principal: Solicitar Turno */}
        <TouchableOpacity
          style={[styles.mainActionButton, isDark && styles.mainActionButtonDark]}
          onPress={() => setModalSolicitarVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="calendar-outline" size={20} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainActionTitle}>+ Solicitar Turno Veterinario</Text>
            <Text style={styles.mainActionSubtitle}>
              Elegí mascota, clínica veterinaria y horario deseado
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ffffff" />
        </TouchableOpacity>

        {/* Filtros de Citas */}
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
              Próximos ({proximos.length})
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
              Historial ({pasados.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido / Listado */}
        {loading && turnos.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.greenDeep} />
            <Text style={[styles.loadingText, isDark && styles.subtituloDark]}>
              Cargando tus citas médicas...
            </Text>
          </View>
        ) : turnosMostrados.length === 0 ? (
          <EmptyState
            variant="appointments"
            title={
              filtro === 'proximos'
                ? 'No tenés citas próximas programadas'
                : 'Todavía no tenés turnos pasados'
            }
            message="Podés solicitar un turno veterinario fácilmente tocando el botón '+ Solicitar Turno Veterinario'."
          />
        ) : (
          <View style={styles.content}>
            {turnosMostrados.map((turno) => {
              const isGato = turno.mascotaEspecie?.toLowerCase().includes('gat');
              return (
                <View key={turno.id} style={[styles.card, isDark && styles.cardDark]}>
                  {/* Header de la tarjeta */}
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
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.petName, isDark && styles.textDark]} numberOfLines={1}>
                          {turno.mascotaNombre}
                        </Text>
                        <Text style={[styles.petSubtext, isDark && styles.subtituloDark]} numberOfLines={1}>
                          {turno.motivo}
                        </Text>
                      </View>
                    </View>
                    {renderEstadoBadge(turno.estado, false)}
                  </View>

                  {/* Fecha y Hora */}
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

                  {/* Veterinaria */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                      <Ionicons name="business-outline" size={15} color={Palette.greenDeep} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, isDark && styles.subtituloDark]}>Veterinaria</Text>
                      <Text style={[styles.value, isDark && styles.textDark]}>
                        {turno.veterinariaNombre}
                      </Text>
                      {turno.veterinariaDireccion && (
                        <Text style={[styles.addressText, isDark && styles.subtituloDark]}>
                          {turno.veterinariaDireccion}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Notas del tutor */}
                  {turno.notasTutor ? (
                    <View style={[styles.notesBox, isDark && styles.notesBoxDark]}>
                      <Ionicons name="chatbubble-ellipses-outline" size={14} color={Palette.textSecondary} />
                      <Text style={[styles.notesText, isDark && styles.subtituloDark]}>
                        "{turno.notasTutor}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Diagnóstico del profesional si está completado */}
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

                  {/* Acciones para el Tutor */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtnOutline, isDark && styles.actionBtnOutlineDark]}
                      onPress={() => llamarTelefono(turno.veterinariaTelefono)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call-outline" size={14} color={Palette.greenDeep} />
                      <Text style={[styles.actionBtnOutlineText, isDark && styles.textDark]}>
                        Llamar a Clínica
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtnOutline, isDark && styles.actionBtnOutlineDark]}
                      onPress={() => router.push('/mapa')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="map-outline" size={14} color={Palette.greenDeep} />
                      <Text style={[styles.actionBtnOutlineText, isDark && styles.textDark]}>
                        Ver en Mapa
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
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal de Solicitud de Cita */}
      <SolicitarTurnoModal
        visible={modalSolicitarVisible}
        onClose={() => setModalSolicitarVisible(false)}
        onSolicitar={solicitar}
        onSuccess={() => {
          setModalSolicitarVisible(false);
          refresh();
        }}
      />
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VISTA EXCLUSIVA PARA EL PROFESIONAL VETERINARIO
// ══════════════════════════════════════════════════════════════════════════════
function TurnosProfesionalView() {
  const { isDark } = useAppTheme();
  const { user, profile } = useAuth();
  const [filtro, setFiltro] = useState<'pendientes' | 'confirmados' | 'historial'>('pendientes');

  const [modalNuevoTurnoVisible, setModalNuevoTurnoVisible] = useState(false);
  const [turnoAAtender, setTurnoAAtender] = useState<Turno | null>(null);

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
    isVeterinario: true,
  });

  const pendientes = useMemo(
    () => turnos.filter((t) => t.estado === 'solicitado'),
    [turnos]
  );
  const confirmados = useMemo(
    () => turnos.filter((t) => t.estado === 'confirmado'),
    [turnos]
  );
  const historial = useMemo(
    () => turnos.filter((t) => t.estado === 'completado' || t.estado === 'cancelado'),
    [turnos]
  );

  const turnosMostrados = useMemo(() => {
    if (filtro === 'pendientes') return pendientes;
    if (filtro === 'confirmados') return confirmados;
    return historial;
  }, [filtro, pendientes, confirmados, historial]);

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
    const promptMsg = `¿Deseas rechazar la solicitud de turno para ${turno.mascotaNombre}?`;

    const ejecutar = async () => {
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
        ejecutar();
      }
    } else {
      Alert.alert('Rechazar Turno', promptMsg, [
        { text: 'Atrás', style: 'cancel' },
        { text: 'Rechazar', style: 'destructive', onPress: ejecutar },
      ]);
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
          Panel de Turnos Clínicos
        </Text>

        <ThemeToggleButton />
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
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.textDark]}>Gestión de Turnos Clínicos</Text>
          <Text style={[styles.subtitle, isDark && styles.subtituloDark]}>
            Gestioná las solicitudes, confirmá citas y registrá la atención clínica de tus pacientes
          </Text>
        </View>

        {/* Botón Principal: Nuevo Turno en Clínica */}
        <TouchableOpacity
          style={[styles.mainActionButton, isDark && styles.mainActionButtonDark]}
          onPress={() => setModalNuevoTurnoVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="calendar-outline" size={20} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainActionTitle}>+ Nuevo Turno en Clínica</Text>
            <Text style={styles.mainActionSubtitle}>
              Agendar cita para paciente presencial o telefónico
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ffffff" />
        </TouchableOpacity>

        {/* Filtros Clínicos */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              isDark && styles.filterPillDark,
              filtro === 'pendientes' && styles.filterPillActive,
            ]}
            onPress={() => setFiltro('pendientes')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="alert-circle-outline"
              size={14}
              color={filtro === 'pendientes' ? '#ffffff' : '#0284c7'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.filterPillText,
                isDark && styles.filterPillTextDark,
                filtro === 'pendientes' && styles.filterPillTextActive,
              ]}
            >
              Pendientes ({pendientes.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              isDark && styles.filterPillDark,
              filtro === 'confirmados' && styles.filterPillActive,
            ]}
            onPress={() => setFiltro('confirmados')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={14}
              color={filtro === 'confirmados' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.greenDeep)}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.filterPillText,
                isDark && styles.filterPillTextDark,
                filtro === 'confirmados' && styles.filterPillTextActive,
              ]}
            >
              Agenda ({confirmados.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              isDark && styles.filterPillDark,
              filtro === 'historial' && styles.filterPillActive,
            ]}
            onPress={() => setFiltro('historial')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="archive-outline"
              size={14}
              color={filtro === 'historial' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.filterPillText,
                isDark && styles.filterPillTextDark,
                filtro === 'historial' && styles.filterPillTextActive,
              ]}
            >
              Historial ({historial.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Listado Clínico */}
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
              filtro === 'pendientes'
                ? 'No hay solicitudes pendientes'
                : filtro === 'confirmados'
                ? 'No hay turnos confirmados en agenda'
                : 'Historial de turnos vacío'
            }
            message="Los turnos solicitados por los tutores aparecerán aquí para ser confirmados o atendidos."
          />
        ) : (
          <View style={styles.content}>
            {turnosMostrados.map((turno) => {
              const isGato = turno.mascotaEspecie?.toLowerCase().includes('gat');
              return (
                <View key={turno.id} style={[styles.card, isDark && styles.cardDark]}>
                  {/* Header de la tarjeta */}
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
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.petName, isDark && styles.textDark]} numberOfLines={1}>
                          {turno.mascotaNombre}
                        </Text>
                        <Text style={[styles.petSubtext, isDark && styles.subtituloDark]} numberOfLines={1}>
                          Tutor: {turno.tutorNombre}
                        </Text>
                      </View>
                    </View>
                    {renderEstadoBadge(turno.estado, true)}
                  </View>

                  {/* Fecha y Hora */}
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

                  {/* Contacto del Tutor */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                      <Ionicons name="person-outline" size={15} color={Palette.greenDeep} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, isDark && styles.subtituloDark]}>Contacto del Tutor</Text>
                      <Text style={[styles.value, isDark && styles.textDark]}>
                        {turno.tutorNombre} ({turno.tutorTelefono || 'Sin teléfono'})
                      </Text>
                    </View>
                  </View>

                  {/* Motivo de Consulta */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                      <Ionicons name="medical-outline" size={15} color={Palette.greenDeep} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, isDark && styles.subtituloDark]}>Motivo de Consulta</Text>
                      <Text style={[styles.value, isDark && styles.textDark]}>{turno.motivo}</Text>
                    </View>
                  </View>

                  {/* Notas o Síntomas */}
                  {turno.notasTutor ? (
                    <View style={[styles.notesBox, isDark && styles.notesBoxDark]}>
                      <Ionicons name="chatbubble-ellipses-outline" size={14} color={Palette.textSecondary} />
                      <Text style={[styles.notesText, isDark && styles.subtituloDark]}>
                        "{turno.notasTutor}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Diagnóstico si está completado */}
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

                  {/* Acciones Clínicas */}
                  <View style={styles.cardActionsRow}>
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
                      onPress={() => llamarTelefono(turno.tutorTelefono)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call-outline" size={14} color={Palette.greenDeep} />
                      <Text style={[styles.actionBtnOutlineText, isDark && styles.textDark]}>
                        Llamar Tutor
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal para agendar nuevo turno */}
      <SolicitarTurnoModal
        visible={modalNuevoTurnoVisible}
        onClose={() => setModalNuevoTurnoVisible(false)}
        onSolicitar={solicitar}
        onSuccess={() => {
          setModalNuevoTurnoVisible(false);
          refresh();
        }}
      />

      {/* Modal para completar atención */}
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

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL QUE SELECCIONA LA PANTALLA SEGÚN EL ROL
// ══════════════════════════════════════════════════════════════════════════════
export default function TurnosScreen() {
  const { isVeterinario } = useAuth();

  // Si el usuario es veterinario, muestra ÚNICAMENTE la vista profesional.
  // Si el usuario es tutor/propietario, muestra ÚNICAMENTE la vista de usuario.
  return isVeterinario ? <TurnosProfesionalView /> : <TurnosUsuarioView />;
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
    flex: 1,
    marginHorizontal: 8,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
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
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  filterPill: {
    flex: 1,
    minWidth: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
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
});
