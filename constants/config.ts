const _BACKEND_URL = 'http://192.168.1.109:4000';
// const _BACKEND_URL = 'https://api.downloadcomment.com';

export const BACKEND_URL = (__DEV__ ? _BACKEND_URL : _BACKEND_URL) + '/api/v1';
console.log(BACKEND_URL, "BACKEND_URL");

export const MAX_COMMENTS = 20;