"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
} from "lucide-react";
import type { OrderWithDetails } from "@/app/action/order";
import { DataTable, type Column, type Action } from "@/components/data-table";

interface Customer {
  id: string;
  name: string;
  phone_number: string;
  address: string | null;
  payment_due_date: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomerProfileClientProps {
  customer: Customer;
  orders: OrderWithDetails[];
}

export function CustomerProfileClient({
  customer,
  orders,
}: CustomerProfileClientProps) {
  const router = useRouter();

  // Calculate total amount from orders
  const totalAmount = orders.reduce((sum, order) => {
    return sum + Number.parseFloat(order.service.price) * order.quantity;
  }, 0);

  // Get unique services
  const services = Array.from(
    new Set(orders.map((order) => order.service.name))
  ).join(", ");

  // Format payment due date
  const paymentDueDate = customer.payment_due_date
    ? `Day ${customer.payment_due_date} of each month`
    : "Not set";

  // Define columns for the orders table
  const orderColumns: Column<OrderWithDetails>[] = [
    {
      key: "service",
      header: "Service",
      width: "w-[220px]",
      render: (order) => (
        <Badge variant="secondary">{order.service.name}</Badge>
      ),
    },
    {
      key: "created_by",
      header: "Created By",
      width: "w-[150px]",
      accessor: (order) => order.createdByUser.name,
    },
    {
      key: "quantity",
      header: "Quantity",
      width: "w-[100px]",
      accessor: (order) => order.quantity,
    },
    {
      key: "price",
      header: "Price",
      width: "w-[120px]",
      accessor: (order) => `₹${order.service.price}`,
    },
    {
      key: "total",
      header: "Total",
      width: "w-[120px]",
      cellClassName: "font-semibold text-emerald-600",
      render: (order) => {
        const orderTotal =
          Number.parseFloat(order.service.price) * order.quantity;
        return `₹${orderTotal.toFixed(2)}`;
      },
    },
    {
      key: "worker",
      header: "Worker",
      width: "w-[150px]",
      accessor: (order) => order.createdByUser.name,
    },
    {
      key: "date",
      header: "Date",
      width: "w-[150px]",
      render: (order) =>
        new Date(order.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
  ];

  // Define actions for the orders table
  const orderActions: Action<OrderWithDetails>[] = [
    {
      icon: Edit,
      onClick: (order) => {
        console.log("Edit order:", order.id);
      },
      variant: "ghost",
      size: "icon",
      className:
        "h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
    },
    {
      icon: Trash2,
      onClick: (order) => {
        console.log("Delete order:", order.id);
      },
      variant: "ghost",
      size: "icon",
      className: "h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-slate-900">
              Customer Profile
            </h1>
            <p className="text-slate-600">
              Comprehensive view of client details and service history
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/customers/edit/${customer.id}`)}
              variant="default"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Customer
            </Button>
            <Button
              onClick={() => router.push("/customers")}
              variant="outline"
              className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <Card className="p-6 bg-white border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-600 text-sm font-medium">Total Orders</p>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{orders.length}</p>
            <p className="text-xs text-slate-500">Service engagements</p>
          </div>
        </Card>

        {/* Total Amount Card */}
        <Card className="p-6 bg-white border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-600 text-sm font-medium">Total Amount</p>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ₹{totalAmount.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500">Lifetime value</p>
          </div>
        </Card>

        {/* Payment Due Card */}
        <Card className="p-6 bg-white border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-600 text-sm font-medium">Payment Due</p>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900">
              Day {customer.payment_due_date || "—"}
            </p>
            <p className="text-xs text-slate-500">Each month</p>
          </div>
        </Card>

        {/* Member Since Card */}
        <Card className="p-6 bg-white border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-600 text-sm font-medium">Member Since</p>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-500">Customer since</p>
          </div>
        </Card>
      </div>

      {/* Customer Details Card */}
      <Card className="p-8 bg-white border-slate-200">
        <div className="flex flex-col gap-8">
          <h2 className="text-xl font-bold text-slate-900">
            Client Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
                Name
              </p>
              <p className="text-slate-900 text-lg font-medium">
                {customer.name}
              </p>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
                  Contact
                </p>
              </div>
              <p className="text-slate-900 text-lg font-medium">
                {customer.phone_number}
              </p>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
                  Address
                </p>
              </div>
              <p className="text-slate-900 text-lg font-medium">
                {customer.address || "Not provided"}
              </p>
            </div>
          </div>

          {/* Services Section */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-3">
              Services Used
            </p>
            <div className="flex flex-wrap gap-2">
              {services ? (
                services.split(", ").map((service, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-slate-100 text-slate-700"
                  >
                    {service}
                  </Badge>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No services yet</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Service History */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Service History</h2>

        <DataTable
          data={orders}
          columns={orderColumns}
          actions={orderActions}
          showSerialNumber={true}
          wrapInCard={true}
          emptyMessage="No service history available for this customer."
        />
      </div>
    </div>
  );
}
