import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { farben } from '@/theme';

// Fortschrittsring für den Lock-in-Countdown (Verlauf Violett zu Blau)
export function Ring({ anteil, groesse = 280, dicke = 14, children }: { anteil: number; groesse?: number; dicke?: number; children?: React.ReactNode }) {
  const r = (groesse - dicke) / 2;
  const umfang = 2 * Math.PI * r;
  const a = Math.max(0, Math.min(1, anteil));
  return (
    <View style={{ width: groesse, height: groesse, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={groesse} height={groesse} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="ringVerlauf" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={farben.blau} />
            <Stop offset="1" stopColor={farben.violett} />
          </LinearGradient>
        </Defs>
        <Circle cx={groesse / 2} cy={groesse / 2} r={r} stroke={farben.spur} strokeWidth={dicke} fill="none" />
        <Circle
          cx={groesse / 2}
          cy={groesse / 2}
          r={r}
          stroke="url(#ringVerlauf)"
          strokeWidth={dicke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${umfang} ${umfang}`}
          strokeDashoffset={umfang * (1 - a)}
          transform={`rotate(-90 ${groesse / 2} ${groesse / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
