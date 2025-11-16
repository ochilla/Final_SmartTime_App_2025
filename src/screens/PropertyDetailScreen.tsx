// ✅ src/screens/PropertyDetailScreen.tsx – neues Design + TopBar
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Property, TimeEntry } from '../types/property';
import { getProperties, updateProperty } from '../storage/propertyStorage';
import { getActiveTimer, setActiveTimer, clearActiveTimer } from '../storage/activeTimer';
import TopBar from '../components/TopBar';

const DetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PropertyDetail'>>();
  const { propertyId } = route.params;

  const [property, setProperty] = useState<Property | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const load = async () => {
      const all = await getProperties();
      const found = all.find(p => p.id === propertyId);
      if (found) {
        if (!found.timeEntries) found.timeEntries = [];
        setProperty(found);
      }

      const active = await getActiveTimer();
      if (active && active.propertyId === propertyId) {
        setIsCheckedIn(true);
        setStartTime(new Date(active.startTime));
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

  if (!property) {
    return (
      <View style={styles.container}>
        <TopBar title="Lädt..." showBack />
        <Text style={styles.loading}>Lade Daten...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title={property.name} showBack />

      <Text style={styles.address}>
        {property.street} {property.houseNumber}, {property.city}
      </Text>

      <Text style={styles.date}>📅 {getToday()}</Text>

      <View style={{ marginVertical: 20 }}>
        {!isCheckedIn ? (
          <Button title="Check-in starten" onPress={handleCheckIn} />
        ) : (
          <Button title="Check-out abschliessen" onPress={handleCheckOut} color="#d9534f" />
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
                {item.date} – Start: {formatTime(item.startTime)}, Ende: {item.endTime ? formatTime(item.endTime) : 'läuft...'}, Dauer: {item.duration !== null ? `${item.duration} Min.` : 'läuft...'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f1f',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  loading: {
    color: '#ccc',
    marginTop: 20,
  },
  address: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 10,
    fontFamily: 'Rajdhani_600SemiBold',
  },
  date: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
    fontFamily: 'Rajdhani_600SemiBold',
  },
  logTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#eee',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  entry: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 6,
  },
  entryText: {
    color: '#ccc',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  noEntries: {
    color: '#999',
    fontStyle: 'italic',
  },
});


