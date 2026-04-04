// ========================================
// app2.js - Phase 2 features (part 2)
// Simulation, Registration, Policies, Claims, Premium Calc
// ========================================

// ===== SIMULATION =====
function simulateDisruption(type) {
  currentSimulation = type;
  document.getElementById('simPanel').classList.add('active-sim');
  const partner = DELIVERY_PARTNER_PROFILES.find(p => p.city === selectedCity) || DELIVERY_PARTNER_PROFILES[0];
  weatherData[selectedCity] = generateWeatherData(selectedCity, type);
  const activity = generatePlatformActivity(partner, weatherData[selectedCity]);
  const payouts = generatePayoutHistory(partner, weatherData[selectedCity]);
  const totalPayout = payouts.reduce((s, p) => s + p.amount, 0);
  // Auto-generate claims for active policies in this city
  const cityPolicies = policies.filter(p => p.city === selectedCity && p.status === 'active');
  const trigMap = { monsoon: 'rain', heatwave: 'heat', pollution: 'aqi' };
  const trigType = trigMap[type] || 'rain';
  let newClaimsCount = 0;
  cityPolicies.forEach(pol => {
    if (pol.triggers.includes(trigType)) {
      const trig = TRIGGER_THRESHOLDS[trigType];
      const val = trigType === 'rain' ? (15 + Math.random()*10).toFixed(1)+' mm/hr' : trigType === 'heat' ? (46+Math.random()*4).toFixed(1)+' °C' : (320+Math.round(Math.random()*100))+' AQI';
      generateAutoClaimFromTrigger(pol, trigType, val);
      newClaimsCount++;
    }
  });
  const typeLabels = { monsoon: '🌧️ Monsoon', heatwave: '🌡️ Heatwave', pollution: '💨 AQI Spike' };
  const result = document.getElementById('simResult');
  result.innerHTML = `
    <h4 style="color:var(--accent-danger); margin-bottom:0.75rem;">${typeLabels[type]} Simulation — ${selectedCity}</h4>
    <div class="grid-4" style="gap:1rem;">
      <div><div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Zero-Touch Claims</div><div style="font-size:1.3rem; font-weight:700; color:var(--accent-danger);">${newClaimsCount}</div></div>
      <div><div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Total Payouts</div><div style="font-size:1.3rem; font-weight:700; color:var(--accent-success);">₹${totalPayout.toLocaleString()}</div></div>
      <div><div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Processing</div><div style="font-size:1.3rem; font-weight:700; color:var(--accent-info);">< 2 min</div></div>
      <div><div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Manual Claims</div><div style="font-size:1.3rem; font-weight:700; color:var(--accent-success);">0 needed</div></div>
    </div>
    <p style="margin-top:0.75rem; font-size:0.8rem; color:var(--text-muted);">✅ ${newClaimsCount} zero-touch claims auto-filed and paid. Check the Claims tab for details.</p>`;
  result.classList.add('show');
  loadCityData(selectedCity);
  renderTriggerMonitor();
}

function resetSimulation() {
  currentSimulation = null;
  document.getElementById('simPanel').classList.remove('active-sim');
  document.getElementById('simResult').classList.remove('show');
  loadCityData(selectedCity);
}

// ===== REGISTRATION =====
function initRegistrationForm() {
  // Populate city select
  const citySelect = document.getElementById('regCity');
  if (citySelect) citySelect.innerHTML = CITIES.map(c => `<option value="${c.name}">${c.name} (${c.riskTier} risk)</option>`).join('');
  // Populate platform
  const platSelect = document.getElementById('regPlatform');
  if (platSelect) platSelect.innerHTML = PLATFORMS.map(p => `<option value="${p}">${p}</option>`).join('');
  // Populate vehicle
  const vehSelect = document.getElementById('regVehicle');
  if (vehSelect) vehSelect.innerHTML = VEHICLE_TYPES.map(v => `<option value="${v}">${v}</option>`).join('');
  updateRegZones();
}

