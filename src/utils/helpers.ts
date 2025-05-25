import { FabricStatus } from './types';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

export function getStatusLabel(status: FabricStatus): string {
  switch (status) {
    case 'PENDING_QUALITY':
      return 'Pending Quality';
    case 'READY_TO_ISSUE':
      return 'Ready to Issue';
    case 'ON_HOLD':
      return 'On Hold';
    default:
      return status;
  }
} 