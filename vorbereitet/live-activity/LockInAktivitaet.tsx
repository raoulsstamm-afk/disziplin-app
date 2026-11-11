// VORBEREITET, NOCH NICHT EINGEBAUT (nicht im Build, nicht von tsc geprüft).
// Lock-in-Countdown auf dem Sperrbildschirm und in der Dynamic Island, Muster aus Kopfkiste
// (kopfkiste/src/widgets/WartezimmerAktivitaet.tsx und src/widgets/index.ts).
//
// Einbauen (braucht einen neuen Build, macht Smutje):
// 1. npx expo install expo-widgets @expo/ui
// 2. app.json: in "ios.infoPlist" "NSSupportsLiveActivities": true ergänzen und das Plugin "expo-widgets"
//    wie in kopfkiste/app.json eintragen (dort mit einem Widget; prüfen, ob eine Live Activity allein reicht).
// 3. Diese Datei nach src/widgets/LockInAktivitaet.tsx verschieben, dazu src/widgets/index.ts mit
//    vorsichtigem Laden wie in Kopfkiste (requireOptionalNativeModule('ExpoWidgets'), Fehler schlucken).
// 4. In src/app/(tabs)/fokus.tsx nach fokusStarten(): starteLockIn({ minuten, bis: l.ende }).
//    In src/app/lockin.tsx beim Abbrechen und im Store beim Abschließen: alle Instanzen beenden (end('immediate')).
// 5. Im Browser und in Expo Go gibt es das nicht; die Benachrichtigung am Ende bleibt als Rückfall.

import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame, lineLimit, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

export type LockInDaten = {
  minuten: number; // 25, 50 oder 90
  bis: number; // Ende als Zeitstempel in Millisekunden
};

// Wegen der 'widget'-Anweisung darf hier nichts von außerhalb der Funktion benutzt werden.
const LockIn = (props: LockInDaten, environment: LiveActivityEnvironment) => {
  'widget';
  const blau = '#9CC4FF';
  const hell = '#F3F1EA';
  const zeitraum = { lower: new Date(), upper: new Date(props.bis) };
  return {
    banner: (
      <HStack spacing={12} modifiers={[padding({ all: 14 })]}>
        <Image systemName="lock.fill" color={blau} />
        <VStack alignment="leading" spacing={2}>
          <Text modifiers={[font({ size: 16, weight: 'bold' }), foregroundStyle(hell), lineLimit(1)]}>{`Lock-in · ${props.minuten} Minuten`}</Text>
          <Text modifiers={[font({ size: 13 }), foregroundStyle(hell), lineLimit(1)]}>Bleib dran. Handy weg.</Text>
        </VStack>
        <Spacer />
        <Text timerInterval={zeitraum} countsDown modifiers={[font({ size: 24, weight: 'heavy' }), foregroundStyle(blau), frame({ width: 96 })]} />
      </HStack>
    ),
    compactLeading: <Image systemName="lock.fill" color={blau} />,
    compactTrailing: <Text timerInterval={zeitraum} countsDown modifiers={[frame({ width: 52 }), foregroundStyle(blau)]} />,
    minimal: <Image systemName="lock.fill" color={blau} />,
    expandedLeading: <Image systemName="lock.fill" color={blau} />,
    expandedTrailing: <Text timerInterval={zeitraum} countsDown modifiers={[font({ size: 22, weight: 'heavy' }), foregroundStyle(blau)]} />,
    expandedBottom: <Text modifiers={[font({ size: 14 })]}>Bleib dran. Handy weg.</Text>,
  };
};

export default createLiveActivity('LockIn', LockIn);
