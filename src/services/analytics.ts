import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';
// Initialize PostHog
const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY, {
  host: 'https://us.i.posthog.com',
});

// Track app open
export const trackAppOpen = async () => {
  console.log('Tracking app open');
  try {
    await posthog.capture('app_open', {
      timestamp: new Date().toISOString(),
      device: Platform.OS,
    });
  } catch (error) {
    console.warn('Error tracking app open:', error);
  }
};

// Track photo taken
export const trackPhotoTaken = async () => {
  console.log('Tracking photo taken');
  try {
    await posthog.capture('photo_taken', {
      timestamp: new Date().toISOString(),
      device: Platform.OS,
    });
  } catch (error) {
    console.warn('Error tracking photo taken:', error);
  }
};

// Track auto read preference
export const trackAutoReadPreference = async (enabled: boolean) => {
  console.log('Tracking auto read preference:', enabled);
  try {
    await posthog.capture('set_preference_auto_read', {
      enabled,
      timestamp: new Date().toISOString(),
      device: Platform.OS,
    });
  } catch (error) {
    console.warn('Error tracking auto read preference:', error);
  }
};

// Track speed change
export const trackSpeedPreference = async (rate: number, by: string) => {
  console.log('Tracking speed preference:', rate, by);
  try {
    await posthog.capture('set_preference_read_speed', {
      rate: rate.toFixed(1),
      change_by: by,
      timestamp: new Date().toISOString(),
      device: Platform.OS,
    });
  } catch (error) {
    console.warn('Error tracking read speed preference:', error);
  }
};

// Track donate click
export const trackDonateClick = async () => {
  console.log('Tracking donate click');
  try {
    await posthog.capture('click_donate', {
      timestamp: new Date().toISOString(),
      device: Platform.OS,
    });
  } catch (error) {
    console.warn('Error tracking donate click:', error);
  }
};

export const trackLLM = async (llm: string) => {
  console.log('Tracking LLM:', llm);
  try {
    await posthog.capture('llm_used', {
      llm,
      timestamp: new Date().toISOString(),
      device: Platform.OS,
    });
  } catch (error) {
    console.warn('Error tracking LLM:', error);
  }
};