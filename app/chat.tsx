import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme, ThemeToggleButton } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  enviarMensajeChat,
  validarMensajeUsuario,
  type ChatMessage,
} from '@/services/chatService';

const SUGERENCIAS_INICIALES = [
  '🥩 ¿Qué alimentos son tóxicos para perros y gatos?',
  '🐱 ¿Cómo saber si mi mascota está deshidratada?',
  '💉 ¿Cuáles son las vacunas esenciales en el primer año?',
  '📅 ¿Cómo programar turnos y recordatorios en VetLink?',
];

export default function ChatScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { user } = useAuth();

  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll al final cuando se añade un mensaje o cambia el estado
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [mensajes, cargando]);

  const handleEnviar = async (textoAEnviar?: string) => {
    const texto = (textoAEnviar !== undefined ? textoAEnviar : inputText).trim();

    // Validar mensaje
    const validacion = validarMensajeUsuario(texto);
    if (!validacion.valido) {
      Alert.alert('Consulta inválida', validacion.error);
      return;
    }

    if (cargando) return;

    setErrorMensaje(null);
    setInputText('');

    const nuevoMensajeUsuario: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: 'user',
      content: texto,
      timestamp: new Date(),
    };

    const nuevoHistorial = [...mensajes, nuevoMensajeUsuario];
    setMensajes(nuevoHistorial);
    setCargando(true);

    try {
      const respuesta = await enviarMensajeChat(nuevoHistorial);

      const nuevoMensajeAsistente: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        role: 'assistant',
        content: respuesta,
        timestamp: new Date(),
      };

      setMensajes((prev) => [...prev, nuevoMensajeAsistente]);
    } catch (err: any) {
      const errorMsg =
        err?.message || 'No fue posible obtener una respuesta. Verifica tu conexión e intenta nuevamente.';
      setErrorMensaje(errorMsg);
    } finally {
      setCargando(false);
    }
  };

  const handleLimpiarConversacion = () => {
    if (mensajes.length === 0) return;

    Alert.alert(
      'Reiniciar Conversación',
      '¿Deseas borrar el historial actual de preguntas y respuestas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: () => {
            setMensajes([]);
            setErrorMensaje(null);
          },
        },
      ]
    );
  };

  const formatearHora = (date: Date) => {
    try {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Si no está autenticado, invitar a iniciar sesión
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
        <View style={[styles.topBar, isDark && styles.topBarDark]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={isDark ? '#fafafa' : '#0f172a'} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, isDark && styles.textDark]}>Asistente VetLink</Text>
          <ThemeToggleButton />
        </View>

        <View style={styles.authRequiredContainer}>
          <View style={[styles.authIconCircle, isDark && styles.authIconCircleDark]}>
            <Ionicons name="lock-closed" size={48} color="#04b639" />
          </View>
          <Text style={[styles.authRequiredTitle, isDark && styles.textDark]}>
            Inicia sesión para consultar
          </Text>
          <Text style={[styles.authRequiredDesc, isDark && styles.subtituloDark]}>
            El Asistente Inteligente de VetLink está disponible para usuarios autenticados. Ingresa con tu cuenta para comenzar a chatear.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Ionicons name="log-in-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
      {/* ── BARRA SUPERIOR ─────────────────────────────────────────────── */}
      <View style={[styles.topBar, isDark && styles.topBarDark]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={22} color={isDark ? '#fafafa' : '#0f172a'} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.avatarMini}>
            <MaterialCommunityIcons name="robot-happy" size={20} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.screenTitle, isDark && styles.textDark]} numberOfLines={1}>
              Asistente VetLink
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>IA Activa • Orientación Canina y Felina</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {mensajes.length > 0 && (
            <TouchableOpacity
              onPress={handleLimpiarConversacion}
              style={styles.clearBtn}
              activeOpacity={0.7}
              accessibilityLabel="Borrar historial"
            >
              <Ionicons name="trash-outline" size={19} color={isDark ? '#a1a1aa' : '#64748b'} />
            </TouchableOpacity>
          )}
          <ThemeToggleButton />
        </View>
      </View>

      {/* ── BANNER DE RESPONSABILIDAD MÉDICA ────────────────────────────── */}
      <View style={[styles.disclaimerBanner, isDark && styles.disclaimerBannerDark]}>
        <Ionicons name="information-circle-outline" size={16} color="#047857" style={{ marginRight: 6 }} />
        <Text style={[styles.disclaimerText, isDark && styles.disclaimerTextDark]}>
          Orientación educativa. Ante síntomas graves, acude de inmediato a una guardia veterinaria.
        </Text>
      </View>

      {/* ── ÁREA DE MENSAJES ───────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {mensajes.length === 0 ? (
            /* Estado Inicial / Bienvenida */
            <View style={styles.welcomeContainer}>
              <View style={[styles.welcomeIconCircle, isDark && styles.welcomeIconCircleDark]}>
                <MaterialCommunityIcons name="paw" size={44} color="#04b639" />
              </View>
              <Text style={[styles.welcomeTitle, isDark && styles.textDark]}>
                ¡Hola, {user.displayName || 'tutor'}! 🐾
              </Text>
              <Text style={[styles.welcomeSubtitle, isDark && styles.subtituloDark]}>
                Soy tu asistente virtual de VetLink. Pregúntame sobre cuidados, nutrición, prevención o cómo usar la app.
              </Text>

              <Text style={[styles.suggestionsHeader, isDark && styles.textDark]}>
                Consultas frecuentes:
              </Text>

              <View style={styles.suggestionsGrid}>
                {SUGERENCIAS_INICIALES.map((sug, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionChip, isDark && styles.suggestionChipDark]}
                    onPress={() => handleEnviar(sug)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.suggestionChipText, isDark && styles.suggestionChipTextDark]}>
                      {sug}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            /* Lista de Mensajes */
            mensajes.map((item) => {
              const isUser = item.role === 'user';

              return (
                <View
                  key={item.id}
                  style={[
                    styles.messageWrapper,
                    isUser ? styles.messageWrapperUser : styles.messageWrapperAssistant,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.assistantAvatar}>
                      <MaterialCommunityIcons name="paw" size={16} color="#ffffff" />
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isUser
                        ? styles.bubbleUser
                        : isDark
                        ? styles.bubbleAssistantDark
                        : styles.bubbleAssistant,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isUser
                          ? styles.bubbleTextUser
                          : isDark
                          ? styles.bubbleTextAssistantDark
                          : styles.bubbleTextAssistant,
                      ]}
                      selectable
                    >
                      {item.content}
                    </Text>

                    <Text
                      style={[
                        styles.bubbleTime,
                        isUser
                          ? styles.bubbleTimeUser
                          : isDark
                          ? styles.bubbleTimeAssistantDark
                          : styles.bubbleTimeAssistant,
                      ]}
                    >
                      {formatearHora(item.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Indicador de carga cuando el modelo está respondiendo */}
          {cargando && (
            <View style={[styles.messageWrapper, styles.messageWrapperAssistant]}>
              <View style={styles.assistantAvatar}>
                <MaterialCommunityIcons name="paw" size={16} color="#ffffff" />
              </View>
              <View style={[styles.bubble, isDark ? styles.bubbleAssistantDark : styles.bubbleAssistant, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#04b639" style={{ marginRight: 8 }} />
                <Text style={[styles.typingText, isDark && styles.subtituloDark]}>
                  VetLink está escribiendo...
                </Text>
              </View>
            </View>
          )}

          {/* Mensaje de Error con opción de Reintentar */}
          {errorMensaje && (
            <View style={[styles.errorCard, isDark && styles.errorCardDark]}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.errorText}>{errorMensaje}</Text>
              </View>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  const lastUserMsg = [...mensajes].reverse().find((m) => m.role === 'user');
                  if (lastUserMsg) {
                    handleEnviar(lastUserMsg.content);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.retryBtnText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ── BARRA INFERIOR DE ESCRITURA ─────────────────────────────────── */}
        <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
          <TextInput
            style={[styles.textInput, isDark && styles.textInputDark, isDark && styles.textDark]}
            placeholder="Escribe tu consulta sobre mascotas..."
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!cargando}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || cargando) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleEnviar()}
            disabled={!inputText.trim() || cargando}
            activeOpacity={0.85}
            accessibilityLabel="Enviar pregunta"
          >
            {cargando ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={18} color="#ffffff" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>
        </View>

        {inputText.length > 400 && (
          <Text style={[styles.charCounter, isDark && styles.subtituloDark]}>
            {inputText.length} / 500 caracteres
          </Text>
        )}
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  topBarDark: {
    borderBottomColor: '#27272a',
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  clearBtn: {
    padding: 6,
    borderRadius: 8,
    marginRight: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#04b639',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#04b639',
  },
  statusText: {
    fontSize: 11,
    color: '#04b639',
    fontWeight: '600',
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
  },
  disclaimerBannerDark: {
    backgroundColor: '#132e1f',
    borderBottomColor: '#166534',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#166534',
    lineHeight: 15,
  },
  disclaimerTextDark: {
    color: '#86efac',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  // Welcome State
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  welcomeIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeIconCircleDark: {
    backgroundColor: '#132e1f',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  suggestionsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  suggestionsGrid: {
    width: '100%',
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionChipDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  suggestionChipText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: 18,
  },
  suggestionChipTextDark: {
    color: '#e2e8f0',
  },
  // Message Bubbles
  messageWrapper: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
    gap: 8,
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperAssistant: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#04b639',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  bubbleUser: {
    backgroundColor: '#04b639',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#f1f5f9',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bubbleAssistantDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: '#ffffff',
    fontWeight: '500',
  },
  bubbleTextAssistant: {
    color: '#0f172a',
  },
  bubbleTextAssistantDark: {
    color: '#fafafa',
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeUser: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  bubbleTimeAssistant: {
    color: '#94a3b8',
  },
  bubbleTimeAssistantDark: {
    color: '#71717a',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  // Error Card
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  errorCardDark: {
    backgroundColor: '#450a0a',
    borderColor: '#7f1d1d',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    lineHeight: 16,
  },
  retryBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  // Bottom Input Bar
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 10,
  },
  inputContainerDark: {
    backgroundColor: '#09090b',
    borderTopColor: '#27272a',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: '#0f172a',
    maxHeight: 100,
  },
  textInputDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    color: '#fafafa',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#04b639',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  charCounter: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'right',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  // Auth Required
  authRequiredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  authIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  authIconCircleDark: {
    backgroundColor: '#132e1f',
  },
  authRequiredTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  authRequiredDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04b639',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  textDark: {
    color: '#fafafa',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
});
