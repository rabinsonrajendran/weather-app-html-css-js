// ========================================
// DOM ELEMENTS
// ========================================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const weatherCard = document.getElementById("weatherCard");

const forecastSection =
    document.getElementById("forecastSection");

const forecastCards =
    document.getElementById("forecastCards");

const cityName =
    document.getElementById("cityName");

const temperature =
    document.getElementById("temperature");

const condition =
    document.getElementById("condition");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const feelsLike =
    document.getElementById("feelsLike");

const weatherIcon =
    document.getElementById("weatherIcon");

const spinner =
    document.getElementById("spinner");

const errorMessage =
    document.getElementById("errorMessage");

const emptyState =
    document.getElementById("emptyState");

const historyContainer =
    document.getElementById("searchHistory");

const unitToggle =
    document.getElementById("unitToggle");


// ========================================
// API
// ========================================

// Put your WeatherAPI key here
const API_KEY = "742b5252cc394454a28111505260611";;


// ========================================
// APPLICATION STATE
// ========================================

let weatherData = null;

let isCelsius = true;


// ========================================
// GET WEATHER
// ========================================

async function getWeather(city) {

    try {

        // Show loading spinner
        spinner.classList.remove("hidden");

        // Remove previous error
        errorMessage.textContent = "";

        // Hide previous weather
        weatherCard.classList.add("hidden");

        forecastSection.classList.add("hidden");


        /*
         * IMPORTANT:
         *
         * You were previously using:
         *
         * current.json
         *
         * But later your code accesses:
         *
         * data.forecast.forecastday
         *
         * Therefore we need forecast.json.
         */

        const url =
            `https://api.weatherapi.com/v1/forecast.json` +
            `?key=${API_KEY}` +
            `&q=${encodeURIComponent(city)}` +
            `&days=3`;


        const response = await fetch(url);


        // Check HTTP error
        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const data = await response.json();


        console.log("Weather API response:", data);


        // Check WeatherAPI error response
        if (data.error) {

            throw new Error(data.error.message);

        }


        // Save data for unit switching
        weatherData = data;


        // Display weather
        displayCurrentWeather(data);


        // Display forecast
        displayForecast(data);


        // Save city
        saveSearchHistory(city);


        // Hide empty state
        emptyState.classList.add("hidden");


    } catch (error) {

        console.error("Weather App Error:", error);

        errorMessage.textContent =
            error.message ||
            "Unable to load weather information.";

        emptyState.classList.remove("hidden");

    } finally {

        // Always hide spinner
        spinner.classList.add("hidden");

    }

}


// ========================================
// DISPLAY CURRENT WEATHER
// ========================================

function displayCurrentWeather(data) {

    cityName.textContent =
        `${data.location.name}, ${data.location.country}`;


    temperature.textContent = isCelsius
        ? `${data.current.temp_c}°C`
        : `${data.current.temp_f}°F`;


    feelsLike.textContent = isCelsius
        ? `${data.current.feelslike_c}°C`
        : `${data.current.feelslike_f}°F`;


    condition.textContent =
        data.current.condition.text;


    humidity.textContent =
        data.current.humidity;


    windSpeed.textContent = isCelsius
        ? `${data.current.wind_kph} km/h`
        : `${data.current.wind_mph} mph`;


    weatherIcon.src =
        `https:${data.current.condition.icon}`;

    weatherIcon.alt =
        data.current.condition.text;


    // Show current weather
    weatherCard.classList.remove("hidden");

}


// ========================================
// DISPLAY FORECAST
// ========================================

function displayForecast(data) {

    // Clear existing cards
    forecastCards.innerHTML = "";


    data.forecast.forecastday.forEach((day) => {

        const card =
            document.createElement("div");

        card.classList.add("forecast-card");


        const maxTemperature = isCelsius
            ? `${day.day.maxtemp_c}°C`
            : `${day.day.maxtemp_f}°F`;


        const minTemperature = isCelsius
            ? `${day.day.mintemp_c}°C`
            : `${day.day.mintemp_f}°F`;


        card.innerHTML = `

            <h4>${day.date}</h4>

            <img
                src="https:${day.day.condition.icon}"
                alt="${day.day.condition.text}"
            >

            <p>
                ${day.day.condition.text}
            </p>

            <p>
                Max: ${maxTemperature}
            </p>

            <p>
                Min: ${minTemperature}
            </p>

        `;


        forecastCards.appendChild(card);

    });


    // Show forecast
    forecastSection.classList.remove("hidden");

}


// ========================================
// UNIT TOGGLE
// ========================================

unitToggle.addEventListener("click", () => {

    // Toggle boolean
    isCelsius = !isCelsius;


    unitToggle.textContent = isCelsius
        ? "Switch to °F"
        : "Switch to °C";


    // We don't need another API call.
    // Reuse the stored data.
    if (weatherData) {

        displayCurrentWeather(weatherData);

        displayForecast(weatherData);

    }

});


// ========================================
// SEARCH BUTTON
// ========================================

searchBtn.addEventListener("click", () => {

    const city =
        cityInput.value.trim();


    if (!city) {

        errorMessage.textContent =
            "Please enter a city name.";

        return;

    }


    getWeather(city);

});


// ========================================
// ENTER KEY SEARCH
// ========================================

cityInput.addEventListener("keyup", (event) => {

    if (event.key === "Enter") {

        searchBtn.click();

    }

});


// ========================================
// SAVE SEARCH HISTORY
// ========================================

function saveSearchHistory(city) {

    let history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];


    // Remove duplicate city
    history = history.filter(
        (item) =>
            item.toLowerCase() !== city.toLowerCase()
    );


    // Add latest city at beginning
    history.unshift(city);


    // Keep only last 5 searches
    history = history.slice(0, 5);


    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );


    localStorage.setItem(
        "lastCity",
        city
    );


    renderHistory();

}


// ========================================
// RENDER SEARCH HISTORY
// ========================================

function renderHistory() {

    const history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];


    historyContainer.innerHTML = "";


    history.forEach((city) => {

        const button =
            document.createElement("button");


        button.textContent = city;

        button.classList.add("history-btn");


        button.addEventListener("click", () => {

            cityInput.value = city;

            getWeather(city);

        });


        historyContainer.appendChild(button);

    });

}


// ========================================
// PAGE LOAD
// ========================================

window.addEventListener("load", () => {

    renderHistory();


    const lastCity =
        localStorage.getItem("lastCity");


    if (lastCity) {

        cityInput.value = lastCity;

        getWeather(lastCity);

    }

});
