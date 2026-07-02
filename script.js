
const CONFIG = {
    // OpenWeatherMap API - Replace with your own API key
    API_KEY: 'YOUR_OPENWEATHER_API_KEY',
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEO_URL: 'https://api.openweathermap.org/geo/1.0',
    ICON_URL: 'https://openweathermap.org/img/wn',
    MAP_URL: 'https://openweathermap.org/weathermap',
    
    // Default city
    DEFAULT_CITY: 'London',
    
    // Refresh interval (ms)
    REFRESH_INTERVAL: 600000, // 10 minutes
    
    // Units
    UNITS: {
        metric: { temp: '°C', speed: 'm/s' },
        imperial: { temp: '°F', speed: 'mph' }
    }
};

// ============================================
// STATE MANAGEMENT
// ============================================
const AppState = {
    currentCity: null,
    currentWeather: null,
    forecast: null,
    unit: 'metric',
    theme: 'dark',
    favorites: [],
    history: [],
    isLoading: false,
    coordinates: null,
    
    init() {
        this.loadPreferences();
        this.loadFavorites();
        this.loadHistory();
        this.applyTheme();
        this.applyUnit();
    },
    
    loadPreferences() {
        const prefs = this.getStorage('atmosphere_prefs');
        if (prefs) {
            this.unit = prefs.unit || 'metric';
            this.theme = prefs.theme || 'dark';
        }
    },
    
    savePreferences() {
        this.setStorage('atmosphere_prefs', { unit: this.unit, theme: this.theme });
    },
    
    loadFavorites() {
        this.favorites = this.getStorage('atmosphere_favorites') || [];
    },
    
    saveFavorites() {
        this.setStorage('atmosphere_favorites', this.favorites);
    },
    
    addFavorite(city) {
        if (!this.favorites.find(f => f.name === city.name)) {
            this.favorites.unshift(city);
            if (this.favorites.length > 10) this.favorites.pop();
            this.saveFavorites();
            return true;
        }
        return false;
    },
    
    removeFavorite(cityName) {
        this.favorites = this.favorites.filter(f => f.name !== cityName);
        this.saveFavorites();
    },
    
    loadHistory() {
        this.history = this.getStorage('atmosphere_history') || [];
    },
    
    saveHistory() {
        this.setStorage('atmosphere_history', this.history);
    },
    
    addToHistory(city) {
        this.history = this.history.filter(h => h.name !== city.name);
        this.history.unshift({ ...city, timestamp: Date.now() });
        if (this.history.length > 10) this.history.pop();
        this.saveHistory();
    },
    
    getStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('LocalStorage not available');
            return null;
        }
    },
    
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage not available');
        }
    },
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
    },
    
    applyUnit() {
        document.body.classList.toggle('imperial', this.unit === 'imperial');
    }
};

