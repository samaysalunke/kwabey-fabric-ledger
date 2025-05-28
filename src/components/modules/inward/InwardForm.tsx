import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  CheckCircle2, 
  Clipboard, 
  FileText, 
  Loader2, 
  Package, 
  Plus, 
  Trash2, 
  X 
} from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useRBAC } from '../../../hooks/useRBAC';
import { createCompleteFabricEntry } from '../../../services/fabric.service';
import { QUANTITY_UNITS, FABRIC_TYPES } from '../../../utils/constants';

import ProtectedAction from '../../auth/ProtectedAction';
// Note: RollRow, RibDetails, and FileUpload components are now integrated inline

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

// Form validation schema
const fabricEntrySchema = yup.object().shape({
  seller_name: yup.string().required('Seller name is required'),
  quantity_value: yup.number().required('Quantity is required').positive('Must be positive'),
  quantity_unit: yup.string().oneOf(QUANTITY_UNITS).required('Unit is required'),
  color: yup.string().required('Color is required'),
  fabric_type: yup.string().oneOf(FABRIC_TYPES).required('Fabric type is required'),
  po_number: yup.string().required('PO Number is required'),
  fabric_composition: yup.string().required('Fabric composition is required'),
  inwarded_by: yup.string().required('Inwarded by is required'),

  rolls: yup.array().of(
    yup.object().shape({
      roll_value: yup.number().required('Roll value is required').positive('Must be positive'),
      roll_unit: yup.string().oneOf(['KG', 'METER']).required('Roll unit is required'),
    })
  ).min(1, 'At least one roll is required')
  .test('weight-match', 'Total roll weights must equal fabric entry weight', function(rolls) {
    const { quantity_value, quantity_unit } = this.parent;
    
    // Only validate weight matching for KG units
    if (quantity_unit !== 'KG') return true;
    
    if (!rolls || rolls.length === 0) return false;
    
    // Calculate total weight from rolls (only KG rolls)
    const totalRollWeight = rolls
      .filter(roll => roll.roll_unit === 'KG')
      .reduce((sum, roll) => sum + (roll.roll_value || 0), 0);
    
    // Allow small tolerance for decimal precision
    const tolerance = 0.01;
    return Math.abs(totalRollWeight - quantity_value) <= tolerance;
  }),
});

interface InwardFormData {
  seller_name: string;
  quantity_value: number;
  quantity_unit: string;
  color: string;
  fabric_type: string;
  po_number: string;
  fabric_composition: string;
  inwarded_by: string;
  rolls: Array<{
    roll_value: number;
    roll_unit: string;
  }>;
  rib_details?: {
    total_weight?: number;
    total_rolls?: number;
  };
  ftp_document?: File;
}

