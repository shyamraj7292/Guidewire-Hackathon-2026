// ========================================
// DEVTrails 2026 - GigShield Insurance
// Phase 2: Automation & Protection
// Data + ML Engine Layer
// ========================================

// ===== CITY DATA WITH ZONE-LEVEL RISK =====
const CITIES = [
  { name: 'Mumbai', lat: 19.076, lon: 72.877, riskTier: 'high', basePremium: 89, zones: [
    { id: 'MUM-01', name: 'Andheri East', waterlogRisk: 0.8, floodHistory: 12, safeZone: false },
    { id: 'MUM-02', name: 'Bandra West', waterlogRisk: 0.3, floodHistory: 3, safeZone: true },
    { id: 'MUM-03', name: 'Dadar', waterlogRisk: 0.6, floodHistory: 8, safeZone: false },
    { id: 'MUM-04', name: 'Powai', waterlogRisk: 0.2, floodHistory: 2, safeZone: true },
  ]},
  { name: 'Delhi', lat: 28.704, lon: 77.102, riskTier: 'high', basePremium: 99, zones: [
    { id: 'DEL-01', name: 'Connaught Place', waterlogRisk: 0.4, floodHistory: 5, safeZone: true },
    { id: 'DEL-02', name: 'Saket', waterlogRisk: 0.3, floodHistory: 3, safeZone: true },
    { id: 'DEL-03', name: 'Rohini', waterlogRisk: 0.7, floodHistory: 10, safeZone: false },
    { id: 'DEL-04', name: 'Dwarka', waterlogRisk: 0.5, floodHistory: 6, safeZone: false },
  ]},
  { name: 'Bangalore', lat: 12.972, lon: 77.594, riskTier: 'medium', basePremium: 69, zones: [
    { id: 'BLR-01', name: 'Koramangala', waterlogRisk: 0.5, floodHistory: 6, safeZone: false },
    { id: 'BLR-02', name: 'Whitefield', waterlogRisk: 0.3, floodHistory: 2, safeZone: true },
    { id: 'BLR-03', name: 'Indiranagar', waterlogRisk: 0.2, floodHistory: 1, safeZone: true },
  ]},
  { name: 'Chennai', lat: 13.083, lon: 80.270, riskTier: 'high', basePremium: 79, zones: [
    { id: 'CHN-01', name: 'T. Nagar', waterlogRisk: 0.7, floodHistory: 11, safeZone: false },
    { id: 'CHN-02', name: 'Adyar', waterlogRisk: 0.4, floodHistory: 4, safeZone: true },
    { id: 'CHN-03', name: 'Velachery', waterlogRisk: 0.9, floodHistory: 15, safeZone: false },
  ]},
  { name: 'Hyderabad', lat: 17.385, lon: 78.487, riskTier: 'medium', basePremium: 59, zones: [
    { id: 'HYD-01', name: 'HITEC City', waterlogRisk: 0.3, floodHistory: 3, safeZone: true },
    { id: 'HYD-02', name: 'Madhapur', waterlogRisk: 0.4, floodHistory: 4, safeZone: true },
  ]},
  { name: 'Pune', lat: 18.520, lon: 73.856, riskTier: 'low', basePremium: 49, zones: [
    { id: 'PUN-01', name: 'Kothrud', waterlogRisk: 0.2, floodHistory: 1, safeZone: true },
    { id: 'PUN-02', name: 'Hinjawadi', waterlogRisk: 0.3, floodHistory: 2, safeZone: true },
  ]},
  { name: 'Kolkata', lat: 22.573, lon: 88.364, riskTier: 'high', basePremium: 79, zones: [
    { id: 'KOL-01', name: 'Salt Lake', waterlogRisk: 0.6, floodHistory: 9, safeZone: false },
    { id: 'KOL-02', name: 'Park Street', waterlogRisk: 0.4, floodHistory: 4, safeZone: true },
  ]},
  { name: 'Ahmedabad', lat: 23.023, lon: 72.571, riskTier: 'medium', basePremium: 59, zones: [
    { id: 'AMD-01', name: 'SG Highway', waterlogRisk: 0.3, floodHistory: 2, safeZone: true },
    { id: 'AMD-02', name: 'Maninagar', waterlogRisk: 0.5, floodHistory: 5, safeZone: false },
  ]},
];

