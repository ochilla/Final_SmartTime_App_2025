// ✅ src/screens/AddPropertyScreen.tsx – im neuen Design
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
      Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
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
    <View style={styles.container}>
      <TopBar title="Neue Liegenschaft" showBack />

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
            🏠 {item.name}, {item.street} {item.houseNumber}, {item.city}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f1f',
    paddingHorizontal: 20,
  },
  form: {
    marginTop: 20,
    marginBottom: 30,
    gap: 10,
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
  },
  button: {
    backgroundColor: '#00D4FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#0c0f1f',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ccc',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  propertyItem: {
    color: '#eee',
    paddingVertical: 4,
  },
});