const InwardForm: React.FC = () => {
  const { addNotification } = useApp();
  const { user } = useAuth();
  const { canCreateFabricEntry, canUpdateFabricEntry, currentRole } = useRBAC();
  const [showRibDetails, setShowRibDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InwardFormData>({
    resolver: yupResolver(fabricEntrySchema),
          defaultValues: {
        seller_name: '',
        quantity_value: 1,
        quantity_unit: QUANTITY_UNITS[0],
        color: '',
        fabric_type: FABRIC_TYPES[0],
        po_number: '',
        fabric_composition: '',
        inwarded_by: user?.email || '',
        rolls: [{ roll_value: 1, roll_unit: 'KG' }],
      },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rolls',
  });

  const addRoll = () => {
    append({ roll_value: 1, roll_unit: 'KG' });
  };

  const removeRoll = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Watch form values for weight calculation
  const watchedValues = watch();
  const { quantity_value, quantity_unit, rolls } = watchedValues;

  // Calculate total roll weight
  const totalRollWeight = rolls
    ?.filter(roll => roll.roll_unit === 'KG')
    .reduce((sum, roll) => sum + (Number(roll.roll_value) || 0), 0) || 0;

  const isWeightMatching = quantity_unit === 'KG' 
    ? Math.abs(totalRollWeight - (Number(quantity_value) || 0)) <= 0.01
    : true;

  const onSubmit = async (data: InwardFormData) => {
    setIsSubmitting(true);
    try {
      // Prepare fabric entry data
      const fabricEntryData = {
        seller_name: data.seller_name,
        quantity_value: data.quantity_value,
        quantity_unit: data.quantity_unit as any,
        color: data.color,
        fabric_type: data.fabric_type as any,
        po_number: data.po_number,
        fabric_composition: data.fabric_composition,
        inwarded_by: data.inwarded_by,
        date_inwarded: new Date().toISOString().split('T')[0],
        status: 'PENDING_QUALITY' as any,
      };

      // Prepare complete form data
      const completeFormData = {
        fabricEntry: fabricEntryData,
        rolls: data.rolls,
        ribDetails: data.rib_details,
        file: data.ftp_document,
      };

      const { data: fabricEntry, error } = await createCompleteFabricEntry(completeFormData);

      if (error) {
        throw new Error(typeof error === 'string' ? error : `Failed to create fabric entry: ${(error as any)?.message || JSON.stringify(error)}`);
      }

      addNotification({
        type: 'success',
        message: `Fabric entry created successfully with ID: ${fabricEntry?.[0]?.id}`,
      });

      // Reset form
      reset();
      setShowRibDetails(false);

    } catch (error) {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create fabric entry',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDate = new Date().toLocaleDateString();





  return (
    <div className="space-y-8 max-w-5xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clipboard className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the fabric entry details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seller Name */}
              <div className="space-y-2">
                <Label htmlFor="seller_name">
                  Seller Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="seller_name"
                  {...register('seller_name')}
                  placeholder="Enter seller name"
                  className={errors.seller_name ? "border-destructive" : ""}
                />
                {errors.seller_name && (
                  <p className="text-sm text-destructive">{errors.seller_name.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity_value">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="quantity_value"
                    type="number"
                    step="0.01"
                    {...register('quantity_value')}
                    placeholder="0.00"
                    className={errors.quantity_value ? "border-destructive" : ""}
                  />
                  <Select 
                    defaultValue={QUANTITY_UNITS[0]} 
                    onValueChange={(value) => setValue('quantity_unit', value)}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUANTITY_UNITS.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.quantity_value && (
                  <p className="text-sm text-destructive">{errors.quantity_value.message}</p>
                )}
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">
                  Color <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="color"
                  {...register('color')}
                  placeholder="Enter color"
                  className={errors.color ? "border-destructive" : ""}
                />
                {errors.color && (
                  <p className="text-sm text-destructive">{errors.color.message}</p>
                )}
              </div>

              {/* Fabric Type */}
              <div className="space-y-2">
                <Label htmlFor="fabric_type">
                  Fabric Type <span className="text-destructive">*</span>
                </Label>
                <Select 
                  defaultValue={FABRIC_TYPES[0]}
                  onValueChange={(value) => setValue('fabric_type', value)}
                >
                  <SelectTrigger className={errors.fabric_type ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select fabric type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FABRIC_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fabric_type && (
                  <p className="text-sm text-destructive">{errors.fabric_type.message}</p>
                )}
              </div>

              {/* PO Number */}
              <div className="space-y-2">
                <Label htmlFor="po_number">
                  PO Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="po_number"
                  {...register('po_number')}
                  placeholder="Enter PO number"
                  className={errors.po_number ? "border-destructive" : ""}
                />
                {errors.po_number && (
                  <p className="text-sm text-destructive">{errors.po_number.message}</p>
                )}
              </div>

              {/* Date Inwarded (Display Only) */}
              <div className="space-y-2">
                <Label htmlFor="date_inwarded">Date Inwarded</Label>
                <Input
                  id="date_inwarded"
                  value={currentDate}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Inwarded By */}
              <div className="space-y-2">
                <Label htmlFor="inwarded_by">
                  Inwarded By <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="inwarded_by"
                  {...register('inwarded_by')}
                  placeholder="Enter name"
                  className={errors.inwarded_by ? "border-destructive" : ""}
                />
                {errors.inwarded_by && (
                  <p className="text-sm text-destructive">{errors.inwarded_by.message}</p>
                )}
              </div>


            </div>

            {/* Fabric Composition */}
            <div className="space-y-2">
              <Label htmlFor="fabric_composition">
                Fabric Composition <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="fabric_composition"
                {...register('fabric_composition')}
                rows={3}
                placeholder="Enter fabric composition details"
                className={errors.fabric_composition ? "border-destructive" : ""}
              />
              {errors.fabric_composition && (
                <p className="text-sm text-destructive">{errors.fabric_composition.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roll Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5" />
              Roll Details
            </CardTitle>
            <CardDescription>
              Enter information for each roll
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`rolls.${index}.roll_value`}>
                        Roll Value <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`rolls.${index}.roll_value`}
                        type="number"
                        step="0.01"
                        {...register(`rolls.${index}.roll_value` as const)}
                        placeholder="1.00"
                        className={errors.rolls?.[index]?.roll_value ? "border-destructive" : ""}
                      />
                      {errors.rolls?.[index]?.roll_value && (
                        <p className="text-sm text-destructive">{errors.rolls?.[index]?.roll_value?.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`rolls.${index}.roll_unit`}>
                        Roll Unit <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        defaultValue="KG"
                        onValueChange={(value) => setValue(`rolls.${index}.roll_unit`, value)}
                      >
                        <SelectTrigger className={errors.rolls?.[index]?.roll_unit ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="METER">METER</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.rolls?.[index]?.roll_unit && (
                        <p className="text-sm text-destructive">{errors.rolls?.[index]?.roll_unit?.message}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRoll(index)}
                    disabled={fields.length <= 1}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addRoll}
              className="mt-4 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Roll
            </Button>

            {/* Weight Summary */}
            {quantity_unit === 'KG' && (
              <div className={`p-4 rounded-lg border ${isWeightMatching ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Weight Summary</p>
                    <p className="text-xs text-muted-foreground">Total roll weights vs fabric entry weight</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="font-medium">{totalRollWeight.toFixed(2)} KG</span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="font-medium">{(Number(quantity_value) || 0).toFixed(2)} KG</span>
                    </p>
                    <p className={`text-xs ${isWeightMatching ? 'text-green-600' : 'text-red-600'}`}>
                      {isWeightMatching ? '✓ Weights match' : '✗ Weights do not match'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {errors.rolls && (
              <p className="text-sm text-destructive">{errors.rolls.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Information
            </CardTitle>
            <CardDescription>
              Add optional details and documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rib Details Toggle */}
            {!showRibDetails ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRibDetails(true)}
                className="w-full justify-start gap-2 h-24 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Add Rib Details
              </Button>
            ) : (
              <Card className="border border-border">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Rib Details</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowRibDetails(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rib_details.total_weight">Total Weight</Label>
                      <Input
                        id="rib_details.total_weight"
                        type="number"
                        step="0.01"
                        {...register('rib_details.total_weight' as any)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rib_details.total_rolls">Total Rolls</Label>
                      <Input
                        id="rib_details.total_rolls"
                        type="number"
                        {...register('rib_details.total_rolls' as any)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="ftp_document">FTP Document (Optional)</Label>
              <div className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center">
                <Input
                  id="ftp_document"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setValue('ftp_document', file || undefined);
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Drag and drop your PDF file here or click to browse
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setShowRibDetails(false);
            }}
          >
            Reset Form
          </Button>
          
          <ProtectedAction 
            permission="fabric_inward:create"
            fallback={
              <div className="text-sm text-muted-foreground p-2 border border-dashed rounded">
                You don't have permission to create fabric entries
              </div>
            }
          >
            <Button
              type="submit"
              disabled={isSubmitting || !canCreateFabricEntry()}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Entry
                </>
              )}
            </Button>
          </ProtectedAction>
        </div>
      </form>
    </div>
  );
};

export default InwardForm; 