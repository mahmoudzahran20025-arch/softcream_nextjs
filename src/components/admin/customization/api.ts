// src/components/admin/customization/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev';

export async function apiRequest(endpoint: string, options: any = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  const [path, queryString] = endpoint.split('?');
  const finalUrl = queryString 
    ? `${API_BASE_URL}?path=${path}&${queryString}` 
    : `${API_BASE_URL}?path=${path}`;
  
  const response = await fetch(finalUrl, { 
    ...options, 
    headers, 
    body: options.body ? JSON.stringify(options.body) : undefined 
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// API Endpoints
export const ENDPOINTS = {
  containers: '/admin/containers',
  sizes: '/admin/sizes',
  optionGroups: '/admin/option-groups',
  options: '/admin/options'
} as const;
