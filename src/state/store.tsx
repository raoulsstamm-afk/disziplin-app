import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Antworten } from '@/data/quiz';
import { FokusDauer, XP_FOTO, XP_PRO_FOKUS_MINUTE } from '@/data/level';
import { tagSchluessel, wochenSchluessel } from '@/zeit';

// Alles bleibt nur auf dem Handy (AsyncStorage). Keine Konten, kein Server, keine Statistik.
// Fotos liegen als Dateien im App-Ordner (src/fotos.ts), hier steht nur der Pfad.

export const SPEICHER_SCHLUESSEL = 'disziplin-zustand-v1';
export const MAX_AUFGABEN = 3;

export type Aufgabe = { id: string; text: string };
export type Beweis = {
  id: string;
  aufgabeId: string;
  // Text der Aufgabe zum Zeitpunkt des Fotos (falls die Aufgabe später geändert wird)
  text: string;
  tag: string;
  zeit: number;
  // Pfad zum Foto auf dem Handy, null im Browser-Test
  foto: string | null;
  // Satz der KI-Prüfung (später), sonst leer
  satz?: string;
};
export type FokusEintrag = { tag: string; zeit: number; minuten: number };
export type LaufenderFokus = { start: number; ende: number; minuten: number };

export type Zustand = {
  onboardingFertig: boolean;
  antworten: Antworten;
  // Uhrzeit der täglichen Erinnerung ("07:30") oder null
  erinnerung: string | null;
  aufgaben: Aufgabe[];
  beweise: Beweis[];
  fokus: FokusEintrag[];
  laufend: LaufenderFokus | null;
  // Zuletzt fertig gewordener Lock-in, bis die Erfolgsanzeige gesehen wurde
  fokusFertig: { minuten: number; xp: number } | null;
  fokusDauer: FokusDauer;
  ersterStart: number | null;
  // Nur Optik: welcher Plan auf der Paywall gewählt war
  plan: 'jahr' | 'monat';
};

export const leererZustand: Zustand = {
  onboardingFertig: false,
  antworten: {},
  erinnerung: null,
  aufgaben: [],
  beweise: [],
  fokus: [],
  laufend: null,
  fokusFertig: null,
  fokusDauer: 25,
  ersterStart: null,
  plan: 'jahr',
};

export const neueId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// Sanfte Serie: Ein Tag zählt, sobald eine Aufgabe erledigt ist (Foto-Beweis oder abgeschlossener Lock-in).
// Pro Woche (Montag bis Sonntag) rettet ein Joker automatisch einen verpassten Tag.
// Heute bricht die Serie nie: Solange der Tag läuft, ist noch alles offen.
export function berechne(z: Zustand, jetzt: number) {
  const heute = tagSchluessel(new Date(jetzt));
  const erledigt = new Set<string>([...z.beweise.map((b) => b.tag), ...z.fokus.map((f) => f.tag)]);
  const jokerTage = new Set<string>();
  const jokerWochen = new Set<string>();

  let anfang = z.ersterStart ?? jetzt;
  for (const b of z.beweise) anfang = Math.min(anfang, b.zeit);
  for (const f of z.fokus) anfang = Math.min(anfang, f.zeit);

  let serie = 0;
  let rekord = 0;
  const d = new Date(anfang);
  d.setHours(12, 0, 0, 0);
  for (let schutz = 0; schutz < 4000; schutz++) {
    const k = tagSchluessel(d);
    if (k >= heute) break;
    if (erledigt.has(k)) serie++;
    else if (serie > 0 && !jokerWochen.has(wochenSchluessel(d))) {
      jokerTage.add(k);
      jokerWochen.add(wochenSchluessel(d));
    } else serie = 0;
    rekord = Math.max(rekord, serie);
    d.setDate(d.getDate() + 1);
  }
  const heuteErledigt = erledigt.has(heute);
  if (heuteErledigt) serie++;
  rekord = Math.max(rekord, serie);

  const fokusMinuten = z.fokus.reduce((s, f) => s + f.minuten, 0);
  const xp = z.beweise.length * XP_FOTO + fokusMinuten * XP_PRO_FOKUS_MINUTE;
  const heuteBeweise = z.beweise.filter((b) => b.tag === heute);
  const heuteFokus = z.fokus.filter((f) => f.tag === heute).reduce((s, f) => s + f.minuten, 0);

  return {
    heute,
    serie,
    rekord,
    xp,
    erledigt,
    jokerTage,
    jokerFrei: !jokerWochen.has(wochenSchluessel(new Date(jetzt))),
    heuteErledigt,
    heuteBeweise,
    heuteFokus,
    fokusMinuten,
  };
}

