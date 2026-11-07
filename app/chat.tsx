import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import {
  enviarMensajeChat,
  limpiarTextoSinAsteriscos,
  validarMensajeUsuario,
  type ChatMessage,
} from '@/services/chatService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette, Typography, Radius, Shadows } from '@/constants/theme';

const SUGERENCIAS_INICIALES = [
  '¿Cómo puedo registrar una nueva mascota?',
  '¿Qué turnos tengo agendados actualmente?',
  '¿Cómo identifico a mi mascota con código QR o NFC?',
  '¿Cómo creo un recordatorio de vacunación?',
];

function generarIdMensaje(prefix: 'user' | 'assistant'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { user } = useAuth();

  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleVolver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [mensajes, cargando]);

  const handleEnviar = async (textoAEnviar?: string) => {
    const texto = (textoAEnviar !== undefined ? textoAEnviar : inputText).trim();

    const validacion = validarMensajeUsuario(texto);
    if (!validacion.valido) {
      Alert.alert('Consulta no válida', validacion.error);
      return;
    }

    if (cargando) return;

    setErrorMensaje(null);
    setInputText('');

    const nuevoMensajeUsuario: ChatMessage = {
      id: generarIdMensaje('user'),
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
        id: generarIdMensaje('assistant'),
        role: 'assistant',
        content: limpiarTextoSinAsteriscos(respuesta),
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

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
        <View style={[styles.topBar, isDark && styles.topBarDark]}>
          <TouchableOpacity
            onPress={handleVolver}
            style={[styles.backBtn, isDark && styles.backBtnDark]}
            activeOpacity={0.7}
            accessibilityLabel="Regresar"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={18} color={Palette.greenDeep} />
            <Text style={[styles.backBtnText, isDark && styles.backBtnTextDark]}>Regresar</Text>
          </TouchableOpacity>
          <Text style={[styles.screenTitle, isDark && styles.textDark]}>Asistente HuellaApp</Text>
          <ThemeToggleButton />
        </View>

        <View style={styles.authRequiredContainer}>
          <View style={[styles.authIconCircle, isDark && styles.authIconCircleDark]}>
            <Ionicons name="lock-closed-outline" size={44} color={Palette.greenDeep} />
          </View>
          <Text style={[styles.authRequiredTitle, isDark && styles.textDark]}>
            Inicia sesión para consultar
          </Text>
          <Text style={[styles.authRequiredDesc, isDark && styles.subtituloDark]}>
            El Asistente Inteligente de HuellaApp está disponible para usuarios autenticados. Ingresa con tu cuenta para comenzar a chatear.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Ionicons name="log-in-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
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
          onPress={handleVolver}
          style={[styles.backBtn, isDark && styles.backBtnDark]}
          activeOpacity={0.7}
          accessibilityLabel="Regresar"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={18} color={Palette.greenDeep} />
          <Text style={[styles.backBtnText, isDark && styles.backBtnTextDark]}>Regresar</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.avatarMini}>
            <MaterialCommunityIcons name="chat-outline" size={18} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.screenTitle, isDark && styles.textDark]} numberOfLines={1}>
              Asistente HuellaApp
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>IA Activa • Orientación y Cuidados</Text>
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
              <Ionicons name="trash-outline" size={19} color={isDark ? '#a1a1aa' : Palette.textSecondary} />
            </TouchableOpacity>
          )}
          <ThemeToggleButton />
        </View>
      </View>

      {/* ── BANNER DE RESPONSABILIDAD MÉDICA ────────────────────────────── */}
      <View style={[styles.disclaimerBanner, isDark && styles.disclaimerBannerDark]}>
        <Ionicons name="information-circle-outline" size={16} color={Palette.greenDeep} style={{ marginRight: 6 }} />
        <Text style={[styles.disclaimerText, isDark && styles.disclaimerTextDark]}>
          Orientación educativa. Ante síntomas graves, acude de inmediato a una guardia veterinaria activa.
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
                <MaterialCommunityIcons name="paw" size={40} color={Palette.greenDeep} />
              </View>
              <Text style={[styles.welcomeTitle, isDark && styles.textDark]}>
                Asistente Virtual HuellaApp
              </Text>
              <Text style={[styles.welcomeSubtitle, isDark && styles.subtituloDark]}>
                Hola, {user.displayName || 'tutor/a'}. Estoy para orientarte en el registro de tus mascotas, turnos, recordatorios y el uso de las funciones de la aplicación.
              </Text>

              <Text style={[styles.suggestionsHeader, isDark && styles.textDark]}>
                Consultas frecuentes sobre la aplicación:
              </Text>

              <View style={styles.suggestionsGrid}>
                {SUGERENCIAS_INICIALES.map((sug, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionChip, isDark && styles.suggestionChipDark]}
                    onPress={() => handleEnviar(sug)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="help-circle-outline" size={16} color={Palette.greenDeep} style={{ marginRight: 6 }} />
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
                      <MaterialCommunityIcons name="paw" size={15} color="#ffffff" />
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
                      {limpiarTextoSinAsteriscos(item.content)}
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

          {/* Indicador de carga */}
          {cargando && (
            <View style={[styles.messageWrapper, styles.messageWrapperAssistant]}>
              <View style={styles.assistantAvatar}>
                <MaterialCommunityIcons name="paw" size={15} color="#ffffff" />
              </View>
              <View style={[styles.bubble, isDark ? styles.bubbleAssistantDark : styles.bubbleAssistant, styles.typingBubble]}>
                <ActivityIndicator size="small" color={Palette.greenDeep} style={{ marginRight: 8 }} />
                <Text style={[styles.typingText, isDark && styles.subtituloDark]}>
                  HuellaApp está escribiendo...
                </Text>
              </View>
            </View>
          )}

          {/* Mensaje de Error */}
          {errorMensaje && (
            <View style={[styles.errorCard, isDark && styles.errorCardDark]}>
              <Ionicons name="alert-circle-outline" size={20} color={Palette.redEmergency} style={{ marginRight: 8 }} />
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
            placeholderTextColor={Palette.textMuted}
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
    backgroundColor: Palette.backgroundLight,
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
    borderBottomColor: Palette.borderLight,
    backgroundColor: Palette.cardLight,
    gap: 8,
  },
  topBarDark: {
    borderBottomColor: '#27272a',
    backgroundColor: '#09090b',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenSoft,
    gap: 4,
  },
  backBtnDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
  },
  backBtnText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
  backBtnTextDark: {
    color: '#86efac',
  },
  clearBtn: {
    padding: 6,
    borderRadius: Radius.sm,
    marginRight: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: Typography.size.body,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
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
    backgroundColor: Palette.greenPrimary,
  },
  statusText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.greenDeep,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cyanLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  disclaimerBannerDark: {
    backgroundColor: 'rgba(101, 207, 224, 0.12)',
    borderBottomColor: '#27272a',
  },
  disclaimerText: {
    flex: 1,
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
    lineHeight: 15,
  },
  disclaimerTextDark: {
    color: '#cbd5e1',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  welcomeIconCircle: {
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
  welcomeIconCircleDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
    borderColor: Palette.greenDeep,
  },
  welcomeTitle: {
    fontSize: Typography.size.h2,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  suggestionsHeader: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  suggestionsGrid: {
    width: '100%',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Shadows.sm,
  },
  suggestionChipDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  suggestionChipText: {
    flex: 1,
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
    lineHeight: 18,
  },
  suggestionChipTextDark: {
    color: '#e2e8f0',
  },
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
    backgroundColor: Palette.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: Radius.lg,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  bubbleUser: {
    backgroundColor: Palette.greenDeep,
    borderBottomRightRadius: 4,
    ...Shadows.sm,
  },
  bubbleAssistant: {
    backgroundColor: Palette.cyanLight,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    ...Shadows.sm,
  },
  bubbleAssistantDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: '#ffffff',
  },
  bubbleTextAssistant: {
    color: Palette.textPrimary,
  },
  bubbleTextAssistantDark: {
    color: '#fafafa',
  },
  bubbleTime: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeUser: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  bubbleTimeAssistant: {
    color: Palette.textMuted,
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
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    fontStyle: 'italic',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.redSoft,
    borderWidth: 1,
    borderColor: Palette.redBorder,
    borderRadius: Radius.md,
    padding: 12,
    marginVertical: 10,
  },
  errorCardDark: {
    backgroundColor: 'rgba(217, 74, 74, 0.15)',
    borderColor: 'rgba(217, 74, 74, 0.3)',
  },
  errorText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.redEmergency,
    lineHeight: 16,
  },
  retryBtn: {
    backgroundColor: Palette.redEmergency,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    marginLeft: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Palette.cardLight,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
    gap: 10,
  },
  inputContainerDark: {
    backgroundColor: '#09090b',
    borderTopColor: '#27272a',
  },
  textInput: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
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
    backgroundColor: Palette.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  charCounter: {
    fontSize: Typography.size.tiny,
    color: Palette.textMuted,
    textAlign: 'right',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  authRequiredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  authIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Palette.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  authIconCircleDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
  },
  authRequiredTitle: {
    fontSize: Typography.size.h2,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  authRequiredDesc: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greenDeep,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
  },
  textDark: {
    color: '#fafafa',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
});
