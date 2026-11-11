# Disziplin (Arbeitstitel): App-Code

Deutsche App gegen Aufschieben. Quittr-Prinzip, funktional wie Cal AI: eine große Zahl, ein großer Knopf. Kernfeature: **Foto-Beweis plus Lock-in-Timer** (Raoul, 11.11.2026). Vorbilder Wayk (Wecker mit Foto-Mission), Alarmy, Duolingo (sanfte Streaks). Kein Maskottchen in der App (das Strichmännchen lebt nur in den Videos). Kein echter Wecker im MVP.
Konzept und Entscheidungen: `claude-wissen/wissen/app-fabrik/apps/disziplin/` (steckbrief.md, videos.md), Fabrik-Regeln und Entscheidungen in `wissen/app-fabrik/README.md`, UI/UX-Muster in `wissen/app-fabrik/ui-ux-muster.md` (Teil B, App 2). Schwester-App mit gleichem Aufbau: `raoulsstamm-afk/nofap-app`.

## Für jeden Claude, der hier arbeitet
- Raoul programmiert nicht. Einfach erklären, Dashboard-Schritte klickgenau. Antworten auf Deutsch, keine Gedankenstriche (auch nicht in App-Texten).
- Vorher lesen: `claude-wissen/wissen/app-entwicklung-lektionen.md`.
- Raoul hat erlaubt, auf `main` direkt zu pushen (11.11.2026). Builds, Veröffentlichen, Kaufen, Store: nur nach Rückfrage.
- Git-Autor: Name "Raoul", Mail raouls.stamm@gmail.com (öffentliche Adresse, nie eine andere). Commits auf Deutsch.
- Keine Secrets in Dateien.

## Rote Linien für Texte
- Keine Diagnosewörter (nie "ADHS" oder Ähnliches), keine Heilversprechen. Alltagssprache ("wenn Anfangen schwerfällt").
- Ohne Scham: "nicht faul", Aufschieben ist ein Muster, kein Charakterfehler. Keine Hustle- oder Alpha-Sprüche.
- Kein Rot, keine Warnungen, nie "verpasst" oder "überfällig". Verpasste Tage bleiben im Kalender einfach leer.
- Sanfte Streaks: eine erledigte Aufgabe reicht für den Tag, 1 Joker pro Woche rettet automatisch einen verpassten Tag. Lock-in abbrechen kostet nichts.
- Fotos bleiben nur auf dem Handy. Nichts wird hochgeladen, solange die KI-Prüfung aus ist.

## Stand (11.11.2026): MVP, klickbar
- Onboarding (`src/app/onboarding.tsx`, ein Bildschirm pro Schritt, kein Scrollen): Start, 9 Quizfragen (`src/data/quiz.ts`: Ziel, was aufgeschoben wird, wann, was stattdessen, verlorene Zeit, Gefühl, Bremse, Konzentration, Vorsatz), Auswertung (Typ-Name aus der Bremse: Startblockierer, Perfekt-Warter, Akku-Sparer, Ablenkungs-Magnet; Stunden pro Woche zurück), Plan (Quiz-Antworten tauchen auf, 1 bis 3 Aufgaben-Vorschläge, Lock-in-Dauer passend zur Konzentration), Erinnerungs-Uhrzeit (danach System-Abfrage), harte Paywall nur als Optik (Jahresabo 39,99 € vorausgewählt mit 7 Tagen gratis, Monatsabo 9,99 €, Zeitleiste Heute/Tag 5/Tag 7). Knopf "Weiter (Test)" führt in die App.
- Preise in `src/data/preise.ts`: 39,99 €/Jahr wie NoFap, Monatspreis 9,99 € noch Platzhalter.
- Heute (`src/app/(tabs)/heute.tsx`): große Zahl "Tage am Stück", Level mit Balken, Joker-Hinweis, die Aufgaben des Tages (antippen öffnet den Foto-Beweis), großer Knopf "Foto-Beweis machen", Hinweis bei laufendem Lock-in.
- Foto-Beweis (`src/app/beweis.tsx`): Aufgabe wählen, Kamera (expo-image-picker), Foto wird in den App-Ordner kopiert (`src/fotos.ts`, expo-file-system), Ergebnis "Geprüft. Zählt. +40 XP". Im Browser gibt es keine Kamera, dort "Test ohne Foto". Ohne Kamera-Erlaubnis: Knopf zu den Handy-Einstellungen.
- KI-Prüfung nur vorbereitet: `src/ki/pruefenKI.ts` mit `KI_AKTIV = false`, ohne KI zählt jedes Foto direkt.
- Lock-in (`src/app/(tabs)/fokus.tsx` Auswahl 25/50/90 Minuten, `src/app/lockin.tsx` großer Countdown-Ring): Abbrechen ohne Strafe, am Ende 1 XP pro Minute und lokale Benachrichtigung (`src/benachrichtigung.ts`). Läuft weiter, wenn die App zu ist (Endzeit im Speicher, der Store schreibt die XP beim nächsten Öffnen gut).
- Fortschritt (`src/app/(tabs)/fortschritt.tsx`): Rekord, Zahl der Foto-Beweise, Fokus-Minuten, Monatskalender (erledigt blau, Joker orange), Joker-Karte, letzte Beweise als Vorschaubilder, Level-Leiter (`src/data/level.ts`).
- Einstellungen: bis zu 3 Aufgaben bearbeiten, Vorschläge aus dem Quiz, Erinnerung, alle Daten löschen (inklusive Fotos).
- Alles lokal (AsyncStorage unter `disziplin-zustand-v1`, `src/state/store.tsx`). Keine Konten, kein Server, keine Statistik.
- Serie und Joker werden in `berechne()` (Store) aus den Beweisen und Lock-ins berechnet: Ein Tag zählt mit mindestens einem Foto-Beweis oder abgeschlossenen Lock-in. Pro Woche (Mo bis So) rettet ein Joker den ersten verpassten Tag, wenn eine Serie läuft. Heute bricht die Serie nie.