const PLATFORMS = ['Zepto', 'Blinkit', 'Swiggy Instamart', 'BigBasket', 'JioMart'];
const VEHICLE_TYPES = ['Bicycle', 'Scooter/Bike', 'E-Bike', 'Auto'];

// ===== INSURANCE PLANS =====
const INSURANCE_PLANS = [
  {
    id: 'basic',
    name: 'GigShield Basic',
    icon: '🛡️',
    color: '#3b82f6',
    coverageHours: 8,
    coverageDays: 6,
    triggers: ['rain', 'heat'],
    maxWeeklyPayout: 1500,
    description: 'Essential protection against rain and heatwave disruptions.',
    features: ['Rain & Heat coverage', '8 hrs/day coverage', 'Auto-payout within 5 min', 'SMS notifications'],
  },
  {
    id: 'standard',
    name: 'GigShield Pro',
    icon: '⚡',
    color: '#6366f1',
    coverageHours: 12,
    coverageDays: 7,
    triggers: ['rain', 'heat', 'aqi'],
    maxWeeklyPayout: 2500,
    description: 'Comprehensive coverage including air quality disruptions.',
    features: ['Rain, Heat & AQI coverage', '12 hrs/day coverage', 'Auto-payout within 2 min', 'App + SMS notifications', 'Waterlogging alerts'],
    popular: true,
  },
  {
    id: 'premium',
    name: 'GigShield Ultra',
    icon: '💎',
    color: '#8b5cf6',
    coverageHours: 16,
    coverageDays: 7,
    triggers: ['rain', 'heat', 'aqi', 'waterlog', 'traffic'],
    maxWeeklyPayout: 4000,
    description: 'Maximum protection with all 5 triggers and highest payouts.',
    features: ['All 5 trigger coverage', '16 hrs/day coverage', 'Instant auto-payout', 'Priority support', 'Predictive weather alerts', 'Platform outage coverage'],
  },
];

// ===== TRIGGER THRESHOLDS =====
const TRIGGER_THRESHOLDS = {
  rain: { threshold: 10, unit: 'mm/hr', label: 'Heavy Rainfall', payoutPct: 0.60, icon: '🌧️', api: 'OpenWeatherMap' },
  heat: { threshold: 45, unit: '°C HI', label: 'Extreme Heat', payoutPct: 0.50, icon: '🌡️', api: 'OpenWeatherMap' },
  aqi: { threshold: 300, unit: 'AQI', label: 'Hazardous Air', payoutPct: 0.40, icon: '💨', api: 'AQICN' },
  waterlog: { threshold: 200, unit: 'mm water', label: 'Waterlogging', payoutPct: 0.55, icon: '🌊', api: 'Municipal IoT' },
  traffic: { threshold: 85, unit: '% blocked', label: 'Traffic Chaos', payoutPct: 0.35, icon: '🚦', api: 'Google Maps' },
  combined: { threshold: null, unit: '', label: 'Combined Disruption', payoutPct: 0.80, icon: '⚠️', api: 'Multi-source' },
};

// ===== DELIVERY PARTNER PROFILES =====
const DELIVERY_PARTNER_PROFILES = [
  { name: 'Ravi Kumar', age: 26, city: 'Mumbai', zone: 'MUM-01', platform: 'Zepto', avgDailyIncome: 850, avgOrdersPerDay: 18, joinedMonths: 14, activeDays: 6, vehicle: 'Scooter/Bike', phone: '9876XXXXXX' },
  { name: 'Priya Sharma', age: 29, city: 'Delhi', zone: 'DEL-02', platform: 'Blinkit', avgDailyIncome: 920, avgOrdersPerDay: 20, joinedMonths: 22, activeDays: 7, vehicle: 'Scooter/Bike', phone: '9812XXXXXX' },
  { name: 'Arun Patel', age: 24, city: 'Bangalore', zone: 'BLR-01', platform: 'Swiggy Instamart', avgDailyIncome: 780, avgOrdersPerDay: 16, joinedMonths: 8, activeDays: 6, vehicle: 'E-Bike', phone: '9845XXXXXX' },
  { name: 'Meena Devi', age: 31, city: 'Chennai', zone: 'CHN-02', platform: 'BigBasket', avgDailyIncome: 700, avgOrdersPerDay: 15, joinedMonths: 18, activeDays: 5, vehicle: 'Bicycle', phone: '9944XXXXXX' },
  { name: 'Suresh Yadav', age: 27, city: 'Delhi', zone: 'DEL-03', platform: 'Zepto', avgDailyIncome: 880, avgOrdersPerDay: 19, joinedMonths: 11, activeDays: 6, vehicle: 'Scooter/Bike', phone: '9999XXXXXX' },
  { name: 'Anjali Reddy', age: 25, city: 'Hyderabad', zone: 'HYD-01', platform: 'Swiggy Instamart', avgDailyIncome: 750, avgOrdersPerDay: 17, joinedMonths: 9, activeDays: 6, vehicle: 'E-Bike', phone: '9885XXXXXX' },
];

