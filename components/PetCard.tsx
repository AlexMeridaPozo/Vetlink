/**
 * PetCard.tsx
 * Componente modular para representar la ficha resumida de una mascota.
 * Incluye avatar o placeholder de imagen, badges de especie, género, identificación,
 * estado de vinculación NFC y acciones interactivas.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Pet } from '@/services/petService';

export interface PetCardProps {
  pet: Pet;
  onPress?: (pet: Pet) => void;
  onQrPress?: (pet: Pet) => void;
  onNfcPress?: (pet: Pet) => void;
  onPhotoPress?: (pet: Pet) => void;
  isUpdatingPhoto?: boolean;
  isDark?: boolean;
}

export const PetCard = React.memo(function PetCard({
  pet,
  onPress = () => {},
  onQrPress = () => {},
  onNfcPress = () => {},
  onPhotoPress = () => {},
  isUpdatingPhoto = false,
  isDark = false,
}: PetCardProps) {
  const isMale = pet.sexo?.toLowerCase().includes('macho');
  const isNfcLinked = pet.nfcStatus === 'linked';

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      activeOpacity={0.85}
      onPress={() => onPress(pet)}
    >
      <View style={styles.cardHeader}>
        {/* Foto o Avatar con acción interactiva para agregar o cambiar foto */}
        <TouchableOpacity
          style={styles.avatarContainer}
          activeOpacity={0.8}
          onPress={() => onPhotoPress(pet)}
          accessibilityRole="button"
          accessibilityLabel={`Foto de perfil de ${pet.nombre}. Toca para cambiar o agregar foto.`}
        >
          {pet.fotoUrl ? (
            <Image
              source={{ uri: pet.fotoUrl }}
              style={styles.avatar}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.avatarFallback, isDark && styles.avatarFallbackDark]}>
              <MaterialIcons name="pets" size={32} color={isDark ? '#4ade80' : '#15803d'} />
            </View>
          )}

          {isUpdatingPhoto ? (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          ) : (
            <View style={[styles.avatarCameraBadge, isDark && styles.avatarCameraBadgeDark]}>
              <Ionicons name="camera" size={11} color="#ffffff" />
            </View>
          )}

          <View style={[styles.speciesBadge, isDark && styles.speciesBadgeDark]}>
            <Text style={styles.speciesBadgeText}>
              {pet.especie === 'Gato' ? '🐱' : '🐶'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Información Principal */}
        <View style={styles.petInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.petName, isDark && styles.petNameDark]}>{pet.nombre}</Text>
            <View
              style={[
                styles.genderBadge,
                { backgroundColor: isMale ? (isDark ? '#1e3a8a' : '#dbeafe') : (isDark ? '#831843' : '#fce7f3') },
              ]}
            >
              <Ionicons
                name={isMale ? 'male' : 'female'}
                size={12}
                color={isMale ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#f472b6' : '#be185d')}
              />
              <Text
                style={[
                  styles.genderText,
                  { color: isMale ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#f472b6' : '#be185d') },
                ]}
              >
                {pet.sexo}
              </Text>
            </View>
          </View>

          {/* Badges de Identificación Oficial y NFC */}
          <View style={styles.badgesRow}>
            <View style={[styles.idChip, isDark && styles.idChipDark]}>
              <Text style={[styles.idChipText, isDark && styles.idChipTextDark]}>{pet.id}</Text>
            </View>
            {isNfcLinked ? (
              <View style={[styles.nfcChipLinked, isDark && styles.nfcChipLinkedDark]}>
                <MaterialIcons name="nfc" size={12} color={isDark ? '#4ade80' : '#15803d'} />
                <Text style={[styles.nfcChipLinkedText, isDark && styles.nfcChipLinkedTextDark]}>
                  NFC Activo
                </Text>
              </View>
            ) : (
              <View style={[styles.nfcChipUnlinked, isDark && styles.nfcChipUnlinkedDark]}>
                <MaterialIcons name="nfc" size={12} color={isDark ? '#71717a' : '#9ca3af'} />
                <Text style={[styles.nfcChipUnlinkedText, isDark && styles.nfcChipUnlinkedTextDark]}>
                  Sin NFC
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.petBreed, isDark && styles.petBreedDark]}>
            {pet.especie} • {pet.raza}
          </Text>

          {/* Fila de Peso y Edad */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricItem, isDark && styles.metricItemDark]}>
              <MaterialIcons name="scale" size={14} color="#04b639" />
              <Text style={[styles.metricText, isDark && styles.metricTextDark]}>
                {pet.peso}
              </Text>
            </View>

            <View style={[styles.metricItem, isDark && styles.metricItemDark]}>
              <MaterialIcons name="cake" size={14} color="#04b639" />
              <Text style={[styles.metricText, isDark && styles.metricTextDark]}>
                {pet.edad}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={isDark ? '#71717a' : '#a1a1aa'}
          />
        </View>
      </View>

      {/* Fila de Acciones Rápidas: QR y Vincular NFC */}
      <View style={styles.cardActionsRow}>
        <TouchableOpacity
          style={[styles.quickActionBtn, styles.qrQuickBtn, isDark && styles.qrQuickBtnDark]}
          onPress={(e) => {
            e.stopPropagation?.();
            onQrPress(pet);
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="qr-code" size={16} color="#04b639" />
          <Text style={styles.quickActionBtnText}>QR / 3D</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionBtn,
            isNfcLinked
              ? (isDark ? styles.nfcQuickBtnLinkedDark : styles.nfcQuickBtnLinked)
              : (isDark ? styles.nfcQuickBtnDark : styles.nfcQuickBtn),
          ]}
          onPress={(e) => {
            e.stopPropagation?.();
            onNfcPress(pet);
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="nfc"
            size={16}
            color={isNfcLinked ? (isDark ? '#4ade80' : '#15803d') : '#04b639'}
          />
          <Text
            style={[
              styles.quickActionBtnText,
              isNfcLinked && { color: isDark ? '#4ade80' : '#15803d', fontWeight: '700' },
            ]}
          >
            {isNfcLinked ? '✓ NFC Vinculado' : 'Vincular NFC'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

export default PetCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginBottom: 14,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#15803d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(21, 128, 61, 0.07)',
      },
    }),
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: '#04b639',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  avatarCameraBadgeDark: {
    borderColor: '#18181b',
  },
  speciesBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#ffffff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  speciesBadgeDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  speciesBadgeText: {
    fontSize: 13,
  },
  petInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14532d',
  },
  petNameDark: {
    color: '#f4f4f5',
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  petBreed: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  petBreedDark: {
    color: '#a1a1aa',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  idChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  idChipDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  idChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  idChipTextDark: {
    color: '#e4e4e7',
  },
  nfcChipLinked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  nfcChipLinkedDark: {
    backgroundColor: '#064e3b33',
    borderColor: '#059669',
  },
  nfcChipLinkedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  nfcChipLinkedTextDark: {
    color: '#4ade80',
  },
  nfcChipUnlinked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nfcChipUnlinkedDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  nfcChipUnlinkedText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  nfcChipUnlinkedTextDark: {
    color: '#a1a1aa',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  metricItemDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  metricTextDark: {
    color: '#e4e4e7',
  },
  arrowContainer: {
    marginLeft: 6,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  qrQuickBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  qrQuickBtnDark: {
    backgroundColor: '#27272a',
    borderColor: '#166534',
  },
  nfcQuickBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  nfcQuickBtnDark: {
    backgroundColor: '#27272a',
    borderColor: '#166534',
  },
  nfcQuickBtnLinked: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  nfcQuickBtnLinkedDark: {
    backgroundColor: '#064e3b33',
    borderWidth: 1,
    borderColor: '#059669',
  },
  quickActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
});
