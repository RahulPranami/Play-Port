"use client";

import { useState, useTransition } from "react";
import { updateSubscription } from "@/actions/subscriptions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EditSubscriptionDialog({ subscription }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [endDate, setEndDate] = useState(
    format(new Date(subscription.endDate), "yyyy-MM-dd")
  );
  const [isActive, setIsActive] = useState(subscription.isActive);

  const handleUpdate = () => {
    startTransition(async () => {
      const res = await updateSubscription(subscription.id, {
        endDate,
        isActive,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Subscription updated!");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-zinc-400 hover:text-violet-600">
          <Edit2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight">Edit Subscription</DialogTitle>
          <p className="text-sm text-zinc-500 font-medium">
            {subscription.customer.name} — {subscription.uniqueCode}
          </p>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="expiry" className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Expiry Date
            </Label>
            <Input
              id="expiry"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-zinc-900">Active Status</Label>
              <p className="text-xs text-zinc-500">Enable or disable this membership</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold"
            onClick={handleUpdate}
            disabled={pending}
          >
            {pending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
