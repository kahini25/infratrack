import axios from 'axios';

// Use environment variable if provided (e.g., from Vercel), otherwise fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getAssets = async (params = {}) => {
  const response = await api.get('/assets', { params });
  return response.data;
};

export const getAssetById = async (id) => {
  const response = await api.get(`/assets/${id}`);
  return response.data;
};

export const createAsset = async (assetData) => {
  const response = await api.post('/assets', assetData);
  return response.data;
};

export const updateAsset = async (id, assetData) => {
  const response = await api.put(`/assets/${id}`, assetData);
  return response.data;
};

export const changeAssetStatus = async (id, statusData) => {
  const response = await api.post(`/assets/${id}/status`, statusData);
  return response.data;
};

export const getAssetHistory = async (id) => {
  const response = await api.get(`/assets/${id}/history`);
  return response.data;
};

export const getInspections = async (id) => {
  const response = await api.get(`/assets/${id}/inspections`);
  return response.data;
};

export const createInspection = async (id, inspectionData) => {
  const response = await api.post(`/assets/${id}/inspections`, inspectionData);
  return response.data;
};

export const getMaintenances = async (params = {}) => {
  const response = await api.get('/maintenance', { params });
  return response.data;
};

export const createMaintenance = async (maintenanceData) => {
  const response = await api.post('/maintenance', maintenanceData);
  return response.data;
};

export const updateMaintenance = async (id, maintenanceData) => {
  const response = await api.put(`/maintenance/${id}`, maintenanceData);
  return response.data;
};

export default api;
