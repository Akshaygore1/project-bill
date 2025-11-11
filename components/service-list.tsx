"use client";

import { Service, ServiceListProps } from "@/lib/types";
import { DataTable, type Column, type Action } from "./data-table";
import { Trash } from "lucide-react";

export function ServiceList({ services }: ServiceListProps) {
  const columns: Column<Service>[] = [
    {
      key: "name",
      header: "Name",
      accessor: (service) => service.name,
      cellClassName: "font-medium",
    },
    {
      key: "price",
      header: "Price",
      render: (service) => `₹${service.price.toFixed(2)}`,
      cellClassName: "font-medium",
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (service) => new Date(service.createdAt).toLocaleDateString(),
      cellClassName: "text-sm text-gray-600",
    },
  ];


  return (
    <DataTable
      data={services}
      columns={columns}
      showSerialNumber={true}
      serialNumberHeader="Sr. No."
      emptyMessage="No services found"
    />
  );
}
