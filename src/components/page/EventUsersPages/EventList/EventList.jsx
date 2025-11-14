"use client";
import { useEffect, useState } from "react";
import { ExhibitorCard, CategoryCard } from "./EventAttendeesCard";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "../../eventAdminpages/package/addPackage";
import { PaymentPopup } from "../Payment/SumitPayment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
            <h2 className="text-base lg:text-lg 2xl:text-xl font-bold text-foreground">
              Available Packages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-4 mt-8">
              <h2 className="text-base lg:text-lg 2xl:text-xl font-bold text-foreground col-span-full mb-0">
                Combo Show Registartion
              </h2>
              {attendees?.combo_tickets.map((pkg) => (
                <div
                  className="flex flex-col bg-white p-4 rounded-xl"
                  key={pkg._id}
                >
                  <img
                    src="/concert-banner.webp"
                    className="rounded-lg w-full h-42 max-w-full object-cover object-center"
                    alt="ticket img"
                  />
                  <div className="pt-4 flex flex-col gap-4">
                    <div className="flex flex-col">
                      <h3 className="text-base lg:text-lg xl:text-xl font-bold text-foreground mb-0.5">
                        {pkg.title}
                      </h3>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                    </div>
                    <Button
                      variant={"ghost"}
                      onClick={() => setSelectedPackageDetails(pkg)}
                      className="  transition-colors text-sm font-medium cursor-pointer"
                    >
                      View More Details
                    </Button>
                    <Button
                      className={
                        "p-4 rounded-md bg-white text-black border border-solid border-blue-500 hover:text-white hover:border-blue-600 hover:bg-blue-600"
                      }
                      onClick={() => handleAction(pkg)}
                    >
                      Visitor Registration{" "}
                      {`${getCurrencySymbol(pkg.currency || "INR")} ${
                        pkg.price
                      }`}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-2 mt-5">
            <h3 className="col-span-full">Single Show Registartion</h3>
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
              <h2 className="text-base lg:text-lg 2xl:text-xl font-bold text-foreground mb-6 bg-white w-fit px-4 py-2 rounded-md">
                Event Shows
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <Dialog
        open={!!selectedPackagedeatils}
        onOpenChange={() => setSelectedPackageDetails(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedPackagedeatils?.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Package Details
            </DialogDescription>
          </DialogHeader>

          {selectedPackagedeatils && (
            <div className="space-y-4 mt-4">
              {/* Description Section */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 leading-relaxed">
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
                        .join(" & ")}
                    </p>
                  </div>
                </div>

                {selectedPackagedeatils.description && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Description:
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedPackagedeatils.description}
                    </p>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Note:
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    This package is event-specific, and it has an expiry date.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full py-3 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 font-medium flex items-center justify-center gap-2"
                onClick={() => {
                  handleAction(selectedPackagedeatils);
                  setSelectedPackageDetails(null);
                }}
              >
                <span className="text-lg">₹{selectedPackagedeatils.price}</span>
                <span>|</span>
                <span>Buy Now</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
