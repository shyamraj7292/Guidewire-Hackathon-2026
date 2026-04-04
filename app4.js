// ========================================
// app4.js - Phase 2 features (part 4)
// Financial, AI, Trigger Cards, Partner Table, Payout
// ========================================

// ===== PAYOUT STRUCTURE TABLE =====
function renderPayoutStructure() {
  const tbody = document.getElementById('payoutStructureTable');
  if (!tbody) return;
  tbody.innerHTML = Object.entries(TRIGGER_THRESHOLDS).filter(([k]) => k !== 'combined').map(([key, t]) => `
    <tr>
      <td>${t.icon} ${t.label} (>${t.threshold} ${t.unit})</td>
      <td style="color:var(--text-muted); font-size:0.8rem;">${t.api}</td>
      <td><span class="card-badge badge-warning">${Math.round(t.payoutPct * 100)}%</span></td>
      <td style="color:var(--accent-success); font-weight:600;">₹${Math.round(850 * t.payoutPct)}</td>
    </tr>`).join('') + `
    <tr>
      <td>⚠️ Combined (2+ triggers)</td>
      <td style="color:var(--text-muted); font-size:0.8rem;">Multi-source</td>
      <td><span class="card-badge badge-danger">80%</span></td>
      <td style="color:var(--accent-success); font-weight:600;">₹${Math.round(850 * 0.8)}</td>
    </tr>`;
}

// ===== PARTNER TABLE (Persona section removed, but used in dashboard) =====
function populatePartnerTable() {}

// ===== TRIGGER CARDS =====
function populateTriggerCards() {
  const container = document.getElementById('triggerCards');
  if (!container) return;
  container.innerHTML = Object.entries(TRIGGER_THRESHOLDS).map(([key, t]) => `
    <div class="trigger-config-card">
      <div class="trigger-config-icon">${t.icon}</div>
      <div class="trigger-config-name">${t.label}</div>
      <div class="trigger-config-threshold">${t.threshold !== null ? '>' + t.threshold : '2+'}</div>
      <div class="trigger-config-unit">${t.unit || 'simultaneous triggers'}</div>
      <div class="trigger-config-payout">Payout: ${Math.round(t.payoutPct * 100)}% of daily avg</div>
      <div class="trigger-config-api" style="margin-top:0.5rem; font-size:0.7rem; color:var(--text-muted);">Source: ${t.api || 'Multi'}</div>
    </div>
  `).join('');
  renderTriggerHistoryChart();
  renderPayoutLog();
}

function renderTriggerHistoryChart() {
  if (charts.triggerHistory) charts.triggerHistory.destroy();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const ctx = document.getElementById('triggerHistoryChart')?.getContext('2d');
  if (!ctx) return;
  charts.triggerHistory = new Chart(ctx, { type: 'bar', data: { labels: days, datasets: [
    { label: '🌧️ Rain', data: days.map(() => Math.floor(Math.random() * 5)), backgroundColor: 'rgba(59,130,246,0.5)', borderRadius: 4 },
    { label: '🌡️ Heat', data: days.map(() => Math.floor(Math.random() * 4)), backgroundColor: 'rgba(245,158,11,0.5)', borderRadius: 4 },
    { label: '💨 AQI', data: days.map(() => Math.floor(Math.random() * 3)), backgroundColor: 'rgba(139,92,246,0.5)', borderRadius: 4 },
    { label: '🌊 Waterlog', data: days.map(() => Math.floor(Math.random() * 3)), backgroundColor: 'rgba(6,182,212,0.5)', borderRadius: 4 },
    { label: '🚦 Traffic', data: days.map(() => Math.floor(Math.random() * 2)), backgroundColor: 'rgba(239,68,68,0.5)', borderRadius: 4 },
  ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } }, scales: { x: { stacked: true, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { stacked: true, ticks: { color: '#64748b', stepSize: 2 }, grid: { color: 'rgba(255,255,255,0.05)' } } } } });
}

