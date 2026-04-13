"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  lookupCustomer,
  createCustomer,
  createBooking,
} from "@/actions/bookings";
import { PRICING, DURATION_LABELS } from "@/lib/constants";
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

const STEPS = { PHONE: 0, CUSTOMER: 1, DURATION: 2, SUCCESS: 3 };

export default function BookingWizard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(STEPS.PHONE);
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState(null);
  const [newName, setNewName] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [booking, setBooking] = useState(null);

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

      {/* Step 1: Phone Input */}
      {step === STEPS.PHONE && (
        <Card className="p-6 border shadow-none space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-semibold">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="Enter 10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePhoneLookup()}
              className="text-lg h-14"
              autoFocus
            />
          </div>
          <Button
            onClick={handlePhoneLookup}
            disabled={pending}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white rounded-xl"
          >
            {pending ? "Searching..." : "Search Customer"}
          </Button>
        </Card>
      )}

      {/* Step 2: New Customer Registration */}
      {step === STEPS.CUSTOMER && isNewCustomer && (
        <Card className="p-6 border shadow-none space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800">
              No customer found for {phone}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Register them below to continue
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              Child's Name
            </Label>
            <Input
              id="name"
              placeholder="Enter name"
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
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white rounded-xl"
          >
            {pending ? "Registering..." : "Register & Continue"}
          </Button>
        </Card>
      )}

      {/* Step 3: Duration Selection */}
      {step === STEPS.DURATION && customer && (
        <>
          {/* Customer Card */}
          <Card className="p-4 border shadow-none bg-violet-50 border-violet-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-violet-900 text-lg">
                  {customer.name}
                </p>
                <p className="text-sm text-violet-600">{customer.phone}</p>
              </div>
              <div className="text-right">
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-sm">
                  {customer.totalVisits}{" "}
                  {customer.totalVisits === 1 ? "visit" : "visits"}
                </Badge>
                {customer.subscriptions?.length > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    Active subscription
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
                className="w-full min-h-[70px] rounded-2xl border-2 border-zinc-200 bg-white px-6 py-4 text-left transition-all hover:border-violet-400 hover:bg-violet-50 active:scale-[0.98] disabled:opacity-50 flex items-center justify-between"
              >
                <div>
                  <p className="text-lg font-bold text-zinc-900">
                    {DURATION_LABELS[key]}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {key === "MONTHLY"
                      ? "Unlimited play for 30 days"
                      : `Single play session`}
                  </p>
                </div>
                <span className="text-2xl font-bold text-violet-600">
                  ₹{price}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 4: Success */}
      {step === STEPS.SUCCESS && booking && (
        <Card className="p-6 border shadow-none text-center space-y-4">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-green-100 mx-auto">
            <svg
              className="size-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
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
            <h2 className="text-xl font-bold text-zinc-900">
              Booking Confirmed!
            </h2>
            <p className="text-zinc-500 mt-1">
              {booking.customer.name} — {DURATION_LABELS[booking.duration]}
            </p>
            <p className="text-2xl font-bold text-violet-600 mt-2">
              ₹{booking.amount}
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12 text-base rounded-xl"
              onClick={() =>
                router.push(`/dashboard/bookings/${booking.id}/receipt`)
              }
            >
              Print Receipt
            </Button>
            <Button
              className="flex-1 h-12 text-base rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white"
              onClick={handleReset}
            >
              New Booking
            </Button>
          </div>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          {selectedDuration && customer && (
            <div className="space-y-4 mt-2">
              <div className="rounded-xl bg-zinc-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Customer</span>
                  <span className="font-medium">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Duration</span>
                  <span className="font-medium">
                    {DURATION_LABELS[selectedDuration]}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-zinc-500 font-semibold">Amount</span>
                  <span className="font-bold text-lg text-violet-600">
                    ₹{PRICING[selectedDuration]}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white"
                  onClick={handleConfirmBooking}
                  disabled={pending}
                >
                  {pending ? "Confirming..." : "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
