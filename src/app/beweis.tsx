import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Leuchten, Verlauf } from '@/components/Licht';
import { Txt } from '@/components/Txt';
import { Bildschirm, Haken, Karte, Knopf, Pille } from '@/components/ui';
import { XP_FOTO } from '@/data/level';
import { fotoAufnehmen, fotoBehalten, kameraVerfuegbar } from '@/fotos';
import { vibriere } from '@/haptik';
import { KI_AKTIV, pruefeFoto } from '@/ki/pruefenKI';
import { berechne, neueId, useStore } from '@/state/store';
import { farben } from '@/theme';

// Foto-Beweis: Aufgabe wählen, Foto machen, "Geprüft. Zählt." Fotos bleiben nur auf dem Handy.
// Ohne KI (KI_AKTIV = false) zählt jedes Foto direkt. Im Browser gibt es keine Kamera, dann gibt es einen Test ohne Foto.

type Stand = 'bereit' | 'pruefen' | 'fertig' | 'keineErlaubnis';

export default function Beweis() {
  const { z, beweisSpeichern } = useStore();
  const params = useLocalSearchParams<{ aufgabe?: string }>();
  const aufgaben = z.aufgaben.filter((a) => a.text.trim());
  const b = berechne(z, Date.now());
  const erledigteIds = new Set(b.heuteBeweise.map((x) => x.aufgabeId));
  const offen = aufgaben.filter((a) => !erledigteIds.has(a.id));

  const [gewaehltId, setGewaehltId] = useState<string | undefined>(params.aufgabe && offen.some((a) => a.id === params.aufgabe) ? params.aufgabe : offen[0]?.id);
  const [stand, setStand] = useState<Stand>('bereit');
  const [foto, setFoto] = useState<string | null>(null);
  const [ergebnis, setErgebnis] = useState<{ satz: string; neuerTag: boolean; text: string } | null>(null);

  const aufgabe = aufgaben.find((a) => a.id === gewaehltId);

  const speichern = async (fotoUri: string | null) => {
    if (!aufgabe) return;
    setStand('pruefen');
    const pruefung = await pruefeFoto({ aufgabe: aufgabe.text, fotoUri });
    const id = neueId();
    const dauerhaft = fotoUri ? fotoBehalten(fotoUri, id) : null;
    const { neuerTag } = beweisSpeichern({ id, aufgabeId: aufgabe.id, text: aufgabe.text, foto: dauerhaft, satz: pruefung.durchKI ? pruefung.satz : undefined });
    setFoto(dauerhaft);
    setErgebnis({ satz: pruefung.satz, neuerTag, text: aufgabe.text });
    vibriere('erfolg');
    setStand('fertig');
  };

  const kameraOeffnen = async () => {
    const r = await fotoAufnehmen();
    if (r.art === 'ok') {
      setFoto(r.uri);
      await speichern(r.uri);
    } else if (r.art === 'keineErlaubnis') setStand('keineErlaubnis');
  };

  const schliessen = () => (router.canGoBack() ? router.back() : router.replace('/heute'));

  if (stand === 'fertig' && ergebnis) {
    return (
      <Bildschirm art="fokus">
        <Txt groesse={13} farbe={farben.blau} gewicht="fett" label>
          FOTO-BEWEIS
        </Txt>
        <Txt groesse={26} gewicht="extra" style={{ marginTop: 8 }}>
          {ergebnis.text}
        </Txt>
        <FotoRahmen foto={foto} erledigt />
        <Karte stil={{ marginTop: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Haken erledigt groesse={34} />
          <View style={{ flex: 1 }}>
            <Txt groesse={17} gewicht="extra">
              Geprüft. Zählt. <Txt groesse={17} gewicht="extra" farbe={farben.blau}>+{XP_FOTO} XP</Txt>
            </Txt>
            <Txt groesse={14} farbe={farben.textLeise}>
              {ergebnis.satz}
            </Txt>
          </View>
        </Karte>
        {ergebnis.neuerTag ? (
          <Txt groesse={16} gewicht="halb" farbe={farben.blau} mitte style={{ marginTop: 14 }}>
            {b.serie === 1 ? 'Tag 1 gesichert. Der Anfang ist gemacht.' : `Tag ${b.serie} am Stück gesichert.`}
          </Txt>
        ) : null}
        <View style={{ flex: 1 }} />
        <Knopf art="hell" text="Weiter so" onPress={schliessen} />
      </Bildschirm>
    );
  }

  return (
    <Bildschirm art="fokus">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt groesse={13} farbe={farben.blau} gewicht="fett" label>
          FOTO-BEWEIS
        </Txt>
        <Pressable accessibilityRole="button" accessibilityLabel="Schließen" hitSlop={14} onPress={schliessen}>
          <Txt groesse={26} farbe={farben.textLeise} zeile={1.1}>
            ×
          </Txt>
        </Pressable>
      </View>

      {!aufgabe ? (
        <View style={{ flex: 1, justifyContent: 'center', gap: 12 }}>
          <Txt groesse={26} gewicht="extra" mitte>
            Alles erledigt für heute.
          </Txt>
          <Txt groesse={16} farbe={farben.textLeise} mitte>
            Jede Aufgabe hat ihren Beweis. Gönn dir die Pause.
          </Txt>
        </View>
      ) : (
        <>
          <Txt groesse={26} gewicht="extra" style={{ marginTop: 8 }}>
            {aufgabe.text}
          </Txt>
          {offen.length > 1 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {offen.map((a) => (
                <Pille key={a.id} text={a.text} aktiv={a.id === gewaehltId} onPress={() => setGewaehltId(a.id)} />
              ))}
            </View>
          ) : null}
          <FotoRahmen foto={foto} pruefen={stand === 'pruefen'} />
        </>
      )}

      <View style={{ flex: 1 }} />

      {aufgabe && stand === 'keineErlaubnis' ? (
        <View style={{ gap: 8 }}>
          <Karte>
            <Txt groesse={15} farbe={farben.textLeise}>
              Ohne Kamera gibt es keinen Foto-Beweis. Du kannst die Kamera in den Einstellungen deines Handys für diese App erlauben.
            </Txt>
          </Karte>
          <Knopf art="blau" text="Einstellungen öffnen" onPress={() => Linking.openSettings().catch(() => {})} />
          <Knopf art="leise" text="Nochmal versuchen" haptik="leicht" onPress={() => setStand('bereit')} />
        </View>
      ) : aufgabe && !kameraVerfuegbar ? (
        <View style={{ gap: 8 }}>
          <Txt groesse={13} farbe={farben.textLeise} mitte>
            Im Browser gibt es keine Kamera. Auf dem Handy öffnet sich hier die Kamera.
          </Txt>
          <Knopf art="blau" gross text="Test ohne Foto" aus={stand === 'pruefen'} onPress={() => speichern(null)} />
        </View>
      ) : aufgabe ? (
        <View style={{ gap: 8 }}>
          <Txt groesse={13} farbe={farben.textLeise} mitte>
            {KI_AKTIV ? 'Die KI schaut kurz drauf, dann zählt es.' : 'Ein ehrliches Foto reicht. Es bleibt nur auf deinem Handy.'}
          </Txt>
          <Knopf art="blau" gross haptik="stark" text="Kamera öffnen" aus={stand === 'pruefen'} onPress={kameraOeffnen} />
        </View>
      ) : (
        <Knopf art="hell" text="Zurück zu Heute" onPress={schliessen} />
      )}
    </Bildschirm>
  );
}

function FotoRahmen({ foto, pruefen, erledigt }: { foto: string | null; pruefen?: boolean; erledigt?: boolean }) {
  return (
    <View style={{ marginTop: 16, height: 340, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: erledigt || foto ? farben.blau : farben.feldRand }}>
      <Verlauf farben={[farben.blauTief, '#1B1730', '#0E1A20']} quer={false} />
      {foto ? (
        <Image source={{ uri: foto }} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityLabel="Dein Foto" />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Leuchten ueberstand={40} staerke={0.3} />
            {erledigt ? <Haken erledigt groesse={72} /> : <KameraSymbol />}
          </View>
          <Txt groesse={15} farbe={farben.textLeise} mitte>
            {erledigt ? 'Test ohne Foto gespeichert.' : 'Fotografiere, was du erledigt hast. Zum Beispiel das gemachte Bett oder dein offenes Buch.'}
          </Txt>
        </View>
      )}
      {pruefen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,10,18,0.55)', gap: 10 }}>
          <ActivityIndicator color={farben.blau} />
          <Txt groesse={15} gewicht="halb">
            Wird geprüft
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

function KameraSymbol() {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64">
      <Rect x={6} y={16} width={52} height={38} rx={10} fill="none" stroke={farben.blau} strokeWidth={3} />
      <Path d="M22 16l4-7h12l4 7" fill="none" stroke={farben.blau} strokeWidth={3} strokeLinejoin="round" />
      <Circle cx={32} cy={35} r={10} fill="none" stroke={farben.blau} strokeWidth={3} />
      <Circle cx={48} cy={24} r={2} fill={farben.blau} />
    </Svg>
  );
}
