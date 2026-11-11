import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptik bei Knöpfen. Im Browser gibt es keine Vibration, Fehler werden geschluckt.
export function vibriere(art: 'leicht' | 'mittel' | 'stark' | 'erfolg' = 'leicht') {
  if (Platform.OS === 'web') return;
  try {
    if (art === 'erfolg') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return;
    }
    const stil =
      art === 'stark'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : art === 'mittel'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(stil).catch(() => {});
  } catch {
    // Haptik ist nett, aber nicht wichtig
  }
}
