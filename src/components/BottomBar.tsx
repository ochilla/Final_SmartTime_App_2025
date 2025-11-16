// ✅ src/components/BottomBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BottomBar() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const currentRoute = route.name;

  const goTo = (screen: keyof RootStackParamList) => {
    if (currentRoute !== screen) {
      navigation.navigate(screen as any);
    }
  };

  const isActive = (screen: keyof RootStackParamList) => currentRoute === screen;

  return (
    <View style={styles.container}>
      {/* Links: Home */}
      <TouchableOpacity style={styles.tab} onPress={() => goTo('MainMenu')}>
        <Ionicons
          name="home-outline"
          size={24}
          color={isActive('MainMenu') ? '#00D4FF' : '#7a8a9c'}
        />
        <Text style={[styles.label, isActive('MainMenu') && styles.labelActive]}>Home</Text>
      </TouchableOpacity>

      {/* Mitte: Zeiten / Dashboard */}
      <TouchableOpacity style={styles.centerTab} onPress={() => goTo('Dashboard')}>
        <View style={styles.centerButton}>
          <Ionicons name="time-outline" size={26} color="#0f1c2e" />
        </View>
        <Text style={styles.labelCenter}>Zeiten</Text>
      </TouchableOpacity>

      {/* Rechts: Neue Liegenschaft */}
      <TouchableOpacity style={styles.tab} onPress={() => goTo('AddProperty')}>
        <Ionicons
          name="add-circle-outline"
          size={24}
          color={isActive('AddProperty') ? '#00D4FF' : '#7a8a9c'}
        />
        <Text style={[styles.label, isActive('AddProperty') && styles.labelActive]}>Neue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f1c2e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 14,
    width: '100%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerButton: {
    backgroundColor: '#00D4FF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#7a8a9c',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  labelActive: {
    color: '#00D4FF',
  },
  labelCenter: {
    fontSize: 12,
    color: '#00D4FF',
    fontFamily: 'Rajdhani_600SemiBold',
  },
});
