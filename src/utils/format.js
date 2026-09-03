export const formatTime = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
};

export const formatRelative = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  const delta = Date.now() - date.getTime();
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return date.toLocaleDateString();
};

export const titleFromPrompt = (text) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) {
    return 'New conversation';
  }
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean;
};

export const maskSecret = (value) => {
  if (!value) {
    return 'Not configured';
  }
  if (value.length < 8) {
    return '••••••••';
  }
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
};
