import { NativeModules, Platform, AppState } from 'react-native';

const { ScreenManager } = NativeModules;

let appStateSubscription: any = null;

export const keepScreenOn = async () => {
  try {
    if (Platform.OS === 'android') {
      await ScreenManager.keepScreenOn();
    } else if (Platform.OS === 'ios') {
      // For iOS, we'll use AppState to monitor app state changes
      if (!appStateSubscription) {
        appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
      }
    }
  } catch (error) {
    console.error('Failed to keep screen on:', error);
  }
};

export const allowScreenOff = async () => {
  try {
    if (Platform.OS === 'android') {
      await ScreenManager.allowScreenOff();
    } else if (Platform.OS === 'ios') {
      // Clean up iOS app state listener
      if (appStateSubscription) {
        appStateSubscription.remove();
        appStateSubscription = null;
      }
    }
  } catch (error) {
    console.error('Failed to allow screen off:', error);
  }
};

const handleAppStateChange = (nextAppState: string) => {
  if (nextAppState === 'active') {
    // App came to foreground
    console.log('App came to foreground');
  } else if (nextAppState === 'background') {
    // App went to background
    console.log('App went to background');
  }
};

const ScreenManagerModule = {
  keepScreenOn,
  allowScreenOff
};

export default ScreenManagerModule; 