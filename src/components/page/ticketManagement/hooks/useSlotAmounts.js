import { useCallback } from 'react';

export const useTicketAmount = (formData, setFormData) => {
  // Handle ticket amount type change
  const handleTicketAmountTypeChange = useCallback((type) => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        type: type,
        // Reset currency when switching to free
        currency: type === 'free' ? undefined : prev.ticketAmount.currency || 'USD',
        // Reset arrays when switching types
        dateRangeAmounts: type === 'dateSlab' ? [] : prev.ticketAmount.dateRangeAmounts,
        businessSlabs: type === 'businessSlab' ? [] : prev.ticketAmount.businessSlabs
      }
    }));
  }, [setFormData]);

  // Handle basic ticket amount field changes
  const handleTicketAmountChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        [field]: value
      }
    }));
  }, [setFormData]);

  // Date Slab handlers
  const handleDateSlabChange = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        dateRangeAmounts: prev.ticketAmount.dateRangeAmounts.map((slab, i) =>
          i === index ? { ...slab, [field]: value } : slab
        )
      }
    }));
  }, [setFormData]);

  const addDateSlab = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        dateRangeAmounts: [
          ...prev.ticketAmount.dateRangeAmounts,
          { startDateTime: null, endDateTime: null, amount: 0 }
        ]
      }
    }));
  }, [setFormData]);

  const removeDateSlab = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        dateRangeAmounts: prev.ticketAmount.dateRangeAmounts.length > 1
          ? prev.ticketAmount.dateRangeAmounts.filter((_, i) => i !== index)
          : prev.ticketAmount.dateRangeAmounts
      }
    }));
  }, [setFormData]);

  // Business Slab handlers
  const handleBusinessSlabChange = useCallback((slabIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        businessSlabs: prev.ticketAmount.businessSlabs.map((slab, i) =>
          i === slabIndex ? { ...slab, [field]: value } : slab
        )
      }
    }));
  }, [setFormData]);

  const handleBusinessCategoryAmountChange = useCallback((slabIndex, categoryIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        businessSlabs: prev.ticketAmount.businessSlabs.map((slab, i) =>
          i === slabIndex ? {
            ...slab,
            categoryAmounts: slab.categoryAmounts.map((catAmount, j) =>
              j === categoryIndex ? { ...catAmount, [field]: value } : catAmount
            )
          } : slab
        )
      }
    }));
  }, [setFormData]);

  const addBusinessSlab = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        businessSlabs: [
          ...prev.ticketAmount.businessSlabs,
          {
            startDateTime: null,
            endDateTime: null,
            categoryAmounts: [{ category: '', amount: 0 }]
          }
        ]
      }
    }));
  }, [setFormData]);

  const removeBusinessSlab = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        businessSlabs: prev.ticketAmount.businessSlabs.length > 1
          ? prev.ticketAmount.businessSlabs.filter((_, i) => i !== index)
          : prev.ticketAmount.businessSlabs
      }
    }));
  }, [setFormData]);

  const addBusinessCategory = useCallback((slabIndex) => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        businessSlabs: prev.ticketAmount.businessSlabs.map((slab, i) =>
          i === slabIndex ? {
            ...slab,
            categoryAmounts: [
              ...slab.categoryAmounts,
              { category: '', amount: 0 }
            ]
          } : slab
        )
      }
    }));
  }, [setFormData]);

  const removeBusinessCategory = useCallback((slabIndex, categoryIndex) => {
    setFormData(prev => ({
      ...prev,
      ticketAmount: {
        ...prev.ticketAmount,
        businessSlabs: prev.ticketAmount.businessSlabs.map((slab, i) =>
          i === slabIndex ? {
            ...slab,
            categoryAmounts: slab.categoryAmounts.length > 1
              ? slab.categoryAmounts.filter((_, j) => j !== categoryIndex)
              : slab.categoryAmounts
          } : slab
        )
      }
    }));
  }, [setFormData]);

  // Time overlap validation function
  const checkDateOverlaps = useCallback((currentIndex, type = 'date') => {
    const slabs = type === 'date' 
      ? formData.ticketAmount.dateRangeAmounts 
      : formData.ticketAmount.businessSlabs;

    if (slabs.length < 2) return null;

    const currentSlab = slabs[currentIndex];
    
    // Check if current slab has valid dates
    if (!currentSlab.startDateTime || !currentSlab.endDateTime) {
      return null;
    }

    const currentStart = new Date(currentSlab.startDateTime);
    const currentEnd = new Date(currentSlab.endDateTime);

    // Check if end date is before start date
    if (currentEnd <= currentStart) {
      return 'End date/time must be after start date/time';
    }

    // Check for overlaps with other slabs
    for (let i = 0; i < slabs.length; i++) {
      if (i === currentIndex) continue;

      const otherSlab = slabs[i];
      
      // Skip if other slab doesn't have valid dates
      if (!otherSlab.startDateTime || !otherSlab.endDateTime) {
        continue;
      }

      const otherStart = new Date(otherSlab.startDateTime);
      const otherEnd = new Date(otherSlab.endDateTime);

      // Check for overlap
      if (
        (currentStart >= otherStart && currentStart < otherEnd) ||
        (currentEnd > otherStart && currentEnd <= otherEnd) ||
        (currentStart <= otherStart && currentEnd >= otherEnd)
      ) {
        return `This time period overlaps with ${type === 'date' ? 'date slab' : 'business slab'} ${i + 1}`;
      }
    }

    return null;
  }, [formData]);

  return {
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
    checkDateOverlaps // Export the overlap check function
  };
};