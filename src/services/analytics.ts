import PostHog from 'posthog-react-native';

// Initialize PostHog
const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY, {
  host: 'https://us.i.posthog.com',
});

// Track app open
export const trackAppOpen = async () => {
  try {
    await posthog.capture('app_open', {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Error tracking app open:', error);
  }
};

// Track photo taken
export const trackPhotoTaken = async () => {
  try {
    await posthog.capture('photo_taken', {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Error tracking photo taken:', error);
  }
};

// Track auto read preference
export const trackAutoReadPreference = async (enabled: boolean) => {
  try {
    await posthog.capture('set_preference_auto_read', {
      enabled,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Error tracking auto read preference:', error);
  }
};

// Track donate click
export const trackDonateClick = async () => {
  try {
    await posthog.capture('click_donate', {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Error tracking donate click:', error);
  }
};