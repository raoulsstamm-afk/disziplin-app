import { Platform } from 'react-native';

// Foto-Beweise: Kamera öffnen und das Foto dauerhaft im App-Ordner ablegen. Nichts wird hochgeladen.
// Im Browser gibt es keine Kamera, dann meldet foto() "keineKamera" und der Bildschirm bietet einen Test ohne Foto an.

export type FotoErgebnis =
  | { art: 'ok'; uri: string }
  | { art: 'abgebrochen' }
  | { art: 'keineErlaubnis' }
  | { art: 'keineKamera' };

export const kameraVerfuegbar = Platform.OS !== 'web';

export async function fotoAufnehmen(): Promise<FotoErgebnis> {
  if (!kameraVerfuegbar) return { art: 'keineKamera' };
  try {
    const picker = require('expo-image-picker') as typeof import('expo-image-picker');
    const erlaubnis = await picker.requestCameraPermissionsAsync();
    if (!erlaubnis.granted) return { art: 'keineErlaubnis' };
    const r = await picker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.5, allowsEditing: false, exif: false });
    if (r.canceled || !r.assets?.[0]?.uri) return { art: 'abgebrochen' };
    return { art: 'ok', uri: r.assets[0].uri };
  } catch {
    return { art: 'keineKamera' };
  }
}

function ordner() {
  const { Directory, Paths } = require('expo-file-system') as typeof import('expo-file-system');
  const d = new Directory(Paths.document, 'beweise');
  if (!d.exists) d.create({ intermediates: true });
  return d;
}

// Foto aus dem Zwischenspeicher der Kamera in den App-Ordner kopieren (dort bleibt es dauerhaft)
export function fotoBehalten(tempUri: string, id: string): string {
  if (Platform.OS === 'web') return tempUri;
  try {
    const { File } = require('expo-file-system') as typeof import('expo-file-system');
    const ziel = new File(ordner(), `${id}.jpg`);
    if (ziel.exists) ziel.delete();
    new File(tempUri).copy(ziel);
    return ziel.uri;
  } catch {
    return tempUri;
  }
}

export function alleFotosLoeschen() {
  if (Platform.OS === 'web') return;
  try {
    const d = ordner();
    d.delete();
  } catch {
    // nichts zu löschen
  }
}
