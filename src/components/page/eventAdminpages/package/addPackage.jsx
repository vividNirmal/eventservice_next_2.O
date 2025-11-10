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
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { CustomCombobox } from "@/components/common/customcombox";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";

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

  // Get currency symbol based on selected currency
 

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      currency: "USD", // Default currency
      event_package: [
        {
          event_category: "",
          event_Id: "",
          event_price: "",
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
            event_price: Yup.number()
              .typeError("Price must be a number")
              .min(0, "Price must be 0 or positive")
              .required("Price is required"),
          })
        )
        .min(1, "At least one event bundle is required")
        .test("unique-events", "Each event can only be selected once", function (bundles) {
          if (!bundles) return true;
          
          const eventIds = bundles
            .map((bundle) => bundle.event_Id)
            .filter((event_Id) => event_Id !== "");
          
          const uniqueEventIds = new Set(eventIds);
          
          if (eventIds.length !== uniqueEventIds.size) {
            const duplicates = eventIds.filter(
              (item, index) => eventIds.indexOf(item) !== index
            );
            return this.createError({
              path: "event_package",
              message: `Duplicate events found. Each event can only be selected once.`,
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
          event_package: values.event_package,
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
        // Transform the event_package data to match the form structure
        const transformedEventPackage = editPackage.event_package.map((bundle) => ({
          event_category: bundle.event_category?._id || bundle.event_category || "",
          event_Id: bundle.event_Id?._id || bundle.event_Id || "",
          event_price: bundle.event_price || "",
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
        
        // Add category to map
        if (!categoriesMap.has(event_category._id)) {
          categoriesMap.set(event_category._id, {
            _id: event_category._id,
            title: event_category.title,
          });
        }

        // Group events by category
        if (!eventsByCategoryMap[event_category._id]) {
          eventsByCategoryMap[event_category._id] = [];
        }

        eventsByCategoryMap[event_category._id].push({
          _id: item.eventId._id,
          eventName: item.eventId.eventName,
          ticketName: item.ticketName,
          ticketAmount: item.ticketAmount,
          defaultPrice: getDefaultPrice(item.ticketAmount),
        });
      }
    });

    setEventCategories(Array.from(categoriesMap.values()));
    setEventsByCategory(eventsByCategoryMap);
  }

  // Extract default price from ticket amount
  function getDefaultPrice(ticketAmount) {
    if (ticketAmount.type === "free") {
      return 0;
    } else if (ticketAmount.type === "businessSlab" && ticketAmount.businessSlabs?.length > 0) {
      const firstSlab = ticketAmount.businessSlabs[0];
      if (firstSlab.categoryAmounts?.length > 0) {
        return firstSlab.categoryAmounts[0].amount;
      }
    }
    return 0;
  }

  // Get selected event IDs (excluding current index)
  const getSelectedEventIds = (currentIndex) => {
    return formik.values.event_package
      .map((bundle, index) => (index !== currentIndex ? bundle.event_Id : null))
      .filter((eventId) => eventId !== null && eventId !== "");
  };

  // Get available events for category (excluding already selected events)
  const getAvailableEventsForCategory = (categoryId, currentIndex) => {
    const allEvents = eventsByCategory[categoryId] || [];
    const selectedEventIds = getSelectedEventIds(currentIndex);
    
    return allEvents.filter(
      (event) => !selectedEventIds.includes(event._id)
    );
  };

  // Check if an event is already selected
  const isEventAlreadySelected = (eventId, currentIndex) => {
    const selectedEventIds = getSelectedEventIds(currentIndex);
    return selectedEventIds.includes(eventId);
  };

  // Add new event bundle
  const addEventBundle = () => {
    formik.setFieldValue("event_package", [
      ...formik.values.event_package,
      {
        event_category: "",
        event_Id: "",
        event_price: "",
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
    formik.setFieldValue(`event_package[${index}].event_price`, "");
  };

  // Handle event change
  const handleEventChange = (index, value) => {
    // Check if event is already selected
    if (isEventAlreadySelected(value, index)) {
      toast.error("This event is already selected in another bundle");
      return;
    }

    formik.setFieldValue(`event_package[${index}].event_Id`, value);
    
    // Find the selected event and set default price
    const categoryId = formik.values.event_package[index].event_category;
    const events = eventsByCategory[categoryId] || [];
    const selectedEvent = events.find((event) => event._id === value);
    
    if (selectedEvent) {
      formik.setFieldValue(`event_package[${index}].event_price`, selectedEvent.defaultPrice);
    }
  };

  // Handle price change
  const handlePriceChange = (index, e) => {
    const value = e.target.value;
    
    // Allow empty string or valid numbers (including 0)
    if (value === "" || !isNaN(value)) {
      formik.setFieldValue(`event_package[${index}].event_price`, value);
    }
  };

  // Handle currency change
  const handleCurrencyChange = (value) => {
    formik.setFieldValue("currency", value);
  };

  // Get current currency symbol
  const currentCurrencySymbol = getCurrencySymbol(formik.values.currency);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[1200px] xl:max-w-[1400px] w-full overflow-y-auto">
        <SheetHeader className="pb-6 border-b">
          <SheetTitle className="text-2xl font-bold">
            {editPackage ? "Edit Package" : "Create New Package"}
          </SheetTitle>
          <SheetDescription className="text-base">
            {editPackage
              ? "Update package information and event bundles"
              : "Create a new event package with multiple events"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-8 py-6">
          {/* Package Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Package Name */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
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
              <Label htmlFor="currency" className="text-sm font-semibold">
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
                className="h-11"
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
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Package Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter a detailed description of the package"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={4}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 resize-none"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Total Price Display with Dynamic Currency */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Package Total Price</Label>
            <div className="h-14 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-700">
                    {currentCurrencySymbol}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-blue-600 font-medium block">
                    {formik.values.event_package.length} event{formik.values.event_package.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-slate-500">
                    {CURRENCIES.find(c => c.code === formik.values.currency)?.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-900">
                  {currentCurrencySymbol}{totalPrice.toFixed(2)}
                </div>
                <span className="text-xs text-slate-500">{formik.values.currency}</span>
              </div>
            </div>
          </div>

          {/* Event Bundles Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <Label className="text-lg font-semibold text-slate-800">
                  Event Bundles <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-slate-500 mt-1">
                  Add events to this package
                </p>
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

            {/* Event Bundle Items - One Row Layout */}
            <div className="space-y-3">
              {formik.values.event_package.map((bundle, index) => (
                <div
                  key={index}
                  className="group p-4 border-2 border-slate-200 rounded-lg bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Bundle Number */}
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>

                    {/* Form Fields in One Row */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Event Category */}
                      <div className="lg:col-span-4 space-y-1.5">
                        <Label htmlFor={`event_package[${index}].event_category`} className="text-xs font-medium text-slate-600">
                          Event Category <span className="text-red-500">*</span>
                        </Label>
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
                          className="h-10"
                        />
                        {formik.touched.event_package?.[index]?.event_category &&
                          formik.errors.event_package?.[index]?.event_category && (
                            <p className="text-xs text-red-500">
                              {formik.errors.event_package[index].event_category}
                            </p>
                          )}
                      </div>

                      {/* Event */}
                      <div className="lg:col-span-4 space-y-1.5">
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
                          options={getAvailableEventsForCategory(bundle.event_category, index)}
                          placeholder={
                            bundle.event_category
                              ? "Select event"
                              : "Select category first"
                          }
                          id={`event_package[${index}].event_Id`}
                          disabled={!bundle.event_category}
                          className="h-10"
                        />
                        {formik.touched.event_package?.[index]?.event_Id &&
                          formik.errors.event_package?.[index]?.event_Id && (
                            <p className="text-xs text-red-500">
                              {formik.errors.event_package[index].event_Id}
                            </p>
                          )}
                      </div>

                      {/* Price with Dynamic Currency Symbol */}
                      <div className="lg:col-span-3 space-y-1.5">
                        <Label htmlFor={`event_package[${index}].event_price`} className="text-xs font-medium text-slate-600">
                          Price <span className="text-red-500">*</span>
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
                            className="h-10 pl-9 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
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
                            className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editPackage ? "Update Package" : "Create Package"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}