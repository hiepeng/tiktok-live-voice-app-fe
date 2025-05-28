eas build --platform android --profile development

fe $ npx expo prebuild --clean
npx expo prebuild --clean --platform android
eas build --platform android --profile development --local

eas build --platform android --profile preview

eas build --platform android --profile preview --local

eas build --platform android --profile production

open -a "Android Studio"
./gradlew --stop

expo run:android
npx expo run:android
npx expo run:android --variant=googlePlayDebug

cd fe/android
./gradlew assembleGooglePlayDebug
./gradlew assembleDebug
./gradlew assemblePreview
./gradlew assembleRelease
eas submit --platform android


