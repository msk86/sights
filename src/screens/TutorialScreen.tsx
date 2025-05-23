import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { speakText, stopSpeech } from '../services/speech';
import { markTutorialAsCompleted } from '../services/storage';
import i18n from '../i18n';

type TutorialScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Tutorial'>;
};

const TutorialScreen: React.FC<TutorialScreenProps> = ({ navigation }) => {
  const [tutorialStep, setTutorialStep] = useState(0);
  
  const tutorialSteps = [
    i18n.t('tutorial.welcome'),
    i18n.t('tutorial.takePhoto'),
    i18n.t('tutorial.autoRead'),
    i18n.t('tutorial.adjustSpeed'),
    i18n.t('tutorial.retake'),
  ];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      stopSpeech();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);
  
  useEffect(() => {
    // Speak the current tutorial step
    speakText(tutorialSteps[tutorialStep]);
    
    // Clean up speech when component unmounts
    return () => {
      stopSpeech();
    };
  }, [tutorialStep]);
  
  const handleAdvanceTutorial = async () => {
    console.log('Tutorial tap detected');
    // Stop the current speech
    stopSpeech();
    // Move to the next step or navigate to camera if tutorial is complete
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      // Mark tutorial as completed
      await markTutorialAsCompleted();
      // Navigate to camera screen
      navigation.replace('Camera');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Pressable
        style={styles.touchArea}
        onPress={handleAdvanceTutorial}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>{i18n.t('common.appName')}</Text>
          <Text style={styles.step}>
            {i18n.t('tutorial.step', { step: tutorialStep + 1, total: tutorialSteps.length })}
          </Text>
          <Text style={styles.instruction}>{tutorialSteps[tutorialStep]}</Text>
          <Text style={styles.hint}>{i18n.t('tutorial.tapToContinue')}</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E',
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  heading: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  step: {
    fontSize: 18,
    color: '#CCD1D1',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 40,
  },
  hint: {
    fontSize: 16,
    color: '#A0A0A0',
    position: 'absolute',
    bottom: -100,
  },
});

export default TutorialScreen; 