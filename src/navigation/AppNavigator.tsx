import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

// Import screens
import TutorialScreen from '../screens/TutorialScreen';
import CameraScreen from '../screens/CameraScreen';
import ResultScreen from '../screens/ResultScreen';

// Import storage utilities
import { hasTutorialBeenCompleted } from '../services/storage';

// Define types for stack navigation
export type RootStackParamList = {
  Tutorial: undefined;
  Camera: undefined;
  Result: { imageUri: string; description?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const hasCompleted = await hasTutorialBeenCompleted();
        setHasCompletedTutorial(hasCompleted);
      } catch (error) {
        console.error('Error checking tutorial status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTutorialStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E2E' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasCompletedTutorial ? "Camera" : "Tutorial"}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Disable swipe gestures for accessibility
          animation: 'fade' // Smoother transitions
        }}
      >
        <Stack.Screen name="Tutorial" component={TutorialScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 