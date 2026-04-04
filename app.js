// ========================================
// DEVTrails 2026 - GigShield Phase 2
// Main Application Logic
// ========================================

let selectedCity = 'Mumbai';
let weatherData = {};
let charts = {};
let currentSimulation = null;
let selectedPlan = 'standard';
let currentRegStep = 1;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCityPills();
  populatePartnerTable();
  populateTriggerCards();
  populateCitySelect();
  populateAIPartnerSelect();
  loadCityData(selectedCity);
  updateFinancialModel();
  updateAIPredictions();
  populateRiskTable();
  initRegistrationForm();
  renderPolicies();
  renderClaims();
  initPremiumCalculator();
  renderTriggerMonitor();
  renderPayoutStructure();
});

// ===== NAVIGATION =====
function initNavigation() {
  document.querySelectorAll('#navLinks a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.section);
    });
  });
}

function navigateTo(section) {
  document.querySelectorAll('#navLinks a').forEach(l => l.classList.remove('active'));
  const link = document.querySelector(`#navLinks a[data-section="${section}"]`);
  if (link) link.classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`section-${section}`);
  if (el) el.classList.add('active');
  if (section === 'policies') renderPolicies();
  if (section === 'claims') renderClaims();
}

// ===== CITY PILLS =====
function initCityPills() {
  const container = document.getElementById('cityPills');
  container.innerHTML = CITIES.map(c =>
    `<button class="city-pill ${c.name === selectedCity ? 'active' : ''}" onclick="selectCity('${c.name}')">${c.name}</button>`
  ).join('');
}

function selectCity(city) {
  selectedCity = city;
  document.querySelectorAll('.city-pill').forEach(p => p.classList.toggle('active', p.textContent === city));
  loadCityData(city);
  renderTriggerMonitor();
}

// ===== LOAD CITY DATA =====
function loadCityData(city) {
  const scenario = currentSimulation || 'normal';
  weatherData[city] = generateWeatherData(city, scenario);
  const partner = DELIVERY_PARTNER_PROFILES.find(p => p.city === city) || DELIVERY_PARTNER_PROFILES[0];
  const activity = generatePlatformActivity(partner, weatherData[city]);
  const payouts = generatePayoutHistory(partner, weatherData[city]);
  updateDashboardStats(city, weatherData[city], payouts);
  renderWeatherChart(weatherData[city]);
  renderIncomeChart(activity);
  updateAlerts(weatherData[city]);
  updateRecentPayouts(payouts);
}

// ===== DASHBOARD STATS =====
function updateDashboardStats(city, weather, payouts) {
  document.getElementById('statPartners').textContent = registeredPartners.length.toLocaleString();
  const activePols = policies.filter(p => p.status === 'active').length;
  document.getElementById('statPolicies').textContent = activePols;
  const todayClaims = claims.filter(c => c.status === 'paid').length;
  document.getElementById('statClaims').textContent = todayClaims;
  const totalPaid = claims.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  document.getElementById('statPayouts').textContent = '₹' + totalPaid.toLocaleString();
  document.getElementById('payoutCount').textContent = `${todayClaims} auto-payouts`;
}

// ===== TRIGGER MONITOR (5 APIs) =====
function renderTriggerMonitor() {
  const container = document.getElementById('triggerMonitorGrid');
  if (!container) return;
  const apiData = runAllTriggerAPIs(selectedCity);
  const items = [
    { label: '🌧️ Weather', source: apiData.weather.source, value: apiData.weather.rainfall_mm_hr + ' mm/hr', triggered: apiData.weather.triggered, threshold: '>10 mm/hr' },
    { label: '💨 Air Quality', source: apiData.aqi.source, value: apiData.aqi.aqi + ' AQI', triggered: apiData.aqi.triggered, threshold: '>300 AQI' },
    { label: '🌊 Waterlog', source: 'Municipal IoT', value: apiData.waterlogging.length > 0 ? apiData.waterlogging[0].water_level_mm + ' mm' : 'N/A', triggered: apiData.waterlogging.some(w => w.triggered), threshold: '>200 mm' },
    { label: '🚦 Traffic', source: apiData.traffic.source, value: apiData.traffic.congestion_pct + '%', triggered: apiData.traffic.triggered, threshold: '>85%' },
    { label: '📱 Platform', source: 'Status API', value: apiData.platformOutage.filter(p => p.status === 'degraded').length + ' down', triggered: apiData.platformOutage.some(p => p.status === 'degraded'), threshold: 'Any outage' },
  ];
  container.innerHTML = items.map(item => `
    <div class="trigger-monitor-card ${item.triggered ? 'triggered' : ''}">
      <div class="trigger-monitor-label">${item.label}</div>
      <div class="trigger-monitor-value">${item.value}</div>
      <div class="trigger-monitor-status">${item.triggered ? '<span class="live-dot danger"></span> TRIGGERED' : '<span class="live-dot"></span> Normal'}</div>
      <div class="trigger-monitor-source">${item.source}</div>
    </div>
  `).join('');
}

