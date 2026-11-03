const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('honeyguard_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `Request failed (${res.status})`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  changePassword: (passwords) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(passwords) }),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Honeytokens
  getHoneytokens: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.is_active !== undefined && params.is_active !== null) query.append('is_active', params.is_active);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return request(`/honeytokens${qs ? `?${qs}` : ''}`);
  },
  getHoneytoken: (id) => request(`/honeytokens/${id}`),
  createHoneytoken: (tokenData) => request('/honeytokens', { method: 'POST', body: JSON.stringify(tokenData) }),
  updateHoneytoken: (id, tokenData) => request(`/honeytokens/${id}`, { method: 'PUT', body: JSON.stringify(tokenData) }),
  deleteHoneytoken: (id) => request(`/honeytokens/${id}`, { method: 'DELETE' }),
  getTokenHistory: (id) => request(`/honeytokens/${id}/history`),
  generateDecoyPreview: (category) => request(`/honeytokens/generate-preview?category=${category}`),

  // Controlled Deception Environment
  getDeceptionAssets: () => request('/deception/assets'),
  deceptionLogin: (data) => request('/deception/login', { method: 'POST', body: JSON.stringify(data) }),
  deceptionApiCall: (key) => request('/deception/api-gateway', { headers: { 'X-Honey-Key': key } }),
  deceptionDbQuery: (data) => request('/deception/database-query', { method: 'POST', body: JSON.stringify(data) }),
  deceptionDocumentAccess: (docName) => request(`/deception/document/${encodeURIComponent(docName)}`),
  deceptionSensitiveFile: (filePath) => request(`/deception/sensitive-file?file_path=${encodeURIComponent(filePath)}`),

  // Security Lab Demonstration
  simulateLabAttack: (attackType) => request('/deception/simulate-attack', {
    method: 'POST',
    body: JSON.stringify({ attack_type: attackType })
  }),

  // Alerts
  getAlerts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.severity && params.severity !== 'ALL') query.append('severity', params.severity);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return request(`/alerts${qs ? `?${qs}` : ''}`);
  },
  getAlert: (id) => request(`/alerts/${id}`),
  reviewAlert: (id, status, notes = '') => request(`/alerts/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status, mitigation_notes: notes })
  }),

  // Events / Activity Logs
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.severity && params.severity !== 'ALL') query.append('severity', params.severity);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.per_page) query.append('per_page', params.per_page);
    const qs = query.toString();
    return request(`/events${qs ? `?${qs}` : ''}`);
  },
  getEvent: (id) => request(`/events/${id}`),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // Reports
  getIncidentSummary: () => request('/reports/summary'),
  getExportUrl: (type = 'events') => `${API_BASE}/reports/export?type=${type}`,

  // Settings
  getSettings: () => request('/settings'),
  resetDemoData: () => request('/settings/reset-demo', { method: 'POST' }),
  getHealth: () => request('/settings/health')
};
