// Add validation functions here
export function isRequired(value: any) {
  return value !== undefined && value !== null && value !== '';
} 