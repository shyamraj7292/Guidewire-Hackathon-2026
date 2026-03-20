// ========================================
// DEVTrails 2026 - GigShield Insurance
// Mock Data Layer for Grocery/Q-Commerce
// ========================================

const CITIES = [
  { name: 'Mumbai', lat: 19.076, lon: 72.877, riskTier: 'high', premiumWeekly: 89 },
  { name: 'Delhi', lat: 28.704, lon: 77.102, riskTier: 'high', premiumWeekly: 99 },
  { name: 'Bangalore', lat: 12.972, lon: 77.594, riskTier: 'medium', premiumWeekly: 69 },
  { name: 'Chennai', lat: 13.083, lon: 80.270, riskTier: 'high', premiumWeekly: 79 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.487, riskTier: 'medium', premiumWeekly: 59 },
  { name: 'Pune', lat: 18.520, lon: 73.856, riskTier: 'low', premiumWeekly: 49 },
  { name: 'Kolkata', lat: 22.573, lon: 88.364, riskTier: 'high', premiumWeekly: 79 },
  { name: 'Ahmedabad', lat: 23.023, lon: 72.571, riskTier: 'medium', premiumWeekly: 59 },
];

const PLATFORMS = ['Zepto', 'Blinkit', 'Swiggy Instamart', 'BigBasket', 'JioMart'];

const TRIGGER_THRESHOLDS = {
  rain: { threshold: 10, unit: 'mm/hr', label: 'Heavy Rainfall', payoutPct: 0.60, icon: '🌧️' },
  heat: { threshold: 45, unit: '°C', label: 'Extreme Heat', payoutPct: 0.50, icon: '🌡️' },
  aqi: { threshold: 300, unit: 'AQI', label: 'Hazardous Air Quality', payoutPct: 0.40, icon: '💨' },
  combined: { threshold: null, unit: '', label: 'Combined Disruption', payoutPct: 0.80, icon: '⚠️' },
};

const DELIVERY_PARTNER_PROFILES = [
  { name: 'Ravi Kumar', age: 26, city: 'Mumbai', platform: 'Zepto', avgDailyIncome: 850, avgOrdersPerDay: 18, joinedMonths: 14, activeDays: 6 },
  { name: 'Priya Sharma', age: 29, city: 'Delhi', platform: 'Blinkit', avgDailyIncome: 920, avgOrdersPerDay: 20, joinedMonths: 22, activeDays: 7 },
  { name: 'Arun Patel', age: 24, city: 'Bangalore', platform: 'Swiggy Instamart', avgDailyIncome: 780, avgOrdersPerDay: 16, joinedMonths: 8, activeDays: 6 },
  { name: 'Meena Devi', age: 31, city: 'Chennai', platform: 'BigBasket', avgDailyIncome: 700, avgOrdersPerDay: 15, joinedMonths: 18, activeDays: 5 },
  { name: 'Suresh Yadav', age: 27, city: 'Delhi', platform: 'Zepto', avgDailyIncome: 880, avgOrdersPerDay: 19, joinedMonths: 11, activeDays: 6 },
  { name: 'Anjali Reddy', age: 25, city: 'Hyderabad', platform: 'Swiggy Instamart', avgDailyIncome: 750, avgOrdersPerDay: 17, joinedMonths: 9, activeDays: 6 },
];

// Generate realistic hourly weather data for a week
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
        hour,
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
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

// Generate platform activity data (orders per hour)
function generatePlatformActivity(partner, weatherData) {
  return weatherData.map(w => {
    let baseOrders = partner.avgOrdersPerDay / 12; // spread across 12 active hours
    // Only active between 8 AM and 10 PM
    if (w.hour < 8 || w.hour > 22) baseOrders = 0;
    // Peak hours
    if (w.hour >= 11 && w.hour <= 14) baseOrders *= 1.4;
    if (w.hour >= 18 && w.hour <= 21) baseOrders *= 1.6;

    // Reduce orders based on disruptions
    let reductionFactor = 1;
    if (w.rain > 10) reductionFactor *= 0.3;
    else if (w.rain > 5) reductionFactor *= 0.6;
    if (w.heatIndex > 45) reductionFactor *= 0.35;
    else if (w.heatIndex > 40) reductionFactor *= 0.65;
    if (w.aqi > 300) reductionFactor *= 0.4;
    else if (w.aqi > 200) reductionFactor *= 0.7;

    const orders = Math.round(baseOrders * reductionFactor * (0.8 + Math.random() * 0.4));
    const incomePerOrder = 45 + Math.random() * 15;

    return {
      timestamp: w.timestamp,
      hour: w.hour,
      day: w.day,
      ordersCompleted: Math.max(0, orders),
      estimatedIncome: Math.round(orders * incomePerOrder),
      wasOnline: w.hour >= 8 && w.hour <= 22,
      reductionFactor: Math.round(reductionFactor * 100) / 100,
    };
  });
}

