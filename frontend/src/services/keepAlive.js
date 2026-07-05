import api from '../api/axios';

let keepAliveTimer = null;

const checkHealth = async () => {
  try {
    await api.get('/health');
  } catch (error) {
    // Fail silently
  }
};

const scheduleNextPing = (interval) => {
  keepAliveTimer = setTimeout(async () => {
    await checkHealth();
    scheduleNextPing(interval);
  }, interval);
};

export const startKeepAlive = () => {
  const isEnabled = import.meta.env.VITE_KEEP_ALIVE_ENABLED === 'true';
  const isDev = import.meta.env.DEV;

  if (!isEnabled || isDev) {
    return;
  }

  // Prevent multiple timers
  if (keepAliveTimer) {
    clearTimeout(keepAliveTimer);
  }

  const interval = parseInt(import.meta.env.VITE_KEEP_ALIVE_INTERVAL, 10) || 600000;

  scheduleNextPing(interval);
};

export const stopKeepAlive = () => {
  if (keepAliveTimer) {
    clearTimeout(keepAliveTimer);
    keepAliveTimer = null;
  }
};
