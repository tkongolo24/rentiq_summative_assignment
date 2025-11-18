// API Configuration
// Note: This file is in .gitignore and won't be pushed to GitHub
// Remember to provide these keys to your teacher in the assignment comments

const CONFIG = {
    // Get your free API key from: https://openweathermap.org/api
    // Free tier allows 60 calls/minute which is more than enough
    WEATHER_API_KEY: '00af145c0e67ecff00d70e7f0bfd4462',
    
    // These APIs don't need keys (keeping for reference)
    EXCHANGE_RATE_API: 'https://api.exchangerate-api.com/v4/latest/RWF',
    NOMINATIM_API: 'https://nominatim.openstreetmap.org'
};

// Quick validation check - helps catch missing keys early
if (CONFIG.WEATHER_API_KEY === '5f4e6f65f01b84bc53643604e42aa63d') {
    console.warn('⚠️ Weather API key not set! Weather features will be disabled.');
}