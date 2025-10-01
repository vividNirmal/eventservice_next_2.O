"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Shadcn Input
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import { userGetRequest, userPostRequest } from "@/service/viewService";
import { toast } from "sonner";
import { Bot, SendHorizonal } from "lucide-react"
import { useFormik } from "formik"; // Import Formik

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, how can I help you today?" },
  ]);
  const [selectdata, setSelectdata] = useState({
    category: null,
    city: null,
    mobile: "",
  });
  const [cityList, setCityList] = useState([]);
  const [awaitingNewSearch, setAwaitingNewSearch] = useState(false);
  const [massgesLoader, setMassgesLoader] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const footerdate = useSelector((state) => state.setting.footerdata);
  const categories = footerdate?.category_list || []

  // Formik for input management
  const formik = useFormik({
    initialValues: {
      message: "",
    },
    onSubmit: (values) => {
      handleSend(values.message);
      formik.resetForm();
    },
  });

  // Reset state when dialog closes
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset all state when closing
      setMessages([{ from: "bot", text: "Hi, how can I help you today?" }]);
      setSelectdata({ category: null, city: null, mobile: "" });
      setAwaitingNewSearch(false);
      setMassgesLoader(false);
      formik.resetForm();
    }
  };

  // Fetch city list
  const fetchCityList = async () => {
    try {
      const res = await userGetRequest("get-form-city-list");
      setCityList(res?.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Handle scrolling behavior
  const handleScroll = (e) => {
    const element = e.currentTarget;
    const tolerance = 100;
    const atBottom =
      element.scrollHeight - element.scrollTop <=
      element.clientHeight + tolerance;
    setAutoScroll(atBottom);
  };

  // Handle message sending
  const handleSend = (input) => {
    if (!input?.trim()) return;

    // New search flow
    if (awaitingNewSearch) {
      setMessages((prev) => [...prev, { from: "user", text: input }]);
      setSelectdata({ category: null, city: null, mobile: "" });
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Please select category to get listing.",
            isList: true,
            listItems: categories,
          },
        ]);
        scrollToBottom();
      }, 300);
      setAwaitingNewSearch(false);
      return;
    }

    // First message flow
    if (messages.length === 1) {
      setMassgesLoader(true);
      setMessages((prev) => [...prev, { from: "user", text: input }]);
      fetchCityList();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Please select category to get listing.",
            isList: true,
            listItems: categories,
          },
        ]);
        setMassgesLoader(false);
      }, 500);
      return;
    }

    // Continue with existing conversation
    processMessage(input);
  };

  // Process user messages based on conversation state
  const processMessage = (input) => {
    const lastMessage = messages[messages.length - 1];
    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);

    // Category selection
    if (lastMessage.isList && !selectdata.category) {
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === input.toLowerCase()
      );

      if (matchedCategory) {
        setSelectdata({ ...selectdata, category: matchedCategory });
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              from: "bot",
              text: "Please enter the city to get a listing of that city.",
            },
          ]);
          scrollToBottom();
        }, 300);
      } else {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              from: "bot",
              text: "Invalid category. Please select a category from the list.",
              isList: true,
              listItems: categories,
            },
          ]);
          scrollToBottom();
        }, 300);
      }
      return;
    }

    // City selection
    if (
      lastMessage.text.includes("Please enter the city") ||
      lastMessage.text.includes("City not found")
    ) {
      const matchedCity = cityList.find(
        (c) => c.name.toLowerCase() === input.toLowerCase()
      );

      if (matchedCity) {
        setSelectdata({ ...selectdata, city: matchedCity });
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { from: "bot", text: "Please enter the mobile number." },
          ]);
          scrollToBottom();
        }, 300);
      } else {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              from: "bot",
              text: "City not found. Please enter a valid city name.",
            },
          ]);
          scrollToBottom();
        }, 300);
      }
      return;
    }

    // Mobile number validation
    if (
      lastMessage.text.includes("Please enter the mobile number") ||
      lastMessage.text.includes("Please enter a valid 10-digit mobile number")
    ) {
      if (!/^[0-9]{10}$/.test(input)) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              from: "bot",
              text: "Please enter a valid 10-digit mobile number.",
            },
          ]);
          scrollToBottom();
        }, 300);
        return;
      }

      // Update state and submit
      setSelectdata((prev) => {
        const newData = { ...prev, mobile: input };
        submitData(newData);
        return newData;
      });
    }
  };

  // Submit data to API
  const submitData = async (data) => {
    setMessages((prev) => [...prev, { from: "bot", text: "Thinking..." }]);

    try {
      const formData = new FormData();
      formData.append("mobile_number", data.mobile);
      formData.append("location", data.city.name);
      formData.append("category", data.category.unique_id);

      const res = await userPostRequest("get-chatboat-listing", formData);

      // Process response
      const newMessages = messages.filter((msg) => msg.text !== "Thinking...");
      let listingData = [];
      let populatedData = [];

      res.data.forEach((item) => {
        if (item?.is_city_select_all) {
          populatedData = [...populatedData, ...item?.listing_id];
        } else {
          listingData = [...listingData, ...item?.listing_id];
        }
      });

      if (listingData.length === 0 && populatedData.length === 0) {
        setMessages([
          ...newMessages,
          { from: "bot", text: "No listing found." },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            from: "bot",
            text: "Here is the listing data.",
            finalListing: true,
            listItems: listingData,
            popularList: populatedData,
          },
        ]);
      }

      setAwaitingNewSearch(true);
      scrollToBottom();
    } catch (error) {
      const newMessages = messages.filter((msg) => msg.text !== "Thinking...");
      setMessages([
        ...newMessages,
        {
          from: "bot",
          text: "Sorry, something went wrong. Please try again later.",
        },
      ]);
    }
  };

  // Category selection handler
  const selectCategory = (category) => {
    setMessages((prev) => [...prev, { from: "user", text: category.name }]);
    setSelectdata({ ...selectdata, category });

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Please enter the city to get a listing of that city.",
        },
      ]);
      scrollToBottom();
    }, 500);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-zinc-950 text-white hover:bg-zinc-950 hover:text-white min-w-24 hover:scale-103 active:scale-95 active:shadow-none">Chat</Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-md bg-white rounded-2xl md:rounded-2xl p-0 border-0 overflow-clip sm:max-w-[420px] h-[80vh] max-h-[700px] left-[initial] top-[initial] bottom-4 right-4 translate-0 [&>button]:text-white [&>button]:z-[2]">
        <div className="flex flex-col h-full"> 
          {/* Header */}
          <DialogHeader className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white p-4 py-3 flex items-center justify-between overflow-hidden">
            <DialogTitle className="text-xl relative w-full z-[2]">
              <div className="flex items-center justify-normal">
                <Bot />
                <span className="ml-2">Chat with Bot</span>
              </div>
            </DialogTitle>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <DialogDescription className="hidden" />
          </DialogHeader>

          {/* Messages Container */}
          <div className="h-56 grow p-2">
            <ul className="overflow-auto h-full p-2 flex flex-col gap-2.5 custom-scroll" onScroll={handleScroll}>
              {massgesLoader && (
                <li className="flex items-center justify-center">loading...</li>
              )}
              {messages.map((item, index) => (
                <li
                  key={index}
                  className={`bg-gray-100 text-zinc-800 text-xs px-3 p-2 w-auto rounded-xl ${
                    item.from === "bot"
                      ? "mr-auto rounded-bl-xs"
                      : "ml-auto rounded-br-xs"
                  }`}
                >
                  <div className="text-md font-medium text-zinc-600">
                    {item.text}
                  </div>

                  {item.isList && (
                    <div className="pt-3 pb-1.5">
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {item.listItems?.map((category, idx) => (
                          <Button
                            key={idx}
                            onClick={() => selectCategory(category)}
                            className="bg-blue-500 text-white text-[11px] py-1 rounded-lg hover:bg-blue-600"
                          >
                            {category?.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.finalListing &&
                    item.popularList &&
                    item.popularList.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-black max-w-full w-full whitespace-nowrap overflow-hidden text-ellipsis mb-1.5">
                          Popular Vendor
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.popularList.map((category, idx) => (
                            <a
                              key={idx}
                              href={`tel:${category.phone_number}`}
                              className="bg-white text-black text-xs px-3 py-2 rounded-lg border border-solid border-blue-500 group hover:bg-blue-600 hover:text-white max-w-80 w-full whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-200 ease-in"
                            >
                              {category?.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  {item.finalListing &&
                    item.listItems &&
                    item.listItems.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-black max-w-full w-full mb-1.5">
                          Rental Vendor
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {item.listItems.map((category, idx) => (
                            <a
                              key={idx}
                              href={`tel:${category.phone_number}`}
                              className="bg-white text-black text-xs px-3 py-2 rounded-lg border border-solid border-blue-500 group hover:bg-blue-600 hover:text-white max-w-80 w-full whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-200 ease-in"
                            >
                              {category?.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </li>
              ))}
              <div ref={messagesEndRef} />
            </ul>
          </div>

          {/* Input Area with Formik */}
          <form onSubmit={formik.handleSubmit} className="flex items-center bg-white w-full relative p-2">
            <Input
              id="message"
              name="message"
              type="text"
              className="w-full bg-white px-4 pr-10 h-10 py-2 border border-solid border-gray-300 rounded-full text-xs outline-none"
              placeholder="Type your message here..."
              autoComplete="off"
              {...formik.getFieldProps('message')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  formik.handleSubmit();
                }
              }}
            />
            <Button
              type="submit"
              className="ml-2 bg-[#007bff] text-white rounded-full p-1 absolute top-2/4 transform -translate-y-2/4 right-3.5 size-8 flex items-center justify-center cursor-pointer"
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
