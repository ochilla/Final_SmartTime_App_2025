import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainMenuScreen from '../screens/MainMenuScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';

export type RootStackParamList = {
  MainMenu: undefined;
  Dashboard: undefined;
  AddProperty: undefined;
  PropertyDetail: { propertyId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{ headerShown: false }} // Deaktiviert Standard-Header für alle Screens
      >
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



