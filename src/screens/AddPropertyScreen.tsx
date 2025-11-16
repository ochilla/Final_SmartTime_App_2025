// ✅ src/screens/AddPropertyScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';

interface Property {
  id: string;
  name: string;
  street: string;
  houseNumber: string;
  city: string;
}

const STORAGE_KEY = 'SMARTIME_PROPERTIES';

export default function AddPropertyScreen() {
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [city, setCity] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);

  const formValid = useMemo(() => {
    return name.trim() && street.trim() && houseNumber.trim() && city.trim();
  }, [name, street, houseNumber, city]);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      setProperties(JSON.parse(json));
    }
  };

  const saveProperty = async () => {
    if (!formValid) {
      Alert.alert('Fehler', 'Bitte alle Felder ausfuellen.');
      return;
    }

    const newProperty: Property = {
      id: Date.now().toString(),
      name,
      street,
      houseNumber,
      city,
    };

    const updatedProperties = [...properties, newProperty];
    setProperties(updatedProperties);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProperties));

    setName('');
    setStreet('');
    setHouseNumber('');
    setCity('');
  };

  return (
    <View style={styles.screen}>
      <TopBar title="Neue Liegenschaft" showBack />

      <View style={styles.content}>
        <View style={styles.form}>
          <TextInput
            placeholder="Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Strasse"
            placeholderTextColor="#999"
            value={street}
            onChangeText={setStreet}
            style={styles.input}
          />
          <TextInput
            placeholder="Hausnummer"
            placeholderTextColor="#999"
            value={houseNumber}
            onChangeText={setHouseNumber}
            style={styles.input}
          />
          <TextInput
            placeholder="Ort"
            placeholderTextColor="#999"
            value={city}
            onChangeText={setCity}
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.button, { opacity: formValid ? 1 : 0.5 }]}
            onPress={saveProperty}
            disabled={!formValid}
          >
            <Text style={styles.buttonText}>Speichern</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Erfasste Liegenschaften:</Text>
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <Text style={styles.propertyItem}>
              {item.name}, {item.street} {item.houseNumber}, {item.city}
            </Text>
          )}
        />
      </View>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  form: {
    marginBottom: 30,
    gap: 10,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    color: '#0f1c2e',
    fontFamily: 'Rajdhani_400Regular',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  button: {
    backgroundColor: '#00D4FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#0f1c2e',
    fontWeight: 'bold',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  subtitle: {
    color: '#0f1c2e',
    marginBottom: 10,
    fontWeight: 'bold',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  propertyItem: {
    color: '#333',
    paddingVertical: 4,
    fontFamily: 'Rajdhani_400Regular',
  },
});





