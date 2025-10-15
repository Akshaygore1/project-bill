"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { OrderWithDetails } from "@/lib/types";

export interface OrderListProps {
  orders: OrderWithDetails[];
  onCreateInvoice?: (order: OrderWithDetails) => void;
}

export function OrderList({ orders, onCreateInvoice }: OrderListProps) {
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
            <TableHead>Customer Name</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total Bill</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.customer?.name || "Unknown Customer"}
              </TableCell>
              <TableCell>{order.service?.name || "Unknown Service"}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell className="font-semibold text-green-600">
                {formatCurrency(calculateTotal(order))}
              </TableCell>
              <TableCell>
                {order.createdByUser?.name || "Unknown User"}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {onCreateInvoice && (
                  <Button
                    onClick={() => onCreateInvoice(order)}
                    variant="outline"
                    size="sm"
                  >
                    Create Invoice
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
