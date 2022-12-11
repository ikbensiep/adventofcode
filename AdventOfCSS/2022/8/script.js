/* WMO weather codes are generally: 
 00-20: 'No precipitation',
 20-29: 'Precipitation',
 30-39: 'Duststorm, Sandstorm drifting or blowing snow',
 40-49: 'For or ice fog'
 50-59: 'Drizzle',
 60-69: 'Rain',
 70-79: 'Solid precip (ie, snow)',
 80-99: 'Showery precip or precip with storm',
 
(https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM)

*/
const WEATHER_CODE_ICONS = [
  'sunny',
  'sunny',
  'partly-cloudy',
  'cloudy',
  'cloudy',
  'rainy',
  'rainy',
  'stormy',
  'thunder',
  'snowy',
]

const WEEKDAYS = ['sun', 'mon','tue','wed','thu','fri','sat'];
const API_ENDPOINT = 'https://api.open-meteo.com/v1/forecast?'
const locations = {
  selected: 2,
  places: [{
    name: 'Surhuisterveen',
    latitude: 53.10,
    longitude: 6.10,
  },
  {
    name: 'Marrakesh',
    latitude: 33.59,
    longitude: -7.61,
  },
  {
    name: 'Toronto',
    latitude: 43.653,
    longitude: 79.383,
  },
  {
    name: "Reykjavik",
    latitude: 64.121675, 
    longitude: -21.832749
  },
  {
    name: 'Nowhere',
    latitude: 0.0,
    longitude: 0.0,
  }
  ]
}


let weekTemplateEl;
let forecastEl;
let locationSelect;
let locationInput;
let weekData;
let hourlyData;

const makeWeekQuery = () => {
  const options = {
    ...locations.places[locations.selected],
    daily : ['temperature_2m_max', 'temperature_2m_min', 'winddirection_10m_dominant','weathercode', 'precipitation_sum', 'precipitation_hours'],
    timezone: 'CET'
  }
  const query = Object.keys(options)
    .map(key => `${key}=${options[key]}`)
    .join('&');
  return API_ENDPOINT + query;
}

const fetchWeekForecast = () => {
  forecastEl.innerHTML = '';
  fetch(makeWeekQuery())
    .then(response => response.json())
    .then(data => {
      weekData = data.daily;
      weekData.time.map ( (day, index) => {
        renderDay(index);
      });

    })
}

const makeHourlyQuery = () => {
  const options = {
    ...locations.places[locations.selected],
    hourly : ['temperature_2m','cloudcover'],
    timezone: 'CET'
  }
  const query = Object.keys(options)
    .map(key => `${key}=${options[key]}`)
    .join('&');
  return API_ENDPOINT + query;
}

const fetchDayForecast = async (date) => {
  
  fetch(makeHourlyQuery())
    .then(response => response.json())
    .then(data => {
      hourlyData = data;
      renderDayForecast(date);
    });
    
}

const getWeatherCodeIcon = (wmocode) => {
  return WEATHER_CODE_ICONS[parseInt(Math.floor(wmocode/10))]
}

const renderDay = (index) => {
  const elem = weekTemplateEl.content.cloneNode(true);
  const time = elem.querySelector('time');
  const day = elem.querySelector('time span');
  const datum = elem.querySelector('time strong');
  const article = elem.querySelector('article');
  const img = elem.querySelector('figure img');
  const high = elem.querySelector('h2 strong');
  const precip = elem.querySelector('dd');
  const low = elem.querySelector('dt + dd + dt + dd');

  const date = new Date(weekData.time[index]);

  time.setAttribute('datetime', weekData.time[index]);
  day.textContent = WEEKDAYS[date.getDay()];
  datum.textContent = date.getDate();
  article.dataset['wmo'] = getWeatherCodeIcon(weekData.weathercode[index]);
  img.src = img.src.replace('icon', getWeatherCodeIcon(weekData.weathercode[index]));
  high.textContent = weekData.temperature_2m_max[index];
  low.textContent = weekData.temperature_2m_min[index] + '°';
  precip.textContent = `${(weekData.precipitation_hours[index]/8) * 100}%`;
  precip.setAttributetitle = `${weekData.precipitation_sum[index]}mm`;

  article.addEventListener('click', () => { fetchDayForecast(weekData.time[index]) });

  forecastEl.appendChild(elem);

}

const renderDayForecast = (day) => {
  const dayChartTitle = document.querySelector('#day-forecast h2 span');
  dayChartTitle.textContent = `${WEEKDAYS[new Date(day).getDay()]} ${new Date(day).getDate()}`;
  const dayChart = document.querySelector('#day-forecast div');
  dayChart.innerHTML = '';
  // hourly forecast is returned as hours of a full week, we only need 24 of those
  const selection = [];
  hourlyData.hourly.time.map( (hour, index) => {
     hour.includes(day) ? selection.push(hourlyData.hourly.cloudcover[index]) : null;
  });
  
  selection.map( (hour, index) => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    const strong = document.createElement('strong');
    
    div.className = 'bar';
    div.dataset.hour = index;
    div.style.setProperty('--value', hourlyData.hourly.cloudcover[hour] + 'px');
    strong.textContent = `${hourlyData.hourly.cloudcover[hour]}`; 
    span.textContent = '%';
    div.appendChild(strong);
    div.appendChild(span);
    dayChart.appendChild(div);
  });
}

const populateLocationSelect = () => {
  locationSelect.innerHTML = '';
  locations.places.map(location => {
    let option = document.createElement('option');
    option.textContent = location.name;
    locationSelect.appendChild(option);
  });
  locationSelect.selectedIndex = locations.selected;
}

// document.addEventListener('DOMContentLoaded', () => console.log('done.'));
document.addEventListener('DOMContentLoaded', () => {
  weekTemplateEl = document.querySelector('template#daily-forecast');
  forecastEl = document.querySelector('main');
  
  locationSelect = document.querySelector('select');
  locationInput = document.querySelector('input');
  locationInput.value = `${locations.places[locations.selected].latitude}, ${locations.places[locations.selected].longitude}`;
  
  populateLocationSelect();
  
  locationSelect.addEventListener('change', (e) => {
    locations.selected = e.target.selectedIndex;
    locationInput.value = `${locations.places[locations.selected].latitude}, ${locations.places[locations.selected].longitude}`;
    fetchWeekForecast();
  })
  
  locationInput.addEventListener('change', (e) => {

    const coords = e.target.value.split(',');
    if(coords.length == 2) {
      locations.places.push({
        name: `Custom (${coords[0]}, ${coords[1]})`,
        latitude: parseInt(coords[0]),
        longitude: parseInt(coords[1]),
      });
      
      locations.selected = locations.places.length - 1;
      populateLocationSelect();
      fetchWeekForecast();
    }
  })

  locationSelect.selectedIndex = locations.selected;
  fetchWeekForecast();
});