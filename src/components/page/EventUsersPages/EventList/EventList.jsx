"use client";
import { useEffect, useState } from "react";
import {
  EventAttendeesCard,
  ExhibitorCard,
  CategoryCard,
} from "./EventAttendeesCard";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "../../eventAdminpages/package/addPackage";

export default function UserEventList() {
  const { userType } = useSelector((state) => state.eventUser);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categorizedEvents, setCategorizedEvents] = useState([]);
  const [attendees, setAttendess] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [buttonLoader, setButtonLoader] = useState(false);

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

  async function handleUserRegister(type, id) {
    setButtonLoader(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("id", id);
      const responce = await postRequest("eventuser-event-attandes", formData);
      if (responce.data) {
        toast.success(responce.message);
        setButtonLoader(false);
      }
    } catch (error) {
      console.error("🚨 Error fetching form:", error);
      toast.error("Failed to load form");
    }
  }

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
            <h2 className="text-base lg:text-lg 2xl:text-xl font-bold text-foreground">Available Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-2">
              <h3 className="col-span-full">Single Show Registartion</h3>
              {attendees?.event_tickets.map((pkg) => (
                <ExhibitorCard
                  key={pkg._id}
                  title={pkg.title}
                  description={pkg.description}
                  price={pkg.price}
                  currency={pkg.currency}
                  dateRange={pkg.dataRange}
                  onBuyNow={() => handleUserRegister(pkg.type, pkg._id)}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-4 mt-8">
            <h2 className="text-base lg:text-lg 2xl:text-xl font-bold text-foreground col-span-full mb-0">Combo Show Registartion</h2>
            {
              attendees?.combo_tickets.map((pkg) => (
                <div className="flex flex-col bg-white p-4 rounded-xl" key={pkg._id}>
                  <img src="/concert-banner.webp" className="rounded-lg w-full h-42 max-w-full object-cover object-center" alt="ticket img" />
                  <div className="pt-4 flex flex-col gap-4">
                    <div className="flex flex-col">
                      <h3 className="text-base lg:text-lg xl:text-xl font-bold text-foreground mb-0.5">{pkg.title}</h3>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                    </div>
                    <Button className={'p-4 rounded-md bg-white text-black border border-solid border-blue-500 hover:text-white hover:border-blue-600 hover:bg-blue-600'}>Visitor Registration {`${getCurrencySymbol(pkg.currency || 'INR')} ${pkg.price}`}</Button>
                  </div>
                </div>
              ))
            }

          </div>
        </section>
      )}

      {/* Exhibitor View - Category wise */}
      {userType?.typeName === "Exhibitor" && (
        <section className="w-full">
          {!selectedCategory ? (
            // Show Categories
            <>
              <h2 className="text-base lg:text-lg 2xl:text-xl font-bold text-foreground mb-6 bg-white w-fit px-4 py-2 rounded-md">Event Categories</h2>
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
          ) : (
            // Show Events of Selected Category
            <>
              <div className="mb-6 flex items-center gap-4">
                <button
                  onClick={handleBackToCategories}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back to Categories
                </button>
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedCategory.category.title} - Events
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCategory.events?.map((show) => (
                  <EventAttendeesCard
                    key={show._id}
                    title={show.eventId?.event_title}
                    description={show.eventId?.event_description}
                    onApply={() => console.log(show._id)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
