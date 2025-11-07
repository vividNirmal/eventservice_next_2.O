import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { MEASUREMENT_UNIT_OPTIONS, STALL_TYPE_OPTIONS, PAYMENT_COLLECTION_MODE_OPTIONS, OFFLINE_PAYMENT_OPTIONS, SERVICE_PROVIDER_OPTIONS } from '../constants/exhibitorFormConstants';

const BasicInfoStep = ({ formData, handleInputChange, handleArrayFieldChange, errors }) => {
  const { basicInfo } = formData;

  return (
    <div className="space-y-4 sm:space-y-6 ">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Form Name *</Label>
          <Input
            id="full_name"
            value={basicInfo.full_name}
            onChange={(e) => handleInputChange('basicInfo.full_name', e.target.value)}
            placeholder="Enter form name"
            className={errors.full_name ? 'border-red-500' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form_number">Form Number *</Label>
          <Input
            id="form_number"
            type="number"
            value={basicInfo.form_number}
            onChange={(e) => handleInputChange('basicInfo.form_number', parseInt(e.target.value) || 1)}
            placeholder="Enter form number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date</Label>
        <Input
          id="due_date"
          type="datetime-local"
          value={basicInfo.due_date ? new Date(basicInfo.due_date).toISOString().slice(0, 16) : ''}
          onChange={(e) => handleInputChange('basicInfo.due_date', new Date(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="form_description">Form Description</Label>
        <Textarea
          id="form_description"
          value={basicInfo.form_description}
          onChange={(e) => handleInputChange('basicInfo.form_description', e.target.value)}
          placeholder="Enter form description"
          rows={3}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="measurement_unit">Measurement Unit</Label>
          <Select value={basicInfo.measurement_unit} onValueChange={(value) => handleInputChange('basicInfo.measurement_unit', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEASUREMENT_UNIT_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stall_type">Stall Type</Label>
          <Select value={basicInfo.stall_type} onValueChange={(value) => handleInputChange('basicInfo.stall_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STALL_TYPE_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 border rounded-lg p-4">
        <h4 className="font-medium">Submission Settings</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={basicInfo.allow_multiple_submission}
              onCheckedChange={(checked) => handleInputChange('basicInfo.allow_multiple_submission', checked)}
            />
            <Label>Allow Multiple Submission</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={basicInfo.is_mendatory}
              onCheckedChange={(checked) => handleInputChange('basicInfo.is_mendatory', checked)}
            />
            <Label>Mandatory Form</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={basicInfo.limit_quantity_for_all}
              onCheckedChange={(checked) => handleInputChange('basicInfo.limit_quantity_for_all', checked)}
            />
            <Label>Limit Quantity For All</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={basicInfo.submit_without_pay_verify}
              onCheckedChange={(checked) => handleInputChange('basicInfo.submit_without_pay_verify', checked)}
            />
            <Label>Submit Without Payment Verification</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4 border rounded-lg p-4">
        <h4 className="font-medium">Payment Settings</h4>
        
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            checked={basicInfo.payment_collection_required}
            onCheckedChange={(checked) => handleInputChange('basicInfo.payment_collection_required', checked)}
          />
          <Label>Payment Collection Required</Label>
        </div>

        {basicInfo.payment_collection_required && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Collection Mode</Label>
                <Select value={basicInfo.payment_collection_mode} onValueChange={(value) => handleInputChange('basicInfo.payment_collection_mode', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_COLLECTION_MODE_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={basicInfo.tds_applicable}
                  onCheckedChange={(checked) => handleInputChange('basicInfo.tds_applicable', checked)}
                />
                <Label>TDS Applicable</Label>
              </div>
            </div>

            {(basicInfo.payment_collection_mode === 'Offline' || basicInfo.payment_collection_mode === 'Both') && (
              <div className="space-y-2">
                <Label>Offline Payment Options</Label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {OFFLINE_PAYMENT_OPTIONS.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        checked={basicInfo.offline_payment_option?.includes(option)}
                        onCheckedChange={(checked) => 
                          handleArrayFieldChange('basicInfo.offline_payment_option', option, checked ? 'add' : 'remove')
                        }
                      />
                      <Label>{option}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="payment_instructions">Payment Instructions</Label>
              <Textarea
                id="payment_instructions"
                value={basicInfo.payment_instructions}
                onChange={(e) => handleInputChange('basicInfo.payment_instructions', e.target.value)}
                placeholder="Enter payment instructions"
                rows={2}
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-4 border rounded-lg p-4">
        <h4 className="font-medium">Service Providers</h4>
        <div className="grid sm:grid-cols-2 gap-2">
          {SERVICE_PROVIDER_OPTIONS.map(provider => (
            <div key={provider} className="flex items-center space-x-2">
              <Checkbox
                checked={basicInfo.service_provider?.includes(provider)}
                onCheckedChange={(checked) => 
                  handleArrayFieldChange('basicInfo.service_provider', provider, checked ? 'add' : 'remove')
                }
              />
              <Label>{provider}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="machinery_wbs">Machinery WBS</Label>
          <Input
            id="machinery_wbs"
            value={basicInfo.machinery_wbs}
            onChange={(e) => handleInputChange('basicInfo.machinery_wbs', e.target.value)}
            placeholder="Enter machinery WBS"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jewllery_wbs">Jewellery WBS</Label>
          <Input
            id="jewllery_wbs"
            value={basicInfo.jewllery_wbs}
            onChange={(e) => handleInputChange('basicInfo.jewllery_wbs', e.target.value)}
            placeholder="Enter jewellery WBS"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={basicInfo.allow_personal_cctv_installation}
          onCheckedChange={(checked) => handleInputChange('basicInfo.allow_personal_cctv_installation', checked)}
        />
        <Label>Allow Personal CCTV Installation</Label>
      </div>
    </div>
  );
};

export default BasicInfoStep;