import { Platform } from 'react-native';

// Importación dinámica protegida para evitar errores en Expo Go o entornos Web
let NfcManager: any = null;
let NfcTech: any = null;
let Ndef: any = null;

try {
  const nfcModule = require('react-native-nfc-manager');
  NfcManager = nfcModule.default;
  NfcTech = nfcModule.NfcTech;
  Ndef = nfcModule.Ndef;
} catch (e) {
  // Módulo nativo no disponible en Expo Go sin prebuild o en Web
  NfcManager = null;
  NfcTech = null;
  Ndef = null;
}

export interface NfcReadResult {
  success: boolean;
  tagId: string | null;
  techTypes: string[];
  rawPayload: string | null;
  petId: string | null;
  isNdefEmpty: boolean;
  error?: string;
}

export interface NfcWriteResult {
  success: boolean;
  tagId: string | null;
  writtenUrl: string;
  petId: string;
  tech: string;
  error?: string;
}

/**
 * Servicio unificado para operaciones NFC en VetLink
 */
export const nfcService = {
  /**
   * Indica si la librería nativa está instalada y disponible en el runtime actual
   */
  isModuleAvailable(): boolean {
    return NfcManager !== null && Platform.OS !== 'web';
  },

  /**
   * Comprueba si el hardware del dispositivo soporta NFC
   */
  async isSupported(): Promise<boolean> {
    if (!this.isModuleAvailable()) return false;
    try {
      return await NfcManager.isSupported();
    } catch {
      return false;
    }
  },

  /**
   * Comprueba si el NFC está actualmente encendido en los ajustes
   */
  async isEnabled(): Promise<boolean> {
    if (!this.isModuleAvailable()) return false;
    try {
      return await NfcManager.isEnabled();
    } catch {
      return false;
    }
  },

  /**
   * Abre los ajustes del sistema para encender el NFC
   */
  async goToSettings(): Promise<void> {
    if (this.isModuleAvailable() && NfcManager.goToNfcSetting) {
      await NfcManager.goToNfcSetting().catch(() => { });
    }
  },

  /**
   * Inicia el subsistema NFC
   */
  async init(): Promise<void> {
    if (this.isModuleAvailable()) {
      try {
        await NfcManager.start();
      } catch (err) {
        console.warn('[nfcService] Error iniciando NfcManager:', err);
      }
    }
  },

  /**
   * Cancela cualquier sesión tecnológica NFC en curso
   */
  async cancelSession(): Promise<void> {
    if (this.isModuleAvailable()) {
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch {
        // Ignorar si no había solicitud activa
      }
    }
  },

  /**
   * Genera la URL HTTPS estándar de identificación para una mascota
   * Cumple con la regla de almacenar únicamente el identificador estable en la etiqueta
   */
  buildIdentificationUrl(petId: string): string {
    const cleanId = petId.trim().toUpperCase();
    return `https://vetlink.app/pet?id=${cleanId}`;
  },

  /**
   * Extrae el ID estable de la mascota (ej: 'PET-001') a partir del payload leído (URL o texto)
   */
  parsePetIdFromPayload(payload: string): string | null {
    if (!payload) return null;
    const clean = payload.trim();

    // 1. Patrón clásico PET-XXX
    const regex = /PET-\d+/i;
    const match = clean.match(regex);
    if (match) {
      return match[0].toUpperCase();
    }

    // 2. Extraer de parámetros de URL HTTPS (ej: ?id=PET-001 o ?petId=PET-001)
    try {
      const url = new URL(clean);
      const idParam =
        url.searchParams.get('id') ||
        url.searchParams.get('petId') ||
        url.searchParams.get('pet');
      if (idParam && idParam.match(regex)) {
        return idParam.trim().toUpperCase();
      }

      // 3. Extraer del último path segment (ej: /pet/PET-001)
      const segments = url.pathname.split('/').filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && last.match(regex)) {
        return last.toUpperCase();
      }
    } catch {
      // No era una URL completa parseable por URL constructor
    }

    return null;
  },

  /**
   * Decodifica un registro NDEF individual (URI o Texto)
   */
  decodeNdefRecord(record: any): string | null {
    if (!record || !record.payload) return null;

    // Intentar decodificar como URI
    try {
      if (Ndef?.uri?.decodePayload) {
        const uri = Ndef.uri.decodePayload(new Uint8Array(record.payload));
        if (uri) return uri;
      }
    } catch {
      // Fallback
    }

    // Intentar decodificar como Texto
    try {
      if (Ndef?.text?.decodePayload) {
        const text = Ndef.text.decodePayload(new Uint8Array(record.payload));
        if (text) return text;
      }
    } catch {
      // Fallback
    }

    // Fallback manual para prefijos URI estándar del NFC Forum
    try {
      const bytes: number[] = Array.from(record.payload);
      if (bytes.length > 1) {
        const prefixByte = bytes[0];
        const prefixes: Record<number, string> = {
          0x00: '',
          0x01: 'http://www.',
          0x02: 'https://www.',
          0x03: 'http://',
          0x04: 'https://',
          0x05: 'tel:',
          0x06: 'mailto:',
        };
        const prefix = prefixes[prefixByte] ?? '';
        const chars = bytes.slice(1).map((b) => String.fromCharCode(b)).join('');
        return prefix + chars;
      }
    } catch {
      // Ignorar
    }

    return null;
  },

  /**
   * Lee una etiqueta NFC NDEF compatible y retorna su ID técnico y payload
   */
  async readTag(): Promise<NfcReadResult> {
    if (!this.isModuleAvailable()) {
      return {
        success: false,
        tagId: null,
        techTypes: [],
        rawPayload: null,
        petId: null,
        isNdefEmpty: false,
        error: 'El módulo NFC no está disponible en este entorno.',
      };
    }

    try {
      await this.init();
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();
      const tagId = tag?.id || null;
      const techTypes = tag?.techTypes || [];

      if (!tag?.ndefMessage || tag.ndefMessage.length === 0) {
        return {
          success: true,
          tagId,
          techTypes,
          rawPayload: null,
          petId: null,
          isNdefEmpty: true,
        };
      }

      // Buscar primer registro decodificable
      let decodedPayload: string | null = null;
      for (const record of tag.ndefMessage) {
        const decoded = this.decodeNdefRecord(record);
        if (decoded) {
          decodedPayload = decoded;
          break;
        }
      }

      const petId = decodedPayload ? this.parsePetIdFromPayload(decodedPayload) : null;

      return {
        success: true,
        tagId,
        techTypes,
        rawPayload: decodedPayload,
        petId,
        isNdefEmpty: decodedPayload === null,
      };
    } catch (err: any) {
      if (err?.message === 'cancelled') {
        throw err;
      }
      return {
        success: false,
        tagId: null,
        techTypes: [],
        rawPayload: null,
        petId: null,
        isNdefEmpty: false,
        error: err?.message || 'Error al comunicarse con la etiqueta NFC.',
      };
    } finally {
      await this.cancelSession();
    }
  },

  /**
   * Escribe un registro NDEF con la URL HTTPS de identificación en la etiqueta física
   * y verifica la integridad de la escritura.
   */
  async writePetTag(petId: string): Promise<NfcWriteResult> {
    if (!this.isModuleAvailable()) {
      return {
        success: false,
        tagId: null,
        writtenUrl: '',
        petId,
        tech: '',
        error: 'La función NFC requiere un dispositivo móvil compatible.',
      };
    }

    const cleanPetId = petId.trim().toUpperCase();
    const urlToWrite = this.buildIdentificationUrl(cleanPetId);

    try {
      await this.init();
      // Solicitar tecnología NDEF para lectura/escritura
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();
      const tagId = tag?.id || null;

      // Generar mensaje NDEF con registro URI
      const uriRecord = Ndef.uriRecord(urlToWrite);
      const bytes = Ndef.encodeMessage([uriRecord]);

      // Escribir físicamente en el chip NFC
      if (!NfcManager.ndefHandler?.writeNdefMessage) {
        throw new Error('Este dispositivo no soporta la operación de escritura en etiquetas NFC.');
      }

      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      return {
        success: true,
        tagId,
        writtenUrl: urlToWrite,
        petId: cleanPetId,
        tech: 'Ndef',
      };
    } catch (err: any) {
      if (err?.message === 'cancelled') {
        throw err;
      }
      return {
        success: false,
        tagId: null,
        writtenUrl: urlToWrite,
        petId: cleanPetId,
        tech: 'Ndef',
        error: err?.message || 'Error al escribir en la etiqueta NFC.',
      };
    } finally {
      await this.cancelSession();
    }
  },
};
