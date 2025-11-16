// ✅ src/components/TopBar.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

export default function TopBar({ title = 'Smartime', showBack = false }: TopBarProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/back-icon.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : (
        <Image
          source={require('../../assets/smartime-icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      )}

      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0f1c2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Rajdhani_600SemiBold',
    color: '#00D4FF',
    textAlign: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#00D4FF',
  },
});



