"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createCustomer,
  createBooking,
  searchCustomers,
} from "@/actions/bookings";
import { createSubscription, validateSubscription } from "@/actions/subscriptions";
import { PRICING, DURATION_LABELS } from "@/lib/constants";
import { formatISTDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, UserPlus, Phone, CheckCircle2, Receipt, User, Ticket } from "lucide-react";

export default function BookingForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  
  // Form State
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [parentName, setParentName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("ONE_HOUR");
  
  // UI State
  const [customer, setCustomer] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [subscriptionResult, setSubscriptionResult] = useState(null);

  // Search by Phone or Name
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
        setActiveSub(null);
      }
    }
  }, [phone, customer]);

  // Validate Coupon Code
  const handleCouponCheck = async () => {
    if (!couponCode) return;
    setIsSearching(true);
    const result = await validateSubscription(couponCode);
    setIsSearching(false);
    
    if (result.valid) {
      setCustomer(result.subscription.customer);
      setPhone(result.subscription.customer.phone);
      setCustomerName(result.subscription.customer.name);
      setParentName(result.subscription.customer.parentName || "");
      setActiveSub(result.subscription);
      toast.success("Monthly Pass Validated!");
    } else {
      toast.error(result.error || "Invalid Code");
    }
  };

  const selectCustomer = (cust) => {
    setCustomer(cust);
    setPhone(cust.phone);
    setCustomerName(cust.name);
    setParentName(cust.parentName || "");
    setActiveSub(cust.subscriptions?.[0] || null);
    setShowResults(false);
  };

  const handleSubmit = async (e, isCheckIn = false) => {
    if (e) e.preventDefault();
    
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
        // If it's a monthly check-in, set amount to 0
        const duration = isCheckIn ? "MONTHLY" : selectedDuration;
        const amount = isCheckIn ? 0 : PRICING[duration];
        
        const booking = await createBooking(activeCustomer.id, duration, amount);
        setBookingResult(booking);

        // Create subscription if buying monthly pass
        if (selectedDuration === "MONTHLY" && !isCheckIn) {
          const sub = await createSubscription(activeCustomer.id);
          setSubscriptionResult(sub);
        }

        toast.success(isCheckIn ? "Check-in Successful!" : "Booking created!");
      } catch (err) {
        toast.error("Process failed");
        console.error(err);
      }
    });
  };

  const resetForm = () => {
    setPhone("");
    setCustomerName("");
    setParentName("");
    setCouponCode("");
    setCustomer(null);
    setActiveSub(null);
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
            {bookingResult.amount === 0 ? "Check-in" : "Booking"} confirmed for <span className="text-zinc-900 font-bold">{bookingResult.customer.name}</span>
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
            <span className="text-zinc-900 font-bold">Total Paid</span>
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
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Entry Portal</h1>
        <p className="text-sm text-zinc-500 mt-1">Check-in monthly members or create new bookings</p>
      </div>

      <div className="space-y-8">
        {/* Coupon Code / Monthly Pass Entry */}
        <div className="space-y-2">
          <Label htmlFor="coupon" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
            Monthly Pass Code
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="coupon"
                placeholder="Enter unique code (e.g. PORT-XXXX)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="h-12 pl-11 rounded-xl font-mono"
              />
              <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            </div>
            <Button 
              type="button" 
              onClick={handleCouponCheck}
              disabled={!couponCode || isSearching}
              className="h-12 px-6 rounded-xl bg-zinc-900 text-white font-bold"
            >
              Check
            </Button>
          </div>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-zinc-100"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-zinc-300 uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-zinc-100"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Phone & Child Details Section */}
          <div className="space-y-6">
            <div className="space-y-2 relative">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
                Parent Phone
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
                  <div className="bg-zinc-50 px-4 py-2 border-b flex justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select Registered Child</span>
                    <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">({searchResults.length} found)</span>
                  </div>
                  {searchResults.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); selectCustomer(cust); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-violet-50 transition-colors text-left group border-b last:border-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-zinc-900">{cust.name}</p>
                          {cust.subscriptions?.length > 0 && (
                            <Badge className="bg-green-100 text-green-700 text-[9px] h-4 py-0">ACTIVE PASS</Badge>
                          )}
                        </div>
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
              <div className="flex justify-between items-center bg-violet-50 p-3 rounded-xl border border-violet-100">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-violet-900 leading-none">{customerName}</p>
                    {activeSub && <p className="text-[10px] font-bold text-violet-500 uppercase mt-0.5">Monthly Member</p>}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => { setCustomer(null); setCustomerName(""); setParentName(""); setActiveSub(null); }}
                  className="text-xs font-bold text-violet-600 hover:text-violet-700 underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Logic: If activeSub exists, show Check-in. Otherwise show Pricing. */}
          {activeSub ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Active Monthly Pass</p>
                    <p className="text-2xl font-black text-green-800 tabular-nums">{activeSub.uniqueCode}</p>
                  </div>
                  <Badge className="bg-green-200 text-green-800 border-green-300">VALID</Badge>
                </div>
                <p className="text-xs text-green-700 font-medium">Valid until {formatISTDate(activeSub.endDate)}</p>
              </div>
              
              <Button
                type="button"
                onClick={() => handleSubmit(null, true)}
                disabled={pending}
                className="w-full h-16 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-lg font-black shadow-xl transition-all active:scale-[0.98]"
              >
                {pending ? "Processing..." : "Member Check-in (₹0)"}
              </Button>
              
              <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">or purchase new</p>
              
              {/* Show small pricing for upgrade/new session if needed */}
              <div className="grid grid-cols-2 gap-2 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                <Button variant="outline" type="button" onClick={() => { setActiveSub(null); setSelectedDuration("HALF_HOUR"); }} className="h-10 text-xs">30 Mins</Button>
                <Button variant="outline" type="button" onClick={() => { setActiveSub(null); setSelectedDuration("ONE_HOUR"); }} className="h-10 text-xs">60 Mins</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
                  Select Play Duration
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
          )}
        </form>
      </div>
    </Card>
  );
}
