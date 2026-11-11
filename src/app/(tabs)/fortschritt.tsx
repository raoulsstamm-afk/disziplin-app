import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NachtHintergrund, Verlauf } from '@/components/Licht';
import { Txt } from '@/components/Txt';
import { Haken, Karte, PunktZeile } from '@/components/ui';
import { level, levelZu, XP_FOTO } from '@/data/level';
import { vibriere } from '@/haptik';
import { berechne, useJetzt, useStore } from '@/state/store';
import { farben, LEISTE_PLATZ, MAX_BREITE } from '@/theme';
import { MONATE, tageText, tagSchluessel, WOCHENTAGE } from '@/zeit';

// Fortschritt: Kalender (erledigte Tage, Joker), Zahlen, letzte Foto-Beweise und die Level-Leiter.
// Verpasste Tage bleiben einfach leer. Keine roten Markierungen.

type TagArt = 'erledigt' | 'joker' | 'leer';

export default function Fortschritt() {
  const { z } = useStore();
  const jetzt = useJetzt(60000);
  const b = berechne(z, jetzt);
  const l = levelZu(b.xp);
  const heute = new Date(jetzt);
  const [monat, setMonat] = useState({ j: heute.getFullYear(), m: heute.getMonth() });
  const letzte = [...z.beweise].sort((x, y) => y.zeit - x.zeit).slice(0, 6);

  const artVon = (k: string): TagArt => (b.erledigt.has(k) ? 'erledigt' : b.jokerTage.has(k) ? 'joker' : 'leer');

  return (
    <View style={{ flex: 1, backgroundColor: farben.nachtMitte }}>
      <NachtHintergrund art="plan" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: LEISTE_PLATZ + 24, width: '100%', maxWidth: MAX_BREITE, alignSelf: 'center' }}
        >
          <Txt groesse={30} gewicht="extra">
            Fortschritt
          </Txt>
          <Txt groesse={15} farbe={farben.textLeise} style={{ marginTop: 4 }}>
            {b.serie > 0 ? `${tageText(b.serie)} am Stück. Eine Aufgabe am Tag hält die Serie.` : 'Eine erledigte Aufgabe am Tag reicht für die Serie.'}
          </Txt>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Zahl wert={String(b.rekord)} text="Rekord" />
            <Zahl wert={String(z.beweise.length)} text="Foto-Beweise" />
            <Zahl wert={String(b.fokusMinuten)} text="Fokus-Min." />
          </View>

          <Karte stil={{ marginTop: 12, paddingHorizontal: 12 }}>
            <Kalender
              j={monat.j}
              m={monat.m}
              artVon={artVon}
              heuteKey={tagSchluessel(heute)}
              onMonat={(delta) => {
                vibriere('leicht');
                setMonat(({ j, m }) => {
                  const neu = new Date(j, m + delta, 1);
                  return { j: neu.getFullYear(), m: neu.getMonth() };
                });
              }}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12, paddingHorizontal: 4 }}>
              <Legende farbe={farben.blau} text="Erledigt" />
              <Legende farbe={farben.lampe} text="Joker" />
            </View>
          </Karte>

          <Karte stil={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: b.jokerFrei ? 'rgba(255,154,77,0.2)' : farben.feld }}>
              <Txt groesse={18} gewicht="extra" farbe={b.jokerFrei ? farben.lampe : farben.textGedimmt}>
                J
              </Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt groesse={16} gewicht="extra">
                {b.jokerFrei ? 'Joker diese Woche frei' : 'Joker diese Woche genutzt'}
              </Txt>
              <Txt groesse={13} farbe={farben.textLeise}>
                Verpasst du einen Tag, rettet der Joker automatisch deine Serie. Einer pro Woche.
              </Txt>
            </View>
          </Karte>

          {letzte.length > 0 ? (
            <>
              <Txt groesse={20} gewicht="extra" style={{ marginTop: 26 }}>
                Letzte Beweise
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                {letzte.map((x) => (
                  <View key={x.id} style={{ width: '31%', aspectRatio: 0.8, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: farben.karteRand }}>
                    <Verlauf farben={[farben.blauTief, '#1B1730']} quer={false} />
                    {x.foto ? (
                      <Image source={{ uri: x.foto }} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Haken erledigt groesse={28} />
                      </View>
                    )}
                    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 6, backgroundColor: 'rgba(11,10,18,0.6)' }}>
                      <Txt groesse={11} gewicht="halb" numberOfLines={1}>
                        {x.text}
                      </Txt>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Txt groesse={20} gewicht="extra" style={{ marginTop: 26 }}>
            Level-Leiter
          </Txt>
          <Txt groesse={14} farbe={farben.textLeise} style={{ marginTop: 2 }}>
            {XP_FOTO} XP pro Foto-Beweis, 1 XP pro Fokus-Minute. Du hast {b.xp} XP.
          </Txt>
          <View style={{ gap: 8, marginTop: 12 }}>
            {level.map((stufe, i) => {
              const erreicht = i < l.index;
              const aktuell = i === l.index;
              return (
                <Karte key={stufe.name} akzent={aktuell} stil={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, opacity: erreicht || aktuell ? 1 : 0.55 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: erreicht ? farben.violett : aktuell ? farben.blau : 'transparent',
                      borderWidth: erreicht || aktuell ? 0 : 1,
                      borderColor: farben.textGedimmt,
                    }}
                  >
                    <Txt groesse={14} gewicht="extra" farbe={erreicht || aktuell ? farben.tief : farben.textLeise}>
                      {erreicht ? '✓' : i + 1}
                    </Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt groesse={16} gewicht="extra">
                      {stufe.name}
                    </Txt>
                    <Txt groesse={13} farbe={farben.textLeise}>
                      {aktuell ? stufe.satz : i === 0 ? 'Der Anfang' : `ab ${stufe.ab} XP`}
                    </Txt>
                  </View>
                </Karte>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Zahl({ wert, text }: { wert: string; text: string }) {
  return (
    <View style={{ flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', overflow: 'hidden' }}>
      <Verlauf farben={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} quer={false} />
      <Txt groesse={22} gewicht="extra" numberOfLines={1}>
        {wert}
      </Txt>
      <Txt groesse={12} farbe={farben.textLeise} numberOfLines={1}>
        {text}
      </Txt>
    </View>
  );
}

function Legende({ farbe, text }: { farbe: string; text: string }) {
  return (
    <View>
      <PunktZeile farbe={farbe}>
        <Txt groesse={13} farbe={farben.textLeise}>
          {text}
        </Txt>
      </PunktZeile>
    </View>
  );
}

function Kalender({ j, m, artVon, heuteKey, onMonat }: { j: number; m: number; artVon: (k: string) => TagArt; heuteKey: string; onMonat: (delta: number) => void }) {
  const erster = new Date(j, m, 1);
  const versatz = (erster.getDay() + 6) % 7; // Montag zuerst
  const anzahl = new Date(j, m + 1, 0).getDate();
  const zellen: (number | null)[] = [...Array(versatz).fill(null), ...Array.from({ length: anzahl }, (_, i) => i + 1)];
  while (zellen.length % 7) zellen.push(null);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 }}>
        <Pfeil text="‹" label="Vormonat" onPress={() => onMonat(-1)} />
        <Txt groesse={17} gewicht="extra">
          {MONATE[m]} {j}
        </Txt>
        <Pfeil text="›" label="Nächster Monat" onPress={() => onMonat(1)} />
      </View>
      <View style={{ flexDirection: 'row' }}>
        {WOCHENTAGE.map((w) => (
          <View key={w} style={{ flex: 1, alignItems: 'center' }}>
            <Txt groesse={12} farbe={farben.textGedimmt}>
              {w}
            </Txt>
          </View>
        ))}
      </View>
      {Array.from({ length: zellen.length / 7 }, (_, zeile) => (
        <View key={zeile} style={{ flexDirection: 'row', marginTop: 4 }}>
          {zellen.slice(zeile * 7, zeile * 7 + 7).map((tag, i) => {
            if (!tag) return <View key={i} style={{ flex: 1, height: 42 }} />;
            const key = `${j}-${String(m + 1).padStart(2, '0')}-${String(tag).padStart(2, '0')}`;
            return <TagZelle key={i} tag={tag} art={artVon(key)} heute={key === heuteKey} />;
          })}
        </View>
      ))}
    </View>
  );
}

function TagZelle({ tag, art, heute }: { tag: number; art: TagArt; heute: boolean }) {
  const hintergrund = art === 'erledigt' ? farben.blau : art === 'joker' ? 'rgba(255,154,77,0.3)' : 'transparent';
  const textFarbe = art === 'erledigt' ? farben.tief : art === 'leer' ? farben.textGedimmt : farben.text;
  return (
    <View style={{ flex: 1, height: 42, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: hintergrund,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: heute ? 2 : 0,
          borderColor: art === 'erledigt' ? farben.blauLeuchten : farben.text,
        }}
      >
        <Txt groesse={14} gewicht={art === 'erledigt' || heute ? 'extra' : 'mittel'} farbe={textFarbe} zeile={1.2}>
          {tag}
        </Txt>
      </View>
    </View>
  );
}

function Pfeil({ text, label, onPress }: { text: string; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={10} style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: farben.feld }}>
      <Txt groesse={20} gewicht="halb" zeile={1.1}>
        {text}
      </Txt>
    </Pressable>
  );
}
