"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BillingCycleWithCustomer } from "@/app/action/billing";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    paymentMethod: string;
    notes?: string;
  }) => Promise<void>;
  billingCycle: BillingCycleWithCustomer;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "check", label: "Check" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "upi", label: "UPI" },
  { value: "other", label: "Other" },
];

export function PaymentDialog({
  isOpen,
  onClose,
  onSubmit,
  billingCycle,
}: PaymentDialogProps) {
  const [amount, setAmount] = useState(
    billingCycle.remaining_balance.toString()
  );
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentAmount = parseFloat(amount);
    if (Number.isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (paymentAmount > billingCycle.remaining_balance) {
      alert("Payment amount cannot exceed the remaining balance");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        amount: paymentAmount,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
      // Reset form
      setAmount(billingCycle.remaining_balance.toString());
      setPaymentMethod("");
      setNotes("");
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Failed to record payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for{" "}
            {billingCycle.customer?.name || "Unknown Customer"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Billing Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Bill:</span>
              <span className="font-semibold">
                {formatCurrency(billingCycle.total_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Previously Paid:</span>
              <span className="text-green-600">
                {formatCurrency(billingCycle.paid_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t pt-2">
              <span>Remaining Balance:</span>
              <span className="text-red-600">
                {formatCurrency(billingCycle.remaining_balance)}
              </span>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={billingCycle.remaining_balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter payment amount"
              required
            />
            <p className="text-sm text-gray-500">
              Maximum allowed: {formatCurrency(billingCycle.remaining_balance)}
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this payment..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