function updateRegZones() {
  const city = document.getElementById('regCity')?.value;
  const zoneSelect = document.getElementById('regZone');
  if (!city || !zoneSelect) return;
  const cityData = CITIES.find(c => c.name === city);
  if (!cityData) return;
  zoneSelect.innerHTML = cityData.zones.map(z => `<option value="${z.id}">${z.name} ${z.safeZone ? '✅ Safe Zone' : '⚠️ Flood-prone'}</option>`).join('');
  if (currentRegStep === 3) renderPlanCards();
}

function regNextStep(step) {
  // Validate current step
  if (step > currentRegStep) {
    if (currentRegStep === 1) {
      const name = document.getElementById('regName')?.value;
      const phone = document.getElementById('regPhone')?.value;
      if (!name || !phone) { alert('Please fill in Name and Phone'); return; }
    }
    if (currentRegStep === 2) {
      const income = document.getElementById('regIncome')?.value;
      if (!income) { alert('Please enter your average daily income'); return; }
    }
    if (currentRegStep === 3 && step === 4) {
      // Submit registration
      submitRegistration();
      return;
    }
  }
  currentRegStep = step;
  // Update stepper UI
  document.querySelectorAll('.stepper-step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 <= step);
    s.classList.toggle('completed', i + 1 < step);
  });
  document.querySelectorAll('.stepper-line').forEach((l, i) => l.classList.toggle('active', i + 1 < step));
  document.querySelectorAll('.reg-step').forEach(s => s.classList.remove('active'));
  const stepEl = document.getElementById(`regStep${step}`);
  if (stepEl) stepEl.classList.add('active');
  if (step === 3) renderPlanCards();
}

function renderPlanCards() {
  const container = document.getElementById('planCards');
  const city = document.getElementById('regCity')?.value || 'Mumbai';
  const zone = document.getElementById('regZone')?.value || CITIES[0].zones[0].id;
  container.innerHTML = INSURANCE_PLANS.map(plan => {
    const premium = calculateDynamicPremium(city, zone, plan.id);
    return `
    <div class="plan-card ${plan.id === selectedPlan ? 'selected' : ''} ${plan.popular ? 'popular' : ''}" onclick="selectPlan('${plan.id}')">
      ${plan.popular ? '<div class="plan-popular-badge">MOST POPULAR</div>' : ''}
      <div class="plan-icon" style="color:${plan.color}">${plan.icon}</div>
      <div class="plan-name">${plan.name}</div>
      <div class="plan-price">₹${premium.finalPremium}<span>/week</span></div>
      <div class="plan-desc">${plan.description}</div>
      <ul class="plan-features">${plan.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul>
      <div class="plan-triggers">${plan.triggers.map(t => TRIGGER_THRESHOLDS[t]?.icon || '').join(' ')}</div>
      ${premium.savings > 0 ? `<div class="plan-savings">💰 Zone discount: ₹${premium.savings}/week saved!</div>` : ''}
    </div>`;
  }).join('');
  updatePremiumBreakdownPanel();
}

function selectPlan(planId) {
  selectedPlan = planId;
  renderPlanCards();
}

