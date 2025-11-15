"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getCustomerMonthlyOrders } from "@/app/action/billing";
import { getCustomers } from "@/app/action/customer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleMonthlyOrdersReport } from "@/lib/invoice-utils";

interface Customer {
  id: string;
  name: string;
  phone_number: string;
}

interface CustomerReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerReportDialog({
  isOpen,
  onClose,
}: CustomerReportDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const customersData = await getCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading customers:", error);
      alert("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen, loadCustomers]);

  const handleGenerateReport = async () => {
    if (!selectedCustomerId) {
      alert("Please select a customer");
      return;
    }

    try {
      setIsGenerating(true);
      const reportData = await getCustomerMonthlyOrders(selectedCustomerId);

      // Generate and open the report
      handleMonthlyOrdersReport(
        reportData.customerName,
        reportData.monthlyTotals,
      );
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setSelectedCustomerId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Monthly Orders Report</DialogTitle>
          <DialogDescription>
            Select a customer to generate a month-on-month orders report for the
            last 12 months.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading customers...</span>
            </div>
          ) : (
            <>
              {/* Customer Selection */}
              <div className="space-y-2">
                <label htmlFor="customer" className="text-sm font-medium">
                  Select Customer
                </label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateReport}
                  disabled={!selectedCustomerId || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Report"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