// ===== IN-MEMORY DATABASES =====
let registeredPartners = [...DELIVERY_PARTNER_PROFILES.map((p, i) => ({
  id: `GS-${1000 + i}`,
  ...p,
  aadhaar: `${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)} ${Math.floor(1000 + Math.random()*9000)}`,
  registeredAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
  status: 'active',
}))];

let policies = registeredPartners.map((p, i) => {
  const plan = INSURANCE_PLANS[i % 3];
  const city = CITIES.find(c => c.name === p.city);
  const zone = city?.zones.find(z => z.id === p.zone);
  const premium = calculateDynamicPremium(p.city, p.zone, plan.id);
  const startDate = new Date(Date.now() - Math.random() * 14 * 86400000);
  const endDate = new Date(startDate.getTime() + 7 * 86400000);
  return {
    id: `POL-${2000 + i}`,
    partnerId: p.id,
    partnerName: p.name,
    city: p.city,
    zone: p.zone,
    zoneName: zone?.name || p.zone,
    planId: plan.id,
    planName: plan.name,
    planIcon: plan.icon,
    weeklyPremium: premium.finalPremium,
    premiumBreakdown: premium,
    maxWeeklyPayout: plan.maxWeeklyPayout,
    coverageHours: plan.coverageHours,
    triggers: plan.triggers,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    status: endDate > new Date() ? 'active' : 'expired',
    autoRenew: true,
    createdAt: startDate.toISOString(),
  };
});

let claims = [];

// Generate initial claims from existing profiles
(function generateInitialClaims() {
  const triggerTypes = ['rain', 'heat', 'aqi', 'waterlog', 'traffic'];
  const statuses = ['paid', 'paid', 'paid', 'processing', 'verified'];
  
  policies.forEach((pol, i) => {
    const numClaims = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numClaims; j++) {
      const trigType = triggerTypes[Math.floor(Math.random() * triggerTypes.length)];
      const trig = TRIGGER_THRESHOLDS[trigType];
      const amount = Math.round(pol.maxWeeklyPayout * trig.payoutPct * (0.6 + Math.random() * 0.4));
      const claimDate = new Date(Date.now() - Math.random() * 10 * 86400000);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      claims.push({
        id: `CLM-${3000 + i * 10 + j}`,
        policyId: pol.id,
        partnerId: pol.partnerId,
        partnerName: pol.partnerName,
        city: pol.city,
        zone: pol.zone,
        triggerType: trigType,
        triggerLabel: trig.label,
        triggerIcon: trig.icon,
        triggerValue: trigType === 'rain' ? (10 + Math.random() * 20).toFixed(1) + ' mm/hr'
          : trigType === 'heat' ? (45 + Math.random() * 5).toFixed(1) + ' °C'
          : trigType === 'aqi' ? Math.round(300 + Math.random() * 200) + ' AQI'
          : trigType === 'waterlog' ? Math.round(200 + Math.random() * 150) + ' mm'
          : Math.round(85 + Math.random() * 15) + '%',
        amount,
        status,
        filedAt: claimDate.toISOString(),
        processedAt: status === 'paid' ? new Date(claimDate.getTime() + 120000).toISOString() : null,
        paidAt: status === 'paid' ? new Date(claimDate.getTime() + 180000).toISOString() : null,
        autoTriggered: true,
        processingTime: status === 'paid' ? `${Math.round(1 + Math.random() * 3)} min` : 'Processing...',
        evidence: {
          apiSource: trig.api,
          timestamp: claimDate.toISOString(),
          location: pol.zoneName,
          dataPoints: Math.round(3 + Math.random() * 5),
        },
      });
    }
  });
  claims.sort((a, b) => new Date(b.filedAt) - new Date(a.filedAt));
})();


