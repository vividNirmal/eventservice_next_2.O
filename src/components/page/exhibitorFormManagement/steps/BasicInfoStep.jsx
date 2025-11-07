import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { MEASUREMENT_UNIT_OPTIONS, STALL_TYPE_OPTIONS, PAYMENT_COLLECTION_MODE_OPTIONS, OFFLINE_PAYMENT_OPTIONS, SERVICE_PROVIDER_OPTIONS } from '../constants/exhibitorFormConstants';
import { ErrorMessage } from '../components/ErrorMessage';
import dynamic from "next/dynamic";
import { textEditormodule } from "@/lib/constant";

// Dynamically import ReactQuill
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

const BasicInfoStep = ({ formData, handleInputChange, handleArrayFieldChange, errors }) => {
  const { basicInfo } = formData;

  return (
    <div className="space-y-4 sm:space-y-6 ">

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Form Name *</Label>
          <div className='relative pb-3.5'>
            <Input
              id="full_name"
              value={basicInfo.full_name}
              onChange={(e) => handleInputChange('basicInfo.full_name', e.target.value)}
              placeholder="Enter form name"
              className={errors.full_name ? 'border-red-500' : ''}
            />
            <ErrorMessage error={errors.full_name} />
          </div>
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
        <Label htmlFor="due_date">Due Date *</Label>
        <div className='relative pb-3.5'>
          <Input
            id="due_date"
            type="date"
            value={basicInfo.due_date ? new Date(basicInfo.due_date).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleInputChange('basicInfo.due_date', new Date(e.target.value))}
          />
          <ErrorMessage error={errors.due_date} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="submission_disclaimer">Submission Disclaimer *</Label>
        <div className='relative pb-3.5'>
          <Textarea
            id="submission_disclaimer"
            value={basicInfo.submission_disclaimer}
            onChange={(e) => handleInputChange('basicInfo.submission_disclaimer', e.target.value)}
            placeholder="Enter submission disclaimer"
            rows={3}
          />
          <ErrorMessage error={errors.submission_disclaimer} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="form_description">Form Description *</Label>
        <div className='relative pb-3.5'>
          <ReactQuill 
            key="form-description-editor"
            theme="snow"
            value={basicInfo.form_description || ""}
            onChange={(value) => handleInputChange("basicInfo.form_description", value)}
            modules={textEditormodule.modules}
            className="!shadow-none w-full min-h-64 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-md [&>.ql-container.ql-snow]:rounded-b-md [&>.ql-container.ql-snow]:flex-grow"
          />
          <ErrorMessage error={errors.form_description} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="measurement_unit">Measurement Unit *</Label>
          <div className='relative pb-3.5'>
            <Input
              id="measurement_unit"
              value={basicInfo.measurement_unit}
              onChange={(e) => handleInputChange('basicInfo.measurement_unit', e.target.value)}
              placeholder="Enter measurement unit"
              className={errors.measurement_unit ? 'border-red-500' : ''}
            />
            <ErrorMessage error={errors.measurement_unit} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Label>Allow Multiple Submission</Label>
          <Switch
            checked={basicInfo.allow_multiple_submission}
            onCheckedChange={(checked) => handleInputChange('basicInfo.allow_multiple_submission', checked)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label>Mandatory Form</Label>
          <Switch
            checked={basicInfo.is_mendatory}
            onCheckedChange={(checked) => handleInputChange('basicInfo.is_mendatory', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dependant_form">Dependant Form</Label>
          <Select value={basicInfo.dependant_form} onValueChange={(value) => handleInputChange('basicInfo.dependant_form', value)}>
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

        <div className="space-y-2">
          <Label htmlFor="dependant_features">Dependant Features</Label>
          <Select value={basicInfo.dependant_features} onValueChange={(value) => handleInputChange('basicInfo.dependant_features', value)}>
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

        <div className="flex items-center space-x-2">
          <Label>Limit Quantity For All</Label>
          <Switch
            checked={basicInfo.limit_quantity_for_all}
            onCheckedChange={(checked) => handleInputChange('basicInfo.limit_quantity_for_all', checked)}
          />
        </div>

                
        <div className="flex items-center space-x-2 mb-4">
          <Label>Payment Collection Required</Label>
          <Switch
            checked={basicInfo.payment_collection_required}
            onCheckedChange={(checked) => handleInputChange('basicInfo.payment_collection_required', checked)}
          />
        </div>

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

        <div className="flex items-center space-x-2">
          <Label>TDS Applicable</Label>
          <Switch
            checked={basicInfo.tds_applicable}
            onCheckedChange={(checked) => handleInputChange('basicInfo.tds_applicable', checked)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_instructions">Payment Instructions</Label>
        <ReactQuill 
          key="payment-instructions-editor"
          theme="snow"
          value={basicInfo.payment_instructions || ""}
          onChange={(value) => handleInputChange("basicInfo.payment_instructions", value)}
          modules={textEditormodule.modules}
          className="!shadow-none w-full min-h-64 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-md [&>.ql-container.ql-snow]:rounded-b-md [&>.ql-container.ql-snow]:flex-grow"
        />
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

        <div className="flex items-center space-x-2">
          <Label>Apply Vendor Filter</Label>
          <Switch
            checked={basicInfo.apply_vendor_filter}
            onCheckedChange={(checked) => handleInputChange('basicInfo.apply_vendor_filter', checked)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label>Apply Zone Filter</Label>
          <Switch
            checked={basicInfo.apply_zone_filter}
            onCheckedChange={(checked) => handleInputChange('basicInfo.apply_zone_filter', checked)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label>Submit Without Payment Verification</Label>
          <Switch
            checked={basicInfo.submit_without_pay_verify}
            onCheckedChange={(checked) => handleInputChange('basicInfo.submit_without_pay_verify', checked)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label>Allow Personal CCTV Installation</Label>
          <Switch
            checked={basicInfo.allow_personal_cctv_installation}
            onCheckedChange={(checked) => handleInputChange('basicInfo.allow_personal_cctv_installation', checked)}
          />
        </div>
      </div>

    </div>
  );
};

export default BasicInfoStep;