"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Party, Customer } from "@/lib/types";
import { Label } from "@/components/ui/label";
interface PartyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  party?: Party | null;
  customer: Customer;
  onSubmit: (data: { name: string; customer_id: string }) => Promise<void>;
  isLoading: boolean;
}

export default function PartyModal({
  isOpen,
  onOpenChange,
  party,
  customer,
  onSubmit,
  isLoading,
}: PartyModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (party) {
      setName(party.name);
    } else {
      setName("");
    }
  }, [party]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, customer_id: customer.id });
    if (!party) {
      setName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{party ? "Edit Party" : "Create New Party"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Party Name</Label>
            <Input
              type="text"
              placeholder="Party Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Customer</Label>
            <Input
              type="text"
              value={customer.name}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : party ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
