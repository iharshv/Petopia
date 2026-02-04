const API_BASE_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? 'https://petopiatails.vercel.app'
    : '';

if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
}
