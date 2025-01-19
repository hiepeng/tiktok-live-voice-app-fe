const DEV_BACKEND_URL = 'http://192.168.1.109:4000'; // Thay bằng IP máy tính của bạn
const PROD_BACKEND_URL = 'https://api.downloadcomment.com';

export const BACKEND_URL = (__DEV__ ? DEV_BACKEND_URL : PROD_BACKEND_URL) + '/api/v1';
