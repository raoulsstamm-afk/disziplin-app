import { BottomTabBarProps, Tabs } from 'expo-router/tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { Leuchten, Verlauf } from '@/components/Licht';
import { vibriere } from '@/haptik';
import { farben, LEISTE_HOEHE, MAX_BREITE } from '@/theme';

// Schwebende Leiste unten: Heute, Fokus, Fortschritt und das Zahnrad für Einstellungen

const NAMEN: Record<string, string> = { heute: 'Heute', fokus: 'Fokus', fortschritt: 'Fortschritt', einstellungen: 'Einstellungen' };

function Symbol({ name, farbe }: { name: string; farbe: string }) {
  const s = { stroke: farbe, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const };
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      {name === 'heute' && (
        <>
          <Circle cx={13} cy={13} r={5} fill={farbe} />
          <Circle cx={13} cy={13} r={10} {...s} />
        </>
      )}
      {name === 'fokus' && (
        <>
          <Circle cx={13} cy={14} r={9.5} {...s} />
          <Line x1={13} y1={14} x2={13} y2={9} {...s} />
          <Line x1={13} y1={14} x2={16.5} y2={16} {...s} />
          <Line x1={10} y1={2.5} x2={16} y2={2.5} {...s} />
        </>
      )}
      {name === 'fortschritt' && (
        <>
          <Rect x={3.5} y={15} width={4.5} height={7.5} rx={1.5} {...s} />
          <Rect x={10.75} y={10} width={4.5} height={12.5} rx={1.5} {...s} />
          <Rect x={18} y={4} width={4.5} height={18.5} rx={1.5} fill={farbe} stroke={farbe} strokeWidth={2} />
        </>
      )}
      {name === 'einstellungen' && (
        <>
          <Line x1={4} y1={7} x2={22} y2={7} {...s} />
          <Line x1={4} y1={13} x2={22} y2={13} {...s} />
          <Line x1={4} y1={19} x2={22} y2={19} {...s} />
          <Circle cx={9} cy={7} r={2.6} fill={farben.nachtMitte} {...{ stroke: farbe, strokeWidth: 2 }} />
          <Circle cx={17} cy={13} r={2.6} fill={farben.nachtMitte} {...{ stroke: farbe, strokeWidth: 2 }} />
          <Circle cx={11} cy={19} r={2.6} fill={farben.nachtMitte} {...{ stroke: farbe, strokeWidth: 2 }} />
        </>
      )}
    </Svg>
  );
}

function Leiste({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 10) + 4, alignItems: 'center' }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: MAX_BREITE - 48,
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            height: LEISTE_HOEHE,
            borderRadius: LEISTE_HOEHE / 2,
            flexDirection: 'row',
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: farben.karteRand,
            backgroundColor: '#1A1727',
          }}
        >
          <Verlauf farben={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} quer={false} />
          {state.routes.map((route, index) => {
            const aktiv = state.index === index;
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityLabel={NAMEN[route.name] ?? route.name}
                accessibilityState={{ selected: aktiv }}
                onPress={() => {
                  vibriere('leicht');
                  const ereignis = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!aktiv && !ereignis.defaultPrevented) navigation.navigate(route.name);
                }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
                  {aktiv && <Leuchten ueberstand={4} staerke={0.3} />}
                  <Symbol name={route.name} farbe={aktiv ? farben.blau : farben.textLeise} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(p) => <Leiste {...p} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: farben.nachtMitte } }}
    >
      <Tabs.Screen name="heute" />
      <Tabs.Screen name="fokus" />
      <Tabs.Screen name="fortschritt" />
      <Tabs.Screen name="einstellungen" />
    </Tabs>
  );
}
