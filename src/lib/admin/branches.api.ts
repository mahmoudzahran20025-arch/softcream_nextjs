/**
 * Branches API - Branch Management
 * 
 * Note: Branches is a PUBLIC endpoint, not an admin endpoint.
 * We call the public API directly instead of going through admin proxy.
 */

// ===========================
// Types
// ===========================

export interface Branch {
  id: string
  name: string
  name_en: string
  address: string
  phone: string
  location_lat: number
  location_lng: number
  active: number
}

// ===========================
// API Functions
// ===========================

/**
 * Get all branches from public API
 * Branches is a public endpoint at /branches, not an admin endpoint
 */
export async function getBranches(): Promise<{ data: Branch[] }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  
  try {
    const response = await fetch(`${apiUrl}/branches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch branches: HTTP ${response.status}`)
      return { data: [] }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch branches:', error)
    return { data: [] }
  }
}
