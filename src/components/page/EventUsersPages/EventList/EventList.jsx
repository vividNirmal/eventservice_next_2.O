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

export default function UserEventList() {
  const { userType } = useSelector((state) => state.eventUser);
  const [loading, setLoading] = useState(true);
  const [exhibitor, setExhibitor] = useState([]);
  const [categorizedEvents, setCategorizedEvents] = useState([]);
  const [attendees, setAttendess] = useState([]);
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
          response.data.groupedData.map((item) => {
            if (item.userType == "Exhibitor") {
              setExhibitor(item.data);
            }
            if (item.userType == "Event Attendees") {
              groupEventsByCategory(item.data);
            }
          });
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

  const groupEventsByCategory = (events) => {
    const categoryMap = {};

    events.forEach((event) => {
      console.log(event);
      
      const category = event.eventId?.event_category;
      if (category) {        
        
        const categoryId = category._id;
        if (!categoryMap[categoryId]) {
          categoryMap[categoryId] = {
            category: category,
            status: event?.approved,
            events: [],
          };
        }
        categoryMap[categoryId].events.push(event);
      }
    });

    setCategorizedEvents(Object.values(categoryMap));
  };

  const handleCategorySelect = (categoryData) => {
    setSelectedCategory(categoryData);
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
    <div className="">
      <div className="max-w-7xl mx-auto px-4 py-12 relative -top-20 z-20">
        {/* Event Attendees View */}
        {userType?.typeName === "Event Attendees" && (
          <section className="w-full">
            <h2 className="text-base lg:text-lg 2xl:text-xl font-bold text-foreground mb-6 bg-white w-fit px-4 py-2 rounded-md">Available Packages</h2>
            <div className="space-y-4">
              {attendees?.map((pkg) => (
                <ExhibitorCard key={pkg._id} title={pkg.title} description={pkg.description} price={pkg.price} currency = {pkg.currency} onBuyNow={() => handleUserRegister(pkg.type, pkg._id)} />
              ))}
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
                      key={item.category._id}
                      category={item.category}
                      eventCount={item.events.length}
                      status={item.status}
                      onApply={() => handleCategorySelect(item)}
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
    </div>
  );
}
