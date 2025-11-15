"use client";

import type { Customer, CustomerListProps } from "@/lib/types";
import type { CustomerOrderGroup } from "@/app/action/order";
import { Edit, Eye, Trash } from "lucide-react";
import { DataTable, type Column, type Action } from "./data-table";
import { useMemo } from "react";
import {
  getBillingCycles,
  type BillingCycleWithCustomer,
} from "@/app/action/billing";
import { useState, useEffect } from "react";

interface CustomerListPropsExtended extends CustomerListProps {
  customerBilling: CustomerOrderGroup[];
}

interface CustomerWithBilling extends Customer {
  totalBill: number;
  paidBill: number;
  remainingBill: number;
  currentMonthBill?: BillingCycleWithCustomer;
}

export function CustomerList({
  customers,
  customerBilling,
  onSelectCustomer,
  onDeleteCustomer,
}: CustomerListPropsExtended) {
  const [billingCycles, setBillingCycles] = useState<
    BillingCycleWithCustomer[]
  >([]);

  useEffect(() => {
    loadBillingCycles();
  }, []);

  async function loadBillingCycles() {
    try {
      const data = await getBillingCycles();
      setBillingCycles(data);
    } catch (error) {
      console.error("Error loading billing cycles:", error);
    }
  }

  const billingMap = useMemo(
    () =>
      new Map(customerBilling.map((billing) => [billing.customerId, billing])),
    [customerBilling]
  );

  const currentMonthBillingMap = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return new Map(
      billingCycles
        .filter(
          (cycle) =>
            cycle.billing_month === currentMonth &&
            cycle.billing_year === currentYear
        )
        .map((cycle) => [cycle.customer_id, cycle])
    );
  }, [billingCycles]);

  const customersWithBilling: CustomerWithBilling[] = useMemo(
    () =>
      customers.map((customer) => {
        const currentMonthBill = currentMonthBillingMap.get(customer.id);
        const totalBill = currentMonthBill?.total_amount || 0;
        const paidBill = currentMonthBill?.paid_amount || 0;
        const remainingBill = currentMonthBill?.remaining_balance || 0;

        return {
          ...customer,
          totalBill,
          paidBill,
          remainingBill,
          currentMonthBill,
        };
      }),
    [customers, currentMonthBillingMap]
  );

  const columns: Column<CustomerWithBilling>[] = [
    {
      key: "name",
      header: "Client Name",
      accessor: (customer) => customer.name,
      cellClassName: "text-slate-900 font-medium",
    },
    {
      key: "totalBill",
      header: "Total Bill",
      render: (customer) => (
        <span className="text-slate-700 font-semibold">
          ₹{customer.totalBill.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "paidBill",
      header: "Paid Bill",
      render: (customer) => (
        <span className="text-emerald-600 font-semibold">
          ₹{customer.paidBill.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "remainingBill",
      header: "Remaining Bill",
      render: (customer) => (
        <span
          className={
            customer.remainingBill === 0
              ? "text-emerald-600 font-bold"
              : "text-orange-600 font-bold"
          }
        >
          ₹{customer.remainingBill.toLocaleString("en-IN")}
        </span>
      ),
    },
  ];

  const actions: Action<CustomerWithBilling>[] = [
    {
      icon: Eye,
      onClick: (customer) => {
        window.location.href = `/customers/${customer.id}`;
      },
      variant: "ghost",
      size: "icon",
      className:
        "h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200",
    },
    {
      icon: Edit,
      onClick: (customer) => {
        window.location.href = `/customers/edit/${customer.id}`;
      },
      variant: "ghost",
      size: "icon",
      className:
        "h-9 w-9 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200",
    },
    {
      icon: Trash,
      onClick: (customer) => {
        if (onDeleteCustomer) {
          onDeleteCustomer(customer);
        }
      },
      variant: "ghost",
      size: "icon",
      className:
        "h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200",
    },
  ];

  return (
    <DataTable
      data={customersWithBilling}
      columns={columns}
      actions={actions}
      showSerialNumber={true}
      serialNumberHeader="SR. NO."
      emptyMessage="No customers found"
    />
  );
}