// ===== ML-BASED DYNAMIC PREMIUM CALCULATION =====
function calculateDynamicPremium(cityName, zoneId, planId) {
  const city = CITIES.find(c => c.name === cityName);
  if (!city) return { finalPremium: 89, breakdown: {} };

  const zone = city.zones.find(z => z.id === zoneId);
  const plan = INSURANCE_PLANS.find(p => p.id === planId) || INSURANCE_PLANS[1];
  const basePremium = city.basePremium;

  // Factor 1: Plan multiplier
  const planMultiplier = plan.id === 'basic' ? 0.85 : plan.id === 'premium' ? 1.35 : 1.0;

  // Factor 2: Zone safety discount (₹2-5 less for historically safe zones)
  const zoneSafetyDiscount = zone?.safeZone ? -(2 + Math.round(zone.waterlogRisk * 3)) : 0;

  // Factor 3: Seasonal adjustment (monsoon = Jun-Sep, winter AQI = Nov-Jan)
  const month = new Date().getMonth();
  const isMonsoon = month >= 5 && month <= 8;
  const isWinterSmog = month >= 10 || month <= 0;
  const seasonalAdj = isMonsoon ? Math.round(basePremium * 0.12) : isWinterSmog ? Math.round(basePremium * 0.08) : 0;
  const seasonLabel = isMonsoon ? 'Monsoon surcharge' : isWinterSmog ? 'Winter AQI surcharge' : 'No seasonal adj.';

  // Factor 4: Claims frequency adjustment
  const claimFreq = city.riskTier === 'high' ? 0.05 : city.riskTier === 'medium' ? 0.02 : 0;
  const claimsAdj = Math.round(basePremium * claimFreq);

  // Factor 5: Predictive weather coverage extension
  const weatherPredRisk = zone ? zone.waterlogRisk : 0.5;
  const coverageExtHours = weatherPredRisk > 0.6 ? 2 : 0;
  const coverageExtCost = coverageExtHours * 3; // ₹3 per extra hour

  // Final calculation
  const adjustedBase = Math.round(basePremium * planMultiplier);
  const finalPremium = Math.max(29, adjustedBase + zoneSafetyDiscount + seasonalAdj + claimsAdj + coverageExtCost);

  return {
    finalPremium,
    basePremium,
    adjustedBase,
    planMultiplier,
    planName: plan.name,
    zoneSafetyDiscount,
    zoneIsSafe: zone?.safeZone || false,
    zoneName: zone?.name || 'Unknown',
    seasonalAdj,
    seasonLabel,
    claimsAdj,
    coverageExtHours,
    coverageExtCost,
    cityRiskTier: city.riskTier,
    savings: zoneSafetyDiscount < 0 ? Math.abs(zoneSafetyDiscount) : 0,
  };
}


// ===== 5 AUTOMATED TRIGGER MOCK APIs =====
function mockWeatherAPI(city) {
  const cityData = CITIES.find(c => c.name === city);
  const isMonsoonCity = ['Mumbai', 'Chennai', 'Kolkata'].includes(city);
  const rain = isMonsoonCity ? Math.random() * 30 : Math.random() * 12;
  return {
    source: 'OpenWeatherMap API',
    city,
    timestamp: new Date().toISOString(),
    rainfall_mm_hr: Math.round(rain * 10) / 10,
    temperature_c: Math.round((28 + Math.random() * 15) * 10) / 10,
    humidity_pct: Math.round(50 + Math.random() * 40),
    wind_kmh: Math.round(5 + Math.random() * 30),
    triggered: rain > TRIGGER_THRESHOLDS.rain.threshold,
  };
}

function mockAQIAPI(city) {
  const isHighAQI = ['Delhi', 'Kolkata'].includes(city);
  const aqi = isHighAQI ? Math.round(180 + Math.random() * 250) : Math.round(50 + Math.random() * 200);
  return {
    source: 'AQICN API',
    city,
    timestamp: new Date().toISOString(),
    aqi,
    pm25: Math.round(aqi * 0.6),
    pm10: Math.round(aqi * 0.8),
    dominant_pollutant: aqi > 200 ? 'PM2.5' : 'PM10',
    triggered: aqi > TRIGGER_THRESHOLDS.aqi.threshold,
  };
}

