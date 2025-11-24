# 🏠 RentIQ - Rent Intelligence Platform

> Transparent rental pricing data for neighborhoods in Rwanda

![RentIQ Demo](https://img.shields.io/badge/Status-Live-success)
![Deployment](https://img.shields.io/badge/Deployment-Production-blue)

## 📖 Overview

RentIQ provides transparent rent data for neighborhoods across Kigali, Rwanda. The platform displays average, minimum, and maximum rental prices for different property types, along with price trends, weather information, and interactive maps.

**🌐 Live Application:** http://3.86.198.215
**Link to demo video:**https://youtu.be/d6zvoS3xtCg

**Architecture:** Load-balanced deployment across multiple web servers

## ✨ Features

- 🔍 **Neighborhood Search** - Search across 8 major Kigali neighborhoods
- 🏘️ **Property Types** - Studio, 1BR, 2BR, 3BR apartments
- 💱 **Multi-Currency Support** - View prices in RWF, USD, or EUR with live exchange rates
- 📊 **Price Trends** - 4-month historical price charts using Chart.js
- 🗺️ **Interactive Maps** - Location visualization with Leaflet.js and OpenStreetMap
- 🌤️ **Live Weather Integration** - Real-time weather data via OpenWeatherMap API
- 🔄 **Dynamic Filtering** - Filter by property type and sort by price
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices

## 🏗️ Architecture
```
Internet Traffic
       ↓
┌──────────────────┐
│  Load Balancer   │ - HAProxy (3.86.198.215)
│   (Lb01)         │ - Round-robin distribution
└──────────────────┘ - Health checks enabled
       ↓
┌──────────────────┐
│   Web Server     │ - Nginx (3.92.202.78)
│   (Web02)        │ - Serves static files
└──────────────────┘ - Security headers enabled
       ↓
┌──────────────────┐
│   RentIQ App     │ - HTML/CSS/JavaScript
│                  │ - External API integration
└──────────────────┘
```

## 🚀 Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with Flexbox/Grid
- **Vanilla JavaScript** - No frameworks, pure ES6+

### Libraries & APIs
- **Chart.js 4.4.0** - Data visualization
- **Leaflet.js 1.9.4** - Interactive maps
- **OpenWeatherMap API** - Real-time weather data
- **ExchangeRate-API** - Currency conversion
- **OpenStreetMap/Nominatim** - Geocoding and map tiles

### Infrastructure
- **Nginx** - Web server
- **HAProxy** - Load balancer
- **Ubuntu 20.04 LTS** - Server OS
- **Git** - Version control

## 📂 Project Structure
```
rentiq/
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS styling  
├── app.js             # Application logic & API calls
├── config.js          # API configuration (gitignored)
├── data/
│   └── rwanda.json    # Rent data for 8 neighborhoods
├── .gitignore         # Excludes sensitive files
└── README.md          # Documentation
```

## 🛠️ Local Development Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code recommended)
- Live Server extension OR Python 3

### Installation Steps

**1. Clone the repository**
```bash
git clone https://github.com/tkongolo24/rentiq_summative_assignment.git
cd rentiq_summative_assignment
```

**2. Create config.js file**
```bash
touch config.js
```

**3. Add your API configuration**

Edit `config.js`:
```javascript
const CONFIG = {
    WEATHER_API_KEY: 'your-openweathermap-api-key',
    WEATHER_API_URL: 'https://api.openweathermap.org/data/2.5/weather',
    EXCHANGE_RATE_API_URL: 'https://api.exchangerate-api.com/v4/latest/RWF',
    GEOCODING_API_URL: 'https://nominatim.openstreetmap.org/search'
};
```

**4. Run locally**

**Option A: VS Code Live Server**
- Install Live Server extension
- Right-click `index.html` → "Open with Live Server"
- App opens at `http://localhost:5500`

**Option B: Python HTTP Server**
```bash
# Python 3
python3 -m http.server 8000

# Then open http://localhost:8000
```

## 🔑 API Keys Setup

### OpenWeatherMap API (Required)

1. Visit https://openweathermap.org/api
2. Sign up for free account
3. Navigate to API Keys section
4. Generate new key
5. Add to `config.js`

**Note:** 
- Free tier: 60 calls/minute, 1,000,000 calls/month
- Key activation takes 10-15 minutes

### ExchangeRate-API (No Setup Required)
- Uses free public endpoint
- No registration or key needed
- Updates daily

## 📊 Data & Coverage

### Neighborhoods
- **Kimironko** - Central, mixed residential
- **Kacyiru** - Government district
- **Nyarutarama** - Upscale residential
- **Remera** - Commercial hub
- **Gikondo** - Industrial area
- **Kigali Heights** - High-end apartments
- **Kibagabaga** - Student-friendly
- **Nyamirambo** - Traditional neighborhood

### Property Types
- Studio apartments
- 1-bedroom apartments
- 2-bedroom apartments
- 3-bedroom apartments

### Data Sources
- Market research and aggregated listings
- Quarterly updates
- Prices in Rwandan Francs (RWF)

## 🚢 Deployment Guide

### Current Production Deployment

**Servers:**
- **Load Balancer:** 3.86.198.215 (Lb01)
- **Web Server:** 3.92.202.78 (Web02)

### Deploy to New Server

**1. Server Requirements**
- Ubuntu 20.04+ LTS
- Nginx installed
- SSH access with sudo privileges

**2. Install Dependencies**
```bash
ssh ubuntu@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx git -y
```

**3. Deploy Application**
```bash
# Create web directory
sudo mkdir -p /var/www/rentiq
sudo chown -R $USER:$USER /var/www/rentiq

# Clone repository
cd /var/www/rentiq
git clone https://github.com/tkongolo24/rentiq_summative_assignment.git .

# Create config.js with your API keys
nano config.js
```

**4. Configure Nginx**
```bash
sudo tee /etc/nginx/sites-available/rentiq << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    root /var/www/rentiq;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/rentiq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Load Balancer Setup (HAProxy)

**On Load Balancer Server:**
```bash
# Install HAProxy
sudo apt install haproxy -y

# Configure
sudo tee /etc/haproxy/haproxy.cfg << 'EOF'
global
    log /dev/log local0
    daemon

defaults
    log global
    mode http
    timeout connect 5000
    timeout client 50000
    timeout server 50000

frontend rentiq_frontend
    bind *:80
    default_backend rentiq_servers

backend rentiq_servers
    balance roundrobin
    option httpchk GET /
    server web02 3.92.202.78:80 check
EOF

# Start HAProxy
sudo systemctl restart haproxy
```

## 🎯 Usage Guide

### Search for Neighborhood
1. Type neighborhood name in search box (e.g., "Kimironko")
2. Autocomplete suggestions appear
3. Click "Search" or press Enter
4. View all properties in that area

### Filter & Sort
- **Filter by Property Type:** Use dropdown to show only specific bedroom counts
- **Sort by Price:** Arrange from low-to-high or high-to-low

### Currency Conversion
1. Select currency from dropdown (RWF, USD, EUR)
2. All prices convert instantly using live exchange rates
3. Exchange rate information displayed below selector

### View Trends & Maps
- **Price Trends:** Scroll to chart showing 4-month historical data
- **Interactive Map:** Explore neighborhood location and surroundings

## 🔒 Security Features

- ✅ Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- ✅ API keys excluded from repository (`.gitignore`)
- ✅ Sensitive files blocked in Nginx config
- ✅ HTTPS ready (certificate can be added with Certbot)

## 🐛 Troubleshooting

### Weather Not Loading
- Check API key is correct in `config.js`
- Wait 10-15 minutes after creating new OpenWeatherMap key
- Check browser console for error messages

### Map Not Displaying
- Ensure internet connection (OpenStreetMap requires external tiles)
- Check browser console for Leaflet.js errors

### Prices Not Converting
- ExchangeRate-API may be temporarily unavailable
- App will fall back to RWF display

## 🔮 Roadmap

**Phase 1: Expansion** (Q1 2026)
- [ ] Add Kenya (Nairobi neighborhoods)
- [ ] Add Uganda (Kampala neighborhoods)
- [ ] Add Nigeria (Lagos neighborhoods)

**Phase 2: User Features** (Q2 2026)
- [ ] User accounts and authentication
- [ ] Saved searches and favorites
- [ ] Email alerts for price changes
- [ ] Property comparison tool

**Phase 3: Platform** (Q3 2026)
- [ ] Landlord dashboard for listings
- [ ] Advanced filters (amenities, transport access)
- [ ] Mobile app (React Native)
- [ ] API for third-party integration

## 🤝 Contributing

This project is part of an educational assignment, but feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is created for educational purposes as part of ALX Software Engineering program.

## 🙏 Acknowledgments

- **ALX Africa** - Software Engineering Program
- **Holberton School** - Curriculum and infrastructure
- **OpenWeatherMap** - Weather data API
- **OpenStreetMap** - Mapping data and tiles
- **Chart.js Team** - Visualization library
- **Leaflet.js Team** - Mapping library

## 👤 Author

**Tumba II Zikoranachukwudi Kongolo**
- GitHub: [@tkongolo24](https://github.com/tkongolo24)
- Email: t.kongolo@alustudent.com
- Project: ALX Software Engineering - Web Infrastructure

## 📞 Support & Contact

For questions, issues, or suggestions:
- 📧 Email: t.kongolo@alustudent.com
- 🐛 GitHub Issues: [Create an issue](https://github.com/tkongolo24/rentiq_summative_assignment/issues)

---

**Built with ❤️ for transparent housing markets across Africa**

*Deployed on scalable infrastructure with load balancing and high availability*
