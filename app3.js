// ========================================
// app3.js - Phase 2 features (part 3)
// Policies, Claims, Premium Calc, Financial, AI
// ========================================

// ===== POLICY MANAGEMENT =====
function renderPolicies() {
  const totalEl = document.getElementById('polTotalCount');
  const activeEl = document.getElementById('polActiveCount');
  const avgEl = document.getElementById('polAvgPremium');
  const coverEl = document.getElementById('polTotalCoverage');
  if (!totalEl) return;
  totalEl.textContent = policies.length;
  const activePols = policies.filter(p => p.status === 'active');
  activeEl.textContent = activePols.length;
  const avgP = activePols.length > 0 ? Math.round(activePols.reduce((s, p) => s + p.weeklyPremium, 0) / activePols.length) : 0;
  avgEl.textContent = '₹' + avgP;
  coverEl.textContent = '₹' + activePols.reduce((s, p) => s + p.maxWeeklyPayout, 0).toLocaleString();

  const container = document.getElementById('policyCardsContainer');
  if (!container) return;
  container.innerHTML = policies.map(pol => {
    const statusColor = pol.status === 'active' ? 'badge-success' : 'badge-danger';
    const claimCount = claims.filter(c => c.policyId === pol.id).length;
    const claimAmt = claims.filter(c => c.policyId === pol.id && c.status === 'paid').reduce((s, c) => s + c.amount, 0);
    return `
    <div class="card policy-card" style="margin-bottom:1rem;">
      <div class="card-header">
        <div class="card-title">${pol.planIcon} ${pol.planName} — ${pol.partnerName}</div>
        <span class="card-badge ${statusColor}">${pol.status}</span>
      </div>
      <div class="grid-4" style="gap:1rem;">
        <div><div class="policy-detail-label">Policy ID</div><div class="policy-detail-value">${pol.id}</div></div>
        <div><div class="policy-detail-label">Premium</div><div class="policy-detail-value" style="color:var(--accent-primary-light);">₹${pol.weeklyPremium}/week</div></div>
        <div><div class="policy-detail-label">Max Payout</div><div class="policy-detail-value">₹${pol.maxWeeklyPayout}/week</div></div>
        <div><div class="policy-detail-label">Coverage</div><div class="policy-detail-value">${pol.coverageHours} hrs/day</div></div>
      </div>
      <div class="grid-4" style="gap:1rem; margin-top:0.75rem;">
        <div><div class="policy-detail-label">City / Zone</div><div class="policy-detail-value">${pol.city} — ${pol.zoneName}</div></div>
        <div><div class="policy-detail-label">Period</div><div class="policy-detail-value">${pol.startDate} → ${pol.endDate}</div></div>
        <div><div class="policy-detail-label">Claims Filed</div><div class="policy-detail-value">${claimCount} claims</div></div>
        <div><div class="policy-detail-label">Amount Paid</div><div class="policy-detail-value" style="color:var(--accent-success);">₹${claimAmt.toLocaleString()}</div></div>
      </div>
      <div style="margin-top:1rem; display:flex; gap:8px; align-items:center;">
        <div class="policy-triggers-row">${pol.triggers.map(t => `<span class="trigger-tag">${TRIGGER_THRESHOLDS[t]?.icon || ''} ${TRIGGER_THRESHOLDS[t]?.label || t}</span>`).join('')}</div>
        <div style="margin-left:auto; display:flex; gap:6px;">
          ${pol.status === 'active' ? `<button class="btn btn-success btn-sm" onclick="renewPolicy('${pol.id}')">🔄 Renew</button>` : ''}
          ${pol.status === 'active' ? `<button class="btn btn-outline btn-sm" onclick="cancelPolicy('${pol.id}')">Cancel</button>` : `<button class="btn btn-primary btn-sm" onclick="renewPolicy('${pol.id}')">Reactivate</button>`}
        </div>
      </div>
    </div>`;
  }).join('');
}

function renewPolicy(id) {
  const pol = policies.find(p => p.id === id);
  if (!pol) return;
  const start = new Date();
  pol.startDate = start.toISOString().split('T')[0];
  pol.endDate = new Date(start.getTime() + 7 * 86400000).toISOString().split('T')[0];
  pol.status = 'active';
  renderPolicies();
}

function cancelPolicy(id) {
  const pol = policies.find(p => p.id === id);
  if (pol) { pol.status = 'cancelled'; renderPolicies(); }
}

