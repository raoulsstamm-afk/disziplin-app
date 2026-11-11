import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { absageFokusEnde, erlaubnisAnfragen, planeTaeglich } from '@/benachrichtigung';
import { NachtHintergrund } from '@/components/Licht';
import { Txt } from '@/components/Txt';
import { Karte, Knopf, Pille, Rund } from '@/components/ui';
import { ALLE_VORSCHLAEGE, aufgabenVorschlaege } from '@/data/quiz';
import { alleFotosLoeschen } from '@/fotos';
import { vibriere } from '@/haptik';
import { MAX_AUFGABEN, neueId, useStore } from '@/state/store';
import { farben, LEISTE_PLATZ, MAX_BREITE } from '@/theme';
import { verschiebe } from '@/zeit';

// Einstellungen: Aufgaben des Tages (mit Vorschlägen), Erinnerung, Daten löschen

export default function Einstellungen() {
  const { z, setze, allesLoeschen } = useStore();
  const [loeschenFragen, setLoeschenFragen] = useState(false);

  const setzeText = (id: string, text: string) => setze({ aufgaben: z.aufgaben.map((a) => (a.id === id ? { ...a, text } : a)) });
  const entferne = (id: string) => setze({ aufgaben: z.aufgaben.filter((a) => a.id !== id) });
  const aufraeumen = () => setze({ aufgaben: z.aufgaben.map((a) => ({ ...a, text: a.text.trim() })).filter((a) => a.text) });
  const hinzufuegen = (text: string) => {
    if (z.aufgaben.length >= MAX_AUFGABEN) return;
    setze({ aufgaben: [...z.aufgaben, { id: neueId(), text }] });
  };

  const vorhanden = new Set(z.aufgaben.map((a) => a.text));
  const vorschlaege = Array.from(new Set([...aufgabenVorschlaege(z.antworten, 6), ...ALLE_VORSCHLAEGE]))
    .filter((t) => !vorhanden.has(t))
    .slice(0, 6);

  const erinnerungSetzen = async (uhrzeit: string | null) => {
    setze({ erinnerung: uhrzeit });
    if (uhrzeit) {
      const ok = await erlaubnisAnfragen();
      if (ok) await planeTaeglich(uhrzeit);
    } else {
      await planeTaeglich(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: farben.nachtMitte }}>
      <NachtHintergrund art="ruhig" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: LEISTE_PLATZ + 24, width: '100%', maxWidth: MAX_BREITE, alignSelf: 'center' }}
          >
            <Txt groesse={30} gewicht="extra">
              Einstellungen
            </Txt>

            <Abschnitt titel="Deine Aufgaben" text={`Bis zu ${MAX_AUFGABEN} am Tag. Eine erledigte reicht, damit der Tag zählt.`}>
              <View style={{ gap: 8 }}>
                {z.aufgaben.map((a) => (
                  <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TextInput
                      value={a.text}
                      onChangeText={(t) => setzeText(a.id, t)}
                      onEndEditing={aufraeumen}
                      onBlur={aufraeumen}
                      maxLength={60}
                      placeholder="Neue Aufgabe"
                      placeholderTextColor={farben.textGedimmt}
                      style={{
                        flex: 1,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: farben.feldRand,
                        backgroundColor: farben.feldDunkel,
                        color: farben.text,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        fontSize: 16,
                        fontFamily: 'InterTight_500Medium',
                      }}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Aufgabe entfernen"
                      hitSlop={8}
                      onPress={() => {
                        vibriere('leicht');
                        entferne(a.id);
                      }}
                      style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: farben.feld }}
                    >
                      <Txt groesse={20} farbe={farben.textLeise} zeile={1.1}>
                        ×
                      </Txt>
                    </Pressable>
                  </View>
                ))}
                {z.aufgaben.length < MAX_AUFGABEN ? (
                  <>
                    <Knopf art="rand" text="Eigene Aufgabe hinzufügen" haptik="leicht" onPress={() => hinzufuegen('')} />
                    <Txt groesse={14} farbe={farben.textLeise} style={{ marginTop: 6 }}>
                      Vorschläge aus deinem Quiz
                    </Txt>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {vorschlaege.map((t) => (
                        <Pille key={t} text={`+ ${t}`} onPress={() => hinzufuegen(t)} />
                      ))}
                    </View>
                  </>
                ) : null}
              </View>
            </Abschnitt>

            <Abschnitt titel="Erinnerung" text="Eine Nachricht am Tag, damit dir der Tag nicht wegrutscht.">
              <Karte stil={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                {z.erinnerung ? (
                  <>
                    <Rund groesse={44} text="−" label="15 Minuten früher" onPress={() => erinnerungSetzen(verschiebe(z.erinnerung!, -15))} />
                    <View style={{ alignItems: 'center' }}>
                      <Txt groesse={30} gewicht="extra">
                        {z.erinnerung}
                      </Txt>
                      <Txt groesse={13} farbe={farben.textLeise}>
                        Uhr, jeden Tag
                      </Txt>
                    </View>
                    <Rund groesse={44} text="+" label="15 Minuten später" onPress={() => erinnerungSetzen(verschiebe(z.erinnerung!, 15))} />
                  </>
                ) : (
                  <Txt groesse={16} farbe={farben.textLeise}>
                    Keine Erinnerung eingestellt
                  </Txt>
                )}
              </Karte>
              <Knopf
                art="leise"
                haptik="leicht"
                text={z.erinnerung ? 'Erinnerung ausschalten' : 'Erinnerung um 09:00 Uhr einschalten'}
                onPress={() => erinnerungSetzen(z.erinnerung ? null : '09:00')}
                stil={{ marginTop: 4 }}
              />
            </Abschnitt>

            <Abschnitt titel="Datenschutz" text="Alles bleibt auf deinem Handy, auch deine Fotos. Kein Konto, kein Server, keine Statistik.">
              {loeschenFragen ? (
                <Karte stil={{ gap: 10 }}>
                  <Txt groesse={16} gewicht="extra">
                    Wirklich alles löschen?
                  </Txt>
                  <Txt groesse={15} farbe={farben.textLeise}>
                    Deine Serie, deine Aufgaben, alle Foto-Beweise und deine Antworten sind danach weg. Das lässt sich nicht rückgängig machen.
                  </Txt>
                  <Knopf
                    text="Ja, alles löschen"
                    onPress={async () => {
                      await planeTaeglich(null);
                      await absageFokusEnde();
                      alleFotosLoeschen();
                      allesLoeschen();
                      router.replace('/onboarding');
                    }}
                  />
                  <Knopf art="leise" text="Abbrechen" haptik="leicht" onPress={() => setLoeschenFragen(false)} />
                </Karte>
              ) : (
                <Knopf art="rand" text="Alle Daten löschen" onPress={() => setLoeschenFragen(true)} />
              )}
            </Abschnitt>

            <Txt groesse={12} farbe={farben.textGedimmt} mitte style={{ marginTop: 28 }}>
              {Constants.expoConfig?.name ?? 'Disziplin'} · Version {Constants.expoConfig?.version ?? '0.1.0'} · Testversion
            </Txt>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Abschnitt({ titel, text, children }: { titel: string; text: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 26 }}>
      <Txt groesse={20} gewicht="extra">
        {titel}
      </Txt>
      <Txt groesse={14} farbe={farben.textLeise} style={{ marginTop: 2, marginBottom: 12 }}>
        {text}
      </Txt>
      {children}
    </View>
  );
}
