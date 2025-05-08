import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  HAS_COMPLETED_TUTORIAL: 'HAS_COMPLETED_TUTORIAL',
  USER_PREFERENCES: 'USER_PREFERENCES'
};

// Get a value from storage
export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error getting item ${key} from storage:`, error);
    return null;
  }
};

// Set a value in storage
export const setItem = async (key: string, value: any): Promise<boolean> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error setting item ${key} in storage:`, error);
    return false;
  }
};

// Check if user has completed the tutorial
export const hasTutorialBeenCompleted = async (): Promise<boolean> => {
  const hasCompleted = await getItem<boolean>(STORAGE_KEYS.HAS_COMPLETED_TUTORIAL);
  return hasCompleted === true;
};

// Mark the tutorial as completed
export const markTutorialAsCompleted = async (): Promise<void> => {
  await setItem(STORAGE_KEYS.HAS_COMPLETED_TUTORIAL, true);
};

// Reset the tutorial (for testing)
export const resetTutorial = async (): Promise<void> => {
  await setItem(STORAGE_KEYS.HAS_COMPLETED_TUTORIAL, false);
}; 