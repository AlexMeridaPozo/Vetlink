import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configura el comportamiento de las notificaciones cuando la aplicación está en primer plano
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('[NotificationService] Error configurando notificationHandler:', e);
}

/**
 * Inicializa los canales requeridos para Android y verifica permisos
 */
export async function initNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('recordatorios_channel', {
        name: 'Recordatorios Sanitarios',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#04b639',
        sound: 'default',
        enableVibrate: true,
      });
    }
  } catch (error) {
    console.warn('[NotificationService] Error inicializando canal Android:', error);
  }
}

/**
 * Solicita permisos de notificación al usuario
 */
export async function solicitarPermisosNotificaciones(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('[NotificationService] Error solicitando permisos:', error);
    return false;
  }
}

/**
 * Programa una notificación automática para la fecha y hora indicadas.
 * El sistema operativo se encarga de dispararla incluso si la aplicación está cerrada.
 */
export async function programarNotificacionRecordatorio(params: {
  recordatorioId: string;
  titulo: string;
  descripcion: string;
  fechaHora: Date | string;
}): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const hasPermission = await solicitarPermisosNotificaciones();
    if (!hasPermission) {
      console.warn('[NotificationService] No hay permisos de notificación concedidos');
    }

    const targetDate = typeof params.fechaHora === 'string' ? new Date(params.fechaHora) : params.fechaHora;
    const now = Date.now();

    // Solo se pueden programar fechas futuras
    if (targetDate.getTime() <= now) {
      console.warn('[NotificationService] La fecha y hora programadas ya pasaron');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 ${params.titulo}`,
        body: params.descripcion || 'Recordatorio de atención sanitaria veterinaria programado.',
        sound: true,
        data: {
          recordatorioId: params.recordatorioId,
          url: '/recordatorios',
        },
        ...(Platform.OS === 'android' ? { channelId: 'recordatorios_channel' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: targetDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.warn('[NotificationService] Error programando notificación automática:', error);
    return null;
  }
}

/**
 * Cancela una notificación previamente programada en el sistema operativo
 */
export async function cancelarNotificacionRecordatorio(notificationId?: string | null): Promise<void> {
  if (Platform.OS === 'web' || !notificationId) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn('[NotificationService] Error cancelando notificación:', error);
  }
}
