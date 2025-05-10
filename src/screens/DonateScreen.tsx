import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import i18n from '../i18n';
import { isChineseLocale } from '../i18n';
import { trackFeedbackClick } from '../services/analytics';

const ALIPAY_QR = require('../../assets/alipay-qr.jpg'); // Replace with your actual QR code image
const PAYPAL_URL = 'https://www.paypal.com/paypalme/msk1986'; // Replace with your actual PayPal link

const DonateScreen: React.FC = () => {
  const navigation = useNavigation();

  // Add back handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleFeedbackPress = async () => {
    const feedbackUrl = isChineseLocale()
      ? 'https://jsj.top/f/hDiMMe'
      : 'https://jsj.top/f/y8Pldw';
    
    await trackFeedbackClick();
    await Linking.openURL(feedbackUrl);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{i18n.t('donate.title')}</Text>
      <Text style={styles.subtitle}>{i18n.t('donate.subtitle')}</Text>
      <View style={styles.qrContainer}>
        <Text style={styles.sectionTitle}>{i18n.t('donate.alipay')}</Text>
        <Image source={ALIPAY_QR} style={styles.qrImage} resizeMode="contain" />
        <Text style={styles.qrHint}>{i18n.t('donate.alipayHint')}</Text>
      </View>
      <View style={styles.paypalContainer}>
        <Text style={styles.sectionTitle}>{i18n.t('donate.paypal')}</Text>
        <TouchableOpacity
          style={styles.paypalButton}
          onPress={() => Linking.openURL(PAYPAL_URL)}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.paypalButtonText}>{i18n.t('donate.paypalButton')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.feedbackButton}
        onPress={handleFeedbackPress}
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.feedbackButtonText}>💬 {i18n.t('donate.feedback')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 32,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  qrHint: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  paypalContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  paypalButton: {
    backgroundColor: '#0070ba',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 8,
  },
  paypalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  feedbackButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 20,
    marginBottom: 40,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  feedbackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DonateScreen; 