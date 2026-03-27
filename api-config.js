const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : '';

if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
    console.log('[PetopiaConfig] API Base URL:', API_BASE_URL || '(Relative)');
}
