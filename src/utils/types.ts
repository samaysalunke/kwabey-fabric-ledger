import { QUANTITY_UNITS, FABRIC_TYPES, UAT_UNITS, ROLL_UNITS, COLOR_FASTNESS, FABRIC_STATUS, APPROVAL_STATUS, HOLD_REASONS } from './constants';

export type QuantityUnit = typeof QUANTITY_UNITS[number];
export type FabricType = typeof FABRIC_TYPES[number];
export type UatUnit = typeof UAT_UNITS[number];
export type RollUnit = typeof ROLL_UNITS[number];
export type ColorFastness = typeof COLOR_FASTNESS[number];
export type FabricStatus = typeof FABRIC_STATUS[number];
export type ApprovalStatus = typeof APPROVAL_STATUS[number];
export type HoldReason = typeof HOLD_REASONS[number];

export interface FabricEntry {
  id: string;
  seller_name: string;
  quantity_value: number;
  quantity_unit: QuantityUnit;
  color: string;
  fabric_type: FabricType;
  po_number: string;
  fabric_composition: string;
  date_inwarded: string;
  inwarded_by: string;
  uat_value: number;
  uat_unit: UatUnit;
  ftp_document_url?: string;
  status: FabricStatus;
  created_at: string;
  updated_at: string;
}

export interface FabricRoll {
  id: string;
  fabric_entry_id: string;
  roll_value: number;
  roll_unit: RollUnit;
  batch_number: number;
}

export interface RibDetails {
  id: string;
  fabric_entry_id: string;
  total_weight?: number;
  total_rolls?: number;
}

export interface QualityParameters {
  id: string;
  fabric_entry_id: string;
  gsm_value: number;
  width_dia_inches: number;
  shrinkage_percent: number;
  color_fastness: ColorFastness;
  checked_by: string;
  remarks?: string;
  created_at: string;
}

export interface QuantityApproval {
  id: string;
  fabric_entry_id: string;
  approval_status: ApprovalStatus;
  hold_reason?: HoldReason;
  received_quantity?: number;
  not_approved_quantity?: number;
  approved_by: string;
  remarks?: string;
  debit_note_url?: string;
  created_at: string;
}

export interface User {
  email: string;
  role: string;
} 