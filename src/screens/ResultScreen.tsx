import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator, GestureResponderEvent, Modal, Pressable, Switch, BackHandler, Platform, TouchableWithoutFeedback, Linking, AccessibilityInfo } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { analyzeImage } from '../services/imageAnalysis';
import { speakText, stopSpeech, setSpeechRate, getMaxSpeechRate, initSpeech } from '../services/speech';
import { useGestures } from '../hooks/useGestures';
import i18n from '../i18n';
import { isChineseLocale } from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackAutoReadPreference, trackDonateClick, trackSpeedPreference, trackDoubleTapRetake, trackFeedbackClick } from '../services/analytics';

// --- Types ---
type ResultScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

const AUTO_READ_KEY = 'AUTO_READ_ENABLED';

const ResultScreen: React.FC<ResultScreenProps> = ({ navigation, route }) => {
  // --- State ---
  const { imageUri, description: initialDescription } = route.params;
  const [description, setDescription] = useState<string | null>(initialDescription || null);
  const [isLoading, setIsLoading] = useState(!initialDescription);
  const [isStopped, setIsStopped] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [autoReadLoaded, setAutoReadLoaded] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const hasSpokenRef = useRef(false);
  const { controls, panResponder, setRate } = useGestures();
  const maxRate = getMaxSpeechRate();
  const speedOptions = [
    { value: 0.5 },
    { value: 1.0 },
    { value: (1.0 + maxRate) / 2 },
    { value: maxRate },
  ];
  const nav = useNavigation();

  // Check if screen reader is enabled
  useEffect(() => {
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(isEnabled);
    };

    checkScreenReader();

    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // --- Load autoRead from storage on mount ---
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(AUTO_READ_KEY);
      if (saved !== null) setAutoRead(saved === 'true');
      setAutoReadLoaded(true);
    })();
  }, []);

  // --- Save autoRead to storage when changed ---
  useEffect(() => {
    AsyncStorage.setItem(AUTO_READ_KEY, autoRead ? 'true' : 'false');
  }, [autoRead]);

  // --- Initialize speech service and load saved rate ---
  useEffect(() => {
    const initializeSpeech = async () => {
      await initSpeech();
    };
    initializeSpeech();
  }, []);

  // --- Analyze image if no initial description ---
  useEffect(() => {
    if (!autoReadLoaded) return;
    if (!initialDescription) {
      analyzeImageAndMaybeSpeak();
    } else {
      setIsStopped(false);
      if (autoRead && !isScreenReaderEnabled) trySpeak(initialDescription);
      hasSpokenRef.current = true;
    }
    return () => { stopSpeech(); };
  }, [initialDescription, autoReadLoaded, isScreenReaderEnabled]);

  // --- Update speech rate when controls change ---
  useEffect(() => {
    if (!autoReadLoaded || isScreenReaderEnabled) return;
    setSpeechRate(controls.rate);
    // Always replay reading at new speed if autoRead is on and description is present
    if (autoRead && description) {
      setTimeout(() => {
        setIsStopped(false);
        speakText(description);
        hasSpokenRef.current = true;
      }, 50);
    }
  }, [controls.rate, description, autoRead, autoReadLoaded, isScreenReaderEnabled]);

  // --- React to autoRead toggle ---
  useEffect(() => {
    if (!autoReadLoaded || isScreenReaderEnabled) return;
    if (autoRead && description && !isLoading && !isStopped) {
      speakText(description);
      hasSpokenRef.current = true;
    } else if (!autoRead) {
      stopSpeech();
      setIsStopped(true);
      hasSpokenRef.current = false;
    }
  }, [autoRead, autoReadLoaded, description, isLoading, isStopped, isScreenReaderEnabled]);

  // --- Reset hasSpokenRef when description changes ---
  useEffect(() => {
    hasSpokenRef.current = false;
  }, [description]);

  // --- Centralized speech logic ---
  const trySpeak = (text: string) => {
    if (autoReadLoaded && autoRead && !isScreenReaderEnabled) {
      speakText(text);
    }
  };

  // --- Analyze image and maybe speak ---
  const analyzeImageAndMaybeSpeak = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeImage(imageUri);
      setDescription(result);
      setIsStopped(false);
    } catch (error) {
      console.error('Error analyzing image:', error);
      const errorMessage = i18n.t('result.errorAnalyzing');
      setDescription(errorMessage);
      setIsStopped(false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers ---
  const handleTap = async (event: GestureResponderEvent) => {
    if (isLoading) return;
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastTapTime;
    if (timeDiff < 300) {
      stopSpeech();
      setIsStopped(true);
      hasSpokenRef.current = false;
      trackDoubleTapRetake();
      navigation.navigate('Camera');
    } else {
      // Single tap - stop reading if currently playing
      if (!isStopped) {
        await stopSpeech();
        setIsStopped(true);
        hasSpokenRef.current = false;
      }
    }
    setLastTapTime(currentTime);
  };

  const handleRetake = () => {
    stopSpeech();
    setIsStopped(true);
    hasSpokenRef.current = false;
    trackDoubleTapRetake();
    navigation.navigate('Camera');
  };

  const handleSpeedSelect = (rate: number) => {
    setShowSpeedModal(false);
    trackSpeedPreference(rate, 'button');
    setRate(rate);
    setIsStopped(false);
    // Do not trigger reading here; let the effect handle it
  };

  // Add back handler with speech stop
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      stopSpeech();
      BackHandler.exitApp();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // --- UI Guard: render nothing until autoReadLoaded ---
  if (!autoReadLoaded) return null;

  // --- Render ---
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
        disabled={isLoading}
        accessible={true}
        accessibilityRole="none"
      >
        {isLoading ? (
          <View 
            style={styles.loadingContainer}
            accessible={true}
            accessibilityRole="alert"
            accessibilityLabel={i18n.t('result.analyzing')}
            accessibilityHint={i18n.t('result.analyzingHint')}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>{i18n.t('result.analyzing')}</Text>
          </View>
        ) : (
          <>
            <Text 
              style={styles.heading}
              accessible={false}
              importantForAccessibility="no"
            >
              {i18n.t('result.imageDescription')}
            </Text>
            <Text 
              style={styles.description}
              accessible={true}
              accessibilityRole="text"
            >
              {description}
            </Text>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={i18n.t('result.retake')}
              accessibilityHint={i18n.t('result.retakeHint')}
            >
              <Text style={styles.retakeButtonText}>{i18n.t('result.retake')}</Text>
            </TouchableOpacity>
            {!isScreenReaderEnabled && (
              <Text style={styles.hint}>{i18n.t('result.doubleTapRetake')}</Text>
            )}
          </>
        )}
      </TouchableOpacity>
      {/* Controls Row: Toggle, Stopped Text, Speed Button */}
      {!isScreenReaderEnabled && (
        <View style={styles.controlsRow}>
          <View style={styles.controlsSide}>
            <View style={styles.autoReadToggleContainer}>
              <Text style={styles.autoReadLabel}>{i18n.t('result.autoRead')}</Text>
              <Switch
                value={autoRead}
                onValueChange={(value) => {
                  trackAutoReadPreference(value);
                  setAutoRead(value);
                }}
                thumbColor={autoRead ? '#4caf50' : '#ccc'}
                trackColor={{ false: '#888', true: '#a5d6a7' }}
              />
            </View>
          </View>
          <View style={styles.controlsCenter}>
            {isStopped && (
              <Text style={styles.stoppedText}>{i18n.t('result.paused')}</Text>
            )}
          </View>
          <View style={styles.controlsSide}>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => setShowSpeedModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.speedButtonText}>{`${i18n.t('result.speed', { value: controls.rate.toFixed(1)})}`}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Revert to single centered donate button */}
      <TouchableOpacity
        style={styles.donateButton}
        onPress={() => {
          trackDonateClick();
          navigation.navigate('Donate' as never);
        }}
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.donateButtonText}>❤️ {i18n.t('result.donate')} ❤️</Text>
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
            <Text style={styles.modalTitle}>{i18n.t('result.selectSpeed')}</Text>
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

// --- Styles ---
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
    marginBottom: 20,
  },
  hint: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  controlsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 12,
    paddingHorizontal: 16,
  },
  controlsSide: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  controlsCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoReadToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  autoReadLabel: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
    fontWeight: 'bold',
  },
  stoppedText: {
    color: '#F0AD4E',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  retakeButton: {
    backgroundColor: '#e91e63',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 20,
  },
  retakeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  speedButton: {
    backgroundColor: '#222',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  speedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  donateButton: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
    minHeight: 44,
  },
  donateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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