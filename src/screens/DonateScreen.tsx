import React from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import i18n from '../i18n';

const ALIPAY_QR = require('../../assets/alipay-qr.jpg'); // Replace with your actual QR code image
const PAYPAL_URL = 'https://www.paypal.com/paypalme/msk1986'; // Replace with your actual PayPal link

const DonateScreen: React.FC = () => {
  const navigation = useNavigation();

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
        >
          <Text style={styles.paypalButtonText}>{i18n.t('donate.paypalButton')}</Text>
        </TouchableOpacity>
      </View>
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
});

export default DonateScreen; 