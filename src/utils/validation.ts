import * as yup from 'yup';
import { QUANTITY_UNITS, FABRIC_TYPES, UAT_UNITS, ROLL_UNITS, COLOR_FASTNESS, APPROVAL_STATUS, HOLD_REASONS } from './constants';

export const fabricEntrySchema = yup.object().shape({
  seller_name: yup.string().required('Seller name is required'),
  quantity_value: yup.number().required('Quantity is required').positive(),
  quantity_unit: yup.string().oneOf([...QUANTITY_UNITS]).required(),
  color: yup.string().required('Color is required'),
  fabric_type: yup.string().oneOf([...FABRIC_TYPES]).required(),
  po_number: yup.string().required('PO Number is required'),
  fabric_composition: yup.string().required('Fabric composition is required'),
  inwarded_by: yup.string().required('Inwarded by is required'),
  uat_value: yup.number().required('UAT value is required').positive(),
  uat_unit: yup.string().oneOf([...UAT_UNITS]).required(),
});

export const rollSchema = yup.object().shape({
  roll_value: yup.number().required('Roll value is required').positive(),
  roll_unit: yup.string().oneOf([...ROLL_UNITS]).required(),
});

export const ribDetailsSchema = yup.object().shape({
  total_weight: yup.number().nullable().positive(),
  total_rolls: yup.number().nullable().integer().positive(),
});

export const qualityParamsSchema = yup.object().shape({
  gsm_value: yup.number().required('GSM is required').positive(),
  width_dia_inches: yup.number().required('Width/DIA is required').positive(),
  shrinkage_percent: yup.number().required('Shrinkage % is required').min(0).max(100),
  color_fastness: yup.string().oneOf([...COLOR_FASTNESS]).required(),
  remarks: yup.string().optional(),
});

export const approvalSchema = yup.object().shape({
  approval_status: yup.string().oneOf([...APPROVAL_STATUS]).required('Approval status is required'),
  hold_reason: yup.string().when('approval_status', {
    is: 'ON_HOLD',
    then: (schema) => schema.oneOf([...HOLD_REASONS]).required('Hold reason is required when status is ON_HOLD'),
    otherwise: (schema) => schema.nullable(),
  }),
  not_approved_quantity: yup.number().nullable().min(0, 'Not approved quantity must be positive'),
  remarks: yup.string().optional(),
}); 