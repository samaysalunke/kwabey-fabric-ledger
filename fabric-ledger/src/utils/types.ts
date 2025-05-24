// Add TypeScript types and interfaces here
export interface FabricEntryData {
  id?: string;
  seller_name: string;
  quantity_value: number;
  quantity_unit: 'KG' | 'METER';
  color: string;
  fabric_type: 'KNITTED' | 'WOVEN';
  po_number: string;
  fabric_composition: string;
  date_inwarded?: string;
  inwarded_by: string;
  uat_value: number;
  uat_unit: 'KG' | 'METER';
  ftp_document_url?: string;
  status?: 'PENDING_QUALITY' | 'READY_TO_ISSUE' | 'ON_HOLD';
  created_at?: string;
  updated_at?: string;
} 