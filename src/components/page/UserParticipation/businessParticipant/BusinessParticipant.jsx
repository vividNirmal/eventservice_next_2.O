import React, { useState, useEffect } from 'react';
import { Calendar, Ticket } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    };
    businessForm(bookingData);

  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ticketData.currency
    }).format(amount);
  };

  return (
    <div className="flex flex-wrap gap-y-5 p-4 bg-[#f7f9fc]">
      <div className="w-1/3 relative rounded-2xl max-h-[calc(100svh_-_32px)] overflow-hidden hidden lg:block">
        <img src="/assets/images/login-img.webp" className="max-w-full w-full object-cover h-svh transition-all duration-100 ease-linear" alt="" />
        <div className="absolute bottom-0 left-0 right-0 p-4 m-4 rounded-lg bg-white/10 backdrop-blur-lg border border-solid border-white/15">
          <p className="z-1 text-white text-base 2xl:text-lg font-normal leading-normal">Lorem ipsum dolor sit amet, consectetur adipisicing elit it amet, consectetur adipisicing eli. Laboriosam veritatis nihil repudiandae.</p>
        </div>
      </div>
      <div className="w-2/5 grow px-9 max-h-svh flex flex-col">
        {/* Header */}
        <div className="text-zinc-950 p-6 text-center flex flex-col gap-1">
          <div className="flex items-center justify-center gap-3">
            <Ticket className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-zinc-950">Book Your Tickets</h1>
          </div>
          <p className="text-zinc-700">Select your ticket category</p>
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
            <div className='flex flex-col items-center w-full'>
              {/* Category Selection - Radio Buttons in One Row */}
              <div className="mb-8 w-full">
                <label className="block text-lg font-semibold text-slate-700 mb-4">Select Category</label>
                <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className={"grid-cols-3 gap-6"}>
                  {currentPricing.map((item) => (
                    <div key={item.category} className="relative">
                      <div className={cn("flex items-center space-x-3 p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-linear", selectedCategory === item.category ? 'border-[#3853ff] bg-white shadow-lg' : 'border-zinc-200')}>
                        <RadioGroupItem value={item.category} id={item.category} className="peer absolute left-0 top-0 size-full opacity-0 rounded-xl cursor-pointer transition-all duration-200 ease-in" />
                        <Label htmlFor={item.category}  className={cn("flex flex-col flex-1 cursor-pointer text-zinc-500", selectedCategory === item.category ? "text-[#3853ff]" : "")}>
                          <span className="text-lg font-bold text-slate-800 mb-1 text-center">{item.category}</span>
                          <span className={"text-2xl font-bold text-center"}>{formatCurrency(item.amount)}</span>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <Button onClick={handleSubmit} disabled={!selectedCategory} variant={'formBtn'} className="w-fit mx-auto">{selectedCategory ? 'Confirm Booking' : 'Select a Category'}</Button>
            </div>
          )}
        </div>

        {/* Date Tester (for demo purposes) */}
        <div className="mt-4">
          <div className='flex flex-wrap justify-between mb-2'>
            <h3 className="text-lg font-semibold text-slate-700">Test Different Dates</h3>
            <p className="text-sm text-slate-600">Try different dates to see pricing changes based on business slabs</p>
          </div>
          <input type="datetime-local" value={currentDateTime.toISOString().slice(0, 16)} onChange={(e) => setCurrentDateTime(new Date(e.target.value))} className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-[#3853ff] focus:outline-none" />
        </div>
      </div>
    </div>
  );
};

export default TicketBooking;