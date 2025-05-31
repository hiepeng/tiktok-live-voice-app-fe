import { ConfigPlugin, withDangerousMod, withAndroidManifest } from '@expo/config-plugins';
import path from 'path';
import fs from 'fs-extra';

const filesToCopy = [
  'BackgroundServiceModule.kt',
  'BackgroundServicePackage.kt',
  'ScreenManagerModule.kt',
  'ScreenManagerPackage.kt',
  'MainApplication.kt',
  'BackgroundService.kt',
];

const withTLiveVoiceBackground: ConfigPlugin = (config) => {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const targetDir = path.join(
        projectRoot,
        'android/app/src/main/java/com/hiepnvna/tlivevoice'
      );
      const sourceDir = path.join(
        __dirname,
        '../../android/app/src/main/java/com/hiepnvna/tlivevoice'
      );

      await fs.ensureDir(targetDir);

      for (const file of filesToCopy) {
        const src = path.join(sourceDir, file);
        const dest = path.join(targetDir, file);
        if (fs.existsSync(src)) {
          await fs.copy(src, dest);
        }
      }
      return config;
    },
  ]);

  config = withAndroidManifest(config, async (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (app) {
      // Đảm bảo service BackgroundService đã được khai báo
      const hasService = (app.service || []).some(
        (s: any) => s['$']['android:name'] === '.BackgroundService'
      );
      if (!hasService) {
        app.service = app.service || [];
        app.service.push({
          $: {
            'android:name': '.BackgroundService',
            'android:enabled': 'true',
            'android:exported': 'false',
            'android:foregroundServiceType': 'dataSync',
          },
        });
      }
    }
    return config;
  });

  return config;
};

export default withTLiveVoiceBackground; 