function mockWaterloggingAPI(city) {
  const cityData = CITIES.find(c => c.name === city);
  const zones = cityData?.zones || [];
  return zones.map(z => {
    const waterLevel = Math.round(z.waterlogRisk * (150 + Math.random() * 200));
    return {
      source: 'Municipal IoT Sensors',
      city,
      zone: z.id,
      zoneName: z.name,
      timestamp: new Date().toISOString(),
      water_level_mm: waterLevel,
      sensor_count: Math.round(3 + Math.random() * 5),
      triggered: waterLevel > TRIGGER_THRESHOLDS.waterlog.threshold,
    };
  });
}

function mockTrafficAPI(city) {
  const congestion = Math.round(30 + Math.random() * 65);
  const roadsClosed = Math.floor(Math.random() * 5);
  return {
    source: 'Google Maps API',
    city,
    timestamp: new Date().toISOString(),
    congestion_pct: congestion,
    roads_closed: roadsClosed,
    avg_delay_min: Math.round(5 + congestion * 0.3),
    triggered: congestion > TRIGGER_THRESHOLDS.traffic.threshold,
  };
}

function mockPlatformOutageAPI() {
  const platforms = PLATFORMS;
  return platforms.map(p => {
    const isDown = Math.random() < 0.08; // 8% chance any platform is down
    return {
      source: 'Platform Status API',
      platform: p,
      timestamp: new Date().toISOString(),
      status: isDown ? 'degraded' : 'operational',
      uptime_pct: isDown ? Math.round(70 + Math.random() * 20) : Math.round(98 + Math.random() * 2),
      affected_cities: isDown ? [CITIES[Math.floor(Math.random() * CITIES.length)].name] : [],
    };
  });
}

// Run all 5 APIs for a city
function runAllTriggerAPIs(city) {
  return {
    weather: mockWeatherAPI(city),
    aqi: mockAQIAPI(city),
    waterlogging: mockWaterloggingAPI(city),
    traffic: mockTrafficAPI(city),
    platformOutage: mockPlatformOutageAPI(),
    timestamp: new Date().toISOString(),
  };
}


// ===== ZERO-TOUCH CLAIM GENERATION =====
function generateAutoClaimFromTrigger(policy, triggerType, triggerData) {
  const trig = TRIGGER_THRESHOLDS[triggerType];
  if (!trig) return null;

  const amount = Math.round(policy.maxWeeklyPayout * trig.payoutPct * (0.7 + Math.random() * 0.3));
  const now = new Date();

  const claim = {
    id: `CLM-${3000 + claims.length}`,
    policyId: policy.id,
    partnerId: policy.partnerId,
    partnerName: policy.partnerName,
    city: policy.city,
    zone: policy.zone,
    triggerType,
    triggerLabel: trig.label,
    triggerIcon: trig.icon,
    triggerValue: triggerData,
    amount,
    status: 'paid',
    filedAt: now.toISOString(),
    processedAt: new Date(now.getTime() + 60000).toISOString(),
    paidAt: new Date(now.getTime() + 120000).toISOString(),
    autoTriggered: true,
    processingTime: `${1 + Math.round(Math.random() * 2)} min`,
    evidence: {
      apiSource: trig.api,
      timestamp: now.toISOString(),
      location: policy.zoneName,
      dataPoints: Math.round(3 + Math.random() * 5),
    },
  };

  claims.unshift(claim);
  return claim;
}

// ===== REGISTRATION HELPERS =====
function registerPartner(data) {
  const id = `GS-${1000 + registeredPartners.length}`;
  const partner = {
    id,
    ...data,
    registeredAt: new Date().toISOString(),
    status: 'active',
  };
  registeredPartners.push(partner);
  return partner;
}

