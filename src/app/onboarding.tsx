import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';
import { HintergrundArt, Leuchten } from '@/components/Licht';
import { Txt } from '@/components/Txt';
import { Balken, Bildschirm, Haken, Karte, Knopf, Pille, PunktZeile, Rund, Schimmer, Wahl } from '@/components/ui';
import { erlaubnisAnfragen, planeTaeglich } from '@/benachrichtigung';
import { vibriere } from '@/haptik';
import { ZIEL_TAGE } from '@/data/level';
import {
  Antworten,
  anzahlAufgaben,
  aufgabenVorschlaege,
  BREMSE_SATZ,
  einzel,
  ERINNERUNG_VORSCHLAG,
  fokusVorschlag,
  fragen,
  mehrere,
  optionText,
  stundenProWoche,
  typZu,
  wannText,
} from '@/data/quiz';
import { ERINNERUNG_TAG, GRATIS_TAGE, PREIS_JAHR, PREIS_JAHR_PRO_WOCHE, PREIS_MONAT } from '@/data/preise';
import { neueId, useStore } from '@/state/store';
import { farben } from '@/theme';
import { uhrText, verschiebe } from '@/zeit';

// Ablauf: Start, 9 Fragen, Auswertung, Plan, Erinnerung, Paywall.
// Jeder Schritt ist ein eigener Bildschirm ohne Scrollen.

type Schritt = { typ: 'start' } | { typ: 'frage'; nr: number } | { typ: 'auswertung' } | { typ: 'plan' } | { typ: 'erinnerung' } | { typ: 'paywall' };

const SCHRITTE: Schritt[] = [
  { typ: 'start' },
  ...fragen.map((_, nr) => ({ typ: 'frage' as const, nr })),
  { typ: 'auswertung' },
  { typ: 'plan' },
  { typ: 'erinnerung' },
  { typ: 'paywall' },
];

export default function Onboarding() {
  const { z, setze, onboardingAbschliessen } = useStore();
  const [i, setI] = useState(0);
  const a = z.antworten;
  const schritt = SCHRITTE[i];

  const weiter = () => setI((n) => Math.min(n + 1, SCHRITTE.length - 1));
  const zurueck = () => setI((n) => Math.max(n - 1, 0));
  const antworte = (teil: Antworten) => setze({ antworten: { ...a, ...teil } });

  const fortschritt = i / (SCHRITTE.length - 1);
  const kopf = i > 0 ? <Kopf anteil={fortschritt} onZurueck={zurueck} /> : null;

  switch (schritt.typ) {
    case 'start':
      return <Start onWeiter={weiter} />;
    case 'frage':
      return <FrageSchritt kopf={kopf} nr={schritt.nr} antworten={a} onAntwort={antworte} onWeiter={weiter} />;
    case 'auswertung':
      return <Auswertung kopf={kopf} a={a} onWeiter={weiter} />;
    case 'plan':
      return (
        <Plan
          kopf={kopf}
          a={a}
          onWeiter={(aufgaben) => {
            setze({ aufgaben: aufgaben.map((text) => ({ id: neueId(), text })), fokusDauer: fokusVorschlag(a) });
            weiter();
          }}
        />
      );
    case 'erinnerung':
      return (
        <Erinnerung
          kopf={kopf}
          vorschlag={z.erinnerung ?? ERINNERUNG_VORSCHLAG[einzel(a, 'wann') ?? 'ganz'] ?? '09:00'}
          onFertig={async (uhrzeit) => {
            setze({ erinnerung: uhrzeit });
            if (uhrzeit) {
              const ok = await erlaubnisAnfragen();
              if (ok) await planeTaeglich(uhrzeit);
            }
            weiter();
          }}
        />
      );
    case 'paywall':
      return (
        <Paywall
          kopf={kopf}
          plan={z.plan}
          erinnerung={z.erinnerung}
          anzahl={z.aufgaben.length || 3}
          onPlan={(plan) => setze({ plan })}
          onTest={() => {
            vibriere('erfolg');
            onboardingAbschliessen();
            router.replace('/heute');
          }}
        />
      );
  }
}

