import { auth } from '@/config/firebase';
import {
  obtenerContextoUsuarioAutenticado,
  formatearContextoParaPrompt,
} from './chatContextService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// URL del backend seguro en Cloudflare Workers
// Se configura en .env mediante EXPO_PUBLIC_CHAT_API_URL
const CHAT_API_URL = process.env.EXPO_PUBLIC_CHAT_API_URL;

/**
 * Valida un mensaje de usuario antes de enviarlo
 */
export function validarMensajeUsuario(texto: string): { valido: boolean; error?: string } {
  const limpio = (texto || '').trim();
  if (limpio.length === 0) {
    return { valido: false, error: 'Por favor, escribe una pregunta antes de enviar.' };
  }
  if (limpio.length > 500) {
    return {
      valido: false,
      error: 'El mensaje es demasiado largo. Limítalo a un máximo de 500 caracteres.',
    };
  }
  return { valido: true };
}

/**
 * Envía la conversación al backend de Cloudflare Workers, autenticando
 * la solicitud mediante el token ID de Firebase Authentication.
 *
 * Flujo de seguridad:
 * 1. Verifica sesión activa en el cliente (Firebase Authentication).
 * 2. Obtiene el token ID firmado criptográficamente de Firebase.
 * 3. Recupera los datos autorizados del usuario en Firestore (modo solo lectura y minimizado).
 * 4. Envía la solicitud al Worker mediante HTTPS con Authorization: Bearer <idToken>.
 * 5. El Worker valida la firma del token y se comunica con Groq sin exponer la API Key en el cliente.
 */
export async function enviarMensajeChat(historial: ChatMessage[]): Promise<string> {
  // 1. Verificación obligatoria de autenticación del usuario
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Debes iniciar sesión con tu cuenta de VetLink para utilizar el Asistente IA.');
  }

  if (!historial || historial.length === 0) {
    throw new Error('No hay mensajes para enviar.');
  }

  const ultimoMensaje = historial[historial.length - 1];
  const consultaActual = (ultimoMensaje.content || '').trim();

  if (!consultaActual) {
    throw new Error('El mensaje no puede estar vacío.');
  }

  // 2. Comprobación de configuración del endpoint del Worker
  if (!CHAT_API_URL || CHAT_API_URL.trim().length === 0) {
    throw new Error(
      'El backend de Cloudflare Workers no está configurado. Define EXPO_PUBLIC_CHAT_API_URL en tu archivo .env con la URL de tu Worker desplegado.'
    );
  }

  // 3. Obtener token ID vigente de Firebase Authentication
  const idToken = await currentUser.getIdToken(false);

  // 4. Consulta autorizada en Firestore para el UID autenticado
  const contextoUsuario = await obtenerContextoUsuarioAutenticado();
  const contextoTexto = formatearContextoParaPrompt(contextoUsuario);

  // 5. Preparar historial reciente (últimos 8 mensajes)
  const mensajesRecientes = historial.slice(-8).map((m) => ({
    role: m.role,
    content: m.content.trim(),
  }));

  // Timeout defensivo de 20 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(CHAT_API_URL.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        messages: mensajesRecientes,
        userContext: contextoTexto,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      console.warn('[ChatService - Worker Error]:', response.status, errorJson);

      if (response.status === 401) {
        throw new Error('Tu sesión ha expirado o no es válida. Por favor, vuelve a iniciar sesión en VetLink.');
      }
      if (response.status === 429) {
        throw new Error('Límite de solicitudes alcanzado en el asistente. Por favor, aguarda unos instantes.');
      }

      const mensaje = errorJson?.error || `Error en el servicio de IA (${response.status})`;
      throw new Error(mensaje);
    }

    const data = (await response.json()) as { reply?: string };

    if (!data.reply || data.reply.trim().length === 0) {
      throw new Error('El asistente no generó una respuesta válida. Intenta reformular tu consulta.');
    }

    return data.reply.trim();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[ChatService - Exception]:', err);

    if (err?.name === 'AbortError') {
      throw new Error('La respuesta tardó demasiado. Por favor, verifica tu conexión e intenta nuevamente.');
    }

    const mensajeError = err?.message || '';
    if (mensajeError.includes('Network') || mensajeError.includes('fetch')) {
      throw new Error('No fue posible conectar con el servidor de VetLink. Revisa tu conexión a internet.');
    }

    throw new Error(err?.message || 'Ocurrió un error al consultar al Asistente VetLink. Intenta nuevamente.');
  }
}