function updatePremiumBreakdownPanel() {
  const panel = document.getElementById('premiumBreakdownPanel');
  const city = document.getElementById('regCity')?.value || 'Mumbai';
  const zone = document.getElementById('regZone')?.value || CITIES[0].zones[0].id;
  const premium = calculateDynamicPremium(city, zone, selectedPlan);
  panel.innerHTML = `
    <div class="card" style="border-left:3px solid var(--accent-primary);">
      <div class="card-header"><div class="card-title">🧮 ML Premium Breakdown — ${premium.planName}</div></div>
      <div class="premium-breakdown-grid">
        <div class="pb-item"><span>Base Premium (${premium.cityRiskTier} risk)</span><span>₹${premium.basePremium}</span></div>
        <div class="pb-item"><span>Plan Multiplier (${premium.planMultiplier}x)</span><span>₹${premium.adjustedBase}</span></div>
        ${premium.zoneSafetyDiscount !== 0 ? `<div class="pb-item pb-discount"><span>📍 Zone Safety Discount (${premium.zoneName})</span><span style="color:var(--accent-success);">₹${premium.zoneSafetyDiscount}</span></div>` : ''}
        ${premium.seasonalAdj !== 0 ? `<div class="pb-item"><span>📅 ${premium.seasonLabel}</span><span>+₹${premium.seasonalAdj}</span></div>` : ''}
        ${premium.claimsAdj !== 0 ? `<div class="pb-item"><span>📈 Claims Frequency Adj.</span><span>+₹${premium.claimsAdj}</span></div>` : ''}
        ${premium.coverageExtCost > 0 ? `<div class="pb-item"><span>🌦️ Weather Predict (+${premium.coverageExtHours}hr)</span><span>+₹${premium.coverageExtCost}</span></div>` : ''}
        <div class="pb-total"><span>Final Weekly Premium</span><span>₹${premium.finalPremium}</span></div>
      </div>
    </div>`;
}

function submitRegistration() {
  const data = {
    name: document.getElementById('regName').value,
    phone: document.getElementById('regPhone').value,
    aadhaar: document.getElementById('regAadhaar').value || 'XXXX XXXX XXXX',
    age: parseInt(document.getElementById('regAge').value) || 25,
    city: document.getElementById('regCity').value,
    zone: document.getElementById('regZone').value,
    platform: document.getElementById('regPlatform').value,
    vehicle: document.getElementById('regVehicle').value,
    avgDailyIncome: parseInt(document.getElementById('regIncome').value) || 800,
    avgOrdersPerDay: parseInt(document.getElementById('regOrders').value) || 18,
    activeDays: 6,
    joinedMonths: 0,
  };
  const partner = registerPartner(data);
  const policy = createPolicy(partner, selectedPlan);
  // Show confirmation
  currentRegStep = 4;
  document.querySelectorAll('.stepper-step').forEach(s => { s.classList.add('active'); s.classList.add('completed'); });
  document.querySelectorAll('.stepper-line').forEach(l => l.classList.add('active'));
  document.querySelectorAll('.reg-step').forEach(s => s.classList.remove('active'));
  document.getElementById('regStep4').classList.add('active');
  const details = document.getElementById('confirmationDetails');
  details.innerHTML = `
    <div class="confirmation-grid">
      <div class="conf-item"><span class="conf-label">Partner ID</span><span class="conf-value">${partner.id}</span></div>
      <div class="conf-item"><span class="conf-label">Policy ID</span><span class="conf-value">${policy.id}</span></div>
      <div class="conf-item"><span class="conf-label">Plan</span><span class="conf-value">${policy.planIcon} ${policy.planName}</span></div>
      <div class="conf-item"><span class="conf-label">Premium</span><span class="conf-value">₹${policy.weeklyPremium}/week</span></div>
      <div class="conf-item"><span class="conf-label">Coverage</span><span class="conf-value">${policy.coverageHours} hrs/day</span></div>
      <div class="conf-item"><span class="conf-label">Max Payout</span><span class="conf-value">₹${policy.maxWeeklyPayout}/week</span></div>
      <div class="conf-item"><span class="conf-label">Valid Until</span><span class="conf-value">${policy.endDate}</span></div>
    </div>`;
}

function resetRegistration() {
  currentRegStep = 1;
  document.getElementById('regName').value = '';
  document.getElementById('regPhone').value = '';
  document.getElementById('regAadhaar').value = '';
  document.getElementById('regAge').value = '';
  document.getElementById('regIncome').value = '';
  document.getElementById('regOrders').value = '';
  selectedPlan = 'standard';
  regNextStep(1);
}
