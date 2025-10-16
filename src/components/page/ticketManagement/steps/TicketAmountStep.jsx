import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { CURRENCY_OPTIONS, FEE_SETTING_OPTIONS, TICKET_AMOUNT_TYPES } from '../constants/ticketConstants';

const TicketAmountStep = ({ 
  formData, 
  handleInputChange, 
  errors, 
  ticketAmountHandlers 
}) => {
  const {
    handleTicketAmountTypeChange,
    handleTicketAmountChange,
    handleDateSlabChange,
    addDateSlab,
    removeDateSlab,
    handleBusinessSlabChange,
    handleBusinessCategoryAmountChange,
    addBusinessSlab,
    removeBusinessSlab,
    addBusinessCategory,
    removeBusinessCategory,
    checkDateOverlaps // Add this new function
  } = ticketAmountHandlers;

  const { ticketAmount } = formData;

  // Function to format date for datetime-local input (fixes timezone issue)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    // If it's already in the correct format (from datetime-local input), return as is
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return dateString;
    }
    
    // If it's a Date object or ISO string from backend, convert to local datetime string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // Convert to local timezone format for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 overflow-y-auto custom-scroll h-20 grow pb-2 pr-2">
      {/* Ticket Amount Type Selection - Changed to Select Input */}
      <div className="space-y-2">
        <Label htmlFor="ticketAmountType">Ticket Type *</Label>
        <Select
          value={ticketAmount.type}
          onValueChange={(value) => handleTicketAmountTypeChange(value)}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select ticket type" />
          </SelectTrigger>
          <SelectContent>
            {TICKET_AMOUNT_TYPES.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conditional Fields Based on Ticket Type */}
      {ticketAmount.type !== 'free' && (
        <>
          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select
              value={ticketAmount.currency}
              onValueChange={(value) => handleTicketAmountChange('currency', value)}
            >
              <SelectTrigger className="w-64">
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

          {/* Date Slab Pricing */}
          {ticketAmount.type === 'dateSlab' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Date-based Pricing Slabs</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDateSlab}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Date Slab
                </Button>
              </div>

              <div className="space-y-4">
                {ticketAmount.dateRangeAmounts.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No date slabs added. Click "Add Date Slab" to create one.
                    </CardContent>
                  </Card>
                ) : (
                  ticketAmount.dateRangeAmounts.map((slab, index) => {
                    const overlapError = checkDateOverlaps && checkDateOverlaps(index);
                    
                    return (
                      <Card key={index} className={'2xl:p-4 gap-2 2xl:gap-2'}>
                        <CardHeader className="pb-0 !px-0">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Date Slab {index + 1}</CardTitle>
                            {ticketAmount.dateRangeAmounts.length > 1 && (
                              <Button type="button" variant="outline" size="sm" onClick={() => removeDateSlab(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {overlapError && (
                            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{overlapError}</div>
                          )}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <Label>Start Date & Time *</Label>
                              <Input type="datetime-local" value={formatDateForInput(slab.startDateTime)} onChange={(e) => handleDateSlabChange(index, 'startDateTime', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label>End Date & Time *</Label>
                              <Input type="datetime-local" value={formatDateForInput(slab.endDateTime)} onChange={(e) => handleDateSlabChange(index, 'endDateTime', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label>Amount *</Label>
                              <Input type="number" min="0" step="0.01" value={slab.amount} onChange={(e) => handleDateSlabChange(index, 'amount', parseFloat(e.target.value) || 0)} placeholder="2000"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Business Slab Pricing */}
          {ticketAmount.type === 'businessSlab' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Business Category Pricing Slabs</Label>
                <Button type="button" variant="outline" size="sm" onClick={addBusinessSlab}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Business Slab
                </Button>
              </div>

              <div className="space-y-4">
                {ticketAmount.businessSlabs.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No business slabs added. Click "Add Business Slab" to create one.
                    </CardContent>
                  </Card>
                ) : (
                  ticketAmount.businessSlabs.map((slab, slabIndex) => {
                    const overlapError = checkDateOverlaps && checkDateOverlaps(slabIndex, 'business');
                    
                    return (
                      <Card key={slabIndex}>
                        <CardHeader className="pb-0 !px-0">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Business Slab {slabIndex + 1}</CardTitle>
                            {ticketAmount.businessSlabs.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeBusinessSlab(slabIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {overlapError && (
                            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                              {overlapError}
                            </div>
                          )}
                          
                          {/* Date Range for Business Slab */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                              <Label>Start Date & Time *</Label>
                              <Input type="datetime-local" value={formatDateForInput(slab.startDateTime)} onChange={(e) => handleBusinessSlabChange(slabIndex, 'startDateTime', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label>End Date & Time *</Label>
                              <Input type="datetime-local" value={formatDateForInput(slab.endDateTime)} onChange={(e) => handleBusinessSlabChange(slabIndex, 'endDateTime', e.target.value)} />
                            </div>
                          </div>

                          {/* Category Amounts */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className={'font-semibold text-sm'}>Category Pricing</Label>
                              <Button type="button" variant="outline" size="sm" onClick={() => addBusinessCategory(slabIndex)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Category
                              </Button>
                            </div>

                            {slab.categoryAmounts.map((categoryAmount, categoryIndex) => (
                              <div key={categoryIndex} className="flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                  <Label>Category</Label>
                                  <Input
                                    type="text"
                                    value={categoryAmount.category}
                                    onChange={(e) => handleBusinessCategoryAmountChange(
                                      slabIndex, 
                                      categoryIndex, 
                                      'category', 
                                      e.target.value
                                    )}
                                    placeholder="e.g., VIP, Premium, Standard"
                                  />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <Label>Amount</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={categoryAmount.amount}
                                    onChange={(e) => handleBusinessCategoryAmountChange(
                                      slabIndex, 
                                      categoryIndex, 
                                      'amount', 
                                      parseFloat(e.target.value) || 0
                                    )}
                                    placeholder="2000"
                                  />
                                </div>
                                {slab.categoryAmounts.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-6"
                                    onClick={() => removeBusinessCategory(slabIndex, categoryIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* <div className="grid grid-cols-3 gap-4">
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
          </div> */}
        </>
      )}
    </div>
  );
};

export default TicketAmountStep;