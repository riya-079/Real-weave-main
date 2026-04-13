const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

// Anomalies
export const getAnomalies = () => fetchAPI('/anomalies');
export const getAnomaly = (id: string) => fetchAPI(`/anomalies/${id}`);
export const createAnomaly = (data: any) => 
  fetchAPI('/anomalies', { method: 'POST', body: JSON.stringify(data) });

// Organizations
export const getOrganizations = () => fetchAPI('/organizations');
export const getOrganization = (id: string) => fetchAPI(`/organizations/${id}`);

// Future Scenarios
export const getScenarios = () => fetchAPI('/future-scenarios');

// Events
export const getEvents = (shipmentId?: string) => 
  fetchAPI(shipmentId ? `/events?shipment_id=${shipmentId}` : '/events');
