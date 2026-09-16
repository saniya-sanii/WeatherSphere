// ==========================================
// WeatherSphere - Weather API
// ==========================================

// Your OpenWeather API key

const apiKey = API_KEY;

// ==========================================
// Get HTML Elements
// ==========================================



const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const temperature = document.getElementById("temperature");
const city = document.getElementById("city");
const condition = document.getElementById("condition");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

const weatherIcon = document.getElementById("weatherIcon");
const feelsLike = document.getElementById("feelsLike");

const date = document.getElementById("date");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const hourlyContainer = document.getElementById("hourlyContainer");
const forecastContainer = document.getElementById("forecastContainer");

const loadingIndicator = document.getElementById("loadingIndicator");
const errorContainer = document.getElementById("errorContainer");
const errorMessage = document.getElementById("errorMessage");
const closeErrorBtn = document.getElementById("closeErrorBtn");


// ==========================================
// Search Trigger Events
// ==========================================

searchBtn.addEventListener("click", () => {

    const cityName = cityInput.value.trim();

    if (cityName === "") {

        showError("Please enter a city name.");

        return;
    }

    fetchWeatherData(cityName);

});

cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        searchBtn.click();

    }

});

closeErrorBtn.addEventListener("click", () => {

    hideError();

});


// ==========================================
// Central Fetch Coordinator
// ==========================================

async function fetchWeatherData(cityName) {

    showLoading(true);
    hideError();

    // Clear dynamic lists to prevent displaying stale data
    hourlyContainer.innerHTML = "";
    forecastContainer.innerHTML = "";

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`;

    try {

        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        // Handle Weather API Errors
        if (weatherData.cod !== 200) {

            handleApiError(weatherData);

            return;
        }

        // Handle Forecast API Errors
        if (forecastData.cod !== "200" && forecastData.cod !== 200) {

            handleApiError(forecastData);

            return;
        }

        // Update UI panels with retrieved data
        updateCurrentWeather(weatherData);
        updateHourlyForecast(forecastData);
        update5DayForecast(forecastData);

    }

    catch (error) {

        console.error("Fetch Error:", error);

        showError("Network error. Unable to connect to the weather service.");

    }

    finally {

        showLoading(false);

    }

}


// ==========================================
// API Error Handler
// ==========================================

function handleApiError(data) {

    const errorCode = data.cod ? String(data.cod) : "";

    if (errorCode === "404") {

        showError("City not found. Please check spelling and try again.");

    } else if (errorCode === "401") {

        showError("Invalid API key. Please check your developer configuration.");

    } else {

        showError(`Service Error: ${data.message || "An unknown error occurred."}`);

    }

}


// ==========================================
// Show / Hide Loading and Errors
// ==========================================

function showLoading(isLoading) {

    if (isLoading) {

        loadingIndicator.classList.remove("hidden");

    } else {

        loadingIndicator.classList.add("hidden");

    }

}

function showError(message) {

    errorMessage.textContent = message;

    errorContainer.classList.remove("hidden");

}

function hideError() {

    errorContainer.classList.add("hidden");

}


// ==========================================
// Update Current Weather Panel
// ==========================================

function updateCurrentWeather(data) {

    // Temperature
    temperature.textContent = `${Math.round(data.main.temp)}°C`;

    // Feels Like
    feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;

    // City Name
    city.textContent = data.name;

    // Weather Description (capitalized)
    const rawDesc = data.weather[0].description;

    condition.textContent = rawDesc.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Weather Icon
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = rawDesc;

    // Date
    const today = new Date();

    date.textContent = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Sunrise
    const sunriseTime = new Date(data.sys.sunrise * 1000);

    sunrise.textContent = `Sunrise ${sunriseTime.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    })}`;

    // Sunset
    const sunsetTime = new Date(data.sys.sunset * 1000);

    sunset.textContent = `Sunset ${sunsetTime.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    })}`;

    // Humidity
    humidity.textContent = `${data.main.humidity}%`;

    // Wind Speed (converted from m/s to km/h)
    const windSpeedKmH = Math.round(data.wind.speed * 3.6);

    wind.textContent = `${windSpeedKmH} km/h`;

    // Pressure
    pressure.textContent = `${data.main.pressure} hPa`;

    // Visibility (converted to km)
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

}


// ==========================================
// Update Hourly Forecast (Upcoming 24h)
// ==========================================

function updateHourlyForecast(forecastData) {

    hourlyContainer.innerHTML = "";

    // Show upcoming 8 data points (representing 24 hours of 3-hourly intervals)
    const next24Hours = forecastData.list.slice(0, 8);

    next24Hours.forEach(item => {

        const time = new Date(item.dt * 1000).toLocaleTimeString("en-IN", {
            hour: "numeric",
            hour12: true
        });

        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        const description = item.weather[0].description;
        const capitalizedDescription = description.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const hourCard = document.createElement("div");

        hourCard.classList.add("hour-card");

        hourCard.innerHTML = `
            <p>${time}</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
            <h3>${temp}°C</h3>
            <span class="hour-cond">${capitalizedDescription}</span>
        `;

        hourlyContainer.appendChild(hourCard);

    });

}


// ==========================================
// Update 5-Day Forecast
// ==========================================

function update5DayForecast(forecastData) {

    forecastContainer.innerHTML = "";

    const dailyForecasts = {};
    const todayDateStr = forecastData.list[0].dt_txt.split(" ")[0];

    // Group 3-hour forecasts by day, picking the midday representative forecast
    forecastData.list.forEach(item => {

        const dateStr = item.dt_txt.split(" ")[0];

        if (dateStr === todayDateStr) return; // skip current day for 5-day forecast

        const hour = new Date(item.dt * 1000).getHours();

        if (!dailyForecasts[dateStr]) {

            dailyForecasts[dateStr] = item;

        } else {

            // Keep the interval closest to 12:00 PM (noon)
            const currentHour = new Date(dailyForecasts[dateStr].dt * 1000).getHours();

            if (Math.abs(hour - 12) < Math.abs(currentHour - 12)) {

                dailyForecasts[dateStr] = item;

            }

        }

    });

    let days = Object.values(dailyForecasts);

    // Fallback: if timezone bounds return fewer than 5 future days, use all unique days (including today)
    if (days.length < 5) {

        const allDailyForecasts = {};

        forecastData.list.forEach(item => {

            const dateStr = item.dt_txt.split(" ")[0];

            if (!allDailyForecasts[dateStr]) {

                allDailyForecasts[dateStr] = item;

            }

        });

        days = Object.values(allDailyForecasts).slice(0, 5);

    } else {

        days = days.slice(0, 5);

    }

    days.forEach(item => {

        const forecastDate = new Date(item.dt * 1000);

        const dayName = forecastDate.toLocaleDateString("en-IN", {
            weekday: "long"
        });

        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        const description = item.weather[0].description;

        const capitalizedDescription = description.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const card = document.createElement("div");

        card.classList.add("forecast-card");

        card.innerHTML = `
            <h3>${dayName}</h3>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
            <p>${temp}°C</p>
            <small>${capitalizedDescription}</small>
        `;

        forecastContainer.appendChild(card);

    });

}


// ==========================================
// Default City Load
// ==========================================

fetchWeatherData("Davanagere");