// Fortschritt oben mit Zurück-Pfeil
function Kopf({ anteil, onZurueck }: { anteil: number; onZurueck: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Zurück" onPress={onZurueck} hitSlop={12} style={{ width: 28, height: 28, justifyContent: 'center' }}>
        <Txt groesse={22} gewicht="halb" farbe={farben.textLeise} zeile={1.2}>
          ‹
        </Txt>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Balken anteil={anteil} hoehe={6} />
      </View>
    </View>
  );
}

function Seite({ kopf, art, children, unten }: { kopf?: ReactNode; art?: HintergrundArt; children: ReactNode; unten: ReactNode }) {
  return (
    <Bildschirm art={art}>
      {kopf}
      <View style={{ flex: 1 }}>{children}</View>
      <View style={{ gap: 6, paddingTop: 12 }}>{unten}</View>
    </Bildschirm>
  );
}

function Start({ onWeiter }: { onWeiter: () => void }) {
  return (
    <Seite
      art="heute"
      unten={
        <>
          <Knopf art="blau" gross text="Los geht's" onPress={onWeiter} />
          <Txt groesse={13} farbe={farben.textLeise} mitte style={{ marginTop: 8 }}>
            Kein Konto · Deine Fotos bleiben auf deinem Handy
          </Txt>
        </>
      }
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
          <Leuchten ueberstand={60} staerke={0.35} />
          <View style={{ width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: 'rgba(156,196,255,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: 'rgba(138,125,255,0.35)', alignItems: 'center', justifyContent: 'center' }}>
              <Haken erledigt groesse={64} />
              <Txt groesse={13} farbe={farben.textLeise} label style={{ marginTop: 10 }}>
                ERLEDIGT
              </Txt>
            </View>
          </View>
        </View>
        <View style={{ gap: 12 }}>
          <Txt groesse={32} gewicht="extra" mitte>
            Schluss mit morgen.
          </Txt>
          <Txt groesse={17} farbe={farben.textLeise} mitte>
            Drei Aufgaben am Tag, jede mit Foto-Beweis. Dazu ein Lock-in-Timer, wenn es wirklich zählt. Ohne Druck, ohne Ausreden.
          </Txt>
        </View>
      </View>
    </Seite>
  );
}

function FrageSchritt({ kopf, nr, antworten, onAntwort, onWeiter }: { kopf: ReactNode; nr: number; antworten: Antworten; onAntwort: (a: Antworten) => void; onWeiter: () => void }) {
  const f = fragen[nr];
  const wert = antworten[f.id];
  const gewaehlt = (id: string) => (Array.isArray(wert) ? wert.includes(id) : wert === id);
  const fertig = Array.isArray(wert) ? wert.length > 0 : !!wert;
  return (
    <Seite kopf={kopf} art="frage" unten={<Knopf text="Weiter" aus={!fertig} onPress={onWeiter} />}>
      <Txt groesse={13} farbe={farben.textLeise} label>
        FRAGE {nr + 1} VON {fragen.length}
      </Txt>
      <Txt groesse={28} gewicht="extra" style={{ marginTop: 8 }}>
        {f.frage}
      </Txt>
      {f.hinweis ? (
        <Txt groesse={15} farbe={farben.textLeise} style={{ marginTop: 6 }}>
          {f.hinweis}
        </Txt>
      ) : null}
      <View style={[{ gap: 10, marginTop: 20 }, f.raster && { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }]}>
        {f.optionen.map((o) => (
          <View key={o.id} style={f.raster ? { width: '47.5%' } : undefined}>
            <Wahl
              text={o.text}
              mehrfach={f.mehrfach}
              mitte={f.raster}
              gewaehlt={gewaehlt(o.id)}
              onPress={() => {
                if (f.mehrfach) {
                  const liste = Array.isArray(wert) ? wert : [];
                  onAntwort({ [f.id]: liste.includes(o.id) ? liste.filter((x) => x !== o.id) : [...liste, o.id] });
                } else {
                  onAntwort({ [f.id]: o.id });
                }
              }}
            />
          </View>
        ))}
      </View>
    </Seite>
  );
}

function Auswertung({ kopf, a, onWeiter }: { kopf: ReactNode; a: Antworten; onWeiter: () => void }) {
  const typ = typZu(a);
  const stundenWoche = stundenProWoche(a);
  const aufgeschoben = optionText('aufschieben', einzel(a, 'aufschieben'));
  const stattdessen = mehrere(a, 'stattdessen')
    .map((id) => optionText('stattdessen', id))
    .filter(Boolean)
    .slice(0, 2)
    .join(', ');
  return (
    <Seite kopf={kopf} art="plan" unten={<Knopf text="Weiter" onPress={onWeiter} />}>
      <Txt groesse={13} farbe={farben.blau} gewicht="fett" label>
        DEINE AUSWERTUNG
      </Txt>
      <Txt groesse={28} gewicht="extra" style={{ marginTop: 8 }}>
        Du bist ein {typ.name}.
      </Txt>
      <Txt groesse={16} farbe={farben.textLeise} style={{ marginTop: 8 }}>
        {typ.satz}
      </Txt>
      <Karte stil={{ marginTop: 22, gap: 6 }}>
        <Txt groesse={15} farbe={farben.textLeise}>
          So viel Zeit holst du dir zurück
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Txt groesse={44} gewicht="extra" farbe={farben.blau} zeile={1.15}>
            {stundenWoche} Std.
          </Txt>
          <Txt groesse={16} farbe={farben.textLeise}>
            pro Woche
          </Txt>
        </View>
        <Txt groesse={14} farbe={farben.textLeise}>
          In {ZIEL_TAGE} Tagen sind das etwa {Math.round((stundenWoche * ZIEL_TAGE) / 7)} Stunden. Geschätzt aus deinen Antworten.
        </Txt>
      </Karte>
      {aufgeschoben ? (
        <Karte stil={{ marginTop: 12, gap: 4 }}>
          <Txt groesse={15} farbe={farben.textLeise}>
            Am meisten aufgeschoben
          </Txt>
          <Txt groesse={17} gewicht="fett">
            {aufgeschoben}
            {stattdessen ? ` · stattdessen ${stattdessen}` : ''}
          </Txt>
        </Karte>
      ) : null}
      <Txt groesse={15} farbe={farben.textLeise} style={{ marginTop: 16 }}>
        Aufschieben ist kein Charakterfehler. Es ist ein Muster, und Muster lassen sich umbauen.
      </Txt>
    </Seite>
  );
}

function Plan({ kopf, a, onWeiter }: { kopf: ReactNode; a: Antworten; onWeiter: (aufgaben: string[]) => void }) {
  const anzahl = anzahlAufgaben(a);
  const aufgaben = aufgabenVorschlaege(a, anzahl);
  const aufgeschoben = optionText('aufschieben', einzel(a, 'aufschieben'));
  const bremse = BREMSE_SATZ[einzel(a, 'bremse') ?? ''];
  const punkte = [
    aufgeschoben ? `Start mit "${aufgeschoben}", weil du das am meisten aufschiebst` : null,
    bremse ?? null,
    `Lock-in mit ${fokusVorschlag(a)} Minuten, passend zu deiner Konzentration`,
    `Erinnerung ${wannText(a)}, wenn dir der Tag sonst wegrutscht`,
  ].filter(Boolean) as string[];
  return (
    <Seite kopf={kopf} art="plan" unten={<Knopf text="Weiter" onPress={() => onWeiter(aufgaben)} />}>
      <Txt groesse={13} farbe={farben.blau} gewicht="fett" label>
        DEIN PLAN STEHT
      </Txt>
      <Txt groesse={26} gewicht="extra" style={{ marginTop: 8 }}>
        In {ZIEL_TAGE} Tagen vom Aufschieber zum Durchzieher.
      </Txt>
      <View style={{ gap: 6, marginTop: 14 }}>
        {punkte.map((p) => (
          <Schimmer key={p} stil={{ paddingVertical: 9 }}>
            <Txt groesse={15}>{p}</Txt>
          </Schimmer>
        ))}
      </View>
      <Karte stil={{ marginTop: 14, gap: 10, paddingVertical: 14 }}>
        <Txt groesse={14} farbe={farben.textLeise}>
          {anzahl === 1 ? 'Deine Aufgabe für jeden Tag' : `Deine ${anzahl} Aufgaben für jeden Tag`}
        </Txt>
        {aufgaben.map((t) => (
          <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Haken erledigt={false} groesse={20} />
            <Txt groesse={16} gewicht="halb">
              {t}
            </Txt>
          </View>
        ))}
        <Txt groesse={13} farbe={farben.textGedimmt}>
          Jederzeit änderbar. Eine erledigte Aufgabe reicht für den Tag.
        </Txt>
      </Karte>
    </Seite>
  );
}

const ZEIT_VORSCHLAEGE = ['07:30', '09:00', '13:30', '17:30'];

function Erinnerung({ kopf, vorschlag, onFertig }: { kopf: ReactNode; vorschlag: string; onFertig: (uhrzeit: string | null) => void }) {
  const [uhr, setUhr] = useState(vorschlag);
  return (
    <Seite
      kopf={kopf}
      art="ruhig"
      unten={
        <>
          <Knopf art="blau" text="Erinnerung einschalten" onPress={() => onFertig(uhr)} />
          <Knopf art="leise" text="Ohne Erinnerung weiter" onPress={() => onFertig(null)} haptik="leicht" />
        </>
      }
    >
      <Txt groesse={13} farbe={farben.textLeise} label>
        ERINNERUNG
      </Txt>
      <Txt groesse={28} gewicht="extra" style={{ marginTop: 8 }}>
        Wann sollen wir dich erinnern?
      </Txt>
      <Txt groesse={15} farbe={farben.textLeise} style={{ marginTop: 6 }}>
        Am besten kurz bevor dir der Tag sonst wegrutscht. Eine Nachricht am Tag, kein Dauerfeuer.
      </Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 36 }}>
        <Rund text="−" label="15 Minuten früher" onPress={() => setUhr((u) => verschiebe(u, -15))} />
        <View style={{ alignItems: 'center' }}>
          <Leuchten ueberstand={30} staerke={0.18} />
          <Txt groesse={56} gewicht="extra" zeile={1.15}>
            {uhr}
          </Txt>
          <Txt groesse={14} farbe={farben.textLeise}>
            Uhr, jeden Tag
          </Txt>
        </View>
        <Rund text="+" label="15 Minuten später" onPress={() => setUhr((u) => verschiebe(u, 15))} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 28 }}>
        {ZEIT_VORSCHLAEGE.map((t) => (
          <Pille key={t} text={t} aktiv={uhr === t} onPress={() => setUhr(t)} />
        ))}
      </View>
      <Txt groesse={13} farbe={farben.textGedimmt} mitte style={{ marginTop: 20 }}>
        Danach fragt dein Handy, ob die App Mitteilungen schicken darf.
      </Txt>
    </Seite>
  );
}

