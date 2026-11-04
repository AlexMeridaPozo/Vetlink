import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
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
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
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

    // Actualizar marcadores dinámicamente si el mapa ya está cargado
    useEffect(() => {
      if (isMapReadyRef.current) {
        iframeRef.current?.contentWindow?.postMessage(
          { action: 'SET_CLINICS', data: veterinarias },
          '*'
        );
      }
    }, [veterinarias]);

    useImperativeHandle(ref, () => ({
      focusClinic: (id: string) => {
        iframeRef.current?.contentWindow?.postMessage({ action: 'FOCUS_CLINIC', id }, '*');
      },
      centerOnUser: (lat: number, lng: number) => {
        iframeRef.current?.contentWindow?.postMessage({ action: 'CENTER_USER', lat, lng }, '*');
      },
      fitAll: () => {
        iframeRef.current?.contentWindow?.postMessage({ action: 'FIT_ALL' }, '*');
      },
    }));

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (!data || typeof data !== 'object' || !data.type) return;

          if (data.type === 'SELECT_CLINIC' && data.id) {
            onSelectClinic?.(data.id);
          } else if (data.type === 'MAP_TAP') {
            onMapTap?.();
          } else if (data.type === 'MAP_READY') {
            isMapReadyRef.current = true;
            onMapReady?.();
          }
        } catch {
          // Ignorar mensajes no compatibles
        }
      };

      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, [onSelectClinic, onMapTap, onMapReady]);

    return (
      <View style={[styles.container, style]}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          title="Mapa de Veterinarias OpenStreetMap"
          allow="geolocation"
        />
      </View>
    );
  }
);

LeafletMapView.displayName = 'LeafletMapViewWeb';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});
