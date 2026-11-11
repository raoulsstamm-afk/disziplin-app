// Level ohne Figur. Erfahrung (XP) kommt aus Foto-Beweisen und abgeschlossenen Lock-ins.
// XP gehen nie verloren, auch nicht an Tagen ohne Aufgabe.

export const XP_FOTO = 40;
// Lock-in: 1 XP pro Minute (25 Minuten = 25 XP, 90 Minuten = 90 XP)
export const XP_PRO_FOKUS_MINUTE = 1;
export const ZIEL_TAGE = 30;

export type Level = { name: string; ab: number; satz: string };

export const level: Level[] = [
  { name: 'Losgelegt', ab: 0, satz: 'Du hast angefangen. Das ist mehr, als die meisten schaffen.' },
  { name: 'Anpacker', ab: 120, satz: 'Die ersten Beweise sind im Kasten. Anfangen wird leichter.' },
  { name: 'Dranbleiber', ab: 300, satz: 'Du kommst wieder, auch wenn es mal hakt.' },
  { name: 'Durchzieher', ab: 600, satz: 'Was du dir vornimmst, passiert auch.' },
  { name: 'Fokussiert', ab: 1000, satz: 'Lange Lock-ins sind für dich normal geworden.' },
  { name: 'Unaufhaltsam', ab: 1600, satz: 'Aufschieben ist die Ausnahme, nicht mehr die Regel.' },
  { name: 'Eiserne Routine', ab: 2500, satz: 'Disziplin ist jetzt einfach, wie du bist.' },
];

export function levelZu(xp: number) {
  let i = 0;
  for (let k = 0; k < level.length; k++) if (xp >= level[k].ab) i = k;
  const aktuell = level[i];
  const naechstes = level[i + 1] ?? null;
  const anteil = naechstes ? (xp - aktuell.ab) / (naechstes.ab - aktuell.ab) : 1;
  return { index: i, level: aktuell, naechstes, anteil: Math.max(0, Math.min(1, anteil)) };
}

export const FOKUS_DAUERN = [25, 50, 90] as const;
export type FokusDauer = (typeof FOKUS_DAUERN)[number];
