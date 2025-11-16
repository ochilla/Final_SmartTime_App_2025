import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_TIMER_KEY = 'SMARTIME_ACTIVE_TIMER';

export interface ActiveTimer {
  propertyId: string;
  startTime: string; // ISO
}

export const getActiveTimer = async (): Promise<ActiveTimer | null> => {
  const json = await AsyncStorage.getItem(ACTIVE_TIMER_KEY);
  return json ? JSON.parse(json) : null;
};

export const setActiveTimer = async (timer: ActiveTimer): Promise<void> => {
  await AsyncStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(timer));
};

export const clearActiveTimer = async (): Promise<void> => {
  await AsyncStorage.removeItem(ACTIVE_TIMER_KEY);
};