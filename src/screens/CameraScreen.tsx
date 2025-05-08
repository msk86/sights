import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { speakText, stopSpeaking } from '../services/speech';
import { StatusBar } from 'expo-status-bar';
import i18n from '../i18n';

type CameraScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Camera'>;
};

const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTakingPicture, setIsTakingPicture] = useState(false);

  useEffect(() => {
    // Request camera permission
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        // Provide audio guidance when the camera is ready
        speakText(i18n.t('camera.ready'));
      } else {
        // Alert if camera permission is denied
        speakText(i18n.t('camera.denied'));
      }
    })();

    // Clean up speech when component unmounts
    return () => {
      stopSpeaking();
    };
  }, []);

  const takePicture = async () => {
    if (!isTakingPicture) {
      try {
        setIsTakingPicture(true);
        speakText(i18n.t('camera.taking'));
        
        const result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: false,
          mediaTypes: ImagePicker.MediaTypeOptions.Images
        });
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          // Navigate to the result screen with the image URI
          navigation.navigate('Result', { imageUri: result.assets[0].uri });
        } else {
          setIsTakingPicture(false);
          speakText(i18n.t('camera.cancelled'));
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        speakText(i18n.t('camera.failed'));
        setIsTakingPicture(false);
      }
    }
  };

  // Render based on camera permission status
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.text}>{i18n.t('camera.requestingPermission')}</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.text}>{i18n.t('camera.noAccess')}</Text>
        <Text style={styles.subText}>{i18n.t('camera.grantPermission')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity
        style={styles.captureArea}
        onPress={takePicture}
        disabled={isTakingPicture}
        activeOpacity={0.7}
      >
        {isTakingPicture ? (
          <View style={styles.captureIndicator}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.captureText}>{i18n.t('camera.processing')}</Text>
          </View>
        ) : (
          <View style={styles.cameraPrompt}>
            <Text style={styles.cameraPromptText}>{i18n.t('camera.tapToTake')}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2D3F',
  },
  captureIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  captureText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  cameraPrompt: {
    alignItems: 'center',
  },
  cameraPromptText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    padding: 20,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: 20,
  },
  subText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

export default CameraScreen; 