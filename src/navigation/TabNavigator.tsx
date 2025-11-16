import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import MainMenuScreen from '../screens/MainMenuScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import DashboardScreen from '../screens/DashboardScreen';

export type BottomTabParamList = {
  MainMenu: undefined;
  Dashboard: undefined;
  AddProperty: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
          height: 65,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === 'MainMenu') iconName = 'home-outline';
          else if (route.name === 'Dashboard') iconName = 'time-outline';
          else if (route.name === 'AddProperty') iconName = 'add-circle-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00D4FF',
        tabBarInactiveTintColor: '#aaa',
        tabBarLabelStyle: {
          fontFamily: 'Rajdhani_600SemiBold',
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="MainMenu" component={MainMenuScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Zeiten' }} />
      <Tab.Screen name="AddProperty" component={AddPropertyScreen} options={{ title: 'Neue' }} />
    </Tab.Navigator>
  );
}
