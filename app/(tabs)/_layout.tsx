import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatLogo_Infferior } from '@/components/ChatLogo_Infferior';
import { HapticTab } from '@/components/haptic-tab';
import { useAppTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  // En Android con barra de 3 botones (Atrás, Inicio, Recientes) o navegación por gestos,
  // y en iOS con la barra inferior / Home Indicator, insets.bottom aporta la altura real del sistema.
  // Calculamos la altura y el padding inferior dinámicamente para que los iconos y etiquetas
  // queden siempre por encima del área del sistema y sean 100% accesibles y fáciles de pulsar.
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8);
  const tabPaddingBottom = safeBottom > 0 ? safeBottom + (Platform.OS === 'android' ? 4 : 2) : 8;
  const tabHeight = 60 + safeBottom + (Platform.OS === 'android' && insets.bottom > 0 ? 4 : 0);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: '#04b639',
          tabBarInactiveTintColor: isDark ? '#71717a' : '#9ca3af',
          tabBarStyle: {
            backgroundColor: isDark ? '#121214' : '#ffffff',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#27272a' : '#f3f4f6',
            height: tabHeight,
            paddingBottom: tabPaddingBottom,
            paddingTop: 8,
            overflow: 'visible',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: isDark ? 0.35 : 0.08,
            shadowRadius: 8,
          },
          tabBarItemStyle: {
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mascotas"
          options={{
            title: 'Mascotas',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'paw' : 'paw-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="sos"
          options={{
            title: 'SOS',
            tabBarButton: (props) => (
              <View style={styles.centerTabWrapper}>
                <HapticTab {...props} style={[props.style, styles.centerTabButton]}>
                  <View style={[styles.sosSquareButton, isDark && styles.sosSquareButtonDark]}>
                    <Ionicons name="alert" size={24} color="#ffffff" />
                  </View>
                </HapticTab>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="mapa"
          options={{
            title: 'Explorar',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'compass' : 'compass-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="tienda"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <ChatLogo_Infferior />
    </View>
  );
}

const styles = StyleSheet.create({
  centerTabWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerTabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    top: -12,
  },
  sosSquareButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  sosSquareButtonDark: {
    backgroundColor: '#dc2626',
    borderColor: '#fee2e2',
    shadowColor: '#000000',
    shadowOpacity: 0.5,
  },
});
