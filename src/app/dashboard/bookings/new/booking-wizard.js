"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, UserPlus, Phone } from "lucide-react";

const STEPS = { PHONE: 0, CUSTOMER: 1, DURATION: 2, SUCCESS: 3 };

export default function BookingWizard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(STEPS.PHONE);
  const [phone, setPhone] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [newName, setNewName] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [booking, setBooking] = useState(null);
  const [subscription, setSubscription] = useState(null);

  // Search as user types
  useEffect(() => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length >= 3) {
      const delayDebounceFn = setTimeout(async () => {
        const results = await searchCustomers(cleaned);
        setSearchResults(results);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [phone]);

  const selectCustomer = (cust) => {
    setCustomer(cust);
    setPhone(cust.phone);
    setSearchResults([]);
    setIsNewCustomer(false);
    setStep(STEPS.DURATION);
  };

  const handlePhoneLookup = useCallback(() => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    startTransition(async () => {
      const result = await lookupCustomer(cleaned);
      if (result) {
        setCustomer(result);
        setIsNewCustomer(false);
        setStep(STEPS.DURATION);
      } else {
        setIsNewCustomer(true);
        setStep(STEPS.CUSTOMER);
      }
    });
  }, [phone]);

  const handleCreateCustomer = useCallback(() => {
    if (!newName.trim()) {
      toast.error("Enter the child's name");
      return;
    }
    const cleaned = phone.replace(/\D/g, "");
    const fd = new FormData();
    fd.set("phone", cleaned);
    fd.set("name", newName.trim());
    startTransition(async () => {
      const result = await createCustomer(undefined, fd);
      if (result.error) {
        toast.error(result.error);
        if (result.customer) {
          setCustomer(result.customer);
          setIsNewCustomer(false);
          setStep(STEPS.DURATION);
        }
        return;
      }
      setCustomer(result.customer);
      setIsNewCustomer(false);
      setStep(STEPS.DURATION);
      toast.success("Customer registered!");
    });
  }, [phone, newName]);

  const handleDurationSelect = useCallback((duration) => {
    setSelectedDuration(duration);
    setConfirmOpen(true);
  }, []);

  const handleConfirmBooking = useCallback(() => {
    if (!customer || !selectedDuration) return;
    startTransition(async () => {
      try {
        const result = await createBooking(customer.id, selectedDuration);
        setBooking(result);

        if (selectedDuration === "MONTHLY") {
          const sub = await createSubscription(customer.id);
          setSubscription(sub);
        }

        setConfirmOpen(false);
        setStep(STEPS.SUCCESS);
        toast.success("Booking confirmed!");
      } catch {
        toast.error("Failed to create booking. Please try again.");
      }
    });
  }, [customer, selectedDuration]);

  const handleReset = useCallback(() => {
    setStep(STEPS.PHONE);
    setPhone("");
    setCustomer(null);
    setNewName("");
    setIsNewCustomer(false);
    setSelectedDuration(null);
    setBooking(null);
    setSubscription(null);
    setSearchResults([]);
  }, []);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">New Booking</h1>
          <p className="text-sm text-zinc-500">
            {step === STEPS.PHONE && "Enter the customer's phone number"}
            {step === STEPS.CUSTOMER && "Register new customer"}
            {step === STEPS.DURATION && "Select play duration"}
            {step === STEPS.SUCCESS && "Booking complete!"}
          </p>
        </div>
        {step > STEPS.PHONE && step < STEPS.SUCCESS && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            Start Over
          </Button>
        )}
      </div>

      {/* Step 1: Phone Input & Search */}
      {step === STEPS.PHONE && (
        <Card className="p-6 border shadow-none space-y-4 relative overflow-visible">
          <div className="space-y-2 relative">
            <Label htmlFor="phone" className="text-base font-semibold">
              Phone Number
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="Start typing number..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePhoneLookup()}
                className="text-lg h-14 pl-11"
                autoFocus
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-zinc-50 px-4 py-2 border-b">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Existing Customers
                  </span>
                </div>
                {searchResults.map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => selectCustomer(cust)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-violet-50 transition-colors text-left group"
                  >
                    <div>
                      <p className="font-bold text-zinc-900">{cust.name}</p>
                      <p className="text-sm text-zinc-500">{cust.phone}</p>
                    </div>
                    <Search className="size-4 text-zinc-300 group-hover:text-violet-500 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={handlePhoneLookup}
            disabled={pending || phone.replace(/\D/g, "").length < 10}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-violet-200 disabled:shadow-none transition-all active:scale-95"
          >
            {pending ? "Searching..." : "Next Step"}
          </Button>
        </Card>
      )}

      {/* Step 2: New Customer Registration */}
      {step === STEPS.CUSTOMER && isNewCustomer && (
        <Card className="p-6 border shadow-none space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <UserPlus className="size-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                New Customer
              </p>
              <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                We couldn't find {phone}. Please register the child to continue.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              Child's Name
            </Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateCustomer()}
              className="text-lg h-14"
              autoFocus
            />
          </div>
          <Button
            onClick={handleCreateCustomer}
            disabled={pending}
            className="w-full h-14 text-lg font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-all active:scale-95"
          >
            {pending ? "Registering..." : "Register & Continue"}
          </Button>
        </Card>
      )}

      {/* Step 3: Duration Selection */}
      {step === STEPS.DURATION && customer && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          {/* Customer Card */}
          <Card className="p-4 border shadow-none bg-violet-50 border-violet-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-violet-900 text-lg leading-tight">
                  {customer.name}
                </p>
                <p className="text-sm text-violet-600 font-medium">{customer.phone}</p>
              </div>
              <div className="text-right">
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs font-bold uppercase tracking-wider">
                  {customer.totalVisits}{" "}
                  {customer.totalVisits === 1 ? "visit" : "visits"}
                </Badge>
                {customer.subscriptions?.length > 0 && (
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-1">
                    Active Member
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Duration Buttons */}
          <div className="space-y-3">
            {Object.entries(PRICING).map(([key, price]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDurationSelect(key)}
                disabled={pending}
                className="w-full min-h-[80px] rounded-2xl border-2 border-zinc-200 bg-white px-6 py-4 text-left transition-all hover:border-violet-400 hover:bg-violet-50 hover:shadow-xl hover:shadow-violet-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-between group"
              >
                <div>
                  <p className="text-lg font-bold text-zinc-900 group-hover:text-violet-900 transition-colors">
                    {DURATION_LABELS[key]}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {key === "MONTHLY"
                      ? "Unlimited play for 30 days"
                      : `Single play session`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-violet-600">
                    ₹{price}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === STEPS.SUCCESS && booking && (
        <Card className="p-8 border-2 border-green-100 shadow-2xl shadow-green-50 text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="inline-flex size-20 items-center justify-center rounded-full bg-green-50 text-green-600 ring-8 ring-green-100/50">
            <svg
              className="size-10"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900">
              Booking Confirmed!
            </h2>
            <p className="text-zinc-500 font-medium mt-1">
              {booking.customer.name} — {DURATION_LABELS[booking.duration]}
            </p>
            <p className="text-3xl font-black text-violet-600 mt-4">
              ₹{booking.amount}
            </p>
          </div>
          {subscription && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-2xl p-5 text-left shadow-sm">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">
                New Membership
              </p>
              <p className="text-2xl font-black text-green-700 mt-1 tabular-nums">
                {subscription.uniqueCode}
              </p>
              <p className="text-xs text-green-600/80 font-bold mt-1">
                Valid until {formatISTDate(subscription.endDate)}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white shadow-lg shadow-violet-200 transition-all active:scale-95"
              onClick={handleReset}
            >
              Next Customer
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 text-lg font-bold rounded-xl border-zinc-200"
              onClick={() =>
                router.push(`/dashboard/bookings/${booking.id}/receipt`)
              }
            >
              Print Receipt
            </Button>
          </div>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Transaction</DialogTitle>
          </DialogHeader>
          {selectedDuration && customer && (
            <div className="space-y-6 mt-4">
              <div className="rounded-2xl bg-zinc-50 p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm font-medium">Child Name</span>
                  <span className="font-bold text-zinc-900">{customer.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm font-medium">Play Time</span>
                  <span className="font-bold text-zinc-900">
                    {DURATION_LABELS[selectedDuration]}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-200 pt-3">
                  <span className="text-zinc-900 font-bold">Total Amount</span>
                  <span className="font-black text-2xl text-violet-600">
                    ₹{PRICING[selectedDuration]}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 h-12 rounded-xl text-zinc-500 font-bold"
                  onClick={() => setConfirmOpen(false)}
                >
                  Edit
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all active:scale-95"
                  onClick={handleConfirmBooking}
                  disabled={pending}
                >
                  {pending ? "Processing..." : "Confirm & Pay"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
