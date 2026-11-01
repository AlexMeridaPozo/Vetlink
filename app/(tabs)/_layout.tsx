import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { ChatLogo_Infferior } from '@/components/ChatLogo_Infferior';
import { HapticTab } from '@/components/haptic-tab';
import { useAppTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { isDark } = useAppTheme();

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
            // Barra elevada con mayor altura y padding para separarla del borde inferior
            height: Platform.OS === 'ios' ? 92 : 72,
            paddingBottom: Platform.OS === 'ios' ? 30 : 12,
            paddingTop: 8,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: isDark ? 0.35 : 0.08,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
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
    top: -14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerTabButton: {
    justifyContent: 'center',
    alignItems: 'center',
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
