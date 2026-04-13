"use client";

import { useState, useTransition } from "react";
import { validateSubscription } from "@/actions/subscriptions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ValidateSubscription() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [pending, startTransition] = useTransition();

  function handleValidate() {
    if (!code.trim()) return;
    startTransition(async () => {
      const res = await validateSubscription(code);
      setResult(res);
    });
  }

  return (
    <Card className="p-6 border shadow-none space-y-4">
      <h2 className="font-semibold text-zinc-900 text-lg">
        Validate Subscription
      </h2>
      <div className="flex gap-3">
        <Input
          placeholder="Enter code (e.g. PP-A3X7)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleValidate()}
          className="text-lg h-14 font-mono flex-1"
        />
        <Button
          onClick={handleValidate}
          disabled={pending}
          className="h-14 px-8 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white"
        >
          {pending ? "Checking..." : "Validate"}
        </Button>
      </div>

      {result && (
        <div
          className={`rounded-xl p-4 ${
            result.valid
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {result.valid ? (
            <div>
              <p className="font-semibold text-green-800">Valid Subscription</p>
              <p className="text-sm text-green-700 mt-1">
                {result.subscription.customer.name} —{" "}
                {result.subscription.customer.phone}
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Expires:{" "}
                {new Date(result.subscription.endDate).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </p>
            </div>
          ) : (
            <p className="font-semibold text-red-800">{result.error}</p>
          )}
        </div>
      )}
    </Card>
  );
}
