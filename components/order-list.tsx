"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import type { CreatorOrderGroup, OrderWithDetails } from "@/lib/types";

export interface OrderListProps {
  groupedOrders: CreatorOrderGroup[];
  onCreateInvoice?: (creatorGroup: CreatorOrderGroup) => void;
}

export function OrderList({ groupedOrders, onCreateInvoice }: OrderListProps) {
  const calculateTotal = (order: OrderWithDetails) => {
    return parseFloat(order.service.price) * order.quantity;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Creator Name</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total Bill</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Party Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedOrders.map((creatorGroup) => (
            <React.Fragment key={creatorGroup.creatorId}>
              {/* Creator Header Row */}
              <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                <TableCell colSpan={5} className="font-semibold text-lg">
                  {creatorGroup.creatorName}
                </TableCell>
                <TableCell className="font-bold text-blue-600">
                  {formatCurrency(creatorGroup.totalAmount)}
                </TableCell>
                <TableCell
                  colSpan={2}
                  className="text-sm text-gray-500 flex items-center justify-between"
                >
                  <span>
                    {creatorGroup.orderCount} order
                    {creatorGroup.orderCount !== 1 ? "s" : ""}
                  </span>
                  {onCreateInvoice && (
                    <Button
                      onClick={() => onCreateInvoice(creatorGroup)}
                      variant="outline"
                      size="sm"
                      className="ml-4"
                    >
                      Generate Invoice
                    </Button>
                  )}
                </TableCell>
              </TableRow>

              {/* Individual Order Rows */}
              {creatorGroup.orders.map((order) => (
                <TableRow key={order.id} className="bg-white">
                  <TableCell className="pl-8 text-gray-600">
                    {/* Empty cell to align with creator name */}
                  </TableCell>
                  <TableCell>
                    {order.service?.name || "Unknown Service"}
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(calculateTotal(order))}
                  </TableCell>
                  <TableCell>
                    {order.customer?.name || "Unknown Customer"}
                  </TableCell>
                  <TableCell>
                    {order.party?.name || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {/* Empty cell - invoice button is at creator level */}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
