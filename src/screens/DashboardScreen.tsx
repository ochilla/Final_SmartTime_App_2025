// ✅ src/screens/DashboardScreen.tsx – jetzt mit vertikalen Cards
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getProperties } from '../storage/propertyStorage';
import { Property } from '../types/property';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import TopBar from '../components/TopBar';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const [properties, setProperties] = useState<Property[]>([]);
  const navigation = useNavigation<DashboardNavigationProp>();

  useEffect(() => {
    const loadData = async () => {
      const loaded = await getProperties();
      setProperties(loaded);
    };
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <TopBar title="Liegenschaften" showBack />
      {properties.length === 0 ? (
        <Text style={styles.empty}>Keine Liegenschaften erfasst.</Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {properties.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.iconContainer}>
                <Ionicons name="home" size={30} color="white" />
              </View>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.subtitle}>{item.street} {item.houseNumber}</Text>
              <Text style={styles.subtitle}>{item.city}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
              >
                <Text style={styles.buttonText}>Öffnen</Text>
                <Ionicons name="chevron-forward" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f1f',
  },
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#404040',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: '#00d4ff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 15,
    color: '#ccc',
    marginTop: 2,
    marginBottom: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00d4ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 6,
  },
  empty: {
    fontStyle: 'italic',
    color: '#aaa',
    padding: 20,
  },
});








