import { Platform } from 'react-native';

// Lokale Benachrichtigungen (kein Server): tägliche Erinnerung und Ende eines Lock-ins.
// Im Browser und in Expo Go ohne Modul gibt es das nicht, deshalb wird das Paket vorsichtig geladen
// und jeder Fehler geschluckt.

type N = typeof import('expo-notifications');
let n: N | null | undefined;
function lade(): N | null {
  if (n !== undefined) return n;
  n = null;
  if (Platform.OS === 'web') return n;
  try {
    n = require('expo-notifications') as N;
    n.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
  } catch {
    n = null;
  }
  return n;
}

export async function erlaubnisAnfragen(): Promise<boolean> {
  const m = lade();
  if (!m) return false;
  try {
    const jetzt = await m.getPermissionsAsync();
    if (jetzt.granted) return true;
    const antwort = await m.requestPermissionsAsync();
    return antwort.granted;
  } catch {
    return false;
  }
}

// Tägliche Erinnerung zur gewählten Uhrzeit ("07:30"), null schaltet sie ab
export async function planeTaeglich(uhrzeit: string | null) {
  const m = lade();
  if (!m) return;
  try {
    await m.cancelScheduledNotificationAsync('taeglich').catch(() => {});
    if (!uhrzeit) return;
    const [stunde, minute] = uhrzeit.split(':').map(Number);
    await m.scheduleNotificationAsync({
      identifier: 'taeglich',
      content: { title: 'Eine Sache reicht', body: 'Mach eine deiner Aufgaben und schick den Foto-Beweis. Dann zählt der Tag.', data: { url: 'disziplinapp://heute' } },
      trigger: { type: m.SchedulableTriggerInputTypes.DAILY, hour: stunde, minute },
    });
  } catch {
    // Erinnerungen sind freundlich gemeint, aber nicht lebenswichtig
  }
}

// Benachrichtigung, wenn der Lock-in vorbei ist (auch wenn die App zu ist)
export async function planeFokusEnde(ende: number, minuten: number) {
  const m = lade();
  if (!m) return;
  try {
    if (!(await erlaubnisAnfragen())) return;
    await m.cancelScheduledNotificationAsync('fokus-ende').catch(() => {});
    await m.scheduleNotificationAsync({
      identifier: 'fokus-ende',
      content: { title: 'Lock-in geschafft', body: `${minuten} Minuten Fokus. Stark. Deine XP warten in der App.`, data: { url: 'disziplinapp://fokus' } },
      trigger: { type: m.SchedulableTriggerInputTypes.DATE, date: new Date(ende) },
    });
  } catch {
    // ohne Benachrichtigung zählt der Lock-in trotzdem
  }
}

export async function absageFokusEnde() {
  const m = lade();
  if (!m) return;
  try {
    await m.cancelScheduledNotificationAsync('fokus-ende');
  } catch {
    // nichts zu tun
  }
}
