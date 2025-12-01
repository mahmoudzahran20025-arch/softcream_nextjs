// ================================================================
// useBranches Hook - Branch Loading & Selection
// ================================================================

'use client'

import { useState, useCallback } from 'react'
import { getBranches } from '@/lib/api'
import type { Branch } from '../types'

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchesLoading, setBranchesLoading] = useState(false)
  const [branchesError, setBranchesError] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)

  const loadBranches = useCallback(async () => {
    setBranchesLoading(true)
    setBranchesError(null)

    try {
      console.log('🏢 Loading branches from API...')
      const branchesData = await getBranches()
      console.log('✅ Branches loaded:', branchesData?.length || 0)
      setBranches(branchesData || [])
    } catch (error: any) {
      console.warn('⚠️ Failed to load branches:', error)
      setBranchesError(error?.message || 'Failed to load branches')
      setBranches([])
    } finally {
      setBranchesLoading(false)
    }
  }, [])

  const handleBranchSelect = useCallback((branchId: string) => {
    setSelectedBranch(branchId)
  }, [])

  const getSelectedBranchData = useCallback(() => {
    return branches.find(b => b.id === selectedBranch || b.name === selectedBranch) || null
  }, [branches, selectedBranch])

  const resetBranches = useCallback(() => {
    setSelectedBranch(null)
    setBranchesError(null)
  }, [])

  return {
    branches,
    branchesLoading,
    branchesError,
    selectedBranch,
    loadBranches,
    handleBranchSelect,
    getSelectedBranchData,
    resetBranches,
    setSelectedBranch
  }
}
