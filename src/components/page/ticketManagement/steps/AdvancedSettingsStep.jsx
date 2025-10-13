import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { BADGE_CATEGORY_OPTIONS, CROSS_REGISTER_CATEGORY_OPTIONS } from '../constants/ticketConstants';
import dynamic from "next/dynamic";
import { textEditormodule } from "@/lib/constant";

// Dynamically import ReactQuill
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

const AdvancedSettingsStep = ({ 
  formData, 
  handleInputChange, 
  errors, 
  handleCrossRegisterCategoryToggle 
}) => {
  return (
    <div className="space-y-6">
      <div className='flex flex-col gap-1.5'>
        <div className="grid md:grid-cols-2 gap-4">
          <Label className="text-base font-medium col-span-full">Ticket Buy Limit Per User</Label>
          <div className='flex flex-col gap-1'>
            <Label>Minimum</Label>
            <Input type="number" min="1" value={formData.advancedSettings.ticketBuyLimitMin} onChange={(e) => handleInputChange('advancedSettings.ticketBuyLimitMin', parseInt(e.target.value) || 1)} />
          </div>
          <div className='flex flex-col gap-1'>
            <Label>Maximum</Label>
            <Input type="number" min="1" value={formData.advancedSettings.ticketBuyLimitMax} onChange={(e) => handleInputChange('advancedSettings.ticketBuyLimitMax', parseInt(e.target.value) || 10)} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Label className={'mt-1'}>Set Ticket Quantity Limit</Label>
          <Switch checked={formData.advancedSettings.hasQuantityLimit} onCheckedChange={(checked) => handleInputChange('advancedSettings.hasQuantityLimit', checked)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Badge Category</Label>
          <Select value={formData.advancedSettings.badgeCategory} onValueChange={(value) => handleInputChange('advancedSettings.badgeCategory', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select badge category" />
            </SelectTrigger>
            <SelectContent>
              {BADGE_CATEGORY_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date of registration (Only for filter option in Cart/Details)</Label>
          <Input type="date" value={formData.advancedSettings.registrationFilterDate} onChange={(e) => handleInputChange('advancedSettings.registrationFilterDate', e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center space-x-2">
          <Label className={'mb-0'}>Allow User to Cross-Register in This Ticket</Label>
          <Switch checked={formData.advancedSettings.allowCrossRegister} onCheckedChange={(checked) => handleInputChange('advancedSettings.allowCrossRegister', checked)} />
        </div>

        {formData.advancedSettings.allowCrossRegister && (
          <div className="flex flex-col gap-0.5">
            <Label>Cross Register Categories</Label>
            <div className="flex flex-wrap gap-2">
              {CROSS_REGISTER_CATEGORY_OPTIONS.map(category => (
                <Badge key={category} variant={formData.advancedSettings.crossRegisterCategories.includes(category) ? "default" : "secondary"} className="cursor-pointer" onClick={() => handleCrossRegisterCategoryToggle(category)}>{category}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-5">
        <div className="flex items-center gap-2">
          <Label className={'mb-0'}>Auto Approved User</Label>
          <Switch checked={formData.advancedSettings.autoApprovedUser} onCheckedChange={(checked) => handleInputChange('advancedSettings.autoApprovedUser', checked)} />
        </div>
        <div className="flex items-center gap-2">
          <Label className={'mb-0'}>Authenticate user by OTP</Label>
          <Switch checked={formData.advancedSettings.authenticateByOTP} onCheckedChange={(checked) => handleInputChange('advancedSettings.authenticateByOTP', checked)}/>
        </div>
        <div className="flex items-center gap-2">
          <Label className={'mb-0'}>Auto Password</Label>
          <Switch checked={formData.advancedSettings.autoPassword} onCheckedChange={(checked) => handleInputChange('advancedSettings.autoPassword', checked)} />
        </div>
        <div className="flex items-center gap-2">
          <Label className={'mb-0'}>Add All Discount</Label>
          <Switch checked={formData.advancedSettings.addAllDiscount} onCheckedChange={(checked) => handleInputChange('advancedSettings.addAllDiscount', checked)} />
        </div>
        <div className="flex items-center gap-2">
          <Label className={'mb-0'}>Individual Discount</Label>
          <Switch checked={formData.advancedSettings.individualDiscount} onCheckedChange={(checked) => handleInputChange('advancedSettings.individualDiscount', checked)} />
        </div>
      </div>

      {/* ---- Registration Success Message ---- */}
      <div className="space-y-2">
        <Label>Registration Success Message (Optional)</Label>
        <div className="min-h-64 border rounded-md">
          <ReactQuill theme="snow" value={formData.advancedSettings.registrationSuccessMessage || ""} onChange={(value) => handleInputChange("advancedSettings.registrationSuccessMessage", value)} modules={textEditormodule.modules} className="!shadow-none w-full min-h-64 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-md [&>.ql-container.ql-snow]:rounded-b-md [&>.ql-container.ql-snow]:flex-grow" />
        </div>
        {errors?.advancedSettings?.registrationSuccessMessage && (
          <p className="text-red-500 text-xs mt-1">{errors.advancedSettings.registrationSuccessMessage}</p>
        )}
      </div>
    </div>
  );
};

export default AdvancedSettingsStep;