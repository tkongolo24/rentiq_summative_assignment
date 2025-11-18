# 🏠 RentIQ - Rent Intelligence Platform

> Transparent rental pricing data for neighborhoods in Rwanda

![RentIQ Demo](https://img.shields.io/badge/Status-Live-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📖 Overview

RentIQ provides transparent rent data for neighborhoods across Kigali, Rwanda. The platform displays average, minimum, and maximum rental prices for different property types, along with price trends, weather information, and interactive maps.

**Live Demo:** [View on GitHub Pages](#) _(add link after deployment)_

## ✨ Features

- 🔍 **Neighborhood Search** - Search across 8 major Kigali neighborhoods
- 🏘️ **Property Types** - Studio, 1BR, 2BR, 3BR apartments
- 💱 **Multi-Currency** - View prices in RWF, USD, or EUR
- 📊 **Price Trends** - 4-month historical price charts
- 🗺️ **Interactive Maps** - Location visualization with OpenStreetMap
- 🌤️ **Live Weather** - Current weather for each neighborhood
- 🔄 **Filter & Sort** - By property type and price range
- 📱 **Mobile Responsive** - Works on desktop, tablet, and mobile

## 🚀 Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Charts:** Chart.js 4.4.0
- **Maps:** Leaflet.js 1.9.4
- **APIs:**
  - [OpenWeatherMap API](https://openweathermap.org/api) - Weather data
  - [ExchangeRate-API](https://www.exchangerate-api.com/) - Currency conversion
  - [OpenStreetMap/Nominatim](https://www.openstreetmap.org/) - Maps

## 📂 Project Structure
```
rentiq/
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS styling
├── app.js             # Application logic
├── config.js          # API configuration (gitignored)
├── data/
│   └── rwanda.json    # Rent data for Rwanda
└── README.md          # Documentation
```

## 🛠️ Local Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code recommended)
- Live Server extension (for development)

### Setup Steps

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/rentiq.git
   cd rentiq
```

2. **Create config.js file**
```bash
   cp config.example.js config.js
```

3. **Add your API keys to config.js**
```javascript
   const CONFIG = {
       WEATHER_API_KEY: 'your-openweathermap-key-here',
       // ...
   };
```

4. **Run with Live Server**
   - Open folder in VS Code
   - Right-click `index.html`
   - Select "Open with Live Server"
   - App opens at `http://localhost:5500`

### Alternative: Python Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000`

## 🔑 API Keys Setup

### OpenWeatherMap (Required for weather feature)

1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Navigate to API keys section
4. Copy your API key
5. Add to `config.js`

**Note:** Free tier includes 60 calls/minute (more than enough)

### ExchangeRate-API (No key needed)
- Uses free public endpoint
- No registration required

## 📊 Data Sources

### Rent Data
- **Source:** Market research and aggregated listings
- **Coverage:** 8 neighborhoods in Kigali
- **Properties:** Studio to 3-bedroom apartments
- **Update Frequency:** Quarterly

### Neighborhoods Included
- Kimironko
- Kacyiru
- Nyarutarama
- Remera
- Gikondo
- Kigali Heights
- Kibagabaga
- Nyamirambo

## 🎯 Usage Examples

### Search for Neighborhood
1. Type neighborhood name in search box
2. Click "Search" or press Enter
3. View property listings with prices

### Filter Properties
- Use "Property Type" dropdown to filter by bedroom count
- Results update instantly

### Sort by Price
- Select "Low to High" or "High to Low"
- Helps find properties within budget

### Change Currency
- Select USD or EUR from currency dropdown
- All prices convert using live exchange rates

## 🚢 Deployment

### Deployed on Web Servers
- **Web01:** [IP/URL here]
- **Web02:** [IP/URL here]
- **Load Balancer:** [IP/URL here]

### Deployment Steps

1. **Copy files to servers**
```bash
   scp -r * user@web01:/var/www/rentiq/
   scp -r * user@web02:/var/www/rentiq/
```

2. **Configure Nginx on servers**
```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/rentiq;
       index index.html;
   }
```

3. **Setup Load Balancer**
```nginx
   upstream rentiq_backend {
       server web01_ip:80;
       server web02_ip:80;
   }
   
   server {
       listen 80;
       location / {
           proxy_pass http://rentiq_backend;
       }
   }
```

4. **Test load balancing**
```bash
   curl http://load-balancer-ip
```

_Detailed deployment guide coming after server access confirmed_

## 🐛 Known Issues & Limitations

- Weather API key takes 10-15 minutes to activate after signup
- Exchange rates update once per day (sufficient for rent prices)
- Map requires internet connection (OpenStreetMap tiles)
- Data currently limited to Kigali (expansion planned)

## 🔮 Future Enhancements

- [ ] Add Kenya, Uganda, Nigeria, Ghana
- [ ] User accounts and saved searches
- [ ] Email alerts for price changes
- [ ] Landlord dashboard for listing properties
- [ ] Advanced filters (amenities, proximity to landmarks)
- [ ] Comparison tool (side-by-side neighborhoods)
- [ ] Mobile app (React Native)

## 🤝 Contributing

This is an educational project, but suggestions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request


## 🙏 Credits & Acknowledgments

- **Weather Data:** OpenWeatherMap
- **Maps:** OpenStreetMap & Leaflet.js
- **Charts:** Chart.js
- **Currency Data:** ExchangeRate-API

## 👤 Author

**Your Name**
- GitHub: [@tkongolo24](https://github.com/tkongolo24)
- Email: t.kongolo@alustudent.com

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Email: t.kongolo@alustudent.com

---

**Built with ❤️ for transparent housing markets in Africa**