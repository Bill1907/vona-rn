import * as amplitude from "@amplitude/analytics-browser";
import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser";

let isAmplitudeInitialized = false;

/**
 * Initialize Amplitude Analytics with Session Replay
 * This function ensures Amplitude is only initialized once and only on the client-side
 */
export const initializeAmplitude = async () => {
  // Ensure this only runs client-side (browser environment)
  if (typeof window === "undefined" || isAmplitudeInitialized) {
    return;
  }

  try {
    // Add Session Replay plugin to Amplitude instance
    amplitude.add(sessionReplayPlugin({ sampleRate: 1 }));

    // Initialize Amplitude with the provided API key and configuration
    amplitude.init("fa796f458bf11f1ce4bc2463c633f988", {
      fetchRemoteConfig: true,
      autocapture: true,
    });

    isAmplitudeInitialized = true;
    console.log(
      "Amplitude Analytics and Session Replay initialized successfully"
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
