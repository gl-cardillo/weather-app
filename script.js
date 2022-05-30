import { addWeek} from 'date-fns'

function weather() {

  let searchValue = undefined;
  const city = document.querySelector(".city");
  const error = document.querySelector(".error");
  const datefield = document.querySelector(".date");
  const timeField = document.querySelector(".time");
  const weather = document.querySelector(".weather");
  const temperature = document.querySelector(".temp");

  const buttonDay = document.querySelector(".day");
  const search = document.querySelector("#search");
  const buttonHour = document.querySelector(".hour");
  const searchButton = document.querySelector(".search-button");

  let unit = "metric";
  let unitSymbol = "C";

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const tempButton = document.querySelector(".temp-button");
  const tempUnitButton = document.querySelector(".temp-unit");
  tempUnitButton.textContent = "F";

  async function fetchWeather(
    hourOrDay, // this is used for show only hours or days in max-width 720px
    mobile, // mobile is used for button showing only in max-width 720px
    unit = "metric",
    search = "London"
  ) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=939e3a82f6759a930c9874ce5e0d382c&units=${unit}`,
        { mode: "cors" }
      );

      //if city not found
      if (!response.ok) {
        error.textContent = `${search} not found`;
        return;
      }
      error.textContent = "";

      const jsonDataNow = await response.json();
      display(jsonDataNow);

      const latitude = jsonDataNow.coord.lat;
      const longitude = jsonDataNow.coord.lon;

      const responseHourly = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=939e3a82f6759a930c9874ce5e0d382c&units=${unit}`
      );

      const jsonData = await responseHourly.json();

      //call with 25 to get the hours section
      if (hourOrDay === "hour") {
        displayHourAndDays(jsonData.hourly, 25);
      } else if (hourOrDay === "day" || mobile) {
        //call with 7 to get the days of the week section
        displayHourAndDays(jsonData.daily, 7, mobile);
      } else if ((hourOrDay = "both")) {
        displayHourAndDays(jsonData.hourly, 25);
        displayHourAndDays(jsonData.daily, 7);
      }
    } catch (error) {
      alert(error);
      return null;
    }
  }

  function display(data) {
    //set name, temp, weather condition of city
    city.textContent = data.name;
    temperature.textContent = `${parseInt(data.main.temp)}°${unitSymbol}`;
    weather.src = displayIcon(data.weather[0]);

    //get todays date and time
    const date = addWeek(new Date(),1);
    datefield.textContent = date.toISOString().split("T")[0];
    timeField.textContent = date.toISOString().substr(11, 5);
  }

  function displayHourAndDays(data, num, mobile) {
    const hourlyContainer = document.querySelector(".hour-container");
    const dailyContainer = document.querySelector(".days-container");

    //remove child previous child every time function is called
    if (num === 25 || mobile) {
      removeChild(hourlyContainer);
    } else if (num === 7) {
      removeChild(dailyContainer);
    }

    for (let i = 1; i <= num; i++) {
      const container = document.createElement("div");
      container.classList.add("weather-container");
      const icon = document.createElement("img");
      const time = document.createElement("p");
      const temp = document.createElement("p");
      const humidity = document.createElement("p");
      const wind = document.createElement("p");

      time.textContent = new Date(data[i].dt * 1000);
      icon.src = displayIcon(data[i].weather[0]);

      container.appendChild(time);

      container.appendChild(temp);
      container.appendChild(icon);

      //for daily, show days and temp
      if (num === 7) {
        temp.textContent = `${parseInt(data[i].temp.day)}°${unitSymbol}`;
        time.textContent = days[new Date(data[i].dt * 1000).getDay()];
        //append to hourly container if using phone
        if (mobile) {
          hourlyContainer.appendChild(container);
        } else {
          dailyContainer.appendChild(container);
        }
      } else {
        //for hours, show the hour and increase i by 3 to show the hours every 4
        time.textContent = formatAMPM(new Date(data[i].dt * 1000).getHours());
        temp.textContent = `${parseInt(data[i].temp)}°${unitSymbol}`;
        hourlyContainer.appendChild(container);

        i += 3;
      }
    }
  }
  function fToC() {
    if (unitSymbol === "C") {
      unit = "imperial";
      unitSymbol = "F";
      tempUnitButton.textContent = "C";
    } else {
      unit = "metric";
      unitSymbol = "C";
      tempUnitButton.textContent = "F";
    }
  }

  function displayIcon(weather) {
    if (weather.main === "Clouds") {
      if (
        weather.description === "few clouds" ||
        weather.description === "scattered clouds"
      ) {
        return "./img/few-clouds.png";
      }
      return "./img/clouds.png";
    } else if (weather.main === "Clear") {
      return "./img/sun.png";
    } else if (weather.main === "Rain") {
      return "./img/rain.png";
    } else if (weather.main === "Thunderstorm") {
      return "./img/storm.png";
    } else if (weather.main === "Drizzle") {
      return "./img/mist.png";
    } else if (weather.main === "Snow") {
      return "./img/snow.png";
    } else {
      return "./img/sad.png";
    }
  }

  function formatAMPM(hours) {
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strTime = hours + " " + ampm;
    return strTime;
  }

  function removeChild(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  searchButton.addEventListener("click", () => {
    searchValue = search.value;
    search.value = "";
    fetchWeather("none", false, unit, searchValue);
  });

  tempButton.addEventListener("click", () => {
    fToC();
    fetchWeather("none", false, unit, searchValue);
  });

  buttonDay.addEventListener("click", () => {
    buttonHour.classList.remove("active");
    buttonDay.classList.add("active");
    fetchWeather("day", true, unit, searchValue);
  });

  buttonHour.addEventListener("click", () => {
    buttonHour.classList.add("active");
    buttonDay.classList.remove("active");
    fetchWeather("hour", false, unit, searchValue);
  });
  buttonHour.classList.add("active");
  fetchWeather("both", false);
}
weather();