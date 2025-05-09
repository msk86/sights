import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n'; // Import to initialize i18n
import { initSpeech } from './src/services/speech'; // Import speech initialization
import { trackAppOpen } from './src/services/analytics';

// Ignore specific warnings that might come from libraries
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered',
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  // Initialize speech service on app startup
  useEffect(() => {
    const setup = async () => {
      try {
        await initSpeech();
        await trackAppOpen();
        console.log('App initialized');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    
    setup();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