// ===== WEATHER CHART =====
function renderWeatherChart(data) {
  if (charts.weather) charts.weather.destroy();
  const dailyData = {};
  data.forEach(d => { const date = d.timestamp.split('T')[0]; if (!dailyData[date]) dailyData[date] = { rain: [], temp: [], aqi: [] }; dailyData[date].rain.push(d.rain); dailyData[date].temp.push(d.temperature); dailyData[date].aqi.push(d.aqi); });
  const labels = Object.keys(dailyData).map(d => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));
  const avgRain = Object.values(dailyData).map(d => (d.rain.reduce((a, b) => a + b, 0) / d.rain.length).toFixed(1));
  const maxTemp = Object.values(dailyData).map(d => Math.max(...d.temp).toFixed(1));
  const avgAQI = Object.values(dailyData).map(d => Math.round(d.aqi.reduce((a, b) => a + b, 0) / d.aqi.length));
  const ctx = document.getElementById('weatherChart').getContext('2d');
  charts.weather = new Chart(ctx, { type: 'line', data: { labels, datasets: [
    { label: 'Avg Rain (mm/hr)', data: avgRain, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, yAxisID: 'y' },
    { label: 'Max Temp (°C)', data: maxTemp, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: false, tension: 0.4, yAxisID: 'y' },
    { label: 'Avg AQI', data: avgAQI, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: false, tension: 0.4, yAxisID: 'y1' },
  ]}, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { position: 'left', ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y1: { position: 'right', ticks: { color: '#64748b' }, grid: { display: false } } } } });
}

// ===== INCOME CHART =====
function renderIncomeChart(activity) {
  if (charts.income) charts.income.destroy();
  const dailyData = {};
  activity.forEach(a => { const date = a.timestamp.split('T')[0]; if (!dailyData[date]) dailyData[date] = { actual: 0, normal: 0 }; dailyData[date].actual += a.estimatedIncome; dailyData[date].normal += (a.wasOnline ? 70 : 0); });
  const labels = Object.keys(dailyData).map(d => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));
  const actual = Object.values(dailyData).map(d => d.actual);
  const normal = Object.values(dailyData).map(d => d.normal);
  const ctx = document.getElementById('incomeChart').getContext('2d');
  charts.income = new Chart(ctx, { type: 'bar', data: { labels, datasets: [
    { label: 'Normal Income (₹)', data: normal, backgroundColor: 'rgba(16,185,129,0.2)', borderColor: '#10b981', borderWidth: 1, borderRadius: 4 },
    { label: 'Actual Income (₹)', data: actual, backgroundColor: 'rgba(99,102,241,0.3)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 4 },
  ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { ticks: { color: '#64748b', callback: v => '₹' + v }, grid: { color: 'rgba(255,255,255,0.05)' } } } } });
}

// ===== ALERTS =====
function updateAlerts(weather) {
  const container = document.getElementById('alertsList');
  const alertCountEl = document.getElementById('alertCount');
  const recentWeather = weather.slice(-6);
  const allAlerts = [];
  recentWeather.forEach(w => { const triggers = evaluateTriggers(w); triggers.forEach(t => { if (t.label !== 'Combined Disruption') allAlerts.push({ ...t, time: new Date(w.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }); }); });
  const unique = [...new Map(allAlerts.map(a => [a.label, a])).values()];
  alertCountEl.textContent = `${unique.length} Active`;
  alertCountEl.className = `card-badge ${unique.length > 0 ? 'badge-danger' : 'badge-success'}`;
  if (unique.length === 0) { container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:2rem;">No active triggers. Use the simulator below to test.</p>'; return; }
  container.innerHTML = unique.map(a => `<div class="trigger-status trigger-active" style="margin-bottom:0.5rem;"><span class="live-dot danger"></span><span>${a.icon} <strong>${a.label}</strong></span><span style="margin-left:auto; font-family:'JetBrains Mono',monospace; font-size:0.85rem;">${a.value} ${a.unit}</span></div>`).join('');
}

// ===== RECENT PAYOUTS =====
function updateRecentPayouts(payouts) {
  const container = document.getElementById('recentPayoutsList');
  const recentClaims = claims.slice(0, 5);
  if (recentClaims.length === 0) { container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:1rem;">No claims yet</p>'; return; }
  container.innerHTML = recentClaims.map(c => `
    <div class="payout-item" style="cursor:pointer;" onclick="showClaimDetail('${c.id}')">
      <div class="payout-amount">₹${c.amount}</div>
      <div><div style="font-size:0.8rem; font-weight:500;">${c.partnerName}</div><div class="payout-triggers"><span class="payout-trigger-tag">${c.triggerIcon} ${c.triggerLabel}</span></div></div>
      <div style="text-align:right;"><div class="payout-status">${c.status === 'paid' ? '✅ Auto-Paid' : '⏳ ' + c.status}</div><div class="payout-date">${c.processingTime}</div></div>
    </div>`).join('');
}
