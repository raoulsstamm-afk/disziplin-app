// Nur die genutzten Schnitte laden (sonst landen alle 18 Schriftdateien in der App)
import { InterTight_400Regular } from '@expo-google-fonts/inter-tight/400Regular';
import { InterTight_500Medium } from '@expo-google-fonts/inter-tight/500Medium';
import { InterTight_600SemiBold } from '@expo-google-fonts/inter-tight/600SemiBold';
import { InterTight_700Bold } from '@expo-google-fonts/inter-tight/700Bold';
import { InterTight_800ExtraBold } from '@expo-google-fonts/inter-tight/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from '@/state/store';
import { farben } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Test-App: beim Start nach neuem Stand suchen, solange der Startbildschirm zu sehen ist (wie bei Kopfkiste).
// Neu geladen wird nur, wenn das in den ersten Sekunden klappt, sonst gilt der neue Stand beim nächsten Öffnen.
const UPDATE_WARTEZEIT = 3000;
let updateFertig: () => void = () => {};
const updatePruefung = new Promise<void>((fertig) => {
  updateFertig = fertig;
  setTimeout(fertig, UPDATE_WARTEZEIT);
});
async function neuesUpdateLaden() {
  const start = Date.now();
  try {
    if (__DEV__ || !Updates.isEnabled) return;
    const pruefung = await Updates.checkForUpdateAsync();
    if (!pruefung.isAvailable) return;
    await Updates.fetchUpdateAsync();
    if (Date.now() - start < UPDATE_WARTEZEIT) await Updates.reloadAsync();
  } catch {
    // ohne Internet einfach mit dem gespeicherten Stand weitermachen
  } finally {
    updateFertig();
  }
}
neuesUpdateLaden();

function Inhalt() {
  const { geladen } = useStore();
  const [fontsDa] = useFonts({ InterTight_400Regular, InterTight_500Medium, InterTight_600SemiBold, InterTight_700Bold, InterTight_800ExtraBold });
  const [updateGeprueft, setUpdateGeprueft] = useState(false);
  useEffect(() => {
    updatePruefung.then(() => setUpdateGeprueft(true));
  }, []);
  const bereit = geladen && fontsDa && updateGeprueft;

  useEffect(() => {
    if (bereit) SplashScreen.hideAsync().catch(() => {});
  }, [bereit]);

  if (!bereit) return null;
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: farben.nachtMitte } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="beweis" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="lockin" options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Inhalt />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
