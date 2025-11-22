import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import { getProperties } from '../storage/propertyStorage';
import { Property, TimeEntry } from '../types/property';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const isoToday = () => new Date().toISOString().split('T')[0];

// Woche Mo–So (UTC)
const getWeekBoundsUTC = () => {
  const now = new Date();
  const dowMon0 = (now.getUTCDay() + 6) % 7; // So=0 → Mo=0
  const start = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dowMon0
  ));
  const end = new Date(Date.UTC(
    start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6, 23, 59, 59, 999
  ));
  return { start, end };
};

// Monat (UTC)
const getMonthBoundsUTC = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { start, end };
};

// "YYYY-MM-DD" -> Date(UTC)
const parseISODateUTC = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, day ?? 1));
};

const fmtMin = (min: number) => {
  if (!min || min < 0) return '0 Min';
  if (min < 60) return `${min} Min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} m`;
};

// letzte Aktivität: aktive zuerst, sonst nach letzter endTime/startTime desc
const lastActivityTs = (p: Property): number => {
  if (!Array.isArray(p.timeEntries) || p.timeEntries.length === 0) return 0;
  const open = p.timeEntries.find(e => e.endTime === null);
  if (open) return new Date(open.startTime).getTime();
  return p.timeEntries.reduce((acc, e) => {
    const ts = new Date(e.endTime ?? e.startTime).getTime();
    return ts > acc ? ts : acc;
  }, 0);
};

// Summen je Zeitraum (laufende Einträge nicht zählen)
const calcSums = (
  entries: TimeEntry[] = [],
  today: string,
  w: { start: Date; end: Date },
  m: { start: Date; end: Date }
) => {
  let dayTotal = 0;
  let weekTotal = 0;
  let monthTotal = 0;
  for (const e of entries) {
    if (e.duration === null) continue; // aktiv -> nicht zählen
    if (e.date === today) dayTotal += e.duration;
    if (e.date) {
      const d = parseISODateUTC(e.date);
      if (d >= w.start && d <= w.end) weekTotal += e.duration;
      if (d >= m.start && d <= m.end) monthTotal += e.duration;
    }
  }
  return { dayTotal, weekTotal, monthTotal };
};

export default function MainMenuScreen() {
  const [properties, setProperties] = useState<Property[]>([]);
  const navigation = useNavigation<Nav>();

  const today = useMemo(isoToday, []);
  const week = useMemo(getWeekBoundsUTC, []);
  const month = useMemo(getMonthBoundsUTC, []);

  useEffect(() => {
    const load = async () => {
      const loaded = await getProperties();
      const normalized = loaded.map(p => ({
        ...p,
        timeEntries: Array.isArray(p.timeEntries) ? p.timeEntries : [],
      }));
      normalized.sort((a, b) => {
        // aktive zuerst
        const aActive = a.timeEntries.some(e => e.endTime === null);
        const bActive = b.timeEntries.some(e => e.endTime === null);
        if (aActive !== bActive) return aActive ? -1 : 1;
        // dann nach letzter Aktivität
        return lastActivityTs(b) - lastActivityTs(a);
      });
      setProperties(normalized);
    };
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, [navigation]);

  const renderItem = ({ item }: { item: Property }) => {
    const isActive = item.timeEntries.some(e => e.endTime === null);
    const { dayTotal, weekTotal, monthTotal } = calcSums(item.timeEntries, today, week, month);

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
        accessibilityLabel={`Liegenschaft ${item.name} öffnen`}
      >
        {/* Ampel */}
        <View style={styles.trafficWrap}>
          <View style={[
            styles.trafficDot,
            { backgroundColor: isActive ? '#22c55e' : '#9ca3af' }
          ]} />
        </View>

        {/* Titel & Adresse */}
        <View style={styles.info}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>
            {item.street} {item.houseNumber}, {item.city}
          </Text>
          {/* Summen kompakt in einer Zeile */}
          <View style={styles.sumsRow}>
            <View style={styles.sumChip}>
              <Ionicons name="sunny-outline" size={14} color="#7a8a9c" />
              <Text style={styles.sumText}>Heute</Text>
              <Text style={styles.sumVal}>{fmtMin(dayTotal)}</Text>
            </View>
            <View style={styles.sumChip}>
              <Ionicons name="calendar-outline" size={14} color="#7a8a9c" />
              <Text style={styles.sumText}>Woche</Text>
              <Text style={styles.sumVal}>{fmtMin(weekTotal)}</Text>
            </View>
            <View style={styles.sumChip}>
              <Ionicons name="calendar-number-outline" size={14} color="#7a8a9c" />
              <Text style={styles.sumText}>Monat</Text>
              <Text style={styles.sumVal}>{fmtMin(monthTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <TopBar title="Monitoring" />

      <View style={styles.content}>
        {properties.length === 0 ? (
          <Text style={styles.empty}>Keine Liegenschaften erfasst.</Text>
        ) : (
          <FlatList
            data={properties}
            keyExtractor={(p) => p.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listPad}
          />
        )}
      </View>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1 },
  listPad: { paddingVertical: 8 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderColor: '#e6e6e6',
    borderBottomWidth: 1,
  },

  separator: { height: 0 },

  trafficWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trafficDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  info: { flex: 1 },
  title: {
    fontSize: 16,
    color: '#0f1c2e',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#687385',
    fontFamily: 'Rajdhani_400Regular',
    marginTop: 1,
  },

  sumsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  sumChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f7f8fa',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  sumText: {
    fontSize: 12,
    color: '#7a8a9c',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  sumVal: {
    fontSize: 13,
    color: '#0f1c2e',
    fontFamily: 'Rajdhani_600SemiBold',
  },

  empty: {
    fontStyle: 'italic',
    color: '#555',
    padding: 20,
    fontFamily: 'Rajdhani_400Regular',
  },
});





