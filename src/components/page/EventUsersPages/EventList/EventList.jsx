"use client";
import { useEffect, useState } from "react";
import { ExhibitorCard, CategoryCard } from "./EventAttendeesCard";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { CheckCircle, ChevronLeft, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "../../eventAdminpages/package/addPackage";
import { PaymentPopup } from "../Payment/SumitPayment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppliedExhibitorApplications } from "./common/AppliedExhibitorApplications"

export default function UserEventList() {
  const { userType } = useSelector((state) => state.eventUser);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categorizedEvents, setCategorizedEvents] = useState([]);
  const [attendees, setAttendess] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPackagedeatils, setSelectedPackageDetails] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await getRequest(`eventuser-events`);
      if (response.status === 1 && response.data) {
        if (response.data) {
          setCategorizedEvents(response.data.eventcategory);
          setAttendess(response.data.attendasData?.data);
        }
      } else {
        console.log("❌ API Response error or no data:", response);
      }
    } catch (error) {
      console.error("🚨 Error fetching form:", error);
      toast.error("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (id) => {
    router.push(`/dashboard/eventuser/eventlist/${id}`);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleAction = (pkg) => {
    if (pkg) {
      setSelectedPackage(pkg);
      setPaymentPopupOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ....</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 relative z-20 w-full">
      {/* Event Attendees View */}
      {userType?.typeName === "Event Attendees" && (
        <section className="w-full">
          <div className="bg-white p-6 rounded-2xl">
            <h2 className="text-base lg:text-lg 2xl:text-xl font-bold text-foreground mb-1">Available Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6 xl:gap-y-4">
              <h3 className="text-base 2xl:text-lg font-semibold text-zinc-800 col-span-full">Single Show Registartion</h3>
              {attendees?.combo_tickets.map((pkg) => (
                <div className="flex flex-col bg-zinc-50 border border-solid border-zinc-200 p-4 rounded-xl group shadow-none hover:shadow-lg translate-y-0 hover:bg-white hover:-translate-y-1 transition-all duration-300 ease-linear" key={pkg._id}>
                  <div className="overflow-hidden rounded-lg">
                    <img src="/concert-banner.webp" className="w-full h-42 scale-100 group-hover:scale-110 max-w-full object-cover object-center transition-all duration-200 ease-in" alt="ticket img" />
                  </div>
                  <div className="pt-4 flex flex-col gap-4 grow">
                    <div className="flex flex-col">
                      <h3 className="text-base lg:text-lg xl:text-xl font-bold text-foreground mb-0.5">{pkg.title}</h3>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                    </div>
                    <div className="flex xl:flex-row flex-col xl:items-center justify-between gap-2 xl:gap-4 mt-auto">
                      <Button variant={"ghost"} onClick={() => setSelectedPackageDetails(pkg)} className="w-full xl:w-fit bg-blue-600 text-white border border-solid border-blue-600 hover:bg-white transition-colors cursor-pointer">View More Details</Button>
                      <Button className={"rounded-md bg-white text-black border border-solid border-blue-500 hover:text-white hover:border-blue-600 hover:bg-blue-600 cursor-pointer xl:w-5/12 xl:grow"} onClick={() => handleAction(pkg)}>Visitor Registration{" "}
                        {`${getCurrencySymbol(pkg.currency || "INR")} ${pkg.price}`}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6 xl:gap-y-4 mt-8">
            <h3 className="text-base 2xl:text-lg font-semibold text-zinc-800 col-span-full">Single Show Registartion</h3>
            {attendees?.event_tickets.map((pkg) => (
              <ExhibitorCard
                key={pkg._id}
                title={pkg.title}
                description={pkg.description}
                price={pkg.price}
                currency={pkg.currency}
                dateRange={pkg.dataRange}
                onBuyNow={() => handleAction(pkg)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Exhibitor View - Category wise */}
      {userType?.typeName === "Exhibitor" && (
        <section className="w-full">
          {!selectedCategory && (
            // Show Categories
            <>
              <h2 className="text-base lg:text-lg 2xl:text-xl font-bold text-foreground mb-6 bg-white w-fit px-4 py-2 rounded-md">Event Shows</h2>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {categorizedEvents?.map((item) => (
                  <CategoryCard
                    key={item._id}
                    category={item}
                    eventCount={item.eventCount}
                    status={item.status}
                    onApply={() => handleCategorySelect(item._id)}
                  />
                ))}
              </div>

              {/* Applied Exhibitor Applications Table */}
              <AppliedExhibitorApplications />
            </>
          )}
        </section>
      )}

      {/* payment popup */}
      {selectedPackage && (
        <PaymentPopup
          open={paymentPopupOpen}
          onOpenChange={setPaymentPopupOpen}
          item={selectedPackage}
          Success={(data) => setPaymentSuccess(data)}
        />
      )}

      <Dialog open={!!selectedPackagedeatils} onOpenChange={() => setSelectedPackageDetails(null)}>
        <DialogContent className="flex flex-col h-full max-h-[70svh] sm:max-h-[68svh] p-0 gap-0 w-full sm:max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border-0 outline-0">
          <DialogHeader className={'p-4 border-b border-slate-100 gap-1'}>
            <DialogTitle className="text-xl font-bold">{selectedPackagedeatils?.title}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">Package Details</DialogDescription>
          </DialogHeader>
          {selectedPackagedeatils && (
            <>
              <div className="p-4 space-y-4 h-20 grow overflow-auto">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 flex items-start gap-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 text-balance">
                      {selectedPackagedeatils.originalData?.event_package
                        ?.map((event, index) => {
                          const eventTitle = event.event_Id?.title || "Event";
                          const categoryTitle =
                            event.event_category?.title || "Category";
                          const ticketCount = event.ticketSlot || "0";
                          const ticketType = event.ticketType || "Regular";
                          const visitorText =
                            ticketCount > 1 ? "Visitors" : "Visitor";

                          return `${eventTitle} ${categoryTitle} ${ticketCount} ${visitorText} Pass(${ticketType})`;
                        })
                        .join(" & ")
                      }
                    </p>
                  </div>
                </div>
                {selectedPackagedeatils.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900">Description:</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedPackagedeatils.description}</p>
                  </div>
                )}

                {/* Description Section */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100 flex gap-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Note:</p>
                    <p className="text-sm text-slate-700 mt-1">This package is event-specific, and it has an expiry date.</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white">
                  <p className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Package Price</p>
                  <p className="text-3xl font-bold mt-2">₹{selectedPackagedeatils.price}</p>
                </div>
              </div>
              <DialogFooter className={'px-6 py-5 bg-slate-50 border-t border-slate-100'}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 !text-white font-semibold py-2.5 rounded-lg transition-all duration-300 ease-linear" onClick={() => {handleAction(selectedPackagedeatils); setSelectedPackageDetails(null);}}>Buy Now</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}