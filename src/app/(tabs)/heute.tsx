import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Leuchten, NachtHintergrund, Verlauf } from '@/components/Licht';
import { Txt } from '@/components/Txt';
import { Balken, Haken, Karte, Knopf } from '@/components/ui';
import { levelZu, XP_FOTO } from '@/data/level';
import { vibriere } from '@/haptik';
import { berechne, useJetzt, useStore } from '@/state/store';
import { farben, LEISTE_PLATZ, MAX_BREITE } from '@/theme';
import { countdownText, gruss } from '@/zeit';

// Heute: eine große Zahl (Tage am Stück), darunter Level, die Aufgaben des Tages und ein großer Knopf.

export default function Heute() {
  const { z } = useStore();
  const jetzt = useJetzt();
  const aufgaben = z.aufgaben.filter((a) => a.text.trim());
  const b = berechne(z, jetzt);
  const l = levelZu(b.xp);
  const erledigteIds = new Set(b.heuteBeweise.map((x) => x.aufgabeId));
  const offen = aufgaben.filter((a) => !erledigteIds.has(a.id));
  const allesErledigt = aufgaben.length > 0 && offen.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: farben.nachtMitte }}>
      <NachtHintergrund art="heute" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: LEISTE_PLATZ + 24, width: '100%', maxWidth: MAX_BREITE, alignSelf: 'center' }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt groesse={15} farbe={farben.textLeise}>
              {gruss(jetzt)}
            </Txt>
            <Txt groesse={14} gewicht="halb" farbe={b.jokerFrei ? farben.blau : farben.textGedimmt}>
              {b.jokerFrei ? 'Joker frei' : 'Joker genutzt'}
            </Txt>
          </View>

          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Leuchten ueberstand={50} staerke={0.26 + Math.min(0.2, b.serie / 150)} />
              <Txt
                groesse={96}
                gewicht="extra"
                farbe={farben.blauLeuchten}
                zeile={1.1}
                accessibilityLabel={`${b.serie} Tage am Stück`}
                style={{ textShadowColor: 'rgba(156,196,255,0.75)', textShadowRadius: 22, textShadowOffset: { width: 0, height: 0 } }}
              >
                {b.serie}
              </Txt>
            </View>
            <Txt groesse={20} gewicht="halb">
              {b.serie === 1 ? 'Tag am Stück' : 'Tage am Stück'}
            </Txt>
            <Txt groesse={15} farbe={b.heuteErledigt ? farben.blau : farben.textLeise} style={{ marginTop: 2 }}>
              {b.heuteErledigt ? 'Heute ist gesichert.' : 'Eine erledigte Aufgabe sichert den Tag.'}
            </Txt>
          </View>

          <Pressable onPress={() => router.navigate('/fortschritt')} accessibilityRole="button" accessibilityLabel="Level ansehen">
            <Karte stil={{ marginTop: 18, gap: 8, paddingVertical: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Txt groesse={15} farbe={farben.textLeise}>
                  Level {l.index + 1}
                </Txt>
                <Txt groesse={17} gewicht="extra">
                  {l.level.name}
                </Txt>
              </View>
              <Balken anteil={l.anteil} />
              <Txt groesse={13} farbe={farben.textLeise}>
                {l.naechstes ? `${b.xp} XP · noch ${l.naechstes.ab - b.xp} XP bis ${l.naechstes.name}` : `${b.xp} XP · höchstes Level erreicht`}
              </Txt>
            </Karte>
          </Pressable>

          {z.laufend ? (
            <Pressable onPress={() => router.push('/lockin')} accessibilityRole="button" accessibilityLabel="Lock-in ansehen">
              <Karte akzent stil={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 }}>
                <Txt groesse={16} gewicht="halb">
                  Lock-in läuft
                </Txt>
                <Txt groesse={20} gewicht="extra" farbe={farben.blau} style={{ fontVariant: ['tabular-nums'] }}>
                  {countdownText(z.laufend.ende - jetzt)}
                </Txt>
              </Karte>
            </Pressable>
          ) : null}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
            <Txt groesse={15} farbe={farben.textLeise}>
              Heute
            </Txt>
            <Pressable accessibilityRole="button" accessibilityLabel="Aufgaben ändern" hitSlop={10} onPress={() => router.navigate('/einstellungen')}>
              <Txt groesse={14} gewicht="halb" farbe={farben.blau}>
                Ändern
              </Txt>
            </Pressable>
          </View>
          <View style={{ gap: 10, marginTop: 10 }}>
            {aufgaben.map((a) => {
              const erledigt = erledigteIds.has(a.id);
              return (
                <Pressable
                  key={a.id}
                  accessibilityRole="button"
                  accessibilityLabel={erledigt ? `${a.text}, erledigt` : `${a.text}, Foto-Beweis machen`}
                  disabled={erledigt}
                  onPress={() => {
                    vibriere('leicht');
                    router.push({ pathname: '/beweis', params: { aufgabe: a.id } });
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, overflow: 'hidden' }}
                >
                  <Verlauf farben={erledigt ? ['rgba(156,196,255,0.16)', 'rgba(138,125,255,0.04)'] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} />
                  <Haken erledigt={erledigt} />
                  <Txt groesse={16} gewicht={erledigt ? 'halb' : 'mittel'} style={{ flex: 1 }}>
                    {a.text}
                  </Txt>
                  <Txt groesse={13} gewicht="halb" farbe={erledigt ? farben.blau : farben.textGedimmt}>
                    {erledigt ? `+${XP_FOTO} XP` : 'Foto'}
                  </Txt>
                </Pressable>
              );
            })}
            {aufgaben.length === 0 ? (
              <Karte>
                <Txt groesse={15} farbe={farben.textLeise}>
                  Noch keine Aufgaben. Leg unter "Ändern" bis zu drei an.
                </Txt>
              </Karte>
            ) : null}
          </View>

          <View style={{ marginTop: 24 }}>
            {allesErledigt ? (
              <>
                <Knopf art="hell" gross text="Alles erledigt. Lock-in?" onPress={() => router.navigate('/fokus')} />
                <Txt groesse={13} farbe={farben.textLeise} mitte style={{ marginTop: 8 }}>
                  Stark. Mehr musst du heute nicht.
                </Txt>
              </>
            ) : (
              <Knopf
                art="blau"
                gross
                haptik="stark"
                text="Foto-Beweis machen"
                aus={aufgaben.length === 0}
                onPress={() => router.push({ pathname: '/beweis', params: { aufgabe: offen[0]?.id ?? '' } })}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
