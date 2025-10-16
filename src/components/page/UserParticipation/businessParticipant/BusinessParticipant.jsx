import React, { useState, useEffect } from 'react';
import { Calendar, Ticket } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { SafeImage } from '@/components/common/SafeImage';

const TicketBooking = ({businessData,businessForm, eventData}) => {
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
    <div className="flex flex-wrap gap-5 p-4 bg-[#f7f9fc] h-svh overflow-auto lg:overflow-hidden">
      <div className="shrink-0 w-full lg:w-5/12 xl:w-1/3 relative rounded-2xl lg:max-h-[calc(100svh_-_32px)] lg:h-full overflow-hidden block after:pt-[56.25%] lg:after:pt-[100%] after:block">
        <SafeImage src={businessData?.desktopBannerImageUrl} mobileSrc={businessData?.mobileBannerImageUrl} placeholderSrc="/assets/images/login-img.webp" alt="Plastics Recycling Show" width={1200} height={600} className="max-w-full w-full h-full object-cover object-center absolute top-0 left-0" />
        {/* <p className="text-white font-light uppercase text-2xl md:text-3xl xl:text-5xl max-w-[90%] xl:max-w-full">
          {eventData?.eventName || "T"}
        </p> */}
        {eventData?.event_description && (
          <div className="w-[calc(100%_-_32px)] md:w-96 lg:w-auto absolute top-0 sm:top-1/3 left-0 sm:left-2/4 sm:-translate-x-2/4 lg:translate-none lg:top-auto lg:bottom-0 lg:left-0 lg:right-0 p-4 m-4 rounded-lg bg-white/10 backdrop-blur-lg border border-solid border-white/15">
            <h3 className='text-white font-bold text-lg lg:text-xl 2xl:text-2xl mb-3'>Lorem ipsum dolor sit amet.</h3>
            <p className="z-1 text-white text-sm 2xl:text-base font-normal leading-normal">{eventData.event_description}</p>
          </div>
          )
        }
      </div>
      <div className="relative z-1 bg-white rounded-2xl p-6 w-[90%] -mt-16 sm:-mt-32 lg:mt-0 mx-auto lg:mx-0 shadow-2xl lg:shadow-none lg:w-2/5 lg:grow lg:px-4 xl:px-9 max-h-svh flex flex-col lg:justify-center lg:self-stretch">
        {/* Header */}
        <div className="text-zinc-950 xl:p-6 text-center flex flex-col gap-1 mb-4">
          <div className="flex items-center justify-center gap-3">
            <Ticket className="size-6 xl:size-8" />
            <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-zinc-950">Book Your Tickets</h1>
          </div>
          <p className="text-zinc-700 text-sm xl:text-base leading-none">Select your ticket category</p>
        </div>

        {/* Current Date Display */}
        <div className="bg-slate-50 px-4 lg:px-8 py-2.5 lg:py-4 border-b border-slate-200 rounded-t-xl">
          <div className="flex items-center gap-4 text-slate-600">
            <Calendar className="size-9 shrink-0" />
            <div className='flex flex-col'>
              <span className="text-sm md:text-base font-medium">Current Date & Time:</span>
              <span className="text-xs md:text-sm text-slate-800">{currentDateTime.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 sm:py-4 xl:p-8">
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
                <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className={"md:grid-cols-3 gap-4 lg:gap-6"}>
                  {currentPricing.map((item) => (
                    <div key={item.category} className={cn("relative p-4 flex items-center rounded-lg border-2 cursor-pointer transition-all duration-300 ease-linear", selectedCategory === item.category ? 'border-[#3853ff] bg-white shadow-[0_4px_6px_0_rgba(0,0,0,0.12)_,inset_0px_0px_10px_4px_rgba(56,83,255,0.12)]' : 'border-zinc-200')}>
                      <RadioGroupItem value={item.category} id={item.category} className="peer absolute left-0 top-0 size-full opacity-0 rounded-xl cursor-pointer transition-all duration-200 ease-in" />
                      <Label htmlFor={item.category}  className={cn("flex flex-col flex-1 cursor-pointer text-zinc-500", selectedCategory === item.category ? "text-[#3853ff]" : "")}>
                        <span className={cn("text-base xl:text-lg font-bold mb-1 text-center", selectedCategory === item.category ? "text-zinc-950" : "text-zinc-500")}>{item.category}</span>
                        <span className={cn("text-lg lg:text-xl 2xl:text-2xl font-bold text-center", selectedCategory === item.category ? "text-[#3853ff]" : "text-zinc-700")}>{formatCurrency(item.amount)}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <Button onClick={handleSubmit} disabled={!selectedCategory} variant={'formBtn'} className="w-fit mx-auto">{selectedCategory ? 'Next' : 'Select a Category'}</Button>
            </div>
          )}
        </div>

        {/* Date Tester (for demo purposes) */}
        {/* <div className="mt-4">
          <div className='flex flex-wrap justify-between mb-2'>
            <h3 className="text-lg font-semibold text-slate-700">Test Different Dates</h3>
            <p className="text-sm text-slate-600">Try different dates to see pricing changes based on business slabs</p>
          </div>
          <input type="datetime-local" value={currentDateTime.toISOString().slice(0, 16)} onChange={(e) => setCurrentDateTime(new Date(e.target.value))} className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-[#3853ff] focus:outline-none" />
        </div> */}
      </div>
    </div>
  );
};

export default TicketBooking;