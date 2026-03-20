// ========================================
// DEVTrails 2026 - GigShield Insurance
// Main Application Logic
// ========================================

let selectedCity = 'Mumbai';
let weatherData = {};
let charts = {};
let currentSimulation = null;

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
});

// ===== NAVIGATION =====
function initNavigation() {
  document.querySelectorAll('#navLinks a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      document.querySelectorAll('#navLinks a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${section}`).classList.add('active');
    });
  });
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
  document.querySelectorAll('.city-pill').forEach(p => {
    p.classList.toggle('active', p.textContent === city);
  });
  loadCityData(city);
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
  const cityData = CITIES.find(c => c.name === city);
  const partnerCount = 500 + Math.floor(Math.random() * 3000);
  document.getElementById('statPartners').textContent = partnerCount.toLocaleString();

  // Count active triggers from latest data
  const latest = weather[weather.length - 1];
  const triggers = evaluateTriggers(latest);
  const triggerCount = triggers.filter(t => t.label !== 'Combined Disruption').length;

  document.getElementById('statTriggers').textContent = triggerCount;
  const triggerStatusEl = document.getElementById('triggerStatus');
  if (triggerCount > 0) {
    triggerStatusEl.textContent = triggers.map(t => t.icon).join(' ') + ' Active';
    triggerStatusEl.className = 'stat-change negative';
  } else {
    triggerStatusEl.textContent = 'All clear';
    triggerStatusEl.className = 'stat-change positive';
  }

  const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
  document.getElementById('statPayouts').textContent = '₹' + totalPayouts.toLocaleString();
  document.getElementById('payoutCount').textContent = `${payouts.length} auto-payouts`;

  const pool = Math.round((partnerCount * cityData.premiumWeekly * 1.3) / 100000);
  document.getElementById('statPool').textContent = `₹${pool}L`;
}

// ===== WEATHER CHART =====
function renderWeatherChart(data) {
  if (charts.weather) charts.weather.destroy();

  // Aggregate to daily
  const dailyData = {};
  data.forEach(d => {
    const date = d.timestamp.split('T')[0];
    if (!dailyData[date]) dailyData[date] = { rain: [], temp: [], aqi: [] };
    dailyData[date].rain.push(d.rain);
    dailyData[date].temp.push(d.temperature);
    dailyData[date].aqi.push(d.aqi);
  });

  const labels = Object.keys(dailyData).map(d => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
  });

  const avgRain = Object.values(dailyData).map(d => (d.rain.reduce((a, b) => a + b, 0) / d.rain.length).toFixed(1));
  const maxTemp = Object.values(dailyData).map(d => Math.max(...d.temp).toFixed(1));
  const avgAQI = Object.values(dailyData).map(d => Math.round(d.aqi.reduce((a, b) => a + b, 0) / d.aqi.length));

  const ctx = document.getElementById('weatherChart').getContext('2d');
  charts.weather = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Avg Rain (mm/hr)',
          data: avgRain,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Max Temp (°C)',
          data: maxTemp,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Avg AQI',
          data: avgAQI,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' } } },
      },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
        y: { position: 'left', ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Rain / Temp', color: '#64748b', font: { size: 10 } } },
        y1: { position: 'right', ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false }, title: { display: true, text: 'AQI', color: '#64748b', font: { size: 10 } } },
      },
    },
  });
}

// ===== INCOME CHART =====
function renderIncomeChart(activity) {
  if (charts.income) charts.income.destroy();

  const dailyData = {};
  activity.forEach(a => {
    const date = a.timestamp.split('T')[0];
    if (!dailyData[date]) dailyData[date] = { actual: 0, normal: 0 };
    dailyData[date].actual += a.estimatedIncome;
    dailyData[date].normal += (a.wasOnline ? 70 : 0); // ~₹70/hr normal
  });

  const labels = Object.keys(dailyData).map(d => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
  });

  const actual = Object.values(dailyData).map(d => d.actual);
  const normal = Object.values(dailyData).map(d => d.normal);

  const ctx = document.getElementById('incomeChart').getContext('2d');
  charts.income = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Normal Income (₹)',
          data: normal,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Actual Income (₹)',
          data: actual,
          backgroundColor: 'rgba(99, 102, 241, 0.3)',
          borderColor: '#6366f1',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' } } },
      },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
        y: { ticks: { color: '#64748b', font: { size: 10 }, callback: v => '₹' + v }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });
}