function createPolicy(partner, planId) {
  const plan = INSURANCE_PLANS.find(p => p.id === planId);
  if (!plan) return null;
  
  const premium = calculateDynamicPremium(partner.city, partner.zone, planId);
  const city = CITIES.find(c => c.name === partner.city);
  const zone = city?.zones.find(z => z.id === partner.zone);
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 7 * 86400000);

  const policy = {
    id: `POL-${2000 + policies.length}`,
    partnerId: partner.id,
    partnerName: partner.name,
    city: partner.city,
    zone: partner.zone,
    zoneName: zone?.name || partner.zone,
    planId: plan.id,
    planName: plan.name,
    planIcon: plan.icon,
    weeklyPremium: premium.finalPremium,
    premiumBreakdown: premium,
    maxWeeklyPayout: plan.maxWeeklyPayout,
    coverageHours: plan.coverageHours,
    triggers: plan.triggers,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    status: 'active',
    autoRenew: true,
    createdAt: startDate.toISOString(),
  };

  policies.push(policy);
  return policy;
}

// Legacy compat — premiumWeekly fallback
CITIES.forEach(c => { c.premiumWeekly = c.basePremium; });

// ===== WEATHER DATA GENERATION (Phase 1 compat) =====
function generateWeatherData(city, scenarioType = 'normal') {
  const data = [];
  const now = new Date();
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - day));
      date.setHours(hour, 0, 0, 0);

      let rain = 0, temp = 30, humidity = 60, heatIndex = 32, aqi = 120;

      if (scenarioType === 'monsoon' || (city === 'Mumbai' && day >= 4)) {
        rain = Math.random() * 25 + (hour >= 14 && hour <= 20 ? 15 : 2);
        temp = 26 + Math.random() * 4;
        humidity = 85 + Math.random() * 10;
        aqi = 80 + Math.random() * 60;
      } else if (scenarioType === 'heatwave' || (city === 'Delhi' && day >= 3)) {
        rain = 0;
        temp = 40 + Math.random() * 8;
        humidity = 30 + Math.random() * 20;
        heatIndex = temp + (humidity > 40 ? (humidity - 40) * 0.3 : 0);
        aqi = 200 + Math.random() * 200;
      } else if (scenarioType === 'pollution' || city === 'Delhi') {
        rain = Math.random() * 2;
        temp = 28 + Math.random() * 8;
        humidity = 50 + Math.random() * 20;
        aqi = 250 + Math.random() * 150;
      } else {
        rain = Math.random() * 5;
        temp = 25 + Math.random() * 10;
        humidity = 50 + Math.random() * 30;
        aqi = 60 + Math.random() * 100;
      }

      heatIndex = temp + (humidity > 40 ? (humidity - 40) * 0.15 : 0);

      data.push({
        timestamp: date.toISOString(),
        hour, day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        rain: Math.round(rain * 10) / 10,
        temperature: Math.round(temp * 10) / 10,
        humidity: Math.round(humidity),
        heatIndex: Math.round(heatIndex * 10) / 10,
        aqi: Math.round(aqi),
        windSpeed: Math.round((5 + Math.random() * 25) * 10) / 10,
      });
    }
  }
  return data;
}

function generatePlatformActivity(partner, weatherData) {
  return weatherData.map(w => {
    let baseOrders = partner.avgOrdersPerDay / 12;
    if (w.hour < 8 || w.hour > 22) baseOrders = 0;
    if (w.hour >= 11 && w.hour <= 14) baseOrders *= 1.4;
    if (w.hour >= 18 && w.hour <= 21) baseOrders *= 1.6;
    let reductionFactor = 1;
    if (w.rain > 10) reductionFactor *= 0.3;
    else if (w.rain > 5) reductionFactor *= 0.6;
    if (w.heatIndex > 45) reductionFactor *= 0.35;
    else if (w.heatIndex > 40) reductionFactor *= 0.65;
    if (w.aqi > 300) reductionFactor *= 0.4;
    else if (w.aqi > 200) reductionFactor *= 0.7;
    const orders = Math.round(baseOrders * reductionFactor * (0.8 + Math.random() * 0.4));
    return {
      timestamp: w.timestamp, hour: w.hour, day: w.day,
      ordersCompleted: Math.max(0, orders),
      estimatedIncome: Math.round(orders * (45 + Math.random() * 15)),
      wasOnline: w.hour >= 8 && w.hour <= 22,
      reductionFactor: Math.round(reductionFactor * 100) / 100,
    };
  });
}

