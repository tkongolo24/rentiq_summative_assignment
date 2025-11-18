// ===================================
// Global Variables & State Management
// ===================================

let rwandaData = null; // stores our rent data
let currentNeighborhood = null; // tracks which neighborhood is displayed
let currentProperties = []; // filtered/sorted properties
let exchangeRates = null; // currency conversion rates
let map = null; // Leaflet map instance
let chart = null; // Chart.js instance

// ===================================
// Caching & Rate Limiting
// ===================================

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const weatherCache = new Map(); // stores weather data temporarily
const exchangeRateCache = { data: null, timestamp: null };

// Check if cached data is still valid
function isCacheValid(timestamp) {
    return timestamp && (Date.now() - timestamp < CACHE_DURATION);
}

// ===================================
// Initialize App When Page Loads
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 RentIQ initializing...');
    
    // Load the rent data first
    loadRentData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load exchange rates in background
    loadExchangeRates();
});

// ===================================
// Load Rwanda Rent Data (Our JSON)
// ===================================

async function loadRentData() {
    try {
        console.log('📊 Loading Rwanda rent data...');
        
        const response = await fetch('data/rwanda.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status}`);
        }
        
        rwandaData = await response.json();
        console.log('✅ Rent data loaded successfully');
        
        // Populate the autocomplete datalist
        populateNeighborhoodList();
        
    } catch (error) {
        console.error('❌ Error loading rent data:', error);
        showError('Failed to load rental data. Please refresh the page.');
    }
}

// ===================================
// Populate Autocomplete List
// ===================================

function populateNeighborhoodList() {
    const datalist = document.getElementById('neighborhoodList');
    
    if (!rwandaData || !rwandaData.neighborhoods) {
        console.warn('⚠️ No neighborhood data available');
        return;
    }
    
    // Clear existing options
    datalist.innerHTML = '';
    
    // Add each neighborhood as an option
    rwandaData.neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.value = neighborhood.name;
        datalist.appendChild(option);
    });
    
    console.log(`✅ Added ${rwandaData.neighborhoods.length} neighborhoods to autocomplete`);
}

// ===================================
// Event Listeners Setup
// ===================================

function setupEventListeners() {
    // Search button click
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.addEventListener('click', handleSearch);
    
    // Enter key in search box
    const searchInput = document.getElementById('neighborhoodSearch');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Property type filter
    const propertyFilter = document.getElementById('propertyFilter');
    propertyFilter.addEventListener('change', applyFiltersAndSort);
    
    // Sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', applyFiltersAndSort);
    
    // Currency selector
    const currencySelect = document.getElementById('currencySelect');
    currencySelect.addEventListener('change', handleCurrencyChange);
    
    console.log('✅ Event listeners set up');
}

// ===================================
// Handle Search
// ===================================

function handleSearch() {
    const searchInput = document.getElementById('neighborhoodSearch');
    const searchTerm = searchInput.value.trim();
    
    // Validation - check if input is empty
    if (!searchTerm) {
        showError('⚠️ Please enter a neighborhood name');
        return;
    }
    
    // Check if data is loaded
    if (!rwandaData) {
        showError('⚠️ Data is still loading. Please wait a moment and try again.');
        return;
    }
    
    // Find the neighborhood (case-insensitive search)
    const neighborhood = rwandaData.neighborhoods.find(
        n => n.name.toLowerCase() === searchTerm.toLowerCase()
    );
    
    if (!neighborhood) {
        showError(`❌ Neighborhood "${searchTerm}" not found. Try: Kimironko, Kacyiru, Remera, Gikondo, etc.`);
        return;
    }
    
    // Clear any previous errors
    hideError();
    
    // Display the results
    displayNeighborhood(neighborhood);
}

// ===================================
// Display Neighborhood Data
// ===================================

