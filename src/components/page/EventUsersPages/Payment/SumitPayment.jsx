"use client";

import { useState } from "react";
import { Plus, Minus, Check, CheckCircle2, ArrowRight, CircleCheckBig, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { postRequest } from "@/service/viewService";
import { toast } from "sonner";

export function PaymentPopup({ open, onOpenChange, item, Success }) {
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
        <DialogContent className="flex flex-col h-full max-h-[70svh] sm:max-h-[68svh] w-full sm:max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden p-0 border-0 gap-0 outline-0 [&>button]:!text-white">
          <DialogHeader className="gap-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 p-4">
            <div className="bg-white rounded-full p-2 w-fit">
              <CircleCheckBig className="size-7 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white mt-2">Payment Successful!</DialogTitle>
            <DialogDescription className="text-green-100 text-sm">Your transaction has been completed successfully</DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-3 h-20 grow overflow-auto custom-scroll">
            <div className="bg-slate-50 rounded-xl p-3 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-600 text-sm font-medium">Package</span>
                <span className="font-semibold text-sm text-slate-900">{item.title}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-600 text-sm font-medium">Unit Price</span>
                <span className="font-semibold text-sm text-slate-900">₹{item.price.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-600 text-sm font-medium">Quantity</span>
                <span className="font-semibold text-sm text-slate-900">{count} unit(s)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-bold text-sm">Total Amount</span>
                <span className="font-bold text-base text-green-600">₹{(item.price * count).toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex gap-3">
              <CircleCheckBig className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 text-sm">Confirmed</p>
                <p className="text-green-700 text-sm mt-1">A confirmation email has been sent to your registered email</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-green-600 text-sm bg-green-50 rounded-lg px-4 py-3">
              <Shield className="size-4 flex-shrink-0" />
              <span className="font-medium">Secure transaction • 100% protected</span>
            </div>
          </div>
          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
            <Button onClick={() => setShowSuccess(false)} className="w-full border-green-600 bg-green-600 hover:bg-green-700 text-white hover:text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
              <span className="flex items-center justify-center gap-2">
                Back to Dashboard
                <Zap className="size-4" />
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col h-full max-h-[70svh] sm:max-h-[68svh] p-0 gap-0 w-full sm:max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border-0 outline-0" showCloseButton={true}>
        <DialogHeader className="p-4 border-b border-slate-100 gap-1">
          <DialogTitle className="text-2xl font-bold text-slate-900">Payment Summary</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">Complete your purchase</DialogDescription>
        </DialogHeader>
        {/* Content Section */}
        <div className="p-4 space-y-4 h-20 grow overflow-auto custom-scroll">
          {/* Item Details Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-blue-600 tracking-wider">Package</p>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{item.title}</h3>
              </div>
              <div className="bg-white rounded-lg p-2 border border-blue-100"><div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-md flex items-center justify-center text-white text-sm font-bold">₹</div></div>
            </div>

            {/* Price Row */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-600 font-medium">Unit Price</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">₹{item.price.toLocaleString("en-IN")}</p>
              </div>

              {/* Count Controls - Enhanced */}
              <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
                <button onClick={handleDecrement} className="p-1 hover:bg-slate-100 rounded transition-colors" aria-label="Decrease quantity">
                  <Minus className="size-4 text-slate-600" />
                </button>
                <Input type="number" min="1" value={count} onChange={handleCountChange} className="w-8 !h-6 !p-0 !text-center border-0 shadow-none font-semibold text-slate-900" />
                <button onClick={handleIncrement} className="p-1 hover:bg-slate-100 rounded transition-colors" aria-label="Increase quantity">
                  <Plus className="size-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Summary Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-600 font-medium">Quantity</p>
              <p className="text-slate-900 font-semibold">
                {count} unit{count > 1 ? "s" : ""}
              </p>
            </div>
            {/* Divider */}
            <div className="h-px bg-slate-100" />
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-600 font-medium">Unit Price</p>
              <p className="text-slate-900 font-semibold">
                ₹{item.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Grand Total - Premium Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white">
            <p className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Grand Total</p>
            <p className="text-3xl font-bold mt-2">₹{totalAmount.toLocaleString("en-IN")}</p>
          </div>
          {/* Trust Badge */}
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-3">
            <Shield className="size-4 flex-shrink-0" />
            <span>Secure payment guaranteed</span>
          </div>
        </div>
        <DialogFooter className={'px-6 py-5 bg-slate-50 border-t border-slate-100'}>
          {/* Pay Now Button */}
          <Button onClick={paymentComplited} className="w-full bg-blue-600 hover:bg-blue-700 !text-white font-semibold py-2.5 rounded-lg transition-all">Proceed to Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