function evaluateTriggers(weatherPoint) {
  const triggered = [];
  if (weatherPoint.rain > TRIGGER_THRESHOLDS.rain.threshold)
    triggered.push({ ...TRIGGER_THRESHOLDS.rain, value: weatherPoint.rain });
  if (weatherPoint.heatIndex > TRIGGER_THRESHOLDS.heat.threshold)
    triggered.push({ ...TRIGGER_THRESHOLDS.heat, value: weatherPoint.heatIndex });
  if (weatherPoint.aqi > TRIGGER_THRESHOLDS.aqi.threshold)
    triggered.push({ ...TRIGGER_THRESHOLDS.aqi, value: weatherPoint.aqi });
  if (triggered.length >= 2)
    triggered.push({ ...TRIGGER_THRESHOLDS.combined, value: triggered.length });
  return triggered;
}

function calculatePayout(partner, triggers) {
  if (triggers.length === 0) return 0;
  const hasCombined = triggers.some(t => t.label === 'Combined Disruption');
  const maxPct = hasCombined ? 0.80 : Math.max(...triggers.map(t => t.payoutPct));
  return Math.round(Math.min(partner.avgDailyIncome * maxPct, 2000));
}

function generateFinancialSummary(city, partners) {
  const cityData = CITIES.find(c => c.name === city) || CITIES[0];
  const enrolledPartners = partners.filter(p => p.city === city);
  const totalPremiumIncome = enrolledPartners.length * cityData.basePremium;
  const platformCoPay = totalPremiumIncome * 0.3;
  return {
    city: cityData.name, riskTier: cityData.riskTier,
    weeklyPremium: cityData.basePremium,
    enrolledPartners: enrolledPartners.length,
    totalPremiumIncome, platformCoPay: Math.round(platformCoPay),
    totalPool: Math.round(totalPremiumIncome + platformCoPay),
    maxPayoutPerPartner: 2000,
    projectedClaimRate: cityData.riskTier === 'high' ? 0.35 : cityData.riskTier === 'medium' ? 0.20 : 0.10,
  };
}

function generatePayoutHistory(partner, weatherData) {
  const payouts = [];
  const dailyData = {};
  weatherData.forEach(w => {
    const dateKey = w.timestamp.split('T')[0];
    if (!dailyData[dateKey]) dailyData[dateKey] = [];
    dailyData[dateKey].push(w);
  });
  Object.entries(dailyData).forEach(([date, hourlyData]) => {
    const triggers = [];
    hourlyData.forEach(h => { const t = evaluateTriggers(h); if (t.length > 0) triggers.push(...t); });
    const uniqueTriggers = [...new Map(triggers.map(t => [t.label, t])).values()];
    if (uniqueTriggers.length > 0) {
      const amount = calculatePayout(partner, uniqueTriggers);
      if (amount > 0) {
        payouts.push({
          date, partner: partner.name,
          triggers: uniqueTriggers.map(t => `${t.icon} ${t.label}`),
          amount, status: 'Auto-Paid', processingTime: '< 2 min',
        });
      }
    }
  });
  return payouts;
}

function predictIncomeLoss(city, partner) {
  const predictions = [];
  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const date = new Date(now); date.setDate(date.getDate() + i);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    const baseRisk = Math.random();
    let riskLevel, predictedLoss, confidence;
    if (city === 'Mumbai' && i >= 3) {
      riskLevel = 'high'; predictedLoss = Math.round(partner.avgDailyIncome * (0.4 + Math.random() * 0.3)); confidence = 75 + Math.random() * 15;
    } else if (city === 'Delhi') {
      riskLevel = baseRisk > 0.5 ? 'high' : 'medium'; predictedLoss = Math.round(partner.avgDailyIncome * (0.2 + Math.random() * 0.4)); confidence = 65 + Math.random() * 20;
    } else {
      riskLevel = baseRisk > 0.7 ? 'medium' : 'low'; predictedLoss = Math.round(partner.avgDailyIncome * (0.05 + Math.random() * 0.2)); confidence = 60 + Math.random() * 25;
    }
    predictions.push({
      date: date.toISOString().split('T')[0], dayName, riskLevel, predictedLoss,
      predictedIncome: partner.avgDailyIncome - predictedLoss,
      confidence: Math.round(confidence),
      factors: riskLevel === 'high' ? ['Heavy rainfall', 'AQI spike', 'Reduced orders'] : riskLevel === 'medium' ? ['Moderate heat', 'Rain showers'] : ['Normal conditions'],
    });
  }
  return predictions;
}
