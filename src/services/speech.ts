import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLocale } from '../i18n';

// Cache for voice selection
let bestEnglishVoice: string | null = null;
let bestChineseVoice: string | null = null;

// Default and state variables
const defaultOptions = {
  language: 'en-US',
  pitch: 1.0,
  rate: 0.8, // Default reading speed
};

// Storage key for speech rate
const SPEECH_RATE_STORAGE_KEY = 'SPEECH_RATE';

interface CurrentSpeechState {
  text: string;
  options: Speech.SpeechOptions;
  isPlaying: boolean;
}

let currentSpeech: CurrentSpeechState = {
  text: '',
  options: { ...defaultOptions },
  isPlaying: false
};

// Get the best available voice for the given language
const getBestVoiceForLanguage = async (language: string): Promise<string | undefined> => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();

    if (language.startsWith('zh')) {
      // Return cached Chinese voice if already found
      if (bestChineseVoice) return bestChineseVoice;

      // Find Chinese voices
      const chineseVoices = voices.filter(v => 
        v.language === 'zh-CN' || v.language === 'zh-TW' || v.language === 'zh-HK'
      );

      if (chineseVoices.length > 0) {
        // Use the first available voice
        bestChineseVoice = chineseVoices[0].identifier;
        return bestChineseVoice;
      }
    } else {
      // Return cached English voice if already found
      if (bestEnglishVoice) return bestEnglishVoice;

      // Find English voices
      const englishVoices = voices.filter(v => 
        v.language === 'en-US' || v.language === 'en-GB'
      );

      if (englishVoices.length > 0) {
        // Use the first available voice
        bestEnglishVoice = englishVoices[0].identifier;
        return bestEnglishVoice;
      }
    }
  } catch (error) {
    console.error('Error getting available voices:', error);
  }

  // Return undefined if no suitable voice found
  return undefined;
};

// Get language based on current locale
const getLanguageForCurrentLocale = (): string => {
  const currentLocale = getCurrentLocale();
  
  if (currentLocale.startsWith('zh')) {
    return 'zh-CN';
  }
  
  return 'en-US';
};

// Load saved speech rate from storage
export const loadSavedSpeechRate = async (): Promise<number> => {
  try {
    const savedRate = await AsyncStorage.getItem(SPEECH_RATE_STORAGE_KEY);
    if (savedRate !== null) {
      const rate = parseFloat(savedRate);
      currentSpeech.options.rate = rate;
      return rate;
    }
  } catch (error) {
    console.error('Error loading reading speed:', error);
  }
  return defaultOptions.rate;
};

// Save speech rate to storage
export const saveSpeechRate = async (rate: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(SPEECH_RATE_STORAGE_KEY, rate.toString());
  } catch (error) {
    console.error('Error saving reading speed:', error);
  }
};

// Stop all speech
export const stopSpeech = async (): Promise<void> => {
  try {
    // Stop any active speech
    await Speech.stop();
    
    // Reset state
    currentSpeech.isPlaying = false;
    console.log('Reading stopped');
  } catch (error) {
    console.error('Error stopping reading:', error);
  }
};

// Check if currently speaking
export const isSpeaking = async (): Promise<boolean> => {
  try {
    return await Speech.isSpeakingAsync();
  } catch (error) {
    console.error('Error checking reading status:', error);
    return false;
  }
};

// Speaks the provided text
export const speakText = async (
  text: string,
  options: Partial<Speech.SpeechOptions> = {}
): Promise<void> => {
  try {
    // Stop any existing speech
    await stopSpeech();

    // Prepare the text and options
    const mergedOptions = {
      ...currentSpeech.options,
      ...options,
      onDone: () => {
        currentSpeech.isPlaying = false;
        console.log('Reading completed');
        if (options.onDone) {
          options.onDone();
        }
      },
      onStopped: () => {
        currentSpeech.isPlaying = false;
        console.log('Reading interrupted');
        if (options.onStopped) {
          options.onStopped();
        }
      },
      onError: (error: any) => {
        currentSpeech.isPlaying = false;
        console.error('Reading error:', error);
        if (options.onError) {
          options.onError(error);
        }
      },
      onStart: () => {
        console.log('Reading started');
        if (options.onStart) {
          options.onStart();
        }
      }
    };

    // Update current speech state
    currentSpeech = {
      text,
      options: mergedOptions,
      isPlaying: true
    };

    // Start speaking
    console.log(`Starting to read text, rate: ${mergedOptions.rate}`);
    await Speech.speak(text, mergedOptions);
  } catch (error) {
    console.error('Error starting reading:', error);
    currentSpeech.isPlaying = false;
  }
};

// Update speech settings and continue from current position if speaking
export const updateSpeechSettings = async (options: Partial<Speech.SpeechOptions>): Promise<void> => {
  try {
    // Update current speech options
    currentSpeech.options = {
      ...currentSpeech.options,
      ...options,
    };
    
    // If rate is provided, save it to AsyncStorage
    if (options.rate !== undefined) {
      await saveSpeechRate(options.rate);
    }

    // Apply changes to current speech without stopping it
    // Using the Speech.stop() and Speech.speak() approach causes interruptions
    // Instead we'll just let the current utterance continue with existing settings
    // The next utterance (if any) will use the new settings
  } catch (error) {
    console.error('Error updating reading settings:', error);
  }
};

// Initialize speech service
export const initSpeech = async (): Promise<void> => {
  // Load saved speech rate
  await loadSavedSpeechRate();
  console.log('Reading service initialized');
};

// Set speech rate
export const setSpeechRate = async (rate: number): Promise<void> => {
  await updateSpeechSettings({ rate });
};

// Get current speech rate
export const getSpeechRate = (): number => {
  return currentSpeech.options.rate || defaultOptions.rate;
};
