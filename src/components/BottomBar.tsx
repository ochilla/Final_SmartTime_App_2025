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
  const onDashboard = isActive('Dashboard');

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
        <View
          style={[
            styles.centerButton,
            onDashboard ? styles.centerButtonActive : styles.centerButtonInactive,
          ]}
        >
          <Ionicons
            name="time-outline"
            size={26}
            color={onDashboard ? '#0f1c2e' : '#7a8a9c'}
          />
        </View>
        <Text style={[styles.label, onDashboard ? styles.labelActive : styles.labelInactive]}>
          Zeiten
        </Text>
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  centerButtonActive: {
    backgroundColor: '#00D4FF',
    borderWidth: 0,
  },
  centerButtonInactive: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7a8a9c',
  },
  label: {
    fontSize: 12,
    fontFamily: 'Rajdhani_600SemiBold',
    color: '#7a8a9c',
  },
  labelActive: {
    color: '#00D4FF',
  },
  labelInactive: {
    color: '#7a8a9c',
  },
});