function displayNeighborhood(neighborhood) {
    console.log(`📍 Displaying data for: ${neighborhood.name}`);
    
    currentNeighborhood = neighborhood;
    currentProperties = [...neighborhood.properties]; // make a copy
    
    // Show the results section
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
    
    // Update neighborhood name
    document.getElementById('neighborhoodName').textContent = neighborhood.name;
    
    // Load weather data for this location
    loadWeatherData(neighborhood.coordinates);
    
    // Apply any active filters and sorting
    applyFiltersAndSort();
    
    // Initialize the map
    initializeMap(neighborhood);
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===================================
// Display Property Cards
// ===================================

function displayProperties(properties) {
    const grid = document.getElementById('propertyGrid');
    
    // Clear existing cards
    grid.innerHTML = '';
    
    if (properties.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No properties match your filters.</p>';
        return;
    }
    
    // Get selected currency
    const selectedCurrency = document.getElementById('currencySelect').value;
    
    // Create a card for each property
    properties.forEach(property => {
        const card = createPropertyCard(property, selectedCurrency);
        grid.appendChild(card);
    });
    
    // Update the trend chart with first property's data
    if (properties.length > 0) {
        updateTrendChart(properties);
    }
}

// ===================================
// Create Individual Property Card
// ===================================

function createPropertyCard(property, currency) {
    const card = document.createElement('div');
    card.className = 'property-card';
    
    // Convert prices if needed
    const prices = convertPrices(property, currency);
    
    card.innerHTML = `
        <h3>${property.type}</h3>
        
        <div class="avg-price-highlight">
            <div class="price-label">Average Monthly Rent</div>
            <div class="price-value">${prices.avg}</div>
        </div>
        
        <div class="price-info">
            <span class="price-label"><iconify-icon icon="mdi:cash-minus" width="18"></iconify-icon> Minimum:</span>
            <span class="price-value">${prices.min}</span>
        </div>
        
        <div class="price-info">
            <span class="price-label"><iconify-icon icon="mdi:cash-plus" width="18"></iconify-icon> Maximum:</span>
            <span class="price-value">${prices.max}</span>
        </div>
    `;
    
    return card;
}

// ===================================
// Currency Conversion
// ===================================

function convertPrices(property, targetCurrency) {
    // If RWF or no rates loaded, return original
    if (targetCurrency === 'RWF' || !exchangeRates) {
        return {
            avg: formatCurrency(property.avg_price, 'RWF'),
            min: formatCurrency(property.min, 'RWF'),
            max: formatCurrency(property.max, 'RWF')
        };
    }
    
    // Get conversion rate
    const rate = exchangeRates.rates[targetCurrency];
    
    if (!rate) {
        console.warn(`⚠️ No rate found for ${targetCurrency}, using RWF`);
        return {
            avg: formatCurrency(property.avg_price, 'RWF'),
            min: formatCurrency(property.min, 'RWF'),
            max: formatCurrency(property.max, 'RWF')
        };
    }
    
    // Convert from RWF to target currency
    return {
        avg: formatCurrency(property.avg_price * rate, targetCurrency),
        min: formatCurrency(property.min * rate, targetCurrency),
        max: formatCurrency(property.max * rate, targetCurrency)
    };
}

// ===================================
// Format Currency Display
// ===================================

function formatCurrency(amount, currency) {
    // Round to 2 decimal places for non-RWF
    const rounded = currency === 'RWF' ? Math.round(amount) : amount.toFixed(2);
    
    // Add thousand separators
    const formatted = Number(rounded).toLocaleString();
    
    // Add currency symbol
    const symbols = {
        'RWF': 'RWF',
        'USD': '$',
        'EUR': '€'
    };
    
    return currency === 'USD' || currency === 'EUR' 
        ? `${symbols[currency]}${formatted}`
        : `${formatted} ${symbols[currency]}`;
}

// ===================================
// Apply Filters and Sorting
// ===================================

function applyFiltersAndSort() {
    if (!currentNeighborhood) return;
    
    let filtered = [...currentNeighborhood.properties];
    
    // Apply property type filter
    const filterValue = document.getElementById('propertyFilter').value;
    if (filterValue !== 'all') {
        filtered = filtered.filter(p => p.type === filterValue);
    }
    
    // Apply sorting
    const sortValue = document.getElementById('sortSelect').value;
    if (sortValue === 'asc') {
        filtered.sort((a, b) => a.avg_price - b.avg_price);
    } else if (sortValue === 'desc') {
        filtered.sort((a, b) => b.avg_price - a.avg_price);
    }
    
    currentProperties = filtered;
    displayProperties(filtered);
}

// ===================================
// Handle Currency Change
// ===================================

function handleCurrencyChange() {
    // Redisplay properties with new currency
    if (currentProperties.length > 0) {
        displayProperties(currentProperties);
    }
}

// ===================================
// Load Exchange Rates (External API #1)
// ===================================
// ===================================
// Load Exchange Rates with Caching
// ===================================

async function loadExchangeRates() {
    // Check cache first (only fetch once per day)
    if (exchangeRateCache.data && isCacheValid(exchangeRateCache.timestamp)) {
        console.log('✅ Using cached exchange rates');
        exchangeRates = exchangeRateCache.data;
        updateExchangeRateInfo();
        return;
    }
    
    try {
        console.log('💱 Loading exchange rates from API...');
        
        const response = await fetch(CONFIG.EXCHANGE_RATE_API);
        
        if (!response.ok) {
            throw new Error('Exchange rate API failed');
        }
        
        const data = await response.json();
        
        // Cache for 30 minutes (rates don't change often)
        exchangeRateCache.data = data;
        exchangeRateCache.timestamp = Date.now();
        
        exchangeRates = data;
        console.log('✅ Exchange rates loaded and cached');
        
        updateExchangeRateInfo();
        
    } catch (error) {
        console.error('❌ Error loading exchange rates:', error);
        document.getElementById('exchangeRateInfo').textContent = 
            '⚠️ Currency conversion temporarily unavailable. Showing prices in RWF only.';
    }
}

// ===================================
// Update Exchange Rate Info Display
// ===================================

function updateExchangeRateInfo() {
    if (!exchangeRates) return;
    
    const infoDiv = document.getElementById('exchangeRateInfo');
    const usdRate = exchangeRates.rates.USD;
    const eurRate = exchangeRates.rates.EUR;
    
    if (usdRate && eurRate) {
        infoDiv.innerHTML = `
            <small>Current rates: 1 RWF = $${usdRate.toFixed(6)} USD | €${eurRate.toFixed(6)} EUR</small>
        `;
    }
}

// ===================================
// Load Weather Data (External API #2)
// ===================================

// ===================================
// Load Weather Data with Caching
// ===================================

async function loadWeatherData(coordinates) {
    const weatherDiv = document.getElementById('weatherInfo');
    
    // Check if API key is configured
    if (CONFIG.WEATHER_API_KEY === 'YOUR_OPENWEATHER_KEY_HERE') {
        console.warn('⚠️ Weather API key not configured');
        weatherDiv.innerHTML = '<small>Weather data unavailable<br>(API key not set)</small>';
        return;
    }
    
    // Create cache key from coordinates
    const cacheKey = `${coordinates.lat},${coordinates.lon}`;
    
    // Check cache first
    const cached = weatherCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        console.log('✅ Using cached weather data (saves API call!)');
        displayWeather(cached.data, weatherDiv);
        return;
    }
    
    try {
        console.log('🌤️ Loading weather data from API...');
        
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache the result for 30 minutes
        weatherCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        displayWeather(data, weatherDiv);
        console.log('✅ Weather data loaded and cached');
        
    } catch (error) {
        console.error('❌ Error loading weather:', error);
        weatherDiv.innerHTML = '<small>Weather data<br>unavailable</small>';
    }
}

