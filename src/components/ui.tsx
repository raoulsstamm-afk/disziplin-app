import { ReactNode, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vibriere } from '@/haptik';
import { farben, MAX_BREITE } from '@/theme';
import { HintergrundArt, Leuchten, NachtHintergrund, Verlauf } from './Licht';
import { Txt } from './Txt';
import Svg, { Circle, Path } from 'react-native-svg';

// Bildschirm mit Nacht-Hintergrund. Inhalt auf breiten Geräten mittig und schmal.
export function Bildschirm({
  children,
  art = 'frage',
  scroll,
  stil,
  unten = true,
}: {
  children: ReactNode;
  art?: HintergrundArt;
  scroll?: boolean;
  stil?: ViewStyle;
  unten?: boolean;
}) {
  const innen: ViewStyle = { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, width: '100%', maxWidth: MAX_BREITE, alignSelf: 'center' };
  return (
    <View style={{ flex: 1, backgroundColor: farben.nachtMitte }}>
      <NachtHintergrund art={art} />
      <SafeAreaView style={{ flex: 1 }} edges={unten ? ['top', 'bottom', 'left', 'right'] : ['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView contentContainerStyle={[innen, stil]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[innen, { flex: 1 }, stil]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

function useFeder() {
  const wert = useRef(new Animated.Value(1)).current;
  return {
    stil: { transform: [{ scale: wert }] },
    rein: () => Animated.spring(wert, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 0 }).start(),
    raus: () => Animated.spring(wert, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 10 }).start(),
  };
}

// Knöpfe: blau = Hauptaktion mit Leuchten (Verlauf Violett zu Blau), hell = ruhige Hauptaktion, leise = Textknopf, rand = umrandet
export function Knopf({
  text,
  onPress,
  art = 'hell',
  aus,
  stil,
  gross,
  haptik = 'mittel',
}: {
  text: string;
  onPress: () => void;
  art?: 'blau' | 'hell' | 'leise' | 'rand';
  aus?: boolean;
  stil?: ViewStyle;
  gross?: boolean;
  haptik?: 'leicht' | 'mittel' | 'stark';
}) {
  const feder = useFeder();
  const hoehe = gross ? 66 : 58;
  const textFarbe = art === 'blau' || art === 'hell' ? farben.tief : art === 'leise' ? farben.textLeise : farben.text;
  return (
    <Animated.View style={[feder.stil, aus && { opacity: 0.4 }, stil]}>
      {art === 'blau' && !aus && <Leuchten ueberstand={26} staerke={0.32} />}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={text}
        onPressIn={aus ? undefined : feder.rein}
        onPressOut={aus ? undefined : feder.raus}
        onPress={
          aus
            ? undefined
            : () => {
                vibriere(haptik);
                onPress();
              }
        }
        style={{
          height: art === 'leise' ? 44 : hoehe,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderWidth: art === 'rand' ? 1 : 0,
          borderColor: farben.karteRand,
          backgroundColor: art === 'rand' ? farben.karte : 'transparent',
        }}
      >
        {art === 'blau' && <Verlauf farben={[farben.violett, farben.blau]} radius={hoehe / 2} />}
        {art === 'hell' && <Verlauf farben={[farben.hellKnopf, farben.hellKnopf2]} radius={hoehe / 2} />}
        <Txt groesse={art === 'leise' ? 15 : gross ? 19 : 18} gewicht={art === 'leise' ? 'halb' : 'extra'} farbe={textFarbe}>
          {text}
        </Txt>
      </Pressable>
    </Animated.View>
  );
}

// Karte mit leichtem Glas-Verlauf
export function Karte({ children, stil, akzent }: { children: ReactNode; stil?: ViewStyle; akzent?: boolean }) {
  return (
    <View
      style={[
        {
          borderRadius: 20,
          padding: 16,
          borderWidth: akzent ? 2 : 1,
          borderColor: akzent ? farben.blau : farben.karteRand,
          overflow: 'hidden',
        },
        stil,
      ]}
    >
      <Verlauf
        farben={akzent ? ['rgba(156,196,255,0.18)', 'rgba(138,125,255,0.06)'] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
        quer
      />
      {children}
    </View>
  );
}

// Fortschrittsbalken mit Blau-Violett-Verlauf
export function Balken({ anteil, hoehe = 10 }: { anteil: number; hoehe?: number }) {
  const a = Math.max(0, Math.min(1, anteil));
  return (
    <View style={{ height: hoehe, borderRadius: hoehe / 2, backgroundColor: farben.spur, overflow: 'hidden' }}>
      {a > 0 && (
        <View style={{ width: `${Math.max(a * 100, 3)}%`, height: hoehe }}>
          <Verlauf farben={[farben.violett, farben.blau]} radius={hoehe / 2} />
        </View>
      )}
    </View>
  );
}

// Antwort-Karte im Quiz
export function Wahl({ text, gewaehlt, onPress, mehrfach, mitte }: { text: string; gewaehlt: boolean; onPress: () => void; mehrfach?: boolean; mitte?: boolean }) {
  const feder = useFeder();
  return (
    <Animated.View style={feder.stil}>
      <Pressable
        accessibilityRole={mehrfach ? 'checkbox' : 'radio'}
        accessibilityState={{ checked: gewaehlt }}
        onPressIn={feder.rein}
        onPressOut={feder.raus}
        onPress={() => {
          vibriere('leicht');
          onPress();
        }}
        style={{
          minHeight: mitte ? 68 : 56,
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 14,
          justifyContent: 'center',
          overflow: 'hidden',
          borderWidth: gewaehlt ? 0 : 1,
          borderColor: farben.feldRand,
        }}
      >
        <Verlauf farben={gewaehlt ? [farben.blau, farben.violett] : [farben.feld, farben.feldDunkel]} radius={16} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Txt groesse={17} gewicht={gewaehlt ? 'fett' : 'mittel'} farbe={gewaehlt ? farben.tief : farben.text} mitte={mitte} style={{ flex: 1 }}>
            {text}
          </Txt>
          {mehrfach && (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: gewaehlt ? farben.tief : farben.textGedimmt,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {gewaehlt && <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: farben.tief }} />}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Kleine Zeile mit farbigem Punkt (Zeitleiste, Legende)
export function PunktZeile({ farbe, children }: { farbe: string; children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: farbe }} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

// Hervorgehobene Zeile mit blauem Schimmer (Gründe, Plan-Punkte)
export function Schimmer({ children, stil }: { children: ReactNode; stil?: ViewStyle }) {
  return (
    <View style={[{ borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, overflow: 'hidden' }, stil]}>
      <Verlauf farben={['rgba(156,196,255,0.16)', 'rgba(255,255,255,0.03)']} />
      {children}
    </View>
  );
}

export const stile = StyleSheet.create({
  zeile: { flexDirection: 'row', alignItems: 'center' },
});

// Runder Haken für Aufgaben: gefüllt in Blau, wenn erledigt, sonst nur ein leiser Kreis
export function Haken({ erledigt, groesse = 26 }: { erledigt: boolean; groesse?: number }) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      {erledigt ? (
        <>
          <Circle cx={12} cy={12} r={11} fill={farben.blau} />
          <Path d="M7 12.5l3 3 7-7" stroke={farben.tief} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <Circle cx={12} cy={12} r={10.5} fill="none" stroke={farben.offen} strokeWidth={2} />
      )}
    </Svg>
  );
}

// Kleine Auswahl-Pille (Uhrzeiten, Vorschläge)
export function Pille({ text, aktiv, onPress }: { text: string; aktiv?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text}
      onPress={() => {
        vibriere('leicht');
        onPress();
      }}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: aktiv ? farben.blau : farben.feldRand,
        backgroundColor: aktiv ? 'rgba(156,196,255,0.14)' : farben.feldDunkel,
      }}
    >
      <Txt groesse={15} gewicht="halb" farbe={aktiv ? farben.blau : farben.text}>
        {text}
      </Txt>
    </Pressable>
  );
}

// Runder Plus/Minus-Knopf (Uhrzeit verschieben)
export function Rund({ text, label, onPress, groesse = 52 }: { text: string; label: string; onPress: () => void; groesse?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        vibriere('leicht');
        onPress();
      }}
      style={{ width: groesse, height: groesse, borderRadius: groesse / 2, borderWidth: 1, borderColor: farben.feldRand, backgroundColor: farben.feld, alignItems: 'center', justifyContent: 'center' }}
    >
      <Txt groesse={groesse > 46 ? 26 : 22} gewicht="halb" zeile={1.1}>
        {text}
      </Txt>
    </Pressable>
  );
}
