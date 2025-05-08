import React, { useRef, useState, useEffect } from "react";
import "./Weather.css";
import search_icon from "../assets/search.png";

const Weather = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(false);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleToggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);
    if (weatherData?.location) {
      search(weatherData.location, newUnit);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const search = async (city, customUnit = unit) => {
    if (city === "") {
      setError("⚠️ Please enter a city name.");
      setWeatherData(false);
      setForecastData([]);
      return;
    }

    try {
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${customUnit}&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${customUnit}&appid=${
        import.meta.env.VITE_APP_ID
      }`;

      const [currentRes, forecastRes] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl),
      ]);

      const currentData = await currentRes.json();
      const forecast = await forecastRes.json();

      if (!currentRes.ok || !forecastRes.ok) {
        const msg = currentData.message || forecast.message;
        setError(`❗ ${msg}`);
        setWeatherData(false);
        setForecastData([]);
        return;
      }

      const icon = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;

      setWeatherData({
        humidity: currentData.main.humidity,
        wind: currentData.wind.speed,
        temperature: Math.floor(currentData.main.temp),
        feels_like: Math.floor(currentData.main.feels_like),
        temp_min: Math.floor(currentData.main.temp_min),
        temp_max: Math.floor(currentData.main.temp_max),
        pressure: currentData.main.pressure,
        description: currentData.weather[0].description,
        location: currentData.name,
        icon: icon,
        sunrise: formatTime(currentData.sys.sunrise),
        sunset: formatTime(currentData.sys.sunset),
      });

      const dailyForecast = forecast.list
        .filter((item) => item.dt_txt.includes("12:00:00"))
        .slice(0, 5);

      setForecastData(dailyForecast);
      setError("");
    } catch (err) {
      setWeatherData(false);
      setForecastData([]);
      setError("❗ Failed to fetch weather data. Try again.");
      console.error("Error fetching weather data:", err);
    }
  };

  return (
    <div className="weather">
      <div
        style={{
          alignSelf: "flex-end",
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
        }}
      >
        <button onClick={toggleTheme}>
          {theme === "dark" ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
        <button onClick={handleToggleUnit}>
          {unit === "metric" ? "Show °F" : "Show °C"}
        </button>
      </div>

      <div className="search-bar">
        <input ref={inputRef} type="text" placeholder="Search" />
        <img
          src={search_icon}
          alt="Search"
          onClick={() => search(inputRef.current.value)}
        />
      </div>

      {error && <p className="fallback-message">{error}</p>}

      {!error && !weatherData && (
        <p className="fallback-message">
          Please enter a city name to view the weather.
        </p>
      )}

      {weatherData && (
        <>
          {/* Current Temperature and Description */}
          <img
            src={weatherData.icon}
            alt="Weather Icon"
            className="weather-icon"
          />
          <p className="temperature">
            {weatherData.temperature}°{unit === "metric" ? "C" : "F"}
          </p>
          <p className="location">{weatherData.location}</p>
          <p className="description">{weatherData.description}</p>

          {/* Forecast Section */}
          <div className="forecast-section">
            <h3 style={{ marginTop: "30px" }}>🌤️ 5-Day Forecast</h3>
            <div className="forecast-scroll">
              {forecastData.map((item, index) => (
                <div className="forecast-card" key={index}>
                  <p>
                    {new Date(item.dt_txt).toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt={item.weather[0].description}
                  />
                  <p>
                    {Math.round(item.main.temp)}°{unit === "metric" ? "C" : "F"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Other Weather Details */}
          <div className="weather-data">
            <div className="col">
              <div>
                <p>{weatherData.humidity} %</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <div>
                <p>
                  {weatherData.wind} {unit === "metric" ? "km/h" : "mp/h"}
                </p>
                <span>Wind Speed</span>
              </div>
            </div>
            <div className="col">
              <div>
                <p>{weatherData.feels_like}°</p>
                <span>Feels Like</span>
              </div>
            </div>
            <div className="col">
              <div>
                <p>
                  {weatherData.temp_min}° / {weatherData.temp_max}°
                </p>
                <span>Min / Max</span>
              </div>
            </div>
            <div className="col">
              <div>
                <p>{weatherData.pressure} hPa</p>
                <span>Pressure</span>
              </div>
            </div>
            <div className="col">
              <div>
                <p>{weatherData.sunrise}</p>
                <span>Sunrise</span>
              </div>
            </div>
            <div className="col">
              <div>
                <p>{weatherData.sunset}</p>
                <span>Sunset</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
