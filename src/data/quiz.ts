// Eigene Quiz-Fragen. Ohne Scham, ohne Diagnosen ("ADHS" o. Ä. nie), ohne Heilversprechen.
// Reihenfolge: Ziel, Ist-Zustand, Gefühl und Bremse, Selbstverpflichtung.
// Jede Antwort taucht später sichtbar wieder auf (Auswertung, Plan, Aufgaben, Erinnerung, Lock-in-Dauer).

import type { FokusDauer } from './level';

export type FrageId = 'ziel' | 'aufschieben' | 'wann' | 'stattdessen' | 'verloren' | 'gefuehl' | 'bremse' | 'konzentration' | 'vorsatz';

export type Option = { id: string; text: string };

export type Frage = {
  id: FrageId;
  frage: string;
  hinweis?: string;
  mehrfach?: boolean;
  // Antworten als Raster mit zwei Spalten (kurze Antworten)
  raster?: boolean;
  optionen: Option[];
};

export const fragen: Frage[] = [
  {
    id: 'ziel',
    frage: 'Was willst du endlich durchziehen?',
    hinweis: 'Wähle alles, was passt.',
    mehrfach: true,
    optionen: [
      { id: 'lernen', text: 'Lernen, Schule oder Uni' },
      { id: 'sport', text: 'Regelmäßig Sport' },
      { id: 'arbeit', text: 'Arbeit oder eigenes Projekt' },
      { id: 'ordnung', text: 'Ordnung zu Hause' },
      { id: 'morgen', text: 'Früher aufstehen' },
      { id: 'handy', text: 'Weniger am Handy hängen' },
    ],
  },
  {
    id: 'aufschieben',
    frage: 'Was schiebst du am meisten auf?',
    raster: true,
    optionen: [
      { id: 'aufstehen', text: 'Aufstehen' },
      { id: 'lernen', text: 'Lernen' },
      { id: 'sport', text: 'Sport' },
      { id: 'aufraeumen', text: 'Aufräumen' },
      { id: 'arbeit', text: 'Arbeit' },
      { id: 'schlafen', text: 'Schlafen gehen' },
    ],
  },
  {
    id: 'wann',
    frage: 'Wann rutscht dir der Tag am ehesten weg?',
    optionen: [
      { id: 'morgens', text: 'Morgens, ich komme nicht in die Gänge' },
      { id: 'mittags', text: 'Nach dem Mittag, im Tief' },
      { id: 'abends', text: 'Abends, dann ist es zu spät' },
      { id: 'ganz', text: 'Eigentlich den ganzen Tag' },
    ],
  },
  {
    id: 'stattdessen',
    frage: 'Was machst du stattdessen?',
    hinweis: 'Wähle alles, was passt.',
    mehrfach: true,
    optionen: [
      { id: 'scrollen', text: 'Scrollen' },
      { id: 'serien', text: 'Serien und YouTube' },
      { id: 'zocken', text: 'Zocken' },
      { id: 'kleinkram', text: 'Unwichtigen Kleinkram' },
      { id: 'gruebeln', text: 'Grübeln und planen' },
      { id: 'liegen', text: 'Einfach liegen bleiben' },
    ],
  },
  {
    id: 'verloren',
    frage: 'Wie viel Zeit geht dir am Tag so verloren?',
    hinweis: 'Grob geschätzt reicht.',
    optionen: [
      { id: '0.5', text: 'Unter einer Stunde' },
      { id: '1.5', text: '1 bis 2 Stunden' },
      { id: '3', text: '2 bis 4 Stunden' },
      { id: '5', text: 'Mehr als 4 Stunden' },
    ],
  },
  {
    id: 'gefuehl',
    frage: 'Wie fühlt es sich an, wenn du aufschiebst?',
    optionen: [
      { id: 'gewissen', text: 'Schlechtes Gewissen im Hinterkopf' },
      { id: 'ueberfordert', text: 'Überfordert, alles ist zu viel' },
      { id: 'leer', text: 'Leer und irgendwie egal' },
      { id: 'druck', text: 'Stress, am Ende wird es knapp' },
    ],
  },
  {
    id: 'bremse',
    frage: 'Was hält dich am meisten auf?',
    optionen: [
      { id: 'anfang', text: 'Ich weiß nicht, wo ich anfangen soll' },
      { id: 'perfekt', text: 'Es soll gleich perfekt werden' },
      { id: 'muede', text: 'Mir fehlt die Energie' },
      { id: 'ablenkung', text: 'Die Ablenkung ist immer zu nah' },
    ],
  },
  {
    id: 'konzentration',
    frage: 'Wie lange bleibst du am Stück bei einer Sache?',
    optionen: [
      { id: '10', text: 'Unter 15 Minuten' },
      { id: '25', text: '15 bis 30 Minuten' },
      { id: '50', text: '30 bis 60 Minuten' },
      { id: '90', text: 'Länger als eine Stunde' },
    ],
  },
  {
    id: 'vorsatz',
    frage: 'Wie viel bist du bereit, jeden Tag zu tun?',
    hinweis: 'Eine erledigte Aufgabe reicht, damit der Tag zählt.',
    optionen: [
      { id: 'eine', text: 'Eine kleine Sache am Tag' },
      { id: 'zwei', text: 'Zwei Sachen am Tag' },
      { id: 'drei', text: 'Drei Sachen am Tag' },
    ],
  },
];

