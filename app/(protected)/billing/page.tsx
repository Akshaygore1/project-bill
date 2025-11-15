"use client";

import { useState, useEffect } from "react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getCurrentMonthBills,
  getBillingSummary,
  recordPayment,
  generateMonthlyBills,
  type BillingCycleWithCustomer,
  type BillingSummary,
} from "@/app/action/billing";
import {
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { PaymentDialog } from "@/components/payment-dialog";
import { CustomerReportDialog } from "@/components/customer-report-dialog";
import { format } from "date-fns";

export default function BillingPage() {
  const isAdmin = useIsAdmin();
  const [billingCycles, setBillingCycles] = useState<
    BillingCycleWithCustomer[]
  >([]);
  const [billingSummary, setBillingSummary] = useState<BillingSummary>({
    totalOutstanding: 0,
    totalPaid: 0,
    totalBilled: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState<BillingCycleWithCustomer | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isGeneratingBills, setIsGeneratingBills] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadBillingData();
    }
  }, [isAdmin]);

  async function loadBillingData() {
    try {
      setLoading(true);
      const [cyclesData, summaryData] = await Promise.all([
        getCurrentMonthBills(),
        getBillingSummary(),
      ]);
      setBillingCycles(cyclesData);
      setBillingSummary(summaryData);
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerateBills = async () => {
    try {
      setIsGeneratingBills(true);
      const currentDate = new Date();
      const result = await generateMonthlyBills(
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );

      if (result.success) {
        await loadBillingData(); // Refresh data
      } else {
        alert("Failed to generate bills");
      }
    } catch (error) {
      console.error("Error generating bills:", error);
      alert("Failed to generate bills");
    } finally {
      setIsGeneratingBills(false);
    }
  };

  const handlePaymentClick = (billingCycle: BillingCycleWithCustomer) => {
    setSelectedBillingCycle(billingCycle);
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async (data: {
    amount: number;
    paymentMethod: string;
    notes?: string;
  }) => {
    if (!selectedBillingCycle) return;

    try {
      await recordPayment(
        selectedBillingCycle.id,
        data.amount,
        data.paymentMethod,
        data.notes || null
      );
      setShowPaymentDialog(false);
      setSelectedBillingCycle(null);
      await loadBillingData(); // Refresh data
    } catch (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need admin privileges to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusBadge = (cycle: BillingCycleWithCustomer) => {
    if (cycle.is_closed) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Paid
        </Badge>
      );
    } else if (cycle.remaining_balance > 0) {
      return <Badge variant="destructive">Outstanding</Badge>;
    } else {
      return <Badge variant="secondary">No Balance</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Billing Management
        </h1>
        <p className="text-muted-foreground">
          Track customer bills and manage payments for the current month.
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            onClick={handleGenerateBills}
            disabled={isGeneratingBills}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            {isGeneratingBills
              ? "Generating Bills..."
              : "Generate Monthly Bills"}
          </Button>
          <Button
            onClick={() => setShowReportDialog(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(billingSummary.totalBilled)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month billing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(billingSummary.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">Payments received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(billingSummary.totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">Amount pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Bills</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {billingSummary.overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">Bills past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Month Bills</CardTitle>
          <CardDescription>
            Customer billing cycles for {format(new Date(), "MMMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Monthly Orders</TableHead>
                <TableHead>Previous Carryover</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Remaining Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingCycles.map((cycle) => (
                <TableRow key={cycle.id}>
                  <TableCell className="font-medium">
                    {cycle.customer?.name || "Unknown Customer"}
                  </TableCell>
                  <TableCell>{cycle.customer?.phone_number || "N/A"}</TableCell>
                  <TableCell>
                    {formatCurrency(
                      cycle.total_amount - cycle.previous_carryover
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(cycle.previous_carryover)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(cycle.total_amount)}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {formatCurrency(cycle.paid_amount)}
                  </TableCell>
                  <TableCell
                    className={
                      cycle.remaining_balance > 0
                        ? "text-red-600 font-semibold"
                        : "text-gray-500"
                    }
                  >
                    {formatCurrency(cycle.remaining_balance)}
                  </TableCell>
                  <TableCell>{getStatusBadge(cycle)}</TableCell>
                  <TableCell>
                    {cycle.remaining_balance > 0 && (
                      <Button
                        size="sm"
                        onClick={() => handlePaymentClick(cycle)}
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Record Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {billingCycles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No billing cycles found for the current month
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      {selectedBillingCycle && (
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => {
            setShowPaymentDialog(false);
            setSelectedBillingCycle(null);
          }}
          onSubmit={handlePaymentSubmit}
          billingCycle={selectedBillingCycle}
        />
      )}

      {/* Customer Report Dialog */}
      <CustomerReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
      />
    </div>
  );
}
