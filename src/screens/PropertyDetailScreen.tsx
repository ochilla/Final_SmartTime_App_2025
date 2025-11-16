// ✅ src/screens/PropertyDetailScreen.tsx – Löschen-Button + 1 aktiver Timer global
import React, { useEffect, useState } from 'react';
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
import { getProperties, updateProperty, deleteProperty } from '../storage/propertyStorage';
import { getActiveTimer, setActiveTimer, clearActiveTimer } from '../storage/activeTimer';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';

const DetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PropertyDetail'>>();
  const navigation = useNavigation<any>();
  const { propertyId } = route.params;

  const [property, setProperty] = useState<Property | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const load = async () => {
      const all = await getProperties();
      const found = all.find((p) => p.id === propertyId);
      if (found) {
        if (!found.timeEntries) found.timeEntries = [];
        setProperty(found);
      }

      const active = await getActiveTimer();
      if (active && active.propertyId === propertyId) {
        setIsCheckedIn(true);
        setStartTime(new Date(active.startTime));
      } else {
        setIsCheckedIn(false);
        setStartTime(null);
      }
    };
    load();
  }, [propertyId]);

  const getToday = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} Uhr`;
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const handleCheckIn = async () => {
    const existing = await getActiveTimer();
    if (existing && existing.propertyId !== propertyId) {
      Alert.alert(
        'Aktiver Timer vorhanden',
        'Es laeuft bereits eine Zeiterfassung bei einer anderen Liegenschaft. Bitte zuerst dort Check-out ausfuehren.'
      );
      return;
    }
    if (existing && existing.propertyId === propertyId) {
      setIsCheckedIn(true);
      setStartTime(new Date(existing.startTime));
      return;
    }

    const now = new Date();
    setStartTime(now);
    setIsCheckedIn(true);
    await setActiveTimer({ propertyId, startTime: now.toISOString() });
  };

  const handleCheckOut = async () => {
    if (!startTime || !property) return;

    const end = new Date();
    const duration = Math.round((end.getTime() - startTime.getTime()) / 60000);

    const newEntry: TimeEntry = {
      startTime: startTime.toISOString(),
      endTime: end.toISOString(),
      duration,
      date: formatDate(startTime),
    };

    const updated: Property = {
      ...property,
      timeEntries: [newEntry, ...property.timeEntries],
    };

    await updateProperty(updated);
    await clearActiveTimer();

    setProperty(updated);
    setStartTime(null);
    setIsCheckedIn(false);
  };

  const confirmDeleteProperty = () => {
    if (!property) return;
    Alert.alert(
      'Liegenschaft löschen',
      `„${property.name}“ wirklich löschen? Alle zugehörigen Zeiteintraege bleiben **nicht** erhalten (sie werden mit der Liegenschaft entfernt).`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            // aktiven Timer ggf. räumen
            const active = await getActiveTimer();
            if (active && active.propertyId === property.id) {
              await clearActiveTimer();
            }
            await deleteProperty(property.id);
            // zurück zur Übersicht
            navigation.navigate('Dashboard');
          },
        },
      ]
    );
  };

  if (!property) {
    return (
      <View style={styles.screen}>
        <TopBar title="Laedt..." showBack />
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

        <Text style={styles.date}>📅 {getToday()}</Text>

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

        <Text style={styles.logTitle}>Zeiteintraege</Text>
        {property.timeEntries.length === 0 ? (
          <Text style={styles.noEntries}>Noch keine Eintraege vorhanden.</Text>
        ) : (
          <FlatList
            data={[...property.timeEntries].sort((a, b) => b.startTime.localeCompare(a.startTime))}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.entry}>
                <Text style={styles.entryText}>
                  {item.date} – Start: {formatTime(item.startTime)}, Ende:{' '}
                  {item.endTime ? formatTime(item.endTime) : 'laeuft...'}, Dauer:{' '}
                  {item.duration !== null ? `${item.duration} Min.` : 'laeuft...'}
                </Text>
              </View>
            )}
          />
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={confirmDeleteProperty}
        >
          <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Liegenschaft löschen</Text>
        </TouchableOpacity>
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
  deleteButton: {
    backgroundColor: '#b02a2a',
    marginTop: 20,
  },
});




