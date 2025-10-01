import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { CURRENCY_OPTIONS, FEE_SETTING_OPTIONS } from '../constants/ticketConstants';

const TicketAmountStep = ({ 
  formData, 
  handleInputChange, 
  errors, 
  slotAmountHandlers 
}) => {
  const { handleSlotAmountChange, addSlotAmount, removeSlotAmount } = slotAmountHandlers;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Label>Free Ticket</Label>
        <Switch
          checked={formData.isFree}
          onCheckedChange={(checked) => handleInputChange('isFree', checked)}
        />
      </div>

      {!formData.isFree && (
        <>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange('currency', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Slot Amounts</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSlotAmount}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Slot
              </Button>
            </div>

            <div className="space-y-4">
              {formData.slotAmounts.map((slot, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Slot {index + 1}</CardTitle>
                      {formData.slotAmounts.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSlotAmount(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date & Time *</Label>
                        <Input
                          type="datetime-local"
                          value={slot.startDateTime}
                          onChange={(e) => handleSlotAmountChange(index, 'startDateTime', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date & Time *</Label>
                        <Input
                          type="datetime-local"
                          value={slot.endDateTime}
                          onChange={(e) => handleSlotAmountChange(index, 'endDateTime', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount *</Label>
                        <Input
                          type="number"
                          value={slot.amount}
                          onChange={(e) => handleSlotAmountChange(index, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="2000"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feeSetting">Fee Setting *</Label>
              <Select
                value={formData.feeSetting}
                onValueChange={(value) => handleInputChange('feeSetting', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEE_SETTING_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialNumber">Material Number</Label>
              <Input
                id="materialNumber"
                value={formData.materialNumber}
                onChange={(e) => handleInputChange('materialNumber', e.target.value)}
                placeholder="Enter material number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wbs">WBS</Label>
              <Input
                id="wbs"
                value={formData.wbs}
                onChange={(e) => handleInputChange('wbs', e.target.value)}
                placeholder="Enter WBS"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketAmountStep;