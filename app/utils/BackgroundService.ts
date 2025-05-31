import { AppState, AppStateStatus, NativeModules, Platform } from 'react-native';

const { BackgroundService } = NativeModules;

let appStateSubscription: any = null;

export const startBackgroundService = async () => {
  try {
    if (Platform.OS === 'android') {
      await BackgroundService.startService();
    } else if (Platform.OS === 'ios') {
      // iOS không có background service như Android
      // Thay vào đó, chúng ta sẽ sử dụng AppState để theo dõi trạng thái app
      appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    }
  } catch (error) {
    console.error('Error starting background service:', error);
  }
};

export const stopBackgroundService = async () => {
  try {
    if (Platform.OS === 'android') {
      await BackgroundService.stopService();
    } else if (Platform.OS === 'ios') {
      // Cleanup iOS listeners
      if (appStateSubscription) {
        appStateSubscription.remove();
        appStateSubscription = null;
      }
    }
  } catch (error) {
    console.error('Error stopping background service:', error);
  }
};

const handleAppStateChange = (nextAppState: AppStateStatus) => {
  if (nextAppState === 'active') {
    console.log('App came to foreground');
  } else if (nextAppState === 'background') {
    console.log('App went to background');
  }
};

// Tạm thời bỏ event emitter vì native module chưa hỗ trợ
// export const addBackgroundServiceListener = (callback: (event: any) => void) => {
//   return eventEmitter.addListener('BackgroundServiceEvent', callback);
// };

// export const removeBackgroundServiceListener = (subscription: any) => {
//   subscription.remove();
// };

const BackgroundServiceModule = {
  startBackgroundService,
  stopBackgroundService
};

export default BackgroundServiceModule; 