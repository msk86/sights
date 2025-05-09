import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator, GestureResponderEvent, Modal, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { analyzeImage } from '../services/openai';
import { speakText, stopSpeech, setSpeechRate, getSpeechRate, getMaxSpeechRate, initSpeech } from '../services/speech';
import { useGestures } from '../hooks/useGestures';
import i18n from '../i18n';

type ResultScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

const ResultScreen: React.FC<ResultScreenProps> = ({ navigation, route }) => {
  const { imageUri, description: initialDescription } = route.params;
  const [description, setDescription] = useState<string | null>(initialDescription || null);
  const [isLoading, setIsLoading] = useState(initialDescription ? false : true);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [currentRate, setCurrentRate] = useState(getSpeechRate());
  const [isStopped, setIsStopped] = useState(false);
  const { controls, panResponder, setRate } = useGestures();
  const hasSpokenRef = useRef(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const maxRate = getMaxSpeechRate();
  const speedOptions = [
    { value: 0.5 },
    { value: 1.0 },
    { value: (1.0 + maxRate) / 2 },
    { value: maxRate },
  ];

  // Initialize speech service and load saved rate
  useEffect(() => {
    const initializeSpeech = async () => {
      await initSpeech();
      setCurrentRate(getSpeechRate());
    };
    
    initializeSpeech();
  }, []);

  // Analyze the image when component mounts if no description provided
  useEffect(() => {
    if (!initialDescription) {
      analyzeImageAndSpeak();
    } else {
      // If we already have a description, just speak it
      setIsStopped(false);
      speakText(initialDescription);
      hasSpokenRef.current = true;
    }

    // Clean up speech when component unmounts
    return () => {
      stopSpeech();
    };
  }, [initialDescription]);

  // Update speech rate when controls change
  useEffect(() => {
    if (controls.rate !== currentRate) {
      setCurrentRate(controls.rate);
      setSpeechRate(controls.rate);
      
      // If we already have a description and have spoken before,
      // restart reading from the beginning with the new speed
      if (description && hasSpokenRef.current) {
        // Small delay to allow the rate to be updated first
        setTimeout(() => {
          setIsStopped(false);
          speakText(description);
        }, 50);
      }
    }
  }, [controls.rate, description]);

  const analyzeImageAndSpeak = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeImage(imageUri);
      setDescription(result);
      setIsStopped(false);
      speakText(result);
      hasSpokenRef.current = true;
    } catch (error) {
      console.error('Error analyzing image:', error);
      const errorMessage = i18n.t('result.errorAnalyzing');
      setDescription(errorMessage);
      setIsStopped(false);
      speakText(errorMessage);
      hasSpokenRef.current = true;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTap = async (event: GestureResponderEvent) => {
    // Disable double-tap during loading
    if (isLoading) return;
    
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastTapTime;
    
    // Detect double tap (within 300ms)
    if (timeDiff < 300) {
      // Double tap detected, navigate back to camera
      stopSpeech();
      navigation.navigate('Camera');
    } else {
      // Single tap - stop reading
      if (description && hasSpokenRef.current) {
        await stopSpeech();
        setIsStopped(true);
      }
    }
    
    setLastTapTime(currentTime);
  };

  const handleSpeedSelect = (rate: number) => {
    setShowSpeedModal(false);
    setCurrentRate(rate);
    setRate(rate);
    setIsStopped(false);
    if (description && hasSpokenRef.current) {
      speakText(description);
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar style="light" />
      
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>
      
      <TouchableOpacity 
        style={styles.contentContainer}
        onPress={handleTap}
        activeOpacity={0.9}
        disabled={isLoading} // Disable touch during loading
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>{i18n.t('result.analyzing')}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.heading}>{i18n.t('result.imageDescription')}</Text>
            <Text style={styles.description}>{description}</Text>
            <Text style={styles.hint}>{i18n.t('result.doubleTapRetake')}</Text>
            
            <View style={styles.controlsInfo}>
              {isStopped && (
                <Text style={styles.stoppedText}>{i18n.t('result.paused')}</Text>
              )}
            </View>
          </>
        )}
      </TouchableOpacity>
      {/* Floating Speed Button */}
      <TouchableOpacity
        style={styles.speedButton}
        onPress={() => setShowSpeedModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.speedButtonText}>{`${i18n.t('result.speed', { value: currentRate.toFixed(1)})}`}</Text>
      </TouchableOpacity>
      {/* Speed Selection Modal */}
      <Modal
        visible={showSpeedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSpeedModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSpeedModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Reading Speed</Text>
            {speedOptions.map(opt => (
              <TouchableOpacity
                key={i18n.t('result.speed', { value: opt.value })}
                style={styles.speedOption}
                onPress={() => handleSpeedSelect(opt.value)}
              >
                <Text style={styles.speedOptionText}>{`${i18n.t('result.speed', { value: opt.value })}`}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  hint: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  controlsInfo: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  controlText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  stoppedText: {
    color: '#F0AD4E',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  speedButton: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    backgroundColor: '#222',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  speedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    minWidth: 240,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  speedOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#f0f0f0',
    width: '100%',
    alignItems: 'center',
  },
  speedOptionText: {
    fontSize: 16,
    color: '#222',
  },
});

export default ResultScreen; 