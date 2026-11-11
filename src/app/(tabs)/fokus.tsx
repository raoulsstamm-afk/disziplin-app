import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { planeFokusEnde } from '@/benachrichtigung';
import { Leuchten, NachtHintergrund, Verlauf } from '@/components/Licht';
import { Txt } from '@/components/Txt';
import { Haken, Karte, Knopf } from '@/components/ui';
import { FOKUS_DAUERN, FokusDauer, XP_PRO_FOKUS_MINUTE } from '@/data/level';
import { vibriere } from '@/haptik';
import { berechne, useJetzt, useStore } from '@/state/store';
import { farben, LEISTE_PLATZ, MAX_BREITE } from '@/theme';
import { countdownText } from '@/zeit';

// Fokus: Dauer wählen (25, 50, 90 Minuten) und den Lock-in starten. Der Countdown selbst läuft in /lockin.

const UNTERTITEL: Record<FokusDauer, string> = {
  25: 'Kurz und knackig',
  50: 'Eine echte Arbeitsrunde',
  90: 'Deep Work, volle Tiefe',
};

export default function Fokus() {
  const { z, setze, fokusStarten } = useStore();
  const jetzt = useJetzt();
  const b = berechne(z, jetzt);
  const dauer = z.fokusDauer;

  const starten = async () => {
    vibriere('stark');
    const l = fokusStarten(dauer);
    router.push('/lockin');
    await planeFokusEnde(l.ende, l.minuten);
  };

  return (
    <View style={{ flex: 1, backgroundColor: farben.nachtMitte }}>
      <NachtHintergrund art="fokus" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: LEISTE_PLATZ + 24, width: '100%', maxWidth: MAX_BREITE, alignSelf: 'center' }}
        >
          <Txt groesse={30} gewicht="extra">
            Lock-in
          </Txt>
          <Txt groesse={15} farbe={farben.textLeise} style={{ marginTop: 4 }}>
            Eine Sache, Handy weg, bis der Timer abläuft. Abbrechen geht jederzeit, ohne Strafe.
          </Txt>

          {z.fokusFertig ? (
            <Karte akzent stil={{ marginTop: 18, gap: 10, alignItems: 'center', paddingVertical: 22 }}>
              <Haken erledigt groesse={44} />
              <Txt groesse={22} gewicht="extra" mitte>
                {z.fokusFertig.minuten} Minuten Fokus geschafft.
              </Txt>
              <Txt groesse={16} gewicht="fett" farbe={farben.blau}>
                +{z.fokusFertig.xp} XP
              </Txt>
              <Knopf art="leise" text="Schließen" haptik="leicht" onPress={() => setze({ fokusFertig: null })} />
            </Karte>
          ) : null}

          {z.laufend ? (
            <View style={{ marginTop: 22, gap: 12 }}>
              <Karte akzent stil={{ alignItems: 'center', gap: 4, paddingVertical: 22 }}>
                <Txt groesse={13} farbe={farben.textLeise} label>
                  LOCK-IN LÄUFT
                </Txt>
                <Txt groesse={52} gewicht="extra" farbe={farben.blauLeuchten} zeile={1.15} style={{ fontVariant: ['tabular-nums'] }}>
                  {countdownText(z.laufend.ende - jetzt)}
                </Txt>
              </Karte>
              <Knopf art="blau" text="Zum Lock-in" onPress={() => router.push('/lockin')} />
            </View>
          ) : (
            <>
              <View style={{ gap: 10, marginTop: 22 }}>
                {FOKUS_DAUERN.map((d) => (
                  <DauerKarte key={d} minuten={d} gewaehlt={dauer === d} onPress={() => setze({ fokusDauer: d })} />
                ))}
              </View>
              <View style={{ flex: 1, minHeight: 20 }} />
              <Knopf art="blau" gross haptik="stark" text={`${dauer} Minuten Lock-in starten`} onPress={starten} stil={{ marginTop: 20 }} />
              <Txt groesse={13} farbe={farben.textLeise} mitte style={{ marginTop: 10 }}>
                Am Ende gibt es {dauer * XP_PRO_FOKUS_MINUTE} XP und eine Mitteilung. Heute schon {b.heuteFokus} Minuten fokussiert.
              </Txt>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function DauerKarte({ minuten, gewaehlt, onPress }: { minuten: FokusDauer; gewaehlt: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: gewaehlt }}
      accessibilityLabel={`${minuten} Minuten`}
      onPress={() => {
        vibriere('leicht');
        onPress();
      }}
      style={{ borderRadius: 20, overflow: 'hidden', borderWidth: gewaehlt ? 2 : 1, borderColor: gewaehlt ? farben.blau : farben.feldRand, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16 }}
    >
      <Verlauf farben={gewaehlt ? ['rgba(156,196,255,0.2)', 'rgba(138,125,255,0.08)'] : [farben.feld, farben.feldDunkel]} />
      <View style={{ width: 74, alignItems: 'center' }}>
        {gewaehlt && <Leuchten ueberstand={10} staerke={0.25} />}
        <Txt groesse={40} gewicht="extra" farbe={gewaehlt ? farben.blauLeuchten : farben.text} zeile={1.1}>
          {minuten}
        </Txt>
      </View>
      <View style={{ flex: 1 }}>
        <Txt groesse={17} gewicht="extra">
          Minuten
        </Txt>
        <Txt groesse={14} farbe={farben.textLeise}>
          {UNTERTITEL[minuten]}
        </Txt>
      </View>
      <Txt groesse={14} gewicht="halb" farbe={gewaehlt ? farben.blau : farben.textGedimmt}>
        +{minuten * XP_PRO_FOKUS_MINUTE} XP
      </Txt>
    </Pressable>
  );
}
