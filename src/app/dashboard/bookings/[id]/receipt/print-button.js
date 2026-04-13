"use client";

import { Button } from "@/components/ui/button";

export default function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="h-12 px-6 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white"
    >
      Print Receipt
    </Button>
  );
}
