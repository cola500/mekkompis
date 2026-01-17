const API_URL = 'http://localhost:3001/api';
let currentStopGid = null;
let refreshInterval = null;

// DOM elements
const stopSearchInput = document.getElementById('stopSearch');
const searchResults = document.getElementById('searchResults');
const departuresDiv = document.getElementById('departures');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const refreshBtn = document.getElementById('refreshBtn');
const lastUpdateSpan = document.getElementById('lastUpdate');
const clockDiv = document.getElementById('clock');

// Update clock
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  clockDiv.textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock();

// Debounce function for search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search for stops
async function searchStops(query) {
  if (!query || query.length < 2) {
    searchResults.innerHTML = '';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/stops/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search stops');

    const data = await response.json();
    displaySearchResults(data);
  } catch (error) {
    console.error('Error searching stops:', error);
    searchResults.innerHTML = '<div style="color: red; padding: 10px;">Kunde inte söka hållplatser</div>';
  }
}

// Display search results
function displaySearchResults(data) {
  if (!data.results || data.results.length === 0) {
    searchResults.innerHTML = '<div style="padding: 10px; color: #6c757d;">Inga resultat</div>';
    return;
  }

  searchResults.innerHTML = data.results
    .filter(result => result.stopArea) // Only show stops with stopArea
    .slice(0, 5)
    .map(result => `
      <div class="search-result-item" data-gid="${result.stopArea.gid}" data-name="${result.stopArea.name}">
        <strong>${result.stopArea.name}</strong>
        ${result.stopArea.municipality ? `<div style="font-size: 0.9rem; color: #6c757d;">${result.stopArea.municipality.name}</div>` : ''}
      </div>
    `)
    .join('');

  // Add click handlers
  searchResults.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const gid = item.dataset.gid;
      const name = item.dataset.name;
      selectStop(gid, name);
    });
  });
}

// Select a stop
function selectStop(gid, name) {
  currentStopGid = gid;
  stopSearchInput.value = name;
  searchResults.innerHTML = '';

  // Update header
  document.querySelector('.header h1').textContent = `🚌 ${name}`;

  // Save to localStorage
  localStorage.setItem('selectedStop', JSON.stringify({ gid, name }));

  // Fetch departures
  fetchDepartures();

  // Set up auto-refresh every 30 seconds
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(fetchDepartures, 30000);
}

// Fetch departures
async function fetchDepartures() {
  if (!currentStopGid) {
    showError('Välj en hållplats först');
    return;
  }

  loadingDiv.style.display = 'block';
  errorDiv.style.display = 'none';
  departuresDiv.innerHTML = '';

  try {
    const response = await fetch(`${API_URL}/departures/${currentStopGid}?limit=15&timeSpan=120`);
    if (!response.ok) throw new Error('Failed to fetch departures');

    const data = await response.json();
    displayDepartures(data);

    // Update last update time
    const now = new Date();
    lastUpdateSpan.textContent = `Uppdaterat: ${now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}`;
  } catch (error) {
    console.error('Error fetching departures:', error);
    showError('Kunde inte hämta avgångar. Försök igen.');
  } finally {
    loadingDiv.style.display = 'none';
  }
}

// Display departures
function displayDepartures(data) {
  if (!data.results || data.results.length === 0) {
    departuresDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">Inga avgångar just nu</div>';
    return;
  }

  departuresDiv.innerHTML = data.results.map(dep => {
    const time = formatDepartureTime(dep.serviceJourney.estimatedDepartureTime || dep.serviceJourney.plannedDepartureTime);
    const isSoon = getMinutesUntil(dep.serviceJourney.estimatedDepartureTime || dep.serviceJourney.plannedDepartureTime) <= 5;

    return `
      <div class="departure-card">
        <div class="line-badge" style="background: ${dep.serviceJourney.line.backgroundColor || '#1a73b5'}; color: ${dep.serviceJourney.line.foregroundColor || 'white'}">
          ${dep.serviceJourney.line.shortName || dep.serviceJourney.line.name}
        </div>
        <div class="departure-info">
          <div class="departure-destination">
            ${dep.serviceJourney.direction}
          </div>
          <div class="departure-track">
            ${dep.stopPoint?.platform ? `Läge ${dep.stopPoint.platform}` : ''}
          </div>
        </div>
        <div class="departure-time ${isSoon ? 'soon' : ''}">
          ${time}
        </div>
      </div>
    `;
  }).join('');
}

// Format departure time
function formatDepartureTime(timestamp) {
  const now = new Date();
  const depTime = new Date(timestamp);
  const diffMinutes = Math.round((depTime - now) / 60000);

  if (diffMinutes <= 0) return 'Nu';
  if (diffMinutes === 1) return '1 min';
  if (diffMinutes < 10) return `${diffMinutes} min`;

  return depTime.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

// Get minutes until departure
function getMinutesUntil(timestamp) {
  const now = new Date();
  const depTime = new Date(timestamp);
  return Math.round((depTime - now) / 60000);
}

// Show error
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  loadingDiv.style.display = 'none';
}

// Event listeners
stopSearchInput.addEventListener('input', debounce((e) => {
  searchStops(e.target.value);
}, 300));

refreshBtn.addEventListener('click', fetchDepartures);

// Load saved stop from localStorage
const savedStop = localStorage.getItem('selectedStop');
if (savedStop) {
  try {
    const { gid, name } = JSON.parse(savedStop);
    selectStop(gid, name);
  } catch (error) {
    console.error('Failed to load saved stop:', error);
  }
} else {
  // Default: search for Betaniagatan
  stopSearchInput.value = 'Betaniagatan';
  searchStops('Betaniagatan');
}
