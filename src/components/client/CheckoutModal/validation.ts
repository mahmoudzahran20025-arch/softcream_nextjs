export function validateCheckoutForm({ formData, deliveryMethod, selectedBranch }: any) {
  const errors: Record<string, string> = {}
  
  if (!deliveryMethod) {
    errors.deliveryMethod = 'Please select a delivery method'
  }
  
  if (!formData.name.trim() || formData.name.trim().length < 2) {
    errors.name = 'Name required (2-50 characters)'
  }
  
  if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Invalid phone number'
  }
  
  if (deliveryMethod === 'pickup' && !selectedBranch) {
    errors.branch = 'Please select a branch'
  }
  
  if (deliveryMethod === 'delivery' && (!formData.address.trim() || formData.address.trim().length < 10)) {
    errors.address = 'Address required (10-200 characters)'
  }
  
  if (formData.notes && formData.notes.length > 300) {
    errors.notes = 'Notes must be 300 characters or less'
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