function renderPayoutLog() {
  const container = document.getElementById('payoutLog');
  if (!container) return;
  const recentClaims = claims.filter(c => c.status === 'paid').slice(0, 8);
  if (recentClaims.length === 0) { container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:1rem; font-size:0.85rem;">No payouts logged</p>'; return; }
  container.innerHTML = recentClaims.map(c => `
    <div class="payout-item">
      <div class="payout-amount">₹${c.amount}</div>
      <div><div style="font-size:0.75rem; color:var(--text-muted);">${c.partnerName}</div><div class="payout-triggers"><span class="payout-trigger-tag">${c.triggerIcon} ${c.triggerLabel}</span></div></div>
      <div style="text-align:right;"><div class="payout-status">✅ Auto-Paid</div><div class="payout-date">${c.processingTime}</div></div>
    </div>`).join('');
}

// ===== FINANCIAL MODEL =====
function populateCitySelect() {
  const select = document.getElementById('citySelect');
  if (!select) return;
  select.innerHTML = CITIES.map(c => `<option value="${c.name}" ${c.name === selectedCity ? 'selected' : ''}>${c.name} (${c.riskTier} risk)</option>`).join('');
}

function updateFinancialModel() {
  const select = document.getElementById('citySelect');
  if (!select) return;
  const city = select.value;
  const cityData = CITIES.find(c => c.name === city);
  if (!cityData) return;
  const summary = generateFinancialSummary(city, DELIVERY_PARTNER_PROFILES);
  document.getElementById('premiumValue').textContent = '₹' + cityData.basePremium;
  document.getElementById('poolValue').textContent = '₹' + summary.totalPool.toLocaleString();
  document.getElementById('premiumTable').innerHTML = CITIES.map(c => {
    const tierColor = c.riskTier === 'high' ? 'badge-danger' : c.riskTier === 'medium' ? 'badge-warning' : 'badge-success';
    const claimRate = c.riskTier === 'high' ? '35%' : c.riskTier === 'medium' ? '20%' : '10%';
    return `<tr><td style="font-weight:500; color:var(--text-primary);">${c.name}</td><td><span class="card-badge ${tierColor}">${c.riskTier}</span></td><td style="font-weight:600;">₹${c.basePremium}/week</td><td style="color:var(--text-muted);">₹${Math.round(c.basePremium / 7)}/day</td><td>${claimRate}</td></tr>`;
  }).join('');
  renderRevenueChart();
}

function renderRevenueChart() {
  if (charts.revenue) charts.revenue.destroy();
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
  const premiumIncome = weeks.map((_, i) => Math.round(50000 * (1 + i * 0.08)));
  const clms = weeks.map((_, i) => Math.round(premiumIncome[i] * (0.15 + Math.random() * 0.2)));
  const netPool = weeks.map((_, i) => premiumIncome[i] - clms[i]);
  const ctx = document.getElementById('revenueChart')?.getContext('2d');
  if (!ctx) return;
  charts.revenue = new Chart(ctx, { type: 'line', data: { labels: weeks, datasets: [
    { label: 'Premium Income (₹)', data: premiumIncome, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
    { label: 'Claims Paid (₹)', data: clms, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
    { label: 'Net Pool (₹)', data: netPool, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, borderDash: [5, 5] },
  ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { ticks: { color: '#64748b', callback: v => '₹' + (v/1000).toFixed(0) + 'K' }, grid: { color: 'rgba(255,255,255,0.05)' } } } } });
}

// ===== AI PREDICTIONS =====
function populateAIPartnerSelect() {
  const select = document.getElementById('aiPartnerSelect');
  if (!select) return;
  select.innerHTML = DELIVERY_PARTNER_PROFILES.map((p, i) => `<option value="${i}">${p.name} — ${p.city} (${p.platform})</option>`).join('');
}

function updateAIPredictions() {
  const select = document.getElementById('aiPartnerSelect');
  if (!select) return;
  const idx = parseInt(select.value);
  const partner = DELIVERY_PARTNER_PROFILES[idx];
  const predictions = predictIncomeLoss(partner.city, partner);
  const container = document.getElementById('predictionsList');
  container.innerHTML = predictions.map(p => {
    const riskColor = p.riskLevel === 'high' ? 'badge-danger' : p.riskLevel === 'medium' ? 'badge-warning' : 'badge-success';
    return `<div class="prediction-row"><div class="prediction-day">${p.dayName}, ${p.date.split('-').slice(1).join('/')}</div><div class="prediction-risk card-badge ${riskColor}">${p.riskLevel}</div><div class="prediction-loss">-₹${p.predictedLoss}</div><div style="flex:1;"><div class="risk-meter risk-${p.riskLevel}"><div class="risk-meter-fill" style="width:${p.riskLevel==='high'?85:p.riskLevel==='medium'?50:20}%"></div></div></div><div class="prediction-confidence">${p.confidence}% conf</div></div>`;
  }).join('');
  renderPredictionChart(predictions, partner);
}

function renderPredictionChart(predictions, partner) {
  if (charts.prediction) charts.prediction.destroy();
  const ctx = document.getElementById('predictionChart')?.getContext('2d');
  if (!ctx) return;
  charts.prediction = new Chart(ctx, { type: 'bar', data: { labels: predictions.map(p => p.dayName), datasets: [
    { label: 'Normal Income (₹)', data: predictions.map(() => partner.avgDailyIncome), backgroundColor: 'rgba(16,185,129,0.15)', borderColor: '#10b981', borderWidth: 1, borderRadius: 4 },
    { label: 'Predicted Income (₹)', data: predictions.map(p => p.predictedIncome), backgroundColor: 'rgba(99,102,241,0.3)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 4 },
    { label: 'Predicted Loss (₹)', data: predictions.map(p => p.predictedLoss), backgroundColor: 'rgba(239,68,68,0.3)', borderColor: '#ef4444', borderWidth: 1, type: 'line', fill: false, tension: 0.4 },
  ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { ticks: { color: '#64748b', callback: v => '₹' + v }, grid: { color: 'rgba(255,255,255,0.05)' } } } } });
}

// ===== RISK TABLE =====
function populateRiskTable() {
  const tbody = document.getElementById('riskTable');
  if (!tbody) return;
  tbody.innerHTML = CITIES.map(c => {
    const rainRisk = c.riskTier === 'high' ? 'High' : c.riskTier === 'medium' ? 'Medium' : 'Low';
    const heatRisk = ['Delhi', 'Ahmedabad'].includes(c.name) ? 'High' : c.name === 'Chennai' ? 'Medium' : 'Low';
    const aqiRisk = ['Delhi', 'Kolkata'].includes(c.name) ? 'High' : 'Medium';
    const overallRiskNum = c.riskTier === 'high' ? 75 + Math.round(Math.random() * 15) : c.riskTier === 'medium' ? 40 + Math.round(Math.random() * 20) : 15 + Math.round(Math.random() * 15);
    const overallColor = overallRiskNum > 60 ? 'badge-danger' : overallRiskNum > 35 ? 'badge-warning' : 'badge-success';
    const claimRate = c.riskTier === 'high' ? 0.35 : c.riskTier === 'medium' ? 0.20 : 0.10;
    const riskBadge = (level) => { const color = level === 'High' ? 'badge-danger' : level === 'Medium' ? 'badge-warning' : 'badge-success'; return `<span class="card-badge ${color}">${level}</span>`; };
    const tierColor = c.riskTier === 'high' ? 'badge-danger' : c.riskTier === 'medium' ? 'badge-warning' : 'badge-success';
    return `<tr><td style="font-weight:500; color:var(--text-primary);">${c.name}</td><td><span class="card-badge ${tierColor}">${c.riskTier}</span></td><td>${riskBadge(rainRisk)}</td><td>${riskBadge(heatRisk)}</td><td>${riskBadge(aqiRisk)}</td><td><div style="display:flex; align-items:center; gap:8px;"><div class="risk-meter risk-${overallRiskNum>60?'high':overallRiskNum>35?'medium':'low'}" style="width:60px;"><div class="risk-meter-fill" style="width:${overallRiskNum}%"></div></div><span class="card-badge ${overallColor}">${overallRiskNum}%</span></div></td><td style="font-weight:600;">~${Math.round(500 * claimRate)}</td></tr>`;
  }).join('');
}