// Helper function to display weather
function displayWeather(data, weatherDiv) {
    weatherDiv.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
        <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
        <div class="weather-desc">${data.weather[0].description}</div>
    `;
}

// ===================================
// Initialize Map (External API #3)
// ===================================

function initializeMap(neighborhood) {
    const mapDiv = document.getElementById('map');
    
    try {
        // Destroy existing map if any
        if (map) {
            map.remove();
        }
        
        // Create new map centered on neighborhood
        map = L.map('map').setView(
            [neighborhood.coordinates.lat, neighborhood.coordinates.lon], 
            14 // zoom level
        );
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add marker for neighborhood
        L.marker([neighborhood.coordinates.lat, neighborhood.coordinates.lon])
            .addTo(map)
            .bindPopup(`<b>${neighborhood.name}</b><br>Click to view on larger map`)
            .openPopup();
        
        console.log('✅ Map initialized');
        
    } catch (error) {
        console.error('❌ Error initializing map:', error);
        mapDiv.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">Map unavailable</p>';
    }
}

// ===================================
// Update Trend Chart
// ===================================

function updateTrendChart(properties) {
    const canvas = document.getElementById('trendChart');
    const ctx = canvas.getContext('2d');
    
    try {
        // Destroy existing chart if any
        if (chart) {
            chart.destroy();
        }
        
        // Get selected currency for chart
        const selectedCurrency = document.getElementById('currencySelect').value;
        
        // Prepare datasets for each property type
        const datasets = properties.map((property, index) => {
            // Convert trend data if needed
            let trendData = property.trend;
            
            if (selectedCurrency !== 'RWF' && exchangeRates) {
                const rate = exchangeRates.rates[selectedCurrency];
                if (rate) {
                    trendData = property.trend.map(price => price * rate);
                }
            }
            
            // Colors for different property types
            const colors = [
                'rgba(102, 126, 234, 1)',
                'rgba(118, 75, 162, 1)',
                'rgba(237, 100, 166, 1)',
                'rgba(255, 154, 158, 1)'
            ];
            
            return {
                label: property.type,
                data: trendData,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length].replace('1)', '0.1)'),
                tension: 0.3,
                fill: true
            };
        });
        
        // Create new chart
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['3 Months Ago', '2 Months Ago', 'Last Month', 'Current'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                const value = context.parsed.y;
                                label += formatCurrency(value, selectedCurrency);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                // Format y-axis labels
                                if (selectedCurrency === 'RWF') {
                                    return value.toLocaleString() + ' RWF';
                                } else {
                                    const symbols = { 'USD': '$', 'EUR': '€' };
                                    return symbols[selectedCurrency] + value.toFixed(0);
                                }
                            }
                        }
                    }
                }
            }
        });
        
        console.log('✅ Chart updated');
        
    } catch (error) {
        console.error('❌ Error creating chart:', error);
        canvas.parentElement.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">Chart unavailable</p>';
    }
}

// ===================================
// Error Handling Utilities
// ===================================

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    // Hide results if showing
    document.getElementById('results').classList.add('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.add('hidden');
}

// ===================================
// Utility: Show Loading State
// ===================================

function showLoading() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
}

// ===================================
// Log startup info
// ===================================

console.log('%c🏠 RentIQ Initialized', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('Version: 1.0.0');
console.log('Data: Rwanda (8 neighborhoods)');
console.log('APIs: Weather, Exchange Rates, Maps');

// ===================================
// API Usage Statistics (for testing)
// ===================================

window.getAPIStats = function() {
    console.log('=== API USAGE STATS ===');
    console.log(`Weather cache size: ${weatherCache.size} neighborhoods`);
    console.log(`Exchange rate cached: ${exchangeRateCache.data ? 'Yes' : 'No'}`);
    
    let savedCalls = 0;
    weatherCache.forEach((value, key) => {
        const age = Math.round((Date.now() - value.timestamp) / 1000 / 60);
        console.log(`  ${key}: cached ${age} minutes ago`);
        savedCalls++;
    });
    
    console.log(`Total API calls saved: ~${savedCalls * 10} (estimated)`);
    console.log('======================');
};