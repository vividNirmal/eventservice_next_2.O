"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, ShieldHalf, Trash2, RefreshCw } from "lucide-react";
import { CustomCombobox } from "@/components/common/customcombox";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Currency configuration
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

export const getCurrencySymbol = (currencyCode) => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency ? currency.symbol : '$';
};

export function PackageFormDrawer({
  isOpen,
  onClose,
  editPackage = null,
  refetch,
  loading = false,
}) {
  const [eventsData, setEventsData] = useState([]);
  const [eventCategories, setEventCategories] = useState([]);
  const [eventsByCategory, setEventsByCategory] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      currency: "USD",
      event_package: [
        {
          event_category: "",
          event_Id: "",
          ticket_category: "",
          total_slots: "",
          event_price: "",
          unit_price: "", // Store the unit price for reference
        },
      ],
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Package name is required"),
      description: Yup.string().required("Package description is required"),
      currency: Yup.string()
        .oneOf(CURRENCIES.map(c => c.code), "Invalid currency")
        .required("Currency is required"),
      event_package: Yup.array()
        .of(
          Yup.object({
            event_category: Yup.string().required("Category is required"),
            event_Id: Yup.string().required("Event is required"),
            ticket_category: Yup.string().required("Ticket category is required"),
            total_slots: Yup.number()
              .typeError("Slots must be a number")
              .min(1, "Minimum 1 slot required")
              .required("Total slots is required"),
            event_price: Yup.number()
              .typeError("Price must be a number")
              .min(0, "Price must be 0 or positive")
              .required("Price is required"),
          })
        )
        .min(1, "At least one event bundle is required")
        .test("unique-event-ticket", "Each event-ticket combination can only be selected once", function (bundles) {
          if (!bundles) return true;
          
          const combinations = bundles
            .map((bundle) => `${bundle.event_Id}-${bundle.ticket_category}`)
            .filter((combo) => combo !== "-");
          
          const uniqueCombinations = new Set(combinations);
          
          if (combinations.length !== uniqueCombinations.size) {
            return this.createError({
              path: "event_package",
              message: `Duplicate event-ticket category combinations found. Each combination can only be selected once.`,
            });
          }
          
          return true;
        }),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          title: values.title,
          description: values.description,
          currency: values.currency,
          event_package: values.event_package.map(bundle => ({
            event_category: bundle.event_category,
            event_Id: bundle.event_Id,
            ticketType: bundle.ticket_category,
            ticketSlot: bundle.total_slots,
            event_price: bundle.event_price,
          })),
          package_total_price: totalPrice.toString(),
        };
                
        if (editPackage) {          
          const response = await postRequest(`update-package/${editPackage._id}`, payload);
          
          if (response.status === 1) {
            toast.success("Package updated successfully");
            onClose();
            refetch(true);
          }
        } else {
          const response = await postRequest("store-package", payload);
          
          if (response.status === 1) {
            toast.success("Package created successfully");
            onClose();
            refetch(true);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error(editPackage ? "Failed to update package" : "Failed to create package");
      }
    },
  });

  // Calculate total price whenever event_package changes
  useEffect(() => {
    calculateTotalPrice();
  }, [formik.values.event_package]);

  // Fetch events data
  useEffect(() => {
    if (isOpen) {
      fetchEventsData();
    }
  }, [isOpen]);

  // Process events data when it changes
  useEffect(() => {
    if (eventsData.length > 0) {
      processEventsData();
    }
  }, [eventsData]);

  // Reset form on open/close
  useEffect(() => {
    if (isOpen) {
      if (editPackage) {
        const transformedEventPackage = editPackage.event_package.map((bundle) => ({
          event_category: bundle.event_category?._id || bundle.event_category || "",
          event_Id: bundle.event_Id?._id || bundle.event_Id || "",
          ticket_category: bundle.ticket_category || "",
          total_slots: bundle.total_slots || "",
          event_price: bundle.event_price || "",
          unit_price: bundle.unit_price || "",
        }));

        formik.setValues({
          title: editPackage.title || "",
          description: editPackage.description || "",
          currency: editPackage.currency || "USD",
          event_package: transformedEventPackage,
        });
      } else {
        formik.resetForm();
      }
    }
  }, [editPackage, isOpen]);

  // Calculate total price
  const calculateTotalPrice = () => {
    const total = formik.values.event_package.reduce((sum, bundle) => {
      const event_price = parseFloat(bundle.event_price) || 0;
      return sum + event_price;
    }, 0);
    setTotalPrice(total);
  };

  // Fetch events data from API
  async function fetchEventsData() {
    try {
      const response = await getRequest("get-event-attendas");
      if (response?.data) {
        setEventsData(response.data);
      }
    } catch (error) {
      console.error("Error fetching events data:", error);
      toast.error("Failed to fetch events data");
    }
  }

  // Process events data to extract categories and group events
  function processEventsData() {
    const categoriesMap = new Map();
    const eventsByCategoryMap = {};

    eventsData.forEach((item) => {
      if (item.eventId && item.eventId.event_category) {
        const event_category = item.eventId.event_category;
        
        if (!categoriesMap.has(event_category._id)) {
          categoriesMap.set(event_category._id, {
            _id: event_category._id,
            title: event_category.title,
          });
        }

        if (!eventsByCategoryMap[event_category._id]) {
          eventsByCategoryMap[event_category._id] = [];
        }

        eventsByCategoryMap[event_category._id].push({
          _id: item.eventId._id,
          eventName: item.eventId.eventName,
          ticketName: item.ticketName,
          ticketAmount: item.ticketAmount,
          ticketCategories: getTicketCategories(item.ticketAmount),
        });
      }
    });

    setEventCategories(Array.from(categoriesMap.values()));
    setEventsByCategory(eventsByCategoryMap);
  }

  // Extract ticket categories from businessSlabs
  function getTicketCategories(ticketAmount) {
    if (ticketAmount.type === "free") {
      return [{ category: "Free", amount: 0 }];
    } else if (ticketAmount.type === "businessSlab" && ticketAmount.businessSlabs?.length > 0) {
      const categories = [];
      ticketAmount.businessSlabs.forEach((slab) => {
        if (slab.categoryAmounts?.length > 0) {
          slab.categoryAmounts.forEach((catAmount) => {
            // Avoid duplicates
            if (!categories.find(c => c.category === catAmount.category)) {
              categories.push({
                category: catAmount.category,
                amount: catAmount.amount,
              });
            }
          });
        }
      });
      return categories;
    }
    return [];
  }

  // Get ticket categories for selected event
  const getTicketCategoriesForEvent = (categoryId, eventId) => {
    const events = eventsByCategory[categoryId] || [];
    const selectedEvent = events.find((event) => event._id === eventId);
    return selectedEvent?.ticketCategories || [];
  };

  // Get price for selected ticket category
  const getPriceForTicketCategory = (categoryId, eventId, ticketCategory) => {
    const categories = getTicketCategoriesForEvent(categoryId, eventId);
    const category = categories.find((cat) => cat.category === ticketCategory);
    return category?.amount || 0;
  };

  // Get selected event-ticket combinations (excluding current index)
  const getSelectedCombinations = (currentIndex) => {
    return formik.values.event_package
      .map((bundle, index) => 
        index !== currentIndex 
          ? `${bundle.event_Id}-${bundle.ticket_category}` 
          : null
      )
      .filter((combo) => combo !== null && combo !== "-");
  };

  // Get available events for category
  const getAvailableEventsForCategory = (categoryId) => {
    return eventsByCategory[categoryId] || [];
  };

  // Check if event-ticket combination is already selected
  const isCombinationAlreadySelected = (eventId, ticketCategory, currentIndex) => {
    const selectedCombinations = getSelectedCombinations(currentIndex);
    return selectedCombinations.includes(`${eventId}-${ticketCategory}`);
  };

  // Add new event bundle
  const addEventBundle = () => {
    formik.setFieldValue("event_package", [
      ...formik.values.event_package,
      {
        event_category: "",
        event_Id: "",
        ticket_category: "",
        total_slots: "",
        event_price: "",
        unit_price: "",
      },
    ]);
  };

  // Remove event bundle
  const removeEventBundle = (index) => {
    const bundles = [...formik.values.event_package];
    bundles.splice(index, 1);
    formik.setFieldValue("event_package", bundles);
  };

  // Handle category change
  const handleCategoryChange = (index, value) => {
    formik.setFieldValue(`event_package[${index}].event_category`, value);
    formik.setFieldValue(`event_package[${index}].event_Id`, "");
    formik.setFieldValue(`event_package[${index}].ticket_category`, "");
    formik.setFieldValue(`event_package[${index}].total_slots`, "");
    formik.setFieldValue(`event_package[${index}].event_price`, "");
    formik.setFieldValue(`event_package[${index}].unit_price`, "");
  };

  // Handle event change
  const handleEventChange = (index, value) => {
    formik.setFieldValue(`event_package[${index}].event_Id`, value);
    formik.setFieldValue(`event_package[${index}].ticket_category`, "");
    formik.setFieldValue(`event_package[${index}].total_slots`, "");
    formik.setFieldValue(`event_package[${index}].event_price`, "");
    formik.setFieldValue(`event_package[${index}].unit_price`, "");
  };

  // Handle ticket category change
  const handleTicketCategoryChange = (index, value) => {
    const bundle = formik.values.event_package[index];
    
    // Check if combination already selected
    if (isCombinationAlreadySelected(bundle.event_Id, value, index)) {
      toast.error("This event-ticket category combination is already selected");
      return;
    }

    formik.setFieldValue(`event_package[${index}].ticket_category`, value);
    
    // Get unit price for selected ticket category
    const unitPrice = getPriceForTicketCategory(
      bundle.event_category,
      bundle.event_Id,
      value
    );
    
    formik.setFieldValue(`event_package[${index}].unit_price`, unitPrice);
    
    // Calculate and set total price based on slots
    const slots = parseInt(bundle.total_slots) || 0;
    const totalPrice = unitPrice * slots;
    
    formik.setFieldValue(`event_package[${index}].event_price`, totalPrice);
  };

  // Handle slots change
  const handleSlotsChange = (index, e) => {
    const value = e.target.value;
    
    // Allow only positive integers
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      formik.setFieldValue(`event_package[${index}].total_slots`, value);
      
      // Auto-recalculate price based on unit price
      const bundle = formik.values.event_package[index];
      if (bundle.unit_price) {
        const slots = parseInt(value) || 0;
        const totalPrice = bundle.unit_price * slots;
        formik.setFieldValue(`event_package[${index}].event_price`, totalPrice);
      }
    }
  };

  // Handle manual price change
  const handlePriceChange = (index, e) => {
    const value = e.target.value;
    
    // Allow empty string or valid numbers (including decimals)
    if (value === "" || !isNaN(value)) {
      formik.setFieldValue(`event_package[${index}].event_price`, value);
    }
  };

  // Reset price to auto-calculated value
  const resetPriceToDefault = (index) => {
    const bundle = formik.values.event_package[index];
    
    if (bundle.unit_price && bundle.total_slots) {
      const slots = parseInt(bundle.total_slots) || 0;
      const totalPrice = bundle.unit_price * slots;
      formik.setFieldValue(`event_package[${index}].event_price`, totalPrice);
      toast.success("Price reset to calculated value");
    }
  };

  // Handle currency change
  const handleCurrencyChange = (value) => {
    formik.setFieldValue("currency", value);
  };

  // Get current currency symbol
  const currentCurrencySymbol = getCurrencySymbol(formik.values.currency);

  // Check if price has been manually modified
  const isPriceModified = (index) => {
    const bundle = formik.values.event_package[index];
    if (!bundle.unit_price || !bundle.total_slots) return false;
    
    const expectedPrice = bundle.unit_price * parseInt(bundle.total_slots || 0);
    const currentPrice = parseFloat(bundle.event_price) || 0;
    
    return Math.abs(expectedPrice - currentPrice) > 0.01; // Allow for small floating point differences
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg lg:max-w-4xl gap-0">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="font-bold">{editPackage ? "Edit Package" : "Create New Package"}</SheetTitle>
          <SheetDescription>{editPackage ? "Update package information and event bundles" : "Create a new event package with multiple events"}</SheetDescription>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} className="p-4 pb-0 grow flex flex-col">
          <ScrollArea className="h-32 grow pr-4">
            {/* Package Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Package Name */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Package Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter package name"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="h-11 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                    {formik.errors.title}
                  </p>
                )}
              </div>

              {/* Currency Selection */}
              <div className="space-y-2">
                <Label htmlFor="currency">
                  Currency <span className="text-red-500">*</span>
                </Label>
                <CustomCombobox
                  name="currency"
                  value={formik.values.currency}
                  onChange={handleCurrencyChange}
                  onBlur={() => formik.setFieldTouched("currency", true)}
                  valueKey="code"
                  labelKey="name"
                  options={CURRENCIES.map(currency => ({
                    ...currency,
                    displayName: `${currency.symbol} ${currency.name} (${currency.code})`
                  }))}
                  placeholder="Select currency"
                  id="currency"
                  renderOption={(option) => (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{option.symbol}</span>
                      <span className="text-sm text-slate-600">{option.name}</span>
                      <span className="text-xs text-slate-400">{option.code}</span>
                    </div>
                  )}
                />
                {formik.touched.currency && formik.errors.currency && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                    {formik.errors.currency}
                  </p>
                )}
              </div>
            </div>

            {/* Package Description */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="description">Package Description <span className="text-red-500">*</span></Label>
              <Textarea id="description" name="description" placeholder="Enter a detailed description of the package" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} rows={4} className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 resize-none" />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {formik.errors.description}
                </p>
              )}
            </div>

            {/* Event Bundles Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <div className="flex flex-col">
                  <Label className="text-sm xl:text-lg font-semibold text-slate-800 m-0">
                    Event Bundles <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs lg:text-sm text-slate-500">Add events with ticket categories and slots</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEventBundle}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              </div>

              {/* Event Bundle Items */}
              <div className="space-y-3">
                {formik.values.event_package.map((bundle, index) => (
                  <div key={index} className="group p-4 border-2 border-slate-200 rounded-lg bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-4">
                      {/* Bundle Number */}
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>

                      {/* Form Fields */}
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Event Category */}
                        <div className="lg:col-span-3 space-y-1.5">
                          <Label htmlFor={`event_package[${index}].event_category`} className="text-xs font-medium text-slate-600">Event Shows <sup className="text-red-500">*</sup></Label>
                          <CustomCombobox
                            name={`event_package[${index}].event_category`}
                            value={bundle.event_category}
                            onChange={(value) => handleCategoryChange(index, value)}
                            onBlur={() =>
                              formik.setFieldTouched(`event_package[${index}].event_category`, true)
                            }
                            valueKey="_id"
                            labelKey="title"
                            options={eventCategories}
                            placeholder="Select category"
                            id={`event_package[${index}].event_category`}
                          />
                          {formik.touched.event_package?.[index]?.event_category &&
                            formik.errors.event_package?.[index]?.event_category && (
                              <p className="text-xs text-red-500">
                                {formik.errors.event_package[index].event_category}
                              </p>
                            )}
                        </div>

                        {/* Event */}
                        <div className="lg:col-span-3 space-y-1.5">
                          <Label htmlFor={`event_package[${index}].event_Id`} className="text-xs font-medium text-slate-600">
                            Event <span className="text-red-500">*</span>
                          </Label>
                          <CustomCombobox
                            name={`event_package[${index}].event_Id`}
                            value={bundle.event_Id}
                            onChange={(value) => handleEventChange(index, value)}
                            onBlur={() =>
                              formik.setFieldTouched(`event_package[${index}].event_Id`, true)
                            }
                            valueKey="_id"
                            labelKey="eventName"
                            options={getAvailableEventsForCategory(bundle.event_category)}
                            placeholder={
                              bundle.event_category
                                ? "Select event"
                                : "Select category first"
                            }
                            id={`event_package[${index}].event_Id`}
                            disabled={!bundle.event_category}
                          />
                          {formik.touched.event_package?.[index]?.event_Id &&
                            formik.errors.event_package?.[index]?.event_Id && (
                              <p className="text-xs text-red-500">
                                {formik.errors.event_package[index].event_Id}
                              </p>
                            )}
                        </div>

                        {/* Ticket Category */}
                        <div className="lg:col-span-2 space-y-1.5">
                          <Label htmlFor={`event_package[${index}].ticket_category`} className="text-xs font-medium text-slate-600">
                            Ticket Type <span className="text-red-500">*</span>
                          </Label>
                          <CustomCombobox
                            name={`event_package[${index}].ticket_category`}
                            value={bundle.ticket_category}
                            onChange={(value) => handleTicketCategoryChange(index, value)}
                            onBlur={() =>
                              formik.setFieldTouched(`event_package[${index}].ticket_category`, true)
                            }
                            valueKey="category"
                            labelKey="category"
                            options={getTicketCategoriesForEvent(bundle.event_category, bundle.event_Id)}
                            placeholder={
                              bundle.event_Id
                                ? "Select ticket"
                                : "Select event first"
                            }
                            id={`event_package[${index}].ticket_category`}
                            disabled={!bundle.event_Id}
                            renderOption={(option) => (
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium">{option.category}</span>
                                <span className="text-xs text-slate-500">{currentCurrencySymbol}{option.amount}</span>
                              </div>
                            )}
                          />
                          {formik.touched.event_package?.[index]?.ticket_category &&
                            formik.errors.event_package?.[index]?.ticket_category && (
                              <p className="text-xs text-red-500">
                                {formik.errors.event_package[index].ticket_category}
                              </p>
                            )}
                        </div>

                        {/* Total Slots */}
                        <div className="lg:col-span-2 space-y-1.5">
                          <Label htmlFor={`event_package[${index}].total_slots`} className="text-xs font-medium text-slate-600">
                            Slots <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`event_package[${index}].total_slots`}
                            name={`event_package[${index}].total_slots`}
                            type="number"
                            min="1"
                            placeholder="0"
                            value={bundle.total_slots}
                            onChange={(e) => handleSlotsChange(index, e)}
                            onBlur={formik.handleBlur}
                            className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                            disabled={!bundle.ticket_category}
                          />
                          {formik.touched.event_package?.[index]?.total_slots &&
                            formik.errors.event_package?.[index]?.total_slots && (
                              <p className="text-xs text-red-500">
                                {formik.errors.event_package[index].total_slots}
                              </p>
                            )}
                        </div>

                        {/* Price (Editable with Reset Option) */}
                        <div className="lg:col-span-2 space-y-1.5">
                          <Label htmlFor={`event_package[${index}].event_price`} className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            Total Price <span className="text-red-500">*</span>
                            {isPriceModified(index) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => resetPriceToDefault(index)}
                                      className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                      <RefreshCw className="h-3 w-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Reset to calculated price</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                              {currentCurrencySymbol}
                            </span>
                            <Input
                              id={`event_package[${index}].event_price`}
                              name={`event_package[${index}].event_price`}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={bundle.event_price}
                              onChange={(e) => handlePriceChange(index, e)}
                              onBlur={formik.handleBlur}
                              className={`bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 pl-8 ${
                                isPriceModified(index) ? 'border-amber-300 bg-amber-50/50' : ''
                              }`}
                            />
                          </div>
                          {formik.touched.event_package?.[index]?.event_price &&
                            formik.errors.event_package?.[index]?.event_price && (
                              <p className="text-xs text-red-500">
                                {formik.errors.event_package[index].event_price}
                              </p>
                            )}
                        </div>

                        {/* Delete Button */}
                        <div className="lg:col-span-1 flex items-end pb-1">
                          {formik.values.event_package.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEventBundle(index)}
                              className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>                   
                  </div>
                ))}
              </div>

              {typeof formik.errors.event_package === 'string' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {formik.errors.event_package}
                  </p>
                </div>
              )}
            </div>

          </ScrollArea>
          
          {/* Total Price Display */}
          <div className="space-y-2 py-3">
            <Label>Package Total Price</Label>
            <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg flex items-end justify-between">
              <div className="flex items-center gap-3">
                <div className="size-7 lg:size-8 2xl:size-9 bg-blue-100 rounded-full text-xs 2xl:text-sm font-bold text-blue-700 flex items-center justify-center"><ShieldHalf className="size-5" /></div>
                <div className="flex flex-col">
                  <span className="text-sm text-blue-600 font-medium block">
                    {formik.values.event_package.reduce((sum, bundle) => sum + (parseInt(bundle.total_slots) || 0), 0)} total slot{formik.values.event_package.reduce((sum, bundle) => sum + (parseInt(bundle.total_slots) || 0), 0) !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-slate-500">{CURRENCIES.find(c => c.code === formik.values.currency)?.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg md:text-xl 2xl:text-2xl font-bold text-blue-900">{currentCurrencySymbol}{totalPrice.toFixed(2)} <span className="text-xs text-slate-500">{formik.values.currency}</span></div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <SheetFooter className="flex flex-row justify-end gap-3 border-t border-solid border-gray-300">
            <Button type="button" variant="outline" onClick={onClose} className="min-w-[100px]">Cancel</Button>
            <Button type="submit" disabled={loading} className="hover:text-white bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editPackage ? "Update Package" : "Create Package"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}