// ============================================
// DOM ELEMENTS
// ============================================
const DOM = {
    loadingOverlay: document.getElementById('loadingOverlay'),
    errorModal: document.getElementById('errorModal'),
    errorTitle: document.getElementById('errorTitle'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    closeErrorBtn: document.getElementById('closeErrorBtn'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    voiceBtn: document.getElementById('voiceBtn'),
    locateBtn: document.getElementById('locateBtn'),
    searchSuggestions: document.getElementById('searchSuggestions'),
    themeToggle: document.getElementById('themeToggle'),
    unitToggle: document.getElementById('unitToggle'),
    favoritesList: document.getElementById('favoritesList'),
    historyList: document.getElementById('historyList'),
    cityName: document.getElementById('cityName'),
    countryName: document.getElementById('countryName'),
    currentDate: document.getElementById('currentDate'),
    weatherIcon: document.getElementById('weatherIcon'),
    weatherDesc: document.getElementById('weatherDesc'),
    temperature: document.getElementById('temperature'),
    tempUnit: document.getElementById('tempUnit'),
    feelsLike: document.getElementById('feelsLike'),
    minTemp: document.getElementById('minTemp'),
    maxTemp: document.getElementById('maxTemp'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    windDirection: document.getElementById('windDirection'),
    compassArrow: document.getElementById('compassArrow'),
    pressure: document.getElementById('pressure'),
    pressureFill: document.getElementById('pressureFill'),
    visibility: document.getElementById('visibility'),
    visSeg4: document.getElementById('visSeg4'),
    visSeg5: document.getElementById('visSeg5'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    sunPosition: document.getElementById('sunPosition'),
    uvIndex: document.getElementById('uvIndex'),
    uvLevel: document.getElementById('uvLevel'),
    uvFill: document.getElementById('uvFill'),
    aqi: document.getElementById('aqi'),
    aqiLevel: document.getElementById('aqiLevel'),
    aqiProgress: document.getElementById('aqiProgress'),
    aqiCenter: document.getElementById('aqiCenter'),
    refreshBtn: document.getElementById('refreshBtn'),
    favoriteBtn: document.getElementById('favoriteBtn'),
    mapBtn: document.getElementById('mapBtn'),
    hourlyScroll: document.getElementById('hourlyScroll'),
    dailyForecast: document.getElementById('dailyForecast'),
    mapModal: document.getElementById('mapModal'),
    closeMap: document.getElementById('closeMap'),
    weatherMap: document.getElementById('weatherMap'),
    weatherBg: document.getElementById('weatherBg'),
    bgGradient: document.querySelector('.bg-gradient'),
    particles: document.getElementById('particles'),
    clouds: document.getElementById('clouds'),
    stars: document.getElementById('stars')
};

// ============================================
// WEATHER ICONS (SVG)
// ============================================
const WeatherIcons = {
    '01d': `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="18" fill="url(#sunGrad)"/><g stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="50" y1="12" x2="50" y2="22"/><line x1="50" y1="78" x2="50" y2="88"/><line x1="12" y1="50" x2="22" y2="50"/><line x1="78" y1="50" x2="88" y2="50"/><line x1="23" y1="23" x2="30" y2="30"/><line x1="70" y1="70" x2="77" y2="77"/><line x1="23" y1="77" x2="30" y2="70"/><line x1="70" y1="30" x2="77" y2="23"/></g><defs><radialGradient id="sunGrad"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FF8C00"/></radialGradient></defs></svg>`,
    '01n': `<svg viewBox="0 0 100 100"><path d="M65 15 A35 35 0 1 0 65 85 A25 25 0 0 1 65 15Z" fill="url(#moonGrad)"/><defs><linearGradient id="moonGrad"><stop offset="0%" stop-color="#F0E6D2"/><stop offset="100%" stop-color="#C4B9A8"/></linearGradient></defs></svg>`,
    '02d': `<svg viewBox="0 0 100 100"><circle cx="30" cy="30" r="12" fill="url(#sunGrad2)"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="30" y1="12" x2="30" y2="16"/><line x1="30" y1="44" x2="30" y2="48"/><line x1="12" y1="30" x2="16" y2="30"/><line x1="44" y1="30" x2="48" y2="30"/></g><path d="M30 50 Q30 40 42 40 Q50 28 68 28 Q85 28 85 45 Q95 45 95 60 Q95 72 82 72 L38 72 Q25 72 25 58 Q25 48 30 50Z" fill="rgba(255,255,255,0.9)"/><defs><radialGradient id="sunGrad2"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FF8C00"/></radialGradient></defs></svg>`,
    '02n': `<svg viewBox="0 0 100 100"><path d="M22 22 A18 18 0 1 0 22 58 A14 14 0 0 1 22 22Z" fill="url(#moonGrad2)"/><path d="M30 50 Q30 40 42 40 Q50 28 68 28 Q85 28 85 45 Q95 45 95 60 Q95 72 82 72 L38 72 Q25 72 25 58 Q25 48 30 50Z" fill="rgba(255,255,255,0.85)"/><defs><linearGradient id="moonGrad2"><stop offset="0%" stop-color="#F0E6D2"/><stop offset="100%" stop-color="#C4B9A8"/></linearGradient></defs></svg>`,
    '03d': `<svg viewBox="0 0 100 100"><path d="M25 55 Q25 40 40 40 Q50 25 70 25 Q90 25 90 45 Q100 45 100 60 Q100 75 85 75 L30 75 Q15 75 15 60 Q15 50 25 55Z" fill="rgba(255,255,255,0.9)"/></svg>`,
    '03n': `<svg viewBox="0 0 100 100"><path d="M25 55 Q25 40 40 40 Q50 25 70 25 Q90 25 90 45 Q100 45 100 60 Q100 75 85 75 L30 75 Q15 75 15 60 Q15 50 25 55Z" fill="rgba(200,200,210,0.85)"/></svg>`,
    '04d': `<svg viewBox="0 0 100 100"><path d="M20 50 Q20 35 35 35 Q45 20 65 20 Q85 20 85 40 Q95 40 95 55 Q95 70 80 70 L25 70 Q10 70 10 55 Q10 45 20 50Z" fill="rgba(255,255,255,0.7)"/><path d="M30 65 Q30 50 45 50 Q55 35 75 35 Q95 35 95 55 Q100 55 100 70 Q100 85 85 85 L35 85 Q20 85 20 70 Q20 60 30 65Z" fill="rgba(255,255,255,0.5)"/></svg>`,
    '04n': `<svg viewBox="0 0 100 100"><path d="M20 50 Q20 35 35 35 Q45 20 65 20 Q85 20 85 40 Q95 40 95 55 Q95 70 80 70 L25 70 Q10 70 10 55 Q10 45 20 50Z" fill="rgba(180,180,190,0.7)"/><path d="M30 65 Q30 50 45 50 Q55 35 75 35 Q95 35 95 55 Q100 55 100 70 Q100 85 85 85 L35 85 Q20 85 20 70 Q20 60 30 65Z" fill="rgba(160,160,170,0.5)"/></svg>`,
    '09d': `<svg viewBox="0 0 100 100"><path d="M25 45 Q25 30 40 30 Q50 15 70 15 Q90 15 90 35 Q100 35 100 50 Q100 65 85 65 L30 65 Q15 65 15 50 Q15 40 25 45Z" fill="rgba(200,200,210,0.9)"/><g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"><line x1="35" y1="72" x2="30" y2="85"/><line x1="50" y1="72" x2="45" y2="85"/><line x1="65" y1="72" x2="60" y2="85"/><line x1="42" y1="78" x2="37" y2="91"/><line x1="57" y1="78" x2="52" y2="91"/></g></svg>`,
    '09n': `<svg viewBox="0 0 100 100"><path d="M25 45 Q25 30 40 30 Q50 15 70 15 Q90 15 90 35 Q100 35 100 50 Q100 65 85 65 L30 65 Q15 65 15 50 Q15 40 25 45Z" fill="rgba(160,160,170,0.85)"/><g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"><line x1="35" y1="72" x2="30" y2="85"/><line x1="50" y1="72" x2="45" y2="85"/><line x1="65" y1="72" x2="60" y2="85"/><line x1="42" y1="78" x2="37" y2="91"/><line x1="57" y1="78" x2="52" y2="91"/></g></svg>`,
    '10d': `<svg viewBox="0 0 100 100"><circle cx="28" cy="28" r="10" fill="url(#sunGrad3)"/><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="28" y1="12" x2="28" y2="16"/><line x1="28" y1="40" x2="28" y2="44"/><line x1="12" y1="28" x2="16" y2="28"/><line x1="40" y1="28" x2="44" y2="28"/></g><path d="M32 48 Q32 36 45 36 Q53 24 72 24 Q90 24 90 42 Q98 42 98 56 Q98 70 85 70 L40 70 Q26 70 26 56 Q26 46 32 48Z" fill="rgba(255,255,255,0.9)"/><g stroke="#60A5FA" stroke-width="2" stroke-linecap="round"><line x1="42" y1="76" x2="38" y2="88"/><line x1="55" y1="76" x2="51" y2="88"/><line x1="68" y1="76" x2="64" y2="88"/></g><defs><radialGradient id="sunGrad3"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FF8C00"/></radialGradient></defs></svg>`,
    '10n': `<svg viewBox="0 0 100 100"><path d="M20 20 A14 14 0 1 0 20 48 A10 10 0 0 1 20 20Z" fill="url(#moonGrad3)"/><path d="M32 48 Q32 36 45 36 Q53 24 72 24 Q90 24 90 42 Q98 42 98 56 Q98 70 85 70 L40 70 Q26 70 26 56 Q26 46 32 48Z" fill="rgba(200,200,210,0.85)"/><g stroke="#60A5FA" stroke-width="2" stroke-linecap="round"><line x1="42" y1="76" x2="38" y2="88"/><line x1="55" y1="76" x2="51" y2="88"/><line x1="68" y1="76" x2="64" y2="88"/></g><defs><linearGradient id="moonGrad3"><stop offset="0%" stop-color="#F0E6D2"/><stop offset="100%" stop-color="#C4B9A8"/></linearGradient></defs></svg>`,
    '11d': `<svg viewBox="0 0 100 100"><path d="M25 45 Q25 30 40 30 Q50 15 70 15 Q90 15 90 35 Q100 35 100 50 Q100 65 85 65 L30 65 Q15 65 15 50 Q15 40 25 45Z" fill="rgba(180,180,190,0.9)"/><path d="M48 55 L38 75 L50 75 L42 95 L62 70 L48 70 L58 55Z" fill="#FFD700" stroke="#F59E0B" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    '11n': `<svg viewBox="0 0 100 100"><path d="M25 45 Q25 30 40 30 Q50 15 70 15 Q90 15 90 35 Q100 35 100 50 Q100 65 85 65 L30 65 Q15 65 15 50 Q15 40 25 45Z" fill="rgba(140,140,150,0.85)"/><path d="M48 55 L38 75 L50 75 L42 95 L62 70 L48 70 L58 55Z" fill="#FFD700" stroke="#F59E0B" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    '13d': `<svg viewBox="0 0 100 100"><path d="M25 45 Q25 30 40 30 Q50 15 70 15 Q90 15 90 35 Q100 35 100 50 Q100 65 85 65 L30 65 Q15 65 15 50 Q15 40 25 45Z" fill="rgba(255,255,255,0.95)"/><g fill="white" stroke="#93C5FD" stroke-width="1"><circle cx="35" cy="75" r="3"/><circle cx="50" cy="72" r="3"/><circle cx="65" cy="78" r="3"/><circle cx="42" cy="85" r="3"/><circle cx="58" cy="88" r="3"/></g></svg>`,
    '13n': `<svg viewBox="0 0 100 100"><path d="M25 45 Q25 30 40 30 Q50 15 70 15 Q90 15 90 35 Q100 35 100 50 Q100 65 85 65 L30 65 Q15 65 15 50 Q15 40 25 45Z" fill="rgba(220,220,230,0.9)"/><g fill="white" stroke="#93C5FD" stroke-width="1"><circle cx="35" cy="75" r="3"/><circle cx="50" cy="72" r="3"/><circle cx="65" cy="78" r="3"/><circle cx="42" cy="85" r="3"/><circle cx="58" cy="88" r="3"/></g></svg>`,
    '50d': `<svg viewBox="0 0 100 100"><g stroke="rgba(255,255,255,0.7)" stroke-width="3" stroke-linecap="round"><line x1="15" y1="35" x2="85" y2="35"/><line x1="20" y1="50" x2="80" y2="50"/><line x1="25" y1="65" x2="75" y2="65"/></g></svg>`,
    '50n': `<svg viewBox="0 0 100 100"><g stroke="rgba(180,180,190,0.6)" stroke-width="3" stroke-linecap="round"><line x1="15" y1="35" x2="85" y2="35"/><line x1="20" y1="50" x2="80" y2="50"/><line x1="25" y1="65" x2="75" y2="65"/></g></svg>`
};

const getSmallIcon = (iconCode) => {
    const icons = {
        '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return icons[iconCode] || '☁️';
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
    convertTemp(temp, toUnit) {
        if (toUnit === 'imperial') return Math.round((temp * 9/5) + 32);
        return Math.round(temp);
    },
    
    convertSpeed(speed, toUnit) {
        if (toUnit === 'imperial') return (speed * 2.237).toFixed(1);
        return speed.toFixed(1);
    },
    
    formatDate(timestamp, options = {}) {
        const date = new Date(timestamp * 1000);
        const defaults = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', { ...defaults, ...options });
    },
    
    formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    },
    
    formatHour(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    },
    
    getDayName(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    },
    
    getShortDay(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    },
    
    getWindDirection(deg) {
        const directions = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
        return directions[Math.round(deg / 22.5) % 16];
    },
    
    getUVLevel(uv) {
        if (uv <= 2) return { label: 'Low', color: '#10b981' };
        if (uv <= 5) return { label: 'Moderate', color: '#f59e0b' };
        if (uv <= 7) return { label: 'High', color: '#f97316' };
        if (uv <= 10) return { label: 'Very High', color: '#ef4444' };
        return { label: 'Extreme', color: '#7c3aed' };
    },
    
    getAQILevel(aqi) {
        const levels = [
            { label: 'Good', color: '#10b981', min: 0, max: 50 },
            { label: 'Moderate', color: '#f59e0b', min: 51, max: 100 },
            { label: 'Unhealthy (Sensitive)', color: '#f97316', min: 101, max: 150 },
            { label: 'Unhealthy', color: '#ef4444', min: 151, max: 200 },
            { label: 'Very Unhealthy', color: '#7c3aed', min: 201, max: 300 },
            { label: 'Hazardous', color: '#7f1d1d', min: 301, max: 500 }
        ];
        return levels.find(l => aqi >= l.min && aqi <= l.max) || levels[levels.length - 1];
    },
    
    getWeatherGradient(condition, isDay) {
        const gradients = {
            'Clear': isDay ? 'var(--gradient-clear-day)' : 'var(--gradient-clear-night)',
            'Clouds': 'var(--gradient-cloudy)',
            'Rain': 'var(--gradient-rain)',
            'Drizzle': 'var(--gradient-rain)',
            'Thunderstorm': 'var(--gradient-thunder)',
            'Snow': 'var(--gradient-snow)',
            'Mist': 'var(--gradient-fog)',
            'Fog': 'var(--gradient-fog)',
            'Haze': 'var(--gradient-fog)'
        };
        return gradients[condition] || 'var(--gradient-clear-day)';
    },
    
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};

// ============================================
// API SERVICE
// ============================================
const WeatherAPI = {
    isConfigured() {
        return CONFIG.API_KEY && CONFIG.API_KEY !== 'YOUR_OPENWEATHER_API_KEY';
    },
    
    async getCurrentWeather(lat, lon) {
        const url = `${CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${AppState.unit}&appid=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
        return response.json();
    },
    
    async getForecast(lat, lon) {
        const url = `${CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${AppState.unit}&appid=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Forecast API error: ${response.status}`);
        return response.json();
    },
    
    async getAirQuality(lat, lon) {
        const url = `${CONFIG.BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Air Quality API error: ${response.status}`);
        return response.json();
    },
    
    async geocodeCity(cityName) {
        const url = `${CONFIG.GEO_URL}/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Geocoding error: ${response.status}`);
        return response.json();
    },
    
    async reverseGeocode(lat, lon) {
        const url = `${CONFIG.GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${CONFIG.API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Reverse geocoding error: ${response.status}`);
        return response.json();
    },
    
    async getUVIndex(lat, lon) {
        try {
            const url = `${CONFIG.BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${CONFIG.API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const data = await response.json();
            return data.current?.uvi || null;
        } catch {
            return null;
        }
    }
};

// ============================================
// DEMO DATA (Fallback)
// ============================================
const DemoData = {
    current: {
        name: 'London',
        sys: { country: 'GB', sunrise: Math.floor(Date.now()/1000) - 21600, sunset: Math.floor(Date.now()/1000) + 21600 },
        main: { temp: 15.5, feels_like: 13.2, temp_min: 12.0, temp_max: 18.0, humidity: 72, pressure: 1013 },
        weather: [{ main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
        wind: { speed: 4.2, deg: 240 },
        visibility: 10000,
        coord: { lat: 51.5074, lon: -0.1278 }
    },
    
    forecast: {
        list: Array.from({ length: 40 }, (_, i) => {
            const baseTemp = 15 + Math.sin(i / 3) * 5;
            const conditions = ['Clear', 'Clouds', 'Rain', 'Clouds', 'Clear'];
            const icons = ['01d', '03d', '10d', '04d', '01d'];
            return {
                dt: Math.floor(Date.now()/1000) + (i * 3600 * 3),
                main: { temp: baseTemp, temp_min: baseTemp - 2, temp_max: baseTemp + 2 },
                weather: [{ main: conditions[i % 5], description: conditions[i % 5].toLowerCase(), icon: icons[i % 5] }],
                wind: { speed: 3 + Math.random() * 4 },
                pop: Math.random() * 0.5
            };
        })
    },
    
    airQuality: {
        list: [{ main: { aqi: 2 }, components: { pm2_5: 8.5, pm10: 15.2, no2: 12.3, o3: 45.6 } }]
    }
};

// ============================================
// UI RENDERER
// ============================================
const UI = {
    showLoading() {
        AppState.isLoading = true;
        DOM.loadingOverlay.classList.remove('hidden');
    },
    
    hideLoading() {
        AppState.isLoading = false;
        DOM.loadingOverlay.classList.add('hidden');
    },
    
    showError(title, message, showRetry = true) {
        DOM.errorTitle.textContent = title;
        DOM.errorMessage.textContent = message;
        DOM.retryBtn.style.display = showRetry ? 'inline-block' : 'none';
        DOM.errorModal.classList.add('active');
    },
    
    hideError() {
        DOM.errorModal.classList.remove('active');
    },
    
    updateCurrentWeather(data) {
        const isMetric = AppState.unit === 'metric';
        const unit = isMetric ? '°C' : '°F';
        const speedUnit = isMetric ? 'm/s' : 'mph';
        
        DOM.cityName.textContent = data.name;
        DOM.countryName.textContent = data.sys.country || '';
        DOM.currentDate.textContent = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
        
        const iconCode = data.weather[0]?.icon || '01d';
        DOM.weatherIcon.innerHTML = WeatherIcons[iconCode] || WeatherIcons['01d'];
        DOM.weatherDesc.textContent = data.weather[0]?.description || 'Clear sky';
        
        const temp = Utils.convertTemp(data.main.temp, AppState.unit);
        DOM.temperature.textContent = temp;
        DOM.tempUnit.textContent = unit;
        
        DOM.feelsLike.textContent = `${Utils.convertTemp(data.main.feels_like, AppState.unit)}${unit}`;
        DOM.minTemp.textContent = `${Utils.convertTemp(data.main.temp_min, AppState.unit)}${unit}`;
        DOM.maxTemp.textContent = `${Utils.convertTemp(data.main.temp_max, AppState.unit)}${unit}`;
        DOM.humidity.textContent = `${data.main.humidity}%`;
        
        const windSpeed = Utils.convertSpeed(data.wind.speed, AppState.unit);
        DOM.windSpeed.textContent = `${windSpeed} ${speedUnit}`;
        DOM.windDirection.textContent = Utils.getWindDirection(data.wind.deg);
        DOM.compassArrow.style.transform = `translate(-50%, -100%) rotate(${data.wind.deg}deg)`;
        
        DOM.pressure.textContent = data.main.pressure;
        const pressurePercent = Math.min(100, Math.max(0, (data.main.pressure - 950) / 100 * 100));
        DOM.pressureFill.style.width = `${pressurePercent}%`;
        
        const visibilityKm = (data.visibility / 1000).toFixed(1);
        DOM.visibility.textContent = visibilityKm;
        const visScore = Math.min(5, Math.ceil(data.visibility / 2000));
        DOM.visSeg4.classList.toggle('active', visScore >= 4);
        DOM.visSeg5.classList.toggle('active', visScore >= 5);
        
        DOM.sunrise.textContent = Utils.formatTime(data.sys.sunrise);
        DOM.sunset.textContent = Utils.formatTime(data.sys.sunset);
        
        const now = Date.now() / 1000;
        const dayLength = data.sys.sunset - data.sys.sunrise;
        const elapsed = now - data.sys.sunrise;
        const sunPercent = Math.max(0, Math.min(100, (elapsed / dayLength) * 100));
        DOM.sunPosition.style.left = `${sunPercent}%`;
        
        this.updateBackground(data.weather[0]?.main, iconCode.includes('d'));
        
        const isFav = AppState.favorites.some(f => f.name === data.name);
        DOM.favoriteBtn.classList.toggle('favorited', isFav);
    },
    
    updateUV(uv) {
        if (uv !== null) {
            DOM.uvIndex.textContent = uv.toFixed(1);
            const level = Utils.getUVLevel(uv);
            DOM.uvLevel.textContent = level.label;
            DOM.uvLevel.style.color = level.color;
            DOM.uvFill.style.width = `${Math.min(100, (uv / 11) * 100)}%`;
        } else {
            DOM.uvIndex.textContent = '--';
            DOM.uvLevel.textContent = 'N/A';
            DOM.uvFill.style.width = '0%';
        }
    },
    
    updateAQI(aqi) {
        if (aqi && aqi.list && aqi.list[0]) {
            const value = aqi.list[0].main.aqi * 50;
            DOM.aqi.textContent = value;
            const level = Utils.getAQILevel(value);
            DOM.aqiLevel.textContent = level.label;
            DOM.aqiLevel.style.color = level.color;
            DOM.aqiCenter.textContent = value;
            
            const circumference = 2 * Math.PI * 40;
            const offset = circumference - (Math.min(value, 500) / 500) * circumference;
            DOM.aqiProgress.style.strokeDashoffset = offset;
            DOM.aqiProgress.style.stroke = level.color;
        } else {
            DOM.aqi.textContent = '--';
            DOM.aqiLevel.textContent = 'N/A';
            DOM.aqiCenter.textContent = '--';
            DOM.aqiProgress.style.strokeDashoffset = 251.2;
        }
    },
    
    updateHourlyForecast(list) {
        DOM.hourlyScroll.innerHTML = '';
        const now = Date.now() / 1000;
        const hourly = list.filter(item => item.dt >= now).slice(0, 8);
        
        hourly.forEach((item, index) => {
            const isCurrent = index === 0;
            const temp = Utils.convertTemp(item.main.temp, AppState.unit);
            const unit = AppState.unit === 'metric' ? '°C' : '°F';
            const iconCode = item.weather[0]?.icon || '01d';
            
            const el = document.createElement('div');
            el.className = `hourly-item ${isCurrent ? 'current' : ''} fade-in`;
            el.style.animationDelay = `${index * 0.05}s`;
            el.innerHTML = `
                <span class="hourly-time">${isCurrent ? 'Now' : Utils.formatHour(item.dt)}</span>
                <div class="hourly-icon">${getSmallIcon(iconCode)}</div>
                <span class="hourly-temp">${temp}${unit}</span>
                <span class="hourly-desc">${item.weather[0]?.description || ''}</span>
            `;
            DOM.hourlyScroll.appendChild(el);
        });
    },
    
    updateDailyForecast(list) {
        DOM.dailyForecast.innerHTML = '';
        
        const daily = {};
        list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            if (!daily[dayKey]) daily[dayKey] = { items: [], dt: item.dt };
            daily[dayKey].items.push(item);
        });
        
        const days = Object.values(daily).slice(0, 7);
        const unit = AppState.unit === 'metric' ? '°C' : '°F';
        
        let globalMin = Infinity, globalMax = -Infinity;
        days.forEach(day => {
            day.items.forEach(item => {
                globalMin = Math.min(globalMin, item.main.temp_min);
                globalMax = Math.max(globalMax, item.main.temp_max);
            });
        });
        
        days.forEach((day, index) => {
            const temps = day.items.map(i => i.main.temp);
            const min = Math.min(...temps);
            const max = Math.max(...temps);
            const avgIcon = day.items[Math.floor(day.items.length / 2)].weather[0]?.icon || '01d';
            const desc = day.items[Math.floor(day.items.length / 2)].weather[0]?.description || '';
            
            const minConverted = Utils.convertTemp(min, AppState.unit);
            const maxConverted = Utils.convertTemp(max, AppState.unit);
            
            const range = globalMax - globalMin;
            const leftPercent = range > 0 ? ((min - globalMin) / range) * 100 : 0;
            const widthPercent = range > 0 ? ((max - min) / range) * 100 : 0;
            
            const el = document.createElement('div');
            el.className = 'daily-item fade-in';
            el.style.animationDelay = `${index * 0.08}s`;
            el.innerHTML = `
                <span class="daily-day">${index === 0 ? 'Today' : Utils.getDayName(day.dt)}</span>
                <div class="daily-icon-temp">
                    <span class="daily-icon">${getSmallIcon(avgIcon)}</span>
                    <span class="daily-desc">${desc}</span>
                </div>
                <div class="daily-temp-range">
                    <span class="daily-min">${minConverted}°</span>
                    <div class="temp-bar">
                        <div class="temp-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%"></div>
                    </div>
                    <span class="daily-max">${maxConverted}°</span>
                </div>
            `;
            DOM.dailyForecast.appendChild(el);
        });
    },
    
    updateSidebar() {
        if (AppState.favorites.length === 0) {
            DOM.favoritesList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <p>No favorites yet</p>
                </div>`;
        } else {
            DOM.favoritesList.innerHTML = AppState.favorites.map(fav => `
                <div class="favorite-item" data-city="${fav.name}">
                    <div class="favorite-info">
                        <span class="favorite-name">${fav.name}</span>
                        <span class="favorite-temp">${fav.temp || '--'}</span>
                    </div>
                    <button class="favorite-remove" data-city="${fav.name}" title="Remove">×</button>
                </div>
            `).join('');
            
            DOM.favoritesList.querySelectorAll('.favorite-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('favorite-remove')) {
                        App.loadCity(item.dataset.city);
                    }
                });
            });
            
            DOM.favoritesList.querySelectorAll('.favorite-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    AppState.removeFavorite(btn.dataset.city);
                    this.updateSidebar();
                });
            });
        }
        
        if (AppState.history.length === 0) {
            DOM.historyList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p>No recent searches</p>
                </div>`;
        } else {
            DOM.historyList.innerHTML = AppState.history.map(hist => `
                <div class="history-item" data-city="${hist.name}">
                    <div class="history-info">
                        <span class="history-name">${hist.name}</span>
                        <span class="history-temp">${hist.temp || '--'}</span>
                    </div>
                </div>
            `).join('');
            
            DOM.historyList.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', () => App.loadCity(item.dataset.city));
            });
        }
    },
    
    updateBackground(condition, isDay) {
        const gradient = Utils.getWeatherGradient(condition, isDay);
        DOM.bgGradient.style.background = gradient;
        
        DOM.clouds.classList.remove('active');
        DOM.stars.classList.remove('active');
        document.querySelectorAll('.rain-container, .snow-container').forEach(el => el.remove());
        
        if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
            this.createRainEffect();
        } else if (condition === 'Snow') {
            this.createSnowEffect();
        } else if (condition === 'Clouds') {
            DOM.clouds.classList.add('active');
            this.createClouds();
        }
        
        if (!isDay) {
            DOM.stars.classList.add('active');
            this.createStars();
        }
    },
    
    createParticles() {
        DOM.particles.innerHTML = '';
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 15}s`;
            particle.style.animationDuration = `${10 + Math.random() * 10}s`;
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            DOM.particles.appendChild(particle);
        }
    },
    
    createClouds() {
        if (DOM.clouds.children.length > 0) return;
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            const width = 100 + Math.random() * 200;
            cloud.style.width = `${width}px`;
            cloud.style.height = `${width * 0.3}px`;
            cloud.style.top = `${Math.random() * 40}%`;
            cloud.style.left = `-${width}px`;
            cloud.style.animationDuration = `${40 + Math.random() * 40}s`;
            cloud.style.animationDelay = `${Math.random() * 20}s`;
            DOM.clouds.appendChild(cloud);
        }
    },
    
    createStars() {
        if (DOM.stars.children.length > 0) return;
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 60}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            star.style.width = `${1 + Math.random() * 2}px`;
            star.style.height = star.style.width;
            DOM.stars.appendChild(star);
        }
    },
    
    createRainEffect() {
        const container = document.createElement('div');
        container.className = 'rain-container active';
        for (let i = 0; i < 100; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            drop.style.height = `${15 + Math.random() * 15}px`;
            container.appendChild(drop);
        }
        DOM.weatherBg.appendChild(container);
    },
    
    createSnowEffect() {
        const container = document.createElement('div');
        container.className = 'snow-container active';
        for (let i = 0; i < 50; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            flake.textContent = '❄';
            flake.style.left = `${Math.random() * 100}%`;
            flake.style.animationDuration = `${3 + Math.random() * 5}s`;
            flake.style.animationDelay = `${Math.random() * 5}s`;
            flake.style.fontSize = `${0.5 + Math.random() * 1}em`;
            container.appendChild(flake);
        }
        DOM.weatherBg.appendChild(container);
    }
};

// ============================================
// VOICE SEARCH
// ============================================
const VoiceSearch = {
    recognition: null,
    isListening: false,
    
    init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                DOM.voiceBtn.classList.add('recording');
                DOM.searchInput.placeholder = 'Listening...';
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                DOM.voiceBtn.classList.remove('recording');
                DOM.searchInput.placeholder = 'Search city...';
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                DOM.searchInput.value = transcript;
                App.loadCity(transcript);
            };
            
            this.recognition.onerror = () => {
                UI.showError('Voice Search Failed', 'Could not recognize speech. Please try again.', false);
            };
            
            DOM.voiceBtn.addEventListener('click', () => this.toggle());
        } else {
            DOM.voiceBtn.style.display = 'none';
        }
    },
    
    toggle() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }
};

// ============================================
// MAIN APPLICATION
// ============================================
const App = {
    init() {
        AppState.init();
        UI.createParticles();
        UI.updateSidebar();
        this.bindEvents();
        VoiceSearch.init();
        
        const lastCity = AppState.getStorage('atmosphere_last_city');
        if (lastCity) {
            this.loadCity(lastCity);
        } else {
            this.loadCity(CONFIG.DEFAULT_CITY);
        }
        
        setInterval(() => {
            if (AppState.currentCity && !AppState.isLoading) {
                this.refreshWeather();
            }
        }, CONFIG.REFRESH_INTERVAL);
    },
    
    bindEvents() {
        DOM.searchBtn.addEventListener('click', () => {
            const city = DOM.searchInput.value.trim();
            if (city) this.loadCity(city);
        });
        
        DOM.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = DOM.searchInput.value.trim();
                if (city) this.loadCity(city);
            }
        });
        
        DOM.searchInput.addEventListener('input', Utils.debounce((e) => {
            this.handleSearchInput(e.target.value);
        }, 300));
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                DOM.searchSuggestions.classList.remove('active');
            }
        });
        
        DOM.locateBtn.addEventListener('click', () => this.getUserLocation());
        DOM.themeToggle.addEventListener('click', () => this.toggleTheme());
        DOM.unitToggle.addEventListener('click', () => this.toggleUnit());
        DOM.refreshBtn.addEventListener('click', () => this.refreshWeather());
        DOM.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        DOM.mapBtn.addEventListener('click', () => this.openMap());
        
        DOM.retryBtn.addEventListener('click', () => {
            UI.hideError();
            this.refreshWeather();
        });
        DOM.closeErrorBtn.addEventListener('click', () => UI.hideError());
        
        DOM.closeMap.addEventListener('click', () => DOM.mapModal.classList.remove('active'));
        DOM.mapModal.addEventListener('click', (e) => {
            if (e.target === DOM.mapModal) DOM.mapModal.classList.remove('active');
        });
        
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateMapLayer(btn.dataset.layer);
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== DOM.searchInput) {
                e.preventDefault();
                DOM.searchInput.focus();
            }
            if (e.key === 'Escape') {
                UI.hideError();
                DOM.mapModal.classList.remove('active');
                DOM.searchSuggestions.classList.remove('active');
            }
        });
    },
    
    async handleSearchInput(query) {
        if (query.length < 2) {
            DOM.searchSuggestions.classList.remove('active');
            return;
        }
        
        if (!WeatherAPI.isConfigured()) {
            const demoCities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Dubai', 'Singapore', 'Berlin'];
            const filtered = demoCities.filter(c => c.toLowerCase().includes(query.toLowerCase()));
            this.showSuggestions(filtered);
            return;
        }
        
        try {
            const results = await WeatherAPI.geocodeCity(query);
            const cities = results.slice(0, 5).map(r => `${r.name}, ${r.country}`);
            this.showSuggestions(cities);
        } catch (error) {
            DOM.searchSuggestions.classList.remove('active');
        }
    },
    
    showSuggestions(cities) {
        if (cities.length === 0) {
            DOM.searchSuggestions.classList.remove('active');
            return;
        }
        
        DOM.searchSuggestions.innerHTML = cities.map(city => `
            <div class="suggestion-item" data-city="${city}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/>
                </svg>
                <span>${city}</span>
            </div>
        `).join('');
        
        DOM.searchSuggestions.classList.add('active');
        
        DOM.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const city = item.dataset.city.split(',')[0].trim();
                DOM.searchInput.value = city;
                DOM.searchSuggestions.classList.remove('active');
                this.loadCity(city);
            });
        });
    },
    
    async loadCity(cityName) {
        if (AppState.isLoading) return;
        
        UI.showLoading();
        DOM.searchInput.value = cityName;
        
        try {
            let data;
            
            if (!WeatherAPI.isConfigured()) {
                await new Promise(r => setTimeout(r, 1000));
                data = { ...DemoData.current, name: cityName };
                AppState.currentWeather = data;
                AppState.forecast = DemoData.forecast;
                AppState.currentCity = cityName;
                AppState.coordinates = data.coord;
                UI.updateAQI(DemoData.airQuality);
                UI.updateUV(3.5);
            } else {
                const geoResults = await WeatherAPI.geocodeCity(cityName);
                if (!geoResults || geoResults.length === 0) {
                    throw new Error(`City "${cityName}" not found`);
                }
                
                const { lat, lon, name, country } = geoResults[0];
                AppState.coordinates = { lat, lon };
                AppState.currentCity = name;
                
                const [current, forecast, airQuality] = await Promise.all([
                    WeatherAPI.getCurrentWeather(lat, lon),
                    WeatherAPI.getForecast(lat, lon),
                    WeatherAPI.getAirQuality(lat, lon).catch(() => null)
                ]);
                
                current.name = name;
                current.sys.country = country;
                AppState.currentWeather = current;
                AppState.forecast = forecast;
                
                UI.updateCurrentWeather(current);
                UI.updateHourlyForecast(forecast.list);
                UI.updateDailyForecast(forecast.list);
                UI.updateAQI(airQuality);
                
                const uv = await WeatherAPI.getUVIndex(lat, lon);
                UI.updateUV(uv);
            }
            
            AppState.addToHistory({
                name: AppState.currentCity,
                temp: `${Utils.convertTemp(AppState.currentWeather.main.temp, AppState.unit)}°`
            });
            AppState.setStorage('atmosphere_last_city', AppState.currentCity);
            
            UI.updateCurrentWeather(AppState.currentWeather);
            UI.updateHourlyForecast(AppState.forecast.list);
            UI.updateDailyForecast(AppState.forecast.list);
            UI.updateSidebar();
            
        } catch (error) {
            console.error('Error loading city:', error);
            UI.showError('Search Error', error.message || 'Failed to load weather data. Please try again.');
        } finally {
            UI.hideLoading();
        }
    },
    
    async getUserLocation() {
        if (!navigator.geolocation) {
            UI.showError('Geolocation Error', 'Geolocation is not supported by your browser.', false);
            return;
        }
        
        UI.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    if (!WeatherAPI.isConfigured()) {
                        await new Promise(r => setTimeout(r, 1000));
                        const data = { ...DemoData.current, name: 'Your Location' };
                        AppState.currentWeather = data;
                        AppState.forecast = DemoData.forecast;
                        AppState.currentCity = 'Your Location';
                        AppState.coordinates = { lat: latitude, lon: longitude };
                        UI.updateAQI(DemoData.airQuality);
                        UI.updateUV(3.5);
                    } else {
                        const [current, forecast, location] = await Promise.all([
                            WeatherAPI.getCurrentWeather(latitude, longitude),
                            WeatherAPI.getForecast(latitude, longitude),
                            WeatherAPI.reverseGeocode(latitude, longitude)
                        ]);
                        
                        if (location && location[0]) {
                            current.name = location[0].name;
                            current.sys.country = location[0].country;
                        } else {
                            current.name = 'Your Location';
                        }
                        
                        AppState.currentWeather = current;
                        AppState.forecast = forecast;
                        AppState.currentCity = current.name;
                        AppState.coordinates = { lat: latitude, lon: longitude };
                        
                        const airQuality = await WeatherAPI.getAirQuality(latitude, longitude).catch(() => null);
                        UI.updateAQI(airQuality);
                        
                        const uv = await WeatherAPI.getUVIndex(latitude, longitude);
                        UI.updateUV(uv);
                    }
                    
                    AppState.addToHistory({
                        name: AppState.currentCity,
                        temp: `${Utils.convertTemp(AppState.currentWeather.main.temp, AppState.unit)}°`
                    });
                    
                    UI.updateCurrentWeather(AppState.currentWeather);
                    UI.updateHourlyForecast(AppState.forecast.list);
                    UI.updateDailyForecast(AppState.forecast.list);
                    UI.updateSidebar();
                    
                } catch (error) {
                    UI.showError('Location Error', 'Could not fetch weather for your location.');
                } finally {
                    UI.hideLoading();
                }
            },
            (error) => {
                UI.hideLoading();
                let message = 'Unable to retrieve your location.';
                if (error.code === 1) message = 'Location access denied. Please enable location permissions.';
                if (error.code === 2) message = 'Location unavailable. Please try again.';
                if (error.code === 3) message = 'Location request timed out.';
                UI.showError('Geolocation Error', message, false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
        );
    },
    
    async refreshWeather() {
        if (!AppState.currentCity || AppState.isLoading) return;
        await this.loadCity(AppState.currentCity);
    },
    
    toggleTheme() {
        AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
        AppState.applyTheme();
        AppState.savePreferences();
    },
    
    toggleUnit() {
        AppState.unit = AppState.unit === 'metric' ? 'imperial' : 'metric';
        AppState.applyUnit();
        AppState.savePreferences();
        
        DOM.unitToggle.querySelector('.unit-c').classList.toggle('active', AppState.unit === 'metric');
        DOM.unitToggle.querySelector('.unit-f').classList.toggle('active', AppState.unit === 'imperial');
        
        if (AppState.currentWeather) {
            UI.updateCurrentWeather(AppState.currentWeather);
            UI.updateHourlyForecast(AppState.forecast.list);
            UI.updateDailyForecast(AppState.forecast.list);
        }
    },
    
    toggleFavorite() {
        if (!AppState.currentCity || !AppState.currentWeather) return;
        
        const cityData = {
            name: AppState.currentCity,
            temp: `${Utils.convertTemp(AppState.currentWeather.main.temp, AppState.unit)}°`,
            country: AppState.currentWeather.sys.country
        };
        
        const isFav = AppState.favorites.some(f => f.name === cityData.name);
        
        if (isFav) {
            AppState.removeFavorite(cityData.name);
            DOM.favoriteBtn.classList.remove('favorited');
        } else {
            AppState.addFavorite(cityData);
            DOM.favoriteBtn.classList.add('favorited');
        }
        
        UI.updateSidebar();
    },
    
    openMap() {
        if (!AppState.coordinates) return;
        
        const { lat, lon } = AppState.coordinates;
        const layer = 'temp';
        const zoom = 10;
        
        const mapUrl = `https://openweathermap.org/weathermap?basemap=map&cities=true&layer=${layer}&lat=${lat}&lon=${lon}&zoom=${zoom}`;
        
        DOM.weatherMap.src = mapUrl;
        DOM.mapModal.classList.add('active');
    },
    
    updateMapLayer(layer) {
        if (!AppState.coordinates) return;
        const { lat, lon } = AppState.coordinates;
        const mapUrl = `https://openweathermap.org/weathermap?basemap=map&cities=true&layer=${layer}&lat=${lat}&lon=${lon}&zoom=10`;
        DOM.weatherMap.src = mapUrl;
    }
};

// ============================================
// SERVICE WORKER (PWA)
// ============================================
if ('serviceWorker' in navigator) {
    const swCode = `
        self.addEventListener('install', e => {
            e.waitUntil(
                caches.open('atmosphere-v1').then(cache => {
                    return cache.addAll(['./', './index.html', './style.css', './script.js']);
                })
            );
        });
        self.addEventListener('fetch', e => {
            e.respondWith(
                caches.match(e.request).then(response => {
                    return response || fetch(e.request);
                })
            );
        });
    `;
    
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);
    
    navigator.serviceWorker.register(swUrl).catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});