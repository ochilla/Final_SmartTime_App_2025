// App.tsx
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts, Rajdhani_600SemiBold, Rajdhani_400Regular } from '@expo-google-fonts/rajdhani';
import { Text, View } from 'react-native';

export default function App() {
  const [fontsLoaded] = useFonts({
    Rajdhani_600SemiBold,
    Rajdhani_400Regular,
  });

  if (!fontsLoaded) {
    return <View><Text>Lade Fonts...</Text></View>;
  }

  return <AppNavigator />;
}


