/**
 * PetCard.tsx
 * Componente modular para representar la ficha resumida de una mascota.
 * Incluye avatar o placeholder de imagen, badges de especie, género, identificación,
 * estado de vinculación NFC y acciones interactivas.
 * Estilo visual: Custom Modern Friendly Pet UI (HuellaApp)
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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Pet } from '@/services/petService';
import { Palette, FontFamily } from '@/constants/theme';

export interface PetCardProps {
  pet: Pet;
  onPress?: (pet: Pet) => void;
  onQrPress?: (pet: Pet) => void;
  onNfcPress?: (pet: Pet) => void;
  onDeletePress?: (pet: Pet) => void;
  onPhotoPress?: (pet: Pet) => void;
  isUpdatingPhoto?: boolean;
  isDark?: boolean;
}

export const PetCard = React.memo(function PetCard({
  pet,
  onPress = () => {},
  onQrPress = () => {},
  onNfcPress = () => {},
  onDeletePress,
  onPhotoPress = () => {},
  isUpdatingPhoto = false,
  isDark = false,
}: PetCardProps) {
  const isMale = pet.sexo?.toLowerCase().includes('macho');
  const isNfcLinked = pet.nfcStatus === 'linked' || Boolean(pet.nfcTagId);
  const isGato = pet.especie?.toLowerCase().includes('gato');

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      activeOpacity={0.88}
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
              <Ionicons
                name="paw-outline"
                size={34}
                color={isDark ? Palette.greenPrimary : Palette.greenDeep}
              />
            </View>
          )}

          {isUpdatingPhoto ? (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          ) : (
            <View style={[styles.avatarCameraBadge, isDark && styles.avatarCameraBadgeDark]}>
              <Ionicons name="camera-outline" size={11} color="#ffffff" />
            </View>
          )}

          {/* Badge de Especie con ícono vectorial en lugar de emoji */}
          <View style={[styles.speciesBadge, isDark && styles.speciesBadgeDark]}>
            <MaterialCommunityIcons
              name={isGato ? 'cat' : 'dog'}
              size={13}
              color={isDark ? Palette.greenPrimary : Palette.greenDeep}
            />
          </View>
        </TouchableOpacity>

        {/* Información Principal */}
        <View style={styles.petInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.petName, isDark && styles.petNameDark]} numberOfLines={1}>
              {pet.nombre}
            </Text>
            <View
              style={[
                styles.genderBadge,
                { backgroundColor: isMale ? (isDark ? '#1e3a8a33' : '#ebf4ff') : (isDark ? '#83184333' : '#fff0f5') },
              ]}
            >
              <Ionicons
                name={isMale ? 'male-outline' : 'female-outline'}
                size={12}
                color={isMale ? (isDark ? '#93c5fd' : '#2563eb') : (isDark ? '#f472b6' : '#db2777')}
              />
              <Text
                style={[
                  styles.genderText,
                  { color: isMale ? (isDark ? '#93c5fd' : '#2563eb') : (isDark ? '#f472b6' : '#db2777') },
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
                <MaterialIcons name="nfc" size={12} color={isDark ? '#4ade80' : Palette.greenDeep} />
                <Text style={[styles.nfcChipLinkedText, isDark && styles.nfcChipLinkedTextDark]}>
                  NFC Activo
                </Text>
              </View>
            ) : (
              <View style={[styles.nfcChipUnlinked, isDark && styles.nfcChipUnlinkedDark]}>
                <MaterialIcons name="nfc" size={12} color={isDark ? '#71717a' : Palette.textSecondary} />
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
              <MaterialCommunityIcons name="scale" size={13} color={Palette.greenPrimary} />
              <Text style={[styles.metricText, isDark && styles.metricTextDark]}>
                {pet.peso}
              </Text>
            </View>

            <View style={[styles.metricItem, isDark && styles.metricItemDark]}>
              <MaterialCommunityIcons name="cake-variant-outline" size={13} color={Palette.greenPrimary} />
              <Text style={[styles.metricText, isDark && styles.metricTextDark]}>
                {pet.edad}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color={isDark ? Palette.textSecondaryDark : Palette.textSecondary}
          />
        </View>
      </View>

      {/* Fila de Acciones Rápidas: QR, Vincular NFC y Eliminar (si no tiene NFC vinculado) */}
      <View style={styles.cardActionsRow}>
        <TouchableOpacity
          style={[styles.quickActionBtn, styles.qrQuickBtn, isDark && styles.qrQuickBtnDark]}
          onPress={(e) => {
            e.stopPropagation?.();
            onQrPress(pet);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code-outline" size={15} color={Palette.greenDeep} />
          <Text style={[styles.quickActionBtnText, isDark && styles.quickActionBtnTextDark]} numberOfLines={1}>
            QR / 3D
          </Text>
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
            size={15}
            color={isNfcLinked ? (isDark ? '#4ade80' : Palette.greenDeep) : (isDark ? '#22C55E' : Palette.greenDeep)}
          />
          <Text
            style={[
              styles.quickActionBtnText,
              isDark && styles.quickActionBtnTextDark,
              isNfcLinked && { color: isDark ? '#4ade80' : Palette.greenDeep, fontFamily: FontFamily.bodyBold },
            ]}
            numberOfLines={1}
          >
            {isNfcLinked ? '✓ NFC Vinculado' : 'Vincular NFC'}
          </Text>
        </TouchableOpacity>

        {!isNfcLinked && onDeletePress && (
          <TouchableOpacity
            style={[styles.deleteQuickBtn, isDark && styles.deleteQuickBtnDark]}
            onPress={(e) => {
              e.stopPropagation?.();
              onDeletePress(pet);
            }}
            activeOpacity={0.8}
            accessibilityLabel={`Eliminar a ${pet.nombre}`}
          >
            <Ionicons name="trash-outline" size={16} color={Palette.redEmergency} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default PetCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surfaceLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: 14,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: Palette.greenDeep,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(8, 122, 67, 0.05)',
      },
    }),
  },
  cardDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
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
    borderRadius: 18,
    backgroundColor: Palette.surfaceSubtle,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: Palette.greenSoft,
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackDark: {
    backgroundColor: '#133324',
    borderColor: '#1F543B',
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    backgroundColor: Palette.greenPrimary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  avatarCameraBadgeDark: {
    borderColor: Palette.surfaceDark,
  },
  speciesBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#ffffff',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  speciesBadgeDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
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
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
    fontSize: 18,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
  },
  petNameDark: {
    color: Palette.textPrimaryDark,
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
    fontFamily: FontFamily.bodyBold,
  },
  petBreed: {
    fontSize: 13,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    marginBottom: 8,
  },
  petBreedDark: {
    color: Palette.textSecondaryDark,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  idChip: {
    backgroundColor: Palette.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  idChipDark: {
    backgroundColor: '#20302B',
    borderColor: Palette.borderDark,
  },
  idChipText: {
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    color: Palette.textPrimary,
    letterSpacing: 0.5,
  },
  idChipTextDark: {
    color: Palette.textPrimaryDark,
  },
  nfcChipLinked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  nfcChipLinkedDark: {
    backgroundColor: '#133324',
    borderColor: '#1F543B',
  },
  nfcChipLinkedText: {
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    color: Palette.greenDeep,
  },
  nfcChipLinkedTextDark: {
    color: '#4ade80',
  },
  nfcChipUnlinked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Palette.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  nfcChipUnlinkedDark: {
    backgroundColor: '#20302B',
    borderColor: Palette.borderDark,
  },
  nfcChipUnlinkedText: {
    fontSize: 11,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
  },
  nfcChipUnlinkedTextDark: {
    color: Palette.textSecondaryDark,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  metricItemDark: {
    backgroundColor: '#20302B',
    borderColor: Palette.borderDark,
  },
  metricText: {
    fontSize: 12,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.textPrimary,
  },
  metricTextDark: {
    color: Palette.textPrimaryDark,
  },
  arrowContainer: {
    marginLeft: 6,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  qrQuickBtn: {
    backgroundColor: Palette.surfaceLight,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  qrQuickBtnDark: {
    backgroundColor: '#20302B',
    borderColor: '#1F543B',
  },
  nfcQuickBtn: {
    backgroundColor: Palette.surfaceLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  nfcQuickBtnDark: {
    backgroundColor: '#20302B',
    borderColor: Palette.borderDark,
  },
  nfcQuickBtnLinked: {
    backgroundColor: Palette.greenSoft,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  nfcQuickBtnLinkedDark: {
    backgroundColor: '#133324',
    borderWidth: 1,
    borderColor: '#1F543B',
  },
  quickActionBtnText: {
    fontSize: 12,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.textPrimary,
    flexShrink: 1,
  },
  quickActionBtnTextDark: {
    color: Palette.textPrimaryDark,
  },
  deleteQuickBtn: {
    width: 38,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.redSoft,
    borderWidth: 1,
    borderColor: Palette.redBorder,
  },
  deleteQuickBtnDark: {
    backgroundColor: 'rgba(217, 74, 74, 0.15)',
    borderColor: 'rgba(217, 74, 74, 0.35)',
  },
});
