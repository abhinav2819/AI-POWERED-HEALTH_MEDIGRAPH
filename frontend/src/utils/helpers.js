export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  // Convert paise to rupees
  const rupees = amount / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rupees);
};

export const formatMetricValue = (type, value) => {
  switch(type) {
    case 'STEPS':
      return `${value.toLocaleString()} steps`;
    case 'HEART_RATE':
      return `${value} bpm`;
    case 'SLEEP':
      return `${value} hours`;
    case 'CALORIES':
      return `${value} cal`;
    default:
      return value;
  }
};

export const getMetricIcon = (type) => {
  const icons = {
    STEPS: 'footprints',
    HEART_RATE: 'heart-pulse',
    SLEEP: 'moon',
    CALORIES: 'flame'
  };
  return icons[type] || 'activity';
};

export const getMetricColor = (type) => {
  const colors = {
    STEPS: '#8A9A5B',
    HEART_RATE: '#E2725B',
    SLEEP: '#6B7280',
    CALORIES: '#D97706'
  };
  return colors[type] || '#8A9A5B';
};