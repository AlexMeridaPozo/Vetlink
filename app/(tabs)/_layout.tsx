import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';

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
          name="scan"
          options={{
            title: 'Escanear',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="qr-code-scanner" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mapa"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'map' : 'map-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tienda"
          options={{
            href: null,
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
          name="sos"
          options={{
            title: 'Emergencia',
            tabBarActiveTintColor: '#dc2626',
            tabBarInactiveTintColor: '#ef4444',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="alarm-light" size={24} color={color} />
            ),
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '800',
              color: '#ef4444',
            },
          }}
        />
      </Tabs>
      <ChatLogo_Infferior />
    </View>
  );
}