export type Antworten = Partial<Record<FrageId, string | string[]>>;

export function einzel(a: Antworten, id: FrageId): string | undefined {
  const w = a[id];
  return typeof w === 'string' ? w : undefined;
}
export function mehrere(a: Antworten, id: FrageId): string[] {
  const w = a[id];
  return Array.isArray(w) ? w : [];
}
export function optionText(id: FrageId, wert: string | undefined) {
  return fragen.find((f) => f.id === id)?.optionen.find((o) => o.id === wert)?.text;
}

// Typ aus "Was hält dich am meisten auf?". Kein Diagnose-Wort, nur ein Bild.
export const TYPEN: Record<string, { name: string; satz: string }> = {
  anfang: {
    name: 'Startblockierer',
    satz: 'Du bist nicht faul. Der erste Schritt wirkt bei dir einfach riesig. Darum schneidet dein Plan alles so klein, dass Anfangen leicht wird.',
  },
  perfekt: {
    name: 'Perfekt-Warter',
    satz: 'Du willst es richtig machen und wartest deshalb auf den perfekten Moment. Dein Plan zählt erledigt statt perfekt.',
  },
  muede: {
    name: 'Akku-Sparer',
    satz: 'Dein Akku ist oft leer, bevor du loslegst. Dein Plan legt die wichtigste Sache dahin, wo du noch Energie hast.',
  },
  ablenkung: {
    name: 'Ablenkungs-Magnet',
    satz: 'Dein Kopf greift sofort zum schnellen Kick, wenn es zäh wird. Mit dem Lock-in-Timer machst du Ablenkung für eine Weile einfach zu.',
  },
};

export function typZu(a: Antworten) {
  return TYPEN[einzel(a, 'bremse') ?? 'anfang'] ?? TYPEN.anfang;
}

// Plan-Satz zur Bremse
export const BREMSE_SATZ: Record<string, string> = {
  anfang: 'Aufgaben so klein, dass Anfangen leicht wird',
  perfekt: 'Erledigt zählt, nicht perfekt: ein Foto reicht',
  muede: 'Die wichtigste Sache zuerst, solange Energie da ist',
  ablenkung: 'Lock-in-Timer, damit Ablenkung Pause hat',
};

// Vorschlag für die Erinnerungszeit passend zur schwierigsten Tageszeit
export const ERINNERUNG_VORSCHLAG: Record<string, string> = {
  morgens: '07:30',
  mittags: '13:30',
  abends: '17:30',
  ganz: '09:00',
};

const WANN_TEXT: Record<string, string> = {
  morgens: 'morgens',
  mittags: 'nach dem Mittag',
  abends: 'abends',
  ganz: 'über den Tag',
};
export const wannText = (a: Antworten) => WANN_TEXT[einzel(a, 'wann') ?? 'ganz'] ?? 'über den Tag';

// Passende Lock-in-Dauer zur Konzentration
export function fokusVorschlag(a: Antworten): FokusDauer {
  const k = einzel(a, 'konzentration');
  if (k === '90') return 90;
  if (k === '50') return 50;
  return 25;
}

// Verlorene Stunden pro Woche
export function stundenProWoche(a: Antworten) {
  const proTag = Number(einzel(a, 'verloren') ?? 1.5) || 1.5;
  return Math.round(proTag * 7);
}

// Aufgaben-Vorschläge: zuerst das, was am meisten aufgeschoben wird, dann die Ziele
const AUFGABE_AUS: Record<string, string[]> = {
  aufstehen: ['Bett gemacht', 'Fenster auf, frische Luft'],
  lernen: ['30 Minuten lernen', 'Lernplatz frei geräumt'],
  sport: ['20 Minuten Sport', 'Sportsachen angezogen'],
  aufraeumen: ['10 Minuten aufräumen', 'Spüle leer'],
  arbeit: ['Wichtigste Aufgabe 25 Minuten', 'Schreibtisch bereit'],
  schlafen: ['Handy um 23 Uhr weggelegt', 'Licht aus vor Mitternacht'],
  ordnung: ['10 Minuten aufräumen'],
  morgen: ['Bett gemacht'],
  handy: ['Handy in einem anderen Raum'],
};

export const ALLE_VORSCHLAEGE = Array.from(new Set(Object.values(AUFGABE_AUS).flat()));

export function aufgabenVorschlaege(a: Antworten, anzahl = 3): string[] {
  const reihe = [einzel(a, 'aufschieben'), ...mehrere(a, 'ziel')].filter(Boolean) as string[];
  const liste: string[] = [];
  // erst je eine Aufgabe pro Bereich, dann die zweite
  for (const runde of [0, 1]) {
    for (const r of reihe) {
      const t = AUFGABE_AUS[r]?.[runde];
      if (t && !liste.includes(t)) liste.push(t);
    }
  }
  for (const t of ['Bett gemacht', '30 Minuten lernen', '20 Minuten Sport']) if (!liste.includes(t)) liste.push(t);
  return liste.slice(0, anzahl);
}

export function anzahlAufgaben(a: Antworten) {
  const v = einzel(a, 'vorsatz');
  return v === 'eine' ? 1 : v === 'zwei' ? 2 : 3;
}
