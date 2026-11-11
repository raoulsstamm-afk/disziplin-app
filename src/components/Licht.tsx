import { useId, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { farben } from '@/theme';

// Weiche Lichtflecken (Halation) und Verläufe, alles mit react-native-svg.
// React Native kann kein CSS-blur, deshalb sind die Lichtflecken radiale Verläufe, die nach außen durchsichtig werden.

export type Fleck = {
  // Mittelpunkt als Anteil von Breite und Höhe (darf außerhalb von 0 bis 1 liegen)
  x: number;
  y: number;
  // Radius in Punkten
  r: number;
  farbe: string;
  staerke: number;
};

export type HintergrundArt = 'frage' | 'heute' | 'fokus' | 'plan' | 'ruhig';

const VERLAEUFE: Record<HintergrundArt, { stops: [string, number][]; flecken: Fleck[] }> = {
  frage: {
    stops: [[farben.nachtOben, 0], [farben.nachtMitte, 0.55], [farben.nachtUnten, 1]],
    flecken: [
      { x: 0.1, y: 0.0, r: 240, farbe: farben.blau, staerke: 0.3 },
      { x: 0.95, y: 1.0, r: 250, farbe: farben.lampe, staerke: 0.24 },
    ],
  },
  heute: {
    stops: [[farben.blauTief, 0], [farben.dunkelBlau, 0.45], [farben.nachtUnten, 1]],
    flecken: [
      { x: 0.5, y: 0.22, r: 240, farbe: farben.blau, staerke: 0.26 },
      { x: 0.05, y: 1.0, r: 250, farbe: farben.lampe, staerke: 0.22 },
      { x: 1.0, y: 0.6, r: 160, farbe: farben.violett, staerke: 0.12 },
    ],
  },
  fokus: {
    stops: [[farben.nachtOben, 0], ['#0F0E18', 0.55], [farben.tief, 1]],
    flecken: [
      { x: 0.5, y: 0.36, r: 280, farbe: farben.blau, staerke: 0.26 },
      { x: 1.05, y: 0.95, r: 220, farbe: farben.lampe, staerke: 0.2 },
    ],
  },
  plan: {
    stops: [[farben.nachtOben, 0], [farben.nachtMitte, 0.5], [farben.nachtUnten, 1]],
    flecken: [
      { x: 0.5, y: 0.0, r: 260, farbe: farben.blau, staerke: 0.26 },
      { x: 1.0, y: 0.8, r: 200, farbe: farben.violett, staerke: 0.14 },
    ],
  },
  ruhig: {
    stops: [[farben.nachtOben, 0], [farben.nachtMitte, 0.5], [farben.nachtUnten, 1]],
    flecken: [
      { x: 0.9, y: 0.05, r: 220, farbe: farben.blau, staerke: 0.2 },
      { x: 0.1, y: 0.95, r: 220, farbe: farben.lampe, staerke: 0.16 },
    ],
  },
};

function useGroesse() {
  const [g, setG] = useState({ b: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - g.b) > 1 || Math.abs(height - g.h) > 1) setG({ b: width, h: height });
  };
  return { ...g, onLayout };
}

// Ganzflächiger Nacht-Hintergrund mit Lichtflecken
export function NachtHintergrund({ art = 'frage', extra = [] }: { art?: HintergrundArt; extra?: Fleck[] }) {
  const id = useId().replace(/:/g, '');
  const { b, h, onLayout } = useGroesse();
  const v = VERLAEUFE[art];
  const flecken = [...v.flecken, ...extra];
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: farben.nachtMitte }]} onLayout={onLayout} pointerEvents="none">
      {b > 0 && (
        <Svg width={b} height={h}>
          <Defs>
            <LinearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
              {v.stops.map(([c, o]) => (
                <Stop key={o} offset={o} stopColor={c} />
              ))}
            </LinearGradient>
            {flecken.map((f, i) => (
              <RadialGradient key={i} id={`f${id}${i}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={f.farbe} stopOpacity={f.staerke} />
                <Stop offset="0.45" stopColor={f.farbe} stopOpacity={f.staerke * 0.55} />
                <Stop offset="1" stopColor={f.farbe} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          <Rect x={0} y={0} width={b} height={h} fill={`url(#bg${id})`} />
          {flecken.map((f, i) => (
            <Ellipse key={i} cx={f.x * b} cy={f.y * h} rx={f.r} ry={f.r} fill={`url(#f${id}${i})`} />
          ))}
        </Svg>
      )}
    </View>
  );
}

// Linearer Verlauf als Fläche hinter einem Knopf oder Balken (füllt das Elternteil)
export function Verlauf({ farben: f, quer = true, radius = 0, deckkraft = 1 }: { farben: string[]; quer?: boolean; radius?: number; deckkraft?: number }) {
  const id = useId().replace(/:/g, '');
  const { b, h, onLayout } = useGroesse();
  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none">
      {b > 0 && (
        <Svg width={b} height={h}>
          <Defs>
            <LinearGradient id={`v${id}`} x1="0" y1="0" x2={quer ? '1' : '0'} y2={quer ? '0' : '1'}>
              {f.map((c, i) => (
                <Stop key={i} offset={f.length === 1 ? 0 : i / (f.length - 1)} stopColor={c} stopOpacity={deckkraft} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={b} height={h} rx={Math.min(radius, h / 2)} ry={Math.min(radius, h / 2)} fill={`url(#v${id})`} />
        </Svg>
      )}
    </View>
  );
}

// Leuchten hinter einem Element (ragt über den Rand hinaus)
export function Leuchten({ farbe = farben.blau, staerke = 0.45, ueberstand = 40, stil }: { farbe?: string; staerke?: number; ueberstand?: number; stil?: ViewStyle }) {
  const id = useId().replace(/:/g, '');
  const { b, h, onLayout } = useGroesse();
  return (
    <View
      style={[{ position: 'absolute', left: -ueberstand, right: -ueberstand, top: -ueberstand, bottom: -ueberstand }, stil]}
      onLayout={onLayout}
      pointerEvents="none"
    >
      {b > 0 && (
        <Svg width={b} height={h}>
          <Defs>
            <RadialGradient id={`l${id}`} cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={farbe} stopOpacity={staerke} />
              <Stop offset="0.55" stopColor={farbe} stopOpacity={staerke * 0.45} />
              <Stop offset="1" stopColor={farbe} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={b / 2} cy={h / 2} rx={b / 2} ry={h / 2} fill={`url(#l${id})`} />
        </Svg>
      )}
    </View>
  );
}