type Kontext = {
  z: Zustand;
  geladen: boolean;
  setze: (teil: Partial<Zustand>) => void;
  onboardingAbschliessen: () => void;
  beweisSpeichern: (b: Omit<Beweis, 'tag' | 'zeit'>) => { neuerTag: boolean };
  fokusStarten: (minuten: FokusDauer) => LaufenderFokus;
  fokusAbbrechen: () => void;
  allesLoeschen: () => void;
};

const StoreKontext = createContext<Kontext | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [z, setZ] = useState<Zustand>(leererZustand);
  const [geladen, setGeladen] = useState(false);
  const aktuell = useRef(z);
  aktuell.current = z;

  useEffect(() => {
    AsyncStorage.getItem(SPEICHER_SCHLUESSEL)
      .then((roh) => {
        if (roh) setZ({ ...leererZustand, ...(JSON.parse(roh) as Partial<Zustand>) });
      })
      .catch(() => {})
      .finally(() => setGeladen(true));
  }, []);

  useEffect(() => {
    if (!geladen) return;
    AsyncStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(z)).catch(() => {});
  }, [z, geladen]);

  // Läuft ein Lock-in ab (auch während die App zu war), wird er hier gutgeschrieben
  useEffect(() => {
    if (!geladen) return;
    const pruefe = () => {
      const l = aktuell.current.laufend;
      if (!l || Date.now() < l.ende) return;
      setZ((alt) => {
        if (!alt.laufend || alt.laufend.start !== l.start) return alt;
        const eintrag: FokusEintrag = { tag: tagSchluessel(new Date(l.ende)), zeit: l.ende, minuten: l.minuten };
        return { ...alt, laufend: null, fokus: [...alt.fokus, eintrag], fokusFertig: { minuten: l.minuten, xp: l.minuten * XP_PRO_FOKUS_MINUTE } };
      });
    };
    pruefe();
    const t = setInterval(pruefe, 1000);
    return () => clearInterval(t);
  }, [geladen]);

  const setze = useCallback((teil: Partial<Zustand>) => setZ((alt) => ({ ...alt, ...teil })), []);

  const onboardingAbschliessen = useCallback(() => {
    setZ((alt) => ({ ...alt, onboardingFertig: true, ersterStart: alt.ersterStart ?? Date.now() }));
  }, []);

  const beweisSpeichern = useCallback((b: Omit<Beweis, 'tag' | 'zeit'>) => {
    const jetzt = Date.now();
    const tag = tagSchluessel(new Date(jetzt));
    const vorher = berechne(aktuell.current, jetzt);
    setZ((alt) => ({ ...alt, beweise: [...alt.beweise, { ...b, tag, zeit: jetzt }] }));
    return { neuerTag: !vorher.heuteErledigt };
  }, []);

  const fokusStarten = useCallback((minuten: FokusDauer) => {
    const start = Date.now();
    const l = { start, ende: start + minuten * 60000, minuten };
    setZ((alt) => ({ ...alt, laufend: l, fokusDauer: minuten, fokusFertig: null }));
    return l;
  }, []);

  // Abbrechen ohne Strafe: nichts wird abgezogen, es gibt nur keine XP für diesen Lock-in
  const fokusAbbrechen = useCallback(() => setZ((alt) => ({ ...alt, laufend: null })), []);

  const allesLoeschen = useCallback(() => {
    setZ(leererZustand);
    AsyncStorage.removeItem(SPEICHER_SCHLUESSEL).catch(() => {});
  }, []);

  return (
    <StoreKontext.Provider value={{ z, geladen, setze, onboardingAbschliessen, beweisSpeichern, fokusStarten, fokusAbbrechen, allesLoeschen }}>
      {children}
    </StoreKontext.Provider>
  );
}

export function useStore() {
  const k = useContext(StoreKontext);
  if (!k) throw new Error('useStore außerhalb von StoreProvider');
  return k;
}

// Tickende Uhr für Anzeigen, die sich jede Sekunde ändern
export function useJetzt(intervall = 1000) {
  const [jetzt, setJetzt] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setJetzt(Date.now()), intervall);
    return () => clearInterval(t);
  }, [intervall]);
  return jetzt;
}
