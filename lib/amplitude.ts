import * as amplitude from "@amplitude/analytics-react-native";
import { SessionReplayPlugin } from "@amplitude/plugin-session-replay-react-native";

let isAmplitudeInitialized = false;

/**
 * Initialize Amplitude Analytics with Session Replay for React Native
 * This function ensures Amplitude is only initialized once
 */
export const initializeAmplitude = async () => {
  // Prevent multiple initializations
  if (isAmplitudeInitialized) {
    return;
  }

  try {
    // Get API key from environment variables
    const apiKey = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY;

    if (!apiKey) {
      console.error("Amplitude API key not found in environment variables");
      return;
    }

    // Initialize Amplitude first
    await amplitude.init(apiKey).promise;

    // Add Session Replay plugin to Amplitude instance
    await amplitude.add(new SessionReplayPlugin({ sampleRate: 1 })).promise;

    isAmplitudeInitialized = true;
    console.log(
      "Amplitude Analytics and Session Replay initialized successfully for React Native"
    );
  } catch (error) {
    console.error("Failed to initialize Amplitude:", error);
  }
};

/**
 * Export amplitude instance for use throughout the application
 */
export { amplitude };

/**
 * Helper function to track custom events
 */
export const trackEvent = (
  eventName: string,
  eventProperties?: Record<string, any>
) => {
  if (isAmplitudeInitialized) {
    amplitude.track(eventName, eventProperties);
  }
};

/**
 * Helper function to identify users
 */
export const identifyUser = (
  userId: string,
  userProperties?: Record<string, any>
) => {
  if (isAmplitudeInitialized) {
    amplitude.setUserId(userId);
    if (userProperties) {
      const identify = new amplitude.Identify();
      Object.entries(userProperties).forEach(([key, value]) => {
        identify.set(key, value);
      });
      amplitude.identify(identify);
    }
  }
};
