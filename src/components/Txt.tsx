import { Text, TextProps, TextStyle } from 'react-native';
import { farben, schrift } from '@/theme';

type Props = TextProps & {
  groesse?: number;
  gewicht?: keyof typeof schrift;
  farbe?: string;
  mitte?: boolean;
  // Großbuchstaben mit etwas Abstand (für kleine Überschriften wie "FRAGE 4 VON 10")
  label?: boolean;
  // Eigene Zeilenhöhe als Faktor (Standard: 1,4 für Fließtext, 1,2 für große Überschriften)
  zeile?: number;
};

// Text immer über Txt, damit Schrift (Inter Tight) und Zeilenhöhe stimmen.
// Zeilenhöhe nie unter 1,2 x Schriftgröße, sonst werden Umlaut-Punkte abgeschnitten.
export function Txt({ groesse = 16, gewicht = 'normal', farbe = farben.text, mitte, label, zeile, style, children, ...rest }: Props) {
  const faktor = zeile ?? (groesse >= 24 ? 1.2 : 1.4);
  const stil: TextStyle = {
    fontFamily: schrift[gewicht],
    fontSize: groesse,
    lineHeight: Math.round(groesse * faktor),
    color: farbe,
    includeFontPadding: false,
    textAlign: mitte ? 'center' : undefined,
    letterSpacing: label ? groesse * 0.08 : undefined,
  };
  return (
    <Text {...rest} style={[stil, style]}>
      {children}
    </Text>
  );
}
