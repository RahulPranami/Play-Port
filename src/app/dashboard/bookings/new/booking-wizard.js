"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  lookupCustomer,
  createCustomer,
  createBooking,
  searchCustomers,
} from "@/actions/bookings";
import { createSubscription } from "@/actions/subscriptions";
import { PRICING, DURATION_LABELS } from "@/lib/constants";
import { formatISTDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, UserPlus, Phone, CheckCircle2, Receipt, User } from "lucide-react";

export default function BookingForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  
  // Form State
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [parentName, setParentName] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("ONE_HOUR");
  
  // UI State
  const [customer, setCustomer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [subscriptionResult, setSubscriptionResult] = useState(null);

  // Search as user types
  useEffect(() => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length >= 3) {
      setIsSearching(true);
      const delayDebounceFn = setTimeout(async () => {
        const results = await searchCustomers(cleaned);
        setSearchResults(results);
        setIsSearching(false);
        setShowResults(true);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setShowResults(false);
      if (!customer) {
        setCustomer(null);
        setCustomerName("");
        setParentName("");
      }
    }
  }, [phone, customer]);

  const selectCustomer = (cust) => {
    setCustomer(cust);
    setPhone(cust.phone);
    setCustomerName(cust.name);
    setParentName(cust.parentName || "");
    setShowResults(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/\D/g, "");
    
    if (cleanedPhone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    if (!customer && !customerName.trim()) {
      toast.error("Enter the child's name");
      return;
    }

    startTransition(async () => {
      try {
        let activeCustomer = customer;

        // Create customer if they don't exist
        if (!activeCustomer) {
          const fd = new FormData();
          fd.set("phone", cleanedPhone);
          fd.set("name", customerName.trim());
          fd.set("parentName", parentName.trim());
          const res = await createCustomer(undefined, fd);
          if (res.error) {
            toast.error(res.error);
            return;
          }
          activeCustomer = res.customer;
        }

        // Create booking
        const booking = await createBooking(activeCustomer.id, selectedDuration);
        setBookingResult(booking);

        // Create subscription if monthly
        if (selectedDuration === "MONTHLY") {
          const sub = await createSubscription(activeCustomer.id);
          setSubscriptionResult(sub);
        }

        toast.success("Booking created successfully!");
      } catch (err) {
        toast.error("Failed to create booking");
        console.error(err);
      }
    });
  };

  const resetForm = () => {
    setPhone("");
    setCustomerName("");
    setParentName("");
    setCustomer(null);
    setSelectedDuration("ONE_HOUR");
    setBookingResult(null);
    setSubscriptionResult(null);
  };

  if (bookingResult) {
    return (
      <Card className="max-w-md mx-auto p-8 border shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300 rounded-3xl">
        <div className="inline-flex size-20 items-center justify-center rounded-full bg-green-50 text-green-600 ring-8 ring-green-100/30">
          <CheckCircle2 className="size-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Success!</h2>
          <p className="text-zinc-500 font-medium">
            Booking confirmed for <span className="text-zinc-900 font-bold">{bookingResult.customer.name}</span>
          </p>
        </div>

        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
          <div className="flex justify-between items-center text-sm mb-4">
            <span className="text-zinc-500">Duration</span>
            <Badge variant="secondary" className="font-bold bg-white border">
              {DURATION_LABELS[bookingResult.duration]}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-900 font-bold">Paid Amount</span>
            <span className="text-3xl font-black text-violet-600">₹{bookingResult.amount}</span>
          </div>
        </div>

        {subscriptionResult && (
          <div className="bg-gradient-to-br from-violet-600 to-pink-500 rounded-2xl p-6 text-white text-left shadow-xl shadow-violet-200">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">New Membership</p>
            <p className="text-3xl font-black mt-1 tabular-nums tracking-wider">{subscriptionResult.uniqueCode}</p>
            <p className="text-xs font-bold mt-2 opacity-90">Valid until {formatISTDate(subscriptionResult.endDate)}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button
            variant="outline"
            className="h-14 rounded-xl border-zinc-200 font-bold flex items-center gap-2"
            onClick={() => router.push(`/dashboard/bookings/${bookingResult.id}/receipt`)}
          >
            <Receipt className="size-4" /> Receipt
          </Button>
          <Button
            className="h-14 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800"
            onClick={resetForm}
          >
            Done
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto p-6 md:p-8 border shadow-sm rounded-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">New Booking</h1>
        <p className="text-sm text-zinc-500 mt-1">Register child and select play time</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Phone & Child Details Section */}
        <div className="space-y-6">
          <div className="space-y-2 relative">
            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
              Customer Phone
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="10 digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                onBlur={() => { setTimeout(() => setShowResults(false), 200); }}
                className="h-14 pl-11 rounded-2xl text-lg font-medium border-zinc-200 focus:border-violet-500 focus:ring-violet-500/20"
                required
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="size-4 border-2 border-violet-600/20 border-t-violet-600 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Existing Customer Suggestions */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                <div className="bg-zinc-50 px-4 py-2 border-b">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select Existing Child</span>
                </div>
                {searchResults.map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); selectCustomer(cust); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-violet-50 transition-colors text-left group border-b last:border-0"
                  >
                    <div>
                      <p className="font-bold text-zinc-900">{cust.name}</p>
                      <p className="text-xs text-zinc-500">{cust.phone}</p>
                    </div>
                    <CheckCircle2 className="size-4 text-zinc-300 opacity-0 group-hover:opacity-100 group-hover:text-violet-500 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
                Child's Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="Full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`h-14 pl-11 rounded-2xl text-lg font-medium border-zinc-200 focus:border-violet-500 focus:ring-violet-500/20 ${customer ? 'bg-zinc-50' : ''}`}
                  readOnly={!!customer}
                  required
                />
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentName" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
                Parent's Name
              </Label>
              <div className="relative">
                <Input
                  id="parentName"
                  placeholder="Full name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className={`h-14 pl-11 rounded-2xl text-lg font-medium border-zinc-200 focus:border-violet-500 focus:ring-violet-500/20 ${customer ? 'bg-zinc-50' : ''}`}
                  readOnly={!!customer}
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
              </div>
            </div>
          </div>
          
          {customer && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => { setCustomer(null); setCustomerName(""); setParentName(""); }}
                className="text-xs font-bold text-violet-600 hover:text-violet-700 underline underline-offset-4"
              >
                Clear Selected & Register New
              </button>
            </div>
          )}
        </div>

        {/* Duration Selection Section */}
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
            Play Duration
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(PRICING).map(([key, price]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDuration(key)}
                className={`relative flex flex-col p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedDuration === key 
                  ? 'border-violet-600 bg-violet-50/50 ring-4 ring-violet-500/10' 
                  : 'border-zinc-100 hover:border-zinc-200 bg-white'
                }`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${selectedDuration === key ? 'text-violet-600' : 'text-zinc-400'}`}>
                  {DURATION_LABELS[key]}
                </span>
                <span className="text-2xl font-black text-zinc-900">₹{price}</span>
                {selectedDuration === key && (
                  <CheckCircle2 className="absolute top-4 right-4 size-5 text-violet-600 animate-in zoom-in" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Section */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={pending}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white text-lg font-black shadow-xl shadow-violet-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? (
              <div className="flex items-center gap-2">
                <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Confirming...</span>
              </div>
            ) : (
              `Create Booking — ₹${PRICING[selectedDuration]}`
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
