import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatLogo_Infferior } from '@/components/ChatLogo_Infferior';
import { HapticTab } from '@/components/haptic-tab';
import { useAppTheme } from '@/context/ThemeContext';
import { Palette, FontFamily } from '@/constants/theme';

export default function TabLayout() {
  const { isDark, colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8);
  const tabPaddingBottom = safeBottom > 0 ? safeBottom + (Platform.OS === 'android' ? 4 : 2) : 8;
  const tabHeight = 60 + safeBottom + (Platform.OS === 'android' && insets.bottom > 0 ? 4 : 0);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: isDark ? colors.textSecondary : '#5C6B64',
          tabBarStyle: {
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: isDark ? colors.border : '#E2EFE7',
            height: tabHeight,
            paddingBottom: tabPaddingBottom,
            paddingTop: 8,
            overflow: 'visible',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: isDark ? 0.35 : 0.05,
            shadowRadius: 8,
          },
          tabBarItemStyle: {
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: FontFamily.bodySemiBold,
            marginTop: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconWrapper}>
                <Ionicons name="home-outline" size={24} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="mascotas"
          options={{
            title: 'Mascotas',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconWrapper}>
                <Ionicons name="paw-outline" size={24} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
              </View>
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
                    <Ionicons name="alert-circle-outline" size={26} color="#ffffff" />
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
              <View style={styles.iconWrapper}>
                <Ionicons name="compass-outline" size={24} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconWrapper}>
                <Ionicons name="person-outline" size={24} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
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
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
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
    borderRadius: 18,
    backgroundColor: Palette.redEmergency,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    shadowColor: Palette.redEmergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  sosSquareButtonDark: {
    backgroundColor: '#EF4444',
    borderColor: '#381616',
    shadowColor: '#000000',
    shadowOpacity: 0.5,
  },
});
