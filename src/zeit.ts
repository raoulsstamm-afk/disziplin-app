// Kleine Helfer für Uhrzeiten und Daten

export const zwei = (n: number) => String(n).padStart(2, '0');

// "21:30" um Minuten verschieben (über Mitternacht hinweg)
export function verschiebe(uhrzeit: string, minuten: number) {
  const [h, m] = uhrzeit.split(':').map(Number);
  const gesamt = (((h * 60 + m + minuten) % 1440) + 1440) % 1440;
  return `${zwei(Math.floor(gesamt / 60))}:${zwei(gesamt % 60)}`;
}

export function uhrText(uhrzeit: string) {
  return `${uhrzeit} Uhr`;
}

// Tagesschlüssel in Ortszeit, z. B. "2026-11-11"
export function tagSchluessel(d: Date) {
  return `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`;
}

export function tagesBeginn(ms: number) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function gruss(jetzt: number) {
  const h = new Date(jetzt).getHours();
  if (h < 5) return 'Gute Nacht';
  if (h < 11) return 'Guten Morgen';
  if (h < 17) return 'Guten Tag';
  return 'Guten Abend';
}

// "1 Tag" / "3 Tage"
export function tageText(n: number) {
  return n === 1 ? '1 Tag' : `${n} Tage`;
}

// Woche (Montag bis Sonntag) als Schlüssel: Datum des Montags
export function wochenSchluessel(d: Date) {
  const m = new Date(d);
  m.setHours(12, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return tagSchluessel(m);
}

// Restzeit als "24:59" oder "1:29:59"
export function countdownText(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sek = s % 60;
  return h > 0 ? `${h}:${zwei(m)}:${zwei(sek)}` : `${zwei(m)}:${zwei(sek)}`;
}

export function uhrzeitVon(ms: number) {
  const d = new Date(ms);
  return `${zwei(d.getHours())}:${zwei(d.getMinutes())}`;
}