// ===== ALERTS =====
function updateAlerts(weather) {
  const container = document.getElementById('alertsList');
  const alertCountEl = document.getElementById('alertCount');

  // Check recent hours (last 6 hours)
  const recentWeather = weather.slice(-6);
  const allAlerts = [];

  recentWeather.forEach(w => {
    const triggers = evaluateTriggers(w);
    triggers.forEach(t => {
      if (t.label !== 'Combined Disruption') {
        allAlerts.push({
          ...t,
          time: new Date(w.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });
  });

  // Deduplicate
  const unique = [...new Map(allAlerts.map(a => [a.label, a])).values()];
  alertCountEl.textContent = `${unique.length} Active`;
  alertCountEl.className = `card-badge ${unique.length > 0 ? 'badge-danger' : 'badge-success'}`;

  if (unique.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:2rem;">No active triggers. Use the simulator below to test.</p>';
    return;
  }

  container.innerHTML = unique.map(a => `
    <div class="trigger-status trigger-active" style="margin-bottom:0.5rem;">
      <span class="live-dot danger"></span>
      <span>${a.icon} <strong>${a.label}</strong></span>
      <span style="margin-left:auto; font-family:'JetBrains Mono',monospace; font-size:0.85rem;">${a.value} ${a.unit}</span>
      <span style="color:var(--text-muted); font-size:0.75rem;">${a.time}</span>
    </div>
  `).join('');
}

// ===== RECENT PAYOUTS =====
function updateRecentPayouts(payouts) {
  const container = document.getElementById('recentPayoutsList');
  if (payouts.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:1rem;">No payouts yet</p>';
    return;
  }
  container.innerHTML = payouts.slice(0, 5).map(p => `
    <div class="payout-item">
      <div class="payout-amount">₹${p.amount}</div>
      <div>
        <div style="font-size:0.8rem; font-weight:500;">${p.partner}</div>
        <div class="payout-triggers">${p.triggers.map(t => `<span class="payout-trigger-tag">${t}</span>`).join('')}</div>
      </div>
      <div style="text-align:right;">
        <div class="payout-status">${p.status}</div>
        <div class="payout-date">${p.date}</div>
      </div>
    </div>
  `).join('');
}

// ===== SIMULATION =====
function simulateDisruption(type) {
  currentSimulation = type;
  const panel = document.getElementById('simPanel');
  const result = document.getElementById('simResult');
  panel.classList.add('active-sim');

  const partner = DELIVERY_PARTNER_PROFILES.find(p => p.city === selectedCity) || DELIVERY_PARTNER_PROFILES[0];
  weatherData[selectedCity] = generateWeatherData(selectedCity, type);
  const activity = generatePlatformActivity(partner, weatherData[selectedCity]);
  const payouts = generatePayoutHistory(partner, weatherData[selectedCity]);
  const totalPayout = payouts.reduce((s, p) => s + p.amount, 0);

  const typeLabels = { monsoon: '🌧️ Monsoon Simulation', heatwave: '🌡️ Heatwave Simulation', pollution: '💨 AQI Spike Simulation' };

  result.innerHTML = `
    <h4 style="color:var(--accent-danger); margin-bottom:0.75rem;">${typeLabels[type]} — ${selectedCity}</h4>
    <div class="grid-4" style="gap:1rem;">
      <div>
        <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Triggers Fired</div>
        <div style="font-size:1.3rem; font-weight:700; color:var(--accent-danger);">${payouts.length}</div>
      </div>
      <div>
        <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Total Payouts</div>
        <div style="font-size:1.3rem; font-weight:700; color:var(--accent-success);">₹${totalPayout.toLocaleString()}</div>
      </div>
      <div>
        <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Avg Payout</div>
        <div style="font-size:1.3rem; font-weight:700; color:var(--accent-warning);">₹${payouts.length > 0 ? Math.round(totalPayout / payouts.length) : 0}</div>
      </div>
      <div>
        <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Processing</div>
        <div style="font-size:1.3rem; font-weight:700; color:var(--accent-info);">< 2 min</div>
      </div>
    </div>
    <p style="margin-top:0.75rem; font-size:0.8rem; color:var(--text-muted);">
      ✅ All payouts were auto-processed within 2 minutes of trigger detection. Zero manual claims needed.
    </p>
  `;
  result.classList.add('show');

  // Refresh charts
  loadCityData(selectedCity);
}

function resetSimulation() {
  currentSimulation = null;
  document.getElementById('simPanel').classList.remove('active-sim');
  document.getElementById('simResult').classList.remove('show');
  loadCityData(selectedCity);
}

// ===== PARTNER TABLE =====
function populatePartnerTable() {
  const tbody = document.getElementById('partnerTable');
  tbody.innerHTML = DELIVERY_PARTNER_PROFILES.map(p => `
    <tr>
      <td style="color:var(--text-primary); font-weight:500;">${p.name}</td>
      <td>${p.age}</td>
      <td>${p.city}</td>
      <td><span class="card-badge badge-primary">${p.platform}</span></td>
      <td style="color:var(--accent-success); font-weight:600;">₹${p.avgDailyIncome}</td>
      <td>${p.avgOrdersPerDay}</td>
      <td>${p.activeDays}</td>
    </tr>
  `).join('');
}

// ===== TRIGGER CARDS =====
function populateTriggerCards() {
  const container = document.getElementById('triggerCards');
  container.innerHTML = Object.entries(TRIGGER_THRESHOLDS).map(([key, t]) => `
    <div class="trigger-config-card">
      <div class="trigger-config-icon">${t.icon}</div>
      <div class="trigger-config-name">${t.label}</div>
      <div class="trigger-config-threshold">${t.threshold !== null ? '>' + t.threshold : '2+'}</div>
      <div class="trigger-config-unit">${t.unit || 'simultaneous triggers'}</div>
      <div class="trigger-config-payout">Payout: ${Math.round(t.payoutPct * 100)}% of daily avg</div>
    </div>
  `).join('');

  // Also render trigger history chart
  renderTriggerHistoryChart();
  renderPayoutLog();
}

function renderTriggerHistoryChart() {
  if (charts.triggerHistory) charts.triggerHistory.destroy();

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const rainTriggers = days.map(() => Math.floor(Math.random() * 5));
  const heatTriggers = days.map(() => Math.floor(Math.random() * 4));
  const aqiTriggers = days.map(() => Math.floor(Math.random() * 3));

  const ctx = document.getElementById('triggerHistoryChart').getContext('2d');
  charts.triggerHistory = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        { label: '🌧️ Rain', data: rainTriggers, backgroundColor: 'rgba(59, 130, 246, 0.5)', borderRadius: 4 },
        { label: '🌡️ Heat', data: heatTriggers, backgroundColor: 'rgba(245, 158, 11, 0.5)', borderRadius: 4 },
        { label: '💨 AQI', data: aqiTriggers, backgroundColor: 'rgba(139, 92, 246, 0.5)', borderRadius: 4 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' } } } },
      scales: {
        x: { stacked: true, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } },
        y: { stacked: true, ticks: { color: '#64748b', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Trigger Count', color: '#64748b', font: { size: 10 } } },
      },
    },
  });
}

function renderPayoutLog() {
  const container = document.getElementById('payoutLog');
  const partner = DELIVERY_PARTNER_PROFILES[0];
  const weather = generateWeatherData(partner.city, 'monsoon');
  const payouts = generatePayoutHistory(partner, weather);

  if (payouts.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1rem; font-size:0.85rem;">No payouts logged</p>';
    return;
  }

  container.innerHTML = payouts.map(p => `
    <div class="payout-item">
      <div class="payout-amount">₹${p.amount}</div>
      <div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${p.partner}</div>
        <div class="payout-triggers">${p.triggers.map(t => `<span class="payout-trigger-tag">${t}</span>`).join('')}</div>
      </div>
      <div style="text-align:right;">
        <div class="payout-status">${p.status}</div>
        <div class="payout-date">${p.date}</div>
      </div>
    </div>
  `).join('');
}

// ===== FINANCIAL MODEL =====
function populateCitySelect() {
  const select = document.getElementById('citySelect');
  select.innerHTML = CITIES.map(c =>
    `<option value="${c.name}" ${c.name === selectedCity ? 'selected' : ''}>${c.name} (${c.riskTier} risk)</option>`
  ).join('');
}

function updateFinancialModel() {
  const city = document.getElementById('citySelect').value;
  const cityData = CITIES.find(c => c.name === city);
  const summary = generateFinancialSummary(city, DELIVERY_PARTNER_PROFILES);

  document.getElementById('premiumValue').textContent = `₹${cityData.premiumWeekly}`;
  document.getElementById('poolValue').textContent = `₹${(summary.totalPool).toLocaleString()}`;

  // Premium table
  document.getElementById('premiumTable').innerHTML = CITIES.map(c => {
    const tierColor = c.riskTier === 'high' ? 'badge-danger' : c.riskTier === 'medium' ? 'badge-warning' : 'badge-success';
    const claimRate = c.riskTier === 'high' ? '35%' : c.riskTier === 'medium' ? '20%' : '10%';
    return `
      <tr>
        <td style="font-weight:500; color:var(--text-primary);">${c.name}</td>
        <td><span class="card-badge ${tierColor}">${c.riskTier}</span></td>
        <td style="font-weight:600;">₹${c.premiumWeekly}/week</td>
        <td style="color:var(--text-muted);">₹${Math.round(c.premiumWeekly / 7)}/day</td>
        <td>${claimRate}</td>
      </tr>
    `;
  }).join('');

  renderRevenueChart();
}

function renderRevenueChart() {
  if (charts.revenue) charts.revenue.destroy();

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
  const premiumIncome = weeks.map((_, i) => Math.round(50000 * (1 + i * 0.08)));
  const claims = weeks.map((_, i) => Math.round(premiumIncome[i] * (0.15 + Math.random() * 0.2)));
  const netPool = weeks.map((_, i) => premiumIncome[i] - claims[i]);

  const ctx = document.getElementById('revenueChart').getContext('2d');
  charts.revenue = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weeks,
      datasets: [
        {
          label: 'Premium Income (₹)',
          data: premiumIncome,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Claims Paid (₹)',
          data: claims,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Net Pool (₹)',
          data: netPool,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          borderDash: [5, 5],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' } } } },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } },
        y: { ticks: { color: '#64748b', callback: v => '₹' + (v / 1000).toFixed(0) + 'K' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });
}

// ===== AI PREDICTIONS =====
function populateAIPartnerSelect() {
  const select = document.getElementById('aiPartnerSelect');
  select.innerHTML = DELIVERY_PARTNER_PROFILES.map((p, i) =>
    `<option value="${i}">${p.name} — ${p.city} (${p.platform})</option>`
  ).join('');
}

function updateAIPredictions() {
  const idx = parseInt(document.getElementById('aiPartnerSelect').value);
  const partner = DELIVERY_PARTNER_PROFILES[idx];
  const predictions = predictIncomeLoss(partner.city, partner);

  // Predictions list
  const container = document.getElementById('predictionsList');
  container.innerHTML = predictions.map(p => {
    const riskColor = p.riskLevel === 'high' ? 'badge-danger' : p.riskLevel === 'medium' ? 'badge-warning' : 'badge-success';
    return `
      <div class="prediction-row">
        <div class="prediction-day">${p.dayName}, ${p.date.split('-').slice(1).join('/')}</div>
        <div class="prediction-risk card-badge ${riskColor}">${p.riskLevel}</div>
        <div class="prediction-loss">-₹${p.predictedLoss}</div>
        <div style="flex:1;">
          <div class="risk-meter risk-${p.riskLevel}">
            <div class="risk-meter-fill" style="width:${p.riskLevel === 'high' ? 85 : p.riskLevel === 'medium' ? 50 : 20}%"></div>
          </div>
        </div>
        <div class="prediction-confidence">${p.confidence}% conf</div>
      </div>
    `;
  }).join('');

  // Prediction chart
  renderPredictionChart(predictions, partner);
}

function renderPredictionChart(predictions, partner) {
  if (charts.prediction) charts.prediction.destroy();

  const labels = predictions.map(p => p.dayName);
  const normalIncome = predictions.map(() => partner.avgDailyIncome);
  const predictedIncome = predictions.map(p => p.predictedIncome);
  const loss = predictions.map(p => p.predictedLoss);

  const ctx = document.getElementById('predictionChart').getContext('2d');
  charts.prediction = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Normal Income (₹)',
          data: normalIncome,
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Predicted Income (₹)',
          data: predictedIncome,
          backgroundColor: 'rgba(99, 102, 241, 0.3)',
          borderColor: '#6366f1',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Predicted Loss (₹)',
          data: loss,
          backgroundColor: 'rgba(239, 68, 68, 0.3)',
          borderColor: '#ef4444',
          borderWidth: 1,
          borderRadius: 4,
          type: 'line',
          fill: false,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' } } } },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } },
        y: { ticks: { color: '#64748b', callback: v => '₹' + v }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });
}

// ===== RISK TABLE =====
function populateRiskTable() {
  const tbody = document.getElementById('riskTable');
  tbody.innerHTML = CITIES.map(c => {
    const rainRisk = c.riskTier === 'high' ? 'High' : c.riskTier === 'medium' ? 'Medium' : 'Low';
    const heatRisk = c.name === 'Delhi' || c.name === 'Ahmedabad' ? 'High' : c.name === 'Chennai' ? 'Medium' : 'Low';
    const aqiRisk = c.name === 'Delhi' || c.name === 'Kolkata' ? 'High' : 'Medium';
    const overallRiskNum = c.riskTier === 'high' ? 75 + Math.round(Math.random() * 15) : c.riskTier === 'medium' ? 40 + Math.round(Math.random() * 20) : 15 + Math.round(Math.random() * 15);
    const overallColor = overallRiskNum > 60 ? 'badge-danger' : overallRiskNum > 35 ? 'badge-warning' : 'badge-success';
    const claimRate = c.riskTier === 'high' ? 0.35 : c.riskTier === 'medium' ? 0.20 : 0.10;
    const weeklyClaims = Math.round(500 * claimRate);

    const riskBadge = (level) => {
      const color = level === 'High' ? 'badge-danger' : level === 'Medium' ? 'badge-warning' : 'badge-success';
      return `<span class="card-badge ${color}">${level}</span>`;
    };
    const tierColor = c.riskTier === 'high' ? 'badge-danger' : c.riskTier === 'medium' ? 'badge-warning' : 'badge-success';

    return `
      <tr>
        <td style="font-weight:500; color:var(--text-primary);">${c.name}</td>
        <td><span class="card-badge ${tierColor}">${c.riskTier}</span></td>
        <td>${riskBadge(rainRisk)}</td>
        <td>${riskBadge(heatRisk)}</td>
        <td>${riskBadge(aqiRisk)}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="risk-meter risk-${overallRiskNum > 60 ? 'high' : overallRiskNum > 35 ? 'medium' : 'low'}" style="width:60px;">
              <div class="risk-meter-fill" style="width:${overallRiskNum}%"></div>
            </div>
            <span class="card-badge ${overallColor}">${overallRiskNum}%</span>
          </div>
        </td>
        <td style="font-weight:600;">~${weeklyClaims}</td>
      </tr>
    `;
  }).join('');
}
