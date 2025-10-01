import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import { USER_TYPE_OPTIONS, TICKET_CATEGORY_OPTIONS } from '../constants/ticketConstants';

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <div className="text-red-500 text-sm mt-1">{error}</div>;
};

const BasicInfoStep = ({ formData, handleInputChange, errors, availableForms }) => {
  // Handle startCount input with validation
  const handleStartCountChange = (value) => {
    // Only allow numbers 0-9
    const numericValue = value.replace(/[^0-9]/g, '');
    // Limit to 6 digits maximum
    const limitedValue = numericValue.slice(0, 6);
    handleInputChange('startCount', limitedValue);
  };

  // Validation helpers
  const validateSerialPrefix = (prefix) => {
    if (!prefix) return false;
    return prefix.length >= 2 && prefix.length <= 7 && /^[A-Za-z]+$/.test(prefix);
  };

  const validateStartCount = (count) => {
    if (!count) return false;
    return count.length >= 4 && count.length <= 6 && /^[0-9]+$/.test(count);
  };

  return (
    <TooltipProvider>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ticketName">Ticket Name *</Label>
          <Input
            id="ticketName"
            value={formData.ticketName}
            onChange={(e) => handleInputChange('ticketName', e.target.value)}
            placeholder="Enter ticket name"
            className={errors.ticketName ? 'border-red-500' : null}
          />
          <ErrorMessage error={errors.ticketName} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userType">User Type *</Label>
          <Select
            value={formData.userType}
            onValueChange={(value) => handleInputChange('userType', value)}
          >
            <SelectTrigger className={`w-full ${errors.userType ? 'border-red-500' : null}`}>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {USER_TYPE_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMessage error={errors.userType} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="registrationForm">Registration Form *</Label>
          <Select
            value={formData.registrationFormId}
            onValueChange={(value) => handleInputChange('registrationFormId', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select registration form" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {availableForms.map(form => (
                <SelectItem key={form._id} value={form._id}>
                  {form.formName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMessage error={errors.registrationFormId} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticketCategory">Ticket Category *</Label>
          <Select
            value={formData.ticketCategory}
            onValueChange={(value) => handleInputChange('ticketCategory', value)}
          >
            <SelectTrigger className={`w-full ${errors.ticketCategory ? 'border-red-500' : null}`}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {TICKET_CATEGORY_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMessage error={errors.ticketCategory} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="serialNoPrefix">Serial No Prefix *</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 max-w-xs">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Sr No. Prefix Pattern</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Prefix must be at least 2 characters.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Prefix cannot be more than 7 characters.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Prefix must contain only alphabetic letters (A-Z).</span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <Input
              id="serialNoPrefix"
              value={formData.serialNoPrefix}
              onChange={(e) => handleInputChange('serialNoPrefix', e.target.value)}
              placeholder="e.g., PVR"
              className={errors.serialNoPrefix ? 'border-red-500' : null}
            />
            {validateSerialPrefix(formData.serialNoPrefix) && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <ErrorMessage error={errors.serialNoPrefix} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="startCount">Start Count</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 max-w-xs">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Start Count Pattern</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Start Count must be at least 4 digits.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Start Count cannot be more than 6 digits.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Start Count must contain only numbers (0-9).</span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <Input
              id="startCount"
              type="text"
              value={formData.startCount || '0000'}
              onChange={(e) => handleStartCountChange(e.target.value)}
              placeholder="0000"
              className={errors.startCount ? 'border-red-500' : null}
              maxLength={6}
            />
            {validateStartCount(formData.startCount || '0000') && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <ErrorMessage error={errors.startCount} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Ticket Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter ticket description"
          rows={4}
        />
      </div>
    </div>
    </TooltipProvider>
  );
};

export default BasicInfoStep;