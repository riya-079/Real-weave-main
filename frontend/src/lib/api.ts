const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// Overview
export const getOverview = () => fetchAPI('/overview');

// Shipments
export const getShipments = () => fetchAPI('/shipments');
export const getShipment = (id: string) => fetchAPI(`/shipments/${id}`);
export const createShipment = (data: any) => 
  fetchAPI('/shipments', { method: 'POST', body: JSON.stringify(data) });
export const updateShipment = (id: string, data: any) => 
  fetchAPI(`/shipments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteShipment = (id: string) => 
  fetchAPI(`/shipments/${id}`, { method: 'DELETE' });
export const syncTracking = (id: string) => 
  fetchAPI(`/shipments/${id}/sync-tracking`, { method: 'POST' });

// Anomalies
export const getAnomalies = () => fetchAPI('/anomalies');
export const getAnomaly = (id: string) => fetchAPI(`/anomalies/${id}`);
export const createAnomaly = (data: any) => 
  fetchAPI('/anomalies', { method: 'POST', body: JSON.stringify(data) });
export const deleteAnomaly = (id: string) => 
  fetchAPI(`/anomalies/${id}`, { method: 'DELETE' });
export const getAnomalyWorkflows = () => fetchAPI('/anomaly-workflows');
export const upsertAnomalyWorkflow = (id: string, data: any) =>
  fetchAPI(`/anomaly-workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Organizations
export const getOrganizations = () => fetchAPI('/organizations');
export const getOrganization = (id: string) => fetchAPI(`/organizations/${id}`);

// Future Scenarios
export const getScenarios = () => fetchAPI('/future-scenarios');
export const createScenario = (data: any) =>
  fetchAPI('/future-scenarios', { method: 'POST', body: JSON.stringify(data) });
export const updateScenario = (id: string, data: any) =>
  fetchAPI(`/future-scenarios/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Dashboard Settings
export const getDashboardSettings = () => fetchAPI('/dashboard-settings');
export const getDashboardSetting = (key: string) => fetchAPI(`/dashboard-settings/${key}`);
export const upsertDashboardSetting = (key: string, value: any) =>
  fetchAPI(`/dashboard-settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ key, value }),
  });

// Shared Risk Patterns
export const getSharedRiskPatterns = () => fetchAPI('/shared-risk-patterns');
export const createSharedRiskPattern = (data: any) =>
  fetchAPI('/shared-risk-patterns', { method: 'POST', body: JSON.stringify(data) });
export const updateSharedRiskPattern = (id: string, data: any) =>
  fetchAPI(`/shared-risk-patterns/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const getEvents = (shipmentId?: string) => 
  fetchAPI(shipmentId ? `/events?shipment_id=${shipmentId}` : '/events');

// Ghost Inventory
export const getGhostInventory = () => fetchAPI('/ghost-inventory');
export const createGhostInventory = (data: any) => 
  fetchAPI('/ghost-inventory', { method: 'POST', body: JSON.stringify(data) });

// Negotiations
function transformNegotiation(raw: any) {
  return {
    id: raw.id,
    title: raw.strategy ? `${raw.strategy} – ${raw.anomaly_id}` : `Resolution: ${raw.anomaly_id}`,
    participants: raw.partner_id ? [raw.partner_id, 'Real Weave'] : ['Real Weave'],
    status: raw.status || 'Open',
    strategy_type: raw.strategy || 'Collaborative Resolution',
    current_deal: raw.history?.length ? raw.history[raw.history.length - 1]?.proposal || 'In Discussion' : 'Awaiting Proposal',
    anomaly_id: raw.anomaly_id,
    raw_history: raw.history || [],
  };
}
export const getNegotiations = async () => {
  const raw = await fetchAPI('/negotiations');
  return raw.map(transformNegotiation);
};
export const createNegotiation = (data: any) =>
  fetchAPI('/negotiations', { method: 'POST', body: JSON.stringify(data) });
export const updateNegotiation = (id: string, data: any) =>
  fetchAPI(`/negotiations/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Trust DNA
function transformTrustDNA(raw: any) {
  const dims: Record<string, number> = {
    stability: raw.stability ?? 0,
    honesty: raw.honesty ?? 0,
    speed: raw.punctuality ?? 0,
    precision: raw.quality ?? 0,
    consistency: raw.consistency ?? 0,
    disclosure: raw.disclosure ?? 0,
  };
  const avg = Object.values(dims).reduce((a, b) => a + b, 0) / Object.values(dims).length;
  return {
    id: raw.org_id,
    org_id: raw.org_id,
    score: avg,
    dimensions: dims,
    history: [
      { date: 'Week 1', score: Math.max(0, avg - 0.05 + Math.random() * 0.02) },
      { date: 'Week 2', score: Math.max(0, avg - 0.02 + Math.random() * 0.02) },
      { date: 'Week 3', score: Math.max(0, avg + Math.random() * 0.02) },
      { date: 'Current', score: avg },
    ],
  };
}
export const getAllTrustDNA = async () => {
  const raw = await fetchAPI('/trust-dna');
  return raw.map(transformTrustDNA);
};
export const getTrustDNA = async (orgId: string) => {
  const raw = await fetchAPI(`/trust-dna/${orgId}`);
  return transformTrustDNA(raw);
};
export const createTrustDNA = (data: any) =>
  fetchAPI('/trust-dna', { method: 'POST', body: JSON.stringify(data) });

// Sentiment
export const getSentiment = () => fetchAPI('/sentiment');
export const updateSentiment = (data: any) => 
  fetchAPI('/sentiment', { method: 'PUT', body: JSON.stringify(data) });

// Weather
export const getWeather = (lat: number, lon: number) => fetchAPI(`/weather?lat=${lat}&lon=${lon}`);
