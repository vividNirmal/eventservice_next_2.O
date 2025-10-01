import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { BADGE_CATEGORY_OPTIONS, CROSS_REGISTER_CATEGORY_OPTIONS } from '../constants/ticketConstants';

const AdvancedSettingsStep = ({ 
  formData, 
  handleInputChange, 
  errors, 
  handleCrossRegisterCategoryToggle 
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-medium">Ticket Buy Limit Per User</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Minimum</Label>
            <Input
              type="number"
              min="1"
              value={formData.ticketBuyLimitMin}
              onChange={(e) => handleInputChange('ticketBuyLimitMin', parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>Maximum</Label>
            <Input
              type="number"
              min="1"
              value={formData.ticketBuyLimitMax}
              onChange={(e) => handleInputChange('ticketBuyLimitMax', parseInt(e.target.value) || 10)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Label>Set Ticket Quantity Limit</Label>
        <Switch
          checked={formData.hasQuantityLimit}
          onCheckedChange={(checked) => handleInputChange('hasQuantityLimit', checked)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 space-y-4">
        <div className="space-y-2">
          <Label>Badge Category</Label>
          <Select
            value={formData.badgeCategory}
            onValueChange={(value) => handleInputChange('badgeCategory', value)}
          >
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
          <Input
            type="date"
            value={formData.registrationFilterDate}
            onChange={(e) => handleInputChange('registrationFilterDate', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Label>Allow User to Cross-Register in This Ticket</Label>
          <Switch
            checked={formData.allowCrossRegister}
            onCheckedChange={(checked) => handleInputChange('allowCrossRegister', checked)}
          />
        </div>

        {formData.allowCrossRegister && (
          <div className="space-y-2 ml-6">
            <Label>Cross Register Categories</Label>
            <div className="flex flex-wrap gap-2">
              {CROSS_REGISTER_CATEGORY_OPTIONS.map(category => (
                <Badge
                  key={category}
                  variant={formData.crossRegisterCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCrossRegisterCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Label>Auto Approved User</Label>
          <Switch
            checked={formData.autoApprovedUser}
            onCheckedChange={(checked) => handleInputChange('autoApprovedUser', checked)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label>Authenticate user by OTP</Label>
          <Switch
            checked={formData.authenticateByOTP}
            onCheckedChange={(checked) => handleInputChange('authenticateByOTP', checked)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label>Auto Password</Label>
          <Switch
            checked={formData.autoPassword}
            onCheckedChange={(checked) => handleInputChange('autoPassword', checked)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label>Add All Discount</Label>
          <Switch
            checked={formData.addAllDiscount}
            onCheckedChange={(checked) => handleInputChange('addAllDiscount', checked)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label>Individual Discount</Label>
          <Switch
            checked={formData.individualDiscount}
            onCheckedChange={(checked) => handleInputChange('individualDiscount', checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsStep;