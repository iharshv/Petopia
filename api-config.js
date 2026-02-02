// detect if we are running on localhost or on the production domain
const API_BASE_URL = 'https://petopiatails.vercel.app';

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
}
