import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:3000',
  baseURL: 'https://admin.vibecopilot.ai',

  headers: {
    'Content-Type': 'application/json',
  },
});

// Module-level overrides for public (no-localStorage) dashboards
let publicToken: string | null = null;
let publicSiteId: string | number | null = null;

export function setPublicAuth(token: string | null, siteId: string | number | null) {
  publicToken = token ? String(token).replace(/^"|"$/g, '') : null;
  publicSiteId = siteId ?? null;
}

export function clearPublicAuth() {
  publicToken = null;
  publicSiteId = null;
}

axiosInstance.interceptors.request.use((config) => {
  // Prefer module-level public auth when present (used for incognito/public dashboards)
  const token = publicToken ?? localStorage.getItem('token') ?? localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `${token}`;
  }

  // Ensure site_id and token are passed as query params for APIs that expect them
  const params = (config.params as Record<string, any>) || {};
  if (publicToken) params.token = publicToken;
  if (publicSiteId) params.site_id = publicSiteId;
  config.params = params;

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
