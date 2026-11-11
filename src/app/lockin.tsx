import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { absageFokusEnde } from '@/benachrichtigung';
import { Leuchten } from '@/components/Licht';
import { Ring } from '@/components/Ring';
import { Txt } from '@/components/Txt';
import { Bildschirm, Haken, Karte, Knopf } from '@/components/ui';
import { vibriere } from '@/haptik';
import { useJetzt, useStore } from '@/state/store';
import { farben } from '@/theme';
import { countdownText, uhrzeitVon } from '@/zeit';

// Lock-in: großer Countdown. Abbrechen ist jederzeit möglich und kostet nichts.
// Ist die Zeit um, schreibt der Store die XP gut (auch wenn die App zwischendurch zu war).
// Sperrbildschirm-Countdown (Live Activity) ist vorbereitet, siehe vorbereitet/live-activity/.

export default function LockIn() {
  const { z, setze, fokusAbbrechen } = useStore();
  const jetzt = useJetzt(500);
  const [abbrechenFragen, setAbbrechenFragen] = useState(false);
  const l = z.laufend;
  const fertig = !l && z.fokusFertig;

  useEffect(() => {
    if (fertig) vibriere('erfolg');
  }, [fertig]);

  const zurueck = () => (router.canGoBack() ? router.back() : router.replace('/fokus'));

  if (fertig && z.fokusFertig) {
    return (
      <Bildschirm art="heute">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Leuchten ueberstand={60} staerke={0.4} />
            <Haken erledigt groesse={96} />
          </View>
          <Txt groesse={40} gewicht="extra" mitte farbe={farben.blauLeuchten} style={{ textShadowColor: 'rgba(156,196,255,0.7)', textShadowRadius: 20 }}>
            Geschafft.
          </Txt>
          <Txt groesse={20} gewicht="halb" mitte>
            {z.fokusFertig.minuten} Minuten echter Fokus.
          </Txt>
          <Txt groesse={16} farbe={farben.blau} gewicht="fett" mitte>
            +{z.fokusFertig.xp} XP · der Tag zählt
          </Txt>
        </View>
        <Knopf
          art="hell"
          text="Weiter so"
          onPress={() => {
            setze({ fokusFertig: null });
            zurueck();
          }}
        />
      </Bildschirm>
    );
  }

  if (!l) {
    return (
      <Bildschirm art="fokus">
        <View style={{ flex: 1, justifyContent: 'center', gap: 10 }}>
          <Txt groesse={24} gewicht="extra" mitte>
            Gerade läuft kein Lock-in.
          </Txt>
        </View>
        <Knopf art="hell" text="Zurück" onPress={zurueck} />
      </Bildschirm>
    );
  }

  const gesamt = l.ende - l.start;
  const rest = Math.max(0, l.ende - jetzt);

  return (
    <Bildschirm art="fokus">
      <Txt groesse={13} farbe={farben.blau} gewicht="fett" label mitte>
        LOCK-IN · {l.minuten} MINUTEN
      </Txt>
      <Txt groesse={24} gewicht="extra" mitte style={{ marginTop: 8 }}>
        Bleib dran. Handy weg.
      </Txt>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Leuchten ueberstand={10} staerke={0.22} />
        <Ring anteil={1 - rest / gesamt}>
          <Txt
            groesse={64}
            gewicht="extra"
            farbe={farben.blauLeuchten}
            zeile={1.15}
            accessibilityLabel={`Noch ${countdownText(rest)}`}
            style={{ fontVariant: ['tabular-nums'], textShadowColor: 'rgba(156,196,255,0.7)', textShadowRadius: 18 }}
          >
            {countdownText(rest)}
          </Txt>
          <Txt groesse={14} farbe={farben.textLeise}>
            fertig um {uhrzeitVon(l.ende)} Uhr
          </Txt>
        </Ring>
      </View>

      {abbrechenFragen ? (
        <Karte stil={{ gap: 10 }}>
          <Txt groesse={16} gewicht="extra">
            Lock-in beenden?
          </Txt>
          <Txt groesse={15} farbe={farben.textLeise}>
            Kein Problem, es gibt keine Strafe. Nur die XP für diesen Lock-in fallen weg.
          </Txt>
          <Knopf art="blau" text="Weitermachen" onPress={() => setAbbrechenFragen(false)} />
          <Knopf
            art="leise"
            text="Ja, beenden"
            haptik="leicht"
            onPress={async () => {
              fokusAbbrechen();
              await absageFokusEnde();
              zurueck();
            }}
          />
        </Karte>
      ) : (
        <View style={{ gap: 6 }}>
          <Txt groesse={13} farbe={farben.textLeise} mitte>
            Du kannst die App schließen. Wenn die Zeit um ist, bekommst du eine Mitteilung.
          </Txt>
          <Knopf art="rand" text="Ausblenden" haptik="leicht" onPress={zurueck} />
          <Knopf art="leise" text="Abbrechen" haptik="leicht" onPress={() => setAbbrechenFragen(true)} />
        </View>
      )}
    </Bildschirm>
  );
}
