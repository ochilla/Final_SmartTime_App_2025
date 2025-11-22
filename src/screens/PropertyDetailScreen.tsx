import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Property, TimeEntry } from '../types/property';
import { getProperties, updateProperty } from '../storage/propertyStorage';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';

const DetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PropertyDetail'>>();
  const navigation = useNavigation<any>();
  const { propertyId } = route.params;

  const [property, setProperty] = useState<Property | null>(null);

  // Hilfen: offener Eintrag (endTime == null) erkennen
  const openEntryIndex = useMemo(() => {
    if (!property?.timeEntries?.length) return -1;
    return property.timeEntries.findIndex(e => e.endTime === null);
  }, [property]);

  const isCheckedIn = openEntryIndex !== -1;

  useEffect(() => {
    const load = async () => {
      const all = await getProperties();
      const found = all.find((p) => p.id === propertyId) || null;
      if (found && !found.timeEntries) found.timeEntries = [];
      setProperty(found);
    };

    const unsubscribe = navigation.addListener('focus', load);
    load();
    return unsubscribe;
  }, [navigation, propertyId]);

  const todayISO = () => new Date().toISOString().split('T')[0];

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} Uhr`;
    // Hinweis: Für echte Lokalisierung später Intl.DateTimeFormat nutzen
  };

  const handleCheckIn = async () => {
    if (!property) return;

    // Verhindere doppelte Check-ins in DERSELBEN Liegenschaft
    if (isCheckedIn) {
      Alert.alert('Bereits aktiv', 'Für diese Liegenschaft läuft bereits eine Zeiterfassung.');
      return;
    }

    const start = new Date();
    const newActive: TimeEntry = {
      startTime: start.toISOString(),
      endTime: null,         // <- aktiv
      duration: null,        // <- aktiv
      date: todayISO(),
    };

    const updated: Property = {
      ...property,
      timeEntries: [newActive, ...(property.timeEntries || [])],
    };

    await updateProperty(updated);
    setProperty(updated);
  };

  const handleCheckOut = async () => {
    if (!property) return;
    if (!isCheckedIn) return;

    const end = new Date();
    const entries = [...property.timeEntries];
    const open = entries[openEntryIndex];

    // Dauer berechnen
    const start = new Date(open.startTime);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    entries[openEntryIndex] = {
      ...open,
      endTime: end.toISOString(),
      duration,
      // date bleibt das Start-Datum
    };

    const updated: Property = { ...property, timeEntries: entries };
    await updateProperty(updated);
    setProperty(updated);
  };

  if (!property) {
    return (
      <View style={styles.screen}>
        <TopBar title="Lädt..." showBack />
        <View style={styles.content}>
          <Text style={styles.loading}>Lade Daten...</Text>
        </View>
        <BottomBar />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TopBar title={property.name} showBack />

      <View style={styles.content}>
        <Text style={styles.address}>
          {property.street} {property.houseNumber}, {property.city}
        </Text>

        <Text style={styles.date}>📅 {todayISO()}</Text>

        <View style={styles.buttonRow}>
          {!isCheckedIn ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.checkInButton]}
              onPress={handleCheckIn}
            >
              <Text style={styles.actionButtonText}>Check-in starten</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.checkOutButton]}
              onPress={handleCheckOut}
            >
              <Text style={styles.actionButtonText}>Check-out abschliessen</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.logTitle}>Zeiteinträge</Text>
        {property.timeEntries.length === 0 ? (
          <Text style={styles.noEntries}>Noch keine Einträge vorhanden.</Text>
        ) : (
          <FlatList
            data={[...property.timeEntries].sort((a, b) => b.startTime.localeCompare(a.startTime))}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.entry}>
                <Text style={styles.entryText}>
                  {item.date} – Start: {fmtTime(item.startTime)}, Ende:{' '}
                  {item.endTime ? fmtTime(item.endTime) : 'läuft...'}, Dauer:{' '}
                  {item.duration !== null ? `${item.duration} Min.` : 'läuft...'}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      <BottomBar />
    </View>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  loading: { color: '#555', marginTop: 20, fontFamily: 'Rajdhani_400Regular' },
  address: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Rajdhani_600SemiBold',
  },
  date: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    fontFamily: 'Rajdhani_600SemiBold',
  },
  buttonRow: { marginVertical: 10 },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButton: { backgroundColor: '#00D4FF' },
  checkOutButton: { backgroundColor: '#d9534f' },
  actionButtonText: {
    color: '#0f1c2e',
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 16,
  },
  logTitle: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#0f1c2e',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  entry: { borderBottomWidth: 1, borderBottomColor: '#ddd', paddingVertical: 6 },
  entryText: { color: '#333', fontFamily: 'Rajdhani_400Regular' },
  noEntries: { color: '#777', fontStyle: 'italic', fontFamily: 'Rajdhani_400Regular' },
});








