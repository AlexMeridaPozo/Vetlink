import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { generateLeafletHtml } from './leafletHtml';
import { LeafletMapViewProps, LeafletMapViewRef } from './LeafletMapView.types';

export const LeafletMapView = forwardRef<LeafletMapViewRef, LeafletMapViewProps>(
  (
    {
      initialLat,
      initialLng,
      zoom = 13,
      veterinarias,
      userLocation,
      isDark = false,
      onSelectClinic,
      onMapTap,
      onMapReady,
      style,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null);
    const isMapReadyRef = useRef(false);

    const html = useMemo(() => {
      return generateLeafletHtml({
        initialLat,
        initialLng,
        zoom,
        veterinarias,
        userLocation,
        isDark,
      });
    }, [initialLat, initialLng, zoom, veterinarias, userLocation, isDark]);

    // Actualizar marcadores dinámicamente si el WebView ya terminó de cargar
    useEffect(() => {
      if (isMapReadyRef.current) {
        const js = `window.setVeterinarias && window.setVeterinarias(${JSON.stringify(veterinarias)}); true;`;
        webViewRef.current?.injectJavaScript(js);
      }
    }, [veterinarias]);

    useImperativeHandle(ref, () => ({
      focusClinic: (id: string) => {
        const js = `window.focusClinic && window.focusClinic('${id}'); true;`;
        webViewRef.current?.injectJavaScript(js);
      },
      centerOnUser: (lat: number, lng: number) => {
        const js = `window.centerOnUser && window.centerOnUser(${lat}, ${lng}); true;`;
        webViewRef.current?.injectJavaScript(js);
      },
      fitAll: () => {
        const js = `window.fitAll && window.fitAll(); true;`;
        webViewRef.current?.injectJavaScript(js);
      },
    }));

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (!data || typeof data !== 'object' || !data.type) return;

        if (data.type === 'SELECT_CLINIC' && data.id) {
          onSelectClinic?.(data.id);
        } else if (data.type === 'MAP_TAP') {
          onMapTap?.();
        } else if (data.type === 'MAP_READY') {
          isMapReadyRef.current = true;
          onMapReady?.();
        }
      } catch (err) {
        console.warn('[LeafletMapView.native] Error parsing webview message:', err);
      }
    };

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          geolocationEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
        />
      </View>
    );
  }
);

LeafletMapView.displayName = 'LeafletMapViewNative';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
