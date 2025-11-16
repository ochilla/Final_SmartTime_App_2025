// src/storage/propertyStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Property } from '../types/property';

const STORAGE_KEY = 'SMARTIME_PROPERTIES';

export const getProperties = async (): Promise<Property[]> => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const saveProperties = async (properties: Property[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
};

export const addProperty = async (property: Property): Promise<void> => {
  const properties = await getProperties();
  properties.push(property);
  await saveProperties(properties);
};

export const updateProperty = async (updated: Property): Promise<void> => {
  const properties = await getProperties();
  const index = properties.findIndex(p => p.id === updated.id);
  if (index !== -1) {
    properties[index] = updated;
    await saveProperties(properties);
  }
};

export const deleteProperty = async (propertyId: string): Promise<void> => {
  const properties = await getProperties();
  const filtered = properties.filter(p => p.id !== propertyId);
  await saveProperties(filtered);
};

export const clearProperties = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