## Design (Nacht-Stil wie die Strichmännchen-Videos)
1. Hintergrund immer `NachtHintergrund` (`src/components/Licht.tsx`): Verläufe #16244A, #15131F, #1C1426 plus weiche Lichtflecken (Halation) in Laptop-Blau #9CC4FF und Lampen-Orange #FF9A4D.
2. Akzent Laptop-Blau #9CC4FF mit Verlauf zu Violett #8A7DFF. Rot gibt es nicht.
3. Schrift Inter Tight, Text immer über `Txt` (`src/components/Txt.tsx`).
4. Ein Bildschirm macht eine Sache. Startseite = eine große Zahl + ein großer Knopf.
5. Knöpfe: `Knopf` in `src/components/ui.tsx` (blau = Hauptaktion mit Leuchten, hell, rand, leise), Haptik bei jedem Knopf (`src/haptik.ts`). Weitere Bausteine: `Karte`, `Balken`, `Wahl`, `Haken`, `Pille`, `Rund`, `Schimmer`, `Ring` (Countdown).
6. Schwebende Leiste unten mit 4 Symbolen (Heute, Fokus, Fortschritt, Einstellungen), `src/app/(tabs)/_layout.tsx`. Scroll-Bildschirme lassen unten `LEISTE_PLATZ` frei.
7. Farben nur aus `src/theme.ts`.
Vorlage: Fabrik-Design "Disziplin.dc.html" (4 Screens: Quiz, Startseite, Foto-Beweis, Plan mit Paywall).

## Technik
- Expo SDK 57, React Native 0.86, TypeScript, Expo Router (Routen in `src/app/`). Versionen wie NoFap und Kopfkiste. Neue Pakete immer mit `npx expo install`.
- Kamera: expo-image-picker (Berechtigungstext in `app.json`, Fotos-Mediathek und Mikrofon bewusst aus). Speicher: expo-file-system (`Paths.document/beweise/`).
- Bundle-ID / Android-Paket: `com.raoulstamm.disziplinapp`. Slug `disziplin-app`, Scheme `disziplinapp`.
- `eas.json` mit Kanal `preview` wie NoFap. **Noch kein `eas init` und kein Build** (macht Smutje). Danach in app.json `owner`, `extra.eas.projectId` und `updates.url` ergänzen; `_layout.tsx` sucht beim Start schon nach EAS-Updates.
- Prüfen vor "fertig": `npx tsc --noEmit`, `npx expo install --check` (und `npx expo-doctor`, braucht Internet zu exp.host).
- Web-Test mit Fotos: `npm run web-export` und dann `npm run screenshots` (Playwright, in der Cloud `NODE_PATH=/opt/node22/lib/node_modules`). Spielt den ganzen Ablauf durch (Onboarding, Foto-Beweis ohne Kamera, Lock-in mit Abbrechen und Ende, Fortschritt mit 12-Tage-Testzustand, Löschen), Bilder nach `docs/screenshots/`, meldet Konsolenfehler. Im Web gibt es keine Kamera, keine Haptik und keine Benachrichtigungen.

## Sperrbildschirm-Countdown (Live Activity): vorbereitet, nächster Schritt
- Raoul will den Lock-in-Countdown auf dem Sperrbildschirm (Live-Activity-Code aus Kopfkiste). Im MVP gibt es stattdessen die Benachrichtigung am Ende.
- Code liegt fertig in `vorbereitet/live-activity/LockInAktivitaet.tsx` (von tsc ausgenommen), Einbau-Schritte oben in der Datei. Braucht `expo-widgets`, `@expo/ui`, `NSSupportsLiveActivities` und einen neuen Build. Erst mit dem ersten Build zusammen einbauen und auf dem iPhone testen.

## Offene Punkte
- Name der App, App-Symbol, Startbild (Splash) fehlen.
- `eas init`, Preview-Build, EAS-Update-Kanal (Smutje). Dabei Live Activity einbauen.
- KI-Foto-Prüfung: Supabase-Funktion im Kopfkiste-Projekt mit Claude Haiku, Foto klein rechnen, Tageslimit, nur Zahlende, Einwilligung und Datenschutzerklärung vorher.
- RevenueCat (echte Käufe, Preise, "Wiederherstellen", Bedingungen-Link), Monatspreis bestätigen, Einmal-Angebot beim Schließen der Paywall (ohne Countdown-Druck).
- Datenschutzerklärung, Einwilligung, PostHog (nur mit Einwilligung, einheitliche Eventnamen aus `wissen/werkzeuge.md`, `exercise_completed` z. B. für Foto-Beweis und Lock-in).
- Später: echter Wecker mit Foto-Mission über Apples AlarmKit (iOS 26, prüft Smutje), Widget mit Serie, Notausgang/Nachkontrolle wie Alarmy, Benachrichtigung antippen öffnet direkt den Foto-Beweis.
