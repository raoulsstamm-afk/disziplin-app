// KI-Prüfung des Foto-Beweises. IM MVP AUSGESCHALTET: Ohne KI zählt jedes Foto direkt (Ehrlichkeitsprinzip).
//
// Später (Plan, noch nicht gebaut):
// - Supabase-Funktion "pruefen" im Kopfkiste-Projekt (rozigbnbifcbsiybarzm), Muster wie kopfkiste/src/ki/sortierenKI.ts.
// - Modell Claude Haiku, Foto vorher in der App klein rechnen (z. B. 512 px, JPEG), nichts speichern.
// - Tageslimit pro Gerät in der Funktion, nur für Zahlende (RevenueCat), Ausgabenlimit im Anthropic-Konto.
// - Vor dem ersten Hochladen: Einwilligung einholen und Datenschutzerklärung anpassen.
// Bis dahin verlässt kein Foto das Handy.

export const KI_AKTIV = false;

export type Pruefung = {
  zaehlt: boolean;
  // kurzer Satz unter "Geprüft. Zählt." (von der KI oder ein fester Text)
  satz: string;
  durchKI: boolean;
};

export async function pruefeFoto(_eingabe: { aufgabe: string; fotoUri: string | null }): Promise<Pruefung> {
  if (!KI_AKTIV) {
    return { zaehlt: true, satz: 'Ehrlich gemacht, ehrlich gezählt. Das Foto bleibt nur auf deinem Handy.', durchKI: false };
  }
  // Hier kommt später der Aufruf der Supabase-Funktion hin.
  return { zaehlt: true, satz: 'Foto gespeichert.', durchKI: false };
}