// Evaluate triggers for a given weather data point
function evaluateTriggers(weatherPoint) {
  const triggered = [];
  if (weatherPoint.rain > TRIGGER_THRESHOLDS.rain.threshold) {
    triggered.push({ ...TRIGGER_THRESHOLDS.rain, value: weatherPoint.rain });
  }
  if (weatherPoint.heatIndex > TRIGGER_THRESHOLDS.heat.threshold) {
    triggered.push({ ...TRIGGER_THRESHOLDS.heat, value: weatherPoint.heatIndex });
  }
  if (weatherPoint.aqi > TRIGGER_THRESHOLDS.aqi.threshold) {
    triggered.push({ ...TRIGGER_THRESHOLDS.aqi, value: weatherPoint.aqi });
  }
  if (triggered.length >= 2) {
    triggered.push({ ...TRIGGER_THRESHOLDS.combined, value: triggered.length });
  }
  return triggered;
}

// Calculate payout for a partner based on triggers
function calculatePayout(partner, triggers) {
  if (triggers.length === 0) return 0;
  const hasCombined = triggers.some(t => t.label === 'Combined Disruption');
  const maxPct = hasCombined ? 0.80 : Math.max(...triggers.map(t => t.payoutPct));
  const payout = Math.min(partner.avgDailyIncome * maxPct, 2000);
  return Math.round(payout);
}

// Generate weekly financial summary
function generateFinancialSummary(city, partners) {
  const cityData = CITIES.find(c => c.name === city) || CITIES[0];
  const enrolledPartners = partners.filter(p => p.city === city);
  const totalPremiumIncome = enrolledPartners.length * cityData.premiumWeekly;
  const platformCoPay = totalPremiumIncome * 0.3; // 30% platform co-payment
  const totalPool = totalPremiumIncome + platformCoPay;

  return {
    city: cityData.name,
    riskTier: cityData.riskTier,
    weeklyPremium: cityData.premiumWeekly,
    enrolledPartners: enrolledPartners.length,
    totalPremiumIncome,
    platformCoPay: Math.round(platformCoPay),
    totalPool: Math.round(totalPool),
    maxPayoutPerPartner: 2000,
    projectedClaimRate: cityData.riskTier === 'high' ? 0.35 : cityData.riskTier === 'medium' ? 0.20 : 0.10,
  };
}

// Generate payout history (simulated)
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
    hourlyData.forEach(h => {
      const t = evaluateTriggers(h);
      if (t.length > 0) triggers.push(...t);
    });

    const uniqueTriggers = [...new Map(triggers.map(t => [t.label, t])).values()];
    if (uniqueTriggers.length > 0) {
      const amount = calculatePayout(partner, uniqueTriggers);
      if (amount > 0) {
        payouts.push({
          date,
          partner: partner.name,
          triggers: uniqueTriggers.map(t => `${t.icon} ${t.label}`),
          amount,
          status: 'Auto-Paid',
          processingTime: '< 2 min',
        });
      }
    }
  });

  return payouts;
}

// AI/ML Mock: Predict income loss for next 7 days
function predictIncomeLoss(city, partner) {
  const predictions = [];
  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];

    // Simulate ML predictions with some variability
    const baseRisk = Math.random();
    let riskLevel, predictedLoss, confidence;

    if (city === 'Mumbai' && i >= 3) {
      riskLevel = 'high';
      predictedLoss = Math.round(partner.avgDailyIncome * (0.4 + Math.random() * 0.3));
      confidence = 75 + Math.random() * 15;
    } else if (city === 'Delhi') {
      riskLevel = baseRisk > 0.5 ? 'high' : 'medium';
      predictedLoss = Math.round(partner.avgDailyIncome * (0.2 + Math.random() * 0.4));
      confidence = 65 + Math.random() * 20;
    } else {
      riskLevel = baseRisk > 0.7 ? 'medium' : 'low';
      predictedLoss = Math.round(partner.avgDailyIncome * (0.05 + Math.random() * 0.2));
      confidence = 60 + Math.random() * 25;
    }

    predictions.push({
      date: date.toISOString().split('T')[0],
      dayName,
      riskLevel,
      predictedLoss,
      predictedIncome: partner.avgDailyIncome - predictedLoss,
      confidence: Math.round(confidence),
      factors: riskLevel === 'high'
        ? ['Heavy rainfall expected', 'AQI likely to spike', 'Reduced order volume']
        : riskLevel === 'medium'
          ? ['Moderate heat expected', 'Possible rain showers']
          : ['Normal conditions expected'],
    });
  }
  return predictions;
}
