// Nacht-Stil wie die Strichmännchen-Videos: dunkle Verläufe, Laptop-Blau mit Violett als Akzent,
// weiche Lichtflecken (Halation) in Blau und Lampen-Orange.
// Kein Rot, keine Warnfarben. Ein verpasster Tag ist kein Drama.

export const farben = {
  // Hintergrund-Verläufe (oben nach unten)
  nachtOben: '#16244A',
  nachtMitte: '#15131F',
  nachtUnten: '#1C1426',
  tief: '#0B0A12',
  blauTief: '#233A73',
  dunkelBlau: '#161B33',

  // Akzent: Laptop-Blau mit Verlauf zu Violett
  blau: '#9CC4FF',
  violett: '#8A7DFF',
  blauHell: '#D4E3FF',
  blauLeuchten: '#EAF2FF',

  // Licht-Farbe für die Halation
  lampe: '#FF9A4D',

  // Text
  text: '#F3F1EA',
  textLeise: '#A7A3B8',
  textGedimmt: '#6E6A82',
  offen: '#5B5670',

  // Flächen
  karte: 'rgba(255,255,255,0.06)',
  karteRand: 'rgba(255,255,255,0.12)',
  feld: '#24203A',
  feldDunkel: '#1A1828',
  feldRand: '#2E2A40',
  spur: '#2A2738',
  hellKnopf: '#F3F1EA',
  hellKnopf2: '#D4E3FF',
};

export const schrift = {
  normal: 'InterTight_400Regular',
  mittel: 'InterTight_500Medium',
  halb: 'InterTight_600SemiBold',
  fett: 'InterTight_700Bold',
  extra: 'InterTight_800ExtraBold',
} as const;

// Größter nutzbarer Inhalt auf breiten Bildschirmen (Web-Test, Tablets)
export const MAX_BREITE = 480;

// Schwebende Leiste unten: Höhe und Platz, den Bildschirme darüber frei lassen
export const LEISTE_HOEHE = 64;
export const LEISTE_PLATZ = LEISTE_HOEHE + 28;