// ===== CLAIMS MANAGEMENT =====
function renderClaims() {
  const totalEl = document.getElementById('clmTotalCount');
  if (!totalEl) return;
  totalEl.textContent = claims.length;
  const paid = claims.filter(c => c.status === 'paid');
  document.getElementById('clmPaidCount').textContent = paid.length;
  document.getElementById('clmTotalAmount').textContent = '₹' + paid.reduce((s, c) => s + c.amount, 0).toLocaleString();
  document.getElementById('clmAvgTime').textContent = '~2 min';
  document.getElementById('claimsTableCount').textContent = claims.length + ' Claims';

  // Claims table
  const tbody = document.getElementById('claimsTableBody');
  tbody.innerHTML = claims.slice(0, 20).map(c => {
    const statusBadge = c.status === 'paid' ? 'badge-success' : c.status === 'processing' ? 'badge-warning' : 'badge-info';
    const date = new Date(c.filedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `<tr style="cursor:pointer;" onclick="showClaimDetail('${c.id}')">
      <td style="font-family:'JetBrains Mono',monospace; font-size:0.8rem; color:var(--accent-primary-light);">${c.id}</td>
      <td style="font-weight:500; color:var(--text-primary);">${c.partnerName}</td>
      <td>${c.triggerIcon} ${c.triggerLabel}</td>
      <td style="font-family:'JetBrains Mono',monospace;">${c.triggerValue}</td>
      <td style="color:var(--accent-success); font-weight:600;">₹${c.amount}</td>
      <td><span class="card-badge ${statusBadge}">${c.status}</span></td>
      <td>${c.processingTime}</td>
      <td style="color:var(--text-muted);">${date}</td>
    </tr>`;
  }).join('');

  // Claims charts
  renderClaimsCharts();
}

function renderClaimsCharts() {
  if (charts.claimsType) charts.claimsType.destroy();
  if (charts.claimsAmount) charts.claimsAmount.destroy();

  const triggerCounts = {};
  const triggerAmounts = {};
  claims.forEach(c => {
    const key = c.triggerLabel;
    triggerCounts[key] = (triggerCounts[key] || 0) + 1;
    triggerAmounts[key] = (triggerAmounts[key] || 0) + c.amount;
  });

  const labels = Object.keys(triggerCounts);
  const colors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#10b981'];

  const ctx1 = document.getElementById('claimsChart')?.getContext('2d');
  if (ctx1) {
    charts.claimsType = new Chart(ctx1, { type: 'doughnut', data: { labels, datasets: [{ data: Object.values(triggerCounts), backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 15, font: { size: 11 } } } } } });
  }

  const ctx2 = document.getElementById('claimsAmountChart')?.getContext('2d');
  if (ctx2) {
    charts.claimsAmount = new Chart(ctx2, { type: 'bar', data: { labels, datasets: [{ label: 'Total Paid (₹)', data: Object.values(triggerAmounts), backgroundColor: colors.slice(0, labels.length).map(c => c + '80'), borderColor: colors.slice(0, labels.length), borderWidth: 1, borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#64748b', callback: v => '₹' + (v/1000).toFixed(1) + 'K' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#94a3b8' }, grid: { display: false } } } } });
  }
}

function showClaimDetail(claimId) {
  const claim = claims.find(c => c.id === claimId);
  if (!claim) return;
  const modal = document.getElementById('claimModal');
  const body = document.getElementById('claimModalBody');
  const statusColor = claim.status === 'paid' ? 'var(--accent-success)' : 'var(--accent-warning)';
  body.innerHTML = `
    <h2 style="font-size:1.2rem; margin-bottom:1rem;">Claim ${claim.id}</h2>
    <div class="claim-detail-grid">
      <div class="cd-item"><span>Partner</span><span>${claim.partnerName}</span></div>
      <div class="cd-item"><span>Policy</span><span>${claim.policyId}</span></div>
      <div class="cd-item"><span>Trigger</span><span>${claim.triggerIcon} ${claim.triggerLabel}</span></div>
      <div class="cd-item"><span>Trigger Value</span><span style="font-family:'JetBrains Mono',monospace;">${claim.triggerValue}</span></div>
      <div class="cd-item"><span>Amount</span><span style="color:var(--accent-success); font-weight:700; font-size:1.2rem;">₹${claim.amount}</span></div>
      <div class="cd-item"><span>Status</span><span style="color:${statusColor}; font-weight:600;">${claim.status.toUpperCase()}</span></div>
      <div class="cd-item"><span>Filed At</span><span>${new Date(claim.filedAt).toLocaleString('en-IN')}</span></div>
      <div class="cd-item"><span>Processing Time</span><span>${claim.processingTime}</span></div>
      <div class="cd-item"><span>Auto-Triggered</span><span>${claim.autoTriggered ? '✅ Yes (Zero-Touch)' : '📝 Manual'}</span></div>
    </div>
    <div class="card" style="margin-top:1rem; border-left:3px solid var(--accent-info);">
      <div class="card-title" style="font-size:0.85rem; margin-bottom:0.5rem;">📡 Evidence & Verification</div>
      <div class="evidence-grid">
        <div><span style="color:var(--text-muted);">API Source:</span> ${claim.evidence.apiSource}</div>
        <div><span style="color:var(--text-muted);">Location:</span> ${claim.evidence.location}</div>
        <div><span style="color:var(--text-muted);">Data Points:</span> ${claim.evidence.dataPoints} readings</div>
        <div><span style="color:var(--text-muted);">Timestamp:</span> ${new Date(claim.evidence.timestamp).toLocaleString('en-IN')}</div>
      </div>
    </div>
    <div class="claim-timeline" style="margin-top:1rem;">
      <div class="timeline-item done"><span class="tl-dot"></span><span>📡 Trigger Detected</span><span class="tl-time">${new Date(claim.filedAt).toLocaleTimeString('en-IN')}</span></div>
      <div class="timeline-item done"><span class="tl-dot"></span><span>🔍 Data Verified</span><span class="tl-time">+15 sec</span></div>
      <div class="timeline-item done"><span class="tl-dot"></span><span>✅ Policy Matched</span><span class="tl-time">+30 sec</span></div>
      <div class="timeline-item done"><span class="tl-dot"></span><span>💰 Amount Calculated</span><span class="tl-time">+45 sec</span></div>
      <div class="timeline-item ${claim.status === 'paid' ? 'done' : ''}"><span class="tl-dot"></span><span>💸 Paid to UPI</span><span class="tl-time">${claim.processingTime}</span></div>
    </div>`;
  modal.classList.add('active');
}

function closeClaimModal() {
  document.getElementById('claimModal').classList.remove('active');
}

// ===== PREMIUM CALCULATOR =====
function initPremiumCalculator() {
  const citySelect = document.getElementById('calcCity');
  if (!citySelect) return;
  citySelect.innerHTML = CITIES.map(c => `<option value="${c.name}">${c.name} (${c.riskTier} risk)</option>`).join('');
  updateCalcZones();
  updatePremiumCalc();
  renderPremiumComparison();
}

function updateCalcZones() {
  const city = document.getElementById('calcCity')?.value;
  const zoneSelect = document.getElementById('calcZone');
  if (!city || !zoneSelect) return;
  const cityData = CITIES.find(c => c.name === city);
  if (!cityData) return;
  zoneSelect.innerHTML = cityData.zones.map(z => `<option value="${z.id}">${z.name} ${z.safeZone ? '✅' : '⚠️'}</option>`).join('');
}

function updatePremiumCalc() {
  updateCalcZones();
  const city = document.getElementById('calcCity')?.value || 'Mumbai';
  const zone = document.getElementById('calcZone')?.value || CITIES[0].zones[0].id;
  const plan = document.getElementById('calcPlan')?.value || 'standard';
  const premium = calculateDynamicPremium(city, zone, plan);

  document.getElementById('calcPremiumResult').textContent = '₹' + premium.finalPremium;
  const breakdown = document.getElementById('calcBreakdown');
  breakdown.innerHTML = `
    <div class="premium-breakdown-grid">
      <div class="pb-item"><span>🏙️ Base (${premium.cityRiskTier})</span><span>₹${premium.basePremium}</span></div>
      <div class="pb-item"><span>📋 Plan (${premium.planMultiplier}x)</span><span>₹${premium.adjustedBase}</span></div>
      ${premium.zoneSafetyDiscount !== 0 ? `<div class="pb-item pb-discount"><span>📍 Safe Zone</span><span style="color:var(--accent-success);">₹${premium.zoneSafetyDiscount}</span></div>` : `<div class="pb-item"><span>📍 Zone (flood-prone)</span><span>₹0</span></div>`}
      ${premium.seasonalAdj !== 0 ? `<div class="pb-item"><span>📅 Season</span><span>+₹${premium.seasonalAdj}</span></div>` : ''}
      ${premium.claimsAdj !== 0 ? `<div class="pb-item"><span>📈 Claims Hist.</span><span>+₹${premium.claimsAdj}</span></div>` : ''}
      ${premium.coverageExtCost > 0 ? `<div class="pb-item"><span>🌦️ +${premium.coverageExtHours}hr</span><span>+₹${premium.coverageExtCost}</span></div>` : ''}
      <div class="pb-total"><span>Total</span><span>₹${premium.finalPremium}/week</span></div>
    </div>`;
}

function renderPremiumComparison() {
  const tbody = document.getElementById('premiumComparisonTable');
  if (!tbody) return;
  const rows = [];
  CITIES.forEach(city => {
    city.zones.forEach(zone => {
      const basic = calculateDynamicPremium(city.name, zone.id, 'basic');
      const std = calculateDynamicPremium(city.name, zone.id, 'standard');
      const prem = calculateDynamicPremium(city.name, zone.id, 'premium');
      const tierColor = city.riskTier === 'high' ? 'badge-danger' : city.riskTier === 'medium' ? 'badge-warning' : 'badge-success';
      rows.push(`<tr>
        <td style="font-weight:500;">${city.name}</td>
        <td><span class="card-badge ${tierColor}">${city.riskTier}</span></td>
        <td>${zone.name}</td>
        <td>${zone.safeZone ? '<span style="color:var(--accent-success)">✅ Yes</span>' : '<span style="color:var(--accent-warning)">⚠️ No</span>'}</td>
        <td>₹${basic.finalPremium}</td>
        <td style="font-weight:600; color:var(--accent-primary-light);">₹${std.finalPremium}</td>
        <td>₹${prem.finalPremium}</td>
        <td>${basic.savings > 0 ? '<span style="color:var(--accent-success); font-weight:600;">-₹' + basic.savings + '</span>' : '-'}</td>
      </tr>`);
    });
  });
  tbody.innerHTML = rows.join('');
}
