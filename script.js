const searchBtn = document.querySelector('#searchBtn')
const cityInput = document.querySelector('#cityInput')
const errorMessage = document.querySelector('#errorMessage')
const errorDiv = document.querySelector('#error')


//Weather API Configuration
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

const showError = (message) => {
    errorMessage.textContent = message;
    errorDiv.style.display = 'block';
};

const geocodeCity = async (cityName) => {
    try {
        const response = await fetch(`${GEOCODING_API_URL}?name=${encodeURIComponent(cityName)}&count=1`);

        if (!response.ok) {
            throw new Error('Failed To Fetch GeoCoding Data');
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error('City not found');
        }

        const result = data.results[0];
        return {
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            country: result.country
        };
    } catch (error) {
        throw new Error(error.message);
    }
}


//Function to fetch weather data 
const fetchWeatherData = async (latitude, longitude) => {
    try {
        const response = await fetch(`${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,visibility,uv_index&timezone=auto`);


        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
}

// Function to descibe weather code
const getWeatherDescription = (code) => {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };

    return weatherCodes[code] || 'Unknown weather condition';
}

// function to display weather data
const displayWeatherData = (geoData, weatherData) => {
    const currentWeather = weatherData.current;

    // update the UI with weather data
    document.querySelector('#cityName').textContent = geoData.name;
    document.querySelector('#country').textContent = geoData.country;
    document.querySelector('#temperature').textContent = `${currentWeather.temperature_2m} °C`;
    document.querySelector('#humidity').textContent = `${currentWeather.relative_humidity_2m} %`;
    document.querySelector('#feelsLike').textContent = `${currentWeather.apparent_temperature} °C`;
    document.querySelector('#description').textContent = getWeatherDescription(currentWeather.weather_code);
    document.querySelector('#pressure').textContent = `${currentWeather.pressure_msl} hPa`;
    document.querySelector('#windSpeed').textContent = `${currentWeather.wind_speed_10m} km/h`;
    document.querySelector('#visibility').textContent = `${currentWeather.visibility} m`;
    document.querySelector('#uvIndex').textContent = currentWeather.uv_index;

    document.querySelector('#weatherContainer').style.display = 'block';
};

//Funtion To Handle Search
const handleSearch = async () => {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        showError('Please enter a city name')
        return
    }

try {
     //Geocoding API to get latitude and longitude
    const geoData = await geocodeCity(cityName);

    
        // Weather API to get weather data
    const weatherData = await fetchWeatherData(geoData.latitude, geoData.longitude);

        // Display weather data
    displayWeatherData(geoData, weatherData);

    //Only hide Welcome Section after a successful search
    welcomeSection.style.display = 'none';

} catch (error) {
    showError(error.message);
}

}



//Initialize Event Listener
function initializeEventListeners() {
    searchBtn.addEventListener('click', handleSearch);

    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    })
}

// Initialize The App
const initializeApp = () => {
    initializeEventListeners();
}

//Start The App
document.addEventListener('DOMContentLoaded', initializeApp);