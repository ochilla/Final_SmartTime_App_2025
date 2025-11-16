// ✅ src/screens/MainMenuScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function MainMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.screen}>
      <TopBar title="Smartime" />

      <View style={styles.content}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Card 1 */}
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="business" size={30} color="white" />
            </View>
            <Text style={styles.title}>Liegenschaften</Text>
            <Text style={styles.subtitle}>Erfassen</Text>
            <Text style={styles.description}>
              Verwalten Sie Ihre Immobilien und Standorte
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('AddProperty')}
            >
              <Text style={styles.buttonText}>Oeffnen</Text>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Card 2 */}
          <View style={[styles.card, styles.cardAlt]}>
            <View style={styles.iconContainerAlt}>
              <Ionicons name="time" size={30} color="white" />
            </View>
            <Text style={styles.title}>Zeiterfassung</Text>
            <Text style={styles.subtitle}>Dashboard</Text>
            <Text style={styles.description}>
              Uebersicht aller Zeiten und Liegenschaften
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.buttonText}>Oeffnen</Text>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    paddingTop: 16,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  card: {
    width: screenWidth * 0.85,
    backgroundColor: '#083c55',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAlt: {
    backgroundColor: '#431f47',
  },
  iconContainer: {
    backgroundColor: '#00d4ff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  iconContainerAlt: {
    backgroundColor: '#9d4edd',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Rajdhani_600SemiBold',
  },
  description: {
    fontSize: 13,
    color: '#d4d4d4',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Rajdhani_400Regular',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00d4ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 6,
    fontFamily: 'Rajdhani_600SemiBold',
  },
});


