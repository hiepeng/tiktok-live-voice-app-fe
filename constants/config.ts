// const _BACKEND_URL = 'http://192.168.41.58:4000';
// const _BACKEND_URL = 'http://192.168.1.5:4000';
// const _BACKEND_URL = 'http://192.168.1.7:4173';
const _BACKEND_URL = 'http://192.168.2.191:4000';
// const _BACKEND_URL = 'https://local.cago.pro';
// const _BACKEND_URL = 'http://192.168.1.101:4000';
// const _BACKEND_URL = 'https://api.downloadcomment.com';

export const BACKEND_URL = (__DEV__ ? _BACKEND_URL : _BACKEND_URL) + '/api/v1';
console.log(BACKEND_URL, "BACKEND_URL");