function Paywall({
  kopf,
  plan,
  erinnerung,
  anzahl,
  onPlan,
  onTest,
}: {
  kopf: ReactNode;
  plan: 'jahr' | 'monat';
  erinnerung: string | null;
  anzahl: number;
  onPlan: (p: 'jahr' | 'monat') => void;
  onTest: () => void;
}) {
  const [hinweis, setHinweis] = useState(false);
  return (
    <Seite
      kopf={kopf}
      art="plan"
      unten={
        <>
          <Knopf art="blau" gross text={plan === 'jahr' ? `${GRATIS_TAGE} Tage gratis starten` : 'Monatsabo starten'} onPress={() => setHinweis(true)} />
          <Txt groesse={12} farbe={hinweis ? farben.blau : farben.textLeise} mitte style={{ marginTop: 6 }}>
            {hinweis ? 'Käufe kommen später. Zum Testen unten weiter.' : 'Jederzeit kündbar · Wiederherstellen · Bedingungen'}
          </Txt>
          <Knopf art="leise" text="Weiter (Test)" onPress={onTest} haptik="leicht" />
        </>
      }
    >
      <Txt groesse={26} gewicht="extra">
        Starte deine {ZIEL_TAGE} Tage.
      </Txt>
      <View style={{ gap: 6, marginTop: 12 }}>
        <Schimmer stil={{ paddingVertical: 9 }}>
          <Txt groesse={15}>{anzahl === 1 ? 'Täglich 1 Aufgabe mit Foto-Beweis' : `Täglich ${anzahl} Aufgaben mit Foto-Beweis`}</Txt>
        </Schimmer>
        <Schimmer stil={{ paddingVertical: 9 }}>
          <Txt groesse={15}>{erinnerung ? `Lock-in-Timer und Erinnerung um ${uhrText(erinnerung)}` : 'Lock-in-Timer für echte Fokuszeit'}</Txt>
        </Schimmer>
      </View>
      <Karte stil={{ marginTop: 14, gap: 10, paddingVertical: 14 }}>
        <PunktZeile farbe={farben.blau}>
          <Txt groesse={14}>
            <Txt groesse={14} gewicht="extra">Heute: </Txt>alles freigeschaltet
          </Txt>
        </PunktZeile>
        <PunktZeile farbe={farben.violett}>
          <Txt groesse={14}>
            <Txt groesse={14} gewicht="extra">Tag {ERINNERUNG_TAG}: </Txt>wir erinnern dich
          </Txt>
        </PunktZeile>
        <PunktZeile farbe={farben.lampe}>
          <Txt groesse={14}>
            <Txt groesse={14} gewicht="extra">Tag {GRATIS_TAGE}: </Txt>dein Abo startet
          </Txt>
        </PunktZeile>
      </Karte>
      <View style={{ gap: 10, marginTop: 14 }}>
        <PlanKarte
          gewaehlt={plan === 'jahr'}
          onPress={() => onPlan('jahr')}
          titel="Jährlich"
          zeile={`${GRATIS_TAGE} Tage gratis, dann ${PREIS_JAHR}/Jahr`}
          klein={`nur ${PREIS_JAHR_PRO_WOCHE} pro Woche`}
          etikett="Beliebt"
        />
        <PlanKarte gewaehlt={plan === 'monat'} onPress={() => onPlan('monat')} titel="Monatlich" zeile={`${PREIS_MONAT}/Monat`} />
      </View>
      <Txt groesse={13} farbe={farben.textLeise} mitte style={{ marginTop: 12 }}>
        Abrechnung über deinen App Store. Kein Konto, keine Daten bei uns.
      </Txt>
    </Seite>
  );
}

function PlanKarte({ gewaehlt, onPress, titel, zeile, klein, etikett }: { gewaehlt: boolean; onPress: () => void; titel: string; zeile: string; klein?: string; etikett?: string }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: gewaehlt }}
      onPress={() => {
        vibriere('leicht');
        onPress();
      }}
    >
      <Karte akzent={gewaehlt} stil={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: gewaehlt ? farben.blau : farben.textGedimmt, alignItems: 'center', justifyContent: 'center' }}>
          {gewaehlt && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: farben.blau }} />}
        </View>
        <View style={{ flex: 1 }}>
          <Txt groesse={16} gewicht="extra">
            {titel}
          </Txt>
          <Txt groesse={13} farbe={farben.textLeise}>
            {zeile}
          </Txt>
          {klein ? (
            <Txt groesse={13} farbe={farben.blau}>
              {klein}
            </Txt>
          ) : null}
        </View>
        {etikett ? (
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: farben.blau }}>
            <Txt groesse={12} gewicht="extra" farbe={farben.tief}>
              {etikett}
            </Txt>
          </View>
        ) : null}
      </Karte>
    </Pressable>
  );
}
