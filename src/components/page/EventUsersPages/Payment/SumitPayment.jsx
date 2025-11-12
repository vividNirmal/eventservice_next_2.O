"use client";

import { useState } from "react";
import { Plus, Minus, Check, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { postRequest } from "@/service/viewService";
import { toast } from "sonner";

export function PaymentPopup({ open, onOpenChange, item,Success }) {
  const [count, setCount] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setCount(1);
    }
    onOpenChange(newOpen);
  };

  const totalAmount = item.price * count;

  const handleIncrement = () => setCount((prev) => prev + 1);
  const handleDecrement = () => setCount((prev) => (prev > 1 ? prev - 1 : 1));

  const handleCountChange = (e) => {
    const value = Number.parseInt(e.target.value) || 1;
    setCount(value > 0 ? value : 1);
  };

  async function paymentComplited() {
    const paymentData = {
      total_payable: totalAmount,
      type: item?.type,
      itemId: item?._id,
      slot: count,
    };
    try {
      const responce = await postRequest("create-payment", paymentData);
      if (responce.status == 1) {
        setShowSuccess(true);
        onOpenChange(false);
        handleUserRegister(item.type, item._id);
      }
    } catch (error) {
      toast.error("Pament not compeled pleasce try again");
    }
  }

  async function handleUserRegister(type, id) {
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("id", id);
      const responce = await postRequest("eventuser-event-attandes", formData);
      if (responce.data) {
        toast.success(responce.message);
      }
    } catch (error) {
      console.error("🚨 Error fetching form:", error);
      toast.error("Failed to load form");
    }
  }

  if (showSuccess) {
    return (  
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogTitle></DialogTitle>
        <DialogContent className="border-0 bg-gradient-to-br from-green-50 to-white backdrop-blur-xl shadow-2xl p-0 max-w-md rounded-3xl">
          <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse" />
              <CheckCircle2 className="w-20 h-20 text-green-500 relative z-10" />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Your transaction has been completed successfully
            </p>

            <div className="w-full bg-white border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Package</span>
                <span className="font-semibold text-slate-900">
                  {item.title}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Unit Price</span>
                <span className="font-semibold text-slate-900">
                  ₹{item.price.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Quantity</span>
                <span className="font-semibold text-slate-900">
                  {count} unit(s)
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold text-slate-900">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-green-600">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-green-900">
                  Confirmed
                </p>
                <p className="text-xs text-green-700">
                  A confirmation email has been sent to your registered email
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg mb-3"
            >
              <span className="flex items-center justify-center gap-2">
                Back to Dashboard
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>

            {/* <Button
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-100 text-slate-900 font-semibold py-3 rounded-lg bg-transparent"
            >
              Download Receipt
            </Button> */}

            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 mt-6">
              <Check className="w-4 h-4 text-green-600" />
              <span className="font-medium">
                Secure transaction • 100% protected
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>      
    <DialogTitle></DialogTitle>
      <DialogContent
        className="border border-white/20 bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-xl shadow-2xl p-0 max-w-md overflow-hidden"
        showCloseButton={true}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-40 p-6 border-b border-blue-100/50">
          <h2 className="text-2xl font-bold text-slate-900">Payment Summary</h2>
          <p className="text-sm text-slate-600 mt-1">Complete your purchase</p>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Item Details Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-40 rounded-xl border border-slate-200/60 p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Package
                </p>
                <h3 className="font-semibold text-slate-900 text-base mt-1">
                  {item.title}
                </h3>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">Unit Price</p>
                <p className="text-xl font-bold text-blue-600">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>

              {/* Count Controls - Enhanced */}
              <div className="flex items-center gap-2 bg-white border border-slate-300/60 rounded-lg p-1 shadow-sm">
                <button
                  onClick={handleDecrement}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <Input
                  type="number"
                  min="1"
                  value={count}
                  onChange={handleCountChange}
                  className="w-14 text-center border-0 bg-transparent font-bold text-slate-900 focus:ring-0 p-0"
                />
                <button
                  onClick={handleIncrement}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent" />

          {/* Summary Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">Quantity</p>
              <p className="font-semibold text-slate-900">
                {count} unit{count > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">Unit Price</p>
              <p className="font-semibold text-slate-900">
                ₹{item.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Grand Total - Premium Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100 mb-2">
              Grand Total
            </p>
            <p className="text-4xl font-bold text-white">
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Pay Now Button */}
          <Button
            onClick={paymentComplited}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Proceed to Payment
          </Button>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-1 text-xs text-slate-600">
            <Check className="w-4 h-4 text-green-600" />
            <span>Secure payment guaranteed</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
