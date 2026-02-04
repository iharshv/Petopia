const API_BASE_URL = (window.location.hostname.includes('vercel.app'))
    ? ''
    : 'https://petopiatails.vercel.app';

if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
    console.log('[PetopiaConfig] API Base URL:', API_BASE_URL || '(Relative)');
}
