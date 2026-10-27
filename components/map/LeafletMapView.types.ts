import { StyleProp, ViewStyle } from 'react-native';
import { Veterinaria } from '@/constants/veterinarias';

export interface LeafletMapViewProps {
  initialLat: number;
  initialLng: number;
  zoom?: number;
  veterinarias: Veterinaria[];
  userLocation?: { latitude: number; longitude: number } | null;
  isDark?: boolean;
  onSelectClinic?: (id: string) => void;
  onMapTap?: () => void;
  onMapReady?: () => void;
  style?: StyleProp<ViewStyle>;
}

export interface LeafletMapViewRef {
  focusClinic: (id: string) => void;
  centerOnUser: (lat: number, lng: number) => void;
  fitAll: () => void;
}
