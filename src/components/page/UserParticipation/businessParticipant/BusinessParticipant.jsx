import React, { useState, useEffect } from 'react';
import { Calendar, Ticket } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const TicketBooking = ({businessData,businessForm}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPricing, setCurrentPricing] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Your ticket data
  const ticketData = businessData?.ticketAmount;

  // Function to get current pricing based on date
  const getCurrentPricing = (userDateTime) => {
    const userDate = new Date(userDateTime);
    
    for (const slab of ticketData.businessSlabs) {
      const startDate = new Date(slab.startDateTime);
      const endDate = new Date(slab.endDateTime);
      
      if (userDate >= startDate && userDate <= endDate) {
        return slab.categoryAmounts;
      }
    }
    
    return [];
  };

  // Update pricing when component mounts or date changes
  useEffect(() => {
    const pricing = getCurrentPricing(currentDateTime);
    setCurrentPricing(pricing);
  }, [currentDateTime]);

  const handleSubmit = () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    
    const selectedItem = currentPricing.find(c => c.category === selectedCategory);
    const bookingData = {
      category: selectedCategory,
      amount: selectedItem.amount,
      currency: ticketData.currency,
      bookingDateTime: currentDateTime.toISOString()
    };
    businessForm(bookingData);
    console.log('Booking Details:', bookingData);    
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ticketData.currency
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Book Your Tickets</h1>
            </div>
            <p className="text-purple-100">Select your ticket category</p>
          </div>

          {/* Current Date Display */}
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Current Date & Time:</span>
              <span className="text-slate-800">{currentDateTime.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-8">
            {currentPricing.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-xl font-semibold mb-2">No tickets available</div>
                <p className="text-slate-600">Tickets are not available for the current date/time</p>
              </div>
            ) : (
              <div>
                {/* Category Selection - Radio Buttons in One Row */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold text-slate-700 mb-6">
                    Select Category
                  </label>
                  <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                    <div className="grid grid-cols-3 gap-6">
                      {currentPricing.map((item) => (
                        <div key={item.category} className="relative">
                          <div className={`flex items-center space-x-3 p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                            selectedCategory === item.category
                              ? 'border-purple-500 bg-purple-50 shadow-lg'
                              : 'border-slate-200 hover:border-purple-300 hover:shadow-md'
                          }`}>
                            <RadioGroupItem 
                              value={item.category} 
                              id={item.category}
                              className="mt-1"
                            />
                            <Label 
                              htmlFor={item.category} 
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-800 mb-1">
                                  {item.category}
                                </span>
                                <span className="text-2xl font-bold text-purple-600">
                                  {formatCurrency(item.amount)}
                                </span>
                              </div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedCategory}
                  className="w-full py-6 text-lg font-bold"
                  size="lg"
                >
                  {selectedCategory ? 'Confirm Booking' : 'Select a Category'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Date Tester (for demo purposes) */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">Test Different Dates</h3>
          <p className="text-sm text-slate-600 mb-3">
            Try different dates to see pricing changes based on business slabs
          </p>
          <input
            type="datetime-local"
            value={currentDateTime.toISOString().slice(0, 16)}
            onChange={(e) => setCurrentDateTime(new Date(e.target.value))}
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default TicketBooking;